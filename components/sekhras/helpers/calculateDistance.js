module.exports = function calculateDistance(sekhras) {
    let distance = 0;
    for(let i=0;i<sekhras.length;i++) {
        if(sekhras[i].route){
            distance += sekhras[i].route.distance;
        }
    }
    return distance;
}