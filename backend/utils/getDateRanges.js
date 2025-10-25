// /**
//  * Helper function to get date ranges
//  */
// export const getDateRanges = () => {
//   const todayStart = new Date();
//   todayStart.setHours(0, 0, 0, 0);

//   const todayEnd = new Date(todayStart);
//   todayEnd.setHours(23, 59, 59, 999);

//   const tomorrowStart = new Date(todayStart);
//   tomorrowStart.setDate(todayStart.getDate() + 1);

//   const tomorrowEnd = new Date(tomorrowStart);
//   tomorrowEnd.setHours(23, 59, 59, 999);

//   const weekAgo = new Date(todayStart);
//   weekAgo.setDate(todayStart.getDate() - 7);

//   return { todayStart, todayEnd, tomorrowStart, tomorrowEnd, weekAgo };
// };

export const getDateRanges = () => {
  const timeZone = "Asia/Kolkata";
  const now = new Date();

  // 1. Get the current date parts (year, month, day) in IST
  // We use 'en-CA' (YYYY-MM-DD) locale for a convenient format
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  // 2. Reconstruct the date string (e.g., "2025-10-22")
  const partMap = parts.reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});

  const { year, month, day } = partMap;
  const dateString = `${year}-${month}-${day}`;

  // 3. Create Date objects by explicitly adding the IST (+05:30) offset.
  // This creates a correct UTC Date object that MongoDB can query.
  const todayStart = new Date(`${dateString}T00:00:00.000+05:30`);
  const todayEnd = new Date(`${dateString}T23:59:59.999+05:30`);

  // 4. Calculate other dates based on today's start
  const oneDayInMs = 24 * 60 * 60 * 1000;
  const tomorrowStart = new Date(todayStart.getTime() + oneDayInMs);
  const tomorrowEnd = new Date(todayEnd.getTime() + oneDayInMs);
  const weekAgo = new Date(todayStart.getTime() - 7 * oneDayInMs);

  return { todayStart, todayEnd, tomorrowStart, tomorrowEnd, weekAgo };
};
