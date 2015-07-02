export default
{
    name: "timeController",
    def: ['$log', '$scope', '$stateParams', '$state', 'timeService', function ($log, $scope, $stateParams, $state, timeService) {

        $scope.localTime = timeService.localNow();
        $scope.remoteTime = null;

        $scope.promiseOption1 = function() {

            timeService.remoteNow().then((t) => {
                $log.debug(`local time is ${$scope.localTime}`);
                $log.debug(`remote time is ${t}`);
                $scope.remoteTime = t;
            }).catch((err) => {
                $log.error(`Could not retrieve remote time ${err}`);
            });
        };

        $scope.promiseOption2 = function() {

            timeService.remoteNowButNeedToDigest().then((t) => {
                $log.debug(`local time is ${$scope.localTime}`);
                $log.debug(`remote time is ${t}`);
                $scope.remoteTime = t;

                // Note the difference:
                // Often NEEDED if you mix and match ES6 Promises with AngularJS
                // Try commenting out this line to see what happens
                $scope.$digest();
            }).catch((err) => {
                $log.error(`Could not retrieve remote time ${err}`);
            });
        };

        // You choose which one makes sense for you
        //$scope.promiseOption1();
        $scope.promiseOption2();


    }]
};