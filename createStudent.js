const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Student = require("./models/student"); // Adjust the path as necessary

mongoose.connect("mongodb://127.0.0.1:27017/facMangDB", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    const studId = 2001; // Set your desired student ID
    const password = "studentPassword"; // Set your desired password

    // Hash the password before saving
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) throw err;

        const newStudent = new Student({
          studId: studId,
          password: hash,
          name: "Student Name", // Add student name
          email: "student@example.com", // Add student email
          phone: "0987654321", // Add student phone
          branch: "Computer Science" // Add student branch
        });

        newStudent.save()
          .then(() => {
            console.log("Student user created successfully!");
            mongoose.connection.close();
          })
          .catch(err => {
            console.error("Error creating student user:", err);
            mongoose.connection.close();
          });
      });
    });
  })
  .catch(err => {
    console.error("Error connecting to the database:", err);
  });