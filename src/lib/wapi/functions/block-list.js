export async function getBlockList() {
  let _l = await Store.Blocklist,
    __numbers = [];
  if (_l !== undefined && _l._index !== undefined) {
    for (let _n in _l._index) {
      __numbers.push(_n);
    }
    return __numbers;
  }
  return false;
}
