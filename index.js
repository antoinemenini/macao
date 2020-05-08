/*
https://gamedevacademy.org/create-a-basic-multiplayer-game-in-phaser-3-with-socket-io-part-1/
*/
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const server = require('http').Server(app);
const io = require('socket.io')(server);


var game = {
    gameStarted: false,
    currentPlayerInt: -1,
    currentPlayerId: "",
    rolledDice: {},
    round: 0
};


var players = {
};

var playersTurn = [];

var colors = {
    red: "",
    blue: "",
    yellow: "",
    green: "",
    black: "",
};

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
};

function nextPlayer() {
    var n_players = playersTurn.length;
    game.currentPlayerInt = (game.currentPlayerInt + 1) % n_players;
    game.currentPlayerId = playersTurn[game.currentPlayerInt];
    if(players[game.currentPlayerId].diceLeft == 0)
    {
        var turnFinished = true;
        // check if there is at least some player that has a dice remaining
        for(var p in players)
        {
            if(players[p].diceLeft > 0)
                turnFinished = false;
        }
        if(turnFinished)
        {
            game.currentPlayerInt = -1;
            game.currentPlayerId = "";
        } else {
            nextPlayer();
        }
    }
}

function getScores() {

    var scores = {
        red: 0,
        blue: 0,
        yellow: 0,
        green: 0,
        black: 0
    }

    for (var c in casinos) {
        /* ecid[nbr] will contain the color that has put nbr dice,
        If two colors have put the same number of dices, we do not put anything (it's a tie)
        */

        var ecid = ["", "", "", "", "", "", "", "", ""];
        for (col in casinos[c].dice) {
            var value = casinos[c].dice[col];
            if(value > 0)
            {
                if(ecid[value] == "") // no-one has taken the spot yet!
                    ecid[value] = col;
                else // it's a tie: no-one wins
                    ecid[value] = "tie";
            }
        }

        ecid = ecid.filter(elt => elt != ""); // remove empty elements
        ecid = ecid.filter(elt => elt != "tie"); // remove ties
        ecid.reverse();

        ecid = ecid.slice(0, casinos[c].bills.length);

        for(var i=0; i<ecid.length; i++)
        {
            scores[ecid[i]] += casinos[c].bills[i];
        }
    }

    for (var p in players) {
        players[p].scores.push(scores[players[p].color]);
    }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function initRound() {
    bills = [60, 60, 60, 60, 60, 70, 70, 70, 70, 70, 80, 80, 80, 80, 80, 90, 90, 90, 90, 90,
    10, 10, 10, 10, 10, 10, 40, 40, 40, 40, 40, 40, 50, 50, 50, 50, 50, 50,
    20, 20, 20, 20, 20, 20, 20, 20, 30, 30, 30, 30, 30, 30, 30, 30];

    for (var c in casinos) {
        var totalValue = 0;
        casinos[c]["bills"] = [];
        while(totalValue < 50)
        {
            var i = getRandomInt(bills.length);
            var v = bills[i];
            totalValue += v;
            bills.splice(i, 1);
            casinos[c]["bills"].push(v);
        }
        casinos[c]["bills"].sort().reverse();
        for (col in casinos[c]["dice"])
        {
            casinos[c]["dice"][col] = 0;
        }
    }

    for (var p in players)
    {
        players[p].diceLeft = 8;
    }


    game.rollDice = {};
    game.currentPlayerId = "";
    var n_players = Object.keys(players).length;
    game.round++;
    game.currentPlayerInt = game.round % n_players;
}

function resetGame()
{
    for(var p in players)
    {
        players[p].scores = [];
    }
    initRound();
    game.round = 0;
    game.gameStarted = false;
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
    express.static(__dirname + "/node_modules/js-cookie/src/"),
    express.static(__dirname + "/node_modules/@fortawesome/fontawesome-free/css/"),
    express.static(__dirname + "/node_modules/@fortawesome/fontawesome-free/js/"));

app.use(bodyParser.urlencoded({ extended: true }));


context = {};


app.get('/', function (req, res) {
    res.render('index', context);
});

io.on('connection', function (socket) {
    var playerColor; 

    var n_players = Object.keys(players).length;

    if(n_players < 5 && !game.gameStarted)
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
            scores: []
        };
        //console.log(socket.id);
        //console.log(players);

        io.emit('playersUpdate', players);
        socket.emit('casinosUpdate', casinos);
    }

    // when a player disconnects, remove them from our players object if the game has not started
    socket.on('disconnect', function (){
        if(!game.gameStarted)
        {
            if (socket.id in players)
            {
                colors[players[socket.id].color] = "";
            }
            // remove this player from our players object
            delete players[socket.id];
            // emit a message to all players to remove this player
            io.emit('playersUpdate', players);
        }  else {
            console.log("a player has left while the game was started");
        }
    });
    socket.on('setName', function(name) {
        players[socket.id].name = name;
        io.emit('playersUpdate', players);
    });
    socket.on('startGame', function() {
        // first we add all players to playersTurn
        for(var p in players)
        {
            playersTurn.push(p);
        }
        game.gameStarted = true;
        initRound();
        nextPlayer();
        io.emit('nextTurn', casinos, game.currentPlayerId, players, game.round);
    });
    socket.on('rollDice', function() {
        if(socket.id == game.currentPlayerId)
        {
            game.rolledDice = diceArrToObj(rollDice(players[game.currentPlayerId].diceLeft));

            io.emit('diceRolled', game.rolledDice, game.currentPlayerId);
        }
    });
    socket.on("placeDice", function(value) {

        if(socket.id == game.currentPlayerId)
        {   
            var diceNbr = game.rolledDice[value];
            players[game.currentPlayerId].diceLeft -= diceNbr;
            casinos[value].dice[players[game.currentPlayerId].color] += diceNbr;
            game.rolledDice = {};
            nextPlayer();

            if(game.currentPlayerInt == -1)
            {
                getScores();
                if(game.round < 3)
                    io.emit('roundFinished', casinos, players);
                else
                {
                    io.emit('gameOver', casinos, players);
                    resetGame()
                }
            } else {
                io.emit('nextTurn', casinos, game.currentPlayerId, players, game.round);
            }
        }
    });
    socket.on("startNextRound", function() {
        initRound();
        nextPlayer();
        io.emit('nextTurn', casinos, game.currentPlayerId, players, game.round);
    });
    socket.on("registerNew", function(previousSocketId) {
        if(previousSocketId in players && game.gameStarted)
        {
            // the player was already registered
            Object.defineProperty(players, socket.id,
                Object.getOwnPropertyDescriptor(players, previousSocketId));
            for(var j=0; j<playersTurn.length; j++)
            {
                if(playersTurn[j] == previousSocketId)
                {
                    playersTurn[j] = socket.id;
                    break;
                }
            }
            delete players[previousSocketId];
            colors[players[socket.id].color] = socket.id;

            if(game.currentPlayerId == previousSocketId)
            {
                // it's the player's turn
                game.currentPlayerId = socket.id;
                if(Object.keys(game.rolledDice).length > 0)
                {
                    // the player has already selected the dice
                    socket.emit('nextTurn', casinos, game.currentPlayerId, players, game.round);
                    socket.emit('diceRolled', game.rolledDice, game.currentPlayerId);
                } else {
                    socket.emit('nextTurn', casinos, game.currentPlayerId, players, game.round);
                }
            } else {
                socket.emit('nextTurn', casinos, game.currentPlayerId, players, game.round);
            }

        } else {
            // We should not accept this player
        }
    });
});

server.listen(3000, function () {
})





