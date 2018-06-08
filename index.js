'use strict'

// This version takes an email and displays entries for this month or last month

const Hapi = require('hapi')
const Bell = require('bell')
const AuthCookie = require('hapi-auth-cookie')
const Vision = require('vision')
const Inert = require('inert')
require('dotenv').config()

const server = new Hapi.Server()

server.connection({ port: 4000, host: process.env.HOST || 'localhost' })
//server.connection({ port: 4000, host: '0.0.0.0' })

server.register([Bell, AuthCookie, Vision, Inert], (err) => {
  if (err) {
    console.log(err)
  }

  const authCookieOptions = {
    password: process.env.COOKIE_PASSWORD,
    cookie: '10kdisplay-auth',
    isSecure: false
  }

  server.auth.strategy('10kdisplay-cookie', 'cookie', authCookieOptions)

  const bellAuthOptions = {
    provider: 'google',
    password: process.env.BELL_PASSWORD,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    forceHttps: true,
    location: process.env.BELL_LOCATION,
    isSecure: false
  }

  server.auth.strategy('google', 'bell', bellAuthOptions)

  server.auth.default('10kdisplay-cookie')

  server.views({
    engines: {
      hbs: require('handlebars')
    },
    relativeTo: __dirname,
    path: './app/views',
    layoutPath: './app/views/layout',
    partialsPath: './app/views/partials',
    helpersPath: './app/views/helpers',
    layout: true,
    isCached: false
  })

  server.route(require('./routes'))

  server.start((err) => {
    if (err) throw err
    console.log(`Server running at: ${server.info.uri}`)
  })


})