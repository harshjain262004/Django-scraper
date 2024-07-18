function Download() {
    var table = document.getElementById('datatable');
    var workbook = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });
    XLSX.writeFile(workbook, 'data.xlsx');
}