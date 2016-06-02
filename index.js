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
  const url = `https://www.npmjs.com/package/${hook.name}`;

  switch (hook.event) {
    case 'package:star':
      return `${hook.change.user} starred ${hook.name} – ${url}`;

    case 'package:unstar':
      return `${hook.change.user} unstarred ${hook.name} – ${url}`;

    case 'package:publish':
      return `${hook.name}@${hook.change.version} published – ${url}`;

    case 'package:unpublish':
      return `${hook.name}@${hook.change.version} unpublished – ${url}`;

    case 'package:owner':
      return `${hook.name} owner added: ${hook.change.maintainer} – ${url}`;

    case 'package:owner-rm':
      return `${hook.name} owner removed: ${hook.change.maintainer} – ${url}`;

    case 'package:dist-tag':
      return `${hook.name} new dist-tag: ${hook.change['dist-tag']} – ${url}`;

    case 'package:dist-tag-rm':
      return `${hook.name} dist-tag removed: ${hook.change['dist-tag']} – ${url}`;
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
