// Dependencies
const http = require('http');
const config = require ('./config/config');

require('./bot');

// Creating server
http.createServer((req, res) => {
    res.end('Hello World!');
}).listen(config.port, () => {
    console.log(`The server is listening on port ${config.port}`);
});