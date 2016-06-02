'use strict';

const script = require('..');
const request = require('supertest');
const express = require('express');
const sinon = require('sinon');
const bodyParser = require('body-parser');
const assert = require('assert');
const sandbox = sinon.sandbox.create();

const hooks = [
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
  
  hooks.forEach((hook) => {
    it(`supports the ${hook.event} hook`, (done) => {
      request(robot.router)
        .post('/hubot/npm?room=test-room')
        .send(require(`./hooks/${hook.event}`))
        .expect(200)
        .end((err) => {
          assert.ifError(err);
          sinon.assert.calledWith(
            robot.send,
            sinon.match({
              room: ['#test-room']
            }),
            hook.expected
          );
          done();
        });
    });
  });

  it('returns a 400 when the room is missing', (done) => {
    request(robot.router)
      .post('/hubot/npm')
      .send(require('./hooks/package:publish'))
      .expect(400, done);
  });
});
