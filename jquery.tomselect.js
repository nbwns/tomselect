(function ($) {

    $.fn.tomselect = function (options, savingOptions) {

        options = options || {};

        var settings = {
            newButtonClass: options.newButtonClass || "",
            saveButtonClass: options.saveButtonClass || "",
            newButtonText: options.newButtonText || "New",
            saveButtonText: options.saveButtonText || "Save",
            inputClass: options.inputClass || "",
            groupClass: options.groupClass || "tomselect-group",
            invalidInputClass: options.invalidInputClass || "tomselect-invalid",
            selectNewOption: options.selectNewOption || true
        };

        var savingSettings = null;

        if (savingOptions) {
            savingSettings = {};

            /* a simple callback has been passed */
            if ($.type(savingOptions) === "function") {
                savingSettings.saved = savingOptions;
            }
                /* an object has been passed */
            else if ($.type(savingOptions) === "object") {
                savingSettings = {
                    endpoint: savingOptions.endpoint || null,
                    method: savingOptions.method || "POST",
                    key: savingOptions.key || null,
                    text: savingOptions.text || null,
                    resetSelect: savingOptions.resetSelect || true,
                    success: savingOptions.success || function () { },
                    error: savingOptions.error || function () { },
                    addEmptyOption: savingOptions.addEmptyOption || true
                }

                if (!savingSettings.endpoint) {
                    throw "You must provide an endpoint";
                }
            }
        }

        var $selects = this;
        $selects.each(function () {
            if ($(this).is("select")) {
                $group = $("<div></div>").addClass(settings.groupClass);
                $(this).wrap($group);
                $group = $(this).parent();
                var $input = $("<input type='text'/>").addClass(settings.inputClass).hide();
                $group.append($input);
                var $button = $("<button></button>").addClass(settings.newButtonClass).text(settings.newButtonText);
                $button.click(buttonClicked);
                $group.append($button);
            } else {
                throw ".tomselect must be called on <select> elements";
            }
        });

        function buttonClicked(e) {
            e.preventDefault();
            var $button = $(this);
            var $input = $button.prev("input");
            var $select = $button.prevAll("select");

            if ($input.is(":hidden")) {
                setButtonToSave($button);
                $input.show();
            } else {
                var newValue = $input.val();
                $input.removeClass(settings.invalidInputClass);
                if (newValue) {
                    var newData = saveNewOption($select, $input, $button);
                } else {
                    $input.addClass(settings.invalidInputClass);
                }
            }
        }

        function setButtonToSave($button) {
            $button.text(settings.saveButtonText).removeClass(settings.newButtonClass).addClass(settings.saveButtonClass);
        }

        function setButtonToNew($button) {
            $button.text(settings.newButtonText).removeClass(settings.saveButtonClass).addClass(settings.newButtonClass);
        }

        function disableFields($select, $input, $button, value) {
            $input.attr("disabled", value);
            $select.attr("disabled", value);
            $button.attr("disabled", value);
        }

        function addNewValueToSelect($select, $input) {
            var newValue = $input.val();
            var html = "<option value='" + newValue + "'>" + newValue + "</option>";
            $select.append(html);
            return newValue;
        }

        function saved($select, $input, $button) {
            $select.find('option:selected').removeAttr("selected");
            $select.find("option:contains(" + $input.val() + ")").prop("selected", true);
            $input.val("").hide();
            setButtonToNew($button);
            disableFields($select, $input, $button, false);
        }

        function ajaxCallComplete(data, textStatus, xhr) {
            if (savingSettings.resetSelect) {
                this.empty();
                if (savingSettings.addEmptyOption) {
                    var html = "<option value=''></option>";
                    this.append(html);
                }
            }

            if ($.type(data) === "array") {
                $.each(data, function (i, e) {
                    addObjectValueToSelect(this, e);
                }.bind(this));
            }
            else if ($.type(data) === "object") {
                addObjectValueToSelect(this, data);
            }
            else if ($.type(data) === "string") {
                var html = "<option value='" + data + "'>" + data + "</option>";
                this.append(html);
            }
            else {
                throw "Could not parse the returned data " + data;
            }

            savingSettings.success(data, textStatus, xhr);
        }

        function addObjectValueToSelect($select, value) {
            if (!savingSettings.key || !savingSettings.text) {
                throw "Please provide values for the 'key' and 'text' properties";
            }
            var html = "<option value='" + value[savingSettings.key] + "'>" + value[savingSettings.text] + "</option>";
            $select.append(html);
        }

        function saveNewOption($select, $input, $button) {
            var newValue = $input.val();
            disableFields($select, $input, $button, true);
            if (!savingSettings) {
                /* super simple scenario: just append input's value to the select*/
                addNewValueToSelect($select, $input);
                saved($select, $input, $button);
            } else {
                if (savingSettings.saved) {
                    /* basic scenario: append input's value to the select and call the onSave callback */
                    savingSettings.saved(addNewValueToSelect($select, $input));
                    saved($select, $input, $button);
                } else if (savingSettings.endpoint) {
                    /* AJAX scenario: call the endpoint */
                    $.ajax({
                        url: savingSettings.endpoint,
                        data: { value: newValue },
                        type: savingSettings.method,
                        dataType: "JSON"
                    })
                    .done(ajaxCallComplete.bind($select))
                    .done(saved.bind(null, $select, $input, $button))
                    .fail(function (xhr, textStatus, errorThrown) {
                        disableFields($select, $input, $button, false);
                        savingSettings.error(xhr, textStatus, errorThrown);
                    })
                }
            }
        }
    }
}(jQuery));