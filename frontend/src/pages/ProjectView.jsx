import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Plus, Search, Filter, Share2, Settings,
    CheckCircle2, Circle, Clock, AlertCircle,
    MoreVertical, MessageSquare, Paperclip, Calendar,
    User as UserIcon, X
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

import useProjectStore from '../store/projectStore';
import useTaskStore from '../store/taskStore';
import useAuthStore from '../store/authStore';
import { joinProject, leaveProject, emitTaskMove, getSocket } from '../services/socket';
import useToastStore from '../store/toastStore';

import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import TaskDetailsModal from '../components/TaskDetailsModal';

const columns = [
    { id: 'todo', title: 'To Do', icon: <Circle size={16} className="text-slate-400" /> },
    { id: 'inprogress', title: 'In Progress', icon: <Clock size={16} className="text-amber-500" /> },
    { id: 'done', title: 'Done', icon: <CheckCircle2 size={16} className="text-emerald-500" /> },
];

const ProjectView = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const showToast = useToastStore((state) => state.showToast);

    const { currentProject, getProjectById } = useProjectStore();
    const {
        tasks, fetchTasks, updateTask, createTask, deleteTask, selectedTask, setSelectedTask,
        socketTaskCreated, socketTaskUpdated, socketTaskDeleted, socketTaskMoved
    } = useTaskStore();
    const { user } = useAuthStore();

    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskStatus, setNewTaskStatus] = useState('todo');
    const [taskLoading, setTaskLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [assigneeFilter, setAssigneeFilter] = useState('all');
    const [dueFilter, setDueFilter] = useState('all'); // all | overdue | today | upcoming | noDue

    useEffect(() => {
        const init = async () => {
            await getProjectById(projectId);
            await fetchTasks(projectId);
            joinProject(projectId);
        };

        init();

        const socket = getSocket();
        socket.on('task:created', socketTaskCreated);
        socket.on('task:updated', socketTaskUpdated);
        socket.on('task:deleted', socketTaskDeleted);
        socket.on('task:moved', socketTaskMoved);

        return () => {
            leaveProject(projectId);
            socket.off('task:created');
            socket.off('task:updated');
            socket.off('task:deleted');
            socket.off('task:moved');
        };
    }, [projectId, getProjectById, fetchTasks, socketTaskCreated, socketTaskUpdated, socketTaskDeleted, socketTaskMoved]);

    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const taskId = draggableId;
        const newStatus = destination.droppableId;

        // Optimistic UI update via store
        socketTaskMoved({ taskId, status: newStatus, order: destination.index });

        // API update
        updateTask(taskId, { status: newStatus, order: destination.index });

        // Broadcast via socket
        emitTaskMove({ taskId, status: newStatus, order: destination.index, projectId });
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        setTaskLoading(true);
        try {
            await createTask({
                title: newTaskTitle,
                status: newTaskStatus,
                projectId
            });
            setIsTaskModalOpen(false);
            setNewTaskTitle('');
        } catch (err) {
            console.error(err);
        } finally {
            setTaskLoading(false);
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'critical': return 'bg-red-500/20 text-red-500 border-red-500/20';
            case 'high': return 'bg-amber-500/20 text-amber-500 border-amber-500/20';
            case 'medium': return 'bg-blue-500/20 text-blue-500 border-blue-500/20';
            default: return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/20';
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        showToast({ message: 'Project link copied to clipboard!', type: 'success' });
    };

    const filterBySearchAndFilters = (task) => {
        const q = searchTerm.trim().toLowerCase();
        if (q) {
            const inTitle = task.title?.toLowerCase().includes(q);
            const inDescription = task.description?.toLowerCase().includes(q);
            const inAssignee = task.assignedTo?.name?.toLowerCase().includes(q);
            if (!inTitle && !inDescription && !inAssignee) return false;
        }

        if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
            return false;
        }

        if (assigneeFilter !== 'all') {
            if (assigneeFilter === 'unassigned' && task.assignedTo) return false;
            if (
                assigneeFilter !== 'unassigned' &&
                (!task.assignedTo || task.assignedTo._id !== assigneeFilter)
            ) {
                return false;
            }
        }

        if (dueFilter !== 'all') {
            const due = task.dueDate ? new Date(task.dueDate) : null;
            const now = new Date();
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

            if (dueFilter === 'noDue') {
                if (due) return false;
            } else if (!due) {
                return false;
            } else if (dueFilter === 'overdue') {
                if (due >= startOfToday) return false;
            } else if (dueFilter === 'today') {
                if (due < startOfToday || due >= endOfToday) return false;
            } else if (dueFilter === 'upcoming') {
                if (due < endOfToday) return false;
            }
        }

        return true;
    };

    const assigneeOptions = [
        { value: 'all', label: 'All assignees' },
        { value: 'unassigned', label: 'Unassigned' },
        ...(currentProject?.members || []).map((m) => ({
            value: m.user?._id,
            label: m.user?.name || 'Member',
        })),
    ];

    return (
        <div className="h-full flex flex-col space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-white"
                        style={{ backgroundColor: currentProject?.color || '#6366f1' }}
                    >
                        {currentProject?.key?.slice(0, 2) || 'PR'}
                    </div>
                    <div>
                        <div className="flex items-center space-x-2">
                            <h1 className="text-2xl font-bold text-white">{currentProject?.name}</h1>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-500 uppercase tracking-wider">
                                {currentProject?.key}
                            </span>
                        </div>
                        <p className="text-sm text-slate-400">Manage tasks and track project progress</p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="flex -space-x-2 mr-4">
                        {currentProject?.members?.map((member, i) => (
                            <div
                                key={i}
                                className="h-8 w-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white uppercase overflow-hidden"
                                title={member.user?.name}
                            >
                                {member.user?.avatar ? (
                                    <img src={member.user.avatar} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    member.user?.name?.charAt(0)
                                )}
                            </div>
                        ))}
                        <button className="h-8 w-8 rounded-full border-2 border-slate-900 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 transition-colors flex items-center justify-center">
                            <Plus size={16} />
                        </button>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                        <Share2 size={16} className="mr-2" />
                        Share
                    </Button>
                    <Button variant="outline" size="sm" className="!p-2">
                        <Settings size={18} />
                    </Button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800/50 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center md:space-x-4">
                    <div className="relative md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search tasks by title, description, assignee..."
                            className="w-full bg-slate-950/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <div className="flex items-center space-x-2">
                            <span className="text-xs text-slate-500 font-medium">Priority</span>
                            <select
                                className="bg-slate-950/60 border border-slate-700/70 rounded-md px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                            >
                                <option value="all">All</option>
                                <option value="critical">Critical</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-xs text-slate-500 font-medium">Assignee</span>
                            <select
                                className="bg-slate-950/60 border border-slate-700/70 rounded-md px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-[160px]"
                                value={assigneeFilter}
                                onChange={(e) => setAssigneeFilter(e.target.value)}
                            >
                                {assigneeOptions.map((opt) => (
                                    <option key={opt.value || opt.label} value={opt.value || ''}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-xs text-slate-500 font-medium">Due</span>
                            <select
                                className="bg-slate-950/60 border border-slate-700/70 rounded-md px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                value={dueFilter}
                                onChange={(e) => setDueFilter(e.target.value)}
                            >
                                <option value="all">All</option>
                                <option value="overdue">Overdue</option>
                                <option value="today">Today</option>
                                <option value="upcoming">Upcoming</option>
                                <option value="noDue">No due date</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500 font-medium">Group by:</span>
                    <select className="bg-transparent text-xs text-slate-300 font-medium border-none focus:ring-0 cursor-pointer">
                        <option>Status</option>
                        <option disabled>Assignee (coming soon)</option>
                        <option disabled>Priority (coming soon)</option>
                    </select>
                </div>
            </div>

            {/* Kanban Board */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden min-h-0">
                    {columns.map((column) => (
                        <div key={column.id} className="flex flex-col h-full bg-slate-900/20 rounded-2xl border border-slate-800/30 p-4">
                            <div className="flex items-center justify-between mb-4 px-1">
                                <div className="flex items-center space-x-2">
                                    {column.icon}
                                    <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">{column.title}</h2>
                                    <span className="bg-slate-800 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        {tasks.filter((t) => t.status === column.id && filterBySearchAndFilters(t)).length}
                                    </span>
                                </div>
                                <button
                                    onClick={() => {
                                        setNewTaskStatus(column.id);
                                        setIsTaskModalOpen(true);
                                    }}
                                    className="text-slate-500 hover:text-indigo-400 transition-colors"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>

                            <Droppable droppableId={column.id}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`flex-1 overflow-y-auto space-y-4 min-h-[200px] pr-2 transition-colors rounded-xl ${snapshot.isDraggingOver ? 'bg-slate-800/20' : ''
                                            }`}
                                    >
                                        {tasks
                                            .filter((task) => task.status === column.id)
                                            .filter(filterBySearchAndFilters)
                                            .sort((a, b) => a.order - b.order)
                                            .map((task, index) => (
                                                <Draggable key={task._id} draggableId={task._id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            onClick={() => setSelectedTask(task)}
                                                            className={`group bg-slate-800 border-l-4 border-l-transparent hover:border-l-indigo-500 rounded-xl p-4 shadow-lg transition-all border border-slate-700/50 hover:bg-slate-750 ${snapshot.isDragging ? 'shadow-2xl scale-105 z-50 ring-2 ring-indigo-500/50 border-indigo-500' : ''
                                                                }`}
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                                                                    {task.priority || 'medium'}
                                                                </span>
                                                                <button className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-white">
                                                                    <MoreVertical size={16} />
                                                                </button>
                                                            </div>
                                                            <h4 className="mt-2.5 font-medium text-slate-100 group-hover:text-indigo-300 transition-colors leading-relaxed">
                                                                {task.title}
                                                            </h4>

                                                            <div className="mt-4 flex items-center justify-between">
                                                                <div className="flex items-center space-x-3 text-slate-500">
                                                                    <div className="flex items-center space-x-1" title="Comments">
                                                                        <MessageSquare size={14} />
                                                                        <span className="text-xs">0</span>
                                                                    </div>
                                                                    <div className="flex items-center space-x-1" title="Attachments">
                                                                        <Paperclip size={14} />
                                                                        <span className="text-xs">{task.attachments?.length || 0}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center">
                                                                    {task.assignedTo ? (
                                                                        <div className="h-6 w-6 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-[8px] font-bold text-white uppercase overflow-hidden">
                                                                            {task.assignedTo.avatar ? (
                                                                                <img src={task.assignedTo.avatar} alt="" className="h-full w-full object-cover" />
                                                                            ) : (
                                                                                task.assignedTo.name?.charAt(0)
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="h-6 w-6 rounded-full border border-dashed border-slate-600 flex items-center justify-center text-slate-600">
                                                                            <UserIcon size={12} />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                        {provided.placeholder}

                                        <button
                                            onClick={() => {
                                                setNewTaskStatus(column.id);
                                                setIsTaskModalOpen(true);
                                            }}
                                            className="w-full py-3 rounded-xl border border-dashed border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700 hover:bg-slate-900/30 transition-all flex items-center justify-center text-sm font-medium"
                                        >
                                            <Plus size={16} className="mr-2" />
                                            Add Task
                                        </button>
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>

            {/* Create Task Modal */}
            <Modal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                title="Create New Task"
            >
                <form onSubmit={handleCreateTask} className="space-y-4">
                    <Input
                        label="Task Title"
                        placeholder="What needs to be done?"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        required
                        autoFocus
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col space-y-1.5">
                            <label className="text-sm font-medium text-slate-300">Status</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm ring-offset-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={newTaskStatus}
                                onChange={(e) => setNewTaskStatus(e.target.value)}
                            >
                                {columns.map(col => <option key={col.id} value={col.id}>{col.title}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <label className="text-sm font-medium text-slate-300">Priority</label>
                            <select className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm ring-offset-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button variant="outline" type="button" onClick={() => setIsTaskModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={taskLoading}>
                            Create Task
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Task Details Modal */}
            <TaskDetailsModal
                isOpen={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                task={selectedTask}
            />
        </div>
    );
};

export default ProjectView;
