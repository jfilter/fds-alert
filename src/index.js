const express = require("express");
const apicache = require("apicache");

const { createFeed } = require("./feed");
const { fetchallMessages } = require("./fetch-fds");
const jurisdictionMapping = require("./jurisdictions.json");

const app = express();

let cache = apicache.middleware;

const onlyRecent = dateString => {
  const PERIOD = 1000 * 60 * 60 * 24;
  const recentTime = Date.now() - PERIOD;
  return new Date(dateString) > recentTime;
};

app.get("/*", cache("10 minutes"), async (req, res) => {
  const parts = req.path.split("/").filter(x => x !== "");
  const jurisdictionName = parts[0];
  const terms = parts.reverse()[0];

  let jurisdictionParam = "all";
  if (parts.length > 1) {
    const allNames = jurisdictionMapping.map(({ name }) => name);
    const index = allNames.indexOf(jurisdictionName);
    if (index >= 0) {
      jurisdictionParam = jurisdictionMapping[jurisdictionName];
    } else {
      res.send("Choose from the following: " + allNames.join(" "));
      return;
    }
  }

  const msgs = await fetchallMessages(jurisdictionParam);
  const reg = new RegExp("(" + terms + ")", "i");
  const msgsFilterd = msgs
    .filter(x => onlyRecent(x.timestamp))
    .filter(x => terms == null || (reg.test(x.content) || reg.test(x.subject)))
    .sort((a, b) => a.timestamp < b.timestamp);

  // highlight matches in bold
  msgsFilterd.forEach(x => {
    x.content = x.content.replace(reg, "<b>$&</b>");
  });

  const feed = createFeed(
    jurisdictionParam,
    jurisdictionName,
    terms,
    msgsFilterd
  );

  res.send(feed);
});

app.listen(5000, () => console.log("Example app listening on port 3000!"));
