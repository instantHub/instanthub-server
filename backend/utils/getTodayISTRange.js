export function getTodayISTRange() {
  const IST_OFFSET_MINUTES = 330;

  const now = new Date();
  const istNow = new Date(now.getTime() + IST_OFFSET_MINUTES * 60 * 1000);

  const istStartOfDay = new Date(
    istNow.getFullYear(),
    istNow.getMonth(),
    istNow.getDate(),
    0,
    0,
    0,
    0
  );

  const istEndOfDay = new Date(
    istNow.getFullYear(),
    istNow.getMonth(),
    istNow.getDate(),
    23,
    59,
    59,
    999
  );

  const utcStartOfDay = new Date(
    istStartOfDay.getTime() - IST_OFFSET_MINUTES * 60 * 1000
  );
  const utcEndOfDay = new Date(
    istEndOfDay.getTime() - IST_OFFSET_MINUTES * 60 * 1000
  );

  return { utcStartOfDay, utcEndOfDay };
}
