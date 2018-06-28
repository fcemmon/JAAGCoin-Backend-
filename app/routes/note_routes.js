var eth = require('../eth.js');
var addressService = require('../services/address.service');
var hashService = require('../services/hash.service');

module.exports = function(app, db) {
  app.post('/wallet/create', (req, res) => {
    eth.newAccount().then(function(value) {
      hashService.encrypt(value.privateKey).then(encrypted_key => {
        var data = {};
        data.address = value.address;
        data.privateKey = encrypted_key;
        addressService.create(data).then(result=>{
        res.send({status:true, data:{id:result.id, address:result.address, hash:encrypted_key}});
        }).catch(err => {
          res.send({status:false, message:err.message});
        });
      });
    }, function(error) {
      res.send({status:false, message:error});
    });
  });
  app.post('/wallet/balances', (req, res) => {
    let id = req.body.id;
    let address = req.body.address;
    let contract = req.body.contract;
    if (!address && !id) {
      res.send({status:false, message:"Address is missing"})
    } else if (address) {
      if (!contract) {
        eth.getBalance(address).then(function(value) {
          res.send({status:true, data:value});
        }, function(error) {
          res.send({status:false, message:error});
        });
      } else {
        eth.getTokenBalance(address, contract).then(function(value) {
          res.send({status:true, data:value});
        }, function(error) {
          res.send({status:false, message:error});
        })
      }
    } else {
      addressService.getAddressbyID(id).then(result=>{
        if (!contract) {
          eth.getBalance(result.address).then(function(value) {
            res.send({status:true, data:value});
          }, function(error) {
            res.send({status:false, message:error});
          });
        } else {
          eth.getTokenBalance(result.address, contract).then(function(value) {
            res.send({status:true, data:value});
          }, function(error) {
            res.send({status:false, message:error});
          })
        }
      }).catch(err => {
        res.send({status:false, message:err});
      });
    }
  });
  app.post('/transaction/list', (req, res) => {
    let id = req.body.id;
    let address = req.body.address;
    let contract = req.body.contract;
    if (!address && !id) {
      res.send({status:false, message:"Address is missing"});
    } else if (address) {
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
    } else {
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
    }
  })
  app.post('/transaction/create', (req, res) => {
    let fromID = req.body.from_id;
    let toID = req.body.to_id;
    let fromAddress = req.body.from_address;
    let toAddress = req.body.to_address;
    let amount = req.body.amount;
    let contract = req.body.contract;
    let hash = req.body.hash;

    if (!fromAddress && !fromID) {
      res.send({status:false, message:"Sender address is missing"});
    } else if (!toAddress && !toID) {
      res.send({status:false, message:"Receiver address is missing"});
    } else if (fromAddress) {
      addressService.getAddressbyAddress(fromAddress).then(result1 => {
        if (!hash) {
          hash = result1.privateKey;
        }
        hashService.decypt(hash).then(decrypted_key => {
          let privateKey = decrypted_key;
          if (toAddress) {
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
          } else {
            addressService.getAddressbyID(toID).then(result2 => {
              toAddress = result2.address;
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
          }
        })
      }).catch(err => {
        res.send({status:false, message:err});
      })
    } else {
      addressService.getAddressbyID(fromID).then(result1 => {
        if (!hash) {
          hash = result1.privateKey;
        }
        hashService.decypt(hash).then(decrypted_key => {
          let privateKey = decrypted_key;
          fromAddress = result1.address;
          if (toAddress) {
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
          } else {
            addressService.getAddressbyID(to).then(result2 => {
              toAddress = result2.address;
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
          }
        });
      });
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