// Initialize Firebase
  var config = {
    apiKey: "AIzaSyCleJVJXMhVz49Svle7JO3PIZNjltZ_Xtc",
    authDomain: "rps2-ff758.firebaseapp.com",
    databaseURL: "https://rps2-ff758.firebaseio.com",
    storageBucket: "rps2-ff758.appspot.com",
    messagingSenderId: "1084668906131"
  };
  firebase.initializeApp(config);

  var database = firebase.database();
  //Values: 
  var name = "", chats = "";

  // Get elements
  var preObject = document.getElementById('object'),
      nameEntry = document.getElementById('name-entry'),
        player1 = document.getElementById('player-one'),
        player2 = document.getElementById('player-two');

  // Create references
  var dbRefObject = database.ref().child('player');
    var chatItems = database.ref().child('chats');
    var dbPlayer1 = dbRefObject.child('1');
    var dbPlayer2 = dbRefObject.child('2'),
    dbPlayer1name = "";

  $('#add-chats').on('click', function(){
    chats = $('#chat-input').val().trim();

    chatItems.push({ chatlines: chats });

    chatItems.endAt().limitToLast(1).on('child_added', function(snapshot) {
      $('#chat-container').append('<p>' + snapshot.val().chatlines + '</p>');
    });
    $('#chat-input').val('');

  });

  $('#add-user').on('click', function(){

    name = $('#name-input').val().trim();

    dbRefObject.once('value', function(snapshot) {
      if (!snapshot.hasChild('1')) {
        // set db items
        dbPlayer1.set({ name: name, losses: 0, wins: 0, ties: 0 });
        //set first window body to playerone
        document.body.id = 'playerone';
        // get items for DOM. Will clear upon refresh.
        dbRefObject.child('1').child('name').once('value', function(snap) {
          nameEntry.innerHTML = '<p>Hi ' + snap.val() + '. You are Player 1.</p><p id="turn1"></p>';
        });
        // not sure 
        // playerOneGet();
      }
      else {
        dbPlayer2.set({ name: name, losses: 0, wins: 0 });
        //set first window body to playertwo
        document.body.id = 'playertwo';
        // get items for DOM
        dbRefObject.child('2').child('name').once('value', function(snap) {
          nameEntry.innerHTML = '<p>Hi ' + snap.val() + '. You are Player 2.</p><p id="turn2"></p>';
        });   

        dbRefObject.update({ turn: 1 });
      }
    });
	  return false;
  });

  // Sync object changes
  // dbRefObject.on('value', snap => {
  //   preObject.innerText = JSON.stringify(snap.val(), null, 3);
  // });

  // Needs to be outside to hit both windows
  dbRefObject.child('1').on('value', function(snap) {
    if (snap.child('name').val() != null && snap.child('choice').val() == null) {
      var playerText = '<p id="p1-name">' + snap.child('name').val() + '</p>';
          playerText += '<p id="p1-score">Wins: ' + snap.child('wins').val() + '  Losses: ' + snap.child('losses').val();
      player1.innerHTML = playerText;
    }
  });

  dbRefObject.child('2').on('value', function(snap) {
    if (snap.child('name').val() != null && snap.child('choice').val() == null) {
      var playerText = '<p id="p2-name">' + snap.child('name').val() + '</p>';
          playerText += '<p>Wins: ' + snap.child('wins').val() + '  Losses: ' + snap.child('losses').val();
      player2.innerHTML = playerText;
    }
  });


  // Listen for player turns
  dbRefObject.child('turn').on('value', function(snap) {
    var choices = '<ul><li id="rock"><a href="#">Rock</a></li><li id="paper"><a href="#">Paper</a></li><li id="scissors"><a href="#">Scissors</a></li></ul>';
    if ( snap.val() === 1 ) {
      dbRefObject.child('1').child('name').once('value', function(snap) {
        dbPlayer1name = snap.val();
      });
      
      $("#playerone #p1-name").after(choices);
      $("#turn1").html("It's your turn");
      $("#turn2").html("Waiting for " + dbPlayer1name);
    }
    else if ( snap.val() === 2 ){
      dbRefObject.child('2').child('name').once('value', function(snap) {
        dbPlayer2name = snap.val();
      });
      $("#playertwo #p2-name").after(choices);
      $("#turn1").html("Waiting for " + dbPlayer2name);
      $("#turn2").html("It's your turn");
    }
  });

  //Listen for scores
  dbRefObject.child('1').child('wins').on('value', function(snap) {
    if ( snap.val() != 0 ) {
      dbRefObject.child('1').child('name').once('value', function(snap) {
        if (snap.val() != null) {
          dbPlayer1name = snap.val();
          $('#player-scores').html('<h2>' + dbPlayer1name + ' wins!</h2>');
        }
      });
    }
  });
  dbRefObject.child('2').child('wins').on('value', function(snap) {
    if ( snap.val() != 0 ) {
      dbRefObject.child('2').child('name').once('value', function(snap) {
        if (snap.val() != null) {
          dbPlayer2name = snap.val();
          $('#player-scores').html('<h2>' + dbPlayer2name + ' wins!</h2>');
        }
      });
    }
  });
  dbRefObject.child('1').child('ties').on('value', function(snap) {
    if ( snap.val() != 0 && snap.val() != null ) {
      $('#player-scores').html('<h2>Tie Game!</h2>');
    }
  });
// Get choices
  $(document).on('click', '#player-one li a', function(){
    var clicked = $(this).parent().attr('id');
    dbPlayer1.update({ choice: clicked });
    dbRefObject.update({ turn: 2 });
    dbRefObject.child('1').once('value', function(snap) {
     if (snap.child('choice').val() != null) {
        $( "#playerone #player-one ul" ).replaceWith( '<h2>' + snap.child('choice').val() + '</h2>' );
      }
  });

  });
  $(document).on('click', '#player-two li a', function(){
    var clicked = $(this).parent().attr('id');
    dbPlayer2.update({ choice: clicked });

    dbRefObject.child('2').once('value', function(snap) {

    if (snap.child('choice').val() != null) {
      $("#playertwo #player-two ul").replaceWith('<h2>' + snap.child('choice').val() + '</h2>');
      $("#playerone #player-two #p2-name").after('<h2>' + snap.child('choice').val() + '</h2>');
      dbRefObject.child('1').once('value', function(snap) {
        $("#playertwo #player-one #p1-name").after('<h2>' + snap.child('choice').val() + '</h2>');
      });
    }
    compareObjects();
  });
    //dbRefObject.update({ turn: 2 });
  });
  function compareObjects(){

    dbRefObject.once('value', function(snapshot) {

      var p1choice = snapshot.child('1').child('choice').val(),
        p2choice = snapshot.child('2').child('choice').val(),
          p1wins = snapshot.child('1').child('wins').val()+1,
          p2wins = snapshot.child('2').child('wins').val()+1,
        p1losses = snapshot.child('1').child('losses').val()+1,
        p2losses = snapshot.child('2').child('losses').val()+1
         tieGame = snapshot.child('ties').val()+1;

      if ((p1choice == 'rock') && (p2choice == 'scissors')) {
        dbPlayer1.update({ wins: p1wins });
        dbPlayer2.update({ losses: p2losses });
      }
      else if ((p1choice == 'rock') && (p2choice == 'paper')){
        dbPlayer1.update({ losses: p1losses });
        dbPlayer2.update({ wins: p2wins });
      }
      else if ((p1choice == 'scissors') && (p2choice == 'rock')){
        dbPlayer1.update({ losses: p1losses });
        dbPlayer2.update({ wins: p2wins });
      }
      else if ((p1choice == 'scissors') && (p2choice == 'paper')){
        dbPlayer1.update({ wins: p1wins });
        dbPlayer2.update({ losses: p2losses });
      }
      else if ((p1choice == 'paper') && (p2choice == 'rock')){
        dbPlayer1.update({ wins: p1wins });
        dbPlayer2.update({ losses: p2losses });
      }
      else if ((p1choice == 'paper') && (p2choice == 'scissors')){
        dbPlayer1.update({ losses: p1losses });
        dbPlayer2.update({ wins: p2wins });;
      }
      else if (p1choice == p2choice){
        dbPlayer1.update({ ties: tieGame });
      }
     
    restart();

    });
  }

  function restart(){
    dbRefObject.child('1').update({ choice: null });
    dbRefObject.child('2').update({ choice: null });
    dbRefObject.update({ turn: 1 });
  }

  if(window.performance){
    if(performance.navigation.type  == 1 ){
      console.log('page reloaded');
    }
  }
 