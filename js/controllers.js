/* global angular */
/* global console */
angular
  .module("starter.controllers", [])
  .controller("AppCtrl", function ($rootScope, $scope, $mdDialog, $ionicSideMenuDelegate, $ionicModal, $timeout, $localStorage, $http, $cordovaMedia, $cordovaNetwork, UserProfileService, LocalCacheService) {
    $scope.$on("$ionicView.enter", function (e) {
      $scope.itemNormalFontSize = GlobalVariable.Appearance.itemNormalFontSize;
      $scope.itemNormalPicSize = GlobalVariable.Appearance.itemNormalPicSize;
      $scope.ImagePath = GlobalVariable.LocalCacheDirectory() + "images/";
      $scope.AudioPath = GlobalVariable.LocalCacheDirectory() + "audio/";
      $scope.userProfile = UserProfileService.getLatest();
      $scope.menuProfile = UserProfileService.getMenuProfile();
      $scope.currentDisplayLanguage = $scope.userProfile.DISPLAY_LANGUAGE;
      if (typeof $rootScope.isShowDisplayName == 'undefined') {
        $rootScope.isShowDisplayName = { checked: true };
      }
      console.log("Language Selected:" + $scope.currentDisplayLanguage + "/" + $scope.userProfile.SPEECH_LANGUAGE_CODE + "/" + $scope.userProfile.SPEECH_GENDER);
      if (window.localStorage.getItem("loggedIn") != 1) {
        if ($cordovaNetwork.isOffline()) {
          alert("Please connect to the Internet for app initilization.");
          return;
        } else {
          window.localStorage.setItem("loggedIn", 1);
          console.log("First run: initialization");
          GlobalVariable.DownloadProgress.Reset();
          LoadingDialog.showLoadingPopup($mdDialog, $ionicSideMenuDelegate);
          LocalCacheService.prepareCache($scope.userProfile);
        }
      }
    });
    $scope.onCategoryClicked = function (categoryId) {
      var src = GlobalVariable.GetLocalAudioDirectory($scope.userProfile) + categoryId + ".mp3";
      MediaPlayer.play($cordovaMedia, src);
    };
  })
  .controller("CategoryCtrl", function ($scope, $stateParams, $mdDialog, $cordovaMedia, UserProfileService, $http) {
    $scope.subMenuPage = UserProfileService.getMenuProfileSubObject("CategoryGrid");
    $scope.textButtonShare = UserProfileService.getTranslatedObjectText($scope.subMenuPage.SubPage, "ShareButton", $scope.currentDisplayLanguage);
    $scope.textButtonSetTop = UserProfileService.getTranslatedObjectText($scope.subMenuPage.SubPage, "SetTopButton", $scope.currentDisplayLanguage);
    $scope.textShareWarning = UserProfileService.getTranslatedObjectText($scope.subMenuPage.SubPage, "ShareWarning1", $scope.currentDisplayLanguage) + "? " + UserProfileService.getTranslatedObjectText($scope.subMenuPage.SubPage, "ShareWarning2", $scope.currentDisplayLanguage);
    $scope.textSetTopWarning = UserProfileService.getTranslatedObjectText($scope.subMenuPage.SubPage, "SetTopWarning", $scope.currentDisplayLanguage) + "?";
    $scope.textSuccessAlert = UserProfileService.getTranslatedObjectText($scope.subMenuPage.SubPage, "SuccessAlert", $scope.currentDisplayLanguage);
    $scope.subGeneral = UserProfileService.getMenuProfileSubObject("General");
    $scope.textButtonOK = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "ConfirmButton", $scope.currentDisplayLanguage);
    $scope.textButtonCancel = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "CancelButton", $scope.currentDisplayLanguage);
    $scope.textNotification = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "Notification", $scope.currentDisplayLanguage);
    $scope.categoryId = $stateParams.categoryId;
    for (var i = 0; i < $scope.userProfile.Categories.length; i++) {
      if ($scope.userProfile.Categories[i].ID == $stateParams.categoryId) {
        $scope.category = $scope.userProfile.Categories[i];
        for (var i = 0; i < $scope.category.DisplayMultipleLanguage.length; i++) {
          translation = $scope.category.DisplayMultipleLanguage[i];
          if (translation.Language == $scope.currentDisplayLanguage) {
            $scope.categoryDisplayName = translation.Text;
          }
        }
        break;
      }
    }
    $scope.showEnlargeItemPopup = function (ev, itemId) {
      targetItem = getItemObjectByItemId($scope.userProfile, itemId);
      var targetScope = $scope.$new();
      targetScope.selectedItemId = targetItem.ID;
      targetScope.selectedItemName = targetItem.DisplayName;
      for (var i = 0; i < targetItem.DisplayMultipleLanguage.length; i++) {
        translation = targetItem.DisplayMultipleLanguage[i];
        if (translation.Language == $scope.currentDisplayLanguage) {
          targetScope.selectedItemName = translation.Text;
        }
      }
      targetScope.ImagePath = $scope.ImagePath;
      targetScope.AudioDirectory = GlobalVariable.GetLocalAudioDirectory($scope.userProfile)
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
      });
    };
    $scope.shareCategory = function (event, categoryID) {
      var confirmDialog = $mdDialog.confirm()
        .title($scope.textNotification)
        .textContent($scope.textShareWarning)
        .targetEvent(event)
        .ok($scope.textButtonOK)
        .cancel($scope.textButtonCancel);

      $mdDialog.show(confirmDialog).then(function () {
        console.log("Shared Category ID: " + ServerPathVariable.GetUploadSharePath(categoryID));
        $http.get(ServerPathVariable.GetUploadSharePath(categoryID)).then(function (data) {
          console.log("Success");
          alert($scope.textSuccessAlert);
        });
      }, function () {
        console.log("User decide to quit share");
      });
    };
    $scope.reorderAddTopCategory = function (event, categoryID) {
      var confirmDialog = $mdDialog.confirm()
        .title($scope.textNotification)
        .textContent($scope.textSetTopWarning)
        .targetEvent(event)
        .ok($scope.textButtonOK)
        .cancel($scope.textButtonCancel);

      $mdDialog.show(confirmDialog).then(function () {
        newUserProfile = UserProfileService.setTargetCategoryTop($scope.userProfile, $scope.categoryId);
        UserProfileService.saveLocal(newUserProfile);
        UserProfileService.postToServerCallback(function () {
          console.log("Post to Server After Reorder");
        });
      }, function () {
        console.log("User decide to quit share");
      });
    };
    function DialogController($scope, $mdDialog, $cordovaMedia, $cordovaFileTransfer) {
      $scope.cancel = function () {
        $mdDialog.cancel();
      };
      $scope.onItemClicked = function (ev) {
        var src = $scope.AudioDirectory + $scope.selectedItemId + ".mp3";
        MediaPlayer.play($cordovaMedia, src);
      };
      $scope.reorderAddTopItem = function (ev) {
        newUserProfile = UserProfileService.setTargetItemTop($scope.userProfile, $scope.categoryId, $scope.selectedItemId);
        UserProfileService.saveLocal(newUserProfile);
        UserProfileService.postToServerCallback(function () {
          console.log("Post to Server After Reorder");
        });
      }
    }
  })
  .controller("SettingCtrl", function ($scope, $mdDialog, $ionicSideMenuDelegate, $state, $location, $cordovaNetwork, UserProfileService, LocalCacheService) {
    $scope.displayLanguageList = GlobalVariable.DisplayLanguageList;
    $scope.speechLanguageList = GlobalVariable.SpeechLanguageList;
    $scope.genderList = GlobalVariable.GenderList;
    $scope.selectedDisplayLanguage;
    $scope.selectedSpeechLanguage;
    $scope.selectedSpeechGender;
    $scope.Title = UserProfileService.getTranslatedMenuText("Operations", "Setting", $scope.currentDisplayLanguage);
    $scope.subGeneral = UserProfileService.getMenuProfileSubObject("General");
    $scope.textButtonConfirm = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "ConfirmButton", $scope.currentDisplayLanguage);
    $scope.subMenuProfile = UserProfileService.getMenuProfileSubObject("Setting");
    $scope.textLanguage = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "LanguageSetting", $scope.currentDisplayLanguage);
    $scope.textDisplayLanguage = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "DisplayLanguage", $scope.currentDisplayLanguage);
    $scope.textSpeechLanguage = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "SpeechLanguage", $scope.currentDisplayLanguage);
    $scope.textSpeechGender = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "SpeakerGender", $scope.currentDisplayLanguage);
    $scope.textAppearance = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "Appearance", $scope.currentDisplayLanguage);
    $scope.textFontSize = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "FontSize", $scope.currentDisplayLanguage);
    $scope.textPicSize = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "PicSize", $scope.currentDisplayLanguage);
    $scope.textExample = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "Example", $scope.currentDisplayLanguage);
    $scope.textResetApp = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "ResetApp", $scope.currentDisplayLanguage);
    $scope.textResetConfirm = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "ResetConfirm", $scope.currentDisplayLanguage);
    $scope.textResetConfirmWarning = $scope.textResetConfirm + "?" + UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "ResetConfirmWarning", $scope.currentDisplayLanguage);
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
          GlobalVariable.DownloadProgress.Reset();
          LocalCacheService.prepareCache(UserProfileService.getLatest());
        });
      });
    }
  })
  .controller("AddCategoryCtrl", function ($scope, $cordovaCamera, $cordovaFileTransfer, $mdDialog, $http, $ionicSideMenuDelegate, $cordovaNetwork, $ionicHistory, UserProfileService, LocalCacheService) {
    $scope.Title = UserProfileService.getTranslatedMenuText("Operations", "AddCategory", $scope.currentDisplayLanguage);
    $scope.subGeneral = UserProfileService.getMenuProfileSubObject("General");
    $scope.textCategoryName = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "CategoryName", $scope.currentDisplayLanguage);
    $scope.textLanguage = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "TargetLanguage", $scope.currentDisplayLanguage);
    $scope.textCameraImage = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "CameraImage", $scope.currentDisplayLanguage);
    $scope.textAlbumImage = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "AlbumImage", $scope.currentDisplayLanguage);
    $scope.textButtonConfirm = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "ConfirmButton", $scope.currentDisplayLanguage);
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
      }else if (typeof $scope.categoryName == "undefined" || $scope.categoryName == "") {
        alert("Please input category name!");
        return;
      }else if (typeof $scope.inputLanguage == "undefined" || $scope.inputLanguage == "") {
        alert("Please input language");
        return;
      }else if (typeof document.getElementById("myImage").src == "undefined" || document.getElementById("myImage").src == "") {
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
    $scope.categories = $scope.userProfile.Categories;
    $scope.Title = UserProfileService.getTranslatedMenuText("Operations", "DeleteCategory", $scope.currentDisplayLanguage);
    $scope.subGeneral = UserProfileService.getMenuProfileSubObject("General");
    $scope.textCategoryName = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "CategoryName", $scope.currentDisplayLanguage);
    $scope.textButtonConfirm = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "ConfirmButton", $scope.currentDisplayLanguage);
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
    $scope.categories = $scope.userProfile.Categories;
    $scope.Title = UserProfileService.getTranslatedMenuText("Operations", "AddItem", $scope.currentDisplayLanguage);
    $scope.subGeneral = UserProfileService.getMenuProfileSubObject("General");
    $scope.textCategoryName = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "CategoryName", $scope.currentDisplayLanguage);
    $scope.textItemName = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "ItemName", $scope.currentDisplayLanguage);
    $scope.textLanguage = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "TargetLanguage", $scope.currentDisplayLanguage);
    $scope.textCameraImage = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "CameraImage", $scope.currentDisplayLanguage);
    $scope.textAlbumImage = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "AlbumImage", $scope.currentDisplayLanguage);
    $scope.textButtonConfirm = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "ConfirmButton", $scope.currentDisplayLanguage);
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
        var categoryIndex = getCategoryIndexById(UserProfileService.getLatest(), selectedCategoryId);
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
    $scope.categories = $scope.userProfile.Categories;
    $scope.Title = UserProfileService.getTranslatedMenuText("Operations", "DeleteItem", $scope.currentDisplayLanguage);
    $scope.subGeneral = UserProfileService.getMenuProfileSubObject("General");
    $scope.textCategoryName = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "CategoryName", $scope.currentDisplayLanguage);
    $scope.textItemName = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "ItemName", $scope.currentDisplayLanguage);
    $scope.textButtonConfirm = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "ConfirmButton", $scope.currentDisplayLanguage);

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
  .controller("SentenceCtrl", function ($scope, $http, UserProfileService, $mdDialog, $ionicSideMenuDelegate) { //For Construct Sentence
    $scope.sentences = $scope.userProfile.Sentences;
    $scope.currentConstructSentence = GlobalVariable.currentConstructSentence;
    $scope.inputAdd = "";
    $scope.Title = UserProfileService.getTranslatedMenuText("Operations", "Sentence", $scope.currentDisplayLanguage);
    $scope.subGeneral = UserProfileService.getMenuProfileSubObject("Sentence");
    $scope.textAddSentence = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "AddSentence", $scope.currentDisplayLanguage);
    $scope.textAdd = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "Add", $scope.currentDisplayLanguage);
    $scope.textInputAdd = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "InputAdd", $scope.currentDisplayLanguage);
    $scope.textSelectAdd = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "SelectAdd", $scope.currentDisplayLanguage);
    $scope.textButtonBackspace = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "BackSpace", $scope.currentDisplayLanguage);
    $scope.textButtonUpload = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "UploadSentence", $scope.currentDisplayLanguage);
    $scope.onSentenceCheck = function (sentenceID) {
      alert(sentenceID);
    };
    $scope.sentenceAdd = function () {
      $scope.currentConstructSentence = $scope.currentConstructSentence + $scope.inputAdd;
      GlobalVariable.currentConstructSentence = $scope.currentConstructSentence;
    };
    $scope.sentenceBackSpace = function () {
      if ($scope.currentConstructSentence != "") {
        $scope.currentConstructSentence = $scope.currentConstructSentence.substring(0, $scope.currentConstructSentence.length - 1);
        GlobalVariable.currentConstructSentence = $scope.currentConstructSentence;
      }
    };
    $scope.onCategoryClickPopup = function (categoryID, ev) {
      var targetScope = $scope.$new();
      targetScope.selectedCategory = "";
      targetScope.ImagePath = $scope.ImagePath;
      targetScope.DisplayLanguage = $scope.currentDisplayLanguage;
      for (i = 0; i < $scope.userProfile.Categories.length; i++) {
        if ($scope.userProfile.Categories[i].ID == categoryID) {
          targetScope.selectedCategory = $scope.userProfile.Categories[i];
        }
      }
      $mdDialog.show({
        controller: SentenceDialogController,
        templateUrl: "templates/popup-sentence-item.tmpl.html",
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        scope: targetScope,
        fullscreen: false
      }).then(function (targetText) {
        //Ok: Do nothing
      }, function (targetText) {
          if (targetText != undefined) {
            $scope.currentConstructSentence = $scope.currentConstructSentence + targetText;
            GlobalVariable.currentConstructSentence = $scope.currentConstructSentence;
          }
        });
    };
    $scope.upLoadSentence = function(){
      alert($scope.currentConstructSentence);
    };
    function SentenceDialogController($scope, $mdDialog, $cordovaMedia) {
      $scope.cancel = function () {
        $mdDialog.cancel("");
      };
      for (var i = 0; i < $scope.selectedCategory.DisplayMultipleLanguage.length; i++) {
        translation = $scope.selectedCategory.DisplayMultipleLanguage[i];
        if (translation.Language == $scope.DisplayLanguage) {
          $scope.categoryName = translation.Text;
        }
      }
      $scope.onAddToSentence = function (itemID) {
        var targetText = "Default";
        for (var i = 0; i < $scope.selectedCategory.Items.length; i++) {
          if ($scope.selectedCategory.Items[i].ID == itemID) {
            for (var j = 0; j < $scope.selectedCategory.Items[i].DisplayMultipleLanguage.length; j++) {
              translation = $scope.selectedCategory.Items[i].DisplayMultipleLanguage[j];
              if (translation.Language == $scope.DisplayLanguage) {
                targetText = translation.Text;
              }
            }
          }
        }
        $mdDialog.cancel(targetText);
      };
    }
  })
  .controller("SearchCtrl", function ($scope, UserProfileService, $http, $cordovaMedia, $cordovaFileTransfer, VoiceRecordService){
    $scope.Title = UserProfileService.getTranslatedMenuText("Operations", "Search", $scope.currentDisplayLanguage);
    $scope.subMenuProfile = UserProfileService.getMenuProfileSubObject("UserInformation");
    $scope.DisplayLanguageList = GlobalVariable.DisplayLanguageList;
    $scope.textDisplayLanguage = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "DisplayLanguage", $scope.currentDisplayLanguage);
    $scope.isShowResult = true;
    $scope.isRecorded = false;
    $scope.resultWords = ["22", "33", "44", "55"];
    $scope.maxResultWordsDisplay = 3;
    $scope.textStart = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "Start", $scope.currentDisplayLanguage);
    $scope.textStop = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "Stop", $scope.currentDisplayLanguage);
    $scope.textCheck = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "Check", $scope.currentDisplayLanguage);
    $scope.textUpload = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "Upload", $scope.currentDisplayLanguage);
    $scope.textRecordState = $scope.textStart;

    if (window.cordova && window.cordova.file && window.audioinput) {
      console.log("Use 'Start Capture' to begin...");
      window.addEventListener('audioinput', VoiceRecordService.onAudioInputCapture, false);
      window.addEventListener('audioinputerror', VoiceRecordService.onAudioInputError, false);
    }
    $scope.checkRecord = function () {
      VoiceRecordService.checkRecord();
    };
    $scope.uploadRecord = function () {
      VoiceRecordService.uploadRecordSearch();
    };
    $scope.searchRecording = function (ev) {
      if ($scope.textRecordState == $scope.textStart) {
        $scope.isRecorded = false;
        $scope.textRecordState = $scope.textStop;
        VoiceRecordService.startCapture();
      }
      else if ($scope.textRecordState == $scope.textStop) {
        $scope.textRecordState = $scope.textStart;
        VoiceRecordService.stopCapture("searchTemp");
        $scope.isRecorded = true;
      }
    };
  })
  .controller("ShareCtrl", function ($scope, UserProfileService, ShareCategoryService, LocalCacheService, $mdDialog, $ionicSideMenuDelegate, $http) { //Share Ctrl, for user downloading
    $scope.shareCategory = ShareCategoryService.getShareCategory();
    $scope.Title = UserProfileService.getTranslatedMenuText("Operations", "Download", $scope.currentDisplayLanguage);
    $scope.subGeneral = UserProfileService.getMenuProfileSubObject("General");
    $scope.textButtonGet = UserProfileService.getTranslatedObjectText($scope.subGeneral.SubPage, "GetButton", $scope.currentDisplayLanguage);
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
            if (targetCategory.DisplayMultipleLanguage[j].Language == $scope.currentDisplayLanguage) {
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
      });;
    };
    function viewShareController($scope, $mdDialog, $ionicSideMenuDelegate, $http) {
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
  .controller("UserInfoCtrl", function ($scope, $cordovaFileTransfer,$cordovaMedia,$mdDialog,UserProfileService,VoiceRecordService){
    $scope.DisplayLanguageList = GlobalVariable.DisplayLanguageList;
    $scope.SpeechLanguageList = GlobalVariable.SpeechLanguageList;
    $scope.GenderList = GlobalVariable.GenderList;
    $scope.collectedVoice = 0;
    $scope.totalVoice = 160;
    $scope.Title = UserProfileService.getTranslatedMenuText("Operations", "UserInformation", $scope.currentDisplayLanguage);
    $scope.subMenuProfile = UserProfileService.getMenuProfileSubObject("UserInformation");
    $scope.VoiceConversion = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "VoiceConversion", $scope.currentDisplayLanguage);
    $scope.UserID = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "UserID", $scope.currentDisplayLanguage);
    $scope.DisplayLanguage = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "DisplayLanguage", $scope.currentDisplayLanguage);
    $scope.SpeechLanguage = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "SpeechLanguage", $scope.currentDisplayLanguage);
    $scope.SpeakerGender = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "SpeakerGender", $scope.currentDisplayLanguage);
    $scope.CollectionProgress = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "CollectionProgress", $scope.currentDisplayLanguage);
    $scope.AudioRecording = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "AudioRecording", $scope.currentDisplayLanguage);
    $scope.SynchronizeProgress = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "SynchronizeProgress", $scope.currentDisplayLanguage);
    $scope.Recording = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "Recording", $scope.currentDisplayLanguage);
    $scope.Confirm = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "Confirm", $scope.currentDisplayLanguage);
    $scope.vcRecording = function (ev) {
        var targetScope = $scope.$new();
        targetScope.Recording = $scope.Recording;
        targetScope.Start = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "Start", $scope.currentDisplayLanguage);
        targetScope.Stop = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "Stop", $scope.currentDisplayLanguage);
        targetScope.Check = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "Check", $scope.currentDisplayLanguage);
        targetScope.Upload = UserProfileService.getTranslatedObjectText($scope.subMenuProfile.SubPage, "Upload", $scope.currentDisplayLanguage);
        $mdDialog.show({
          controller: DialogController,
          templateUrl: "templates/popup-vc.tmpl.html",
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: true,
          scope: targetScope,
          fullscreen: false // Only for -xs, -sm breakpoints.
        });
        function DialogController($scope, $mdDialog) {
          $scope.cancel = function () { $mdDialog.cancel(); };
          $scope.checkStart = false;
          $scope.checkStop = true;
          $scope.checkStatus = true;
          $scope.gifDisplay = false;
          if (window.cordova && window.cordova.file && window.audioinput) {
              console.log("Use 'Start Capture' to begin...");
              window.addEventListener('audioinput', VoiceRecordService.onAudioInputCapture, false);
              window.addEventListener('audioinputerror', VoiceRecordService.onAudioInputError, false);
          }
          else {
              console.log("Missing: cordova-plugin-file or cordova-plugin-audioinput!");
          }
          var id = $scope.userProfile.ID;
          $scope.start = function () { VoiceRecordService.startCapture(); $scope.checkStart = true;$scope.checkStop = false;$scope.gifDisplay = true;};
          $scope.stop = function () { VoiceRecordService.stopCapture(id); $scope.checkStart = false;$scope.checkStop = true;$scope.checkStatus = false;$scope.gifDisplay = false;};
          $scope.check = function () { VoiceRecordService.checkRecord(); }
          $scope.upload = function () { VoiceRecordService.uploadRecordVC(); }
        }
    };
    $scope.synchronizeStart = function () {};
  })
  .controller("TestCtrl", function ($scope,$cordovaFileTransfer,$cordovaMedia,$mdDialog, UserProfileService) { //Test Ctrl, for logging
    var targetDirectory = GlobalVariable.LocalCacheDirectory() + "images/";
    var imageID = "00000000-0000-0000-0003-000000000197";
    var uploadID = "00000000-0000-0000-0000-000000000012";
    var uploadName = uploadID + ".jpg";
    var path;
    $scope.ImagePath = targetDirectory + imageID + ".jpg";
    $scope.recordClick = function (ev) {};
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
