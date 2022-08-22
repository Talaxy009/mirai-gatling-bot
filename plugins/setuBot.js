const { default: Axios } = require("axios");
const NamedRegExp = require("named-regexp-groups");
const Mirai = require("node-mirai-sdk");
const { Plain, Image } = Mirai.MessageComponent;
const { out, getTime } = require("../utils/utils");

class SetuBot {
	/**
	 * 色图 bot
	 * @param {object} config Setu bot 设置
	 * @param {*} debug Debug 模式
	 */
	constructor(config, debug) {
		this.setuReg = new NamedRegExp(config.reg);
		this.apikey = config.apikey;
		this.r18 = config.r18;
		this.size = config.size;
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
		const keyword = regGroup.keyword || "";
		let replyMsg = [];
		await Axios.get("https://api.lolicon.app/setu/v2/", {
			params: {
				size: this.size,
				r18: r18,
				keyword: keyword,
			}
		}).then(ret => {
			const data = ret.data;
			const imgData = data.data[0];
			if (data.error) {
				replyMsg.push(Plain(data.msg));
			} else {
				replyMsg.push(Image({
					url: imgData.urls[this.size]
				}));
				replyMsg.push(Plain(`[${imgData.title}]${imgData.author}\nhttps://pixiv.net/i/${imgData.pid}`));
			}
			if (this.debug) {
				out(setuRegExec.groups, data);
			} else {
				out(`${getTime()} 调用色图 api 成功`);
			}
		}).catch(e => {
			console.error(`${new Date().toLocaleString()} [error] setu[request]`);
			console.error(e);
		});
		return (replyMsg);
	}
}

module.exports = SetuBot;