import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useGroup, useMembers, useChores } from '../hooks/useData';
import Layout from '../components/Layout';
import MembersTable from '../components/MembersTable';
import ChoresManagement from '../components/ChoresManagement';

export default function Settings() {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const { group } = useGroup();
  const { members, updateRole, deleteMember, updateRotation } = useMembers();
  const { chores, createChore, updateChore, deleteChore, reorderChore } = useChores();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">Settings</h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">Appearance</h2>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Dark Mode</label>
              <p className="text-xs text-gray-500 dark:text-gray-400">Toggle dark theme for the app</p>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                darkMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">Profile</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Name</label>
              <p className="text-gray-900 dark:text-white">{user?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Email</label>
              <p className="text-gray-900 dark:text-white break-all">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Role</label>
              <p className="text-gray-900 dark:text-white capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">Group Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Group Name</label>
              <p className="text-gray-900 dark:text-white">{group?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Invite Code</label>
              <p className="font-mono text-base sm:text-lg font-semibold text-blue-700 dark:text-blue-400">
                {group?.invite_code}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                Share this code with housemates to invite them to join
              </p>
            </div>
          </div>
        </div>

        <ChoresManagement
          chores={chores}
          onCreateChore={createChore}
          onUpdateChore={updateChore}
          onDeleteChore={deleteChore}
          onReorderChore={reorderChore}
        />

        <MembersTable
          members={members}
          onUpdateRole={updateRole}
          onDeleteMember={deleteMember}
          onUpdateRotation={updateRotation}
        />

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p className="mb-3">
              Chorho is open source software created by Ryan Brown
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                to="/privacy"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Privacy Policy
              </Link>
              <span className="text-gray-400 dark:text-gray-600">·</span>
              <a
                href="https://github.com/ryanpbrown2002/choreManager"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                GitHub
              </a>
              <span className="text-gray-400 dark:text-gray-600">·</span>
              <Link
                to="/terms"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
