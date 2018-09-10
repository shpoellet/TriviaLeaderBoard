const fs = require('fs');


var path = 'save.tlb';


exports.saveToFile = function(teams, rounds, judges, teamData){
  var bufSize = 3 + (16*teams) + (teams * rounds)

  var buf = Buffer.alloc(bufSize);

  buf.writeUInt8(teams, 0)
  buf.writeUInt8(rounds, 1)
  buf.writeUInt8(judges, 2)

  //write the names
  for(var i=0; i<teams; i++){
    buf.write(teamData[i].name, 3+(16*i), 16);
  }

  //write the scores
  var scoreStart = 3+(16*teams);
  var scoreIndex = 0;
  for(var i=0; i<teams; i++){
    for(var j=0; j<rounds; j++){
      buf.writeUInt8(teamData[i].points[j], scoreStart + scoreIndex);
      scoreIndex++;
    }
  }


  fs.open(path, 'w', function(err, fd) {
      if (err) {
          Console.log('Could not open save file');
      }

      fs.write(fd, buf, 0, buf.length, null, function(err) {
        if (err) {
          Console.log('Error writing to file');
        }
        fs.close(fd, function() {
            console.log('wrote the file successfully');
        });
      });
  });
}

exports.loadFromFile = function(callback){
  var teams;
  var rounds;
  var judges;

  fs.open(path, 'r', function(err, fd) {
    if (err) {
      console.log("Could not open Save file for reading")
      callback(true)
    }
    else{

      var paramBuf = Buffer.alloc(3);
      fs.read(fd, paramBuf, 0, 3, null, function(err) {
        if(err){
          console.log("Error reading params from file");
          fs.close(fd);
          callback(true);
        }
        else{
          teams = paramBuf.readUInt8(0)
          rounds = paramBuf.readUInt8(1)
          judges = paramBuf.readUInt8(2)

          var bufSize = (16*teams) + (teams * rounds)
          var buf = Buffer.alloc(bufSize);
          var returnData = [];

          fs.read(fd, buf, 0, buf.length, null, function(err) {
            if (err) {
              console.log("Error reading data from file");
              callback(true);
            }
            else{
              //read the names
              for(var i=0; i<teams; i++){
                returnData[i] = {};
                returnData[i].name = buf.toString('utf8', (16*i), (16*i)+16);
              }

              //read the scores
              var scoreStart = (16*teams);
              var scoreIndex = 0;
              for(var i=0; i<teams; i++){
                returnData[i].points = [];
                for(var j=0; j<rounds; j++){
                  returnData[i].points[j] = buf.readUInt8(scoreStart + scoreIndex);
                  scoreIndex++;
                }
              }
              console.log('read the file successfully');
              callback(false, teams, rounds, judges, returnData);
            }

            fs.close(fd, function() {
              console.log('closed the file successfully');
            });
          });
        }
      });
    }
  })
}
