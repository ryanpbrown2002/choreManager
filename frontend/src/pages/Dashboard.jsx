import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMembers, useChores, useAssignments, useGroup } from '../hooks/useData';
import { getCurrentWeekStart } from '../utils/dateUtils';
import Layout from '../components/Layout';
import WeeklyAssignmentsTable from '../components/WeeklyAssignmentsTable';
import CompleteChoreModal from '../components/CompleteChoreModal';
import AssignmentManager from '../components/AssignmentManager';
import CompletionStats from '../components/CompletionStats';

export default function Dashboard() {
  const { user } = useAuth();
  const { members } = useMembers();
  const { chores } = useChores();
  const { assignments, completeAssignment, refetch: refetchAssignments } = useAssignments();
  const { group } = useGroup();

  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(getCurrentWeekStart());

  const handleCompleteClick = (assignment) => {
    setSelectedAssignment(assignment);
  };

  const handleCompleteSubmit = async (assignmentId, photoFile) => {
    await completeAssignment(assignmentId, photoFile);
    await refetchAssignments();
  };

  const handleCloseModal = () => {
    setSelectedAssignment(null);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{group?.name || 'Loading...'}</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">Welcome back, {user?.name}!</p>
        </div>

        {user?.role === 'admin' && (
          <AssignmentManager
            chores={chores}
            members={members}
            onAssignmentsChange={refetchAssignments}
          />
        )}

        <WeeklyAssignmentsTable
          assignments={assignments}
          onCompleteClick={handleCompleteClick}
          onAssignmentsChange={refetchAssignments}
          weekStart={currentWeekStart}
          onWeekChange={setCurrentWeekStart}
          chores={chores}
          members={members}
        />

        <CompletionStats
          assignments={assignments}
          members={members}
          chores={chores}
        />

        {selectedAssignment && (
          <CompleteChoreModal
            assignment={selectedAssignment}
            onComplete={handleCompleteSubmit}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </Layout>
  );
}
