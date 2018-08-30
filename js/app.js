/* global angular */
/* global console */
/* global window */
/* global cordova */
/* global StatusBar */

// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js

angular
  .module("starter", [
    "ionic",
    "ngCordova",
    "ngStorage",
    "starter.controllers",
    "starter.services",
    "as.sortable",
    "ngMaterial",
    "ngDialog"
  ])
  .run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      if (window.StatusBar) {
        //
      }
    });
  })
  .config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider) {
    $stateProvider
      .state("app", {
        url: "/app",
        abstract: true,
        templateUrl: "templates/menu.html",
        controller: "AppCtrl"
      })
      .state("app.category", {
        url: "/category/:categoryId",
        views: {
          menuContent: {
            templateUrl: "templates/category-grid.html",
            controller: "CategoryCtrl"
          }
        }
      })
      .state("app.setting", {
        url: "/setting",
        views: {
          menuContent: {
            templateUrl: "templates/setting.tmpl.html",
            controller: "SettingCtrl"
          }
        }
      })
      .state("app.addCategory", {
        url: "/addCategory",
        views: {
          menuContent: {
            templateUrl: "templates/addCategory.tmpl.html",
          }
        }
      })
      .state("app.welcome", {
        url: "/welcome",
        views: {
          menuContent: {
            templateUrl: "templates/welcome.tmpl.html",
          }
        }
      })
      .state("app.share", {
        url: "/share",
        views: {
          menuContent: {
            templateUrl: "templates/share.html",
          }
        }
      })
      .state("app.sentence", {
        url: "/sentence",
        views: {
          menuContent: {
            templateUrl: "templates/sentence.html",
          }
        }
      })
      .state("app.search", {
        url: "/search",
        views: {
          menuContent: {
            templateUrl: "templates/search.html",
          }
        }
      })
      .state("app.voiceModel", {
        url: "/voiceModel",
        views: {
          menuContent: {
            templateUrl: "templates/voiceModel.html",
          }
        }
      })
      .state("app.userInformation", {
        url: "/userInformation",
        views: {
          menuContent: {
            templateUrl: "templates/userInformation.html",
          }
        }
      })
      .state("app.aboutUs", {
        url: "/aboutUs",
        views: {
          menuContent: {
            templateUrl: "templates/aboutUs.html",
          }
        }
      })
      .state("app.practicing", {
        url: "/practicing",
        views: {
          menuContent: {
            templateUrl: "templates/practicing.tmpl.html",
          }
        }
      })
      .state("app.poem", {
        url: "/practicing/poem",
        views: {
          menuContent: {
            templateUrl: "templates/practicing-poem.tmpl.html",
          }
        }
      })
      .state("app.pronunciation", {
        url: "/practicing/pronunciation",
        views: {
          menuContent: {
            templateUrl: "templates/practicing-pronunciation.tmpl.html",
          }
        }
      })
      .state("app.face", {
        url: "/practicing/face",
        views: {
          menuContent: {
            templateUrl: "templates/practicing-face.tmpl.html",
          }
        }
      })
      .state("app.login", {
        url: "/login",
        views: {
          menuContent: {
            templateUrl: "templates/login.html",
          }
        }
      });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise("/app/welcome");
    $ionicConfigProvider.views.swipeBackEnabled(false);
  });
