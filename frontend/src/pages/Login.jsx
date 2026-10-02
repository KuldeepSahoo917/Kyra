import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useToastStore from '../store/toastStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error, clearError } = useAuthStore();
    const showToast = useToastStore((state) => state.showToast);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            showToast({ message: 'Successfully logged in. Welcome back!', type: 'success' });
            navigate('/');
        } catch (err) {
            // Error handled by store
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
            <div className="w-full max-w-md">
                <div className="mb-8 flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 shadow-xl shadow-indigo-500/20">
                        <Layout className="text-white" size={28} />
                    </div>
                    <h1 className="mt-6 text-3xl font-bold tracking-tight text-white">Welcome back</h1>
                    <p className="mt-2 text-slate-400">Log in to your account to continue</p>
                </div>

                <Card className="!p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500 transition-all border border-red-500/20">
                                {error}
                            </div>
                        )}

                        <Input
                            label="Email address"
                            type="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (error) clearError();
                            }}
                            required
                        />

                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (error) clearError();
                            }}
                            required
                        />

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-400">
                                    Remember me
                                </label>
                            </div>
                            <div className="text-sm">
                                <a href="#" className="font-medium text-indigo-400 hover:text-indigo-300">
                                    Forgot password?
                                </a>
                            </div>
                        </div>

                        <Button type="submit" variant="primary" className="w-full" loading={loading}>
                            Log in
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-sm text-slate-400 font-medium">
                        Not a member?{' '}
                        <Link to="/register" className="text-indigo-400 hover:text-indigo-300">
                            Create an account
                        </Link>
                    </p>
                </Card>
            </div>
        </div>
    );
};

export default Login;
