define(["sitecore", "/-/speak/v1/ExperienceEditor/ExperienceEditor.js"], function (Sitecore, ExperienceEditor) {

    Sitecore.Factories.createBaseComponent({
        name: "Strip",
        base: "ControlBase",
        selector: ".sc-strip",
        attributes: [],

        initialize: function () {
            this.rendernTab(this);
            ExperienceEditor.Common.displayTab(document.getElementById(ExperienceEditor.getCurrentTabId()));
            this._super();
        },

        rendernTab: function (context) {
            var stripId = context.$el[0].getAttribute("data-sc-id");
            var id = stripId + "_ribbon_tab";
            var tabName = this.$el.find("h3").text();
            var tabSource = "<a id=\"" + id + "\" stripId=\"" + stripId + "\" href=\"#\" class=\"sc-quickbar-item sc-quickbar-tab\">" + tabName + "</a>";

            var quickbar = jQuery(".sc-quickbar");
            if (!quickbar) {
                return;
            }

            quickbar.append(tabSource);

            var strip = document.getElementById(ExperienceEditor.Common.getCookieValue("sitecore_webedit_activestrip"));
            if (strip) {
                jQuery(strip).show();
            }

            var tab = jQuery("#" + id);
            tab.on("click", function (event) {
                ExperienceEditor.Common.displayTab(event.currentTarget);
                context.app.setFocused(true);
            });
        },

    });
});