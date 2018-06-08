'use strict'

function generateTable (dates, projects, month, userName) {

  let tableHtml = ''
  let multipleFlagSet = false

  if (dates.length === 0) {
    return
  } else {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    let monthlyTotal = 0
    const year = new Date(dates[0].date).getFullYear()
    console.log('year(generateTable.js line 14): ' + year)

    tableHtml = '<section class="ui raised center aligned  segment">'
    tableHtml += '<div class="ui grid">' +
        '<div class="ui four wide column">' +
        '</div>' +
        '<div class="ui eight wide column">' +
        '<div class="ui basic padded segment">' +
        '<h1 class="ui header">' + months[month] + '</h1>' +
        '</div>' +
        '</div>' +
        '<div class="ui four wide column">' +
        '<div class="ui basic padded segment">' +
        '<form action="/export" method="POST">' +
        '<button class="ui fluid blue basic submit button">Export Report</button>' +
        '<input type="hidden" name="month" value=' + month + '>' +
        '<input type="hidden" name="year" value=' + year + '>' +
        '</form>' +
        '</div>' +
        '</div>' +
        '</div>'

    tableHtml += '<div class="ui grid">'

    if(projects.length <= 1) {
      tableHtml += '<div class="ui two wide column">' +
          '</div>' +
          '<div class="ui twelve wide column fluid form">'

    } else {
      tableHtml += '<div class="ui one wide column">' +
          '</div>' +
          '<div class="ui fourteen wide column fluid form">'
    }

    if(projects.length < 3) {
      tableHtml += '<table class="ui celled table segment">' +
          '<thead>' + '<tr>' +
          '<th class="one wide">Date</th>'

      for (let i = 0; i < projects.length + 2; i++) {
        if (i === projects.length) {
          tableHtml += '<th class="one wide center aligned">' + 'Leave' + '</th>'
        } else if (i === projects.length + 1) {
          tableHtml += '<th class="one wide center aligned">' + 'Daily total' + '</th>'
        } else {
          tableHtml += '<th class="one wide center aligned">' + projects[i].name + '</th>' +
              '<th class="two wide center aligned">' + 'Notes' + '</th>'
        }
      }

      tableHtml += '</tr>' + '</thead>' +
          '<tbody>'

      let dailyTotal = 0
      for (let j = 0; j < dates.length; j++) {
        let tempDate = new Date(dates[j].date)
        if (lookDay(tempDate.getDay()) === 'Sat' || lookDay(tempDate.getDay()) === 'Sun') {
          tableHtml += '<tr>' + '<td>' + dates[j].date + '</td>'
          for (let k = 0; k < dates[j].entries.length + 1; k++) {
            if (k === dates[j].entries.length - 1) {
              if (dates[j].entries[k] === null || dates[j].entries[k] === undefined) {
                tableHtml += '<td class="date_header">' + '' + '</td>'
              } else {
                tableHtml += '<td class="center aligned leave">' + dates[j].entries[k] + '</td>'
                dailyTotal += dates[j].entries[k]
              }
            } else if (k === dates[j].entries.length) {
              if (dailyTotal > 0) {
                tableHtml += '<td class="center aligned date_header">' + dailyTotal + '</td>'
              } else {
                tableHtml += '<td class="center aligned date_header">' + ' ' + '</td>'
              }
            } else {
              if (dates[j].entries[k] === null || dates[j].entries[k] === undefined) {
                tableHtml += '<td class="date_header">' + '' + '</td>'
              } else {
                tableHtml += '<td class="center aligned project">' + dates[j].entries[k] + '</td>'
                if (!isNaN(dates[j].entries[k])) {
                  dailyTotal += dates[j].entries[k]
                }
              }
            }
          }
          tableHtml += '</tr>'
        } else {
          tableHtml += '<tr>' + '<td>' + dates[j].date + '</td>'
          for (let k = 0; k < dates[j].entries.length + 1; k++) {
            if (k === dates[j].entries.length - 1) {
              if (dates[j].entries[k] === null || dates[j].entries[k] === undefined) {
                tableHtml += '<td>' + '' + '</td>'
              } else {
                tableHtml += '<td class="center aligned leave ">' + dates[j].entries[k] + '</td>'
                if (!isNaN(dates[j].entries[k])) {
                  dailyTotal += dates[j].entries[k]
                }
              }
            } else if (k === dates[j].entries.length) {
              tableHtml += '<td class="center aligned">' + dailyTotal + '</td>'
            } else {
              if (dates[j].entries[k] === null || dates[j].entries[k] === undefined) {
                tableHtml += '<td>' + '' + '</td>'
              } else {
                if (dates[j].hasMultipleEntries) {
                  if (!isNaN(dates[j].entries[k])) {
                    tableHtml += '<td class="center aligned multiple">' + dates[j].entries[k] + '</td>'
                    multipleFlagSet = true
                  } else {
                    tableHtml += '<td class="center aligned">' + dates[j].entries[k] + '</td>'
                  }
                } else {
                  if (!isNaN(dates[j].entries[k])) {
                    tableHtml += '<td class="center aligned project">' + dates[j].entries[k] + '</td>'
                  } else {
                    tableHtml += '<td class="center aligned">' + dates[j].entries[k] + '</td>'
                  }
                }
                if (!isNaN(dates[j].entries[k])) {
                  dailyTotal += dates[j].entries[k]
                }
              }
            }
          }
          tableHtml += '</tr>'
        }
        monthlyTotal += dailyTotal
        dailyTotal = 0
      }
      tableHtml += '<tr>'
      for (let k = 0; k < dates[0].entries.length + 2; k++) {
        if (k === dates[0].entries.length + 1) {
          tableHtml += '<td class="center aligned">' + monthlyTotal + '</td>'
        } else if (k === dates[0].entries.length) {
          tableHtml += '<td class="center aligned">' + 'Total Days' + '</td>'
        } else {
          tableHtml += '<td class="center aligned date_header">' + '' + '</td>'
        }
      }
      tableHtml += '</tr>' +
          '</tbody>' +
          '</table>'
      tableHtml += '</div>' +
          '</div>'
    } else { // no. projects > 3
      tableHtml += '<table class="ui celled table segment">' +
          '<thead>' + '<tr>' +
          '<th class="one wide">Date</th>' +
          '<th class="two wide">Project</th>' +
          '<th class="one wide">Worked</th>' +
          '<th class="two wide">Note</th>' +
          '<th class="one wide">Daily total</th>'
      tableHtml += '</tr>' + '</thead>' +
          '<tbody>'

      let dailyTotal = 0
      for (let j = 0; j < dates.length; j++) {
        let tempDate = new Date(dates[j].date)
        if ((lookDay(tempDate.getDay()) === 'Sat' || lookDay(tempDate.getDay()) === 'Sun') && dates[j].isNull) {
          tableHtml += '<tr>' + '<td class="center aligned date_header">' + dates[j].date + '</td>' +
              '<td class="center aligned weekend">' + '' + '</td>' +
              '<td class="center aligned weekend">' + '' + '</td>' +
              '<td class="center aligned weekend">' + '' + '</td>' +
              '<td class="center aligned weekend">' + '' + '</td>' + '</tr>' +
              '<tr>' + '<td class="center aligned">' + '' + '</td>' +
              '<td class="center aligned">' + '' + '</td>' +
              '<td class="center aligned">' + '' + '</td>' +
              '<td class="center aligned">' + '' + '</td>' +
              '<td class="center aligned">' + '' + '</td>' + '</tr>'
        } else {
        tableHtml += '<tr>' + '<td class="center aligned date_header">' + dates[j].date + '</td>' +
            '<td class="center aligned date_header">' + '' + '</td>' +
            '<td class="center aligned date_header">' + '' + '</td>' +
            '<td class="center aligned date_header">' + '' + '</td>' +
            '<td class="center aligned date_header">' + 'Daily Total' + '</td>'
          for (let i = 0; i < (dates[j].entries.length - 1) / 2 + 1; i++) {
              tableHtml += '<tr>' + '<td>' + '' + '</td>'

              if (i < projects.length) {
                if (dates[j].entries[i + i] === null || dates[j].entries[i + i] === undefined) {
                  tableHtml += '<td>' + projects[i].name + '</td>' +
                      '<td class="center aligned">' + '' + '</td>' +
                      '<td class="center aligned">' + '' + '</td>' +
                      '<td class="center aligned">' + '' + '</td>'
                } else {
                  tableHtml += '<td>' + projects[i].name + '</td>'

                  if(dates[j].hasMultipleEntries) {
                    tableHtml += '<td class="center aligned multiple">' + dates[j].entries[i + i] + '</td>'
                    multipleFlagSet = true
                  } else {
                    tableHtml += '<td class="center aligned project">' + dates[j].entries[i + i] + '</td>'
                  }
                  if (dates[j].entries[i + i + 1] === null || dates[j].entries[i + i + 1] === undefined) {
                    tableHtml += '<td class="center aligned">' + '' + '</td>' +
                        '<td class="center aligned">' + '' + '</td>'
                  } else {
                    tableHtml += '<td class="center aligned">' + dates[j].entries[i + i + 1] + '</td>' +
                        '<td class="center aligned">' + '' + '</td>'
                  }
                }
              } else {
                if (dates[j].entries[i + i] === null || dates[j].entries[i + i] === undefined) {
                  tableHtml += '<td>' + 'Leave' + '</td>' +
                      '<td class="center aligned">' + '' + '</td>' +
                      '<td class="center aligned">' + '' + '</td>'
                } else {
                  tableHtml += '<td>' + 'Leave' + '</td>' +
                      '<td class="center aligned leave">' + dates[j].entries[i + i] + '</td>' +
                      '<td class="center aligned">' + '' + '</td>'
                }
              }

              if (!isNaN(dates[j].entries[i + i])) {
                dailyTotal += dates[j].entries[i + i]
              }
          }
          tableHtml += '<td class="center aligned daily_total">' + dailyTotal + '</td>'
         }
        monthlyTotal += dailyTotal
        dailyTotal = 0
      }

      tableHtml += '<tr>'
      for (let k = 0; k < 5; k++) {
        if (k === 4) {
          tableHtml += '<td class="center aligned">' + monthlyTotal + '</td>'
        } else if (k === 3) {
          tableHtml += '<td class="center aligned">' + 'Total Days' + '</td>'
        } else {
          tableHtml += '<td class="center aligned date_header">' + '' + '</td>'
        }
      }
      tableHtml += '</tr>' +
          '</tbody>' +
          '</table>'
      tableHtml += '</div>' +
          '</div>'
    }

    if(multipleFlagSet) {
      tableHtml += '<div class="ui grid">' +
          '<div class="ui four wide column">' +
          '</div>' +
          '<div class="ui twelve wide column">' +
          '<div class="warningContainer">' +
          '<div class="warning">Warning</div>' +
          '<div class="warningText">' +
          '<strong>These dates have multiple entries; please check they are correct</strong>' +
          '</div>' +
          '</div>' +
          '</div>'
    }
    tableHtml += '</section>'
    console.log('monthlyTotal: ' + monthlyTotal)
    monthlyTotal = 0
    return tableHtml
  }
}

// Return the day of the week based on the date passed in
function lookDay(input) {
  return['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][input];
}

module.exports = generateTable