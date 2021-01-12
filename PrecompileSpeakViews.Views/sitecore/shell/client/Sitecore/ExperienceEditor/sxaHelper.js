define(
  [
    "sitecore"
  ],
  function (Sitecore) {
      var sxaHelper = {
      };

      sxaHelper.Helpers = {
          isId: function (value) {
              if (Sitecore.Speak != undefined) {
                  return Sitecore.Speak.Helpers.id.isId(value);
              }
              return Sitecore.Helpers.id.isId(value);
          }
      }

      return sxaHelper;
  });