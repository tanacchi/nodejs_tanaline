const express = require("express");
const line    = require("@line/bot-sdk");
const pg      = require("pg");
const config  = require("./config");

const pool = new pg.Pool(config.db.postgres);

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret:      process.env.LINE_CHANNEL_SECRET_KEY
};

const lineClient = new line.Client(lineConfig);
const server     = express();

server.post("/webhook", line.middleware(lineConfig), (req, res) => {
  res.sendStatus(200);
  pool.connect((err, client, done) => {
    client.query(query, param, (err, result) => {
      done();
      if(err) {
        callback(err);
      }
      else {
        console.log("sql: " + query + ", param: " + param + ", count:" + result.rowCount);
        callback(null, result);
      }
    });
  });
});

server.listen(process.env.PORT || 8000);
