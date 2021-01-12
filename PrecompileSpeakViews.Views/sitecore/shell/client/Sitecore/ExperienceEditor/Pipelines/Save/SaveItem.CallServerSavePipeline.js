define(["sitecore", "/-/speak/v1/ExperienceEditor/ExperienceEditor.js"], function (Sitecore, ExperienceEditor) {
        return ExperienceEditor.PipelinesUtil.generateRequestProcessor("ExperienceEditor.Save.CallServerSavePipeline", function (response) {
            ExperienceEditor.getContext().isModified = false;
            ExperienceEditor.getContext().isContentSaved = true;
            if (!response.context.app.disableRedirection) {
                // There can be a case when a new version could be created, we should update sc_version parameter in case if present.
                var urlToRedirect = ExperienceEditor.getPageEditingWindow().location.href;
                if (response.responseValue.value != undefined
                    && response.context.currentContext.version !== response.responseValue.value
                    && ExperienceEditor.Web.getQueryStringValue(urlToRedirect, "sc_version") !== "") {
                    urlToRedirect = ExperienceEditor.Web.setQueryStringValue(urlToRedirect, "sc_version", response.responseValue.value);
                }

                if (ExperienceEditor.getPageEditingWindow().location == urlToRedirect) {
                    ExperienceEditor.getPageEditingWindow().location.reload();
                } else {
                    ExperienceEditor.getPageEditingWindow().location = urlToRedirect;
                }
            }

            response.context.app.disableRedirection = false;
        });
    });