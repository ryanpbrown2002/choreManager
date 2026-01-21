import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useGroup, useMembers, useChores } from '../hooks/useData';
import Layout from '../components/Layout';
import MembersTable from '../components/MembersTable';
import ChoresManagement from '../components/ChoresManagement';

export default function Settings() {
  const { user } = useAuth();
  const { group } = useGroup();
  const { members, updateRole, deleteMember } = useMembers();
  const { chores, createChore, updateChore, deleteChore } = useChores();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Profile</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Name</label>
              <p className="text-gray-900">{user?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-gray-900">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Role</label>
              <p className="text-gray-900 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Group Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Group Name</label>
              <p className="text-gray-900">{group?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Invite Code</label>
              <p className="font-mono text-lg font-semibold text-blue-700">
                {group?.invite_code}
              </p>
              <p className="text-sm text-gray-500 mt-1">
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
