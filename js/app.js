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
  //  'ngDraggable',

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
      .state("app.setting-ok", {
        url: "/setting-ok",
        views: {
          menuContent: {
            templateUrl: "templates/setting-ok.tmpl.html",
            controller: "SettingOKCtrl"
          }
        }
      })
      .state("app.grid", {
        url: "/grid",
        views: {
          menuContent: {
            templateUrl: "templates/grid.html",
            controller: "GridController"
          }
        }
      })
      .state("app.popup", {
        url: "/popup",
        views: {
          menuContent: {
            templateUrl: "templates/popup.html",
            controller: "PopupCtrl"
          }
        }
      })
      .state("app.search", {
        url: "/search",
        views: {
          menuContent: {
            templateUrl: "templates/search.html"
          }
        }
      })
      .state("app.browse", {
        url: "/browse",
        views: {
          menuContent: {
            templateUrl: "templates/browse.html"
          }
        }
      })
      .state("app.playlists", {
        url: "/playlists",
        views: {
          menuContent: {
            templateUrl: "templates/playlists.html",
            controller: "PlaylistsCtrl"
          }
        }
      })
      .state("app.single", {
        url: "/playlists/:playlistId",
        views: {
          menuContent: {
            templateUrl: "templates/playlist.html",
            controller: "PlaylistCtrl"
          }
        }
      });
    // if none of the above states are matched, use this as the fallback
    // $urlRouterProvider.otherwise('/app/browse');
    //$urlRouterProvider.otherwise('/app/category/00000000-0000-0000-0002-000000000006');
    $urlRouterProvider.otherwise("/app/welcome");
  });
