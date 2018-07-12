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
  .config(function($stateProvider, $urlRouterProvider) {
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
      .state("app.addItem", {
        url: "/addItem",
        views: {
          menuContent: {
            templateUrl: "templates/addItem.tmpl.html",
            controller: "AddItemCtrl"
          }
        }
      })
      .state("app.deleteItem", {
        url: "/deleteItem",
        views: {
          menuContent: {
            templateUrl: "templates/deleteItem.tmpl.html",
            controller: "DeleteItemCtrl"
          }
        }
      })
      .state("app.addCategory", {
        url: "/addCategory",
        views: {
          menuContent: {
            templateUrl: "templates/addCategory.tmpl.html",
            controller: "AddCategoryCtrl"
          }
        }
      })
      .state("app.deleteCategory", {
        url: "/deleteCategory",
        views: {
          menuContent: {
            templateUrl: "templates/deleteCategory.tmpl.html",
            controller: "DeleteCategoryCtrl"
          }
        }
      })
      .state("app.welcome", {
        url: "/welcome",
        views: {
          menuContent: {
            templateUrl: "templates/welcome.tmpl.html",
            controller: "WelcomeCtrl"
          }
        }
      })
      .state("app.test", {
        url: "/test",
        views: {
          menuContent: {
            templateUrl: "templates/test.html",
            controller: "TestCtrl"
          }
        }
      });
    // if none of the above states are matched, use this as the fallback
    // $urlRouterProvider.otherwise('/app/browse');
    //$urlRouterProvider.otherwise('/app/category/00000000-0000-0000-0002-000000000006');
    $urlRouterProvider.otherwise("/app/welcome");
  });
