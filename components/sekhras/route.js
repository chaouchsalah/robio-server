const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define model
const routeSchema = new Schema({
    formattedTime: {
        type: String,
    },
    distance: {
        type: Number
    },
    waypoints: [[Number,Number]]
});

// Create the model
const model = mongoose.model('Route', routeSchema);

module.exports = model;