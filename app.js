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
      const use_id = event.source.userId;
      lineClient.getProfile(use_id)
        .then((profile) => {
          const publisher_name = profile.displayName;
          console.log(`publisher id: ${use_id}`);
          console.log(`publisher name: ${publisher_name}`);
          if (event.message.type == "text") {
            console.log(`message content: ${event.message.text}`);
          }
          if (use_id == process.env.HIYORI_USER_ID) {
            lineClient.replyMessage(event.replyToken, {type: "text", text: "あいあいよちよち"});
          } else if (use_id == process.env.TANACCHI_USER_ID) {
            lineClient.pushMessage(process.env.HIYORI_USER_ID, {type: "text", text: event.message.text}); 
            lineClient.replyMessage(event.replyToken, {type: "text", text: "Message was send"});
          } else {
            lineClient.replyMessage(event.replyToken, {type: "text", text: "Hello"});
          }
        });
    }
  }
});

server.listen(process.env.PORT || 8000);
