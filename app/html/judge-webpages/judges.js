'use strict';
var socket = io();

var judges;
var judgeSet = false;
var judgeID;
var teams;
var rounds;
var teamsFirst;
var teamsLength

//display positionaing data
var widthSansScores = 250;
var scoreWidth = 75;
var scoreBoxWidth = widthSansScores + rounds * scoreWidth;


function calculateTeams(){
  teamsLength = Math.floor(teams/judges);
  if(judgeID < (teams%judges)) teamsLength++;

  teamsFirst = teamsLength*judgeID;
  if(judgeID >= (teams%judges)) teamsFirst = teamsFirst + (teams%judges);
}


function drawGrid(){
  var displayData = "";

  for (var i = 0; i < teamsLength; i++) {
    displayData = displayData +
      '<div class="scoreLine">'+
        '<div class="teamID" id="teamID_'+i+'"></div>'+
        '<div class="teamName" id="teamName_'+i+'"></div>'+
        '<div class="roundScores" id="roundScores_'+i+'">';
    for (var j = 0; j < rounds; j++){
      displayData = displayData +
      '<div class="roundScore">'+
      '<input type="number" class="score_input"  id="RS_'+i+'_'+j+'"'+
        'onblur="scoreEntered('+i+','+j+')"></div>';
    }
    displayData = displayData + '</div></div>';
  }

  var headerData = "";
  for (var j = 0; j < rounds; j++){
    headerData = headerData + '<div class="roundScore">R '+(j+1)+'</div>';
  }

  document.getElementById('scoreBox').innerHTML= displayData;
  document.getElementById('roundScores_header').innerHTML= headerData;

  var scoreBoxWidth = widthSansScores + rounds * scoreWidth;

  document.getElementById('titleBox').style.minWidth = (scoreBoxWidth) +"px";
  document.getElementById('scoreBox').style.minWidth = (scoreBoxWidth) +"px";

  var scoresBoxes = document.getElementsByClassName('roundScores');
  for(var i=0; i<scoresBoxes.length; i++){
    scoresBoxes[i].style.width = (rounds * scoreWidth) + "px";
  }

  //show the score pane
  document.getElementById('scorePane').style.display = 'block';

}

function hideGrid(){
  document.getElementById('scorePane').style.display = 'none';
}


socket.on('gameParams', function(numJudges, inTeams, inRounds){
  judges = numJudges;
  teams = inTeams;
  rounds = inRounds;

  var select = document.getElementById("judgeSelect");
  select.options.length = 0;
  for(var i=0; i<judges; i++){
    select.options[i] = new Option('Judge '+ (i+1), i);
  }

  //if the jude id is set and valid redraw the grid
  if(judgeSet && (judgeID < judges)){
    select.value = judgeID;
    calculateTeams();
    drawGrid();
    socket.emit('getGrid', teamsFirst, teamsLength);
  }
  else hideGrid();
});

socket.on('grid', function(grid){
  for (var i=0; i<grid.length; i++){
    document.getElementById('teamID_'+i).innerHTML=grid[i].id;
    document.getElementById('teamName_'+i).innerHTML=grid[i].name;
    for (var j=0; j<rounds; j++){
      document.getElementById('RS_'+i+'_'+j).value=grid[i].points[j];
      document.getElementById('RS_'+i+'_'+j).style.backgroundColor = 'white';
    }
  }
})

socket.on('newDataReady', function(){
  socket.emit('getGrid', teamsFirst, teamsLength);
});


socket.on('newScore', function(team, round, score){
  if(judgeSet){
    if((team >= teamsFirst) & (team < teamsFirst + teamsLength)){
      var line = team - teamsFirst;
      document.getElementById('RS_'+line+'_'+round).value=score;
      document.getElementById('RS_'+line+'_'+round).style.backgroundColor = 'white';
    }
  }
});
//mouse clicks

document.getElementById("judgeButton").onclick = function(){
  judgeID = parseInt(document.getElementById("judgeSelect").value);
  judgeSet = true;

  calculateTeams();

  drawGrid();

  socket.emit('getGrid', teamsFirst, teamsLength);
};

//score entry

function scoreEntered(line, round){
  var input = parseInt(document.getElementById('RS_'+line+'_'+round).value);
  if(input >= 0){
    socket.emit('scoreEntered', line + teamsFirst, round, input);
    document.getElementById('RS_'+line+'_'+round).style.backgroundColor = 'lightBlue';
  }
  else{
    document.getElementById('RS_'+line+'_'+round).value = 0;
  }
}


document.addEventListener( 'keyup', function (e) {
  if ( e.keyCode == 13 ) {
    console.log('pressed')
    // Simulate clicking on the submit button.
    document.activeElement.blur();
  }
});
