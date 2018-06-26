var eth = require('../eth.js');
var addressService = require('../services/address.service');

module.exports = function(app, db) {
  app.post('/wallet/create', (req, res) => {
    eth.newAccount().then(function(value) {
      var data = {};
      data.address = value.address;
      data.privateKey = value.privateKey;
      addressService.create(data).then(result=>{
        res.send({status:false, data:{id:result.id}});
      }).catch(err => {
        res.send({status:false, message:err.message});
      });
    }, function(error) {
      var response = {};
      response.status = false;
      response.message = error;
      res.send(response);
    });
  });
  app.post('/wallet/balances', (req, res) => {
    let id = req.body.id;
    let contract = req.body.contract;
    addressService.getAddressbyID(id).then(result=>{
      let address = result.address;
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
  });
  app.post('/transaction/list', (req, res) => {
    let id = req.body.id;
    let contract = req.body.contract;    
    addressService.getAddressbyID(id).then(result => {
      if (!contract) {
        eth.listTransactionsByAddress(result.address).then(function(value) {
          res.send({status:true, data:value});
        }, function(error) {
          res.send({status:false, message:error});
        })
      } else {
        eth.listTokenTransactionsByAddress(result.address, contract).then(value => {
          res.send({status:true, data:value});
        }).catch(err => {
          res.send({status:true, message:err});
        });
      }
    }).catch(err => {
      res.send({status:false, message:err.message});
    });
  })
  app.post('/transaction/create', (req, res) => {
    let from = req.body.from;
    let to = req.body.to;
    let amount = req.body.amount;
    let contract = req.body.contract;

    addressService.getAddressbyID(from).then(result1 => {
      let fromAddress =result1.address;
      let privateKey = result1.privateKey;
      addressService.getAddressbyID(to).then(result2 => {
        let toAddress = result2.address;
        if (!contract) {
          eth.transfer(privateKey, fromAddress, toAddress, amount).then(value => {
            res.send({status:true, data:value});
          }).catch(error => {
            res.send({status:false, message:error});
          })
        } else {
          eth.transferToken(privateKey, fromAddress, toAddress, amount, contract).then(value => {
            res.send({status:true, data:value});
          }).catch(error => {
            console.log("error");
            res.send({status:false, message:error});
          })
        }
      }).catch(err => {
        res.send({status:false, message:err.message});
      })
    }).catch(err => {
      res.send({status:false, message:err.message});
    })
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