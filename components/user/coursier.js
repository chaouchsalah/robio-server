const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define model
const coursierSchema = new Schema({
    facebookId: {
        type: String,
        unique: true,
        required: true
    },
    photo: {
        type: String
    },
    email: {
        type: String
    },
    displayName: {
        type: String
    },
    token: {
        type: String
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    numberOfRatings: {
        type: Number,
        default: 0
    },
    actif: {
        type: Boolean,
        default: true
    },
    currentSekhras: [{
        type: Schema.Types.ObjectId,
        ref: 'Sekhra'
    }],
    finishedSekhras: [{
        type: Schema.Types.ObjectId,
        ref: 'Sekhra'
    }],
    userType: {
        type: String,
        default: 'coursier'
    },
    location: {
        type: {type: String},
        coordinates: []
    }
});

coursierSchema.index({ location: "2dsphere" });

// Create the model
const model = mongoose.model('Coursier', coursierSchema);

module.exports = model;