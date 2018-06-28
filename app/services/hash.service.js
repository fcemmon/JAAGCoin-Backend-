var Q = require('q');
var CryptoJS = require("crypto-js");
var hashKey = require('../../config').hashKey;

var service = {};

service.encrypt = encrypt;
service.decrypt = decrypt;

module.exports = service;

function encrypt(data) {
	var deferred = Q.defer();
	var hashedData = CryptoJS.AES.encrypt(data, hashKey);
	deferred.resolve(hashedData.toString());
	deferred.promise;
}

function decrypt(data) {
	var deferred = Q.deferred();
	var bytes  = CryptoJS.AES.decrypt(data, hashKey);
	var decryptedData = bytes.toString(CryptoJS.enc.Utf8);
	deferred.resolve(decryptedData);
	return deferred.promise;
}