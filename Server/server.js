const server = require('./app');

const PORT = process.env.PORT || 5000;

const runningServer = server.listen(PORT, () => {
  console.log(`Server đang chạy ở ${process.env.NODE_ENV} mode trên cổng ${PORT}`);
});

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  runningServer.close(() => process.exit(1));
});