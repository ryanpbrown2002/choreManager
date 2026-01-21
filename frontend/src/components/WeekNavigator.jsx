export default function WeekNavigator({ currentWeekStart, onWeekChange }) {
  const getWeekBounds = (date) => {
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

  const formatWeekRange = (weekStart) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const options = { month: 'short', day: 'numeric' };
    const startStr = weekStart.toLocaleDateString('en-US', options);
    const endStr = weekEnd.toLocaleDateString('en-US', options);
    const year = weekStart.getFullYear();

    return `${startStr} - ${endStr}, ${year}`;
  };

  const goToPreviousWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() - 7);
    onWeekChange(newWeekStart);
  };

  const goToNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() + 7);
    onWeekChange(newWeekStart);
  };

  const goToCurrentWeek = () => {
    const { weekStart } = getWeekBounds(new Date());
    onWeekChange(weekStart);
  };

  const isCurrentWeek = () => {
    const { weekStart: thisWeekStart } = getWeekBounds(new Date());
    return currentWeekStart.getTime() === thisWeekStart.getTime();
  };

  return (
    <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
      <button
        onClick={goToPreviousWeek}
        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700"
      >
        ← Previous Week
      </button>

      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">
          {formatWeekRange(currentWeekStart)}
        </h3>
        {!isCurrentWeek() && (
          <button
            onClick={goToCurrentWeek}
            className="text-sm text-blue-600 hover:text-blue-800 mt-1"
          >
            Jump to Current Week
          </button>
        )}
      </div>

      <button
        onClick={goToNextWeek}
        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700"
      >
        Next Week →
      </button>
    </div>
  );
}
