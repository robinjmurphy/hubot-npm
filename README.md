# hubot-npm

[![Build Status](https://travis-ci.org/robinjmurphy/hubot-npm.svg?branch=master)](https://travis-ci.org/robinjmurphy/hubot-npm)

> [Hubot](https://hubot.github.com/) script for npm notifications via [hooks](http://blog.npmjs.org/post/145260155635/introducing-hooks-get-notifications-of-npm)

## Installation

```
npm install --save hubot-npm
```

Add the script to your `external-scripts.json` file:

```json
[
  "hubot-npm"
]
```

You'll need to export a secret that you should use to verify your hooks:

```
export HUBOT_NPM_SECRET=<secret>
```

If you want to set a default room for notifications:

```
export HUBOT_NPM_ROOM=<room>
```

## Usage

The npm hook URL is:

```
<hubot_url>:<port>/hubot/npm[?room=<room>]
```

Be sure to set the `?room` query string parameter if you've not set the `HUBOT_NPM_ROOM` variable.

You can add your hook using the [wombat CLI tool](https://www.npmjs.com/package/wombat):

```
wombat hook add <user|package|scope> <hubot_url>:<port>/hubot/npm[?room=<room>] <secret>
```
