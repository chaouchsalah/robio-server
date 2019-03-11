const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/Robio';
// DB setup
mongoose.connect(uri, { useNewUrlParser: true });
mongoose.set('useCreateIndex', true);