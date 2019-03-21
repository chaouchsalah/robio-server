// https://stackoverflow.com/questions/24791010/how-to-find-the-coordinate-that-is-closest-to-the-point-of-origin
function distance(point) {
    return Math.pow(point[0], 2) + Math.pow(point[1], 2);
}

/* Finding the closest coursier to sekhra
*  @param {points} the list of coursiers coords
*  @param {origin} the coords of the course FROM
*/
function getClosest(points, origin) {
    const closest = points.reduce(function(min, p) {
        if (distance(p) < min[1]) min[0] = p;
        return min;
    }, [origin, distance(origin)])[0];
    return closest;
}

module.exports = getClosest;