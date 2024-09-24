const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const db = require('./database'); 
const { validPassword } = require('../lib/passwordUtils');


const verifyCallback = async (username, password, done) => {
    try {
        const result = await db.query('SELECT * FROM users_authentication WHERE username = $1', [username]);
        const user = result.rows[0];
        if (!user) {
            return done(null, false, { message: 'Incorrect username.' });
        }
        const isValid = validPassword(password, user.hash, user.salt);

        if (isValid) {
            return done(null, user);
        } else {
            return done(null, false, { message: 'Incorrect password.' });
        }
    } catch (err) {
        return done(err);
    }
};

const strategy = new LocalStrategy(verifyCallback)

passport.use(strategy)

// Serialize and deserialize user
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const result = await db.query('SELECT * FROM users_authentication WHERE id = $1', [id]);
        done(null, result.rows[0]);
    } catch (err) {
        done(err);
    }
});