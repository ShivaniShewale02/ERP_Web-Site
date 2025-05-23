const Faculty = require("../models/faculty");
const Event = require("../models/event");
const FacultyEvent = require("../models/facultyEvent");
const passport = require("passport");
const flash = require("connect-flash");
const bcrypt = require("bcryptjs");

const faculty_login = (req,res) =>{
    res.render("faculty/facLogin");
}

const faculty_loginPost = (req,res,next) =>{
    passport.authenticate("faculty",{
        successRedirect : "/faculty/dashboard",
        failureRedirect : "/faculty",
        failureFlash : true
      })(req, res, next);
}

const faculty_logout = (req,res) =>{
    req.logout();
    req.flash("success_msg", "Succesfully logged out");
    res.redirect("/faculty");
}

const faculty_profile = (req,res) =>{
    res.render("faculty/myProfile",{
        foundFacName : req.user.name,
        foundFacEmail : req.user.email,
        foundFacPhone : req.user.phone,
        foundFacId : req.user.facId,
        foundFacRole : req.user.role,
        foundFacAOF : req.user.areaOfInterest,
        pageName : "profile",
        facultyName : req.user.name    //for header file to display it along with the welcome
       });
}

const faculty_addEvent = (req,res) => {
    res.render("faculty/addEvent", {pageName : "addEvent", facultyName : req.user.name});
}

const faculty_addEventPost = (req,res) => {
    const {evtName, evtDate ,evtDesc} = req.body;
    const event = new Event({
        name : evtName,
        date : evtDate,
        description : evtDesc
    })
    event.save((err)=>{
        if(err) throw err;
        else {
            req.flash("success_msg", "Event Added succesfully");
            res.redirect("/faculty/addEvent");
        }
    })
}

const faculty_addFacultyEvent = (req,res) => {
    res.render("faculty/facultyEvent", {pageName : "addFacultyEvent", facultyName : req.user.name});
}


const faculty_addFacultyEventPost = (req,res) => {
    const {facEvtName, facEvtDate ,facEvtDesc} = req.body;
    const facEvent = new FacultyEvent({
        name : facEvtName,
        date : facEvtDate,
        description : facEvtDesc,
        addedBy : req.user.name
    })
    facEvent.save((err)=>{
        if(err) throw err;
        else {
            req.flash("success_msg", "Event Added succesfully");
            res.redirect("/faculty/addFacultyEvent");
        }
    })
}

const faculty_timeTable = (req,res) => {
    res.render("faculty/timeTable",{
        monday : req.user.Monday,
        tuesday : req.user.Tuesday,
        wednesday : req.user.Wednesday,
        thursday : req.user.Thursday,
        friday : req.user.Friday,
        saturday : req.user.Saturday,
        pageName : "timeTable",
        facultyName : req.user.name
      });
}

const faculty_studFeedback = (req,res) => {
    res.render("faculty/studentFeedback", {pageName : "studFeedback",facultyName : req.user.name});
}

const faculty_freeSlot = (req,res) => {
    res.render("faculty/freeSlot",{
        monday : req.user.Monday,
        tuesday : req.user.Tuesday,
        wednesday : req.user.Wednesday,
        thursday : req.user.Thursday,
        friday : req.user.Friday,
        saturday : req.user.Saturday,
        pageName : "freeSlot",
        facultyName : req.user.name
      });
}

const faculty_editProfile = (req,res) => {
    res.render("faculty/editProfile",{
        facName : req.user.name,
        facEmail : req.user.email,
        facPhone : req.user.phone,
        facId : req.user.facId,
        facAOF : req.user.areaOfInterest,
        pageName : "editProfile",
        facultyName : req.user.name
       });
}

const faculty_editProfilePost = (req,res) => {
    const {editEmail, editId, editName, editPhone, editAOF, editOldPass, editNewPass, editNewCnfPass} = req.body;


    if(editOldPass){
            if(editPhone.toString().length!=10){
                req.flash("error_msg", "Phone Number length should be of 10");
                res.redirect("/faculty/editProfile");
            }
            else{ 
        if(editNewPass && editNewCnfPass){
            if(editNewPass === editNewCnfPass){
                Faculty.findOne({facId : editId},function(err,foundFac){
                    if(err) throw err;
                    else{
                        if(foundFac){
                            bcrypt.compare(editOldPass, foundFac.password, (err,isMatch)=>{
                                if(err) throw err;
                                if(isMatch){
                                    bcrypt.genSalt(10, (err,salt)=>{
                                        bcrypt.hash(editNewPass, salt, (err,hash)=>{
                                            if (err) throw err;
                                            Faculty.findByIdAndUpdate(req.user._id, {$set : {
                                                name : editName,
                                                email : editEmail,
                                                phone : editPhone,
                                                areaOfInterest : editAOF,
                                                password : hash
                                            }},function(err,docs){
                                                if(err){
                                                    console.log(err);
                                                } else{
                                                    req.flash("success_msg", "Profile Updated Successfully")
                                                    res.redirect("/faculty/editProfile");
                                                }
                                            })
                                        })
                                    })
                                } else{
                                    req.flash("error_msg", "Old password does not match")
                                    res.redirect("/faculty/editProfile");
                                }
                            })
                        }
                    }
                })
            } else{
                req.flash("error_msg", "New Password doesn't match with Confirm Password");
                res.redirect("/faculty/editProfile");
            }
        }else{
            req.flash("error_msg", "New password and confirm password are required")
            res.redirect("/faculty/editProfile");
        }
    }

    }else{
        if(editPhone.toString().length!=10){
            req.flash("error_msg", "Phone Number length should be of 10");
            res.redirect("/faculty/editProfile");
        } else{
        Faculty.findByIdAndUpdate(req.user._id, {$set : {
            name : editName,
            email : editEmail,
            phone : editPhone,
            areaOfInterest : editAOF,
        }},function(err,docs){
            if(err){
                console.log(err);
            } else{
                req.flash("success_msg", "Profile Updated Successfully")
                res.redirect("/faculty/editProfile");
            }
        })
    }
    }
   
}



module.exports = {
    faculty_login,
    faculty_loginPost,
    faculty_logout,
    faculty_profile,
    faculty_addEvent,
    faculty_addEventPost,
    faculty_timeTable,
    faculty_studFeedback,
    faculty_freeSlot,
    faculty_editProfile,
    faculty_editProfilePost,
    faculty_addFacultyEvent,
    faculty_addFacultyEventPost
}
