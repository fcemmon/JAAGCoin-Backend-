// const express        = require('express');
// const MongoClient    = require('mongodb').MongoClient;
// const bodyParser     = require('body-parser');
// const app            = express();
// const port = 8000;
// app.use(bodyParser.urlencoded({ extended: true }));
// require('./app/routes')(app, {});
// app.listen(port, () => {
//   console.log('We are live on ' + port);
// });

const express        = require('express');
const MongoClient    = require('mongodb').MongoClient;
const bodyParser     = require('body-parser');
const app            = express();
const basicAuth = require('express-basic-auth');
 
app.use(basicAuth({
    users: { 'admin': 'supersecret' }
}));
const port = 24000;
app.use(bodyParser.urlencoded({ extended: true }));
require('./app/routes')(app, {});
app.listen(port, () => {
  console.log('We are live on ' + port);
});