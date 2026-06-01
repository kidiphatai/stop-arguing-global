const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Global state
const rooms = {};
let matchmakingQueue = [];

// Helper to generate a 6-character room code
function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Helper to find a room by socket ID
function findRoomBySocketId(socketId) {
    for (const code in rooms) {
        const player = rooms[code].players.find(p => p.id === socketId);
        if (player) {
            return rooms[code];
        }
    }
    return null;
}

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Create a new room
    socket.on('create_room', (data) => {
        const { myName } = data;
        let code = generateRoomCode();
        while (rooms[code]) {
            code = generateRoomCode();
        }

        rooms[code] = {
            code: code,
            players: [{ id: socket.id, name: myName, symbol: 'x' }],
            currentGame: null
        };

        socket.join(code);
        socket.roomCode = code;
        socket.emit('room_created', { roomCode: code });
        console.log(`Room created: ${code} by ${myName}`);
    });

    // Join an existing room
    socket.on('join_room', (data) => {
        const { roomCode, myName } = data;
        const code = roomCode.trim().toUpperCase();
        const room = rooms[code];

        if (!room) {
            socket.emit('error_message', { message: 'ไม่พบห้องที่ระบุ กรุณาตรวจสอบรหัส' });
            return;
        }

        if (room.players.length >= 2) {
            socket.emit('error_message', { message: 'ห้องเต็มแล้ว ไม่สามารถเข้าร่วมได้' });
            return;
        }

        // Add player to room (Player 2 gets 'o' symbol)
        room.players.push({ id: socket.id, name: myName, symbol: 'o' });
        socket.join(code);
        socket.roomCode = code;

        socket.emit('room_joined', { roomCode: code });

        // Notify both players in the room that connection is successful
        const host = room.players[0];
        const guest = room.players[1];

        io.to(host.id).emit('connected_status', { partnerName: guest.name, isHost: true });
        io.to(guest.id).emit('connected_status', { partnerName: host.name, isHost: false });
        console.log(`User ${myName} joined room: ${code}`);
    });

    // Matchmaking queue
    socket.on('start_matchmaking', (data) => {
        const { myName } = data;
        
        // Prevent duplicate queue entry
        matchmakingQueue = matchmakingQueue.filter(p => p.id !== socket.id);

        matchmakingQueue.push({
            id: socket.id,
            name: myName,
            socket: socket
        });

        console.log(`User added to matchmaking queue: ${myName} (${socket.id}). Queue size: ${matchmakingQueue.length}`);

        // Try to match players
        if (matchmakingQueue.length >= 2) {
            const p1 = matchmakingQueue.shift();
            const p2 = matchmakingQueue.shift();

            let code = generateRoomCode();
            while (rooms[code]) {
                code = generateRoomCode();
            }

            rooms[code] = {
                code: code,
                players: [
                    { id: p1.id, name: p1.name, symbol: 'x' },
                    { id: p2.id, name: p2.name, symbol: 'o' }
                ],
                currentGame: null
            };

            p1.socket.join(code);
            p1.socket.roomCode = code;
            p2.socket.join(code);
            p2.socket.roomCode = code;

            // Notify both players that a match was found
            io.to(p1.id).emit('match_found', { roomCode: code, partnerName: p2.name, isHost: true });
            io.to(p2.id).emit('match_found', { roomCode: code, partnerName: p1.name, isHost: false });

            console.log(`Matchmaking success: Room ${code} created for ${p1.name} and ${p2.name}`);
        }
    });

    // Cancel matchmaking
    socket.on('cancel_matchmaking', () => {
        matchmakingQueue = matchmakingQueue.filter(p => p.id !== socket.id);
        console.log(`User left matchmaking queue: ${socket.id}`);
    });

    // Game Navigation Events
    socket.on('open_game', (data) => {
        const room = rooms[socket.roomCode];
        if (room) {
            room.currentGame = data.gameId;
            socket.to(socket.roomCode).emit('open_game_remote', { gameId: data.gameId });
        }
    });

    socket.on('back_to_hub', () => {
        const room = rooms[socket.roomCode];
        if (room) {
            room.currentGame = null;
            socket.to(socket.roomCode).emit('back_to_hub_remote');
        }
    });

    // Dynamic Game Events (routes actions to partner in real-time)
    socket.on('game_event', (data) => {
        if (socket.roomCode) {
            socket.to(socket.roomCode).emit('game_event_remote', data);
        }
    });

    // Interaction Overlays: Hug and Reactions
    socket.on('send_hug', () => {
        if (socket.roomCode) {
            socket.to(socket.roomCode).emit('hug_received');
            console.log(`Hug sent in room: ${socket.roomCode}`);
        }
    });

    socket.on('send_reaction', (data) => {
        if (socket.roomCode) {
            socket.to(socket.roomCode).emit('reaction_received', data);
        }
    });

    // Handle Disconnect
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        
        // Remove from queue if present
        matchmakingQueue = matchmakingQueue.filter(p => p.id !== socket.id);

        // Find room socket was in
        const room = findRoomBySocketId(socket.id);
        if (room) {
            const partner = room.players.find(p => p.id !== socket.id);
            if (partner) {
                io.to(partner.id).emit('partner_disconnected');
            }
            delete rooms[room.code];
            console.log(`Room ${room.code} deleted due to host/partner disconnect`);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Stop Arguing Server is running on port ${PORT}`);
});
