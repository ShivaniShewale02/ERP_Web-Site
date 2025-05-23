const Admin = require("../models/admin");
const Faculty = require("../models/faculty");
const Student = require("../models/student");
const FacultyEvent = require("../models/facultyEvent");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const flash = require("connect-flash");
var cookieParser = require('cookie-parser');


const admin_login = (req,res) => {
    res.render("admin/adminLogin");
}

const admin_loginPost = (req, res)=>{
    var adminId = req.body.adminId;
    var adminPass = req.body.adminPass;
    let admLgnErr = []
    Admin.findOne({adminId : adminId}, function(err, foundAdmin){
        if(foundAdmin){
          bcrypt.compare(adminPass, foundAdmin.password, (err, isMatch)=>{
            if(err) throw err;
            if(isMatch){
              const token = jwt.sign(
                {
                  adminId : foundAdmin.adminId
                },
                process.env.JWT_SECRET
              )

              res.cookie("jwt", token,{
                // expires : new Date(Date.now() + 300000),
                httpOnly : true
              })
              res.redirect("/admin/addFaculty");
              // console.log(token);
            }else{
              admLgnErr.push({msg : "Invalid ID or Password"});
              res.render("admin/adminLogin", {admLgnErr,adminId,adminPass});
            }
          })
        }else{
          admLgnErr.push({msg : "Invalid ID or Password"});
          res.render("admin/adminLogin", {admLgnErr,adminId,adminPass});
        }

  })
}

const admin_logout = (req,res) => {
    res.clearCookie("jwt");
    req.flash("success_msg", "Succesfully logged out");
    res.redirect("/admin");
}

const admin_facultyAdd = (req,res)=>{
    const {adminId} = res.locals; // accessing the adminId passes from middelware (ensureJWTAuthenticated)
    // console.log(adminId);
    res.render("admin/admFacultyAdd", {pageName : "addFaculty"});
}

const admin_facultyAddPost = (req,res)=>{
    var regFacId = req.body.regFacId;
    var regFacName = req.body.facultyAdminName;
    var regFacEmail = req.body.facAdminEmail;
    var regFacPass = req.body.facAdminPass;
    var regFacAreaOfInterest = req.body.areaOfInterest;
    var regFacRole = req.body.facRole;
    var regFacPhone = req.body.facPhone;
    let errors = [];
  //check required fields
  if(!regFacId || !regFacName || !regFacEmail || !regFacPass || !regFacAreaOfInterest || !regFacRole || !regFacPhone){
    errors.push({msg : "All fields are Required"})
  }
  if(regFacPass){
    if(regFacPass.length < 6){
      errors.push({msg: "password should be of at least 6 characters"});
    }
  }
  if(regFacPhone){
    if(regFacPhone.toString().length!=10){
      errors.push({msg : "Phone number length should be 10"})
    }
  }
  if(errors.length > 0){
    res.render("admin/admFacultyAdd",{
      errors,
      regFacId,
      regFacName,
      regFacEmail,
      regFacPass,
      regFacAreaOfInterest,
      regFacRole,
      regFacPhone,
      pageName : "addFaculty"
    });
  }else{
  Faculty.findOne({facId : regFacId})
  .then(fac => {
    if(fac) {
      //faculty already registered
      errors.push({msg : "Faculty with "+regFacId+" ID is already added"});
      res.render("admin/admFacultyAdd",{
        errors,
        regFacId,
        regFacName,
        regFacEmail,
        regFacPass,
        regFacAreaOfInterest,
        regFacRole,
        regFacPhone,
        pageName : "addFaculty"
      });
    }else{
      const faculty = new Faculty({
          facId : regFacId,
          name : regFacName,
          email : regFacEmail,
          password : regFacPass,
          role  : regFacRole,
          areaOfInterest : regFacAreaOfInterest,
          phone : regFacPhone
        })
        bcrypt.genSalt(10, (err,salt) =>{
          bcrypt.hash(faculty.password, salt, (err, hash) => {
            if(err) throw err;
            //set password to hash
            faculty.password = hash;
            //save faculty
            faculty.save(function(err){
              if(!err){
                // success = true ;
                req.flash("success_msg", "Succesfully Added Faculty to the database");
                res.redirect("/admin/addFaculty");
              }
            });
          })
        })

    }
  })
  }
}

const admin_facultyList = (req,res) => {
    Faculty.find({}, function(err, foundFaculties){
        if(err){
          console.log(err);
        } else{
          res.render("admin/admFacultyList", {listOfFac : foundFaculties,
            pageName : "facultyList"});
        }

      })
}

const admin_facultyListPost = (req,res) => {
    var checked = req.body.checkbox;
    console.log(checked);
    Faculty.deleteOne({facId : checked},function(err){
        if(err){
        console.log(err);
        }else{
        console.log("Succesfully Deleted");
        res.redirect("/admin/facultyList");
        }
    })
}


const admin_AddTimeTable = (req,res) => {
  Faculty.find({}, 'name', function(err, foundFacultiesName){
    if(err){
      console.log(err);
    } else{
      res.render("admin/admTimeTable", {listOfFacName : foundFacultiesName, pageName:"addTimeTable"});
    }

  })
}

const admin_AddTimeTablePost = (req,res) => {
  const {facName, day, time, subject, subLocation} = req.body;
  Faculty.updateOne({name : facName},{$push : {[day] : {  //instead of timetable if using //that new schema [day]
    time : time,
    subject : subject,
    subLocation : subLocation
  }}},{upsert: true},function(err){
    if(err){
      console.log(err);
    } else{
      req.flash("success_msg", "Time-Table data added successfully");
      res.redirect("/admin/timeTable");
    }
  })
}

const admin_viewTimeTable = (req,res) => {
  Faculty.find({}, 'name', function(err, foundFacultiesName){
    if(err){
      console.log(err);
    } else{
      res.render("admin/admViewTT", {listOfFacNames : foundFacultiesName,
        pageName : "viewTimeTable"});
    }
  })
}

const admin_viewTimeTablePost = (req,res) => {
  var facName = req.body.facName;
  Faculty.findOne({name : facName}, 'Monday Tuesday Wednesday Thursday Friday Saturday', function(err, timetable){
    if(err){
      console.log(err);
    }else{
      res.send(timetable)
    }
  })
}

var success ; 
var listOfFacNames;
const admin_viewFreeSlot = (req,res) => {
  Faculty.find({}, 'name', function(err, foundFacultiesName){
    if(err){
      console.log(err);
    } else{
      success = false;
      listOfFacNames = foundFacultiesName;
      res.render("admin/viewFreeSlot", {listOfFacNames : listOfFacNames, success : success, pageName : "freeSlot"});
    }
  })
}

const admin_viewFreeSlotPost = (req,res) => {
  var facName = req.body.facNames;
  Faculty.findOne({name : facName}, 'Monday Tuesday Wednesday Thursday Friday Saturday', function(err, timeTable){
    if(err){
      console.log(err);
    }else{
      success = true;
      res.render("admin/viewFreeSlot", {listOfFacNames:listOfFacNames, timeTable : timeTable, success : success, facName : facName, pageName : "freeSlot"});
      success = false
    }
  })

}

const admin_studentAdd = (req,res) => {
  res.render("admin/admStudentAdd", {pageName : "addStudent"});
}

const admin_studentAddPost = (req,res)=>{
  var regStudId = req.body.studId;
  var regStudName = req.body.studName;
  var regStudEmail = req.body.studEmail;
  var regStudPass = req.body.studPass;
  var regStudPhone = req.body.studPhone;
  var regStudBranch = req.body.studBranch;
  let studAdd_errors = [];
//check required fields
if(!regStudId || !regStudName || !regStudEmail || !regStudPass || !regStudPhone || !studAdd_errors || !regStudBranch){
  studAdd_errors.push({msg : "All fields are Required"})
}
if(regStudPass){
  if(regStudPass.length < 6){
    studAdd_errors.push({msg: "password should be of at least 6 characters"});
  }
}
if(regStudPhone){
  if(regStudPhone.toString().length!=10){
    studAdd_errors.push({msg : "Phone number length should be 10"})
  }
}
if(studAdd_errors.length > 0){
  res.render("admin/admStudentAdd",{
    studAdd_errors,
    regStudId,
    regStudName,
    regStudPhone,
    regStudEmail,
    regStudPass,
    regStudBranch,
    pageName : "addStudent"
  });
}else{
Student.findOne({studId : regStudId})
.then(stud => {
  if(stud) {
    //student already registered
    studAdd_errors.push({msg : "Student with "+regStudId+" ID is already added"});
    res.render("admin/admStudentAdd",{
      studAdd_errors,
      regStudId,
      regStudName,
      regStudPhone,
      regStudEmail,
      regStudPass,
      regStudBranch,
      pageName : "addStudent"
    });
  }else{
    const student = new Student({
        studId : regStudId,
        name : regStudName,
        email : regStudEmail,
        phone : regStudPhone,
        password : regStudPass,
        branch : regStudBranch
      })
      bcrypt.genSalt(10, (err,salt) =>{
        bcrypt.hash(student.password, salt, (err, hash) => {
          if(err) throw err;
          //set password to hash
          student.password = hash;
          //save faculty
          student.save(function(err){
            if(!err){
              // success = true ;
              req.flash("success_msg", "Succesfully Added Student to the database");
              res.redirect("/admin/addStudent");
            }
          });
        })
      })

  }
})
}
}

const admin_studentList = (req,res) => {
  Student.find({}, function(err, foundStudents){
      if(err){
        console.log(err);
      } else{
        res.render("admin/admStudentList", {listOfStud : foundStudents,
          pageName : "studentList"});
      }

    })
}

const admin_studentListPost = (req,res) => {
  var checked = req.body.checkbox;
  console.log(checked);
  Student.deleteOne({studId : checked},function(err){
      if(err){
      console.log(err);
      }else{
      console.log("Succesfully Deleted");
      res.redirect("/admin/studentList");
      }
  })
}

const admin_facEvent = (req,res) => {
  var i = 1;
  FacultyEvent.find({},(err,foundFacEvent) => {
    if (err) throw err;
    if(foundFacEvent){
      res.render("admin/admFacEvent", {event: foundFacEvent, i:i, pageName : "facEvent"});
    }
  })
}


module.exports = {
    admin_login,
    admin_loginPost,
    admin_logout,
    admin_facultyAdd,
    admin_facultyAddPost,
    admin_facultyList,
    admin_facultyListPost,
    admin_AddTimeTable,
    admin_AddTimeTablePost,
    admin_viewTimeTable,
    admin_viewTimeTablePost,
    admin_studentAdd,
    admin_studentAddPost,
    admin_studentList,
    admin_studentListPost,
    admin_viewFreeSlot,
    admin_viewFreeSlotPost,
    admin_facEvent
}
