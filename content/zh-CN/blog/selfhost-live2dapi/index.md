---
title: 自托管看板娘API
date: 2022-07-10T16:05:00.000Z
lastmod: 2022-07-10T16:05:00.000Z
description: 创建属于自己的看板娘API~
tags: [ "Live2d" ]
categories : [ "NGINX" ]
lazyBanner : "/imglazy/silverwolf-lazy.jpg"
banner : "/img/blog/99127546.jpg"
lazyCardImg : "/imglazy/silverwolf-lazy.jpg"
cardImg : "/img/blog/99127546.jpg"
---

## 🌿

文章封面来自[がわこ-雷鳴](https://www.pixiv.net/artworks/99127546)

在碎碎念之前，作为惯例当然需要先感谢看板娘的原作者[FGHRSH](https://www.fghrsh.net/)开源[看板娘API](https://github.com/fghrsh/live2d_api)，让我们的博客变得更加可爱~

---

你是否和我一样为左下角看板娘加载迟缓，或者更衣缓慢而发愁😭？

由于看板娘没有懒加载，而且使用原作者公共的API拉取材质和JS有时会卡很久，这样你博客左下方的小可爱偶尔会变成小透明😥...

作为高度的强迫症患者，我当然不能容忍这种事情发生🤣~

所以就有了本文，有能力专门为自己搭建一个看板娘后台的话就不会再卡顿咯

### 准备

首先下载看板娘API资源，在作者的开源项目里下载任意一个压缩包即可~

![image-20220710143047321](https://image.lkarrie.com/images/2022/07/10/image-20220710143047321.png)

然后为托管服务器安装DOCKER，准备NGINX和PHP镜像

```console
docker pull nginx
docker pull php:7.4.28-fpm
```

（🧐我个人比较喜欢用进行容器部署相关的东西非常便捷且方便管理

还需在准备共看板娘API使用的域名和对应域名的证书

### 安装DOCKER

关于DOCKER的安装，这里我就不在赘述了，我的其他文章都有提到，如果你不太了解，可以去参考下面的两篇文章中DOCKER安装的小章节

[Docker从入门到入土](https://blog.lkarrie.com/archives/docker#toc-head-5)

[深入理解Docker桥接网络原理](https://blog.lkarrie.com/archives/dockerbridgenet#toc-head-1)

### 部署NGINX

部署NGINX其实也很简单，首先随便运行一个Nginx，复制相关配置和关键文件到宿主机目录，再将旧的Nginx删除，再重新启动一个Nginx并将刚刚复制出来的相关配置文件挂载到Nginx容器对应目录即可

下面是一些我整理出来的命令

```markdown
# 运行nginx 复制相关配置
docker run -d --name ng nginx
# 创建宿主机Nginx目录
mkdir -p /lk/nginx
# 创建宿主机Nginx证书目录
mkdir -p /lk/nginx/cert
# 从容器复制相关配置
docker cp ng:/etc/nginx/conf.d/ /lk/nginx/conf/
docker cp ng:/etc/nginx/nginx.conf /lk/nginx/
docker cp ng:/var/log/nginx/ /lk/nginx/logs/
docker cp ng:/usr/share/nginx/html/ /lk/nginx/www/

# 停止并删除旧容器
docker stop ng
docker rm ng

# 创建挂载宿主机配置的Nginx
docker run --name ng -p 80:80 -p 443:443 -v /lk/nginx/cert:/etc/nginx/cert/ -v /lk/nginx/nginx.conf:/etc/nginx/nginx.conf -v /lk/nginx/www/:/usr/share/nginx/html/ -v /lk/nginx/logs/:/var/log/nginx/ -v /lk/nginx/conf/:/etc/nginx/conf.d --privileged=true -d nginx
```

完成之后可以检查一下宿主机的Nginx文件配置，如下面所示的目录结构是没问题的~

```console
[root@Docker-LKarrie /]# tree /lk
/lk
└── nginx
    ├── cert
    ├── conf
    │   └── default.conf
    ├── logs
    │   ├── access.log -> /dev/stdout
    │   └── error.log -> /dev/stderr
    ├── nginx.conf
    └── www
        ├── 50x.html
        └── index.html

5 directories, 6 files
[root@Docker-LKarrie /]# 
```

访问下Nginx查看是否生效

![image-20220710150500425](https://image.lkarrie.com/images/2022/07/10/image-20220710150500425.png)

### 部署PHP

简单解释下为什么部署PHP容器

由于Nginx本身是不能处理PHP页面的，它只是个web服务器，所以当接收到PHP的请求后，需要通过反向代理的方式转发给PHP解释器处理，并把结果返回给客户端

Live2d的API本身就是个PHP项目，所以这里部署的PHP容器就是做PHP解释机处理Live2d的PHP页面

作者给出的环境要求如下

* PHP 版本 >= 5.2
* 依赖 PHP 扩展：json

如果你使用php:7.4.28-fpm的镜像，亲测上面的环境要求是满足的

```markdown
# 启动PHP 进程管理器 容器
docker run --name php-fpm -p10000:9000 -v /lk/nginx/www/:/usr/share/nginx/html/ -d php:7.4.28-fpm
```

**这里需要注意！WARNING！WARNING！**

PHP管理器容器内的路径需要和 Nginx 相同！例如我Nginx中存储静态资源文件的目录是/usr/share/nginx/html/，PHP容器中需要存储相同的静态资源在相同的目录/usr/share/nginx/html/下

简单来说就是后续存放看板娘API文件的宿主机目录（/lk/nginx/www/）需要在Nginx和PHP挂载相同的容器目录（/usr/share/nginx/html/）

### 上传资源文件

上传刚刚从作者GitHub上下载的压缩包，并解压出来，将文件夹命名成api，如下图所示，即www目录下的api文件夹存放看板娘资源

![image-20220710151908946](https://image.lkarrie.com/images/2022/07/10/image-20220710151908946.png)

除了上传看板娘资源，同样我们需要上传我们看板娘域名的证书，上传至刚刚创建的/lk/nginx/cert目录下，由于我是单域名证书，所以只有key和pem

![image-20220710152345764](https://image.lkarrie.com/images/2022/07/10/image-20220710152345764.png)

### 创建Nginx配置

这里创建看板娘Nginx的配置，在conf目录下创建live2d.conf，具体内容如下

```conf
server {
    listen       443;
	# 修改成你自己的api域名
    server_name  live2d.lkarrie.com;

	# 增加跨域限制 只有自己的博客可用~
    add_header 'Access-Control-Allow-Origin' 'https://blog.lkarrie.com'; 
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE';
    add_header 'Access-Control-Allow-Headers' 'Content-Type';
    
    # 证书相关配置 
    # 需要替换成你自己的证书名称哦
    ssl_certificate /etc/nginx/cert/live2d.lkarrie.com.pem;
    ssl_certificate_key /etc/nginx/cert/live2d.lkarrie.com.key;
    ssl_session_timeout 5m;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE;
    ssl_prefer_server_ciphers on; 

	# 根配置
    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm index.php;
    }

	# PHP资源配置
    location ~ \.php$ {
        # 代理到 PHP解释器 
        # 地址 111.111.111.111 需要替换成你自己的宿主机IP
        fastcgi_pass   111.111.111.111:10000;
        fastcgi_index  index.php;
        # fastcgi_param 代理参数需要注意
        # PHP容器内存放资源的位置一定要写对
        # 如果你严格按照 我刚刚的介绍 创建
        # 配置 /usr/share/nginx/html/$fastcgi_script_name; 是OK的
        fastcgi_param  SCRIPT_FILENAME  /usr/share/nginx/html/$fastcgi_script_name;
        include        fastcgi_params;
    }
}
```



### 重启验证

添加完配置之后，需要重启Nginx

```console
docker restart ng
```

最后访问一下你的API地址

https://live2d.lkarrie.com/api/add/

和下图相同的返回就说明正常了咯

![image-20220710153300940](https://image.lkarrie.com/images/2022/07/10/image-20220710153300940.png)

当然也可用尝试获取一下JSON

https://live2d.lkarrie.com/api/get/?id=1-57

![image-20220710153446432](https://image.lkarrie.com/images/2022/07/10/image-20220710153446432.png)

我是通过halo部署的Sakura主题，给博客设置API很方便

最后愉快的在主题设置中将官方API替换成自己的就可以啦

![image-20220710153626569](https://image.lkarrie.com/images/2022/07/10/image-20220710153626569.png)

### Balala

女生自用API（不是

2M的小水管支持，一个人用刚刚好~

如果你也想白嫖我的，可以通过微信/邮件/QQ联系我，1-3个人用应该也还可以

如果人太多可能就不行啦 :)

有能力还是可以弄一个自托管，1C、1G、1M的服务器完全够用^^