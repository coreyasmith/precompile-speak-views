define(["sitecore", "/-/speak/v1/ExperienceEditor/ExperienceEditor.js", "/-/speak/v1/ExperienceEditor/ExperienceEditorProxy.js"], function (Sitecore, ExperienceEditor, ExperienceEditorProxy) {
    Sitecore.Commands.EnableDesigning =
        {
            isEnabled: false,
            button: null,

            reEvaluate: function (context) {
                if (!Sitecore.Commands.EnableDesigning.button) {
                    return;
                }

                context.button = Sitecore.Commands.EnableDesigning.button;
                Sitecore.Commands.EnableDesigning.button.set("isEnabled", Sitecore.Commands.EnableDesigning.canExecute(context));
                Sitecore.Commands.EnableDesigning.refreshAddComponentButtonState(context);
            },

            canExecute: function (context) {
                if (!ExperienceEditor.isInMode("edit") || context.currentContext.isFallback) {
                    return false;
                }

                context.currentContext.value = context.button.get("registryKey");
                var canDesign = context.app.canExecute("ExperienceEditor.EnableDesigning.CanDesign", context.currentContext);
                var isChecked = context.button.get("isChecked") == "1";
                this.isEnabled = canDesign && isChecked;
                ExperienceEditorProxy.changeCapability("design", this.isEnabled);
                Sitecore.Commands.ShowControls.reEvaluate();
                this.reEvaluateShowDataSources();
                if (!Sitecore.Commands.EnableDesigning.button) {
                    Sitecore.Commands.EnableDesigning.button = context.button;
                }

                return canDesign;
            },
            execute: function (context) {
                var self = this;
                ExperienceEditor.PipelinesUtil.generateRequestProcessor("ExperienceEditor.ToggleRegistryKey.Toggle", function (response) {
                    response.context.button.set("isChecked", response.responseValue.value ? "1" : "0");
                    Sitecore.Commands.EnableDesigning.isEnabled = response.responseValue.value == "1";
                    ExperienceEditorProxy.changeCapability("design", response.context.button.get("isChecked") == "1");
                    Sitecore.Commands.EnableDesigning.refreshAddComponentButtonState(response.context, Sitecore.Commands.EnableDesigning.isEnabled);
                    Sitecore.Commands.ShowControls.reEvaluate();
                    self.reEvaluateShowDataSources();
                }, { value: context.button.get("registryKey") }).execute(context);
            },

            refreshAddComponentButtonState: function (context, isEnabled) {
                var addComponents = ExperienceEditor.CommandsUtil.getControlsByCommand(context.app.Controls, "AddComponent");
                if (addComponents.length < 1) {
                    return;
                }

                var func = function () {
                    var buttonEnabled = isEnabled && Sitecore.Commands.AddComponent.canExecute(context);
                    $.each(addComponents, function () {
                        this.model.set({ isEnabled: buttonEnabled });
                    });
                }

                if (!Sitecore.Commands.AddComponent) {
                    var scriptUrl = context.app.getPageCodeScriptFileUrl(addComponents[0].model);
                    require(["sitecore", scriptUrl], func);
                } else {
                    func();
                }
            },

            reEvaluateShowDataSources: function () {
                if (Sitecore.Commands.ShowDataSources) {
                    Sitecore.Commands.ShowDataSources.reEvaluate();
                }
            }
        };
});