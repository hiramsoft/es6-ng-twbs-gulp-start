var moduleName = "ngApp.controllers";

import timeCtrl from './controller/time-controller.js';
// import yourCtrlHere from './controller/your-controller';

var ctrls = Array.from([
    //yourCtrlHere,
    timeCtrl
]);

var app = angular.module(moduleName, []);

for(var ctrl of ctrls){
    app.controller(ctrl.name, ctrl.def);
}

export default moduleName;