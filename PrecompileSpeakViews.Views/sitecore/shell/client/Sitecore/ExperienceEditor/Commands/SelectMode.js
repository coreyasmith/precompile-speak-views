define(["sitecore", "/-/speak/v1/ExperienceEditor/ExperienceEditor.js"],
    function(Sitecore, ExperienceEditor) {
        Sitecore.Commands.SelectMode =
        {
            canExecute: function(context, parent) {
                if (!context.button) {
                    return context.app.canExecute("ExperienceEditor.Mode.CanSelectMode", context.currentContext);
                }

                if (!ExperienceEditor.isInMode("edit")) {
                    context.button.set({ isPressed: true });
                }

                return true;
            },

            execute: function(context) {
                if (!context.currentContext.argument) {

                    if (context.button.attributes.name.indexOf('PreviewRibbonButton') === 0) {
                        context.currentContext.value =
                            encodeURIComponent("preview" + "|" + ExperienceEditor.getPageEditingWindow().location);
                    } else if (context.button.attributes.name.indexOf('DebugRibbonButton') === 0) {
                        context.currentContext.value =
                            encodeURIComponent("debug" + "|" + ExperienceEditor.getPageEditingWindow().location);
                    } else {
                        context.currentContext.value = encodeURIComponent(context.currentContext.argument +
                            "|" +
                            ExperienceEditor.getPageEditingWindow().location);
                    }

                    ExperienceEditor.PipelinesUtil.generateRequestProcessor("ExperienceEditor.Mode.SelectModeRequest",
                        function(response) {
                            ExperienceEditor.getPageEditingWindow().location = response.responseValue.value;
                        }).execute(context);

                } else {
                    context.currentContext.value = encodeURIComponent(context.currentContext.argument +
                        "|" +
                        ExperienceEditor.getPageEditingWindow().location);
                    ExperienceEditor.PipelinesUtil.generateRequestProcessor("ExperienceEditor.Mode.SelectModeRequest",
                        function(response) {
                            ExperienceEditor.getPageEditingWindow().location = response.responseValue.value;
                        }).execute(context);
                }
            }
        };
    });