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
        console.log("Read userProfile from LocalStorage.");
      }
      else {
        console.log("No userProfile in LocalStorage. Read sample userProfile.");
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

myModule.factory("LocalCacheService", function ($ionicPlatform, $cordovaFile, $cordovaFileTransfer) { //Used for store user audio and image
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
    downloadAudioToLocal: function(targetDirectory,speechProvider, speechLanguageCode,speechGender,displayText, audioID) {
      var self = this;
      var targetName = "audio/" + speechProvider + "/" + speechLanguageCode + "/" + speechGender + "/" + audioID +  ".mp3";
      var a = $cordovaFile.checkFile(targetDirectory, targetName).then(
        function (success) { //file exist
          GlobalCacheVariable.FileCheck.AddExistAudioFile();
        },
        function (error) { //file not exist
          GlobalVariable.DownloadProgress.AddTotal();
          $cordovaFileTransfer
            .download(ServerPathVariable.GetBingAudioPath(speechLanguageCode, speechGender, normalizeDisplayName(displayText)), (targetDirectory + "/" + targetName), { timeout: 10000 }, true).then(
              function (result) { //download ok
                GlobalVariable.DownloadProgress.AddDownloaded();
              },
              function (err) {  //download error
                console.log("download err:" + JSON.stringify(err));
                GlobalVariable.DownloadProgress.ReduceTotal();
                self.downloadAudioToLocal(targetDirectory, speechProvider, speechLanguageCode, speechGender, displayText, audioID);
               },
               function(progress) {}
            );
        }
      );
    },
    prepareCache: function (userProfile) {
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
      var audioIDList = [];
      for (var i = 0; i < userProfile.Categories.length; i++) {
        var category = userProfile.Categories[i];
        displayTextList.push(getObjectTranslation(category, currentDisplayLanguage));
        audioIDList.push(category.ID);
        for (var j = 0; j < category.Items.length; j++) {
          item = category.Items[j];
          displayTextList.push(getObjectTranslation(item, currentDisplayLanguage));
          audioIDList.push(item.ID);
        }
      }
      $cordovaFile.createDir(targetDirectory, "bing", false);
      $cordovaFile.createDir(targetDirectory, "bing/" + currentSpeechLanguageCode, false);
      $cordovaFile.createDir(targetDirectory, "bing/" + currentSpeechLanguageCode + "/" + currentSpeechGender,false);
      GlobalCacheVariable.FileCheck.SetTotalAudioFile(audioIDList.length);
      for (var i = 0; i < audioIDList.length; i++) {
        self.downloadAudioToLocal(targetDirectory, "bing", currentSpeechLanguageCode, currentSpeechGender, displayTextList[i], audioIDList[i]);
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
    deleteLocalImage: function(targetDirectory, targetID) {
      var targetName = targetID + ".jpg";
      console.log("Start remove local image: " + targetID);
      console.log("TargetDirectory: " + targetDirectory + "\nTargetName:" + targetName);
      $cordovaFile.removeFile(targetDirectory, targetName).then(
        function(result) {
          console.log("Remove image: Success");
          $cordovaFile.checkFile(targetDirectory, targetName).then(
            function(result) {
              console.log("Check file: Image still exist");
            },
            function(err) {
              console.log("Check file: Image removed.");
            }
          );
        },
        function(err) {
          console.log("Remove image: Error.");
        }
      );
    },
    deleteLocalAudio: function(userProfile,targetDirectory, targetID) {
      var speechProvider = "bing";
      var currentSpeechLanguageCode = userProfile.SPEECH_LANGUAGE_CODE;
      var currentSpeechGender = userProfile.SPEECH_GENDER;
      var targetName = speechProvider + "/" + currentSpeechLanguageCode + "/" + currentSpeechGender + "/" + targetID +  ".mp3";
      console.log("Start remove local audio: " + targetID);
      console.log("TargetDirectory: " + targetDirectory + "\nTargetName:" + targetName);
      $cordovaFile.removeFile(targetDirectory, targetName).then(
        function(result) {
          console.log("Remove audio: Success");
          $cordovaFile.checkFile(targetDirectory, targetName).then(
            function(result) {
              console.log("Check file: Audio still exist");
            },
            function(err) {
              console.log("Check file: Audio removed.");
            }
          );
        },
        function(err) {
          console.log("Remove Audio: Error.");
        }
      );
    },
    clearAllCache: function () {
      console.log("Reset: Start clear local cache");
      var path = GlobalVariable.LocalCacheDirectory();
      $cordovaFile.removeRecursively(path,"images").then(
        function(result) {
          console.log("Clear image: Success");
          $cordovaFile.checkDir(path, "images").then(
            function(result) {
              console.log("Check clear: Image still exist");
            },
            function(err) {
              console.log("Check clear: Image removed");
            }
          );
        },
        function(err) {
          console.log("Clear image: Error");
        }
      );
      $cordovaFile.removeRecursively(path,"audio").then(
        function(result) {
          console.log("Clear audio: Success");
          $cordovaFile.checkDir(path, "audio").then(
            function(result) {
              console.log("Check clear: Audio still exist");
            },
            function(err) {
              console.log("Check clear: Audio removed");
            }
          );
        },
        function(err) {
          console.log("Clear audio: Error");
        }
      );
    }
  };
});

myModule.factory("ShareCategoryService", function ($http, $localStorage) { //Store User Prefile
  return {
    getOnline: function () {
      console.log("Read shareCategory online.");
      $http.get(ServerPathVariable.GetSharePath()).then(function (data) {
        $localStorage.shareCategory = data.data;
      });
    },
    getShareCategory: function () {
      this.getOnline();
      return $localStorage.shareCategory;
    },
  };
});
