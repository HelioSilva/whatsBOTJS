export function allNewMessagesListener() {
  window.WAPI.allNewMessagesListener = (callback) =>
    window.Store.Msg.on('add', (newMessage) => {
      if (newMessage && newMessage.isNewMsg) {
        let message = window.WAPI.processMessageObj(newMessage, true, false);
        if (message) {
          callback(message);
        }
      }
    });
}
