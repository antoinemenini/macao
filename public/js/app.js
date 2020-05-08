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

function billClass(bill) {
  switch(bill) {
    case 10:
      return "secondary";
    case 20:
      return "secondary";
    case 30:
      return "secondary";
    case 40:
      return "secondary";
    case 50:
      return "info";
    case 60:
      return "success";
    case 70:
      return "primary";
    case 80:
      return "warning";
    case 90:
      return "danger";
    default:
      return "one";
  }
}

$(function () {
  var socket = io();

  var m_players;
  var m_casinos;

  var previousSocketId = Cookies.get('id');

  if(previousSocketId != undefined && previousSocketId != socket.id)
  {
    socket.emit('registerNew', previousSocketId);
  }

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
        strv += '<span class="badge badge-'+billClass(casinos[casino].bills[bill])+'">'+casinos[casino].bills[bill] + "$</span><br>";
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

  updatePlayers = function(players){
    $("#playersList").empty();
    for (var p in players) {
      var strv = "";

      // show the player's name
      strv += "<tr><td><i style=\"font-size: 1em;\" class=\"fas fa-user "+players[p].color+"\"></i> "+players[p].name;
      // allow the player to change his name
      if(p == socket.id)
      {
        strv +=" <a href=\"#nameModal\" data-toggle=\"modal\" data-target=\"#nameModal\"><i class=\"fas fa-edit text-secondary\"></i></a>";
      }
      strv += "<br>";
      // show the number of dice left
      for(var i=0; i<players[p].diceLeft; i++)
      {
        strv += '<i style="font-size: 1.7em;" class="fas fa-dice-two mr-1 ' + players[p].color + '"></i>';
      }

      strv += "</td></tr>";
      $("#playersList").append(strv);

    }
  }

  updateTableScores = function(players){

    $("#tableScore").empty();
    
    var strv = `<tr>
                  <th></th>`
    for (var s in players[Object.keys(players)[0]].scores){
    strv += `<th>Round ${+s + +1}</th>`
    }
    strv += `<th>Total</th>
    </tr>`;

    for (var p in players) {
      strv += `<tr>
               <td>${players[p].name}</td>`
      for (var s in players[p].scores){
        strv += `<td>${players[p].scores[s]}$</td>`
      }
      strv += `<td>${players[p].scores.reduce((a, b) => a + b, 0)}$</td>
               </tr>`;
    }

    $("#tableScore").append(strv);
  }

  socket.on('playersUpdate', function(players){
    m_players = players;
    updatePlayers(players);
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

  $("#resetGame").click(function(event){
    socket.emit('resetGame');
  });

  socket.on('nextTurn', function(casinos, currentPlayerId, players, round){
    Cookies.set('id', socket.id, { expires: 1 });
    m_casinos = casinos;
    m_players = players;
    updateCasinos(casinos);
    updatePlayers(players);
    $('#startRow').hide();
    $('.showAfterStart').show();
    $('#roundNumber').text(`Round ${round} / 3`);

    $('#messageToWait').html(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Waiting for ${m_players[currentPlayerId].name} to play...`)
    $('#rolledDice').hide();
    $('#roundOver').hide();
    $("#tableScore").hide();

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

  chooseDice = function(dice){
    socket.emit('placeDice', dice);
  }
  
  socket.on('diceRolled', function(rolledDice, currentPlayerId){
    $('#rollDice').hide();
    $('#messageToWait').hide();
    $('#roundOver').hide();

    $("#rolledDice").empty();
    var strv = "";
    for (dice in rolledDice){
      strv += `<a href="#" onclick="chooseDice(${dice})">`;
      for (var i = 1; i <= rolledDice[dice]; i++) {
        strv += `<i style="font-size: 3em;" class="fas fa-dice-${numberToString(dice)} 
        mr-1 ${m_players[currentPlayerId].color}"></i>`;
      }
      strv += `</a><span class="mr-4"></span>`;
    }
    $("#rolledDice").append(strv);

    $('#rolledDice').show();
  });

  socket.on('roundFinished', function(casinos, players){
    m_casinos = casinos;
    m_players = players;
    
    updateCasinos(casinos);
    updatePlayers(players);
    updateTableScores(players);

    $('#startRow').hide();
    $('.showAfterStart').show();

    $('#rolledDice').hide();
    $('#messageToWait').hide();
    $('#rollDice').hide();
    $('#roundOver').show();
    $("#tableScore").show();
  });

  $("#startNextRound").click(function(event){
    socket.emit('startNextRound');
  });
  
  socket.on('gameOver', function(casinos, players){
    m_casinos = casinos;
    m_players = players;
    
    updateCasinos(casinos);
    updatePlayers(players);
    updateTableScores(players);

    $('#startRow').hide();
    $('.showAfterStart').show();

    $('#rolledDice').hide();
    $('#messageToWait').hide();
    $('#rollDice').hide();
    $('#roundOver').hide();
    $('#gameOver').show();
    $("#tableScore").show();
  });

  socket.on('gameReset', function(players){
    m_players = players;
    updatePlayers(players);

    $('#startRow').show();
    $('.showAfterStart').hide();

    $('#rolledDice').hide();
    $('#messageToWait').hide();
    $('#rollDice').hide();
    $('#roundOver').hide();
    $('#gameOver').hide();
    $("#tableScore").hide();
  });

  socket.on('cannotJoinGame', function(){
    $('#cannotJoin').show();

    $('#startRow').hide();
    $('.showAfterStart').show();
    $('#rollDice').hide();
  });


});