function formatMilliseconds(ms) {
    // 1秒 = 1000毫秒, 1分钟 = 60秒, 1小时 = 60分钟  
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0')
    };
}



module.exports = {
    formatMilliseconds
};