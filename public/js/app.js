casinoTest = {
  1: {
      bills: [90, 10],
      dices: {
          red: 2,
          blue: 0,
          yellow: 8,
          green: 0,
          black: 1
      },
      name: "table 1"
  },
  2: {
    bills: [90, 10],
    dices: {
        red: 0,
        blue: 4,
        yellow: 4,
        green: 4,
        black: 4
    },
    name: "table 1"
},
3: {
  bills: [90, 10],
  dices: {
      red: 2,
      blue: 0,
      yellow: 2,
      green: 0,
      black: 1
  },
  name: "table 1"
},
4: {
  bills: [90, 10],
  dices: {
      red: 0,
      blue: 3,
      yellow: 0,
      green: 5,
      black: 1
  },
  name: "table 1"
}
}

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
                <p class="card-text">`

      for (color in casinos[casino].dices){
        for (var i = 1; i <= casinos[casino].dices[color]; i++) {
          strv += `<i style="font-size: 1.5em;" class="fas fa-dice-one mr-1 ` + 
            color + `"></i>`
        }
        if (casinos[casino].dices[color] > 0){
          strv += `<br>`
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
    $("#playersList").empty();
    for (var p in players) {
      var strv = "";
      strv += "<tr><td><i style=\"font-size: 1em;\" class=\"fas fa-user "+players[p].color+"\"></i> "+players[p].name;
      if(p == socket.id)
      {
        strv +=" <a href=\"#nameModal\" data-toggle=\"modal\" data-target=\"#nameModal\"><i class=\"fas fa-edit text-secondary\"></i></a>";
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
    updateCasinos(casinos);
    $('#startRow').hide();
    $('#casinosRow').show();
    $('#title').show();
    $('#diceRow').show();


    // il faut faire socket.emit('rollDices');
  });
  socket.on('dicesRolled', function(rolledDices, currentPlayerId){

    // il faut faire socket.emit('placeDices', nbr);
  };
});