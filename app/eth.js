var Q = require('q');
var request = require("request");
var _ = require('lodash');
var Web3 = require('web3');
var web3 = new Web3();
var Tx = require('ethereumjs-tx');

const GAS_PRICE = 10000000000;
const GAS_LIMIT = 2900000;

// import smart contracts
var sERC20ABI = require('./abi/jaagcoin'); // NEXT Token

// web3.setProvider(new web3.providers.HttpProvider(config.nodeServer.eth));
web3.setProvider(new web3.providers.HttpProvider("https://mainnet.infura.io/7RFrm0ob5vb1HliXG94v"));
// web3.eth.extend({
//   property: 'txpool',
//   methods: [{
//     name: 'content',
//     call: 'txpool_content'
//   },{
//     name: 'inspect',
//     call: 'txpool_inspect'
//   },{
//     name: 'status',
//     call: 'txpool_status'
//   }]
// });

var service = {};
service.newAccount = newAccount;
service.getBalance = getBalance;
service.transfer = transfer;
service.listTransactionsByAddress = listTransactionsByAddress;

service.getTokenBalance = getTokenBalance;
service.transferToken = transferToken;
service.getFee = getFee;
service.listTokenTransactionsByAddress = listTokenTransactionsByAddress;
service.getRate = getRate;
service.setRate = setRate;

module.exports = service;


function newAccount() {
	let deferred = Q.defer();
	deferred.resolve(web3.eth.accounts.create());
    return deferred.promise;
}

function getFee(coin_type, amount) {
	let fee = (GAS_PRICE * GAS_LIMIT).toString();
	return web3.utils.fromWei(fee);
	// let deferred = Q.defer();
	// let fee = 0;
	// try {
	// 	fee = (GAS_PRICE * GAS_LIMIT /1e3).toFixed(9);
	// 	deferred.resolve(fee);
	// 	// web3.eth.getGasPrice().then(function(gasPrice) {
	// 	// 	if (coin_type == 'eth') {
	// 	// 		web3.eth.estimateGas({}).then(function(gasEstimate) {
	// 	// 			fee = (parseFloat(gasPrice) * parseFloat(gasEstimate) / 1e3).toFixed(9);
	// 	// 			deferred.resolve(fee);
	// 	// 		});
	// 	// 	} else { // For token, gasEstimate is 250K
	// 	// 		fee = (parseFloat(gasPrice) * 250000 / 1e3).toFixed(9);
	// 	// 		deferred.resolve(fee);
	// 	// 	}
	// 	// });

	// } catch(err) {
	// 	deferred.reject(err.message);
	// }
	// return deferred.promise;
}

function getBalance(address) {
	let deferred = Q.defer();
	if (!address) {
		deferred.reject('Invalid Address!');
	}
	try {
		web3.eth.getBalance(address).then(function(value) {
			deferred.resolve(web3.utils.fromWei(value.toString(), 'ether'));
	    }).catch(function(err) {
	    	deferred.reject(err.message);
	    });
	} catch(error) {
		deferred.reject(error.message);
	}
    return deferred.promise;
}

function transfer(pk, fromAddress, toAddress, p_amount) {
	let deferred = Q.defer();
	let fee = getFee(); // Fee as ether
	let tx_nonce = 0;

	try {
		if (parseFloat(p_amount) < parseFloat(fee)) {
			throw {message: 'Amount should be bigger than fee!'};
		}
		let w_amount = web3.utils.toWei(p_amount.toString()) - web3.utils.toWei(fee.toString());
		getBalance(fromAddress).then(function(balance) {
			if (balance < p_amount) {
				throw {message: 'Insufficient funds!'};
			} else {
				return web3.eth.getTransactionCount(fromAddress);
			}
		}).then(function(nonce) {
			tx_nonce = nonce;
			return web3.eth.getGasPrice();
		}).then(function(estimated_gas_price) {
			let privateKey = new Buffer(pk.replace('0x',''),'hex');
			let rawTx = {
				nonce: tx_nonce,
				gasPrice: web3.utils.toBN(estimated_gas_price),
				gasLimit: web3.utils.toBN(GAS_LIMIT),
				to: toAddress,
				value: web3.utils.toBN(w_amount),
			};
			let tx = new Tx(rawTx);
			tx.sign(privateKey);

			let serializedTx = tx.serialize();

			let transaction = web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
			transaction.once('transactionHash', function(hash) {
				deferred.resolve({txid: hash});
			});
			transaction.once('error', function(err) {
				console.log(err.message);
				deferred.reject(err.message);
				// deferred.reject('Sorry, Ethereum network is busy now. Please try again in a few of minutes.');
			});
		}).catch(function(err) {
			deferred.reject(err.message);
		});
	} catch(error) {
		deferred.reject(error.message);
	}

	return deferred.promise;
}


function listTransactionsByAddress(addr) {
	let deferred = Q.defer();
	let return_txs = [];

	// if (pagenum === undefined) {
	// 	pagenum = 1;
	// }

	// if (limit === undefined) {
	// 	limit = 10;
	// }

	// let url = "https://api.etherscan.io/api?module=account&action=txlist&address=" + addr + "&startblock=0&endblock=99999999&page=" + pagenum + "&offset=" + limit + "&sort=desc&apikey=VG4EJ7WXR5P5SYPD5466QNRKEFV7T423WA"
	let url = "http://api.etherscan.io/api?module=account&action=txlist&address=" + addr + "&startblock=0&endblock=99999999&page=1&offset=1000&sort=desc&apikey=VG4EJ7WXR5P5SYPD5466QNRKEFV7T423WA"
	request({
		uri: url,
		method: "GET",
	}, function(error, response, body) {
		if (error) {
			deferred.reject('Error while getting the ETH transaction details by address');
		} else {
			let r_txs = [];
			if (body.length > 0) {
				r_txs = JSON.parse(body);
				if (Array.isArray(r_txs.result) && r_txs.result.length > 0) {
					_.each(r_txs.result, (tx) => {
						let amount = parseFloat(tx.value) / 1e18;
						let fee = parseFloat(tx.gasUsed) * parseFloat(tx.gasPrice) / 1e18;
						let sender_amount = amount + fee;
						if (tx.to.toLowerCase() == addr.toLowerCase()) {
							return_txs.push({
								txid: tx.hash,
								type: 'receive',
								time: tx.timeStamp,
								amount: amount,
							});
						}
					});
				}
			}
			deferred.resolve(return_txs);
		}
	});
	return deferred.promise;
}

function getTokenBalance(address, contractAddress) {

	// web3.eth.txpool.status().then(status => {
	// 	console.log('status');
	// 	console.log(status);
	// }).catch(err => {
	// 	console.log('error');
	// 	console.log(err);
	// });

	let deferred = Q.defer();
	if (!address) {
		deferred.reject('Invalid Address!');
	}
	let tokenContract = null;
	let tokenDecimals = 18;
	try {
		_getABI(contractAddress).then(function(contractABI) {
			tokenContract = new web3.eth.Contract(contractABI, contractAddress);
			if (typeof tokenContract.methods.decimals == 'function') {
				return tokenContract.methods.decimals().call();
			} else {
				return 18;
			}
		}).then(function(decimals) {
			tokenDecimals = parseFloat(decimals);
			return tokenContract.methods.balanceOf(address).call();
		}).then(function(balance) {
			deferred.resolve((balance / Math.pow(10, tokenDecimals)).toFixed(9));
	    }).catch(function(err) {
	    	deferred.reject(err.message);
	    });
	} catch(error) {
		deferred.reject(error.message);
	}
    return deferred.promise;
}

function transferToken(pk, fromAddress, toAddress, p_amount, contractAddress) {
	let deferred = Q.defer();

	let tokenContract = null;
	// let tokenDecimals = 3;
	let tx_nonce = 0;
	let tx_gas_price = 0;
	let tx_data = null;

	try {
		_getABI(contractAddress).then(function(contractABI) {
			tokenContract = new web3.eth.Contract(contractABI, contractAddress);
			return getTokenBalance(fromAddress, contractAddress);
		}).then(function(balance) {
			if (parseFloat(balance) < p_amount) {
				throw {message: 'Insufficient funds!'};
			} else {
				if (typeof tokenContract.methods.decimals == 'function') {
					return tokenContract.methods.decimals().call();
				} else {
					return 18;
				}
			}
		}).then(function(decimals) {
			// tokenDecimals = parseFloat(decimals);
			let amount = parseFloat(web3.utils.toWei(p_amount.toString())) * Math.pow(10, parseFloat(decimals)) / 1e18;
			amount = "0x" + amount.toString(16);
			tx_data = tokenContract.methods.transfer(toAddress, web3.utils.toBN(amount)).encodeABI();
			return web3.eth.getTransactionCount(fromAddress);
		}).then(function(nonce) {
			tx_nonce = nonce;
			return web3.eth.getGasPrice();
		}).then(function(estimated_gas_price) {
			tx_gas_price = estimated_gas_price;
			return web3.eth.estimateGas({
				from: fromAddress,
				to: toAddress,
				data: tx_data
			});
		}).then(function(estimated_gas_limit) {
			let rawTx = {
				nonce: tx_nonce,
				gasPrice: web3.utils.toBN(tx_gas_price),
				gasLimit: web3.utils.toBN(GAS_LIMIT),
				to: contractAddress,
				value: 0,
				data: tx_data
			};

			let tx = new Tx(rawTx);
			let privateKey = new Buffer(pk.replace('0x',''),'hex');
			tx.sign(privateKey);

			let serializedTx = tx.serialize();

			let transaction = web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
			transaction.once('transactionHash', function(hash) {
				deferred.resolve({txid: hash});
			});
			transaction.once('receipt', function(receipt) {
			});
			transaction.once('error', function(err) {
				deferred.reject(err.message);
				// deferred.reject('Sorry, Ethereum network is busy now. Please try again in a few of minutes.');
			});
		}).catch(function(err) {
			deferred.reject(err.message);
		});
	} catch(error) {
		deferred.reject(error.message);
	}

	return deferred.promise;
}

function listTokenTransactionsByAddress(address, contract_address) {
	let deferred = Q.defer();
	let return_txs = [];

	let url = "http://api.etherscan.io/api?module=account&action=tokentx&address=" + address + "&startblock=0&endblock=99999999&page=1&offset=1000&sort=desc&apikey=VG4EJ7WXR5P5SYPD5466QNRKEFV7T423WA"
	request({
		uri: url,
		method: "GET",
	}, function(error, response, body) {
		if (error) {
			deferred.reject('Error while getting the ETH transaction details by address');
		} else {
			let r_txs = [];
			if (body.length > 0) {
				r_txs = JSON.parse(body);
				if (Array.isArray(r_txs.result) && r_txs.result.length > 0) {
					_.each(r_txs.result, (tx) => {
						let tx_input = tx.input;
						let tx_method_id = tx_input.substring(0, 10);
						let tx_receiver = tx_input.substring(10, 74);
						let amount = parseInt(tx_input.substring(74), 16) / 1e18;

						// let r_address = address.substring(2)

						// if (tx.to.toLowerCase() == addr.toLowerCase()) {
						if (tx_receiver.toLowerCase().indexOf(address.substring(2).toLowerCase()) > -1) {
							return_txs.push({
								txid: tx.hash,
								type: 'receive',
								time: tx.timeStamp,
								amount: amount,
							});
						}
					});
				}
			}
			deferred.resolve(return_txs);
		}
	});
	return deferred.promise;
}

function getRate(contractAddress) {
	let deferred = Q.defer();
	let tokenContract = null;
	let tokenDecimals = 18;
	try {
		_getABI(contractAddress).then(function(contractABI) {
			tokenContract = new web3.eth.Contract(contractABI, contractAddress);
			if (typeof tokenContract.methods.decimals == 'function') {
				return tokenContract.methods.decimals().call();
			} else {
				return 18;
			}
		}).then(function(decimals) {
			tokenDecimals = parseFloat(decimals);
			return tokenContract.methods.getRate().call();
		}).then(function(rate) {
			deferred.resolve(rate);
	    }).catch(function(err) {
	    	deferred.reject(err.message);
	    });
	} catch(error) {
		deferred.reject(error.message);
	}
    return deferred.promise;
}

function setRate(p_rate, contractAddress) {
	let deferred = Q.defer();
	let tokenContract = null;
	let tokenDecimals = 18;
	try {
		_getABI(contractAddress).then(function(contractABI) {
			tokenContract = new web3.eth.Contract(contractABI, contractAddress);
			if (typeof tokenContract.methods.decimals == 'function') {
				return tokenContract.methods.decimals().call();
			} else {
				return 18;
			}
		}).then(function(decimals) {
			tokenDecimals = parseFloat(decimals);
			return tokenContract.methods.setRate(p_rate).call();
		}).then(function(result) {
			deferred.resolve(result);
	    }).catch(function(err) {
	    	deferred.reject(err.message);
	    });
	} catch(error) {
		deferred.reject(error.message);
	}
    return deferred.promise;
}

function _getABI(contract_address) {
	let deferred = Q.defer();
	deferred.resolve(sERC20ABI);

	let url = "http://api.etherscan.io/api?module=contract&action=getabi&address=" + contract_address;
	request({
		uri: url,
		method: "GET",
	}, function(error, response, body) {
		if (error) {
			deferred.reject({message: 'Error while getting the ABI'});
		} else {
			let contractABI = null;
			
			if (body.length > 0) {
				let json_body = JSON.parse(body);
				if (json_body.status == 0 && json_body.result == "Invalid Address format") {
					deferred.reject({message: 'Invalid contract address'});
				} else {
					contractABI = json_body.result;
					if (contractABI && contractABI != '') {
						deferred.resolve(JSON.parse(contractABI));
					} else {
						deferred.resolve(sERC20ABI);
					}
				}
			} else {
				deferred.reject({message: 'Returned Empty Contract ABI!'});
			}
			
		}
	});

	return deferred.promise;
}

// function _getTokenObj(token_name) {
// 	if (token_name == 'next') {
// 		return nextToken;
// 	} else {
// 		return false;
// 	}
// }

// function _getTokenContractAddress(token_name) {
// 	if (token_name == 'next') {
// 		return nextTokenContractAddress;
// 	} else {
// 		return false;
// 	}	
// }
