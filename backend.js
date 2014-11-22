'use strict';

var express = require('express');
var request = require('request');
var util = require('util');

var app = express();

var pricesContainer = {
	endpoint: 'https://api.bitcoinaverage.com/ticker/global/%s/last',
	prices: {},
	lastUpdate: '',
	addCurrency: function(currency_code){
		currency_code = currency_code.toUpperCase();
		util.log('Adding currency code ' + currency_code);
		pricesContainer.prices[currency_code] = null;
	},
	updatePrices: function(){
		for(var code in pricesContainer.prices){
			util.log('Asking for ' + code + ' price');
			var response = request.get(util.format(pricesContainer.endpoint, code));
			response.on('response', function(currencyCode, response){
				response.on('data', function(currencyCode, data){
					if(response.statusCode == 200){
						util.log(currencyCode + ' price: ' + data);
						util.log('Adding updated value to currency list');
						pricesContainer.prices[currencyCode] = parseFloat(data);
					} else{
						util.log('Not the expected answer for ' + currencyCode + ', preserving current price.');
					}
				}.bind(response, currencyCode));
			}.bind(response, code));

			response.on('error', function(code, error){
				util.error('Error retrieving ' + code + ' price: ' + error);
				util.error('Keeping current value');
			});
		}
		pricesContainer.lastUpdate = Date.now();
		util.log('Updated prices at ' + pricesContainer.lastUpdate.toString());
	}
}


pricesContainer.addCurrency('CAD');
pricesContainer.addCurrency('USD');
pricesContainer.addCurrency('CLP');

util.log('Obtaining initial prices list');
pricesContainer.updatePrices();

util.log('Now programming loop');

var periodicUpdate = setInterval(function(){
		pricesContainer.updatePrices();
	}, 60*1000);