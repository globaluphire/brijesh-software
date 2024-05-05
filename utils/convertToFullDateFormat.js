import { format } from "date-fns";

const convertToFullDateFormat = (date1, fullDate) => {

    let monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

    if (fullDate) {
        monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
    }
    const [ year, month, date ] = date1.split("-");

    const dateFormat = date + " " + monthNames[+month - 1] + ", " + year;

    return dateFormat;
};

export { convertToFullDateFormat };