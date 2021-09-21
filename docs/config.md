# 设置文件介绍

一个默认的设置文件应该如下

```json
{
    "mirai": {
        "host": "http://127.0.0.1:8080",
        "verifyKey": "",
        "qq": 123456,
        "enableWebsocket": false
    },
    "bot": {
        "admin": 0,
        "needAt": true,
        "listenMode": 0,
        "greet": "哈喽，我准备聊天了！",
        "debug": false,
        "tulingBot": {
            "enable": true,
            "apikey": "",
            "chatLimit": 50,
            "refuse": "今天聊得太多了，明天再聊吧～"
        },
        "picSearcher": {
            "enable": true,
            "saucenaoApiKey": "",
            "saucenaoDB": "all",
            "searchLimit": 20,
            "refuse": "今日搜图次数达已上限，存着明天再搜吧～",
            "setSimilarity": 75
        },
        "setu": {
            "enable": true,
            "apikey": "",
            "r18": false,
            "thumbnail": true,
            "refuse": "年轻人要懂得要节制喔",
            "limit": 30,
            "recall": 60,
            "reg": "^[来來发發给給][张張个個幅点點份]?(?<r18>[Rr]18的?)?(?<keyword>.*?)?的?[色瑟][图圖]"
        },
        "bilibili": {
            "enable": true
        }
    }
}
```

## mirai 分支（连接相关）

- host——mirai-api-http 的地址和端口，默认是 `http://127.0.0.1:8080`
- verifyKey——mirai-api-http 的 verifyKey（建议手动指定）
- qq——当前 BOT 对应的 QQ 号
- enableWebsocket——是否启用 Websocket（需要和 mirai-api-http 的设置一致）

## bot 分支（机器人设置相关）

- admin——管理员 QQ（一般为你的 QQ，机器人连接成功后会发送消息到此 QQ 上）
- needAt——触发机器人聊天、搜图、色图是否需要 @（不影响反哔哩哔哩小程序）
- listenMode——监听规则（0-监听所有消息，1-只监听好友消息，2-只监听群消息）
- greet——机器人连接成功后向管理员发送的消息
- debug——是否开启 debug 模式，此选项会在控制台内显示每次聊天发送和接受具体消息

### tulingBot 分支

- enable——是否启用图灵机器人
- apiKey——你在图灵机器人官网申请的 Api Key
- chatLimit——每个 QQ 每天最高聊天次数限制（若为 0 则不限制）
- refuse——达到聊天次数上限后触发的回复

### picSearcher 分支

- enable——是否启用搜图（若启用，则机器人会对接收的图片进行搜图而不会发送给图灵）
- saucenaoApiKey——你在 saucenao 申请的 Api Key
- saucenaoDB——选择 saucenao 搜图所用的 数据库，可为"all"|"pixiv"|"danbooru"|"doujin"|"anime"
- searchLimit——每个 QQ 每天最高搜图次数限制（若为 0 则不限制）
- refuse——达到聊天次数上限后触发的回复
- setSimilarity——设定相似度阈值，当相似度大于这个阈值则回复一个最高的搜索结果，否则回复所有的三个搜索结果

### setu 分支

- enable——是否启用色图
- apikey——你的 lolicon apikey
- r18——是否允许获取 r18 色图，若设为 `false` r18 请求会以普通色图回应
- thumbnail——是否以缩略图回复
- refuse——达到次数上限后触发的回复
- limit——每个 QQ 每天最高获取色图次数限制（若为 0 则不限制）
- recall——在多少秒后撤回色图，设为 `0` 则为不撤回
- reg——正则表达式设置

### bilibili 分支

- enable——是否启用哔哩哔哩模块（包括从小程序和直链获取视频信息）
