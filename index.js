require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require('cookie-parser')

const authValidate = require("./middlewares/auth");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const authRoutes = require("./routes/auth");

const app = express();

// Middlewares
app.use(helmet());
app.use(morgan("dev"));
app.use(cors());
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(express.static(path.join(__dirname,"/public")));
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')))


app.get("/", (req, res) => {
  res.sendFile("index.html");
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, 'public/signup.html'));
})

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login.html'));
})

app.get("/contact", (req, res) => {
  res.sendFile(path.join(__dirname, 'public/contact.html'));
})

app.get("/menu", authValidate, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/menu.html'));
})

// Routes
app.use("/auth", authRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 1337;
app.listen(port, () => console.log(`🖥️ Listening: http://localhost:${port}/`));

// Database Connectivity
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("✅ Connected to database");
});

mongoose.connection.on("error", (error) => {
  console.log("❌ Error while connecting to database ", error);
});
