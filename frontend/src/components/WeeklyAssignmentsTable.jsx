import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../api/client';
import { filterAssignmentsByWeek, getWeekBounds, getWeekStartTimestamp } from '../utils/dateUtils';

export default function WeeklyAssignmentsTable({ assignments, onCompleteClick, onAssignmentsChange, weekStart, onWeekChange, chores, members }) {
  const { user } = useAuth();
  const [rotating, setRotating] = useState(false);
  const isAdmin = user?.role === 'admin';

  // Filter assignments by the selected week
  const weekAssignments = weekStart ? filterAssignmentsByWeek(assignments, weekStart) : assignments;

  const handleDelete = async (assignmentId) => {
    if (!window.confirm('Delete this assignment?')) {
      return;
    }

    try {
      await api.delete(`/assignments/${assignmentId}`);
      onAssignmentsChange?.();
    } catch (err) {
      console.error('Failed to delete assignment:', err);
    }
  };

  const handleRotate = async () => {
    const weekLabel = formatWeekRange(weekStart);
    if (!window.confirm(`Rotate all chores to the next person for ${weekLabel}? This will create new assignments for everyone.`)) {
      return;
    }

    setRotating(true);
    try {
      const weekStartTs = getWeekStartTimestamp(weekStart);
      await api.post('/assignments/rotate', { weekStart: weekStartTs });
      onAssignmentsChange?.();
    } catch (err) {
      console.error('Failed to rotate assignments:', err);
    } finally {
      setRotating(false);
    }
  };

  const isMyAssignment = (assignment) => {
    return assignment.user_id === user?.id;
  };

  const formatWeekRange = (date) => {
    const weekEnd = new Date(date);
    weekEnd.setDate(date.getDate() + 6);
    const options = { month: 'short', day: 'numeric' };
    const startStr = date.toLocaleDateString('en-US', options);
    const endStr = weekEnd.toLocaleDateString('en-US', options);
    const year = date.getFullYear();
    return `${startStr} - ${endStr}, ${year}`;
  };

  const goToPreviousWeek = () => {
    const newWeekStart = new Date(weekStart);
    newWeekStart.setDate(newWeekStart.getDate() - 7);
    onWeekChange(newWeekStart);
  };

  const goToNextWeek = () => {
    const newWeekStart = new Date(weekStart);
    newWeekStart.setDate(newWeekStart.getDate() + 7);
    onWeekChange(newWeekStart);
  };

  const goToCurrentWeek = () => {
    const { weekStart: thisWeekStart } = getWeekBounds(new Date());
    onWeekChange(thisWeekStart);
  };

  const isCurrentWeek = () => {
    const { weekStart: thisWeekStart } = getWeekBounds(new Date());
    return weekStart.getTime() === thisWeekStart.getTime();
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <button
          onClick={goToPreviousWeek}
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 text-sm"
        >
          &larr; Prev
        </button>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {formatWeekRange(weekStart)}
            </h2>
            {!isCurrentWeek() && (
              <button
                onClick={goToCurrentWeek}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Jump to Current Week
              </button>
            )}
          </div>
          {isAdmin && (
            <button
              onClick={handleRotate}
              disabled={rotating || !chores?.length || !members?.length}
              className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 text-sm"
            >
              {rotating ? 'Rotating...' : 'Rotate All'}
            </button>
          )}
        </div>
        <button
          onClick={goToNextWeek}
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 text-sm"
        >
          Next &rarr;
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chore
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {weekAssignments.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                  No assignments for this week
                </td>
              </tr>
            ) : (
              weekAssignments.map((assignment) => (
                <tr
                  key={assignment.id}
                  className={`${isMyAssignment(assignment) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {assignment.chore_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{assignment.user_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        assignment.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {assignment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      {isMyAssignment(assignment) && assignment.status === 'pending' && (
                        <button
                          onClick={() => onCompleteClick(assignment)}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Mark Complete
                        </button>
                      )}
                      {assignment.status === 'completed' && assignment.photo_path && (
                        <a
                          href={`/${assignment.photo_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Photo
                        </a>
                      )}
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => handleDelete(assignment.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
