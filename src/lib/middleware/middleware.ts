declare module WAPI {
  const waitNewMessages: (rmCallback: boolean, callback: Function) => void;
  const waitNewAcknowledgements: (callback: Function) => void;
  const onStateChange: (callback: Function) => void;
  const allNewMessagesListener: (callback: Function) => void;
}

enum ExposedFn {
  OnMessage = 'onMessage',
  OnAck = 'onAck',
  OnParticipantsChanged = 'onParticipantsChanged',
}

/**
 * Exposes [OnMessage] function
 */
WAPI.waitNewMessages(false, (data) => {
  data.forEach((message) => {
    window[ExposedFn.OnMessage](message);
  });
});

WAPI.waitNewAcknowledgements(function (data) {
  if (!Array.isArray(data)) {
    data = [data];
  }
  data.forEach(function (message) {
    if (window[ExposedFn.OnAck]) window[ExposedFn.OnAck](message);
  });
});
