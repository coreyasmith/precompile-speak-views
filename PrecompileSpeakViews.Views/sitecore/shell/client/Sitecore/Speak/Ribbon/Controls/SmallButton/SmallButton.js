﻿define(["sitecore", "/-/speak/v1/ExperienceEditor/ExperienceEditor.js"],
    function(Sitecore, ExperienceEditor) {
        Sitecore.Factories.createBaseComponent({
            name: "SmallButton",
            base: "ButtonBase",
            selector: ".sc-chunk-button-small",
            attributes: [
                { name: "command", value: "$el.data:sc-command" },
                { name: "isPressed", value: "$el.data:sc-ispressed" }
            ],
            initialize: function() {
                this._super();
                this.model.on("change:isEnabled", this.toggleEnable, this);
                this.model.on("change:isVisible", this.toggleVisible, this);
                this.model.on("change:isPressed", this.togglePressed, this);
            },
            toggleEnable: function () {
                if (ExperienceEditor.isInMode("preview") &&
                    this.model.attributes.name.indexOf("ExploreRibbonButton") === 0) {
                    this.$el.removeClass("disabled");
                } else {
                    if (!this.model.get("isEnabled")) {
                        this.$el.addClass("disabled");
                    } else {
                        this.$el.removeClass("disabled");
                    }
                }
               
            },
            toggleVisible: function() {
                if (!this.model.get("isVisible")) {
                    this.$el.hide();
                } else {
                    this.$el.show();
                }
            },
            togglePressed: function() {
                if (ExperienceEditor.isInMode("preview") &&
                    this.model.attributes.name.indexOf("DebugRibbonButton") === 0) {
                    this.$el.removeClass("pressed");
                } else {
                    ExperienceEditor.CommandsUtil.triggerControlStateByCommand(this, "isPressed");
                }
            },

            updatePressed: function(modelValue) {
                var checkedValue = false;
                if (modelValue == "1" || modelValue == true) {
                    checkedValue = true;
                }

                this.model.set("isPressed", checkedValue);
            },

            toggleInternalPressed: function(isPressedModelValue) {
                if (this.model.get("isPressed"))
                    this.$el.addClass("pressed");
                else {
                    this.$el.removeClass("pressed");
                }
            }
        });
    });