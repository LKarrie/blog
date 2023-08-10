---
title: Minecraft Server
date: 2022-02-20T23:25:00.000Z
date_updated: 2022-02-20T23:25:00.000Z
description: Build Minecraft Server ~
tags: [ "Minecraft" ]
categories : [ "Game" ]
lazyBanner : "/imglazy/silverwolf-lazy.jpg"
banner : "/img/silverwolf.jpg"
lazyCardImg : "/imglazy/silverwolf-lazy.jpg"
cardImg : "/img/silverwolf.jpg"
---

## Minecraft

  文章封面来自 [Milk jelly - Minecraft - Bee](https://www.pixiv.net/artworks/88268073)

  时隔一年又一次和大学室友玩起了MC~，简单记录一下服务构建方法

  官方网站上更新了很多创建的方法[官方教程](https://minecraft.fandom.com/wiki/Tutorials/Setting_up_a_server)，新加了服务器控制台，docker启动服务端之类的，但是我自己没有实际尝试过不是很清楚用起来方便不方便，这里我还是用老方法装的服务器，毕竟老方法很熟一会就弄好了，后面有时间玩玩控制台和docker mc之后再记录记录

## Minecraft Vanilla Server

### 准备

  一台LINUX服务器

  如果你买的是云服务，配置可以先用1C4G买，不够了再往上加即可，有钱也可先直接买4C8G

  网络的话，1-2M大概只够4个人玩吧，看自己的需要也可以先买低在往上加

  操作系统的话，我比较喜欢Centos，服务器用的Centos7.4，其他Linux安装方法类比即可

  `如果你也是阿里云服务器 记得在安全组-配置规则里面开放端口 MC默认的是25565 不怕攻击图方便也可以直接设置-1/-1全放开放:D`

### 安装Screen（可选）

  为什么要安装Screen :D ?

  为了让服务器一直运行~，我是直接java - jar运行，ssh断了服也关掉了，这东西使用起来有点类似VNC吧，可以开很多窗口

```shell
# 安装Screen
yum install screen -y
# 启动 创建窗口
screen -S screen_name
# 退出窗口
ctrl+A+D
# 查看所有窗口（显示session id
screen -list
screen -ls
# 回到某个窗口
screen -r
screen -r session_id
screen -r screen_name
# 删除某个窗口
screen -X -S session quit
# 以上的命令基本够我玩了 其他还有可以问百度哦
```

  简单操作下：

![image-1](https://image.lkarrie.com/images/2022/02/20/Minecraft1.png)

### 安装JAVA

  Linux服务器准备好之后需要安装JAVA，目前我和室友玩的版本是1.18.1 ，已经必须使用JDK17了，我还记得去年1.16的版本还是可以用jdk8...

  安装JDK17

```shell
# 创建Java安装路径并上传离线包
mkdir -p /server/java/jdk17

# 下载并解压
wget https://download.oracle.com/java/17/latest/jdk-17_linux-x64_bin.tar.gz -P /server/java/jdk17
tar xf /home/jdk17/jdk-17_linux-x64_bin.tar.gz -C /server/java/jdk17

# 编辑profile文件,这就相当于win机的添加path环境变量吧
vim /etc/profile

# 扣i 编辑里面的内容 在结尾处添加下面的内容
# set Java environment
JAVA_HOME=/server/java/jdk17/jdk-17.0.2
PATH=$JAVA_HOME/bin:$PATH
CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar
export JAVA_HOME
export PATH
export CLASSPATH

# 编译配置文件
source /etc/profile

# 这时候Java已经装完啦 java -v javac 可以验证 下面可以跑服务器了

# 如果重启之后java又找不到了重新 source /etc/profile
```

### 下载server.jar

  官网下载地址：[官方下载](https://www.minecraft.net/zh-hans/download/server)

  官网上一直显示的是最新的服务器端jar包，2022.02.19我自己下载是 1.18.1版本

### 启动

  纯净启动也很简单，如果你也是从官网下载的jar就能看到

```shell
# 进入screen创建的mc窗口
screen -r Minecraft
# 执行
java -Xmx1024M -Xms1024M -jar minecraft_server.1.16.5.jar nogui

java -Xmx2048M -Xmx2048M -jar minecraft_server.1.18.1.jar nogui
```

  第一次启动会启动失败，需要你修改运行服务器目录下的eula.txt

  修改为 eula=true

![image-2](https://image.lkarrie.com/images/2022/02/20/Minecraft2.png)

  修改之后再次启动应该就能运行咯，但是！如果你是盗版侠，你还要为服务器关闭在线模式~

  运行服务器之后ctrl+c停止服务器，你能看到你的目录下多了很多文件夹

![image-3](https://image.lkarrie.com/images/2022/02/20/Minecraft3.png)

  通过名字不难理解这些文件是什么意思

  world文件夹就是你刚刚生成的世界，不喜欢就删除掉 rm -rf world/  再重新运行服务器就会生成新的世界，需要备份就直接copy保存这个文件夹也就行咯，你甚至可以把其他世界内容复制到里面去，替换你服务器的世界

  其他的嘛能用到再补充

### 修改server.properties

```markdown
# server.properties是世界的相关配置设置文件，个人感觉必须要设置的有几个
# 关闭在线模式 允许盗版侠进入服务器
online-mode=false
# 运行飞行，不开启悬停在空中会被服务器自动踢出
allow-flight=true
# 剩下的难度 人数之类的看个人吧
```

  详细的设置和解释可以参考：[官方 server properties](https://minecraft.fandom.com/zh/wiki/Server.properties)

## Minecraft Mod Server

​	如果朋友们还想mod，再更~

​	balala