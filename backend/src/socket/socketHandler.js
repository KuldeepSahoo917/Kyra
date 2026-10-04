const setupSocket = (io) => {
    io.on('connection', (socket) => {
        console.log(`🔌 Socket connected: ${socket.id}`);

        // Join a project room to receive real-time updates for that project
        socket.on('join:project', (projectId) => {
            socket.join(`project_${projectId}`);
            console.log(`Socket ${socket.id} joined project room: project_${projectId}`);
        });

        // Leave a project room
        socket.on('leave:project', (projectId) => {
            socket.leave(`project_${projectId}`);
            console.log(`Socket ${socket.id} left project room: project_${projectId}`);
        });

        // Join a personal user room for notifications
        socket.on('join:user', (userId) => {
            socket.join(`user_${userId}`);
            console.log(`Socket ${socket.id} joined user room: user_${userId}`);
        });

        // Client-side drag-and-drop (optimistic update broadcast)
        socket.on('task:move', ({ taskId, status, order, projectId }) => {
            // Broadcast to everyone else in the project room
            socket.to(`project_${projectId}`).emit('task:moved', { taskId, status, order });
        });

        socket.on('disconnect', () => {
            console.log(`🔌 Socket disconnected: ${socket.id}`);
        });
    });
};

module.exports = setupSocket;
