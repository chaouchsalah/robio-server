const status = require('../constants/status');
const HTTP = require('../../../constants/statusCode');
const compareTime = require('../helpers/compareTime');
const getRoute = require('../../../web/api/mapQuest/route');
const getClosest = require('../helpers/closestCoursier');

module.exports = shareSekhra = async (req, res) => {
    const { sekhraId } = req.body;
    const { user } = req;
    let sekhra;
    let oldSekhra;
    try {
        sekhra = await Sekhra.findById(sekhraId);
        oldSekhra = await Sekhra.findById(user.currentSekhras[0]);
    } catch (error) {
        return res.status(HTTP.NOT_FOUND).send({ error });
    }
    sekhra.coursier = user;
    const coursierCoords = user.location.coordinates;
    let firstPath;
    let left = [];
    let leftChanged = [];
    if (oldSekhra.status === status.PENDING) {
        // const routeOld = await getRoute(coursierCoords, oldSekhra.from);
        // const route = await getRoute(coursierCoords, sekhra.from);
        // if (compareTime(route.formattedTime, routeOld.formattedTime)) {
        //     firstPath = route;
        //     left.push(oldSekhra.from);
        //     left.push(sekhra.to);
        //     leftChanged.push(oldSekhra.to);
        // }else {
        //     firstPath = routeOld;
        //     left.push(sekhra.from);
        //     left.push(oldSekhra.to);
        //     leftChanged.push(sekhra.to);
        // }

    } else {
        firstPath = oldSekhra.route;
        left.push(sekhra.from);
        left.push(oldSekhra.to);
    }

    const [fromLat, fromLong] = sekhra.from;
    const [toLat, toLong] = sekhra.to;
    const [oldFromLat, oldFromLong] = oldSekhra.from;
    const [oldToLat, oldToLong] = oldSekhra.to;
}

function aStar(coursierCoords, sekhra, oldSekhra) {
    let edges = [
        [coursierCoords, sekhra.from],
        [sekhra.from, oldSekhra.from],
        [sekhra.from, sekhra.to],
        [oldSekhra.from, sekhra.from],
        [oldSekhra.from, oldSekhra.to],
        [sekhra.to, oldSekhra.to],
        [oldSekhra.to, sekhra.from],
        [oldSekhra.to, sekhra.to]
    ];
    if (oldSekhra.status === status.PENDING) {
        edges.push(
            [coursierCoords, oldSekhra.from],
            [sekhra.to, oldSekhra.from]
        );
    }

    let weights = [];
    for (let i = 0; i < edges.length; i += 2) {
        const origin = edges[i][0];
        const firstWeight = 0;
        const secondWeight = 0;
        const firstChoice = edges[i][1];
        const secondChoice = edges[i + 1][1];
        const firstRoute = getRoute(origin, firstChoice);
        const secondRoute = getRoute(origin, secondChoice);
        if (compareTime(firstRoute.formattedTime, secondRoute.formattedTime)) {
            secondWeight += 1;
        } else {
            firstWeight += 1;
        }
        const closest = getClosest([firstChoice, secondChoice], origin);
        if (closest === firstChoice) {
            secondWeight += 1;
        } else {
            firstWeight += 1;
        }
        weights.push([firstWeight, secondWeight]);
    }
    let paths = [];
    for (let i = 0; i < 2; i++) {
        let path = [];
        path.push(edges[i][0]);
        let element = edges[i][1];
        while (!path.inclues(sekhra.to) && !path.includes(oldSekhra.to)) {
            let found = false;
            let j = 0;
            path.push(element);
            while (!found && j < edges.length) {
                if (element === edges[j][0]) {
                    found = true;
                    element = edges[j][1];
                }
                j++;
            }
        }
        paths.push(path);
    }
}

function getPaths(arr, element, edges, finished) {
    arr.push(element);
    if (checkFinished(arr, finished)) {
        return arr;
    }
    let newElems = edges.map((edge) => {
        if (edge[0] === element) {
            return element;
        }
    });
    if (newElems.length > 1) {
        let newArr = [...arr];
        newArr.push(newElems[1]);
    }
    arr.push(newElems[0]);
}

// Checks if every array has both the destination points
function checkFinished(arr, finished) {
    const [sekhra, oldSekhra] = finished;
    for (let i = 0; i < arr.length; i++) {
        if (!arr[i].includes(sekhra) || !arr[i].includes(oldSekhra)) {
            return false;
        }
    }
    return true;
}