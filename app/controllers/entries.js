'use strict'

const extractor = require('../../lib/extractor')
require('dotenv').config()

exports.welcome = {
  auth: false,

  handler: (request, reply) => {
    reply.view('login', {
      title: 'Log In'
    })
  }
}

exports.login = {
  auth: 'google',

  handler: (request, reply) => {
    if (request.auth.isAuthenticated && request.auth.credentials.profile.raw.hd === 'nearform.com') {
      request.cookieAuth.set(request.auth.credentials.profile)
      console.log('request.auth.credentials: ' + JSON.stringify(request.auth.credentials, null, 2))
      return reply.redirect('/home')
    } else {
      let errors = []
      if (request.auth.isAuthenticated && request.auth.credentials.profile.raw.hd !== 'nearform.com') {
        errors.push({message: 'nearform email required for login'})
      } else {
        errors.push({message: 'Invalid credentials'})
      }
      reply.view('login', {
        title: 'login error',
        errors: errors
      })
    }
  }
}

exports.home = {

  auth: {
    strategies: ['10kdisplay-cookie', 'google']
  },

  handler: (request, reply) => {
    let email = request.auth.credentials.email
    const now = new Date()
    let month = now.getMonth()
    const currentYear = now.getFullYear()
    const startDate = currentYear + '-' + (month + 1) + '-01'
    const endDate = currentYear + '-' + (month + 1) + '-' + extractor.getDaysInMonth(month, currentYear)

    console.log('exports.home: month: ' + month)
    console.log('exports.home: startDate: ' + startDate)
    console.log('exports.home: endDate: ' + endDate)

    extractor.getTimesheetData(month, email, startDate, endDate, (err, results) => {
      if (err) return (err)
      reply.view('main', {
        title: 'Home',
        dates: results[3],
        projects: results[2],
        month: month,
        userName: results[0]
      })
    })
  }

}

exports.entries = {

  handler: (request, reply) => {
    let email = request.auth.credentials.email
    let payloadMonth =  request.payload.month
    const now = new Date()
    // let month = now.getMonth() - 1
    let month
    let currentYear = now.getFullYear()
    console.log('exports.entries: currentYear: ' + currentYear)

    if(payloadMonth === '0') month = new Date().getMonth()
    // if(payloadMonth === '1') month = new Date().getMonth() - 1
    if(payloadMonth === '1') {
      if(new Date().getMonth() === 0) {
        currentYear -= 1
        month = 11
      } else {
        month = new Date().getMonth() - 1
      }
    }
    console.log('exports.entries: payloadMonth: ' + payloadMonth + ', month: ' + month + ', current month: ' + new Date().getMonth())

    // const currentYear = now.getFullYear()
    const startDate = currentYear + '-' + (month + 1) + '-01'
    const endDate = currentYear + '-' + (month + 1) + '-' + extractor.getDaysInMonth(month, currentYear)

    console.log('exports.entries: startDate: ' + startDate + ', endDate: ' + endDate)
    console.log('exports.entries: month: ' + month)

    extractor.getTimesheetData(month, email, startDate, endDate, (err, results) => {
      if (err) return (err)
      reply.view('main', {
        title: 'Home',
        dates: results[3],
        projects: results[2],
        month: month,
        userName: results[0]
      })
    })
  }
}

exports.export = {

  handler: (request, reply) => {
    let email = request.auth.credentials.email
    let month = parseInt(request.payload.month)
    let year = parseInt(request.payload.year)
    console.log('month: ' + month)
    console.log('year(entries.js line 119): ' + year)

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

    // const now = new Date()
    // const currentYear = now.getFullYear()
    // const startDate = currentYear + '-' + (month + 1) + '-01'
    // const endDate = currentYear + '-' + (month + 1) + '-' + extractor.getDaysInMonth(month, currentYear)
    const startDate = year + '-' + (month + 1) + '-01'
    const endDate = year + '-' + (month + 1) + '-' + extractor.getDaysInMonth(month, year)

    console.log('startDate: ' + startDate + ', endDate: ' + endDate)
    console.log('month: ' + month)

    extractor.getTimesheetData(month, email, startDate, endDate, (err, results) => {
      if (err) return (err)
      let dates = results[3]
      let projects = results[2]
      extractor.buildCSVReport(dates, projects, (err, reportData) => {
        if (err) return err
        reply(reportData)
            .header('Content-Type', 'text/csv')
            .header('Content-Disposition', 'attachment; filename=' + months[month] + '_report.csv')
      })
    })
  }
}

exports.logout = {

  handler: (request, reply) => {
    request.cookieAuth.clear()
    reply.redirect('/')
  }
}
