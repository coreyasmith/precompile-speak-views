define(["sitecore", "/-/speak/v1/ExperienceEditor/ExperienceEditor.js"], function (Sitecore, ExperienceEditor) {
    Sitecore.Commands.TagItem =
        {
            canExecute: function (context) {
                var requestContext = context.app.clone(context.currentContext);
                requestContext.target = context.currentContext.value;
                var canTag = context.app.canExecute("ExperienceEditor.ContentTagging.CanTagItem", requestContext);
                return canTag;
            },
            execute: function (context) {
                ExperienceEditor.modifiedHandling(true, function () {
                    ExperienceEditor.PipelinesUtil.generateRequestProcessor("ExperienceEditor.ContentTagging.TagItem", function () { }, context.currentContext).execute(context.currentContext);
                });
            }
        };
});
