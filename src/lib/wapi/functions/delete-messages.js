export function deleteMessages(chatId, messageArray, onlyLocal, done) {
  const userId = new Store.WidFactory.createWid(chatId);
  const conversation = WAPI.getChat(userId);
  if (!conversation) {
    if (done !== undefined) {
      done(false);
    }
    return false;
  }

  if (!Array.isArray(messageArray)) {
    messageArray = [messageArray];
  }

  let messagesToDelete = messageArray
    .map((msgId) =>
      typeof msgId == 'string' ? window.Store.Msg.get(msgId) : msgId
    )
    .filter((x) => x);
  if (messagesToDelete.length == 0) return true;
  let jobs = onlyLocal
    ? [conversation.sendDeleteMsgs(messagesToDelete, conversation)]
    : [
        conversation.sendRevokeMsgs(
          messagesToDelete.filter((msg) => msg.isSentByMe),
          conversation
        ),
        conversation.sendDeleteMsgs(
          messagesToDelete.filter((msg) => !msg.isSentByMe),
          conversation
        ),
      ];
  return Promise.all(jobs).then((_) => {
    if (done !== undefined) {
      done(true);
    }
    return true;
  });
}
