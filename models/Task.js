const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
  title: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  date: { type: String, required: true },
  isCompleted: { type: Boolean, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User" }
});

const Task = mongoose.model("Task", TaskSchema);
module.exports = Task;
