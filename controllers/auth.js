const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/auth");

const { signupValidation, loginValidation } = require("../utils/validation.js");

const signup = async (req, res, next) => {
  const { name, email, phone, password } = req.body;


  try {
    const { error } = signupValidation({ name, email, phone, password });

    if (error) {
      res.status(400);
  
      throw new Error(error.details[0].message);
    }

    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      res.status(400);
      throw new Error("⚠️ Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const savedUser = await User.create({ name, email, phone, password: hashedPassword });

    const accessToken = jwt.sign({ id: savedUser._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });

    res.cookie('jwtToken', accessToken, { maxAge: 900000, httpOnly: true });


    // res.status(201).json({
    //   user: { id: savedUser._id, name: savedUser.name, email: savedUser.email, phone: savedUser.phone },
    //   token,
    // });

    res.redirect("/menu");
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const { error } = loginValidation({ email, password });

    if (error) {
      res.status(400);
      throw new Error(error.details[0].message);
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      res.status(400);
      throw new Error("⚠️ Email not found");
    }

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);

    if (!isPasswordCorrect) {
      res.status(400);
      res.redirect("/login");
      // throw new Error("❌ Password is wrong");
    }

    const accessToken = jwt.sign({ id: existingUser._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });

    res.cookie('jwtToken', accessToken, { maxAge: 900000, httpOnly: true });

    // res.status(201).json({
    //   user: {  id: existingUser._id,  name: existingUser.name,  email: existingUser.email,},
    //   token,
    // });

    res.redirect("/menu");

  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  signup,
};
