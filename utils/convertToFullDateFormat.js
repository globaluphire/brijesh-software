import { format } from "date-fns";

const convertToFullDateFormat = (date1) => {

    const monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

    const [ year, month, date ] = date1.split("-");

    const dateFormat = date + " " + monthNames[+month - 1] + ", " + year;

    console.log(dateFormat);

    // let dateFormat = format(date, "dd-MM-yyyy");
    return dateFormat;
};

export { convertToFullDateFormat };