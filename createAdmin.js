const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/admin"); // Adjust the path as necessary

mongoose.connect("mongodb://127.0.0.1:27017/facMangDB", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    const adminId = 1234; // Set your desired admin ID
    const password = "password12"; // Set your desired password

    // Hash the password before saving
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) throw err;

        const newAdmin = new Admin({
          adminId: adminId,
          password: hash
        });

        newAdmin.save()
          .then(() => {
            console.log("Admin user created successfully!");
            mongoose.connection.close();
          })
          .catch(err => {
            console.error("Error creating admin user:", err);
            mongoose.connection.close();
          });
      });
    });
  })
  .catch(err => {
    console.error("Error connecting to the database:", err);
  });