require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const {ensureAuthenticated, forwardAuthenticated} = require("./config/auth");
const {ensureJWTAuthenticated, forwardJWTAuthenticated} = require("./config/auth-jwt.js");
const {ensureStudAuthenticated, forwardStudAuthenticated} = require("./config/auth-stud");
const jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser');
const facultyController = require("./controllers/facultyController");
const studentController = require("./controllers/studentController")
const adminController = require("./controllers/adminController");
const Faculty = require("./models/faculty");
const path = require('path');
const Admin = require("./models/admin");
const Swal = require("sweetalert2");

const app = express();
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static(__dirname + "/public"));
// var viewPath = path.join(__dirname, 'views');
// app.set('views', viewPath);
app.set('view engine', 'ejs');

//Express session
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));
// Passport middelware
app.use(passport.initialize());
app.use(passport.session());

//Connect flash
app.use(flash());

// Global Vars
app.use((req, res, next)=>{
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next()
});

mongoose.connect("mongodb://127.0.0.1:27017/facMangDB", {useNewUrlParser : true , useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);


//passport //
passport.use("faculty", new LocalStrategy({usernameField : "lgnFacultyId", passwordField: 'lgnFacultyPass'}, (facId, password, done) =>{
  // Match Faculty
  Faculty.findOne({facId : facId})
  .then(faculty =>{
    if(!faculty){
      return done(null, false, {message : "Incorrect Faculty Id"});
    }
    //Match Password
    bcrypt.compare(password, faculty.password, (err,isMatch)=>{
      if (err) throw err;
      if(isMatch){
        return done(null, faculty);
      }else{
        return done(null, false, {message : "Incorrect Password"})
      }
    });
  })
  .catch(err => console.log(err));
}));

passport.use("admin", new LocalStrategy({usernameField : "adminId", passwordField: 'adminPass'}, (adminId, password, done) =>{
  // Match Faculty
  Admin.findOne({adminId : adminId})
  .then(admin =>{
    if(!admin){
      return done(null, false, {message : "Incorrect Admin Id"});
    }
    //Match Password
    bcrypt.compare(password, admin.password, (err,isMatch)=>{
      if (err) throw err;
      if(isMatch){
        return done(null, admin);
      }else{
        return done(null, false, {message : "Incorrect Password"})
      }
    });
  })
  .catch(err => console.log(err));
}));


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  Faculty.findById(id, function(err, user) {
    done(err, user);
  });
});

//HOME PAGE
app.get("/",(req,res)=>{
  res.render("facultyManager");
})


// FACULTY SIDE
app.get("/faculty", forwardAuthenticated, facultyController.faculty_login)

app.post("/faculty", forwardAuthenticated, facultyController.faculty_loginPost)

app.get("/faculty/logout", ensureAuthenticated, facultyController.faculty_logout)

app.get("/faculty/dashboard", ensureAuthenticated , facultyController.faculty_profile)

app.get("/faculty/addEvent", ensureAuthenticated, facultyController.faculty_addEvent)

app.post("/faculty/addEvent", ensureAuthenticated, facultyController.faculty_addEventPost)

app.get("/faculty/addFacultyEvent", ensureAuthenticated, facultyController.faculty_addFacultyEvent)

app.post("/faculty/addFacultyEvent", ensureAuthenticated, facultyController.faculty_addFacultyEventPost)

app.get("/faculty/timeTable", ensureAuthenticated, facultyController.faculty_timeTable)

app.get("/faculty/studentFeedback", ensureAuthenticated, facultyController.faculty_studFeedback)

app.get("/faculty/freeSlot", ensureAuthenticated, facultyController.faculty_freeSlot)

app.get("/faculty/editProfile", ensureAuthenticated, facultyController.faculty_editProfile)

app.post("/faculty/editProfile", ensureAuthenticated, facultyController.faculty_editProfilePost)



// STUDENT SIDE
app.get("/student", forwardStudAuthenticated, studentController.student_login);
app.post("/student", forwardStudAuthenticated, studentController.student_loginPost);
app.get("/student/logout", ensureStudAuthenticated, studentController.student_logout);
app.get("/student/profile", ensureStudAuthenticated, studentController.student_profile);

app.get("/student/viewEvent", ensureStudAuthenticated, studentController.student_viewEvent);

app.get("/student/viewFacultyEvent", ensureStudAuthenticated, studentController.student_viewFacultyEvent);

app.get("/student/freeSlot", ensureStudAuthenticated, studentController.student_freeSlot);
app.post("/student/freeSlot", ensureStudAuthenticated, studentController.student_freeSlotPost);

app.get("/student/editProfile", ensureStudAuthenticated, studentController.student_editProfile)
app.post("/student/editProfile", ensureStudAuthenticated, studentController.student_editProfilePost)


// ADMIN SIDE

app.get("/admin", forwardJWTAuthenticated, adminController.admin_login)

app.post("/admin", adminController.admin_loginPost)

app.get("/admin/logout", ensureJWTAuthenticated,adminController.admin_logout)

app.get("/admin/addFaculty", ensureJWTAuthenticated, adminController.admin_facultyAdd)

app.post("/admin/addFaculty",ensureJWTAuthenticated, adminController.admin_facultyAddPost)

app.get("/admin/facultyList",ensureJWTAuthenticated,adminController.admin_facultyList)

app.post("/admin/facultyList", ensureJWTAuthenticated, adminController.admin_facultyListPost)

app.get("/admin/timeTable",ensureJWTAuthenticated,adminController.admin_AddTimeTable)

app.post("/admin/timeTable",ensureJWTAuthenticated,adminController.admin_AddTimeTablePost)

app.get("/admin/viewTimeTable",ensureJWTAuthenticated,adminController.admin_viewTimeTable)

app.post("/admin/viewTimeTable",ensureJWTAuthenticated,adminController.admin_viewTimeTablePost)

app.get("/admin/freeSlot", ensureJWTAuthenticated, adminController.admin_viewFreeSlot)

app.post("/admin/freeSlot", ensureJWTAuthenticated, adminController.admin_viewFreeSlotPost)

app.get("/admin/addStudent",ensureJWTAuthenticated,adminController.admin_studentAdd)

app.post("/admin/addStudent",ensureJWTAuthenticated,adminController.admin_studentAddPost)

app.get("/admin/studentList", ensureJWTAuthenticated,adminController.admin_studentList)

app.post("/admin/studentList", ensureJWTAuthenticated,adminController.admin_studentListPost)

app.get("/admin/facEvent", ensureJWTAuthenticated, adminController.admin_facEvent)



// listening to port 3000

app.listen(3000,function(){
  console.log("Server started at port 3000");
})
