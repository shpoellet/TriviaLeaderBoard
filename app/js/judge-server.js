var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path =  require('path');

var numJudges = 0;
var teams = 0;
var rounds = 0;

var gridCallback;
var scoreCallback;

var pushNewGame; //function that will be defined later
var pushNewData;
var pushNewScore;

exports.init = function(gCallback, sCallback){
  gridCallback = gCallback;
  scoreCallback = sCallback;
}

exports.setTeams = function(value){
  teams = value;
  pushNewGame && pushNewGame();
}

exports.setJudges = function(value){
  numJudges = value;
  pushNewGame && pushNewGame();
}

exports.setRounds = function(value){
  rounds = value;
  pushNewGame && pushNewGame();
}

exports.newData = function(){
  pushNewData && pushNewData()
};

exports.newScore = function(team, round, score){
  pushNewScore && pushNewScore(team, round, score);
}
//set path of files
app.use(express.static(path.resolve(__dirname+'/../html/judge-webpages')))

io.on('connection', function(socket){
  //send game paramaters
  socket.emit('gameParams', numJudges, teams, rounds);

  //send a slice of the score array
  socket.on('getGrid', function(teamFirst, length){
    socket.emit('grid', gridCallback(teamFirst, length));
  })

  function newGameParams(){
    io.emit('gameParams', numJudges, teams, rounds);
  }

  pushNewGame = newGameParams;


  function newDataGrid(){
    io.emit('newDataReady');
  }
  pushNewData = newDataGrid;

  socket.on('scoreEntered', function(team, round, score){
    scoreCallback(team, round, score);
  });

  function newScore(team, round, score){
    io.emit('newScore', team, round, score);
  }
  pushNewScore = newScore;

});







//start server
http.listen(3000, function(){
  console.log('listening on *:3000');
});
