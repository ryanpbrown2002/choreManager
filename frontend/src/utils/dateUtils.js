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

export const isInWeek = (timestamp, weekStart) => {
  const date = new Date(timestamp * 1000);
  const { weekEnd } = getWeekBounds(weekStart);
  return date >= weekStart && date <= weekEnd;
};

export const filterAssignmentsByWeek = (assignments, weekStart) => {
  return assignments.filter(assignment =>
    isInWeek(assignment.due_date, weekStart)
  );
};
