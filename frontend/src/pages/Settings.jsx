import { useState } from 'react';
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
  const { members, updateRole, deleteMember } = useMembers();
  const { chores, createChore, updateChore, deleteChore } = useChores();

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
        />

        <MembersTable
          members={members}
          onUpdateRole={updateRole}
          onDeleteMember={deleteMember}
        />
      </div>
    </Layout>
  );
}
