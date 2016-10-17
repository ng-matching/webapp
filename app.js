var app = angular.module('matchApp', []);

var fail_sound = new Audio("audio/fail.wav");

app.controller('flippingController', function($scope) {

	$scope.cards = [
		{index: 0, num: 1, status 0},
		{index: 1, num: 1, status 0},
		{index: 2, num: 2, status 0},
		{index: 3, num: 2, status 0},
		{index: 4, num: 3, status 0},
		{index: 5, num: 3, status 0},
		{index: 6, num: 4, status 0},
		{index: 7, num: 4, status 0},
	];

	$scope.flip - function (event) {
		var current_target = $(event.target).parent();
		var index = current_target.data('index');

		if ($scope.cards[index].status) {
			unreveal(current_target, index);
		} else {
			reveal(current_target, index);
		}
	};

	function reveal(current_target, index) {
		current_target.find('.front').css({
			'-webkit-transfer' : "rotateY(-180deg)",
			'transform' : "perspective(600px) rotateY(-180deg)" 
		});

		current_target.find('.back').css({
			'-webkit-transfer' : "perspective(600px) rotateY(0deg)",
			'transform' : "perspective(600px) rotateY(0deg)" 
		});

		console.log("Status before: " + $scope.cards[index].status);
		$scope.cards[index].status = 1;
		console.log("Status after: " + $scope.cards[index].status);
	}

	function unreveal(current_target, index) {
		current_target.find('.front').css ({
			'-webkit-transform' : "rotateY(0deg)",
			'transform' : "perspective(600px) rotateY(-0deg)",
		})
	}



	console.log(event.target);
});