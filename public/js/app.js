function numberToString(number) {
  switch(number) {
    case "1":
      return "one";
    case "2":
      return "two";
    case "3":
      return "three";
    case "4":
      return "four";
    case "5":
      return "five";
    case "6":
      return "six";
    default:
      return "one";
  }
}

$(function () {
  var socket = io();

  var m_players;
  var m_casinos;

  updateCasinos = function(casinos){

    $("#casinosRow").empty();

    for (var casino in casinos){

      var strv = `  <div class="card" style="width: 25rem;">
        <div class="card-body">
          <div class="container">
            <div class="row">
              <div class="col-sm-3">
                <h5 class="card-title"><i style="font-size: 4em; color: grey;" class="fas fa-dice-`+ numberToString(casino) +`"></i></h5>
                <h6 class="card-subtitle mb-2 text-muted" style="text-align: center;">`;


      for (var bill in casinos[casino].bills){
        strv += casinos[casino].bills[bill] + " $<br>";
      }
                
      strv += `</h6>
              </div>
              <div class="col-sm-8">
                <p class="card-text">`;

      for (color in casinos[casino].dice){
        for (var i = 1; i <= casinos[casino].dice[color]; i++) {
          strv += '<i style="font-size: 1.5em;" class="fas fa-dice-'+ numberToString(casino) + ' mr-1 '; 
          strv += color + '"></i>';
        }
        if (casinos[casino].dice[color] > 0){
          strv += `<br>`;
        }
      }

      strv +=`</p>
              </div>
            </div>
          </div>
        </div>
      </div>`;

      $("#casinosRow").append(strv);
    }
  };

  socket.on('playersUpdate', function(players){
    m_players = players;
    $("#playersList").empty();
    for (var p in players) {
      var strv = "";
      strv += "<tr><td><i style=\"font-size: 1em;\" class=\"fas fa-user "+players[p].color+"\"></i> "+players[p].name;
      if(p == socket.id)
      {
        strv +=" <a href=\"#nameModal\" data-toggle=\"modal\" data-target=\"#nameModal\"><i class=\"fas fa-edit text-secondary\"></i></a>";
      }
      strv += "<br>";
      for(var i=0; i<players[p].diceLeft; i++)
      {
        strv += '<i style="font-size: 1em;" class="fas fa-dice-two mr-1 ' + players[p].color + '"></i>';
      }
      strv += "</td></tr>";
      $("#playersList").append(strv);

    }
  });

  $("#formName").submit(function(event){
    event.preventDefault();
    $('#nameModal').modal('hide');
    socket.emit('setName', $("#inputName").val());
  });

  $("#formName2").submit(function(event){
    event.preventDefault();
    socket.emit('setName', $("#inputName2").val());
  });

  $("#startGameButton").click(function(event){
    socket.emit('startGame');
  });

  socket.on('nextTurn', function(casinos, currentPlayerId){
    m_casinos = casinos;
    updateCasinos(casinos);
    $('#startRow').hide();
    $('.showAfterStart').show();
    console.log(currentPlayerId)
    console.log(socket.id)
    $('#messageToWait').text(`Waiting for ${m_players[currentPlayerId].name} to play...`)

    if (socket.id == currentPlayerId){
      $('#rollDice').show();
      $('#messageToWait').hide();
    } else {
      $('#rollDice').hide();
      $('#messageToWait').show();
    }
  });

  $("#rollDice").click(function(event){
    socket.emit('rollDice');
  });
  
  socket.on('diceRolled', function(rolledDice, currentPlayerId){

    // il faut faire socket.emit('placeDice', nbr);
  });
});