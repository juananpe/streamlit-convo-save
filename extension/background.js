// background.js
chrome.browserAction.onClicked.addListener(function(tab) {
    console.log('Browser action clicked, sending message to tab:', tab.id);

    chrome.tabs.sendMessage(tab.id, {action: "saveConversation"});
});

