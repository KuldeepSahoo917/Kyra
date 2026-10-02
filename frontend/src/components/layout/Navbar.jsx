import React from 'react';
import { Search, Bell, HelpCircle, LogOut, User } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import Button from '../ui/Button';
import NotificationDropdown from '../NotificationDropdown';

const Navbar = () => {
    const { user, logout } = useAuthStore();

    return (
        <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/30 px-8 backdrop-blur-md">
            <div className="flex w-1/3 items-center">
                <div className="relative w-full max-w-md">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="text-slate-500" size={18} />
                    </span>
                    <input
                        className="block w-full rounded-full border border-slate-700 bg-slate-800/50 py-2 pl-10 pr-3 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Search tasks, projects..."
                        type="text"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <NotificationDropdown />
                <Button variant="ghost" size="sm" className="!p-2 text-slate-400">
                    <HelpCircle size={20} />
                </Button>

                <div className="h-8 w-px bg-slate-800" />

                <div className="flex items-center space-x-3 pl-2">
                    <div className="flex flex-col text-right">
                        <span className="text-sm font-medium text-slate-200">{user?.name}</span>
                        <span className="text-xs text-slate-500 capitalize">{user?.role}</span>
                    </div>
                    <div className="group relative">
                        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-indigo-400 transition-colors hover:bg-slate-700">
                            {user?.avatar ? (
                                <img src={user.avatar} alt="" className="h-full w-full rounded-full object-cover" />
                            ) : (
                                <User size={20} />
                            )}
                        </button>
                        <div className="absolute right-0 mt-2 w-48 origin-top-right scale-0 rounded-lg border border-slate-700 bg-slate-900 p-2 shadow-xl transition-all group-hover:scale-100">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full !justify-start text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                onClick={logout}
                            >
                                <LogOut size={16} className="mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
