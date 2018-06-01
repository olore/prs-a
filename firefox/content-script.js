// content script - can interact with page

console.log('setting up listener');

browser.runtime.onMessage.addListener(request => {
  let csh = new ContentScriptHandler();
  return csh.handleIncomingMessage(request);
});

class ContentScriptHandler {

  constructor() {
    this.MESSAGE_CLASS = 'prs-a-message';
  }

  handleIncomingMessage(request) {
    var commentNodes = $('.comment-body:visible').not('.p-0'); // github
    commentNodes.push($('.comment-content')); // bitbucket.org

    var commentTexts = this.getCommentsFromPage(commentNodes);

    if (request.start === 1) {
      return Promise.resolve({response: commentTexts});
    } else {
      console.log('Received message from the background script', request.done);
      commentTexts.forEach((c, i) => {
        let score = request.done[i].score,
          commentNode = $(commentNodes[i]),
          html = this.generateHtmlNode(score);

          commentNode[0].appendChild(html);
        });
        return Promise.resolve({response: 'Hi from content script - I\'m all done!'});
    }
  }

  getCommentsFromPage(commentNodes) {
    // jQuery .filter https://api.jquery.com/filter/
    var that = this; // damnit jQuery!
    var unScoredComments = commentNodes.filter(function() {
      return $(this).has('div.' + that.MESSAGE_CLASS).length == 0;
    });

    // jQuery .map https://api.jquery.com/map/
    var commentTexts = unScoredComments.map(function () {
      return $(this).text().trim();
    });

    // jQuery https://api.jquery.com/jQuery.makeArray/
    commentTexts = $.makeArray(commentTexts);

    return commentTexts;
  }

  // if we are going to use jQuery, maybe just use https://api.jquery.com/html/#html2
  // or stop using jQuery completely ?
  generateHtmlNode(score) {
    let wrapperDiv = document.createElement('div');
    wrapperDiv.setAttribute('class', this.MESSAGE_CLASS);

    let messageDiv = document.createElement('div');
    messageDiv.setAttribute('class', this.MESSAGE_CLASS);
    messageDiv.innerText = `${(score * 100).toFixed(2)}% positive`;

    let thumbDiv = document.createElement('div');
    thumbDiv.innerText = '👍';
    thumbDiv.style = `transform: rotate(${180 * (1 - score)}deg); width: 25px; height: 25px; padding: 2px; float: left`;

    wrapperDiv.appendChild(thumbDiv);
    wrapperDiv.appendChild(messageDiv);
    return wrapperDiv;
  }
}