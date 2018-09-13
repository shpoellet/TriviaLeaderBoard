# TriviaLeaderBoard

A simple Leader Board developed for the 2018 Get SmART trivia at the Gallagher
Bluedorn Performing Arts Center.

A host machine runs the server software and generates the Leader Board with
a green background designed for keying.

Judge machines are connected using a web browser connecting to port 3000 of
the host machine.

OSC commands are a accepted on port 50614 of the hose machine commands are
listed below.

Update display: /leaderboard/update

A save file is automatically generated to recall settings and scores when the
application is opened.

The leaderboard has a resolution of 1000 x 400 px

Operation:

Scores entered by the judges are immediately entered into the score matrix
but are not save to file until either the "Save" or "Update Display" buttons
are pressed or the update command is received over OSC.

A light blue score background at a judges station indicates that a score has
been entered but it has not been saved to the main matrix.  This is likely due
to a network error.

A Blue score at the host interface indicates that a score has been entered
by a judge but the value has not yet been saved to file.

A Red score at the host interface indicates that a score has been entered by
the operator of the host machine but the value has not yet been saved to file.
