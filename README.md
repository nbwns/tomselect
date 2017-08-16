# jQuery TomSelect

**TomSelect is a jQuery plugin that allows any dropdown to be editable.** 

*What do you mean by editable ?*

__test__

When you apply TomSelect on a dropdown a button "Add" appears next to the dropdown.
Clicking on this "Add" button reveals a text field and a "Save" button.
When clicking on "Save" you can either:
- Trigger some code via a simple callback
- Send a request to an API (if you wanna send the value to a service) 

[Demo on JSFiddle](https://jsfiddle.net/panzerkunst/6mu5f7dd/)

## How to use it ? 

1. Include jquery.tomselect.js in your page (it needs jQuery)
2. Call TomSelect on your dropdowns, like this:

```javascript
$("select[data-editable-dropdown=true]").tomselect();

```

The new value will be added in the dropdown and selected.

3. You can provide parameters to customize the controls

```javascript
$("select[data-editable-dropdown=true]").tomselect({
        newButtonClass: "btn",
        saveButtonClass: "btn",
        newButtonText: "Nouveau",
        saveButtonText: "Sauver",
        inputClass: "new-input",
        groupClass: "new-group",
        invalidInputClass: "invalid",
        selectNewOption: false
    }
);

```


4. You can pass a callback that's called when hitting the "Save" button

```javascript
$("select[data-editable-dropdown=true]").tomselect({
        newButtonClass: "btn",
        saveButtonClass: "btn",
        newButtonText: "Nouveau",
        saveButtonText: "Sauver"
    }, function (value) {
        alert("you've added " + value);
    }
);

```

5. Or call an API to send the value and fetch the list of all values returned from the API

```javascript
$("select[data-editable-dropdown=true]").tomselect(
    {
        newButtonClass: "btn",
        saveButtonClass: "btn",
        newButtonText: "Nouveau",
        saveButtonText: "Sauver"
    }, 
    {
    	endpoint: "/api/meal", 
        method: "POST",
        key: "id", //the field of the returned objects to be used as option value 
        text: "name", //the field of the returned objects to be used as option text 
        success: function(data){
            alert("New meal saved");
        },
        error: function(xhr, status, err){
            alert(xhr.responseJSON.exceptionmessage);
        }
    }
);

```

## Ideas, suggestions ?

This is one of my very first jQuery plugin, if you have some remarks or suggestions, or wanna help: [@bauwensn](https://twitter.com/bauwensn) on Twitter !

I'd like to implement Promises instead of callbacks on the AJAX version. 
