import React, { useState, useEffect } from 'react';
import {
    X, AlignLeft, MessageSquare, Paperclip,
    Calendar, Flag, User as UserIcon, Send, Trash2,
    Clock, CheckCircle2
} from 'lucide-react';
import useTaskStore from '../store/taskStore';
import useAuthStore from '../store/authStore';
import { getComments, addComment, deleteComment, uploadAttachment, deleteAttachment } from '../api/api';
import Button from './ui/Button';
import Modal from './ui/Modal';
import Input from './ui/Input';

const TaskDetailsModal = ({ isOpen, onClose, task }) => {
    const { updateTask, deleteTask } = useTaskStore();
    const { user } = useAuthStore();

    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [description, setDescription] = useState(task?.description || '');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (isOpen && task?._id) {
            fetchComments();
            setDescription(task.description || '');
        }
    }, [isOpen, task]);

    const fetchComments = async () => {
        try {
            const { data } = await getComments(task._id);
            setComments(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setCommentLoading(true);
        try {
            const { data } = await addComment({ text: newComment, taskId: task._id });
            setComments([...comments, data]);
            setNewComment('');
        } catch (err) {
            console.error(err);
        } finally {
            setCommentLoading(false);
        }
    };

    const handleUpdateDescription = async () => {
        await updateTask(task._id, { description });
        setIsEditingDescription(false);
    };

    const handleDeleteTask = async () => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            await deleteTask(task._id);
            onClose();
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const { data } = await uploadAttachment(task._id, file);
            await updateTask(task._id, data.task);
        } catch (err) {
            console.error(err);
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleRemoveAttachment = async (attachmentId) => {
        if (!window.confirm('Remove this attachment?')) return;
        try {
            const { data } = await deleteAttachment(task._id, attachmentId);
            await updateTask(task._id, data.task);
        } catch (err) {
            console.error(err);
        }
    };

    if (!task) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={task.title}
            className="max-w-2xl"
        >
            <div className="grid grid-cols-3 gap-8">
                {/* Left Column - Details */}
                <div className="col-span-2 space-y-8">
                    {/* Description */}
                    <div className="space-y-3">
                        <div className="flex items-center text-slate-100 font-semibold text-sm">
                            <AlignLeft size={18} className="mr-2" />
                            Description
                        </div>
                        {isEditingDescription ? (
                            <div className="space-y-3">
                                <textarea
                                    className="w-full min-h-[120px] rounded-lg bg-slate-950 border border-slate-700 p-3 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    autoFocus
                                />
                                <div className="flex space-x-2">
                                    <Button size="sm" onClick={handleUpdateDescription}>Save</Button>
                                    <Button size="sm" variant="ghost" onClick={() => setIsEditingDescription(false)}>Cancel</Button>
                                </div>
                            </div>
                        ) : (
                            <div
                                className="rounded-lg bg-slate-950/50 p-4 text-sm text-slate-300 cursor-pointer hover:bg-slate-950 transition-colors min-h-[60px]"
                                onClick={() => setIsEditingDescription(true)}
                            >
                                {task.description || 'Add a more detailed description...'}
                            </div>
                        )}
                    </div>

                    {/* Comments Section */}
                    <div className="space-y-4">
                        <div className="flex items-center text-slate-100 font-semibold text-sm">
                            <MessageSquare size={18} className="mr-2" />
                            Activity
                        </div>

                        <form onSubmit={handleAddComment} className="flex space-x-3">
                            <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white uppercase flex-shrink-0">
                                {user?.name?.charAt(0)}
                            </div>
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    placeholder="Write a comment..."
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none pr-10"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={commentLoading || !newComment.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-500 disabled:text-slate-600"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </form>

                        <div className="space-y-5 pt-2">
                            {comments.map((comment) => (
                                <div key={comment._id} className="flex space-x-3 text-sm">
                                    <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white uppercase flex-shrink-0">
                                        {comment.author?.name?.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-semibold text-slate-200">{comment.author?.name}</span>
                                            <span className="text-xs text-slate-500">
                                                {new Date(comment.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-slate-400 break-words">{comment.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Controls */}
                <div className="space-y-6">
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Status</h4>
                        <div className="flex items-center space-x-2 text-sm font-medium text-slate-300">
                            {task.status === 'done' ? (
                                <CheckCircle2 size={16} className="text-emerald-500" />
                            ) : task.status === 'inprogress' ? (
                                <Clock size={16} className="text-amber-500" />
                            ) : (
                                <div className="h-4 w-4 rounded-full border-2 border-slate-600" />
                            )}
                            <span className="capitalize">{task.status.replace('inprogress', 'In Progress')}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Priority</h4>
                        <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase border ${task.priority === 'high' || task.priority === 'critical'
                                ? 'border-red-500/20 text-red-500 bg-red-500/10'
                                : 'border-blue-500/20 text-blue-500 bg-blue-500/10'
                            }`}>
                            {task.priority || 'medium'}
                        </span>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Assignee</h4>
                        <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center">
                                <UserIcon size={14} className="text-slate-500" />
                            </div>
                            <span className="text-sm text-slate-400">{task.assignedTo?.name || 'Unassigned'}</span>
                        </div>
                    </div>

                    <hr className="border-slate-800" />

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="w-full">
                                <span className="inline-flex w-full">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="w-full !justify-start cursor-pointer"
                                        disabled={uploading}
                                    >
                                        <Paperclip size={16} className="mr-2" />
                                        {uploading ? 'Uploading...' : 'Add Attachment'}
                                    </Button>
                                </span>
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                                />
                            </label>
                            {task.attachments && task.attachments.length > 0 && (
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                    {task.attachments.map((att) => (
                                        <div
                                            key={att._id || att.publicId || att.url}
                                            className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs text-slate-200"
                                        >
                                            <a
                                                href={att.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="truncate hover:text-indigo-400"
                                            >
                                                {att.filename || att.url}
                                            </a>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveAttachment(att._id)}
                                                className="ml-2 text-slate-500 hover:text-red-400"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <Button variant="outline" size="sm" className="w-full !justify-start">
                            <Calendar size={16} className="mr-2" />
                            Due Date
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full !justify-start text-red-400 hover:bg-red-500/10 hover:text-red-300 !border-slate-800"
                            onClick={handleDeleteTask}
                        >
                            <Trash2 size={16} className="mr-2" />
                            Delete Task
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default TaskDetailsModal;
