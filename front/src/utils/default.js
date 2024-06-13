export const randomHexColor = () => '#' + Math.floor(Math.random()*16777215).toString(16);

export const getTimeInTimezone = (timezone) => {
    const offset = parseInt(timezone.slice(1));
    const utcTime = new Date();
    const localTime = new Date(utcTime.getTime() - 25200000  + (offset * 60 * 60 * 1000));
    return localTime;
}