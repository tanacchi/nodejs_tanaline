const express = require("express");
const line    = require("@line/bot-sdk");

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret:      process.env.LINE_CHANNEL_SECRET_KEY
};

const lineClient = new line.Client(lineConfig);
const server     = express();

server.post("/webhook", line.middleware(lineConfig), (req, res) => {
  res.sendStatus(200);

  for (const event of req.body.events) {
    if (event.type == "message") {
      lineClient.replyMessage(event.replyToken, {type: "text", text: "Hello"});
    }
  }
});

server.listen(process.env.PORT || 8000);
