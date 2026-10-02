import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import useProjectStore from '../../store/projectStore';

const MainLayout = () => {
    const fetchProjects = useProjectStore((state) => state.fetchProjects);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    return (
        <div className="flex h-screen overflow-hidden bg-slate-950">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-y-auto px-8 py-8 transition-all duration-300">
                    <div className="mx-auto max-w-7xl animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
