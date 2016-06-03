'use strict';

process.env.HUBOT_NPM_SECRET = 'secret';

const script = require('..');
const request = require('supertest');
const express = require('express');
const sinon = require('sinon');
const bodyParser = require('body-parser');
const assert = require('assert');
const crypto = require('crypto');
const sandbox = sinon.sandbox.create();

const tests = [
  {
    event: 'package:publish',
    expected: 'npm-hook-test@0.0.4 published – https://www.npmjs.com/package/npm-hook-test'
  },
  {
    event: 'package:unpublish',
    expected: 'npm-hook-test@0.0.4 unpublished – https://www.npmjs.com/package/npm-hook-test'
  },
  {
    event: 'package:star',
    expected: 'a-user starred npm-hook-test – https://www.npmjs.com/package/npm-hook-test'
  },
  {
    event: 'package:unstar',
    expected: 'a-user unstarred npm-hook-test – https://www.npmjs.com/package/npm-hook-test'
  },
  {
    event: 'package:owner',
    expected: 'npm-hook-test owner added: a-user – https://www.npmjs.com/package/npm-hook-test'
  },
  {
    event: 'package:owner-rm',
    expected: 'npm-hook-test owner removed: a-user – https://www.npmjs.com/package/npm-hook-test'
  },
  {
    event: 'package:dist-tag',
    expected: 'npm-hook-test new dist-tag: beta – https://www.npmjs.com/package/npm-hook-test'
  },
  {
    event: 'package:dist-tag-rm',
    expected: 'npm-hook-test dist-tag removed: beta – https://www.npmjs.com/package/npm-hook-test'
  },
  {
    event: 'package:deprecated',
    expected: 'npm-hook-test@0.0.4 deprecated – https://www.npmjs.com/package/npm-hook-test'
  },
  {
    event: 'package:undeprecated',
    expected: 'npm-hook-test@0.0.4 undeprecated – https://www.npmjs.com/package/npm-hook-test'
  }
];

const sign = (hook) => {
  return crypto.createHmac('sha256', 'secret').update(JSON.stringify(hook)).digest('hex');
};

describe('hubot-npm', () => {
  let robot;

  beforeEach(() => {
    const router = express();

    router.use(bodyParser.json());

    robot = {
      router,
      send: sandbox.stub(),
      logger: {
        error: sandbox.stub()
      }
    };

    script(robot);
  });

  afterEach(() => {
    sandbox.restore();
  });

  tests.forEach((test) => {
    it(`supports the ${test.event} hook`, (done) => {
      const hook = require(`./hooks/${test.event}`);

      request(robot.router)
        .post('/hubot/npm?room=test-room')
        .send(hook)
        .set('x-npm-signature', `sha256=${sign(hook)}`)
        .expect(200)
        .end((err) => {
          assert.ifError(err);
          sinon.assert.calledWith(
            robot.send,
            sinon.match({
              room: ['#test-room']
            }),
            test.expected
          );
          done();
        });
    });
  });

  it('returns a 400 when the room is missing', (done) => {
    const hook = require('./hooks/package:publish');

    request(robot.router)
      .post('/hubot/npm')
      .set('x-npm-signature', `sha256=${sign(hook)}`)
      .send(hook)
      .expect(400)
      .expect('missing ?room parameter', done);
  });

  it('logs an error when the room is missing', (done) => {
    const hook = require('./hooks/package:publish');

    request(robot.router)
      .post('/hubot/npm')
      .set('x-npm-signature', `sha256=${sign(hook)}`)
      .send(hook)
      .expect(400)
      .end((err) => {
        assert.ifError(err);
        sinon.assert.called(robot.logger.error);
        done();
      });
  });

  it('returns a 400 when the x-npm-signature header is missing', (done) => {
    const hook = require('./hooks/package:publish');

    request(robot.router)
      .post('/hubot/npm?room=test-room')
      .send(hook)
      .expect(400)
      .expect('missing x-npm-signature header', done);
  });

  it('returns a 400 when the secret does not match', (done) => {
    const hook = require('./hooks/package:publish');

    request(robot.router)
      .post('/hubot/npm?room=test-room')
      .set('x-npm-signature', 'sha256=not-valid')
      .send(hook)
      .expect(400)
      .expect('invalid payload signature in x-npm-signature header', done);
  });
});
