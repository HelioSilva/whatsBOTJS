export async function sendSticker(sticker, chatId, metadata, type) {
  var chat = await WAPI.sendExist(chatId);

  if (chat.erro === false || chat.__x_id) {
    var ListChat = await Store.Chat.get(chatId),
      stick = new window.Store.Sticker.modelClass();

    stick.__x_clientUrl = sticker.clientUrl;
    stick.__x_filehash = sticker.filehash;
    stick.__x_id = sticker.filehash;
    stick.__x_uploadhash = sticker.uploadhash;
    stick.__x_mediaKey = sticker.mediaKey;
    stick.__x_initialized = false;
    stick.__x_mediaData.mediaStage = 'INIT';
    stick.mimetype = 'image/webp';
    stick.height = metadata && metadata.height ? metadata.height : 512;
    stick.width = metadata && metadata.width ? metadata.width : 512;

    await stick.initialize();

    var result = await Promise.all(
      ListChat
        ? await stick.sendToChat(chat, {
            stickerIsFirstParty: false,
            stickerSendOrigin: 6,
          })
        : ''
    );
    result = result.join('');
    var m = { type: type },
      To = await WAPI.getchatId(chatId);
    if (result === 'OK') {
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
