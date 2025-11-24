'use client';

import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button, Card, Input } from '@/components/ui';
import { ERRORS, MESSAGES } from '@/constants';
import { authApi } from '@/services';
import { isValidEmail, isValidPassword, sanitizeInput } from '@/utils';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const validateForm = (): boolean => {
    const errors: { name?: string; email?: string; password?: string } = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (!isValidPassword(formData.password)) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await authApi.register({
        name: sanitizeInput(formData.name),
        email: sanitizeInput(formData.email),
        password: formData.password,
      });
      toast.success(MESSAGES.REGISTER_SUCCESS);
      router.push('/login');
    } catch (error) {
      const message = error instanceof Error ? error.message : ERRORS.REGISTER_FAILED;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: 'name' | 'email' | 'password', value: string) => {
    setFormData({ ...formData, [field]: value });
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: undefined });
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card>
        <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
            disabled={loading}
            error={formErrors.name}
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
            disabled={loading}
            error={formErrors.email}
          />

          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            required
            disabled={loading}
            minLength={6}
            error={formErrors.password}
          />

          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? MESSAGES.LOADING : 'Register'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Login
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
