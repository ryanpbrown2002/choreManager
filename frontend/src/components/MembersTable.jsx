import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function MembersTable({ members, onUpdateRole, onDeleteMember }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [updatingRole, setUpdatingRole] = useState(null);

  const handleRoleChange = async (memberId, newRole) => {
    try {
      setUpdatingRole(memberId);
      await onUpdateRole(memberId, newRole);
    } catch (error) {
      console.error('Failed to update role:', error);
      alert(error.response?.data?.error || 'Failed to update role');
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleDelete = async (memberId, memberName) => {
    if (!window.confirm(`Delete ${memberName} from the group? This cannot be undone.`)) {
      return;
    }

    try {
      await onDeleteMember(memberId);
    } catch (error) {
      console.error('Failed to delete member:', error);
      alert(error.response?.data?.error || 'Failed to delete member');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Members</h2>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              {isAdmin && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {members.map((member) => {
              const isCurrentUser = member.id === user?.id;
              const isUpdating = updatingRole === member.id;

              return (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {member.name}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-gray-500">(You)</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{member.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isAdmin && !isCurrentUser ? (
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                        disabled={isUpdating}
                        className="text-xs font-semibold rounded-full px-2 py-1 border-0 bg-gray-100 cursor-pointer disabled:opacity-50"
                      >
                        <option value="member">member</option>
                        <option value="admin">admin</option>
                      </select>
                    ) : (
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          member.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {member.role}
                      </span>
                    )}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {!isCurrentUser && (
                        <button
                          onClick={() => handleDelete(member.id, member.name)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden divide-y divide-gray-200">
        {members.map((member) => {
          const isCurrentUser = member.id === user?.id;
          const isUpdating = updatingRole === member.id;

          return (
            <div key={member.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-gray-900">
                    {member.name}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs text-gray-500">(You)</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 break-all">{member.email}</div>
                </div>
                {isAdmin && !isCurrentUser ? (
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                    disabled={isUpdating}
                    className="text-xs font-semibold rounded-full px-2 py-1 border-0 bg-gray-100 cursor-pointer disabled:opacity-50"
                  >
                    <option value="member">member</option>
                    <option value="admin">admin</option>
                  </select>
                ) : (
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      member.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {member.role}
                  </span>
                )}
              </div>
              {isAdmin && !isCurrentUser && (
                <div className="mt-3">
                  <button
                    onClick={() => handleDelete(member.id, member.name)}
                    className="text-sm text-red-600 hover:text-red-900"
                  >
                    Remove from group
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
