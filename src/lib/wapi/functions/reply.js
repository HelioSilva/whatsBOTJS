export async function reply(chatId, message, quotedMsg, mentioned) {
  if (typeof quotedMsg !== 'object') {
    quotedMsg = Store.Msg.get(quotedMsg);
  }
  if (!Array.isArray(mentioned)) {
    mentioned = [mentioned];
  }

  const chat = WAPI.getChat(chatId);
  const users = await Store.Contact.serialize().filter((x) =>
    mentioned.includes(x.id.user)
  );

  return chat
    .sendMessage(message, {
      linkPreview: null,
      mentionedJidList: users.map((u) => u.id),
      quotedMsg: quotedMsg,
      quotedMsgAdminGroupJid: null,
    })
    .then((_) => chat.lastReceivedKey._serialized);
}
