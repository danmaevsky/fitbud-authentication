require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Routes
const changePasswordRouter = require("./routes/changePassword");
const createAccountRouter = require("./routes/createAccount");
const loginRouter = require("./routes/login");
const logoutRouter = require("./routes/logout");
const newTokenRouter = require("./routes/newToken");
const authRouter = require("./routes/auth");

const app = express();
app.use(express.json());

mongoose.set("strictQuery", true);
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });

const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Connected to Authentication Database"));

// Using Routes
app.use("/changePassword", changePasswordRouter);
app.use("/createAccount", createAccountRouter);
app.use("/login", loginRouter);
app.use("/logout", logoutRouter);
app.use("/newToken", newTokenRouter);
app.use("/auth", authRouter);

app.listen(8003, () => console.log("Auth Server started and listening..."));
