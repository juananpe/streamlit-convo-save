// content.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    
    console.log('Received message in content script:', request);


    if(request.action === "saveConversation") {
        let userQueries = document.querySelectorAll('div[data-testid="stChatMessageContent"][aria-label="Chat message from user"]');
        let assistantAnswers = document.querySelectorAll('div[data-testid="stChatMessageContent"][aria-label="Chat message from assistant"]');

        let data = {
            userQueries: Array.from(userQueries).map(el => el.innerHTML),
            assistantAnswers: Array.from(assistantAnswers).map(el => el.innerHTML)
        };

        fetch('http://localhost:3000/saveConv', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        }).then(response => {
            // Handle response
        }).catch(error => {
            // Handle error
        });
    }
});

