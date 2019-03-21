const addTime = require('./addTimes');

module.exports = function calculateTime(sekhras) {
    let time = "00:00:00";
    for(let i=0;i<sekhras.length;i++) {
        if(sekhras[i].route){
        time = addTime(time, sekhras[i].route.formattedTime);
        }
    }
    return time;
}