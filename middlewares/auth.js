const is_login = (req, res, next) => {
  try {
    if (req.session.user) {
    } else {
      res.redirect("/");
    }
    next();
  } catch (err) {
    console.log(err.message);
  }
};

const is_logout = (req, res, next) => {
  try {
    if (req.session.user) {
      res.redirect("/dashboard");
    }

    next();
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = {
  is_login,
  is_logout,
};
