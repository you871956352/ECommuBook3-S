/* global angular */
/* global console */


angular
  .module("starter.controllers", [])
  .controller("AppCtrl", function ($rootScope, $scope, $ionicModal, $timeout, $localStorage,$http,$cordovaMedia, UserProfileService, LocalCacheService) {
    $scope.$on("$ionicView.enter", function(e) {
      $scope.itemNormalFontSize = GlobalVariable.Appearance.itemNormalFontSize;
      $scope.ImagePath = GlobalVariable.LocalCacheDirectory() + "images/";
      // on page loaded
      var userProfile = UserProfileService.getLatest();

      if(typeof $rootScope.isShowDisplayName == 'undefined') {
        $rootScope.isShowDisplayName = { checked: true };
      }
      console.log( "Language Selected3:" + userProfile.DISPLAY_LANGUAGE +  "/" + userProfile.SPEECH_LANGUAGE_CODE + "/" + userProfile.SPEECH_GENDER);
      $scope.userProfile = userProfile;
      console.log(userProfile);
    });
    $scope.onShowDisplayNameChanged = function() {
      console.log('onShowDisplayNameChanged');
      console.log('$rootScope.isShowDisplayName:' + $rootScope.isShowDisplayName.checked);
    }
    $scope.onCategoryClicked = function (categoryId) {
      var userProfile = UserProfileService.getLatest();
      var targetCategory = getObjectById(userProfile, categoryId);
      var targetDisplayName = targetCategory.DisplayName;
      //Bug: new added category has no display multiple language
      for (i = 0; i < targetCategory.DisplayMultipleLanguage.length; i++) {
        var translation = targetCategory.DisplayMultipleLanguage[i];
        if (translation.Language == userProfile.DISPLAY_LANGUAGE) {
          targetDisplayName = translation.Text;
        }
      }
      var AudioDirectory = GlobalVariable.LocalCacheDirectory() + "audio/bing/" +
        userProfile.SPEECH_LANGUAGE_CODE +  "/" + userProfile.SPEECH_GENDER + "/";
      var src = AudioDirectory + normalizeDisplayName(targetDisplayName) + ".mp3";
      //alert(src);
      MediaPlayer.play($cordovaMedia, src);
    };
    $scope.save = function() {
      $localStorage.message = "this is my message";
    };
    $scope.load = function() {
      $scope.data = $localStorage.message;
      return $scope.data;
    };

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    // Form data for the login modal
    $scope.loginData = {};

    // Create the login modal that we will use later
    $ionicModal
      .fromTemplateUrl("templates/login.html", {
        scope: $scope
      })
      .then(function(modal) {
        $scope.modal = modal;
      });

    // Triggered in the login modal to close it
    $scope.closeLogin = function() {
      $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function() {
      $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function() {
      console.log("Doing login", $scope.loginData);

      // Simulate a login delay. Remove this and replace with your login
      // code if using a login system
      $timeout(function() {
        $scope.closeLogin();
      }, 1000);
    };
  })
  .controller("PopupCtrl", function($scope, $mdDialog, ngDialog) {
    $scope.clickToOpen = function() {
      ngDialog.open({
        showClose: true,
        height: "100%",
        width: "80%",
        template: "templates/browse.html"
        //className: 'ngdialog-theme-default'
      });
    };
  })

  .controller("CategoryCtrl", function( $rootScope,$scope,$stateParams,$mdDialog, $cordovaMedia, UserProfileService) {
    $scope.ImagePath = GlobalVariable.LocalCacheDirectory() + "images/";
    $scope.itemNormalFontSize = GlobalVariable.Appearance.itemNormalFontSize;
    var userProfile = UserProfileService.getLatest();
    $scope.userProfile = userProfile;
    $scope.categoryId = $stateParams.categoryId;

    for (var i = 0; i < userProfile.Categories.length; i++) {
      if (userProfile.Categories[i].ID == $stateParams.categoryId) {
        $scope.category = userProfile.Categories[i];
        for (i = 0; i < $scope.category.DisplayMultipleLanguage.length; i++) {
          translation = $scope.category.DisplayMultipleLanguage[i];
          if (translation.Language == userProfile.DISPLAY_LANGUAGE) {
            $scope.categoryDisplayName = translation.Text;
          }
        }
        break;
      }
    }
    $scope.width = 1;
    console.log('isShowDisplayName.checked:' + $rootScope.isShowDisplayName.checked);
    $scope.onItemClicked = function(ev, itemId) {
      $scope.showEnlargeItemPopup(ev, itemId);
    };
    $scope.showAlert = function(ev, itemId) {
      // Appending dialog to document.body to cover sidenav in docs app
      // Modal dialogs should fully cover application
      // to prevent interaction outside of dialog

      var parentEl = angular.element(document.body);
      $mdDialog.show(
        $mdDialog
          .alert()
          //.parent(angular.element(document.querySelector('#grid-container')))
          .parent(angular.element(document.body))
          .clickOutsideToClose(true)
          .title("This is an alert title")
          .textContent(
            "You can specify some description text in here." + itemId
          )
          .ariaLabel("Alert Dialog Demo")
          .ok("Got it!")
          .targetEvent(ev)
      );
    };

    $scope.showEnlargeItemPopup = function(ev, itemId) {
      console.log(
        "GlobalVariable.Appearance.itemNormalFontSize :" +
          GlobalVariable.Appearance.itemNormalFontSize
      );
      userProfile = UserProfileService.getLatest();
      console.log(
        "Language Selected2:" +
          userProfile.DISPLAY_LANGUAGE +
          "/" +
          userProfile.SPEECH_LANGUAGE_CODE +
          "/" +
          userProfile.SPEECH_GENDER
      );
      targetItem = getItemObjectByItemId(userProfile, itemId);
      targetScope = $scope.$new();
      targetScope.selectedItemId = targetItem.ID;
      targetScope.selectedItemName = targetItem.DisplayName;
      for (i = 0; i < targetItem.DisplayMultipleLanguage.length; i++) {
        translation = targetItem.DisplayMultipleLanguage[i];
        if (translation.Language == userProfile.DISPLAY_LANGUAGE) {
          targetScope.selectedItemName = translation.Text;
        }
      }

      targetScope.ImagePath = $scope.ImagePath;
      targetScope.AudioDirectory =
        GlobalVariable.LocalCacheDirectory() +
        "audio/bing/" +
        userProfile.SPEECH_LANGUAGE_CODE +
        "/" +
        userProfile.SPEECH_GENDER +
        "/";
      var src =
        targetScope.AudioDirectory +
        normalizeDisplayName(targetScope.selectedItemName) +
        ".mp3";
      console.log("Audio src:" + src);
      //playAudio(src);
      MediaPlayer.play($cordovaMedia, src);
      $mdDialog
        .show({
          controller: DialogController,
          templateUrl: "templates/popup-item.tmpl.html",
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: true,
          scope: targetScope,
          fullscreen: false // Only for -xs, -sm breakpoints.
        })
        .then(
          function(answer) {
            $scope.status = 'You said the information was "' + answer + '".';
          },
          function() {
            $scope.status = "You cancelled the dialog.";
          }
        );
    };

    function DialogController( $scope, $mdDialog, $cordovaMedia, $cordovaFileTransfer) {
      $scope.itemNormalFontSize = GlobalVariable.Appearance.itemNormalFontSize;
      $scope.hide = function() {
        $mdDialog.hide();
      };
      $scope.cancel = function() {
        $mdDialog.cancel();
      };
      $scope.answer = function(answer) {
        $mdDialog.hide(answer);
      };

      $scope.onItemClicked = function(ev) {
        console.log("item name:" + $scope.selectedItemName);
        var src = $scope.AudioDirectory +  normalizeDisplayName($scope.selectedItemName) + ".mp3";
        MediaPlayer.play($cordovaMedia, src);
      };
    }
  })
  .controller("SettingCtrl", function(
    $scope,
    $mdDialog,
    $ionicSideMenuDelegate,
    $state,
    $location,
    $cordovaNetwork,
    UserProfileService,
    LocalCacheService
  ) {
    var userProfile = UserProfileService.getLatest();
    console.log(
      "start:" +
        userProfile.DISPLAY_LANGUAGE +
        "/" +
        userProfile.SPEECH_LANGUAGE_CODE +
        "/" +
        userProfile.SPEECH_GENDER
    );

    $scope.displayLanguageList = GlobalVariable.LanguageList;

    $scope.speechLanguageList = [
      { name: "[ar-EG]Arabic (Egypt)", value: "ar-EG", language: "ar" },
      { name: "[de-DE]German (Germany)", value: "de-DE", language: "de" },
      { name: "[en-AU]English (Australia)", value: "en-AU", language: "en" },
      { name: "[en-CA]English (Canada)", value: "en-CA", language: "en" },
      {
        name: "[en-GB]English (United Kingdom)",
        value: "en-GB",
        language: "en"
      },
      { name: "[en-IN]English (India)", value: "en-IN", language: "en" },
      {
        name: "[en-US]English (United States)",
        value: "en-US",
        language: "en"
      },
      { name: "[es-ES]Spanish (Spain)", value: "es-ES", language: "es" },
      { name: "[es-MX]Spanish (Mexico)", value: "es-MX", language: "es" },
      { name: "[fr-CA]French (Canada)", value: "fr-CA", language: "fr" },
      { name: "[fr-FR]French (France)", value: "fr-FR", language: "fr" },
      { name: "[it-IT]Italian (Italy)", value: "it-IT", language: "it" },
      { name: "[ja-JP]Japanese (Japan)", value: "ja-JP", language: "ja" },
      { name: "[pt-BR]Portuguese (Brazil)", value: "pt-BR", language: "pt" },
      { name: "[ru-RU]Russian (Russia)", value: "ru-RU", language: "ru" },
      { name: "[zh-CN]中文 (普通话)", value: "zh-CN", language: "zh-CHS" },
      { name: "[zh-HK]中文 (粤语)", value: "zh-HK", language: "zh-CHS" },
      { name: "[zh-TW]中文 (國語)", value: "zh-TW", language: "zh-CHT" },
      { name: "[zh-HK]中文 (粵語)", value: "zh-HK", language: "yue" },
      { name: "[ko-KR]Korean (Korea)", value: "ko-KR", language: "ko" }
    ];

    $scope.selectedDisplayLanguage;
    $scope.selectedSpeechLanguage;
    $scope.selectedSpeechGender;

    $scope.onSelectedSpeechLanguageChanged = function() {
      $scope.speechGenderOptions = [];
      console.log("speech language:" + $scope.selectedSpeechLanguage);
      switch ($scope.selectedSpeechLanguage) {
        case "ar-EG":
          $scope.speechGenderOptions.push({ value: "female", name: "أنثى" });
          break;
        case "de-DE":
          $scope.speechGenderOptions.push({
            value: "female",
            name: "weiblich"
          });
          $scope.speechGenderOptions.push({ value: "male", name: "männlich" });
          break;
        case "en-AU":
          $scope.speechGenderOptions.push({ value: "female", name: "Female" });
          break;
        case "en-CA":
          $scope.speechGenderOptions.push({ value: "female", name: "Female" });
          break;
        case "en-GB":
          $scope.speechGenderOptions.push({ value: "female", name: "Female" });
          $scope.speechGenderOptions.push({ value: "male", name: "Male" });
          break;
        case "en-IN":
          $scope.speechGenderOptions.push({ value: "male", name: "Male" });
          break;
        case "en-US":
          $scope.speechGenderOptions.push({ value: "female", name: "Female" });
          $scope.speechGenderOptions.push({ value: "male", name: "Male" });
          break;
        case "es-ES":
          $scope.speechGenderOptions.push({ value: "female", name: "hembra" });
          $scope.speechGenderOptions.push({ value: "male", name: "masculino" });
          break;
        case "es-MX":
          $scope.speechGenderOptions.push({ value: "male", name: "masculino" });
          break;
        case "fr-CA":
          $scope.speechGenderOptions.push({ value: "female", name: "femelle" });
          break;
        case "fr-FR":
          $scope.speechGenderOptions.push({ value: "female", name: "femelle" });
          $scope.speechGenderOptions.push({ value: "male", name: "mâle" });
          break;
        case "it-IT":
          $scope.speechGenderOptions.push({ value: "male", name: "maschio" });
          break;
        case "ja-JP":
          $scope.speechGenderOptions.push({ value: "female", name: "女性" });
          $scope.speechGenderOptions.push({ value: "male", name: "男性" });
          break;
        case "pt-BR":
          $scope.speechGenderOptions.push({ value: "male", name: "masculino" });
          break;
        case "ru-RU":
          $scope.speechGenderOptions.push({
            value: "female",
            name: "женский пол"
          });
          $scope.speechGenderOptions.push({ value: "male", name: "мужской" });
          break;
        case "zh-CN":
          $scope.speechGenderOptions.push({ value: "female", name: "女" });
          $scope.speechGenderOptions.push({ value: "male", name: "男" });
          break;
        case "zh-HK":
          $scope.speechGenderOptions.push({ value: "female", name: "女" });
          $scope.speechGenderOptions.push({ value: "male", name: "男" });
          break;
        case "zh-TW":
          $scope.speechGenderOptions.push({ value: "female", name: "女" });
          $scope.speechGenderOptions.push({ value: "male", name: "男" });
          break;
        case "ko-KR":
          $scope.speechGenderOptions.push({ value: "female", name: "女" });
          break;
      }
    };

    $scope.onSelectedDisplayLanguageChanged = function() {
      console.log("display language:" + $scope.selectedDisplayLanguage);

      $scope.speechLanguageListOption = [];
      for (var i = 0; i < $scope.speechLanguageList.length; i++) {
        var speechLanguage = $scope.speechLanguageList[i];
        if (speechLanguage.language == $scope.selectedDisplayLanguage) {
          $scope.speechLanguageListOption.push(speechLanguage);
        }
      }
    };

    $scope.onSelectedSpeechGenderChanged = function() {
      console.log("gender:" + $scope.selectedSpeechGender);
    };

    $scope.onConfirmLanguageButtonClicked = function() {
      if($cordovaNetwork.isOffline()) {
        alert("This feature only be supported with internet. Please connect wifi and try again.");
        return;
      }
      console.log(
        $scope.selectedDisplayLanguage +
          "/" +
          $scope.selectedSpeechLanguage +
          "/" +
          $scope.selectedSpeechGender
      );
      if (
        $scope.selectedDisplayLanguage &&
        $scope.selectedSpeechLanguage &&
        $scope.selectedSpeechGender
      ) {
        LoadingDialog.showLoadingPopup($mdDialog, $ionicSideMenuDelegate);
        var userProfile = UserProfileService.getLatest();
        userProfile.DISPLAY_LANGUAGE = $scope.selectedDisplayLanguage;
        userProfile.SPEECH_LANGUAGE_CODE = $scope.selectedSpeechLanguage;
        userProfile.SPEECH_GENDER = $scope.selectedSpeechGender;
        console.log(
          "Language Selected:" +
            userProfile.DISPLAY_LANGUAGE +
            "/" +
            userProfile.SPEECH_LANGUAGE_CODE +
            "/" +
            userProfile.SPEECH_GENDER
        );
        UserProfileService.saveLocal(userProfile);
        LocalCacheService.prepareCache(userProfile);
        UserProfileService.postToServer(userProfile);
      }
    };

    $scope.onItemNormalFontSizeChanged = function() {
      GlobalVariable.Appearance.itemNormalFontSize = $scope.itemNormalFontSize;
    };

    $scope.onConfirmAppearanceButtonClicked = function() {
      setTimeout(function() {
        //$state.go('setting-ok');
        //$state.go($state.current, {}, {reload: true});
        //$state.go("app.setting-ok",{}, {reload: true});
        $state.go("app.setting", {}, { reload: true });
        $ionicSideMenuDelegate.toggleLeft();
      }, 500);
    };

    $scope.onConfirmResetUserprofileButtonClicked = function() {
      if($cordovaNetwork.isOffline()) {
        alert("This feature only be supported with internet. Please connect wifi and try again.");
        return;
      }
      console.log('onConfirmResetUserprofileButtonClicked');
      LoadingDialog.showLoadingPopup($mdDialog, $ionicSideMenuDelegate);
      var userProfile = UserProfileService.sample();
      userProfile.ID = guid();
      UserProfileService.saveLocal(userProfile);
      UserProfileService.postToServerCallback(function() {
        console.log('new userprofile has been posted, userid:' + userProfile.ID);
        UserProfileService.cloneItem(userProfile.ID, function() {
          console.log('uuuuu:' + JSON.stringify(UserProfileService.getLatest()));
          GlobalVariable.DownloadProgress.Reset();
          LocalCacheService.prepareCache(UserProfileService.getLatest());
        });
        //$state.go("app.setting", {}, { reload: true });
        //$ionicSideMenuDelegate.toggleLeft();
      });
    }
  })
  .controller("SettingOKCtrl", function($scope, $ionicSideMenuDelegate) {
    $ionicSideMenuDelegate.toggleLeft();
  })
  .controller("AddCategoryCtrl", function(
    $rootScope,
    $scope,
    $cordovaCamera,
    $cordovaFileTransfer,
    $mdDialog,
    $http,
    $ionicSideMenuDelegate,
    $cordovaNetwork,
    $ionicHistory,
    UserProfileService,
    LocalCacheService
  ) {
    $scope.userProfile = UserProfileService.getLatest();
    $scope.ImagePath = GlobalVariable.LocalCacheDirectory() + "images/";
    $scope.uuid = guid();
    $scope.inputLanguage = "";
    $scope.selectedImageUrl = "";

    $scope.inputLanguageList = GlobalVariable.LanguageList;

    $scope.onAddCategoryConfirmClicked = function () {
      var displayName = $scope.categoryName;
      var inputLanguage = $scope.inputLanguage;
      if($cordovaNetwork.isOffline()) {
        alert("This feature only be supported with internet. Please connect wifi and try again.");
        return;
      }
      if (typeof displayName == "undefined" || displayName == "") {
        alert("Please input category name!");
        return;
      }
      if (typeof inputLanguage == "undefined" || inputLanguage == "") {
        alert("Please input language");
        return;
      }
      if (typeof document.getElementById("myImage").src == "undefined" || document.getElementById("myImage").src == "") {
        alert("Please select a image");
        return;
      }

      GlobalVariable.DownloadProgress.Reset();
      LoadingDialog.showLoadingPopup($mdDialog, $ionicSideMenuDelegate);

      console.log("new guid:" + $scope.uuid);
      console.log("displayname:" + displayName);
      console.log("inputLanguage:" + inputLanguage);

      var userProfile = UserProfileService.getLatest();

      var newCategory = {};
      newCategory.ID = $scope.uuid;
      newCategory.DisplayName = displayName;
      newCategory.DisplayMultipleLanguage = [];

      var url = ServerPathVariable.getTranslationsPath(inputLanguage,newCategory.DisplayName );
      $http({
        url: url,
        method: "GET"
      }).then(function(data) {
        newCategory.DisplayMultipleLanguage = data.data;
        console.log(JSON.stringify(newCategory));

        userProfile.Categories.push(newCategory);

        UserProfileService.saveLocal(userProfile);
        UserProfileService.postToServerCallback(function() {
          var filePath = $scope.selectedImageUrl;
          var server = ServerPathVariable.GetPostImagePath();

          var options = new FileUploadOptions();
          options.fileKey = "file";
          options.fileName = filePath.substr(filePath.lastIndexOf("/") + 1);
          options.mimeType = "image/jpeg";
          options.httpMethod = "POST";

          var params = {};
          params.uuid = newCategory.ID;
          options.params = params;

          console.log(JSON.stringify(options));

          $cordovaFileTransfer.upload(server, filePath, options).then(
            function(result) {
              console.log(JSON.stringify(result));
              var userProfile = UserProfileService.getLatest();

              UserProfileService.getOnline(userProfile.ID, function() {
                console.log("------------------------------------");
                LocalCacheService.prepareCache(UserProfileService.getLatest());
              });
            },
            function(err) {
              console.log(JSON.stringify(err));
              // Error
            },
            function(progress) {
              // constant progress updates
            }
          );
        });
      });

      console.log("return reach");
      return;
    };

    $scope.onTakeImageButtonClicked = function(mode) {
      console.log("onTakeImageButtonClicked");
      var options = {};
      if (mode == "camera") {
        options = {
          quality: 90,
          destinationType: Camera.DestinationType.FILE_URL,
          sourceType: Camera.PictureSourceType.CAMERA,
          allowEdit: true,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 640,
          targetHeight: 640,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false,
          correctOrientation: true
        };
      } else if (mode == "album") {
        options = {
          quality: 90,
          destinationType: Camera.DestinationType.FILE_URL,
          sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
          allowEdit: true,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 640,
          targetHeight: 640,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false,
          correctOrientation: true
        };
      }
      $cordovaCamera.getPicture(options).then(
        function(imageData) {
          console.log("get picture success");
          var image = document.getElementById("myImage");
          image.src = imageData;
          $scope.selectedImageUrl = imageData;
          $scope.myImageData = imageData;
        },
        function(err) {
          console.log("get picture fail" + JSON.stringify(err));
        }
      );
    };
  })
  .controller("DeleteCategoryCtrl", function(
    $scope,
    $mdDialog,
    $http,
    $ionicSideMenuDelegate,
    $cordovaNetwork,
    UserProfileService,
    LocalCacheService
  ) {
    var userProfile = UserProfileService.getLatest();
    $scope.categories = userProfile.Categories;
    $scope.ImagePath = GlobalVariable.LocalCacheDirectory() + "images/";
    $scope.selectedCategoryId = "";

    $scope.onSelectedCategoryChanged = function() {
      console.log("$scope.selectedCategoryId" + $scope.selectedCategoryId);
      $scope.category = getCategoryById(
        $scope.userProfile,
        $scope.selectedCategoryId
      );
    };

    $scope.onDeleteCategoryConfirmClicked = function() {
      if($cordovaNetwork.isOffline()) {
        alert("This feature only be supported with internet. Please connect wifi and try again.");
        return;
      }
      console.log("onDeleteCategoryConfirmClicked");

      var categoryIndex = getCategoryIndexById($scope.userProfile, $scope.selectedCategoryId);
      if (categoryIndex == -1) {
        console.log('categoryIndex = -1, categoryId:' + $scope.selectedCategoryId);
        alert("Please select category");
        return;
      }
      LoadingDialog.showLoadingPopup($mdDialog, $ionicSideMenuDelegate);

      $scope.userProfile.Categories.splice(categoryIndex, 1);

      UserProfileService.saveLocal($scope.userProfile);
      UserProfileService.postToServerCallback(function () {
        console.log('delete complete, user profile uploaded');
        LoadingDialog.hideLoadingPopup($mdDialog);
        $ionicSideMenuDelegate.toggleLeft();
        alert("Category Deleted");
      });
    };
  })
  .controller("AddItemCtrl", function(
    $scope,
    $cordovaCamera,
    $cordovaFileTransfer,
    $mdDialog,
    $http,
    $ionicSideMenuDelegate,
    $cordovaNetwork,
    UserProfileService,
    LocalCacheService
  ) {
    $scope.userProfile = UserProfileService.getLatest();
    $scope.categories = $scope.userProfile.Categories;
    $scope.ImagePath = GlobalVariable.LocalCacheDirectory() + "images/";
    $scope.uuid = guid();

    $scope.inputLanguageList = GlobalVariable.LanguageList;

    $scope.onSelectedCategoryChanged = function() {

    };

    $scope.onAddItemConfirmClicked = function() {
      if($cordovaNetwork.isOffline()) {
        alert("This feature only be supported with internet. Please connect wifi and try again.");
        return;
      }

      var displayName = $scope.itemName;
      var selectedCategoryId = $scope.selectedCategoryId;
      var inputLanguage = $scope.inputLanguage;

      console.log("displayname:" + displayName);
      console.log("selectedCategoryId:" + selectedCategoryId);
      console.log("inputLanguage:" + inputLanguage);
      if (typeof selectedCategoryId == "undefined" || selectedCategoryId == "") {
        alert("Please select a category");
        return;
      }
      if (typeof displayName == "undefined" || displayName == "") {
        alert("Please input display name!");
        return;
      }
      if (typeof inputLanguage == "undefined" || inputLanguage == "") {
        alert("Please input language");
        return;
      }
      if (typeof document.getElementById("myImage").src == "undefined" || document.getElementById("myImage").src == "") {
        alert("Please select a image");
        return;
      }



      GlobalVariable.DownloadProgress.Reset();
      LoadingDialog.showLoadingPopup($mdDialog, $ionicSideMenuDelegate);

      console.log("new guid:" + $scope.uuid);


      var userProfile = UserProfileService.getLatest();

      var newItem = {};
      newItem.ID = $scope.uuid;
      newItem.DisplayName = displayName;
      newItem.DisplayMultipleLanguage = [];

      var url = ServerPathVariable.getTranslationsPath(
        inputLanguage,
        newItem.DisplayName
      );
      $http({
        url: url,
        method: "GET"
      }).then(function(data) {
        newItem.DisplayMultipleLanguage = data.data;
        console.log(JSON.stringify(newItem));

        var categoryIndex = getCategoryIndexById(
          UserProfileService.getLatest(),
          selectedCategoryId
        );
        if (categoryIndex == -1) {
          console.log("Categort Id not found:" + selectedCategoryId);
          return;
        }
        userProfile.Categories[categoryIndex].Items.push(newItem);
        UserProfileService.saveLocal(userProfile);
        UserProfileService.postToServerCallback(function() {
          var filePath = $scope.selectedImageUrl;
          var server = ServerPathVariable.GetPostImagePath();

          var options = new FileUploadOptions();
          options.fileKey = "file";
          options.fileName = filePath.substr(filePath.lastIndexOf("/") + 1);
          options.mimeType = "image/jpeg";
          options.httpMethod = "POST";

          var params = {};
          params.uuid = newItem.ID;
          options.params = params;

          console.log(JSON.stringify(options));

          $cordovaFileTransfer.upload(server, filePath, options).then(
            function(result) {
              console.log(JSON.stringify(result));
              var userProfile = UserProfileService.getLatest();

              UserProfileService.getOnline(userProfile.ID, function() {
                console.log("------------------------------------");
                //console.log(JSON.stringify(UserProfileService.getLatest()));
                LocalCacheService.prepareCache(UserProfileService.getLatest());
              });
            },
            function(err) {
              console.log(JSON.stringify(err));
              // Error
            },
            function(progress) {
              // constant progress updates
            }
          );
        });
      });

      console.log("return reach");
      return;

      return;
    };

    $scope.onTakeImageButtonClicked = function(mode) {
      console.log("onTakeImageButtonClicked");
      var options = {};
      if (mode == "camera") {
        options = {
          quality: 90,
          //destinationType: Camera.DestinationType.DATA_URL,
          destinationType: Camera.DestinationType.FILE_URL,
          sourceType: Camera.PictureSourceType.CAMERA,
          allowEdit: true,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 640,
          targetHeight: 640,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false,
          correctOrientation: true
        };
      } else if (mode == "album") {
        options = {
          quality: 90,
          //destinationType: Camera.DestinationType.DATA_URL,
          destinationType: Camera.DestinationType.FILE_URL,
          sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
          allowEdit: true,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 640,
          targetHeight: 640,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false,
          correctOrientation: true
        };
      }

      $cordovaCamera.getPicture(options).then(
        function(imageData) {
          console.log("get picture success");
          var image = document.getElementById("myImage");
          //image.src = "data:image/jpeg;base64," + imageData;
          image.src = imageData;
          $scope.selectedImageUrl = imageData;
          $scope.myImageData = imageData;
        },
        function(err) {
          console.log("get picture fail" + JSON.stringify(err));
          // error
        }
      );
    };
  })
  .controller("DeleteItemCtrl", function(
    $scope,
    $mdDialog,
    $http,
    $ionicSideMenuDelegate,
    $cordovaNetwork,
    UserProfileService,
    LocalCacheService
  ) {
    var userProfile = UserProfileService.getLatest();
    $scope.categories = userProfile.Categories;
    $scope.ImagePath = GlobalVariable.LocalCacheDirectory() + "images/";


    $scope.onSelectedCategoryChanged = function() {
      console.log("$scope.selectedCategoryId" + $scope.selectedCategoryId);
      $scope.category = getCategoryById(
        $scope.userProfile,
        $scope.selectedCategoryId
      );
    };
    $scope.onSelectedItemChanged = function() {};

    $scope.onDeleteItemConfirmClicked = function() {
      console.log("onDeleteItemConfirmClicked");
      if($cordovaNetwork.isOffline()) {
        alert("This feature only be supported with internet. Please connect wifi and try again.");
        return;
      }
      var itemIndex = getItemIndexByItemId($scope.category, $scope.selectedItemId);
      if(typeof $scope.category =='undefined' || itemIndex == -1) {
        console.log('itemIndex = -1, itemId:' + $scope.selectedItemId);
        alert("Please select item");
        return;
      }
      $scope.category.Items.splice(itemIndex, 1);
      var categoryIndex = getCategoryIndexById($scope.userProfile, $scope.selectedCategoryId);
      if (categoryIndex == -1) {
        console.log('categoryIndex = -1, categoryId:' + $scope.selectedCategoryId);
        return;
      }
      LoadingDialog.showLoadingPopup($mdDialog, $ionicSideMenuDelegate);

      $scope.userProfile.Categories[categoryIndex] = $scope.category;
      UserProfileService.saveLocal($scope.userProfile);
      UserProfileService.postToServerCallback(function () {
        console.log('delete complete, user profile uploaded');
        $ionicSideMenuDelegate.toggleLeft();
        LoadingDialog.hideLoadingPopup($mdDialog);
        alert("Item Deleted");
      });
    };
  })
  .controller("WelcomeCtrl", function(
    $scope,
    $mdDialog,
    $http,
    $ionicSideMenuDelegate,
    UserProfileService,
    LocalCacheService
  ) {
  })
  .controller("GridController", [
    "$scope",
    function($scope) {
      var i;
      $scope.itemsList = {
        items1: []
      };

      for (i = 0; i <= 100; i += 1) {
        $scope.itemsList.items1.push({ Id: i, Label: "Item A_" + i });
      }

      $scope.sortableOptions = {
        containment: "#grid-container",
        accept: function(sourceItemHandleScope, destSortableScope) {
          return false;
        }, //override to determine sort is allowed or not. default is true.
        itemMoved: function(event) {
          //console.log('itemMoved:' + JSON.stringify( $scope.itemsList.items1));
        },
        orderChanged: function(event) {
          //console.log('orderChanged:' + JSON.stringify( $scope.itemsList.items1));
        }
      };

      $scope.dragControlListeners = {
        // drag boundary
        containment: "#grid-container",
        accept: function(sourceItemHandleScope, destSortableScope) {
          return false;
        }, //override to determine drag is allowed or not. default is true.
        itemMoved: function(event) {
          console.log("itemMoved:" + event);
        },
        orderChanged: function(event) {
          console.log("orderChanged:" + event);
        }
      };
    }
  ])
  .controller("MainCtrl", function($scope) {
    $scope.draggableObjects = [
      { name: "one" },
      { name: "two" },
      { name: "three" }
    ];
    $scope.onDropComplete = function(index, obj, evt) {
      var otherObj = $scope.draggableObjects[index];
      var otherIndex = $scope.draggableObjects.indexOf(obj);
      $scope.draggableObjects[index] = obj;
      $scope.draggableObjects[otherIndex] = otherObj;
    };
  })
  .controller("PlaylistsCtrl", function($scope) {
    $scope.playlists = [
      { title: "Reggae", id: 1 },
      { title: "Chill", id: 2 },
      { title: "Dubstep", id: 3 },
      { title: "Indie", id: 4 },
      { title: "Rap", id: 5 },
      { title: "Cowbell", id: 6 }
    ];
  })
  .controller("PlaylistCtrl", function($scope, $stateParams) {});
