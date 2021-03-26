const process = require("process");
const config = require("./config.json");
const NamedRegExp = require("named-regexp-groups");
const Mirai = require("node-mirai-sdk");
const TBot = require("./utils/tulingBot");
const STBot = require("./utils/setu");
const Logger = require("./utils/logger");
const { Plain, At, Image, App } = Mirai.MessageComponent;
const { out, getTime, recall } = require("./utils/utils");
const getBiliData = require("./utils/bilibili");
const doSearch = require("./utils/saucenao");
const bot = new Mirai(config.mirai);
const tulingBot = new TBot(config.bot.tulingBot.apikey, config.bot.debug);
const setuBot = new STBot(config.bot.setu, config.bot.debug);
const setuReg = new NamedRegExp(config.bot.setu.reg);

let logger = new Logger();

// auth 认证
bot.onSignal("authed", () => {
	out(`${getTime()} 通过: ${bot.sessionKey} 认证中···`);
	bot.verify();
});

// session 校验回调
bot.onSignal("verified", () => {
	const messageChain = [Plain(config.bot.greet)];
	if (config.bot.admin) {
		bot.sendFriendMessage(messageChain, config.bot.admin);
	}
	out(`${getTime()} 通过: ${bot.sessionKey} 认证成功!\n`);
	if (config.bot.tulingBot.enable) {
		out(`图灵机器人: 已启用\n\t聊天限制次数: ${config.bot.tulingBot.chatLimit}/QQ`);
	}
	if (config.bot.bilibili.enable) {
		out("哔哩哔哩模块: 已启用");
	}
	if (config.bot.picSearcher.enable) {
		out(`搜图模块: 已启用\n\t搜图限制次数: ${config.bot.picSearcher.searchLimit
		}/QQ\n\t所选 saucenao 数据库: ${config.bot.picSearcher.saucenaoDB}`);
	}
	if (config.bot.setu.enable) {
		out(`色图模块: 已启用\n\t允许r18: ${config.bot.setu.r18 ? "是" : "否"
		}\n\t缩略图: ${config.bot.setu.thumbnail ? "是" : "否"}\n\t限制次数: ${config.bot.setu.limit
		}/QQ\n\t撤回: ${config.bot.setu.recall ? config.bot.setu.recall + "秒后" : "不撤回"}`);
	}
	out(
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
	let wantSetu = false;
	let replyType = false;
	let hit = true;
	messageChain.forEach(chain => {
		switch (chain.type) {
			case "At":
				at.push(At.value(chain).target);
				break;
			case "Plain":
				msg += Plain.value(chain);
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


	// 去除消息中的空格
	msg = msg.split(" ").join("");
	if (config.bot.bilibili.enable &&
		msg.includes("www.bilibili.com/video/")) {
		appContent = msg;
		hasBiliMsg = true;
	}
	if (config.bot.setu.enable && setuReg.test(msg)) {
		wantSetu = true;
	}

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
		getBiliData(appContent).then(appData => {
			if (appData) {
				reply(appData);
				out(`${getTime()} 获取哔哩哔哩视频信息成功`);
			} else {
				out(`${getTime()} 获取哔哩哔哩视频信息失败，消息可能为番剧`);
			}
		}).catch(e => {
			console.error(`${getTime()} [error] in bilibili`);
			console.error(e);
		});
	} else if (hit) {
		if (wantSetu) {
			// 判断射击次数
			if (!logger.canShoot(sender.id, config.bot.setu.limit)) {
				reply(config.bot.setu.refuse);
			} else {
				setuBot.getSetu(msg).then(setu => {
					bot.reply(setu, message, replyType).then(ret => recall(bot, ret, config.bot.setu.recall));
				}).catch(e => {
					console.error(`${getTime()} [error] in setuBot`);
					console.error(e);
				});
			}
		} else if (config.bot.picSearcher.enable && hasImg) {
			// 判断搜索次数
			if (!logger.canSearch(sender.id, config.bot.picSearcher.searchLimit)) {
				reply(config.bot.picSearcher.refuse);
			} else {
				searchImg(imgs).then(results => {
					results.forEach(result => {
						replyType ? quoteReply(result) : reply(result);
						if (result.length === 1) {
							out(`${getTime()} 使用 saucenao 识图失败`);
						} else {
							out(`${getTime()} 使用 saucenao 识图成功`);
							logger.doneSearch(sender.id);
						}
					});
				}).catch(e => {
					console.error(`${getTime()} [error] in searchImg`);
					console.error(e);
				});
			}
		} else if (config.bot.tulingBot.enable) {
			// 判断聊天次数
			if (!logger.canChat(sender.id, config.bot.tulingBot.chatLimit)) {
				reply(config.bot.tulingBot.refuse);
			} else {
				tulingBot.getMsg(msg, imgs[0], sender).then(gotMsg => {
					replyType ? quoteReply(gotMsg) : reply(gotMsg);
				}).catch(e => {
					console.error(`${getTime()} [error] in getMsg`);
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
 * 搜图
 * @param {Array<string>} imgs 图片链接
 */
async function searchImg(imgs) {
	let results = [[]];
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