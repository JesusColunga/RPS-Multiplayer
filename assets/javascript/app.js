/* app.js  v3                  */
/* Unit 7: Rock Paper Scissors */
/* 6/Apr/2019                  */


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
	status       : "start",   // start, userGaveName, wait4Second, ready2Play, choiceMade
	userName     : "",
	userDate     : "",
	userNumber   : 0,
	playingKey   : "",
	opponentName : ""
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

function launchChoiceListener () {
	db.ref ( "RPSgame/playing/" + game.playingKey ).on ("value",
		function ( snapShot )    {
			checkWinner ( snapShot.val () );
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
				restartGame   : false
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

function checkUserWaiting () {
	db.ref ( "RPSgame/userWaiting" ).once ("value"). then (
			function ( snapShot )    {
				var usrWaitValue = snapShot.val ();
				
				if ((usrWaitValue === null) ||
				    (usrWaitValue.userName === "")) {
					setUserWait ();              // Wait for a 2nd player
				} else {
					setPairUsers (usrWaitValue);      // There's a player waiting
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

function checkWinner (snap) {
	var p1, p2;
	var w1=0; l1=0; t1=0; w2=0; l2=0; t2=0;
	if ( (snap.player1Choice !== "") &&
	     (snap.player2Choice !== "") &&
		 (snap.winner        === 0 ) ) {
			 p1 = snap.player1Choice;
			 p2 = snap.player2Choice;
			 if ( (p1 === "Rock"     && p2 === "Scissors") ||
			      (p1 === "Scissors" && p2 === "Paper"   ) ||
				  (p1 === "Paper"    && p2 === "Rock"    ) ) {
				db.ref ( "RPSgame/playing/" + game.playingKey ).update ({
					winner        : 1,
					player1Wins   : snap.player1Wins + 1,
					player2Losses : snap.player2Losses + 1
				});
				w1 = snap.player1Wins + 1;
				l2 = snap.player2Losses + 1;
			 } else if (p1 === p2) {
				db.ref ( "RPSgame/playing/" + game.playingKey ).update ({
					winner        : 3,   // ties
					player1Ties   : snap.player1Ties + 1,
					player2Ties   : snap.player2Ties + 1
				});
				t1 = snap.player1Ties + 1;
				t2 = snap.player2Ties + 1;
			 } else {
				db.ref ( "RPSgame/playing/" + game.playingKey ).update ({
					winner        : 2,
					player2Wins   : snap.player2Wins + 1,
					player1Losses : snap.player1Losses + 1
				});
				w2 = snap.player2Wins + 1;
				l1 = snap.player1Losses + 1;
			 }
			 if (game.userNumber === 1) {
				 $("#row2").empty ();
				 $("#row2").html ( "<span class='w-100'>" +
				                   "You chose '"          +
								   snap.player1Choice	  +
								   "' and "               + 
								   game.opponentName      +
								   " played '"            +
								   snap.player2Choice     + 
								   "'. Play Again ! ! !"
				                 );
				 console.log ("w1=", w1, "l1=", l1, "t1=", t1);
				 console.log ("w2=", w2, "l2=", l2, "t2=", t2);
				 console.log ("snap.player1Wins=", snap.player1Wins);
				 $("#row2").append (
					"Games won: " + w1 + "   /   Games lost: " + l1 + "   /   Games tied: " + t1
				 );
				db.ref ( "RPSgame/playing/" + game.playingKey ).update ({
					restartGame        : true
				});
			 } else
			 if (game.userNumber === 2) {
				 $("#row2").empty ();
				 $("#row2").html ( "<span class='w-100'>" +
				                   "You chose '"          +
								   snap.player2Choice	  +
								   "' and "               + 
								   game.opponentName      +
								   " played '"            +
								   snap.player1Choice     +
								   "'. Play Again ! ! !"
				                 );
				 $("#row2").append (
					"Games won: " + w2.toString() + "   /   Games lost: " + l2.toString() + "   /   Games tied: " + t2.toString()
				 );
			 } 
		 }
};

function restartGame (snap) {
	//console.log ( "(restartGame) snap=", snap );
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

				
/*
	db.ref ( "RPSgame/playing/" + game.playingKey ).set ({
		restartGame        : true
	});

---------------------------
	db.ref ( "RPSgame/playing/" + game.playingKey  + "/player1Choice" ).on ("value",
		function ( snapShot )    {
			checkWinner ( snapShot.val () );
		},
		function ( errorObject ) {
		 console.log("Errors handled: " + errorObject.code);
		});
		
	db.ref ( "RPSgame/playing/" + game.playingKey  + "/player2Choice" ).on ("value",
		function ( snapShot )    {
			checkWinner ( snapShot.val () );
		},
		function ( errorObject ) {
		 console.log("Errors handled: " + errorObject.code);
		});

*/