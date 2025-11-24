'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

import { Button, Card, Input, Modal } from '@/components/ui';
import { CONFIRMATIONS, MESSAGES } from '@/constants';
import { createTask, deleteTask, fetchTasks, updateTask } from '@/store/features/tasks';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { Task } from '@/types';
import { formatDate } from '@/utils';

export default function TasksPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, accessToken, loading: authLoading } = useAppSelector((state) => state.auth);
  const { items: tasks, loading, error } = useAppSelector((state) => state.tasks);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [formErrors, setFormErrors] = useState<{ title?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editFormData, setEditFormData] = useState({ title: '', description: '' });
  const [editFormErrors, setEditFormErrors] = useState<{ title?: string }>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (!authLoading && !accessToken) {
      router.push('/login');
      return;
    }

    if (accessToken && user && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      dispatch(fetchTasks());
    }

    if (!accessToken) {
      hasFetchedRef.current = false;
    }
  }, [accessToken, user, authLoading, router, dispatch]);

  const validateForm = (): boolean => {
    const errors: { title?: string } = {};
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateEditForm = (): boolean => {
    const errors: { title?: string } = {};
    if (!editFormData.title.trim()) {
      errors.title = 'Title is required';
    }
    setEditFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      await dispatch(
        createTask({
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
        }),
      ).unwrap();
      setFormData({ title: '', description: '' });
      setFormErrors({});
      toast.success(MESSAGES.TASK_CREATED);
    } catch {
      dispatch(fetchTasks());
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (task: Task) => {
    try {
      setTogglingId(task.id);
      await dispatch(
        updateTask({
          id: task.id,
          data: {
            title: task.title,
            description: task.description || undefined,
            completed: !task.completed,
          },
        }),
      ).unwrap();
      toast.success(MESSAGES.TASK_UPDATED);
    } catch {
      dispatch(fetchTasks());
    } finally {
      setTogglingId(null);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setEditFormData({
      title: task.title,
      description: task.description || '',
    });
    setEditFormErrors({});
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingTask || !validateEditForm()) return;

    try {
      setUpdatingId(editingTask.id);
      await dispatch(
        updateTask({
          id: editingTask.id,
          data: {
            title: editFormData.title.trim(),
            description: editFormData.description.trim() || undefined,
            completed: editingTask.completed,
          },
        }),
      ).unwrap();
      setEditingTask(null);
      setEditFormData({ title: '', description: '' });
      setEditFormErrors({});
      toast.success(MESSAGES.TASK_UPDATED);
    } catch {
      dispatch(fetchTasks());
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(CONFIRMATIONS.DELETE_TASK)) return;

    try {
      setDeletingId(id);
      await dispatch(deleteTask(id)).unwrap();
      toast.success(MESSAGES.TASK_DELETED);
    } catch {
      dispatch(fetchTasks());
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading || (accessToken && !user) || !accessToken) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-lg">{MESSAGES.LOADING}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">My Tasks</h1>

      <Card className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Add New Task
        </h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Title"
            type="text"
            value={formData.title}
            onChange={(e) => {
              setFormData({ ...formData, title: e.target.value });
              if (formErrors.title) {
                setFormErrors({});
              }
            }}
            required
            disabled={submitting}
            placeholder="Enter task title"
            error={formErrors.title}
          />
          <Input
            label="Description"
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            disabled={submitting}
            placeholder="Enter task description (optional)"
          />
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? MESSAGES.ADDING_TASK : 'Add Task'}
          </Button>
        </form>
      </Card>

      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Tasks ({tasks.length})
        </h2>
        {loading ? (
          <Card>
            <p className="text-gray-500 dark:text-gray-400 text-center">{MESSAGES.LOADING_TASKS}</p>
          </Card>
        ) : tasks.length === 0 ? (
          <Card>
            <p className="text-gray-500 dark:text-gray-400 text-center">{MESSAGES.NO_TASKS}</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggle(task)}
                    disabled={togglingId === task.id}
                    className="w-5 h-5 mt-1 rounded border-gray-300 dark:border-gray-600 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    aria-label={`Mark task "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
                  />
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-lg font-medium mb-1 ${
                        task.completed
                          ? 'line-through text-gray-500 dark:text-gray-400'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-2">{task.description}</p>
                    )}
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Created: {formatDate(task.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => handleEdit(task)}
                      disabled={updatingId === task.id}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      aria-label={`Edit task "${task.title}"`}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleDelete(task.id)}
                      disabled={deletingId === task.id}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50"
                      aria-label={`Delete task "${task.title}"`}
                    >
                      {deletingId === task.id ? MESSAGES.LOADING : 'Delete'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={editingTask !== null}
        onClose={() => {
          setEditingTask(null);
          setEditFormData({ title: '', description: '' });
          setEditFormErrors({});
        }}
        title="Edit Task"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Title"
            type="text"
            value={editFormData.title}
            onChange={(e) => {
              setEditFormData({ ...editFormData, title: e.target.value });
              if (editFormErrors.title) {
                setEditFormErrors({});
              }
            }}
            required
            disabled={updatingId !== null}
            placeholder="Enter task title"
            error={editFormErrors.title}
          />
          <Input
            label="Description"
            type="text"
            value={editFormData.description}
            onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
            disabled={updatingId !== null}
            placeholder="Enter task description (optional)"
          />
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingTask(null);
                setEditFormData({ title: '', description: '' });
                setEditFormErrors({});
              }}
              disabled={updatingId !== null}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={updatingId !== null}>
              {updatingId !== null ? MESSAGES.LOADING : 'Update Task'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
