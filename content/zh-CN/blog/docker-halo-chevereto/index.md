---
title: Docker部署Halo和Chevereto
date: 2022-03-21T00:26:00.000Z
lastmod: 2022-03-21T00:26:00.000Z
description: Docker部署Halo和Chevereto相关笔记
tags: [ "Docker","Chevereto","Halo" ]
categories : [ "Docker" ]
lazyBanner : "/imglazy/silverwolf-lazy.jpg"
banner : "/img/silverwolf.jpg"
lazyCardImg : "/imglazy/silverwolf-lazy.jpg"
cardImg : "/img/silverwolf.jpg"
---

## 🍀

本篇简单介绍一下，本站相关的后台服务搭建

文章封面来自[まよぎい - 一緒にごろごろしたいなぁ～...なーんてw](https://www.pixiv.net/artworks/77915926)

本片文章涉及Docker相关的基础使用，如果你对Docker不是很了解，欢迎阅读一下我的[Docker笔记](https://blog.lkarrie.com/archives/docker)

## Docker helo

本站后台使用的halo，关于halo的部署方式官网有很多介绍，关于docker的部署也介绍的十分详细，[官方docker部署文档](https://docs.halo.run/getting-started/install/docker)

下面是本站部署的一些记录

创建配置文件

```bash
#创建工作目录
mkdir ~/.halo && cd ~/.halo
#创建配置模板配置文件
wget https://dl.halo.run/config/application-template.yaml -O ./application.yaml
#编辑模板配置文件
vim application.yaml
```

关于模板配置文件的详细说明参考官网：[官方配置介绍](https://docs.halo.run/getting-started/config/)

下面是我的配置文件（脱敏后的配置，仅供参考）

设置了博客运行端口，后台用户名/密码，数据库模式等等

```yaml
server:
  port: 1111

  # Response data gzip.
  compression:
    enabled: true
spring:
  datasource:

    # H2 database configuration.
    driver-class-name: org.h2.Driver
    url: jdbc:h2:file:~/.halo/db/halo
    username: YourAdminName
    password: YourAdminPass

    # MySQL database configuration.
#    driver-class-name: com.mysql.cj.jdbc.Driver
#    url: jdbc:mysql://127.0.0.1:3306/halodb?characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true
#    username: root
#    password: 123456

  # H2 database console configuration.
  h2:
    console:
      settings:
        web-allow-others: false
      path: /h2-console
      enabled: false

halo:

  # Your admin client path is https://your-domain/{admin-path}
  admin-path: admin

  # memory or level
  cache: memory
```

创建容器

```bash
docker run -it -d --name halo -p 1111:1111 -v ~/.halo:/root/.halo --restart=unless-stopped halohub/halo:1.4.17
```

访问博客

http://127.0.0.1:1111

访问博客后台（需要访问servlet-path为admin的地址）

http://127.0.0.1:1111/admin

简单几步就可以完成halo的搭建

## Docker chevereto

关于本站图床的搭建，没开始前经过一番度娘，大部分都是用宝塔直接装的php和nginx然后挂出去的，由于自己不是特别想在主机里装这么些东西，就很自然能的想到用docker封装个宝塔在里面玩，秉着开工前先github一下的原则，果然本菜鸡能想到的东西肯定有前辈做好了，github上扒下到了别人做好的宝塔镜像，虽然里面包含的运行环境比较老，也是可以用的，跑起来也能自己进去再升级，最后就使用了docker运行宝塔，用宝塔托管容器环境，创建Chevereto站点

Cheverto我使用的正版v3，大概花了100R，还是建议大家去支持正版，最开始我自己弄了个盗版跑起来之后，发现盗版的chevereto里面居然被人塞了钓鱼链接... 要被网警抓了会被封的，后来把钓鱼链接全部替换掉了还是不放心，最终还是支持正版，哎盗版还是少用

Chevereto官网：[https://chevereto.com/](https://chevereto.com/)

Docker宝塔镜像源github：[https://github.com/pch18-docker/baota](https://github.com/pch18-docker/baota)

Chevereto还依赖MYSQL数据库，我之前在服务器上docker run过mysql就直接拿来用了，你也可以选择在宝塔中创建Mysql数据库

下面是本站部署的一些记录

### Docker启动Mysql

```bash
docker run --name mysql --restart=always -p 3306:3306 -v /app/mysql/data:/var/lib/mysql -v /app/mysql/conf:/etc/mysql -e MYSQL_ROOT_PASSWORD=YOURPASS -d mysql:5.7.24	
```

初次创建Mysql时容器默认配置，可以自行进行一些调整，下面是我的调整

```bash
[root@lkarrie mysql.conf.d]# cat /app/mysql/conf/mysql.conf.d/mysqld.cnf 
[client]
port = 3306

[mysqld]
port = 3306
pid-file	= /var/run/mysqld/mysqld.pid
socket		= /var/run/mysqld/mysqld.sock
datadir		= /var/lib/mysql
#log-error	= /var/log/mysql/error.log
# By default we only accept connections from localhost
#bind-address	= 127.0.0.1
# Disabling symbolic-links is recommended to prevent assorted security risks
symbolic-links=0

lower_case_table_names=1
max_allowed_packet = 100M
sql_mode=STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION
max_connections=1000
```

### Docker启动宝塔

```bash
# 运行宝塔镜像
# 除了开放宝塔web控制台,还需要暴露一个端口供nginx使用也就是 chevereto的访问端口
docker run -tid --name baota -p 8888:8888 -p 9999:9999 --privileged=true --shm-size=1g --restart always -v ~/wwwroot:/www/wwwroot  pch18/baota:lnp
```

访问地址：http://{{面板ip地址}}:8888

我没记错的话，初次运行原作者readme中的密码应该是不正确的，可以自己bash进容器修改宝塔管理密码

原作者提供的默认账号和密码为：

- 初始账号 `username`
- 初始密码 `password`

进入容器修改密码

```bash
# 进入容器
docker exec -it baota /bin/bash

# 容器中操作
# 修改密码初始用户密码为 testpasswd
# 修改成功后会提示面板用户账号 如果账号也有问题可以通过重置密码的操作查看面板账号
cd /www/server/panel && python tools.py panel testpasswd
# 删除登录异常过多时账户锁定
rm -f /www/server/panel/data/*.login
```

成功进入面板后可以在面板设置中修改面板用户和面板密码

### 宝塔创建Chevereto站点

以下就是使用宝塔部署chevereto了，和大部分百度的方法类似，简单也看了一下网友在构建时候遇到一些问题，大部分是 chevereto 的nginx转发配置有问题和php环境的一些图像依赖缺失导致的报错，注意一下这两点就可以了

首先对宝塔容器内PHP运行环境进行调整，原作者的内置PHP环境有点低，在宝塔页面操作卸载然后安装新的PHP即可，我安装的是PHP 7.4

![image-20220318113253118](https://image.lkarrie.com/images/2022/03/21/image-20220318113253118.png)

`安装完PHP，还需要对安装PHP图像文件的扩展，这很重要，缺失扩展环境chevereto是run不起来的`

在 软件商店 > PHP > 设置 > 安装扩展 中安装两个通用扩展fileinfo、exif

![image-20220318113649633](https://image.lkarrie.com/images/2022/03/21/image-20220318113649633.png)

到此PHP环境设置好了，可以使用nginx创建chevereto站点了

宝塔的nginx建站页面操作还是比较简单的，网站 > 添加站点 添加即可，下面是我的一些相关配置参考

这里域名我设置的是内网IP

![image-20220318114408269](https://image.lkarrie.com/images/2022/03/21/image-20220318114408269.png)

注意由于chevereto是PHP项目，需要在nginx中添加伪静态的一些配置,可以在ngixn的配置文件中添加也可以在伪静的设置中添加，具体如下

```nginx
    location / {
      try_files $uri $uri/ /index.php?$query_string;
    }
```

![image-20220318114712393](https://image.lkarrie.com/images/2022/03/21/image-20220318114712393.png)

关于网站根目录，这里就把购买的chevereto资源包，扔进去解压就行，目录内容如下

![image-20220318114244953](https://image.lkarrie.com/images/2022/03/21/image-20220318114244953.png)

然后就可以尝试访问一下chevereto了，首次打开会让你选择数据库和一些基本信息的设置这里就不再赘述了

需要注意第一次打开chevereto进行配置，最好使用你已经配置好的域名进行访问，因为站点访问域名chevereto会在首次配置之后保存在设置中而且不可更改，如果你用ip和端口访问chevereto并完成配置，就算主页你挂上域名访问之后，chevereto的一些超链还是会已ip和端口的形式进行跳转，我就是创建了两遍😞...第一次用公网ip端口设置完发现了问题，后来删除站点又重新建了一个
