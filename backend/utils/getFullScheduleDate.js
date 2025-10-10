export const getFullScheduleDate = (date) => {
  const fullScheduleDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
    // date.getHours(),
    // date.getMinutes()
  );

  const schedulePickUp = fullScheduleDate.toLocaleString();

  return schedulePickUp;
};
