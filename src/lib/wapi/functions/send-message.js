export async function sendMessage(chatId, message) {
  var chat = await WAPI.sendExist(chatId);
  if (chat.erro === false || chat.__x_id) {
    var ListChat = await Store.Chat.get(chatId);
    var result = await Promise.all(
      ListChat ? await chat.sendMessage(message) : ''
    );
    result = result.join('');
    var m = { type: 'sendtext', text: message },
      To = await WAPI.getchatId(chat.id);
    if (result === 'success' || result === 'OK') {
      var obj = WAPI.scope(To, false, result, null);
      Object.assign(obj, m);
      return obj;
    } else {
      var obj = WAPI.scope(To, true, result, null);
      Object.assign(obj, m);
      return obj;
    }
  } else {
    return chat;
  }
}
