'use strict';

var express = require('express');
var request = require('request');
var util = require('util');

var app = express();

var pricesContainer = {
	endpoint: 'https://api.bitcoinaverage.com/ticker/global/%s/last',
	prices: {},
	lastUpdate: Date.now(),
	addCurrency: function(currency_code){
		currency_code = currency_code.toUpperCase();
		util.log('Adding currency code ' + currency_code);
		pricesContainer.prices[currency_code] = null;
	},

	updatePrices: function() {
		for(var code in pricesContainer.prices) {
			util.log('Asking for ' + code + ' price');
			var response = request.get(util.format(pricesContainer.endpoint, code));

			response.on('response', function(currencyCode, response){
				if(response.statusCode == 200) {
					util.log(util.format('Obtained price for %s', currencyCode));
					pricesContainer.lastUpdate = Date.now();
				} 
				else {
					util.log('Not the expected answer for ' + currencyCode + ', preserving current price.');
				}
			}.bind(response, code));

			response.on('data', function(currencyCode, data){
				var value = parseFloat(data);
				util.log("For " + currencyCode);
				if(isNaN(value)) {

					util.log('Preserving last value due parsing error');
				}
				else {
					util.log('Adding updated value to currency list (' + value + ')');
					pricesContainer.prices[currencyCode] = value;
				}
			}.bind(response, code));

			response.on('error', function(currencyCode, error){
				util.error('Error retrieving ' + code + ' price: ' + error);
				util.error('Preserving current value');
				pricesContainer.lastUpdate = Date.now();
			}.bind(response, code));
		}
	},
	jsonReturn: function(){
		var returnValues = {};
		for(var currency in pricesContainer.prices){
			returnValues[currency] = pricesContainer.prices[currency];
		}
		returnValues["date"] = pricesContainer.lastUpdate
		return returnValues;
	}
}

app.use(express.static(__dirname + '/static'));

app.get('/prices.json', function(req, res){
	res.set('Content-Type', 'application/json').send(pricesContainer.jsonReturn());
});

pricesContainer.addCurrency('CAD');
pricesContainer.addCurrency('USD');
pricesContainer.addCurrency('CLP');

util.log('Obtaining initial prices list');
pricesContainer.updatePrices();

util.log('Now creating price update task');

var periodicUpdate = setInterval(function(){
		pricesContainer.updatePrices();
}, 60*1000);

app.listen(1337);
util.log('express is up and listening');