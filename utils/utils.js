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

module.exports = { out, getTime };