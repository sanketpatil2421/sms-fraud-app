const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/fadse_db", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Connection Error:", err));

// ✅ Define User Schema
const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String, // Will store hashed password
});

const User = mongoose.model("User", UserSchema);

// ✅ Signup Route (Stores Hashed Password)
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "❌ User already exists!" });

    const hashedPassword = await bcrypt.hash(password, 10); // Hash password before storing
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.json({ message: "✅ Signup successful!" });
  } catch (error) {
    res.status(500).json({ message: "❌ Error signing up" });
  }
});

// ✅ Login Route (Verifies Hashed Password)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "❌ Invalid email or password" });

    const isPasswordValid = await bcrypt.compare(password, user.password); // Compare entered password with stored hash
    if (!isPasswordValid) return res.status(401).json({ message: "❌ Invalid email or password" });

    res.json({ message: "✅ Login successful!" });
  } catch (error) {
    res.status(500).json({ message: "❌ Error logging in" });
  }
});

// ✅ Start Server
app.listen(5000, () => console.log("🚀 Server running on port 5000"));
