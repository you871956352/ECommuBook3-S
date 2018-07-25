/* global angular */
/* global console */
angular
  .module("starter.controllers", [])
  .controller("AppCtrl", function ($rootScope, $scope, $mdDialog, $ionicSideMenuDelegate, $ionicModal, $timeout, $localStorage, $http, $cordovaMedia, $cordovaNetwork, UserProfileService, LocalCacheService) {
    $scope.$on("$ionicView.enter", function (e) {
      $scope.itemNormalFontSize = GlobalVariable.Appearance.itemNormalFontSize;
      $scope.ImagePath = GlobalVariable.LocalCacheDirectory() + "images/";   
      // on page loaded
      var userProfile = UserProfileService.getLatest();
      if (typeof $rootScope.isShowDisplayName == 'undefined') {
        $rootScope.isShowDisplayName = { checked: true };
      }
      $scope.userProfile = userProfile;
      $scope.menuProfile = UserProfileService.getMenuProfile();
      $scope.refreshMenuLanguage();
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
    $scope.refreshMenuLanguage = function () {

    }
  })
  .controller("CategoryCtrl", function ($rootScope, $scope, $stateParams, $mdDialog, $cordovaMedia, UserProfileService) {
    var userProfile = UserProfileService.getLatest();
    $scope.ImagePath = GlobalVariable.LocalCacheDirectory() + "images/";
    $scope.itemNormalFontSize = GlobalVariable.Appearance.itemNormalFontSize;
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
    $scope.displayLanguageList = GlobalVariable.DisplayLanguageList;
    $scope.speechLanguageList = GlobalVariable.SpeechLanguageList;
    $scope.genderList = GlobalVariable.GenderList;
    $scope.selectedDisplayLanguage;
    $scope.selectedSpeechLanguage;
    $scope.selectedSpeechGender;
    $scope.Title = UserProfileService.getTranslatedMenuText("Operations", "Setting");
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
    $scope.Title = UserProfileService.getTranslatedMenuText("Operations", "AddCategory");
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
    $scope.categories = $scope.userProfile.Categories;
    $scope.Title = UserProfileService.getTranslatedMenuText("Operations", "DeleteCategory");
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
      });
    };
  })
  .controller("AddItemCtrl", function ($scope, $cordovaCamera, $cordovaFileTransfer, $mdDialog, $http, $ionicSideMenuDelegate, $cordovaNetwork, UserProfileService, LocalCacheService) {
    $scope.userProfile = UserProfileService.getLatest();
    $scope.categories = $scope.userProfile.Categories;
    $scope.Title = UserProfileService.getTranslatedMenuText("Operations", "AddItem");
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
    $scope.categories = $scope.userProfile.Categories;
    $scope.Title = UserProfileService.getTranslatedMenuText("Operations", "DeleteItem");
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
      });
    };
  })
  .controller("WelcomeCtrl", function ($scope, $mdDialog, $http, $ionicSideMenuDelegate, UserProfileService, LocalCacheService) { })
  .controller("GridController", function ($scope, $http, $scope, $mdDialog, $ionicSideMenuDelegate) {
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
  .controller("ShareCtrl", function ($rootScope, $scope, UserProfileService, ShareCategoryService, LocalCacheService, $mdDialog, $ionicSideMenuDelegate, $http) { //Share Ctrl, for user downloading
    $scope.userProfile = UserProfileService.getLatest();
    $scope.menuProfile = UserProfileService.getMenuProfile();
    $scope.shareCategory = ShareCategoryService.getShareCategory();
    $scope.Title = UserProfileService.getTranslatedMenuText("Operations", "Download");
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
  .controller("TestCtrl", function ($scope,$cordovaFileTransfer, UserProfileService) { //Test Ctrl, for logging
    //$scope.uid = 0;
    var targetDirectory = GlobalVariable.LocalCacheDirectory() + "images/";
    var imageID = "00000000-0000-0000-0003-000000000197";
    var uploadID = "00000000-0000-0000-0000-000000000012";
    var uploadName = uploadID + ".jpg";
    $scope.ImagePath = targetDirectory + imageID + ".jpg";
    $scope.testClick = function () {
      alert($scope.ImagePath);
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
