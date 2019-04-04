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
      lineClient.getProfile(event.source.userId)
        .then((profile) => {
          const publisher_name = profile.displayName;
          console.log(`publisher_id: ${event.source.userId}`);
          console.log(`publisher_name: ${publisher_name}`);
          if (event.message.type == "text") {
            console.log(`message content: ${event.message.text}`);
          }
          if (publisher_name == process.env.HIYORI_USER_NAME) {
            lineClient.replyMessage(event.replyToken, {type: "text", text: "あいあいよちよち"});
          } else {
            lineClient.replyMessage(event.replyToken, {type: "text", text: "Hello"});
          }
        });
    }
  }
});

server.listen(process.env.PORT || 8000);
