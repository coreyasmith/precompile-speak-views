define(["sitecore", "/-/speak/v1/ExperienceEditor/ExperienceEditor.js", "/-/speak/v1/ExperienceEditor/TranslationUtil.js"], function (Sitecore, ExperienceEditor, TranslationUtil) {
  Sitecore.Commands.Publish =
  {
    canExecute: function (context) {
      return context.app.canExecute("ExperienceEditor.Publish.CanPublish", context.currentContext);
    },
    execute: function (context) {
      var that = this;
      ExperienceEditor.getPageDatasourcesItemIDs(context, function (itemIDs) {
        if (itemIDs.length == 0) {
          that.showPublishDialog(context);
          return;
        }

        ExperienceEditor.areItemsInFinalWorkflowState(context, itemIDs, function (result) {
          if (result.notInFinalStateCount == 0) {
            that.showPublishDialog(result.context);
            return;
          }
          var dialogMessage = "%3Cbr/%3E%3Cp%3E%3Cb%3E" + TranslationUtil.translateTextByServer(TranslationUtil.keys.The_associated_content_cannot_be_published, ExperienceEditor) + "%3C/b%3E%3C/p%3E%3Cbr/%3E";
          dialogMessage += TranslationUtil.translateTextByServer(TranslationUtil.keys.This_page_contains_associated_content_that_has_not_been_approved_for_publishing_To_publish_the_associated_content_move_the_relevant_items_to_the_final_workflow_stateDo_you_want_to_publish_anyway, ExperienceEditor);
          dialogMessage = dialogMessage.replace("<br/>", "%3Cbr%2F%3E").replace("<br/>", "%3Cbr%2F%3E");
          ExperienceEditor.Dialogs.confirm(dialogMessage, function (isOk) {
            if (!isOk) {
              return;
            }

            that.showPublishDialog(result.context);
          }, TranslationUtil.translateTextByServer(TranslationUtil.keys.Continue_Publishing, ExperienceEditor), TranslationUtil.translateTextByServer(TranslationUtil.keys.Back_to_Editing, ExperienceEditor), TranslationUtil.translateTextByServer(TranslationUtil.keys.Are_you_sure, ExperienceEditor), "450", "330", "355px", "200px");
        });
      });
    },

    showPublishDialog: function(context) {
      ExperienceEditor.modifiedHandling(true, function (isOk) {
        ExperienceEditor.PipelinesUtil.initAndExecutePipeline(context.app.PublishPipeline, context);
      });
    }
  };
});