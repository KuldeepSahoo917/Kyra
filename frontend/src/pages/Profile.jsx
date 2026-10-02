import React from 'react';
import { User, Mail, Shield, Calendar, Edit2, Camera } from 'lucide-react';
import useAuthStore from '../store/authStore';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Profile = () => {
    const { user } = useAuthStore();

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Profile</h1>
                <p className="text-slate-400 mt-2">Manage your account settings and preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="md:col-span-1 space-y-6">
                    <Card className="flex flex-col items-center text-center p-8 space-y-4">
                        <div className="relative group">
                            <div className="h-32 w-32 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center text-4xl font-bold text-indigo-400 overflow-hidden">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    user?.name?.charAt(0)
                                )}
                            </div>
                            <button className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full text-white hover:bg-indigo-500 transition-colors shadow-lg">
                                <Camera size={16} />
                            </button>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                            <p className="text-sm text-slate-500 capitalize">{user?.role}</p>
                        </div>
                        <div className="w-full pt-4">
                            <Button variant="outline" size="sm" className="w-full">
                                Edit Profile
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center space-x-3 text-slate-400">
                            <Calendar size={18} />
                            <span className="text-sm">Joined {new Date(user?.createdAt).toLocaleDateString()}</span>
                        </div>
                    </Card>
                </div>

                {/* Info & Settings */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="p-6 space-y-6">
                        <h3 className="text-lg font-bold text-white flex items-center">
                            <User size={20} className="mr-2 text-indigo-500" />
                            Personal Information
                        </h3>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Full Name</label>
                                <p className="text-slate-200 font-medium">{user?.name}</p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Email Address</label>
                                <div className="flex items-center space-x-2">
                                    <Mail size={16} className="text-slate-600" />
                                    <p className="text-slate-200 font-medium">{user?.email}</p>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Role</label>
                                <div className="flex items-center space-x-2">
                                    <Shield size={16} className="text-slate-600" />
                                    <p className="text-slate-200 font-medium capitalize">{user?.role}</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 space-y-6">
                        <h3 className="text-lg font-bold text-white flex items-center">
                            <Shield size={20} className="mr-2 text-indigo-500" />
                            Security
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                                <div>
                                    <p className="text-sm font-semibold text-slate-200">Change Password</p>
                                    <p className="text-xs text-slate-500">Update your account password regularly.</p>
                                </div>
                                <Button variant="ghost" size="sm">Update</Button>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                                <div>
                                    <p className="text-sm font-semibold text-red-400">Delete Account</p>
                                    <p className="text-xs text-slate-600">Permanently remove your account and data.</p>
                                </div>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-500/10 hover:text-red-400">Delete</Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Profile;
