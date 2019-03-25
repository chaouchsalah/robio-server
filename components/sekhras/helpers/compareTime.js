module.exports = function compareTime(timeA,timeB) {
    const splitTimeA = timeA.split(':');
    const splitTimeB = timeB.split(':');
    if(splitTimeA[0]>splitTimeB[0]){
        return true;
    }else if(splitTimeA[0] === splitTimeB[0]) {
        if(splitTimeA[1] > splitTimeB[1]) {
            return true;
        }else if(splitTimeA[1] === splitTimeB[1]) {
            if(splitTimeA[2] >= splitTimeB[2]) {
                return true;
            }else {
                return false;
            }
        }else {
            return false;
        }
    }else {
        return false;
    }
} 