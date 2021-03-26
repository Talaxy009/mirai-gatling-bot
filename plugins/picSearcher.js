const doSearch = require("../utils/saucenao");

class picSheacher {
	constructor(config) {
		this.config = config;
	}
	/**
	 * 搜图
	 * @param {Array<string>} imgs 图片链接
	 */
	async searchImg(imgs) {
		let results = [[]];
		// 决定搜索库
		let db = 999;
		switch (this.config.saucenaoDB) {
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
				this.config.saucenaoApiKey,
				this.config.setSimilarity
			);
		}
		return results;
	}
}

module.exports = picSheacher;