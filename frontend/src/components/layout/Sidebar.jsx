import React from 'react';
import { NavLink } from 'react-router-dom';
import { Layout, Home, CheckSquare, Settings, Bell, Plus, Users, LayoutDashboard } from 'lucide-react';
import useProjectStore from '../../store/projectStore';

const Sidebar = () => {
    const { projects } = useProjectStore();

    const navItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/' },
        { icon: <Bell size={20} />, label: 'Notifications', path: '/notifications' },
        { icon: <Users size={20} />, label: 'Profile', path: '/profile' },
    ];

    return (
        <div className="flex h-screen w-64 flex-col border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl">
            <div className="flex items-center px-6 py-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 shadow-lg shadow-indigo-500/20">
                    <Layout className="text-white" size={24} />
                </div>
                <span className="ml-3 text-xl font-bold tracking-tight text-white">Zyra</span>
            </div>

            <nav className="flex-1 space-y-1 px-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                                ? 'bg-indigo-600/10 text-indigo-400'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                            }`
                        }
                    >
                        {item.icon}
                        <span className="ml-3">{item.label}</span>
                    </NavLink>
                ))}

                <div className="mt-8">
                    <div className="flex items-center justify-between px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Projects
                        <button className="text-slate-500 hover:text-indigo-400">
                            <Plus size={14} />
                        </button>
                    </div>
                    <div className="mt-4 space-y-1">
                        {projects.map((project) => (
                            <NavLink
                                key={project._id}
                                to={`/projects/${project._id}`}
                                className={({ isActive }) =>
                                    `flex items-center rounded-lg px-3 py-2 text-sm transition-colors ${isActive
                                        ? 'bg-indigo-600/10 text-indigo-400 font-medium'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                    }`
                                }
                            >
                                <div
                                    className="h-2 w-2 rounded-full mr-3"
                                    style={{ backgroundColor: project.color || '#6366f1' }}
                                />
                                <span className="truncate">{project.name}</span>
                            </NavLink>
                        ))}
                    </div>
                </div>
            </nav>

            <div className="border-t border-slate-800 p-4">
                <NavLink
                    to="/profile"
                    className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
                >
                    <Settings size={20} />
                    <span className="ml-3">Account Settings</span>
                </NavLink>
            </div>
        </div>
    );
};

export default Sidebar;
