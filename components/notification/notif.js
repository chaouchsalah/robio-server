const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define model
const notifSchema = new Schema({
    notifs: [{
        text: String,
        interactive: Boolean
    }],
    sekhra: {
        type: Schema.Types.ObjectId,
        ref: 'Sekhra'
    },
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'Customer'
    },
    coursier: {
        type: Schema.Types.ObjectId,
        ref: 'Coursier'
    }
});

// Create the model
const model = mongoose.model('Notification', notifSchema);

module.exports = model;