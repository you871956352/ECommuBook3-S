/* global angular */
/* global console */
angular
  .module("starter.controllers", [])
  .controller("AppCtrl", function ($rootScope, $scope, $mdDialog, $ionicSideMenuDelegate, $localStorage, $cordovaMedia, $cordovaNetwork, UserProfileService, LocalCacheService, AppearanceService, LogService) {
    $scope.$on("$ionicView.enter", function (e) {
      $scope.appearanceConfig = AppearanceService.getLatest();
      $scope.itemNormalFontSize = $scope.appearanceConfig.itemNormalFontSize;
      $scope.itemNormalPicSize = $scope.appearanceConfig.itemNormalPicSize;
      $scope.itemNormalPicWidth = $scope.appearanceConfig.itemNormalPicWidth;
      $scope.ImagePath = GlobalVariable.LocalCacheDirectory() + "images/";
      $scope.AudioPath = GlobalVariable.LocalCacheDirectory() + "audio/";
      $scope.userProfile = UserProfileService.getLatest();
      $scope.menuProfile = UserProfileService.getMenuProfile();
      $scope.currentDisplayLanguage = $scope.userProfile.DISPLAY_LANGUAGE;
      $scope.subMenuProfileGeneral = UserProfileService.getMenuProfileSubObjectWithInputLanguage("General", $scope.currentDisplayLanguage);
      $scope.menuProfileTitle = UserProfileService.getMenuProfileOperation($scope.currentDisplayLanguage);
      if (typeof $rootScope.isShowDisplayName == 'undefined') {
        $rootScope.isShowDisplayName = { checked: true };
      }
      if (typeof $rootScope.testMode == 'undefined') {
        $rootScope.testMode = { checked: false };
      }
    });
    if (window.localStorage.getItem("loggedIn") != 1) {
      if ($cordovaNetwork.isOffline()) {
        alert($scope.subMenuProfileGeneral.NetworkWarning);
        return;
      }
      else {
        window.localStorage.setItem("loggedIn", 1);
        LocalCacheService.clearAllCache();
        GlobalVariable.DownloadProgress.Reset();
        LoadingDialog.showLoadingPopup($mdDialog, $ionicSideMenuDelegate);
        var userProfile = UserProfileService.getDefault();
        userProfile.ID = UtilityFunction.guid();
        UserProfileService.saveLocal(userProfile);
        UserProfileService.postToServerCallback(function () {
          UserProfileService.cloneItem(userProfile.ID, function () {
            console.log('Init: reset userProfile and uploaded. UserID: ' + userProfile.ID);
            LocalCacheService.prepareCache(UserProfileService.getLatest(),function () {
              $ionicSideMenuDelegate.toggleLeft();
            });
          });
        });
      }
    }
    LogService.postLog();
    $scope.onCategoryClicked = function (categoryId) {
      MediaPlayer.play($cordovaMedia, GlobalVariable.GetLocalAudioDirectory($scope.userProfile) + categoryId + ".mp3");
      LogService.generateLog("view", "category", categoryId);
    };
  })
  .controller("CategoryCtrl", function ($scope, LogService, $stateParams, $state, $mdDialog, $ionicSideMenuDelegate, $cordovaMedia, UserProfileService, $http, LocalCacheService, $cordovaNetwork) {
    $scope.userProfile = UserProfileService.getLatest();
    $scope.subMenuProfileObject = UserProfileService.getMenuProfileSubObjectWithInputLanguage("CategoryGrid", $scope.currentDisplayLanguage);
    $scope.categoryId = $stateParams.categoryId;
    $scope.btnFont = parseInt(window.screen.width / 30);
    console.log("Bottom button font size: "+ $scope.btnFont);
    for (var i = 0; i < $scope.userProfile.Categories.length; i++) {
      if ($scope.userProfile.Categories[i].ID == $stateParams.categoryId) {
        $scope.category = $scope.userProfile.Categories[i];
        $scope.categoryDisplayName = UtilityFunction.getObjectTranslation($scope.category, $scope.currentDisplayLanguage);
        break;
      }
    }
    $scope.shareCategory = function (event, categoryID) {
      var confirmDialog = $mdDialog.confirm()
        .title($scope.subMenuProfileGeneral.Notification)
        .textContent($scope.subMenuProfileObject.ShareWarning1 + "? " + $scope.subMenuProfileObject.ShareWarning2)
        .targetEvent(event)
        .ok($scope.subMenuProfileGeneral.ConfirmButton)
        .cancel($scope.subMenuProfileGeneral.CancelButton);
      $mdDialog.show(confirmDialog).then(function () {
        LogService.generateLog("share", "category", categoryID);
        $http.get(ServerPathVariable.GetUploadSharePath(categoryID)).then(function (data) {
          alert($scope.subMenuProfileObject.SuccessAlert);
        });
      });
    };
    $scope.reorderAddTopCategory = function (event, categoryID) {
      var confirmDialog = $mdDialog.confirm()
        .title($scope.subMenuProfileGeneral.Notification)
        .textContent($scope.subMenuProfileObject.SetTopWarning + "?")
        .targetEvent(event)
        .ok($scope.subMenuProfileGeneral.ConfirmButton)
        .cancel($scope.subMenuProfileGeneral.CancelButton);
      $mdDialog.show(confirmDialog).then(function () {
        LogService.generateLog("reorder", "category", $scope.categoryId);
        var newUserProfile = UserProfileService.setTargetCategoryTop($scope.userProfile, $scope.categoryId);
        UserProfileService.saveLocal(newUserProfile);
        UserProfileService.postToServerCallback(function () {
          console.log("Post to Server After Reorder Category Success");
        });
      });
    };
    $scope.deleteThisCategory = function (event, categoryID) {
      var confirmDialog = $mdDialog.confirm()
        .title($scope.subMenuProfileGeneral.Notification)
        .textContent($scope.subMenuProfileObject.DeleteWarning1 + "?")
        .targetEvent(event)
        .ok($scope.subMenuProfileGeneral.ConfirmButton)
        .cancel($scope.subMenuProfileGeneral.CancelButton);
      $mdDialog.show(confirmDialog).then(function () {
        LogService.generateLog("delete", "category", categoryID);
        var returnObject = UserProfileService.deleteCategory($scope.userProfile, categoryID);
        var newUserProfile = returnObject.UserProfile;
        var idList = returnObject.idList;
        GlobalCacheVariable.DeleteCheck.Reset();
        GlobalCacheVariable.DeleteCheck.SetFileToDelete(idList.length * 2);
        LoadingDialog.showLoadingPopup($mdDialog, $ionicSideMenuDelegate, true);
        $scope.userProfile = newUserProfile;
        UserProfileService.saveLocal($scope.userProfile);
        UserProfileService.postToServerCallback(function () {
          for (i = 0; i < idList.length; i++) {
            LocalCacheService.deleteCache($scope.userProfile, idList[i]);
          }
          LocalCacheService.checkDelete(true);
        });
      });
    };
    $scope.showEnlargeItemPopup = function (ev, itemId) {
      LogService.generateLog("view", "item", itemId);
      var targetScope = $scope.$new();
      targetScope.selectItemObject = UtilityFunction.getObjectById($scope.userProfile, itemId);
      targetScope.displayLanguageList = GlobalVariable.DisplayLanguageList;
      targetScope.selectedDisplayLanguage = $scope.currentDisplayLanguage;
      targetScope.selectedItemName = UtilityFunction.getObjectTranslation(targetScope.selectItemObject, $scope.currentDisplayLanguage);
      targetScope.AudioDirectory = GlobalVariable.GetLocalAudioDirectory($scope.userProfile);
      MediaPlayer.play($cordovaMedia, targetScope.AudioDirectory + targetScope.selectItemObject.ID + ".mp3");
      $mdDialog.show({
        controller: DialogController,
        templateUrl: "templates/popup-item.tmpl.html",
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        scope: targetScope,
        fullscreen: false
      });
    };
    if(GlobalVariable.searchPopup.isSearch){
      $scope.showEnlargeItemPopup( undefined,GlobalVariable.searchPopup.popupID);
      GlobalVariable.searchPopup.isSearch = false;
    }
    function DialogController($scope, $mdDialog, $cordovaMedia, $http, $ionicSideMenuDelegate, $cordovaFileTransfer, $cordovaFile, UserProfileService) {
      $scope.enableEdit = false;
      $scope.cancel = function () {
        $mdDialog.cancel();
      };
      $scope.onItemClicked = function (ev) {
        MediaPlayer.play($cordovaMedia, $scope.AudioDirectory + $scope.selectItemObject.ID + ".mp3");
      };
      $scope.reorderAddTopItem = function (ev) {
        LogService.generateLog("reorder", "item", $scope.selectItemObject.ID);
        var newUserProfile = UserProfileService.setTargetItemTop($scope.userProfile, $scope.categoryId, $scope.selectItemObject.ID);
        UserProfileService.saveLocal(newUserProfile);
        UserProfileService.postToServerCallback(function () {
          console.log("Post to Server After Reorder Item Success");
        });
        $mdDialog.cancel();
      };
      $scope.deleteThisItem = function (categoryID, itemID) {
        var confirmDialog = $mdDialog.confirm()
          .title($scope.subMenuProfileGeneral.Notification)
          .textContent($scope.subMenuProfileObject.DeleteItemWarning1 + "? " + $scope.subMenuProfileObject.DeleteItemWarning2)
          .targetEvent(event)
          .ok($scope.subMenuProfileGeneral.ConfirmButton)
          .cancel($scope.subMenuProfileGeneral.CancelButton);
        $mdDialog.show(confirmDialog).then(function () {
          LogService.generateLog("delete", "item", itemID);
          var newUserProfile = UserProfileService.deleteItem($scope.userProfile, categoryID, itemID);
          GlobalCacheVariable.DeleteCheck.Reset();
          GlobalCacheVariable.DeleteCheck.SetFileToDelete(2);
          LoadingDialog.showLoadingPopup($mdDialog, $ionicSideMenuDelegate, true);
          $scope.userProfile = newUserProfile;
          UserProfileService.saveLocal($scope.userProfile);
          UserProfileService.postToServerCallback(function () {
            LocalCacheService.deleteCache($scope.userProfile, itemID);
            LocalCacheService.checkDelete(false);
          });
        });
      }
      $scope.popupLanguageChange = function () {
        LogService.generateLog("changeLanguage", "item", $scope.selectItemObject.ID);
        $scope.selectedItemName = UtilityFunction.getObjectTranslation($scope.selectItemObject, $scope.selectedDisplayLanguage);
        if ($scope.selectedDisplayLanguage == $scope.currentDisplayLanguage) {
          $scope.AudioDirectory = GlobalVariable.GetLocalAudioDirectory($scope.userProfile);
        }
        else {
          $scope.AudioDirectory = GlobalVariable.GetLocalAudioDirectoryByDisplayLanguage($scope.selectedDisplayLanguage);
          $scope.DefaultSpeakerObject = GlobalVariable.GetDefaultSpeakerForDisplayLanguage($scope.selectedDisplayLanguage);
          var targetDirectory = GlobalVariable.LocalCacheDirectory();
          LocalCacheService.downloadAudioToLocal(targetDirectory, "bing", $scope.DefaultSpeakerObject.targetSpeechLanguage, $scope.DefaultSpeakerObject.targetSpeechGender, $scope.selectedItemName, $scope.selectItemObject.ID);
        }
      };
      $scope.editText = function () {
        if ($scope.EditNewText == undefined || $scope.EditNewText == "") {
          alert($scope.subMenuProfileObject.EditWarning);
        }
        else {
          var returnObject = UserProfileService.editTargetItem($scope.userProfile, $scope.categoryId, $scope.selectItemObject.ID, $scope.selectedDisplayLanguage, $scope.EditNewText);
          var newUserProfile = returnObject.UserProfile;
          LogService.generateLog("edit", "item", $scope.selectItemObject.ID);
          if (returnObject.Type == "DisplayName") {
            GlobalVariable.DownloadProgress.Reset();
            LoadingDialog.showLoadingPopup($mdDialog, $ionicSideMenuDelegate);
            LocalCacheService.deleteLocalAudioAllLanguage($scope.userProfile, $scope.selectItemObject.ID);
            UserProfileService.saveLocal(newUserProfile);
            UserProfileService.postToServerCallback(function () {
              UserProfileService.getOnline(newUserProfile.ID, function () {
                LocalCacheService.prepareCache(UserProfileService.getLatest());
              });
            });
          }
          else if (returnObject.Type == "MultiLanguage") {
            GlobalVariable.DownloadProgress.Reset();
            LoadingDialog.showLoadingPopup($mdDialog, $ionicSideMenuDelegate);
            var speakerObject = GlobalVariable.GetDefaultSpeakerForDisplayLanguage($scope.selectedDisplayLanguage)
            var targetName = "bing" + "/" + speakerObject.targetSpeechLanguage + "/" + speakerObject.targetSpeechGender + "/" + $scope.selectItemObject.ID + ".mp3";
            $cordovaFile.removeFile(GlobalVariable.LocalCacheDirectory() + "audio/", targetName);
            var editItem = { "userID": $scope.userProfile.ID, "targetID": $scope.selectItemObject.ID, "targetLanguage": $scope.selectedDisplayLanguage, "revisedText": $scope.EditNewText };
            $http.post(ServerPathVariable.PostUserEditPath(), editItem)
              .then(function (data) {
                console.log("Post User Edit  to server Success");
                LocalCacheService.prepareCache(UserProfileService.getLatest());
              });
          }

        }
      };
      $scope.enableEditTog = function () {
        $scope.enableEdit = !$scope.enableEdit;
      };
    };
    $scope.addItemButtonClick = function (ev) {
      var targetScope = $scope.$new();
      targetScope.selectedCategoryId = $scope.categoryId;
      targetScope.selectedCategoryName = $scope.categoryDisplayName;
      $mdDialog.show({
        controller: AddItemController,
        templateUrl: "templates/addItem.tmpl.html",
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: false,
        scope: targetScope,
        fullscreen: false
      });
    };
    function AddItemController($scope, $cordovaCamera, $cordovaFileTransfer, $mdDialog, $http, $ionicSideMenuDelegate, $cordovaNetwork, UserProfileService, LocalCacheService) {
      $scope.categories = $scope.userProfile.Categories;
      $scope.uuid = UtilityFunction.guid();
      $scope.inputLanguage = $scope.currentDisplayLanguage;
      $scope.inputLanguageList = GlobalVariable.DisplayLanguageList;
      $scope.cancel = function () {
        $mdDialog.cancel();
      };
      $scope.onAddItemConfirmClicked = function () {
        if ($cordovaNetwork.isOffline()) {
          alert($scope.subMenuProfileGeneral.NetworkWarning);
          return;
        }
        if (typeof $scope.itemName == "undefined" || $scope.itemName == "") {
          alert($scope.subMenuProfileGeneral.LanguageWarning);
          return;
        }
        if (typeof document.getElementById("myImage").src == "undefined" || document.getElementById("myImage").src == "") {
          alert($scope.subMenuProfileGeneral.ImageWaring);
          return;
        }
        LogService.generateLog("add", "item", $scope.uuid);
        GlobalVariable.DownloadProgress.Reset();
        LoadingDialog.showLoadingPopup($mdDialog, $ionicSideMenuDelegate);
        var userProfile = UserProfileService.getLatest();
        var newItem = { ID: $scope.uuid, DisplayName: $scope.itemName, DisplayNameLanguage: $scope.inputLanguage };
        var categoryIndex = UtilityFunction.getCategoryIndexById(UserProfileService.getLatest(), $scope.selectedCategoryId);
        if (categoryIndex == -1) {
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
          options.params = { uuid: newItem.ID };
          $cordovaFileTransfer.upload(server, filePath, options).then(
            function (result) {
              var userProfile = UserProfileService.getLatest();
              UserProfileService.getOnline(userProfile.ID, function () {
                LocalCacheService.prepareCache(UserProfileService.getLatest());
                console.log("Add Item Success" + JSON.stringify(result));
              });
            }
          );
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
    };
  })
  .controller("SettingCtrl", function ($scope, LogService, $mdDialog, $ionicSideMenuDelegate, $state, $location, $cordovaNetwork, UserProfileService, LocalCacheService, VoiceModelService, AppearanceService) {
    $scope.userProfile = UserProfileService.getLatest();
    $scope.currentDisplayLanguage = $scope.userProfile.DISPLAY_LANGUAGE;
    $scope.displayLanguageList = GlobalVariable.DisplayLanguageList;
    $scope.speechLanguageList = GlobalVariable.SpeechLanguageList;
    $scope.genderList = GlobalVariable.GenderList;
    $scope.appearanceConfig = AppearanceService.getLatest();
    $scope.itemNormalFontSize = $scope.appearanceConfig.itemNormalFontSize;
    $scope.itemNormalPicSize = $scope.appearanceConfig.itemNormalPicSize;
    $scope.itemNormalPicWidth = $scope.appearanceConfig.itemNormalPicWidth;
    $scope.selectedDisplayLanguage;
    $scope.selectedSpeechLanguage;
    $scope.selectedSpeechGender;
    $scope.subMenuProfileObject = UserProfileService.getMenuProfileSubObjectWithInputLanguage("Setting", $scope.currentDisplayLanguage);
    $scope.itemNumber = parseInt(100 / $scope.itemNormalPicWidth);
    $scope.itemNormalPicLength = parseInt($scope.itemNormalPicSize / 10);
    $scope.$on("$ionicView.enter", function() {
      $ionicSideMenuDelegate.canDragContent(false);
    });
    $scope.$on('$ionicView.leave', function() {
      $ionicSideMenuDelegate.canDragContent(true);
    });
    $scope.onSelectedDisplayLanguageChanged = function () {
      $scope.speechLanguageListOption = [];
      for (var i = 0; i < $scope.speechLanguageList.length; i++) {
        var speechLanguage = $scope.speechLanguageList[i];
        if (speechLanguage.language == $scope.selectedDisplayLanguage) {
          $scope.speechLanguageListOption.push(speechLanguage);
        }
      }
    };
    $scope.onSelectedSpeechLanguageChanged = function () {
      $scope.speechGenderOptions = [];
      for (var i = 0; i < $scope.genderList.length; i++) {
        var gender = $scope.genderList[i];
        if (gender.language == $scope.selectedSpeechLanguage) {
          $scope.speechGenderOptions.push(gender);
        }
      }
    };
    $scope.onConfirmLanguageButtonClicked = function () {
      if ($cordovaNetwork.isOffline()) {
        alert($scope.subMenuProfileGeneral.NetworkWarning);
        return;
      }
      if ($scope.selectedDisplayLanguage && $scope.selectedSpeechLanguage && $scope.selectedSpeechGender) {
        LoadingDialog.showLoadingPopup($mdDialog, $ionicSideMenuDelegate);
        $scope.userProfile.DISPLAY_LANGUAGE = $scope.selectedDisplayLanguage;
        $scope.userProfile.SPEECH_LANGUAGE_CODE = $scope.selectedSpeechLanguage;
        $scope.userProfile.SPEECH_GENDER = $scope.selectedSpeechGender;
        UserProfileService.saveLocal($scope.userProfile);
        LocalCacheService.prepareCache($scope.userProfile, true);
        UserProfileService.postToServerCallback(function () {
          console.log("Post to Server when onConfirmLanguageButtonClicked ");
        });
      } else {
        alert(subMenuProfileObject.SettingLanguageAlert);
      }
    };
    $scope.onItemNormalFontSizeChanged = function () {
      $scope.appearanceConfig.itemNormalFontSize = $scope.itemNormalFontSize;
    };
    $scope.onItemNormalPicSizeChanged = function () {
      var picLength = parseInt($scope.itemNormalPicLength * 10);
      $scope.appearanceConfig.itemNormalPicSize = picLength;
    };
    $scope.onItemNormalPicWidthChanged = function () {
      $scope.itemNumber = parseInt(100 / $scope.itemNormalPicWidth);
      $scope.appearanceConfig.itemNormalPicWidth = parseInt(100 / $scope.itemNumber);
    };
    $scope.onConfirmResetUserprofileButtonClicked = function () {
      if ($cordovaNetwork.isOffline()) {
        alert($scope.subMenuProfileGeneral.NetworkWarning);
        return;
      }
      var confirmDialog = $mdDialog.confirm()
        .title($scope.subMenuProfileGeneral.Notification)
        .textContent($scope.subMenuProfileObject.ResetConfirmWarning)
        .targetEvent(event)
        .ok($scope.subMenuProfileGeneral.ConfirmButton)
        .cancel($scope.subMenuProfileGeneral.CancelButton);

      $mdDialog.show(confirmDialog).then(function () {
        LocalCacheService.clearAllCache();
        GlobalVariable.DownloadProgress.Reset();
        LoadingDialog.showLoadingPopup($mdDialog, $ionicSideMenuDelegate);
        var newID = UtilityFunction.guid();
        var userProfile = UserProfileService.getDefault();
        if ($scope.userProfile.Email != "") {
          userProfile.ID = $scope.userProfile.ID;
          userProfile.Email = $scope.userProfile.Email;
          userProfile.DisplayName = $scope.userProfile.DisplayName;
        }
        else {
          userProfile.ID = newID;
        }
        var voiceModel = VoiceModelService.getDefault(newID);
        UserProfileService.saveLocal(userProfile);
        VoiceModelService.saveLocal(voiceModel);
        VoiceModelService.postToServerCallback(voiceModel, function () {
          console.log('Setting: reset voiceModel and uploaded. UserID: ' + userProfile.ID);
          VoiceModelService.getOnline(id);
        });
        UserProfileService.postToServerCallback(function () {
          console.log('Setting: reset userProfile and uploaded. UserID: ' + userProfile.ID);
          UserProfileService.cloneItem(userProfile.ID, function () {
            LocalCacheService.prepareCache(UserProfileService.getLatest(), true);
          });
        });
      });
    }
  })
  .controller("AddCategoryCtrl", function ($scope, LogService, $cordovaCamera, $cordovaFileTransfer, $mdDialog, $http, $ionicSideMenuDelegate, $cordovaNetwork, $ionicHistory, UserProfileService, LocalCacheService) {
    $scope.userProfile = UserProfileService.getLatest();
    $scope.subMenuProfileObject = UserProfileService.getMenuProfileSubObjectWithInputLanguage("AddCategory", $scope.currentDisplayLanguage);
    $scope.uuid = UtilityFunction.guid();
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
        alert($scope.subMenuProfileGeneral.NetworkWarning);
        return;
      } else if (typeof $scope.categoryName == "undefined" || $scope.categoryName == "") {
        alert($scope.subMenuProfileGeneral.CategoryWarning);
        return;
      } else if (typeof $scope.inputLanguage == "undefined" || $scope.inputLanguage == "") {
        alert($scope.subMenuProfileGeneral.LanguageWarning);
        return;
      } else if (typeof document.getElementById("myImage").src == "undefined" || document.getElementById("myImage").src == "") {
        alert($scope.subMenuProfileGeneral.ImageWaring);
        return;
      }
      LogService.generateLog("add", "category", $scope.uuid);
      GlobalVariable.DownloadProgress.Reset();
      LoadingDialog.showLoadingPopup($mdDialog, $ionicSideMenuDelegate);
      var newCategory = {};
      newCategory.ID = $scope.uuid;
      newCategory.DisplayName = $scope.categoryName;
      newCategory.DisplayNameLanguage = $scope.inputLanguage;
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
        $cordovaFileTransfer.upload(ServerPathVariable.GetPostImagePath(), filePath, options).then(
          function (result) {
            UserProfileService.getOnline(UserProfileService.getLatest().ID, function () {
              LocalCacheService.prepareCache(UserProfileService.getLatest(),function () {
                $ionicSideMenuDelegate.toggleLeft();
              });
            });
          });
      });
    };
  })
  .controller("WelcomeCtrl", function ($scope, LogService, UserProfileService) {
    $scope.userProfile = UserProfileService.getLatest();
    $scope.footerFont = parseInt(window.screen.width / 40);
    $scope.subMenuProfileObject = UserProfileService.getMenuProfileSubObjectWithInputLanguage("Menu", $scope.currentDisplayLanguage);
  })
  .controller("SentenceCtrl", function ($scope, LogService, $http, UserProfileService, $mdDialog, $cordovaMedia, $ionicSideMenuDelegate, LocalCacheService) { //For Construct Sentence
    $scope.userProfile = UserProfileService.getLatest();
    $scope.enableEdit = false;
    $scope.currentConstructSentence = GlobalVariable.currentConstructSentence;
    $scope.data = {'inputAdd' : ""};
    $scope.btnFont = parseInt(window.screen.width / 30);
    $scope.subMenuProfileObject = UserProfileService.getMenuProfileSubObjectWithInputLanguage("Sentence", $scope.currentDisplayLanguage);
    $scope.enableEditTog = function () {
      $scope.enableEdit = !$scope.enableEdit;
    };
    $scope.onSentenceClick = function (ev, sentence) {
      MediaPlayer.play($cordovaMedia, GlobalVariable.GetLocalAudioDirectory($scope.userProfile) + sentence.ID + ".mp3");
      var targetScope = $scope.$new();
      targetScope.sentenceObject = sentence;
      targetScope.Title = UtilityFunction.getObjectTranslation(sentence, $scope.currentDisplayLanguage);
      targetScope.AudioDirectory = GlobalVariable.GetLocalAudioDirectory($scope.userProfile);
      $mdDialog.show({
        controller: SentencePopupController,
        templateUrl: "templates/popup-sentence.tmpl.html",
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        scope: targetScope,
        fullscreen: false
      }).then(function (targetText) {
        //Ok: Do nothing
      }, function (targetText) {
        if (targetText != undefined) {
          $scope.currentConstructSentence = targetText;
          GlobalVariable.currentConstructSentence = $scope.currentConstructSentence;
        }
      });
    };
    $scope.sentenceAdd = function () {
      console.log("Add sentence:" + $scope.currentConstructSentence + $scope.data.inputAdd);
      $scope.currentConstructSentence = $scope.currentConstructSentence + $scope.data.inputAdd;
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
          $scope.currentConstructSentence = $scope.currentConstructSentence + targetText + " ";
          GlobalVariable.currentConstructSentence = $scope.currentConstructSentence;
        }
      });
    };
    $scope.upLoadSentence = function () {
      if ($scope.currentConstructSentence == undefined || $scope.currentConstructSentence == "") {
        alert($scope.subMenuProfileObject.SentenceEmptyWarning);
        return;
      }
      GlobalVariable.DownloadProgress.Reset();
      LoadingDialog.showLoadingPopup($mdDialog, $ionicSideMenuDelegate);
      var newUserProfile = UserProfileService.addSentence($scope.userProfile, $scope.currentConstructSentence, $scope.currentDisplayLanguage);
      UserProfileService.saveLocal(newUserProfile);
      UserProfileService.postToServerCallback(function () {
        UserProfileService.getOnline(UserProfileService.getLatest().ID, function () {
          console.log("Upload Sentence Success");
          $scope.userProfile = UserProfileService.getLatest();
          LocalCacheService.prepareCache(UserProfileService.getLatest());
        });
      });
    };
    function SentenceDialogController($scope, $mdDialog, $cordovaMedia) {
      $scope.cancel = function () {
        $mdDialog.cancel("");
      };
      $scope.categoryName = UtilityFunction.getObjectTranslation($scope.selectedCategory, $scope.currentDisplayLanguage);
      $scope.onAddToSentence = function (itemID) {
        var targetText = "Default";
        for (var i = 0; i < $scope.selectedCategory.Items.length; i++) {
          if ($scope.selectedCategory.Items[i].ID == itemID) {
            targetText = UtilityFunction.getObjectTranslation($scope.selectedCategory.Items[i], $scope.currentDisplayLanguage);
          }
        }
        $mdDialog.cancel(targetText);
      };
    };
    if (GlobalVariable.searchPopup.isSearch) {
      $scope.onSentenceClick(undefined, GlobalVariable.searchPopup.targetObject);
      GlobalVariable.searchPopup.isSearch = false;
    };
    function SentencePopupController($scope, $mdDialog, $cordovaMedia) {
      $scope.subMenuProfileObject = UserProfileService.getMenuProfileSubObjectWithInputLanguage("CategoryGrid", $scope.currentDisplayLanguage);
      $scope.enableEdit = false;
      $scope.displayLanguageList = GlobalVariable.DisplayLanguageList;
      $scope.selectedDisplayLanguage = $scope.currentDisplayLanguage;
      $scope.cancel = function () {
        $mdDialog.cancel("");
      };
      $scope.enableEditTog = function () {
        $scope.enableEdit = !$scope.enableEdit;
      };
      $scope.onSentencePopupClicked = function (ev) {
        MediaPlayer.play($cordovaMedia, $scope.AudioDirectory + $scope.sentenceObject.ID + ".mp3");
      };
      $scope.popupLanguageChange = function () {
        $scope.Title = UtilityFunction.getObjectTranslation($scope.sentenceObject, $scope.selectedDisplayLanguage);
        if ($scope.selectedDisplayLanguage == $scope.currentDisplayLanguage) {
          $scope.AudioDirectory = GlobalVariable.GetLocalAudioDirectory($scope.userProfile);
        }
        else {
          $scope.AudioDirectory = GlobalVariable.GetLocalAudioDirectoryByDisplayLanguage($scope.selectedDisplayLanguage);
          $scope.DefaultSpeakerObject = GlobalVariable.GetDefaultSpeakerForDisplayLanguage($scope.selectedDisplayLanguage);
          var targetDirectory = GlobalVariable.LocalCacheDirectory();
          console.log(targetDirectory + " " + $scope.DefaultSpeakerObject.targetSpeechLanguage + " " + $scope.DefaultSpeakerObject.targetSpeechGender + " " + $scope.Title + " " + $scope.sentenceObject.ID);
          LocalCacheService.downloadAudioToLocal(targetDirectory, "bing", $scope.DefaultSpeakerObject.targetSpeechLanguage, $scope.DefaultSpeakerObject.targetSpeechGender, $scope.Title, $scope.sentenceObject.ID);
        }
      };
      $scope.deleteThisSentence = function (event, sentenceID) {
        var confirmDialog = $mdDialog.confirm()
          .title($scope.subMenuProfileGeneral.Notification)
          .textContent($scope.subMenuProfileObject.DeleteSentenceWarning1 + "? " + $scope.subMenuProfileObject.DeleteSentenceWarning2)
          .targetEvent(event)
          .ok($scope.subMenuProfileGeneral.ConfirmButton)
          .cancel($scope.subMenuProfileGeneral.CancelButton);
        $mdDialog.show(confirmDialog).then(function () {
          var newUserProfile = UserProfileService.deleteSentence($scope.userProfile, sentenceID);
          GlobalCacheVariable.DeleteCheck.Reset();
          GlobalCacheVariable.DeleteCheck.SetFileToDelete(1);
          LoadingDialog.showLoadingPopup($mdDialog, $ionicSideMenuDelegate, true);
          $scope.userProfile = newUserProfile;
          UserProfileService.saveLocal($scope.userProfile);
          UserProfileService.postToServerCallback(function () {
            LocalCacheService.deleteLocalAudio($scope.userProfile, sentenceID);
            LocalCacheService.checkDelete(false);
          });
        });
      };
      $scope.copyToInput = function () {
        var targetText = UtilityFunction.getObjectTranslation($scope.sentenceObject,$scope.currentDisplayLanguage);
        $mdDialog.cancel(targetText);
      }
      $scope.reorderAddTopSentence = function () {
        var newUserProfile = UserProfileService.setTargetSentenceTop($scope.userProfile, $scope.sentenceObject.ID);
        UserProfileService.saveLocal(newUserProfile);
        UserProfileService.postToServerCallback(function () {
          console.log("Post to Server After Reorder Sentence");
        });
      };
    };
  })
  .controller("ShareCtrl", function ($scope, LogService, $http, UserProfileService, LocalCacheService, $mdDialog, $ionicSideMenuDelegate, $http) { //Share Ctrl, for user downloading
    $scope.userProfile = UserProfileService.getLatest();
    $scope.shareCategory = UserProfileService.getLatestShareCategory();
    $scope.subMenuProfileObject = UserProfileService.getMenuProfileSubObjectWithInputLanguage("ShareContent", $scope.currentDisplayLanguage);
    $scope.refreshOnlineResource = function () {
      console.log("Start to download online resources");
      GlobalVariable.DownloadProgress.Reset();
      LoadingDialog.showLoadingPopup($mdDialog, $ionicSideMenuDelegate);
      UserProfileService.getShareCategory();
    };
    $scope.onItemClickedDownload = function (ev, category) {
      var targetScope = $scope.$new();
      targetScope.categoryCloneContent = category;
      targetScope.DisplayLanguage = $scope.currentDisplayLanguage;

      LocalCacheService.prepareCloneCategory(category,function () {
        $mdDialog.show({
          controller: viewShareController,
          templateUrl: "templates/popup-viewShare.tmpl.html",
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: true,
          scope: targetScope,
          fullscreen: false
        });
      });
    };
    function viewShareController($scope, $mdDialog, $ionicSideMenuDelegate, $http) {
      $scope.selectedCategoryName = UtilityFunction.getObjectTranslation($scope.categoryCloneContent, $scope.DisplayLanguage);
      $scope.cancel = function () {
        $mdDialog.cancel();
      };
      $scope.downloadToLocal = function (ev) {
        var url = ServerPathVariable.GetAddCategoryToUserProfilePath($scope.userProfile.ID, $scope.categoryCloneContent.ID);
        console.log("Add category to user, Access Server url: " + url);
        GlobalVariable.DownloadProgress.Reset();
        LoadingDialog.showLoadingPopup($mdDialog, $ionicSideMenuDelegate);
        $http.get(url).then(function (data) {
          console.log("Request send to server success, start to sync server data...");
          UserProfileService.getOnline(UserProfileService.getLatest().ID, function () {
            console.log("Get updated user profile from server success, start to download files");
            LocalCacheService.prepareCache(UserProfileService.getLatest(),function () {
              $ionicSideMenuDelegate.toggleLeft();
            });
          });
        }),function errorCallback(response) {
          alert($scope.subMenuProfileGeneral.ServerWarning);
          console.log("Server is not avaliable: " + response);
        };
      }
    };
  })
  .controller("UserInfoCtrl", function ($scope, LogService, UserProfileService, $cordovaCapture){
    $scope.DisplayLanguageList = GlobalVariable.DisplayLanguageList;
    $scope.SpeechLanguageList = GlobalVariable.SpeechLanguageList;
    $scope.GenderList = GlobalVariable.GenderList;
    $scope.subMenuProfileObject = UserProfileService.getMenuProfileSubObjectWithInputLanguage("UserInformation", $scope.currentDisplayLanguage);
    if ($scope.userProfile.Email != "" && $scope.userProfile.Email != undefined) {
      $scope.isBinded = true;
    } else {
      $scope.isBinded = false;
    }
  })
  .controller("LoginCtrl", function ($scope, LogService, UserProfileService, $state, $http, $mdDialog, $ionicSideMenuDelegate, LocalCacheService) {
    $scope.userProfile = UserProfileService.getLatest();
    $scope.currentDisplayLanguage = $scope.userProfile.DISPLAY_LANGUAGE;
    $scope.subMenuProfileObject = UserProfileService.getMenuProfileSubObjectWithInputLanguage("UserLogin", $scope.currentDisplayLanguage);
    $scope.IsLogin = true;
    $scope.Username = "";
    $scope.Password = "";
    $scope.userLogin = function () {
      if (UtilityFunction.validateEmail($scope.Username) == false) {
        alert($scope.subMenuProfileObject.AlertEnterEmail);
        return;
      }
      if ($scope.Password == "") {
        alert($scope.subMenuProfileObject.AlertEnterPassword);
        return;
      }
      var Indata = { "uuid": $scope.userProfile.ID, "email": $scope.Username, "password": $scope.Password };
      $http({ url: ServerPathVariable.PostUserLogin(), method: "POST", params: Indata }).then(function (data, status, headers, config) {
        if (data.data.code == "Success") {
          var uuid = data.data.message;
          GlobalVariable.DownloadProgress.Reset();
          LoadingDialog.showLoadingPopup($mdDialog, $ionicSideMenuDelegate);
          UserProfileService.getOnline(uuid, function () {
            LocalCacheService.prepareCache(UserProfileService.getLatest(), function () {
              $ionicSideMenuDelegate.toggleLeft();
            });
            $state.go("app.welcome", {}, { reload: true });
          });
        }
        else if (data.data.code == "Fail" && data.data.message == "Email Address not found") {
          alert($scope.subMenuProfileObject.AlertEmailNotFound);
        }
        else if (data.data.code == "Fail" && data.data.message == "Wrong Password") {
          alert($scope.subMenuProfileObject.AlertWrongPassword);
        }
      }, function (data, status, headers, config) {
        config.log("Register With Server Error");
      });
    };
    $scope.userRegister = function () {
      if (UtilityFunction.validateEmail($scope.Username) == false) {
        alert($scope.subMenuProfileObject.AlertEnterEmail);
        return;
      }
      if ($scope.Password == "") {
        alert($scope.subMenuProfileObject.AlertEnterPassword);
        return;
      }
      var Indata = { "uuid": $scope.userProfile.ID, "email": $scope.Username, "password": $scope.Password };
      $http({ url: ServerPathVariable.PostUserRegister(), method: "POST", params: Indata }).then(function (data, status, headers, config) {
        if (data.data.code == "Success") {
          alert($scope.subMenuProfileObject.RegisterSuccess);
          $scope.IsLogin = !$scope.IsLogin;
        }
        else if (data.data.code == "Fail" && data.data.message == "This Email Address is Used") {
          alert($scope.subMenuProfileObject.AlertEmailExist);
        }
        else if (data.data.code == "Fail" && data.data.message == "This username had already done registration") {
          alert($scope.subMenuProfileObject.AlertEmailExist);
        }
      }, function (data, status, headers, config) {
        config.log("Register With Server Error");
      });
    };
    $scope.changeState = function () {
      $scope.IsLogin = !$scope.IsLogin;
    };
  })
  .controller("AboutUsCtrl", function ($scope, LogService, $mdDialog, $http, $cordovaNetwork, UserProfileService) {
    $scope.subMenuProfileObject = UserProfileService.getMenuProfileSubObjectWithInputLanguage("AboutUs", $scope.currentDisplayLanguage);
    $scope.textDiscription = UtilityFunction.getAboutUsDiscription($scope.currentDisplayLanguage);
    $scope.footerFont = parseInt(window.screen.width / 40);
    $scope.feedBack = function (ev) {
      var targetScope = $scope.$new();
      targetScope.uid = $scope.userProfile.ID;
      var FeedbackTypeList = GlobalVariable.FeedbackTypeList;
      var FeedbackTypeTranlationList = [$scope.subMenuProfileObject.GeneralProblem, $scope.subMenuProfileObject.BugReport, $scope.subMenuProfileObject.Suggestion, $scope.subMenuProfileObject.QuestionAboutApp];
      for (var i = 0; i < FeedbackTypeList.length; i++) {
        FeedbackTypeList[i].name = FeedbackTypeTranlationList[i];
      }
      console.log(FeedbackTypeList);
      targetScope.feedBackList = FeedbackTypeList;
      targetScope.FeedbackSuccess = $scope.subMenuProfileObject.FeedbackSuccess;
      $mdDialog.show({
        controller: DialogController,
        templateUrl: "templates/popup-feedBack.html",
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        scope: targetScope,
        fullscreen: false
      });
    };
    function DialogController($scope, $mdDialog) {
      $scope.cancel = function () {
        $mdDialog.cancel();
      };
      $scope.uploadFeedback = function () {
        if ($cordovaNetwork.isOffline()) {
          alert($scope.subMenuProfileGeneral.NetworkWarning);
          return;
        } else if (typeof $scope.feedBackType == "undefined" || $scope.categoryName == "") {
          alert($scope.subMenuProfileObject.FeedbackTypeWarning);
          return;
        } else if (typeof $scope.feedBackText == "undefined" || $scope.feedBackText == "") {
          alert($scope.subMenuProfileObject.FeedbackTextWarning);
          return;
        }
        var feedbackData = { "uuid": $scope.uid, "type": $scope.feedBackType, "content": $scope.feedBackText };
        console.log(feedbackData);
        $http({ url: ServerPathVariable.PostUserFeedback(), method: "POST", params: feedbackData }).then(function (data, status, headers, config) {
          $mdDialog.cancel();
          alert($scope.FeedbackSuccess);
        }, function (data, status, headers, config) {
          console.log("Upload Feedback With Server Error");
        });
      };
    }
  })
  .controller("PracticingCtrl", function ($scope, LogService, UserProfileService) {
    $scope.userProfile = UserProfileService.getLatest();
    $scope.currentDisplayLanguage = $scope.userProfile.DISPLAY_LANGUAGE;
    $scope.subMenuProfileObject = UserProfileService.getMenuProfileSubObjectWithInputLanguage("Practicing", $scope.currentDisplayLanguage);
  })
  .controller("PoemCtrl", function ($scope, LogService, UserProfileService, PracticeService, LocalCacheService, $cordovaMedia, VoiceRecordService) {
    $scope.userProfile = UserProfileService.getLatest();
    $scope.currentDisplayLanguage = $scope.userProfile.DISPLAY_LANGUAGE;
    $scope.subMenuProfileObject = UserProfileService.getMenuProfileSubObjectWithInputLanguage("Poem", $scope.currentDisplayLanguage);
    $scope.practiceContents = PracticeService.peomListToTargetLanguage(PracticeService.getPracticeObject("Poem").PoemBook, $scope.currentDisplayLanguage);
    $scope.isMenu = true;
    $scope.selectPoemObject;
    $scope.AudioDirectory = GlobalVariable.GetLocalAudioDirectoryByDisplayLanguage($scope.currentDisplayLanguage);

    $scope.RecordState = $scope.subMenuProfileGeneral.Start;
    $scope.isRecorded = false;
    //Sample marks.
    $scope.returnMark = [];
    $scope.returnMark.Total = 8.0;
    $scope.returnMark.Precision = 7.0;
    $scope.returnMark.Accuracy = 9.0;
    if (window.cordova && window.cordova.file && window.audioinput) {
      console.log("Enable Voice Record Listener...");
      window.addEventListener('audioinput', VoiceRecordService.onAudioInputCapture, false);
      window.addEventListener('audioinputerror', VoiceRecordService.onAudioInputError, false);
    }
    $scope.checkRecord = function () {
      VoiceRecordService.checkRecord();
    };
    $scope.uploadRecord = function () {

    };
    $scope.recordOperation = function () {
      if ($scope.RecordState == $scope.subMenuProfileGeneral.Start) {
        $scope.isRecorded = false;
        $scope.RecordState = $scope.subMenuProfileGeneral.Stop;
        VoiceRecordService.startCapture();
      }
      else if ($scope.RecordState == $scope.subMenuProfileGeneral.Stop) {
        $scope.RecordState = $scope.subMenuProfileGeneral.Start;
        VoiceRecordService.stopCapture("poemTemp");
        $scope.isRecorded = true;
      }
    };

    $scope.onPoemClick = function (ev, content) {
      $scope.selectPoemObject = content;
      $scope.isMenu = false;
      $scope.DefaultSpeakerObject = GlobalVariable.GetDefaultSpeakerForDisplayLanguage($scope.currentDisplayLanguage);
      var targetDirectory = GlobalVariable.LocalCacheDirectory();
      var audioID = "Poem_" + $scope.selectPoemObject.Index + "_Title";
      LocalCacheService.downloadAudioToLocal(targetDirectory, "bing", $scope.DefaultSpeakerObject.targetSpeechLanguage, $scope.DefaultSpeakerObject.targetSpeechGender, $scope.selectPoemObject.Title + "," + $scope.selectPoemObject.Author, audioID);
      for (var i = 0; i < $scope.selectPoemObject.Content.length; i++) {
        var audioID = "Poem_" + $scope.selectPoemObject.Index + "_Content_" + i;
        LocalCacheService.downloadAudioToLocal(targetDirectory, "bing", $scope.DefaultSpeakerObject.targetSpeechLanguage, $scope.DefaultSpeakerObject.targetSpeechGender, $scope.selectPoemObject.Content[i], audioID);
      }
    };
    $scope.backToMenu = function () {
      $scope.isMenu = true;
      $scope.isRecorded = false;
    };
    $scope.onPoemContentClick = function (ev, index) {
      MediaPlayer.play($cordovaMedia, $scope.AudioDirectory + "Poem_" + $scope.selectPoemObject.Index + "_Content_" + index + ".mp3");
    };
    $scope.onPoemTitleClick = function (ev) {
      MediaPlayer.play($cordovaMedia, $scope.AudioDirectory + "Poem_" + $scope.selectPoemObject.Index + "_Title.mp3");
    };
  })
  .controller("PronunciationCtrl", function ($scope, LogService, UserProfileService, PracticeService, LocalCacheService, $cordovaMedia,VoiceRecordService) {
    $scope.userProfile = UserProfileService.getLatest();
    $scope.currentDisplayLanguage = $scope.userProfile.DISPLAY_LANGUAGE;
    $scope.subMenuProfileObject = UserProfileService.getMenuProfileSubObjectWithInputLanguage("Pronunciation", $scope.currentDisplayLanguage);
    $scope.practiceContents = PracticeService.pronunciationListToTargetLanguage(PracticeService.getPracticeObject("Pronunciation").PronuciationWordList, $scope.currentDisplayLanguage);
    $scope.selectPronunciationObject;
    $scope.AudioDirectory = GlobalVariable.GetLocalAudioDirectoryByDisplayLanguage($scope.currentDisplayLanguage);
    $scope.isMenu = true;

    $scope.RecordState = $scope.subMenuProfileGeneral.Start;
    $scope.isRecorded = false;
    //Sample marks.
    $scope.returnMark = [];
    $scope.returnMark.Total = 8.0;
    $scope.returnMark.Precision = 7.0;
    $scope.returnMark.Accuracy = 9.0;
    if (window.cordova && window.cordova.file && window.audioinput) {
      console.log("Enable Voice Record Listener...");
      window.addEventListener('audioinput', VoiceRecordService.onAudioInputCapture, false);
      window.addEventListener('audioinputerror', VoiceRecordService.onAudioInputError, false);
    }
    $scope.checkRecord = function () {
      VoiceRecordService.checkRecord();
    };
    $scope.uploadRecord = function () {

    };
    $scope.recordOperation = function () {
      if ($scope.RecordState == $scope.subMenuProfileGeneral.Start) {
        $scope.isRecorded = false;
        $scope.RecordState = $scope.subMenuProfileGeneral.Stop;
        VoiceRecordService.startCapture();
      }
      else if ($scope.RecordState == $scope.subMenuProfileGeneral.Stop) {
        $scope.RecordState = $scope.subMenuProfileGeneral.Start;
        VoiceRecordService.stopCapture("pronunciationTemp");
        $scope.isRecorded = true;
      }
    };

    $scope.onPronunciationClick = function (ev, content) {
      $scope.selectPronunciationObject = content;
      $scope.currentReadingWordIndex = 0;
      $scope.isMenu = false;
      var targetDirectory = GlobalVariable.LocalCacheDirectory();
      for (var i = 0; i < $scope.selectPronunciationObject.Content.length; i++) {
        var audioID = "Pronunciation_" + $scope.selectPronunciationObject.Index + "_Content_" + i;
        LocalCacheService.downloadAudioToLocal(targetDirectory, "bing", $scope.userProfile.SPEECH_LANGUAGE_CODE, $scope.userProfile.SPEECH_GENDER, $scope.selectPronunciationObject.Content[i].Text, audioID);
      }
    };
    $scope.backToMenu = function () {
      $scope.isMenu = true;
    };
    $scope.toNextWord = function () {
      if ($scope.currentReadingWordIndex < $scope.selectPronunciationObject.Content.length - 1) {
        $scope.currentReadingWordIndex = $scope.currentReadingWordIndex + 1;
      }
      else if ($scope.currentReadingWordIndex == $scope.selectPronunciationObject.Content.length - 1){
        $scope.currentReadingWordIndex = 0;
      }
    };
    $scope.onPoemContentClick = function (ev) {
      MediaPlayer.play($cordovaMedia, $scope.AudioDirectory + "Pronunciation_" + $scope.selectPronunciationObject.Index + "_Content_" + $scope.currentReadingWordIndex + ".mp3");
    };
  })
  .controller("FaceCtrl", function ($scope, LogService, UserProfileService, PracticeService, LocalCacheService, $cordovaMedia, $cordovaCapture) {
    $scope.userProfile = UserProfileService.getLatest();
    $scope.currentDisplayLanguage = $scope.userProfile.DISPLAY_LANGUAGE;
    $scope.subMenuProfileObject = UserProfileService.getMenuProfileSubObjectWithInputLanguage("FacialPractice", $scope.currentDisplayLanguage);
    $scope.practiceContents = PracticeService.facialPracticeListToTargetLanguage(PracticeService.getPracticeObject("FacialMuscle").FacialMusclePracticeList, $scope.currentDisplayLanguage);
    $scope.selectFacialPracticeObject;
    $scope.isMenu = true;
    $scope.halfDeviceWidth = parseInt(window.screen.width / 2 * 0.8);
    //Sample marks.
    $scope.returnMark = [];
    $scope.returnMark.Total = 8.0;
    $scope.returnMark.Precision = 7.0;
    $scope.returnMark.Accuracy = 9.0;

    $scope.onFacialPracticeClick = function (ev, content) {
      $scope.selectFacialPracticeObject = content;
      $scope.isMenu = false;
      $scope.sampleVideoSrc = "img/"+content.Source;
    };
    $scope.backToMenu = function () {
      $scope.isMenu = true;
      $scope.sampleVideoSrc = "";
      $scope.practiceVideoSrc = "";
    };
    $scope.videoCapture = function () {
      options = {
        limit: 1
      };
      $cordovaCapture.captureVideo(options).then(
        function (videoData) {
          console.log("get video success: " + videoData[0].fullPath);
          $scope.practiceVideoSrc = videoData[0].fullPath;
        },
        function (err) {
          console.log("get video fail" + JSON.stringify(err));
        });
    };
    $scope.uploadVideo = function () {

    };
  })
  .controller("SearchCtrl", function ($scope, LogService, $state, UserProfileService, $http, $cordovaMedia, $cordovaFileTransfer, VoiceRecordService) {
    $scope.userProfile = UserProfileService.getLatest();
    $scope.subMenuProfileObject = UserProfileService.getMenuProfileSubObjectWithInputLanguage("Search", $scope.currentDisplayLanguage);
    $scope.DisplayLanguageList = GlobalVariable.DisplayLanguageList;
    $scope.RecordState = $scope.subMenuProfileGeneral.Start;
    $scope.isShowResult = false;
    $scope.isRecorded = false;
    $scope.resultWords = [];
    $scope.resultObjects = [];
    $scope.maxResultWordsDisplay = 10;
    $scope.CategoryRange = UtilityFunction.getWordListByObject($scope.userProfile, $scope.currentDisplayLanguage, "Category");
    $scope.CategoryName = $scope.CategoryRange[0];
    if (window.cordova && window.cordova.file && window.audioinput) {
      console.log("Enable Voice Record Listener...");
      window.addEventListener('audioinput', VoiceRecordService.onAudioInputCapture, false);
      window.addEventListener('audioinputerror', VoiceRecordService.onAudioInputError, false);
    }
    $scope.checkRecord = function () {
      VoiceRecordService.checkRecord();
    };
    $scope.uploadRecord = function () {
      var searchRangeList;
      if ($scope.CategoryName == "All") {
        searchRangeList = { "Type": "All", "SearchRange": UtilityFunction.getWordListByObject($scope.userProfile, $scope.currentDisplayLanguage, "All") };
      }
      else {
        var targetObject = UtilityFunction.getObjectByTranslationText($scope.userProfile, $scope.CategoryName, $scope.currentDisplayLanguage);
        searchRangeList = { "Type": "Item", "SearchRange": UtilityFunction.getWordListByObject(targetObject.object, $scope.currentDisplayLanguage, "Item") };
      }
      VoiceRecordService.uploadRecordSearch($scope.userProfile.ID, searchRangeList);
      $http.get(ServerPathVariable.GetSearchResultPath($scope.userProfile.ID))
        .then(function (data) {
          $scope.resultWords = data.data.ResultWordList;
          $scope.isShowResult = true;
          for (var i = 0; i < $scope.resultWords.length; i++) {
            var targetIDObject = UtilityFunction.getObjectByTranslationText($scope.userProfile, $scope.resultWords[i], $scope.currentDisplayLanguage);
            if (targetIDObject.type != "undefined") {
              $scope.resultObjects[i] = targetIDObject;
            }
            if (targetIDObject.type == "item") {
              $scope.resultObjects[i].parent = UtilityFunction.findCategoryObjectByItemID($scope.userProfile, targetIDObject.object.ID);
            }
          }
        });
    };
    $scope.searchRecording = function (ev) {
      if ($scope.RecordState == $scope.subMenuProfileGeneral.Start) {
        $scope.isRecorded = false;
        $scope.RecordState = $scope.subMenuProfileGeneral.Stop;
        VoiceRecordService.startCapture();
      }
      else if ($scope.RecordState == $scope.subMenuProfileGeneral.Stop) {
        $scope.RecordState = $scope.subMenuProfileGeneral.Start;
        VoiceRecordService.stopCapture("searchTemp");
        $scope.isRecorded = true;
      }
    };
    $scope.resultGuide = function (resultObject) {
      if (resultObject.type == "item") {
        GlobalVariable.searchPopup.isSearch = true;
        GlobalVariable.searchPopup.popupID = resultObject.object.ID;
      }
      else if (resultObject.type == "sentence") {
        GlobalVariable.searchPopup.isSearch = true;
        GlobalVariable.searchPopup.targetObject = UtilityFunction.getObjectById($scope.userProfile, resultObject.object.ID);
      }
    };
  })
  .controller("VoiceModelCtrl", function ($scope, LogService, $cordovaFileTransfer, $cordovaMedia, $cordovaNetwork, $http, $state, UserProfileService, VoiceRecordService, VoiceModelService) {
    $scope.userProfile = UserProfileService.getLatest();
    $scope.voiceModel = VoiceModelService.getLatest($scope.userProfile.ID);
    $scope.subMenuProfileObject = UserProfileService.getMenuProfileSubObjectWithInputLanguage("VoiceModelInformation", $scope.currentDisplayLanguage);
    $scope.recordingSentence = UtilityFunction.getFirstUnrecordedSentence($scope.voiceModel);
    $scope.collectedVoice = UtilityFunction.getRecordedVoiceCount($scope.voiceModel);
    $scope.totalVoice = $scope.voiceModel.TotalSentence;
    if ($scope.collectedVoice >= $scope.totalVoice) { $scope.CollectionStatusText = "Completed"; } else { $scope.CollectionStatusText = "UnCompleted"; }
    $scope.ModelStatusText = $scope.voiceModel.ModelStatus;
    if ($scope.CollectionStatusText == "Completed") { $scope.collectionStatus = false; } else { $scope.collectionStatus = true; }
    if ($scope.ModelStatusText == "Completed") { $scope.modelStatus = false; } else { $scope.modelStatus = true; }

    $scope.checkStart = false; $scope.checkStop = true; $scope.checkStatus = true; $scope.checkUpload = true;
    $scope.gifDisplay = false;
    $scope.start = function () { VoiceRecordService.startCapture(); $scope.checkStart = true; $scope.checkStop = false; $scope.gifDisplay = true; };
    $scope.stop = function () {
      VoiceRecordService.stopCapture(id);
      $scope.checkStart = false; $scope.checkStop = true; $scope.checkStatus = false; $scope.gifDisplay = false;
      if ($scope.collectionStatus == true) { $scope.checkUpload = false; }
    };
    $scope.check = function () { VoiceRecordService.checkRecord(); }
    $scope.upload = function () {
      if ($cordovaNetwork.isOffline()) {
        alert($scope.subMenuProfileGeneral.NetworkWarning);
        return;
      }
      VoiceRecordService.uploadRecordVC(id, $scope.recordingSentence.ID, function () {
        console.log("Upload recording VC to server");
        var newVoiceModel = VoiceModelService.changeRecordingStatus($scope.voiceModel, $scope.recordingSentence.ID);
        VoiceModelService.postToServerCallback(newVoiceModel, function () {
          VoiceModelService.getOnline(id, function () {
            window.location.reload(true);
          });
        });
      });
    }
    window.addEventListener('audioinput', VoiceRecordService.onAudioInputCapture, false);
    window.addEventListener('audioinputerror', VoiceRecordService.onAudioInputError, false);
  })
