// Calculation of the price
// TBD with the team
function estimatePrice(nbrItems, distance) {
    if (nbrItems <= 2) {
        return (0.2 * parseInt(distance)) + 2.5;
    } else {
        return (0.2 * parseInt(distance) * (1.3 * nbrItems));
    }
}

function estimateSharedPrice(oldPrice, distance1, distance2) {
    const newPrice = oldPrice * 1.2;
    const ratio = distance1 / distance2;
    let price1;
    if(ratio>1) {
        price1 = newPrice / ratio;
    }else {
        price1 = newPrice * ratio;   
    }
    const price2 = newPrice - price1;
    return [price1, price2];
}

module.exports = {
    estimatePrice,
    estimateSharedPrice
}