$(function () {
  var socket = io();
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
});