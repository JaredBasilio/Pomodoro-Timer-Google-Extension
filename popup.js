let interval;

const countdownEl = document.getElementById('countdown');
countdownEl.innerHTML = `00:00`;

document.getElementById("start").addEventListener("click", startTime);
document.getElementById("pause").addEventListener("click", pauseTime);
document.getElementById("end").addEventListener("click", endSess);

document.getElementById("pause").classList.add('disabled');
document.getElementById("end").classList.add('disabled');



chrome.runtime.sendMessage({ cmd: 'GET_TIME' }, response => {
  if (response.time) {
    let time = new Date(Date.now() + response.time);
    if (response.running) {
      startTimer(time);

      //removes start button
      document.getElementById("start").classList.add('disabled');
      document.getElementById("pause").classList.remove('disabled');
      document.getElementById("end").classList.remove('disabled');
    } else {
      timeConversion(response.time);
    }
  }
});

function startTimer(time) {
  if (time.getTime() > Date.now()) {
    let timeMS = time.getTime() - Date.now();
    interval = setInterval(() => {
      if (timeMS >= 0) {
        //executes every 1000, background.js sends message when timems == 0
        timeConversion(timeMS);
        timeMS -= 1000;
      } else {
        chrome.runtime.sendMessage({ cmd: 'GET_TIME' }, response => {
          timeMS = response.time
        });
      }
    }, 1000);
  }
}

function startTime() { //function for the button
  chrome.runtime.sendMessage({ cmd: 'RUNNING' }, response => {
    console.log(response.cmd);
    if (response.cmd === 'RESUME') {//pause
      let time = new Date(Date.now() + response.time);
  
      //button styles
      document.getElementById("start").classList.add('disabled');
      document.getElementById("pause").classList.remove('disabled');
  
      startTimer(time);
    } else if (response.cmd === 'NEW') {//new session
      workMinutes = document.getElementById("workTime").value;
      shortMinutes = document.getElementById("sBreak").value;
      longMinutes = document.getElementById("lBreak").value;
      
  
      //button styles
      document.getElementById("start").classList.add('disabled');
      document.getElementById("pause").classList.remove('disabled');
      document.getElementById("end").classList.remove('disabled');
  
      //initializes the input values
      chrome.runtime.sendMessage({cmd: 'START_TIMER', time: workMinutes, short: shortMinutes, long: longMinutes})
  
      //starting will always be with work
      let time = new Date(Date.now() + workMinutes * 60000);
      startTimer(time);
    }
  });
}

function pauseTime() {
  chrome.runtime.sendMessage({ cmd: 'RUNNING' }, response => {
    //response.time == time left 
    if (response.time) {
      if (response.cmd == 'PAUSE') {
        clearInterval(interval);
        timeConversion(response.time);
        document.getElementById("pause").classList.add('disabled');
        document.getElementById("start").classList.remove('disabled');
      }
    }
  });
}

function endSess() {
  clearInterval(interval);
  interval = null;
  countdownEl.innerHTML = `${document.getElementById('workTime').value}:00`;
  document.getElementById("pause").classList.add('disabled');
  document.getElementById("end").classList.add('disabled');
  document.getElementById("start").classList.remove('disabled');
  
  chrome.runtime.sendMessage({cmd: 'END_TIMER'})
}

function timeConversion(timeMS) {
  const minutes = Math.floor(timeMS / 60000);
  let seconds = ((timeMS % 60000) / 1000).toFixed(0);
  seconds = seconds < 10 ? '0' + seconds : seconds;

  countdownEl.innerHTML = `${minutes}:${seconds}`;
}