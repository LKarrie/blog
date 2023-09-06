---
title: Docker从入门到入土
date: 2022-03-21T00:26:00.000Z
lastmod: 2022-03-21T00:26:00.000Z
description: Docker相关知识总结
tags: [ "Docker" ]
categories : [ "Docker" ]
lazyBanner : "/imglazy/silverwolf-lazy.jpg"
banner : "/img/blog/84036478.jpg"
lazyCardImg : "/imglazy/silverwolf-lazy.jpg"
cardImg : "/img/blog/84036478.jpg"
---

# ☕

## 0.前言

文章封面来自[涌潮悲歌-KR](https://www.pixiv.net/artworks/84036478)

最近发的文章里大部分都有容器相关的东西，就考虑把以前学习时候的文档拿出来水一水，这是我旧的博客（已经停了）里翻出来的，大概两年前的东西了，虽然有点旧但是内容是挺多的，适合学习使用

文章的内容是我在一位优秀的前辈 [编程不良人](https://space.bilibili.com/352224540?spm_id_from=333.788.b_765f7570696e666f.1) 的笔记之上，整合自己的学习和理解添加补充修改后形成

文章分为上下两部分，本篇是上半，[下半部分在这里（点我）](https://blog.lkarrie.com/archives/docker2)

（说起来真的非常感谢这位老师的JAVA和一些其他的基础视频，在我还在写该死的Oracle Package时，是这位老师的课程让我成功转型，真的非常感谢这位老师，如果觉得这篇文章不错可以多多关注[编程不良人](https://space.bilibili.com/352224540?spm_id_from=333.788.b_765f7570696e666f.1)老师的B站账号！

一些链接：

- [官方文档地址](https://www.docker.com/get-started)
- [Docker Hub](https://hub.docker.com/)
- [参考中文文档地址](https://docker_practice.gitee.io/zh-cn/)（中文文档也不太好用，网页点不动...）
- [离线Docker二进制文件包下载](https://download.docker.com/linux/static/stable/x86_64/)

## 1.什么是 Docker

### 1.1 简介

```markdown
# 官方介绍
- We have a complete container solution for you - no matter who you are and where you are on your containerization journey.
- 翻译: 我们为你提供了一个完整的容器解决方案,不管你是谁,不管你在哪,你都可以开始容器的的旅程。
- 官方定义: docker是一个容器技术。

# 底层
- Docker使用Google公司推出的 Go语言 进行开发实现，基于 Linux 内核的 cgroup、namespace 以及 OverlayFS 类的 Union FS 等技术，对进程进行封装隔离，属于操作系统层面的虚拟化技术。由于隔离的进程独立于宿主和其它的隔离的进程,因此也称其为容器。
- Docker是一个CS架构，有分客户端和服务器端，详细你可以docker info 可以看出来 client和server
```

## 2.Docker和虚拟机区别

关于Docker与虚拟机的区别下面的图已经说的很清楚了。

![image-20201220222456675.png (3616×1172)](https://image.lkarrie.com/images/2022/06/15/image-20201220222456675.png)

`比较上面两张图，我们发现虚拟机是携带操作系统，本身很小的应用程序却因为携带了操作系统而变得非常大，很笨重`。Docker是不携带操作系统的，所以Docker的应用就非常的轻巧。另外在调用宿主机的CPU、磁盘等等这些资源的时候，拿内存举例，虚拟机是利用Hypervisor去虚拟化内存，整个调用过程是虚拟内存->虚拟物理内存->真正物理内存，但是Docker是利用Docker Engine去调用宿主的的资源，这时候过程是虚拟内存->真正物理内存。

|             | 传统虚拟机                           | Docker容器                            |
| ----------- | ------------------------------------ | ------------------------------------- |
| 磁盘占用    | 几个GB到几十个GB左右                 | 几十MB到几百MB左右                    |
| CPU内存占用 | 虚拟操作系统非常占用CPU和内存        | Docker引擎占用极低                    |
| 启动速度    | （从开机到运行项目）几分钟           | （从开启容器到运行项目）几秒          |
| 安装管理    | 需要专门的运维技术                   | 安装、管理方便                        |
| 应用部署    | 每次部署都费时费力                   | 从第二次部署开始轻松简捷              |
| 耦合性      | 多个应用服务安装到一起，容易互相影响 | 每个应用服务一个容器，达成隔离        |
| 系统依赖    | 无                                   | 需求相同或相似的内核，目前推荐是Linux |

## 3.Docker的安装

### 3.1 相关网站

[官方安装文档](https://docs.docker.com/engine/install/)

### 3.2 在线安装Docker(centos7.x)

注意：Docker只兼容centos7以及之后的版本，centos6？对不起不行，不支持

- 卸载原始docker

  ```bash
  $ sudo yum remove docker \
                    docker-client \
                    docker-client-latest \
                    docker-common \
                    docker-latest \
                    docker-latest-logrotate \
                    docker-logrotate \
                    docker-engine
  ```

- 安装docker依赖

  ```bash
  $ sudo yum install -y yum-utils \
    device-mapper-persistent-data \
    lvm2
  ```

- 设置docker的yum源

  ```bash
  $ sudo yum-config-manager \
      --add-repo \
      https://download.docker.com/linux/centos/docker-ce.repo
  ```

- 安装最新版的docker

  ```bash
  $ sudo yum install docker-ce docker-ce-cli containerd.io
  ```

- 指定版本安装docker

  ```bash
  $ yum list docker-ce --showduplicates | sort -r
  $ sudo yum install docker-ce-<VERSION_STRING> docker-ce-cli-<VERSION_STRING> containerd.io
  $ sudo yum install docker-ce-18.09.5-3.el7 docker-ce-cli-18.09.5-3.el7 containerd.io
  ```

- 启动docker

  ```bash
  # 开机自启
  $ sudo systemctl enable docker
  $ sudo systemctl start docker
  ```

- 关闭docker

  ```bash
  $ sudo systemctl stop docker
  ```

- 测试docker安装

  ```bash
  $ sudo docker run hello-world
  ```

### 3.3 在线bash安装(通用所有平台)

- 在测试或开发环境中 Docker 官方为了简化安装流程，提供了一套便捷的安装脚本，CentOS 系统上可以使用这套脚本安装，另外可以通过 `--mirror` 选项使用国内源进行安装：执行这个命令后，脚本就会自动的将一切准备工作做好，并且把 Docker 的稳定(stable)版本安装在系统中。

  ```bash
  # 下载脚本文件
  $ curl -fsSL get.docker.com -o get-docker.sh
  # 安装
  $ sudo sh get-docker.sh --mirror Aliyun
  ```

- 启动docker

  ```bash
  $ sudo systemctl enable docker
  $ sudo systemctl start docker
  ```

- 创建docker用户组并将当前用户加入docker组

  ```bash
  $ sudo groupadd docker
  $ sudo usermod -aG docker $USER
  ```

  **注意**：创建docker的专用用户和用户组并不是必须的操作，只是官方的建议（我自己就从来没有建过，直接拿root耍，hahah）

  

  **为什么要建立docker的专用用户？**

  默认情况下，docker命令会使用Unix socket与docker 引擎通信，而只有 root 用户和 docker 组的用户才能访问docker引擎的 Unix socket。出于安全考虑，一般Linux系统上不会直接使用 root 用户。因此，更好的方法是将需要使用的 docker的用户 加入docker 用户组~

  

- 测试docker安装是否正确

  ```bash
  $ docker run hello-world
  ```

### 3.4 离线安装Docker

* 查看内核 内核版本需要3.10.0以上

  ```bash
  uname -a
  
  cat /proc/version
  ```

  ![image-20210611104523298](https://image.lkarrie.com/images/2022/06/15/image-20210611104523298.png)

* 关闭selinux 修改SELINUX的值为 disabled

  ```bash
  vi  /etc/selinux/config
  ```

  ![image-20210611104552530](https://image.lkarrie.com/images/2022/06/15/image-20210611104552530.png)

* 关闭防火墙

  ```bash
  systemctl status firewalld
  
  systemctl stop firewalld
  
  systemctl disable firewalld
  
  reboot
  ```

  ![image-20210611104704173](https://image.lkarrie.com/images/2022/06/15/image-20210611104704173.png)

* 创建安装的位置（目录根据实际来调整 最好放在最大的挂载下）

  ```bash
  df -h
  
  mkdir -p /app/docker
  ```

* 复制文件到服务器的/usr/bin目录，也可以使用xftp传送到/usr/bin

  注意：较高版本 docker二进制包里面的文件不一定全是docker开头 根据安装版本来定 需要全部给执行权限

  ```bash
  cd docker-18.06.1-ce/
  cp docker/* /usr/bin/
  chmod +x /usr/bin/docker* 
  ```

  ![image-20210611104945586](https://image.lkarrie.com/images/2022/06/15/image-20210611104945586.png)

* 配置docker的 daemon.json

  ```bash
  mkdir -p /etc/docker
  cd /etc/docker
  vi /etc/docker/daemon.json
  ```

  ![image-20210611105242925](https://image.lkarrie.com/images/2022/06/15/image-20210611105242925.png)

  ![image-20210611105138663](https://image.lkarrie.com/images/2022/06/15/image-20210611105138663.png)

* 配置举例

  ```json
  {
      "data-root":"docker目录位置，自行设置，磁盘要够大",
      "insecure-registries": ["不含证书的镜像仓库地址可以是多个", "如: 192.168.137.111:4000"]
  }
  ```

* 配置样例

  ```json
  {
      "data-root":"/app/docker"
  }
  ```

* 将docker设置为开机自启并查看docker

  ```bash
  cp docker.service /usr/lib/systemd/system/
  systemctl daemon-reload
  systemctl enable docker
  systemctl start docker
  
  docker -v
  docker info
  ```

  docker.service如下：

  ```docker.service
  [Unit]
  Description=Docker Application Container Engine
  Documentation=https://docs.docker.com
  After=network-online.target firewalld.service
  Wants=network-online.target
  
  [Service]
  Type=notify
  # the default is not to use systemd for cgroups because the delegate issues still
  # exists and systemd currently does not support the cgroup feature set required
  # for containers run by docker
  ExecStart=/usr/bin/dockerd
  ExecReload=/bin/kill -s HUP $MAINPID
  # Having non-zero Limit*s causes performance problems due to accounting overhead
  # in the kernel. We recommend using cgroups to do container-local accounting.
  LimitNOFILE=infinity
  LimitNPROC=infinity
  LimitCORE=infinity
  # Uncomment TasksMax if your systemd version supports it.
  # Only systemd 226 and above support this version.
  #TasksMax=infinity
  TimeoutStartSec=0
  # set delegate yes so that systemd does not reset the cgroups of docker containers
  Delegate=yes
  # kill only the docker process, not all processes in the cgroup
  KillMode=process
  # restart the docker process if it exits prematurely
  Restart=on-failure
  StartLimitBurst=3
  StartLimitInterval=60s
  
  [Install]
  WantedBy=multi-user.target
  ```

![image-20210611105343530](https://image.lkarrie.com/images/2022/06/15/image-20210611105343530.png)

  ![image-20210611105343530](https://image.lkarrie.com/images/2022/06/15/image-20210611105343530.png)

  ![image-20210611105603793](https://image.lkarrie.com/images/2022/06/15/image-20210611105603793.png)

* Docker 用户创建（用root可以不做，创建参考在线安装）

## 4.Docker 的核心架构

![image-20200404111908085](https://image.lkarrie.com/images/2022/06/15/image-20200404111908085-0291323.png)

- `镜像:` 一个镜像代表一个应用环境,他是一个只读的文件,如 mysql镜像,tomcat镜像,nginx镜像等
- `容器:` 镜像每次运行之后就是产生一个容器,就是正在运行的镜像,特点就是可读可写
- `仓库:`用来存放镜像的位置,类似于maven仓库,也是镜像下载和上传的位置
- `dockerFile:`docker生成镜像配置文件,用来书写自定义镜像的一些配置
- `tar:`一个对镜像打包的文件,日后可以还原成镜像

## 5.Docker 配置阿里镜像加速服务

### 5.1 docker 运行流程

![image-20200404120356784](https://image.lkarrie.com/images/2022/06/15/image-20200404120356784.png)

### 5.2 docker配置阿里云镜像加速(可选)

- 访问阿里云登录自己账号查看docker镜像加速服务

  ![image-20210607191846559](https://image.lkarrie.com/images/2022/06/15/image-20210607191846559.png)

```bash
# 设置 仓库地址替换成自己的~

sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://your.mirror.aliyuncs.com"]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```

- `验证docker的镜像加速是否生效`

```shell
[root@localhost ~]# docker info
		..........
    127.0.0.0/8
   Registry Mirrors:
    'https://your.mirror.aliyuncs.com/'
   Live Restore Enabled: false
   Product License: Community Engine
```

## 6.Hello-world

### 6.1 docker 的第一个容器

**docker  run hello-world**

```shell
[root@localhost ~]# docker run hello-world

Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
    (amd64)
 3. The Docker daemon created a new container from that image which runs the
    executable that produces the output you are currently reading.
 4. The Docker daemon streamed that output to the Docker client, which sent it
    to your terminal.

To try something more ambitious, you can run an Ubuntu container with:
 $ docker run -it ubuntu bash

Share images, automate workflows, and more with a free Docker ID:
 https://hub.docker.com/

For more examples and ideas, visit:
 https://docs.docker.com/get-started/
```

## 7.常用命令

### 7.1 辅助命令

~~~markdown
# 1.安装完成辅助命令
	docker version	 ---- 查看docker的信息
	docker info		 ---- 查看更详细的信息
	docker --help	 ---- 帮助命令
~~~

### 7.2 Images 镜像命令

~~~markdown
# 1.查看本机中所有镜像
	docker images	 ---- 列出本地所有镜像
		-a			 列出所有镜像（包含中间映像层）
  		-q			 只显示镜像id

# 2.搜索镜像
	docker search [options] 镜像名 ---- 去dockerhub上查询当前镜像
		-s 指定值	  列出收藏数不少于指定值的镜像
  		--no-trunc	显示完整的镜像信息

# 3.从仓库下载镜像
	docker pull 镜像名[:TAG|@DIGEST] ---- 下载镜像

# 4.删除镜像
	docker rmi 镜像名 ---- 删除镜像
		-f			 强制删除
~~~

### 7.3 Container 容器命令

~~~markdown
# 1.运行容器
	docker run 镜像名 ---- 镜像名新建并启动容器
	--name 			 别名为容器起一个名字（自定义了dns解析，同一网桥下可以使用名称访问ip）
	-d				 启动守护式容器（在后台启动容器）
	-p 				 映射端口号：原始端口号 指定端口号启动
	--ip 172.18.0.2  指定ip（网桥下）
	--network bridge 指定网络模式
	-it 			 直接以交互模式启动（进容器里了）
	例：
	docker run -it --name myTomcat -p 8888:8080 tomcat
   	docker run -d --name myTomcat -P tomcat

# 2.docker run --privileged=true 参数作用
	使用该参数，container内的root拥有真正的root权限。
	否则，container内的root只是外部的一个普通用户权限。
	privileged启动的容器，可以看到很多host上的设备，并且可以执行mount。
	甚至允许你在docker容器中启动docker容器。

# 3.docker run -d 参数作用
	启动后直接返回容器id，不以终端的形式运行容器（终端 ctrl+c 就直接退出了）

# 4.查看运行的容器
	docker ps 		 ---- 列出所有正在运行的容器
	-a				 正在运行的和历史运行过的容器
	-q				 静默模式，只显示容器编号
	docker ps -qa

# 5.停止|关闭|重启容器
	docker start   容器名字或者容器id	     ---- 开启容器
	docker restart 容器名或者容器id   	      ---- 重启容器
	docker stop  容器名或者容器id		      ---- 正常停止容器运行
	docker kill  容器名或者容器id		      ---- 立即停止容器运行

# 6.删除容器
	docker rm -f 容器id和容器名     
	docker rm -f $(docker ps -aq)          ---- 删除所有容器

# 7.查看容器内进程
	docker top 容器id或者容器名		      ---- 查看容器内的进程

# 8.查看查看容器内部细节
	docker inspect 容器id				     ---- 查看容器内部细节
	docker inspect --format="{{.Id}}" name ---- 获取运行容器id

# 9.查看容器的运行日志
	docker logs [OPTIONS] 容器id或容器名     ---- 查看容器日志
	-t			 加入时间戳
	-f			 跟随最新的日志打印
	--tail 	 数字	显示最后多少条
	docker logs -t -f --tail=100 rabbitmq

# 10.进入容器内部
	docker exec [options] 容器id 容器内命令  ---- 进入容器执行命令
	-i		以交互模式运行容器，通常与-t一起使用
 	-t		分配一个伪终端    shell窗口   bash 
	docker exec -it rabbitmq bash

# 11.容器和宿主机之间复制文件
	docker cp 文件|目录 容器id:容器路径 
	---- 将宿主机复制到容器内部
	docker cp 容器id:容器内资源路径 宿主机目录路径 
	---- 将容器内资源拷贝到主机上

# 12.数据卷(volum)实现与宿主机共享目录
	docker run -v 宿主机的路径|任意别名:/容器内的路径 镜像名
	docker run -v 宿主机的路径|任意别名:/容器内的路径:ro 镜像名
	:ro 表示容器内目录只读（容器不能操作这个目录）
	注意（这个非常重要）: 
	1.如果是宿主机路径必须是绝对路径,宿主机目录会覆盖容器内目录内容
	2.如果是别名则会在docker运行容器时自动在宿主机中创建一个目录,并将容器目录文件复制到宿主机中
	理解上面的注意点还是非常有用的。

# 13.打包镜像
	docker save 镜像名 -o 名称.tar

# 14.载入镜像
	docker load -i 名称.tar

# 15.容器打包成新的镜像（容器会暂停）
	docker commit -m "描述信息" -a "作者信息" 容器id或者名称 打包的镜像名称:标签

# 16.打包(dockerfile) 不要忘了后面的 . 这里指定的上下文目录，上下文目录为当前目录
	docker build -t vuenginxcontainer .
	docker build -t myctr:01 .

~~~

## 8.Docker的镜像原理

### 8.1 镜像是什么？

镜像是一种轻量级的，可执行的独立软件包，用来打包软件运行环境和基于运行环境开发的软件，它包含运行某个软件所需的所有内容，包括代码、运行时所需的库、环境变量和配置文件。

### 8.2 为什么一个镜像会那么大？

![image-20200404142950068](https://image.lkarrie.com/images/2022/06/15/image-20200404142950068.png)

`镜像就是花卷`

- UnionFS（联合文件系统）:

  Union文件系统是一种分层，轻量级并且高性能的文件系统，它支持对文件系统的修改作为一次提交来一层层的叠加，同时可以将不同目录挂载到同一个虚拟文件系统下。Union文件系统是Docker镜像的基础。这种文件系统特性:就是一次同时加载多个文件系统，但从外面看起来，只能看到一个文件系统，联合加载会把各层文件系统叠加起来，这样最终的文件系统会包含所有底层的文件和目录 。	

### 8.3 Docker镜像原理

`docker的镜像实际是由一层一层的文件系统组成（由一层一层的镜像构成）。`

- bootfs（boot file system）主要包含bootloader和kernel，bootloader主要是引导加载kernel，Linux刚启动时会加载bootfs文件系统。在docker镜像的最底层就是bootfs。这一层与Linux/Unix 系统是一样的，包含boot加载器（bootloader）和内核（kernel）。当boot加载完,后整个内核就都在内存中了，此时内存的使用权已由bootfs转交给内核，此时会卸载bootfs。

- rootfs（root file system），在bootfs之上，包含的就是典型的linux系统中的/dev，/proc，/bin，/etc等标准的目录和文件。rootfs就是各种不同的操作系统发行版，比如Ubuntu/CentOS等等。

- 我们平时安装进虚拟机的centos都有1到几个GB，为什么docker这里才200MB？对于一个精简的OS，rootfs可以很小，只需要包括最基本的命令，工具，和程序库就可以了，因为底层直接使用Host的Kernal，自己只需要提供rootfs就行了。由此可见不同的linux发行版，他们的bootfs是一致的，rootfs会有差别。因此不同的发行版可以共用bootfs。

![](https://image.lkarrie.com/images/2022/06/15/1567585172.png)

当你在拉取镜像的时候也可以看出，拉取的时候是一层层拉取的，最上层则是最基础最公共的基础镜像

![image-20210607203632213](https://image.lkarrie.com/images/2022/06/15/image-20210607203632213.png)

### 8.4 为什么docker镜像要采用这种分层结构呢?

`最大的一个好处就是资源共享`

- 比如：有多个镜像都是从相同的base镜像构建而来的，那么宿主机只需在磁盘中保存一份base镜像。同时内存中也只需要加载一份base镜像，就可以为所有容器服务了。而且镜像的每一层都可以被共享。Docker镜像都是只读的。当容器启动时，一个新的可写层被加载到镜像的顶部。这一层通常被称为容器层，容器层之下都叫镜像层。

## 9.高级网络配置（非常重要）

### 9.1 说明

当 Docker 启动时，会自动在主机上创建一个 `bridge` 虚拟网桥，实际上是 Linux 的一个 bridge，可以理解为一个软件交换机。它会在挂载到它的网口之间进行转发。

同时，Docker 随机分配一个本地未占用的私有网段（在 [RFC1918](https://tools.ietf.org/html/rfc1918) 中定义）中的一个地址给 `docker0` 接口。比如典型的 `172.17.42.1`，掩码为 `255.255.0.0`。此后启动的容器内的网口也会自动分配一个同一网段（`172.17.0.0/16`）的地址。

当创建一个 Docker 容器的时候，同时会创建了一对 `veth pair` 接口（当数据包发送到一个接口时，另外一个接口也可以收到相同的数据包）。这对接口一端在容器内，即 `eth0`；另一端在本地并被挂载到 `bridge` 网桥，名称以 `veth` 开头（例如 `vethAQI2QT`）。通过这种方式，主机可以跟容器通信，容器之间也可以相互通信。Docker 就创建了在主机和所有容器之间一个虚拟共享网络。

![image-20201125105847896](https://image.lkarrie.com/images/2022/06/15/image-20201125105847896.png)

### 9.2 查看网络信息

```markdown
# docker network ls
```

![image-20210607204611435](https://image.lkarrie.com/images/2022/06/15/image-20210607204611435.png)

	上面的图中可以看到docker的三种网络模式，bridge、host（容器的网络配置与host完全一样，在容器中可以看到host的所有网卡，而且hostname也和宿主机保持一致）、none（封闭网络，自闭模式hhh），默认容器都是使用bridge。实际应用中并不是所有容器都挂到默认的bridge网桥上就行了，如果有其中一个容器与外部交互非常频繁，会给默认的bridge带来较大的压力，由于别的容器也是公用这一个网桥，这样也就会影响到别的容器和外部的通信。我们要根据实际情况来决定使用一个默认的网桥是否合理。

### 9.3 创建一个网桥

```markdown
# docker network create -d bridge 网桥名称
```

### 9.4 删除一个网桥

```markdown
# docker network rm 网桥名称
```

### 9.5 容器之间使用网络通信

```markdown
# 1.查询当前网络配置
	docker network ls
```

```shell
NETWORK ID          NAME                DRIVER              SCOPE
8e424e5936b7        bridge              bridge              local
17d974db02da        docker_gwbridge     bridge              local
d6c326e433f7        host                host                local
```

```markdown
# 2.创建桥接网络
	docker network create -d bridge info
```

```shell
[root@centos ~]# docker network create -d bridge info
6e4aaebff79b1df43a064e0e8fdab08f52d64ce34db78dd5184ce7aaaf550a2f
[root@centos ~]# docker network ls
NETWORK ID          NAME                DRIVER              SCOPE
8e424e5936b7        bridge              bridge              local
17d974db02da        docker_gwbridge     bridge              local
d6c326e433f7        host                host                local
6e4aaebff79b        info                bridge              local
```

```markdown
# 3.启动容器指定使用网桥
	docker run -d -p 8890:80 --name nginx001 --network info nginx 
	docker run -d -p 8891:80 --name nginx002 --network info nginx 

# 注意:一旦指定网桥后--name指定名字就是主机名,多个容器指定在同一个网桥时,可以在任意一个容器中使用主机名与容器进行互通
```

```shell
[root@centos ~]# docker run -d -p 8890:80 --name nginx001 --network info nginx 
c315bcc94e9ddaa36eb6c6f16ca51592b1ac8bf1ecfe9d8f01d892f3f10825fe
[root@centos ~]# docker run -d -p 8891:80 --name nginx002 --network info nginx
f8682db35dd7fb4395f90edb38df7cad71bbfaba71b6a4c6e2a3a525cb73c2a5
[root@centos ~]# docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                  NAMES
f8682db35dd7        nginx               "/docker-entrypoint.…"   3 seconds ago       Up 2 seconds        0.0.0.0:8891->80/tcp   nginx002
c315bcc94e9d        nginx               "/docker-entrypoint.…"   7 minutes ago       Up 7 minutes        0.0.0.0:8890->80/tcp   nginx001
b63169d43792        mysql:5.7.19        "docker-entrypoint.s…"   7 minutes ago       Up 7 minutes        3306/tcp               mysql_mysql.1.s75qe5kkpwwttyf0wrjvd2cda
[root@centos ~]# docker exec -it f8682db35dd7 /bin/bash
root@f8682db35dd7:/# curl http://nginx001
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
.....
```

### 9.6 查看网桥信息

```markdown
# 可以直接查看当前网桥的ip（网关gatwway）和在这个ip下活跃的容器 Containers标签存在容器即活跃
	docker inspect 网桥名称
```

举例：

```shell
[root@worker2 ~]# docker network ls
NETWORK ID          NAME                     DRIVER              SCOPE
ef209b3f55ac        bridge                   bridge              local
d5d7fb7c733a        host                     host                local
9617f81ea7ed        metersphere_ms-network   bridge              local
b8fbeb5755fc        none                     null                local
[root@worker2 ~]# docker inspect metersphere_ms-network
[
    {
        "Name": "metersphere_ms-network",
        "Id": "9617f81ea7edc6e38e711dfea23ffaa0c8dc17df458c597213a52b389a3c480e",
        "Created": "2021-05-31T14:27:40.186875973+08:00",
        "Scope": "local",
        "Driver": "bridge",
        "EnableIPv6": false,
        "IPAM": {
            "Driver": "default",
            "Options": null,
            "Config": [
                {
                    "Subnet": "172.18.0.0/16",
                    "Gateway": "172.18.0.1"
                }
            ]
        },
        "Internal": false,
        "Attachable": true,
        "Ingress": false,
        "ConfigFrom": {
            "Network": ""
        },
        "ConfigOnly": false,
        "Containers": {
            "73cd659e5bd5f772b6481319aba934043121329e0edf9a2e96e9ddc7e64d69b8": {
                "Name": "ms-node-controller",
                "EndpointID": "c787b3b08d33088df519b879a0cb4f96f56e1ac2c0647c4dfd8adaa6450d9bf4",
                "MacAddress": "02:42:ac:12:00:05",
                "IPv4Address": "172.18.0.5/16",
                "IPv6Address": ""
            }
        },
        "Options": {},
        "Labels": {
            "com.docker.compose.network": "ms-network",
            "com.docker.compose.project": "metersphere"
        }
    }
]
[root@worker2 ~]# 
```

## 10.高级数据卷配置

### 10.1 说明

`数据卷` 是一个可供一个或多个容器使用的特殊目录，它绕过 UFS，可以提供很多有用的特性：

- `数据卷` 可以在容器之间共享和重用
- 对 `数据卷` 的修改会立马生效
- 对 `数据卷` 的更新，不会影响镜像
- `数据卷` 默认会一直存在，即使容器被删除

> 注意：`数据卷` 的使用，类似于 Linux 下对目录或文件进行 mount，镜像中的被指定为挂载点的目录中的文件会复制到数据卷中（仅数据卷为空时会复制）。

### 10.2 创建数据卷

创建时不需要指定目录，这个数据卷会在docker root 目录下面生成~

```shell
[root@centos ~]# docker volume create my-vol
my-vol
```

### 10.3 查看数据卷

```shell
[root@centos ~]# docker volume inspect my-vol       
[
    {
        "CreatedAt": "2020-11-25T11:43:56+08:00",
        "Driver": "local",
        "Labels": {},
        "Mountpoint": "/var/lib/docker/volumes/my-vol/_data",
        "Name": "my-vol",
        "Options": {},
        "Scope": "local"
    }
]
```

### 10.4 挂载数据卷

```shell
[root@centos ~]# docker run -d -P --name web  -v my-vol:/usr/share/nginx/html  nginx
[root@centos ~]# docker inspect web
				"Mounts": [
            {
                "Type": "volume",
                "Name": "my-vol",
                "Source": "/var/lib/docker/volumes/my-vol/_data",
                "Destination": "/usr/share/nginx/html",
                "Driver": "local",
                "Mode": "z",
                "RW": true,
                "Propagation": ""
            }
        ],
```

### 10.5 删除数据卷

```shell
docker volume rm my-vol
```

## 1.Docker安装常用服务

### 1.0 必读

> 下面的安装均是简单安装（单机/单节点）的方法，有些组件高级的集群部署或者是相关介绍和详细设置我就在其他文章里补吧，不然太多了...

### 1.1 安装mysql

```markdown
# 1.拉取mysql镜像到本地
	docker pull mysql:tag (tag不加默认最新版本)
	
# 2.简单运行mysql服务
	docker run --name mysql -e MYSQL_ROOT_PASSWORD=root -p 3306:3306 -d  mysql:tag

# 3.进入mysql容器
	docker exec -it 容器名称|容器id bash

# 4.外部查看mysql日志
	docker logs 容器名称|容器id

# 5.使用自定义配置参数
	docker run -d --name mysql \
	-v /root/mysql/conf.d:/etc/mysql/conf.d \
	-e MYSQL_ROOT_PASSWORD=root \
	mysql:tag

# 6.将容器数据位置与宿主机位置挂载保证数据安全
	docker run -p 3306:3306 -d --name mysql \
	-v /root/mysql/data:/var/lib/mysql \
	-v /root/mysql/conf.d:/etc/mysql/conf.d \
	-e MYSQL_ROOT_PASSWORD=root \
	mysql:tag

# 7.将mysql数据库备份为sql文件
	docker exec mysql|容器id sh -c 'exec mysqldump --all-databases -uroot -p"$MYSQL_ROOT_PASSWORD"' > /root/all-databases.sql  --导出全部数据
	docker exec mysql sh -c 'exec mysqldump --databases 库表 -uroot -p"$MYSQL_ROOT_PASSWORD"' > /root/all-databases.sql  --导出指定库数据
	docker exec mysql sh -c 'exec mysqldump --no-data --databases 库表 -uroot -p"$MYSQL_ROOT_PASSWORD"' > /root/all-databases.sql  --导出指定库数据不要数据

# 8.执行sql文件到mysql中
	docker exec -i mysql sh -c 'exec mysql -uroot -p"$MYSQL_ROOT_PASSWORD"' < /root/xxx.sql
```

### 1.2 安装Redis服务

```markdown
# 1.在docker hub搜索redis镜像
	docker search redis
	redis:5.0.10-alpine3.12, 这是最小的redis, 应为alpine是最小的linux操作系统 就几m

# 2.拉取redis镜像到本地
	docker pull redis

# 3.启动redis服务运行容器
	docker run --name redis -d redis:tag (没有暴露外部端口)
	docker run --name redis -p 6379:6379 -d redis:tag (暴露外部宿主机端口为6379进行连接) 

# 4.查看启动日志
	docker logs -t -f 容器id|容器名称

# 5.进入容器内部查看
	docker exec -it 容器id|名称 bash  

# 6.开启aof存储
	默认情况下快照备份也是默认开启的（dump.rdb），但是官方镜像介绍没有明确在哪，持久化可以使用aof
	docker run --name redis -d -v redisdata:/data redis:5.0.10 redis-server --appendonly yes
	开启持久化之后，持久化生成aof文件会被放入容器中的/data目录中（appendonly.aof）

# 6.加载外部自定义配置启动redis容器
	默认情况下redis官方镜像中没有redis.conf配置文件 需要去官网下载指定版本的配置文件 
	这些配置是在执行 redis-server 后再指定配置的位置后 生效
	1. wget http://download.redis.io/releases/redis-5.0.8.tar.gz  下载官方安装包
	2. 将官方安装包中配置文件进行复制到宿主机指定目录中如 /root/redis/redis.conf文件
	3. 修改需要自定义的配置
		 bind 0.0.0.0 开启远程权限 不改redis manager连不上
		 appenonly yes 开启aof持久化
	4. 加载配置启动
	docker run --name redis -v /root/redis:/usr/local/etc/redis -p 6379:6379 -d redis:5.0.10 redis-server /usr/local/etc/redis/redis.conf  

# 7.将数据目录挂在到本地保证数据安全
	docker run -p 6379:6379 -d --name redis \
	-v /root/redis/data:/data \
	-v /root/redis/redis.conf:/usr/local/etc/redis/redis.conf \
	redis:5.0.10 redis-server /usr/local/etc/redis/redis.conf
```

### 1.3 安装Nginx

```markdown
# 1.在docker hub搜索nginx
	docker search nginx

# 2.拉取nginx镜像到本地
    [root@localhost ~]# docker pull nginx
    Using default tag: latest
    latest: Pulling from library/nginx
    afb6ec6fdc1c: Pull complete 
    b90c53a0b692: Pull complete 
    11fa52a0fdc0: Pull complete 
    Digest: sha256:30dfa439718a17baafefadf16c5e7c9d0a1cde97b4fd84f63b69e13513be7097
    Status: Downloaded newer image for nginx:latest
    docker.io/library/nginx:latest

# 3.启动nginx容器
	docker run -p 80:80 --name nginx01 -d nginx

# 4.进入容器
	docker exec -it nginx01 /bin/bash
	查找目录:  whereis nginx
	配置文件:  /etc/nginx/nginx.conf

# 5.复制配置文件到宿主机
	docker cp nginx01(容器id|容器名称):/etc/nginx/nginx.conf 宿主机名录

# 6.挂在nginx配置以及html到宿主机外部
	docker run -p 80:80 -d --name nginx02 \
	-v /root/nginx/nginx.conf:/etc/nginx/nginx.conf \
	-v /root/nginx/html:/usr/share/nginx/html \
	nginx		
```

### 1.4 安装Tomcat

```markdown
# 1.在docker hub搜索tomcat
	docker search tomcat

# 2.下载tomcat镜像
	docker pull tomcat

# 3.运行tomcat镜像
	docker run -p 8080:8080 -d --name mytomcat tomcat

# 4.进入tomcat容器
	docker exec -it mytomcat /bin/bash

# 5.将webapps目录挂载在外部
	docker run -d --name mytomcat -p 8080:8080 \
	-v /root/webapps:/usr/local/tomcat/webapps \
	tomcat
# 6.数据卷启动	
	docker run -d --name tomcat -p 8080:8080 \
	-v apps:/usr/local/tomcat/webapps \
	-v confs:/usr/local/tomcat/conf \
	tomcat:8.0-jre8
```

### 1.5 安装MongoDB数据库

```markdown
# 1.运行mongDB
	docker run -d -p 27017:27017 --name mymongo mongo  ---无须权限
	docker logs -f mymongo --查看mongo运行日志

# 2.进入mongodb容器
	docker exec -it mymongo /bin/bash
		直接执行mongo命令进行操作

# 3.常见具有权限的容器
	docker run --name  mymongo  -p 27017:27017  -d mongo --auth

# 4.进入容器配置用户名密码
	mongo
	use admin 选择admin库
	db.createUser({user:"root",pwd:"root",roles:[{role:'root',db:'admin'}]})   //创建用户,此用户创建成功,则后续操作都需要用户认证
	exit

# 5.将mongoDB中数据目录映射到宿主机中
	docker run -d -p 27017:27017 -v /root/mongo/data:/data/db --name mymongo mongo 
```

### 1.6 安装ElasticSearch

- `注意:`**调高JVM线程数限制数量**
- [官方ES docker安装手册](https://www.elastic.co/guide/en/elasticsearch/reference/7.5/docker.html)
- [官方ES+Kibana版本匹配](https://www.elastic.co/cn/support/matrix#matrix_compatibility)

#### 1.6.0 拉取镜像试运行elasticsearch

```markdown
# 1.dockerhub 拉取镜像
	docker pull elasticsearch:6.4.2
	docker pull elasticsearch:6.8.0
# 2.查看docker镜像
	docker images
# 3.运行docker镜像
	docker run -p 9200:9200 -p 9300:9300 elasticsearch:6.8.0
	参数：-e “discovery.type=single-node” 以单节点启动，在es中单节点就是集群模式，如果不加这个参数以默认的集群模式启动也是可以的
	     --net somenetwork 指定docker网桥，使用中最好是指定网桥
	     -p 9200 http 9300 tcp
```

- 启动出现如下错误
- ![image-20200602184321790](https://image.lkarrie.com/images/2022/06/15/image-20200602184321790.png)

#### 1.6.1 预先配置

```markdown
# 1.在centos虚拟机中，修改配置sysctl.conf
	vim /etc/sysctl.conf
# 2.加入如下配置
	vm.max_map_count=262144 
# 3.启用配置
	sysctl -p
	注：这一步是为了防止启动容器时，报出如下错误：
	bootstrap checks failed max virtual memory areas vm.max_map_count [65530] likely too low, increase to at least [262144]
# 说明 max_map_count
	“This file contains the maximum number of memory map areas a process may have. Memory map areas are used as a side-effect of calling malloc, directly by mmap and mprotect, and also when loading shared libraries.

	While most applications need less than a thousand maps, certain programs, particularly malloc debuggers, may consume lots of them, e.g., up to one or two maps per allocation.

	The default value is 65536.”

	max_map_count文件包含限制一个进程可以拥有的VMA(虚拟内存区域)的数量。
	虚拟内存区域是一个连续的虚拟地址空间区域。在进程的生命周期中，每当程序尝试在内存中映射文件，链接到共享内存段，或者分配堆空间的时候，这些区域将被创建。
	调优这个值将限制进程可拥有VMA的数量。限制一个进程拥有VMA的总数可能导致应用程序出错，因为当进程达到了VMA上线但又只能释放少量的内存给其他的内核进程使用时，操作系统会抛出内存不足的错误。如果你的操作系统在NORMAL区域仅占用少量的内存，那么调低这个值可以帮助释放内存给内核用。

```

#### 1.6.2 启动EleasticSearch容器

```markdown
# 0.复制容器中data目录到宿主机中
	docker cp 容器id:/usr/share/share/elasticsearch/data /root/es
# 1.运行ES容器 指定jvm内存大小并指定ik分词器位置
	docker run -d --name es -p 9200:9200 -p 9300:9300 \
	-e ES_JAVA_OPTS="-Xms128m -Xmx128m" \
	-v /root/es/plugins:/usr/share/elasticsearch/plugins \
	-v /root/es/data:/usr/share/elasticsearch/data \
	elasticsearch:6.4.2
	
	docker run -d --name es -p 9200:9200 -p 9300:9300 \
	-v esplugins:/usr/share/elasticsearch/plugins \
	-v esdata:/usr/share/elasticsearch/data \
	-v esconfig:/usr/share/elasticsearch/config \
	elasticsearch:6.8.0
```

#### 1.6.3 安装IK分词器

```markdown
# 1.下载对应版本的IK分词器
	wget https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v6.4.2/elasticsearch-analysis-ik-6.4.2.zip

	wget https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v6.8.0/elasticsearch-analysis-ik-6.8.0.zip

# 2.解压到plugins文件夹中
	yum install -y unzip
	cd /var/lib/docker/volumes/esplugins/_data
	mkdir ik
	cd ik
	cp /root/elasticsearch-analysis-ik-6.8.0.zip .
	unzip -d ik elasticsearch-analysis-ik-6.8.0.zip
	rm -rf elasticsearch-analysis-ik-6.8.0.zip

# 3.添加自定义扩展词和停用词（插件挂载目录夹解压ik的zip包下面有个config文件夹
	cd plugins/elasticsearch/config
	vim IKAnalyzer.cfg.xml
	<properties>
		<comment>IK Analyzer 扩展配置</comment>
		<!--用户可以在这里配置自己的扩展字典 -->
		<entry key="ext_dict">ext_dict.dic</entry>
		<!--用户可以在这里配置自己的扩展停止词字典-->
		<entry key="ext_stopwords">ext_stopwords.dic</entry>
	</properties>

# 4.在ik分词器目录下config目录中创建ext_dict.dic文件   编码一定要为UTF-8才能生效
	vim ext_dict.dic 加入扩展词即可
# 5. 在ik分词器目录下config目录中创建ext_stopword.dic文件 
	vim ext_stopwords.dic 加入停用词即可

# 6.重启容器生效
	docker restart 容器id
# 7.将此容器提交成为一个新的镜像
	docker commit -a="xiaochen666" -m="es with IKAnalyzer" 容器id xiaochen/elasticsearch:6.4.2
```

#### 1.6.4 安装Kibana

```markdown
# 1.下载kibana镜像到本地
	docker pull kibana:6.4.2
	docker pull kibana:6.8.0

# 2.启动kibana容器
	docker run -d --name kibana -e ELASTICSEARCH_URL=http://10.15.0.3:9200 -p 5601:5601 kibana:6.4.2
	docker run -d --name kibana -e ELASTICSEARCH_URL=http://10.15.0.3:9200 -p 5601:5601 kibana:6.8.0
# 3.映射配置
	docker run -d --name kibana -p 5601:5601 -v kibanaconf:/usr/share/kibana/config kibana:6.8.0
```

### 1.7 安装Nexus3

```markdown
# Nexus搭建
# 在线就直接pull吧
docker pull sonatype/nexus3
# 离线
# 将离线镜像加载入docker
sudo docker load --input nexus.tar.gz

# 创建私库目录
mkdir -p /middleware/nexus-data 
chmod -R 777 /middleware/nexus-data

# 启动
sudo docker run --name finnexus \
-d --restart=unless-stopped \
-p 5000-5010:5000-5010 \
-p 8081:8081 \
-v /middleware/nexus-data:/nexus-data \
sonatype/nexus3
# 如果换端口
sudo docker run --restart=unless-stopped -d -p 4000-4010:5000-5010 -p 4081:8081 -v /app/nexus-data:/nexus-data --name nexus sonatype/nexus3

# -p 表示将服务器的端口与容器端口映射
# -v 表示将服务器的目录与容器的目录映射
# 其中neuxs映射的服务器路径要有权限
# 其中8081端口是对应nexus的管理界面的端口
# 5000-5010 表示5000到5010端口，后面创建私有仓库时端口必须在5000到5010之间

# 登录nexus控制台地址 ip:8081
# 如果换了端口 命令参考上面换过端口的命令
# 登录nexus控制台地址 ip:4081

# 查看默认登录密码
cd /app/nexus-data
cat admin.password
# 密码修改为你要的
# 具体设置单独开文章，这里就不多写了
```

### 1.8 安装RabbitMQ

`下面是3.7.8版本的MQ 其他版本可能不适用 没记错的话有些新版本15672取消了`

```markdown
# 0.在线直接pull
docker pull rabbitmq:3.7.8-management-alpine
# 1.上传tar包

    rabbitmq.tar.gz

# 2.load tar包
docker load --input rabbitmq.tar.gz
  出现如下说明：
  2053661fb7d0: Loading layer  12.29kB/12.29kB
  5689db811598: Loading layer  40.96kB/40.96kB
  d2459d554acf: Loading layer  34.29MB/34.29MB
  fc486e98542a: Loading layer  11.13MB/11.13MB
  4bdd294e3b25: Loading layer  5.632kB/5.632kB
  b391c5160f19: Loading layer  2.048kB/2.048kB
  53a95db89e8a: Loading layer  1.536kB/1.536kB
  4db8bc9b75ab: Loading layer  15.36kB/15.36kB
  669bd8e5d693: Loading layer  3.072kB/3.072kB
  86e21faff3ee: Loading layer  37.92MB/37.92MB
  Loaded image: rabbitmq:3.7.8-management-alpine
  
# 3.创建宿主机映射目录
mkdir -p /middleware/rabbitmq/lib
mkdir -p /middleware/rabbitmq/log

# 4.docker run
docker run --name finrabbitmq \
-d --restart=unless-stopped \
-p 5672:5672 \
-p 15672:15672 \
-v /middleware/rabbitmq/lib:/var/lib/rabbitmq \
-v /middleware/rabbitmq/log:/var/log/rabbitmq \
rabbitmq:3.7.8-management-alpine
  
  -it 标准输入给容器并产生一个交互性shell
  -d 在后台运行
  --name 容器名
  -v 目录映射
  -p 端口映射
  
# 5.检查日志是否启动成功
  docker logs -t --tail=100 rabbitmq
 
# 6.登录ip:15672，默认用户名密码 guest/guest
```

### 1.9 安装Minio

```markdown
# 在线直接pull
docker pull minio/minio:RELEASE.2020-12-29T23-29-29Z

# 我比较喜欢上面的版本 下面的命令全部是latest的tag有需要自行修改下
# 存储目录：
mkdir -p /middleware/minio/data
mkdir -p /middleware/minio/config
  
# 启动命令：

docker run -p 9000:9000 --name finminio \
-d --restart=unless-stopped \
-e "MINIO_ACCESS_KEY=fin" \
-e "MINIO_SECRET_KEY=eyQ3idRpVkNZ" \
-v /middleware/minio/data:/data \
-v /middleware/minio/config:/root/.minio \
minio/minio server /data

# 控制台访问地址：
http://101.133.150.61:9100/minio/login
fin/eyQ3idRpVkNZ
```

### 1.10 安装Nacos

Nacos1.4.0有一些坑我踩过建议不要用，老应用建议使用稳定版1.4.1，新应用Nacos服务端跟着官方迭代版本升级就行 

```shell
docker load --input nacos.tar

mkdir -p /middleware/nacos/data
mkdir -p /middleware/nacos/logs

docker run \
--restart=unless-stopped \
--name finnacos \
--privileged=true \
-p 8848:8848 \
-e PREFER_HOST_MODE=ip \
-e MODE=standalone \
-e NACOS_SERVER_PORT=8848 \
-v /middleware/nacos/data:/home/nacos/data \
-v /middleware/nacos/logs:/home/nacos/logs \
-d nacos/nacos-server:1.4.0
```

### 1.11 安装Rancher

建议使用K3S+RANCHER，直接Docker装完Rancher然后创建集群，真的问题太多了，后面容器多的docker ps之后都眼花

Docker启Rancher坑太多了，真的不要用（亲身体会后的真诚建议

## 2.Dockerfile

### 2.1 什么是Dockerfile

Dockerfile可以认为是**Docker镜像的描述文件，是由一系列命令和参数构成的脚本**。主要作用是**用来构建docker镜像的构建文件**。

![image-20200404111908085](https://image.lkarrie.com/images/2022/06/15/image-20200404111908085.png)

- **通过架构图可以看出通过DockerFile可以直接构建镜像**

### 2.2 Dockerfile解析过程

![image-20200603181253804](https://image.lkarrie.com/images/2022/06/15/image-20200603181253804.png)

### 2.3 Dockerfile的保留命令

[官方说明](https://docs.docker.com/engine/reference/builder/)

| 保留字         | 作用                                                         |
| -------------- | ------------------------------------------------------------ |
| **FROM**       | **当前镜像是基于哪个镜像的** `第一个指令必须是FROM`          |
| MAINTAINER     | 镜像维护者的姓名和邮箱地址                                   |
| **RUN**        | **构建镜像时需要运行的指令**                                 |
| **EXPOSE**     | **当前容器对外暴露出的端口号**                               |
| **WORKDIR**    | **指定在创建容器后，终端默认登录进来的工作目录，一个落脚点** |
| **ENV**        | **用来在构建镜像过程中设置环境变量**                         |
| **ADD**        | **将宿主机目录下的文件拷贝进镜像且ADD命令会自动处理URL和解压tar包** |
| **COPY**       | **类似于ADD，拷贝文件和目录到镜像中<br/>将从构建上下文目录中<原路径>的文件/目录复制到新的一层的镜像内的<目标路径>位置** |
| **VOLUME**     | **容器数据卷，用于数据保存和持久化工作**                     |
| **CMD**        | **指定一个容器启动时要运行的命令<br/>Dockerfile中可以有多个CMD指令，但只有最后一个生效，CMD会被docker run之后的参数替换** |
| **ENTRYPOINT** | **指定一个容器启动时要运行的命令<br/>ENTRYPOINT的目的和CMD一样，都是在指定容器启动程序及其参数** |

#### 2.3.1 FROM 命令

- 基于那个镜像进行构建新的镜像,在构建时会自动从docker hub拉取base镜像 必须作为Dockerfile的第一个指令出现

- 语法:

  ```dockerfile
  FROM  <image>
  FROM  <image>[:<tag>]     使用版本不写为latest
  FROM  <image>[@<digest>]  使用摘要
  ```

#### 2.3.2 MAINTAINER  命令

- 镜像维护者的姓名和邮箱地址[废弃]

- 语法:

  ```dockerfile
  MAINTAINER <name>
  ```

#### 2.3.3 RUN 命令

- RUN指令将在当前映像之上的新层中执行任何命令并提交结果。生成的提交映像将用于Dockerfile中的下一步

- 语法:

  ```dockerfile
  RUN <command> (shell form, the command is run in a shell, which by default is /bin/sh -c on Linux or cmd /S /C on Windows)
  RUN echo hello
  
  RUN ["executable", "param1", "param2"] (exec form)
  RUN ["/bin/bash", "-c", "echo hello"]
  ```

#### 2.3.4 EXPOSE 命令

- 用来指定构建的镜像在运行为容器时对外暴露的端口

- 语法:

  ```dockerfile
  EXPOSE 80/tcp  如果没有显示指定则默认暴露都是tcp
  EXPOSE 80/udp
  ```

#### 2.3.5 CMD 命令

- 用来为启动的容器指定执行的命令,在Dockerfile中只能有一条CMD指令。如果列出多个命令，则只有最后一个命令才会生效。

- 注意: **Dockerfile中只能有一条CMD指令。如果列出多个命令，则只有最后一个命令才会生效。**

- 语法:

  ```dockerfile
  CMD ["executable","param1","param2"] (exec form, this is the preferred form)
  CMD ["param1","param2"] (as default parameters to ENTRYPOINT)
  CMD command param1 param2 (shell form)
  ```

#### 2.3.6 WORKDIR 命令

- 用来为Dockerfile中的任何RUN、CMD、ENTRYPOINT、COPY和ADD指令设置工作目录。如果WORKDIR不存在，即使它没有在任何后续Dockerfile指令中使用，它也将被创建。

- 语法:

  ```dockerfile
  WORKDIR /path/to/workdir
  
  WORKDIR /a
  WORKDIR b
  WORKDIR c
  `注意:WORKDIR指令可以在Dockerfile中多次使用。如果提供了相对路径，则该路径将与先前WORKDIR指令的路径相对`
  ```

#### 2.3.7 ENV 命令

- 用来为构建镜像设置环境变量。这个值将出现在构建阶段中所有后续指令的环境中。

- 语法：

  ```dockerfile
  ENV <key> <value>
  ENV <key>=<value> ...
  ```

#### 2.3.8 ADD 命令

- 用来从context上下文复制新文件、目录或远程文件url，并将它们添加到位于指定路径的映像文件系统中。

- 语法:

  ```dockerfile
  ADD hom* /mydir/       通配符添加多个文件
  ADD hom?.txt /mydir/   通配符添加
  ADD test.txt relativeDir/  可以指定相对路径
  ADD test.txt /absoluteDir/ 也可以指定绝对路径
  ADD url 
  ```

#### 2.3.9 COPY 命令

- 用来将context目录中指定文件复制到镜像的指定目录中

- 语法:

  ```dockerfile
  COPY src dest
  COPY ["<src>",... "<dest>"]
  ```

#### 2.3.10 VOLUME 命令

- 用来定义容器运行时可以挂在到宿主机的目录

- 语法:

  ```dockerfile
  VOLUME ["/data"]
  ```

#### 2.3.11 ENTRYPOINT命令

- 用来指定容器启动时执行命令和CMD类似

- 语法:

  ```dockerfile
    ["executable", "param1", "param2"]
  ENTRYPOINT command param1 param2
  ```

  ENTRYPOINT指令，往往用于设置容器启动后的**第一个命令**，这对一个容器来说往往是固定的。
  CMD指令，往往用于设置容器启动的第一个命令的**默认参数**，这对一个容器来说可以是变化的。

### 2.4 Dockerfile举例（方便理解）

```shell
# 举例中你可能用到的命令
touch bb.txt

echo "666" >> bb.txt

docker build -t mycentos7:1 .
```

```dockerfile
FROM centos:7
# 我要基于原来的镜像往里安装里没有的指令的并创建新的进镜像 这里装了vim
#RUN yum intall -y vim
RUN ["yum","install","-y","vim"]
# EXPOSE 服务 docker run 的 -p 命令 只有expose之后才能-p生效
EXPOSE 5672
EXPOSE 15672
# WORKDIR 指定的工作目录 目录不存在会给你创建 意思是你docker run之后 进入容器的目录
# 下面的两个WORKDIR设置之后运行了容器 你进入之后pwd 显示的目录就是/data/a
WORKDIR /data
WORKDIR a
# dockerfile目录下还有个aa.txt 把这个东西拷贝到新创建的容器里
COPY aa.txt /data/a
# ADD 和 COPY差不多 只不过他能自动下载（放url）还能解压
ADD bb.txt /data/b
# 这样使用 ADD 会下载gz包 这时候不解压 直接丢进/data/b
# ADD https://download.redis.io/releases/redis-6.2.4.tar.gz /data/b

# 这样使用 ADD 会将本地gz包 解压缩到新建容器的/data/b
# ADD redis-6.2.4.tar.gz /data/b
# 如果这时候你在 run mv 就会把解压文件 丢进去redis文件夹
# RUN mv redis-6.2.4 redis
# 如果你再设置工作目录 这时候进入运行的新容器就会进入 /data/b/redis 
# WORKDIR redis

# VOLUME 服务 -v 只有写了 -v 才能允许挂载（这个概念可能不对 有时间验证验证）
VOLUME /data/b

# ENV 设置环境变量 很好理解 设置之后后面都能用
ENV BASE_DIR /data/b
ADD bb.txt $BASE_DIR
VOLUME $BASE_DIR/test

# 指定容器运行的命令 运行了 ls 会在docker的宿主机输出 ls输出的内容
# ENTRYPOINT 可以写多个 覆盖需要加上 --entrypoint = ls 
# docker run --entrypoint=ls mycentos7:18 /data/a
#ENTRYPOINT ls $BASE_DIR/test
# CMD 可以执行多个 可以被 docker run 之后的命令覆盖掉
# docker rum mycentos7:18 ls /data/b
#CMD ls /data/b/

#一般ENTRYPOINT和CMD连用 CMD后面作为参数 传给ENTRYPOINT
# 如果 docker run mycentos7:19 则只输出 data下目录
# 如果 docker run mycentos7:19 
# 这种shell 格式不生效 需要使用 json数组形式
# ENTRYPOINT ls /data
# CMD /data/b

# 以下build完成之后会输出 ls /data 也会输出 ls /data/b
ENTRYPOINT ["ls","/data"]
CMD ["/data/b"]

# 总结 ENTRYPOINT 写参数 CMD 写参数

```

### 2.5 IDEA的Dockerfile插件

我的idea版本已经内置了

![image-20210616171725758](https://image.lkarrie.com/images/2022/06/15/image-20210616171725758.png)

IDEA sftp

![image-20210616172705734](https://image.lkarrie.com/images/2022/06/15/image-20210616172705734.png)

### 2.6 Dockerfile构建springboot项目部署

#### 2.6.1 准备springboot可运行项目

![image-20200605172151266](https://image.lkarrie.com/images/2022/06/15/image-20200605172151266.png)

#### 2.6.2 将可运行项目放入linux虚拟机中

![image-20200605172340380](https://image.lkarrie.com/images/2022/06/15/image-20200605172340380.png)

#### 2.6.3 编写Dockerfile

```dockerfile
FROM openjdk:8
WORKDIR /ems
ADD ems.jar /ems
EXPOSE 8989
ENTRYPOINT ["java","-jar"]
CMD ["ems.jar"]
```

#### 2.6.4 构建镜像

```shell
[root@localhost ems]# docker build -t ems .
```

#### 2.6.5 运行镜像

```shell
[root@localhost ems]# docker run -p 8989:8989 ems
```

#### 2.6.6 访问项目

```http
http://10.15.0.8:8989/ems/login.html
```

## 3.Docker Compose

相关参考文档：

- [Compose 简介 | Docker 从入门到实践 (docker-practice.com)](https://vuepress.mirror.docker-practice.com/compose/introduction/)
- [Compose 模板文件 | Docker 从入门到实践 (docker-practice.com)](https://vuepress.mirror.docker-practice.com/compose/compose_file/)
- [Compose file | Docker Documentation（docker引擎兼容版本）](https://docs.docker.com/compose/compose-file/)

### 3.1 简介

`Compose` 项目是 Docker 官方的开源项目，负责实现对 Docker 容器集群的快速编排。从功能上看，跟 `OpenStack` 中的 `Heat` 十分类似。

其代码目前在 https://github.com/docker/compose 上开源。

`Compose` 定位是 「定义和运行多个 Docker 容器的应用（Defining and running multi-container Docker applications）」，其前身是开源项目 Fig。

通过第一部分中的介绍，我们知道使用一个 `Dockerfile` 模板文件，可以让用户很方便的定义一个单独的应用容器。然而，在日常工作中，经常会碰到需要多个容器相互配合来完成某项任务的情况。例如要实现一个 Web 项目，除了 Web 服务容器本身，往往还需要再加上后端的数据库服务容器，甚至还包括负载均衡容器等。

`Compose` 恰好满足了这样的需求。它允许用户通过一个单独的 `docker-compose.yml` 模板文件（YAML 格式）来定义一组相关联的应用容器为一个项目（project）。

`Compose` 中有两个重要的概念：

- 服务 (`service`)：一个应用的容器，实际上可以包括若干运行相同镜像的容器实例。
- 项目 (`project`)：由一组关联的应用容器组成的一个完整业务单元，在 `docker-compose.yml` 文件中定义。

`Compose` 的默认管理对象是项目，通过子命令对项目中的一组容器进行便捷地生命周期管理。

`Compose` 项目由 Python 编写，实现上调用了 Docker 服务提供的 API 来对容器进行管理。因此，只要所操作的平台支持 Docker API，就可以在其上利用 `Compose` 来进行编排管理。

### 3.2 安装与卸载

#### 3.2.1 linux

- 在 Linux 上的也安装十分简单，从 官方 GitHub Release 处直接下载编译好的二进制文件即可。例如，在 Linux 64 位系统上直接下载对应的二进制包。

```bash
$ sudo curl -L https://github.com/docker/compose/releases/download/1.25.5/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
$ sudo chmod +x /usr/local/bin/docker-compose
```

#### 3.2.2 macos、window

- Compose 可以通过 Python 的包管理工具 pip 进行安装，也可以直接下载编译好的二进制文件使用，甚至能够直接在 Docker 容器中运行。`Docker Desktop for Mac/Windows 自带 docker-compose 二进制文件，安装 Docker 之后可以直接使用`。

#### 3.2.3 bash命令补全

```shell
$ curl -L https://raw.githubusercontent.com/docker/compose/1.25.5/contrib/completion/bash/docker-compose > /etc/bash_completion.d/docker-compose
```

#### 3.2.4 离线

就是下载二进制文件，改名，丢进local/bin

[官方](https://github.com/docker/compose/releases)网站里找你需要的版本

![image-20210616181426416](https://image.lkarrie.com/images/2022/06/15/image-20210616181426416.png)

```shell
mv docker-compose-Linux-x86_64 docker-compose
mv docker-compose /usr/local/bin
chmod +x /usr/local/bin/docker-compose 
```

![image-20210616184306066](https://image.lkarrie.com/images/2022/06/15/image-20210616184306066.png)

#### 3.2.5 卸载

- 如果是二进制包方式安装的，删除二进制文件即可。

```shell
$ sudo rm /usr/local/bin/docker-compose
```

#### 3.2.6 测试安装成功

```shell
$ docker-compose --version
 docker-compose version 1.25.5, build 4667896b
```

### 3.3 docker compose使用

#### 3.3.1 相关概念

首先介绍几个术语。

- 服务 (`service`)：一个应用容器，实际上可以运行多个相同镜像的实例。
- 项目 (`project`)：由一组关联的应用容器组成的一个完整业务单元。∂一个项目可以由多个服务（容器）关联而成，`Compose` 面向项目进行管理。

#### 3.3.2 场景

最常见的项目是 web 网站，该项目应该包含 web 应用和缓存。

- springboot应用
- mysql服务
- redis服务
- elasticsearch服务
- .......

#### 3.3.3 docker-compose模板

[参考文档](https://docker_practice.gitee.io/zh-cn/compose/compose_file.html)

```yml
version: "3.0"
services:

	demo:
	  build:
	    context: demo
	    dockerfile: Dockerfile
	  container_name: demo
	  ports:
	    - "8081:8081"
	  networks:
	    - hello
	  depends_on:
	    - tomcat01

  mysqldb:
    image: mysql:5.7.19
    container_name: mysql
    ports:
      - "3306:3306"
    volumes:
      - /root/mysql/conf:/etc/mysql/conf.d
      - /root/mysql/logs:/logs
      - /root/mysql/data:/var/lib/mysql
    environment:
      MYSQL_ROOT_PASSWORD: root
    networks:
      - ems
    depends_on:
      - redis

  redis:
    image: redis:4.0.14
    container_name: redis
    ports:
      - "6379:6379"
    networks:
      - ems
    volumes:
      - /root/redis/data:/data
    command: redis-server
    
networks:
  ems:
```

```markdown
- 练习
```

```yaml
version: "3.2"

services:
  tomcat01: #服务名称
    container_name: tomcat01 # 相当于run 的 --name
    image: tomcat:8.0-jre8 #使用哪个镜像  相当于run image
    ports:  #用来完成host与容器的端口映射关系  相当于run -p
      - "8080:8080"
    volumes: #完成宿主机与容器中目录数据卷共享  相当于run -v
      #- /root/apps:/usr/local/tomcat/webapps #使用自定义路径映射
      - tomcatwebapps01:/usr/local/tomcat/webapps
    networks: #代表当前服务使用哪个网络桥     相当于run --network
      - hello
    depends_on: #代表这个容器必须依赖哪个容器之后才能启动 这个依赖启动并不是说等
    	- tomcat02 #这里书写的是服务名
    	- redis
    	- mysql
    healthcheck: #心跳检测
      test: ["CMD", "curl", "-f", "http://localhost"] #和docker内核通信
      interval: 1m30s
      timeout: 10s
      retries: 3
		  
  tomcat02: #服务名称
    container_name: tomcat02
    image: tomcat:8.0-jre8 #使用哪个镜像
    ports:  #用来完成host与容器的端口映射关系
      - "8081:8080"
    volumes: #完成宿主机与容器中目录数据卷共享
      #- /root/apps:/usr/local/tomcat/webapps #使用自定义路径映射
      - tomcatwebapps02:/usr/local/tomcat/webapps
    networks: #代表当前服务使用哪个网络桥
      - hello
    #sysctls: #用来修改容器中系统内部参数 并不是必须的有些服务启动受容器内操作系统参数限制可能会无法启动
    # - net.core.somaxconn=1024
    # - net.ipv4.tcp_syncookies=0
    #ulimits: #用来修改容器中系统内部进程数限制 可以根据当前运行服务要求进行更改
    #  nproc: 65535
    #  nofile:
    #    soft: 20000
    #    hard: 40000
        
  mysql:
    image: mysql:5.7.32
    container_name: mysql
    ports:
      - "3307:3306"
    volumes:
      - mysqldata:/var/lib/mysql
      - mysqlconf:/etc/mysql
    #environment:
    #  - MYSQL_ROOT_PASSWORD=root
    env_file: #用来将environment配置放入指定的配置文件中
    	- mysql.env #compose的当前路径
    networks:
      - hello

  redis:
    image: redis:5.0.10
    container_name: redis
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data
    networks:
      - hello
    command: "redis-server --appendonly yes" #run 镜像之后用来覆盖容器内容默认命令




volumes:  #声明上面服务所使用的自动创建的卷名
  tomcatwebapps01: #声明指令的卷名  compose自动创建该卷名但是会在之前加入项目名
    external:    #使用自定义卷名
      false       #true确定使用指定卷名  注意:一旦使用外部自定义卷名启动服务之前必须手动创建
  tomcatwebapps02:
  mysqldata:
  mysqlconf:
  redisdata:

networks: #定义服务用到桥
  hello: #定义上面的服务用到的网桥名称 默认创建就是 bridge
    external:
      true   #使用外部指定网桥  注意:网桥必须存在
```

#### 3.3.4 通过docker-compose运行一组容器

[参考文档](https://docker_practice.gitee.io/zh-cn/compose/commands.html)

```bash
[root@centos ~]# docker-compose up    							//前台启动一组服务
[root@centos ~]# docker-compose up -d 							//后台启动一组服务
```

### 3.4 docker-compose 模板文件

模板文件是使用 `Compose` 的核心，涉及到的指令关键字也比较多。但大家不用担心，这里面大部分指令跟 `docker run` 相关参数的含义都是类似的。

默认的模板文件名称为 `docker-compose.yml`，格式为 YAML 格式。

```yaml
version: "3" #docker-compose的版本

services:
  webapp:
    image: examples/web
    ports:
      - "80:80"
    volumes:
      - "/data"
```

注意每个服务都必须通过 `image` 指令指定镜像或 `build` 指令（需要 Dockerfile）等来自动构建生成镜像。

如果使用 `build` 指令，在 `Dockerfile` 中设置的选项(例如：`CMD`, `EXPOSE`, `VOLUME`, `ENV` 等) 将会自动被获取，无需在 `docker-compose.yml` 中重复设置。

下面分别介绍各个指令的用法。（下面的命令并不是全部，详细可以去查看中文文档，在13节开头已经给出相关网址）

#### build

指定 `Dockerfile` 所在文件夹的路径（可以是绝对路径，或者相对 docker-compose.yml 文件的路径）。 `Compose` 将会利用它自动构建这个镜像，然后使用这个镜像。

```yaml
version: '3'
services:

  webapp:
    build: ./dir
```

你也可以使用 `context` 指令指定 `Dockerfile` 所在文件夹的路径。

使用 `dockerfile` 指令指定 `Dockerfile` 文件名。

使用 `arg` 指令指定构建镜像时的变量。

```yaml
version: '3'
services:

  webapp:
    build:
      context: ./dir #相对路径 相对于docker-compose.yml
      dockerfile: Dockerfile-alternate
      args:
        buildno: 1
```

#### command

覆盖容器启动后默认执行的命令。

```yaml
command: echo "hello world"
```

#### container_name

指定容器名称。默认将会使用 `项目名称_服务名称_序号` 这样的格式。

```yaml
container_name: docker-web-container
```

> 注意: 指定容器名称后，该服务将无法进行扩展（scale），因为 Docker 不允许多个容器具有相同的名称。

#### depends_on

解决容器的依赖、启动先后的问题。以下例子中会先启动 `redis` `db` 再启动 `web`

```yaml
version: '3'

services:
  web:
    build: .
    depends_on:
      - db
      - redis

  redis:
    image: redis

  db:
    image: postgres
```

> 注意：`web` 服务不会等待 `redis` `db` 「完全启动」之后才启动。

#### env_file

从文件中获取环境变量，可以为单独的文件路径或列表。

如果通过 `docker-compose -f FILE` 方式来指定 Compose 模板文件，则 `env_file` 中变量的路径会基于模板文件路径。

如果有变量名称与 `environment` 指令冲突，则按照惯例，以后者为准。

```bash
env_file: .env

env_file:
  - ./common.env
  - ./apps/web.env
  - /opt/secrets.env
```

环境变量文件中每一行必须符合格式，支持 `#` 开头的注释行。

```bash
# common.env: Set development environment
PROG_ENV=development
```

#### environment

设置环境变量。你可以使用数组或字典两种格式。

只给定名称的变量会自动获取运行 Compose 主机上对应变量的值，可以用来防止泄露不必要的数据。

```yaml
environment:
  RACK_ENV: development
  SESSION_SECRET:

environment:
  - RACK_ENV=development
  - SESSION_SECRET
```

如果变量名称或者值中用到 `true|false，yes|no` 等表达 [布尔](https://yaml.org/type/bool.html) 含义的词汇，最好放到引号里，避免 YAML 自动解析某些内容为对应的布尔语义。这些特定词汇，包括

```bash
y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF
```

#### healthcheck

通过命令检查容器是否健康运行。

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost"]
  interval: 1m30s
  timeout: 10s
  retries: 3
```

#### image

指定为镜像名称或镜像 ID。如果镜像在本地不存在，`Compose` 将会尝试拉取这个镜像。

```yaml
image: ubuntu
image: orchardup/postgresql
image: a4bc65fd
```

#### networks

配置容器连接的网络。

```yaml
version: "3"
services:

  some-service:
    networks:
     - some-network
     - other-network

networks:
  some-network:
  other-network:
```

#### ports

暴露端口信息。

使用宿主端口：容器端口 `(HOST:CONTAINER)` 格式，或者仅仅指定容器的端口（宿主将会随机选择端口）都可以。

```yaml
ports:
 - "3000"
 - "8000:8000"
 - "49100:22"
 - "127.0.0.1:8001:8001"
```

*注意：当使用 `HOST:CONTAINER` 格式来映射端口时，如果你使用的容器端口小于 60 并且没放到引号里，可能会得到错误结果，因为 `YAML` 会自动解析 `xx:yy` 这种数字格式为 60 进制。为避免出现这种问题，建议数字串都采用引号包括起来的字符串格式。*

#### sysctls

配置容器内核参数。

```yaml
sysctls:
  net.core.somaxconn: 1024
  net.ipv4.tcp_syncookies: 0

sysctls:
  - net.core.somaxconn=1024
  - net.ipv4.tcp_syncookies=0
```

#### ulimits

指定容器的 ulimits 限制值。

例如，指定最大进程数为 65535，指定文件句柄数为 20000（软限制，应用可以随时修改，不能超过硬限制） 和 40000（系统硬限制，只能 root 用户提高）。

```yaml
  ulimits:
    nproc: 65535
    nofile:
      soft: 20000
      hard: 40000
```

#### volumes

数据卷所挂载路径设置。可以设置为宿主机路径(`HOST:CONTAINER`)或者数据卷名称(`VOLUME:CONTAINER`)，并且可以设置访问模式 （`HOST:CONTAINER:ro`）。

该指令中路径支持相对路径。

```yaml
volumes:
 - /var/lib/mysql:/var/lib/mysql
 - cache/:/tmp/cache
 - ~/configs:/etc/configs/:ro
```

如果路径为数据卷名称，必须在文件中配置数据卷。

```yaml
version: "3"

services:
  my_src:
    image: mysql:8.0
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

### 3.5 docker-compose 常用命令

#### 3.5.1 命令对象与格式

对于 Compose 来说，大部分命令的对象既可以是项目本身，也可以指定为项目中的服务或者容器。如果没有特别的说明，命令对象将是项目，这意味着项目中所有的服务都会受到命令影响。

执行 `docker-compose [COMMAND] --help` 或者 `docker-compose help [COMMAND]` 可以查看具体某个命令的使用格式。

`docker-compose` 命令的基本的使用格式是

```bash
docker-compose [-f=<arg>...] [options] [COMMAND] [ARGS...]

docker-compose -f your-compose.yml -p your-project up
```

#### 3.5.2 命令选项

- `-f, --file FILE` 指定使用的 Compose 模板文件，默认为 `docker-compose.yml`，可以多次指定。
- `-p, --project-name NAME` 指定项目名称，默认将使用所在目录名称作为项目名。
- `--x-networking` 使用 Docker 的可拔插网络后端特性
- `--x-network-driver DRIVER` 指定网络后端的驱动，默认为 `bridge`
- `--verbose` 输出更多调试信息。
- `-v, --version` 打印版本并退出。

#### 3.5.3 命令使用说明

##### up

格式为 `docker-compose up [options] [SERVICE...]`。

- 该命令十分强大，它将尝试自动完成包括构建镜像，（重新）创建服务，启动服务，并关联服务相关容器的一系列操作。

- 链接的服务都将会被自动启动，除非已经处于运行状态。

- 可以说，大部分时候都可以直接通过该命令来启动一个项目。

- 默认情况，`docker-compose up` 启动的容器都在前台，控制台将会同时打印所有容器的输出信息，可以很方便进行调试。

- 当通过 `Ctrl-C` 停止命令时，所有容器将会停止。

- 如果使用 `docker-compose up -d`，将会在后台启动并运行所有的容器。一般推荐生产环境下使用该选项。

- 默认情况，如果服务容器已经存在，`docker-compose up` 将会尝试停止容器，然后重新创建（保持使用 `volumes-from` 挂载的卷），以保证新启动的服务匹配 `docker-compose.yml` 文件的最新内容

---

##### down

- 此命令将会停止 `up` 命令所启动的容器，并移除网络

----

##### exec

- 进入指定的容器。
- docker-compose exec redis（docker-compose.yml中声明的服务id）bash

----

##### ps

格式为 `docker-compose ps [options] [SERVICE...]`。

列出项目中目前的所有容器。

选项：

- `-q` 只打印容器的 ID 信息。

----

##### restart

格式为 `docker-compose restart [options] [SERVICE...]`。

重启项目中的服务。

选项：

- `-t, --timeout TIMEOUT` 指定重启前停止容器的超时（默认为 10 秒）。

----

##### rm

格式为 `docker-compose rm [options] [SERVICE...]`。

删除所有（停止状态的）服务容器。推荐先执行 `docker-compose stop` 命令来停止容器。

选项：

- `-f, --force` 强制直接删除，包括非停止状态的容器。一般尽量不要使用该选项。
- `-v` 删除容器所挂载的数据卷。

---

##### start

格式为 `docker-compose start [SERVICE...]`。

启动已经存在的服务容器。

----

##### stop

格式为 `docker-compose stop [options] [SERVICE...]`。

停止已经处于运行状态的容器，但不删除它。通过 `docker-compose start` 可以再次启动这些容器。

选项：

- `-t, --timeout TIMEOUT` 停止容器时候的超时（默认为 10 秒）。

----

##### top

查看各个服务容器内运行的进程。

---

##### pause

格式为 `docker-compose pause [SERVICE...]`。

暂停服务。

---

##### unpause

格式为 `docker-compose unpause [SERVICE...]`。

恢复处于暂停状态中的服务。

------

##### logs

格式为 `docker-compose logs [SERVICE...]`。

查看日志。

## 4.Docker可视化工具

### 4.1 安装Portainer

官方安装说明：[https://www.portainer.io/installation/](http://www.yunweipai.com/go?_=8fe4813824aHR0cHM6Ly93d3cucG9ydGFpbmVyLmlvL2luc3RhbGxhdGlvbi8=)

```shell
[root@ubuntu1804 ~]#docker pull  portainer/portainer

[root@ubuntu1804 ~]#docker volume create portainer_data
portainer_data
[root@ubuntu1804 ~]#docker run -d -p 8000:8000 -p 9000:9000 --name=portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer
20db26b67b791648c2ef6aee444a5226a9c897ebcf0160050e722dbf4a4906e3
[root@ubuntu1804 ~]#docker ps 
CONTAINER ID        IMAGE                 COMMAND             CREATED             STATUS              PORTS                                            NAMES
20db26b67b79        portainer/portainer   "/portainer"        5 seconds ago       Up 4 seconds        0.0.0.0:8000->8000/tcp, 0.0.0.0:9000->9000/tcp   portainer
```

docker-compose

```yaml
version: "3.2"

services:
  portainer: 
    container_name: portainer
    image: portainer/portainer
    ports:
      - "8000:8000"
      - "9000:9000"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer_data:/data
    
volumes:
  portainer_data: 
    external:
      true
```

### 4.2 登录和使用Portainer

用浏览器访问：`http://localhost:9000`

![image-20201223231707738](https://image.lkarrie.com/images/2022/06/15/image-20201223231707738.png)

 Stacks指的是你运行的docker-compose，一个项目就是一个Stacks

![image-20210620005645817](https://image.lkarrie.com/images/2022/06/15/image-20210620005645817.png)



## 5.Docker 问题

### x509: certificate 

```powershell
[root@localhost ~]# docker search 或者 docker pull 这些命令无法使用
Error response from daemon: Get https://index.docker.io/v1/search?q=mysql&n=25: x509: certificate has expired or is not yet valid
```

![image-20200602183429286](https://image.lkarrie.com/images/2022/06/15/image-20200602183429286.png)

- 注意:**这个错误的原因在于是系统的时间和docker hub时间不一致,需要做系统时间与网络时间同步**

```markdown
# 1.安装时间同步
	sudo yum -y install ntp ntpdate
# 2.同步时间
	sudo ntpdate cn.pool.ntp.org
# 3.查看本机时间
	date
# 4.重新测试
```

![image-20200602183718623](https://image.lkarrie.com/images/2022/06/15/image-20200602183718623.png)