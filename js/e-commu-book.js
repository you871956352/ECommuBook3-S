function ServerPathVariable() {}
ServerPathVariable.hostname = "http://sepc155.se.cuhk.edu.hk:8080/";
ServerPathVariable.path = "ECommuBook2-2.0.3-SNAPSHOT/";
ServerPathVariable.GetBingAudioPath = function(speechLanguageCode,speechGender,text) {
  text = text.replace("/", " ");
  return (
    ServerPathVariable.hostname +
    ServerPathVariable.path +
    "audio/bing/" +
    speechLanguageCode +
    "/" +
    speechGender +
    "/" +
    text +
    ".mp3"
  );
};
ServerPathVariable.GetBingAudioPathWithUserProfile = function(userProfile,text) {
  return (
    ServerPathVariable.hostname +
    ServerPathVariable.path +
    "audio/bing/" +
    userProfile.SPEECH_LANGUAGE_CODE +
    "/" +
    userProfile.SPEECH_GENDER +
    "/" +
    text +
    ".mp3"
  );
};
ServerPathVariable.GetImagePath = function(itemId) {
  return (
    ServerPathVariable.hostname +
    ServerPathVariable.path +
    "image/" +
    itemId +
    ".jpg"
  );
};
ServerPathVariable.GetPostImagePath = function() {
  return ServerPathVariable.hostname + ServerPathVariable.path + "image/post";
};
ServerPathVariable.PostUserProfilePath = function() {
  return (
    ServerPathVariable.hostname + ServerPathVariable.path + "userProfile/post"
  );
};
ServerPathVariable.GetUserProfileCloneItemPath = function(userUuid) {
  return (
    ServerPathVariable.hostname +
    ServerPathVariable.path +
    "userProfile/" +
    userUuid + '/' + 
    '/cloneItem'
  );
};
ServerPathVariable.GetUserProfilePath = function(userUuid) {
  return (
    ServerPathVariable.hostname +
    ServerPathVariable.path +
    "userProfile/" +
    userUuid
  );
};
ServerPathVariable.GetTranslationPath = function(sourceLanguage, sourceText, targetLanguage) {
  return (
    ServerPathVariable.hostname +
    ServerPathVariable.path +
    'translation/' + 
    sourceLanguage + '/' + 
    sourceText + '/' + 
    targetLanguage
  );
}
ServerPathVariable.getTranslationsPath = function(sourceLanguage, sourceText) {
  return (
    ServerPathVariable.hostname +
    ServerPathVariable.path +
    'translations/' + 
    sourceLanguage + '/' + 
    sourceText
  );
}

function GlobalVariable() {}
GlobalVariable.DownloadProgress = {};
GlobalVariable.DownloadProgress.Reset = function() {
  GlobalVariable.DownloadProgress.Downloaded = 0;
  GlobalVariable.DownloadProgress.Total = 0;
  GlobalVariable.DownloadProgress.IsNoDownload = 0;
};
GlobalVariable.DownloadProgress.AddDownloaded = function() {
  GlobalVariable.DownloadProgress.Downloade++;
};
GlobalVariable.DownloadProgress.AddTotal = function() {
  GlobalVariable.DownloadProgress.Total++;
};
GlobalVariable.DownloadProgress.ReduceTotal = function() {
  GlobalVariable.DownloadProgress.Total--;
};
GlobalVariable.DownloadProgress.GetText = function() {
  return [
    GlobalVariable.DownloadProgress.Downloaded,
    GlobalVariable.DownloadProgress.Total
  ];
};
GlobalVariable.DownloadProgress.GetDownloaded = function() {
  return GlobalVariable.DownloadProgress.Downloaded;
};
GlobalVariable.DownloadProgress.GetTotal = function() {
  return GlobalVariable.DownloadProgress.Total;
};
GlobalVariable.LocalCacheDirectory = function() {
  return window.cordova.file.dataDirectory;
};

GlobalVariable.Appearance = {};
GlobalVariable.Appearance.itemNormalFontSize = 24;
GlobalVariable.LanguageList = [
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


function GlobalCacheVariable() {};
GlobalCacheVariable.FileCheck = {};
GlobalCacheVariable.FileCheck.Reset = function() {
  GlobalCacheVariable.FileCheck.ExistAudioFile = 0;
  GlobalCacheVariable.FileCheck.ExistImageFile = 0;
  GlobalCacheVariable.FileCheck.TotalAudioFile = 0;
  GlobalCacheVariable.FileCheck.TotalImageFile = 0;
};


function updateDisplayName(userProfile) {
  targetLanguage = userProfile.DISPLAY_LANGUAGE;
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
  translationText = "";
  for (var k = 0; k < itemObject.DisplayMultipleLanguage.length; k++) {
    translationObject = itemObject.DisplayMultipleLanguage[k];
    if (translationObject.Language == targetLanguage) {
      translationText = translationObject.Text;
      break;
    }
  }
  return translationText;
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
  for(var i = 0; i < userProfile.Categories.length; i++) {
    if(userProfile.Categories[i].ID == categoryid) {
      return i;
    }
  }
  return -1;
}
function getCategoryById(userProfile, categoryid) {
  for(var i = 0; i < userProfile.Categories.length; i++) {
    if(userProfile.Categories[i].ID == categoryid) {
      return userProfile.Categories[i];
    }
  }
  return null;
}
function getItemIndexByItemId(category, itemId) {
  for(var i = 0; i< category.Items.length; i++) {
    if(category.Items[i].ID == itemId) {
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


function MediaPlayer() {}
MediaPlayer.media = {};
MediaPlayer.play = function($cordovaMedia, src) {
  try {
    MediaPlayer.media.stop();
  } catch (err) {
  } finally {
  }
  try {
    MediaPlayer.media.release();
  } catch (err) {
  } finally {
  }
  src = src.replace("file://", ""); //fix ios path problem
  MediaPlayer.media = $cordovaMedia.newMedia(src);
  MediaPlayer.media.play();
};

function playSpeechAudio($cordovaMedia, src) {
  media = $cordovaMedia.newMedia(src);
  media.play();
}


function LoadingDialog() {}
LoadingDialog.showLoadingPopup = function($mdDialog, $ionicSideMenuDelegate) {
  $mdDialog.show({
      controller: LoadingDialog.Controller,
      templateUrl: "templates/popup-loading.tmpl.html",
      parent: angular.element(document.body),
      clickOutsideToClose: false,
      fullscreen: false // Only for -xs, -sm breakpoints.
    })
    .then(
      function(answer) {

      },
      function() {
        //$scope.status = 'You cancelled the dialog.';
      }
    );
};
LoadingDialog.hideLoadingPopup = function($mdDialog) {
  $mdDialog.hide();
};
LoadingDialog.Controller = function($scope, $mdDialog, $ionicSideMenuDelegate) {
  $scope.downloaded = -1;
  $scope.total = 0;
  $scope.hide = function() {
    $mdDialog.hide();
  };
  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.answer = function(answer) {
    $mdDialog.hide(answer);
  };

  console.log(GlobalVariable.DownloadProgress.GetText());
  var loop = setInterval(function() {
    $scope.downloaded = GlobalVariable.DownloadProgress.GetDownloaded();
    $scope.total = GlobalVariable.DownloadProgress.GetTotal();
    if($scope.total > 0)
      $scope.precentage = Math.round(100.0 * $scope.downloaded / $scope.total);
    else
      $scope.precentage = 0;
    $scope.message = "Now Loading, please wait";

    if (($scope.downloaded == $scope.total && $scope.total > 0) || GlobalVariable.DownloadProgress.IsNoDownload == 1) {
      clearInterval(loop);
      setTimeout(function() {
        $ionicSideMenuDelegate.toggleLeft();
        $scope.hide();
      }, 2500);
    }
  }, 500);
};

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return (
    s4() +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    s4() +
    s4()
  );
}
