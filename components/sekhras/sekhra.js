const mongoose = require('mongoose');
const status = require('./constants/status');
const Schema = mongoose.Schema;

// Define model
const sekhraSchema = new Schema({
    from: {
        type: [Number],
        maxlength: 2
    },
    to: {
        type: [Number],
        maxlength: 2
    },
    description: {
        type: String
    },
    items: [String],
    status: {
        type: String,
        enum: [ status.DELIVERED, status.PENDING, status.PICKED ],
        default: status.PENDING
    },
    cost: {
        type: Number
    },
    duration: {
        type: Number
    },
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'Customer'
    },
    coursier: {
        type: Schema.Types.ObjectId,
        ref: 'Coursier'
    },
    route: {
        type: Schema.Types.ObjectId,
        ref: 'Route'
    },
    activated: {
        type: Boolean,
        default: false
    }
},{ timestamps: true });

// Create the model
const model = mongoose.model('Sekhra', sekhraSchema);

module.exports = model;