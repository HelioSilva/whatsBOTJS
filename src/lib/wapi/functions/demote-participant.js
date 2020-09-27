export async function demoteParticipant(groupId, participantId, done) {
  return window.Store.WapQuery.demoteParticipants(groupId, [
    participantId,
  ]).then(() => {
    const chat = Store.Chat.get(groupId);
    const participant = chat.groupMetadata.participants.get(participantId);
    window.Store.Participants.demoteParticipants(chat, [participant]).then(
      () => {
        if (done !== undefined) {
          done(true);
        }
        return true;
      }
    );
  });
}
