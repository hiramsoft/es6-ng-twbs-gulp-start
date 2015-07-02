var moduleName = "ngApp.directives";

// UI Directives

import qrcode from './directive/qrcode.js';

var directives = [
    qrcode
    // add your own directives here
];

var app = angular.module(moduleName, []);

for(var directive of directives){
    app.directive(directive.name, directive.fn);
}

export default moduleName;