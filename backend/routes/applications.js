
const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const auth = require("../middleware/auth");

// Create application
router.post("/", auth, async (req, res) => {
  try {
    const application = new Application({
      ...req.body,
      user: req.user.id
    });
    await application.save();
    res.json(application);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Get user applications
router.get("/", auth, async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user.id });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
