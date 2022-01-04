let interval;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('listened')
  const time = Date(response.time);
  startTimer(time);
});

//when the pop-up is opened this is called
chrome.runtime.sendMessage({ cmd: 'GET_TIME' }, response => {
    const time = Date(response.time);
    startTimer(time);
});

let partition = 0;
// 0 = working, 1 = short break, 2 = long break

let numShort = 0;
// increments by 1 every short break, resets to 0 after 4

const countdownEl = document.getElementById('countdown');

document.getElementById("start").addEventListener("click", startTime);

function startTimer(time) {
  if (time.getTime() > Date.now()) {
    interval = setInterval(() => {
      let timeMS = time.getTime() - Date.now();
      if (time >= 0) {
        const minutes = Math.floor(timeMS / 60000);
        let seconds = ((timeMS % 60000) / 1000).toFixed(0);
        seconds = seconds < 10 ? '0' + seconds : seconds;
    
        countdownEl.innerHTML = `${minutes}:${seconds}`;
        timeMS -= 1000;
      } else {
        clearInterval(interval);
        interval = null;
        if (numShort < 4) {
          partition = (partition + 1) % 2;
        } else {
          numShort = 0;
          partition = 2;
        }
        startTime();
      }
    }, 1000);
  }
}

function startTime() { //function for the button
  startingMinutes = document.getElementById(currEvent()).value;
  sound = document.getElementById("sound");
  
  let time = new Date(Date.now() + startingMinutes * 60000); //future date object
  
  //sent to background.js the future time in ms
  chrome.runtime.sendMessage({cmd: 'START_TIMER', when: time})
  startTimer(time);
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