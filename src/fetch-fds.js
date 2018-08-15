const got = require("got");
const NodeCache = require("node-cache");

const BASE_URL = "https://fragdenstaat.de/api/v1/request/";
const PAGES = 2;
const CACHE_DURATION = 60 * 60;

const fetchIds = async () => {
  const res = await Promise.all(
    [...Array(PAGES).keys()].map(async x => {
      const url = `${BASE_URL}?limit=50&offset=${x * 50}`;
      return (await got(url, { json: true })).body.objects.map(({ id }) => id);
    })
  );

  // flatten
  return res.reduce((a, b) => a.concat(b), []);
};

const fetchMessages = async () => {
  const ids = await fetchIds();

  return await Promise.all(
    ids.map(async id => {
      const url = `${BASE_URL}${id}`;
      return (await got(url, { json: true })).body;
    })
  );
};

const cache = new NodeCache({ stdTTL: CACHE_DURATION });

const allMessages = async () => {
  let msgs = cache.get("all");
  if (msgs == null) {
    msgs = await fetchMessages();
    cache.set("all", msgs);
  }
  return msgs;
};

module.exports = { allMessages };
