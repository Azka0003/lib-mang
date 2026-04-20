const isLoggedIn = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  next();
};

const isRole = (role) => {
  return (req, res, next) => {
    if (!req.session.user || req.session.user.role !== role) {
      return res.status(403).send('Access denied');
    }
    next();
  };
};

module.exports = { isLoggedIn, isRole };
