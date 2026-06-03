import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthSliderLayout from '../components/AuthSliderLayout';
import api from '../utils/api';
import { setStoredUser } from '../utils/auth';

const inputClassName =
  'mt-2 block w-full rounded-xl border border-[var(--color-brand-red)]/25 bg-white px-4 py-2.5 text-sm text-[var(--color-earth-brown)] shadow-sm outline-none transition focus:border-[var(--color-brand-red)] focus:ring-4 focus:ring-[var(--color-brand-red)]/14';
const MIN_PASSWORD_LENGTH = 6;
const EMPLOYEE_NUMBER_REGEX = /^\d{4}$/;

const Register = () => {
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!EMPLOYEE_NUMBER_REGEX.test(employeeNumber.trim())) {
      setError('Employee number must be exactly 4 digits');
      return;
    }

    if (password.trim().length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
      return;
    }

    try {
      setError('');
      setIsSubmitting(true);
      const { data } = await api.post('/api/auth/register', {
        employeeNumber,
        password,
      });
      setStoredUser(data);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthSliderLayout
      title="Create Account"
      switchPrompt="Already have an account?"
      switchLabel="Login"
      switchTo="/login"
    >
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-[var(--color-earth-brown)]">
            Last 4 digits of your employee number
          </label>
          <input
            type="text"
            value={employeeNumber}
            onChange={(e) => setEmployeeNumber(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className={inputClassName}
            autoComplete="username"
            placeholder="Enter the last 4 digits"
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[var(--color-earth-brown)]">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClassName}
            autoComplete="new-password"
            placeholder="Create a password"
            minLength={MIN_PASSWORD_LENGTH}
            disabled={isSubmitting}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-red)] px-4 py-3 text-sm font-semibold text-[var(--color-cream-white)] shadow-[0_16px_32px_rgba(89,10,22,0.22)] transition-transform hover:-translate-y-0.5 hover:bg-[var(--color-brand-red-dark)] disabled:cursor-not-allowed disabled:opacity-80 disabled:hover:translate-y-0 disabled:hover:bg-[var(--color-brand-red)]"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Register
        </button>
      </form>
    </AuthSliderLayout>
  );
};

export default Register;
