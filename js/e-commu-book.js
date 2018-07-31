var ServerPathVariable = new function () { //User to store server return path
  this.hostname = "http://sepc155.se.cuhk.edu.hk:8080/";
  this.path = "ECommuBook2-2.0.4-SNAPSHOT/";
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
  this.PostUserProfilePath = function () {
    return (this.hostname + this.path + "userProfile/post");
  };
  this.GetUserProfileCloneItemPath = function (userUuid) {
    return (this.hostname + this.path + "userProfile/" + userUuid + '/' + '/cloneItem');
  };
  this.GetUserProfilePath = function (userUuid) {
    return (this.hostname + this.path + "userProfile/" + userUuid);
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
  this.Appearance = new function () {
    this.itemNormalFontSize = 24;
    this.itemNormalPicSize = 220;
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
    { name: "N/A", value: "xx" }
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
  this.AlertMessageList = new function () {
    this.UploadAlert = function () {
      return "Are you sure to share this category? Attention: if you share this category, all information will be public on internet and can be viewed by others.";
    };
  };
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
    this.AddDletedFile = function () {
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
  this.showLoadingPopup = function ($mdDialog, $ionicSideMenuDelegate) {
    $mdDialog.show({
      controller: this.LoadPopupController,
      templateUrl: "templates/popup-loading.tmpl.html",
      parent: angular.element(document.body),
      clickOutsideToClose: false,
      fullscreen: false // Only for -xs, -sm breakpoints.
    }) .then(
        function (answer) {},
        function () {}
      );
  };
  this.hideLoadingPopup = function ($mdDialog) {
    $mdDialog.hide();
  };
  this.LoadPopupController = function ($scope, $mdDialog, $ionicSideMenuDelegate) {
    $scope.downloaded = NaN;
    $scope.total = NaN;
    $scope.hide = function () { $mdDialog.hide(); };
    $scope.cancel = function () { $mdDialog.cancel(); };
    $scope.answer = function (answer) { $mdDialog.hide(answer); };

    var loop = setInterval(function () {
      $scope.downloaded = GlobalVariable.DownloadProgress.GetDownloaded();
      $scope.total = GlobalVariable.DownloadProgress.GetTotal();
      if ($scope.total > 0) {
        $scope.precentage = Math.round(100.0 * $scope.downloaded / $scope.total);
      }
      else {
        $scope.precentage = 0;
      }
      $scope.message = "Loading, Please wait";
      if (($scope.downloaded == $scope.total && $scope.total > 0) || GlobalVariable.DownloadProgress.IsNoDownload == 1) {
        clearInterval(loop);
        setTimeout(function () {
          $ionicSideMenuDelegate.toggleLeft();
          $scope.hide();
        }, 2500);
      }
    }, 500);
  };
};

function updateDisplayName(userProfile) { //Current not used
  var category, item, targetLanguage = userProfile.DISPLAY_LANGUAGE;
  for (i = 0; i < userProfile.Categories.length; i++) {
    category = userProfile.Categories[i];
    category.DisplayName = getObjectTranslation(category, targetLanguage);
    for (j = 0; j < category.Items.length; j++) {
      item = category.Items[j];
      item.DisplayName = getObjectTranslation(item, targetLanguage);
    }
  }
  return userProfile;
}
function getObjectTranslation(itemObject, targetLanguage) {
  for (var k = 0; k < itemObject.DisplayMultipleLanguage.length; k++) {
    if (itemObject.DisplayMultipleLanguage[k].Language == targetLanguage) {
      return itemObject.DisplayMultipleLanguage[k].Text;
    }
  }
  return "";
}
function getItemObjectByItemId(userProfile, itemId) {
  for (i = 0; i < userProfile.Categories.length; i++) {
    category = userProfile.Categories[i];
    for (j = 0; j < category.Items.length; j++) {
      item = category.Items[j];
      if (item.ID == itemId) {
        return item;
      }
    }
  }
  return null;
}
function getObjectById(userProfile, id) {
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
}
function getCategoryIndexById(userProfile, categoryid) {
  for (var i = 0; i < userProfile.Categories.length; i++) {
    if (userProfile.Categories[i].ID == categoryid) {
      return i;
    }
  }
  return -1;
}
function getCategoryById(userProfile, categoryid) {
  for (var i = 0; i < userProfile.Categories.length; i++) {
    if (userProfile.Categories[i].ID == categoryid) {
      return userProfile.Categories[i];
    }
  }
  return null;
}
function getItemIndexByItemId(category, itemId) {
  for (var i = 0; i < category.Items.length; i++) {
    if (category.Items[i].ID == itemId) {
      return i;
    }
  }
  return -1;
}
function normalizeDisplayName(text) {
  return text
    .replace("/", " ")
    .replace(".", " ")
    .replace(",", " ");
}
function playAudio(src) {
  console.log("play audio:" + src);
  var media = new Media(encodeURI(src), null, null, null);
  media.play();
}
function playSpeechAudio($cordovaMedia, src) {
  media = $cordovaMedia.newMedia(src);
  media.play();
}
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return ( s4() +  s4() +  "-" + s4() +  "-" +  s4() +  "-" + s4() +  "-" +  s4() +  s4() +  s4() );
}
