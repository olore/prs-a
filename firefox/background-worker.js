// background script - CANNOT interact with page

console.log('hello from bg');

var API_HOST;
var API_KEY;

function init() {
  browser.storage.local.get()
    .then((storedSettings) => {
      API_HOST = storedSettings.host;
      API_KEY = storedSettings.key;
    });
}

browser.pageAction.onClicked.addListener(() => {
  console.log('clicked!');

  init()
    .then(() => {
  
    if (!API_HOST || !API_KEY || API_HOST === '' || API_KEY === '') {
      console.log('Opening options pages due to missing API_KEY or API_HOST');
      return browser.runtime.openOptionsPage();
    }


    console.log('going off to do work...');
    console.log(1, API_HOST);
    console.log(2, API_KEY);

    //move this somewhere
    var sendMessageToCurrentTab = function(msg) {
      return browser.tabs.query({
        currentWindow: true,
        active: true
      }).then((tabs) => {
        return browser.tabs.sendMessage(
          tabs[0].id,
          msg);
      }).catch((err) => console.error('TAB ERR', err))
    } 

    sendMessageToCurrentTab({start: 1})
      .then((resp) => {
        console.log("bg page has comments", resp.response);
        console.log("calling POST?");
        var documents = resp.response.map((comment, idx) => {
          return {
            "language": "en",
            "id": idx,
            "text": comment
          };
        });

        $.ajax({
          type: "POST",
          url: `https://${API_HOST}/text/analytics/v2.0/sentiment`,
          data: JSON.stringify({ documents: documents }),
          contentType: "application/json",
          headers: {
            "Content-Type": "application/json",
            "Ocp-Apim-Subscription-Key": API_KEY
          }
        })
        .done(function(foo) {
          console.log( "1 is positive, 0 is negative");
          console.log( "success", foo.documents );
          var sendMessageToCurrentTab = function(msg) {
            return browser.tabs.query({
              currentWindow: true,
              active: true
            }).then((tabs) => {
              return browser.tabs.sendMessage(
                tabs[0].id,
                msg);
            });
          }
          sendMessageToCurrentTab({done: foo.documents});
        })
        .fail(function(err) {
          console.log( "error", err );
        })
      })
      .catch((resp) => {
        console.log("UH OH", resp);
      });
    });
});

function notify(message) {
  browser.notifications.create({
    "type": "basic",
    "iconUrl": browser.extension.getURL("link.png"),
    "title": "You clicked a link!",
    "message": message.url
  });
}


browser.runtime.onMessage.addListener(notify);