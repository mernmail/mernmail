module.exports = (req, res) => {
  req.receiveDriver.close();
  res.json({ message: "OK!" });
};
