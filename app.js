var config = require('./config');
const https = require('https');
const moment = require('moment');
const fs = require('fs');
const Docxtemplater = require('docxtemplater');
const cloudconvert = new (require('cloudconvert'))(config.login.cloudconvertKey);

// Dates
var firstDay = moment();
var lastDay = moment();
//3ème
if(config.info.year == 3) {
    var firstDay = moment();
    while (firstDay.day() !== 1) {
        firstDay.subtract(1, 'd');
    }
    var lastDay = moment(firstDay);
    while (lastDay.day() !== 5) {
        lastDay.add(1, 'd');
    }
} else {
    //4ème
    //firstDay = moment("20230731", "YYYYMMDD"); //custom day
    firstDay.startOf('month');
    lastDay = lastDay.endOf('month');
}

//Variables
if(config.info.year == 3) {
config.info.week = "Semaine : mercredi " + firstDay.format('DD m YYYY') + ' au vendredi ' + lastDay.format('DD.MM.YYYY');
} else {
    config.info.week = "Mois : " + firstDay.format('DD.MM.YYYY') + ' - ' + lastDay.format('DD.MM.YYYY');
}
config.info.lastDay = lastDay.format('DD.MM.YYYY');
config.info.name = config.info.firstname + ' ' + config.info.lastname;
config.info.output = '/output/';
config.info.exDocx = '.docx';
config.info.exPdf = '.pdf';
config.info.filename = config.info.lastname + '_' + config.info.firstname + '_journal_' + lastDay.format('YYYY-MM-DD') + '_' + config.info.company;

//Date filter
var filter = '?from='+firstDay.format('YYYY-MM-DD')+'&to='+lastDay.format('YYYY-MM-DD');
console.log(firstDay.format('YYYY-MM-DD') + ";" + lastDay.format('YYYY-MM-DD'));
var httpOptions = {
    hostname: 'api.tempo.io',
    port: 443,
    path: '/core/3/worklogs/user/' + config.login.accountId + filter + '&limit=1000&addIssueSummary=true',
    method: 'GET',
    headers: {
        Authorization: 'Bearer ' + config.login.token,
        "Cache-Control": 'no-cache'
    }
};

//Fetch Timesheet
var req = https.request(httpOptions, (res) => {
    if (res.statusCode != 200) {
        console.error('Error while fetching the timesheet from Jira');
        console.log('HTTP '+res.statusCode);
        
        process.exit(1);
    }
    var data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        toDocx(JSON.parse(data));
    });
});
req.end();

req.on('error', (e) => {
    console.error(e);
});

var toDocx = function(timesheet) {
    var template = fs.readFileSync(__dirname + '/template.docx', 'binary');
    var doc = new Docxtemplater(template);
    
    var tasks = [];

    //console.log(timesheet);
    //console.log(timesheet.results);
    //Only for the "results" part of the JSON
    for(var i = 0; i < timesheet.results.length; i++)
    {
        var duration = moment.duration(timesheet.results[i].timeSpentSeconds*1000);

        tasks.push({
            date: moment(timesheet.results[i].startDate).format('DD.MM.YYYY'),
            title: timesheet.results[i].issue.key,
            description: timesheet.results[i].description.split('\n').map((line) => {return {line: line}}),
            //duration: moment.duration(entry.timeSpent*1000).humanize(),
            duration: Math.floor(duration.asHours()) + 'h' + moment.utc(duration.asMilliseconds()).format("mm"),
            responsible: config.info.companyResponsible,
            sortIndex: moment(timesheet.results[i].startDate).format('x')
        });
    }

    //Recurring tasks add in the config.js
    config.recurringTasks.forEach(function(task) {
        var date = moment(firstDay).add(task.day - 1, 'd');
        tasks.push({
            date: date.format('DD.MM.YYYY'),
            title: task.title,
            description: task.description.split('\n').map((line) => {return {line: line}}),
            duration: task.duration,
            responsible: '',
            sortIndex: date.format('x')
        });
    });
    
    config.info.tasks = tasks.sort((a, b) => a.sortIndex - b.sortIndex);
    
    //Insert the data in the Word template
    doc.setData(config.info);
    
    doc.render();
    
    var buf = doc.getZip().generate({type: 'nodebuffer'});
    
    fs.writeFileSync(__dirname + config.info.output + config.info.filename + config.info.exDocx, buf);
    console.log('"'+ config.info.filename + config.info.exDocx + '" generated');
    
    process.exit();
    
}