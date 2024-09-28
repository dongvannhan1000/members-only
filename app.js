const express = require('express');
const session = require('express-session');
var passport = require('passport');
var routes = require('./routes');
const pgSession = require('connect-pg-simple')(session);
const db = require('./config/database');

require('dotenv').config();

const app = express();

app.set("views", __dirname + '/views');
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({extended: true}));

const sessionStore = new pgSession({
  pool: db.pool,
  tableName: 'sessions'
})

app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
}));

require('./config/passport');

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  console.log(req.session);
  console.log(req.user);
  next();
})

app.use(routes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Open your browser and visit: http://localhost:${PORT}`);
});