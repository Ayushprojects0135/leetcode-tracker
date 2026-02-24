const cors = require("cors");
require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");

const app = express();

connectDB(); // Connect to database
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("LeetCode Tracker API Running 🚀");
});

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);


const PORT = process.env.PORT || 5000;
app.use((req, res, next) => {
    res.status(404).json({ message: "Route not found" });
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong" });
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});