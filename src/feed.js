const { Feed } = require("feed");

const createFeed = (jurisdictionName, jurisdictionParam, terms, posts) => {
  const feed = new Feed({
    title:
      "FragDenStaat Alerts" +
      (terms != null ? ": " + terms : "") +
      (jurisdictionParam !== "all" ? " in " + jurisdictionName : ""),

    description: "Anfragen auf FragDenStaat.de per Alert verfolgen",
    id: "https://fragdenstaat-alerts.app.vis.one",
    link: "https://fragdenstaat-alerts.app.vis.one",
    generator: "npm install feed",
    feedLinks: {
      rss2:
        "https://fragdenstaat-alerts.app.vis.one/" +
        (jurisdictionParam !== "all" ? jurisdictionParam + "/" : "") +
        terms
    },
    author: {
      name: "Johannes Filter, FragDenStaat",
      email: "hi@jfilter.de",
      link: "https://johannesfilter.com"
    }
  });

  feed.addCategory("Informationsfreiheit");

  posts.forEach(post => {
    feed.addItem({
      title: post.subject,
      id: post.id,
      link: post.url,
      description: post.content,
      content: post.content,
      date: new Date(post.timestamp)
    });
  });
  return feed.rss2();
};

module.exports = { createFeed };
