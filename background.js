let timeout;
let timerTime; //future time
let timeLeft; //amount left
let backgroundInterval;

let numShort = 0;
let partition = 0;

let shortBreak;
let longBreak;
let workTime;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request.cmd);
  if (request.cmd === 'START_TIMER') {//this should be called only once every session
    timerTime = request.time * 60000; //work time in ms
    timeLeft = timerTime;

    //initializes the short break and long break timers, converts min to ms
    workTime = request.time * 60000; //work time in ms
    shortBreak = request.short * 60000;
    longBreak = request.long * 60000;

    console.log('started timer: ' + msToTime(timerTime));

    timer();
  } else if (request.cmd === 'GET_TIME') {
    sendResponse({ 
      //checks if timer is running, else return the temp timer left value
      time: timeLeft,
      running: timeout
    });
  } else if (request.cmd === 'END_TIMER') {

    //resets everything
    clearTimeout(timeout);
    clearInterval(backgroundInterval);
    timeout = null;
    backgroundInterval = null;
    timeLeft = null;
    timerTime = null;
    numShort = 0;
    paritition = 0;
    
    console.log("session ended")
  } else if (request.cmd === 'RUNNING') {
    if (timeout) { //the timer is currently running
      console.log("paused")

      //stops the timeout and interval
      clearTimeout(timeout);
      clearInterval(backgroundInterval);
      timeout = null;
      backgroundInterval = null;

      timerTime = timeLeft;

      sendResponse({
        cmd: 'PAUSE',
        time: timeLeft
      });
    } else if (timeLeft) { //the timer is paused
      console.log("resumed");

      timer();

      sendResponse({
        cmd: 'RESUME',
        time: timeLeft
      });
    } else {
      console.log('new')
      sendResponse({
        cmd: 'NEW',
        time: timeLeft
      });
    }
  }
});

//timer
function timer() {
  timeLeft = timerTime;
  timeout = setTimeout(() => { //restarts the timeout with the new ending time
    playSound();

    //check what the session was, 0 = working, 1 = break
    if (partition == 0) {
      //start the short break timer
      timerTime = shortBreak;
      numShort++;
      partition = 1;
    } else { //partition = 1;
      if (numShort == 4) {
        //start a long timer
        timerTime = longBreak;
        numShort = 0;
      } else {
        //start work again
        timerTime = workTime;
        partition = 0;
      }
    }
    timer();
  }, timerTime);

  backgroundInterval = setInterval(() => {
    if (timeLeft >= 0) {
      timeLeft -= 1000;
    }
    console.log(timeLeft);
  }, 1000)
}

//plays the sound
function playSound() {
  let url = chrome.runtime.getURL('audio.html');

  // set this string dynamically in your code, this is just an example
  // this will play success.wav at half the volume and close the popup after a second
  url += '?volume=0.5&src=sounds/digital.mp3&length=3000';

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