const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const signinRouter = require("express").Router();
const User = require("../models/user");

// in case the user has alrady signed up before and wants to log in
signinRouter.post("/", async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser)
      return res.status(404).json({ message: "User doesn't exist." });

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid credentials." });

    // if the user exists and the password is correct, we are good to go and we create the token to send back to the frontend
    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      process.env.SECRET,
      { expiresIn: 60 * 60 }
    );

    res.status(200).json({ result: existingUser, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong." });
  }
});

module.exports = signinRouter;
