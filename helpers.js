const getUserByEmail = (email, db) => {
  for (let userId in db) {
    if (db[userId].email === email) {
      return db[userId];
    }
  }
  return undefined;
}

module.exports = { getUserByEmail };