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
              <div class="col-sm-4">
                <h5 class="card-title"><i style="font-size: 4em; color: grey;" class="fas fa-dice-`+ numberToString(casino) +`"></i></h5>
                <h6 class="card-subtitle mb-2 text-muted">90 $ <br> 20 $ <br> 0 $</h6>
              </div>
              <div class="col-sm-8">
                <p class="card-text">
                  <i style="font-size: 1.5em;" class="fas fa-dice-one black"></i>
                  <i style="font-size: 1.5em;" class="fas fa-dice-one black"></i>
                  <i style="font-size: 1.5em;" class="fas fa-dice-one black"></i>
                  <br>
                  <i style="font-size: 1.5em;" class="fas fa-dice-one red"></i>                
                  <br>
                  <i style="font-size: 1.5em;" class="fas fa-dice-one green"></i>
                  <i style="font-size: 1.5em;" class="fas fa-dice-one green"></i>
                  <i style="font-size: 1.5em;" class="fas fa-dice-one green"></i>
                  <i style="font-size: 1.5em;" class="fas fa-dice-one green"></i>
                  <i style="font-size: 1.5em;" class="fas fa-dice-one green"></i>
                  <i style="font-size: 1.5em;" class="fas fa-dice-one green"></i>
                  <i style="font-size: 1.5em;" class="fas fa-dice-one green"></i>
                  <i style="font-size: 1.5em;" class="fas fa-dice-one green"></i>
                </p>
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

  socket.on('gameStarted', function(casinos){
    updateCasinos(casinos);
    $('#startRow').hide();
    $('#casinosRow').show();
    $('#diceRow').show();
  });
});