const region = 'us-east-1';
const DRYRUN = false;
const FILTERS = [
            {
                Name: 'instance-state-code',
                Values: ['16'] // 16 - running - 80 - stoped
            },
            {
                Name: 'tag:StopStartMyInstances', // change it to your tag
                Values: ['true']
            }
        ];

var AWS  = require('aws-sdk');

var ec2  = new AWS.EC2({region: region});

exports.handler = (event, context, callback) => {

    var params = {
        Filters: FILTERS
    };

    ec2.describeInstances(params, function(err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
        } else {
            var total = data.Reservations.length;

            console.log("Instances => " + total);

            if (total === 0) {
                callback(null, 'No instances were found...');
            }

            var instances = [];

            for (var i=0; i<total; i++) {
              var instance   = data.Reservations[i].Instances[0];
              var azone      = instance.Placement.AvailabilityZone;
              var instanceID = instance.InstanceId;
              var tags       = instance.Tags;
              var state      = instance.State;

              console.log("InstanceID: " + instanceID);
              console.log("Availability Zone: " + azone);
              console.log("State: " + JSON.stringify(state));
              console.log("-------------------------------");

              instances[i] = instanceID;
            }

            var params2 = {
                InstanceIds: instances,
                DryRun: DRYRUN
            };

            ec2.stopInstances(params2, function(err, data) {
                if (err) {
                    console.log(err, err.stack);
                    callback(null, 'Error while trying to stop instances: ' + err);
                } else    {
                    console.log(data);
                    callback(null, total + ' instaces were stopped successfully.');
                    }
            });

        }
    });


};
