const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("./models/User");
const bcrypt = require("bcrypt");
const Task = require("./models/Task");
const app = express();

//mongodb cluster connection, fill in url
mongoose.connect(
  "mongodb+srv://suyyaf:12345@work-station.ditlo.mongodb.net/work-station"
);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/signup", (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  });
  newUser.save(err => {
    if (err) {
      return res.status(400).json({
        title: "error",
        error: "Email already in use"
      });
    }
    return res.status(200).json({
      title: "User successfully added"
    });
  });
});

app.post("/login", (req, res) => {
  User.findOne({ username: req.body.username }, (err, user) => {
    if (err)
      return res.status(500).json({
        title: "server error",
        error: err
      });
    if (!user) {
      return res.status(400).json({
        title: "user is not found",
        error: "invalid username or password"
      });
    }
    if (!bcrypt.compareSync(req.body.password, user.password)) {
      return res.status(401).json({
        title: "login failed",
        error: "invalid username or password"
      });
    }
    //authentication to get token
    let token = jwt.sign({ userId: user._id }, "secretkey");
    return res.status(200).json({
      title: "login successful",
      token: token
    });
  });
});

//TASK ROUTE
app.get("/tasks", (req, res) => {
  //verify
  jwt.verify(req.headers.token, "secretkey", (err, decoded) => {
    if (err)
      return res.status(401).json({
        title: "not authorized"
      });

    //if token is valid
    Task.find({ author: decoded.userId }, (err, tasks) => {
      if (err) return console.log(err);
      return res.status(200).json({
        title: "success",
        tasks: tasks
      });
    });
  });
});

// const requireToken = (req, res, next) => {
//   jwt.verify(re.headers.token, "secretkey", (err, decoded) => {
//     if (err)
//       return res.status(401).json({
//         title: "not authorized"
//       });
//   });
//   //valid token
//   next();
// };

//mark task route
app.post("/task", (req, res) => {
  //verify
  jwt.verify(req.headers.token, "secretkey", (err, decoded) => {
    if (err)
      return res.status(401).json({
        title: "not authorized"
      });

    let newTask = new Task({
      title: req.body.title,
      date: req.body.date,
      isCompleted: false,
      author: decoded.userId
    });

    newTask.save(error => {
      if (error) return console.log(error);
      return res.status(201).json({
        title: "successfully added",
        task: newTask
      });
    });
  });
});

//mark task as complete route
app.put("/task/:taskId", (req, res) => {
  jwt.verify(req.headers.token, "secretkey", (err, decoded) => {
    if (err)
      return res.status(401).json({
        title: "not authorized"
      });
    //if token is valid
    Task.findOne(
      { author: decoded.userId, _id: req.params.taskId },
      (err, task) => {
        if (err) return console.log(err);

        task.isCompleted = !task.isCompleted;
        task.save(error => {
          if (error) return console.log(error);
          //saved
          return res.status(200).json({
            title: "success",
            task: task
          });
        });
      }
    );
  });
});

// app.get("/user", (req, res) => {
//   let token = req.headers.token;
//   //verify
//   jwt.verify(token, "secretkey", (err, decoded) => {
//     if (err)
//       return res.status(401).json({
//         title: "not authorized"
//       });

//     //if token is valid
//     User.findOne({ _id: decoded.userId }, (err, user) => {
//       if (err) return console.log(err);
//       return res.status(200).json({
//         title: "success",
//         user: {
//           username: user.username
//         }
//       });
//     });
//   });
// });

const port = process.env.PORT || 5000;

app.listen(port, err => {
  if (err) return console.log(err);
  else console.log("Server is running at port: ", port);
});
