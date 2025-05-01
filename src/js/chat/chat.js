export default class Chat {
  constructor() {
    this.chat = document.querySelector(".great-ds-chat");

    this.apiEndpoints = this.chat.getAttribute('data-api');
    this.appSecrets = this.chat.getAttribute('data-secrets');

    this.emptyMessageContainer = document.querySelector("#great-ds-chat__empty-message-container");
    this.submitButton = document.querySelector(".great-ds-chat__submit");
    this.messagesContainer = document.querySelector(".great-ds-chat__messages-container");
    this.messageInput = document.querySelector(".great-ds-chat__input");
    this.apiToken='';

    this.init();
  };
  init() {
    console.log('chatting');
    this.handleStartChat();
    
    this.submitButton.addEventListener("click", (e) => {
        e.stopPropagation();
        this.handleSubmitChat();
    });
  }

  async handleStartChat() {

    // Try to find pre-existing chat, if not begin a new chat and return the starting info
    try {
        /**
        const response = await fetch(apiEndpoints['start'], {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            }
        });
        */
        let response = 'Welcome to the Export support chatbot, how can I help today?';
        return response;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
  }
  async handleSubmitChat() {
    let currentMessage = this.messageInput.value;
    this.addChatToHistory('user', currentMessage);
    try {
         /** 
        const response = await fetch(apiEndpoints['send'], {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: currentMessage,
        });
*/      const response = "response to your message";
       return response;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
  }

  addChatToHistory(sender, text) {
    let newMessageContainer = this.emptyMessageContainer.cloneNode(true);
    let newMessage = newMessageContainer.querySelector(".great-ds-chat__message")
 
    newMessageContainer.classList.add('great-ds-chat__message-container--'.concat(sender))
    newMessage.innerHTML = text;

    this.messagesContainer.appendChild(newMessageContainer)
  }
}
document.addEventListener("DOMContentLoaded", () => {
  new Chat();
});
