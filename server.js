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
const bodyParser     = require('body-parser');
const app            = express();
const basicAuth 	 = require('express-basic-auth');
var mongoose 		 = require('mongoose');
var mongoDB 		 = require('./config').mongoDB;
mongoose.connect("mongodb://127.0.0.1/address_db");
var db = mongoose.connection;

db.on('error', (err) => {
	console.log(err);
});
db.once('open', () => {
	console.log('Connected to DB');
});

app.use(basicAuth({
    users: { 'admin': 'supersecret' }
}));

const port = 8000;
app.use(bodyParser.urlencoded({ extended: true }));
require('./app/routes')(app, {});
app.listen(port, () => {
  console.log('We are live on ' + port);
});