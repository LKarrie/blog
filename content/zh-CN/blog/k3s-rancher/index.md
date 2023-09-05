---
title: K3S&Rancher部署文档
date: 2022-03-02T00:05:00.000Z
lastmod: 2022-03-02T00:05:00.000Z
description: k3s和rancher的一些工作部署总结~
tags: [ "K3S","Rancher" ]
categories : [ "K8S" ]
lazyBanner : "/imglazy/silverwolf-lazy.jpg"
banner : "/img/silverwolf.jpg"
lazyCardImg : "/imglazy/silverwolf-lazy.jpg"
cardImg : "/img/silverwolf.jpg"
---

# 🥕

文章封面来自[月夜-🌈](https://www.pixiv.net/artworks/96670572)

Kubernetes管理平台在企业中也越来越普遍了，市面上相关产品也越来越多，我接触过的就有Rancher，DaoCloud，KubeSphere等等

说实话我个人Rancher有点玩腻了，最近做了一些了解，感觉KubeSphere的生态还是很不错的，有空差不多也该卷卷这个东西了

本篇文章主要记录了在我过去工作中接触到的K3s和Rancher一些部署和安装

文档大概是20年年底写的，当时给内部培训用的所以啰嗦了一点，介绍安装的版本是v1.19.5+k3s1（kubernetes版本1.19.5），如果仅是安装这个版本的k3s，文章内容还是完全适用的（经过生产实践验证）

更高版本的k3s安装方法可能有些变化，如果要安装更高版本，文章的步骤仅供参考

一些建议：

* 本片文章部署里将master节点也设置了worker角色，有条件可以让master仅作调度功能，仅在从节点运行应用工作负载
* 使用K3S安装集群后，不要再在部署机器中再安装docker等其他容器工具，网卡太多，网络问题不好解决

## 1.K3S

### 1.1 相关资源和网站

####	1.1.1 参考网站

`K3S中文官方文档`: https://docs.rancher.cn/docs/k3s/_index

`K3S英文官方文档`: https://rancher.com/docs/k3s/

`	Kubectl命令`:http://docs.kubernetes.org.cn/468.html

`	K3S环境变量`: https://docs.rancher.cn/docs/k3s/installation/install-options/_index

`	K3S启动参数`: https://docs.rancher.cn/docs/k3s/installation/install-options/server-config/_index

####	1.1.2 安装要求介绍

`安装要求`：https://docs.rancher.cn/docs/k3s/installation/installation-requirements/_index

`系统`：

centos7

`网络`：

K3s Server节点的入站规则：

| 协议 | 端口      | 源                       | 描述                         |
| ---- | --------- | ------------------------ | ---------------------------- |
| TCP  | 6443      | K3s agent 节点           | Kubernetes API Server        |
| UDP  | 8472      | K3s server 和 agent 节点 | 仅对 Flannel VXLAN 需要      |
| TCP  | 10250     | K3s server 和 agent 节点 | Kubelet metrics              |
| TCP  | 2379-2380 | K3s server 节点          | 只有嵌入式 etcd 高可用才需要 |

`节点 CPU 和 内存`：

以下是高可用 K3s server 中节点的最低 CPU 和内存要求：

| 部署规模 | 节点      | VCPUS | RAM   |
| -------- | --------- | ----- | ----- |
| Small    | Up to 10  | 2     | 4 GB  |
| Medium   | Up to 100 | 4     | 8 GB  |
| Large    | Up to 250 | 8     | 16 GB |
| X-Large  | Up to 500 | 16    | 32 GB |
| XX-Large | 500+      | 32    | 64 GB |

`外部数据库`：

K3s 支持不同的数据库，包括 MySQL、PostgreSQL、MariaDB 和 etcd，以下是运行大型集群所需的数据库资源的大小指南：

| 部署规模 | 节点      | VCPUS | RAM   |
| -------- | --------- | ----- | ----- |
| Small    | Up to 10  | 1     | 2 GB  |
| Medium   | Up to 100 | 2     | 8 GB  |
| Large    | Up to 250 | 4     | 16 GB |
| X-Large  | Up to 500 | 8     | 32 GB |
| XX-Large | 500+      | 16    | 64 GB |

####	1.1.3 离线资源下载 

需要根据CPU架构选择使用的离线资源

`K3S离线安装文档`: https://docs.rancher.cn/docs/k3s/installation/airgap/_index

`官方GIT`：https://github.com/k3s-io/k3s/releases

`下载`：https://github.com/k3s-io/k3s/releases/tag/v1.19.5%2Bk3s1

`离线搭建资源`：从git上下载 k3s 和 k3s-airgap-images-amd64.tar

![image-20201229092812760](https://image.lkarrie.com/images/2022/06/26/image-20201229092812760.png)

`关于架构`：

> x86_64，x64，AMD64基本上是同一个东西
>
> - x86是intel开发的一种32位指令集
> - x84_64是CPU迈向64位的时候
> - x86_64是一种64位的指令集，x86_64是x86指令的超集，在x86上可以运行的程序，在x86_64上也可以运行，x86_64是AMD发明的，也叫AMD64
>
> 现在用的intel/amd的桌面级CPU基本上都是x86_64，与之相对的arm、pcc等都不是x86_64

### 1.2 高可用架构

####	1.2.1 K3S支持的数据存储选项

- 嵌入式 [SQLite](https://www.sqlite.org/index.html)
- [PostgreSQL](https://www.postgresql.org/) (经过认证的版本：10.7 和 11.5)
- [MySQL](https://www.mysql.com/) (经过认证的版本：5.7)
- [MariaDB](https://mariadb.org/) (经过认证的版本：10.3.20)
- [etcd](https://etcd.io/) (经过认证的版本：3.3.15)
- 嵌入式 etcd 高可用（实验性）

####	1.2.2 使用外部数据库实现高可用

关于使用外部数据库存储集群数据，我以前踩过个坑，当时用的mysql存集群，集群规模起来之后集群yaml的一些CRUD变得有些慢甚至会出现问题...

还是建议用etcd存储集群数据

`官方介绍`：https://docs.rancher.cn/docs/k3s/installation/ha/_index

![k3s-architecture-ha-server](https://image.lkarrie.com/images/2022/06/26/k3s-architecture-ha-server.png)

> 两个或更多`server节点`将为 Kubernetes API 提供服务并运行其他 control-plane 服务
>
> `外部数据存储`（与单节点 k3s 设置中使用的嵌入式 SQLite 数据存储相反）
>
> 使用 k3s server命令时（master节点） 启动参数`--datastore-endpoint`指定外部数据库
>
> 例如 INSTALL_K3S_EXEC='server --datastore-endpoint
>
> ="mysql://username:password@tcp(hostname:3306)/database-name"'

`不同数据库端点格式`：https://docs.rancher.cn/docs/k3s/installation/datastore/_index/#数据存储端点格式和功能

####	1.2.3 嵌入式DB的高可用

`官方介绍`：https://docs.rancher.cn/docs/k3s/installation/ha-embedded/_index

> 要在这种模式下运行 K3s，必须有`奇数的服务器节点`，官方建议从三个服务器节点开始（Master节点）
>
> 首先启动第一个服务器节点，使用`--cluster-init`启动参数来启用集群 
>
> 例如`k3s server --cluster-init`
>
> 或者使用环境变量`K3S_CLUSTER_INIT=true`
>
> 第一台master启动后，其余节点使用`--server`启动参数加入集群
>
> 例如 `k3s server --server https://<ip or hostname of server1>:6443`
>
> 或者使用环境变量`K3S_URL=https://<ip or hostname of server1>:6443`

`为什么是奇数节点官方给的一些解释`：

https://docs.rancher.cn/docs/rancher2/installation/k8s-install/create-nodes-lb/_index/#为什么要三个节点？

###	1.3 系统前置操作

```markdown
# 关闭firewalld
 	systemctl status firewalld.service
	systemctl stop firewalld.service
	systemctl disable firewalld.service
# 关闭selinux防火墙
	setenforce 0
	sed -i 's/SELINUX=enforcing/SELINUX=disabled/' /etc/selinux/config
# 设置可读的hostname 
	hostnamectl set-hostname linuxprobe
	hostname
# 确认架构 决定使用的离线tar包版本 amd or arm
	arch
# 确认DNS配置（DNS文件必须存在，否则会引起coredns启动异常，随便配置也可以）
    cat /etc/resolv.conf
    nameserver 144.144.144.144
    nameserver 8.8.8.8

# 不建议同时安装k3s和docker
# 必须要装一起的话，请首先安装k3s再安装docker
# 理由是相同可执行文件ctr docker先装之后 k3s安装会跳过创建这个同名软连接

# 如果你用了nfs
# 所有节点安装nfs客户端并启用rpcbind服务 nfs
    yum install -y nfs-utils
    systemctl enable --now rpcbind

# 时间
    ntpdate cn.pool.ntp.org

    hwclock 

    hwclock --systohc

    hwclock -w

# 如果rpm 装不上 需要换源
# 换yum 参考https://developer.aliyun.com/article/645748?spm=a2c6h.17698244.wenzhang.3.3a1d2667HzMeE4
# 1.备份
    mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup
# 2.下载新的
    wget -O /etc/yum.repos.d/CentOS-Base.repo https://mirrors.aliyun.com/repo/Centos-7.repo
# 或者
    curl -o /etc/yum.repos.d/CentOS-Base.repo https://mirrors.aliyun.com/repo/Centos-7.repo
# 3.运行yum makecache生成缓存
    yum clean all 
    yum makecache
    yum update
```

###	1.4 下载安装脚本

```markdown
	mkdir -p /k3s
 	cd /k3s

# 下载安装脚本	
	wget https://get.k3s.io -O install.sh
	chmod +x install.sh
```

###	1.5 安装K3S命令

```markdown
# 将下载的可执行文件k3s上传至k3s文件夹下
# 如果需要部署多节点 scp k3s文件到其他机器
# 传输到master-3
	scp /k3s/k3s root@172.19.116.103:/k3s
# 传输到master-2
	scp /k3s/k3s root@172.19.116.101:/k3s
# 传输到worker-1
	scp /k3s/k3s root@172.19.116.102:/k3s
	
	cp /k3s/k3s /usr/local/bin
	cd /usr/local/bin
	chmod 755 /usr/local/bin/k3s
```

###	1.6 导入K3S相关镜像

```markdown
# 如果需要部署多节点 scp 离线镜像包到其他机器上
# 传输到master-3
	scp /k3s/k3s-airgap-images-amd64.tar root@172.19.116.103:/k3s
# 传输到master-2
	scp /k3s/k3s-airgap-images-amd64.tar root@172.19.116.101:/k3s
# 传输到worker-1
	scp /k3s/k3s-airgap-images-amd64.tar root@172.19.116.102:/k3s

# 镜像丢进默认安装路径
	mkdir -p /var/lib/rancher/k3s/agent/images/
	cp /k3s/k3s-airgap-images-amd64.tar /var/lib/rancher/k3s/agent/images/
	cd /var/lib/rancher/k3s/agent/images/

# 创建K3S目录
	mkdir -p /k3s/data
```



###	1.7 部署K3S集群（嵌入式DB）

#### 1.7.0 安装离线RPM包

`K3S在安装时需要安装独立的rpm k3s-selinux-0.2-1.el7_8.noarch.rpm`

如果是在线安装，官方的脚本会直接拉取并安装，离线环境就要手动安装了

```markdown
# 安装 k3s-selinux-0.2-1.el7_8.noarch.rpm（重要）
# https://rpm.rancher.io/k3s/stable/common/centos/7/noarch/k3s-selinux-0.2-1.el7_8.noarch.rpm
# 装不上的话会提示缺少哪些依赖 rpm 根提示补充即可
yum install k3s-selinux-0.2-1.el7_8.noarch.rpm -y
# 一些依赖的rpm
# yum install --downloadonly --downloaddir=/k3s/rpm selinux-policy-base
# yum install --downloadonly --downloaddir=/k3s/rpm container-selinux
```

#### 1.7.1 部署第一台Master节点

```markdown
# 1.INSTALL_K3S_SKIP_DOWNLOAD 如果设置为 "true "将不会下载 K3s 的二进制文件。
	export INSTALL_K3S_SKIP_DOWNLOAD=true

# 2.INSTALL_K3S_EXEC 设置启动命令，如果这个命令里没有指定为 server 或 agent，则如果设置了K3S_URL，则默认为 "agent"。如果没有设置，则默认为 "server"
# --data-dir 存放数据的目录 默认值/var/lib/rancher/k3s 或 ${HOME}/.rancher/k3s （如果不是 root 用户）
# --kube-apiserver-arg 定义 kube-apiserver 进程的参数。
# --write-kubeconfig 将管理客户端的 kubeconfig 写入这个文件（/etc/rancher/k3s/k3s.yaml）
# --write-kubeconfig-mode 写入模式 -rw-rw-rw- 
	export INSTALL_K3S_EXEC="--data-dir /k3s/data --kube-apiserver-arg service-node-port-range=1-65000 --write-kubeconfig ~/.kube/config --write-kubeconfig-mode 666"  

# 3.启用集群标志 同 --cluster-init
	export K3S_CLUSTER_INIT=true

#	注：删除用unset XXX

# 4.启动
# 执行1.4 下载的安装脚本
	cd /k3s
	./install.sh 

# 5.验证
## 查看所有namespace
	kubectl get ns

## 查看kube-system(核心服务命名空间)
	kubectl get all -n kube-system
	kubectl get nodes

## 查看服务启动情况
	systemctl status k3s
## 查看启动日志
	journalctl -u k3s
## 查看运行日志
	cd /var/log/	
## 迁移k3s.yaml 作worker kubuconfig文件
	cat /etc/rancher/k3s/k3s.yaml
	scp /etc/rancher/k3s/k3s.yaml @172.19.116.102:/k3s

# 一些常用命令
# 查看pod事件和日志
	kubectl describe pod coredns-854c77959c-bs6dk -n kube-system

	kubectl logs coredns-88dbd9b97-kmf9r -n kube-system

# 重启pod

	kubectl get pod svclb-traefik-dw775 -n kube-system -o yaml | kubectl replace --force -f -

# 强制删除
	kubectl delete --grace-period=0 --force --namespace middleware pod/alertmanager-cluster-0
```

#### 1.7.2 导入CTR离线镜像

`在离线环境中启动K3S,还需要执行将离线的镜像导入containerd中,否则镜像会一直处于creating状态，这是官方的一个bug`

`kube-system 会拉取 docker.io/rancher/pause:3.1 `

`离线环境会拉取失败 kube-system命名空间异常`

`公网环境网络较慢也可以执行此步骤`

`离线镜像制作过程见1.8`

```markdown
# 导入K3S 离线镜像
ctr images import custom-k3s-airgap-images.tar
```

####	1.7.3 获取Token

```markdown
# 将 server 或 agent 加入集群的共享 secret
	cat /k3s/data/server/node-token

# 粘贴TOKEN
K109741ae3dd0de6bf166b0395a073b5f7752ed7c308fb6f55b780c5d081a93be2e::server:6e9f903e03ac1437cc39997facbb5a96
```

####	1.7.4 部署其余Master节点

```markdown
	export INSTALL_K3S_SKIP_DOWNLOAD=true

# 检查TOKEN 设置上一步获取的token
# K3S url是 Master1的地址 master1-ip 替换成自己的ip地址
	export K3S_TOKEN=K109741ae3dd0de6bf166b0395a073b5f7752ed7c308fb6f55b780c5d081a93be2e::server:6e9f903e03ac1437cc39997facbb5a96

	export K3S_URL=https://master1-ip:6443

	export INSTALL_K3S_EXEC="server --data-dir /k3s/data --kube-apiserver-arg service-node-port-range=1-65000 --write-kubeconfig ~/.kube/config --write-kubeconfig-mode 666"

	cd /k3s
	./install.sh
```

####	1.7.5 部署Agent节点

`集群访问官方文档`：https://docs.rancher.cn/docs/k3s/cluster-access/_index

```markdown
	export INSTALL_K3S_SKIP_DOWNLOAD=true

# 检查TOKEN
	export K3S_TOKEN=K109741ae3dd0de6bf166b0395a073b5f7752ed7c308fb6f55b780c5d081a93be2e::server:6e9f903e03ac1437cc39997facbb5a96

# 配置固定的注册节点，Agent节点需要一个URL来注册。它可以是任何server节点的IP或主机名，或者是 server节点前的稳定的端点（负载均衡）
	export K3S_URL=https://master1-ip:6443	
# 安装参数
	export INSTALL_K3S_EXEC="--data-dir /k3s/data --with-node-id"

# kubectl 或 helm 的 kubeconfig文件
# 复制master1的 /etc/rancher/k3s/k3s.yaml
	scp /etc/rancher/k3s/k3s.yaml @172.19.116.102:/k3s
	mkdir -p ~/.kube
	cp k3s.yaml ~/.kube/config

# 修改IP为你的server节点ip或者vip
	vim  ~/.kube/config

	cd /k3s
	./install.sh

# 设定Worker角色
	kubectl label node worker-1 node-role.kubernetes.io/worker=worker
```

### 1.8 custom-k3s-airgap-images.tar

#### 1.8.1 确定镜像清单

1.19.5 K3S1 离线镜像清单如下 包含Rancher和其他中间件

```markdown
# 必须
quay.io/jetstack/cert-manager-cainjector:v0.15.0
quay.io/jetstack/cert-manager-controller:v0.15.0
quay.io/jetstack/cert-manager-webhook:v0.15.0
docker.io/rancher/pause:3.1
rancher/coredns-coredns:1.7.1
rancher/fleet-agent:v0.3.2
rancher/fleet-agent:v0.3.1
rancher/fleet:v0.3.2
rancher/fleet:v0.3.1
rancher/gitjob:v0.1.11
rancher/gitjob:v0.1.8
rancher/klipper-helm:v0.3.0
rancher/klipper-lb:v0.1.2
rancher/library-traefik:1.7.19
rancher/local-path-provisioner:v0.0.14
rancher/metrics-server:v0.3.6
rancher/rancher-operator:v0.1.2
rancher/rancher:v2.5.3
rancher/rancher-webhook:v0.1.0-beta9
rancher/rancher-webhook:v0.1.0-beta7
rancher/shell:v0.1.5
rancher/rancher-operator:v0.1.1
# 非必须, 如果你想使用K3S通过kubectl手动部署中间件可以加上一起导入
redis
rabbitmq:3.7.8-management-alpine
sonatype/nexus3
nacos/nacos-server:1.4.0
quay.io/external_storage/nfs-client-provisioner:latest
```

#### 1.8.2 如何确定镜像清单

```markdown
# 前提：需要一个正常运行的公网K3S+Rancher集群 获取基础镜像清单版本
# 在正常的集群中执行
# 获取所有pod list
# 如下命令会在当前目录创建 image-list.txt 并写入镜像清单

kubectl get pods -A -o jsonpath="{.items[*].spec.containers[*].image}"   | tr -s '[[:space:]]' '\n' | sort | uniq > image-list.txt

# `注意：但实际在离线部署过程中 拉取版本可能和 image-list.txt 中的版本不同`
# 例如我在上面的清单中提供的 Rancher相关镜像
# 在实际部署过程中查看一直处于 creating状态的pod 找到拉取失败的镜像再手动加入image-list.txt中即可
# 查看相关pod deployment 日志、描述

kubectl get pods -n kube-system
```

#### 1.8.3 拉取镜像清单镜像

```markdown
# 拉取pod list
xargs -n1 docker pull <<< "$(cat image-list.txt)"
```

#### 1.8.4 压缩镜像

```markdown
# 生成custom-k3s-airgap-images.tar
docker save $(cat image-list.txt) -o custom-k3s-airgap-images.tar
```

###	1.9 设置私有镜像仓库

`官方文档`：https://docs.rancher.cn/docs/k3s/installation/private-registry/_index

`创建registries.yaml丢进/etc/rancher/k3s/即可,K3S启动会检查是否配置`：

```markdown
mirrors:
  "192.168.70.3:5000":
    endpoint:
      - "http://192.168.70.3:5000"
```

`多个仓库：`

```markdown
mirrors:
  "192.168.70.3:5000":
    endpoint:
      - "http://192.168.70.3:5000"
  "192.168.70.3:6000":
    endpoint:
      - "http://192.168.70.3:6000"
```

###	1.10卸载K3S

####	1.10.1 卸载Server

```markdown
	systemctl stop k3s.service

	/usr/local/bin/k3s-uninstall.sh
```

####	1.10.2 卸载Agent

```markdown
	systemctl stop k3s-agent.service

	/usr/local/bin/k3s-agent-uninstall.sh
```

####	1.10.3 从集群中移除节点

```markdown
# 移出cluster
	kubectl delete node master-2
# 执行官方的卸载shell后
# 确认环境变量
	env | grep K3S
# unset已经配置的环境变量
	unset XXX
# 如果指定了挂载目录 需要手动删除挂载目录
	rm -rf /k3s/data
```

### 1.11 K3S证书轮换

[官方介绍](https://docs.rancher.cn/docs/k3s/advanced/_index/#%E8%AF%81%E4%B9%A6%E8%BD%AE%E6%8D%A2)

![image-20210401173720759](https://image.lkarrie.com/images/2022/06/26/image-20210401173720759.png)

### 1.12 其他命令补充

```markdown
# 清理未使用镜像
k3s crictl rmi --prune

# Service域名格式：
$(service name).$(namespace).svc.cluster.local，其中 cluster.local 为指定的集群的域名

# 查看目录大小
du -lh --max-depth=1

# 查看主机上运行的pod
kubectl get pods --all-namespaces --field-selector=spec.nodeName=k3ss1

# 进入POD中的容器(第一个容器)
kubectl exec -n testing-backend -it workbench-585b95f5f9-m2btn -- /bin/bash

# 从POD 中拿文件 拷贝POD中第一个容器的/home/app/applogs下的所有文件到 宿主级/test1目录下
kubectl cp -n testing-backend workbench-585b95f5f9-m2btn:/home/app/applogs /test1

## 一个pod多个容器 用 -c 指定容器
```

##	2.Rancher

###	2.1 Rancher在线安装

[相关网站](https://rancher.com/docs/rancher/)

####	2.1.1 安装Helm

```markdown
# 下载安装包
	wget https://get.helm.sh/helm-v3.4.2-linux-amd64.tar.gz

# 安装
	tar -zxvf helm-v3.4.2-linux-amd64.tar.gz 
	mv linux-amd64/helm /usr/local/bin/helm

# 验证
	helm version
```

####	2.1.2  添加 Helm Chart 仓库

[官方文档](https://docs.rancher.cn/docs/rancher2/installation/other-installation-methods/air-gap/install-rancher/_index/)

```markdown
# helm repo add rancher-stable https://releases.rancher.com/server-charts/stable
# 国内
	helm repo add rancher-stable http://rancher-mirror.oss-cn-beijing.aliyuncs.com/server-charts/stable
```

#### 2.1.3  安装 Cert-manager

```markdown
# 主节点 kube config 位置
	export KUBECONFIG=/etc/rancher/k3s/k3s.yaml

	kubectl create namespace cert-manager

# crd资源
	kubectl apply --validate=false -f https://github.com/jetstack/cert-manager/releases/download/v0.15.0/cert-manager.crds.yaml

	helm repo add jetstack https://charts.jetstack.io

	helm repo update

# 安装
	helm install \
 	cert-manager jetstack/cert-manager \
 	--namespace cert-manager \
 	--version v0.15.0

# 检查
	kubectl get pods --namespace cert-manager
	
# 镜像没拉下来 重启pod
	kubectl get pod cert-manager-cainjector-7f6686b94-sv56n -n cert-manager -o yaml | kubectl replace --force -f -
```

`部署成功`：

![image-20201229142622178](https://image.lkarrie.com/images/2022/06/26/image-20201229142622178.png)

#### 2.1.4 安装Rancher

```markdown
	kubectl create namespace cattle-system

    helm install rancher rancher-stable/rancher \
    --namespace cattle-system \
    --set hostname=rancher.k3s.info \
    --version 2.5.3

	kubectl get pods -n cattle-system
	kubectl get deploy rancher -n cattle-system
	kubectl get all -n cattle-system
	kubectl describe deployments.apps -n=cattle-system rancher

# 默认需要配置通过你设置值的域名 例如上面的安装命令 rancher.k3s.info 访问rancher（其实就是生成了一个ingress）如果域名是假的，配置host文件也行
# 或者直接创建nodeport service 暴露端口访问rancher

# 创建 service 暴露端口直接访问rancher
	kubectl -n cattle-system apply -f rancher-host.yaml
```

rancher-host.yaml

```yaml
apiVersion: v1
kind: Service
metadata:
  annotations:
    field.cattle.io/creatorId: user-cckjt
    field.cattle.io/ipAddresses: "null"
    field.cattle.io/publicEndpoints: '[{"port":30043,"protocol":"TCP","serviceName":"cattle-system:rancher-host","allNodes":true}]'
    field.cattle.io/targetDnsRecordIds: "null"
    field.cattle.io/targetWorkloadIds: '["deployment:cattle-system:rancher"]'
  creationTimestamp: null
  labels:
    cattle.io/creator: norman
  managedFields:
  - apiVersion: v1
    fieldsType: FieldsV1
    manager: rancher
    operation: Update
  name: rancher-host
  selfLink: /api/v1/namespaces/cattle-system/services/rancher-host
spec:
  externalTrafficPolicy: Cluster
  ports:
  - name: "443"
    port: 433
    protocol: TCP
    targetPort: 443
    nodePort: 30043
  selector:
    workloadID_rancher-host: "true"
  sessionAffinity: None
  type: NodePort
status:
  loadBalancer: {}
```

`部署成功`：

![image-20201229143103714](https://image.lkarrie.com/images/2022/06/26/image-20201229143103714.png)

![image-20201229150319019](https://image.lkarrie.com/images/2022/06/26/image-20201229150319019.png)

###	2.2 Rancher离线安装

####	2.2.1 安装Helm

```markdown
# 下载安装包
	wget https://get.helm.sh/helm-v3.4.2-linux-amd64.tar.gz

# 安装
	tar -zxvf helm-v3.4.2-linux-amd64.tar.gz 
	mv linux-amd64/helm /usr/local/bin/helm

# 验证
	helm version
```

#### 2.2.2 获取Rancher模板

```markdown
# helm repo add rancher-stable https://releases.rancher.com/server-charts/stable
# 国内
	helm repo add rancher-stable http://rancher-mirror.oss-cn-beijing.aliyuncs.com/server-charts/stable

# 获取.tgz结尾的模板包
	helm fetch rancher-stable/rancher

```

#### 2.2.3 获取模板

```markdown
	helm repo add jetstack https://charts.jetstack.io
	helm repo update
	helm fetch jetstack/cert-manager --version v0.15.0

#	正常下来2个文件cert-manager-v0.15.0.tgz和cert-manager-crd.yaml
#	如果0.15下不来cert-manager-crd.yaml，则需要下面下载
# 使用不同的版本的话 去git里扒
	wget https://github.com/jetstack/cert-manager/releases/download/v0.15.0/cert-manager.crds.yaml -O cert-manager-crd.yaml 
```

#### 2.2.4 渲染Rancher模版

```markdown
	helm template rancher ./rancher-2.5.3.tgz --output-dir . \
	--namespace cattle-system \
	--set hostname=<RANCHER.YOURDOMAIN.COM> \
	--set certmanager.version=<CERTMANAGER_VERSION> \
	--set rancherImage=<REGISTRY.YOURDOMAIN.COM:PORT>/rancher/rancher \
	--set systemDefaultRegistry=<REGISTRY.YOURDOMAIN.COM:PORT> \ # 自v2.2.0可用，设置默认的系统镜像仓库
	--set useBundledSystemChart=true # 自v2.3.0可用，使用内嵌的 Rancher system charts

# 例如
	helm template rancher ./rancher-2.5.3.tgz --output-dir . \
	--namespace cattle-system \
	--set hostname=rancher.k3s.info \
	--set certmanager.version=v0.15.0 \
	--set rancherImage=rancher/rancher \
	--set useBundledSystemChart=true

        helm template rancher ./rancher-2.6.0.tgz --output-dir . \
        --namespace cattle-system \
        --set hostname=rancher.k3s.info \
        --set certmanager.version=v0.15.0 \
        --set rancherImage=rancher/rancher \
        --set useBundledSystemChart=true

        helm template rancher ./rancher-2.5.3.tgz --output-dir . \
        --namespace cattle-system \
        --set hostname=rancher.k3s.info \
        --set certmanager.version=v0.15.0 \
        --set rancherImage=rancher/rancher \
        --set useBundledSystemChart=true
```

####	2.2.5 渲染Cert-manager模板

```markdown
	helm template cert-manager ./cert-manager-v0.15.0.tgz --output-dir . \
	--namespace cert-manager \
	--set image.repository=quay.io/jetstack/cert-manager-controller \
	--set webhook.image.repository=quay.io/jetstack/cert-manager-webhook \
	--set cainjector.image.repository=quay.io/jetstack/cert-manager-cainjector
	
	mv cert-manager-crd.yaml ./cert-manager
```

#### 2.2.6 部署Cert-manager

```markdown
	kubectl create namespace cert-manager
	kubectl apply --validate=false -f cert-manager/cert-manager-crd.yaml
	kubectl apply -R -f ./cert-manager
# 查看部署状态
	kubectl get pods -n cert-manager 
```

####	2.2.7 部署Rancher

```markdown
	kubectl create namespace cattle-system
	kubectl -n cattle-system apply -R -f ./rancher
# 查看pod
	kubectl get pods -n cattle-system
	kubectl logs -f rancher-54cd5c9c4f-glcpz -n cattle-system	
# 验证状态
	kubectl get all -n cattle-system
	
# 默认需要配置通过你设置值的域名 例如上面的安装命令 rancher.k3s.info 访问rancher（其实就是生成了一个ingress）如果域名是假的，配置host文件也行
# 或者直接创建nodeport service 暴露端口访问rancher

# 创建 service 暴露端口直接访问rancher
	kubectl -n cattle-system apply -f rancher-host.yaml
```

rancher-host.yaml在2.1.4小节有贴出来，这里就不重复贴了

`部署成功`：

![image-20201229210257329](https://image.lkarrie.com/images/2022/06/26/image-20201229210257329.png)

### 	2.3 卸载Rancher

#### 2.3.1 安装卸载

```markdown
	helm uninstall rancher -n=cattle-system  
```

## 3. NFS

其他机器上docker跑一个nfs服务，命令仅供参考

```markdown
docker run -d \
    --name nfs-server \
    --privileged \
    --restart always \
    -p 2049:2049 \
    -v /app/nfs-share:/nfs-share \
    -e SHARED_DIRECTORY=/nfs-share \
    itsthenetwork/nfs-server-alpine:latest

helm repo add apphub https://apphub.aliyuncs.com

helm fetch apphub/nfs-client-provisioner

helm template nfs-client-provisioner ./nfs-client-provisioner-1.2.8.tgz --output-dir . \
--set nfs.server=192.168.0.210 \
--set nfs.path=/

替换 deployment的 镜像 修改所有 namespace 为 nfs（里面有写死default）

kubectl create namespace nfs

kubectl apply -R -f ./nfs-client-provisioner -n nfs
```

