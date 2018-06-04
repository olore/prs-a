// content script - can interact with page

console.log('setting up listener');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  let csh = new ContentScriptHandler();
  return csh.handleIncomingMessage(request, sendResponse);
});

class ContentScriptHandler {

  constructor() {
    this.MESSAGE_CLASS = 'prs-a-message';
  }
  
  handleIncomingMessage(request, sendResponse) {
    let commentNodes = Array.from(document.querySelectorAll('.comment-body:not(.p-0):not(.js-preview-body)')); // github
    let bitBucketCommentNodes = document.querySelectorAll('.comment-content'); // bitbucket.org

    if (bitBucketCommentNodes.length > 0) {
      commentNodes = Array.from(bitBucketCommentNodes);
    }
    let commentTexts = this.getCommentsFromPage(commentNodes);

    if (request.start === 1) {
      // return array of comment strings to background script
      sendResponse({response: commentTexts});
    } else {
      // receive array of comment strings & scores from background script
      console.log('Received message from the background script', request.done);
      commentTexts.forEach((c, i) => {
        let score = message.done[i].score,
          commentNode = $(commentNodes[i]);
          html = this.generateHtmlNode(score);

          commentNode.appendChild(html);
      });
      sendResponse({response: 'Hi from content script - I\'m all done!'});
    }
    return true;
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

  generateHtmlNode(score) {
    let html = `
      <div class="${this.MESSAGE_CLASS}">
        <span style="transform: rotate(${180 * (1 - score)}deg); width: 25px; height: 25px; padding: 2px; float: left">
          👍
        </span>
        ${(score * 100).toFixed(2)}% positive
      </div>
    `;

    let div = document.createElement('div');
    div.innerHTML = html;
    return div;
  }
};