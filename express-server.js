const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcryptjs');
const { getUserByEmail, generateRandomString, urlsForUserId } = require('./helpers');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['potato','tomato'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.set("view engine", "ejs");


const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

// Placeholder hashed password for our example user:
const tempPassword = bcrypt.hashSync("purple", 10);
const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@example.com",
    password: tempPassword
  }
};

// GET routes
app.get("/", (req, res) => {
  if (req.session.user_id && users[req.session.user_id]) {
    return res.redirect('/urls/');
  }
  res.redirect('/login');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/login", (req, res) => {
  if (req.session.user_id && users[req.session.user_id]) {
    return res.redirect('/urls/');
  }
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  if (req.session.user_id && users[req.session.user_id]) {
    return res.redirect('/urls/');
  }
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("registration", templateVars);
});

app.get("/urls", (req, res) => {
  // Display only URLs that belong to this user.
  const matchedUrls = urlsForUserId(req.session.user_id, urlDatabase);
  const templateVars = {
    user: users[req.session.user_id],
    urls: matchedUrls
  };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id || !users[req.session.user_id]) {
    return res.redirect('/login');
  }
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const id = req.session.user_id;
  if (!id || !users[id]) {
    res.status(400);
    return res.send(`<html><body>You must log in to access shortened URLs.</body></html>\n`);
  }
  if (!urlDatabase[shortURL]) {
    return res.status(400).send(`<html><body>URL <b>${shortURL}</b> does not exist in URL database.</body></html>\n`);
  }
  if (urlDatabase[shortURL].userID !== id) {
    return res.status(400).send(`<html><body>URL <b>${shortURL}</b> does not belong to you.</body></html>\n`);
  }
  const templateVars = {
    user: users[id],
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(400).send(`<html><body>URL <b>${req.params.shortURL}</b> does not exist in URL database.</body></html>\n`);
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


// POST Routes
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (email === '' || password === '') {
    return res.status(400).send("<html><body>Cannot provide empty email or password.</body></html>\n");
  }
  const user = getUserByEmail(email, users);
  if (!user) {
    return res.status(403).send(`<html><body>User <b>${email}</b> does not exist.</body></html>\n`);
  }
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send('<html><body>Invalid password.</body></html>\n');
  }

  req.session.user_id = user.id;
  res.redirect(`/urls/`);
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/urls/`);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (email === '' || password === '') {
    return res.status(400).send("<html><body>Cannot provide empty email or password.</body></html>\n");
  }

  if (getUserByEmail(email, users)) {
    return res.status(400).send(`<html><body>Email <b>${email}</b> has already been registered.</body></html>\n`);
  }
  const id = generateRandomString();
  const hashPass = bcrypt.hashSync(password, 10);
  const newUser = {
    id,
    email,
    password: hashPass
  };
  users[id] = newUser;
  req.session.user_id = newUser.id;
  res.redirect(`/urls/`);
});

app.post("/urls", (req, res) => {
  if (!req.session.user_id || !users[req.session.user_id]) {
    return res.status(400).send(`<html><body>You must log in to access shortened URLs.</body></html>\n`);
  }
  const shortKey = generateRandomString();
  urlDatabase[shortKey] = {
    userID: req.session.user_id,
    longURL: req.body.longURL
  };
  res.redirect(`/urls/${shortKey}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  if (!req.session.user_id || !users[req.session.user_id]) {
    return res.status(400).send(`<html><body>You must log in to access shortened URLs.</body></html>\n`);
  }
  if (!urlDatabase[shortURL]) {
    return res.status(400).send(`<html><body>URL <b>${shortURL}</b> does not exist in URL database.</body></html>\n`);
  }
  if (urlDatabase[shortURL].userID !== req.session.user_id) {
    return res.status(403).send(`<html><body>URL <b>${shortURL}</b> does not belong to you.</body></html>\n`);
  }
  if (req.session.user_id === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    res.redirect(`/urls/`);
  }
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const id = req.session.user_id;
  if (!id || !users[id]) {
    return res.status(400).send(`<html><body>You must log in to access shortened URLs.</body></html>\n`);
  }
  if (!urlDatabase[shortURL]) {
    return res.status(400).send(`<html><body>URL <b>${shortURL}</b> does not exist in URL database.</body></html>\n`);
  }
  if (urlDatabase[shortURL].userID !== id) {
    return res.status(400).send(`<html><body>URL <b>${shortURL}</b> does not belong to you.</body></html>\n`);
  }
  
  if (id === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect(`/urls/`);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});