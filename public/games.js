// ============================================================
// games.js — All 8 Multiplayer Couple Games (Socket.io version)
// ============================================================

// Helper to route PeerJS sendData calls through Socket.io
function sendData(data) {
    socket.emit('game_event', data);
}

const gameHandlers = {};

// ============================================================
// GAME DISPATCHER
// ============================================================
function initGame(gameId) {
    switch (gameId) {
        case 'truthdare': initTruthOrDare(); break;
        case 'wouldyou': initWouldYouRather(); break;
        case 'tictactoe': initTicTacToe(); break;
        case 'memory': initMemoryMatch(); break;
        case 'quicktap': initQuickTap(); break;
        case 'dice': initDiceBattle(); break;
        case 'compatible': initCompatibility(); break;
        case 'highlow': initHigherLower(); break;
    }
}

// ============================================================
// 1. TRUTH OR DARE
// ============================================================
(function () {
    const truths = [
        'เคยแอบเช็คโทรศัพท์แฟนไหม?',
        'ชอบอะไรมากที่สุดในตัวแฟน?',
        'เคยโกหกแฟนเรื่องอะไรบ้าง?',
        'ถ้าแฟนอ้วนขึ้น 20 โล ยังรักอยู่ไหม?',
        'เคยฝันถึงแฟนเก่าไหม?',
        'ชอบให้แฟนแต่งตัวแบบไหน?',
        'อะไรที่แฟนทำแล้วน่ารักที่สุด?',
        'เคยร้องไห้เพราะแฟนไหม?',
        'ถ้าได้เปลี่ยนอะไรเกี่ยวกับแฟนได้ 1 อย่าง จะเปลี่ยนอะไร?',
        'เคยแอบชอบเพื่อนของแฟนไหม?',
        'อะไรที่ทำให้ตกหลุมรักแฟน?',
        'ชอบกอดหรือจูบมากกว่ากัน?',
        'เคยอิจฉาใครเพราะแฟนบ้าง?',
        'ถ้าต้องเลือกระหว่างแฟนกับเงิน 10 ล้าน?',
        'เคยคิดจะเลิกกับแฟนบ้างไหม?',
        'อะไรที่กลัวที่สุดเกี่ยวกับความสัมพันธ์?',
        'ชอบให้แฟนเรียกว่าอะไร?',
        'เรื่องที่ยังไม่เคยบอกแฟน?',
        'ถ้าแฟนไม่อยู่ 1 เดือน จะทำอะไร?',
        'First impression ต่อแฟนคืออะไร?',
        'เคยแอบกินของอร่อยคนเดียวไหม?',
        'ถ้าแฟนขอแต่งงานตอนนี้จะตอบว่ายังไง?',
        'เพลงที่คิดถึงแฟน?',
        'ถ้าย้อนเวลาได้จะเปลี่ยนอะไร?',
        'เคยพูดว่ารักทั้งที่ไม่ได้รู้สึกจริงๆ?',
        'อะไรที่แฟนทำแล้วใจละลาย?',
        'ชอบหรือไม่ชอบเวลาแฟนหึง?',
        'อยากให้แฟนทำอะไรบ่อยขึ้น?',
        'ถ้าต้องอยู่บนเกาะร้างกับแฟน เอาอะไรไป 3 อย่าง?',
        'เคยโกหกว่า "ไม่โกรธ" ทั้งที่โกรธไหม?',
        'วันที่มีความสุขที่สุดกับแฟน?',
        'อะไรที่หงุดหงิดแฟนมากที่สุด?',
        'ให้คะแนนการจีบของแฟน 1-10?',
        'เคยแอบดูรูปเก่าแฟนไหม?',
        'ถ้าแฟนเปลี่ยนทรงผมโดยไม่บอก จะว่ายังไง?',
        'ถ้าให้เขียนจดหมายลาแฟน จะเขียนว่าอะไร?',
        'เคยเปรียบเทียบแฟนกับคนอื่นไหม?',
        'ถ้าแฟนบอกว่าอยากเลิก จะทำยังไง?',
        'สิ่งที่คิดถึงมากที่สุดเกี่ยวกับแฟน?',
        'ถ้าได้ไปเที่ยวกับแฟนที่ไหนก็ได้ จะไปไหน?'
    ];

    const dares = [
        'โทรหาแฟนบอกรักดังๆ 3 ครั้ง!',
        'ทำหน้าตลกๆ ถ่ายรูปส่งให้แฟน!',
        'กอดแฟนแน่นๆ 30 วินาที!',
        'ร้องเพลงรักให้แฟนฟัง 1 ท่อน!',
        'บอก 5 สิ่งที่ชอบในตัวแฟน!',
        'ทำเสียงสัตว์ 3 ชนิดให้แฟนทาย!',
        'เต้นท่าตลกๆ ให้แฟนดู!',
        'ส่งข้อความหวานๆ ให้แฟนเลย!',
        'ทำหน้าเลียนแบบแฟน!',
        'จ้องตาแฟน 1 นาทีไม่หัวเราะ!',
        'วาดรูปแฟนใน 30 วินาที!',
        'บอกรักเป็นภาษาอื่น 3 ภาษา!',
        'ทำท่า K-Pop ให้แฟนดู!',
        'แต่งกลอนรักสดๆ!',
        'กอดแฟนจากข้างหลัง!',
        'เปลี่ยนรูปโปรไฟล์เป็นรูปแฟน 1 วัน!',
        'ป้อนข้าวแฟน 1 คำ!',
        'พูดว่า "เธอถูกเสมอ" 5 ครั้ง!',
        'ห้ามใช้มือถือ 10 นาที!',
        'ร้องเพลงให้แฟนฟังพร้อมทำท่าประกอบ!',
        'ส่ง selfie หน้าตลกให้แฟน!',
        'เล่าเรื่องน่าอายให้แฟนฟัง!',
        'จูบมือแฟน!',
        'ทำอาหารง่ายๆ ให้แฟนกิน!',
        'เขียนจดหมายรักสั้นๆ ให้แฟน!'
    ];

    let tdMode = 'random'; // 'truth', 'dare', 'random'
    let tdSpinning = false;
    let usedTruths = [];
    let usedDares = [];

    function initTruthOrDare() {
        tdMode = 'random';
        tdSpinning = false;
        usedTruths = [];
        usedDares = [];

        const truthBtn = document.getElementById('truthModeBtn');
        const dareBtn = document.getElementById('dareModeBtn');
        const randomBtn = document.getElementById('randomModeBtn');

        if (truthBtn) truthBtn.onclick = () => setTdMode('truth');
        if (dareBtn) dareBtn.onclick = () => setTdMode('dare');
        if (randomBtn) randomBtn.onclick = () => setTdMode('random');

        setTdMode('random');

        const card = document.getElementById('tdCard');
        if (card) {
            card.onclick = () => {
                if (!tdSpinning) drawCard();
            };
            card.style.cursor = 'pointer';
        }

        const typeEl = document.getElementById('tdType');
        const contentEl = document.getElementById('tdContent');
        if (typeEl) typeEl.textContent = '🎴';
        if (contentEl) contentEl.textContent = 'แตะการ์ดเพื่อเริ่มเล่น!';
    }

    function setTdMode(mode) {
        tdMode = mode;
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        const btnId = mode === 'truth' ? 'truthModeBtn' : mode === 'dare' ? 'dareModeBtn' : 'randomModeBtn';
        const btn = document.getElementById(btnId);
        if (btn) btn.classList.add('active');
    }

    function getRandomItem(arr, usedArr) {
        const available = arr.filter((_, i) => !usedArr.includes(i));
        if (available.length === 0) {
            usedArr.length = 0;
            return getRandomItem(arr, usedArr);
        }
        const idx = arr.indexOf(available[Math.floor(Math.random() * available.length)]);
        usedArr.push(idx);
        return arr[idx];
    }

    function drawCard() {
        if (tdSpinning) return;
        tdSpinning = true;

        let isTruth;
        if (tdMode === 'truth') isTruth = true;
        else if (tdMode === 'dare') isTruth = false;
        else isTruth = Math.random() > 0.5;

        const item = isTruth ? getRandomItem(truths, usedTruths) : getRandomItem(dares, usedDares);
        const type = isTruth ? 'truth' : 'dare';

        const typeEl = document.getElementById('tdType');
        const contentEl = document.getElementById('tdContent');
        const card = document.getElementById('tdCard');

        if (card) card.style.transform = 'scale(0.95)';

        const spinTexts = isTruth
            ? ['🤔', '💭', '🧐', '❓', '💡', '🤫']
            : ['😈', '🔥', '💪', '⚡', '🎯', '🎪'];

        let spinCount = 0;
        const spinMax = 12;
        const spinInterval = setInterval(() => {
            if (typeEl) typeEl.textContent = spinTexts[spinCount % spinTexts.length];
            if (contentEl) contentEl.textContent = '...';
            spinCount++;
            if (spinCount >= spinMax) {
                clearInterval(spinInterval);
                if (typeEl) typeEl.textContent = isTruth ? '💬 ความจริง' : '🎯 ท้าทาย';
                if (contentEl) contentEl.textContent = item;
                if (card) {
                    card.style.transform = 'scale(1.05)';
                    setTimeout(() => { card.style.transform = 'scale(1)'; }, 200);
                }
                tdSpinning = false;
                sendData({ game: 'truthdare', action: 'reveal', type, item });
            }
        }, 120);
    }

    function showTdResult(type, item) {
        const typeEl = document.getElementById('tdType');
        const contentEl = document.getElementById('tdContent');
        const card = document.getElementById('tdCard');
        const isTruth = type === 'truth';

        if (card) card.style.transform = 'scale(0.95)';

        const spinTexts = isTruth
            ? ['🤔', '💭', '🧐', '❓', '💡', '🤫']
            : ['😈', '🔥', '💪', '⚡', '🎯', '🎪'];

        tdSpinning = true;
        let spinCount = 0;
        const spinMax = 12;
        const spinInterval = setInterval(() => {
            if (typeEl) typeEl.textContent = spinTexts[spinCount % spinTexts.length];
            if (contentEl) contentEl.textContent = '...';
            spinCount++;
            if (spinCount >= spinMax) {
                clearInterval(spinInterval);
                if (typeEl) typeEl.textContent = isTruth ? '💬 ความจริง' : '🎯 ท้าทาย';
                if (contentEl) contentEl.textContent = item;
                if (card) {
                    card.style.transform = 'scale(1.05)';
                    setTimeout(() => { card.style.transform = 'scale(1)'; }, 200);
                }
                tdSpinning = false;
            }
        }, 120);
    }

    gameHandlers['truthdare'] = function (data) {
        if (data.action === 'reveal') {
            showTdResult(data.type, data.item);
        }
    };

    window.initTruthOrDare = initTruthOrDare;
    window.setTDMode = setTdMode;
    window.spinTruthDare = drawCard;
})();

// ============================================================
// 2. WOULD YOU RATHER
// ============================================================
(function () {
    const questions = [
        ['อยู่กับแฟนทั้งวันแต่ห้ามใช้มือถือ', 'ใช้มือถือได้ทั้งวันแต่ห้ามเจอแฟน'],
        ['ให้แฟนอ่านแชททุกอัน', 'ให้แฟนดูประวัติการค้นหาทุกอัน'],
        ['กินอาหารที่แฟนทำทุกวัน (แม้ไม่อร่อย)', 'ทำอาหารให้แฟนทุกวัน'],
        ['ให้แฟนเลือกเสื้อผ้าให้ทุกวัน', 'ให้แฟนเลือกทรงผมให้'],
        ['ไม่ทะเลาะกันเลยแต่เบื่อๆ', 'ทะเลาะบ้างแต่สนุกมาก'],
        ['รู้วันที่จะเลิกกัน', 'ไม่รู้เลยว่าจะเลิกกันวันไหน'],
        ['แฟนหล่อ/สวยมากแต่นิสัยแย่', 'แฟนหน้าตาธรรมดาแต่นิสัยดีมาก'],
        ['ได้ของขวัญแพงๆ จากแฟน', 'ได้จดหมายรักที่แฟนเขียนเอง'],
        ['เดทที่บ้านดูหนัง', 'ออกไปเดทข้างนอก'],
        ['ลืมวันครบรอบ', 'ลืมวันเกิดแฟน'],
        ['แฟนเล่นเกมเก่งมากแต่ไม่สนใจ', 'แฟนเล่นเกมไม่เป็นแต่อยากเล่นด้วย'],
        ['ย้ายไปอยู่ต่างประเทศกับแฟน', 'อยู่ที่เดิมแต่แฟนไปต่างประเทศ 1 ปี'],
        ['ให้แฟนรู้ทุกความคิด', 'แฟนไม่รู้ความคิดเราเลย'],
        ['เจอแฟนสัปดาห์ละครั้งแต่คุณภาพ', 'เจอแฟนทุกวันแต่ไม่มีเวลาส่วนตัว'],
        ['แฟนร้องเพลงให้ฟังทุกวัน (ร้องไม่เพราะ)', 'แฟนไม่เคยร้องเพลงให้ฟังเลย'],
        ['รู้ว่าแฟนเคยชอบใครมาก่อน', 'ไม่รู้อะไรเลยเกี่ยวกับอดีตแฟน'],
        ['ให้แฟนวางแผนเดทเซอร์ไพรส์', 'วางแผนเดทเซอร์ไพรส์ให้แฟนเอง'],
        ['แฟนเป็นคนตลกมากแต่ซีเรียสไม่เป็น', 'แฟนเป็นคนซีเรียสแต่ไม่ค่อยตลก'],
        ['แฟนขี้หึงมาก', 'แฟนไม่หึงเลยสักนิด'],
        ['แฟนบอกรักทุกวันแต่ไม่ค่อยทำอะไรให้', 'แฟนไม่ค่อยพูดแต่ทำให้ทุกอย่าง'],
        ['มีเวลาเที่ยวกับแฟน 1 สัปดาห์ต่อปี', 'เจอแฟนทุกวันแต่ไม่ได้ไปเที่ยวด้วยกัน'],
        ['ให้แฟนสอนทำอาหาร', 'ให้แฟนสอนเต้น']
    ];

    let wyState = {
        currentQ: 0,
        myChoice: null,
        partnerChoice: null,
        matches: 0,
        total: 0,
        usedQuestions: [],
        questionOrder: [],
        locked: false
    };

    function initWouldYouRather() {
        wyState = {
            currentQ: 0,
            myChoice: null,
            partnerChoice: null,
            matches: 0,
            total: 0,
            usedQuestions: [],
            questionOrder: [],
            locked: false
        };

        wyState.questionOrder = questions.map((_, i) => i).sort(() => Math.random() - 0.5);

        const opt1 = document.getElementById('wyOption1');
        const opt2 = document.getElementById('wyOption2');
        if (opt1) opt1.onclick = () => selectWyOption(1);
        if (opt2) opt2.onclick = () => selectWyOption(2);

        if (isHost) {
            sendData({ game: 'wouldyou', action: 'init', order: wyState.questionOrder });
        }

        showWyQuestion();
    }

    function showWyQuestion() {
        wyState.myChoice = null;
        wyState.partnerChoice = null;
        wyState.locked = false;

        const qIdx = wyState.questionOrder[wyState.currentQ] ?? wyState.currentQ % questions.length;
        const q = questions[qIdx];

        const t1 = document.getElementById('wyText1');
        const t2 = document.getElementById('wyText2');
        const opt1 = document.getElementById('wyOption1');
        const opt2 = document.getElementById('wyOption2');
        const v1 = document.getElementById('wyVotes1');
        const v2 = document.getElementById('wyVotes2');
        const result = document.getElementById('wyResult');
        const qNum = document.getElementById('wyQuestionNum');

        if (t1) t1.textContent = q[0];
        if (t2) t2.textContent = q[1];
        if (v1) v1.textContent = '';
        if (v2) v2.textContent = '';
        if (result) { result.textContent = ''; result.style.opacity = '0'; }
        if (qNum) qNum.textContent = `${wyState.currentQ + 1}/${Math.min(questions.length, wyState.questionOrder.length)}`;

        if (opt1) { opt1.classList.remove('selected', 'match', 'mismatch'); opt1.style.transform = ''; }
        if (opt2) { opt2.classList.remove('selected', 'match', 'mismatch'); opt2.style.transform = ''; }
    }

    function selectWyOption(choice) {
        if (wyState.locked || wyState.myChoice !== null) return;
        wyState.myChoice = choice;

        const opt1 = document.getElementById('wyOption1');
        const opt2 = document.getElementById('wyOption2');
        const chosen = choice === 1 ? opt1 : opt2;
        if (chosen) {
            chosen.classList.add('selected');
            chosen.style.transform = 'scale(1.03)';
        }

        sendData({ game: 'wouldyou', action: 'choose', choice });

        if (wyState.partnerChoice !== null) resolveWy();
    }

    function resolveWy() {
        wyState.locked = true;
        wyState.total++;

        const isMatch = wyState.myChoice === wyState.partnerChoice;
        if (isMatch) wyState.matches++;

        const opt1 = document.getElementById('wyOption1');
        const opt2 = document.getElementById('wyOption2');
        const v1 = document.getElementById('wyVotes1');
        const v2 = document.getElementById('wyVotes2');
        const result = document.getElementById('wyResult');
        const matchCount = document.getElementById('wyMatchCount');
        const totalCount = document.getElementById('wyTotalCount');

        const myIcon = '🫵';
        const partnerIcon = '💕';
        if (wyState.myChoice === 1) { if (v1) v1.textContent += myIcon; } else { if (v2) v2.textContent += myIcon; }
        if (wyState.partnerChoice === 1) { if (v1) v1.textContent += partnerIcon; } else { if (v2) v2.textContent += partnerIcon; }

        const cls = isMatch ? 'match' : 'mismatch';
        if (opt1) opt1.classList.add(wyState.myChoice === 1 || wyState.partnerChoice === 1 ? cls : '');
        if (opt2) opt2.classList.add(wyState.myChoice === 2 || wyState.partnerChoice === 2 ? cls : '');

        if (result) {
            result.textContent = isMatch ? '💖 คิดเหมือนกัน!' : '😂 คิดต่างกัน!';
            result.style.opacity = '1';
        }
        if (matchCount) matchCount.textContent = wyState.matches;
        if (totalCount) totalCount.textContent = wyState.total;

        if (isMatch) {
            createConfetti(window.innerWidth / 2, window.innerHeight / 2);
        }

        setTimeout(() => {
            wyState.currentQ++;
            if (wyState.currentQ < wyState.questionOrder.length && wyState.currentQ < questions.length) {
                showWyQuestion();
            } else {
                if (result) {
                    const pct = Math.round((wyState.matches / wyState.total) * 100);
                    result.textContent = `🏆 เข้ากัน ${pct}% (${wyState.matches}/${wyState.total})`;
                    result.style.opacity = '1';
                }
            }
        }, 2500);
    }

    gameHandlers['wouldyou'] = function (data) {
        if (data.action === 'init') {
            wyState.questionOrder = data.order;
            showWyQuestion();
        } else if (data.action === 'choose') {
            wyState.partnerChoice = data.choice;
            if (wyState.myChoice !== null) resolveWy();
        }
    };

    window.initWouldYouRather = initWouldYouRather;
    window.chooseWY = selectWyOption;
    window.nextWouldYou = function() { wyState.currentQ++; showWyQuestion(); };
})();

// ============================================================
// 3. TIC TAC TOE (No auto-reset)
// ============================================================
(function () {
    let tttState = {
        board: Array(9).fill(null),
        mySymbol: null,
        currentTurn: 'x',
        scores: { x: 0, o: 0 },
        gameOver: false,
        locked: false
    };

    const winCombos = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];

    function initTicTacToe() {
        tttState = {
            board: Array(9).fill(null),
            mySymbol: isHost ? 'x' : 'o',
            currentTurn: 'x',
            scores: { x: 0, o: 0 },
            gameOver: false,
            locked: false
        };

        const board = document.getElementById('tttBoard');
        if (board) {
            board.innerHTML = '';
            for (let i = 0; i < 9; i++) {
                const cell = document.createElement('div');
                cell.className = 'ttt-cell';
                cell.dataset.index = i;
                cell.onclick = () => tttCellClick(i);
                board.appendChild(cell);
            }
        }

        updateTttUI();

        const n1 = document.getElementById('tttName1');
        const n2 = document.getElementById('tttName2');
        if (n1) n1.textContent = isHost ? myName : partnerName;
        if (n2) n2.textContent = isHost ? partnerName : myName;
    }

    function tttCellClick(index) {
        if (tttState.gameOver || tttState.locked) return;
        if (tttState.currentTurn !== tttState.mySymbol) return;
        if (tttState.board[index] !== null) return;

        tttState.board[index] = tttState.mySymbol;
        sendData({ game: 'tictactoe', action: 'move', index, symbol: tttState.mySymbol });

        applyTttMove(index, tttState.mySymbol);
    }

    function applyTttMove(index, symbol) {
        tttState.board[index] = symbol;

        const cell = document.querySelector(`.ttt-cell[data-index="${index}"]`);
        if (cell) {
            cell.classList.add(symbol);
            cell.textContent = symbol === 'x' ? '❤️' : '⭐';
            cell.style.animation = 'none';
            cell.offsetHeight; // reflow
            cell.style.animation = 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        }

        const winner = checkTttWinner();
        if (winner) {
            tttState.gameOver = true;
            tttState.scores[winner]++;

            const combo = getWinCombo(winner);
            if (combo) {
                combo.forEach(i => {
                    const c = document.querySelector(`.ttt-cell[data-index="${i}"]`);
                    if (c) c.classList.add('win');
                });
            }

            const resultEl = document.getElementById('tttResult');
            const winnerName = (winner === 'x') ? (isHost ? myName : partnerName) : (isHost ? partnerName : myName);
            if (resultEl) resultEl.textContent = `🎉 ${winnerName} ชนะ!`;

            createConfetti(window.innerWidth / 2, window.innerHeight / 3);
            updateTttScores();
            return;
        }

        if (tttState.board.every(c => c !== null)) {
            tttState.gameOver = true;
            const resultEl = document.getElementById('tttResult');
            if (resultEl) resultEl.textContent = '🤝 เสมอ!';
            return;
        }

        tttState.currentTurn = tttState.currentTurn === 'x' ? 'o' : 'x';
        updateTttUI();
    }

    function checkTttWinner() {
        for (const combo of winCombos) {
            const [a, b, c] = combo;
            if (tttState.board[a] && tttState.board[a] === tttState.board[b] && tttState.board[a] === tttState.board[c]) {
                return tttState.board[a];
            }
        }
        return null;
    }

    function getWinCombo(winner) {
        for (const combo of winCombos) {
            const [a, b, c] = combo;
            if (tttState.board[a] === winner && tttState.board[b] === winner && tttState.board[c] === winner) {
                return combo;
            }
        }
        return null;
    }

    function resetTttBoard(isRemote) {
        tttState.board = Array(9).fill(null);
        tttState.gameOver = false;
        tttState.currentTurn = 'x';

        const cells = document.querySelectorAll('.ttt-cell');
        cells.forEach(cell => {
            cell.className = 'ttt-cell';
            cell.textContent = '';
            cell.style.animation = '';
        });

        const resultEl = document.getElementById('tttResult');
        if (resultEl) resultEl.textContent = '';

        updateTttUI();

        if (!isRemote) {
            sendData({ game: 'tictactoe', action: 'reset' });
        }
    }

    function updateTttUI() {
        const turnEl = document.getElementById('tttTurn');
        const isMyTurn = tttState.currentTurn === tttState.mySymbol;
        if (turnEl) {
            turnEl.textContent = isMyTurn ? 'ตาของคุณ!' : `ตาของ ${partnerName}`;
        }

        const p1 = document.getElementById('tttP1');
        const p2 = document.getElementById('tttP2');
        if (p1) p1.classList.toggle('active', tttState.currentTurn === 'x');
        if (p2) p2.classList.toggle('active', tttState.currentTurn === 'o');
    }

    function updateTttScores() {
        const s1 = document.getElementById('tttScore1');
        const s2 = document.getElementById('tttScore2');
        if (s1) s1.textContent = tttState.scores.x;
        if (s2) s2.textContent = tttState.scores.o;
    }

    gameHandlers['tictactoe'] = function (data) {
        if (data.action === 'move') {
            applyTttMove(data.index, data.symbol);
        } else if (data.action === 'reset') {
            resetTttBoard(true);
        }
    };

    window.initTicTacToe = initTicTacToe;
    window.tttMove = tttCellClick;
    window.resetTTT = () => resetTttBoard(false);
})();

// ============================================================
// 4. MEMORY MATCH
// ============================================================
(function () {
    const allEmojis = ['🌸', '🦋', '🌈', '🍰', '🎀', '💎', '🌙', '🍓', '🦄', '🌺', '🎶', '🍩'];

    let memState = {
        cards: [],
        flipped: [],
        matched: [],
        myTurn: false,
        scores: { me: 0, partner: 0 },
        locked: false
    };

    function initMemoryMatch() {
        const emojis = allEmojis.slice(0, 8);
        let deck = [...emojis, ...emojis];

        if (isHost) {
            deck = shuffleArray(deck);
            sendData({ game: 'memory', action: 'init', deck });
        }

        memState = {
            cards: deck,
            flipped: [],
            matched: [],
            myTurn: isHost,
            scores: { me: 0, partner: 0 },
            locked: false
        };

        renderMemBoard(deck);
        updateMemUI();

        const n1 = document.getElementById('memName1');
        const n2 = document.getElementById('memName2');
        if (n1) n1.textContent = myName;
        if (n2) n2.textContent = partnerName;
    }

    function shuffleArray(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function renderMemBoard(deck) {
        const board = document.getElementById('memBoard');
        if (!board) return;
        board.innerHTML = '';

        deck.forEach((emoji, i) => {
            const card = document.createElement('div');
            card.className = 'mem-card';
            card.dataset.index = i;
            card.innerHTML = `
                <div class="mem-card-inner">
                     <div class="mem-card-front">❓</div>
                     <div class="mem-card-back">${emoji}</div>
                </div>
            `;
            card.onclick = () => flipMemCard(i);
            board.appendChild(card);
        });
    }

    function flipMemCard(index) {
        if (memState.locked || !memState.myTurn) return;
        if (memState.flipped.includes(index) || memState.matched.includes(index)) return;
        if (memState.flipped.length >= 2) return;

        memState.flipped.push(index);
        showMemCard(index);

        sendData({ game: 'memory', action: 'flip', index });

        if (memState.flipped.length === 2) {
            memState.locked = true;
            setTimeout(() => checkMemMatch(true), 900);
        }
    }

    function showMemCard(index) {
        const card = document.querySelector(`.mem-card[data-index="${index}"]`);
        if (card) card.classList.add('flipped');
    }

    function hideMemCard(index) {
        const card = document.querySelector(`.mem-card[data-index="${index}"]`);
        if (card) card.classList.remove('flipped');
    }

    function checkMemMatch(isMine) {
        const [a, b] = memState.flipped;
        const isMatch = memState.cards[a] === memState.cards[b];

        if (isMatch) {
            memState.matched.push(a, b);
            if (isMine) memState.scores.me++;
            else memState.scores.partner++;

            const cardA = document.querySelector(`.mem-card[data-index="${a}"]`);
            const cardB = document.querySelector(`.mem-card[data-index="${b}"]`);
            if (cardA) cardA.classList.add('matched');
            if (cardB) cardB.classList.add('matched');
        } else {
            setTimeout(() => {
                hideMemCard(a);
                hideMemCard(b);
            }, 500);
            memState.myTurn = !memState.myTurn;
        }

        memState.flipped = [];
        memState.locked = false;
        updateMemUI();

        if (memState.matched.length === memState.cards.length) {
            const turnEl = document.getElementById('memTurn');
            if (memState.scores.me > memState.scores.partner) {
                if (turnEl) turnEl.textContent = `🎉 ${myName} ชนะ!`;
                createConfetti(window.innerWidth / 2, window.innerHeight / 3);
            } else if (memState.scores.partner > memState.scores.me) {
                if (turnEl) turnEl.textContent = `🎉 ${partnerName} ชนะ!`;
            } else {
                if (turnEl) turnEl.textContent = '🤝 เสมอ!';
            }
        }
    }

    function updateMemUI() {
        const turnEl = document.getElementById('memTurn');
        if (turnEl && memState.matched.length < memState.cards.length) {
            turnEl.textContent = memState.myTurn ? 'ตาของคุณ!' : `ตาของ ${partnerName}`;
        }
        const s1 = document.getElementById('memScore1');
        const s2 = document.getElementById('memScore2');
        if (s1) s1.textContent = memState.scores.me;
        if (s2) s2.textContent = memState.scores.partner;
    }

    gameHandlers['memory'] = function (data) {
        if (data.action === 'init') {
            memState.cards = data.deck;
            memState.myTurn = !isHost;
            renderMemBoard(data.deck);
            updateMemUI();
        } else if (data.action === 'flip') {
            memState.flipped.push(data.index);
            showMemCard(data.index);
            if (memState.flipped.length === 2) {
                memState.locked = true;
                setTimeout(() => checkMemMatch(false), 900);
            }
        }
    };

    window.initMemoryMatch = initMemoryMatch;
    window.resetMemory = initMemoryMatch;
})();

// ============================================================
// 5. QUICK TAP
// ============================================================
(function () {
    let qtState = {
        phase: 'idle', // idle, waiting, go, done
        myTime: null,
        partnerTime: null,
        goTime: null,
        wins: { me: 0, partner: 0 },
        timer: null,
        penalized: false
    };

    function initQuickTap() {
        qtState = {
            phase: 'idle',
            myTime: null,
            partnerTime: null,
            goTime: null,
            wins: { me: 0, partner: 0 },
            timer: null,
            penalized: false
        };

        const btn = document.getElementById('qtBtn');
        const btnText = document.getElementById('qtBtnText');
        const display = document.getElementById('qtDisplay');
        const result = document.getElementById('qtResult');

        if (btn) {
            btn.className = 'qt-btn';
            btn.onclick = handleQtTap;
        }
        if (btnText) btnText.textContent = 'แตะเพื่อเริ่ม!';
        if (display) display.textContent = '⚡ เกมกดเร็ว ⚡';
        if (result) result.textContent = '';

        const n1 = document.getElementById('qtName1');
        const n2 = document.getElementById('qtName2');
        if (n1) n1.textContent = myName;
        if (n2) n2.textContent = partnerName;
        updateQtScores();
    }

    function handleQtTap() {
        if (qtState.phase === 'idle') {
            startQtRound();
        } else if (qtState.phase === 'waiting') {
            qtState.penalized = true;
            qtState.myTime = 9999;
            const display = document.getElementById('qtDisplay');
            const btn = document.getElementById('qtBtn');
            const btnText = document.getElementById('qtBtnText');
            if (display) display.textContent = '⛔ เร็วไป! โดนปรับ!';
            if (btn) btn.classList.remove('waiting');
            if (btnText) btnText.textContent = '❌ เร็วไป!';

            sendData({ game: 'quicktap', action: 'tap', time: 9999, penalized: true });

            if (qtState.partnerTime !== null) resolveQt();
        } else if (qtState.phase === 'go') {
            const elapsed = Date.now() - qtState.goTime;
            qtState.myTime = elapsed;

            const display = document.getElementById('qtDisplay');
            const btn = document.getElementById('qtBtn');
            const btnText = document.getElementById('qtBtnText');
            if (display) display.textContent = `⏱️ ${elapsed} ms`;
            if (btn) btn.classList.remove('ready');
            if (btnText) btnText.textContent = `${elapsed} ms! รอผลอยู่...`;

            sendData({ game: 'quicktap', action: 'tap', time: elapsed, penalized: false });

            qtState.phase = 'done';
            if (qtState.partnerTime !== null) resolveQt();
        }
    }

    function startQtRound() {
        qtState.phase = 'waiting';
        qtState.myTime = null;
        qtState.partnerTime = null;
        qtState.penalized = false;

        const display = document.getElementById('qtDisplay');
        const btn = document.getElementById('qtBtn');
        const btnText = document.getElementById('qtBtnText');
        const result = document.getElementById('qtResult');

        if (display) display.textContent = '🔴 รอ... อย่าเพิ่งแตะ!';
        if (btn) { btn.classList.add('waiting'); btn.classList.remove('ready'); }
        if (btnText) btnText.textContent = '⏳ รอ...';
        if (result) result.textContent = '';

        const delay = 1500 + Math.random() * 3500;

        if (isHost) {
            sendData({ game: 'quicktap', action: 'start', delay });
        }

        qtState.timer = setTimeout(() => {
            qtState.phase = 'go';
            qtState.goTime = Date.now();
            if (display) display.textContent = '🟢 แตะเดี๋ยวนี้!';
            if (btn) { btn.classList.remove('waiting'); btn.classList.add('ready'); }
            if (btnText) btnText.textContent = '💥 แตะ!';
        }, delay);
    }

    function resolveQt() {
        qtState.phase = 'idle';
        if (qtState.timer) clearTimeout(qtState.timer);

        const result = document.getElementById('qtResult');
        const btn = document.getElementById('qtBtn');
        const btnText = document.getElementById('qtBtnText');

        if (qtState.myTime < qtState.partnerTime) {
            qtState.wins.me++;
            if (result) result.textContent = qtState.penalized ? `❌ ${partnerName} ก็โดนปรับด้วย! คุณเร็วกว่า!` : `🎉 คุณชนะ! (${qtState.myTime}ms vs ${qtState.partnerTime}ms)`;
            createConfetti(window.innerWidth / 2, window.innerHeight / 2);
        } else if (qtState.partnerTime < qtState.myTime) {
            qtState.wins.partner++;
            if (result) result.textContent = qtState.penalized ? `⛔ คุณกดเร็วไป! ${partnerName} ชนะ!` : `😅 ${partnerName} เร็วกว่า! (${qtState.partnerTime}ms vs ${qtState.myTime}ms)`;
        } else {
            if (result) result.textContent = '🤯 เสมอ! เร็วเท่ากันเป๊ะ!';
        }

        if (btn) btn.className = 'qt-btn';
        if (btnText) btnText.textContent = 'แตะเพื่อเล่นอีก!';
        updateQtScores();
    }

    function updateQtScores() {
        const w1 = document.getElementById('qtWins1');
        const w2 = document.getElementById('qtWins2');
        if (w1) w1.textContent = qtState.wins.me;
        if (w2) w2.textContent = qtState.wins.partner;
    }

    gameHandlers['quicktap'] = function (data) {
        if (data.action === 'start') {
            qtState.phase = 'waiting';
            qtState.myTime = null;
            qtState.partnerTime = null;
            qtState.penalized = false;

            const display = document.getElementById('qtDisplay');
            const btn = document.getElementById('qtBtn');
            const btnText = document.getElementById('qtBtnText');
            const result = document.getElementById('qtResult');

            if (display) display.textContent = '🔴 รอ... อย่าเพิ่งแตะ!';
            if (btn) { btn.classList.add('waiting'); btn.classList.remove('ready'); }
            if (btnText) btnText.textContent = '⏳ รอ...';
            if (result) result.textContent = '';

            qtState.timer = setTimeout(() => {
                qtState.phase = 'go';
                qtState.goTime = Date.now();
                if (display) display.textContent = '🟢 แตะเดี๋ยวนี้!';
                if (btn) { btn.classList.remove('waiting'); btn.classList.add('ready'); }
                if (btnText) btnText.textContent = '💥 แตะ!';
            }, data.delay);
        } else if (data.action === 'tap') {
            qtState.partnerTime = data.time;
            if (qtState.myTime !== null) resolveQt();
        }
    };

    window.initQuickTap = initQuickTap;
    window.qtTap = handleQtTap;
})();

// ============================================================
// 6. DICE BATTLE
// ============================================================
(function () {
    const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

    let diceState = {
        myRoll: null,
        partnerRoll: null,
        scores: { me: 0, partner: 0 },
        rolling: false
    };

    function initDiceBattle() {
        diceState = {
            myRoll: null,
            partnerRoll: null,
            scores: { me: 0, partner: 0 },
            rolling: false
        };

        const rollBtn = document.getElementById('rollDiceBtn');
        if (rollBtn) rollBtn.onclick = rollDice;

        const n1 = document.getElementById('diceName1');
        const n2 = document.getElementById('diceName2');
        if (n1) n1.textContent = myName;
        if (n2) n2.textContent = partnerName;

        const v1 = document.getElementById('diceValue1');
        const v2 = document.getElementById('diceValue2');
        if (v1) v1.textContent = '🎲';
        if (v2) v2.textContent = '🎲';

        const result = document.getElementById('diceResult');
        if (result) result.textContent = 'กดทอยเลย!';

        updateDiceScores();
    }

    function rollDice() {
        if (diceState.rolling) return;
        diceState.rolling = true;
        diceState.myRoll = null;
        diceState.partnerRoll = null;

        const value = Math.floor(Math.random() * 6) + 1;
        diceState.myRoll = value;

        const v1 = document.getElementById('diceValue1');
        const rollBtn = document.getElementById('rollDiceBtn');
        const result = document.getElementById('diceResult');

        if (rollBtn) rollBtn.disabled = true;
        if (result) result.textContent = '🎲 กำลังทอย...';

        let rollCount = 0;
        const maxRolls = 15;
        function animateRoll() {
            if (rollCount >= maxRolls) {
                if (v1) v1.textContent = diceFaces[value - 1];
                sendData({ game: 'dice', action: 'roll', value });
                if (diceState.partnerRoll !== null) resolveDice();
                else if (result) result.textContent = `🎲 คุณได้ ${value}! รอ ${partnerName}...`;
                return;
            }
            const randomFace = diceFaces[Math.floor(Math.random() * 6)];
            if (v1) {
                v1.textContent = randomFace;
                v1.style.transform = `rotate(${Math.random() * 30 - 15}deg) scale(${1 + Math.random() * 0.2})`;
            }
            rollCount++;
            const delay = 50 + (rollCount / maxRolls) * 200;
            setTimeout(animateRoll, delay);
        }

        animateRoll();
    }

    function showPartnerRoll(value) {
        const v2 = document.getElementById('diceValue2');

        let rollCount = 0;
        const maxRolls = 15;
        function animatePartnerRoll() {
            if (rollCount >= maxRolls) {
                if (v2) {
                    v2.textContent = diceFaces[value - 1];
                    v2.style.transform = 'rotate(0deg) scale(1)';
                }
                return;
            }
            const randomFace = diceFaces[Math.floor(Math.random() * 6)];
            if (v2) {
                v2.textContent = randomFace;
                v2.style.transform = `rotate(${Math.random() * 30 - 15}deg) scale(${1 + Math.random() * 0.2})`;
            }
            rollCount++;
            const delay = 50 + (rollCount / maxRolls) * 200;
            setTimeout(animatePartnerRoll, delay);
        }

        animatePartnerRoll();
    }

    function resolveDice() {
        const result = document.getElementById('diceResult');
        const rollBtn = document.getElementById('rollDiceBtn');
        const v1 = document.getElementById('diceValue1');
        const v2 = document.getElementById('diceValue2');

        setTimeout(() => {
            if (v1) v1.style.transform = 'rotate(0deg) scale(1)';
            if (v2) v2.style.transform = 'rotate(0deg) scale(1)';

            if (diceState.myRoll > diceState.partnerRoll) {
                diceState.scores.me++;
                if (result) result.textContent = `🎉 คุณชนะ! ${diceState.myRoll} vs ${diceState.partnerRoll}`;
                createConfetti(window.innerWidth / 2, window.innerHeight / 2);
            } else if (diceState.partnerRoll > diceState.myRoll) {
                diceState.scores.partner++;
                if (result) result.textContent = `😅 ${partnerName} ชนะ! ${diceState.partnerRoll} vs ${diceState.myRoll}`;
            } else {
                if (result) result.textContent = `🤝 เสมอ! ได้ ${diceState.myRoll} เหมือนกัน!`;
            }

            updateDiceScores();
            diceState.rolling = false;
            if (rollBtn) rollBtn.disabled = false;
        }, 500);
    }

    function updateDiceScores() {
        const s1 = document.getElementById('diceScore1');
        const s2 = document.getElementById('diceScore2');
        if (s1) s1.textContent = diceState.scores.me;
        if (s2) s2.textContent = diceState.scores.partner;
    }

    gameHandlers['dice'] = function (data) {
        if (data.action === 'roll') {
            diceState.partnerRoll = data.value;
            showPartnerRoll(data.value);
            if (diceState.myRoll !== null) resolveDice();
        }
    };

    window.initDiceBattle = initDiceBattle;
    window.rollDice = rollDice;
})();

// ============================================================
// 7. COMPATIBILITY QUIZ
// ============================================================
(function () {
    const cqQuestions = [
        { q: 'วันหยุดในฝัน?', options: ['🏖️ ทะเล', '🏔️ ภูเขา', '🏙️ เมืองใหญ่', '🏡 อยู่บ้าน'] },
        { q: 'อาหารมื้อพิเศษ?', options: ['🍣 อาหารญี่ปุ่น', '🍕 อาหารอิตาเลียน', '🍜 อาหารไทย', '🥘 บุฟเฟ่ต์'] },
        { q: 'กิจกรรมคู่รักยามว่าง?', options: ['🎬 ดูหนัง', '🎮 เล่นเกม', '🍳 ทำอาหาร', '🚶 เดินเล่น'] },
        { q: 'สัตว์เลี้ยงที่อยากมี?', options: ['🐶 หมา', '🐱 แมว', '🐰 กระต่าย', '🐠 ปลา'] },
        { q: 'เพลงที่ชอบฟัง?', options: ['🎵 ป๊อป', '🎸 ร็อค', '🎤 R&B', '🎹 เพลงบรรเลง'] },
        { q: 'ซีรีส์ที่ชอบ?', options: ['💕 โรแมนติก', '😱 สยองขวัญ', '😂 ตลก', '🔍 สืบสวน'] },
        { q: 'ของขวัญที่อยากได้?', options: ['💐 ดอกไม้', '🧸 ตุ๊กตา', '💍 เครื่องประดับ', '📱 แกดเจ็ต'] },
        { q: 'สถานที่เดทในฝัน?', options: ['🌅 ชายหาด', '🎡 สวนสนุก', '🍽️ ร้านอาหาร', '⛺ แคมป์ปิ้ง'] },
        { q: 'สิ่งสำคัญที่สุดในความสัมพันธ์?', options: ['💬 การสื่อสาร', '🤝 ความไว้ใจ', '😍 ความโรแมนติก', '🎉 ความสนุก'] },
        { q: 'อนาคตที่อยากมีด้วยกัน?', options: ['🏠 บ้านอบอุ่น', '✈️ เดินทางทั่วโลก', '🐕 มีสัตว์เลี้ยง', '💼 สร้างธุรกิจ'] }
    ];

    let cqState = {
        currentQ: 0,
        myAnswers: [],
        partnerAnswers: [],
        myChoice: null,
        partnerChoice: null,
        waiting: false
    };

    function initCompatibility() {
        cqState = {
            currentQ: 0,
            myAnswers: [],
            partnerAnswers: [],
            myChoice: null,
            partnerChoice: null,
            waiting: false
        };
        showCqQuestion();
    }

    function showCqQuestion() {
        cqState.myChoice = null;
        cqState.partnerChoice = null;
        cqState.waiting = false;

        const q = cqQuestions[cqState.currentQ];
        const questionEl = document.getElementById('cqQuestion');
        const optionsEl = document.getElementById('cqOptions');
        const counter = document.getElementById('cqCounter');
        const progressBar = document.getElementById('cqProgressBar');
        const waitingEl = document.getElementById('cqWaiting');
        const finalEl = document.getElementById('cqFinal');

        if (questionEl) questionEl.textContent = q.q;
        if (counter) counter.textContent = `${cqState.currentQ + 1}/${cqQuestions.length}`;
        if (progressBar) progressBar.style.width = `${((cqState.currentQ) / cqQuestions.length) * 100}%`;
        if (waitingEl) waitingEl.style.display = 'none';
        if (finalEl) finalEl.style.display = 'none';

        if (optionsEl) {
            optionsEl.innerHTML = '';
            q.options.forEach((opt, i) => {
                const btn = document.createElement('button');
                btn.className = 'cq-option';
                btn.textContent = opt;
                btn.onclick = () => selectCqOption(i, btn);
                optionsEl.appendChild(btn);
            });
        }
    }

    function selectCqOption(index, btnEl) {
        if (cqState.myChoice !== null) return;
        cqState.myChoice = index;

        document.querySelectorAll('.cq-option').forEach(b => b.classList.remove('selected'));
        if (btnEl) btnEl.classList.add('selected');

        sendData({ game: 'compatible', action: 'answer', answer: index, qIndex: cqState.currentQ });

        if (cqState.partnerChoice !== null) {
            resolveCqQuestion();
        } else {
            cqState.waiting = true;
            const waitingEl = document.getElementById('cqWaiting');
            if (waitingEl) { waitingEl.style.display = 'block'; waitingEl.textContent = `⏳ รอ ${partnerName} ตอบ...`; }
        }
    }

    function resolveCqQuestion() {
        const waitingEl = document.getElementById('cqWaiting');
        if (waitingEl) waitingEl.style.display = 'none';

        cqState.myAnswers.push(cqState.myChoice);
        cqState.partnerAnswers.push(cqState.partnerChoice);

        const isMatch = cqState.myChoice === cqState.partnerChoice;

        document.querySelectorAll('.cq-option').forEach((btn, i) => {
            if (i === cqState.myChoice || i === cqState.partnerChoice) {
                btn.style.borderColor = isMatch ? '#4ade80' : '#f87171';
                btn.style.background = isMatch ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)';
            }
        });

        setTimeout(() => {
            cqState.currentQ++;
            const progressBar = document.getElementById('cqProgressBar');
            if (progressBar) progressBar.style.width = `${((cqState.currentQ) / cqQuestions.length) * 100}%`;

            if (cqState.currentQ < cqQuestions.length) {
                showCqQuestion();
            } else {
                showCqResult();
            }
        }, 1500);
    }

    function showCqResult() {
        const finalEl = document.getElementById('cqFinal');
        const pctEl = document.getElementById('cqPercentage');
        const msgEl = document.getElementById('cqMessage');
        const optionsEl = document.getElementById('cqOptions');
        const questionEl = document.getElementById('cqQuestion');
        const waitingEl = document.getElementById('cqWaiting');
        const progressBar = document.getElementById('cqProgressBar');

        if (optionsEl) optionsEl.innerHTML = '';
        if (questionEl) questionEl.textContent = '';
        if (waitingEl) waitingEl.style.display = 'none';
        if (progressBar) progressBar.style.width = '100%';

        let matchCount = 0;
        for (let i = 0; i < cqState.myAnswers.length; i++) {
            if (cqState.myAnswers[i] === cqState.partnerAnswers[i]) matchCount++;
        }
        const pct = Math.round((matchCount / cqQuestions.length) * 100);

        if (finalEl) finalEl.style.display = 'block';

        let currentPct = 0;
        const counterInterval = setInterval(() => {
            currentPct += 2;
            if (currentPct >= pct) {
                currentPct = pct;
                clearInterval(counterInterval);
            }
            if (pctEl) pctEl.textContent = `${currentPct}%`;
        }, 40);

        let message = '';
        if (pct >= 80) message = '💕 เข้ากันมากๆ! เกิดมาคู่กัน!';
        else if (pct >= 60) message = '💖 เข้ากันดีเลย! น่ารักมาก!';
        else if (pct >= 40) message = '💛 มีเสน่ห์ต่างกัน น่าสนุก!';
        else message = '😜 ตรงข้ามกันเลย! แต่ตรงข้ามดึงดูดนะ!';

        if (msgEl) msgEl.textContent = message;

        createConfetti(window.innerWidth / 2, window.innerHeight / 3);
    }

    gameHandlers['compatible'] = function (data) {
        if (data.action === 'answer') {
            cqState.partnerChoice = data.answer;
            if (cqState.myChoice !== null) {
                resolveCqQuestion();
            }
        }
    };

    window.initCompatibility = initCompatibility;
    window.resetCompatible = initCompatibility;
})();

// ============================================================
// 8. HIGHER OR LOWER (No click delegation double-binding)
// ============================================================
(function () {
    const suits = ['♠️', '♥️', '♦️', '♣️'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

    function cardNumericValue(val) {
        if (val === 'A') return 1;
        if (val === 'J') return 11;
        if (val === 'Q') return 12;
        if (val === 'K') return 13;
        return parseInt(val);
    }

    let hlState = {
        currentCard: null,
        nextCard: null,
        streak: 0,
        best: 0,
        myTurn: true,
        deck: [],
        locked: false
    };

    function buildDeck() {
        const d = [];
        for (const s of suits) {
            for (const v of values) {
                d.push({ suit: s, value: v });
            }
        }
        for (let i = d.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [d[i], d[j]] = [d[j], d[i]];
        }
        return d;
    }

    function initHigherLower() {
        hlState = {
            currentCard: null,
            nextCard: null,
            streak: 0,
            best: 0,
            myTurn: isHost,
            deck: [],
            locked: false
        };

        if (isHost) {
            hlState.deck = buildDeck();
            hlState.currentCard = hlState.deck.pop();
            hlState.nextCard = hlState.deck.pop();
            sendData({
                game: 'highlow',
                action: 'init',
                deck: hlState.deck,
                currentCard: hlState.currentCard,
                nextCard: hlState.nextCard
            });
        }

        updateHlUI();
    }

    function updateHlUI() {
        const curVal = document.getElementById('hlCurrentValue');
        const curSuit = document.getElementById('hlCurrentSuit');
        const nextVal = document.getElementById('hlNextValue');
        const nextSuit = document.getElementById('hlNextSuit');
        const streakEl = document.getElementById('hlStreak');
        const bestEl = document.getElementById('hlBest');
        const turnEl = document.getElementById('hlTurn');
        const current = document.getElementById('hlCurrent');
        const next = document.getElementById('hlNext');

        if (hlState.currentCard) {
            if (curVal) curVal.textContent = hlState.currentCard.value;
            if (curSuit) curSuit.textContent = hlState.currentCard.suit;
        } else {
            if (curVal) curVal.textContent = '?';
            if (curSuit) curSuit.textContent = '';
        }

        if (nextVal) nextVal.textContent = '?';
        if (nextSuit) nextSuit.textContent = '🂠';

        if (streakEl) streakEl.textContent = hlState.streak;
        if (bestEl) bestEl.textContent = hlState.best;
        if (turnEl) turnEl.textContent = hlState.myTurn ? 'ตาของคุณ! สูงหรือต่ำ?' : `ตาของ ${partnerName}`;

        if (current) current.classList.remove('hl-correct', 'hl-wrong');
        if (next) next.classList.remove('hl-correct', 'hl-wrong');
    }

    function makeHlGuess(guess) {
        if (hlState.locked || !hlState.myTurn || !hlState.currentCard || !hlState.nextCard) return;
        hlState.locked = true;

        const curNum = cardNumericValue(hlState.currentCard.value);
        const nextNum = cardNumericValue(hlState.nextCard.value);

        let correct;
        if (nextNum === curNum) {
            correct = true; 
        } else if (guess === 'higher') {
            correct = nextNum > curNum;
        } else {
            correct = nextNum < curNum;
        }

        const nextVal = document.getElementById('hlNextValue');
        const nextSuit = document.getElementById('hlNextSuit');
        const nextEl = document.getElementById('hlNext');

        if (nextVal) nextVal.textContent = hlState.nextCard.value;
        if (nextSuit) nextSuit.textContent = hlState.nextCard.suit;

        if (nextEl) {
            nextEl.classList.add(correct ? 'hl-correct' : 'hl-wrong');
            nextEl.style.animation = 'none';
            nextEl.offsetHeight;
            nextEl.style.animation = 'slideIn 0.5s ease';
        }

        sendData({
            game: 'highlow',
            action: 'guess',
            guess,
            nextCard: hlState.nextCard,
            correct
        });

        setTimeout(() => {
            if (correct) {
                hlState.streak++;
                if (hlState.streak > hlState.best) hlState.best = hlState.streak;
                createConfetti(window.innerWidth / 2, window.innerHeight / 2);

                hlState.currentCard = hlState.nextCard;
                if (hlState.deck.length > 0) {
                    hlState.nextCard = hlState.deck.pop();
                } else {
                    hlState.deck = buildDeck();
                    hlState.nextCard = hlState.deck.pop();
                    sendData({ game: 'highlow', action: 'newDeck', deck: hlState.deck, nextCard: hlState.nextCard });
                }
            } else {
                hlState.streak = 0;
                if (hlState.deck.length < 2) {
                    hlState.deck = buildDeck();
                    sendData({ game: 'highlow', action: 'newDeck', deck: hlState.deck });
                }
                hlState.currentCard = hlState.deck.pop();
                hlState.nextCard = hlState.deck.pop();
            }

            hlState.myTurn = false;
            hlState.locked = false;

            sendData({
                game: 'highlow',
                action: 'turnUpdate',
                currentCard: hlState.currentCard,
                nextCard: hlState.nextCard,
                streak: hlState.streak,
                best: hlState.best,
                deck: hlState.deck
            });

            updateHlUI();
        }, 1500);
    }

    gameHandlers['highlow'] = function (data) {
        if (data.action === 'init') {
            hlState.deck = data.deck;
            hlState.currentCard = data.currentCard;
            hlState.nextCard = data.nextCard;
            hlState.myTurn = !isHost;
            updateHlUI();
        } else if (data.action === 'guess') {
            const nextVal = document.getElementById('hlNextValue');
            const nextSuit = document.getElementById('hlNextSuit');
            const nextEl = document.getElementById('hlNext');

            if (nextVal) nextVal.textContent = data.nextCard.value;
            if (nextSuit) nextSuit.textContent = data.nextCard.suit;
            if (nextEl) {
                nextEl.classList.add(data.correct ? 'hl-correct' : 'hl-wrong');
                nextEl.style.animation = 'none';
                nextEl.offsetHeight;
                nextEl.style.animation = 'slideIn 0.5s ease';
            }
        } else if (data.action === 'turnUpdate') {
            hlState.currentCard = data.currentCard;
            hlState.nextCard = data.nextCard;
            hlState.streak = data.streak;
            hlState.best = data.best;
            hlState.deck = data.deck;
            hlState.myTurn = true;
            hlState.locked = false;
            updateHlUI();
        } else if (data.action === 'newDeck') {
            hlState.deck = data.deck;
            if (data.nextCard) hlState.nextCard = data.nextCard;
        }
    };

    window.initHigherLower = initHigherLower;
    window.guessHL = makeHlGuess;
})();

// ============================================================
// CSS KEYFRAME INJECTION (for popIn & slideIn)
// ============================================================
(function () {
    if (!document.getElementById('games-keyframes')) {
        const style = document.createElement('style');
        style.id = 'games-keyframes';
        style.textContent = `
            @keyframes popIn {
                0% { transform: scale(0); opacity: 0; }
                50% { transform: scale(1.3); }
                100% { transform: scale(1); opacity: 1; }
            }
            @keyframes slideIn {
                0% { transform: translateX(60px); opacity: 0; }
                100% { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
})();
