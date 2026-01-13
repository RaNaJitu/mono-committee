export function extractTimeParts(fineStartTime: Date | string): { h: number; m: number; s: number } {
  // Case 1: Already a Date object
  if (fineStartTime instanceof Date) {
    return {
      h: fineStartTime.getHours(),
      m: fineStartTime.getMinutes(),
      s: fineStartTime.getSeconds(),
    };
  }

  // Case 2: ISO string like "1970-01-01T16:00:00.000Z"
  if (fineStartTime.includes("T")) {
    const d = new Date(fineStartTime);
    return {
      h: d.getHours(),
      m: d.getMinutes(),
      s: d.getSeconds(),
    };
  }

  // Case 3: Pure time string "16:00:00"
  const [h, m, s = "0"] = fineStartTime.split(":");
  return {
    h: Number(h),
    m: Number(m),
    s: Number(s),
  };
}