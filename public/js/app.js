$(function () {
  var socket = io();
  socket.on('playersUpdate', function(players){
    $("#playersList").empty();
    for (var p in players) {
      $("#playersList").append("<li class=\"list-group-item\"><i style=\"font-size: 1em;\" class=\"fas fa-user "+players[p].color+"\"></i> "+players[p].name+"</li>");
    }
  });

  $("#formName").submit(function(event){
    event.preventDefault();
    $("#playersName").text($("#inputName").val());
    socket.emit('setName', $("#inputName").val());
  });
});