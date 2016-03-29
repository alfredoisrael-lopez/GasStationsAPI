var mongo = require('mongodb');
var composeUri = 'mongodb://<username>:<password>@horace.1.mongolayer.com:10281,horace.0.mongolayer.com:10281/PointsOfInterestDb?replicaSet=set-5671a0044921b75b38001402';

module.exports = function(GasStation) {   
    GasStation.findAroundMe = function (query, cb) {  
        mongo.MongoClient.connect(composeUri,{}, function(err, conn){
            console.log("Connection Error --> " + err);
            var collection = conn.collection('GasStation');
            collection.find({ $and: [{
                                        location: {
                                            $geoWithin: {
                                                $centerSphere: [[parseFloat(query.lon), parseFloat(query.lat)],parseFloat(query.radius) / 6378.1]
                                            }
                                        }
                                    },{
                                        qualification: { $gte: parseInt(query.qualification)}
                                    }]
            },{},function(err, cursor){
                console.log("Cursor Error --> " + err);
                cursor.toArray(function(err,items){
                    console.log("Items Error --> " + err);
					cb(null, items);
                });
            });
        });                        
    };
    
    GasStation.remoteMethod(
        'findAroundMe',{
            http: {path: '/findAroundMe' ,verb: 'post'},
            accepts: {arg: 'query', type: 'Object', http: { source: 'body' }},
            returns: {arg: 'gasStations', type: 'array'} 
        });
};
