var myModule = angular.module("starter.services", []);

myModule.factory("UserProfileService", function($http, $localStorage) {
  return {
    getOnline: function(userUuid, completeCallback) {
      url = ServerPathVariable.GetUserProfilePath(userUuid);
      $http.get(url).then(function(data) {
        $localStorage.userProfile = data.data;
        if (typeof completeCallback == "function") {
          completeCallback();
        }
      });
    },
    getLatest: function() {
      console.log("Get userprofile latest");
      var userprofile = [];
      if ($localStorage.userProfile) {
        console.log("Get userprofile from local");
        userprofile = $localStorage.userProfile;
      }
      else {
        console.log("Get userprofile from tmp");
        var json = this.getDefault();
        $localStorage.userProfile = json;
        userprofile = $localStorage.userProfile;
      }
      return userprofile;
    },
    getDefault: function() {
      return getSampleUserProfile();
    },
    saveLocal: function(newUserProfile) {
      $localStorage.userProfile = newUserProfile;
    },
    cloneItem: function(userUuid, completeCallback) { //for reset initial state
      var url = ServerPathVariable.GetUserProfileCloneItemPath(userUuid);
      $http.get(url).then(function(data) {
        $localStorage.userProfile = data.data;
        if (typeof completeCallback == "function") {
          completeCallback();
        }
      });
    },
    postToServerCallback: function(successCallback) {
      var userProfile = this.getLatest();
      var url = ServerPathVariable.PostUserProfilePath();
      $http.post(url, userProfile)
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

myModule.factory("LocalCacheService", function($ionicPlatform,$cordovaFile, $cordovaFileTransfer) {
  return {
    downloadImageToLocal: function(targetDirectory, targetName, itemId) {
      var self = this;
      var a = $cordovaFile.checkFile(targetDirectory, targetName).then(
        function(result) {
          GlobalCacheVariable.FileCheck.ExistImageFile++;
        },
        function(err) {
          GlobalVariable.DownloadProgress.AddTotal();
          var url = ServerPathVariable.GetImagePath(itemId);
          var targetPath = targetDirectory + "/" + targetName;
          var trustHosts = true;
          var options = { timeout: 10000 };

          $cordovaFileTransfer
            .download(url, targetPath, options, trustHosts)
            .then(
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
          GlobalCacheVariable.FileCheck.ExistAudioFile++;
        },
        function (error) { //file not exist     
          GlobalVariable.DownloadProgress.AddTotal();
          var url = ServerPathVariable.GetBingAudioPath( speechLanguageCode, speechGender, displayText);
          var targetPath = targetDirectory + "/" + targetName;
          var trustHosts = true;
          var options = { timeout: 10000 };

          $cordovaFileTransfer
            .download(url, targetPath, options, trustHosts).then(
              function (result) { //download ok    
                GlobalVariable.DownloadProgress.AddDownloaded();
              },
              function (err) {  //download error
                console.log("download err:" + JSON.stringify(err));
                GlobalVariable.DownloadProgress.ReduceTotal();
                self.downloadAudioToLocal( targetDirectory, speechProvider, speechLanguageCode, speechGender, displayText);
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
      // image cache
      var idList = [];
      for (var i = 0; i < userProfile.Categories.length; i++) {
        category = userProfile.Categories[i];
        idList.push(category.ID);
        for (j = 0; j < category.Items.length; j++) {
          item = category.Items[j];
          idList.push(item.ID);
        }
      }
      GlobalVariable.DownloadProgress.Reset();

      targetDirectory = GlobalVariable.LocalCacheDirectory();

      $cordovaFile.createDir(targetDirectory, "images", false);

      GlobalCacheVariable.FileCheck.TotalImageFile = idList.length;
      for (var i = 0; i < idList.length; i++) {
        var itemId = idList[i];
        targetName = "images/" + itemId + ".jpg";
        self.downloadImageToLocal(targetDirectory, targetName, itemId);
      }

      // audio cache
      var currentDisplayLanguage = userProfile.DISPLAY_LANGUAGE;
      var currentSpeechLanguageCode = userProfile.SPEECH_LANGUAGE_CODE;
      var currentSpeechGender = userProfile.SPEECH_GENDER;

      var displayTextList = [];
      for (var i = 0; i < userProfile.Categories.length; i++) {
        category = userProfile.Categories[i];
        displayText = getObjectTranslation(category, currentDisplayLanguage);
        displayTextList.push(displayText);
        for (var j = 0; j < category.Items.length; j++) {
          item = category.Items[j];
          displayText = getObjectTranslation(item, currentDisplayLanguage);
          displayTextList.push(displayText);
        }
      }

      $cordovaFile.createDir(targetDirectory, "bing", false);
      $cordovaFile.createDir(
        targetDirectory,
        "bing/" + currentSpeechLanguageCode,
        false
      );
      $cordovaFile.createDir(
        targetDirectory,
        "bing/" + currentSpeechLanguageCode + "/" + currentSpeechGender,
        false
      );

      GlobalCacheVariable.FileCheck.TotalAudioFile = displayTextList.length;
      for (var i = 0; i < displayTextList.length; i++) {
        var displayText = displayTextList[i];
        self.downloadAudioToLocal(
          targetDirectory,
          "bing",
          currentSpeechLanguageCode,
          currentSpeechGender,
          displayText
        );
      }

      setTimeout(function() {
        console.log(
          "Check File static:" +
            GlobalCacheVariable.FileCheck.ExistAudioFile +
            "/" +
            GlobalCacheVariable.FileCheck.TotalAudioFile
        );
        console.log(
          "Check File static:" +
            GlobalCacheVariable.FileCheck.ExistImageFile +
            "/" +
            GlobalCacheVariable.FileCheck.TotalImageFile
        );

        if (
          GlobalCacheVariable.FileCheck.ExistAudioFile >=
            GlobalCacheVariable.FileCheck.TotalAudioFile &&
          GlobalCacheVariable.FileCheck.ExistImageFile >=
            GlobalCacheVariable.FileCheck.TotalImageFile
        ) {
          console.log("Set IsNoDownload = 1");
          GlobalVariable.DownloadProgress.IsNoDownload = 1;
        }
      }, 2000); //delay 2 seconds
    }
  };
});
