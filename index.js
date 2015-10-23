var Q = require('q'),
    mongo = require('mongodb');

var connections = {};

exports.connect = function (connectionString) {
  return Q.Promise(function (resolve, reject) {
      if(connections[connectionString]) return resolve(connections[connectionString]);

      console.log('MONGODB2: Connecting to ' + connectionString);

      mongo.Db.connect(connectionString, function (error, mongodb) {
        if (error) {
          console.error('MONGODB: Connection Failed: ' + connectionString);
          console.error(error);
          reject(error);
          return;
        }

        if (!mongodb) {
          error = new Error("MONGODB: Error opening mongo database connection: null database connection object was returned.");
          console.error(error);
          reject(error);
          return;
        }

        mongodb.on('close', function() {
          console.log('MONGODB: Connection closed:', connectionString);
          connections[connectionString] = undefined;
        });

console.log('MONGODB: This process is pid ' + process.pid);

        process.on('SIGINT', exitHandler.bind(null, {db: mongodb, reason: "SIGINT"}));
        process.on('SIGTERM', exitHandler.bind(null, {db: mongodb, reason: "SIGTERM"}));
        process.on('uncaughtException', exitHandler.bind(null, {db: mongodb, reason: "uncaughtException"}));

        console.log('MONGODB: Connection Successful.');
        connections[connectionString] = mongodb;
        resolve(mongodb);
      });
  });
};

function exitHandler(options, err) {
  if (err) console.log("MONGODB: An uncaught exception occurred : ", err.stack);
  console.log("MONGODB: closing database connection...");
  options.db.close(function (error) {
    if (error) console.log("MONGODB: Error closing mongo db connection : ", error);
    else console.log("MONGODB: database closed");
    process.exit();
  });
}
