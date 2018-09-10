var Q = require('q');
var request = require("request");
var _ = require('lodash');
const bch = require('bitcoincashjs');

var service = {};

service.newAccount = newAccount;
service.getBalance = getBalance;
service.transfer = transfer;
service.listTransactionsByAddress = listTransactionsByAddress;

module.exports = service;

function newAccount() {
	let defered = Q.defer();
	let privateKey = new bch.PrivateKey();
	let address = privateKey.toAddress();
	let data = {};
	data.privateKey = privateKey;
	data.address = address.toString();
	defered.resolve(data);
	return defered.promise;
}

function getBalance(address) {
	let defered = Q.defer();
	return defered.promise;
}

function transfer(pk, fromAddress, toAddress, amount) {
	let defered = Q.defer();
	const privateKey = new bch.PrivateKey(pk);
	const utxo = {
	  'txId' : '115e8f72f39fad874cfab0deed11a80f24f967a84079fb56ddf53ea02e308986',
	  'outputIndex' : 0,
	  'address' : fromAddress,
	  'script' : new bch.Script(toAddress).toHex(),
	  'satoshis' : 50000
	};
	const transaction = new bch.Transaction()
	  .from(utxo)
	  .to(toAddress, amount)
	  .sign(privateKey);
	return defered.promise;
}

function listTransactionsByAddress(address) {
	let defered = Q.defer()
	return defered.promise;
}