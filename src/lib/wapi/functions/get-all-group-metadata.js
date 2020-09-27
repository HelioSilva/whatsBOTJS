export function getAllGroupMetadata(done) {
  const groupData = window.Store.GroupMetadata.map(
    (groupData) => groupData.all
  );

  if (done !== undefined) done(groupData);
  return groupData;
}
