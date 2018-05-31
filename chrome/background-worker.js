// background script - CANNOT interact with page

console.log('hello from bg');

var API_HOST;
var API_KEY;

class Plugin {

  constructor() {
    console.log('plugin constructor');
  }

  doWork() {
    this.getKeys()
      .then((keys) => {
        console.log(88, keys);
        let { API_HOST, API_KEY } = keys;
        if (!API_HOST || !API_KEY || API_HOST === '' || API_KEY === '') {
          console.log('Opening options pages due to missing API_KEY or API_HOST');
          return chrome.runtime.openOptionsPage();
        }

        console.log('going off to do work...');
        console.log(1, API_HOST);
        console.log(2, API_KEY);

        this.sendMessageToCurrentTab({start: 1})
          .then((resp) => {
            console.log("bg page has comments", resp.response);
            var documents = resp.response.map((comment, idx) => {
              return {
                "language": "en",
                "id": idx,
                "text": comment
              };
            });
            this.doPost(API_HOST, API_KEY, documents)
              .then((data) => {
                this.sendMessageToCurrentTab({done: data.documents});
              });
          })
          .catch((resp) => {
            console.log("UH OH", resp);
          });
      });
  }

  doPost(host, key, documents) {
    return $.ajax({
      type: "POST",
      url: `https://${host}/text/analytics/v2.0/sentiment`,
      data: JSON.stringify({ documents: documents }),
      contentType: "application/json",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": key
      }
    })
    .done((foo) => {
      console.log( "success", foo.documents );
      return Promise.resolve(foo);
    })
    .fail((err) => {
      console.log( "error", err );
      return Promise.reject(err);
    })
  }

  getKeys() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['host', 'key'], (storedSettings) => {
        resolve({
          API_HOST: storedSettings.host,
          API_KEY: storedSettings.key
        });
      });
    });
  }

  sendMessageToCurrentTab(msg) {

    return new Promise((resolve) => {
      chrome.tabs.query({
        currentWindow: true,
        active: true
      }, (tabs) => {
        console.log('sending message to tabs[0].id', tabs[0].id);
        chrome.tabs.sendMessage(
          tabs[0].id,
          msg,
          (response) => {
            console.log(11, response);
            console.log(22, chrome.runtime.lastError);
            resolve(response);
          });
      });
    });
  } 

};


chrome.pageAction.onClicked.addListener(() => {
// chrome.pageAction.onClicked.addListener(() => {
  console.log('CLICKED');
  let p = new Plugin();
  p.doWork();
});


var rule2 = {
  conditions: [
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: { 
        urlMatches: '.*.github.com\/.*?\/pull\/.*' 
      },
    })
    // new chrome.declarativeContent.PageStateMatcher({
    //   pageUrl: { hostEquals: 'www.google.com', schemes: ['https'] },
    //   css: ["input[type='password']"]
    // }),
    // new chrome.declarativeContent.PageStateMatcher({
    //   css: ["video"]
    // })
  ],
  actions: [ new chrome.declarativeContent.ShowPageAction() ]
};

chrome.runtime.onInstalled.addListener((details) => {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([rule2]);
  });
});