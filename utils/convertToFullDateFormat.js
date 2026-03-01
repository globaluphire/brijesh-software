const convertToFullDateFormat = (date1, fullDate) => {
    let monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];

    if (fullDate) {
        monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];
    }
    const [year, month, date] = date1.split("-");

    const dateFormat = date + " " + monthNames[+month - 1] + ", " + year;

    return dateFormat;
};

export { convertToFullDateFormat };
