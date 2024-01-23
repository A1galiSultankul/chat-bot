// chat.js
const eventSource = new EventSource('/sse');
const messagesDiv = document.getElementById('messages');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  const message = data.message;
  appendMessage(message);
};

messageForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = messageInput.value;
  
  if (message.trim() !== '') {
    sendMessage(message);
    messageInput.value = '';
  }
});

function appendMessage(message) {
  const messageElement = document.createElement('div');
  messageElement.textContent = message;
  messagesDiv.appendChild(messageElement);
}

function sendMessage(message) {
  fetch('/chat?message=' + encodeURIComponent(message))
    .then((response) => response.text())
    .then((data) => console.log(data))
    .catch((error) => console.error('Error sending message:', error));
}
