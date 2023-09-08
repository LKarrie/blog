---
title: SpringCloud Gateway 网关设计
date: 2022-06-26T01:51:00.000Z
lastmod: 2022-06-26T01:51:00.000Z
description: 基于SpringCloud Gateway 3.1.3的DMZ区域网关设计~
tags: [ "SpringCloud","Gateway" ]
categories : [ "Java" ]
lazyBanner : "/imglazy/blog/springcloud-gateway-lazy.jpg"
banner : "/img/blog/springcloud-gateway.jpg"
lazyCardImg : "/imglazy/blog/springcloud-gateway-lazy.jpg"
cardImg : "/img/blog/springcloud-gateway.jpg"
---

## 🍇

文章封面来自[月夜](https://www.pixiv.net/users/8968)

最近接到BOSS的一个需求，需要在DMZ网络区域整一个网关出来转发到其他网络区域的系统，当然不允许直接透明转发，需要做到接口方法级别（GET、POST、PUT、DELETE等等）的限制，并根据IP可以动态控制访问权限

为什么不用一个Nginx呢？直接跑个Nginx写写配置不就完事了？

在不考虑性能的情况下，可惜Nginx并不能做的很完美，Nginx只能根据请求的特征进行一些配置，如果需要限制某些请求和功能需要根据请求特征重新修改配置文件，数量多起来的真的很不容易管理，总之如果想要实现十分便捷的管理公网请求区分公网私网的系统功能等等直接外挂一个Nginx并不是最优解

我这里由于入网的访问系统是基于Java语言的微服务架构，理所应当那我也用Java实现好了，所有就有了这篇文章，基于SpringCloudGateway的DMZ区域网关设计

[DEMO项目地址](https://github.com/LKarrie/demo)

DEMO写的比较简单，希望能对你有一些帮助~

## 详细设计

架构：

*	JDK11

* Nacos作为配置中心管理DMZ网关路由、放行接口、黑白名单IP

  由于是独立于微服务系统之外的特殊网关，不可将其通过服务发现注册进其他系统区域内，而是需要通过这个特殊网关转发至后台系统实际的网关服务，所以不能使用动态路由的方法，需要手动配置路由来决定哪些请求可以放行，既然要手动配置，就必须要使用配置中心了，而且需要做动态刷新配置管理请求

* 使用Docker运行网关容器

  2022年了就不要再直接跑jar包了吧？

* 部署多个DMZ区域网关

  这一项其实和设计没太多有关系，遵循有主备的原则，部署多个DMZ网关再通过F5或软负载的方法设置VIP，最后系统域名DNS解析到VIP访问系统即可

  为什么必须要DMZ区域呢？

  DMZ区域的网络策略和实际系统运行的区域是不一样的，即使在原有网关的基础上能够增加方法级别的限制和黑白名单功能，出于安全考虑，互联网入网到私网系统经过DMZ区域还是十分必要的

代码：

* 基于SpringCloudGateway创建统一异常管理，需要有意义的报错返回定位问题

  这是十分有必要，不能什么拦截都是 500 Internal Server Error 对吧？

* 基于SpringCloudGateway创建自定义拦截器，获取Nacos配置中心配置，进行请求过滤

  使用SpringCloudGateway的基本操作，正常微服务架构的系统网关，会通过拦截器拦截请求、并做一些接口鉴权等操作

* 版本

  DEMO版本（spring-boot 2.6.8 & spring-cloud-gateway 3.1.3 ）：

  ```pom
  <parent>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-starter-parent</artifactId>
      <version>2021.0.3</version>
      <relativePath/> 
  </parent>
  
  <properties>
      <alibaba.cloud.version>2021.1</alibaba.cloud.version>
      <nacos.client.version>2.1.0</nacos.client.version>
  </properties>
  ```

## 统一异常处理

如果你熟悉微服务架构的系统，你的系统网关一定会有个统一异常处理，通过不同exception为客户端返回不同异常提示的response，通常都是json格式，也有html

秉着开工前先百度看看别人怎么做的原则，简单搜索了几下，下面一篇关于SpringCloudGatway统一异常处理的文章是浏览量比较高的

[SpringCloud Finchley Gateway 统一异常处理](https://segmentfault.com/a/1190000016854364)

这篇博文的方法除了需要在 exceptionHandlerResult 补充执行remove() 防止内存溢出其他应该都是没有坑的，具体位置如下

```java
/**
 * 参考DefaultErrorWebExceptionHandler
 */
protected Mono<ServerResponse> renderErrorResponse(ServerRequest request) {
    Map<String, Object> result = exceptionHandlerResult.get();
    // 执行remove
    exceptionHandlerResult.remove();
    return ServerResponse.status((HttpStatus) result.get("httpStatus"))
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(result.get("body"));
}
```

虽然完全可以照搬那篇博文的代码，但是那片文章实在是太老了... Finchley 版本的网关代码，2022年了就仅作参考吧

默认异常处理类关系图如下

![image-20220625232719670](https://image.lkarrie.com/images/2022/06/26/image-20220625232719670.png)

真的就必须要重写Spring网关默认的异常处理抽象类吗？就算有历史原因旧的版本是需要，最新的版本我不相信还会是这样

自己瞅了瞅代码，确实没必要，在3.1.3版本的网关版本中只需要参考DefaultErrorWebExceptionHandler类，重写一下渲染JSON response的renderErrorResponse方法即可，在AbstractErrorWebExceptionHandler中提供了getError方法，子类可以随时调用获取具体的异常，根据不同异常覆盖返回的Map格式的json报文

AbstractErrorWebExceptionHandler类中的getError方法如下

```java
protected Throwable getError(ServerRequest request) {
    return this.errorAttributes.getError(request);
}
```

 这样就比较简单了，复制一下DefaultErrorWebExceptionHandler，重写一下renderErrorResponse，去除一些官方注释，仅保留改动部分注释，代码如下

```java
package com.lkarrie.dmz.gateway.demo;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import org.springframework.boot.autoconfigure.web.reactive.error.AbstractErrorWebExceptionHandler;
import org.springframework.web.client.HttpClientErrorException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import org.springframework.boot.autoconfigure.web.ErrorProperties;
import org.springframework.boot.autoconfigure.web.WebProperties.Resources;
import org.springframework.boot.web.error.ErrorAttributeOptions;
import org.springframework.boot.web.error.ErrorAttributeOptions.Include;
import org.springframework.boot.web.reactive.error.ErrorAttributes;
import org.springframework.context.ApplicationContext;
import org.springframework.http.HttpStatus;
import org.springframework.http.InvalidMediaTypeException;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.server.RequestPredicate;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;

import static org.springframework.web.reactive.function.server.RequestPredicates.all;
import static org.springframework.web.reactive.function.server.RouterFunctions.route;

/**
 * 参考 DefaultErrorWebExceptionHandler
 * 统一异常处理思路：
 * 目前的版本的 AbstractErrorWebExceptionHandler 提供了供子类使用的获取请求异常的方法 getError
 * 可以在子类 渲染JSON response renderErrorResponse方法中 获取当请求异常类型 根据异常类型重写报错信息即可
 */
public class DemoErrorWebExceptionHandler extends AbstractErrorWebExceptionHandler {

    private static final MediaType TEXT_HTML_UTF8 = new MediaType("text", "html", StandardCharsets.UTF_8);

    private static final Map<HttpStatus.Series, String> SERIES_VIEWS;

    static {
        Map<HttpStatus.Series, String> views = new EnumMap<>(HttpStatus.Series.class);
        views.put(HttpStatus.Series.CLIENT_ERROR, "4xx");
        views.put(HttpStatus.Series.SERVER_ERROR, "5xx");
        SERIES_VIEWS = Collections.unmodifiableMap(views);
    }

    private final ErrorProperties errorProperties;

    public DemoErrorWebExceptionHandler(ErrorAttributes errorAttributes, Resources resources,
                                        ErrorProperties errorProperties, ApplicationContext applicationContext) {
        super(errorAttributes, resources, applicationContext);
        this.errorProperties = errorProperties;
    }

    @Override
    protected RouterFunction<ServerResponse> getRoutingFunction(ErrorAttributes errorAttributes) {
        // 根据 请求头Accept类型 渲染不同类型请求返回 支持html则渲染html返回 其余统一渲染JSON格式返回
        return route(acceptsTextHtml(), this::renderErrorView).andRoute(all(), this::renderErrorResponse);
    }

    protected Mono<ServerResponse> renderErrorView(ServerRequest request) {
        Map<String, Object> error = getErrorAttributes(request, getErrorAttributeOptions(request, MediaType.TEXT_HTML));
        int errorStatus = getHttpStatus(error);
        ServerResponse.BodyBuilder responseBody = ServerResponse.status(errorStatus).contentType(TEXT_HTML_UTF8);
        return Flux.just(getData(errorStatus).toArray(new String[] {}))
                .flatMap((viewName) -> renderErrorView(viewName, responseBody, error))
                .switchIfEmpty(this.errorProperties.getWhitelabel().isEnabled()
                        ? renderDefaultErrorView(responseBody, error) : Mono.error(getError(request)))
                .next();
    }

    private List<String> getData(int errorStatus) {
        List<String> data = new ArrayList<>();
        data.add("error/" + errorStatus);
        HttpStatus.Series series = HttpStatus.Series.resolve(errorStatus);
        if (series != null) {
            data.add("error/" + SERIES_VIEWS.get(series));
        }
        data.add("error/error");
        return data;
    }

    /**
     * Render the error information as a JSON payload.
     * 获取异常类型 根据类型判断 覆盖异常信息
     * @param request the current request
     * @return a {@code Publisher} of the HTTP response
     */
    protected Mono<ServerResponse> renderErrorResponse(ServerRequest request) {
        // 获取异常
        Throwable throwable = this.getError(request);
        Map<String, Object> error = getErrorAttributes(request, getErrorAttributeOptions(request, MediaType.ALL));
        // 默认返回异常信息
        String body = Constants.SYSTEM_UNAVAILABLE;
        // 异常统一处理
        if (throwable instanceof HttpClientErrorException) {
            HttpStatus httpStatus = ((HttpClientErrorException) throwable).getStatusCode();
            if(httpStatus == HttpStatus.FORBIDDEN){
                body = ((HttpClientErrorException) throwable).getStatusText();
            }
            // 处理返回码
            error.put("status",((HttpClientErrorException) throwable).getRawStatusCode());
            // 处理返回异常信息
            error.put("error",((HttpClientErrorException) throwable).getStatusCode());
            error.put("message",body);
        }
        return ServerResponse.status(getHttpStatus(error)).contentType(MediaType.APPLICATION_JSON)
                .body(BodyInserters.fromValue(error));
    }

    protected ErrorAttributeOptions getErrorAttributeOptions(ServerRequest request, MediaType mediaType) {
        ErrorAttributeOptions options = ErrorAttributeOptions.defaults();
        if (this.errorProperties.isIncludeException()) {
            options = options.including(Include.EXCEPTION);
        }
        if (isIncludeStackTrace(request, mediaType)) {
            options = options.including(Include.STACK_TRACE);
        }
        if (isIncludeMessage(request, mediaType)) {
            options = options.including(Include.MESSAGE);
        }
        if (isIncludeBindingErrors(request, mediaType)) {
            options = options.including(Include.BINDING_ERRORS);
        }
        return options;
    }

    protected boolean isIncludeStackTrace(ServerRequest request, MediaType produces) {
        switch (this.errorProperties.getIncludeStacktrace()) {
            case ALWAYS:
                return true;
            case ON_PARAM:
                return isTraceEnabled(request);
            default:
                return false;
        }
    }

    protected boolean isIncludeMessage(ServerRequest request, MediaType produces) {
        switch (this.errorProperties.getIncludeMessage()) {
            case ALWAYS:
                return true;
            case ON_PARAM:
                return isMessageEnabled(request);
            default:
                return false;
        }
    }

    protected boolean isIncludeBindingErrors(ServerRequest request, MediaType produces) {
        switch (this.errorProperties.getIncludeBindingErrors()) {
            case ALWAYS:
                return true;
            case ON_PARAM:
                return isBindingErrorsEnabled(request);
            default:
                return false;
        }
    }

    protected int getHttpStatus(Map<String, Object> errorAttributes) {
        return (int) errorAttributes.get("status");
    }

    protected RequestPredicate acceptsTextHtml() {
        return (serverRequest) -> {
            try {
                List<MediaType> acceptedMediaTypes = serverRequest.headers().accept();
                acceptedMediaTypes.removeIf(MediaType.ALL::equalsTypeAndSubtype);
                MediaType.sortBySpecificityAndQuality(acceptedMediaTypes);
                return acceptedMediaTypes.stream().anyMatch(MediaType.TEXT_HTML::isCompatibleWith);
            }
            catch (InvalidMediaTypeException ex) {
                return false;
            }
        };
    }

}
```

同样最后注册bean，可以参考ErrorWebFluxAutoConfiguration类

```java
package com.lkarrie.dmz.gateway.demo;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.autoconfigure.web.ServerProperties;
import org.springframework.boot.autoconfigure.web.WebProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.reactive.error.ErrorAttributes;
import org.springframework.boot.web.reactive.error.ErrorWebExceptionHandler;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.codec.ServerCodecConfigurer;
import org.springframework.web.reactive.result.view.ViewResolver;

import java.util.stream.Collectors;

@Configuration
@EnableConfigurationProperties(DemoCustomProperties.class)
@Slf4j
public class DemoGateWayConfig {

    private final ServerProperties serverProperties;

    public DemoGateWayConfig(ServerProperties serverProperties) {
        this.serverProperties = serverProperties;
    }

    @Primary
    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public ErrorWebExceptionHandler errorWebExceptionHandler(ErrorAttributes errorAttributes,
                                                             WebProperties webProperties, ObjectProvider<ViewResolver> viewResolvers,
                                                             ServerCodecConfigurer serverCodecConfigurer, ApplicationContext applicationContext) {
        DemoErrorWebExceptionHandler exceptionHandler = new DemoErrorWebExceptionHandler(errorAttributes,
                webProperties.getResources(), this.serverProperties.getError(), applicationContext);
        exceptionHandler.setViewResolvers(viewResolvers.orderedStream().collect(Collectors.toList()));
        exceptionHandler.setMessageWriters(serverCodecConfigurer.getWriters());
        exceptionHandler.setMessageReaders(serverCodecConfigurer.getReaders());
        return exceptionHandler;
    }

}

```
**注**：除了上述基于修改DefaultErrorWebExceptionHandler实现异常统一处理以外，如果你注意看了代码其实也是可以通过创建继承ErrorAttribute接口的实现类来完成异常的统一管理（默认是加载了DefaultErrorAttribute类，实际创建返回信息和获取异常都在这个类中实现的，可以参考这个类官方是如何实现的自行调整），最后在配置类中传入你的ErrorAttribute实现类即可，通过这种方式其实比我样例代码中的思路更加优雅，这里仅提供思路就不再举例说明了

## 路由以及动态配置

连接服务发现的网关会根据服务名生成lb类型的均衡负载路由，但DMZ区域的网关有点区别只连接配置中心不能接入转发至系统的服务发现中，所以路由还是需要手动配置的，根据微服务名划分

部分路由配置如下

一些解释：

last id的路由最后匹配，作为过滤前端请求和未根据服务名做路由配置的后端请求，简单来说就是兜底，其他路由规则没匹配到的请求由它来匹配拦截来搞定

path中不光匹配了 / 还匹配了 //，这是因为当前端（H5）经过反向代理再进入DMZ网关时获取到的路径实际上是反向代理前的地址

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: last
          uri: ${DEFAULT_GATEWAY_ROUTES_URI:http://dev.sh}
          order: 20100
          predicates:
            - Path=/**,//**
        - id: api
          uri: ${DEFAULT_GATEWAY_ROUTES_URI:http://dev.sh}
          order: 100
          predicates:
            - Path=/api/**,//api/**
        - id: base
          uri: ${DEFAULT_GATEWAY_ROUTES_URI:http://dev.sh}
          order: 101
          predicates:
            - Path=/base/**,//base/**
        - id: auth
          uri: ${DEFAULT_GATEWAY_ROUTES_URI:http://dev.sh}
          order: 102
          predicates:
            - Path=/auth/**,//auth/**
        - id: mdata
          uri: ${DEFAULT_GATEWAY_ROUTES_URI:http://dev.sh}
          order: 103
          predicates:
            - Path=/mdata/**,//mdata/**
```

* 关于白名单接口配置

  使用map套娃来搞定

  在DemoCustomProperties类中定义

  private Map<String,Map<String,List<String>>> appMap;

  private Map<String,Map<Pattern,List<String>>> appPathParamMap;

  首先通过路由id（等价服务名）来获取对应服务白名单接口map（白名单接口路径做key，方法做value）最后通过路径get到配置允许的方法类型，最后在通过list的contains方法判断当前方法类型是否配置，校验完毕后通过过滤

  对于一些接口路径中拼接了数据id或uuid的情况，使用appPathParamMap通过正则匹配来解决接口路径不唯一的问题

* 至于前端资源

  由于名称不一定存在规律可以简单通过文件后缀来判断，配置 frontSuffix

* 黑白名单的IP

  思路和接口配置类似，通过正则匹配来判断，可以配置网段正则表达式，也可以配置固定的IP地址，当然了只支持IPV4...

  通过set方式每次配置刷新，动态更新正则匹配需要调用的Pattern属性

配置类如下

```java
package com.lkarrie.dmz.gateway.demo;

import lombok.Data;
import lombok.Getter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.cloud.context.config.annotation.RefreshScope;

import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@ConfigurationProperties(prefix = "demo.gateway")
@Data
@RefreshScope
public class DemoCustomProperties {

    private Boolean apiAllowEnabled = true;
    private Boolean ipCheckEnabled = true;
    private Boolean findAllowUrlEnabled = false;

    /**
     * 配置常规接口（接口请求路径固定） 白名单
     */
    private Map<String,Map<String,List<String>>> appMap;
    /**
     * 配置非常规接口 白名单
     * 例如 将数据id作为path参数调用接口 /base/get/19位id | /base/get/uuid | /base/get/19位id/detail
     */
    private Map<String,Map<Pattern,List<String>>> appPathParamMap;

    private String frontSuffix;
    private White white;
    private Block block;

    @Getter
    public static class White {
        private final String defaultIpRegStr = "^(127\\.0\\.0\\.1)|(localhost)";
        private List<String> networkSegment;
        private Pattern whiteIpReg;
        public void setNetworkSegment(List<String> networkSegment) {
            this.networkSegment = networkSegment;
            // 重新生成白名单IP正则表达式
            StringBuilder stringBuilder = new StringBuilder(defaultIpRegStr);
            networkSegment.forEach(e->{
                    stringBuilder.append("|").append(e);
            });
            whiteIpReg = Pattern.compile(stringBuilder.toString());
        }
    }

    @Getter
    public static class Block {
        private List<String> ip;
        // 可以设置有意义的默认黑名单IP值
        private final String defaultIpRegStr = "^(0\\.0\\.0\\.0)";
        private Pattern blockIpReg;
        public void setIp(List<String> ip) {
            this.ip = ip;
            // 重新生成黑名单IP正则表达式
            StringBuilder stringBuilder = new StringBuilder(defaultIpRegStr);
            ip.forEach(e->{
                stringBuilder.append("|").append(e);
            });
            blockIpReg = Pattern.compile(stringBuilder.toString());
        }
    }

}
```

DEMO配置如下

有变更增加或者删除接口和IP，直接发布修改NACOS对应配置即可，也可以动态关闭或打开IP和接口校验

```yaml
demo:
  gateway:
    ip-check-enabled: ${IP_CHECK_ENABLED:false}
    api-allow-enabled: ${API_ALLOW_ENABLED:true}
    find-allow-url-enabled: ${FIND_ALLOW_URL_ENABLED:true}
    white:
      # 正则匹配 D类网段 192.168.0.0/24
      network-segment[0]: 192.168.0.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)$
      # 正则匹配 D类网段 192.168.0.1/24
      network-segment[1]: 192.168.1.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)$
      network-segment[2]: 192.168.5.151
      # network-segment[3]: 192.168.5.152
    block:
      ip[0]: 192.168.245.1
      # ip[1]: 192.168.245.2

    front-suffix: bmp,pcx,tif,gif,jpg,jpeg,tga,exif,fpx,svg,psd,png,raw,ico,css,js,htm,map
    app-map:
      api:
        "[/api/account]": "GET"
        "[/api/custom/enumerations/template/by/type]": "GET"
      auth:
        "[/auth/oauth/token]": "POST"
        "[/auth/sso/oa/oauth/getTokenByCode]": [ "GET","POST" ]
        # "[/auth/util/getEnvironmentInfo]": "GET"
      base:
        "[/base/api/home]": "GET"
        "[/base/api/user/list/avatar]": "POST"
        "[/base/api/user/search/all]": "GET"
        "[/base/api/param/value/get/by/code]": "POST"
        "[/base/api/custom/enumerations/template/by/type]": "GET"
      mdata:
        "[/mdata/api/get/default/unit]": "GET"
        "[/mdata/api/carousels/list/by/user/id]": "GET"
        "[/mdata/api/invoice/type/query/for/invoice]": "GET"
        "[/mdata/api/invoice/type/sob/tenant/query]": "GET"

    app-path-param-map:
      mdata:
        "[(/mdata/api/setOfBooks/[0-9]{19})]": "GET"
        "[(/mdata/api/users/oid/[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12})]": "GET"
        "[(/mdata/api/invoice/type/mould/query/[0-9]{19})]": "GET"
```

## 拦截器以及请求过滤

拦截器还是正常定义，重写order方法给与最高优先级，重写filter方法增加请求过滤的内容

关键方法如下

```java
@Override
public int getOrder() {
    return HIGHEST_PRECEDENCE + 1;
}

/**
 * DMZ 区域拦截器定义
 * @param exchange
 * @param chain
 * @return
 */
@Override
public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    Route gatewayRoute = exchange.getRequiredAttribute(ServerWebExchangeUtils.GATEWAY_ROUTE_ATTR);
    ServerHttpRequest request = exchange.getRequest();
    String ip = getIp(request);
    String url = request.getURI().getPath();
    String finalUrl ;
    if(url.startsWith("//")){
        // H5 docker 容器内nginx 反向代理路径处理
        finalUrl = url.replaceFirst("//","/");
        log.info("IP[{}]H5端以[{}]方式访问资源路径[{}]",ip,request.getMethod(),url);
    }else{
        finalUrl = url;
        log.info("IP[{}]PC端以[{}]方式访问资源路径[{}]",ip,request.getMethod(),url);
    }

    /**
     * 公网限制IP 设计思路
     * 获取IP后 进行正则匹配
     * 匹配白名单的IP 直接放行
     * 匹配黑名单的IP 禁止访问
     * 未匹配到的黑白名单的IP 走路由过滤
     */
    if(customProperties.getIpCheckEnabled()){
        Matcher whiteMatcher = customProperties.getWhite().getWhiteIpReg().matcher(ip);
        // 在白名单内 直接放行 不进行后续限制操作
        if(whiteMatcher.find()){
            if (log.isDebugEnabled()) {
                log.debug("IP[{}]属于白名单直接放行!",ip);
            }
            return chain.filter(exchange);
        }else{
            // 不在白名单内 且不在黑名单 通过IP校验 进行后续限制操作
            Matcher blockMatcher = customProperties.getBlock().getBlockIpReg().matcher(ip);
            if(blockMatcher.find()){
                if (log.isDebugEnabled()) {
                    log.debug("IP[{}]属于黑名单禁止访问!",ip);
                }
                throw new HttpClientErrorException(HttpStatus.FORBIDDEN,Constants.IP_FORBIDDEN.replace("$",ip));
            }
        }
    }

    if(log.isDebugEnabled() && customProperties.getApiAllowEnabled()){
        log.debug("IP[{}]属于公网进行接口过滤!",ip);
    }

    /**
     * 公网限制请求 设计思路
     * 首先将后端Api分组 按 微服务 分为不同route
     * 再对特定微服务的接口进行放行
     * 未匹配到的路由信息 在FinalHandler特殊处理
     */
    if(customProperties.getApiAllowEnabled()){
        Optional<AbstractRouterHandler> optional = Optional.ofNullable(RouterFactory.getInvokeStrategy(gatewayRoute.getId()));
        optional.ifPresentOrElse(u->{
            // 后端request
            u.handle(gatewayRoute.getId(), finalUrl,Objects.requireNonNull(request.getMethod()).toString());
            // 前端资源文件请求
            if (Constants.LAST.equalsIgnoreCase(gatewayRoute.getId())) u.handle(request.getPath());
        },()->{
            log.warn("未创建{}模块Handler!",gatewayRoute.getId());
            throw new HttpClientErrorException(HttpStatus.FORBIDDEN,Constants.API_FORBIDDEN);
        });

        if (log.isDebugEnabled()) {
            log.debug("IP[{}]调用接口[{}]属于放行接口!",ip,url);
        }
        // 后续网关有特殊需要可增加头信息
//            return chain.filter(chainAddHeader(exchange));
        return chain.filter(exchange);
    }

    if(log.isDebugEnabled()){
        log.debug("IP[{}]属于公网但未开启接口校验直接放行!",ip);
    }
    // 没有开启任何限制功能 或者通过IP校验未经过API校验 直接放行
    return chain.filter(exchange);
}
```

关于不同路由进行不同拦截操作的方法，简单使用了一些设计模式，一个路由id对应一个路由handler类，全部继承自AbstractRouterHandler，可以调用默认提供的过滤方法，或者自定义代码设置放行策略，每个子类handle在初始化后会加载到RouterFactory中，通过工厂类的静态方法根据路由id，获取相关实例执行不同实例对应的方法

![image-20220626003621880](https://image.lkarrie.com/images/2022/06/26/image-20220626003621880.png)

这里由于代码较多仅塞点关键部分展示

ApiHandler

```java
package com.lkarrie.dmz.gateway.demo.router.detail;

import com.lkarrie.dmz.gateway.demo.Constants;
import com.lkarrie.dmz.gateway.demo.router.AbstractRouterHandler;
import com.lkarrie.dmz.gateway.demo.router.RouterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;

/**
 * 这里对应路由规则中的 spring.cloud.gateway.routes.id=api 所捕获的请求
 */
@Component
public class ApiHandler extends AbstractRouterHandler {

    @Override
    public void handle(String app, String url, String method) {
        if(!this.isAllowUrl(app,url,method)){
            throw new HttpClientErrorException(HttpStatus.FORBIDDEN,Constants.API_FORBIDDEN);
        }
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        RouterFactory.register(Constants.API,this);
    }
}
```

AbstractRouterHandler

![image-20220626004832723](https://image.lkarrie.com/images/2022/06/26/image-20220626004832723.png)

RouterFactory

```java
package com.lkarrie.dmz.gateway.demo.router;

import com.alibaba.nacos.common.utils.StringUtils;
import com.alibaba.nacos.shaded.com.google.common.collect.Maps;

import java.util.Map;

/**
 * RouterHandler 工厂
 * handler初始化后会加载进 strategyMap 使用时根据路由id获取对应handler实例 调用不同handle方法过滤对应微服务接口
 */
public class RouterFactory {
    private static final Map<String, AbstractRouterHandler> strategyMap = Maps.newHashMap();

    public static AbstractRouterHandler getInvokeStrategy(String routeName){
        return strategyMap.get(routeName);
    }

    public static void register(String routeName, AbstractRouterHandler routerHandler){
        if(StringUtils.isBlank(routeName) || null == routerHandler){
            return;
        }
        strategyMap.put(routeName, routerHandler);
    }
}
```

## 搞定

最终实现了动态配置拦截请求，限制IP访问的功能

顺带一提，测试使用的是nacos-server v2.1.0，这个版本总算是默认不向下兼容nacos1.x的客户端了，能少点问题

启动Nacos

```cmd
docker run ^
--restart=unless-stopped ^
--name nacos2 ^
--privileged=true ^
-p 8848:8848 ^
-p 9848:9848 ^
-p 9849:9849 ^
-e PREFER_HOST_MODE=ip ^
-e MODE=standalone ^
-e NACOS_SERVER_PORT=8848 ^
-d nacos/nacos-server:v2.1.0
```

相关测试参数

```启动参数
-DNACOS_USERNAME=nacos
-DNACOS_PASSWORD=nacos
-DNACOS_NAMESPACE=dmz
-DNACOS_SERVER=http://localhost:8848
-DNACOS_DISCOVERY_ENABLED=false
-DNACOS_CONFIG_ENABLED=true
-DNACOS_CONFIG_FILE_EXTENSION=yaml
-DHAND_LOG_LEVEL=debug
-DSERVER_PORT=8000
```

相关测试NACOS yaml配置就不贴了，见项目文件application-init.yml





