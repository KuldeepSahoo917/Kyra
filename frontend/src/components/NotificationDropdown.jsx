import React, { useEffect, useRef, useState } from 'react';
import { Bell, Check, X } from 'lucide-react';
import useNotificationStore from '../store/notificationStore';
import Button from './ui/Button';

const NotificationDropdown = () => {
    const { notifications, unreadCount, fetchNotifications, markAsRead } = useNotificationStore();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchNotifications();

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-slate-950">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-xl border border-slate-800 bg-slate-900 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">
                                {unreadCount} New
                            </span>
                        )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto py-2 custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-slate-500 text-sm italic">
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    onClick={() => !notification.read && markAsRead(notification._id)}
                                    className={`px-4 py-3 hover:bg-slate-800/50 cursor-pointer transition-colors border-l-2 ${notification.read ? 'border-transparent' : 'border-indigo-500 bg-indigo-500/5'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <p className="text-xs font-semibold text-slate-200">{notification.message}</p>
                                        {!notification.read && <div className="h-2 w-2 rounded-full bg-indigo-500 mt-1" />}
                                    </div>
                                    <span className="text-[10px] text-slate-500 mt-1 block">
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="p-2 border-t border-slate-800 text-center">
                        <button className="text-[10px] font-bold text-slate-500 hover:text-indigo-400 uppercase tracking-widest py-1 w-full transition-colors">
                            View All Activity
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
