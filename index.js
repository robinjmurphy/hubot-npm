// Description:
//   Notifies about npm events via npm hooks
// Configuration:
//   HUBOT_NPM_SECRET - The hook secret
//   HUBOT_NPM_ROOM - The default room for notifications
// Commands:
//   None
// URLS:
//   POST /hubot/npm?room=<room>
'use strict';

const crypto = require('crypto');

const defaultRoom = process.env.HUBOT_NPM_ROOM;
const secret = process.env.HUBOT_NPM_SECRET;

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

    case 'package:deprecated':
      return `${hook.name}@${hook.change.deprecated} deprecated – ${url}`;

    case 'package:undeprecated':
      return `${hook.name}@${hook.change.deprecated} undeprecated – ${url}`;
  }
};

const sign = (hook) => {
  return crypto.createHmac('sha256', secret).update(JSON.stringify(hook)).digest('hex');
};

const prefix = (room) => {
  if (room && room.indexOf('#') !== 0) {
    return `#${room}`;
  } else {
    return room;
  }
};

module.exports = (robot) => {
  if (!secret) {
    robot.logger.error('npm: HUBOT_NPM_SECRET is not set https://github.com/robinjmurphy/hubot-npm#installation');
  }

  robot.router.post('/hubot/npm', (req, res) => {
    const hook = req.body;
    const signature = req.headers['x-npm-signature'];

    if (!signature) {
      robot.logger.error('npm: missing x-npm-signature header');
      res.status(400).end('missing x-npm-signature header');
      return;
    }

    const expected = sign(hook);

    if (signature !== `sha256=${expected}`) {
      robot.logger.error('npm: invalid payload signature in x-npm-signature header');
      res.status(400).end('invalid payload signature in x-npm-signature header');
      return;
    }

    let room = prefix(req.query.room || defaultRoom);

    if (!room) {
      robot.logger.error('npm: ?room parameter missing from hook https://github.com/robinjmurphy/hubot-npm#usage');
      res.status(400).end('missing ?room parameter');
      return;
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
