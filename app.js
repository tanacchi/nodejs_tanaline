const express = require("express");
const line    = require("@line/bot-sdk");
const os      = require("os");
const geoip   = require("geoip-lite");

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret:      process.env.LINE_CHANNEL_SECRET_KEY
};

const lineClient = new line.Client(lineConfig);
const server     = express();

server.listen(process.env.PORT || 8000);

server.post("/webhook", line.middleware(lineConfig), (req, res) => {
  res.sendStatus(200);

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
