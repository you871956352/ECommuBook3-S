var myModule = angular.module("starter.services", []);

myModule.factory("UserProfileService", function($http, $localStorage) {
  return {
    online: function() {
      console.log("Get userprofile online");
      json = $http.get(
        "http://sepc155.se.cuhk.edu.hk:8080/ECommuBook2-2.0.0-SNAPSHOT/userProfile/00000000-0000-0000-0001-000000000000"
      );
      //console.log(JSON.stringify(json));
      $localStorage.userProfile = json;
      return json;
    },
    getOnline: function(userUuid, completeCallback) {
      url = ServerPathVariable.GetUserProfilePath(userUuid);
      console.log(url);
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
      } else {
        console.log("Get userprofile from tmp");
        var json = this.tmp();
        $localStorage.userProfile = json;
        userprofile = $localStorage.userProfile;
      }
      try {
        //onlineUserProfile = this.getOnline(userprofile.ID);
        //userProfile = onlineUserProfile;
        //this.saveLocal(userProfile);
        //console.log('Get online userProfile success');
      } catch (err) {
        //console.log('Get online userProfile err:' + JSON.stringify(err));
      } finally {
      }
      console.log("user id:" + userprofile.ID);
      return userprofile;
    },
    local: function() {
      console.log("Get userprofile local");
      json = $localStorage.userProfile;
      return json;
    },
    tmp: function() {
      console.log("Get userprofile tmp");
      json = getSampleUserProfile();
      return json;
    },
    sample: function() {
      json = getSampleUserProfile();
      return json;
    },
    saveLocal: function(newUserProfile) {
      console.log("Save userprofile local");
      $localStorage.userProfile = newUserProfile;
    },
    postToServer: function() {
      var userProfile = this.getLatest();
      var url = ServerPathVariable.PostUserProfilePath();

      $http
        .post(url, userProfile)
        .success(function(data, status, headers, config) {
          // this callback will be called asynchronously
          // when the response is available
          console.log("post userprofile success:" + JSON.stringify(data));
        })
        .error(function(data, status, headers, config) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
          console.log("post userprofile error :" + JSON.stringify(data));
        });
    },
    cloneItem: function(userUuid, completeCallback) {
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

      $http
        .post(url, userProfile)
        .success(function(data, status, headers, config) {
          // this callback will be called asynchronously
          // when the response is available
          console.log("post userprofile success:" + JSON.stringify(data));
          if (typeof successCallback == "function") {
            successCallback();
          }
        })
        .error(function(data, status, headers, config) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
          console.log("post userprofile error :" + JSON.stringify(data));
        });
    }
  };
});

myModule.factory("LocalCacheService", function(
  $ionicPlatform,
  $cordovaFile,
  $cordovaFileTransfer
) {
  return {
    test: function() {
      return "test";
    },

    downloadImageToLocal: function(targetDirectory, targetName, itemId) {
      var self = this;
      var a = $cordovaFile.checkFile(targetDirectory, targetName).then(
        function(result) {
          //console.log('file_exist:' + result);
          GlobalCacheVariable.FileCheck.ExistImageFile++;
        },
        function(err) {
          //console.log('file_not_exist:' + err);
          //console.log('new image:' + targetName + ',' + itemId);
          GlobalVariable.DownloadProgress.AddTotal();

          var src = ServerPathVariable.GetImagePath(itemId);
          var url = src;
          var targetPath = targetDirectory + "/" + targetName;
          var trustHosts = true;
          var options = { timeout: 10000 };

          $cordovaFileTransfer
            .download(url, targetPath, options, trustHosts)
            .then(
              function(result) {
                // Success!
                GlobalVariable.DownloadProgress.AddDownloaded();
              },
              function(err) {
                // Error
                console.log("download err:" + JSON.stringify(err));
                GlobalVariable.DownloadProgress.ReduceTotal();
                self.downloadImageToLocal(targetDirectory, targetName, itemId);
              },
              function(progress) {}
            );
        }
      );
    },
    downloadAudioToLocal: function(
      targetDirectory,
      speechProvider,
      speechLanguageCode,
      speechGender,
      displayText
    ) {
      var self = this;
      displayText = normalizeDisplayName(displayText);
      var targetName =
        "audio/" +
        speechProvider +
        "/" +
        speechLanguageCode +
        "/" +
        speechGender +
        "/" +
        displayText +
        ".mp3";
      var a = $cordovaFile.checkFile(targetDirectory, targetName).then(
        function(success) {
          //file exist
          GlobalCacheVariable.FileCheck.ExistAudioFile++;
        },
        function(error) {
          //file not exist
          //console.log('new audio:' + targetName);
          GlobalVariable.DownloadProgress.AddTotal();

          var url = ServerPathVariable.GetBingAudioPath(
            speechLanguageCode,
            speechGender,
            displayText
          );
          var targetPath = targetDirectory + "/" + targetName;
          var trustHosts = true;
          var options = { timeout: 10000 };

          $cordovaFileTransfer
            .download(url, targetPath, options, trustHosts)
            .then(
              function(result) {
                //download ok
                GlobalVariable.DownloadProgress.AddDownloaded();
              },
              function(err) {
                //download error
                // Error
                console.log("download err:" + JSON.stringify(err));
                GlobalVariable.DownloadProgress.ReduceTotal();
                self.downloadAudioToLocal(
                  targetDirectory,
                  speechProvider,
                  speechLanguageCode,
                  speechGender,
                  displayText
                );
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

      /*
            var downloadProgressInterval = setInterval(function() {
                var s = GlobalVariable.DownloadProgress.GetText();
                console.log(s);
                if(s[0] == s[1]) {
                    clearInterval(downloadProgressInterval);
                }
            }, 500);
            */
    }
  };
});
