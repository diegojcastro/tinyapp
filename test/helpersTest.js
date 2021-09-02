const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

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

describe('getUserByEmail', function() {
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