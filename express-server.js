const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

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

const getUserFromDatabase = (email, db) => {
  for (let userId in db) {
    if (db[userId].email === email) {
      return db[userId];
    }
  }
  return false;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
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
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("registration", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (email === '' || password === '') {
    res.status(400);
    return res.send("<html><body>Cannot provide empty email or password.</body></html>\n")
  }
  const user = getUserFromDatabase(email, users);
  if (!user) {
    console.log(users);
    res.status(403);
    return res.send(`<html><body>User <b>${email}</b> does not exist.</body></html>\n`);
  }
  if (user.password !== password) {
    res.status(403);
    return res.send('<html><body>Invalid password.</body></html>\n');
  }

  res.cookie('user_id', user.id);
  res.redirect(`/urls/`)
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect(`/urls/`)
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (email === '' || password === '') {
    res.status(400);
    return res.send("<html><body>Cannot provide empty email or password.</body></html>\n")
  }

  if (getUserFromDatabase(email, users)) {
    console.log(`User ${email} already exists!`);
    res.status(400);
    return res.send(`<html><body>Email <b>${email}</b> has already been registered.</body></html>\n`);
  }
  // console.log('from POST /register, user not found in database.');
  const id = generateRandomString();
  const newUser = {
    id,
    email,
    password
  }
  users[id] = newUser;
  // console.log(users);
  // console.log(`should have added ${newUser}`)
  res.cookie('user_id', newUser.id);
  res.redirect(`/urls/`)
});

app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  const shortKey = generateRandomString();
  urlDatabase[shortKey] = req.body.longURL
  res.redirect(`/urls/${shortKey}`)
});

app.post("/urls/:id/delete", (req, res) => {
  const shortKey = req.params.id;
  delete urlDatabase[shortKey];
  res.redirect(`/urls/`)
});


app.post("/urls/:id", (req, res) => {
  const shortKey = req.params.id;
  urlDatabase[shortKey] = req.body.longURL;
  res.redirect(`/urls/`)
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});