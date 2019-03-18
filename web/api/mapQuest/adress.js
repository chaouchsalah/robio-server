const mapQuest = require('./mapQuest');

const address = async (location) =>{
    const response = await mapQuest.get('/geocoding/v1/address',{
        params: {
            location
        }
    });
    location = response.data.results[0].locations[0];
    if((location.geocodeQualityCode.split("X").length - 1) < 2 ){
        return location.latLng;
    }
};

module.exports = address;