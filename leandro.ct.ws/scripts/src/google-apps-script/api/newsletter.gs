function newsletter(e) {
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

function check(data) {
    data[0].forEach(function (item, index) {
        if (item === "null") {
            data[0][index] = "";
        }
    });
}
