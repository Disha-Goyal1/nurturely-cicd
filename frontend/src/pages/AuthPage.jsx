import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

const roles = [
  { value: 'parent', label: 'Parent' },
  { value: 'caregiver', label: 'Caregiver' },
  { value: 'therapist', label: 'Therapist' },
];

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const navigate = useNavigate();
  const { login, register, authError } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'parent' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authError) setError(authError);
  }, [authError]);

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError('');
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { name, email, password, role } = form;
      if (isRegister) {
        const result = await register({ name, email, password, role });
        if (!result.authenticated) {
          setError('Supabase did not return an active session. Check the Supabase Auth settings, then try signing in.');
          return;
        }
      } else {
        await login({ email, password });
      }
      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-glow auth-glow-one" aria-hidden="true" />
      <div className="auth-glow auth-glow-two" aria-hidden="true" />
      <section className="auth-card">
        <aside className="auth-aside">
          <Link className="flex items-center gap-3 text-lg font-semibold tracking-wide text-white" to="/">
            <span className="brand-mark" aria-hidden="true">n</span>
            <span>
              <span className="block">nurturely</span>
              <span className="mt-0.5 block text-[9px] font-normal tracking-[0.12em] text-white/65">AI FAMILY ECOSYSTEM</span>
            </span>
          </Link>
          <div className="auth-aside-copy">
            <p className="eyebrow">A LITTLE SUPPORT GOES A LONG WAY</p>
            <h1>Parenting wasn’t meant to be done alone.</h1>
            <p>A trusted space for care, guidance, and the people who help your family thrive.</p>
          </div>
          <p className="auth-aside-foot">Here for every step of your parenting journey.</p>
        </aside>

        <div className="auth-form-side">
          <Link className="auth-mobile-brand flex items-center gap-3 text-lg font-semibold text-ink" to="/">
            <span className="brand-mark" aria-hidden="true">n</span>
            <span>
              <span className="block">nurturely</span>
              <span className="mt-0.5 block text-[9px] font-normal tracking-[0.12em] text-muted">AI FAMILY ECOSYSTEM</span>
            </span>
          </Link>
          <div className="auth-heading">
            <p className="eyebrow">{isRegister ? 'YOUR VILLAGE STARTS HERE' : 'WELCOME BACK'}</p>
            <h2>{isRegister ? 'Create your account' : 'Sign in to your space'}</h2>
            <p>{isRegister ? 'Join a thoughtful community built around family wellbeing.' : 'A calmer day is just a sign-in away.'}</p>
          </div>
          <form className="auth-form" onSubmit={submit}>
            {isRegister && (
              <label className="form-label">
                Full name
                <input
                  autoComplete="name"
                  className="form-input"
                  name="name"
                  onChange={update}
                  placeholder="Your name"
                  required
                  value={form.name}
                />
              </label>
            )}
            <label className="form-label">
              Email address
              <input
                autoComplete="email"
                className="form-input"
                name="email"
                onChange={update}
                placeholder="you@example.com"
                required
                type="email"
                value={form.email}
              />
            </label>
            <label className="form-label">
              Password
              <input
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                className="form-input"
                minLength={8}
                name="password"
                onChange={update}
                placeholder="At least 8 characters"
                required
                type="password"
                value={form.password}
              />
            </label>
            {isRegister && (
              <label className="form-label">
                I’m joining as a
                <select className="form-input" name="role" onChange={update} value={form.role}>
                  {roles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
                </select>
              </label>
            )}
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="primary-button" disabled={submitting} type="submit">
              {submitting ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
            </button>
          </form>
          <p className="auth-switch">
            {isRegister ? 'Already have an account?' : 'New to Nurturely?'}{' '}
            <Link to={isRegister ? '/login' : '/register'}>
              {isRegister ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
