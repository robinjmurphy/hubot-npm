'use strict';

const script = require('..');
const request = require('supertest');
const express = require('express');
const sinon = require('sinon');
const bodyParser = require('body-parser');
const assert = require('assert');
const sandbox = sinon.sandbox.create();

const events = {
  'package:publish': require('./events/package:publish'),
  'package:unpublish': require('./events/package:unpublish')
};

describe('hubot-npm', () => {
  let robot;

  beforeEach(() => {
    const router = express();

    router.use(bodyParser.json());

    robot = {
      router,
      send: sandbox.stub()
    };

    script(robot);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('supports the package:publish hook', (done) => {
    request(robot.router)
      .post('/hubot/npm?room=test-room')
      .send(events['package:publish'])
      .expect(200)
      .end((err) => {
        assert.ifError(err);
        sinon.assert.calledWith(
          robot.send,
          sinon.match({
            room: ['#test-room']
          }),
          'npm-hook-test@0.0.4 published – https://www.npmjs.com/package/npm-hook-test'
        );
        done();
      });
  });

  it('supports the package:unpublish hook', (done) => {
    request(robot.router)
      .post('/hubot/npm?room=test-room')
      .send(events['package:unpublish'])
      .expect(200)
      .end((err) => {
        assert.ifError(err);
        sinon.assert.calledWith(
          robot.send,
          sinon.match({
            room: ['#test-room']
          }),
          'npm-hook-test@0.0.4 unpublished – https://www.npmjs.com/package/npm-hook-test'
        );
        done();
      });
  });

  it('returns a 400 when the room is missing', (done) => {
    request(robot.router)
      .post('/hubot/npm')
      .send(events.publish)
      .expect(400, done);
  });
});
