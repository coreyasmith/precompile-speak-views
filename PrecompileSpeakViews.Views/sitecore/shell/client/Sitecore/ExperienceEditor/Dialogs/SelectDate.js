define(["sitecore", "/-/speak/v1/ExperienceEditor/ExperienceEditor.js"],
    function(Sitecore, ExperienceEditor) {
        var insertPagePageCode = Sitecore.Definitions.App.extend({
            translationContext: null,
            templateId: null,

            initialized: function() {
                this.SelectedDate.viewModel.$el.blur();
                this.setOkButtonClick();
                this.setCancelButtonClick();
                this.setDateTime();
            },
            setDateTime: function() {
                var scDate = ExperienceEditor.Web.getUrlQueryStringValue("sc_date");
                var selectedtDT = scDate.split("|");
                var scCultureDate = selectedtDT[0].substring(0, 15);
                var cDate = selectedtDT[1];
                
                if (!scCultureDate) {
                    this.SelectedDate.viewModel.setDate(Date.now());
                    return;
                }

                this.SelectedDate.viewModel.dateFormat(cDate);

                this.SelectedDate.set('date', scCultureDate);
            },
            setOkButtonClick: function() {
                this.on("button:ok",
                    function() {
                        this.closeDialog(this.SelectedDate.get("date"));
                    },
                    this);
            },
            setCancelButtonClick: function() {
                this.on("button:cancel",
                    function() {
                        this.closeDialog(null);
                    },
                    this);
            },
        });
        return insertPagePageCode;
    });