require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const healthRouter = require("./routes/health");
const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const visitorsRouter = require("./routes/visitors");
const appointmentsRouter = require("./routes/appointments");
const passesRouter = require("./routes/passes");
const checkLogsRouter = require("./routes/checkLogs");
const publicRouter = require("./routes/public");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/visitors", visitorsRouter);
app.use("/appointments", appointmentsRouter);
app.use("/passes", passesRouter);
app.use("/check-logs", checkLogsRouter);
app.use("/public", publicRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
