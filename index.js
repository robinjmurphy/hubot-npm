// Description:
//   Notifies about npm events via npm hooks
// Configuration:
//   HUBOT_NPM_SECRET - The hook secret
// Commands:
//   None
// URLS:
//   POST /hubot/npm?room=<room>
'use strict';

const getMessage = (data) => {
  switch (data.event) {
    case 'package:publish':
      return `${data.name}@${data.version} published – https://www.npmjs.com/package/${data.name}`;
  }
};

module.exports = (robot) => {
  robot.router.post('/hubot/npm', (req, res) => {
    const data = req.body;
    let room = req.query.room;

    if (!room) {
      return res.status(400).end('Missing ?room parameter');
    }

    if (room && !/^#/.test(room)) {
      room = `#${room}`;
    }

    const message = getMessage(data);

    if (message) {
      robot.send({
        room: [room]
      }, message);
    }

    res.end('OK');
  });
};
