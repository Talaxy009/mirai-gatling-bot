const process = require("process");
const config = require("./config.json");
const Mirai = require("node-mirai-sdk");
const TBot = require("./utils/tulingBot");
const Logger = require("./utils/logger");
const { Plain, At, Image, App } = Mirai.MessageComponent;
const { Out , GetTime } = require("./utils/utils");
const getBiliData = require("./utils/bilibili");
const doSearch = require("./utils/saucenao");
const bot = new Mirai(config.mirai);
const tulingBot = new TBot(config.bot.tulingBot.apikey);

let logger = new Logger();

// auth 认证
bot.onSignal("authed", () => {
	Out(`${GetTime()} 通过: ${bot.sessionKey} 认证中···`);
	bot.verify();
});

// session 校验回调
bot.onSignal("verified", () => {
	const messageChain = [Plain(config.bot.greet)];
	if (config.bot.admin) {
		bot.sendFriendMessage(messageChain, config.bot.admin);
	}
	Out(`${GetTime()} 通过: ${bot.sessionKey} 认证成功!\n`);
	if (config.bot.tulingBot.enable) {
		Out(`图灵机器人: 已启用\n\t聊天限制次数: ${config.bot.tulingBot.chatLimit}/QQ`);
	}
	if (config.bot.bilibili.enable) {
		Out("哔哩哔哩模块: 已启用");
	}
	if (config.bot.picSearcher.enable) {
		Out(`搜图: 已启用\n\t搜图限制次数: ${config.bot.picSearcher.searchLimit
		}/QQ\n\t所选 saucenao 数据库: ${config.bot.picSearcher.saucenaoDB}`);
	}
	Out(
		`是否需要@: ${config.bot.needAt ? "是" : "否"}\ndebug模式: ${config.bot.debug ? "是" : "否"}\n`
	);
	// 设置监听
	switch (config.bot.listenMode) {
		case 0:
			bot.listen("all");
			break;
		case 1:
			bot.listen("friend");
			break;
		case 2:
			bot.listen("group");
			break;
	}
});

bot.onMessage(main);

/**
 * 主函数
 * @param {Object} message mirai消息对象
 */
async function main(message) {
	const {
		type,
		sender,
		messageChain,
		reply,
		quoteReply
	} = message;

	// 提取消息内容
	let at = [];
	let imgs = [];
	let hasImg = false;
	let msg = "";
	let appContent = {};
	let hasBiliMsg = false;
	let replyType = false;
	let hit = true;
	messageChain.forEach((chain) => {
		switch (chain.type) {
			case "At":
				at.push(At.value(chain).target);
				break;
			case "Plain":
				msg += Plain.value(chain);
				if (config.bot.bilibili.enable &&
					msg.includes("www.bilibili.com/video/")) {
					appContent = Plain.value(chain);
					hasBiliMsg = true;
				}
				break;
			case "Image":
				imgs.push(Image.value(chain).url);
				hasImg = true;
				break;
			case "App":
				appContent = JSON.parse(App.value(chain));
				if (config.bot.bilibili.enable &&
					appContent.desc === "哔哩哔哩") {
					hasBiliMsg = true;
				}
				break;
			default:
				break;
		}
	});

	// 判断消息类型
	switch (type) {
		case "GroupMessage":
			if (config.bot.needAt && !at.includes(bot.qq)) {
				hit = false;
			}
			replyType = true;
			break;
		default:
			replyType = false;
			break;
	}

	// 若有小程序则获取其内容
	if (hasBiliMsg) {
		getBiliData(appContent).then((appData) => {
			if (appData) {
				reply(appData);
				Out(`${GetTime()} 获取哔哩哔哩视频信息成功`);
			} else {
				Out(`${GetTime()} 获取哔哩哔哩视频信息失败，消息可能为番剧`);
			}
		}).catch(e => {
			console.error(`${GetTime()} [error] in bilibili`);
			console.error(e);
		});
	} else if (hit) {
		// 若消息包含图片且启用了搜图则搜图否则进行聊天
		if (config.bot.picSearcher.enable && hasImg) {
			// 判断搜索次数
			if (!logger.canSearch(sender.id, config.bot.picSearcher.searchLimit)) {
				reply(config.bot.picSearcher.refuse);
			} else {
				searchImg(imgs).then((results) => {
					results.forEach((result) => {
						replyType ? quoteReply(result) : reply(result);
						if (result.length === 1) {
							Out(`${GetTime()} 使用 saucenao 识图失败`);
						} else {
							Out(`${GetTime()} 使用 saucenao 识图成功`);
							logger.doneSearch(sender.id);
						}
					});
				}).catch(e => {
					console.error(`${GetTime()} [error] in searchImg`);
					console.error(e);
				});
			}
		} else if (config.bot.tulingBot.enable) {
			// 判断聊天次数
			if (!logger.canChat(sender.id, config.bot.tulingBot.chatLimit)) {
				reply(config.bot.tulingBot.refuse);
			} else {
				tulingBot.GetMsg(msg, imgs[0], sender, config.bot.debug).then((gotMsg) => {
					replyType ? quoteReply(gotMsg) : reply(gotMsg);
				}).catch(e => {
					console.error(`${GetTime()} [error] in getMsg`);
					console.error(e);
				});
			}
		}
	}
}

// 退出前向 mirai-http-api 发送释放指令
process.on("exit", () => {
	bot.release();
});

/**
 * 搜图 TODO
 * @param {Array<string>} imgs 图片链接
 */
async function searchImg(imgs) {
	let results = [
		[]
	];
	// 决定搜索库
	let db = 999;
	switch (config.bot.picSearcher.saucenaoDB) {
		case "all":
			db = 999;
			break;
		case "pixiv":
			db = 5;
			break;
		case "danbooru":
			db = 9;
			break;
		case "doujin":
			db = 18;
			break;
		case "anime":
			db = 21;
			break;
		default:
			console.error(
				"[error] saucenaoDB 配置错误，请检查是否为: \"all\"|\"pixiv\"|\"danbooru\"|\"doujin\"|\"anime\" 中的一项，本次将使用\"all\""
			);
			break;
	}
	// 得到图片链接并搜图
	for (let index = 0; index < imgs.length; index++) {
		results[index] = await doSearch(
			imgs[index],
			db,
			config.bot.picSearcher.saucenaoApiKey,
			config.bot.picSearcher.setSimilarity
		);
	}
	return results;
}