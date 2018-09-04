var Q = require('q');
var request = require("request");
var _ = require('lodash');
var Neon = require('@cityofzion/neon-js');

var service = {};

service.newAccount = newAccount;
service.getBalance = getBalance;
service.transfer = transfer;
service.getTransactionList = getTransactionList;

function newAccount() {
	let deferred = Q.defer();
	const account = Neon.default.create.account(Neon.wallet.default.create.privateKey());
	const privateKey = account.privateKey;
	const address = account.address;
	let data = {};
	data.address = address;
	data.privateKey = privateKey;
	deferred.resolve(data);
    return deferred.promise;
}

function getBalance(address) {
	let deferred = Q.deferred();
	Neon
		.default
		.get
		.balance('MainNet', address)
		.then(response => {
			deferred.resolve(response.assets.NEO.balance);
		});
	return deferred.promise;
}

function transfer(toAddress, amount, pk) {
	let deferred = Q.deferred();
	const account = new Neon.wallet.Account(pk)
	const toAddress = toAddress
	Neon.api.default.sendAsset({
	  net: 'MainNet',
	  account: account,
	  intents: Neon.api.makeIntent({
	    NEO: amount,
	  }, toAddress),
	})
	.then(rpcResponse => {
	  	deferred.resolve(rpcResponse.assetID)
	})
	return deferred.promise;
}

function getTransactionList(address) {
	let deferred = Q.deferred();
	const mainNetNeoscan = api.neocan.instance("MainNet");
	var neoscanBalance = mainNetNeoscan.getBalance(addr)
	deferred.resolve(neoscanBalance);
	return deferred.promise;
}