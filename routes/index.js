const router = require('express').Router();
const passport = require('passport');
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { isAuth, isAdmin } = require('./authMiddleware');

router.get("/", async (req, res) => {
  try {
    const { rows: messages } = await db.query(
      `SELECT m.id, m.title, m.content, m."createdAt", u."firstName", u."lastName" 
       FROM messages_members_only m 
       JOIN users_members_only u ON m.author_id = u.id 
       ORDER BY m."createdAt" DESC`
    );

    const isAuthorized = req.session.isAuthorized || false;

    res.render("index", { user: req.user, messages, isAuthorized });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error.');
  }
});

router.get("/login", (req, res) => {
  res.render("login")
})

router.get("/register", (req, res) => res.render("register"));


router.post('/login', passport.authenticate('local', { failureRedirect: '/login-failure', successRedirect: '/login-success'}));

router.post('/register', async (req, res, next) => {
  const { firstName, lastName, email, password, admin } = req.body;

  if (!email || !password) {
      return res.status(400).send('Username and password are required.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const membership = false;

  try {

      const result = await db.query(
          'INSERT INTO users_members_only ("firstName", "lastName", email, password, "membershipStatus", admin) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
          [firstName, lastName, email, hashedPassword, membership, admin === 'on']
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
  res.send('<p>You successfully logged in. --> <a href="/secret-code">Authorize for members</a></p>');
});

router.get('/secret-code', isAuth, (req, res) => {
  res.render('secret-code');
});

router.post('/secret-code', (req, res) => {
  const { secretCode } = req.body;
  if (secretCode === process.env.SECRET_CODE) {
    req.session.isAuthorized = true;
    res.redirect('/');
  } else {
    res.status(401).json({msg: 'Secret code is incorrect. Please try again.'});
  }
});

router.get('/login-failure', (req, res, next) => {
  res.send('You entered the wrong password. --> <a href="/login">Try again</a></p>');
});

router.get('/new-message', isAuth, (req, res) => {
  res.render('new-message');
});

router.post('/new-message', isAuth, async (req, res) => {
  const { title, content } = req.body;

  try {
    const result = await db.query(
      'INSERT INTO messages_members_only (title, content, author_id) VALUES ($1, $2, $3) RETURNING id',
      [title, content, req.user.id]
    );

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error.');
  }
});

router.post('/delete-message/:id', isAuth, async (req, res) => {
  const messageId = req.params.id;

  if (!req.user.admin) {
    return res.status(403).send('You are not authorized to delete this message.');
  }

  try {
    await db.query('DELETE FROM messages_members_only WHERE id = $1', [messageId]);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error.');
  }
});

module.exports = router;