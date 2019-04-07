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
	status       : "start",   // start, userGaveName, wait4Second, ready2Play
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

/* --------------------   Begin User 1   -------------------- */
function setUserWait () {
	game.userNumber = 1;
	
	db.ref ( "RPSgame/userWaiting" ).set ({
		userName : game.userName,
		date     : game.userDate
	});
	
	$("#row1").html ( "<h4> Waiting for a second player . . . </h4>" );
	game.status = "wait4Second";
/*	
	db.ref ( "RPSgame/playing/" ).on ("value",
		function ( snapShot )    {
			console.log ( "User1 status", game.status );
			if (game.status === "wait4Second") {
				setGame1 ( snapShot.val () );
				// deseable que deje de escuchar este onValue
			};
		},
		function ( errorObject ) {
		 console.log("Errors handled: " + errorObject.code);
		});
*/
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
/*
			db.ref ( "RPSgame/playing/" ).on ("value",
				function ( snapShot )    {
					console.log ( "User2 status", game.status );
					if (game.status === "userGaveName") {
						setGame2 ( snapShot.val () );
						// deseable que deje de escuchar este onValue
					};
				},
				function ( errorObject ) {
				 console.log("Errors handled: " + errorObject.code);
			});
*/			
			db.ref ( "RPSgame/playing/" +             // Create "playing" area
			         usrWaitValue.userName + "-" +
					 game.userName ).set ({
				player1Name : usrWaitValue.userName,
				player1Date : usrWaitValue.date,
				player2Name : game.userName,
				player2Date : game.userDate
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


/* Tip:
- Unir a los jugadores por:
 + Nombre (que el usuario busque en una lista)
 + Id en la URL (que el usuario la envíe a su compañero)

- Para borrar:
  Si usas set(), 
  se sobrescriben los datos en la ubicación que especificas, 
  incluidos todos los nodos secundarios.
 -----------------------------------------------------------------
 
			//Sigue: escribir algo en la base (el tiro de cada jugador)
			db.ref ( "RPSgame/playing/" + game.playingKey ).update ({
				status : "prueba"  
			});

 */