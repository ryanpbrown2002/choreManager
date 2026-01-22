import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../api/client';
import { getCurrentWeekStart, getWeekStartTimestamp } from '../utils/dateUtils';

export default function AssignmentManager({ chores, members, onAssignmentsChange }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [showForm, setShowForm] = useState(false);
  const [formWeekStart, setFormWeekStart] = useState(getCurrentWeekStart());
  const [formData, setFormData] = useState({
    choreId: '',
    userId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const weekStart = getWeekStartTimestamp(formWeekStart);

      await api.post('/assignments', {
        choreId: formData.choreId,
        userId: formData.userId,
        weekStart
      });

      setFormData({ choreId: '', userId: '' });
      setShowForm(false);
      onAssignmentsChange();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  const formatWeekLabel = (date) => {
    const weekEnd = new Date(date);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const changeWeek = (current, delta) => {
    const newDate = new Date(current);
    newDate.setDate(newDate.getDate() + (delta * 7));
    setFormWeekStart(newDate);
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Manual Assignment</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'New Assignment'}
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded">{error}</div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 border rounded-lg bg-gray-50">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chore *
              </label>
              <select
                required
                value={formData.choreId}
                onChange={(e) => setFormData({ ...formData, choreId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select chore</option>
                {chores.map((chore) => (
                  <option key={chore.id} value={chore.id}>
                    {chore.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign To *
              </label>
              <select
                required
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select member</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Week *
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => changeWeek(formWeekStart, -1)}
                  className="px-2 py-2 border rounded hover:bg-gray-100"
                >
                  &lt;
                </button>
                <span className="text-sm min-w-[120px] text-center">
                  {formatWeekLabel(formWeekStart)}
                </span>
                <button
                  type="button"
                  onClick={() => changeWeek(formWeekStart, 1)}
                  className="px-2 py-2 border rounded hover:bg-gray-100"
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Assignment'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <p className="mt-4 text-sm text-gray-600">
        Assign a specific chore to a specific person for a selected week.
      </p>
    </div>
  );
}
