export const getDate = (ver) => {
    const now = new Date();
    var month = now.getMonth();
    var year = now.getFullYear();
    var date = "";
    switch (ver) {
        case "full":
            month = String(month + 1).padStart(2, "0");
            date = `${year}-${month}`;
            break;
        case "month":
            month = String(month + 1).padStart(2, "0");
            date = month;
            break;
        case "year":
            date = year;
            break;
        case "title":
            const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            date = `${months[month]} ${year}`;
            break;
        default:
            date = "";
    }
    return date;
};