const WEBHOOK_URL = 'https://90ua0si2.rpcld.net/webhook/ffb578b0-75d8-4631-ac6a-f43b93bb7501';

const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');

// Auto-resize textarea
messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
});

// Send message on Enter (Shift+Enter for new line)
messageInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Send button click
sendButton.addEventListener('click', sendMessage);

function sendMessage() {
    const message = messageInput.value.trim();
    
    if (!message) {
        return;
    }
    
    // Remove welcome message if it exists
    const welcomeMessage = chatMessages.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }
    
    // Add user message to chat
    addMessage(message, 'user');
    
    // Clear input
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // Disable input while waiting for response
    messageInput.disabled = true;
    sendButton.disabled = true;
    
    // Show typing indicator
    const typingIndicator = addTypingIndicator();
    
    // Send to webhook
    sendToWebhook(message)
        .then(response => {
            // Remove typing indicator
            typingIndicator.remove();
            
            // Add assistant response
            if (response) {
                addMessage(response, 'assistant');
            } else {
                addMessage('Received empty response from server.', 'assistant');
            }
        })
        .catch(error => {
            // Remove typing indicator
            typingIndicator.remove();
            
            // Show error message
            addMessage(`Error: ${error.message}`, 'system');
            console.error('Error:', error);
        })
        .finally(() => {
            // Re-enable input
            messageInput.disabled = false;
            sendButton.disabled = false;
            messageInput.focus();
        });
}

async function sendToWebhook(message) {
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                timestamp: new Date().toISOString()
            })
        });
        
        // Try to parse JSON response regardless of status
        const contentType = response.headers.get('content-type');
        let data = null;
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            data = { text: text };
        }
        
        if (!response.ok) {
            // If there's an error object, show more details
            if (data.error) {
                let errorMsg = data.error;
                if (data.details) {
                    try {
                        const details = JSON.parse(data.details);
                        if (details.message) {
                            errorMsg = details.message;
                        }
                        if (details.hint) {
                            errorMsg += '\n\n💡 ' + details.hint;
                        }
                    } catch (e) {
                        errorMsg += '\n' + data.details;
                    }
                }
                throw new Error(errorMsg);
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Parse the response and extract the actual message
        let message = '';
        
        // Check for 'output' field (your webhook format)
        if (data.output) {
            message = data.output;
        }
        // Check for other common response formats
        else if (data.message) {
            message = data.message;
        }
        else if (data.response) {
            message = data.response;
        }
        else if (data.text) {
            message = data.text;
        }
        else if (typeof data === 'string') {
            message = data;
        }
        else {
            // If none of the above, stringify the whole response
            message = JSON.stringify(data);
        }
        
        // Clean up escaped quotes and newlines for better readability
        if (typeof message === 'string') {
            message = message
                .replace(/\\n/g, '\n')  // Convert \n to actual newlines
                .replace(/\\"/g, '"')   // Convert \" to "
                .replace(/\\\\/g, '\\'); // Convert \\ to \
        }
        
        return message;
    } catch (error) {
        throw new Error(`${error.message}`);
    }
}

function addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    
    if (type === 'user') {
        avatar.textContent = '👤';
    } else if (type === 'assistant') {
        avatar.textContent = '🤖';
    } else {
        avatar.textContent = '⚠️';
        avatar.style.background = '#fbbf24';
    }
    
    const content = document.createElement('div');
    content.className = 'message-content';
    // Use innerText to preserve line breaks, or convert \n to <br> for HTML
    content.style.whiteSpace = 'pre-wrap'; // Preserve whitespace and line breaks
    content.textContent = text;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return messageDiv;
}

function addTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = '🤖';
    
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'typing-dots';
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        dotsContainer.appendChild(dot);
    }
    
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(dotsContainer);
    
    chatMessages.appendChild(typingDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return typingDiv;
}

// Focus input on load
messageInput.focus();

