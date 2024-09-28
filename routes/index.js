const router = require('express').Router();
const passport = require('passport');
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { isAuth, isAdmin } = require('./authMiddleware');

router.get("/", (req, res) => {
  res.render("index", { user: req.user });
});

router.get("/login", (req, res) => {
  res.render("login")
})

router.get("/register", (req, res) => res.render("register"));


router.post('/login', passport.authenticate('local', { failureRedirect: '/login-failure', successRedirect: '/login-success'}));

router.post('/register', async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  if (!email || !password) {
      return res.status(400).send('Username and password are required.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const membership = false;

  try {

      const result = await db.query(
          'INSERT INTO users_members_only ("firstName", "lastName", email, password, "membershipStatus") VALUES ($1, $2, $3, $4, $5) RETURNING id',
          [firstName, lastName, email, hashedPassword, membership]
      );

      console.log(email);
      res.redirect('/login');
  } catch (err) {
      if (err.code === '23505') { 
          return res.status(409).send('Username already exists.');
      }
      console.error(err);
      res.status(500).send('Internal server error.');
  }
});

router.get('/logout', (req, res, next) => {
  req.logout((err) => {
      if (err) {
          return next(err);
      }
      res.redirect('/login');
  });
});

router.get('/login-success', (req, res, next) => {
  res.send('<p>You successfully logged in. --> <a href="/secret-code">Go to posts</a></p>');
});

router.get('/secret-code', (req, res) => {
  res.render('secret-code');
});

router.post('/secret-code', (req, res) => {
  const { secretCode } = req.body;
  if (secretCode === process.env.SECRET_CODE) {
    res.redirect('/posts');
  } else {
    res.status(401).send('Secret code is incorrect. Please try again.');
  }
});

router.get('/login-failure', (req, res, next) => {
  res.send('You entered the wrong password. --> <a href="/login">Try again</a></p>');
});

router.get('/posts', isAuth, (req, res) => {
  res.render('posts');
});
module.exports = router;