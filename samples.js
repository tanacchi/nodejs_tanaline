//
// Setup server
//

const express = require("express");
const line    = require("@line/bot-sdk");
const pg      = require("pg");
const config  = require("./config.json");

const pool = new pg.Pool(config.db.postgres);
const os      = require("os");
const geoip   = require("geoip-lite");
const path    = require("path");

const appUrl = process.env.HEROKU_APP_URL;
const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret:      process.env.LINE_CHANNEL_SECRET_KEY
};

const lineClient = new line.Client(lineConfig);
const server     = express();

server.listen(process.env.PORT || 8000);

server.post("/webhook", line.middleware(lineConfig), (req, res) => {
  res.sendStatus(200);
  for (const event of req.body.events) {
    if (event.source.type == "user" && event.type == "message" && event.message.type == "text") {
      if (event.message.text == "履歴") {
        pool.connect((err, client, done) => {
          const query = "SELECT * FROM talk WHERE user_id = '"+event.source.userId+"';";
          console.log("query: " + query);
          client.query(query, (err, result) => {
            console.log(result);
            done();
            let messages = [];
            for (const row of result.rows) {
              messages.push({type: "text", text: row.message});
            }
            lineClient.replyMessage(event.replyToken, messages.slice(-5));
          });
        });
      }
      else {
        pool.connect((err, client, done) => {
          const query = "INSERT INTO talk (user_id, message) VALUES ("
            +"'"+event.source.userId+"', '"+event.message.text+"');";
          console.log("query: " + query);
          client.query(query, (err, result) => {
            done();
            if (!err) {
              lineClient.replyMessage(event.replyToken, {type: "text", text: "記録しました。"});
            }
          });
        });
      }
    }
  }

  const ifaces = os.networkInterfaces();
  // Object.keys(ifaces).forEach(function (ifname) {
    // var alias = 0;

    // ifaces[ifname].forEach(function (iface) {
      // if ('IPv4' !== iface.family || iface.internal !== false) {
        // // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        // return;
      // }

      // if (alias >= 1) {
        // // this single interface has multiple ipv4 addresses
        // console.log(ifname + ':' + alias, iface.address);
      // } else {
        // // this interface has only one ipv4 adress
        // console.log(ifname, iface.address);
      // }
      // ++alias;
    // });
  // });
  const ipaddress = ifaces.eth0[0].address;
  console.log(ipaddress);

  const geo = geoip.lookup(ipaddress);
  console.log(geo);
});

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
