const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Coursier = require('./coursier');
const logger = require('../../config/logger');

// Define model
const ratingSchema = new Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
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

// Modify the coursier rating
ratingSchema.post('save', (rating) => {
    Coursier.findById(rating.coursier.id, (err, coursier) => {
        if(err) {
            logger.error(err);
        }
        coursier.numberOfRatings++;
        if(coursier.numberOfRatings === 0) {
            coursier.rating = rating.rating;
        }else {
            const { numberOfRatings } = coursier;
            const newRating = ((coursier.rating * (numberOfRatings - 1)) + rating.rating) / numberOfRatings;
            coursier.rating = newRating;
        }
        coursier.save();
    });
});

// Create the model
const model = mongoose.model('Rating', ratingSchema);

module.exports = model;