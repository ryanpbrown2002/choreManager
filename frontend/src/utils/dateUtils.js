export const getWeekBounds = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day; // Adjust to Sunday
  const weekStart = new Date(d.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return { weekStart, weekEnd };
};

export const getCurrentWeekStart = () => {
  const { weekStart } = getWeekBounds(new Date());
  return weekStart;
};

export const getWeekStartTimestamp = (date) => {
  const { weekStart } = getWeekBounds(date);
  return Math.floor(weekStart.getTime() / 1000);
};

export const filterAssignmentsByWeek = (assignments, weekStart) => {
  const weekStartTimestamp = Math.floor(weekStart.getTime() / 1000);
  return assignments.filter(assignment =>
    assignment.week_start === weekStartTimestamp
  );
};
