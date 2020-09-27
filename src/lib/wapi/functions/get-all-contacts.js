export const getAllContacts = function (done) {
  const contacts = window.Store.Contact.map((contact) =>
    WAPI._serializeContactObj(contact)
  );

  if (done !== undefined) done(contacts);
  return contacts;
};
