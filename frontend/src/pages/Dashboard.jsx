import React, { useState, useEffect } from 'react';
import { Plus, Layout as ProjectIcon, MoreVertical, Search, ArrowRight, Clock, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useProjectStore from '../store/projectStore';
import useAuthStore from '../store/authStore';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';

const Dashboard = () => {
    const { projects, loading, fetchProjects, createProject } = useProjectStore();
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [projectKey, setProjectKey] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [createLoading, setCreateLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const handleCreateProject = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        try {
            await createProject({
                name: projectName,
                key: projectKey,
                description: projectDescription,
            });
            setIsModalOpen(false);
            setProjectName('');
            setProjectKey('');
            setProjectDescription('');
        } catch (err) {
            console.error(err);
        } finally {
            setCreateLoading(false);
        }
    };

    const colors = [
        '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'
    ];

    const filteredProjects = projects.filter((project) => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
            project.name?.toLowerCase().includes(q) ||
            project.key?.toLowerCase().includes(q) ||
            project.description?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Project Dashboard</h1>
                    <p className="mt-1 text-slate-400">Welcome back, {user?.name}. Here's what's happening with your projects.</p>
                </div>
                <div className="flex w-full flex-col items-stretch gap-3 md:w-auto md:flex-row md:items-center">
                    <div className="relative md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            className="w-full rounded-lg border border-slate-700 bg-slate-900 pl-9 pr-3 py-1.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => setIsModalOpen(true)} className="shadow-lg shadow-indigo-500/20">
                        <Plus size={18} className="mr-2" />
                        Create Project
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((project) => (
                    <Card
                        key={project._id}
                        className="group relative flex flex-col p-6 cursor-pointer hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all"
                        onClick={() => navigate(`/projects/${project._id}`)}
                    >
                        <div className="flex items-start justify-between">
                            <div
                                className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-lg"
                                style={{ backgroundColor: project.color || '#6366f1' }}
                            >
                                <ProjectIcon size={24} />
                            </div>
                            <button className="text-slate-500 hover:text-white">
                                <MoreVertical size={20} />
                            </button>
                        </div>

                        <div className="mt-4">
                            <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
                                {project.name}
                            </h3>
                            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                                Key: {project.key}
                            </p>
                            <p className="mt-3 text-sm text-slate-400 line-clamp-2 min-h-[40px]">
                                {project.description || 'No description provided for this project.'}
                            </p>
                        </div>

                        <div className="mt-6 flex items-center justify-between border-t border-slate-700/50 pt-4">
                            <div className="flex -space-x-2">
                                {project.members?.slice(0, 3).map((member, i) => (
                                    <div
                                        key={i}
                                        className="h-8 w-8 rounded-full border-2 border-slate-800 bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white uppercase"
                                    >
                                        {member.user?.avatar ? (
                                            <img src={member.user.avatar} alt="" className="h-full w-full rounded-full" />
                                        ) : (
                                            member.user?.name?.charAt(0) || 'U'
                                        )}
                                    </div>
                                ))}
                                {project.members?.length > 3 && (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-800 bg-slate-800 text-[10px] font-bold text-slate-400">
                                        +{project.members.length - 3}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center text-xs text-slate-500">
                                <Clock size={14} className="mr-1" />
                                <span>Updated recently</span>
                            </div>
                        </div>
                    </Card>
                ))}

                {filteredProjects.length === 0 && !loading && (
                    <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-800 p-12 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-slate-600">
                            <ProjectIcon size={32} />
                        </div>
                        <h3 className="mt-4 text-lg font-medium text-white">No projects found</h3>
                        <p className="mt-2 text-slate-400 max-w-xs">You haven't created any projects yet. Get started by creating your first project.</p>
                        <Button variant="outline" className="mt-6" onClick={() => setIsModalOpen(true)}>
                            <Plus size={18} className="mr-2" />
                            Create your first project
                        </Button>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Project"
            >
                <form onSubmit={handleCreateProject} className="space-y-4">
                    <Input
                        label="Project Name"
                        placeholder="e.g. Mobile App Redesign"
                        value={projectName}
                        onChange={(e) => {
                            setProjectName(e.target.value);
                            if (!projectKey || projectKey === projectName.slice(0, 4).toUpperCase()) {
                                setProjectKey(e.target.value.slice(0, 4).toUpperCase());
                            }
                        }}
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Project Key"
                            placeholder="e.g. MOBA"
                            value={projectKey}
                            onChange={(e) => setProjectKey(e.target.value.toUpperCase())}
                            required
                        />
                        <div className="flex flex-col space-y-1.5">
                            <label className="text-sm font-medium text-slate-300">Theme Color</label>
                            <div className="flex h-10 items-center space-x-2">
                                {colors.map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        className={`h-6 w-6 rounded-full border-2 ${projectKey === c ? 'border-white' : 'border-transparent'}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-1.5">
                        <label className="text-sm font-medium text-slate-300">Description</label>
                        <textarea
                            className="flex min-h-[100px] w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm ring-offset-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Describe the goals of this project..."
                            value={projectDescription}
                            onChange={(e) => setProjectDescription(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={createLoading}>
                            Create Project
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Dashboard;
