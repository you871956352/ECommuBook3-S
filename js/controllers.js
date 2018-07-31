/* global angular */
/* global console */
angular
  .module("starter.controllers", [])
  .controller("AppCtrl", function ($rootScope, $scope, $mdDialog, $ionicSideMenuDelegate, $ionicModal, $timeout, $localStorage, $http, $cordovaMedia, $cordovaNetwork, UserProfileService, LocalCacheService) {
    $scope.$on("$ionicView.enter", function (e) {
      $scope.itemNormalFontSize = GlobalVariable.Appearance.itemNormalFontSize;
      $scope.itemNormalPicSize = GlobalVariable.Appearance.itemNormalPicSize;
      $scope.ImagePath = GlobalVariable.LocalCacheDirectory() + "images/";
      // on page loaded
      var userProfile = UserProfileService.getLatest();
      if (typeof $rootScope.isShowDisplayName == 'undefined') {
        $rootScope.isShowDisplayName = { checked: true };
      }
      $scope.userProfile = userProfile;
      $scope.menuProfile = UserProfileService.getMenuProfile();
      console.log("Language Selected:" + userProfile.DISPLAY_LANGUAGE + "/" + userProfile.SPEECH_LANGUAGE_CODE + "/" + userProfile.SPEECH_GENDER);
      if (window.localStorage.getItem("loggedIn") != 1) {
        if ($cordovaNetwork.isOffline()) {
          alert("Please connect to the Internet for app initilization.");
          return;
        } else {
          window.localStorage.setItem("loggedIn", 1);
          console.log("First run: initialization");
          GlobalVariable.DownloadProgress.Reset();
          LoadingDialog.showLoadingPopup($mdDialog, $ionicSideMenuDelegate);
          LocalCacheService.prepareCache(userProfile);
        }
      }
    });
    $scope.onCategoryClicked = function (categoryId) {
      var userProfile = UserProfileService.getLatest();
      var src = GlobalVariable.GetLocalAudioDirectory(userProfile) + categoryId + ".mp3";
      MediaPlayer.play($cordovaMedia, src);
    };
  })
  .controller("CategoryCtrl", function ($rootScope, $scope, $stateParams, $mdDialog, $cordovaMedia, UserProfileService) {
    var userProfile = UserProfileService.getLatest();
    $scope.ImagePath = GlobalVariable.LocalCacheDirectory() + "images/";
    $scope.itemNormalFontSize = GlobalVariable.Appearance.itemNormalFontSize;
    $scope.itemNormalPicSize = GlobalVariable.Appearance.itemNormalPicSize;
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
    $scope.onItemClicked = function (ev, itemId) {
      $scope.showEnlargeItemPopup(ev, itemId);
    };
    $scope.showEnlargeItemPopup = function (ev, itemId) {
      userProfile = UserProfileService.getLatest();
      targetItem = getItemObjectByItemId(userProfile, itemId);
      var targetScope = $scope.$new();
      targetScope.selectedItemId = targetItem.ID;
      targetScope.selectedItemName = targetItem.DisplayName;
      for (i = 0; i < targetItem.DisplayMultipleLanguage.length; i++) {
        translation = targetItem.DisplayMultipleLanguage[i];
        if (translation.Language == userProfile.DISPLAY_LANGUAGE) {
          targetScope.selectedItemName = translation.Text;
        }
      }
      targetScope.ImagePath = $scope.ImagePath;
      targetScope.AudioDirectory = GlobalVariable.GetLocalAudioDirectory(userProfile)
      var src = targetScope.AudioDirectory + targetScope.selectedItemId + ".mp3";
      MediaPlayer.play($cordovaMedia, src);
      $mdDialog.show({
        controller: DialogController,
        templateUrl: "templates/popup-item.tmpl.html",
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        scope: targetScope,
        fullscreen: false // Only for -xs, -sm breakpoints.
      })
        .then(
          function (answer) {
            $scope.status = 'You said the information was "' + answer + '".';
          },
          function () {
            $scope.status = "You cancelled the dialog.";
          }
        );
    };
    function DialogController($scope, $mdDialog, $cordovaMedia, $cordovaFileTransfer) {
      $scope.itemNormalFontSize = GlobalVariable.Appearance.itemNormalFontSize;
      $scope.hide = function () {
        $mdDialog.hide();
      };
      $scope.cancel = function () {
        $mdDialog.cancel();
      };
      $scope.answer = function (answer) {
        $mdDialog.hide(answer);
      };
      $scope.onItemClicked = function (ev) {
        var src = $scope.AudioDirectory + $scope.selectedItemId + ".mp3";
        MediaPlayer.play($cordovaMedia, src);
      };
    }
  })
  .controller("SettingCtrl", function ($scope, $mdDialog, $ionicSideMenuDelegate, $state, $location, $cordovaNetwork, UserProfileService, LocalCacheService) {
    $scope.userProfile = UserProfileService.getLatest();
    $scope.currentInputLanguage = $scope.userProfile.DISPLAY_LANGUAGE;
    $scope.displayLanguageList = GlobalVariable.DisplayLanguageList;
    $scope.speechLanguageList = GlobalVariable.SpeechLanguageList;
    $scope.genderList = GlobalVariable.GenderList;
    $scope.selectedDisplayLanguage;
    $scope.selectedSpeechLanguage;
    $scope.selectedSpeechGender;
    $scope.Title = UserProfileService.getTranslatedMenuText("Operations", "Setting", $scope.currentInputLanguage);
    $scope.subGeneral = UserProfileService.getMenuProfileSubObject("General");
    $scope.textButtonConfirm = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "ConfirmButton", $scope.currentInputLanguage);
    $scope.subMenuProfile = UserProfileService.getMenuProfileSubObject("Setting");
    $scope.textLanguage = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "LanguageSetting", $scope.currentInputLanguage);
    $scope.textDisplayLanguage = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "DisplayLanguage", $scope.currentInputLanguage);
    $scope.textSpeechLanguage = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "SpeechLanguage", $scope.currentInputLanguage);
    $scope.textSpeechGender = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "SpeakerGender", $scope.currentInputLanguage);
    $scope.textAppearance = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "Appearance", $scope.currentInputLanguage);
    $scope.textFontSize = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "FontSize", $scope.currentInputLanguage);
    $scope.textPicSize = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "PicSize", $scope.currentInputLanguage);
    $scope.textExample = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "Example", $scope.currentInputLanguage);
    $scope.textResetApp = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "ResetApp", $scope.currentInputLanguage);
    $scope.textResetConfirm = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "ResetConfirm", $scope.currentInputLanguage);
    $scope.textResetConfirmWarning = $scope.textResetConfirm + "?" + UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "ResetConfirmWarning", $scope.currentInputLanguage);
    $scope.onSelectedDisplayLanguageChanged = function () {
      console.log("display language:" + $scope.selectedDisplayLanguage);
      $scope.speechLanguageListOption = [];
      for (var i = 0; i < $scope.speechLanguageList.length; i++) {
        var speechLanguage = $scope.speechLanguageList[i];
        if (speechLanguage.language == $scope.selectedDisplayLanguage) {
          $scope.speechLanguageListOption.push(speechLanguage);
        }
      }
    };
    $scope.onSelectedSpeechLanguageChanged = function () {
      console.log("speech language:" + $scope.selectedSpeechLanguage);
      $scope.speechGenderOptions = [];
      for (var i = 0; i < $scope.genderList.length; i++) {
        var gender = $scope.genderList[i];
        if (gender.language == $scope.selectedSpeechLanguage) {
          $scope.speechGenderOptions.push(gender);
        }
      }
    };
    $scope.onSelectedSpeechGenderChanged = function () {
      console.log("gender:" + $scope.selectedSpeechGender);
    };
    $scope.onConfirmLanguageButtonClicked = function () {
      if ($cordovaNetwork.isOffline()) {
        alert("This feature only be supported with internet. Please connect wifi and try again.");
        return;
      }
      console.log($scope.selectedDisplayLanguage + "/" + $scope.selectedSpeechLanguage + "/" + $scope.selectedSpeechGender);
      if ($scope.selectedDisplayLanguage && $scope.selectedSpeechLanguage && $scope.selectedSpeechGender) {
        LoadingDialog.showLoadingPopup($mdDialog, $ionicSideMenuDelegate);
        var userProfile = UserProfileService.getLatest();
        userProfile.DISPLAY_LANGUAGE = $scope.selectedDisplayLanguage;
        userProfile.SPEECH_LANGUAGE_CODE = $scope.selectedSpeechLanguage;
        userProfile.SPEECH_GENDER = $scope.selectedSpeechGender;
        console.log("Language Selected:" + userProfile.DISPLAY_LANGUAGE + "/" + userProfile.SPEECH_LANGUAGE_CODE + "/" + userProfile.SPEECH_GENDER);
        UserProfileService.saveLocal(userProfile);
        LocalCacheService.prepareCache(userProfile);
        UserProfileService.postToServerCallback(function () {
          console.log("Post to Server when onConfirmLanguageButtonClicked ");
        });
      }
    };
    $scope.onItemNormalFontSizeChanged = function () {
      GlobalVariable.Appearance.itemNormalFontSize = $scope.itemNormalFontSize;
    };
    $scope.onItemNormalPicSizeChanged = function () {
      GlobalVariable.Appearance.itemNormalPicSize = $scope.itemNormalPicSize;
    };
    $scope.onConfirmAppearanceButtonClicked = function () {
      setTimeout(function () {
        $state.go("app.setting", {}, { reload: true });
        $ionicSideMenuDelegate.toggleLeft();
      }, 500);
    };
    $scope.onConfirmResetUserprofileButtonClicked = function () {
      if ($cordovaNetwork.isOffline()) {
        alert("This feature only be supported with internet. Please connect wifi and try again.");
        return;
      }
      LocalCacheService.clearAllCache();
      LoadingDialog.showLoadingPopup($mdDialog, $ionicSideMenuDelegate);
      var userProfile = UserProfileService.getDefault();
      userProfile.ID = guid();
      UserProfileService.saveLocal(userProfile);
      UserProfileService.postToServerCallback(function () {
        console.log('Setting: reset userProfile and uploaded. UserID: ' + userProfile.ID);
        UserProfileService.cloneItem(userProfile.ID, function () {
          console.log('UserProfile:' + JSON.stringify(UserProfileService.getLatest()));
          GlobalVariable.DownloadProgress.Reset();
          LocalCacheService.prepareCache(UserProfileService.getLatest());
        });
      });
    }
  })
  .controller("AddCategoryCtrl", function ($rootScope, $scope, $cordovaCamera, $cordovaFileTransfer, $mdDialog, $http, $ionicSideMenuDelegate, $cordovaNetwork, $ionicHistory, UserProfileService, LocalCacheService) {
    $scope.userProfile = UserProfileService.getLatest();
    $scope.currentInputLanguage = $scope.userProfile.DISPLAY_LANGUAGE;
    $scope.Title = UserProfileService.getTranslatedMenuText("Operations", "AddCategory", $scope.currentInputLanguage);
    $scope.subGeneral = UserProfileService.getMenuProfileSubObject("General");
    $scope.textCategoryName = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "CategoryName", $scope.currentInputLanguage);
    $scope.textLanguage = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "TargetLanguage", $scope.currentInputLanguage);
    $scope.textCameraImage = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "CameraImage", $scope.currentInputLanguage);
    $scope.textAlbumImage = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "AlbumImage", $scope.currentInputLanguage);
    $scope.textButtonConfirm = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "ConfirmButton", $scope.currentInputLanguage);
    $scope.ImagePath = GlobalVariable.LocalCacheDirectory() + "images/";
    $scope.uuid = guid();
    $scope.inputLanguage = "";
    $scope.selectedImageUrl = "";
    $scope.inputLanguageList = GlobalVariable.DisplayLanguageList;
    $scope.onTakeImageButtonClicked = function (mode) {
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
        function (imageData) {
          console.log("get picture success");
          var image = document.getElementById("myImage");
          image.src = imageData;
          $scope.selectedImageUrl = imageData;
          $scope.myImageData = imageData;
        },
        function (err) {
          console.log("get picture fail" + JSON.stringify(err));
        }
      );
    };
    $scope.onAddCategoryConfirmClicked = function () {
      if ($cordovaNetwork.isOffline()) {
        alert("This feature only be supported with internet. Please connect wifi and try again.");
        return;
      }
      if (typeof $scope.categoryName == "undefined" || $scope.categoryName == "") {
        alert("Please input category name!");
        return;
      }
      if (typeof $scope.inputLanguage == "undefined" || $scope.inputLanguage == "") {
        alert("Please input language");
        return;
      }
      if (typeof document.getElementById("myImage").src == "undefined" || document.getElementById("myImage").src == "") {
        alert("Please select a image");
        return;
      }
      GlobalVariable.DownloadProgress.Reset();
      LoadingDialog.showLoadingPopup($mdDialog, $ionicSideMenuDelegate);
      console.log("new guid:" + $scope.uuid + "displayname:" + $scope.categoryName + "inputLanguage:" + $scope.inputLanguage);

      var newCategory = {};
      newCategory.ID = $scope.uuid;
      newCategory.DisplayName = $scope.categoryName;
      newCategory.DisplayNameLanguage = $scope.inputLanguage;
      newCategory.DisplayMultipleLanguage = [];
      $http({ url: ServerPathVariable.getTranslationsPath($scope.inputLanguage, newCategory.DisplayName), method: "GET" }).then(function (data) {
        newCategory.DisplayMultipleLanguage = data.data;
        $scope.userProfile.Categories.push(newCategory);
        UserProfileService.saveLocal($scope.userProfile);
        UserProfileService.postToServerCallback(function () {
          var filePath = $scope.selectedImageUrl;
          var options = new FileUploadOptions();
          options.fileKey = "file";
          options.fileName = filePath.substr(filePath.lastIndexOf("/") + 1);
          options.mimeType = "image/jpeg";
          options.httpMethod = "POST";
          options.params = { uuid: newCategory.ID };
          console.log("Category Option: " + JSON.stringify(options));
          $cordovaFileTransfer.upload(ServerPathVariable.GetPostImagePath(), filePath, options).then(
            function (result) {
              UserProfileService.getOnline(UserProfileService.getLatest().ID, function () {
                LocalCacheService.prepareCache(UserProfileService.getLatest());
              });
            },
            function (err) { // Error
              console.log("Image upload Error: " + JSON.stringify(err));
            },
            function (progress) { }
          );
        });
      }, function errorCallback(response) {
        alert("Server is not avaliable: " + response);
      });
    };
  })
  .controller("DeleteCategoryCtrl", function ($scope, $mdDialog, $http, $ionicSideMenuDelegate, $cordovaNetwork, UserProfileService, LocalCacheService) {
    $scope.userProfile = UserProfileService.getLatest();
    $scope.currentInputLanguage = $scope.userProfile.DISPLAY_LANGUAGE;
    $scope.categories = $scope.userProfile.Categories;
    $scope.Title = UserProfileService.getTranslatedMenuText("Operations", "DeleteCategory", $scope.currentInputLanguage);
    $scope.subGeneral = UserProfileService.getMenuProfileSubObject("General");
    $scope.textCategoryName = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "CategoryName", $scope.currentInputLanguage);
    $scope.textButtonConfirm = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "ConfirmButton", $scope.currentInputLanguage);
    $scope.ImagePath = GlobalVariable.LocalCacheDirectory() + "images/";
    $scope.AudioPath = GlobalVariable.LocalCacheDirectory() + "audio/";
    $scope.selectedCategoryId = "";
    $scope.onSelectedCategoryChanged = function () {
      console.log("$scope.selectedCategoryId: " + $scope.selectedCategoryId);
      $scope.category = getCategoryById($scope.userProfile, $scope.selectedCategoryId);
    };
    $scope.onDeleteCategoryConfirmClicked = function () {
      if ($cordovaNetwork.isOffline()) {
        alert("This feature only be supported with internet. Please connect wifi and try again.");
        return;
      }
      var idList = [];
      var categoryIndex = getCategoryIndexById($scope.userProfile, $scope.selectedCategoryId);
      if (categoryIndex == -1) {
        alert("Please select category");
        return;
      } else {
        idList.push($scope.selectedCategoryId);
        var category = $scope.categories[categoryIndex];
        for (i = 0; i < category.Items.length; i++) {
          var item = category.Items[i];
          idList.push(item.ID);
        }
      }
      GlobalCacheVariable.DeleteCheck.Reset();
      GlobalCacheVariable.DeleteCheck.SetFileToDelete(idList.length * 2);
      console.log("idList leangth: " + idList.length);
      console.log("File to delete: " + GlobalCacheVariable.DeleteCheck.FileToDelete);
      LoadingDialog.showLoadingPopup($mdDialog, $ionicSideMenuDelegate);
      $scope.userProfile.Categories.splice(categoryIndex, 1);
      UserProfileService.saveLocal($scope.userProfile);
      UserProfileService.postToServerCallback(function () {
        console.log("Deleted in userProfile and uploaded.");
        for (i = 0; i < idList.length; i++) {
          LocalCacheService.deleteLocalImage($scope.ImagePath, idList[i]);
          LocalCacheService.deleteLocalAudio($scope.userProfile, $scope.AudioPath, idList[i]);
        }
        LoadingDialog.hideLoadingPopup($mdDialog);
        $ionicSideMenuDelegate.toggleLeft();
        alert("Category Deleted");
        LocalCacheService.checkDelete();
      });
    };
  })
  .controller("AddItemCtrl", function ($scope, $cordovaCamera, $cordovaFileTransfer, $mdDialog, $http, $ionicSideMenuDelegate, $cordovaNetwork, UserProfileService, LocalCacheService) {
    $scope.userProfile = UserProfileService.getLatest();
    $scope.currentInputLanguage = $scope.userProfile.DISPLAY_LANGUAGE;
    $scope.categories = $scope.userProfile.Categories;
    $scope.Title = UserProfileService.getTranslatedMenuText("Operations", "AddItem", $scope.currentInputLanguage);
    $scope.subGeneral = UserProfileService.getMenuProfileSubObject("General");
    $scope.textCategoryName = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "CategoryName", $scope.currentInputLanguage);
    $scope.textItemName = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "ItemName", $scope.currentInputLanguage);
    $scope.textLanguage = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "TargetLanguage", $scope.currentInputLanguage);
    $scope.textCameraImage = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "CameraImage", $scope.currentInputLanguage);
    $scope.textAlbumImage = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "AlbumImage", $scope.currentInputLanguage);
    $scope.textButtonConfirm = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "ConfirmButton", $scope.currentInputLanguage);
    $scope.ImagePath = GlobalVariable.LocalCacheDirectory() + "images/";
    $scope.uuid = guid();
    $scope.inputLanguageList = GlobalVariable.DisplayLanguageList;
    $scope.onAddItemConfirmClicked = function () {
      if ($cordovaNetwork.isOffline()) {
        alert("This feature only be supported with internet. Please connect wifi and try again.");
        return;
      }
      var displayName = $scope.itemName, selectedCategoryId = $scope.selectedCategoryId, inputLanguage = $scope.inputLanguage;
      console.log("displayname:" + displayName + "selectedCategoryId:" + selectedCategoryId + "inputLanguage:" + inputLanguage);
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
      console.log("Item ID:" + $scope.uuid);
      var userProfile = UserProfileService.getLatest();
      var newItem = {};
      newItem.ID = $scope.uuid;
      newItem.DisplayName = displayName;
      newItem.DisplayNameLanguage = $scope.inputLanguage;
      newItem.DisplayMultipleLanguage = [];
      var url = ServerPathVariable.getTranslationsPath(inputLanguage, newItem.DisplayName);
      $http({ url: url, method: "GET" }).then(function (data) {
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
        UserProfileService.postToServerCallback(function () {
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
            function (result) {
              console.log(JSON.stringify(result));
              var userProfile = UserProfileService.getLatest();
              UserProfileService.getOnline(userProfile.ID, function () {
                LocalCacheService.prepareCache(UserProfileService.getLatest());
              });
            },
            function (err) { // Error
              console.log(JSON.stringify(err));
            },
            function (progress) { }
          );
        });
      });
    };
    $scope.onTakeImageButtonClicked = function (mode) {
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
        function (imageData) {
          console.log("get picture success");
          var image = document.getElementById("myImage");
          //image.src = "data:image/jpeg;base64," + imageData;
          image.src = imageData;
          $scope.selectedImageUrl = imageData;
          $scope.myImageData = imageData;
        },
        function (err) {
          console.log("get picture fail" + JSON.stringify(err));
          // error
        }
      );
    };
  })
  .controller("DeleteItemCtrl", function ($scope, $mdDialog, $http, $ionicSideMenuDelegate, $cordovaNetwork, UserProfileService, LocalCacheService) {
    $scope.userProfile = UserProfileService.getLatest();
    $scope.currentInputLanguage = $scope.userProfile.DISPLAY_LANGUAGE;
    $scope.categories = $scope.userProfile.Categories;
    $scope.Title = UserProfileService.getTranslatedMenuText("Operations", "DeleteItem", $scope.currentInputLanguage);
    $scope.subGeneral = UserProfileService.getMenuProfileSubObject("General");
    $scope.textCategoryName = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "CategoryName", $scope.currentInputLanguage);
    $scope.textItemName = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "ItemName", $scope.currentInputLanguage);
    $scope.textButtonConfirm = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "ConfirmButton", $scope.currentInputLanguage);
    $scope.ImagePath = GlobalVariable.LocalCacheDirectory() + "images/";
    $scope.AudioPath = GlobalVariable.LocalCacheDirectory() + "audio/";
    $scope.onSelectedCategoryChanged = function () {
      console.log("$scope.selectedCategoryId: " + $scope.selectedCategoryId);
      $scope.category = getCategoryById($scope.userProfile, $scope.selectedCategoryId);
    };
    $scope.onDeleteItemConfirmClicked = function () {
      console.log("onDeleteItemConfirmClicked");
      if ($cordovaNetwork.isOffline()) {
        alert("This feature only be supported with internet. Please connect wifi and try again.");
        return;
      }
      GlobalCacheVariable.DeleteCheck.Reset();
      GlobalCacheVariable.DeleteCheck.SetFileToDelete(2);
      console.log("File to delete: " + GlobalCacheVariable.DeleteCheck.FileToDelete);
      var itemIndex = getItemIndexByItemId($scope.category, $scope.selectedItemId);
      if (typeof $scope.category == 'undefined' || itemIndex == -1) {
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
        console.log("Deleted in userProfile and uploaded.");
        LocalCacheService.deleteLocalImage($scope.ImagePath, $scope.selectedItemId);
        LocalCacheService.deleteLocalAudio($scope.userProfile, $scope.AudioPath, $scope.selectedItemId);
        $ionicSideMenuDelegate.toggleLeft();
        LoadingDialog.hideLoadingPopup($mdDialog);
        alert("Item Deleted");
        LocalCacheService.checkDelete();
      });
    };
  })
  .controller("WelcomeCtrl", function ($scope, $mdDialog, $http, $ionicSideMenuDelegate, UserProfileService, LocalCacheService) { })
  .controller("GridController", function ($scope, $http, $mdDialog, $ionicSideMenuDelegate) {
      var i;
      $scope.itemsList = { items1: [] };
      for (i = 0; i <= 100; i += 1) {
        $scope.itemsList.items1.push({ Id: i, Label: "Item A_" + i });
      }
      $scope.sortableOptions = {
        containment: "#grid-container",
        accept: function (sourceItemHandleScope, destSortableScope) {
          return false;
        }, //override to determine sort is allowed or not. default is true.
        itemMoved: function (event) {
        },
        orderChanged: function (event) {
        }
      };
      $scope.dragControlListeners = {  // drag boundary
        containment: "#grid-container",
        accept: function (sourceItemHandleScope, destSortableScope) {
          return false;
        }, //override to determine drag is allowed or not. default is true.
        itemMoved: function (event) {
          console.log("itemMoved:" + event);
        },
        orderChanged: function (event) {
          console.log("orderChanged:" + event);
        }
      };
      $scope.shareCategory = function (event,categoryID) {
        var confirmDialog = $mdDialog.confirm()
          .title('Confirm Upload?')
          .textContent(GlobalVariable.AlertMessageList.UploadAlert())
          .ariaLabel('23333')
          .targetEvent(event)
          .ok('OK')
          .cancel('Cancel');

        $mdDialog.show(confirmDialog).then(function () {
          console.log("Shared Category ID: " + ServerPathVariable.GetUploadSharePath(categoryID));
          $http.get(ServerPathVariable.GetUploadSharePath(categoryID)).then(function (data) {
            console.log("Success");
            alert("Upload Success!");
          });
        },function () {
          console.log("User decide to quit share");
        });
      };
   })
  .controller("MainCtrl", function($scope) { //Test Ctrl, to test reorder function
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
  .controller("SentenceCtrl", function ($scope, $http, UserProfileService) { //For Construct Sentence
    $scope.userProfile = UserProfileService.getLatest();
    $scope.currentInputLanguage = $scope.userProfile.DISPLAY_LANGUAGE;
    $scope.sentences = $scope.userProfile.Sentences;
    $scope.Title = UserProfileService.getTranslatedMenuText("Operations", "Sentence", $scope.currentInputLanguage);
    $scope.onSentenceCheck = function (sentenceID) {
      alert(sentenceID);
    };
  })
  .controller("ShareCtrl", function ($rootScope, $scope, UserProfileService, ShareCategoryService, LocalCacheService, $mdDialog, $ionicSideMenuDelegate, $http) { //Share Ctrl, for user downloading
    $scope.userProfile = UserProfileService.getLatest();
    $scope.currentInputLanguage = $scope.userProfile.DISPLAY_LANGUAGE;
    $scope.itemNormalPicSize = GlobalVariable.Appearance.itemNormalPicSize;
    $scope.shareCategory = ShareCategoryService.getShareCategory();
    $scope.Title = UserProfileService.getTranslatedMenuText("Operations", "Download", $scope.currentInputLanguage);
    $scope.subGeneral = UserProfileService.getMenuProfileSubObject("General");
    $scope.textButtonGet = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "GetButton", $scope.currentInputLanguage);
    $scope.refreshOnlineResource = function () {
      console.log("Start to download online resources");
      $scope.shareCategory = ShareCategoryService.getShareCategory();
      GlobalVariable.DownloadProgress.Reset();
      LoadingDialog.showLoadingPopup($mdDialog, $ionicSideMenuDelegate);
      LocalCacheService.prepareShareCategory($scope.shareCategory);
    };
    $scope.onItemClickedDownload = function (ev, categoryId) {
      var targetScope = $scope.$new();
      targetScope.selectedCategoryId = categoryId;
      targetScope.categoryCloneContent = ShareCategoryService.getShareCategoryCloneContent(categoryId);
      targetScope.selectedCategoryName = "";
      for (var i = 0; i < $scope.shareCategory.categories.length; i++) {
        if ($scope.shareCategory.categories[i].ID == categoryId) {
          var targetCategory = $scope.shareCategory.categories[i];
          for (var j = 0; j < targetCategory.DisplayMultipleLanguage.length; j++) {
            if (targetCategory.DisplayMultipleLanguage[j].Language == $scope.userProfile.DISPLAY_LANGUAGE) {
              targetScope.selectedCategoryName = targetCategory.DisplayMultipleLanguage[j].Text;
              break;
            }
          }
          break;
        }
      }
      $mdDialog.show({
        controller: viewShareController,
        templateUrl: "templates/popup-viewShare.tmpl.html",
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        scope: targetScope,
        fullscreen: false, // Only for -xs, -sm breakpoints.
        onComplete: function () {
          targetScope.categoryCloneContent = ShareCategoryService.getShareCategoryCloneContent(categoryId);
        }
      }).then(
        function (answer) {},
        function () { }
      );
    };
    function viewShareController($scope, $mdDialog, $ionicSideMenuDelegate, $http) {
      $scope.userProfile = UserProfileService.getLatest();
      $scope.cancel = function () {
        $mdDialog.cancel();
      };
      $scope.getOnlineResource = function (ev) {
        $scope.categoryCloneContent = ShareCategoryService.getShareCategoryCloneContent($scope.selectedCategoryId);
      };
      $scope.downloadToLocal = function (ev) {
        var url = ServerPathVariable.GetAddCategoryToUserProfilePath($scope.userProfile.ID, $scope.selectedCategoryId);
        console.log("Add category to user, Access Server url: " + url);
        GlobalVariable.DownloadProgress.Reset();
        LoadingDialog.showLoadingPopup($mdDialog, $ionicSideMenuDelegate);
        $http.get(url).then(function (data) {
          console.log("Request send to server success, start to sync server data...");
          UserProfileService.getOnline(UserProfileService.getLatest().ID, function () {
            console.log("Get updated user profile from server success, start to download files");

            LocalCacheService.prepareCache(UserProfileService.getLatest());
          });
        }),function errorCallback(response) {
            alert("Server is not avaliable: " + response);
        };
      }
    }
  })
  .controller("UserInfoCtrl", function ($scope, UserProfileService){
    $scope.userProfile = UserProfileService.getLatest();
    $scope.currentInputLanguage = $scope.userProfile.DISPLAY_LANGUAGE;
    $scope.DisplayLanguageList = GlobalVariable.DisplayLanguageList;
    $scope.SpeechLanguageList = GlobalVariable.SpeechLanguageList;
    $scope.GenderList = GlobalVariable.GenderList;
    $scope.collectedVoice = 0;
    $scope.totalVoice = 160;
    $scope.Title = UserProfileService.getTranslatedMenuText("Operations", "UserInformation", $scope.currentInputLanguage);
    $scope.subMenuProfile = UserProfileService.getMenuProfileSubObject("UserInformation");
    $scope.VoiceConversion = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "VoiceConversion", $scope.currentInputLanguage);
    $scope.UserID = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "UserID", $scope.currentInputLanguage);
    $scope.DisplayLanguage = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "DisplayLanguage", $scope.currentInputLanguage);
    $scope.SpeechLanguage = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "SpeechLanguage", $scope.currentInputLanguage);
    $scope.SpeakerGender = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "SpeakerGender", $scope.currentInputLanguage);
    $scope.CollectionProgress = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "CollectionProgress", $scope.currentInputLanguage);
    $scope.Collection = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "Collection", $scope.currentInputLanguage);
    $scope.SynchronizeProgress = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "SynchronizeProgress", $scope.currentInputLanguage);
    $scope.Start = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "Start", $scope.currentInputLanguage);
    $scope.Check = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "Check", $scope.currentInputLanguage);
    $scope.Confirm = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "Confirm", $scope.currentInputLanguage);
    $scope.vcStart = function () {};
    $scope.vcCheck = function () {};
    $scope.synchronizeStart = function () {};
  })
  .controller("TestCtrl", function ($scope,$cordovaFileTransfer,$cordovaMedia,$mdDialog, UserProfileService) { //Test Ctrl, for logging
    var targetDirectory = GlobalVariable.LocalCacheDirectory() + "images/";
    var imageID = "00000000-0000-0000-0003-000000000197";
    var uploadID = "00000000-0000-0000-0000-000000000012";
    var uploadName = uploadID + ".jpg";
    var path;
    $scope.ImagePath = targetDirectory + imageID + ".jpg";
    $scope.recordClick = function (ev) {
      var targetScope = $scope.$new();
      $mdDialog.show({
        controller: DialogController,
        templateUrl: "templates/popup-vc.tmpl.html",
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        scope: targetScope,
        fullscreen: false // Only for -xs, -sm breakpoints.
      }).then(
          function (answer) {
            $scope.status = 'You said the information was "' + answer + '".';
          },
          function () {
            $scope.status = "You cancelled the dialog.";
          }
        );
      function DialogController($scope, $mdDialog) {
          $scope.hide = function () {
            $mdDialog.hide();
          };
          $scope.cancel = function () {
            $mdDialog.cancel();
          };
          $scope.answer = function (answer) {
            $mdDialog.hide(answer);
          };
          if (window.cordova && window.cordova.file && window.audioinput) {
              console.log("Use 'Start Capture' to begin...");
              window.addEventListener('audioinput', onAudioInputCapture, false);
              window.addEventListener('audioinputerror', onAudioInputError, false);
          }
          else {
              console.log("Missing: cordova-plugin-file or cordova-plugin-audioinput!");
          }
          var captureCfg = {};
          var audioDataBuffer = [];
          var timerInterVal, timerGenerateSimulatedData;
          var objectURL = null;
          var totalReceivedData = 0;
          $scope.start = function () {
            console.log("Capture Start.");
            startCapture();
          };
          $scope.stop = function () {
            console.log("Capture Stop.");
            stopCapture();
          };
          var startCapture = function () {
            try {
                if (window.audioinput && !audioinput.isCapturing()) {
                    captureCfg = {
                        sampleRate: 16000,
                        bufferSize: 16384,
                        channels: 1,
                        format: audioinput.FORMAT.PCM_16BIT,
                        audioSourceType: audioinput.AUDIOSOURCE_TYPE.DEFAULT,
                    };
                    audioinput.start(captureCfg);
                    console.log("Microphone input started!");
                    $scope.recordinglist = "";
                    if (objectURL) {
                        URL.revokeObjectURL(objectURL);
                    }
                    timerInterVal = setInterval(function () {
                        if (audioinput.isCapturing()) {
                            $scope.infoTimer = "" +
                            new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1") +
                            "|Received:" + totalReceivedData;
                        }
                    }, 1000);
                }
            }
            catch (e) {
                alert("startCapture exception: " + e);
            }
          };
          var stopCapture = function () {
            try {
                if (window.audioinput && audioinput.isCapturing()) {
                    if (timerInterVal) { clearInterval(timerInterVal); }
                    if (window.audioinput) { audioinput.stop(); } else { clearInterval(timerGenerateSimulatedData); }
                    totalReceivedData = 0;
                    $scope.infoTimer = "";
                    console.log("Encoding WAV...");
                    var encoder = new WavAudioEncoder(captureCfg.sampleRate, captureCfg.channels);
                    encoder.encode([audioDataBuffer]);
                    console.log("Encoding WAV finished");
                    var blob = encoder.finish("audio/wav");
                    console.log("BLOB created");
                    window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (dir) {
                        var fileName = new Date().YYYYMMDDHHMMSS() + ".wav";
                        dir.getFile(fileName, {create: true}, function (file) {
                            file.createWriter(function (fileWriter) {
                                fileWriter.write(blob);
                                // Add an URL for the file
                                var a = document.createElement('a');
                                var linkText = document.createTextNode(file.toURL());
                                console.log("Audio path: " + linkText);
                                a.appendChild(linkText);
                                a.title = file.toURL();
                                a.href = file.toURL();
                                a.target = '_blank';
                                $scope.recordinglist.appendChild(a);
                                console.log("File created!");
                            }, function () {
                                alert("FileWriter error!");
                            });
                        });
                    });
                }
            }
            catch (e) {
                alert("stopCapture exception: " + e);
            }
          };
          function onAudioInputCapture( evt ) {
            try {
              if (evt && evt.data) {
                totalReceivedData += evt.data.length;
                console.log( "Audio data received: " + totalReceivedData );
                audioDataBuffer = audioDataBuffer.concat(evt.data);
              }
            }
            catch (ex) {
              alert("onAudioInputCapture ex: " + ex);
            }
          }
          function onAudioInputError(error) { alert("onAudioInputError event recieved: " + JSON.stringify(error)); }
        }
    };
    $scope.uploadClick = function () {
      var filePath = $scope.ImagePath;
      var options = new FileUploadOptions();
      options.fileKey = "file";
      options.fileName = uploadName;
      options.mimeType = "image/jpeg";
      options.httpMethod = "POST";
      options.params = { uuid:  uploadID};
      console.log("Category Option: " + JSON.stringify(options));
      $cordovaFileTransfer.upload(ServerPathVariable.GetPostImagePath(), filePath, options).then(
        function (result) {
          console.log("ID: " + uploadName + " -- Success.");
        },
        function (err) { // Error
          console.log("Image upload Error: " + JSON.stringify(err));
        },
        function (progress) { });
    };
  });
