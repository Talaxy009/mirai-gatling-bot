/**
 * 输出
 */
const Out = console.log;

/**
 * 获取当前时间
 */
function GetTime() {
	return new Date().toLocaleString();
}

module.exports = { Out, GetTime };