// background script - CANNOT interact with page

console.log('hello from bg');

browser.pageAction.onClicked.addListener(() => {
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
          return browser.runtime.openOptionsPage();
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
          })
          .then((documents) => {
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

  getKeys() {
    return browser.storage.local.get()
      .then((storedSettings) => {
        return {
          API_HOST: storedSettings.host,
          API_KEY: storedSettings.key
        };
      });
  }

  sendMessageToCurrentTab(msg) {
    return browser.tabs.query({
      currentWindow: true,
      active: true
    })
    .then((tabs) => {
      return browser.tabs.sendMessage(
        tabs[0].id,
        msg);
    });
  } 

};
