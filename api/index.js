const serverless = require('serverless-http');
const app = require('../app'); // Your existing Express app

module.exports.handler = serverless(app);
