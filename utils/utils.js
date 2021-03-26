/**
 * 输出
 */
const out = console.log;

/**
 * 获取当前时间
 */
function getTime() {
	return new Date().toLocaleString();
}

/**
 * 撤回消息
 * @param {NodeMirai} bot NodeMirai 对象
 * @param {object} data 发送消息后返回的数据对象
 * @param {number} time 延时(单位: 秒)
 */
function recall(bot, data, time) {
	if (time === 0 || data.code !== 0) {
		return;
	}
	setTimeout(() => {
		bot.recall(data.messageId);
	}, time * 1000);
}

module.exports = { out, getTime, recall };