
const convertToSearchFilterDateTimeFrom = (dateFrom) => {

    const formattedDateFrom = new Date(dateFrom);
    formattedDateFrom.setHours(0);
    formattedDateFrom.setMinutes(0);
    formattedDateFrom.setSeconds(1);

    return formattedDateFrom.toISOString();
};

const convertToSearchFilterDateTimeTo = (dateTo) => {

    const formattedDateTo = new Date(dateTo);
    formattedDateTo.setHours(23);
    formattedDateTo.setMinutes(59);
    formattedDateTo.setSeconds(59);

    return formattedDateTo.toISOString();
};

export { convertToSearchFilterDateTimeFrom, convertToSearchFilterDateTimeTo };