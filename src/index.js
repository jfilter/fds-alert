const express = require("express");
const app = express();

const db = require("./db");
const fetchFds = require("./fetch-fds");

app.get("/", async (req, res) => res.send(await fetchFds.allMessages()));

app.get("/feed/*", (req, res) => {
  console.log(req);
  console.log(req.path);
  res.send("Hello World!");
});

app.listen(3000, () => console.log("Example app listening on port 3000!"));
