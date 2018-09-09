'use strict';

const {ipcMain} = require('electron');

var displayWindow;
var controlWindow;

var teams = 24;
var rounds = 8;

var teamData;
var placeArray;

//local functions
function createTeamArray(){
  //used to create the array that will hold the team data and scoresBoxes
  teamData = [];

  for (var i = 0; i < teams; i++) {
    teamData[i] = {};
    teamData[i].id = i;
    teamData[i].name = "Team Name " + i;
    teamData[i].place = 0;
    teamData[i].score = 0;
    teamData[i].points = [];
    for (var j = 0; j < rounds; j++){
      teamData[i].points[j] = 0;
    }
  }
}

function calculateScores(){
  for(var i = 0; i < teams; i++){
    teamData[i].score = 0;
    for(var j=0; j<rounds; j++){
      teamData[i].score = teamData[i].score + teamData[i].points[j];
    }
  }
}

function calculatePlace(){
  //calculates the place of the teams into a sorted array

  //copy the data into the place array
  placeArray = [];
  for(var i=0; i < teams; i++){
    placeArray[i] = {};
    placeArray[i].id = teamData[i].id;
    placeArray[i].name = teamData[i].name;
    placeArray[i].score = teamData[i].score;
  }

  //sort the array using the score
  placeArray.sort(function(a, b){
    if(a.score != b.score) return b.score - a.score;
    else return (a.id - b.id)
  });

  //assign place numbers
  var place = 1;
  var placeSkip = 1;
  placeArray[0].place = 1;
  for(var i=1; i < teams; i++){
    if(placeArray[i].score != placeArray[i-1].score){
      //if there is a tie the place should match and the next places skipped
      place = place + placeSkip;
      placeSkip = 1;
    }
    else placeSkip++;
    placeArray[i].place = place;
  }

  //copy the new place values into the teamData array
  for(var i=0; i < teams; i++){
    teamData[placeArray[i].id].place = placeArray[i].place;
  }
}



//events from gui
ipcMain.on('saveData', function(event, item, display){
  //saves data that has been entered on the local gui
  //store new data in array
  for(var i = 0; i< teams; i++){
    teamData[i].name = item[i].name;
    teamData[i].points = item[i].points;
  }

  //calculate new scores
  calculateScores();
  calculatePlace();
  controlWindow.webContents.send('displayAllData', teamData);
  if(display){
    displayWindow.webContents.send('displayScores', placeArray);
  }
});






//public functions
exports.init = function(dWin, cWin){
  displayWindow = dWin;
  controlWindow = cWin;

  controlWindow.webContents.send('setTeams', teams);
  controlWindow.webContents.send('setRounds', rounds);

  createTeamArray();

  controlWindow.webContents.send('displayAllData', teamData);
}
