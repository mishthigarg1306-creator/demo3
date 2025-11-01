const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  user: { type: String, default: "Anonymous" },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const taskSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status: { type: String, enum: ["todo", "doing", "done"], default: "todo" },
    sourceType: { type: String, enum: ["email", "slack", "manual"], default: "manual" },
    sourceMeta: Object,
    assignee: { type: String, default: "" },
    comments: [commentSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
