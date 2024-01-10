// content.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    
    function showFeedback(message) {
        var feedback = document.createElement('div');
        feedback.textContent = message;
        feedback.style.position = 'fixed';
        feedback.style.bottom = '20px';
        feedback.style.right = '20px';
        feedback.style.backgroundColor = 'lightgreen';
        feedback.style.padding = '10px';
        feedback.style.borderRadius = '5px';
        feedback.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        document.body.appendChild(feedback);
    
        setTimeout(function() {
            feedback.remove();
        }, 3000); // Remove feedback after 3 seconds
    }

    
    console.log('Received message in content script:', request);


    if(request.action === "saveConversation") {
        var conversationName = prompt("Please enter a name for this conversation:");

        if(conversationName) {
            let model = document.querySelectorAll("div[data-baseweb='select']")[1].innerText;
            let userQueries = document.querySelectorAll('div[data-testid="stChatMessageContent"][aria-label="Chat message from user"]');
            let assistantAnswers = document.querySelectorAll('div[data-testid="stChatMessageContent"][aria-label="Chat message from assistant"]');

            let data = {
                name: conversationName,
                model: model,
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
                if(response.ok) {
                    showFeedback("Conversation successfully saved!");
                } else {
                    showFeedback("Error saving conversation.");
                }
            }).catch(error => {
                showFeedback("Network error.");
            });
        }
    }
});

