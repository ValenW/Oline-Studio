exports.isAuthenticated = function(req, res, next) {
  if (req.session.user) {
    if (req.session.user.confed == true) {
      next();
    } else {
      res.redirect('/wait');
    }
  } else {
    res.redirect('/login');
  }
}

exports.isTempAuthenticated = function(req, res, next) {
  if (req.session.user) {
    if (req.session.user.confed == false) {
      next();
    } else {
      res.redirect('/');
    }
  } else {
    res.redirect('/login');
  }
}