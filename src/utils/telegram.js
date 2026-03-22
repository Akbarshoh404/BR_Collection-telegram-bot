// TWA dev SDK wraps the window.Telegram.WebApp object. 
let twa;
try {
  twa = require('@twa-dev/sdk').default;
} catch(e) {
  // If we can't load it or we are in a pure browser env and it crashes, we'll use mock.
}

const IS_BROWSER = !window.Telegram || !window.Telegram.WebApp || !window.Telegram.WebApp.initDataUnsafe?.user;

export const telegram = IS_BROWSER ? {
  ready: () => console.log('Mock Telegram WebApp ready'),
  expand: () => console.log('Mock Telegram WebApp expanded'),
  close: () => console.log('Mock Telegram WebApp close'),
  sendData: (data) => console.log('Mock sendData', data),
  initDataUnsafe: {
    user: {
      username: 'BrowserTester',
      first_name: 'Browser',
      last_name: 'Tester'
    }
  },
  BackButton: {
    show: () => console.log('Mock BackButton show'),
    hide: () => console.log('Mock BackButton hide'),
    onClick: (cb) => { console.log('Mock BackButton onClick registered'); window._mockBackCb = cb; },
    offClick: (cb) => console.log('Mock BackButton offClick registered'),
  },
} : window.Telegram.WebApp; // Using window.Telegram.WebApp directly is safer than twa-dev/sdk's wrapper sometimes
