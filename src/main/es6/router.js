// Angular UI-Router

import Fader from './vendor/fader.js';
import $log from 'hlog';

var router = function($stateProvider, $urlRouterProvider, $provide, $httpProvider) {

    // most people use the $provide or $httpProvider to set up authentication flows
    // you're more likely to use them than not, hence why they are included.


    // For any unmatched url, redirect to /
    $urlRouterProvider.otherwise("/");
    //
    // Now set up the states
    $stateProvider
        .state('marketing', {
            url: "/",
            abstract: true,
            views: {
                "topnav@" : {
                    templateUrl : "marketing/marketing.topnav.html"
                }
            }
        })

        ///////////////
        /// Marketing
        //////////////

        .state('marketing.landing', {
            url: "",
            views: {
                "content@": {
                    templateUrl: "marketing/landing.body.html"
                }
            }
        })

        .state('marketing.about', {
            url: "about",
            views: {
                "content@": {
                    templateUrl: "marketing/about.body.html",
                    // how to do inline controllers
                    controller: function(){
                        var latch = false;
                        var doFade = function(){
                            if(latch){
                                $log.debug("Fading out about box");
                                Fader.fadeOutWithId("aboutImg", 2);
                            }
                            else
                            {
                                $log.debug("Fading in about box");
                                Fader.fadeInWithId("aboutImg", 2);
                            }
                            latch = !latch;
                            // handling disposal of the timeout is an exercise left to the reader :)
                            setTimeout(doFade, 4000);
                        };

                        doFade();
                    }
                }
            }
        })

        .state('marketing.time', {
            url: "time",
            views: {
                "content@":{
                    templateUrl: "marketing/time.body.html",
                    // how to do controllers defined elsewhere
                    controller: "timeController"
                }
            }
        })
    ;

};

// Don't forget AngularJS dependency injection
router.$inject = ['$stateProvider', '$urlRouterProvider', '$provide', '$httpProvider'];

export default router;