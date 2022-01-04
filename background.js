let timerID;
let timerTime;
let sound;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.cmd === 'START_TIMER') {
    timerTime = new Date(request.when); //date object for incoming time
    console.log('started timer to end at: ' + timerTime);
    timerID = setTimeout(() => {
       console.log('time up')
    }, timerTime.getTime() - Date.now());
  } else if (request.cmd === 'GET_TIME') {
    console.log("got time: " + timerTime);
    sendResponse({ 
      time: timerTime 
    });
  }
});