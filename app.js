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
    default:                           return UserKind.Other;
  }
};

const messageCallback = (messageEvent) => {
  if (messageEvent.source.type == "user") {
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
  }
  else {
      console.log("groupID:" + messageEvent.source.groupId);
    if (messageEvent.message.type == "text" && messageEvent.message.text == "たなライン、退出願うぞ") {
      // const keyForId = messageEvent.source.type == "group" ? "groupId" : "roomId";
      // const targetId = messageEvent.source[keyForId];
      lineClient.replyMessage(messageEvent.replyToken, {type: "text", text: "うむ、承知したぞ。"})
        .then(() => {
          if (messageEvent.source.type == "group") {
            const groupId = messageEvent.source.groupId;
            lineClient.leaveGroup(groupId);
          }
          else {
            const roomId = messageEvent.source.roomId;
            lineClient.leaveRoom(roomId);
          }
        });
    }
    else if (messageEvent.message.type == "sticker")
    {
      const stickers = [
        {packageId: 11537, stickerId: 52002738},
        {packageId: 11537, stickerId: 52002741},
        {packageId: 11537, stickerId: 52002763},
        {packageId: 11537, stickerId: 52002756},
        {packageId: 11537, stickerId: 52002757},
        {packageId: 11537, stickerId: 5200277},
        {packageId: 11537, stickerId: 52002766},
        {packageId: 11538, stickerId: 51626513},
        {packageId: 11538, stickerId: 51626519},
        {packageId: 11538, stickerId: 51626527},
        {packageId: 11538, stickerId: 51626518},
        {packageId: 11538, stickerId: 51626505},
        {packageId: 11538, stickerId: 51626506},
        {packageId: 11538, stickerId: 52114123},
        {packageId: 11539, stickerId: 52114116},
        {packageId: 11539, stickerId: 52114141},
        {packageId: 11539, stickerId: 52114122},
        {packageId: 11539, stickerId: 52114137},
        {packageId: 11539, stickerId: 52114138}
      ];
      const reply_sticker = stickers[Math.floor(Math.random()*stickers.length)];
      lineClient.replyMessage(messageEvent.replyToken, {
        type: "sticker",
        packageId: reply_sticker.packageId,
        stickerId: reply_sticker.stickerId
      });
    }
  }
};

//
//  Functions for "memberJoined" event
//

const memberJoinedCallback = (memberJoinedEvent) => {
  for (const member of memberJoinedEvent.joined.members) {
    lineClient.getProfile(member.userId)
      .then((profile) => {
        lineClient.replyMessage(memberJoinedEvent.replyToken, {
          type: "text",
          text: `Welcome, ${profile.displayName} !`
        });
      })
    .catch((err) => {
      console.log(`[ERROR]: ${err}`);
    });
  }
};

//
//  Functions for "memberLeft" event
//

const memberLeftCallback = (memberLeftEvent) => {
  for (const member of memberLeftEvent.left.members)
  {
    lineClient.getProfile(member.userId)
      .then((profile) => {
        const replyString1 = profile.displayName + "さん，さようなら... (; ;)";
        const replyString2 = "ひとことは「" + profile.statusMessage + "」でした";
        const userImageUrl = profile.pictureUrl;
        const replyMessages = [
          {
            type: "text",
            text: replyString1
          },
          {
            type: "text",
            text: replyString2
          },
          // {
            // type: "image",
            // originalContentUrl: userImageUrl,
            // previewImageUrl: userImageUrl
          // }
        ];
        console.log(replyMessages);
        lineClient.replyMessage(memberLeftEvent.replyToken, replyMessages);
      });
  }
};

//
//  Request managers
//

server.post("/webhook", line.middleware(lineConfig), (req, res) => {
  res.sendStatus(200);

  for (const event of req.body.events) 
  {
    if (event.type == "message") 
    {
      messageCallback(event);
    }
    else if (event.type == "memberJoined")
    {
      memberJoinedCallback(event);
    }
    else if (event.type == "memberLeft")
    {
      memberLeftCallback(event);
    }
  }
});
