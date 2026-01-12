const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const routes = require('./routes');
const path = require('path');
const errorMiddleware = require('./middlewares/errorMiddleware');
const socketHandler = require('./socket/socketHandler');
const session = require('express-session');
const passport = require('./config/passport');

dotenv.config();

connectDB();

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

socketHandler(io);

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  req.io = io;
  next();
});
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Đặt true nếu chạy https
}));

app.use(passport.initialize());
app.use(passport.session());
app.use('/api/v1', routes);

app.use(errorMiddleware);

module.exports = server;