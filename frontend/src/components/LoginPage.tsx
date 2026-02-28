import React, { useState } from 'react';
import { Atom, Eye, EyeOff, Zap, Brain, FlaskConical, Sigma } from 'lucide-react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithPopup
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

interface LoginPageProps {
    onLogin: (user: { name: string; email: string }) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [signupSuccess, setSignupSuccess] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email.trim() || !password.trim()) {
            setError('Please fill in all required fields.');
            return;
        }
        if (mode === 'signup' && !name.trim()) {
            setError('Please enter your name.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        try {
            if (mode === 'signup') {
                const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
                await updateProfile(userCredential.user, {
                    displayName: name.trim()
                });

                setSignupSuccess(true);
                setMode('login');
                setPassword('');
                setName('');
            } else {
                const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
                const user = userCredential.user;

                const userData = {
                    name: user.displayName || user.email?.split('@')[0] || 'User',
                    email: user.email || ''
                };

                localStorage.setItem('stem_user', JSON.stringify(userData));
                onLogin(userData);
            }
        } catch (err: any) {
            console.error('Auth error:', err);
            let message = 'An error occurred during authentication.';
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                message = 'Invalid email or password.';
            } else if (err.code === 'auth/email-already-in-use') {
                message = 'This email is already registered.';
            } else if (err.code === 'auth/invalid-email') {
                message = 'Please enter a valid email address.';
            } else if (err.code === 'auth/network-request-failed') {
                message = 'Network error. Please check your connection.';
            } else if (err.code === 'auth/internal-error') {
                message = 'If this is your first time, check your Firebase API key in .env.';
            }
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            const userData = {
                name: user.displayName || user.email?.split('@')[0] || 'User',
                email: user.email || ''
            };
            localStorage.setItem('stem_user', JSON.stringify(userData));
            onLogin(userData);
        } catch (err: any) {
            console.error('Google Auth error:', err);
            setError('Failed to sign in with Google. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: Brain, label: 'AI Problem Solver', desc: 'Step-by-step solutions for Physics, Chemistry & Maths' },
        { icon: FlaskConical, label: 'Interactive Concepts', desc: 'Visual simulations and formulas for every topic' },
        { icon: Zap, label: 'Practice Exams', desc: '120+ questions across difficulty levels with grading' },
        { icon: Sigma, label: 'Formula Cheat Sheets', desc: 'Downloadable PDF cheat sheets for all subjects' },
    ];

    return (
        <div className="min-h-screen bg-[#050c1a] flex overflow-hidden">
            {/* ── Left Panel ── */}
            <div className="hidden lg:flex flex-col w-1/2 relative bg-gradient-to-br from-[#0b1530] via-[#0e1f45] to-[#080f22] p-14 justify-between overflow-hidden">

                {/* Background glow orbs */}
                <div className="absolute top-20 left-10 w-80 h-80 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-20 right-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

                {/* Logo */}
                <div className="flex items-center space-x-3 relative z-10">
                    <div className="bg-blue-500/20 border border-blue-400/30 p-2.5 rounded-xl shadow-lg shadow-blue-500/10">
                        <Atom className="w-7 h-7 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-xl tracking-wide">STEM Engine</h1>
                        <p className="text-blue-400/70 text-[10px] uppercase font-semibold tracking-widest">AI Intelligence</p>
                    </div>
                </div>

                {/* Hero text */}
                <div className="relative z-10">
                    <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
                        Master Physics,<br />Chemistry & Maths<br />
                        <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                            with AI.
                        </span>
                    </h2>
                    <p className="text-slate-400 text-base leading-relaxed mb-10 max-w-md">
                        Your AI-powered adaptive learning companion. Solve any problem, understand every concept, and excel in your exams.
                    </p>

                    {/* Feature pills */}
                    <div className="space-y-3">
                        {features.map(({ icon: Icon, label, desc }) => (
                            <div key={label} className="flex items-start space-x-3 group">
                                <div className="mt-0.5 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors shrink-0">
                                    <Icon className="w-4 h-4 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-white text-sm font-semibold leading-tight">{label}</p>
                                    <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-slate-600 text-xs relative z-10">© 2025 STEM Engine — AI-Powered Learning Platform</p>
            </div>

            {/* ── Right Panel: Form ── */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-14 relative">
                {/* Mobile logo */}
                <div className="absolute top-6 left-6 flex items-center space-x-2 lg:hidden">
                    <div className="bg-blue-500/20 p-1.5 rounded-lg">
                        <Atom className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-white font-bold text-base">STEM Engine</span>
                </div>

                <div className="w-full max-w-md">
                    {/* Tab switcher */}
                    <div className="flex bg-[#0f1829] border border-white/5 rounded-xl p-1 mb-8">
                        {(['login', 'signup'] as const).map(m => (
                            <button
                                key={m}
                                onClick={() => { setMode(m); setError(''); setSignupSuccess(false); }}
                                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${mode === m
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                {m === 'login' ? 'Sign In' : 'Create Account'}
                            </button>
                        ))}
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-1">
                        {mode === 'login' ? 'Welcome back' : 'Get started for free'}
                    </h2>
                    {signupSuccess && (
                        <div className="flex items-center space-x-2 text-emerald-400 text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 my-3">
                            <span>✓</span>
                            <span>Account created successfully! Please sign in to continue.</span>
                        </div>
                    )}
                    <p className="text-slate-500 text-sm mb-8">
                        {mode === 'login' ? 'Sign in to continue your learning journey.' : 'Create your account and start learning today.'}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'signup' && (
                            <div>
                                <label className="block text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Your full name"
                                    className="w-full bg-[#0b1121] border border-white/8 hover:border-blue-500/30 focus:border-blue-500/60 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full bg-[#0b1121] border border-white/8 hover:border-blue-500/30 focus:border-blue-500/60 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Min. 6 characters"
                                    className="w-full bg-[#0b1121] border border-white/8 hover:border-blue-500/30 focus:border-blue-500/60 rounded-xl px-4 py-3 pr-11 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center space-x-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                                <span>⚠</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 flex items-center justify-center space-x-2 mt-2"
                        >
                            {loading
                                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Please wait…</span></>
                                : <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                            }
                        </button>
                    </form>

                    <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px bg-white/5" />
                        <span className="text-slate-600 text-xs">or</span>
                        <div className="flex-1 h-px bg-white/5" />
                    </div>

                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full flex items-center justify-center space-x-3 border border-white/10 hover:border-blue-500/30 text-slate-300 hover:text-white py-3 rounded-xl text-sm font-medium transition-all hover:bg-blue-500/5 group disabled:opacity-50"
                    >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span>Sign in with Google</span>
                    </button>

                    <p className="text-center text-slate-600 text-xs mt-6">
                        By continuing, you agree to our{' '}
                        <span className="text-blue-400 cursor-pointer hover:underline">Terms</span>
                        {' & '}
                        <span className="text-blue-400 cursor-pointer hover:underline">Privacy Policy</span>
                    </p>
                </div>
            </div>
        </div>
    );
};
