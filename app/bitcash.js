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
	data.address = address;
	defered.resolve(data);
	return defered.promise;
}

function getBalance(address) {
	let defered = Q.defer();
	return defered.promise;
}

function transfer(pk, ) {
	let defered = Q.defer();
	return defered.promise;
}

function listTransactionsByAddress(address) {
	let defered = Q.defer()
	return defered.promise;
}