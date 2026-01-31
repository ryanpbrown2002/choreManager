import { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function ChoresManagement({ chores, onCreateChore, onUpdateChore, onDeleteChore, onReorderChore, onReorderChores }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    frequency: 'weekly',
    requiresPhoto: false
  });
  const [editingId, setEditingId] = useState(null);

  // Drag and drop state
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const dragCounter = useRef(0);

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

  // Drag and drop handlers
  const handleDragStart = (e, choreId) => {
    setDraggedId(choreId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', choreId);
    // Add a slight delay to allow the drag image to be set
    setTimeout(() => {
      e.target.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedId(null);
    setDragOverId(null);
    dragCounter.current = 0;
  };

  const handleDragEnter = (e, choreId) => {
    e.preventDefault();
    dragCounter.current++;
    if (choreId !== draggedId) {
      setDragOverId(choreId);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverId(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetId) => {
    e.preventDefault();
    dragCounter.current = 0;

    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    // Create new order by moving dragged item to target position
    const currentOrder = chores.map(c => c.id);
    const draggedIndex = currentOrder.indexOf(draggedId);
    const targetIndex = currentOrder.indexOf(targetId);

    // Remove dragged item and insert at target position
    currentOrder.splice(draggedIndex, 1);
    currentOrder.splice(targetIndex, 0, draggedId);

    setDraggedId(null);
    setDragOverId(null);

    // Call API to save new order
    try {
      await onReorderChores?.(currentOrder);
    } catch (err) {
      console.error('Failed to reorder chores:', err);
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">Chores</h2>
        <div className="space-y-2">
          {chores.map((chore) => (
            <div key={chore.id} className="border-b dark:border-gray-700 pb-2">
              <div className="font-medium text-gray-900 dark:text-white">
                <span className="text-gray-500 dark:text-gray-400">#{chore.order_num}</span> {chore.name}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Manage Chores</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 sm:px-4 py-2 bg-blue-600 text-white text-sm sm:text-base rounded-md hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Add Chore'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-3 sm:p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Chore Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-base bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Frequency *
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-base bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
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
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Require photo verification</span>
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
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        Drag chores to reorder, or use the arrows
      </p>

      <div className="space-y-1">
        {chores.map((chore, index) => (
          <div
            key={chore.id}
            draggable
            onDragStart={(e) => handleDragStart(e, chore.id)}
            onDragEnd={handleDragEnd}
            onDragEnter={(e) => handleDragEnter(e, chore.id)}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, chore.id)}
            className={`flex justify-between items-center border rounded-lg p-2 sm:p-3 transition-all cursor-grab active:cursor-grabbing
              ${draggedId === chore.id ? 'opacity-50' : ''}
              ${dragOverId === chore.id && draggedId !== chore.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 border-2'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {/* Drag handle */}
              <div className="text-gray-400 dark:text-gray-500 flex-shrink-0 cursor-grab">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"/>
                </svg>
              </div>

              {/* Reorder buttons */}
              <div className="flex flex-col flex-shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); onReorderChore?.(chore.id, 'up'); }}
                  disabled={index === 0}
                  className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move up"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onReorderChore?.(chore.id, 'down'); }}
                  disabled={index === chores.length - 1}
                  className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move down"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 dark:text-white flex items-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-bold rounded-full mr-2 flex-shrink-0">
                    {chore.order_num}
                  </span>
                  <span className="truncate">{chore.name}</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 ml-8">
                  {chore.frequency}
                  {chore.requires_photo === 1 && ' • Photo required'}
                </div>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3 ml-2 flex-shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); handleEdit(chore); }}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
              >
                Edit
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(chore.id); }}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm"
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
