const convertManualDateFormat = (val) => {
    if (val) {
        return new Date(
            val.split("-")[0],
            val.split("-")[1] - 1,
            val.split("-")[2]
        ).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }
};

const convertDateFormat = (val) => {
    if (val) {
        return new Date(val).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }
};
const convertDateTimeFormat = (val) => {
    if (val) {
        return new Date(val).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    }
};

export { convertManualDateFormat, convertDateFormat, convertDateTimeFormat };
