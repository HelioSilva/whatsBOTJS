export function setPresence(available) {
  if (available == true) {
    Store.Presence.setPresenceAvailable();
    return true;
  }
  if (available == false) {
    Store.Presence.setPresenceUnavailable();
    return true;
  }
}
