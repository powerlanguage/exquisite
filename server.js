const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const server = require("http").createServer(app);
const path = require("path");

app.use(express.static(`${__dirname}/build`));

app.get("/api/hello", (req, res) => {
  res.send(JSON.stringify({ express: "hello world" }));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build/index.html"));
});

const PORT = 4010;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
