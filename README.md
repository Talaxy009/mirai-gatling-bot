# mirai-gatling-bot

一个整合了搜图和聊天等功能的轻量 mirai 机器人

原本是打算移植 [cq-picsearcher-bot](https://github.com/Tsuk1ko/cq-picsearcher-bot) 到 mirai 框架上的，后来发现工作量实在是太太太大了！

于是乎就只移植部分我平时常用到的模块，并再退而求其次砍掉了诸如“缓存”和“指令”的功能（美其名曰：“轻量化”），随便也把自己之前写的图灵机器人的模块也加入进来了~ bong! mirai-gatling-bot 诞生！

为什么叫“加特林”？是因为我自用的机器人叫“加特灵”，本项目完成后加特灵就只用这一个项目来跑了，找不到更好的翻译就直接`gatling`了！

**注意**!

如果你使用 [go-cqhttp](https://github.com/Mrs4s/go-cqhttp) 并且想要更丰富的功能请直接选择 [cq-picsearcher-bot](https://github.com/Tsuk1ko/cq-picsearcher-bot)

本项目可能存在未知bug，有待完善

## 目前包含的功能

- [图灵机器人](http://www.turingapi.com/)
- [Saucenao 搜图](https://saucenao.com/)
- [Lolicon Api](https://api.lolicon.app/)
- 反哔哩哔哩小程序

## 使用方法

1. 克隆本项目 `git clone https://github.com/Talaxy009/mirai-gatling-bot.git`
2. 移动到本地仓库 `cd ./mirai-gatling-bot`
3. 安装依赖 `npm install`
4. 复制一份 `config.default.json` 修改名字为 `config.json` 后对其进行编辑，设置文件相关说明在此 → [点我](./docs/config.md)
5. 启动 `npm start`

## TODO

~~画线为已完成部分~~

- 移植 Ascii2d 图片搜索
- ~~移植 Lolicon Api~~
- ~~添加撤回 setu 功能~~
