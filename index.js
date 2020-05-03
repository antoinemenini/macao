/*
https://gamedevacademy.org/create-a-basic-multiplayer-game-in-phaser-3-with-socket-io-part-1/
*/
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const server = require('http').Server(app);
const io = require('socket.io')(server);


var players = {
};

var colors = {
    red: "",
    blue: "",
    yellow: "",
    green: "",
    black: "",
}

var casinos = [
    {
        bills: [],
        dices: {
            red: 0,
            blue: 0,
            yellow: 0,
            green: 0,
            black: 0
        },
        name: "casino 1"
    },
    {
        bills: [],
        dices: {
            red: 0,
            blue: 0,
            yellow: 0,
            green: 0,
            black: 0
        },
        name: "casino 2"
    },
    {
        bills: [],
        dices: {
            red: 0,
            blue: 0,
            yellow: 0,
            green: 0,
            black: 0
        },
        name: "casino 3"
    },
    {
        bills: [],
        dices: {
            red: 0,
            blue: 0,
            yellow: 0,
            green: 0,
            black: 0
        },
        name: "casino 4"
    },
    {
        bills: [],
        dices: {
            red: 0,
            blue: 0,
            yellow: 0,
            green: 0,
            black: 0
        },
        name: "casino 5"
    },
    {
        bills: [],
        dices: {
            red: 0,
            blue: 0,
            yellow: 0,
            green: 0,
            black: 0
        },
        name: "casino 6"
    },
]


app.set('view engine', 'ejs')

app.use(express.static('public'),
    express.static(__dirname + "/node_modules/bootstrap/dist/css/"),
    express.static(__dirname + "/node_modules/jquery/dist/"),
    express.static(__dirname + "/node_modules/popper.js/dist/umd/"),
    express.static(__dirname + "/node_modules/bootstrap/dist/js/"),
    express.static(__dirname + "/node_modules/node_modules/js-cookie/src/"),
    express.static(__dirname + "/node_modules/@fortawesome/fontawesome-free/css/"),
    express.static(__dirname + "/node_modules/@fortawesome/fontawesome-free/js/"));

app.use(bodyParser.urlencoded({ extended: true }));


context = {};


app.get('/', function (req, res) {
    res.render('index', context);
});

io.on('connection', function (socket) {
    console.log('a new player connected');

    var playerColor;


    // pick the first available color
    for(var c in colors) {
        if(colors[c] == ""){
            playerColor = c;
            colors[c] = socket.id;
            break;
        }
    }

    var n_players = Object.keys(players).length;

    if(n_players < 5)
    {
        //console.log(socket.id);
        //console.log(players);
        var na = "Player "+(n_players+1);
        players[socket.id] = {
            name: na,
            color: playerColor
        };
        //console.log(socket.id);
        //console.log(players);

        io.emit('playersUpdate', players);
        socket.emit('casinosUpdate', casinos);
    }

    // when a player disconnects, remove them from our players object
    socket.on('disconnect', function (){
        console.log('user disconnected');
        colors[players[socket.id].color] = "";
        // remove this player from our players object
        delete players[socket.id];
        // emit a message to all players to remove this player
        io.emit('playersUpdate', players);
    });
    socket.on('setName', function(name) {
        console.log("set name: "+name);
        players[socket.id].name = name;
        io.emit('playersUpdate', players);
    });
});

server.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})





