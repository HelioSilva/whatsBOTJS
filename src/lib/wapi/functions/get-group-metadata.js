export async function getGroupMetadata(id, done) {
  let output = window.Store.GroupMetadata.find(id);
  if (done !== undefined) done(output);
  return output;
}
