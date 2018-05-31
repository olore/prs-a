// content script - can interact with page

//document.body.style.border = "5px solid red";

console.log('setting up listener');
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  var commentNodes = $('.comment-body:visible').not('.p-0'); // github
  commentNodes.push($('.comment-content')); // bitbucket.org

  var commentTexts = commentNodes.map(function () {
    return $(this).text().trim();
  });
  commentTexts = $.makeArray(commentTexts);

  if (message && message.start === 1) {
    sendResponse({response: commentTexts});
    return true;
  } else {
    console.log('Message from the background script:');
    console.log('1 is positive, 0 is negative');

    commentTexts.forEach((c, i) => {
      let score = message.done[i].score,
        commentNode = $(commentNodes[i]);

      let div = document.createElement('div');
      div.innerText = `${(score * 100).toFixed(2)}% positive`;

      let thumb = document.createElement('div');
      thumb.innerText = '👍';
      thumb.style = `transform: rotate(${180 * (1 - score)}deg); width: 25px; height: 25px; padding: 2px; float: left`;

      commentNode[0].appendChild(thumb);
      commentNode[0].appendChild(div);
    });
    sendResponse({response: 'Hi from content script - I\'m all done!'});
    return true;
  }
});