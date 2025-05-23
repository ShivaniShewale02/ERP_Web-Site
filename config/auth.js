module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      req.flash("error_msg", "You need to first login");
      res.redirect("/faculty");
    }
  },
  forwardAuthenticated : (req,res,next) => {
    if(!req.isAuthenticated()){
      return next();
    }
    else{
      res.redirect("/faculty/dashboard");
    }
  }
}
