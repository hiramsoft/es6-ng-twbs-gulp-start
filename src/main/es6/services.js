var moduleName = "ngApp.services";

import moment from 'moment';

import timeService from './service/time-service.js';

angular.module(moduleName, [])
    // how to provide dependencies for legacy dependency injection
    .factory('moment', function(){return moment;})
    .factory('timeService', timeService.factory)
;

export default moduleName;