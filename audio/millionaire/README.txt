Millionaire audio replacement guide
===================================

The National 3 prototype uses generated, original musical examples so the game
is fully playable without copyrighted recordings.

Future listening excerpts go in:
  audio/millionaire/placeholders/

Future interface and background sounds go in:
  audio/millionaire/sounds/
  audio/millionaire/music/

Update the paths in millionaire-question-bank.js and MILLIONAIRE_SOUND_CONFIG
in millionaire.js. Set a question audio object's `placeholder` value to false
after its real file has been supplied.

Missing files are handled safely and never stop the game.
