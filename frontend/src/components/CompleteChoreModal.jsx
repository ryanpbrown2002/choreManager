import { useState, useRef } from 'react';

const MAX_PHOTOS = 3;

export default function CompleteChoreModal({ assignment, onComplete, onClose }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFilesSelected = (files) => {
    const fileArray = Array.from(files);
    const remainingSlots = MAX_PHOTOS - selectedFiles.length;
    const filesToAdd = fileArray.slice(0, remainingSlots);

    if (fileArray.length > remainingSlots) {
      setError(`You can only add ${remainingSlots} more photo${remainingSlots !== 1 ? 's' : ''} (max ${MAX_PHOTOS})`);
    } else {
      setError('');
    }

    const newFiles = [...selectedFiles, ...filesToAdd];
    setSelectedFiles(newFiles);

    // Generate previews for new files
    filesToAdd.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCameraCapture = (e) => {
    if (e.target.files?.length) {
      handleFilesSelected(e.target.files);
    }
    e.target.value = '';
  };

  const handleFileSelect = (e) => {
    if (e.target.files?.length) {
      handleFilesSelected(e.target.files);
    }
    e.target.value = '';
  };

  const removePhoto = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (assignment.requires_photo && selectedFiles.length === 0) {
      setError('At least one photo is required for this chore');
      return;
    }

    setLoading(true);
    try {
      await onComplete(assignment.id, selectedFiles);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to complete chore');
    } finally {
      setLoading(false);
    }
  };

  const canAddMore = selectedFiles.length < MAX_PHOTOS;

  if (!assignment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900 dark:text-white">Complete Chore</h2>

        <div className="mb-4">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{assignment.chore_name}</h3>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-400 p-3 rounded text-sm">{error}</div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {assignment.requires_photo ? 'Add Photos *' : 'Add Photos (optional)'}
              <span className="text-xs font-normal ml-2 text-gray-500">
                ({selectedFiles.length}/{MAX_PHOTOS})
              </span>
            </label>

            {/* Hidden inputs for camera and file picker */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraCapture}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Photo action buttons */}
            {canAddMore && (
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  Take Photo
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  Choose Files
                </button>
              </div>
            )}

            {!canAddMore && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mb-3">
                Maximum {MAX_PHOTOS} photos reached. Remove one to add another.
              </p>
            )}
          </div>

          {/* Photo previews */}
          {previews.length > 0 && (
            <div className="mb-4">
              <div className="grid grid-cols-3 gap-2">
                {previews.map((preview, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold hover:bg-red-600 shadow-md"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Mark Complete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
