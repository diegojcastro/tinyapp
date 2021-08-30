const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({extended: true}));
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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const shortKey = generateRandomString();
  urlDatabase[shortKey] = req.body.longURL

  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
  const templateVars = { shortURL: shortKey, longURL: req.body.longURL };
  res.render('urls_show', templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});