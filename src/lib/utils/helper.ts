export function dateConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000);
    var months = [
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
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var day = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    // var sec = a.getSeconds();

    if (min < 10) {
        (min as any) += "0";
    }

    var midday = "am";

    if (hour == 24) {
        hour -= 12;
        midday = "am";
    } else if (hour > 12) {
        hour -= 12;
        midday = "pm";
    } else if (hour == 12) {
        midday = "pm";
    }
    var time =
        month + " " + day + ", " + year + " " + hour + ":" + min + " " + midday;
    return time;
}

export const parseNumber = (value: string | number | undefined) => {
  if (value === undefined || value === null) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const cleaned = value.replace(/[^0-9.-]/g, "");
  const parsed = Number.parseFloat(cleaned);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
    }).format(value);

export const formatPercentage = (value?: number | null) => {
    if (value === null || value === undefined) return "Not set";
    return `${value}%`;
};

export const formatDateTime = (value?: string | null) => {
    if (!value) return "Not run yet";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
};
