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
    let commentNodes = Array.from(document.querySelectorAll('.comment-body:not(.p-0):not(.js-preview-body)')); // github
    let bitBucketCommentNodes = document.querySelectorAll('.comment-content'); // bitbucket.org

    if (bitBucketCommentNodes.length > 0) {
      commentNodes = Array.from(bitBucketCommentNodes);
    }
    let commentTexts = this.getCommentsFromPage(commentNodes);

    if (request.start === 1) {
      // send array of comment strings to background script
      return Promise.resolve({response: commentTexts});
    } else {
      // receive array of comment strings & scores from background script
      console.log('Received message from the background script', request.done);
      commentTexts.forEach((c, i) => {
        let score = request.done[i].score,
          commentNode = commentNodes[i],
          html = this.generateHtmlNode(score);

          commentNode.appendChild(html);
        });
        return Promise.resolve({response: 'Hi from content script - I\'m all done!'});
    }
  }

  getCommentsFromPage(commentNodes) {
    let unScoredComments = commentNodes.filter(comment => {
      return comment.querySelectorAll('div.' + this.MESSAGE_CLASS).length === 0;
    });
    
    let commentTexts = unScoredComments.map(comment => {
      return comment.innerText.trim();
    });

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