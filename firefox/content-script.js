// content script - can interact with page

//document.body.style.border = "5px solid red";

console.log('setting up listener');
browser.runtime.onMessage.addListener(request => {
  var commentNodes = $('.comment-body:visible').not('.p-0');

  var commentTexts = commentNodes.map(function() {
    return $(this).text().trim();
  });
  commentTexts = $.makeArray(commentTexts);

  if (request.start === 1) {
    return Promise.resolve({response: commentTexts});
  } else {
    console.log("Message from the background script:");
    console.log( "1 is positive, 0 is negative");
    commentTexts.forEach((c, i) => {
      var score = request.done[i].score;
      commentNode = $(commentNodes[i]);

      console.log(score, c);
      if (score > 0.66) {
        commentNode.css( "background-color", "lightgreen" );
      } else if (score < 0.33) {
        commentNode.css( "background-color", "pink" );
      } else {
        commentNode.css( "background-color", "light-grey" );
      }
    });
    return Promise.resolve({response: "Hi from content script - I'm all done!"});
  }
});