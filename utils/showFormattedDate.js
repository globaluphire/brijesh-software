import { format } from "date-fns";

const showFormattedDate = (date1) => {
    // let dateSplit = date.split("-");
    // let dateFormat = dateSplit[2] + "-" + dateSplit[1] + "-" + dateSplit[0];
    // console.log(dateFormat);

    let dateFormatTemp = format(date1, "dd-MM-yyyy");
    let monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];

    const [ date, month, year ] = dateFormatTemp.split("-");

    const dateFormat = date + " " + monthNames[+month - 1] + ", " + year;

    return dateFormat;
};

export { showFormattedDate };