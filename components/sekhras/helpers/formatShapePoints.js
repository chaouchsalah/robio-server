const addTimes = require('./addTimes');

module.exports = function formatShapePoints(routeToSekhra, route) {
    let newRoute = {};
    newRoute.distance = routeToSekhra.distance + route.distance;
    newRoute.formattedTime = addTimes(routeToSekhra.formattedTime,route.formattedTime);
    const combinedShapePoints = [...routeToSekhra.shape.shapePoints, ...route.shape.shapePoints];
    let inc = Math.ceil(combinedShapePoints.length/100);
    if(inc <= 0) {
        inc = 1;
    }
    let finalShapePoints = [];
    count = 1;
    for(let i=0;i<combinedShapePoints.length;i+=(inc*2)) {
        finalShapePoints.push([combinedShapePoints[count-1],combinedShapePoints[count]]);
        count+=2;
    }
    newRoute.shapePoints = finalShapePoints;
    return newRoute;
}