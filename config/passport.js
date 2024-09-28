const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const db = require('./database'); 
const bcrypt = require('bcryptjs');


const verifyCallback = async (email, password, done) => {
    try {
        const { rows } = await db.query("SELECT * FROM users_members_only WHERE email = $1", [email]);
        const user = rows[0];
  
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          // passwords do not match!
          return done(null, false, { message: "Incorrect password" })
        }
        return done(null, user);
    } catch(err) {
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
        const result = await db.query('SELECT * FROM users_members_only WHERE id = $1', [id]);
        done(null, result.rows[0]);
    } catch (err) {
        done(err);
    }
});