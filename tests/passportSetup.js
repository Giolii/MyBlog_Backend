const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");

function setupTestAuth(app) {
  // JWT Strategy configuration
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || "your-test-secret-key",
  };

  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      // In test environment, we'll simply pass through the payload
      return done(null, jwt_payload);
    })
  );

  // Initialize Passport middleware
  app.use(passport.initialize());
}
module.exports = setupTestAuth;
