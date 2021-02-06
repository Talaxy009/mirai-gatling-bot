/**
 * 调用次数记录
 * @class Logger
 */
class Logger {
	constructor() {
		this.chatTimes = [];
		this.searchTimes = [];
		this.date = new Date().getDate();

		// 每日初始化
		setInterval(() => {
			let nowDate = new Date().getDate();
			if (this.date != nowDate) {
				this.date = nowDate;
				this.chatTimes = [];
				this.searchTimes = [];
			}
		}, 60000);
	}

	/**
	 * 判断是否达到聊天限制次数
	 * @param {number} u 用户ID
	 * @param {number} limit 上限值
	 */
	canChat(u, limit) {
		if (limit == 0) return true;
		if (!this.chatTimes[u]) this.chatTimes[u] = 0;
		if (this.chatTimes[u]++ < limit) return true;
		return false;
	}

	/**
	 * 判断是否达到搜图限制次数
	 * @param {number} u 用户ID
	 * @param {number} limit 上限值
	 */
	canSearch(u, limit) {
		if (limit == 0) return true;
		if (!this.searchTimes[u]) this.searchTimes[u] = 0;
		if (this.searchTimes[u] < limit) return true;
		return false;
	}

	/**
	 * 搜图成功，更新搜图次数
	 * @param {number} u 
	 */
	doneSearch(u) {
		this.searchTimes[u]++;
	}
}

module.exports = Logger;
