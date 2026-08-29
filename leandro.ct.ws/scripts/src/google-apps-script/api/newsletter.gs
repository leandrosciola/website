function doPost(e) {
    var data = [];
    var json = e.parameter;
    /* -------------------------------------
      Add the fields in the array in order
    ------------------------------------- */
    data.push([
      json["email"]
    ]);
    /* -------------------------------------
      Check the data
    ------------------------------------- */
    check(data);
    /* -------------------------------------
      Add data to worksheet
    ------------------------------------- */
    insert(data);
    /* -------------------------------------
      Returns response in JSON format
    ------------------------------------- */
    return printJSON({status: 200});
}

function insert(data) {
    var lastRow = SpreadsheetApp.getActiveSheet().getLastRow();
    SpreadsheetApp.getActiveSheet().getRange(lastRow + 1, 1, data.length, data[0].length).setValues(data);
}

function printJSON(data) {
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function printHTML(data) {
    return HtmlService.createHtmlOutput(data);
}

function check(data) {
    data[0].forEach(function (item, index) {
        if (item === "null") {
            data[0][index] = "";
        }
    });
}
