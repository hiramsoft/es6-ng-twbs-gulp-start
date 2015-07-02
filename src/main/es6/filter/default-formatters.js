import moment from 'moment';

var TimeFormatters = Array.from([
    {
        "name": "calendar",
        "fn": function () {
            return function (dt) {
                return moment(dt).calendar();
            };
        }
    },
    {
        "name" : "hoursOnly",
        "fn" : function() {
            return function(dt) {
                return moment(dt).format("h:mm a");
            };
        }
    },
    {
        "name" : "fromNow",
        "fn" : function() {
            return function(dt) {
                return moment(dt).fromNow()
            };
        }
    }
]);

export default TimeFormatters;