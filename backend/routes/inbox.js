const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const { summarizeMessage } = require("../services/aiService");

/**
 * @route   POST /api/inbox
 * @desc    Create a new task automatically from any message (email, slack, manual)
 * @body    { sourceType, content, from, meta }
 */
router.post("/", async (req, res) => {
  try {
    let { sourceType = "", content = "", from = "", meta = {} } = req.body;

    if (!content.trim()) {
      return res.status(400).json({ error: "Message content required" });
    }

    // 🧠 Auto-detect sourceType if not provided
    if (!sourceType) {
      if (from?.includes("@")) sourceType = "email";
      else if (content.toLowerCase().includes("slack")) sourceType = "slack";
      else sourceType = "manual";
    }

    // ✨ Summarize content using AI (Gemini or fallback)
    const aiResult = await summarizeMessage(content);

    // 🪄 Create new Task
    const task = await Task.create({
      title: aiResult.title,
      description: aiResult.summary,
      priority: aiResult.priority,
      sourceType,
      sourceMeta: { from, ...meta },
      status: "todo",
    });

    console.log(`📩 New ${sourceType.toUpperCase()} task created:`, task.title);

    return res.status(201).json({
      message: `Task created from ${sourceType} message.`,
      task,
    });
  } catch (err) {
    console.error("❌ Inbox route error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @route   GET /api/inbox
 * @desc    Simple test route
 */
router.get("/", (req, res) => {
  res.send("✅ Inbox API active — send POST to /api/inbox to create summarized tasks.");
});

module.exports = router;
