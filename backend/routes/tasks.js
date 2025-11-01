const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

// Get all tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json({ tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

// Mark complete
router.put("/:id", async (req, res) => {
  try {
    const { completed } = req.body;
    const task = await Task.findByIdAndUpdate(req.params.id, { completed }, { new: true });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: "Failed to update task" });
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete task" });
  }
});


// Update a task (e.g., status or title)
router.patch("/:id", async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json({ task: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});
// Add a comment to a task
router.post("/:id/comments", async (req, res) => {
  try {
    const { user, message } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const comment = { user: user || "Anonymous", message };
    task.comments.push(comment);
    await task.save();

    // 🔥 Emit live update
    const io = req.app.get("io");
    io.emit("taskComment", { taskId: task._id, comment });

    res.json({ success: true, task });
  } catch (err) {
    console.error("❌ Comment error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Assign a task to a user
router.patch("/:id/assign", async (req, res) => {
  try {
    const { assignee } = req.body;
    if (!assignee) return res.status(400).json({ error: "Assignee required" });

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    task.assignee = assignee;
    await task.save();

    // 🔥 Emit real-time update
    const io = req.app.get("io");
    io.emit("taskAssigned", { taskId: task._id, assignee });

    res.json({ success: true, task });
  } catch (err) {
    console.error("❌ Assign error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
