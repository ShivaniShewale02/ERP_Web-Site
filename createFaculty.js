const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Faculty = require("./models/faculty"); // Adjust the path as necessary

mongoose.connect("mongodb://127.0.0.1:27017/facMangDB", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    const facId = 1001; // Set your desired faculty ID
    const password = "facultyPassword"; // Set your desired password

    // Hash the password before saving
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) throw err;

        const newFaculty = new Faculty({
          facId: facId,
          password: hash,
          name: "Faculty Name", // Add faculty name
          email: "faculty@example.com", // Add faculty email
          phone: "1234567890", // Add faculty phone
          role: "Professor", // Add faculty role
          areaOfInterest: "Computer Science" // Add faculty area of interest
        });

        newFaculty.save()
          .then(() => {
            console.log("Faculty user created successfully!");
            mongoose.connection.close();
          })
          .catch(err => {
            console.error("Error creating faculty user:", err);
            mongoose.connection.close();
          });
      });
    });
  })
  .catch(err => {
    console.error("Error connecting to the database:", err);
  });