var myModule = angular.module("starter.services", []);

myModule.factory("UserProfileService", function($http, $localStorage) { //Store User Prefile
  return {
    getOnline: function(userUuid, completeCallback) {
      $http.get(ServerPathVariable.GetUserProfilePath(userUuid)).then(function(data) {
        $localStorage.userProfile = data.data;
        if (typeof completeCallback == "function") {
          completeCallback();
        }
      });
    },
    getLatest: function() {
      if ($localStorage.userProfile) {
        console.log("LocalStorage user profile exist, just use it");
      }
      else {
        console.log("LocalStorage user profile do not exist, use templete");
        $localStorage.userProfile = this.getDefault();
      }
      return $localStorage.userProfile;
    },
    getDefault: function() {
      return getSampleUserProfile();
    },
    saveLocal: function(newUserProfile) {
      $localStorage.userProfile = newUserProfile;
    },
    cloneItem: function(userUuid, completeCallback) { //for reset initial state
      $http.get(ServerPathVariable.GetUserProfileCloneItemPath(userUuid)).then(function(data) {
        $localStorage.userProfile = data.data;
        if (typeof completeCallback == "function") {
          completeCallback();
        }
      });
    },
    postToServerCallback: function(successCallback) {
      $http.post(ServerPathVariable.PostUserProfilePath(), this.getLatest())
        .success(function (data, status, headers, config) { // called asynchronously if an error occurs or server returns response with an error status.
          console.log("post userprofile success:" + JSON.stringify(data));
          if (typeof successCallback == "function") {
            successCallback();
          }
        })
        .error(function (data, status, headers, config) { // called asynchronously if an error occurs or server returns response with an error status.
          console.log("post userprofile error :" + JSON.stringify(data));
        });
    }
  };
});

myModule.factory("LocalCacheService", function($ionicPlatform,$cordovaFile, $cordovaFileTransfer) { //Used for store user audio and image
  return {
    downloadImageToLocal: function(targetDirectory, targetName, itemId) {
      var self = this;
      $cordovaFile.checkFile(targetDirectory, targetName).then(
        function(result) {
          GlobalCacheVariable.FileCheck.AddExistImageFile();
        },
        function(err) {
          GlobalVariable.DownloadProgress.AddTotal();
          $cordovaFileTransfer.download(ServerPathVariable.GetImagePath(itemId), (targetDirectory + "/" + targetName), { timeout: 10000 }, true).then(
              function (result) {  // Success!       
                GlobalVariable.DownloadProgress.AddDownloaded(); 
              },
              function (err) { // Error
                console.log("download err:" + JSON.stringify(err));
                GlobalVariable.DownloadProgress.ReduceTotal();
                self.downloadImageToLocal(targetDirectory, targetName, itemId);       
              },
              function(progress) {}
            );
        }
      );
    },
    downloadAudioToLocal: function(targetDirectory,speechProvider, speechLanguageCode,speechGender,displayText) {
      var self = this;
      displayText = normalizeDisplayName(displayText);
      var targetName = "audio/" + speechProvider +  "/" + speechLanguageCode +  "/" + speechGender +  "/" + displayText +  ".mp3";
      var a = $cordovaFile.checkFile(targetDirectory, targetName).then(
        function (success) { //file exist
          GlobalCacheVariable.FileCheck.AddExistAudioFile();
        },
        function (error) { //file not exist     
          GlobalVariable.DownloadProgress.AddTotal();
          $cordovaFileTransfer
            .download(ServerPathVariable.GetBingAudioPath(speechLanguageCode, speechGender, displayText), (targetDirectory + "/" + targetName), { timeout: 10000 }, true).then(
              function (result) { //download ok    
                GlobalVariable.DownloadProgress.AddDownloaded();
              },
              function (err) {  //download error
                console.log("download err:" + JSON.stringify(err));
                GlobalVariable.DownloadProgress.ReduceTotal();
                self.downloadAudioToLocal(targetDirectory, speechProvider, speechLanguageCode, speechGender, displayText);               
               },
               function(progress) {}
            );
        }
      );
    },
    prepareCache: function(userProfile) {
      console.log("Start prepare cache");
      var self = this;
      GlobalCacheVariable.FileCheck.Reset();
      //image cache
      var idList = [];
      for (var i = 0; i < userProfile.Categories.length; i++) {
        var category = userProfile.Categories[i];
        idList.push(category.ID);
        for (j = 0; j < category.Items.length; j++) {
          var item = category.Items[j];
          idList.push(item.ID);
        }
      }
      GlobalVariable.DownloadProgress.Reset();
      var targetDirectory = GlobalVariable.LocalCacheDirectory();
      $cordovaFile.createDir(targetDirectory, "images", false);
      GlobalCacheVariable.FileCheck.SetTotalImageFile(idList.length);
      for (var i = 0; i < idList.length; i++) {
        self.downloadImageToLocal(targetDirectory, ("images/" + idList[i] + ".jpg"), idList[i]);
      }

      // audio cache
      var currentDisplayLanguage = userProfile.DISPLAY_LANGUAGE;
      var currentSpeechLanguageCode = userProfile.SPEECH_LANGUAGE_CODE;
      var currentSpeechGender = userProfile.SPEECH_GENDER;

      var displayTextList = [];
      for (var i = 0; i < userProfile.Categories.length; i++) {
        var category = userProfile.Categories[i];
        displayTextList.push(getObjectTranslation(category, currentDisplayLanguage));
        for (var j = 0; j < category.Items.length; j++) {
          item = category.Items[j];
          displayTextList.push(getObjectTranslation(item, currentDisplayLanguage));
        }
      }
      $cordovaFile.createDir(targetDirectory, "bing", false);
      $cordovaFile.createDir(targetDirectory, "bing/" + currentSpeechLanguageCode, false);
      $cordovaFile.createDir(targetDirectory, "bing/" + currentSpeechLanguageCode + "/" + currentSpeechGender,false);
      GlobalCacheVariable.FileCheck.SetTotalAudioFile(displayTextList.length);
      for (var i = 0; i < displayTextList.length; i++) {
        var displayText = displayTextList[i];
        self.downloadAudioToLocal(targetDirectory, "bing", currentSpeechLanguageCode, currentSpeechGender, displayText);
      }

      setTimeout(function() {
        console.log("Check File static:" + GlobalCacheVariable.FileCheck.ExistAudioFile +  "/" + GlobalCacheVariable.FileCheck.TotalAudioFile);
        console.log("Check File static:" + GlobalCacheVariable.FileCheck.ExistImageFile +  "/" + GlobalCacheVariable.FileCheck.TotalImageFile);
        if (GlobalCacheVariable.FileCheck.ExistAudioFile >= GlobalCacheVariable.FileCheck.TotalAudioFile &&
          GlobalCacheVariable.FileCheck.ExistImageFile >= GlobalCacheVariable.FileCheck.TotalImageFile) {
          console.log("Set IsNoDownload = 1");
          GlobalVariable.DownloadProgress.IsNoDownload = 1;
        }
      }, 2000); //delay 2 seconds
    },
    clearAllCache: function () {
      console.log("Start clear all cache");
      var targetDirectory = GlobalVariable.LocalCacheDirectory();
      $cordovaFile.removeRecursively()
    }
  };
});
