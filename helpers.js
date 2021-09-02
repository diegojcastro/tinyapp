const getUserByEmail = (email, db) => {
  for (let userId in db) {
    if (db[userId].email === email) {
      return db[userId];
    }
  }
  return undefined;
}

const urlsForUserId = (matchID, db) => {
  const matchedUrls = {};
  for (let id in db) {
    const { longURL, userID } = db[id];
    if (userID === matchID) {
      matchedUrls[id] = { longURL, userID };
    }
  }
  return matchedUrls;
}

const generateRandomString = () => {
  let output = [];
  // We want it to always be 6 digits long, arbitrarily chosen.
  for (let i = 0; i < 6; i++) {
    // Generates new alphanumeric case-sensitive char
    const newChar = Math.floor(Math.random() * 62);
    let finalIndex;
    if (newChar < 10) {
      // 0-9 start at index 48
      finalIndex = newChar + 48;
    } else if (newChar < 36) {
      // A-Z start at index 65, subtracting 11 gives 55
      finalIndex = newChar + 55;
    } else {
      // a-z start at index 97, subtracting 36 gives 61
      finalIndex = newChar + 61;
    }
    output.push(String.fromCharCode(finalIndex));
  }
  return output.join('');
};

module.exports = { getUserByEmail, generateRandomString, urlsForUserId };