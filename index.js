// Description:
//   Notifies about npm events via npm hooks
// Configuration:
//   HUBOT_NPM_SECRET - The hook secret
// Commands:
//   None
// URLS:
//   POST /hubot/npm?room=<room>
'use strict';

const getMessage = (hook) => {
  switch (hook.event) {
    case 'package:publish':
      return `${hook.name}@${hook.change.version} published – https://www.npmjs.com/package/${hook.name}`;
  }
};

module.exports = (robot) => {
  robot.router.post('/hubot/npm', (req, res) => {
    const hook = req.body;
    let room = req.query.room;

    if (!room) {
      return res.status(400).end('Missing ?room parameter');
    }

    if (room && !/^#/.test(room)) {
      room = `#${room}`;
    }

    const message = getMessage(hook);

    if (message) {
      robot.send({
        room: [room]
      }, message);
    }

    res.end('OK');
  });
};
