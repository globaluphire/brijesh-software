import { format } from "date-fns";

const showFormattedDate = (date) => {
    // let dateSplit = date.split("-");
    // let dateFormat = dateSplit[2] + "-" + dateSplit[1] + "-" + dateSplit[0];
    // console.log(dateFormat);

    let dateFormat = format(date, "dd-MM-yyyy");
    return dateFormat;
};

export { showFormattedDate };