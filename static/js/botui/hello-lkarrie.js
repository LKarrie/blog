var botui = new BotUI("hello-lkarrie");

botui.message
  .add({
    delay: 800,
    content: "Hi, there👋",
  })
  .then(function () {
    botui.message
      .add({
        delay: 1100,
        content: "这里是 LKarrie",
      })
      .then(function () {
        botui.message
          .add({
            delay: 1100,
            content: "一个整天不务正业的二次元傻卵 :(",
          })
          .then(function () {
            botui.action
              .button({
                delay: 1600,
                action: [
                  {
                    text: "然后呢？ 😃",
                    value: "sure",
                  },
                  {
                    text: "少废话！ 🙄",
                    value: "skip",
                  },
                ],
              })
              .then(function (a) {
                "sure" == a.value && sure();
                "skip" == a.value && end();
              });
          });
      });
  });
var sure = function () {
    botui.message
      .add({
        delay: 1600,
        content: "😘",
      })
      .then(function () {
        secondpart();
      });
  },
  end = function () {
    botui.message.add({
      delay: 1600,
      content: "![...](https://image.lkarrie.com/images/2022/03/31/emoticon2.gif)",
    });
  },
  secondpart = function () {
    botui.message
      .add({
        delay: 1600,
        content: "目前在沪国摸爬滚打中xD",
      })
      .then(function () {
        botui.message
          .add({
            delay: 1600,
            content: "即使白天忙的和帕鲁一样,也不能妨碍我天天深夜coding! (gaming",
          })
          .then(function () {
            botui.message
              .add({
                delay: 1600,
                content: "就算生活被工作塞满,也总要忙里偷闲整整自己喜欢的事嘛:P",
              })
              .then(function () {
                botui.message
                  .add({
                    delay: 1700,
                    content: "就是瞎写写捣鼓点自己感兴趣的东西啦",
                  })
                  .then(function () {
                    botui.message
                      .add({
                        delay: 2000,
                        content: "啥都摸摸学学,希望有一天能够被称为大佬(做梦",
                      })
                      .then(function () {
                        botui.action
                          .button({
                            delay: 1600,
                            action: [
                              {
                                text: "为什么叫LKarrie呢? 🤔",
                                value: "why-LKarrie",
                              },
                            ],
                          })
                          .then(function (a) {
                            thirdpart();
                          });
                      });
                  });
              });
          });
      });
  },
  thirdpart = function () {
    botui.message
      .add({
        delay: 1e3,
        content: "It's just a name for me,类似姓名的音译和缩写咯",
      })
      .then(function () {
        botui.message
          .add({
            delay: 1600,
            content: "(起名真是件有难度的事情",
          })
          .then(function () {
            botui.action
              .button({
                delay: 1600,
                action: [
                  {
                    text: "为什么Blog Header里又叫自己小杂鱼? 🤔",
                    value: "why-fish",
                  },
                ],
              })
              .then(function () {
                fourthpart();
              });
          });
      });
  },
  fourthpart = function () {
    botui.message
      .add({
        delay: 1e3,
        content: "因为我是noob...",
      })
      .then(function () {
        botui.message
          .add({
            delay: 1600,
            content: "而且我很喜欢吃的一道菜叫红烧杂鱼~",
          })
          .then(function () {
            botui.message
              .add({
                delay: 1600,
                content: "嘻嘻,所以就自称小杂鱼咯",
              })
              .then(function () {
                botui.message.add({
                  delay: 2000,
                  content: "嘛,大概就是这么多啦,希望你能喜欢我的Blog~",
                });
              });
          });
      });
  };
