define(["sitecore", "/-/speak/v1/ExperienceEditor/ExperienceEditor.js"], function (Sitecore, ExperienceEditor) {
    Sitecore.Factories.createBaseComponent({
        name: "LargeDropDownButton",
        base: "ButtonBase",
        selector: ".sc-chunk-button-dropdown",
        attributes: [
            { name: "command", value: "$el.data:sc-command" },
            { name: "isPressed", value: "$el.data:sc-ispressed" },
            { name: "iconLabelRequest", value: "$el.data:sc-iconlabelrequest" },
        { name: "iconPath", value: "$el.data:sc-iconpath" },
        { name: "labelText", value: "$el.data:sc-labeltext" },
        ],

        dropDownItems: [],

        defaultRetrieveListItemsRequest: "ExperienceEditor.LagreDropDownItem.GetChildItems",

        dropDownButtonsListClientId: "largeDropDownButtonList",

        initialize: function () {
            this._super();

            this.model.set("datasourceDatabase", this.$el.data("sc-datasourcedatabase"));
            this.model.set("listDataSourceId", this.$el.data("sc-listdatasourceid"));
            this.model.set("defaultListItemCommand", this.$el.data("sc-defaultlistitemcommand"));
            this.model.set("retrieveListItemsRequest", this.$el.data("sc-retrievelistitemsrequest"));
            this.model.set("showIcon", this.$el.data("sc-showicon") == '1');

            if (this.model.get("retrieveListItemsRequest") == "") {
                this.model.set("retrieveListItemsRequest", this.defaultRetrieveListItemsRequest);
            }

            this.model.on("change:isEnabled", this.toggleEnable, this);
            this.model.on("change:isVisible", this.toggleVisible, this);
            this.model.on("change:isPressed", this.togglePressed, this);
            this.model.on("click", this.handleClick, this);
            this.$el.on("click", function (evt) {
                var currentEvent = evt;
                if (!evt) {
                    currentEvent = window.event;
                }

                currentEvent.stopPropagation();
            });
        },

        handleClick: function () {
            this.closeDropDownButtonList();
            if (this.dropDownItems.length == 0) {
                this.retrieveDropDownItems();
            }

      var that = this;
      var scriptUrl = this.model.viewModel.$el.attr('data-sc-PageCodeScriptFileName');
      require(["sitecore", scriptUrl], function () {
        that.renderDropDownItems(that.dropDownItems);
        ExperienceEditor.getPageEditingWindow().document.openedDropDownButton = that;
      });
        },

        closeDropDownButtonList: function () {
            var buttonsList = window.parent.document.getElementById(this.dropDownButtonsListClientId);
            if (!buttonsList) {
                return;
            }

            window.parent.document.body.removeChild(buttonsList);
        },


        retrieveDropDownItems: function () {
            var self = this;
            var context = ExperienceEditor.generateDefaultContext();
            context.currentContext.value = this.model.get("datasourceDatabase") + "|" + this.model.get("listDataSourceId");
            ExperienceEditor.PipelinesUtil.generateRequestProcessor(this.model.get("retrieveListItemsRequest"), function (response) {
                self.dropDownItems = response.responseValue.value;
            }).execute(context);
        },

        getClientRect: function (id) {
            var sourceNode = ExperienceEditor.Common.getElementById(id);
            if (!sourceNode) {
                return null;
            }

            var boundingClientRect = sourceNode.getBoundingClientRect();

            if (boundingClientRect.bottom != 0 && boundingClientRect.left != 0) {
                return boundingClientRect;
            }

            var sourceNodes = document.querySelectorAll('[data-sc-id="' + id + '"]');
            for (var i = 0; i < sourceNodes.length; i++) {
                boundingClientRect = sourceNodes[i].getBoundingClientRect();
                if (boundingClientRect.bottom != 0 && boundingClientRect.left != 0) {
                    break;
                }
            }

            return boundingClientRect;
        },

        renderDropDownItems: function (dropDownItemsList) {
			ExperienceEditor.Common.registerDocumentStyles(["/-/speak/v1/ribbon/LargeDropDownButton.css"], ExperienceEditor.getPageEditingWindow().document);
            var elementId = this.$el.attr("data-sc-id"),
                boundingClientRect = this.getClientRect(elementId),
                dropDownClass = 'sc_LargeDropDownButton_DropDownItemsContainer',
                childClass = 'hasChild',
                sourceNodeType = ExperienceEditor.Common.getElementById(elementId).getAttribute('data-sc-defaultlistitemcommand');
           
                if (sourceNodeType == 'PartialDesignDropDown') {
                    dropDownClass+=' partialDesignDropDown'
                } else if (sourceNodeType == 'PageDesignsDropDown') {
                    dropDownClass += ' pageDesignsDropDown'
                }

      var container = ExperienceEditor.getPageEditingWindow().document.createElement("div");
      var containerStyle = "position:fixed;z-index:10000;top:" + boundingClientRect.bottom + "px;left:" + (boundingClientRect.left + ExperienceEditor.ribbonFrame().offsetLeft) + "px;background-color:#ffffff;";
            container.setAttribute("style", containerStyle);
            container.setAttribute("class", dropDownClass);
            container.setAttribute("id", this.dropDownButtonsListClientId);
            for (var i = 0; i < dropDownItemsList.length; i++) {

                var item = dropDownItemsList[i];
                var children = item.Children;

                if (children) {
                    container.setAttribute("class", dropDownClass + ' ' + childClass);
                }

                this.prepareDropDownItems(item, container, children);
            }

            window.parent.document.addEventListener('click', function () {
                window.parent.document.openedDropDownButton.closeDropDownButtonList();
            }, false);

            document.addEventListener('click', function () {
                window.parent.document.openedDropDownButton.closeDropDownButtonList();
            }, false);

            window.parent.document.body.appendChild(container);


        },

        prepareDropDownItems: function (item, container, children, isChild) {
            var title = item.Title,
                tooltip = item.Tooltip,
                itemId = item.ItemId,
                parentId = item.ParentId,
                commandName = this.resolveDropDownItemCommand(itemId),
                canSelect,
                listItem,
                imageWrapper,
                iconImg,
                listWrapper,
                link;

            if (commandName == "") {
                return;
            }

            if (item.CanSelect != null) {
                canSelect = item.CanSelect;
            } else {
                canSelect = this.checkDropDownCommandCanExecute(itemId, commandName, parentId);
            }

            listItem = window.parent.document.createElement("div");
            listItem.setAttribute("class", "sc_DropDownItem");

            link = window.parent.document.createElement("a");
            link.setAttribute("href", "#");
            link.setAttribute("data-sc-sxa-item-id", itemId);
            link.setAttribute("title", tooltip);
            link.setAttribute("class", canSelect ? "sc_DropDownItemLink" : "sc_DropDownItemLink_Disabled");
            link.setAttribute("onclick", "document.openedDropDownButton.listItemClick(event, '" + itemId + "', " + canSelect + ", '" + commandName + "', '" + parentId + "')");


            if (this.model.get("showIcon")) {
                imageWrapper = window.parent.document.createElement("span");
                imageWrapper.setAttribute("class", "sc_DropDownItemImageWrapper");
                iconImg = window.parent.document.createElement("img");
                iconImg.setAttribute("class", "sc_DropDownItemImage");
                iconImg.setAttribute("alt", "");
                iconImg.setAttribute("src", item.IconPath);
                imageWrapper.appendChild(iconImg);

                link.appendChild(imageWrapper);
            }

            if (children) {
                link.setAttribute("onclick", "");
                listWrapper = window.parent.document.createElement("ul");
                listWrapper.setAttribute("class", "hasChildren");

                link.setAttribute("onclick", "");
                $(listItem).addClass("showArrow");

                listItem.appendChild(listWrapper);

                for (var j = 0, len = children.length; j < len; j++) {
                    this.prepareDropDownItems(children[j], listWrapper, children[j].Children, true);
                }
            }

            var textSpan = window.parent.document.createElement("span");
            textSpan.innerHTML = title;
            textSpan.setAttribute("class", "sc_DropDownItemText");

            if (typeof item.Used !== "undefined" && item.Used) {
                $(listItem).addClass("sc_DropDownListItemUsed");
                textSpan.innerHTML = title + "&nbsp;&#10003;";
            }

            link.appendChild(textSpan);
            $(listItem).prepend(link);

            if (isChild) {
                var listChildItem = window.parent.document.createElement("li");
                listChildItem.appendChild(listItem);
                container.appendChild(listChildItem);
            } else {
                container.appendChild(listItem);

                //prevent overflow
                if (window.parent) {
                    setTimeout(function () {
                        var maxHeight = Math.floor($(window.parent).height() - $(listItem).offset().top - 10);
                        $(listItem).find("ul").css("max-height", maxHeight + "px");
                    }, 10);
                }

            }


            var target = $(listItem);
            target.hover(function (args) {
                var dropDowns = $(window.parent.document).find("div.showArrow:hover > .hasChildren").sort(function (a, b) { return $(b).parents().length - $(a).parents().length; }),
                    mostNested,
                    maxHeight,
                    jMostNested;
                if (dropDowns.length !== 0) {
                    mostNested = dropDowns[0];
                    jMostNested = $(mostNested);

                    maxHeight = Math.floor($(window.parent).height() + $(window.parent).scrollTop() - jMostNested.parent().offset().top - 10);
                    jMostNested.css("max-height", maxHeight + "px");
                    if (mostNested.offsetHeight < mostNested.scrollHeight) {
                        jMostNested.addClass("dropdown-scroll");
                    }

                    jMostNested.scrollTop(jMostNested.data("scrolltop") || 0);

                }
            },
            function (args) {
                var dropDown = $(window.parent.document).find(".dropdown-scroll"),
                    scrollTop = dropDown.scrollTop();
                dropDown.removeClass("dropdown-scroll");
                dropDown.data("scrolltop", scrollTop);
            });

        },

        resolveDropDownItemCommand: function (itemId) {
            var command = ExperienceEditor.CommandsUtil.getCommandByDropDownMenuItemId(itemId);
            if (!command) {
                return this.model.get("defaultListItemCommand");
            }

            return command.commandName;
        },

        checkDropDownCommandCanExecute: function (itemId, commandName, parentId) {
            var context = ExperienceEditor.getContext().instance.getContext(null);
            context.currentContext.value = itemId;
            context.currentContext.parent = parentId;
            return ExperienceEditor.CommandsUtil.runCommandCanExecute(commandName, context);
        },

        listItemClick: function (e, itemId, canSelect, commandName, parentId) {
            if (!canSelect) {
                var evt = e;
                if (!evt) {
                    evt = window.event;
                }
                
                evt.stopPropagation();
                return;
            }

            if (itemId == "") {
                return;
            }
      var context = ExperienceEditor.RibbonApp.getAppContext();
            context.currentContext.argument = itemId;
            context.currentContext.parent = parentId;
			top.initModalDialog(
                function(){
                    ExperienceEditor.CommandsUtil.runCommandExecute(commandName, context)
                }
            );
        },

        toggleEnable: function () {
            if (!this.model.get("isEnabled")) {
                this.$el.addClass("disabled");
            } else {
                this.$el.removeClass("disabled");
            }
        },

        toggleVisible: function () {
            if (!this.model.get("isVisible")) {
                this.$el.hide();
            } else {
                this.$el.show();
            }
        },

        togglePressed: function () {
            if (this.model.get("isPressed")) {
                this.$el.addClass("pressed");
            } else {
                this.$el.removeClass("pressed");
            }
        },

        setIcon: function (iconSrc) {
            this.$el.find("img:first").attr("src", iconSrc);
            var buttons = $("[data-sc-id='" + this.model.get("name") + "']");
            if (buttons.length > 1) {
                $.each(buttons, function (index, button) {
                    $(button).find("img:first").attr("src", iconSrc);
                });
            }
        },
        setLabel: function (label) {
            this.$el.find("span:first").text(label);
            var buttons = $("[data-sc-id='" + this.model.get("name") + "']");
            if (buttons.length > 1) {
                $.each(buttons, function (index, button) {
                    $(button).find("span:first").text(label);
                });
            }
        }
    });
});