let timerID;
let timerTime; //future time
let timeLeft; //amount left

let numShort = 0;
let partition = 0;

let shortBreak;
let longBreak;

/**
 * 
    clearInterval(interval);
    interval = null;
    startTime();
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.cmd === 'START_TIMER') {
    timerTime = new Date(request.when); //date object for incoming time
    shortBreak = request.short;
    longBreak = request.long;

    console.log('started timer to end at: ' + timerTime);
    timerID = setTimeout(() => {
      //plays the sound
      playSound();

      //sends a message to popup that the timeout has ended
      if (numShort < 4) {
        partition = (partition + 1) % 2;
      } else { //starts the long timer
        numShort = 0;
        partition = 2;
      }

    }, timerTime.getTime() - Date.now());
  } else if (request.cmd === 'GET_TIME') {
    if (timerTime) {
      console.log('Time Resumed: ' + msToTime(timerTime - Date.now()));
    }
    sendResponse({ 
      time: timerID ? timerTime : timeLeft + Date.now(),
      running: timerID
    });
  } else if (request.cmd === 'END_TIMER') {
    clearTimeout(timerID);
    timeLeft = null;
    timerTime = null;
    console.log("session ended")
  } else if (request.cmd === 'RUNNING') {
    if (timerID) { //the timer is currently running
      timeLeft = timerTime - Date.now()
      timerID = null;

      console.log(`session is running, paused with ${msToTime(timeLeft)} time left`)

      sendResponse({
        cmd: 'PAUSE',
        time: timeLeft
      });
    } else if (timeLeft) { //the timer is paused
      timerID = setTimeout(() => { //restarts the timeout with the new ending time
        playSound();

        if (numShort < 4) {
          partition = (partition + 1) % 2;
        } else { //starts the long timer
          numShort = 0;
          partition = 2;
        }

      }, timeLeft + Date.now());

      sendResponse({
        cmd: 'RESUME',
        time: timeLeft + Date.now()
      });
      
      console.log(`session resumed with ${msToTime(timeLeft)}, new end time: ${msToTime(timeLeft + Date.now())}`);
    } else { //there is no current session
      console.log("session not running")
    }
  }
});

function playSound() {
  let url = chrome.runtime.getURL('audio.html');

  // set this string dynamically in your code, this is just an example
  // this will play success.wav at half the volume and close the popup after a second
  url += '?volume=0.5&src=sounds/digital.mp3&length=1000';

  chrome.windows.create({
      type: 'popup',
      focused: false,
      top: 1,
      left: 1,
      height: 1,
      width: 1,
      url,
  })

}

//converts ms time to readable hours:minutes:seconds:ms
function msToTime(duration) {
  var milliseconds = Math.floor((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}