How much does one Bitcoin costs?
================================

A web application which retrieves the value of one Bitcoin in different currencies using the BitcoinAverage API.

Requirements
------------

The following packages must be installed before running the backend server.

* NodeJS 0.10.33
* express 4.10
* request 2.48.0
* underscore 1.7.0

Usage
-----

After installing the before mentioned packages, the backend server can be started with the following command

	node backend.js

Which enables in port 1337 the following endpoints:

*  / (root): the web interface.
* /prices.json: json file which has the updated prices from the server and the last update date and time.