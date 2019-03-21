// Contains the { distance, time, and path } of the sekhra
// Separated from the sekhra model for readability purposes
const mongoose = require('mongoose');
const { Schema } = mongoose;

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