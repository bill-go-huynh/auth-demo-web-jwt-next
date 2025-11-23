'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchTasks, createTask, updateTask, deleteTask } from '@/store/taskSlice';
import type { Task } from '@/types';
import { Button, Input, Card } from '@/components/ui';
import { MESSAGES, CONFIRMATIONS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

export default function TasksPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, accessToken } = useAppSelector((state) => state.auth);
  const { items: tasks, loading, error } = useAppSelector((state) => state.tasks);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [formErrors, setFormErrors] = useState<{ title?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken || !user) {
      router.push('/login');
      return;
    }
    dispatch(fetchTasks());
  }, [accessToken, user, router, dispatch]);

  const validateForm = (): boolean => {
    const errors: { title?: string } = {};
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    setFormErrors(errors);
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
      // Optimistic update already handled by Redux
      setFormData({ title: '', description: '' });
      setFormErrors({});
    } catch {
      // Error is handled by Redux, reload tasks to sync with server
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
          data: { completed: !task.completed },
        }),
      ).unwrap();
      // Optimistic update already handled by Redux
    } catch {
      // Error is handled by Redux, reload tasks to sync with server
      dispatch(fetchTasks());
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(CONFIRMATIONS.DELETE_TASK)) return;

    try {
      setDeletingId(id);
      await dispatch(deleteTask(id)).unwrap();
      // Optimistic update already handled by Redux
    } catch {
      // Error is handled by Redux, reload tasks to sync with server
      dispatch(fetchTasks());
    } finally {
      setDeletingId(null);
    }
  };

  if (!accessToken || !user) {
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
      <h1 className="text-3xl font-bold mb-8">My Tasks</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <Card className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
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
        <h2 className="text-2xl font-semibold mb-4">Tasks ({tasks.length})</h2>
        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">{MESSAGES.LOADING_TASKS}</p>
        ) : tasks.length === 0 ? (
          <Card>
            <p className="text-gray-500 dark:text-gray-400 text-center">{MESSAGES.NO_TASKS}</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card key={task.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggle(task)}
                        disabled={togglingId === task.id}
                        className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 disabled:opacity-50"
                        aria-label={`Mark task "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
                      />
                      <h3
                        className={`text-lg font-medium ${
                          task.completed
                            ? 'line-through text-gray-500 dark:text-gray-400'
                            : 'text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        {task.title}
                      </h3>
                    </div>
                    {task.description && (
                      <p className="text-gray-600 dark:text-gray-400 ml-8">{task.description}</p>
                    )}
                    <p className="text-xs text-gray-400 dark:text-gray-500 ml-8 mt-2">
                      Created: {formatDate(task.createdAt)}
                    </p>
                  </div>
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
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
