var myModule = angular.module("starter.services", []);

myModule.factory("UserProfileService", function($http, $localStorage, LocalCacheService) { //Store User Prefile
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
    },
    setTargetCategoryTop: function (UserProfile, categoryID) {
      var Categories = UserProfile.Categories;
      var newCategories = [];
      var targetIndex = -1;
      for (var i = 0; i < Categories.length; i++) {
        if (Categories[i].ID == categoryID) {
          newCategories.push(Categories[i]);
          targetIndex = i;
          break;
        }
      }
      for (var i = 0; i < Categories.length; i++) {
        if (targetIndex != -1 && targetIndex != i) {
          newCategories.push(Categories[i]);
        }
        else {
          //alert(targetIndex);
        }
      }
      UserProfile.Categories = newCategories;
      return UserProfile;
    },
    setTargetItemTop: function (UserProfile, categoryID, ItemID) {
      var Items;
      var newItems = [];
      var CategoryIndex = -1;
      var ItemsIndex = -1;
      for (var i = 0; i < UserProfile.Categories.length; i++) {
        if (UserProfile.Categories[i].ID == categoryID) {
          CategoryIndex = i;
          Items = UserProfile.Categories[CategoryIndex].Items;
          break;
        }
      }
      for (var i = 0; i < Items.length; i++) {
        if (Items[i].ID == ItemID) {
          newItems.push(Items[i]);
          ItemsIndex = i;
          break;
        }
      }
      for (var i = 0; i < Items.length; i++) {
        if (ItemsIndex != -1 && ItemsIndex != i) {
          newItems.push(Items[i]);
        }
        else {
          //alert(ItemsIndex);
        }
      }
      UserProfile.Categories[CategoryIndex].Items = newItems;
      return UserProfile;
    },
    setTargetSentenceTop: function (UserProfile, sentenceID) {
      var Sentences = UserProfile.Sentences;
      var newSentences = [];
      var targetIndex = -1;
      for (var i = 0; i < Sentences.length; i++) {
        if (Sentences[i].ID == sentenceID) {
          newSentences.push(Sentences[i]);
          targetIndex = i;
          break;
        }
      }
      for (var i = 0; i < Sentences.length; i++) {
        if (targetIndex != -1 && targetIndex != i) {
          newSentences.push(Sentences[i]);
        }
        else {
          //alert(targetIndex);
        }
      }
      UserProfile.Sentences = newSentences;
      return UserProfile;
    },
    editTargetItem: function (UserProfile, categoryID, ItemID, targetLanguage, targetText) {
      var currentDisplayLanguage = UserProfile.DISPLAY_LANGUAGE;
      if (currentDisplayLanguage == targetLanguage) {
        console.log("Edit Current DisplayName");
        for (var i = 0; i < UserProfile.Categories.length; i++) {
          if (UserProfile.Categories[i].ID == categoryID) {
            for (var j = 0; j < UserProfile.Categories[i].Items.length; j++) {
              if (UserProfile.Categories[i].Items[j].ID == ItemID) {
                UserProfile.Categories[i].Items[j].DisplayName = targetText;
                for (var k = 0; k < UserProfile.Categories[i].Items[j].DisplayMultipleLanguage.length; k++) {
                  if (UserProfile.Categories[i].Items[j].DisplayMultipleLanguage[k].Language == targetLanguage) {
                    UserProfile.Categories[i].Items[j].DisplayMultipleLanguage[k].Text = targetText;
                    return { "UserProfile": UserProfile, "Type": "DisplayName" };
                  }
                }
                break;
              }
            }
            break;
          }
        }
      }
      else {
        console.log("Revise Mistake MultiLanguage");
        for (var i = 0; i < UserProfile.Categories.length; i++) {
          if (UserProfile.Categories[i].ID == categoryID) {
            for (var j = 0; j < UserProfile.Categories[i].Items.length; j++) {
              if (UserProfile.Categories[i].Items[j].ID == ItemID) {
                for (var k = 0; k < UserProfile.Categories[i].Items[j].DisplayMultipleLanguage.length; k++) {
                  if (UserProfile.Categories[i].Items[j].DisplayMultipleLanguage[k].Language == targetLanguage) {
                    UserProfile.Categories[i].Items[j].DisplayMultipleLanguage[k].Text = targetText;
                    return { "UserProfile": UserProfile, "Type": "MultiLanguage" };
                  }
                }
                break;
              }
            }
            break;
          }
        }
      }
      return { "UserProfile" : UserProfile, "Type" : "null"};
    },
    deleteCategory: function (UserProfile, selectedCategoryId) {
      var idList = [];
      var targetCategoryIndex = UtilityFunction.getCategoryIndexById(UserProfile, selectedCategoryId);
      if (targetCategoryIndex == -1) {
        console("Target Category Not Exist");
        return { UserProfile, idList };
      }
      idList.push(selectedCategoryId);
      var category = UserProfile.Categories[targetCategoryIndex];
      for (i = 0; i < category.Items.length; i++) {
        var item = category.Items[i];
        idList.push(item.ID);
      }
      UserProfile.Categories.splice(targetCategoryIndex, 1);
      return { UserProfile, idList };
    },
    deleteItem: function (UserProfile, selectedCategoryId, selectedItemId) {
      var targetCategoryIndex = UtilityFunction.getCategoryIndexById(UserProfile, selectedCategoryId);
      if (targetCategoryIndex == -1) {
        console("Target Category Not Exist");
        return UserProfile;
      }
      var targetItemIndex = UtilityFunction.getItemIndexByItemId(UserProfile.Categories[targetCategoryIndex], selectedItemId);
      if (targetItemIndex == -1) {
        console("Target Item Not Exist");
        return UserProfile;
      }
      //alert(targetCategoryIndex + " " +  targetItemIndex);
      UserProfile.Categories[targetCategoryIndex].Items.splice(targetItemIndex, 1);
      return UserProfile;
    },
    deleteSentence: function (UserProfile, selectedSentenceId) {
      var targetSentenceIndex = UtilityFunction.getSentenceIndexById(UserProfile, selectedSentenceId);
      if (targetSentenceIndex == -1) {
        console("Sentence Not Exist");
        return UserProfile;
      }
      UserProfile.Sentences.splice(targetSentenceIndex, 1);
      return UserProfile;
    },
    addSentence: function (UserProfile, targetSentence, inputDisplayNameLanguage) {
      var SentenceObject = {};
      SentenceObject.ID = UtilityFunction.guid();
      SentenceObject.DisplayNameLanguage = inputDisplayNameLanguage;
      SentenceObject.DisplayName = targetSentence;
      UserProfile.Sentences.push(SentenceObject);
      return UserProfile;
    },
    getMenuProfile: function () {
      /*if ($localStorage.menuProfile) {
        console.log("Read menuProfile from LocalStorage.");
      }
      else {
        console.log("No menuProfile in LocalStorage. Read sample menuProfile.");
        $localStorage.menuProfile = getSampleMenuProfile();
      }
      return $localStorage.menuProfile;*/

      $localStorage.menuProfile = getSampleMenuProfile();
      return $localStorage.menuProfile;
    },
    getMenuProfileSubObjectWithInputLanguage: function (targetText, inputLanguage) {
      var originalObject;
      var menuProfile = this.getMenuProfile();
      for (var i = 0; i < menuProfile.Operations.length; i++) {
        if (menuProfile.Operations[i].OperationType == targetText) {
          originalObject = menuProfile.Operations[i];
          break;
        }
      }
      var returnObject = {};
      if (inputLanguage == undefined) {
        var userProfile = this.getLatest();
        var targetLanguage = userProfile.DISPLAY_LANGUAGE;
        console.log("No input language detected, use default userProfile config language");
      }
      else {
        var targetLanguage = inputLanguage;
      }
      if (originalObject.DisplayMultipleLanguage != undefined) {
        for (var i = 0; i < originalObject.DisplayMultipleLanguage.length; i++) {
          if (originalObject.DisplayMultipleLanguage[i].Language == targetLanguage) {
            returnObject.PageTitle = originalObject.DisplayMultipleLanguage[i].Text;
            break;
          }
        }
      }
      if (originalObject.SubPage != undefined) {
        var originalObjectSubPage = originalObject.SubPage;
        for (var i = 0; i < originalObjectSubPage.length; i++) {
          for (var j = 0; j < originalObjectSubPage[i].DisplayMultipleLanguage.length; j++) {
            if (originalObjectSubPage[i].DisplayMultipleLanguage[j].Language == targetLanguage) {
              returnObject[originalObjectSubPage[i].OperationType] = originalObjectSubPage[i].DisplayMultipleLanguage[j].Text;
              break;
            }
          }
        }
      }
      return returnObject;
    },
    getMenuProfileOperation: function (inputLanguage) {
      var menuProfile = this.getMenuProfile();
      var returnObject = {};
      if (inputLanguage == undefined) {
        var userProfile = this.getLatest();
        var targetLanguage = userProfile.DISPLAY_LANGUAGE;
        console.log("No input language detected, use default userProfile config language");
      }
      else {
        var targetLanguage = inputLanguage;
      }
      for (var i = 0; i < menuProfile.Operations.length; i++) {
        if (menuProfile.Operations[i].DisplayMultipleLanguage != undefined) {
          for (var j = 0; j < menuProfile.Operations[i].DisplayMultipleLanguage.length; j++) {
            if (menuProfile.Operations[i].DisplayMultipleLanguage[j].Language == targetLanguage) {
              returnObject[menuProfile.Operations[i].OperationType] = menuProfile.Operations[i].DisplayMultipleLanguage[j].Text;
              break;
            }
          }
        }
      }
      return returnObject;
    },
  };
});

myModule.factory("LocalCacheService", function ($ionicPlatform, $cordovaFile, $cordovaFileTransfer,$state) { //Used for store user audio and image
  return {
    downloadImageToLocal: function (targetDirectory, targetName, itemId) {
      $cordovaFile.createDir(targetDirectory, "images", false);
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
                GlobalCacheVariable.FileCheck.AddExistImageFile();
              },
              function (err) { // Error
                console.log("download err:" + JSON.stringify(err));
                GlobalVariable.DownloadProgress.ReduceTotal();
                self.downloadImageToLocal(targetDirectory, targetName, itemId);
              }
            );
        }
      );
    },
    downloadAudioToLocal: function (targetDirectory, speechProvider, speechLanguageCode, speechGender, displayText, audioID) {
      $cordovaFile.createDir(targetDirectory, speechProvider, false);
      $cordovaFile.createDir(targetDirectory, speechProvider + "/" + speechLanguageCode, false);
      $cordovaFile.createDir(targetDirectory, speechProvider + "/" + speechLanguageCode + "/" + speechGender, false);
      var self = this;
      var targetName = "audio/" + speechProvider + "/" + speechLanguageCode + "/" + speechGender + "/" + audioID + ".mp3";
      var a = $cordovaFile.checkFile(targetDirectory, targetName).then(
        function (success) { //file exist
          GlobalCacheVariable.FileCheck.AddExistAudioFile();
        },
        function (error) { //file not exist
          GlobalVariable.DownloadProgress.AddTotal();
          $cordovaFileTransfer
            .download(ServerPathVariable.GetBingAudioPath(speechLanguageCode, speechGender, UtilityFunction.normalizeDisplayName(displayText)), (targetDirectory + "/" + targetName), { timeout: 10000 }, true).then(
              function (result) { //download ok
                GlobalVariable.DownloadProgress.AddDownloaded();
                GlobalCacheVariable.FileCheck.AddExistAudioFile();
              },
              function (err) {  //download error
                console.log("download err:" + JSON.stringify(err));
                GlobalVariable.DownloadProgress.ReduceTotal();
                self.downloadAudioToLocal(targetDirectory, speechProvider, speechLanguageCode, speechGender, displayText, audioID);
               }
            );
        }
      );
    },
    prepareShareCategory: function(shareCategory) {
      console.log("Start Prepare share category Cache");
      var self = this;
      GlobalCacheVariable.FileCheck.Reset();
      //image cache
      var idList = [];
      for (var i = 0; i < shareCategory.categories.length; i++) {
        idList.push(shareCategory.categories[i].ID);
      }
      GlobalVariable.DownloadProgress.Reset();
      var targetDirectory = GlobalVariable.LocalCacheDirectory();
      $cordovaFile.createDir(targetDirectory, "images", false);
      GlobalCacheVariable.FileCheck.SetTotalImageFile(idList.length);
      for (var i = 0; i < idList.length; i++) {
        self.downloadImageToLocal(targetDirectory, ("images/" + idList[i] + ".jpg"), idList[i]);
      }
      self.checkDownload();
    },
    prepareCache: function (userProfile, trueReload) {
      if (trueReload == undefined) {
        trueReload = false;
      }
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
      GlobalCacheVariable.FileCheck.SetTotalImageFile(idList.length);
      for (var i = 0; i < idList.length; i++) {
        self.downloadImageToLocal(targetDirectory, ("images/" + idList[i] + ".jpg"), idList[i]);
      }
      // audio cache
      var displayTextList = [];
      var audioIDList = [];
      for (var i = 0; i < userProfile.Categories.length; i++) {
        var category = userProfile.Categories[i];
        displayTextList.push(UtilityFunction.getObjectTranslation(category, userProfile.DISPLAY_LANGUAGE));
        audioIDList.push(category.ID);
        for (var j = 0; j < category.Items.length; j++) {
          item = category.Items[j];
          displayTextList.push(UtilityFunction.getObjectTranslation(item, userProfile.DISPLAY_LANGUAGE));
          audioIDList.push(item.ID);
        }
      }
      for (var i = 0; i < userProfile.Sentences.length; i++) {
        displayTextList.push(UtilityFunction.getObjectTranslation(userProfile.Sentences[i], userProfile.DISPLAY_LANGUAGE));
        audioIDList.push(userProfile.Sentences[i].ID);
      }
      GlobalCacheVariable.FileCheck.SetTotalAudioFile(audioIDList.length);
      for (var i = 0; i < audioIDList.length; i++) {
        self.downloadAudioToLocal(targetDirectory, "bing", userProfile.SPEECH_LANGUAGE_CODE, userProfile.SPEECH_GENDER, displayTextList[i], audioIDList[i]);
      }
      self.checkDownload(trueReload);
    },
    deleteCache: function (userProfile, targetID) {
      this.deleteLocalImage(targetID);
      this.deleteLocalAudio(userProfile, targetID);
    },
    deleteLocalImage: function(targetID) {
      var targetDirectory = GlobalVariable.LocalCacheDirectory() + "images/";
      var targetName = targetID + ".jpg";
      $cordovaFile.removeFile(targetDirectory, targetName).then(
        function(result) {
          $cordovaFile.checkFile(targetDirectory, targetName).then(
            function (exist) {
              console.log("Check file fail: Image still exist");
              console.log("TargetDirectory: " + targetDirectory + ", TargetName:" + targetName);
            },
            function(remove) {
              GlobalCacheVariable.DeleteCheck.AddDeletedFile();
            }
          );
        },
        function(err) {
          console.log("Remove image: Error.");
        }
      );
    },
    deleteLocalAudio: function(userProfile, targetID) {
      var targetDirectory = GlobalVariable.LocalCacheDirectory() + "audio/";
      var speechProvider = "bing";
      var currentSpeechLanguageCode = userProfile.SPEECH_LANGUAGE_CODE;
      var currentSpeechGender = userProfile.SPEECH_GENDER;
      var targetName = speechProvider + "/" + currentSpeechLanguageCode + "/" + currentSpeechGender + "/" + targetID +  ".mp3";
      $cordovaFile.removeFile(targetDirectory, targetName).then(
        function(result) {
          $cordovaFile.checkFile(targetDirectory, targetName).then(
            function (exist) {
              console.log("Check file fail: audio still exist");
              console.log("TargetDirectory: " + targetDirectory + ", TargetName:" + targetName);
            },
            function(remove) {
              GlobalCacheVariable.DeleteCheck.AddDeletedFile();
            }
          );
        },
        function(err) {
          console.log("Remove Audio: Error.");
        }
      );
    },
    deleteLocalAudioAllLanguage: function (userProfile, targetID) {
      var targetDirectory = GlobalVariable.LocalCacheDirectory() + "audio/";
      var speechProvider = "bing";
      var currentSpeechLanguageCodeGenderList = GlobalVariable.GenderList;
      for (var i = 0; i < currentSpeechLanguageCodeGenderList.length; i++) {
        var currentSpeechLanguageCode = currentSpeechLanguageCodeGenderList[i].language;
        var currentSpeechGender = currentSpeechLanguageCodeGenderList[i].value;
        var targetName = speechProvider + "/" + currentSpeechLanguageCode + "/" + currentSpeechGender + "/" + targetID + ".mp3";
        $cordovaFile.removeFile(targetDirectory, targetName);
      }
    },
    clearAllCache: function () {
      console.log("Reset: Start clear local cache");
      var path = GlobalVariable.LocalCacheDirectory();
      $cordovaFile.removeRecursively(path,"images").then(
        function(result) {
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
    },
    checkDownload: function(trueReload){
      var self = this;
      var reload = trueReload;
        setTimeout(function() {
          console.log("Check Audio File static:" + GlobalCacheVariable.FileCheck.ExistAudioFile +  "/" + GlobalCacheVariable.FileCheck.TotalAudioFile);
          console.log("Check Image File static:" + GlobalCacheVariable.FileCheck.ExistImageFile +  "/" + GlobalCacheVariable.FileCheck.TotalImageFile);
          if (GlobalCacheVariable.FileCheck.ExistAudioFile >= GlobalCacheVariable.FileCheck.TotalAudioFile &&
            GlobalCacheVariable.FileCheck.ExistImageFile >= GlobalCacheVariable.FileCheck.TotalImageFile) {
            GlobalVariable.DownloadProgress.IsNoDownload = 1;
            console.log("Download complete, refresh the page.");
            if(reload == true){ window.location.reload(true); } else { $state.reload(); }
          }else{
            self.checkDownload(reload);
          }
        }, 1000); //delay 2 seconds
    },
    checkDelete: function(refreshAll){
      var self = this;
      var refresh = true;
      if (refreshAll == false || refreshAll == undefined) {
        refresh = false;
      }
        setTimeout(function() {
          console.log("Check File Delete:" + GlobalCacheVariable.DeleteCheck.DeletedFile +  "/" + GlobalCacheVariable.DeleteCheck.FileToDelete);
          if (GlobalCacheVariable.DeleteCheck.DeletedFile >= GlobalCacheVariable.DeleteCheck.FileToDelete ) {
            console.log("Delete complete, refresh the page.");
            if (refresh == true) {
              $state.go("app.welcome", {}, { reload: true });
            } else if (refresh == false) {
              $state.reload();
            }

          }else{
            self.checkDelete(refresh);
          }
        }, 1000); //delay 2 seconds
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
    getOnlineCloneContent: function (categoryID) {
      console.log("Read shareCategory clone content online.");
      $http.get(ServerPathVariable.GetShareCategoryClonePath(categoryID)).then(function (data) {
        $localStorage.shareCloneContent = data.data;
      });
      return $localStorage.shareCloneContent;
    }
  };
});

myModule.factory("VoiceRecordService", function ($http, $cordovaMedia, $cordovaNetwork, $cordovaFileTransfer) {
  var captureCfg = {}, audioDataBuffer = [];
  var timerInterVal, timerGenerateSimulatedData, recordingPath;
  var objectURL = null, totalReceivedData = 0;
  return {
    startCapture : function () {
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
          if (objectURL) {
            URL.revokeObjectURL(objectURL);
          }
          timerInterVal = setInterval(function () {
            if (audioinput.isCapturing()) {
              var timer = "" + new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1") + "|Received:" + totalReceivedData;
              console.log(timer);
            }
          }, 1000);
        }
      }
      catch (e) {
        alert("startCapture exception: " + e);
      }
    },
    stopCapture : function (id) {
      try {
        if (window.audioinput && audioinput.isCapturing()) {
          if (timerInterVal) { clearInterval(timerInterVal); }
          if (isMobile.any() && window.audioinput) { audioinput.stop(); } else { clearInterval(timerGenerateSimulatedData); }
          totalReceivedData = 0;
          console.log("Encoding WAV...");
          var encoder = new WavAudioEncoder(captureCfg.sampleRate, captureCfg.channels);
          encoder.encode([audioDataBuffer]);
          audioDataBuffer = [];
          console.log("Encoding WAV finished");
          var blob = encoder.finish("audio/wav");
          console.log("BLOB created");
          window.resolveLocalFileSystemURL(cordova.file.dataDirectory,
            function (dir) {
              dir.getDirectory(id + "/", { create: true, exclusive: false }, success, fail);
              function success(parent) {
                console.log("Parent Name: " + parent.name);
                var fileName = new Date().YYYYMMDDHHMMSS() + ".wav";
                parent.getFile(fileName, { create: true }, function (file) {
                  file.createWriter(function (fileWriter) {
                    fileWriter.write(blob);
                    recordingPath = file.toURL();
                    console.log("File created.");
                    console.log("RecordingPath: " + recordingPath);
                  }, function () { alert("FileWriter error!"); });
                });
              }
              function fail(error) { alert("Unable to create new directory: " + error.code); }
            }, function () { alert("File resolve error!"); });
        }
      }
      catch (e) { alert("stopCapture exception: " + e); }
    },
    checkRecord: function () {
      if (typeof recordingPath == "undefined" || recordingPath == "") {
        alert("Please recorde the audio first.");
        return;
      }
      MediaPlayer.play($cordovaMedia, recordingPath);
    },
    uploadRecordSearch: function (userID, searchRangeList) {
      if (typeof recordingPath == "undefined" || recordingPath == "") {
        alert("Please recorde the audio first.");
        return;
      }
      var ServerPath = ServerPathVariable.GetPostAudioPath();
      var options = new FileUploadOptions();
      options.fileKey = "file";
      options.fileName = recordingPath.substr(recordingPath.lastIndexOf("/") + 1);
      options.mimeType = "audio/wav";
      options.httpMethod = "POST";
      options.params = { uuid: userID, operationType: "Search" };
      console.log("Upload Object:" + JSON.stringify(searchRangeList));
      $cordovaFileTransfer.upload(ServerPath, recordingPath, options).then(
        function (result) {
          console.log("Upload Audio to server success, " + JSON.stringify(result));
          $http.post(ServerPathVariable.PostWordList(), searchRangeList)
            .then(function (data) {
              console("Post User Edit to server Success" + JSON.stringify(data.data));
              //TO DO: After post to server, then do a get method to get back a result list, need server side finish
            });
        }
      );
    },
    uploadRecordVC: function (userID, aID,successCallback) {
      if (typeof recordingPath == "undefined" || recordingPath == "") {
        alert("Please recorde the audio first.");
        return;
      }
      var ServerPath = ServerPathVariable.GetPostAudioPath();
      var options = new FileUploadOptions();
      options.fileKey = "file";
      options.fileName = recordingPath.substr(recordingPath.lastIndexOf("/") + 1);
      options.mimeType = "audio/wav";
      options.httpMethod = "POST";
      options.params = { uuid: userID, operationType: "VC", audioID: aID};
      $cordovaFileTransfer.upload(ServerPath, recordingPath, options).then(
        function (result) {
           console.log("Upload Audio to server success: " + JSON.stringify(result));
           if (typeof successCallback == "function") {
             successCallback();
           }
         }
      );
    },
    returnRecordingPath: function () {
      return recordingPath;
    },
    onAudioInputError: function (error) {
      alert("onAudioInputError event recieved: " + JSON.stringify(error));
    },
    onAudioInputCapture: function (evt) {
      try {
        if (evt && evt.data) {
          totalReceivedData += evt.data.length;
          console.log("Audio data received: " + totalReceivedData);
          audioDataBuffer = audioDataBuffer.concat(evt.data);
        }
      }
      catch (ex) {
        alert("onAudioInputCapture ex: " + ex);
      }
    }
  };
});

myModule.factory("VoiceModelService", function($http, $localStorage) { //Store User Prefile
  return {
    getOnline: function(userId,completeCallback) {
      $http.get(ServerPathVariable.GetVoiceModelProfilePath(userId)).then(function(data) {
        console.log("Get Online VoiceModel Success: " +  JSON.stringify(data));
        $localStorage.voiceModel = data.data;
        if (typeof completeCallback == "function") {
          completeCallback();
        }
      });
    },
    getLatest: function (id) {
      var self = this;
      if ($localStorage.voiceModel) {
        console.log("Read user's voiceModel from LocalStorage.");
      }
      else {
        console.log("No VoiceModel in LocalStorage. Read sample voiceModel.");
        self.saveLocal(self.getDefault(id));
        self.postToServerCallback(self.getDefault(id),function () {
          self.getOnline(id);
        })
      }
      return $localStorage.voiceModel;
    },
    getDefault: function(id) {
      var newVoiceModel = getSampleVoiceModel();
      newVoiceModel.ID = id;
      return newVoiceModel;
    },
    saveLocal: function(newVoiceModel) {
      $localStorage.voiceModel = newVoiceModel;
    },
    postToServerCallback: function (newVoiceModel,successCallback) {
      $http.post(ServerPathVariable.PostVCModelProfilePath(), newVoiceModel)
        .success(function (data, status, headers, config) { // called asynchronously if an error occurs or server returns response with an error status.
          console.log("Post VoiceModelProfile success:" + JSON.stringify(data));
          if (typeof successCallback == "function") {
            successCallback();
          }
        })
        .error(function (data, status, headers, config) { // called asynchronously if an error occurs or server returns response with an error status.
          console.log("post userprofile error :" + JSON.stringify(data));
        });
    },
    changeRecordingStatus: function(voiceModel,sentenceID) {
      for (var i = 0; i < voiceModel.RecordingSentences.length; i++) {
        if (voiceModel.RecordingSentences[i].ID == sentenceID) {
          voiceModel.RecordingSentences[i].IsRecorded = true;
        }
      }
      return voiceModel;
    }
  };
});

myModule.factory("AppearanceService", function($localStorage) { //Store User Prefile
  return {
    getLatest: function () {
      var self = this;
      if ($localStorage.AppearanceConfig) {
        console.log("Read user's AppearanceConfig from LocalStorage.");
      }
      else {
        console.log("No AppearanceConfig in LocalStorage. Read sample AppearanceConfig.");
        self.saveLocal(self.getDefault());
      }
      return $localStorage.AppearanceConfig;
    },
    getDefault: function() {
      return getDefaultUserConfig();
    },
    saveLocal: function(newAppearanceConfig) {
      $localStorage.AppearanceConfig = newAppearanceConfig;
    },
  };
});

myModule.factory("PracticeService", function ($localStorage) {
  return {
    getLatest: function () {
      /*var self = this;
      if ($localStorage.PracticeBook) {
        console.log("Read user's PracticeBook from LocalStorage.");
      }
      else {
        console.log("No PracticeBook in LocalStorage. Read sample PracticeBook.");
        self.saveLocal(self.getDefault());
      }
      return $localStorage.PracticeBook;*/
      return this.getDefault();
    },
    getDefault: function () {
      return getSamplePracticeContent();
    },
    saveLocal: function (newPracticeBook) {
      $localStorage.PracticeBook = newPracticeBook;
    },
    getPracticeObject: function (objectName) {
      var practiceTypes = this.getLatest().PracticeTypes;
      for (var i = 0; i < practiceTypes.length; i++) {
        if (practiceTypes[i].PracticeType == objectName) {
          return practiceTypes[i].PracticeObject;
        }
      }
    },
    practiceListToTargetLanguage(targetObject, targetLanguage) {
      var returnObject = [];
      for (var i = 0; i < targetObject.length; i++) {
        if (targetObject[i].Content.length != 0) {
          var returnContentObject = {};
          returnContentObject.Index = targetObject[i].Index;
          var flag = false;
          for (var j = 0; j < targetObject[i].Content.length; j++) {
            if (targetObject[i].Content[j].Language == targetLanguage) {
              returnContentObject.Title = targetObject[i].Content[j].Title;
              returnContentObject.Author = targetObject[i].Content[j].Author;
              returnContentObject.Content = targetObject[i].Content[j].Text;
              flag = true;
              break;
            }
          }
          if (flag == false) {
            for (var j = 0; j < targetObject[i].Content.length; j++) {
              if (targetObject[i].Content[j].Language == targetObject[i].DisplayNameLanguage) {
                returnContentObject.Title = targetObject[i].Content[j].Title;
                returnContentObject.Author = targetObject[i].Content[j].Author;
                returnContentObject.Content = targetObject[i].Content[j].Text;
                break;
              }
            }
          }
          returnObject.push(returnContentObject);
        } else {

        }
      }
      return returnObject;
    }
  };
});
