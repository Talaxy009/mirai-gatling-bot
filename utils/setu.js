const { default: Axios } = require("axios");
const NamedRegExp = require("named-regexp-groups");
const Mirai = require("node-mirai-sdk");
const { Plain, Image } = Mirai.MessageComponent;
const { out, getTime } = require("./utils");

class SetuBot {
	/**
	 * 色图 bot
	 * @param {object} settings Setu bot 设置
	 * @param {*} debug Debug 模式
	 */
	constructor(settings, debug) {
		this.setuReg = new NamedRegExp(settings.reg);
		this.apikey = settings.apikey;
		this.r18 = settings.r18;
		this.thumbnail = settings.thumbnail;
		this.debug = debug;
	}

	/**
	 * 获取色图
	 * @param {string} msg 消息
	 */
	async getSetu(msg) {
		const setuRegExec = this.setuReg.exec(msg);
		const regGroup = setuRegExec.groups || {};
		const r18 = (this.r18 && typeof regGroup.r18 !== "undefined") ? 1 : 0;
		const keyworld = regGroup.keyword || "";
		let replyMsg = [];
		await Axios.get("https://api.lolicon.app/setu/", {
			params: {
				apikey: this.apikey,
				size1200: this.thumbnail,
				r18: r18,
				keyword: keyworld
			}
		}).then(ret => {
			const data = ret.data;
			const imgData = data.data[0];
			if (data.code === 0) {
				replyMsg.push(Image({
					url: imgData.url
				}));
				replyMsg.push(Plain(`[${imgData.title}]${imgData.author}\nhttps://pixiv.net/i/${imgData.pid}`));
			} else {
				replyMsg.push(Plain(data.msg));
			}
			if (this.debug) {
				out(setuRegExec.groups, data);
			} else {
				out(`${getTime()} 调用色图 api 成功, 本日剩余次数: ${data.quota}`);
			}
		}).catch(e => {
			console.error(`${new Date().toLocaleString()} [error] setu[request]`);
			console.error(e);
		});
		return (replyMsg);
	}
}

module.exports = SetuBot;