const { default: Axios } = require("axios");
const Mirai = require("node-mirai-sdk");
const { Plain, Image } = Mirai.MessageComponent;

/**
 * 反哔哩哔哩小程序
 * @param {object} content
 */
async function antiBiliMiniApp(content) {
	const qqdocurl = content.meta.detail_1.qqdocurl;
	const isBangumi = /bilibili\.com\/bangumi|(b23|acg)\.tv\/(ep|ss)/.test(qqdocurl);
	if (isBangumi) return;
	let vid = await getAvBvFromMsg(qqdocurl);
	return getVideoInfo(vid);
}

/**
 * 格式化播放数和弹幕数
 * @param {number} num 数
 */
function formatNum(num) {
	return num < 10000 ? num : `${(num / 10000).toFixed(1)}万`;
}

/**
 * 从字符串中提取出av号和bv号
 * @param {string} msg
 */
async function getAvBvFromMsg(msg) {
	let search;
	if ((search = getAvBvFromNormalLink(msg))) return search;
	if ((search = /(b23|acg)\.tv\/[0-9a-zA-Z]+/.exec(msg))) {
		return getAvBvFromShortLink(`http://${search[0]}`);
	}
	return null;
}

/**
 * 从普通链接中提取出av号和bv号
 * @param {string} link
 */
function getAvBvFromNormalLink(link) {
	if (typeof link !== "string") return null;
	const search = /bilibili\.com\/video\/(?:[Aa][Vv]([0-9]+)|([Bb][Vv][0-9a-zA-Z]+))/.exec(link);
	if (search) return { aid: search[1], bvid: search[2] };
	return null;
}

/**
 * 从短链接中提取出av号和bv号
 * @param {string} shortLink
 */
async function getAvBvFromShortLink(shortLink) {
	try {
		const ret = await Axios.head(shortLink, {
			maxRedirects: 0,
			validateStatus: (status_1) => status_1 >= 200 && status_1 < 400,
		});
		return getAvBvFromNormalLink(ret.headers.location);
	} catch (e) {
		console.error(
			`${new Date().toLocaleString} [error] head request bilibili short link ${shortLink}`
		);
		console.error(e);
		return null;
	}
}

/**
 * 通过视频号获取视频信息
 * @param {object} vid 视频号
 */
async function getVideoInfo(vid) {
	try {
		const {
			data: {
				data: {
					bvid,
					aid,
					pic,
					title,
					owner: { name },
					stat: { view, danmaku },
				},
			},
		} = await Axios.get(
			"https://api.bilibili.com/x/web-interface/view?" +
			(vid.aid ? `aid=${vid.aid}` : `bvid=${vid.bvid}`)
		);
		return [
			Image({ url: pic }),
			Plain(`av${aid}\n${title}\nUP：${name}\n${formatNum(view)}播放 ${formatNum(danmaku)}弹幕\nhttps://www.bilibili.com/video/${bvid}`),
		];
	} catch (e) {
		console.error(`[error] get bilibili video info ${vid}`);
		console.error(e);
		return null;
	}
}

module.exports = antiBiliMiniApp;
