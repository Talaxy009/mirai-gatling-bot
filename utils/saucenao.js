const { default: Axios } = require("axios");
const Mirai = require("node-mirai-sdk");
const { Plain, Image } = Mirai.MessageComponent;

/**
 * saucenao搜索
 *
 * @param {string} imgURL 图片地址
 * @param {string} db 搜索库
 * @param {string} apikey saucenao 的 Apikey
 * @param {number} setSimilarity 用户设定的低匹配度阈值
 */
async function doSearch(imgURL, db, apiKeys, setSimilarity) {
	let msg = []; // 返回消息

	if (apiKeys) {
		await getSearchResult(imgURL, db, apiKeys)
			.then(async ret => {
				const data = ret.data;

				// 确保回应正确
				if (typeof data !== "object") throw ret;
				if (data.results && data.results.length > 0) {
					let lowAcc = true;
					for (let index = 0; index < data.results.length && lowAcc; index++) {
						let {
							header: {
								similarity, // 相似度
								thumbnail, // 缩略图
								index_id, // 结果类型
							},
							data: {
								ext_urls, // 链接
								source, // 来源
								part, // 番剧集数
								year, // 番剧年份
								est_time, // 截图在番剧中的时间
								title, // 标题
								creator, // 创建人
								member_name, // 作者
								pixiv_id, // pixiv pid
								member_id, // pixiv uid
								eng_name, // 本子名
								jp_name, // 本子名
								created_at, // 创建时间
								twitter_user_handle // 推特用户
							},
						} = data.results[index];

						let url = ""; // 结果链接
						let text = "";

						url = ext_urls[0];
						url = url.replace("http://", "https://");

						switch (index_id) {
							case 5:
							case 6:
								text = `https://pixiv.net/i/${pixiv_id}\n作者: ${member_name}\nhttps://pixiv.net/u/${member_id}\n`;
								break;
							// niconico
							case 8:
								text = `${url}\n作者${member_name}\n`;
								break;
							// danbooru
							case 9:
								text = `${url}\n由${creator}创建\n来源: ${source}\n`;
								break;
							// anime
							case 21:
							case 22:
								text = `${source}\n${year}\n出自第${part}集[${est_time}]\n${url}\n`;
								break;
							// e-hentai
							case 38:
								title = source;
								text = `${jp_name || eng_name}\n作者: ${creator}\n`;
								break;
							// twitter
							case 41:
								text = `${url}\n@${twitter_user_handle} 于 ${created_at} 发布\n`;
								break;
							default:
								text = url + "\n";
								break;
						}

						if (!title) {
							title = "搜索结果";
						}

						// 若相似度低于用户设定的低匹配度阈值则将三个搜索结果都呈现出来
						lowAcc = (similarity < setSimilarity);

						// 回复的消息
						msg.push(Plain(`SauceNAO (${similarity}%)${title}`));
						msg.push(Image({ url: thumbnail }));
						msg.push(Plain(text));
					}
					if (lowAcc) {
						msg.push(Plain("相似度过低，如果这不是你要找的图，那么可能：确实找不到此图/图为原图的局部图/图清晰度太低/搜索引擎尚未同步新图"));
					}
				} else if (data.header.message) {
					switch (data.header.message) {
						case "Specified file no longer exists on the remote server!":
							msg = [Plain("该图片已过期，请尝试二次截图后发送")];
							break;

						case "Problem with remote server...":
							msg = [Plain("远程服务器出现问题，请稍后尝试重试")];
							break;

						default:
							console.error(data);
							msg = [Plain(`${data.header.message}`)];
							break;
					}
				} else {
					msg = [Plain("识别失败，请稍后再试，若多次失败可能是图片无法识别")];
					console.error(`${new Date().toLocaleString} [error] saucenao[data]`);
					console.error(data);
				}
			})
			.catch(e => {
				console.error(`${new Date().toLocaleString} [error] saucenao[request]`);
				msg = [Plain("服务器请求失败，请稍候再试")];
				if (e.response) {
					if (e.response.status === 429) {
						msg = [Plain("搜索次数已达单位时间上限，请稍候再试")];
					} else console.error(e.response.data);
				} else console.error(e);
			});
	} else {
		msg = [Plain("未配置 saucenaoApiKey，无法使用 saucenao 搜图")];
	}

	return msg;
}

/**
 * 取得搜图结果
 * @param {string} api_key saucenao api key
 * @param {string} imgURL 欲搜索的图片链接
 * @param {number} db 搜索库
 * @returns Axios 对象
 */
function getSearchResult(imgURL, db, api_key) {
	return Axios.get("https://saucenao.com/search.php", {
		params: {
			api_key: api_key,
			db: db,
			output_type: 2,
			numres: 3,
			url: imgURL,
		}
	});
}

module.exports = doSearch;