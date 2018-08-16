const got = require("got");
const NodeCache = require("node-cache");

const BASE_URL = "https://fragdenstaat.de/api/v1/request/";
const PAGES = 2;
const CACHE_DURATION = 60 * 60;
const LIMIT = 50;

const fetchIds = async jurisdiction => {
  const res = await Promise.all(
    [...Array(PAGES).keys()].map(async x => {
      let url = `${BASE_URL}?limit=${LIMIT}&offset=${x * LIMIT}`;
      if (jurisdiction != "all") url += "&jurisdiction=" + jurisdiction;
      return (await got(url, { json: true })).body.objects.map(({ id }) => id);
    })
  );

  // flatten
  return res.reduce((a, b) => a.concat(b), []);
};

const fetchMessages = async jurisdiction => {
  const ids = await fetchIds(jurisdiction);

  const requests = await Promise.all(
    ids.map(async id => {
      const url = `${BASE_URL}${id}`;
      return (await got(url, { json: true })).body;
    })
  );

  return requests
    .map(({ messages, law: { letter_start, letter_end } }) => {
      // remove irrelevant text
      messages.forEach(x => {
        x.content = x.content.replace(letter_start, "").replace(letter_end, "");
      });
      return messages;
    })
    .reduce((a, b) => a.concat(b), []);
};

const fetchallMessages = (() => {
  const cache = new NodeCache({ stdTTL: CACHE_DURATION });

  const getFromCache = async jurisdiction => {
    let msgs = cache.get(jurisdiction);
    if (msgs == null) {
      try {
        msgs = await fetchMessages(jurisdiction);
        cache.set(jurisdiction, msgs);
      } catch (error) {
        console.error("error fetching messages", error);
        setTimeout(() => {
          return fetchallMessages();
        }, 5000);
      }
    }
    return msgs;
  };
  return getFromCache;
})();

module.exports = { fetchallMessages };
