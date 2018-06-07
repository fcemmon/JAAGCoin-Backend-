var eth = require('../eth.js')

module.exports = function(app, db) {
  app.post('/wallet/create', (req, res) => {
  	eth.newAccount().then(function(value) {
  		var response = {};
  		response.status = true;
  		var data = {};
  		data.address = value.address;
  		data.privateKey = value.privateKey;
  		response.data = data;
  		res.send(response)
  	}, function(error) {
  		var response = {};
  		response.status = false;
  		response.message = error;
  		res.send(response);
  	});
  });
  app.post('/wallet/balances/', (req, res) => {
  	let address = req.body.address;
  	let contract = req.body.contract;
  	if (!contract) {
  		eth.getBalance(address).then(function(value) {
	  		var response = {};
	  		response.status = true;
	  		response.data = value;
	  		res.send(response);
	  	}, function(error) {
	  		var response = {};
	  		response.status = false;
	  		response.message = error;
	  		res.send(response);
	  	});
	} else {
		eth.getTokenBalance(address, contract).then(function(value) {
	  		var response = {};
	  		response.status = true;
	  		response.data = value;
	  		res.send(response);
	  	}, function(error) {
	  		var response = {};
	  		response.status = false;
	  		response.message = error;
	  		res.send(response);
	  	})
	}
  });
  app.post('/transaction/list', (req, res) => {
  	let address = req.body.address;
  	eth.listTransactionsByAddress(address).then(function(value) {
  		var response = {};
  		response.status = true;
  		response.data = value;
  		res.send(response);
  	}, function(error) {
  		var response = {};
  		response.status = false;
  		response.message =error;
  		res.send(response);
  	})
  });
  app.post('/transaction/create', (req, res) => {
  	let privateKey = req.body.privateKey;
  	let from = req.body.from;
  	let to = req.body.to;
  	let amount = req.body.amount;
  	let contract = req.body.contract;

  	if (!contract) {
  		eth.transfer(privateKey, from, to, amount).then(function(value) {
	  		var response = {};
	  		response.status = true;
	  		response.data = value;
	  		res.send(response);
	  	}, function(error) {
	  		var response = {};
	  		response.status = false;
	  		response.message = error;
	  		res.send(response);
	  	});
  	} else {
  		eth.transfer(privateKey, from, to, amount, contract).then(function(value) {
	  		var response = {};
	  		response.status = true;
	  		response.data = value;
	  		res.send(response);
	  	}, function(error) {
	  		var response = {};
	  		response.status = false;
	  		response.message = error;
	  		res.send(response);
	  	})
  	}
  });
  app.post('/contract/rate/view', (req, res) => {
  	let contract = req.body.contract;

  	eth.getRate(contract).then(function(value) {
  		var response = {};
  		response.status = true;
  		response.data = value;
  		res.send(response);
  	}, function(error) {
  		var response = {};
  		response.status = false;
  		response.message = error;
  		res.send(response);
  	});
  });
  app.post('/contract/rate/update', (req, res) => {
  	let contract = req.body.contract;
  	let rate = req.body.rate;

  	eth.getRate(rate, contract).then(function(value) {
  		var response = {};
  		response.status = true;
  		response.data = rate;
  		res.send(response);
  	}, function(error) {
  		var response = {};
  		response.status = false;
  		response.message = error;
  		res.send(response);
  	})
  });
};

// var ObjectID = require('mongodb').ObjectID;
// module.exports = function(app, db) {
//   app.get('/notes/:id', (req, res) => {
//     const id = req.params.id;
//     const details = { '_id': new ObjectID(id) };
//     db.collection('notes').findOne(details, (err, item) => {
//       if (err) {
//         res.send({'error':'An error has occurred'});
//       } else {
//         res.send(item);
//       } 
//     });
//   });
// app.post('/notes', (req, res) => {
//     const note = { text: req.body.body, title: req.body.title };
//     db.collection('notes').insert(note, (err, result) => {
//       if (err) { 
//         res.send({ 'error': 'An error has occurred' }); 
//       } else {
//         res.send(result.ops[0]);
//       }
//     });
//   });
// };

// app.delete('/notes/:id', (req, res) => {
//     const id = req.params.id;
//     const details = { '_id': new ObjectID(id) };
//     db.collection('notes').remove(details, (err, item) => {
//       if (err) {
//         res.send({'error':'An error has occurred'});
//       } else {
//         res.send('Note ' + id + ' deleted!');
//       } 
//     });
//   });

// app.put('/notes/:id', (req, res) => {
//     const id = req.params.id;
//     const details = { '_id': new ObjectID(id) };
//     const note = { text: req.body.body, title: req.body.title };
//     db.collection('notes').update(details, note, (err, result) => {
//       if (err) {
//           res.send({'error':'An error has occurred'});
//       } else {
//           res.send(note);
//       } 
//     });
//   });