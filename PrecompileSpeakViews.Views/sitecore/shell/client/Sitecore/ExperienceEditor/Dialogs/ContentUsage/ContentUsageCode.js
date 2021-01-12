define(["sitecore", "/-/speak/v1/ExperienceEditor/ExperienceEditor.js"], function (Sitecore, ExperienceEditor) {
  var contentUsagePageCode = Sitecore.Definitions.App.extend({
    initialized: function () {
      var that = this;
      this.setOkButtonClick();
      this.setSearchButtonClick();
      var referenceElement = jQuery(this.ReferenceContentListControl.viewModel.$el[0]).find("div.sc-listcontrol-body:first");
      var associatedElement = jQuery(this.AssosiatedContentListControl.viewModel.$el[0]).find("div.sc-listcontrol-body:first");
      this.setLoadingAnimation(referenceElement, true);
      this.setLoadingAnimation(associatedElement, true);
       
      this.loadControlData(function () {
            that.ReferenceContentListControl.set("originalItems", that.ReferenceContentListControl.get("items"));
            that.ReferenceContentListControl.trigger("change:items");
            that.AssosiatedContentListControl.trigger("change:items");
            that.setLoadingAnimation(referenceElement, false);
            that.setLoadingAnimation(associatedElement, false);
      });

      this.ReferenceContentButtonTextBox.viewModel.$el.find("input").attr("placeholder", this.ReferenceContentButtonTextBox.get("watermark"));

      jQuery("#dialogContent").css('visibility', 'visible');
    },
    setOkButtonClick: function () {
      this.on("button:ok", function () {
        this.closeDialog(null);
      }, this);
    },
    setSearchButtonClick: function () {
      this.on("button:search", function () {
        var searchText = this.ReferenceContentButtonTextBox.get("text");
        var items = this.ReferenceContentListControl.get("originalItems");
        var filteredItems = [];
        var that = this;
        jQuery.each(items, function () {
          if (that.isTextMatch(this.page, searchText)
            || that.isTextMatch(this.path, searchText)) {
            filteredItems.push(this);
          }
        });
        this.ReferenceContentListControl.set("items", filteredItems);
        this.ReferenceContentListControl.trigger("change:items");
      }, this);
    },
    isTextMatch: function(text, textToSearch) {
      return text.toLowerCase().indexOf(textToSearch.toLowerCase()) > -1;
    },
    setLoadingAnimation: function (element, show) {
        element.css("position", "relative");
        element.children("img[id='myItemsLoadingIndicator']:first").remove();
        element.children().each(function () {
            jQuery(this).css("visibility", "visible");
        });
        if (show) {
            var gif = '<img id="myItemsLoadingIndicator" src="/sitecore/shell/client/Speak/Assets/img/Speak/ProgressIndicator/sc-spinner16.gif" style="display: block; margin: 0 auto; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);">';
            element.children().each(function () {
                jQuery(this).css("visibility", "hidden");
            });
            element.append(gif);
        }
    },
    loadControlData: function (completeHandler) {
      var context = ExperienceEditor.generateDefaultContext();
      context.currentContext.sourceItemId = ExperienceEditor.Web.getUrlQueryStringValue("itemId");
      context.currentContext.itemId = ExperienceEditor.getPageEditingWindow().parent.ExperienceEditor.RibbonApp.getApp().currentContext.itemId;
      context.currentContext.database = ExperienceEditor.Web.getUrlQueryStringValue("db");
      context.currentContext.version = ExperienceEditor.Web.getUrlQueryStringValue("version");
      context.currentContext.usagesPathPatterns = "";
      var sitecore = ExperienceEditor.getPageEditingWindow().parent.Sitecore;
      if (sitecore) {
          context.currentContext.usagesPathPatterns = sitecore.PageModes.ChromeControls.prototype.usagesPathPatterns.join("|");
      }
      var that = this;
      var datasourceUsages;
      ExperienceEditor.PipelinesUtil.generateRequestProcessor("ExperienceEditor.Datasources.GetDatasourceUsagesDialog", function (response) {
        datasourceUsages = response.responseValue.value;
        if (!datasourceUsages) {
          return;
        }

        that.loadReferenceContentList(datasourceUsages, that.ReferenceContentListControl);
        that.loadAssociatedContentList(datasourceUsages, that);
          completeHandler();
      }, undefined, true).execute(context);
    },

    addAssociatedContentListItem: function (that, property, value) {
      that.AssosiatedContentListControl.attributes.items.push(
        {
          property: property,
          value: value
        });
    },
    loadAssociatedContentList: function (datasourceUsages, that) {
      if (!datasourceUsages || datasourceUsages.length === 0) {
        return;
      }

      var datasourceUsage = datasourceUsages[0];
      if (!datasourceUsage) {
        return;
      }

      that.addAssociatedContentListItem(that, that.TextsItemPath.get("text"), datasourceUsage.path);
      that.addAssociatedContentListItem(that, that.TextsVersion.get("text"), datasourceUsage.version);
      that.addAssociatedContentListItem(that, that.TextsWorkflow.get("text"), datasourceUsage.workflowName);
      that.addAssociatedContentListItem(that, that.TextsWorkflowState.get("text"), datasourceUsage.workflowStateName);
      that.addAssociatedContentListItem(that, that.TextsLock.get("text"), datasourceUsage.lockedBy);
      that.addAssociatedContentListItem(that, that.TextsLastModified.get("text"), datasourceUsage.lastModified);
    },
    loadReferenceContentList: function (datasourceUsages, referenceContentList) {
      jQuery.each(datasourceUsages, function () {
        referenceContentList.attributes.items.push(
          {
            itemId: "{" + this.ItemId.toUpperCase() + "}",
            page: this.name,
            path: this.path,
            lastModified: this.lastModified
          });
      });
    }

  });
  return contentUsagePageCode;
});