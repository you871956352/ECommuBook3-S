var ServerPathVariable = new function () { //User to store server return path
  this.hostname = "http://sepc155.se.cuhk.edu.hk:8080/";
  this.path = "ECommuBook2-2.0.5-SNAPSHOT/";
  this.GetBingAudioPath = function (speechLanguageCode, speechGender, text) {
    text = text.replace("/", " ");
    return (this.hostname + this.path + "audio/bing/" + speechLanguageCode + "/" + speechGender + "/" + text + ".mp3");
  };
  this.GetBingAudioPathWithUserProfile = function (userProfile, text) {
    return (this.hostname + this.path + "audio/bing/" + userProfile.SPEECH_LANGUAGE_CODE + "/" +
      userProfile.SPEECH_GENDER + "/" + text + ".mp3");
  };
  this.GetImagePath = function (itemId) {
    return (this.hostname + this.path + "image/" + itemId + ".jpg");
  };
  this.GetPostImagePath = function () {
    return this.hostname + this.path + "image/post";
  };
  this.GetPostAudioPath = function () {
    return this.hostname + this.path + "audio/serverStorage/post";
  };
  this.PostUserProfilePath = function () {
    return (this.hostname + this.path + "userProfile/post");
  };
  this.PostVCModelProfilePath = function () {
    return (this.hostname + this.path + "vc/VoiceModelList/post");
  };
  this.PostUserEditPath = function () {
    return (this.hostname + this.path + "userProfile/userEdit/post");
  }
  this.GetUserProfileCloneItemPath = function (userUuid) {
    return (this.hostname + this.path + "userProfile/" + userUuid + '/' + '/cloneItem');
  };
  this.GetUserProfilePath = function (userUuid) {
    return (this.hostname + this.path + "userProfile/" + userUuid);
  };
  this.GetVoiceModelProfilePath = function (userUuid) {
    return (this.hostname + this.path + "vc/VoiceModelList/" + userUuid);
  };
  this.GetTranslationPath = function (sourceLanguage, sourceText, targetLanguage) {
    return (this.hostname + this.path + 'translation/' + sourceLanguage + '/' + sourceText + '/' + targetLanguage);
  };
  this.getTranslationsPath = function (sourceLanguage, sourceText) {
    return (this.hostname + this.path + 'translations/' + sourceLanguage + '/' + sourceText);
  };
  this.GetSharePath = function () {
    return (this.hostname + this.path + 'category/share');
  };
  this.GetUploadSharePath = function (categoryID) {
    return this.GetSharePath() + "/" + categoryID;
  };
  this.GetShareCategoryClonePath = function (categoryID) {
    return this.hostname + this.path + "category/" + categoryID + "/clone";
  }
  this.GetAddCategoryToUserProfilePath = function (userId, categoryID) {
    return this.hostname + this.path + "userProfile/" + userId + "/addCategory/" + categoryID;
  }
};

var GlobalVariable = new function () { //User to store some global variable
  this.DeviceInformation = new function () {
    this.DeviceWidth = window.screen.width;
    this.DeviceHeight = window.screen.height;
    this.DevicePixelRatio = window.devicePixelRatio;
  };
  this.Appearance = new function () {
    this.itemNormalFontSize = parseInt((window.screen.width + window.screen.height) / 65);
    this.itemNormalPicSize = parseInt((window.screen.width + window.screen.height) / 6.5);
  };
  this.DownloadProgress = new function () {
    this.Downloaded = 0;
    this.Total = 0;
    this.IsNoDownload = 0;
    this.Reset = function () {
      this.Downloaded = 0;
      this.Total = 0;
      this.IsNoDownload = 0;
    };
    this.AddDownloaded = function () {
      this.Downloaded++;
    };
    this.AddTotal = function () {
      this.Total++;
    };
    this.ReduceTotal = function () {
      this.Total--;
    };
    this.GetText = function () {
      return [ this.Downloaded, this.Total ];
    };
    this.GetDownloaded = function () {
      return this.Downloaded;
    };
    this.GetTotal = function () {
      return this.Total;
    };
  };
  this.LocalCacheDirectory = function () {
    return window.cordova.file.dataDirectory;
  };
  this.GetLocalAudioDirectory = function (userProfile) {
    return this.LocalCacheDirectory() + "audio/bing/" + userProfile.SPEECH_LANGUAGE_CODE + "/" + userProfile.SPEECH_GENDER + "/";
  };
  this.GetLocalAudioDirectoryByInput = function (targetSpeechLanguage, targetSpeechGender) {
    return this.LocalCacheDirectory() + "audio/bing/" + targetSpeechLanguage + "/" + targetSpeechGender + "/";
  };
  this.GetLocalAudioDirectoryByDisplayLanguage = function (targetDisplayLanguage) {
    var LanguageObject = this.GetDefaultSpeakerForDisplayLanguage(targetDisplayLanguage);
    return this.GetLocalAudioDirectoryByInput(LanguageObject.targetSpeechLanguage, LanguageObject.targetSpeechGender);
  };
  this.GetDefaultSpeakerForDisplayLanguage = function (targetDisplayLanguage) {
    var targetSpeechLanguage, targetSpeechGender;
    for (var i = 0; i < this.SpeechLanguageList.length; i++) {
      if (this.SpeechLanguageList[i].language == targetDisplayLanguage) {
        targetSpeechLanguage = this.SpeechLanguageList[i].value;
        break;
      }
    }
    for (var i = 0; i < this.GenderList.length; i++) {
      if (this.GenderList[i].language == targetSpeechLanguage) {
        targetSpeechGender = this.GenderList[i].value;
        break;
      }
    }
    return { targetDisplayLanguage, targetSpeechLanguage, targetSpeechGender };
  };
  this.DisplayLanguageList = [
    { name: "粵語", value: "yue" },
    { name: "简体中文", value: "zh-CHS" },
    { name: "繁體中文(台灣)", value: "zh-CHT" },
    { name: "English", value: "en" },
    { name: "Deutsche", value: "de" },
    { name: "Español", value: "es" },
    { name: "français", value: "fr" },
    { name: "italiano", value: "it" },
    { name: "日本語", value: "ja" },
    { name: "português", value: "pt" },
    { name: "русский", value: "ru" },
    { name: "한국어", value: "ko" },
  ];
  this.SpeechLanguageList = [
    { name: "[ar-EG]Arabic (Egypt)", value: "ar-EG", language: "ar" },
    { name: "[de-DE]German (Germany)", value: "de-DE", language: "de" },
    { name: "[en-AU]English (Australia)", value: "en-AU", language: "en" },
    { name: "[en-CA]English (Canada)", value: "en-CA", language: "en" },
    { name: "[en-GB]English (United Kingdom)", value: "en-GB", language: "en" },
    { name: "[en-IN]English (India)", value: "en-IN", language: "en" },
    { name: "[en-US]English (United States)", value: "en-US", language: "en" },
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
  this.GenderList = [
    { name: "أنثى", value: "female", language: "ar-EG" },
    { name: "weiblich", value: "female", language: "de-DE" },
    { name: "männlich", value: "male", language: "de-DE"},
    { name: "Female", value: "female", language: "en-AU"},
    { name: "Female", value: "female", language: "en-CA"},
    { name: "Female", value: "female", language: "en-GB"},
    { name: "Male", value: "male", language: "en-GB"},
    { name: "Male", value: "male", language: "en-IN"},
    { name: "Female", value: "female", language: "en-US"},
    { name: "Male", value: "male", language: "en-US"},
    { name: "hembra", value: "female", language: "es-ES"},
    { name: "masculino", value: "male", language: "es-ES"},
    { name: "masculino", value: "male", language: "es-MX"},
    { name: "femelle", value: "female", language: "fr-CA"},
    { name: "femelle", value: "female", language: "fr-FR"},
    { name: "mâle", value: "male", language: "fr-FR"},
    { name: "maschio", value: "male", language: "it-IT"},
    { name: "女性", value: "female", language: "ja-JP"},
    { name: "男性", value: "male", language: "ja-JP"},
    { name: "masculino", value: "male", language: "pt-BR"},
    { name: "женский пол", value: "female", language: "ru-RU"},
    { name: "мужской", value: "male", language: "ru-RU"},
    { name: "女", value: "female", language: "zh-CN"},
    { name: "男", value: "male", language: "zh-CN"},
    { name: "女", value: "female", language: "zh-HK"},
    { name: "男", value: "male", language: "zh-HK"},
    { name: "女", value: "female", language: "zh-TW"},
    { name: "男", value: "male", language: "zh-TW"},
    { name: "女", value: "female", language: "ko-KR"}
  ];
  this.currentConstructSentence = "";
};

var GlobalCacheVariable = new function () { //
  this.FileCheck = new function () {
    this.Reset = function () {
      this.ExistAudioFile = 0;
      this.ExistImageFile = 0;
      this.TotalAudioFile = 0;
      this.TotalImageFile = 0;
    };
    this.AddExistImageFile = function () {
      this.ExistImageFile++;
    }
    this.AddExistAudioFile = function () {
      this.ExistAudioFile++;
    }
    this.SetTotalImageFile = function (newNumber) {
      this.TotalImageFile = newNumber;
    }
    this.SetTotalAudioFile = function (newNumber) {
      this.TotalAudioFile = newNumber;
    }
  };
  this.DeleteCheck = new function () {
    this.Reset = function () {
      this.FileToDelete = 0;
      this.DeletedFile = 0;
    };
    this.AddDeletedFile = function () {
      this.DeletedFile++;
    }
    this.SetFileToDelete = function (newNumber) {
      this.FileToDelete = newNumber;
    }
  };
};

var MediaPlayer = new function () {
  this.media = {};
  this.play = function ($cordovaMedia, src) {
    try {
      this.media.stop();
    } catch (err) {
    } finally {
    }
    try {
      this.media.release();
    } catch (err) {
    } finally {
    }
    src = src.replace("file://", ""); //fix ios path problem
    this.media = $cordovaMedia.newMedia(src);
    this.media.play();
  };
};

var LoadingDialog = new function () {
  this.showLoadingPopup = function ($mdDialog, $ionicSideMenuDelegate, isDelete) {
    var TargetController = this.LoadPopupController;
    if (isDelete == true) {
      TargetController = this.LoadPopupControllerDelete;
    }
    $mdDialog.show({
      controller: TargetController,
      templateUrl: "templates/popup-loading.tmpl.html",
      parent: angular.element(document.body),
      clickOutsideToClose: false,
      fullscreen: false // Only for -xs, -sm breakpoints.
    });
  };
  this.LoadPopupController = function ($scope, $mdDialog, $ionicSideMenuDelegate, UserProfileService) {
    $scope.subMenuProfileObject = UserProfileService.getMenuProfileSubObjectWithInputLanguage("Loading", $scope.currentDisplayLanguage);
    $scope.currentDisplayLanguage = UserProfileService.getLatest().DISPLAY_LANGUAGE;
    $scope.downloaded = NaN;
    $scope.total = NaN;
    $scope.hide = function () { $mdDialog.hide(); };
    var loop = setInterval(function () {
      $scope.downloaded = GlobalVariable.DownloadProgress.GetDownloaded();
      $scope.total = GlobalVariable.DownloadProgress.GetTotal();
      if ($scope.total > 0) {
        $scope.precentage = Math.round(100.0 * $scope.downloaded / $scope.total);
      }
      else {
        $scope.precentage = 0;
      }

      if (($scope.downloaded == $scope.total && $scope.total > 0) || GlobalVariable.DownloadProgress.IsNoDownload == 1) {
        clearInterval(loop);
        setTimeout(function () { $scope.hide(); }, 2500);
      }
    }, 500);
  };
  this.LoadPopupControllerDelete = function ($scope, $mdDialog, $ionicSideMenuDelegate, UserProfileService) {
    $scope.subMenuProfileObject = UserProfileService.getMenuProfileSubObjectWithInputLanguage("Loading", $scope.currentDisplayLanguage);
    $scope.currentDisplayLanguage = UserProfileService.getLatest().DISPLAY_LANGUAGE;
    $scope.downloaded = NaN;
    $scope.total = NaN;
    $scope.hide = function () { $mdDialog.hide(); };
    var loop = setInterval(function () {
      $scope.downloaded = GlobalCacheVariable.DeleteCheck.DeletedFile;
      $scope.total = GlobalCacheVariable.DeleteCheck.FileToDelete;
      if ($scope.total > 0) {
        $scope.precentage = Math.round(100.0 * $scope.downloaded / $scope.total);
      }
      else {
        $scope.precentage = 0;
      }

      if (($scope.downloaded == $scope.total && $scope.total > 0) || GlobalVariable.DownloadProgress.IsNoDownload == 1) {
        clearInterval(loop);
        setTimeout(function () { $scope.hide(); }, 2500);
      }
    }, 500);
  };
};

var UtilityFunction = new function () {
  this.findCategoryObjectByItemID = function (userProfile, itemID) {
    for (var i = 0; i < userProfile.Categories.length; i++) {
      for (var j = 0; j < userProfile.Categories[i].Items.length; j++) {
        if (userProfile.Categories[i].Items[j].ID == itemID) {
          return userProfile.Categories[i];
        }
      }
    }
    console.log("Cannot find this item");
    return {};
  };
  this.getObjectTranslation = function (itemObject, targetLanguage) {
    for (var k = 0; k < itemObject.DisplayMultipleLanguage.length; k++) {
      if (itemObject.DisplayMultipleLanguage[k].Language == targetLanguage) {
        return itemObject.DisplayMultipleLanguage[k].Text;
      }
    }
    return "";
  };
  this.getObjectById = function (userProfile, id) {
    for (i = 0; i < userProfile.Categories.length; i++) {
      category = userProfile.Categories[i];
      if (category.ID == id) {
        return category;
      }
      for (j = 0; j < category.Items.length; j++) {
        item = category.Items[j];
        if (item.ID == id) {
          return item;
        }
      }
    }
    return null;
  };
  this.getObjectByTranslationText = function (userProfile, translationText, targetLanguage) {
    for (var i = 0; i < userProfile.Categories.length; i++) {
      for (var j = 0; j < userProfile.Categories[i].DisplayMultipleLanguage.length; j++) {
        if (userProfile.Categories[i].DisplayMultipleLanguage[j].Language == targetLanguage) {
          if (userProfile.Categories[i].DisplayMultipleLanguage[j].Text == translationText) {
            return { object: userProfile.Categories[i], type: "category" };
          }
        }
      }
      for (var j = 0; j < userProfile.Categories[i].Items.length; j++) {
        for (var k = 0; k < userProfile.Categories[i].Items[j].DisplayMultipleLanguage.length; k++) {
          if (userProfile.Categories[i].Items[j].DisplayMultipleLanguage[k].Language == targetLanguage) {
            if (userProfile.Categories[i].Items[j].DisplayMultipleLanguage[k].Text == translationText) {
              return { object: userProfile.Categories[i].Items[j], type: "item" };
            }
          }
        }
      }
    }
    return { object: null, type: "undefined" };
  };
  this.getWordListByObject = function (inputObject, targetLanguage, mode) {
    if (mode == "All") {
      var userProfile = inputObject;
      var returnList = [];
      for (var i = 0; i < userProfile.Categories.length; i++) {
        for (var j = 0; j < userProfile.Categories[i].DisplayMultipleLanguage.length; j++) {
          if (userProfile.Categories[i].DisplayMultipleLanguage[j].Language == targetLanguage) {
            returnList.push(userProfile.Categories[i].DisplayMultipleLanguage[j].Text);
            break;
          }
        }
        var category = userProfile.Categories[i];
        for (var k = 0; k < category.Items.length; k++) {
          for (var j = 0; j < category.Items[k].DisplayMultipleLanguage.length; j++) {
            if (category.Items[k].DisplayMultipleLanguage[j].Language == targetLanguage) {
              returnList.push(category.Items[k].DisplayMultipleLanguage[j].Text);
              break;
            }
          }
        }
      }
      return returnList;
    }
    else if (mode == "Category") {
      var userProfile = inputObject;
      var returnList = ["All"];
      for (var i = 0; i < userProfile.Categories.length; i++) {
        for (var j = 0; j < userProfile.Categories[i].DisplayMultipleLanguage.length; j++) {
          if (userProfile.Categories[i].DisplayMultipleLanguage[j].Language == targetLanguage) {
            returnList.push(userProfile.Categories[i].DisplayMultipleLanguage[j].Text);
            break;
          }
        }
      }
      return returnList;
    }
    else if (mode == "Item") {
      var returnList = [];
      var targetCategory = inputObject;
      for (var k = 0; k < targetCategory.Items.length; k++) {
        for (var j = 0; j < targetCategory.Items[k].DisplayMultipleLanguage.length; j++) {
          if (targetCategory.Items[k].DisplayMultipleLanguage[j].Language == targetLanguage) {
            returnList.push(targetCategory.Items[k].DisplayMultipleLanguage[j].Text);
            break;
          }
        }
      }
      return returnList;
    }
  }
  this.getCategoryIndexById = function (userProfile, categoryid) {
    for (var i = 0; i < userProfile.Categories.length; i++) {
      if (userProfile.Categories[i].ID == categoryid) {
        return i;
      }
    }
    return -1;
  };
  this.getItemIndexByItemId = function (category, itemId) {
    for (var i = 0; i < category.Items.length; i++) {
      if (category.Items[i].ID == itemId) {
        return i;
      }
    }
    return -1;
  };
  this.getRecordedVoiceCount = function (voiceModel) {
    var c = 0;
    for (var i = 0; i < voiceModel.RecordingSentences.length; i++) {
      if (voiceModel.RecordingSentences[i].IsRecorded == true) {
        c += 1;
      }
    }
    return c;
  };
  this.getFirstUnrecordedSentence = function (voiceModel) {
    for (var i = 0; i < voiceModel.RecordingSentences.length; i++) {
      if (voiceModel.RecordingSentences[i].IsRecorded == false) {
        console.log("getFirstUnrecordedSentence:" +  voiceModel.RecordingSentences[i].DisplayName);
        return voiceModel.RecordingSentences[i];
      }
    }
  };
  this.normalizeDisplayName = function (text) {
    return text
      .replace("/", " ")
      .replace(".", " ")
      .replace(",", " ");
  };
  this.guid = function () {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return (s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4());
  };
};
