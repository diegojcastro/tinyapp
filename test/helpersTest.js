const { assert } = require('chai');

const { getUserByEmail, generateRandomString, urlsForUserId } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', () => {
  it('should return a user with valid email', () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user.id, expectedOutput);
  });

  it('should return a user object when given a valid email', () => {
    const user = getUserByEmail("user2@example.com", testUsers);
    const expectedOutput = {
      id: "user2RandomID", 
      email: "user2@example.com", 
      password: "dishwasher-funk"
    };
    assert.deepEqual(user, expectedOutput);
  }); 

  it('should return undefined when given an email absent from the DB', () => {
    const user = getUserByEmail("badexample@wrongdomain.com", testUsers);
    assert.isUndefined(user);
  });

});

describe('generateRandomString', () => {
  it('should generate a string of length 6', () => {
    const random = generateRandomString();
    assert.equal(random.length, 6);
  });
  it('should generate different strings every time', () => {
    const random1 = generateRandomString();
    const random2 = generateRandomString();
    assert.notEqual(random1, random2);
  });
});