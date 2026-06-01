// ========================================
// app.js — Core Client: Socket.io, Lobbies, Matchmaking, Interactions
// ========================================

const socket = io();

// ===== Global State =====
let myName = '';
let partnerName = '';
let isHost = false;
let roomCode = '';
let currentGame = null;

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    animateOnScroll();
    loadSavedName();
    checkUrlParams();
});

// ===== Load Saved Username =====
function loadSavedName() {
    const savedName = localStorage.getItem('myName');
    const input = document.getElementById('myName');
    if (savedName && input) {
        input.value = savedName;
        myName = savedName;
    }
}

// ===== Check URL Parameter (Quick Join Link) =====
function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam && roomParam.length === 6) {
        roomCode = roomParam.toUpperCase();
        
        // Transition UI directly to join state
        hide('roomOptions');
        hide('nameInputArea');
        show('joinArea', 'flex');
        
        const codeInput = document.getElementById('roomCodeInput');
        if (codeInput) {
            codeInput.value = roomCode;
        }
        
        showConnBar('เข้าห้องผ่านลิงก์แชร์ รหัส: ' + roomCode);
    }
}

// ===== Canvas Particle System =====
function initParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * w;
            this.y = h + 10;
            this.size = Math.random() * 2.5 + 0.5;
            this.speedY = Math.random() * 0.8 + 0.2;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.hue = Math.random() * 60 + 300; // pink-purple range
        }
        update() {
            this.y -= this.speedY;
            this.x += this.speedX + Math.sin(this.y * 0.01) * 0.2;
            this.opacity -= 0.001;
            if (this.y < -10 || this.opacity <= 0) this.reset();
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 80%, 70%, ${this.opacity})`;
            ctx.fill();
            // glow
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 80%, 70%, ${this.opacity * 0.15})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < 60; i++) {
        const p = new Particle();
        p.y = Math.random() * h; // start spread out
        particles.push(p);
    }

    function animate() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }
    animate();
}

// ===== Scroll Animations =====
function animateOnScroll() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section-inner, .game-header').forEach(el => {
        el.classList.add('animate-in');
        observer.observe(el);
    });
}

// ===== Scroll =====
function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// ===== Confetti =====
function createConfetti(x, y) {
    const emojis = ['🎉', '💕', '✨', '🌟', '💖', '🎊', '💗', '⭐', '🔥', '💫'];
    for (let i = 0; i < 18; i++) {
        const particle = document.createElement('div');
        particle.className = 'confetti-particle';
        particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        const startX = x || window.innerWidth / 2;
        const startY = y || window.innerHeight / 3;
        particle.style.left = startX + 'px';
        particle.style.top = startY + 'px';
        particle.style.setProperty('--tx', (Math.random() - 0.5) * 300 + 'px');
        particle.style.setProperty('--ty', -(Math.random() * 400 + 100) + 'px');
        particle.style.setProperty('--r', (Math.random() - 0.5) * 720 + 'deg');
        particle.style.fontSize = (14 + Math.random() * 20) + 'px';
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 1800);
    }
}

// ===== Name Verification Helper =====
function checkAndSaveName() {
    const nameInput = document.getElementById('myName');
    myName = nameInput.value.trim();
    if (!myName) {
        shakeEl('myName');
        return false;
    }
    localStorage.setItem('myName', myName);
    return true;
}

// ===== Create Room =====
function createRoom() {
    if (!checkAndSaveName()) return;

    hide('roomOptions'); 
    hide('nameInputArea');
    show('roomCreated');
    
    showConnBar('กำลังขอห้องกับเซิร์ฟเวอร์...⏳');
    
    socket.emit('create_room', { myName });
}

// ===== Join Room Panel =====
function showJoinRoom() {
    if (!checkAndSaveName()) return;
    hide('roomOptions'); 
    hide('nameInputArea');
    show('joinArea', 'flex');
    document.getElementById('roomCodeInput').focus();
}

function showRoomOptions() {
    hide('joinArea');
    show('roomOptions', 'grid');
    show('nameInputArea');
}

function joinRoom() {
    const codeInput = document.getElementById('roomCodeInput');
    const code = codeInput.value.trim().toUpperCase();
    if (code.length !== 6) { 
        shakeEl('roomCodeInput'); 
        return; 
    }
    
    roomCode = code;
    showConnBar('กำลังเชื่อมต่อ...⏳');
    
    socket.emit('join_room', { roomCode: code, myName });
}

// ===== Matchmaking Mode =====
function startMatchmaking() {
    if (!checkAndSaveName()) return;
    
    hide('roomOptions');
    hide('nameInputArea');
    show('matchmakingArea', 'flex');
    
    showConnBar('เข้าคิวสุ่มหาคู่เล่น... ⏳');
    socket.emit('start_matchmaking', { myName });
}

function cancelMatchmaking() {
    socket.emit('cancel_matchmaking');
    hide('matchmakingArea');
    show('roomOptions', 'grid');
    show('nameInputArea');
    showConnBar('ยกเลิกการค้นหาเรียบร้อย', false);
}

// ===== Copy Room Code / URL Link =====
function copyRoomCode() {
    navigator.clipboard.writeText(roomCode).then(() => {
        setText('copyCodeText', '✅ คัดลอกแล้ว!');
        setTimeout(() => setText('copyCodeText', '📋 คัดลอกรหัส'), 2000);
    });
}

function copyRoomLink() {
    const shareLink = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;
    navigator.clipboard.writeText(shareLink).then(() => {
        setText('copyLinkText', '✅ ลิงก์แล้ว!');
        setTimeout(() => setText('copyLinkText', '🔗 ลิงก์ด่วน'), 2000);
    });
}

// ===== Interactions: Hug & Reactions =====
function sendHug() {
    socket.emit('send_hug');
    createConfetti();
}

function sendReaction(emoji) {
    socket.emit('send_reaction', { emoji });
    triggerFloatingEmoji(emoji);
}

function triggerFloatingEmoji(emoji) {
    const container = document.getElementById('reactionContainer');
    if (!container) return;

    const el = document.createElement('div');
    el.className = 'floating-emoji';
    el.textContent = emoji;
    
    // Random horizontal starting position and drift direction
    const randomStart = Math.random() * 40 - 20; // -20px to 20px
    const randomDrift = Math.random() * 120 - 60; // -60px to 60px
    
    el.style.left = `calc(50% + ${randomStart}px)`;
    el.style.setProperty('--drift', `${randomDrift}px`);
    
    container.appendChild(el);
    setTimeout(() => el.remove(), 3000);
}

function triggerHugOverlay() {
    const overlay = document.getElementById('hugOverlay');
    if (!overlay) return;
    
    overlay.style.display = 'flex';
    createConfetti();
    
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 2500);
}

// ===== Connected Transition =====
function showConnected() {
    hide('roomCreated'); 
    hide('joinArea');
    hide('matchmakingArea');
    show('connectedStatus');
    setText('connectedText', '💕 เชื่อมต่อสำเร็จ!');
    setText('partnerNameDisplay', `กำลังเล่นกับ: ${partnerName}`);
    createConfetti();
}

// ===== Start Game Hub =====
function startPlaying() {
    show('gameHub'); 
    hide('connectedStatus');
    show('actionBar', 'flex');
    scrollToSection('gameHub');
    socket.emit('game_event', { type: 'start_playing' });
    createConfetti();
    document.querySelectorAll('.game-card').forEach((card, i) => {
        card.style.animationDelay = (i * 0.08) + 's';
        card.classList.add('card-reveal');
    });
}

function startPlayingRemote() {
    show('gameHub'); 
    hide('connectedStatus'); 
    hide('roomCreated'); 
    hide('joinArea');
    hide('matchmakingArea');
    show('actionBar', 'flex');
    scrollToSection('gameHub');
    createConfetti();
    document.querySelectorAll('.game-card').forEach((card, i) => {
        card.style.animationDelay = (i * 0.08) + 's';
        card.classList.add('card-reveal');
    });
}

// ===== Game Navigation =====
function openGame(gameId) {
    currentGame = gameId;
    hide('gameHub');
    document.querySelectorAll('.game-section').forEach(s => s.style.display = 'none');
    const el = document.getElementById('game-' + gameId);
    if (el) {
        el.style.display = 'block';
        el.style.opacity = '1';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (typeof initGame === 'function') initGame(gameId);
    socket.emit('open_game', { gameId });
}

function openGameRemote(gameId) {
    currentGame = gameId;
    hide('gameHub');
    document.querySelectorAll('.game-section').forEach(s => s.style.display = 'none');
    const el = document.getElementById('game-' + gameId);
    if (el) { 
        el.style.display = 'block'; 
        el.style.opacity = '1'; 
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    }
    if (typeof initGame === 'function') initGame(gameId);
}

function showGameHub() {
    currentGame = null;
    document.querySelectorAll('.game-section').forEach(s => s.style.display = 'none');
    show('gameHub');
    scrollToSection('gameHub');
    socket.emit('back_to_hub');
}

function showGameHubRemote() {
    currentGame = null;
    document.querySelectorAll('.game-section').forEach(s => s.style.display = 'none');
    show('gameHub');
    scrollToSection('gameHub');
}

// ===== Helper Functions =====
function hide(id) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
function show(id, display) { const el = document.getElementById(id); if (el) el.style.display = display || 'block'; }
function setText(id, text) { const el = document.getElementById(id); if (el) el.textContent = text; }

function shakeEl(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.borderColor = '#ef4444';
    el.classList.add('shake');
    setTimeout(() => { el.style.borderColor = ''; el.classList.remove('shake'); }, 600);
}

function showConnBar(text, connected) {
    const bar = document.getElementById('connectionBar');
    const dot = document.getElementById('connectionDot');
    if (bar) bar.classList.add('visible');
    setText('connectionText', text);
    if (connected === true && dot) dot.className = 'conn-dot connected';
    else if (connected === false && dot) dot.className = 'conn-dot';
}

// ===== Socket Event Handlers =====

socket.on('room_created', (data) => {
    roomCode = data.roomCode;
    setText('roomCodeDisplay', roomCode);
    showConnBar('ห้องสร้างแล้ว! รอคู่เชื่อมต่อ รหัส: ' + roomCode, false);
    
    // Update URL query string without reloading page
    const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?room=' + roomCode;
    window.history.replaceState({ path: newurl }, '', newurl);
});

socket.on('room_joined', (data) => {
    roomCode = data.roomCode;
    showConnBar('เข้าร่วมห้องสำเร็จ! รอสถานะคู่อีกฝั่ง...', false);
});

socket.on('connected_status', (data) => {
    partnerName = data.partnerName;
    isHost = data.isHost;
    
    showConnBar(`🟢 เชื่อมต่อแล้วกับ: ${partnerName}`, true);
    show('actionBar', 'flex'); // Show Send Hug & Reactions
    showConnected();
});

socket.on('match_found', (data) => {
    roomCode = data.roomCode;
    partnerName = data.partnerName;
    isHost = data.isHost;
    
    showConnBar(`🟢 เชื่อมต่อสำเร็จ! คู่เล่นสุ่ม: ${partnerName}`, true);
    show('actionBar', 'flex');
    showConnected();
    
    // Update URL
    const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?room=' + roomCode;
    window.history.replaceState({ path: newurl }, '', newurl);
});

socket.on('error_message', (data) => {
    alert(data.message);
    showRoomOptions();
    showConnBar('เกิดข้อผิดพลาดในการเชื่อมต่อ', false);
});

socket.on('open_game_remote', (data) => {
    openGameRemote(data.gameId);
});

socket.on('back_to_hub_remote', () => {
    showGameHubRemote();
});

socket.on('game_event_remote', (data) => {
    // Forward dynamically to current game event dispatcher
    if (data.type === 'start_playing') {
        startPlayingRemote();
        return;
    }
    if (data.game && typeof gameHandlers !== 'undefined' && gameHandlers[data.game]) {
        gameHandlers[data.game](data);
    }
});

socket.on('hug_received', () => {
    triggerHugOverlay();
});

socket.on('reaction_received', (data) => {
    triggerFloatingEmoji(data.emoji);
});

socket.on('partner_disconnected', () => {
    showConnBar('🔴 แฟน/คู่เล่นหลุดการเชื่อมต่อ', false);
    hide('actionBar');
    alert('แฟนหรือคู่เล่นของคุณออกจากการเชื่อมต่อแล้ว ระบบจะรีเซ็ตกลับสู่หน้าหลัก');
    window.location.href = window.location.pathname; // Reload to main page cleanly
});
