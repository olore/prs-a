function saveOptions(e) {
  browser.storage.local.set({
    key: document.querySelector("#key").value,
    host: document.querySelector("#host").value
  });
  e.preventDefault();
}

function restoreOptions() {
  var gettingItem = browser.storage.local.get(['key', 'host']);
  gettingItem.then((res) => {
    if (res.key) document.querySelector("#key").value = res.key;
    if (res.host) document.querySelector("#host").value = res.host;
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);