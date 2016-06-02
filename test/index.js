'use strict';

const script = require('..');
const request = require('supertest');
const express = require('express');
const sinon = require('sinon');
const bodyParser = require('body-parser');
const assert = require('assert');
const sandbox = sinon.sandbox.create();

const events = {
  'package:publish': require('./hooks/package:publish'),
  'package:unpublish': require('./hooks/package:unpublish'),
  'package:star': require('./hooks/package:star'),
  'package:unstar': require('./hooks/package:unstar'),
  'package:owner': require('./hooks/package:owner'),
  'package:owner-rm': require('./hooks/package:owner-rm')
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

  it('supports the package:star hook', (done) => {
    request(robot.router)
      .post('/hubot/npm?room=test-room')
      .send(events['package:star'])
      .expect(200)
      .end((err) => {
        assert.ifError(err);
        sinon.assert.calledWith(
          robot.send,
          sinon.match({
            room: ['#test-room']
          }),
          'a-user starred npm-hook-test – https://www.npmjs.com/package/npm-hook-test'
        );
        done();
      });
  });

  it('supports the package:unstar hook', (done) => {
    request(robot.router)
      .post('/hubot/npm?room=test-room')
      .send(events['package:unstar'])
      .expect(200)
      .end((err) => {
        assert.ifError(err);
        sinon.assert.calledWith(
          robot.send,
          sinon.match({
            room: ['#test-room']
          }),
          'a-user unstarred npm-hook-test – https://www.npmjs.com/package/npm-hook-test'
        );
        done();
      });
  });

  it('supports the package:owner hook', (done) => {
    request(robot.router)
      .post('/hubot/npm?room=test-room')
      .send(events['package:owner'])
      .expect(200)
      .end((err) => {
        assert.ifError(err);
        sinon.assert.calledWith(
          robot.send,
          sinon.match({
            room: ['#test-room']
          }),
          'npm-hook-test owner added: a-user – https://www.npmjs.com/package/npm-hook-test'
        );
        done();
      });
  });

  it('supports the package:owner-rm hook', (done) => {
    request(robot.router)
      .post('/hubot/npm?room=test-room')
      .send(events['package:owner-rm'])
      .expect(200)
      .end((err) => {
        assert.ifError(err);
        sinon.assert.calledWith(
          robot.send,
          sinon.match({
            room: ['#test-room']
          }),
          'npm-hook-test owner removed: a-user – https://www.npmjs.com/package/npm-hook-test'
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
