const getTodayDate = require('../helpers/todayDate');
// Required environment variables
let variables = [
  'FACEBOOK_APP_ID',
  'FACEBOOK_APP_SECRET'
];

// Check if the required env variables are loaded
variables.forEach((variable) => {
  if (!process.env[variable]) {
    throw new Error(`Environment variable ${variable} is missing`)
  }
});

if(!process.env.LOG_DATE) {
  process.env.LOG_DATE = getTodayDate();
}