/**
 * Created by johnokeeffe on 21/12/2017.
 */
'use strict'

const Client = require('node-rest-client').Client
const async = require('async')
const client = new Client()
require('dotenv').config()

const baseURL = "https://api.10000ft.com/api/v1"
const args = {
  headers: {
    "Content-Type": "application/json",
    "auth": process.env.TEN_K_API_TOKEN
  }
}

//const now = new Date()

// Return number of days in the month passed in
const getDaysInMonth = function (month, year) {
  // January is 0 based
  //Day 0 is the last day in the previous month
  return new Date(year, month+1, 0).getDate()
}

const getTimesheetData = function (month, email, startDate, endDate, callback) {

  const periodStart = new Date(startDate)
  const periodEnd = new Date(endDate)
  let assignments = []
  let userId

  async.series([
        function(callback) {
          client.get(baseURL + '/users?per_page=150&fields=assignments', args, function(data, response) {
            let result
            for(let i =0; i < data.data.length; i++) {
              if(data.data[i].email === email) {
                userId = data.data[i].id
                console.log('user[0]: ' + JSON.stringify(data.data[i], null, 2))
                console.log('data.data[' + i + ']: ' + JSON.stringify(data.data[i], null, 2))
                assignments = data.data[i].assignments.data
                result = data.data[i].display_name
              }
            }
            callback(null, result)
          })
        },
        function(callback) {
          client.get(baseURL + '/users/' + userId + '/time_entries?&per_page=200,&from=' + startDate + '&to=' + endDate, args, function(data, response) {
            let entries = data.data
            console.log('entries(from extractor.js line 53): ' + JSON.stringify(entries, null, 2))
            entries.sort((a, b) => {
              return new Date(a.date) - new Date(b.date)
            })
            callback(null, entries)
          })
        },
        function(callback) {
          client.get(baseURL + '/users/' + userId + '/projects', args, function(data, response) {
            let result = []
            for (let j = 0; j < assignments.length; j++) {
              let assignmentStart = new Date(assignments[j].starts_at)
              let assignmentEnd = new Date(assignments[j].ends_at)
              for(let i = 0; i < data.data.length; i++) {
                if(assignments[j].assignable_id === data.data[i].id) {
                  if((assignmentEnd.getTime() >= periodStart.getTime() && assignmentStart.getTime() <= periodStart.getTime()) ||
                      (assignmentStart.getTime() >= periodStart.getTime() && assignmentStart.getTime() <= periodEnd.getTime())) {
                    result.push(data.data[i])
                  }
                }
              }
            }
            callback(null, result)
          })
        }
      ],
      function(err, results) {
        if (err) return err
        console.log('results(from extractor.js line 82): ' + JSON.stringify(results, null, 2))
        //let userName = results[0]
        let entries = results[1]
        let projects = results[2]
        let dates = generateTableData(month, periodStart.getFullYear() ,projects, entries)
        results.push(dates)
        callback(null, results)
      })
}

const buildCSVReport = function (dates, projects, callback) {
  let outputString = 'Date,'
  let dateEntryString = ''
  let monthlyTotal = 0
  let monthlyTotalString = ' ,'

  for(let i = 0; i < projects.length; i++) {
    outputString += projects[i].name + ", ,"
    monthlyTotalString += ' , ,'
  }

  outputString += 'Leave,Daily Total,\n'
  for(let j = 0; j < dates.length; j++) {
    let dateEntryRow = '' + dates[j].date + ','
    let dailyTotal = 0
    for(let k = 0; k < dates[j].entries.length; k++) {
      if(dates[j].entries[k] === null || dates[j].entries[k] === undefined) {
        dateEntryRow += ' ' + ','
      } else {
        if (isNaN(dates[j].entries[k])) {
          dateEntryRow += dates[j].entries[k].replace(/, /g, ';') + ','
        } else {
          dateEntryRow += dates[j].entries[k] + ','
        }
      }

      if (!isNaN(dates[j].entries[k])) {
        dailyTotal += dates[j].entries[k]
      }
    }

    dateEntryString += dateEntryRow + dailyTotal + '\n'
    monthlyTotal += dailyTotal
  }

  outputString += dateEntryString
  outputString += monthlyTotalString + 'Monthly Total,' + monthlyTotal

  console.log('outputString: ' + outputString)
  //return outputString
  callback(null, outputString)
}

// Build an array of objects, one for each day in the month, each with an array of entries for that date
// function generateTableData(month, projects, entries) {
function generateTableData(month, year, projects, entries) {

  const now = new Date()
  let dates = []
  let end

  if(year === now.getFullYear()) {
    if(month === now.getMonth()) {
      end = now.getDate()
    } else {
      end = getDaysInMonth(month, now.getFullYear())
    }
  } else {
    end = getDaysInMonth(month, year)
  }

  for(let i = 0; i < end; i++) {
    // let thisDate = new Date(Date.UTC(now.getFullYear(), (month), (i + 1)))
    let thisDate = new Date(Date.UTC(year, (month), (i + 1)))
    let thisTime = thisDate.getTime()

    dates.push({
      // date: now.getFullYear() + '-' + padThis((month + 1).toString()) + '-' + padThis((i + 1).toString()),
      date: year + '-' + padThis((month + 1).toString()) + '-' + padThis((i + 1).toString()),
      entries: new Array((projects.length)*2 + 1),
      hasMultipleEntries: false,
      isNull: true
    })

    for(let j =0; j < projects.length; j++) {
      for(let k = 0; k < entries.length; k++) {
        let entryDate = new Date(entries[k].date)
        if(entryDate.getTime() === thisTime) {
          if(entries[k].hours > 0 && entries[k].assignable_id === projects[j].id) {
            if (dates[i].entries[j + j] !== null && dates[i].entries[j + j] !== undefined) {
              dates[i].entries[j + j] = dates[i].entries[j + j] + entries[k].hours / 8
              dates[i].entries[j + j + 1] = dates[i].entries[j + j + 1] + '; ' + entries[k].notes
              dates[i].hasMultipleEntries = true
              dates[i].isNull = false
            } else if (entries[k].hours === 0 && entries[k].assignable_id === projects[j].id) {
              dates[i].entries[j + j] = null
              dates[i].entries[j + j + 1] = null
            } else {
              dates[i].entries[j + j] = entries[k].hours / 8
              dates[i].entries[j + j + 1] = entries[k].notes
              dates[i].isNull = false
            }
          } else if(entries[k].hours > 0 && entries[k].assignable_type === "LeaveType") {
            dates[i].entries[dates[i].entries.length - 1] = entries[k].hours/8
            dates[i].isNull = false
          }
        }
      }
    }
  }
  console.log('dates (from generateTableData()): ' + JSON.stringify(dates, null, 2))
  console.log('entries (from generateTableData()): ' + JSON.stringify(entries, null, 2))
  return dates
}

function padThis(input) {
  if (input.length < 2) {
    return '0' + input;
  }
  return input;
}

module.exports = { getDaysInMonth, getTimesheetData, buildCSVReport }
