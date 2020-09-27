export async function promoteParticipant(groupId, participantId, done) {
  const chat = Store.Chat.get(groupId);
  const participant = chat.groupMetadata.participants.get(participantId);
  return window.Store.Participants.promoteParticipants(chat, [
    participant,
  ]).then(() => {
    if (done !== undefined) {
      done(true);
    }
    return true;
  });
}
