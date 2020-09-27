export function getUnreadMessages(
  includeMe,
  includeNotifications,
  useUnreadCount,
  done
) {
  const chats = window.Store.Chat.models;
  const output = [];

  for (const chat in chats) {
    if (isNaN(chat)) {
      continue;
    }

    const messageGroupObj = chats[chat];
    let messageGroup = WAPI._serializeChatObj(messageGroupObj);
    messageGroup.messages = [];

    const messages = messageGroupObj.msgs._models;
    for (let i = messages.length - 1; i >= 0; i--) {
      const messageObj = messages[i];
      if (
        typeof messageObj.isNewMsg != 'boolean' ||
        messageObj.isNewMsg === false
      ) {
        continue;
      } else {
        messageObj.isNewMsg = false;
        let message = WAPI.processMessageObj(
          messageObj,
          includeMe,
          includeNotifications
        );
        if (message) {
          messageGroup.messages.push(message);
        }
      }
    }

    if (messageGroup.messages.length > 0) {
      output.push(messageGroup);
    } else {
      // No messages with isNewMsg true
      if (useUnreadCount) {
        // Will use unreadCount attribute to fetch last n messages from sender
        let n = messageGroupObj.unreadCount;
        for (let i = messages.length - 1; i >= 0; i--) {
          const messageObj = messages[i];
          if (n > 0) {
            if (!messageObj.isSentByMe) {
              let message = WAPI.processMessageObj(
                messageObj,
                includeMe,
                includeNotifications
              );
              messageGroup.messages.unshift(message);
              n -= 1;
            }
          } else if (n === -1) {
            // chat was marked as unread so will fetch last message as unread
            if (!messageObj.isSentByMe) {
              let message = WAPI.processMessageObj(
                messageObj,
                includeMe,
                includeNotifications
              );
              messageGroup.messages.unshift(message);
              break;
            }
          } else {
            // unreadCount = 0
            break;
          }
        }
        if (messageGroup.messages.length > 0) {
          messageGroupObj.unreadCount = 0; // reset unread counter
          output.push(messageGroup);
        }
      }
    }
  }
  if (done !== undefined) {
    done(output);
  }
  return output;
}
