require('dotenv').config();
const Student = require("../models/student");
const Faculty = require("../models/faculty");
const Event = require("../models/event");
const FacultyEvent = require("../models/facultyEvent");
const flash = require("connect-flash");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser');

const student_login = (req,res) =>{
    res.render("student/studLogin");
}
const student_loginPost = (req,res) =>{
    var studId = req.body.lgnStudId;
    var studPass = req.body.lgnStudPass;
    Student.findOne({studId : studId}, function(err, foundStud){
        if(foundStud){
          bcrypt.compare(studPass, foundStud.password, (err, isMatch)=>{
            if(err) throw err;
            if(isMatch){
              const token = jwt.sign(
                {
                  studId : foundStud.studId
                },
                process.env.JWT_SECRET2
              )

              res.cookie("studjwt", token,{
                // expires : new Date(Date.now() + 300000),
                httpOnly : true
              })
              res.redirect("/student/profile");
              // console.log(token);
            }else{
                req.flash("error_msg","Incorrect Password");
                res.redirect("/student");
            }
          })
        }else{
            req.flash("error_msg","Incorrect Id");
            res.redirect("/student")
        }

  })
}

const student_logout = (req,res) => {
    res.clearCookie("studjwt");
    req.flash("success_msg", "Succesfully logged out");
    res.redirect("/student");
}



const student_profile = (req,res) => {
    const {studId} = res.locals;
    Student.findOne({studId : studId},(err,foundStud)=>{
      if (err) throw err;
      if(foundStud){
        res.render("student/profile",{profile : foundStud, pageName : "profile",
        studentName : foundStud.name});
      }
    })
}

const student_viewEvent = (req,res) =>{
  const {studId} = res.locals;
  var i = 1;
  Event.find({},(err,foundEvent) => {
    if (err) throw err;
    if(foundEvent){
    Student.findOne({studId : studId},(err,foundStud)=>{ 
      res.render("student/viewEvent", {event : foundEvent, i : i, pageName : "viewEvent",
      studentName : foundStud.name});
    })
    }
  })

}

const student_viewFacultyEvent = (req,res) =>{
  const {studId} = res.locals;
  var i = 1;
  FacultyEvent.find({},(err,foundFacEvent) => {
    if (err) throw err;
    if(foundFacEvent){
    Student.findOne({studId : studId},(err,foundStud)=>{ 
      res.render("student/viewFacEvent", {event : foundFacEvent, i : i, pageName : "viewFacultyEvent",
      studentName : foundStud.name});
    })
    }
  })

}


var success ; 
var listOfFacNames;
const student_freeSlot = (req,res) => {
  const {studId} = res.locals;
  Faculty.find({}, 'name', function(err, foundFacultiesName){
    if(err){
      console.log(err);
    } else{
      success = false;
      listOfFacNames = foundFacultiesName;
      Student.findOne({studId : studId},(err,foundStud)=>{ 
      res.render("student/freeSlot", {listOfFacNames : listOfFacNames, success : success, pageName : "freeSlot",studentName : foundStud.name});
    })
    }
  })
}
const student_freeSlotPost = (req,res) => {
  var facName = req.body.facNames;
  const {studId} = res.locals;
  Faculty.findOne({name : facName}, 'Monday Tuesday Wednesday Thursday Friday Saturday', function(err, timeTable){
    if(err){
      console.log(err);
    }else{
      success = true;
      Student.findOne({studId : studId},(err,foundStud)=>{
      res.render("student/freeSlot", {listOfFacNames:listOfFacNames, timeTable : timeTable, success : success, facName : facName, pageName : "freeSlot",studentName : foundStud.name});
      success = false
      })
    }
  })

}

const student_editProfile = (req,res) => {
  const {studId} = res.locals;
  Student.findOne({studId : studId},(err,foundStud)=>{
    if (err) throw err;
    if(foundStud){
      res.render("student/editProfile",{
        studName : foundStud.name,
        studEmail : foundStud.email,
        studPhone : foundStud.phone,
        studId : foundStud.studId,
        studBranch : foundStud.branch,
        pageName : "editProfile",
        studentName : foundStud.name
       });
    }
  })
  
}

const student_editProfilePost = (req,res) => {
  const {editEmail, editId, editName, editPhone, editBranch, editOldPass, editNewPass, editNewCnfPass} = req.body;


    if(editOldPass){
            if(editPhone.toString().length!=10){
                req.flash("error_msg", "Phone Number length should be of 10");
                res.redirect("/student/editProfile");
            }
            else{ 
            if(editNewPass && editNewCnfPass){
            if(editNewPass === editNewCnfPass){
                Student.findOne({studId : editId},function(err,foundStud){
                    if(err) throw err;
                    else{
                        if(foundStud){
                            bcrypt.compare(editOldPass, foundStud.password, (err,isMatch)=>{
                                if(err) throw err;
                                if(isMatch){
                                    bcrypt.genSalt(10, (err,salt)=>{
                                        bcrypt.hash(editNewPass, salt, (err,hash)=>{
                                            if (err) throw err;
                                            Student.updateOne({studId : editId}, {$set : {
                                                name : editName,
                                                email : editEmail,
                                                phone : editPhone,
                                                branch : editBranch,
                                                password : hash
                                            }},function(err,docs){
                                                if(err){
                                                    console.log(err);
                                                } else{
                                                    req.flash("success_msg", "Profile Updated Successfully")
                                                    res.redirect("/student/editProfile");
                                                }
                                            })
                                        })
                                    })
                                } else{
                                    req.flash("error_msg", "Old password does not match")
                                    res.redirect("/student/editProfile");
                                }
                            })
                        }
                    }
                })
            } else{
                req.flash("error_msg", "New Password doesn't match with Confirm Password");
                res.redirect("/student/editProfile");
            }
        }else{
            req.flash("error_msg", "New password and confirm password are required")
            res.redirect("/student/editProfile");
        }
    }

    }else{
        if(editPhone.toString().length!=10){
            req.flash("error_msg", "Phone Number length should be of 10");
            res.redirect("/student/editProfile");
        } else{
        Student.updateOne({studId : editId}, {$set : {
            name : editName,
            email : editEmail,
            phone : editPhone,
            branch : editBranch,
        }},function(err,docs){
            if(err){
                console.log(err);
            } else{
                req.flash("success_msg", "Profile Updated Successfully")
                res.redirect("/student/editProfile");
            }
        })
    }
    }
  
}

module.exports = {
    student_login,
    student_loginPost,
    student_logout,
    student_profile,
    student_viewEvent,
    student_freeSlot,
    student_freeSlotPost,
    student_editProfile,
    student_editProfilePost,
    student_viewFacultyEvent
}