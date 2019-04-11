const express = require("express");
const line    = require("@line/bot-sdk");
const pg      = require("pg");
const config  = require("./config.json");

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
    client.query("SELECT * FROM talk", (err, result) => {
      done();
      console.log(result);
    });
  });
});

server.listen(process.env.PORT || 8000);
