import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';


const Input = ({ label, error, type = 'text', className = '', ...props }) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className={`flex flex-col space-y-1.5 ${className}`}>
            {label && (
                <label className="text-sm font-medium text-slate-300">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    type={inputType}
                    className={`flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm ring-offset-slate-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 ${isPassword ? 'pr-10' : ''} ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 focus:outline-none"
                    >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                )}
            </div>
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    );
};


export default Input;
