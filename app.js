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
  for (const event of req.body.events) {
    if (event.source.type == "user"
        && event.type == "message" 
        && event.message.type == "text") {
      pool.connect((err, client, done) => {
        const query = "INSERT INTO talk (user_id, message) VALUES ("
                      +"'"+event.source.userId+"', '"+event.message.text+"');";
        console.log("query: " + query);
        client.query(query, (err, result) => {
          done();
        });
      });
    }
  }
  pool.connect((err, client, done) => {
    client.query("SELECT * FROM talk", (err, result) => {
      done();
      console.log(result);
    });
  });
});

server.listen(process.env.PORT || 8000);
