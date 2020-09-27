export function addOnNewAcks() {
  window.WAPI.waitNewAcknowledgements = function (callback) {
    Store.Msg.on('change:ack', callback);
    return true;
  };
}
