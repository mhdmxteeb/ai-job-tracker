
const Application = require("../models/Application");

exports.createApplication = async (req, res) => {
  try {
    const app = new Application({ ...req.body, user: req.user.id });
    await app.save();
    res.status(201).json(app);
  } catch (err) {
    res.status(500).json({ message: "Failed to create application" });
  }
};

exports.getApplications = async (req, res) => {
  try {
    const apps = await Application.find({ user: req.user.id });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};
