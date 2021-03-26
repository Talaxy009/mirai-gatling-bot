const { default: Axios } = require("axios");
const { out, getTime } = require("../utils/utils");

class TulingBot {
	/**
	 * 图灵机器人
	 * @param {string} apiKey Apikey
	 * @param {boolean} debug Debug 模式
	 */
	constructor(apiKey, debug) {
		this.debug = debug;
		this.postBody = {
			reqType: 0,
			perception: {
				inputText: {
					text: ""
				},
				inputImage: {
					url: ""
				}
			},
			userInfo: {
				apiKey: apiKey,
				groupId: "",
				userId: ""
			}
		};
	}

	/**
	 * 调用 图灵API 获取消息
	 * @param {string} msg 文本消息
	 * @param {string} imgUrl 图像连接
	 * @param {object} sender 消息发送人
	 */
	async getMsg(msg = "", imgUrl = "", sender) {
		let gotMsg = "";

		// 构建用于 Post 的结构体
		this.postBody.userInfo.userId = sender.id;
		this.postBody.userInfo.groupId = typeof sender.group === "undefined" ? "" : sender.group.id;
		this.postBody.perception.inputText.text = msg;
		this.postBody.perception.inputImage.url = imgUrl;
		this.postBody.reqType = imgUrl !== "" ? 1 : 0;

		await Axios.post(
			"http://openapi.tuling123.com/openapi/api/v2",
			this.postBody
		).then(ret => {
			const results = ret.data.results;
			if (results.length === 1) {
				gotMsg = results[0].values.text;
			} else {
				gotMsg = `${results[1].values.text}\n${results[0].values.url}`;
			}

			// debug模式
			if (this.debug) {
				out("\n发送消息:");
				out(this.postBody);
				out("接收消息:");
				out(results);
			} else {
				out(`${getTime()} 回复${sender.id}: ${gotMsg}`);
			}
		}).catch(e => {
			console.error(`${getTime()} [error] in post`);
			console.error(e);
		});
		return gotMsg;
	}
}

module.exports = TulingBot;