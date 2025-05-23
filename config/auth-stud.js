require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = {
    ensureStudAuthenticated: async (req, res, next)=> {
      try{
      const token = req.cookies.studjwt;
      const verifyStud = jwt.verify(token, process.env.JWT_SECRET2);
      res.locals.studId = verifyStud.studId;
      next();
    } catch (error){
      req.flash("error_msg", "You need to login First");
      res.redirect("/student");
    }
    },
    forwardStudAuthenticated : (req,res,next) => {
      try{
        const token = req.cookies.studjwt;
        const verifyStud = jwt.verify(token, process.env.JWT_SECRET);
        if(verifyStud){
          res.redirect("/student/profile");
        }
      } catch(error){
        next()
      }
    }
    }