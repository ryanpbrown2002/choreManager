import { useState } from 'react';

export default function CompletionStats({ assignments, members, chores, user, onNotify, onNotifyAll }) {
  const [viewMode, setViewMode] = useState('members'); // 'members' or 'chores'
  const [notifyingId, setNotifyingId] = useState(null); // userId being notified
  const [notifyingAll, setNotifyingAll] = useState(false);

  const isAdmin = user?.role === 'admin';

  // Calculate stats by member
  const getMemberStats = () => {
    const stats = {};

    members.forEach(member => {
      stats[member.id] = {
        id: member.id,
        name: member.name,
        total: 0,
        completed: 0,
        pending: 0,
        overdue: 0,
        completionRate: 0
      };
    });

    assignments.forEach(assignment => {
      if (stats[assignment.user_id]) {
        stats[assignment.user_id].total++;
        if (assignment.status === 'completed') {
          stats[assignment.user_id].completed++;
        } else if (assignment.status === 'pending') {
          stats[assignment.user_id].pending++;
        } else if (assignment.status === 'overdue') {
          stats[assignment.user_id].overdue++;
        }
      }
    });

    Object.keys(stats).forEach(userId => {
      const stat = stats[userId];
      if (stat.total > 0) {
        stat.completionRate = Math.round((stat.completed / stat.total) * 100);
      }
    });

    return Object.values(stats).sort((a, b) => b.completionRate - a.completionRate);
  };

  // Calculate stats by chore
  const getChoreStats = () => {
    const stats = {};

    chores.forEach(chore => {
      stats[chore.id] = {
        name: chore.name,
        total: 0,
        completed: 0,
        pending: 0,
        overdue: 0,
        completionRate: 0
      };
    });

    assignments.forEach(assignment => {
      if (stats[assignment.chore_id]) {
        stats[assignment.chore_id].total++;
        if (assignment.status === 'completed') {
          stats[assignment.chore_id].completed++;
        } else if (assignment.status === 'pending') {
          stats[assignment.chore_id].pending++;
        } else if (assignment.status === 'overdue') {
          stats[assignment.chore_id].overdue++;
        }
      }
    });

    Object.keys(stats).forEach(choreId => {
      const stat = stats[choreId];
      if (stat.total > 0) {
        stat.completionRate = Math.round((stat.completed / stat.total) * 100);
      }
    });

    return Object.values(stats).sort((a, b) => b.completionRate - a.completionRate);
  };

  const handleNotify = async (userId) => {
    setNotifyingId(userId);
    try {
      await onNotify([userId]);
    } finally {
      setNotifyingId(null);
    }
  };

  const handleNotifyAll = async () => {
    setNotifyingAll(true);
    try {
      await onNotifyAll();
    } finally {
      setNotifyingAll(false);
    }
  };

  const memberStats = getMemberStats();
  const choreStats = getChoreStats();
  const currentStats = viewMode === 'members' ? memberStats : choreStats;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Completion Stats</h2>
          <div className="flex gap-2">
            {isAdmin && viewMode === 'members' && (
              <button
                onClick={handleNotifyAll}
                disabled={notifyingAll}
                className="flex-1 sm:flex-none px-3 py-1 rounded-md text-sm bg-yellow-500 hover:bg-yellow-600 text-white disabled:opacity-50"
              >
                {notifyingAll ? 'Sending...' : 'Notify All'}
              </button>
            )}
            <button
              onClick={() => setViewMode('members')}
              className={`flex-1 sm:flex-none px-3 py-1 rounded-md text-sm ${
                viewMode === 'members'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              By Member
            </button>
            <button
              onClick={() => setViewMode('chores')}
              className={`flex-1 sm:flex-none px-3 py-1 rounded-md text-sm ${
                viewMode === 'chores'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              By Chore
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {viewMode === 'members' ? 'Member' : 'Chore'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Completed
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Pending
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Completion Rate
              </th>
              {isAdmin && viewMode === 'members' && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {currentStats.length === 0 ? (
              <tr>
                <td colSpan={isAdmin && viewMode === 'members' ? 6 : 5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No stats available
                </td>
              </tr>
            ) : (
              currentStats.map((stat, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{stat.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{stat.total}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-green-600 dark:text-green-400 font-semibold">{stat.completed}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-yellow-600 dark:text-yellow-400">{stat.pending}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white mr-2">
                        {stat.completionRate}%
                      </div>
                      <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${stat.completionRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  {isAdmin && viewMode === 'members' && (
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleNotify(stat.id)}
                        disabled={notifyingId === stat.id}
                        className="px-3 py-1 rounded-md text-xs bg-yellow-500 hover:bg-yellow-600 text-white disabled:opacity-50"
                      >
                        {notifyingId === stat.id ? 'Sending...' : 'Notify'}
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden">
        {currentStats.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
            No stats available
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {currentStats.map((stat, index) => (
              <div key={index} className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">{stat.name}</span>
                  <div className="flex items-center gap-2">
                    {isAdmin && viewMode === 'members' && (
                      <button
                        onClick={() => handleNotify(stat.id)}
                        disabled={notifyingId === stat.id}
                        className="px-2 py-1 rounded-md text-xs bg-yellow-500 hover:bg-yellow-600 text-white disabled:opacity-50"
                      >
                        {notifyingId === stat.id ? '...' : 'Notify'}
                      </button>
                    )}
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{stat.completionRate}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-3">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${stat.completionRate}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total: {stat.total}</span>
                  <span className="text-green-600 dark:text-green-400">Done: {stat.completed}</span>
                  <span className="text-yellow-600 dark:text-yellow-400">Pending: {stat.pending}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
