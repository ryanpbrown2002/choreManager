import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function ChoresManagement({ chores, onCreateChore, onUpdateChore, onDeleteChore }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    frequency: 'weekly',
    requiresPhoto: false
  });
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await onUpdateChore(editingId, formData);
      } else {
        await onCreateChore(formData);
      }
      resetForm();
    } catch (err) {
      console.error('Failed to save chore:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      frequency: 'weekly',
      requiresPhoto: false
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (chore) => {
    setFormData({
      name: chore.name,
      frequency: chore.frequency,
      requiresPhoto: chore.requires_photo === 1
    });
    setEditingId(chore.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this chore?')) {
      await onDeleteChore(id);
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Chores</h2>
        <div className="space-y-2">
          {chores.map((chore) => (
            <div key={chore.id} className="border-b pb-2">
              <div className="font-medium">{chore.name}</div>
              <div className="text-sm text-gray-600">
                {chore.frequency}
                {chore.requires_photo === 1 && ' • Photo required'}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Manage Chores</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 sm:px-4 py-2 bg-blue-600 text-white text-sm sm:text-base rounded-md hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Add Chore'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-3 sm:p-4 border rounded-lg bg-gray-50">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chore Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequency *
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-base"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Biweekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.requiresPhoto}
                  onChange={(e) => setFormData({ ...formData, requiresPhoto: e.target.checked })}
                  className="mr-2 h-4 w-4"
                />
                <span className="text-sm font-medium text-gray-700">Require photo verification</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              {editingId ? 'Update' : 'Create'} Chore
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {chores.map((chore) => (
          <div key={chore.id} className="flex justify-between items-start border-b pb-3 pt-1">
            <div className="flex-1 min-w-0">
              <div className="font-medium">{chore.name}</div>
              <div className="text-xs text-gray-500 mt-1">
                {chore.frequency}
                {chore.requires_photo === 1 && ' • Photo required'}
              </div>
            </div>
            <div className="flex gap-3 ml-2">
              <button
                onClick={() => handleEdit(chore)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(chore.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
