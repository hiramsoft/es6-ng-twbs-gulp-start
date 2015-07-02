var moduleName = "ngApp.filters";

import defaultFormatters from './filter/default-formatters.js';

var app = angular.module(moduleName, []);

for(var formatter of defaultFormatters){
    app.filter(formatter.name, formatter.fn);
}

export default moduleName;