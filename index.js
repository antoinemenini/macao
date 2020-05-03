/*
https://gamedevacademy.org/create-a-basic-multiplayer-game-in-phaser-3-with-socket-io-part-1/
*/
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const server = require('http').Server(app);
const io = require('socket.io')(server);

var gameStarted = false;

var players = {
};

var colors = {
    red: "",
    blue: "",
    yellow: "",
    green: "",
    black: "",
};

var currentPlayerInt = -1;
var currentPlayerId = "";

var casinos = {
    1: {
        bills: [],
        dice: {
            red: 0,
            blue: 0,
            yellow: 0,
            green: 0,
            black: 0
        },
        name: "table 1"
    },
    2: {
        bills: [],
        dice: {
            red: 0,
            blue: 0,
            yellow: 0,
            green: 0,
            black: 0
        },
        name: "table 1"
    },
    3: {
        bills: [],
        dice: {
            red: 0,
            blue: 0,
            yellow: 0,
            green: 0,
            black: 0
        },
        name: "table 1"
    },
    4: {
        bills: [],
        dice: {
            red: 0,
            blue: 0,
            yellow: 0,
            green: 0,
            black: 0
        },
        name: "table 1"
    },
    5: {
        bills: [],
        dice: {
            red: 0,
            blue: 0,
            yellow: 0,
            green: 0,
            black: 0
        },
        name: "table 1"
    },
    6: {
        bills: [],
        dice: {
            red: 0,
            blue: 0,
            yellow: 0,
            green: 0,
            black: 0
        },
        name: "table 1"
    },
}

var rolledDice;


function nextPlayer() {
    var n_players = Object.keys(players).length;
    currentPlayerInt = (currentPlayerInt + 1) % n_players;
    currentPlayerId = Object.keys(players)[currentPlayerInt];
    console.log("Current player: "+currentPlayerInt);
    console.log("Current player Id: "+currentPlayerId);
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function initCasinos(){
    bills = [60, 60, 60, 60, 60, 70, 70, 70, 70, 70, 80, 80, 80, 80, 80, 90, 90, 90, 90, 90,
    10, 10, 10, 10, 10, 10, 40, 40, 40, 40, 40, 40, 50, 50, 50, 50, 50, 50,
    20, 20, 20, 20, 20, 20, 20, 20, 30, 30, 30, 30, 30, 30, 30, 30];

    for (var c in casinos) {
        casinos[c]["bills"].push[10];
        var totalValue = 0;
        while(totalValue < 50)
        {
            var i = getRandomInt(bills.length);
            var v = bills[i];
            totalValue += v;
            bills.splice(i, 1);
            casinos[c]["bills"].push(v);
        }
        casinos[c]["bills"].sort().reverse();
    }
}

function rollDice(nbr)
{
    var res = [];
    for (var i = 0; i < nbr; i++)
    {
        var v = getRandomInt(6) + 1;
        res.push(v);
    }
    res.sort();
    return res;
}

function diceArrToObj(arr)
{
    res = {};
    for(var i=0; i<arr.length; i++)
    {
        if (arr[i] in res)
        {
            res[arr[i]] += 1;
        } else {
            res[arr[i]] = 1;
        }
    }
    return res;
}


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

    var n_players = Object.keys(players).length;

    if(n_players < 5 && !gameStarted)
    {
        // pick the first available color
        for(var c in colors) {
            if(colors[c] == ""){
                playerColor = c;
                colors[c] = socket.id;
                break;
            }
        }
        //console.log(socket.id);
        //console.log(players);
        var na = "Player "+(n_players+1);
        players[socket.id] = {
            name: na,
            color: playerColor,
            diceLeft: 8,
            total: 0
        };
        //console.log(socket.id);
        //console.log(players);

        io.emit('playersUpdate', players);
        socket.emit('casinosUpdate', casinos);
    }

    // when a player disconnects, remove them from our players object
    socket.on('disconnect', function (){
        console.log('user disconnected');
        if (socket.id in players)
        {
            colors[players[socket.id].color] = "";
        }
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
    socket.on('startGame', function() {
        gameStarted = true;
        nextPlayer();
        initCasinos();
        io.emit('gameStarted', casinos);
        io.emit('nextTurn', casinos, currentPlayerId, players);
    });
    socket.on('rollDice', function() {
        if(socket.id == currentPlayerId)
        {
            rolledDice = diceArrToObj(rollDice(players[currentPlayerId].diceLeft));
            console.log(rolledDice);
            io.emit('diceRolled', rolledDice, currentPlayerId);
        }
    });
    socket.on("placeDice", function(value) {
        if(socket.id == currentPlayerId)
        {
            var diceNbr = diceRolled[value];
            players[currentPlayerId].diceLeft -= diceNbr;
            casinos[value].dice[players[currentPlayerId].color] += diceNbr;
            nextPlayer();
            io.emit('nextTurn', casinos, currentPlayerId, players);
        }
    });
});

server.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})





