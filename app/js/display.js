const {ipcRenderer} = require('electron');

var lineHeight = 40;

// var scores = [];
//
// for (var i = 0; i < 24; i++) {
//   scores[i] = {};
//   scores[i].place = i;
//   scores[i].name = "Team Name " + i;
//   scores[i].points = 25+i;
// }


ipcRenderer.on('setLineHeight', function(evnet, value){
  lineHeight = value;
})

ipcRenderer.on('displayScores', function(event, scores){
  var displayData = "";

  for (var i = 0; i < scores.length; i++) {
    displayData = displayData +
      '<div class="leaderLine" style="top:' + i*lineHeight + 'px;">' +
        '<div class="placeNumeral">';
        //always display the place #1
        if(i == 0) displayData = displayData + scores[i].place;
        //don't display repeat place numbers
        else if((i > 0) && (scores[i].place != scores[i-1].place)){
          displayData = displayData + scores[i].place;
        }

        displayData = displayData + '</div>' +
        '<div class="teamName">' + scores[i].name + '</div>' +
        '<div class="scoreNumeral">' + scores[i].score + '</div>' +
      '</div>';
  }


  document.getElementById('leaderBoard').innerHTML= displayData;
})


// var displayData = "";
//
// for (var i = 0; i < scores.length; i++) {
//   displayData = displayData +
//     '<div class="leaderLine" style="top:' + i*lineHeight + 'px;">' +
//       '<div class="placeNumeral">' + scores[i].place + '</div>' +
//       '<div class="teamName">' + scores[i].name + '</div>' +
//       '<div class="scoreNumeral">' + scores[i].points + '</div>' +
//     '</div>';
// }


// document.getElementById('leaderBoard').innerHTML= displayData;
