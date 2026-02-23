import * as React from 'react';
import { Mail, Lock, User, ArrowRight, Layout, ArrowLeft, KeyRound } from 'lucide-react';
import * as api from '../api';

interface AuthPageProps {
    onLoginSuccess: (token: string) => void;
}

type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

export function AuthPage({ onLoginSuccess }: AuthPageProps) {
    const [mode, setMode] = React.useState<AuthMode>('login');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [fullName, setFullName] = React.useState('');
    const [resetToken, setResetToken] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            if (mode === 'login') {
                const res = await api.auth.login({ username: email, password });
                onLoginSuccess(res.data.access_token);
            } else if (mode === 'register') {
                await api.auth.register({ email, password, full_name: fullName });
                setMessage({ type: 'success', text: 'Account created! You can now login.' });
                setMode('login');
            } else if (mode === 'forgot') {
                await api.auth.forgotPassword(email);
                setMessage({ type: 'success', text: 'If an account exists, a reset link has been generated (check backend console for demo).' });
                // For demo, we transition to reset mode
                setTimeout(() => setMode('reset'), 2000);
            } else if (mode === 'reset') {
                await api.auth.resetPassword({ token: resetToken, new_password: password });
                setMessage({ type: 'success', text: 'Password reset successful! You can now login.' });
                setMode('login');
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.detail || 'Authentication failed';
            setMessage({ type: 'error', text: typeof errorMsg === 'string' ? errorMsg : 'An error occurred' });
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = (newMode: AuthMode) => {
        setMode(newMode);
        setMessage(null);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />

            <div className="w-full max-w-md p-8 relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/20">
                        <Layout className="text-white" size={32} />
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight mb-2">TaskFlow</h1>
                    <p className="text-slate-400">The spatial productivity engine.</p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    {mode !== 'forgot' && mode !== 'reset' && (
                        <div className="flex bg-black/20 p-1 rounded-xl mb-8">
                            <button
                                onClick={() => toggleMode('login')}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'login' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => toggleMode('register')}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'register' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                Create Account
                            </button>
                        </div>
                    )}

                    {(mode === 'forgot' || mode === 'reset') && (
                        <button
                            onClick={() => toggleMode('login')}
                            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
                        >
                            <ArrowLeft size={16} /> Back to Login
                        </button>
                    )}

                    <h2 className="text-xl font-semibold text-white mb-6">
                        {mode === 'login' && 'Welcome Back'}
                        {mode === 'register' && 'Get Started'}
                        {mode === 'forgot' && 'Reset Password'}
                        {mode === 'reset' && 'Enter New Password'}
                    </h2>

                    {message && (
                        <div className={`p-3 rounded-lg text-sm mb-6 ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {mode === 'register' && (
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-400 ml-1">FULL NAME</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        required
                                        type="text"
                                        placeholder="John Doe"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>
                        )}

                        {mode !== 'reset' && (
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-400 ml-1">EMAIL ADDRESS</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        required
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>
                        )}

                        {mode === 'reset' && (
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-400 ml-1">RESET TOKEN</label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        required
                                        type="text"
                                        placeholder="Paste token from console"
                                        value={resetToken}
                                        onChange={(e) => setResetToken(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>
                        )}

                        {(mode === 'login' || mode === 'register' || mode === 'reset') && (
                            <div className="space-y-1">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-xs font-semibold text-slate-400">
                                        {mode === 'reset' ? 'NEW PASSWORD' : 'PASSWORD'}
                                    </label>
                                    {mode === 'login' && (
                                        <button
                                            type="button"
                                            onClick={() => setMode('forgot')}
                                            className="text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors"
                                        >
                                            Forgot?
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        required
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-3 pt-2">
                            <button
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 group transition-all"
                            >
                                {loading ? 'Processing...' : (
                                    mode === 'login' ? 'Sign In' :
                                        mode === 'register' ? 'Create Account' :
                                            mode === 'forgot' ? 'Send Reset Link' : 'Update Password'
                                )}
                                {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                            </button>

                            {mode === 'login' && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEmail('demo@taskflow.io');
                                        setPassword('demo123');
                                    }}
                                    className="w-full bg-white/5 hover:bg-white/10 text-white font-semibold py-3 rounded-xl border border-white/10 transition-all text-sm"
                                >
                                    ⚡ Try with Demo Account
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <p className="text-center mt-8 text-slate-500 text-sm">
                    By continuing, you agree to TaskFlow's
                    <span className="text-blue-500 hover:underline cursor-pointer ml-1">Terms of Service</span>.
                </p>
            </div>
        </div>
    );
}
