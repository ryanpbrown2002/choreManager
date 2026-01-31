import { useState, useEffect } from 'react';
import { api } from '../api/client';

export function useMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/groups/members');
      setMembers(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const updateRole = async (userId, role) => {
    const response = await api.patch(`/users/${userId}/role`, { role });
    await fetchMembers();
    return response.data;
  };

  const deleteMember = async (userId) => {
    await api.delete(`/users/${userId}`);
    await fetchMembers();
  };

  const updateRotation = async (userId, inRotation) => {
    const response = await api.patch(`/users/${userId}/rotation`, { inRotation });
    await fetchMembers();
    return response.data;
  };

  return { members, loading, error, refetch: fetchMembers, updateRole, deleteMember, updateRotation };
}

export function useChores() {
  const [chores, setChores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchChores = async () => {
    try {
      setLoading(true);
      const response = await api.get('/chores');
      setChores(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChores();
  }, []);

  const createChore = async (choreData) => {
    const response = await api.post('/chores', choreData);
    await fetchChores();
    return response.data;
  };

  const updateChore = async (id, choreData) => {
    const response = await api.patch(`/chores/${id}`, choreData);
    await fetchChores();
    return response.data;
  };

  const deleteChore = async (id) => {
    await api.delete(`/chores/${id}`);
    await fetchChores();
  };

  const reorderChore = async (choreId, direction) => {
    const response = await api.post('/chores/reorder', { choreId, direction });
    setChores(response.data);
    return response.data;
  };

  return { chores, loading, error, refetch: fetchChores, createChore, updateChore, deleteChore, reorderChore };
}

export function useAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/assignments/all');
      setAssignments(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const completeAssignment = async (id, photoFiles) => {
    const formData = new FormData();
    if (photoFiles && photoFiles.length > 0) {
      photoFiles.forEach(file => {
        formData.append('photos', file);
      });
    }
    const response = await api.post(`/assignments/${id}/complete`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    await fetchAssignments();
    return response.data;
  };

  const adminCompleteAssignment = async (id) => {
    const response = await api.post(`/assignments/${id}/complete`);
    await fetchAssignments();
    return response.data;
  };

  const rejectAssignment = async (id) => {
    const response = await api.post(`/assignments/${id}/reject`);
    await fetchAssignments();
    return response.data;
  };

  return { assignments, loading, error, refetch: fetchAssignments, completeAssignment, adminCompleteAssignment, rejectAssignment };
}

export function useGroup() {
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGroup = async () => {
    try {
      setLoading(true);
      const response = await api.get('/groups');
      setGroup(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, []);

  return { group, loading, error, refetch: fetchGroup };
}
