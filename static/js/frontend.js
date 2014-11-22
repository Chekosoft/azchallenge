'use strict';
angular.module('BitcoinApp', [])
.controller('PanelController', ['$scope', '$http', '$interval',
	function($scope, $http, $interval){	
		$scope.values = {};
		$scope.update = Date.now();
		$scope.updating = false;

		$scope.update = function() {
			$scope.updating = true;
			$http.get('/prices.json')
			.success(function(data, status){
				if(status == 200){
					var results = {};
					for(var code in data){
						if(code !== "date"){
							results[code] = data[code];
						}
					}
					$scope.values = results;
					$scope.update = new Date(data["date"]);
					$scope.updating = false;
				}
			})
			.error(function(data, status){

			});
		}

		$scope.startRetrievingValues = function(){
			$scope.update();
			$interval(function(){
				$scope.update();
			}, 15000);
		}

		$scope.getUnorderedKeys = function(hash){
			if(!hash){
				return {}
			}
			return Object.keys(hash);
		}
	}
]);