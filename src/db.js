const { Pool } = require("pg");

const setUp = async () => {
  const pool = new Pool();

  // await pool.query("DROP TABLE IF EXISTS matches", (err, res) =>
  //   console.log(err, res)
  // );

  const createTableString = `CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    terms varchar(50) NOT NULL,
    request integer NOT NULL,
    created_at timestamp NOT NULL
  )`;

  await pool.query(createTableString, (err, res) => console.log(err, res));
  return pool;
};

const pool = setUp();

module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback);
  }
};
