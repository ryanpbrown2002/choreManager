import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../api/client';

export default function AssignmentManager({ chores, members, onAssignmentsChange }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    choreId: '',
    userId: '',
    daysUntilDue: 7
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const now = Math.floor(Date.now() / 1000);
      const dueDate = now + (formData.daysUntilDue * 24 * 60 * 60);

      await api.post('/assignments', {
        choreId: formData.choreId,
        userId: formData.userId,
        assignedDate: now,
        dueDate: dueDate
      });

      setFormData({ choreId: '', userId: '', daysUntilDue: 7 });
      setShowForm(false);
      onAssignmentsChange();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleRotate = async () => {
    if (!window.confirm('Rotate all chores to the next person? This will create new assignments for everyone.')) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      await api.post('/assignments/rotate');
      onAssignmentsChange();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to rotate assignments');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Assign Chores</h2>
        <div className="flex gap-2">
          <button
            onClick={handleRotate}
            disabled={loading || chores.length === 0 || members.length === 0}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            Rotate All Chores
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : 'Manual Assignment'}
          </button>
        </div>
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
                Days Until Due *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.daysUntilDue}
                onChange={(e) => setFormData({ ...formData, daysUntilDue: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
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

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Manual Assignment:</strong> Assign a specific chore to a specific person</p>
        <p><strong>Rotate All Chores:</strong> Automatically rotate all chores to the next person in sequence</p>
      </div>
    </div>
  );
}
