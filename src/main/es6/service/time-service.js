import moment from 'moment';
// this is an example of using the hiram-logger project
// See https://github.com/hiramsoft/es6-logger
import $log from 'hlog';

class TimeService{

    constructor($q){
        this.$q = $q;
        $log.debugEnabled(true);
    }

    // the name 'factory' is a convention
    // note that the order of these arguments must be defined by the $inject property (see bottom of this page)
    static factory(q){
        return new TimeService(q);
    }

    // example of a function that is "blocking" or computed inline
    localNow(){
        $log.debug("Called localNow");
        return moment();
    }

    // example of a function that is "non-blocking" and returns a promise
    remoteNow(){
        $log.debug("Called remoteNow");

        var pending = this.$q.defer();

        // do the async work...
        setTimeout(() => {
            $log.debug("Server returned the time");
            var time = moment().subtract(15, 'minutes');
            pending.resolve(time);
        }, 3000);

        return pending.promise;
    }

    // If you choose to use the built-in ES6 Promises
    // Take note that you'll need to hint to AngularJS
    // That the UI thread has updates to propagate
    // See example caller in the time controller.
    remoteNowButNeedToDigest(){
        $log.debug("Called remoteNowButNeedToDigest");
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                $log.debug("Server returned the time");
                var time = moment().subtract(15, 'minutes');
                resolve(time);
            }, 3000);
        })
    }

}

// Because strictDi = true, we must tell angular all dependencies to inject
TimeService.factory.$inject = ['$q'];

export default TimeService;