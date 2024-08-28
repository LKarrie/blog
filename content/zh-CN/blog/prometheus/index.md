---
title: Prometheus PromQL
date: 2024-08-23T19:45:00.000Z
lastmod: 2024-08-23T19:45:00.000Z
description: Prometheus 备忘录~
tags: [ "Prometheus" ]
categories : [ "K8S" ]
lazyBanner : "/imglazy/blog/defaultbanner-lazy.webp"
banner : "/img/blog/defaultbanner.webp"
lazyCardImg : "/imglazy/blog/prometheus-lazy.webp"
cardImg : "/img/blog/prometheus.webp"
---

# 🎉

文章封面来自[殘夜 ZANYA-✨](https://www.pixiv.net/artworks/113134444)

啊，我还活着，今年真是不大行捏，忙忙忙又要工作咯，我是超级牛马...

水水点今年的笔记，备忘一下

主要想Share和Backup一些Prometheus相关东西

实际用的时候要写很多很多的告警表达式... 忘了估计以后再想还挺麻烦的🤮

先整理了PromQL的知识，因为最常用，后面抽个空把当前工作Prometheus的知识遗产也收集收集再完善一下这篇备忘录 :D




## Prometheus

（待补充，后面打算补充一些服务端部署运维...

## PromQL

### 基础

引用一些基础文档，方便查阅

[官方文档-基础](https://prometheus.io/docs/prometheus/latest/querying/basics/)

[官方文档-所有函数](https://prometheus.io/docs/prometheus/latest/querying/functions/)

[PromQL-Playground](https://demo.promlens.com/)

[很好学习的文章](https://chanjarster.github.io/post/p8s-step-param/)

#### 指标类型

* Gauge
* Counter
* ...

#### 查询返回类型

##### 瞬时向量

瞬时向量（Instant vector）：一个key对应一个value

查询返回的都是瞬时向量，都是返回指标的最新值，例如

```text
http_requests_total
http_requests_total{job="prometheus",group="canary"}
```

也可以通过反向或者正则匹配标签（label）计算，例如

=：选择与提供的字符串完全相等的标签

!=：选择不等于提供的字符串的标签

=~：选择与提供的字符串正则表达式匹配的标签

!~：选择与提供的字符串不正则匹配的标签

```text
http_requests_total{environment=~"staging|testing|development",method!="GET"}
http_requests_total{replica!="rep-a",replica=~"rep.*"}
```

##### 范围向量

范围向量（Range vector）：一个key对应一组value

查询返回的都是范围向量，都是返回这个指标在对应时间范围内采集的所有值，例如

```text
http_requests_total{job="prometheus"}[5m]
```

#### 时间长度

向量的时间长度单位有

- ms- 毫秒
- s- 秒
- m- 分钟
- h- 小时
- d- 天 - 假设一天总是有 24 小时
- w- 周 - 假设一周总是有 7 天
- y- 年 - 假设一年总是 365 天

时间长度可以通过连接来组合，且必须从最大到最小的顺序排列，单位只能出现一次，例如1h30m

#### 偏移（offset）

可以使用 偏移修饰符（offset） 对瞬时向量进行基于当前时间偏移的查询，例如

```text
# 5m前 http_requests_total的值
http_requests_total offset 5m

# 注意 offset 要紧跟指标的选择器 也就是大括号 {}
sum(http_requests_total{method="GET"} offset 5m) 
```

对于范围向量也可以使用偏移，例如

```text
# 一周前 http_requests_total 五分钟内的每秒请求数
rate(http_requests_total[5m] offset 1w)
```

查询过去指标时，可以有负偏移，向前计算，例如

```text
rate(http_requests_total[5m] offset -1w)
```

#### 修改查询时间（@）

返回特定时间的指标结果，仅记录不常用

```text
# 返回 http_requests_total 在 2021-01-04T07:40:00+00:00 时的值
http_requests_total @ 1609746000
# 返回 http_requests_total 在 2021-01-04T07:40:00+00:00 时五分钟内的速率
rate(http_requests_total[5m] @ 1609746000)
# 下面两个查询结果相同
# offset after @
http_requests_total @ 1609746000 offset 5m
# offset before @
http_requests_total offset 5m @ 1609746000
```

#### 子查询

子查询是针对给定时间范围和精度，返回范围向量的查询结果

如下的表达式，返回过去 30 分钟内指标的5 分钟[速率](https://prometheus.io/docs/prometheus/latest/querying/functions/#rate)prometheus_http_requests_total{handler="/-/ready"}，步长（Resolution）为 1 分钟

```text
# 通俗一点解释：
# 通过子查询 [30m:1m] 指定在过去 30m 的时间段内，以一分钟为间隔切割出 30个瞬时时刻，然后在这个每个时刻获取之前五分钟内所有 prometheus_http_requests_total 这个counter的样本值，然后再进行 rate 函数的速率计算，算出当前时点每秒的请求数，最后返回，所以也是返回了一个 range 向量，一共30个值
rate(prometheus_http_requests_total{handler="/-/ready"}[5m])[30m:1m]
```

![image-subquery](https://image.lkarrie.com/images/2024/08/28/image-subquery.png)

### 运算符

#### 算数二元运算

Prometheus 中存在以下二元算术运算符：

- \+ (addition)
- \- (subtraction)
- \* (multiplication)
- / (division)
- % (modulo)
- ^ (power/exponentiation)

多数进行的指标和标量（scalars，固定数值，比如+1，1就称作标量）、指标和指标之间的运算

指标和标量：

指标的值和标量进行，加减乘除等运算

指标和指标：

如果两个指标的label匹配，可以直接进行值的运算，如果左侧的指标在右侧指标无法找到对应 label 相同的指标则直接会被丢弃，在包含在运算结果中

```text
http_request_size_bytes_sum / http_request_size_bytes_count
```

#### 比较二元操作

Prometheus 中存在以下二元比较运算符：

- == (equal)
- != (not-equal)
- \> (greater-than)
- < (less-than)
- \>= (greater-or-equal)
- <= (less-or-equal)

多数进行的指标和标量、指标和之间的运算

计算和方式和计算二元操作类似，例如

```text
# 返回小于 20 的值
http_request_total < 20

# 返回值 如果 小于 20 返回会 1 大于 20 返回 0
http_request_total < bool 20

# 两个瞬时向量比较 只会比较 label相同的指标
http_request_size_bytes_sum < http_request_size_bytes_count
```

#### 逻辑二元操作

Prometheus 中存在以下逻辑运算符（仅在瞬时向量之间使用）：

- and (intersection)
- or (union)
- unless (complement)

简单举例

```text
# 交集
http_request_total < 20 and http_request_total < 40
# 并集
http_request_total < 20 or http_request_total > 40000
# 补集（属于第一个集合但是不在第二个集合中）
http_request_total < 1234 unless http_request_total > 20
```

#### 向量匹配

向量之间的运算会尝试在右侧向量中为左侧的每个指标找到匹配元素

```text
# 例如指标
# http_request_total_A 存在如下 label 的指标
http_requests_total_A{replica="rep-a"}
http_requests_total_A{replica="rep-b"}
# http_request_total_B 存在如下 label 的指标
http_requests_total_B{replica="rep-a"}
http_requests_total_B{replica="rep-b"}
# 无论是做 算数还是比较运算 都只会自动匹配 label 相同的指标进行运算
# 例如
http_request_total_A / http_request_total_B
# 则是自动匹配计算
http_requests_total_A{replica="rep-a"} / http_requests_total_B{replica="rep-a"}
http_requests_total_A{replica="rep-b"} / 
http_requests_total_B{replica="rep-b"}
```

匹配行为有两种基本类型：一对一 和 多对一或一对多

可以通过如下的匹配关键字，让不同标签的向量进行一对一匹配

- on
- ignoring

```text
# 例如
http_errors{method="get", code="500"}  24
http_errors{method="get", code="404"}  30

http_errors{method="put", code="501"}  3

http_errors{method="post", code="500"} 6

http_errors{method="post", code="404"} 21

http_requests{method="get"}  600
http_requests{method="del"}  34
http_requests{method="post"} 120

# 可进行如下查询
http_errors{code="500"} / ignoring(code) http_requests
# 得到
{method="get"}  0.04            //  24 / 600
{method="post"} 0.05            //   6 / 120
# 由于右侧的指标并不包含 code 的标签所以 必须使用 ignoring(code) 进行忽略 再计算
```

可以通过如下的组修饰符实现多对一或一对多的向量匹配

- group_left
- group_right

```text
# 例如
http_errors{method="get", code="500"}  24
http_errors{method="get", code="404"}  30
http_errors{method="put", code="501"}  3
http_errors{method="post", code="500"} 6
http_errors{method="post", code="404"} 21

http_requests{method="get"}  600
http_requests{method="del"}  34
http_requests{method="post"} 120

# 可进行如下查询
http_errors / ignoring(code) group_left 标记左侧基数大 http_requests
# 得到
{method="get", code="500"}  0.04            //  24 / 600
{method="get", code="404"}  0.05            //  30 / 600
{method="post", code="500"} 0.05            //   6 / 120
{method="post", code="404"} 0.175           //  21 / 120
# 由于左侧未指定 code 
# 每种 method 对应的左侧的指标会多（http_errors method="get" code 既有500也有404 无法自动实现一对一的匹配）
# 使用 group_left 标记左侧基数大 再计算每种code的method 占总数的百分比
```

#### 聚合运算符

Prometheus 支持以下内置聚合运算符，可用于聚合瞬时向量，生成新向量：

- sum（计算维度总和）
- min（选择最小）
- max（选择最大）
- avg（计算各个维度的平均值）
- group
- stddev（计算维度上的总体标准差）
- stdvar（计算各维度的总体标准方差）
- count（计算向量中的元素数量）
- count_values（计算具有相同值的元素数量）
- bottomk（按样本值最小的 k 个元素）
- topk（按样本值排序的最大 k 个元素）
- quantile（计算维度上的 φ 分位数 (0 ≤ φ ≤ 1)）

```text
# 例如
# 下面两种计算是相同的
sum without (instance) (http_requests_total)
sum by (application, group) (http_requests_total)

# 计算不同 version 的个数
count_values("version", build_version)

# 获取 top 5 http请求数
topk(5, http_requests_total)
```

### 函数

> 下面的函数测试计算均可以在 https://demo.promlens.com/ 进行测试，例如 [absent(up{job="some-job"})](https://demo.promlens.com/?q=absent(up%7Bjob%3D%22some-job%22%7D))

abs()

取指标绝对值

absent()

判断指标是否存在

```text
# up{job="some-job"} 是个空查询
# 如下查询值为 1
absent(up{job="some-job"})
# 如果传递给 absent 存在查询结果则返回空
absent(up{job="cadvisor"})
```

absent_over_time()

类似 absent() 判断一段时间内是否存在指标丢失

```text
absent_over_time(up{job="docker-hub-exporter"}[5m])
```

ceil()

四舍五入

changes()

指定时间范围的变化次数

```text
# 计算过去30分钟内 每隔一分钟 平均五分钟内 速率变化次数 
changes(rate(prometheus_http_requests_total{handler="/-/ready"}[5m])[30m:1m])
```

clamp()

限制样本的最大最小值

clamp_max()

限制样本的最大值

clamp_min()

限制样本的最小值

day_of_month()

返回日期（UTC时间，当前时间是每个月第几号）返回值从 1 到 31

day_of_week()

返回星期（UTC时间，当前时间是每个周的周几）返回值从 0 到 6，其中 0 表示星期日等

day_of_year()

返回当前时间是一年中的第几天

days_in_month()

返回当前月的月份天数，返回值从 28 到 31

delta()

返回给定范围向量的差值

```text
# 计算过去30分钟内 每隔一分钟 平均五分钟的速率 的差值
delta(rate(prometheus_http_requests_total{handler="/-/ready"}[5m])[30m:1m])
```

deriv()

算导数

exp()

算指数

floor()

向下取整

histogram_avg()

histogram_count()

histogram_sum()

histogram_fraction()

histogram_quantile()

holt_winters()

hour()

idelta()

increase()

取增量

irate()

每秒增长率，基于最近两点的数据计算，绘制突出"陡峭"变化的图表使用

label_join()

label_replace()

ln()

对数

log2()

二进制

log10()

十进制

minute()

返回分钟数

month()

返回月份

predict_linear()

rate()

每秒增长率

resets()

round()

四舍五入

scalar()

sgn()

判断正负

sort()

排序

sort_desc()

排序降序

sort_by_label()

排序按标签

sort_by_label_desc()

排序按标签降序

sqrt()

平方根

time()

秒数

timestamp()

时间戳

vector()

year()

返回年份

## 常用指标

（待补充，记录一些现成的告警规则，图表表达式...