const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define model
const customerSchema = new Schema({
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
    displayName: String,
    token: {
        type: String
    },
    userType: {
        type: String,
        default: 'customer'
    },
    currentSekhras: [{
        type: Schema.Types.ObjectId,
        ref: 'Sekhra'
    }],
    finishedSekhras: [{
        type: Schema.Types.ObjectId,
        ref: 'Sekhra'
    }]
});


// Create the model
const model = mongoose.model('Customer', customerSchema);

module.exports = model;