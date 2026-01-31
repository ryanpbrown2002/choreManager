import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../api/client';
import { filterAssignmentsByWeek, getWeekBounds, getWeekStartTimestamp } from '../utils/dateUtils';

// Helper to parse photo paths (handles both old single path and new JSON array format)
function getPhotoPaths(photoPath) {
  if (!photoPath) return [];
  try {
    const parsed = JSON.parse(photoPath);
    return Array.isArray(parsed) ? parsed : [photoPath];
  } catch {
    return [photoPath];
  }
}

// Extract filename from path (handles "uploads/filename" format)
function getFilename(path) {
  return path.split('/').pop();
}

// Fetch a short-lived token for a photo
async function fetchPhotoToken(filename) {
  const response = await api.post('/assignments/photo-token', { filename });
  return response.data.token;
}

// Build photo URL with short-lived token
function buildPhotoUrl(filename, token) {
  return `/api/assignments/photos/${filename}?token=${encodeURIComponent(token)}`;
}

// Photo viewer modal component (works for both desktop and mobile)
function PhotoViewer({ photoPaths }) {
  const [isOpen, setIsOpen] = useState(false);
  const [photoUrls, setPhotoUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const photoCount = photoPaths.length;

  // Fetch short-lived tokens when modal opens
  useEffect(() => {
    if (isOpen && photoPaths.length > 0) {
      setLoading(true);
      setError(null);

      Promise.all(
        photoPaths.map(async (path) => {
          const filename = getFilename(path);
          const token = await fetchPhotoToken(filename);
          return buildPhotoUrl(filename, token);
        })
      )
        .then(urls => {
          setPhotoUrls(urls);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to load photos:', err);
          setError('Failed to load photos');
          setLoading(false);
        });
    }
  }, [isOpen, photoPaths]);

  if (photoPaths.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-medium"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
        {photoCount === 1 ? 'View Photo' : `Photos (${photoCount})`}
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <span className="font-medium text-gray-900 dark:text-white">
                {photoCount === 1 ? '1 Photo' : `${photoCount} Photos`}
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Photo grid */}
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
              {loading && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Loading photos...
                </div>
              )}
              {error && (
                <div className="text-center py-8 text-red-500 dark:text-red-400">
                  {error}
                </div>
              )}
              {!loading && !error && (
                <>
                  <div className="grid gap-3" style={{ gridTemplateColumns: photoCount === 1 ? '1fr' : 'repeat(2, 1fr)' }}>
                    {photoUrls.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block aspect-square overflow-hidden rounded-lg hover:opacity-80 transition-opacity"
                      >
                        <img
                          src={url}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                    Click photo to open full size
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Mobile photo viewer (button style)
function MobilePhotoViewer({ photoPaths }) {
  const [isOpen, setIsOpen] = useState(false);
  const [photoUrls, setPhotoUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const photoCount = photoPaths.length;

  // Fetch short-lived tokens when modal opens
  useEffect(() => {
    if (isOpen && photoPaths.length > 0) {
      setLoading(true);
      setError(null);

      Promise.all(
        photoPaths.map(async (path) => {
          const filename = getFilename(path);
          const token = await fetchPhotoToken(filename);
          return buildPhotoUrl(filename, token);
        })
      )
        .then(urls => {
          setPhotoUrls(urls);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to load photos:', err);
          setError('Failed to load photos');
          setLoading(false);
        });
    }
  }, [isOpen, photoPaths]);

  if (photoPaths.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="py-2 px-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 inline-flex items-center gap-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
        {photoCount === 1 ? 'View Photo' : `Photos (${photoCount})`}
      </button>

      {/* Full screen modal for mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col">
          <div className="flex justify-between items-center p-4">
            <span className="text-white font-medium">
              {photoCount === 1 ? '1 Photo' : `${photoCount} Photos`}
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white p-2 hover:bg-white/10 rounded-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {loading && (
              <div className="text-center py-8 text-gray-400">
                Loading photos...
              </div>
            )}
            {error && (
              <div className="text-center py-8 text-red-400">
                {error}
              </div>
            )}
            {!loading && !error && (
              <>
                <div className="grid gap-3" style={{ gridTemplateColumns: photoCount === 1 ? '1fr' : 'repeat(2, 1fr)' }}>
                  {photoUrls.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block aspect-square overflow-hidden rounded-lg"
                    >
                      <img
                        src={url}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ))}
                </div>
                <p className="text-sm text-gray-400 mt-4 text-center">
                  Tap photo to open full size
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function WeeklyAssignmentsTable({ assignments, onCompleteClick, onAdminComplete, onReject, onAssignmentsChange, weekStart, onWeekChange, chores, members }) {
  const { user } = useAuth();
  const [rotating, setRotating] = useState(false);
  const [completing, setCompleting] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const isAdmin = user?.role === 'admin';

  // Filter assignments by the selected week and sort by chore order
  const weekAssignments = (weekStart ? filterAssignmentsByWeek(assignments, weekStart) : assignments)
    .slice()
    .sort((a, b) => (a.chore_order || 0) - (b.chore_order || 0));

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

  const handleAdminComplete = async (assignmentId) => {
    if (!window.confirm('Mark this chore as complete?')) {
      return;
    }
    setCompleting(assignmentId);
    try {
      await onAdminComplete(assignmentId);
    } catch (err) {
      console.error('Failed to complete assignment:', err);
    } finally {
      setCompleting(null);
    }
  };

  const handleReject = async (assignmentId) => {
    if (!window.confirm('Reject this completion? The chore will be marked as pending again.')) {
      return;
    }
    setRejecting(assignmentId);
    try {
      await onReject(assignmentId);
    } catch (err) {
      console.error('Failed to reject assignment:', err);
    } finally {
      setRejecting(null);
    }
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* Header - Week Navigation */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
        {/* Week selector row */}
        <div className="flex items-center justify-between">
          <button
            onClick={goToPreviousWeek}
            className="p-2 sm:px-3 sm:py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md text-gray-700 dark:text-gray-300"
          >
            <span className="hidden sm:inline">&larr; Prev</span>
            <span className="sm:hidden">&larr;</span>
          </button>
          <div className="text-center">
            <h2 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white">
              {formatWeekRange(weekStart)}
            </h2>
            {!isCurrentWeek() && (
              <button
                onClick={goToCurrentWeek}
                className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Jump to Current Week
              </button>
            )}
          </div>
          <button
            onClick={goToNextWeek}
            className="p-2 sm:px-3 sm:py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md text-gray-700 dark:text-gray-300"
          >
            <span className="hidden sm:inline">Next &rarr;</span>
            <span className="sm:hidden">&rarr;</span>
          </button>
        </div>
        {/* Rotate button for admins */}
        {isAdmin && (
          <div className="mt-3 flex justify-center">
            <button
              onClick={handleRotate}
              disabled={rotating || !chores?.length || !members?.length}
              className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 text-sm"
            >
              {rotating ? 'Rotating...' : 'Rotate All Chores'}
            </button>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Chore
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Assigned To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {weekAssignments.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No assignments for this week
                </td>
              </tr>
            ) : (
              weekAssignments.map((assignment) => {
                const photoPaths = getPhotoPaths(assignment.photo_path);
                return (
                  <tr
                    key={assignment.id}
                    className={`${isMyAssignment(assignment) ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {assignment.chore_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{assignment.user_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          assignment.status === 'completed'
                            ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                            : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300'
                        }`}
                      >
                        {assignment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2 flex-wrap items-center">
                        {isMyAssignment(assignment) && assignment.status === 'pending' && (
                          <button
                            onClick={() => onCompleteClick(assignment)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-medium"
                          >
                            Mark Complete
                          </button>
                        )}
                        {isAdmin && !isMyAssignment(assignment) && assignment.status === 'pending' && (
                          <button
                            onClick={() => handleAdminComplete(assignment.id)}
                            disabled={completing === assignment.id}
                            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 font-medium disabled:opacity-50"
                          >
                            {completing === assignment.id ? 'Completing...' : 'Complete'}
                          </button>
                        )}
                        {isAdmin && assignment.status === 'completed' && (
                          <button
                            onClick={() => handleReject(assignment.id)}
                            disabled={rejecting === assignment.id}
                            className="text-orange-600 dark:text-orange-400 hover:text-orange-900 dark:hover:text-orange-300 font-medium disabled:opacity-50"
                          >
                            {rejecting === assignment.id ? 'Rejecting...' : 'Reject'}
                          </button>
                        )}
                        {assignment.status === 'completed' && photoPaths.length > 0 && (
                          <PhotoViewer photoPaths={photoPaths} />
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(assignment.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden">
        {weekAssignments.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
            No assignments for this week
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {weekAssignments.map((assignment) => {
              const photoPaths = getPhotoPaths(assignment.photo_path);
              return (
                <div
                  key={assignment.id}
                  className={`p-4 ${isMyAssignment(assignment) ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{assignment.chore_name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">{assignment.user_name}</div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        assignment.status === 'completed'
                          ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                          : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300'
                      }`}
                    >
                      {assignment.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {isMyAssignment(assignment) && assignment.status === 'pending' && (
                      <button
                        onClick={() => onCompleteClick(assignment)}
                        className="flex-1 min-w-[120px] py-2 px-3 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                      >
                        Mark Complete
                      </button>
                    )}
                    {isAdmin && !isMyAssignment(assignment) && assignment.status === 'pending' && (
                      <button
                        onClick={() => handleAdminComplete(assignment.id)}
                        disabled={completing === assignment.id}
                        className="flex-1 min-w-[100px] py-2 px-3 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
                      >
                        {completing === assignment.id ? 'Completing...' : 'Complete'}
                      </button>
                    )}
                    {isAdmin && assignment.status === 'completed' && (
                      <button
                        onClick={() => handleReject(assignment.id)}
                        disabled={rejecting === assignment.id}
                        className="py-2 px-3 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 text-sm rounded-md hover:bg-orange-200 dark:hover:bg-orange-900 disabled:opacity-50"
                      >
                        {rejecting === assignment.id ? 'Rejecting...' : 'Reject'}
                      </button>
                    )}
                    {assignment.status === 'completed' && photoPaths.length > 0 && (
                      <MobilePhotoViewer photoPaths={photoPaths} />
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(assignment.id)}
                        className="py-2 px-3 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-sm rounded-md hover:bg-red-200 dark:hover:bg-red-900"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
