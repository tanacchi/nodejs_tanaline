//
// Setup server
//

const express = require("express");
const line    = require("@line/bot-sdk");
const path    = require("path");

const appUrl = process.env.HEROKU_APP_URL;
const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret:      process.env.LINE_CHANNEL_SECRET_KEY
};

const lineClient = new line.Client(lineConfig);
const server     = express();

server.use("/images", express.static(path.join(__dirname, "images")));
server.listen(process.env.PORT || 8000);


//
// Request handlers
//

server.post("/webhook", line.middleware(lineConfig), (req, res) => {
  res.sendStatus(200);

  const message = {
    type: "image",
    previewImageUrl: `${appUrl}/images/nodejs.png`,
    originalContentUrl: `${appUrl}/images/nodejs.png`
  };

  console.log(message);
  for (const event of req.body.events) {
    if (event.type == "message") {
      lineClient.replyMessage(event.replyToken, message);
    }
  }
});

