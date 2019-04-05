//
//  Setup service for Messaging API
//

const express = require("express");
const line    = require("@line/bot-sdk");

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret:      process.env.LINE_CHANNEL_SECRET_KEY
};

const lineClient = new line.Client(lineConfig);
const server     = express();
server.listen(process.env.PORT || 8000);

//
//  Functions for "message" event
//

const UserKind = {
  Hiyori: 0, Tanacchi: 1, Other: 2
};

const detectUserKind = (userId) => {
  switch (userId) {
    case process.env.HIYORI_USER_ID:   return UserKind.Hiyori;;
    case process.env.TANACCHI_USER_ID: return UserKind.Tanacchi;
    default:                            return UserKind.Other;
  }
};

const messageCallback = (messageEvent) => {
  const userId = messageEvent.source.userId;
  lineClient.getProfile(userId)
    .then((profile) => {
      const publisherName = profile.displayName;
      console.log(`publisher id: ${userId}`);
      console.log(`publisher name: ${publisherName}`);
      if (messageEvent.message.type == "text") {
        console.log(`message content: ${messageEvent.message.text}`);
      }
      const userKind = detectUserKind(userId);
      switch (userKind)
      {
        case UserKind.Hiyori:
          lineClient.replyMessage(messageEvent.replyToken, {type: "text", text: "あいあいよちよち"});
          break;
        case UserKind.Tanacchi:
          lineClient.pushMessage(process.env.HIYORI_USER_ID, {type: "text", text: messageEvent.message.text}); 
          lineClient.replyMessage(messageEvent.replyToken, {type: "text", text: "Message was sent."});
          break;
        default:
          lineClient.replyMessage(messageEvent.replyToken, {type: "text", text: "Hello"});
      }
    });
};

//
//  Request managers
//

server.post("/webhook", line.middleware(lineConfig), (req, res) => {
  res.sendStatus(200);

  for (const event of req.body.events) {
    if (event.type == "message") {
      messageCallback(event);
    }
  }
});

