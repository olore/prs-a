// background script - CANNOT interact with page

console.log('hello from bg');

chrome.pageAction.onClicked.addListener(() => {
  let bw = new BackgroundWorker();
  bw.handleButtonClick();
});

class BackgroundWorker {

  constructor() {
    console.log('plugin constructor');
  }

  handleButtonClick() {
    this.getKeys()
      .then((keys) => {
        let { API_HOST, API_KEY } = keys;

        if (!API_HOST || !API_KEY || API_HOST === '' || API_KEY === '') {
          console.log('Opening options pages due to missing API_KEY or API_HOST');
          return chrome.runtime.openOptionsPage();
        }

        console.log('going off to do work...');
        console.log(1, API_HOST, API_KEY);

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
            return documents;
          }).then((documents) => {
            if (documents.length > 0) {
              this.doPost(API_HOST, API_KEY, documents)
                .then((data) => {
                  this.sendMessageToCurrentTab({done: data.documents});
                });
            }
          })
          .catch((resp) => {
            console.log("UH OH", resp);
          });
      });
  }

  doPost(host, key, documents) {
    let url = `https://${host}/text/analytics/v2.0/sentiment`;
    return fetch(url, {
      method: "POST",
      body: JSON.stringify({ documents: documents }),
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": key
      }
    })
    .then((foo) => {
      return foo.json();
    })
    .catch((err) => {
      console.log(`error calling ${url}`, err );
      return Promise.reject(err);
    })
  }

  // TODO: can we promisify .get() so this code can be same as Firefox?
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
        chrome.tabs.sendMessage(
          tabs[0].id,
          msg,
          (response) => {
            resolve(response);
          });
      });
    });
  } 

};


// In Chrome, the page action button display logic happens here instead of manifest.json
var matchingrRule = {
  conditions: [
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: { 
        urlMatches: '.*\.github.com\/.*?\/pull\/.*' 
      },
    }),
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: { 
        urlMatches: '.*\.bitbucket.org\/.*?/pull-requests\/.*'
      },
    })
  ],
  actions: [ new chrome.declarativeContent.ShowPageAction() ]
};

chrome.runtime.onInstalled.addListener((details) => {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([matchingRule]);
  });
});