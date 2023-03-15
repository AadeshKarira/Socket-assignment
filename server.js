const http = require('http').createServer();
// const io = require('socket.io')(http, {
//   cors: { origin: "*" }
// });

const express = require("express");
const app = express();
const socketIO = require('socket.io');


// const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Resource = require('./models/users');
const token = require("./services/generate_token");
const users = require("./models/users");
const logger = require('./config/logger');
const bodyParser = require('body-parser');
const os = require('os');

app.use(bodyParser.json());
app.use(express.json());

require('dotenv').config()
var mongoose = require("mongoose");


const JWT_SECRET = 'abAV79ui1jFWqpQotcbmTFS3';
const authMiddleware = require('./middlewares/auth').isValidToken;

mongoose.connect(process.env.MONGODB_URL, {
	dbName: process.env.DB_NAME,
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

var db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
	console.log("Connected");
});

app.use(express.json());

// Login endpoint that returns a JWT on successful authentication
app.post('/login', async(req, res, next) => {
    try{
        if(req.body.phone && req.body.password)
        {
            console.log(req.body);
            const get = await users.findOne({phone: req.body.phone});
            console.log(get);
            if(get)
            {
                var result1 =true;
                let compare = await bcrypt.compare(req.body.password, get.password);
                console.log(compare);
                if(!compare)
                {
                    return res.status(400).send({status: false, statusCode: 400, message: "password is incorrect"});
                }
                let data = {
                    _id: get._id,
                    name: get.name,
                    phone: get.phone
                }
                console.log(data);
                let token1 = await token.create_token(data);
                return res.status(200).send({status: true, statusCode: 200, message: "login successfully...", data: data, token: token1});
            }
        }
        else{
            return res.status(400).send({status: false, statusCode: 400, message: "phone and password required"});
        }
    }
    catch(err)
    {
        logger.logEvents("Error", err.stack);
        res.status(400).send({status: false, statusCode: 400, message: err.message}); 
    }
});

app.get('/api', (req, res) => {
  res.send('Hello from the server');
});

app.get('/resources', async(req, res) => {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const ramUsage = Math.round(usedMem / totalMem * 100 * 100) / 100;

    const cpuUsage = os.loadavg()[0] * 100;

    const uptime = Math.round(os.uptime());

    console.log(`RAM usage: ${ramUsage}%`);
    console.log(`CPU usage: ${cpuUsage}%`);
    console.log(`System uptime: ${uptime}s`);
    //database
    const user = await users.count({});

    const Database = {
        user : user
    }
    
    return res.send({ramUsage, cpuUsage, uptime, Database});
});

app.post('/api/protected', authMiddleware, (req, res) => {
  res.json({ message: `Hello ${req.user.username}` });
});

const httpPort = 8080;
const apiPort = 8081;

const httpServer = http.listen(httpPort, () => {
  console.log(`Socket server listening on http://localhost:${httpPort}`);
});

const io = socketIO(httpServer, {
  cors: { origin: "*" }
});

app.use(require('express-status-monitor')({
    title: 'Server Status',
    path: '/status',
    // socketPath: '/socket.io', // In case you use a custom path for socket.io
    // websocket: existingSocketIoInstance,
    spans: [{
      interval: 1,
      retention: 60
    }, {
      interval: 5,
      retention: 60
    }, {
      interval: 15,
      retention: 60
    }],
    chartVisibility: {
      cpu: true,
      mem: true,
      load: true,
      eventLoop: true,
      heap: true,
      responseTime: true,
      rps: true,
      statusCodes: true
    },
    healthChecks: [{
      protocol: 'http',
      host: 'localhost',
      path: '/',
      port: '8081'
    }
    ],
    // ignoreStartsWith: '/admin'
  }));

io.use((socket, next) => {
  const token = socket.handshake.headers.token; 

  if (!token) {
    return next(new Error('Unauthorized'));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    console.error(err.message);
    return next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log(`User ${socket.user.name} connected with socket id ${socket.id}`);

  socket.join(`room_${socket.user.id}`);

  socket.on('message', (message) => {
    console.log(`${socket.user.name} sent message: ${message}`);
    io.to(`room_${socket.user.id}`).emit('message', `${socket.user.name}: ${message}`);
  });

  socket.on('disconnect', () => {
    console.log(`User ${socket.user.name} disconnected with socket id ${socket.id}`);
  });
});

app.listen(apiPort, () => {
  console.log(`REST API server listening on http://localhost:${apiPort}`);
});


