describe('mongo-connector',function() {
  var mongo = require('mongodb'),
      mongoConnector = require('../index'),
      expectedError = new Error('failed to connect'),
      closeCallbacks = [],
      fakeConnection = { on: function(evt, callback) {
          closeCallbacks.push(callback);
        },
        close: function(callback) { callback();}
      };

  beforeEach(function(){
    spyOn(mongo.Db, "connect").andCallFake(function(key, callback) {
        if (key === 'mongodb://pass') callback(null, fakeConnection);
        else callback(expectedError, null);
      });
  });

  afterEach(function() {
    closeCallbacks.forEach(function(cb) {
      cb();
    });
  });

  it('should resolve when successfully connecting to MongoDb', function(done){
    mongoConnector.connect("mongodb://pass")
      .then(function(result) {
        expect(result).toBe(fakeConnection);
        done();
      });
  });

  it('should reject when failing to connect to MongoDb', function(done){
    mongoConnector.connect("mongodb://fail")
      .fail(function(result) {
        expect(result).toBe(expectedError);
        done();
      });
  });

  it('should reuse connections to MongoDb', function(done) {
    mongo.Db.connect.reset();
    mongoConnector.connect('mongodb://pass')
      .then(function() {
        expect(mongo.Db.connect).toHaveBeenCalled();
        mongo.Db.connect.reset();
      })
      .then(function() {
        return mongoConnector.connect('mongodb://pass');
      })
      .then(function() {
        expect(mongo.Db.connect).not.toHaveBeenCalled();
      })
      .then(done);
  });
});