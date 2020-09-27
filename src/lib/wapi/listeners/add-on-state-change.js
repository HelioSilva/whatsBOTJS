export function addOnStateChange() {
  window.WAPI.onStateChange = function (callback) {
    window.Store.State.default.on('change:state', callback);
    return true;
  };
}
