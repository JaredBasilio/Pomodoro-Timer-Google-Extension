let interval;

//when the pop-up is opened this is called
chrome.runtime.sendMessage({ cmd: 'GET_TIME' }, response => {
  if (response.time) {
    const time = new Date(response.time);
    console.log(response.running);
    if (response.running) {
      console.log('timer resumed at: '+ time);
      startTimer(time);
    } else {
      timeConversion(time.getTime() - Date.now());
    }
  }
});

let partition = 0;
// 0 = working, 1 = short break, 2 = long break

let numShort = 0;
// increments by 1 every short break, resets to 0 after 4

const countdownEl = document.getElementById('countdown');
countdownEl.innerHTML = `00:00`;

document.getElementById("start").addEventListener("click", startTime);
document.getElementById("pause").addEventListener("click", pauseTime);
document.getElementById("end").addEventListener("click", endSess);

function startTimer(time) {
  if (time.getTime() > Date.now()) {
    interval = setInterval(() => {
      //calculates the time remaining from the current time and the proposed
      //end time
      let timeMS = time.getTime() - Date.now();
      if (timeMS >= 0) {
        timeConversion(timeMS);
        timeMS -= 1000;
      } else {
        //transition()
        
      }
    }, 1000);
  }
}

function transition() {
  clearInterval(interval);
  interval = null;
  if (numShort < 4) {
    partition = (partition + 1) % 2;
  } else { //starts the long timer
    numShort = 0;
    partition = 2;
  }
  startTime();
}

function startTime() { //function for the button
  workMinutes = document.getElementById("workTime").value;
  shortMinutes = document.getElementById("sBreak").value;
  longMinutes = document.getElementById("lBreak").value;
  
  //sent to background.js the future time in ms
  chrome.runtime.sendMessage({cmd: 'START_TIMER', workMinutes: time, short: shortMinutes, long: longMinutes})

  let time = new Date(Date.now() + longMinutes * 60000);
  startTimer(time);
}

function pauseTime() {
  chrome.runtime.sendMessage({ cmd: 'RUNNING' }, response => {
    //response.time == time left 
    console.log(response)
    if (response.time) {
      if (response.cmd == 'PAUSE') {
        clearInterval(interval);
        interval = null;
        timeConversion(response.time);
        console.log('front-end paused')
      } else if (response.cmd == 'RESUME') {
        startTimer(new Date(response.time));
        console.log('front-end resumed');
      }
    }
  });
}

function endSess() {
  clearInterval(interval);
  interval = null;
  countdownEl.innerHTML = `${document.getElementById('workTime').value}:00`;
  //TODO change this to be just the worktime 

  chrome.runtime.sendMessage({cmd: 'END_TIMER'})
}

function currEvent() {
  if (partition == 0) {
    return "workTime"
  } else if (partition == 1) {
    numShort++;
    return "sBreak"
  } else {
    return "lBreak"
  }
}

function timeConversion(timeMS) {
  const minutes = Math.floor(timeMS / 60000);
  let seconds = ((timeMS % 60000) / 1000).toFixed(0);
  seconds = seconds < 10 ? '0' + seconds : seconds;

  countdownEl.innerHTML = `${minutes}:${seconds}`;
}

clearInterval(interval);
interval = null;
if (numShort < 4) {
  partition = (partition + 1) % 2;
} else { //starts the long timer
  numShort = 0;
  partition = 2;
}
startTime();