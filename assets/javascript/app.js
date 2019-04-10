/* app.js  v3                  */
/* Unit 7: Rock Paper Scissors */
/* 9/Apr/2019                  */


// GLOBAL VARIABLES
// =======================================================================================

  var config = {  // Initialize Firebase
    apiKey: "AIzaSyCXUHcw46bHzkX4kYQ0RjjZN-DHc-RNlAs",
    authDomain: "bootcamp-test-firebase.firebaseapp.com",
    databaseURL: "https://bootcamp-test-firebase.firebaseio.com",
    projectId: "bootcamp-test-firebase",
    storageBucket: "bootcamp-test-firebase.appspot.com",
    messagingSenderId: "507271537393"
  };

  var db;   // DataBase


// OBJECTS
// =======================================================================================
var path = "assets/images/";
var images = [
		{imgStill : "rock.jpg",
		 imgPlay  : "LB16.gif",
		 imgAlt   : "Rock"
		},
		{imgStill : "paper.png",
		 imgPlay  : "AffectionateRawIguanodon-small.gif",
		 imgAlt   : "Paper"
		},
		{imgStill : "scissors.jpg",
		 imgPlay  : "giphy.gif",
		 imgAlt   : "Scissors"
		}
	];
var game = {
	status         : "start",   // start, userGaveName, wait4Second, ready2Play, choiceMade
	userName       : "",        // Player 1
	userDate       : "",
	userNumber     : 0,         // 1 = User / 2 - Opponent
	userWins       : 0,
	userLosses     : 0,
	userTies       : 0,
	userMessage    : "",
	playingKey     : "",
	opponentName   : "",        // Player 2
	opponentWins   : 0,
	opponentLosses : 0,
	opponentTies   : 0,
	opponentMessage: "",
	chat           : []
};


// FUNCTIONS (Definition)
// =======================================================================================
function RPSstill () {
	var img, foot;
	for (ct = 0; ct < images.length; ct++) {
		img  = $("<img>");
		foot = $("<div>");
		img.attr      ( "src", path + images [ct].imgStill );
		img.addClass  ( "card-img-top rpsImage" );
		img.attr      ( "alt", images [ct].imgAlt );
		
		foot.addClass ( "card-footer text-center" );
		foot.text     ( images [ct].imgAlt );
		
		$("#" + images [ct].imgAlt + "Card").empty  ();
		$("#" + images [ct].imgAlt + "Card").append ( img  );
		$("#" + images [ct].imgAlt + "Card").append ( foot );
	}
};

function RPSplay () {
	var img, foot;
	for (ct = 0; ct < images.length; ct++) {
		img  = $("<img>");
		foot = $("<div>");
		img.attr      ( "src", path + images [ct].imgPlay );
		img.addClass  ( "card-img-top rpsImage" );
		img.attr      ( "alt", images [ct].imgAlt );
		
		foot.addClass ( "card-footer text-center" );
		foot.text     ( images [ct].imgAlt );
		
		$("#" + images [ct].imgAlt + "Card").empty  ();
		$("#" + images [ct].imgAlt + "Card").append ( img  );
		$("#" + images [ct].imgAlt + "Card").append ( foot );
	}
};

         /* ---------- ---------- ---------- ---------- */

function showChat (chat) {
	game.chat = chat;
	$("#chat").empty ();
	for (ct = 0; ct < chat.length; ct ++) {
		if (chat [ct].trim () !== "") {
			$("#chat").append (chat [ct], "<br>");
		}
	}
};

         /* ---------- ---------- ---------- ---------- */

function restartGame (snap) {
	if (snap) {
		db.ref ( "RPSgame/playing/" + game.playingKey ).update ({
			player1Choice : "",
			player2Choice : "",
			winner        : 0,
			restartGame   : false
		});
		RPSplay ();
		game.status = "ready2Play";
	};
};

         /* ---------- ---------- ---------- ---------- */
		 
function processIndividualResult (winner) {
	var st = "";
	
	if ( ((game.userNumber === 1) && (winner === 1)) ||
	     ((game.userNumber === 2) && (winner === 2)) ) {
			st = "You WON!";
			alert ( "You WON!" );
	} else
	if ( ((game.userNumber === 1) && (winner === 2)) ||
	     ((game.userNumber === 2) && (winner === 1)) ) {
			st = "You LOST!";
			alert ( "You LOST!" );
	} else
	if (winner === 3) {
			st = "You both Tied!";
			alert ( "You Tied!" );
	}

	$("#row2").append ( "<span class='w-100'>" + st + "</span>" );
};
		 
function processResultsPlayer2 (snap, winner) {
	 $("#row2").empty ();
	 
	 $("#row2").html ( "<span class='w-100'>" +
					   "You played '"         +
					   snap.player2Choice	  +
					   "' and "               + 
					   game.opponentName      +
					   " chose '"             +
					   snap.player1Choice     +
					   "' </span>"
					 );
					 
	 processIndividualResult (winner);

	 $("#row2").append (
		"Games won: " + game.opponentWins + "   /   Games lost: " + game.opponentLosses + "   /   Games tied: " + game.opponentTies
	 );
};
		 
function processResultsPlayer1 (snap, winner) {
	 $("#row2").empty ();
	 
	 $("#row2").html ( "<span class='w-100'>" +
					   "You played '"         +
					   snap.player1Choice	  +
					   "' and "               + 
					   game.opponentName      +
					   " chose '"             +
					   snap.player2Choice     +
					   "' </span>"
					 );
					 
	 processIndividualResult (winner);

	 $("#row2").append (
		"Games won: " + game.userWins + "   /   Games lost: " + game.userLosses + "   /   Games tied: " + game.userTies
	 );
	 
	db.ref ( "RPSgame/playing/" + game.playingKey ).update ({
		restartGame        : true
	});
};
		 
function showResults (snap, winner) {
	if (game.userNumber === 1) {
			processResultsPlayer1 (snap, winner);
	} else
	if (game.userNumber === 2) {
			processResultsPlayer2 (snap, winner);
	}

	$("#row2").append (
		"<span class='w-100'> Play Again ! ! ! </span>"
	);
};

function player2IsWinner (snap) {
	db.ref ( "RPSgame/playing/" + game.playingKey ).update ({
		winner        : 2,
		player2Wins   : snap.player2Wins + 1,
		player1Losses : snap.player1Losses + 1
	});
	
	game.userLosses   ++;
	game.opponentWins ++;
};

function playersTie (snap) {
	db.ref ( "RPSgame/playing/" + game.playingKey ).update ({
		winner        : 3,   // ties
		player1Ties   : snap.player1Ties + 1,
		player2Ties   : snap.player2Ties + 1
	});

	game.userTies     ++;
	game.opponentTies ++;
};

function player1IsWinner (snap) {
	db.ref ( "RPSgame/playing/" + game.playingKey ).update ({
		winner        : 1,
		player1Wins   : snap.player1Wins + 1,
		player2Losses : snap.player2Losses + 1
	});
	
	game.userWins       ++;
	game.opponentLosses ++;
};

function checkWinner (snap) {
	var p1 = snap.player1Choice;
	var p2 = snap.player2Choice;
	if ( (p1 === "Rock"     && p2 === "Scissors") ||
	     (p1 === "Scissors" && p2 === "Paper"   ) ||
	     (p1 === "Paper"    && p2 === "Rock"    ) ) {
			 player1IsWinner (snap);
			 return 1;                 // Player 1 is the winner
	} else if (p1 === p2) {
			 playersTie (snap);
			 return 3;                 // Tie
	} else {
			 player2IsWinner (snap);
			 return 2;                 // Player 2 is the winner
	}
};

function checkChoisesMade (snap) {
	var winner = 0;
	if ( (snap.player1Choice !== "") &&
	     (snap.player2Choice !== "") &&
		 (snap.winner        === 0 ) ) {
			 winner = checkWinner (snap);
			 showResults (snap, winner);
		 }
};

         /* ---------- ---------- ---------- ---------- */

function launchChoiceListener () {
	db.ref ( "RPSgame/playing/" + game.playingKey ).on ("value",
		function ( snapShot )    {
			checkChoisesMade ( snapShot.val () );
		},
		function ( errorObject ) {
		 console.log("Errors handled: " + errorObject.code);
		});
		
	db.ref ( "RPSgame/playing/" + game.playingKey + "/restartGame" ).on ("value",
		function ( snapShot )    {
			restartGame ( snapShot.val () );
		},
		function ( errorObject ) {
		 console.log("Errors handled: " + errorObject.code);
		});
		
	db.ref ( "RPSgame/playing/" + game.playingKey + "/chat" ).on ("value",
		function ( snapShot )    {
			showChat ( snapShot.val () );
		},
		function ( errorObject ) {
		 console.log("Errors handled: " + errorObject.code);
		});
};

/* --------------------   Begin User 1   -------------------- */
function setUserWait () {
	game.userNumber = 1;
	
	db.ref ( "RPSgame/userWaiting" ).set ({
		userName : game.userName,
		date     : game.userDate
	});
	
	$("#row1").html ( "<h4> Waiting for a second player . . . </h4>" );
	game.status = "wait4Second";
};

function setGame1 (snap) {
	var arrKeys = Object.keys (snap);
	var foundPlayingKey = false;
	for (ct = 0; ct < arrKeys.length; ct ++) {
		if ( arrKeys [ct].includes (game.userName) ) {
			if (snap [arrKeys [ct]].player1Date === game.userDate) {
				game.playingKey   = arrKeys [ct];
				game.opponentName = snap [arrKeys [ct]].player2Name;
				foundPlayingKey = true;
			}
		}
	};
	
	if (foundPlayingKey) {
		launchChoiceListener ();
		$("#row1").html ( "<h5>" + game.userName + ", your opponent is " + game.opponentName + "</h5>" );
		RPSplay ();
		game.status = "ready2Play";
	};
};
/* --------------------    End  User 1   -------------------- */

/* --------------------   Begin User 2   -------------------- */
function setPairUsers (usrWaitValue) {
	game.userNumber = 2;
	
	if ((usrWaitValue.userName != game.userName) &&
	    (usrWaitValue.date     != game.date)) {
			db.ref ( "RPSgame/userWaiting" ).set ({   // Clear "waiting" area
				userName : "",
				date     : ""
			});

			db.ref ( "RPSgame/playing/" +             // Create "playing" area
			         usrWaitValue.userName + "-" +
					 game.userName ).set ({
				player1Name   : usrWaitValue.userName,
				player1Date   : usrWaitValue.date,
				player1Choice : "",
				player1Wins   : 0,
				player1Losses : 0,
				player1Ties   : 0,
				player2Name   : game.userName,
				player2Date   : game.userDate,
				player2Choice : "",
				winner        : 0,
				player2Wins   : 0,
				player2Losses : 0,
				player2Ties   : 0,
				restartGame   : false,
				chat          : [""]
			});
		};
};

function setGame2 (snap) {			  // Set game for player 2
	var arrKeys = Object.keys (snap);
	var max = arrKeys.length;
	var foundPlayingKey = false;
	for (ct = 0; ct < max; ct ++) {
		if ( arrKeys [ct].includes (game.userName) ) {
			if (snap [arrKeys [ct]].player2Date === game.userDate) {
				game.playingKey   = arrKeys [ct];
				game.opponentName = snap [arrKeys [ct]].player1Name;
				foundPlayingKey = true;
			};
		};
	};
	if (foundPlayingKey) {
		launchChoiceListener ();
		$("#row1").html ( "<h5>" + game.userName + ", your opponent is " + game.opponentName + "</h5>" );
		RPSplay ();
		game.status = "ready2Play";
	};
};

/* --------------------    End  User 2   -------------------- */


function saveChoice (choice) {
	game.status = "choiceMade";
	RPSstill ();
	if (game.userNumber === 1) {
		db.ref ( "RPSgame/playing/" + game.playingKey ).update ({
			player1Choice : choice,
			winner        : 0
		});
	} else {
	if (game.userNumber === 2) {
		db.ref ( "RPSgame/playing/" + game.playingKey ).update ({
			player2Choice : choice,
			winner        : 0
		});
	}
	}
};

         /* ---------- ---------- ---------- ---------- */

function checkUserWaiting () {
	db.ref ( "RPSgame/userWaiting" ).once ("value"). then (
		function ( snapShot )    {
			var usrWaitValue = snapShot.val ();
			
			if ((usrWaitValue === null) ||
				(usrWaitValue.userName === "")) {
				setUserWait ();               // Wait for a 2nd player
			} else {
				setPairUsers (usrWaitValue);  // There's a player waiting
			}
		},
		function ( errorObject ) {
			console.log ("Errors handled: " + errorObject.code);
	});
};

function processUserName (userName) {
	if (userName === "") {
		alert ("Please type your name");
	} else {
		$("#row1").empty ();
		var date = moment ().format();
		game.userName = userName;
		game.userDate = date;
		game.status   = "userGaveName";
		checkUserWaiting ();
	};
};

         /* ---------- ---------- ---------- ---------- */
		 
function clicChat (msg) {
	$("#chat-input").val ("");
	msg = game.userName + ": " + msg;
	game.chat.push (msg);
			
	db.ref ( "RPSgame/playing/" + game.playingKey ).update ({
		chat : game.chat
	});
};

// FUNCTION CALLS (Execution)
// =======================================================================================
firebase.initializeApp(config);             // Initialize Firebase
db = firebase.database ();

$("#clicUserName").on( "click",             // Clic button "Opponent Search"
	    function (event) {
			event.preventDefault();
		    processUserName ( $("#userName-input").val().trim() );
	    });

db.ref ( "RPSgame/playing/" ).on ("value",
	function ( snapShot )    {
		if ( (game.userNumber === 1) &&
		     (game.status     === "wait4Second") ) {
				setGame1 ( snapShot.val () );
		} else {
		if ( (game.userNumber === 2) &&
			 (game.status     === "userGaveName") ) {
				setGame2 ( snapShot.val () );
		}
		} 
	},
	function ( errorObject ) {
	 console.log("Errors handled: " + errorObject.code);
	});
	
$("#row3").on ( "click", 					// clic to make choice
				".rpsImage",
				function () {
					if (game.status === "ready2Play") {
						saveChoice ( $(this).attr ("alt") );
					}
				});

$("#clicChat").on( "click",             // Chat
	    function (event) {
			event.preventDefault();
			clicChat ( $("#chat-input").val().trim() );
	    }
);
