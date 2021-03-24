const { default: Axios } = require("axios");
const { Out, GetTime } = require("./utils");
const url = "http://openapi.tuling123.com/openapi/api/v2";

class TulingBot {
	constructor(ApiKey) {
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
				apiKey: ApiKey,
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
	* @param {boolean} debugMode debug 模式
	  */
	async GetMsg(msg = "", imgUrl = "", sender, debugMode) {
		let gotMsg = "";

		// 构建用于 Post 的结构体
		this.postBody.userInfo.userId = sender.id;
		this.postBody.userInfo.groupId = typeof sender.group === "undefined" ? "" : sender.group.id;
		this.postBody.perception.inputText.text = msg;
		this.postBody.perception.inputImage.url = imgUrl;
		this.postBody.reqType = imgUrl !== "" ? 1 : 0;

		try {
			const {
				data: {
					results
				},
			} = await Axios.post(url, this.postBody);
			if (results.length === 1) {
				gotMsg = results[0].values.text;
			} else {
				gotMsg = `${results[1].values.text}\n${results[0].values.url}`;
			}

			// debug模式
			if (debugMode) {
				Out("\n发送消息:");
				Out(this.postBody);
				Out("接收消息:");
				Out(results);
			} else {
				Out(`${GetTime()} 回复${sender.id}: ${gotMsg}`);
			}
			return gotMsg;
		} catch (error) {
			console.error(`${GetTime()} [error] in post`);
			console.error(error);
		}
	}
}

module.exports = TulingBot; 