import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useToastStore from '../store/toastStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passError, setPassError] = useState('');

    const { register, loading, error, clearError } = useAuthStore();
    const showToast = useToastStore((state) => state.showToast);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setPassError('');

        if (password !== confirmPassword) {
            setPassError('Passwords do not match');
            return;
        }

        try {
            await register(name, email, password);
            showToast({ message: 'Account created successfully. Welcome!', type: 'success' });
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
                    <h1 className="mt-6 text-3xl font-bold tracking-tight text-white">Create an account</h1>
                    <p className="mt-2 text-slate-400">Join Zyra to start managing your projects</p>
                </div>

                <Card className="!p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {(error || passError) && (
                            <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500 transition-all border border-red-500/20">
                                {error || passError}
                            </div>
                        )}

                        <Input
                            label="Full Name"
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (error) clearError();
                            }}
                            required
                        />

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

                        <Input
                            label="Confirm Password"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                setPassError('');
                                if (error) clearError();
                            }}
                            required
                        />

                        <div className="pt-2">
                            <Button type="submit" variant="primary" className="w-full" loading={loading}>
                                Sign up
                            </Button>
                        </div>
                    </form>

                    <p className="mt-8 text-center text-sm text-slate-400 font-medium">
                        Already have an account?{' '}
                        <Link to="/login" className="text-indigo-400 hover:text-indigo-300">
                            Log in
                        </Link>
                    </p>
                </Card>
            </div>
        </div>
    );
};

export default Register;
