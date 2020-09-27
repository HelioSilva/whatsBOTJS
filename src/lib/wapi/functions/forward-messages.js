export async function forwardMessages(to, messages, skipMyMessages) {
  if (!Array.isArray(messages)) {
    messages = [messages];
  }
  const toForward = messages
    .map((msg) => {
      if (typeof msg === 'string') {
        return window.Store.Msg.get(msg);
      } else {
        return window.Store.Msg.get(msg.id);
      }
    })
    .filter((msg) => (skipMyMessages ? !msg.__x_isSentByMe : true));

  // const userId = new window.Store.UserConstructor(to);
  const conversation = window.Store.Chat.get(to);
  return conversation.forwardMessages(toForward);
}
