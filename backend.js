'use strict';

var express = require('express');
var request = require('request');
var util = require('util');
var _ = require('underscore');

var app = express();

var pricesContainer = {
	endpoint: 'https://api.bitcoinaverage.com/ticker/global/%s/last',
	prices: {},
	lastUpdate: Date.now(),
	addCurrency: function(currencyCode){
		currencyCode = currencyCode.toUpperCase();
		util.log('Adding currency code ' + currencyCode);
		pricesContainer.prices[currencyCode] = null;
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
	}
}

app.use(express.static(__dirname + '/static'));

app.get('/prices.json', function(req, res){
	var prices = _.clone(pricesContainer.prices);
	_.extend(prices, {'date': pricesContainer.lastUpdate});
	res.set('Content-Type', 'application/json')
	.send(prices);
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