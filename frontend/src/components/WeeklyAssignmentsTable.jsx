import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../api/client';
import { filterAssignmentsByWeek } from '../utils/dateUtils';

export default function WeeklyAssignmentsTable({ assignments, onCompleteClick, onAssignmentsChange, weekStart }) {
  const { user } = useAuth();

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

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const isMyAssignment = (assignment) => {
    return assignment.user_id === user?.id;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Chore Assignments This Week</h2>
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
                Due Date
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
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
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
                    <div className="text-sm text-gray-500">
                      {formatDate(assignment.due_date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        assignment.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : assignment.status === 'overdue'
                          ? 'bg-red-100 text-red-800'
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
