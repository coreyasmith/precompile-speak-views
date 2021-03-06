define(["sitecore", "/-/speak/v1/ExperienceEditor/ExperienceEditor.js"], function (Sitecore, ExperienceEditor) {
  Sitecore.Commands.OpenSelectVersionGallery =
  {
    notificationAdded: false,

    canExecute: function (context) {
      var queryString = "?itemId=" + context.currentContext.itemId +
        "&pageSite=" + context.currentContext.siteName +
        "&database=" + context.currentContext.database +
        "&la=" + context.currentContext.language +
        "&vs=" + context.currentContext.version;

      context.button.set("galleryUrlQueryString", queryString);

      if (!ExperienceEditor.isInMode("edit")) {
        return false;
      }

      if (!this.notificationAdded) {
        this.notificationAdded = true;
        var notificationMessage = !context.currentContext.isFallback ? context.currentContext.latestVersionResponse : "";
        if (notificationMessage != '') {
          var id = "GoToLatestVersionID";
          var responseResult = notificationMessage.split('|');
          var notification = ExperienceEditor.RibbonApp.getApp().showNotification("notification", responseResult[1], true);
          if (notification) {
            notification.innerHTML = notification.innerHTML.replace("{", "<b><a href='#' id='" + id + "'>").replace("}", "</a></b>");
          }

          jQuery("#" + id).click(function () {
            var url = ExperienceEditor.Web.removeQueryStringParameter(ExperienceEditor.getPageEditingWindow().location.href, "sc_version");
            ExperienceEditor.getPageEditingWindow().Sitecore.PageModes.Utility.removeCookie(responseResult[0]);
            ExperienceEditor.navigateToUrl(url);
          });
        }
      }

      return context.currentContext.canSelectVersion;
    },

    execute: function (context) {
    }
  };
});
