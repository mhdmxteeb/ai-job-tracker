
module.exports = (req, res, next) => {
  const { company, role } = req.body;
  if (!company || !role) {
    return res.status(400).json({ message: "Company and Role are required" });
  }
  next();
};
