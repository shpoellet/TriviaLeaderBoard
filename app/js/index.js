'use strict';

const {ipcRenderer} = require('electron');


var teams = 0;
var rounds = 0;
var judges = 0;
var widthSansScores = 430;
var scoreWidth = 75;
var scoreBoxWidth = widthSansScores + rounds * scoreWidth;

//local functions

//function to draw the IO boxes on the screen
function drawGrid(){
  var displayData = "";

  for (var i = 0; i < teams; i++) {
    displayData = displayData +
      '<div class="scoreLine">'+
        '<div class="teamID" id="teamID_'+i+'">'+i+'</div>'+
        '<div class="teamName" >'+
          '<input type="text" class="name_input"  id="teamName_'+i+'" '+
          'onblur="this.style.backgroundColor=`red`" maxlength="16"></div>'+
        '<div class="teamPlace" id="teamPlace_'+i+'"></div>'+
        '<div class="teamScore" id="teamScore_'+i+'"></div>'+
        '<div class="roundScores" id="roundScores_'+i+'">';
    for (var j = 0; j < rounds; j++){
      displayData = displayData +
      '<div class="roundScore">'+
      '<input type="number" class="score_input"  id="RS_'+i+'_'+j+'"'+
        'onblur="this.style.backgroundColor=`red`"></div>';
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

}

function saveScores(display){
//cycle through all input and if data is valid save it
  var saveData = [];
  var inputScore;
  for(var i = 0; i< teams; i++){
    saveData[i] = {};
    saveData[i].name = document.getElementById('teamName_'+i).value;
    //cycle through the score index
    saveData[i].points = [];
    for(var j = 0; j < rounds; j++){

      inputScore = parseInt(document.getElementById('RS_'+i+'_'+j).value);
      if (inputScore >= 0) saveData[i].points[j] = inputScore;
      else saveData[i].points[j] = 0;
    }
  }
  ipcRenderer.send('saveData', saveData, display);
}






//events from app
ipcRenderer.on('setTeams', function(event, value){
  //used to set the number of teams in the game
  teams = value;
  document.getElementById('teamsInput').value = teams;
  drawGrid();
})

ipcRenderer.on('setRounds', function(event, value){
  //used to set the number of rounds in the game
  rounds = value;
  document.getElementById('roundsInput').value = rounds;
  drawGrid();
})

ipcRenderer.on('setJudges', function(event, value){
  //used to set the number of rounds in the game
  judges = value;
  document.getElementById('judgesInput').value = judges;
})

ipcRenderer.on('displayAllData', function(event, teamData){
  //used to display all the data from the teamData array
  for(var i = 0; i< teams; i++){
    document.getElementById('teamName_'+i).value=teamData[i].name;
    document.getElementById('teamName_'+i).style.backgroundColor="white";
    document.getElementById('teamPlace_'+i).innerHTML=teamData[i].place;
    document.getElementById('teamScore_'+i).innerHTML=teamData[i].score;

    //cycle through the score index
    for(var j = 0; j < rounds; j++){
      document.getElementById('RS_'+i+'_'+j).value=teamData[i].points[j];
      document.getElementById('RS_'+i+'_'+j).style.backgroundColor="white";
    }
  }
})

ipcRenderer.on('scoreEntered', function(event, team, round, score){
  document.getElementById('RS_'+team+'_'+round).value=score;
  document.getElementById('RS_'+team+'_'+round).style.backgroundColor="blue";
})

ipcRenderer.on('saveAndDisplay', function(event){
  saveScores(true);
})

//mouse clicks
document.getElementById("settingsButton").onclick = function(){
  document.getElementById("settingsPane").style.display='block';
  // ipcRenderer.send('settingsOpen');
};

document.getElementById("returnButton").onclick = function(){
  document.getElementById("settingsPane").style.display='none';
};

document.getElementById("teamsSave").onclick = function(){
  var input = parseInt(document.getElementById('teamsInput').value);
  if (input > 0){
    ipcRenderer.send('saveTeams', input);
  }
  else{
    ipcRenderer.send('saveTeams', 1);
  }
};

document.getElementById("roundsSave").onclick = function(){
  var input = parseInt(document.getElementById('roundsInput').value);
  if (input > 0){
    ipcRenderer.send('saveRounds', input);
  }
  else{
    ipcRenderer.send('saveRounds', 1);
  }
};

document.getElementById("judgesSave").onclick = function(){
  var input = parseInt(document.getElementById('judgesInput').value);
  if (input > 0){
    ipcRenderer.send('saveJudges', input);
  }
  else{
    ipcRenderer.send('saveJudges', 1);
  }
};

document.getElementById('resetTeamsButton').onclick = function(){
  ipcRenderer.send('resetTeams');
};

document.getElementById('resetScoresButton').onclick = function(){
  ipcRenderer.send('resetScores');
};

document.getElementById('resetAllButton').onclick = function(){
  ipcRenderer.send('resetAll');
};

document.getElementById("saveButton").onclick = function(){saveScores(false)};

document.getElementById("displayButton").onclick = function(){saveScores(true)};




// var scores = [];
//
// for (var i = 0; i < teams; i++) {
//   scores[i] = {};
//   scores[i].name = "Team Name " + i;
//   scores[i].place = teams - i;
//   scores[i].score = i;
//   scores[i].points = [];
//   for (var j = 0; j < rounds; j++){
//     scores[i].points[j] = i+j;
//   }
// }

//
// var displayData = "";
//
// for (var i = 0; i < teams; i++) {
//   displayData = displayData +
//     '<div class="scoreLine">'+
//       '<div class="teamID" id="teamID_'+i+'">'+i+'</div>'+
//       '<div class="teamName" ><input type="text" class="name_input"  id="teamName_'+i+'"></div>'+
//       '<div class="teamPlace" id="teamScore_'+i+'">'+scores[i].place+'</div>'+
//       '<div class="teamScore" id="teamScore_'+i+'">'+scores[i].score+'</div>'+
//       '<div class="roundScores" id="roundScores_'+i+'">';
//   for (var j = 0; j < rounds; j++){
//     displayData = displayData +
//     '<div class="roundScore"><input type="number" class="score_input"  id="RS_'+i+'_'+j+'" onblur="this.style.backgroundColor=`red`"></div>';
//   }
//   displayData = displayData + '</div></div>';
// }
//
// var headerData = "";
// for (var j = 0; j < rounds; j++){
//   headerData = headerData + '<div class="roundScore">R '+(j+1)+'</div>';
// }
//
// document.getElementById('scoreBox').innerHTML= displayData;
// document.getElementById('roundScores_header').innerHTML= headerData;
//
// var scoresBoxes = document.getElementsByClassName('roundScores');
// for(var i=0; i<scoresBoxes.length; i++){
//   scoresBoxes[i].style.width = (rounds * 75) + "px";
// }
//
// document.getElementById('titleBox').style.minWidth = (500 +30 + rounds * 75) +"px";
// document.getElementById('scoreBox').style.minWidth = (500 +30 + rounds * 75) +"px";
//
//
// for(var i = 0; i< teams; i++){
//   document.getElementById('teamName_'+i).value=scores[i].name;
//   for(var j = 0; j < rounds; j++){
//     document.getElementById('RS_'+i+'_'+j).value=scores[i].points[j];
//   }
//
//
// }
