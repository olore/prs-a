// content script - can interact with page

//document.body.style.border = "5px solid red";

console.log('setting up listener');
browser.runtime.onMessage.addListener(request => {
  var messageClass = 'prs-a-message';
  var commentNodes = $('.comment-body:visible').not('.p-0'); // github
  commentNodes.push($('.comment-content')); // bitbucket.org

  var unScoredComments = commentNodes.filter(function() { return $(this).has('div.' + messageClass).length == 0; });

  var commentTexts = unScoredComments.map(function () {
    return $(this).text().trim();
  });
  commentTexts = $.makeArray(commentTexts);

  if (request.start === 1) {
    return Promise.resolve({response: commentTexts});
  } else {
    console.log('Message from the background script:');
    console.log('1 is positive, 0 is negative');
    commentTexts.forEach((c, i) => {
      let score = request.done[i].score,
        commentNode = $(commentNodes[i]);

      console.log(score, c);

      let message = document.createElement('div');
      message.setAttribute('class', messageClass);
      message.innerText = `${(score * 100).toFixed(2)}% positive`;

      let thumb = document.createElement('div');
      thumb.innerText = '👍';
      thumb.style = `transform: rotate(${180 * (1 - score)}deg); width: 25px; height: 25px; padding: 2px; float: left`;

      commentNode[0].appendChild(thumb);
      commentNode[0].appendChild(message);
    });
    return Promise.resolve({response: 'Hi from content script - I\'m all done!'});
  }
});
