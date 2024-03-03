---
title: K3S嵌入式etcd数据回滚
date: 2022-05-05T12:40:00.000Z
lastmod: 2022-05-05T12:40:00.000Z
description: K3S etcd数据回滚~
tags: [ "K3S","ETCD" ]
categories : [ "K8S" ]
lazyBanner : "/imglazy/blog/defaultbanner-lazy.webp"
banner : "/img/blog/defaultbanner.webp"
lazyCardImg : "/imglazy/blog/k3s-etcd-rollback-lazy.webp"
cardImg : "/img/blog/k3s-etcd-rollback.webp"
---

## 🐈

文章封面来自[殘夜 ZANYA-🌟](https://www.pixiv.net/artworks/111911654)

## 悲报

前几天因为工作原因，在自己的公网服务器上做了一些测试，手贱不小心把Traefik CRD资源给改了... 好家伙网关就直接寄了，网站全挂了

很好，相关的yaml我还没做备份，没办法只能直接对etcd数据库进行回滚了

不过还好我用的K3S，etcd数据库有自动的定时备份功能

整理一篇博，也算是提醒自己吧，操作yaml的时候慎用删除或强制覆盖，三思而后行啊，还好坏的不是公司里面的环境

## K3S单节点ETCD数据回滚

如果你用的外部数据库存储比如mysql啥的，直接就给数据库备份恢复就行

嵌入式BD的存储形式的回滚，官方有相关介绍文档，如下

[Backup and Restore with Embedded etcd Datastore (Experimental)](https://rancher.com/docs/k3s/latest/en/backup-restore/)

默认K3S数据存储位置在 **/var/lib/rancher/k3s/server** ，如果你和我一样修改了默认存储位置记得换目录去找

在默认情况下，集群数据会自动创建快照，存储的位置在 **${data-dir}/server/db/snapshots** 目录下

```console
[root@lkarrie db]# pwd
/k3s/data/server/db
[root@lkarrie db]# ls
etcd  etcd-old-1650961622  fixdb20220426  snapshots
[root@lkarrie db]# cd snapshots/
[root@lkarrie snapshots]# ls
etcd-snapshot-lkarrie-1651507200  etcd-snapshot-lkarrie-1651550400  etcd-snapshot-lkarrie-1651593600  etcd-snapshot-lkarrie-1651636800  etcd-snapshot-lkarrie-1651680000
[root@lkarrie snapshots]# 
```

重置集群的命令其实很简单，停止K3后，运行重置命令，指定一下备份快照的文件位置，最后手动重启一下K3即可

```markdown
# 默认安装目录情况下
./k3s server \
  --cluster-reset \
  --cluster-reset-restore-path=<PATH-TO-SNAPSHOT>
```

```markdown
# 修改存储目录的情况下
./k3s server \
  --cluster-reset \
  --cluster-reset-restore-path=<PATH-TO-SNAPSHOT>
  --data-dir <PATH-TO-DATA-DIR>
```

当从快照中重置集群之后，重置前的集群数据会移动到 **${data-dir}/server/db/etcd-old/ **目录下

下面是我的一些操作命令和终端记录

```markdown
# 先停止服务
systemctl stop k3s
# 从快照中恢复集群数据
./k3s server --cluster-reset --cluster-reset-restore-path=/k3s/data/server/db/snapshots/etcd-snapshot-lkarrie-1650772800 --data-dir /k3s/data
# 启动服务
systemctl start k3s
```

```console
[root@lkarrie bin]# systemctl stop k3s
[root@lkarrie bin]# ./k3s server --cluster-reset --cluster-reset-restore-path=/k3s/data/server/db/snapshots/etcd-snapshot-lkarrie-1650772800 --data-dir /k3s/data
WARN[2022-04-26T16:26:57.712487980+08:00] remove /k3s/data/agent/etc/k3s-agent-load-balancer.json: no such file or directory 
WARN[2022-04-26T16:26:57.712596593+08:00] remove /k3s/data/agent/etc/k3s-api-server-agent-load-balancer.json: no such file or directory 
INFO[2022-04-26T16:26:57.713511632+08:00] Starting k3s v1.21.7+k3s1 (ac705709)         
INFO[2022-04-26T16:26:57.714952308+08:00] Managed etcd cluster bootstrap already complete and initialized 
{"level":"info","ts":"2022-04-26T16:26:58.469+0800","caller":"embed/etcd.go:117","msg":"configuring peer listeners","listen-peer-urls":["http://localhost:2380"]}
{"level":"info","ts":"2022-04-26T16:26:58.469+0800","caller":"embed/etcd.go:127","msg":"configuring client listeners","listen-client-urls":["http://127.0.0.1:2399"]}
{"level":"info","ts":"2022-04-26T16:26:58.470+0800","caller":"embed/etcd.go:302","msg":"starting an etcd server","etcd-version":"3.4.13","git-sha":"Not provided (use ./build instead of go build)","go-version":"go1.16.10","go-os":"linux","go-arch":"amd64","max-cpu-set":8,"max-cpu-available":8,"member-initialized":true,"name":"default","data-dir":"/k3s/data/server/db/tmp-etcd","wal-dir":"","wal-dir-dedicated":"","member-dir":"/k3s/data/server/db/tmp-etcd/member","force-new-cluster":true,"heartbeat-interval":"500ms","election-timeout":"5s","initial-election-tick-advance":true,"snapshot-count":100000,"snapshot-catchup-entries":5000,"initial-advertise-peer-urls":["http://localhost:2380"],"listen-peer-urls":["http://localhost:2380"],"advertise-client-urls":["http://localhost:2379"],"listen-client-urls":["http://127.0.0.1:2399"],"listen-metrics-urls":[],"cors":["*"],"host-whitelist":["*"],"initial-cluster":"","initial-cluster-state":"new","initial-cluster-token":"","quota-size-bytes":2147483648,"pre-vote":false,"initial-corrupt-check":false,"corrupt-check-time-interval":"0s","auto-compaction-mode":"","auto-compaction-retention":"0s","auto-compaction-interval":"0s","discovery-url":"","discovery-proxy":""}
{"level":"info","ts":"2022-04-26T16:26:58.491+0800","caller":"etcdserver/backend.go:80","msg":"opened backend db","path":"/k3s/data/server/db/tmp-etcd/member/snap/db","took":"20.587845ms"}
{"level":"info","ts":"2022-04-26T16:26:59.305+0800","caller":"etcdserver/server.go:451","msg":"recovered v2 store from snapshot","snapshot-index":75000782,"snapshot-size":"62 kB"}
{"level":"info","ts":"2022-04-26T16:26:59.615+0800","caller":"mvcc/kvstore.go:380","msg":"restored last compact revision","meta-bucket-name":"meta","meta-bucket-name-key":"finishedCompactRev","restored-compact-revision":71852361}
{"level":"info","ts":"2022-04-26T16:26:59.641+0800","caller":"etcdserver/server.go:469","msg":"recovered v3 backend from snapshot","backend-size-bytes":78217216,"backend-size":"78 MB","backend-size-in-use-bytes":13664256,"backend-size-in-use":"14 MB"}
{"level":"info","ts":"2022-04-26T16:26:59.996+0800","caller":"etcdserver/raft.go:632","msg":"forcing restart member","cluster-id":"9c1e5c0132c26a17","local-member-id":"de86b2266eac1de6","commit-index":75008317}
{"level":"info","ts":"2022-04-26T16:26:59.997+0800","caller":"raft/raft.go:1530","msg":"de86b2266eac1de6 switched to configuration voters=(16034699401434504678)"}
{"level":"info","ts":"2022-04-26T16:26:59.997+0800","caller":"raft/raft.go:700","msg":"de86b2266eac1de6 became follower at term 144"}
{"level":"info","ts":"2022-04-26T16:26:59.997+0800","caller":"raft/raft.go:383","msg":"newRaft de86b2266eac1de6 [peers: [de86b2266eac1de6], term: 144, commit: 75008317, applied: 75000782, lastindex: 75008317, lastterm: 144]"}
{"level":"info","ts":"2022-04-26T16:26:59.997+0800","caller":"api/capability.go:76","msg":"enabled capabilities for version","cluster-version":"3.4"}
{"level":"info","ts":"2022-04-26T16:26:59.997+0800","caller":"membership/cluster.go:256","msg":"recovered/added member from store","cluster-id":"9c1e5c0132c26a17","local-member-id":"de86b2266eac1de6","recovered-remote-peer-id":"de86b2266eac1de6","recovered-remote-peer-urls":["https://172.19.116.104:2380"]}
{"level":"info","ts":"2022-04-26T16:26:59.997+0800","caller":"membership/cluster.go:269","msg":"set cluster version from store","cluster-version":"3.4"}
{"level":"warn","ts":"2022-04-26T16:26:59.998+0800","caller":"auth/store.go:1366","msg":"simple token is not cryptographically signed"}
{"level":"info","ts":"2022-04-26T16:26:59.999+0800","caller":"mvcc/kvstore.go:380","msg":"restored last compact revision","meta-bucket-name":"meta","meta-bucket-name-key":"finishedCompactRev","restored-compact-revision":71852361}
{"level":"info","ts":"2022-04-26T16:27:00.026+0800","caller":"etcdserver/quota.go:98","msg":"enabled backend quota with default value","quota-name":"v3-applier","quota-size-bytes":2147483648,"quota-size":"2.1 GB"}
{"level":"info","ts":"2022-04-26T16:27:00.027+0800","caller":"etcdserver/server.go:790","msg":"starting etcd server","local-member-id":"de86b2266eac1de6","local-server-version":"3.4.13","cluster-id":"9c1e5c0132c26a17","cluster-version":"3.4"}
{"level":"info","ts":"2022-04-26T16:27:00.027+0800","caller":"etcdserver/server.go:669","msg":"started as single-node; fast-forwarding election ticks","local-member-id":"de86b2266eac1de6","forward-ticks":9,"forward-duration":"4.5s","election-ticks":10,"election-timeout":"5s"}
{"level":"info","ts":"2022-04-26T16:27:00.030+0800","caller":"embed/etcd.go:244","msg":"now serving peer/client/metrics","local-member-id":"de86b2266eac1de6","initial-advertise-peer-urls":["http://localhost:2380"],"listen-peer-urls":["http://localhost:2380"],"advertise-client-urls":["http://localhost:2379"],"listen-client-urls":["http://127.0.0.1:2399"],"listen-metrics-urls":[]}
INFO[2022-04-26T16:27:00.030902332+08:00] Reconciling bootstrap data between datastore and disk 
{"level":"info","ts":"2022-04-26T16:27:00.031+0800","caller":"embed/etcd.go:579","msg":"serving peer traffic","address":"127.0.0.1:2380"}
{"level":"info","ts":"2022-04-26T16:27:01.999+0800","caller":"raft/raft.go:923","msg":"de86b2266eac1de6 is starting a new election at term 144"}
{"level":"info","ts":"2022-04-26T16:27:01.999+0800","caller":"raft/raft.go:713","msg":"de86b2266eac1de6 became candidate at term 145"}
{"level":"info","ts":"2022-04-26T16:27:01.999+0800","caller":"raft/raft.go:824","msg":"de86b2266eac1de6 received MsgVoteResp from de86b2266eac1de6 at term 145"}
{"level":"info","ts":"2022-04-26T16:27:01.999+0800","caller":"raft/raft.go:765","msg":"de86b2266eac1de6 became leader at term 145"}
{"level":"info","ts":"2022-04-26T16:27:01.999+0800","caller":"raft/node.go:325","msg":"raft.node: de86b2266eac1de6 elected leader de86b2266eac1de6 at term 145"}
{"level":"info","ts":"2022-04-26T16:27:01.999+0800","caller":"etcdserver/server.go:2039","msg":"published local member to cluster through raft","local-member-id":"de86b2266eac1de6","local-member-attributes":"{Name:default ClientURLs:[http://localhost:2379]}","request-path":"/0/members/de86b2266eac1de6/attributes","cluster-id":"9c1e5c0132c26a17","publish-timeout":"15s"}
{"level":"info","ts":"2022-04-26T16:27:02.000+0800","caller":"embed/serve.go:139","msg":"serving client traffic insecurely; this is strongly discouraged!","address":"127.0.0.1:2399"}
{"level":"info","ts":"2022-04-26T16:27:02.033+0800","caller":"embed/etcd.go:363","msg":"closing etcd server","name":"default","data-dir":"/k3s/data/server/db/tmp-etcd","advertise-peer-urls":["http://localhost:2380"],"advertise-client-urls":["http://localhost:2379"]}
{"level":"info","ts":"2022-04-26T16:27:02.033+0800","caller":"etcdserver/server.go:1485","msg":"skipped leadership transfer for single voting member cluster","local-member-id":"de86b2266eac1de6","current-leader-member-id":"de86b2266eac1de6"}
{"level":"warn","ts":"2022-04-26T16:27:02.033+0800","caller":"grpclog/grpclog.go:60","msg":"transport: http2Server.HandleStreams failed to read frame: read tcp 127.0.0.1:2399->127.0.0.1:43188: use of closed network connection"}
{"level":"warn","ts":"2022-04-26T16:27:02.034+0800","caller":"grpclog/grpclog.go:60","msg":"grpc: addrConn.createTransport failed to connect to {http://127.0.0.1:2399  <nil> 0 <nil>}. Err :connection error: desc = \"transport: Error while dialing dial tcp 127.0.0.1:2399: connect: connection refused\". Reconnecting..."}
{"level":"info","ts":"2022-04-26T16:27:02.055+0800","caller":"embed/etcd.go:558","msg":"stopping serving peer traffic","address":"127.0.0.1:2380"}
{"level":"info","ts":"2022-04-26T16:27:02.055+0800","caller":"embed/etcd.go:565","msg":"stopped serving peer traffic","address":"127.0.0.1:2380"}
{"level":"info","ts":"2022-04-26T16:27:02.055+0800","caller":"embed/etcd.go:367","msg":"closed etcd server","name":"default","data-dir":"/k3s/data/server/db/tmp-etcd","advertise-peer-urls":["http://localhost:2380"],"advertise-client-urls":["http://localhost:2379"]}
{"level":"warn","ts":"2022-04-26T16:27:02.151+0800","caller":"grpclog/grpclog.go:60","msg":"grpc: addrConn.createTransport failed to connect to {https://127.0.0.1:2379  <nil> 0 <nil>}. Err :connection error: desc = \"transport: Error while dialing dial tcp 127.0.0.1:2379: connect: connection refused\". Reconnecting..."}
INFO[2022-04-26T16:27:02.151992529+08:00] Pre-restore etcd database moved to /k3s/data/server/db/etcd-old-1650961622 
{"level":"info","msg":"restoring snapshot","path":"/k3s/data/server/db/snapshots/etcd-snapshot-lkarrie-1650772800","wal-dir":"/k3s/data/server/db/etcd/member/wal","data-dir":"/k3s/data/server/db/etcd","snap-dir":"/k3s/data/server/db/etcd/member/snap"}
{"level":"info","msg":"restored last compact revision","meta-bucket-name":"meta","meta-bucket-name-key":"finishedCompactRev","restored-compact-revision":70673831}
{"level":"info","msg":"added member","cluster-id":"fab63039fad5f70c","local-member-id":"0","added-peer-id":"c7c339b29d8306d0","added-peer-peer-urls":["https://172.19.116.104:2380"]}
{"level":"info","msg":"restored snapshot","path":"/k3s/data/server/db/snapshots/etcd-snapshot-lkarrie-1650772800","wal-dir":"/k3s/data/server/db/etcd/member/wal","data-dir":"/k3s/data/server/db/etcd","snap-dir":"/k3s/data/server/db/etcd/member/snap"}
{"level":"info","ts":"2022-04-26T16:27:02.902+0800","caller":"embed/etcd.go:117","msg":"configuring peer listeners","listen-peer-urls":["https://172.19.116.104:2380"]}
{"level":"info","ts":"2022-04-26T16:27:02.902+0800","caller":"embed/etcd.go:468","msg":"starting with peer TLS","tls-info":"cert = /k3s/data/server/tls/etcd/peer-server-client.crt, key = /k3s/data/server/tls/etcd/peer-server-client.key, trusted-ca = /k3s/data/server/tls/etcd/peer-ca.crt, client-cert-auth = true, crl-file = ","cipher-suites":[]}
{"level":"info","ts":"2022-04-26T16:27:02.902+0800","caller":"embed/etcd.go:127","msg":"configuring client listeners","listen-client-urls":["https://127.0.0.1:2379","https://172.19.116.104:2379"]}
{"level":"info","ts":"2022-04-26T16:27:02.903+0800","caller":"embed/etcd.go:302","msg":"starting an etcd server","etcd-version":"3.4.13","git-sha":"Not provided (use ./build instead of go build)","go-version":"go1.16.10","go-os":"linux","go-arch":"amd64","max-cpu-set":8,"max-cpu-available":8,"member-initialized":true,"name":"lkarrie-46d33e4d","data-dir":"/k3s/data/server/db/etcd","wal-dir":"","wal-dir-dedicated":"","member-dir":"/k3s/data/server/db/etcd/member","force-new-cluster":true,"heartbeat-interval":"500ms","election-timeout":"5s","initial-election-tick-advance":true,"snapshot-count":100000,"snapshot-catchup-entries":5000,"initial-advertise-peer-urls":["https://172.19.116.104:2380"],"listen-peer-urls":["https://172.19.116.104:2380"],"advertise-client-urls":["https://172.19.116.104:2379"],"listen-client-urls":["https://127.0.0.1:2379","https://172.19.116.104:2379"],"listen-metrics-urls":["http://127.0.0.1:2381"],"cors":["*"],"host-whitelist":["*"],"initial-cluster":"","initial-cluster-state":"new","initial-cluster-token":"","quota-size-bytes":2147483648,"pre-vote":false,"initial-corrupt-check":false,"corrupt-check-time-interval":"0s","auto-compaction-mode":"","auto-compaction-retention":"0s","auto-compaction-interval":"0s","discovery-url":"","discovery-proxy":""}
{"level":"info","ts":"2022-04-26T16:27:02.922+0800","caller":"etcdserver/backend.go:80","msg":"opened backend db","path":"/k3s/data/server/db/etcd/member/snap/db","took":"19.001742ms"}
{"level":"info","ts":"2022-04-26T16:27:02.923+0800","caller":"etcdserver/server.go:451","msg":"recovered v2 store from snapshot","snapshot-index":1,"snapshot-size":"6.5 kB"}
{"level":"info","ts":"2022-04-26T16:27:02.923+0800","caller":"mvcc/kvstore.go:380","msg":"restored last compact revision","meta-bucket-name":"meta","meta-bucket-name-key":"finishedCompactRev","restored-compact-revision":70673831}
{"level":"info","ts":"2022-04-26T16:27:02.941+0800","caller":"etcdserver/server.go:469","msg":"recovered v3 backend from snapshot","backend-size-bytes":78217216,"backend-size":"78 MB","backend-size-in-use-bytes":12595200,"backend-size-in-use":"13 MB"}
{"level":"info","ts":"2022-04-26T16:27:02.942+0800","caller":"etcdserver/raft.go:632","msg":"forcing restart member","cluster-id":"fab63039fad5f70c","local-member-id":"c7c339b29d8306d0","commit-index":1}
{"level":"info","ts":"2022-04-26T16:27:02.942+0800","caller":"raft/raft.go:1530","msg":"c7c339b29d8306d0 switched to configuration voters=(14394412273315808976)"}
{"level":"info","ts":"2022-04-26T16:27:02.943+0800","caller":"raft/raft.go:700","msg":"c7c339b29d8306d0 became follower at term 1"}
{"level":"info","ts":"2022-04-26T16:27:02.943+0800","caller":"raft/raft.go:383","msg":"newRaft c7c339b29d8306d0 [peers: [c7c339b29d8306d0], term: 1, commit: 1, applied: 1, lastindex: 1, lastterm: 1]"}
{"level":"info","ts":"2022-04-26T16:27:02.943+0800","caller":"membership/cluster.go:256","msg":"recovered/added member from store","cluster-id":"fab63039fad5f70c","local-member-id":"c7c339b29d8306d0","recovered-remote-peer-id":"c7c339b29d8306d0","recovered-remote-peer-urls":["https://172.19.116.104:2380"]}
{"level":"warn","ts":"2022-04-26T16:27:02.944+0800","caller":"auth/store.go:1366","msg":"simple token is not cryptographically signed"}
{"level":"info","ts":"2022-04-26T16:27:02.945+0800","caller":"mvcc/kvstore.go:380","msg":"restored last compact revision","meta-bucket-name":"meta","meta-bucket-name-key":"finishedCompactRev","restored-compact-revision":70673831}
{"level":"info","ts":"2022-04-26T16:27:02.973+0800","caller":"etcdserver/server.go:803","msg":"starting etcd server","local-member-id":"c7c339b29d8306d0","local-server-version":"3.4.13","cluster-version":"to_be_decided"}
{"level":"info","ts":"2022-04-26T16:27:02.973+0800","caller":"etcdserver/server.go:669","msg":"started as single-node; fast-forwarding election ticks","local-member-id":"c7c339b29d8306d0","forward-ticks":9,"forward-duration":"4.5s","election-ticks":10,"election-timeout":"5s"}
{"level":"info","ts":"2022-04-26T16:27:02.974+0800","caller":"embed/etcd.go:711","msg":"starting with client TLS","tls-info":"cert = /k3s/data/server/tls/etcd/server-client.crt, key = /k3s/data/server/tls/etcd/server-client.key, trusted-ca = /k3s/data/server/tls/etcd/server-ca.crt, client-cert-auth = true, crl-file = ","cipher-suites":[]}
{"level":"info","ts":"2022-04-26T16:27:02.974+0800","caller":"embed/etcd.go:579","msg":"serving peer traffic","address":"172.19.116.104:2380"}
{"level":"info","ts":"2022-04-26T16:27:02.974+0800","caller":"embed/etcd.go:244","msg":"now serving peer/client/metrics","local-member-id":"c7c339b29d8306d0","initial-advertise-peer-urls":["https://172.19.116.104:2380"],"listen-peer-urls":["https://172.19.116.104:2380"],"advertise-client-urls":["https://172.19.116.104:2379"],"listen-client-urls":["https://127.0.0.1:2379","https://172.19.116.104:2379"],"listen-metrics-urls":["http://127.0.0.1:2381"]}
{"level":"info","ts":"2022-04-26T16:27:02.974+0800","caller":"embed/etcd.go:781","msg":"serving metrics","address":"http://127.0.0.1:2381"}
INFO[2022-04-26T16:27:02.975876136+08:00] Node token is available at /k3s/data/server/token 
INFO[2022-04-26T16:27:02.975926720+08:00] To join node to cluster: k3s agent -s https://172.19.116.104:6443 -t ${NODE_TOKEN} 
INFO[2022-04-26T16:27:02.992014496+08:00] Wrote kubeconfig /etc/rancher/k3s/k3s.yaml   
INFO[2022-04-26T16:27:02.992057374+08:00] Run: k3s kubectl                             
{"level":"warn","ts":"2022-04-26T16:27:03.035+0800","caller":"grpclog/grpclog.go:60","msg":"grpc: addrConn.createTransport failed to connect to {http://127.0.0.1:2399  <nil> 0 <nil>}. Err :connection error: desc = \"transport: Error while dialing dial tcp 127.0.0.1:2399: connect: connection refused\". Reconnecting..."}
{"level":"info","ts":"2022-04-26T16:27:03.444+0800","caller":"raft/raft.go:923","msg":"c7c339b29d8306d0 is starting a new election at term 1"}
{"level":"info","ts":"2022-04-26T16:27:03.444+0800","caller":"raft/raft.go:713","msg":"c7c339b29d8306d0 became candidate at term 2"}
{"level":"info","ts":"2022-04-26T16:27:03.444+0800","caller":"raft/raft.go:824","msg":"c7c339b29d8306d0 received MsgVoteResp from c7c339b29d8306d0 at term 2"}
{"level":"info","ts":"2022-04-26T16:27:03.444+0800","caller":"raft/raft.go:765","msg":"c7c339b29d8306d0 became leader at term 2"}
{"level":"info","ts":"2022-04-26T16:27:03.444+0800","caller":"raft/node.go:325","msg":"raft.node: c7c339b29d8306d0 elected leader c7c339b29d8306d0 at term 2"}
{"level":"info","ts":"2022-04-26T16:27:03.444+0800","caller":"etcdserver/server.go:2039","msg":"published local member to cluster through raft","local-member-id":"c7c339b29d8306d0","local-member-attributes":"{Name:lkarrie-46d33e4d ClientURLs:[https://172.19.116.104:2379]}","request-path":"/0/members/c7c339b29d8306d0/attributes","cluster-id":"fab63039fad5f70c","publish-timeout":"15s"}
{"level":"info","ts":"2022-04-26T16:27:03.445+0800","caller":"etcdserver/server.go:2530","msg":"setting up initial cluster version","cluster-version":"3.4"}
{"level":"info","ts":"2022-04-26T16:27:03.445+0800","caller":"embed/serve.go:191","msg":"serving client traffic securely","address":"127.0.0.1:2379"}
{"level":"info","ts":"2022-04-26T16:27:03.447+0800","caller":"embed/serve.go:191","msg":"serving client traffic securely","address":"172.19.116.104:2379"}
{"level":"info","ts":"2022-04-26T16:27:03.451+0800","caller":"membership/cluster.go:558","msg":"set initial cluster version","cluster-id":"fab63039fad5f70c","local-member-id":"c7c339b29d8306d0","cluster-version":"3.4"}
{"level":"info","ts":"2022-04-26T16:27:03.451+0800","caller":"etcdserver/server.go:2562","msg":"cluster version is updated","cluster-version":"3.4"}
INFO[2022-04-26T16:27:03.454632967+08:00] etcd data store connection OK                
INFO[2022-04-26T16:27:03.454678878+08:00] ETCD server is now running                   
INFO[2022-04-26T16:27:03.454716721+08:00] k3s is up and running                        
WARN[2022-04-26T16:27:03.467956536+08:00] bootstrap key already exists                 
INFO[2022-04-26T16:27:03.468003355+08:00] Saving current etcd snapshot set to k3s-etcd-snapshots ConfigMap 
{"level":"warn","ts":"2022-04-26T16:27:04.721+0800","caller":"grpclog/grpclog.go:60","msg":"grpc: addrConn.createTransport failed to connect to {http://127.0.0.1:2399  <nil> 0 <nil>}. Err :connection error: desc = \"transport: Error while dialing dial tcp 127.0.0.1:2399: connect: connection refused\". Reconnecting..."}
{"level":"warn","ts":"2022-04-26T16:27:07.627+0800","caller":"grpclog/grpclog.go:60","msg":"grpc: addrConn.createTransport failed to connect to {http://127.0.0.1:2399  <nil> 0 <nil>}. Err :connection error: desc = \"transport: Error while dialing dial tcp 127.0.0.1:2399: connect: connection refused\". Reconnecting..."}
WARN[2022-04-26T16:27:07.976387597+08:00] Deploy controller node name is empty or too long, and will not be tracked via server side apply field management 
INFO[2022-04-26T16:27:07.977682409+08:00] Failed to set etcd role label: Get "https://127.0.0.1:6444/apis/apiextensions.k8s.io/v1beta1/customresourcedefinitions": dial tcp 127.0.0.1:6444: connect: connection refused 
INFO[2022-04-26T16:27:08.003730820+08:00] Running load balancer 127.0.0.1:6444 -> [172.19.116.104:6443] 
INFO[2022-04-26T16:27:08.060932213+08:00] certificate CN=lkarrie signed by CN=k3s-server-ca@1639390613: notBefore=2021-12-13 10:16:53 +0000 UTC notAfter=2023-04-26 08:27:08 +0000 UTC 
INFO[2022-04-26T16:27:08.068368646+08:00] certificate CN=system:node:lkarrie,O=system:nodes signed by CN=k3s-client-ca@1639390613: notBefore=2021-12-13 10:16:53 +0000 UTC notAfter=2023-04-26 08:27:08 +0000 UTC 
INFO[2022-04-26T16:27:08.082011706+08:00] Module overlay was already loaded            
INFO[2022-04-26T16:27:08.082055391+08:00] Module nf_conntrack was already loaded       
INFO[2022-04-26T16:27:08.082062532+08:00] Module br_netfilter was already loaded       
INFO[2022-04-26T16:27:08.082076439+08:00] Module iptable_nat was already loaded        
INFO[2022-04-26T16:27:08.085511653+08:00] Logging containerd to /k3s/data/agent/containerd/containerd.log 
INFO[2022-04-26T16:27:08.085665555+08:00] Running containerd -c /k3s/data/agent/etc/containerd/config.toml -a /run/k3s/containerd/containerd.sock --state /run/k3s/containerd --root /k3s/data/agent/containerd 
{"level":"warn","ts":"2022-04-26T16:27:08.085+0800","caller":"grpclog/grpclog.go:60","msg":"grpc: addrConn.createTransport failed to connect to {/run/k3s/containerd/containerd.sock  <nil> 0 <nil>}. Err :connection error: desc = \"transport: Error while dialing dial unix /run/k3s/containerd/containerd.sock: connect: connection refused\". Reconnecting..."}
INFO[2022-04-26T16:27:09.093480532+08:00] Containerd is now running                    
INFO[2022-04-26T16:27:09.100226952+08:00] Connecting to proxy                           url="wss://172.19.116.104:6443/v1-k3s/connect"
ERRO[2022-04-26T16:27:09.103025389+08:00] Failed to connect to proxy                    error="websocket: bad handshake"
ERRO[2022-04-26T16:27:09.103062482+08:00] Remotedialer proxy error                      error="websocket: bad handshake"
{"level":"warn","ts":"2022-04-26T16:27:12.464+0800","caller":"grpclog/grpclog.go:60","msg":"grpc: addrConn.createTransport failed to connect to {http://127.0.0.1:2399  <nil> 0 <nil>}. Err :connection error: desc = \"transport: Error while dialing dial tcp 127.0.0.1:2399: connect: connection refused\". Reconnecting..."}
INFO[2022-04-26T16:27:12.992494645+08:00] Failed to set etcd role label: an error on the server ("apiserver not ready") has prevented the request from succeeding (get customresourcedefinitions.apiextensions.k8s.io) 
INFO[2022-04-26T16:27:14.103317697+08:00] Connecting to proxy                           url="wss://172.19.116.104:6443/v1-k3s/connect"
ERRO[2022-04-26T16:27:14.106110086+08:00] Failed to connect to proxy                    error="websocket: bad handshake"
ERRO[2022-04-26T16:27:14.106149743+08:00] Remotedialer proxy error                      error="websocket: bad handshake"
INFO[2022-04-26T16:27:14.111763063+08:00] Reconciling bootstrap data between datastore and disk 
INFO[2022-04-26T16:27:14.131912652+08:00] Etcd is running, restart without --cluster-reset flag now. Backup and delete ${datadir}/server/db on each peer etcd server and rejoin the nodes 
[root@lkarrie bin]# systemctl status k3s
● k3s.service - Lightweight Kubernetes
   Loaded: loaded (/etc/systemd/system/k3s.service; enabled; vendor preset: disabled)
   Active: inactive (dead) since 二 2022-04-26 16:26:55 CST; 35s ago
     Docs: https://k3s.io
  Process: 18197 ExecStart=/usr/local/bin/k3s server --data-dir /k3s/data --log /k3s/log/k3s.log --cluster-init (code=killed, signal=TERM)
  Process: 18195 ExecStartPre=/sbin/modprobe overlay (code=exited, status=0/SUCCESS)
  Process: 18193 ExecStartPre=/sbin/modprobe br_netfilter (code=exited, status=0/SUCCESS)
 Main PID: 18197 (code=killed, signal=TERM)
   Memory: 1.7G
   CGroup: /system.slice/k3s.service
           ├─ 3858 /var/lib/rancher/k3s/data/e61cd97f31a54dbcd9893f8325b7133cfdfd0229ff3bfae5a4f845780a93e84c/bin/containerd-shim-runc-v2 -namespace k8s.io -id 34406d57d4685602bfc7ad0af661f2aa810573297e3c35c3256f85...
           ├─ 3995 /var/lib/rancher/k3s/data/e61cd97f31a54dbcd9893f8325b7133cfdfd0229ff3bfae5a4f845780a93e84c/bin/containerd-shim-runc-v2 -namespace k8s.io -id 10c0725250ac1e5a03aedefb4bcd0ed9b49b6bceb6484e341dd2c8...
           ├─ 4192 /var/lib/rancher/k3s/data/e61cd97f31a54dbcd9893f8325b7133cfdfd0229ff3bfae5a4f845780a93e84c/bin/containerd-shim-runc-v2 -namespace k8s.io -id 0bf9b315f2903226e97fed0cf2f5fdcd0313a171a8e0952c21d0fb...
           ├─ 4404 /var/lib/rancher/k3s/data/e61cd97f31a54dbcd9893f8325b7133cfdfd0229ff3bfae5a4f845780a93e84c/bin/containerd-shim-runc-v2 -namespace k8s.io -id f7e4d76910607154259a2a4edfb789717fce7d02d26701973331e8...
           ├─ 4441 /var/lib/rancher/k3s/data/e61cd97f31a54dbcd9893f8325b7133cfdfd0229ff3bfae5a4f845780a93e84c/bin/containerd-shim-runc-v2 -namespace k8s.io -id b6ea04e61dd32faca123af66df4de23530be11d9ff5e3c6486418d...
           ├─ 4891 /var/lib/rancher/k3s/data/e61cd97f31a54dbcd9893f8325b7133cfdfd0229ff3bfae5a4f845780a93e84c/bin/containerd-shim-runc-v2 -namespace k8s.io -id 093b824a1ca25f9816ced09189c5b52beba805ba11a909fa793727...
           ├─ 4972 /var/lib/rancher/k3s/data/e61cd97f31a54dbcd9893f8325b7133cfdfd0229ff3bfae5a4f845780a93e84c/bin/containerd-shim-runc-v2 -namespace k8s.io -id 1607f9c74e27d594951bf0b46bee10c2fe1affc78a970b5ebce9c9...
           ├─ 5515 /var/lib/rancher/k3s/data/e61cd97f31a54dbcd9893f8325b7133cfdfd0229ff3bfae5a4f845780a93e84c/bin/containerd-shim-runc-v2 -namespace k8s.io -id 32db6bb11614f16e8d792dfb8d2226b8850eaed12c29dc6fe89cd0...
           ├─ 5569 /var/lib/rancher/k3s/data/e61cd97f31a54dbcd9893f8325b7133cfdfd0229ff3bfae5a4f845780a93e84c/bin/containerd-shim-runc-v2 -namespace k8s.io -id a94bedc25796db307d21ec84b90433afab24d495b5795d7ec0104a...
           ├─ 5639 /var/lib/rancher/k3s/data/e61cd97f31a54dbcd9893f8325b7133cfdfd0229ff3bfae5a4f845780a93e84c/bin/containerd-shim-runc-v2 -namespace k8s.io -id 0c134ab0ea58e81d1de472da63fecd4ec8c776c69cf1c115592003...
           ├─ 5658 /var/lib/rancher/k3s/data/e61cd97f31a54dbcd9893f8325b7133cfdfd0229ff3bfae5a4f845780a93e84c/bin/containerd-shim-runc-v2 -namespace k8s.io -id 5a64ac5d9aa415df53663acc369e681264d2e84f5079a5d482a666...
           ├─ 5670 /var/lib/rancher/k3s/data/e61cd97f31a54dbcd9893f8325b7133cfdfd0229ff3bfae5a4f845780a93e84c/bin/containerd-shim-runc-v2 -namespace k8s.io -id ce0476ed4e2c7488d65eb4b873f586efc67949c9e14f49290ea41d...
           ├─ 5726 /var/lib/rancher/k3s/data/e61cd97f31a54dbcd9893f8325b7133cfdfd0229ff3bfae5a4f845780a93e84c/bin/containerd-shim-runc-v2 -namespace k8s.io -id b0467a0328480d2df0c4ac050445c582b876230d902a063610ee3b...
           ├─ 5766 /var/lib/rancher/k3s/data/e61cd97f31a54dbcd9893f8325b7133cfdfd0229ff3bfae5a4f845780a93e84c/bin/containerd-shim-runc-v2 -namespace k8s.io -id c0cf374ad1fbb4353c881f19866653d5de35917d8c0510c57e1777...
           ├─ 6542 /var/lib/rancher/k3s/data/e61cd97f31a54dbcd9893f8325b7133cfdfd0229ff3bfae5a4f845780a93e84c/bin/containerd-shim-runc-v2 -namespace k8s.io -id 57694d76a15d4f61b69ed71146d8fb0fa33fa5620b8006fe21cc3d...
           ├─13868 /var/lib/rancher/k3s/data/e61cd97f31a54dbcd9893f8325b7133cfdfd0229ff3bfae5a4f845780a93e84c/bin/containerd-shim-runc-v2 -namespace k8s.io -id 149679469f480a739c5ca1b6a9868a9b4fa0fbfd57d68f1bf8ad95...
           ├─20154 /var/lib/rancher/k3s/data/e61cd97f31a54dbcd9893f8325b7133cfdfd0229ff3bfae5a4f845780a93e84c/bin/containerd-shim-runc-v2 -namespace k8s.io -id 096fa234681a0b762722b0c1ed76e89661d97031a9c7da8b834a3d...
           ├─21470 /var/lib/rancher/k3s/data/e61cd97f31a54dbcd9893f8325b7133cfdfd0229ff3bfae5a4f845780a93e84c/bin/containerd-shim-runc-v2 -namespace k8s.io -id 1b41c2b20c966f8ec47c3fb0c6e4520fa30921f99cb58a7bdb23d5...
           ├─22357 /var/lib/rancher/k3s/data/e61cd97f31a54dbcd9893f8325b7133cfdfd0229ff3bfae5a4f845780a93e84c/bin/containerd-shim-runc-v2 -namespace k8s.io -id e7a50edb5eba41a04f6c4c1a13f7cf51befde95466925e8a1412d0...
           ├─23779 /var/lib/rancher/k3s/data/e61cd97f31a54dbcd9893f8325b7133cfdfd0229ff3bfae5a4f845780a93e84c/bin/containerd-shim-runc-v2 -namespace k8s.io -id e1865fe3bde9c7cfe89a1c208c879a8b723f0667d70ee0b9396994...
           ├─24129 /var/lib/rancher/k3s/data/e61cd97f31a54dbcd9893f8325b7133cfdfd0229ff3bfae5a4f845780a93e84c/bin/containerd-shim-runc-v2 -namespace k8s.io -id 7fb4bdbc446fbcb0b3ace5efde4cafc74412e2ac04cdf96dfac753...
           ├─24716 /var/lib/rancher/k3s/data/e61cd97f31a54dbcd9893f8325b7133cfdfd0229ff3bfae5a4f845780a93e84c/bin/containerd-shim-runc-v2 -namespace k8s.io -id 54b8285a4adb24b7b33d0577063b835d7f500f422fc7ad494b1e60...
           ├─24784 /var/lib/rancher/k3s/data/e61cd97f31a54dbcd9893f8325b7133cfdfd0229ff3bfae5a4f845780a93e84c/bin/containerd-shim-runc-v2 -namespace k8s.io -id ae1bc5c47c3328b231c7e649f9c724b5237ea995aeca12cd23079d...
           ├─27118 /var/lib/rancher/k3s/data/e61cd97f31a54dbcd9893f8325b7133cfdfd0229ff3bfae5a4f845780a93e84c/bin/containerd-shim-runc-v2 -namespace k8s.io -id c88c2eb00c09b4dcca1f052eb85056f8f8dddfd24db5bf50c4525d...
           ├─27163 /var/lib/rancher/k3s/data/e61cd97f31a54dbcd9893f8325b7133cfdfd0229ff3bfae5a4f845780a93e84c/bin/containerd-shim-runc-v2 -namespace k8s.io -id 361d9087001c4340ec34e83c1df9999a822ba22b7cac84e8ee7dc6...
           └─31258 /var/lib/rancher/k3s/data/e61cd97f31a54dbcd9893f8325b7133cfdfd0229ff3bfae5a4f845780a93e84c/bin/containerd-shim-runc-v2 -namespace k8s.io -id 1a4168d5ac6ff23179fb6cb082fd1be622cc5dc023e118bc87111c...

4月 26 16:22:25 lkarrie systemd[1]: Starting Lightweight Kubernetes...
4月 26 16:22:26 lkarrie systemd[1]: Started Lightweight Kubernetes.
4月 26 16:26:55 lkarrie systemd[1]: Stopping Lightweight Kubernetes...
4月 26 16:26:55 lkarrie systemd[1]: Stopped Lightweight Kubernetes.
[root@lkarrie bin]# systemctl start k3s
```

## 碎碎念

一顿操作之后，网关终于正常了，网站也都恢复，亲测单节点K3S的嵌入式存储数据是可以通过上面的方法回滚的，对于K3S集群的话，可能和单节点有些不一样

在单节点运行结束后稍微提示了一下K3S集群的回滚方法

```console
INFO[2022-04-26T16:27:14.111763063+08:00] Reconciling bootstrap data between datastore and disk 
INFO[2022-04-26T16:27:14.131912652+08:00] Etcd is running, restart without --cluster-reset flag now. Backup and delete ${datadir}/server/db on each peer etcd server and rejoin the nodes 
```

看起来，集群的回滚方法是先要把所有主节点（有etcd角色）踢了（备份好${datadir}/server/db目录），然后在其中的"第一台"主节点上回滚，再重新部署一下其余master节点，猜测大概是这样

`集群回滚我没有进行实际的测试，单节点回滚数据的方法和上面的猜测对集群的情况仅供参考吧`，我也希望我永远不会做集群数据的回滚测试...

关键项目的 yaml 还是手动备份备份安心一点

希望线上集群永远正常稳定，阿门