export async function addParticipant(groupId, participantId) {
  const chat = Store.Chat.get(groupId);
  const participant = Store.Contact.get(participantId);
  await window.Store.Participants.addParticipants(chat, [participant]);
  return true;
}
