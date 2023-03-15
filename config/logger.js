const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

const logEvents = async (name,message) => {
    let date_ob = new Date();

    // adjust 0 before single digit date
    let date = ("0" + date_ob.getDate()).slice(-2);

    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

    // current year
    let year = date_ob.getFullYear();

    // current hours
    let hours = date_ob.getHours();

    // current minutes
    let minutes = date_ob.getMinutes();

    // current seconds
    let seconds = date_ob.getSeconds();
    
    // prints date & time in DD-MM-YYYY HH:MM:SS format
    let final=date + "-" + month + "-" + year + " " + hours + ":" + minutes + ":" + seconds;
    const logItem = `${final}\t${name}\t${message}\n`;
    try 
    {
        if (!fs.existsSync(path.join(__dirname, './../', 'logs'))) {
            await fsPromises.mkdir(path.join(__dirname, './../', 'logs'));
        }

        await fsPromises.appendFile(path.join(__dirname, './../', 'logs', 'logs.log'), logItem);
    } catch (err) {
        console.log(err);
    }
}

const logger = (req, res, next) => {
    logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, 'reqLog.txt');
    console.log(`${req.method} ${req.path}`);
    next();
}

module.exports = { logger, logEvents };