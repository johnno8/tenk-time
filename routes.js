'use strict'

const Entries = require('./app/controllers/entries');
const Assets = require('./app/controllers/assets')

module.exports = [

  { method: 'GET', path: '/', config: Entries.welcome },
  { method: 'GET', path: '/login', config: Entries.login },
  { method: 'GET', path: '/home', config: Entries.home },

  { method: 'POST', path: '/entries', config: Entries.entries },
  { method: 'POST', path: '/export', config: Entries.export },
  { method: 'GET', path: '/logout', config: Entries.logout },

  {
    method: 'GET',
    path: '/{param*}',
    config: { auth: false },
    handler: Assets.servePublicDirectory
  }
];