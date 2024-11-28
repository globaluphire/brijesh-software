import * as xlsx from "xlsx";

const generateCSV = (data, fileName, sheetName) => {
    const worksheet = xlsx.utils.json_to_sheet(data);
    /* create workbook and export */
    var wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(
        wb,
        worksheet,
        sheetName ? sheetName : fileName
    );
    xlsx.writeFile(
        wb,
        `Raftaar-${fileName}-${("0" + new Date().getDate()).slice(-2)}_${(
            "0" +
            (new Date().getMonth() + 1)
        ).slice(-2)}_${new Date().getFullYear()}.xlsx`
    );
};

export { generateCSV };
