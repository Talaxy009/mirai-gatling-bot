const { default: Axios } = require("axios");
const Mirai = require("node-mirai-sdk");
const { Plain, Image } = Mirai.MessageComponent;
const { getTime } = require("../utils/utils");

/**
 * 反哔哩哔哩小程序
 * @param {any} content
 */
async function getBiliData(content) {
	let vid;
	if (typeof content === "string") {
		vid = await getAvBvFromMsg(content);
	} else {
		const qqdocurl = content.meta.detail_1.qqdocurl;
		const isBangumi = /bilibili\.com\/bangumi|(b23|acg)\.tv\/(ep|ss)/.test(qqdocurl);
		if (isBangumi) return;
		vid = await getAvBvFromMsg(qqdocurl);
	}
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
	if ((search = /((b23|acg)\.tv|bili2233.cn)\/[0-9a-zA-Z]+/.exec(msg))) {
		return getAvBvFromShortLink(`https://${search[0]}`);
	}
	return null;
}

/**
 * 从普通链接中提取出av号和bv号
 * @param {string} link
 */
function getAvBvFromNormalLink(link) {
	if (typeof link !== "string") return null;
	const search = /bilibili\.com\/video\/(?:av(\d+)|(bv[\da-z]+))/i.exec(link);
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
			validateStatus: status => status >= 200 && status < 400,
		});
		return getAvBvFromNormalLink(ret.headers.location);
	} catch (e) {
		console.error(
			`${getTime()} [error] head request bilibili short link ${shortLink}`
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

module.exports = getBiliData;
