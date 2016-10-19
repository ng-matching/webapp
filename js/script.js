var app = angular.module('matchApp', ['ngRoute']);

// sounds
var bg_sound    = new Audio("audio/bg.mp3"),

	level_complete=new Audio("audio/levelcomplete.mp3"),
	game_over   = new Audio("audio/lose.wav"),

	match_sound = new Audio("audio/2.mp3"),
	fail_sound  = new Audio("audio/fail.wav");

// change volume of sounds
bg_sound.volume = 0.5;

// set smoke plugins
// $.smkProgressBar({
// 	element: "body",
// 	bgColor: "#FFF",
// 	barColor: "#337ab7",
// 	content: "Loading . . ."
// });

app.config(['$routeProvider', function ($routeProvider) {
	$routeProvider.
	when('/', {
		templateUrl: "game-mode.html",
		controller: "arcadeController"
	});
	// when('/game-play', {
		// templateUrl: "game-play.html",
		// controller: "gameModeController"
	// });
	// when('/time-attack-mode', {
	// 	templateUrl: "time-attack.html",
	// 	controller: "timeAttackController"
	// }).
	// when('/arcade-mode', {
	// 	templateUrl: "arcade.html",
	// 	controller: "arcadeController"
	// });
}]);

app.service('cards', function () {
	var cards = [];

	return {
		getCards: function () {
			return cards;
		},
		setCards: function (difficulties, card_type) {
			var num_card_pair = 0;

			switch (difficulties) {
				case 'easy':
					num_card_pair = 4;
					break;

				case 'medium':
					num_card_pair = 8;
					break;
				
				case 'hard':
					num_card_pair = 12;
					break;
			}

			// cards = [];

			for (i = 1; i <= num_card_pair; i++) {
				cards.push(
					{id: (i*2-1), num: i, status: 0, image: card_type + "s/" + card_type+i+".png"}
				);
				cards.push(
					{id: (i*2), num: i, status: 0, image: card_type + "s/" + card_type+i+".png"}
				);
			}
			cards = shuffle(cards);
		}
	};
});

// app.service('card-type', function () {
// 	var card_type = "";

// 	return {
// 		getCardType: function () {
// 			return cards;
// 		},
// 		setCardType: function (card_type) {
// 			card_type = card_type;
// 		}
// 	};
// });

app.component('navBar', {
	templateUrl: "nav.html",
	controller: function navBarController ($scope, $rootScope, $route, $location, $timeout, cards) {
		var requirements = {
			difficulties: "",
			card_type: "",
		};

		$scope.showGamePlayTime = false;

		function step1 (difficulties) {
			requirements.difficulties = difficulties;
			$scope.difficulties = difficulties.toUpperCase();

			$scope.hideDifficultiesBtn = true;
			$scope.showCardType = true;
		}

		function step2 (cardType) {
			requirements.card_type = cardType;

			$scope.hideCardTypeBtn = true;
			$scope.filename = cardType + "s" + "/" + cardType + "s.png";
			// $scope.showCardTypeImage = true;
			// $scope.showOtherBtn = true;
		}

		function step3 () {
			cards.setCards( requirements.difficulties, requirements.card_type );

			$scope.hideGameMode = true;
			$scope.showGamePlay = true;
			$scope.showGamePlayTime = true;

			// $('#hoverReset').css({
			// 	'padding': "1px",
			//     'background': "#ffff99",
			//     'border-radius': "4px",
			//     'margin-top': "-1%",
			//     'margin-left': "-.5%",
			//     'cursor': "pointer",
			// });

			gameStart();
		}

		$scope.easy = function () {
			step1("easy");
		};
		$scope.medium = function () {
			step1("medium");
		};
		$scope.hard = function () {
			step1("hard");
		};

		$scope.colors = function () {
			step2("color");
			// $scope.showStartBtn = true;
		};
		$scope.logos = function () {
			step2("logo");
			// $scope.showStartBtn = true;
		};
		$scope.numbers = function () {
			step2("number");
			// $scope.showStartBtn = true;
		};
		$scope.pokers = function () {
			step2("poker");
			// $scope.showStartBtn = true;
		};

		$scope.showInfo = function () {
			bg_sound.pause();
			bg_sound.currentTime = 0;
			$location.path("/info");
		};
		$scope.exit = function () {
			window.close();
		};
		$scope.restart = function () {
			bg_sound.currentTime = 0;
			location.reload();
		};

		$scope.start = function () {
			step3();
			$scope.showStartBtn = false;
		};

		$scope.mode = "Arcade Mode";
		switch ( $route.current.loadedTemplateUrl ) {
			case "arcade.html":
				$scope.mode = "Arcade Mode";
				break;
			case "time-attack.html":
				$scope.mode = "Time Attack Mode";
				break;
		}

		function gameStart () {
			var time = $('#btn-time-num').stopwatch({format: "{MM}:{ss}"});
			time.stopwatch('start');

			// sound
			bg_sound.play();
			$(bg_sound).on('ended', function () { // play forever
				bg_sound.currentTime = 0;
				bg_sound.play();
			});

			var turn = 0;

			$scope.cards = cards.getCards();

			$scope.guess_number = 0;
			$scope.score = 0;

			$scope.flip = function (event, card_id) {
				var elem  = $(event.currentTarget);
				var index = getCardIndex(card_id);

				if ( $scope.cards[index].status === 1 ) {
					unreveal(elem, index);
					turn--;
				} else if ( $scope.cards[index].status === 0 ) {
					reveal(elem, index);
					turn++;
				}

				if ( turn === 2 ) {
					$scope.guess_number++;

					$timeout( function () {
						isMatch();

						if ( isFinish() ) {
							time.stopwatch('destroy');
							bg_sound.pause();
							bg_sound.currentTime = 0;

							level_complete.play();
						}

						turn = 0;
					}, 400);
				}
			};

			function reveal ( current_target, index ) {
				current_target.find('.front').css({
					'-webkit-transform': "rotateY(-180deg)",
					'transform': "perspective(600px) rotateY(-180deg)",
				});
				current_target.find('.back').css({
					'-webkit-transform': "perspective(600px) rotateY(0deg)",
					'transform': "perspective(600px) rotateY(0deg)",
				});

				console.log("status before: " + $scope.cards[index].status);
				$scope.cards[index].status = 1;
				console.log("status after: " + $scope.cards[index].status);
			}

			function unreveal ( current_target, index ) {

				current_target.find('.front').css({
					'-webkit-transform': "rotateY(0deg)",
					'transform': "perspective(600px) rotateY(-0deg)",
				});
				current_target.find('.back').css({
					'-webkit-transform': "perspective(600px) rotateY(180deg)",
					'transform': "perspective(600px) rotateY(180deg)",
				});

				console.log("status before: " + $scope.cards[index].status);
				$scope.cards[index].status = 0;
				console.log("status after: " + $scope.cards[index].status);
			}

			function isMatch () {
				var pair_card = [];

				for ( i = 0; i < $scope.cards.length && pair_card.length != 2; i++ ) {
					if ( $scope.cards[i].status === 1 ) {
						pair_card.push($scope.cards[i]);
					}
				}

				console.log(pair_card[0]);
				console.log(pair_card[1]);

				var isTrue = pair_card[0].num === pair_card[1].num;

				if ( isTrue ) {
					$scope.cards[ getCardIndex(pair_card[0].id) ].status = -1;
					$scope.cards[ getCardIndex(pair_card[1].id) ].status = -1;

					match_sound.currentTime = 0;
					match_sound.play();

					$scope.score++;
				} else {
					unreveal( $('.card-'+pair_card[0].id), getCardIndex(pair_card[0].id) );
					unreveal( $('.card-'+pair_card[1].id), getCardIndex(pair_card[1].id) );

					fail_sound.currentTime = 0;
					fail_sound.play();
				}

				console.log(isTrue);
				return isTrue;
			}

			function isFinish () {
				for(var i in $scope.cards)
		        	if(!$scope.cards[i].status) return false;
		        
		     	return true;
			}

			function getCardIndex (id) {
				for (var i in $scope.cards) {
					if ( $scope.cards[i].id === id )
						return i;
				}
			}
		}
	}
});

app.component('popup', {
	templateUrl: "popup.html"
});

// app.controller('gameModeController', function ($scope, $timeout, $location) {
// 	$scope.arcadeMode = function () {
// 		$.smkProgressBar({'status': "start"});
// 		$timeout(function () {
// 			$location.path("/arcade-mode");
// 		}, 800);
// 	};
// 	$scope.timeAttackMode = function () {
// 		$.smkProgressBar({'status': "start"});
// 		$timeout(function () {
// 			$location.path("/time-attack-mode");
// 		}, 800);
// 	};
// });

app.controller('arcadeController', function ($scope, $timeout, cards) {
	// arcade time
	var time = $('#btn-time-num').stopwatch({format: "{MM}:{ss}"});
	time.stopwatch('start');

	// sound
	// bg_sound.play();
	// $(bg_sound).on('ended', function () { // play forever
	// 	bg_sound.currentTime = 0;
	// 	bg_sound.play();
	// });

	var turn = 0;

	$scope.cards = cards.getCards();

	$scope.guess_number = 0;
	$scope.score = 0;

	$scope.flip = function (event, card_id) {
		var elem  = $(event.currentTarget);
		var index = getCardIndex(card_id);

		if ( $scope.cards[index].status === 1 ) {
			unreveal(elem, index);
			turn--;
		} else if ( $scope.cards[index].status === 0 ) {
			reveal(elem, index);
			turn++;
		}

		if ( turn === 2 ) {
			$scope.guess_number++;

			$timeout( function () {
				isMatch();

				if ( isFinish() ) {
					time.stopwatch('destroy');
					bg_sound.pause();
					bg_sound.currentTime = 0;

					level_complete.play();
				}

				turn = 0;
			}, 1000);
		}
	};

	function reveal ( current_target, index ) {
		current_target.find('.front').css({
			'-webkit-transform': "rotateY(-180deg)",
			'transform': "perspective(600px) rotateY(-180deg)",
		});
		current_target.find('.back').css({
			'-webkit-transform': "perspective(600px) rotateY(0deg)",
			'transform': "perspective(600px) rotateY(0deg)",
		});

		console.log("status before: " + $scope.cards[index].status);
		$scope.cards[index].status = 1;
		console.log("status after: " + $scope.cards[index].status);
	}

	function unreveal ( current_target, index ) {

		current_target.find('.front').css({
			'-webkit-transform': "rotateY(0deg)",
			'transform': "perspective(600px) rotateY(-0deg)",
		});
		current_target.find('.back').css({
			'-webkit-transform': "perspective(600px) rotateY(180deg)",
			'transform': "perspective(600px) rotateY(180deg)",
		});

		console.log("status before: " + $scope.cards[index].status);
		$scope.cards[index].status = 0;
		console.log("status after: " + $scope.cards[index].status);
	}

	function isMatch () {
		var pair_card = [];

		for ( i = 0; i < $scope.cards.length && pair_card.length != 2; i++ ) {
			if ( $scope.cards[i].status === 1 ) {
				pair_card.push($scope.cards[i]);
			}
		}

		console.log(pair_card[0]);
		console.log(pair_card[1]);

		var isTrue = pair_card[0].num === pair_card[1].num;

		if ( isTrue ) {
			$scope.cards[ getCardIndex(pair_card[0].id) ].status = -1;
			$scope.cards[ getCardIndex(pair_card[1].id) ].status = -1;

			match_sound.currentTime = 0;
			match_sound.play();

			$scope.score++;
		} else {
			unreveal( $('.card-'+pair_card[0].id), getCardIndex(pair_card[0].id) );
			unreveal( $('.card-'+pair_card[1].id), getCardIndex(pair_card[1].id) );

			fail_sound.currentTime = 0;
			fail_sound.play();
		}

		console.log(isTrue);
		return isTrue;
	}

	function isFinish () {
		for(var i in $scope.cards)
        	if(!$scope.cards[i].status) return false;
        
     	return true;
	}

	function getCardIndex (id) {
		for (var i in $scope.cards) {
			if ( $scope.cards[i].id === id )
				return i;
		}
	}
});

// app.controller('timeAttackController', function ($scope, $timeout, $location) {
// 	// time attack time
// 	var minutes = 1, // change this
// 		seconds = 0, // change this
// 		total_seconds = minutes * 60 + seconds;

// 	$('#time-attack').html( (total_seconds+"").toHHMMSS() );
// 	var time = new startTimer(total_seconds, $('#time-attack'), gameOver );

// 	// sound
// 	bg_sound.play();
// 	$(bg_sound).on('ended', function () { // play forever
// 		bg_sound.currentTime = 0;
// 		bg_sound.play();
// 	});

// 	var turn = 0;

// 	$scope.cards = [
// 		{index: 0, num: 1, status: 0},
// 		{index: 1, num: 1, status: 0},
// 		{index: 2, num: 2, status: 0},
// 		{index: 3, num: 2, status: 0},
// 		{index: 4, num: 3, status: 0},
// 		{index: 5, num: 3, status: 0},
// 		{index: 6, num: 4, status: 0},
// 		{index: 7, num: 4, status: 0}
// 	];

// 	$scope.guess_number = 0;
// 	$scope.score = 0;

// 	$scope.flip = function (event) {
// 		var current_target = $(event.target).parent();
// 		var index = current_target.data('index');

// 		console.log(index);

// 		if ( $scope.cards[index].status === 1 ) {
// 			unreveal(current_target, index);
// 			turn--;
// 		} else if ( $scope.cards[index].status === 0 ) {
// 			reveal(current_target, index);
// 			turn++;
// 		}

// 		if ( turn === 2 ) {
// 			$scope.guess_number++;

// 			$timeout( function () {
// 				if (! isMatch() )
// 					unrevealAll();

// 				if ( isFinish() ) {
// 					time.stop();
// 					bg_sound.pause();
// 					bg_sound.currentTime = 0;

// 					level_complete.play();
// 				}

// 				turn = 0;
// 			}, 1000);
// 		}
// 	};

// 	function reveal ( current_target, index ) {
// 		current_target.find('.front').css({
// 			'-webkit-transform': "rotateY(-180deg)",
// 			'transform': "perspective(600px) rotateY(-180deg)",
// 		});
// 		current_target.find('.back').css({
// 			'-webkit-transform': "perspective(600px) rotateY(0deg)",
// 			'transform': "perspective(600px) rotateY(0deg)",
// 		});

// 		console.log("status before: " + $scope.cards[index].status);
// 		$scope.cards[index].status = 1;
// 		console.log("status after: " + $scope.cards[index].status);
// 	}

// 	function unreveal ( current_target, index ) {

// 		current_target.find('.front').css({
// 			'-webkit-transform': "rotateY(0deg)",
// 			'transform': "perspective(600px) rotateY(-0deg)",
// 		});
// 		current_target.find('.back').css({
// 			'-webkit-transform': "perspective(600px) rotateY(180deg)",
// 			'transform': "perspective(600px) rotateY(180deg)",
// 		});

// 		console.log("status before: " + $scope.cards[index].status);
// 		$scope.cards[index].status = 0;
// 		console.log("status after: " + $scope.cards[index].status);
// 	}

// 	function revealAll () {
// 		for ( var i in $scope.cards ) {
// 			if ( $scope.cards[i].status === 0 ) {
// 				reveal( $('.flip3d[data-index='+(i)+']'), i );
// 				$scope.cards[i].status = -1;
// 			}
// 		}
// 	}

// 	function unrevealAll () {
// 		for ( i = 0; i < $scope.cards.length; i++ ) {
// 			if ( $scope.cards[i].status === 1 ) {
// 				unreveal( $('.flip3d[data-index='+(i)+']'), i );
// 			}
// 		}
// 	}

// 	function isMatch () {
// 		var pair_card = [];

// 		for ( i = 0; i < $scope.cards.length && pair_card.length != 2; i++ ) {
// 			if ( $scope.cards[i].status === 1 ) {
// 				pair_card.push($scope.cards[i]);
// 			}
// 		}

// 		var isTrue = pair_card[0].num === pair_card[1].num;

// 		console.log(pair_card[0]);
// 		console.log(pair_card[1]);

// 		if ( isTrue ) {
// 			$scope.cards[ pair_card[0].index ].status = -1;
// 			$scope.cards[ pair_card[1].index ].status = -1;

// 			match_sound.currentTime = 0;
// 			match_sound.play();

// 			$scope.score++;
// 		} else {
// 			fail_sound.currentTime = 0;
// 			fail_sound.play();
// 		}

// 		return isTrue;
// 	}

// 	function isFinish () {
// 		for(var i in $scope.cards)
//         	if(!$scope.cards[i].status) return false;
        
//      	return true;
// 	}

// 	function gameOver () {
// 		bg_sound.pause();
// 		bg_sound.currentTime = 0;

// 		game_over.play();
// 		alert("game over");

// 		revealAll();
// 	}
// });