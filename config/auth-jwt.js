require('dotenv').config();
const jwt = require('jsonwebtoken');


module.exports = {
  ensureJWTAuthenticated: async (req, res, next)=> {
    try{
    const token = req.cookies.jwt;
    const verifyAdm = jwt.verify(token, process.env.JWT_SECRET);
    res.locals.adminId = verifyAdm.adminId;
    next();
  } catch (error){
    req.flash("error_msg", "You need to login First");
    res.redirect("/admin");
  }
  },
  forwardJWTAuthenticated : (req,res,next) => {
    try{
      const token = req.cookies.jwt;
      const verifyAdm = jwt.verify(token, process.env.JWT_SECRET);
      if(verifyAdm){
        res.redirect("/admin/addFaculty")
      }
    } catch(error){
      next()
    }
  }
  }
