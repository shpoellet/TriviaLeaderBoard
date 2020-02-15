'use strict';
var judgeServer = require('./judge-server.js');
var saveFile = require('./save-file.js');
var OSC = require('osc-js');
const {ipcMain} = require('electron');

//osc object
const osc = new OSC({ plugin: new OSC.DatagramPlugin() })

var displayWindow;
var controlWindow;

var teams = 24;
var rounds = 8;
var judges = 4;

var teamData;
var placeArray;

//local functions
function createTeamArray(){
  //used to create the array that will hold the team data and scoresBoxes
  teamData = [];

  for (var i = 0; i < teams; i++) {
    teamData[i] = {};
    teamData[i].id = i;
    teamData[i].name = "Team " + (i + 1);
    teamData[i].place = 0;
    teamData[i].score = 0;
    teamData[i].points = [];
    for (var j = 0; j < rounds; j++){
      teamData[i].points[j] = 0;
    }
  }
}

function calculateScores(includes){
  for(var i = 0; i < teams; i++){
    teamData[i].score = 0;
    for(var j=0; j<rounds; j++){
      if(includes[j])
        {teamData[i].score = teamData[i].score + teamData[i].points[j];}
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

function gridSlice(start, length){
  var slice = [];
  for(var i=0; i<length; i++){
    slice[i] = teamData[start + i];
  }
  return slice;
}

function judgeScore(team, round, score){
  //teamData[team].points[round] = score;
  controlWindow.webContents.send('scoreEntered', team, round, score);
  judgeServer.newScore(team, round, score);
}



//events from gui
ipcMain.on('saveData', function(event, item, display, includes){
  //saves data that has been entered on the local gui
  //store new data in array
  for(var i = 0; i< teams; i++){
    teamData[i].name = item[i].name;
    teamData[i].points = item[i].points;
  }

  //calculate new scores
  calculateScores(includes);
  calculatePlace();
  controlWindow.webContents.send('displayAllData', teamData, includes);
  if(display){
    displayWindow.webContents.send('displayScores', placeArray);
  }
  judgeServer.newData();
  saveFile.saveToFile(teams, rounds, judges, teamData);
});

ipcMain.on('saveNames', function(event, item, display){
  //saves data that has been entered on the local gui
  //store new data in array
  for(var i = 0; i< teams; i++){
    teamData[i].name = item[i].name;
  }

  calculatePlace();
  controlWindow.webContents.send('displayNames', teamData);
  if(display){
    displayWindow.webContents.send('displayScores', placeArray);
  }
  judgeServer.newData();
  saveFile.saveToFile(teams, rounds, judges, teamData);
});


ipcMain.on('settingsOpen', function(){
  judgeServer.setTeams(30);
});

ipcMain.on('saveTeams', function(event, value){
  teams = value;
  controlWindow.webContents.send('setTeams', teams);
  createTeamArray();
  controlWindow.webContents.send('displayFirstData', teamData);
  judgeServer.setTeams(teams);
});

ipcMain.on('saveRounds', function(event, value){
  rounds = value;
  controlWindow.webContents.send('setRounds', rounds);
  createTeamArray();
  controlWindow.webContents.send('displayAllData', teamData);
  judgeServer.setRounds(rounds);
});

ipcMain.on('saveJudges', function(event, value){
  judges = value;
  judgeServer.setJudges(judges);
});

ipcMain.on('resetTeams', function(event){
  for(var i=0; i<teams; i++){
    teamData[i].name = 'Team ' + i;
  }
  controlWindow.webContents.send('displayFirstData', teamData);
  judgeServer.newData();
});

ipcMain.on('resetScores', function(event){
  for(var i=0; i<teams; i++){
    for(var j=0; j<rounds; j++){
      teamData[i].points[j] = 0;
    }
  }
  controlWindow.webContents.send('displayFirstData', teamData);
  judgeServer.newData();
});

ipcMain.on('resetAll', function(event){
  createTeamArray();
  controlWindow.webContents.send('displayFirstData', teamData);
  judgeServer.newData();
});

//osc events
osc.on('/leaderboard/update', (message) => {
  controlWindow.webContents.send('saveAndDisplay');
  console.log('OSC Trigger')
});

//public functions
exports.init = function(dWin, cWin){
  displayWindow = dWin;
  controlWindow = cWin;
  //create the server
  judgeServer.init(gridSlice, judgeScore)


  saveFile.loadFromFile(function(err, loadTeams, loadRounds, loadJudges, loadData){
    if(err){
      //load from file had an error so use the default settings
      console.log('Could not Load from File--Loading Default Settings');
      createTeamArray();
    }
    else{
      console.log('Successfully Loaded File--Using Saved Data');
      teams = loadTeams;
      rounds = loadRounds;
      judges = loadJudges;
      createTeamArray();

      for(var i=0; i<teams; i++){
        teamData[i].name = loadData[i].name.replace(/\0/g, '');
        teamData[i].points = loadData[i].points;
      }
    }
    //apply the settings
    judgeServer.setTeams(teams);
    judgeServer.setRounds(rounds);
    judgeServer.setJudges(judges);

    controlWindow.webContents.send('setTeams', teams);
    controlWindow.webContents.send('setRounds', rounds);
    controlWindow.webContents.send('setJudges', judges);

    judgeServer.newData();
    controlWindow.webContents.send('displayFirstData', teamData);


  });

  //start the osc server
  osc.open({port: 50614});
}
