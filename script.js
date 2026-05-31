/* ===================================
   GLOBAL VARIABLES & STATE
   =================================== */

let currentSectionIndex = 0;
const sections = [
    'section-opening',
    'section-game',
    'section-puzzle',
    'section-album',
    'section-chat',
    'section-choice',
    'section-confession'
];

// Game state
let score = 0;
let gameActive = false;
let gameInterval = null;
let heartMoveInterval = null;

// Puzzle state
let selectedPuzzleIndices = [];
const puzzleWords = ['LOVE', 'KISS', 'HUGS', 'CARE'];
let currentPuzzleWord = 'LOVE';
let puzzleLetters = ['E', 'V', 'O', 'L'];
let correctOrder = ['L', 'O', 'V', 'E'];

// Album state
let currentPhotoIndex = 0;
const photos = [
    { src: 'images/photo1.jpg', date: '11 april 2026', caption: 'Like a monkey' },
    { src: 'images/photo2.jpg', date: '-', caption: 'like a beautiful woman❤💕' },
    { src: 'images/photo3.jpg', date: '23 April 2026', caption: 'Dodol🦀' },
    { src: 'images/photo4.jpg', date: '1  mei 2026', caption: 'u before a taking shower' },
    { src: 'images/photo5.jpg', date: '-', caption: "you're at school" }
];

// Chat state
const messages = [
    { text: "Hey... I've been thinking about something", sender: 'me' },
    { text: "Every time I see you", sender: 'me' },
    { text: "My heart beats a little faster", sender: 'me' },
    { text: "When you smile", sender: 'me' },
    { text: "The whole world feels brighter ✨", sender: 'me' },
    { text: "I love the way you laugh", sender: 'me' },
    { text: "The way you make everything better", sender: 'me' },
    { text: "And I realized something important...", sender: 'me' }
];

let chatIndex = 0;
let charIndex = 0;
let typingTimeout = null;

// Choice state
let noButtonAttempts = 0;

/* ===================================
   INITIALIZATION
   =================================== */

document.addEventListener('DOMContentLoaded', function() {
    initFloatingHearts();
    initFloatingWords();
    initFallingGiraffes();
    initMusicPlayer();
    showSection(0);
});

/* ===================================
   BACKGROUND ANIMATIONS
   =================================== */

function initFloatingHearts() {
    const container = document.getElementById('floating-hearts');
    for (let i = 0; i < 15; i++) {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.textContent = '💕';
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDelay = Math.random() * 5 + 's';
        heart.style.animationDuration = (8 + Math.random() * 4) + 's';
        container.appendChild(heart);
    }
}

function initFloatingWords() {
    const words = ['love', 'us', 'forever', 'mine', 'always', 'together', 'yours', 'hearts'];
    const container = document.getElementById('floating-words');

    words.forEach((word, i) => {
        const wordEl = document.createElement('div');
        wordEl.className = 'floating-word';
        wordEl.textContent = word;
        wordEl.style.left = (i * 13) % 90 + '%';
        wordEl.style.top = (i * 17) % 80 + '%';
        wordEl.style.animationDelay = (i * 0.8) + 's';
        container.appendChild(wordEl);
    });
}

function initFallingGiraffes() {
    const container = document.getElementById('falling-giraffes');
    for (let i = 0; i < 24; i++) {
        const giraffe = document.createElement('div');
        giraffe.className = 'falling-giraffe';
        giraffe.textContent = '🦒';
        giraffe.style.left = Math.random() * 100 + '%';
        giraffe.style.animationDuration = (6 + Math.random() * 6) + 's';
        giraffe.style.animationDelay = -(Math.random() * 10) + 's';
        giraffe.style.fontSize = (1.8 + Math.random() * 1.2) + 'rem';
        giraffe.style.opacity = 0.5 + Math.random() * 0.4;
        container.appendChild(giraffe);
    }
}

/* ===================================
   MUSIC PLAYER
   =================================== */

function initMusicPlayer() {
    const musicToggle = document.getElementById('music-toggle');
    const music = document.getElementById('background-music');
    let isPlaying = false; // Music will be started by startExperience

    musicToggle.addEventListener('click', function() {
        if (isPlaying) {
            music.pause();
            musicToggle.textContent = '🎵';
        } else {
            music.play();
            musicToggle.textContent = '⏸️';
        }
        isPlaying = !isPlaying;
    });
}

/* ===================================
   NAVIGATION
   =================================== */

function showSection(index) {
    // Hide all sections
    sections.forEach(id => {
        document.getElementById(id).classList.remove('active');
    });

    // Show target section
    const sectionId = sections[index];
    document.getElementById(sectionId).classList.add('active');
    currentSectionIndex = index;

    // Initialize section-specific functionality
    if (sectionId === 'section-game') {
        startGame();
    } else if (sectionId === 'section-puzzle') {
        initPuzzle();
    } else if (sectionId === 'section-album') {
        showPhoto(0);
    } else if (sectionId === 'section-chat') {
        startChat();
    } else if (sectionId === 'section-choice') {
        initChoice();
    } else if (sectionId === 'section-confession') {
        startConfetti();
    }
}

function startExperience() {
    // Start background music
    const music = document.getElementById('background-music');
    music.play().catch(e => console.log('Autoplay blocked:', e));
    document.getElementById('music-toggle').textContent = '⏸️';

    // Move to next section
    nextSection();
}

function nextSection() {
    if (currentSectionIndex < sections.length - 1) {
        showSection(currentSectionIndex + 1);
    }
}

function restart() {
    // Reset all state
    score = 0;
    currentPhotoIndex = 0;
    chatIndex = 0;
    charIndex = 0;
    noButtonAttempts = 0;
    selectedPuzzleIndices = [];

    // Clear intervals
    if (gameInterval) clearInterval(gameInterval);
    if (heartMoveInterval) clearInterval(heartMoveInterval);
    if (typingTimeout) clearTimeout(typingTimeout);

    // Clear containers
    document.getElementById('game-area').innerHTML = '';
    document.getElementById('chat-container').innerHTML = '';
    document.getElementById('confetti-container').innerHTML = '';

    // Go back to start
    showSection(0);
}

/* ===================================
   SECTION 2: HEART CATCHING GAME
   =================================== */

function startGame() {
    score = 0;
    gameActive = true;
    document.getElementById('score').textContent = score;
    document.getElementById('game-complete-msg').classList.add('hidden');

    const gameArea = document.getElementById('game-area');
    gameArea.innerHTML = '';

    // Spawn hearts
    gameInterval = setInterval(() => {
        if (!gameActive) return;
        spawnHeart();
    }, 800);

    // Move hearts down
    heartMoveInterval = setInterval(() => {
        if (!gameActive) return;
        moveHearts();
    }, 50);
}

function spawnHeart() {
    const gameArea = document.getElementById('game-area');
    const heart = document.createElement('div');
    heart.className = 'falling-heart';
    heart.textContent = '❤️';
    heart.style.left = Math.random() * 85 + '%';
    heart.style.top = '-10%';
    heart.dataset.speed = 2;

    heart.addEventListener('click', function() {
        catchHeart(this);
    });

    gameArea.appendChild(heart);
}

function moveHearts() {
    const hearts = document.querySelectorAll('.falling-heart');
    hearts.forEach(heart => {
        const currentTop = parseFloat(heart.style.top);
        const newTop = currentTop + parseFloat(heart.dataset.speed);

        if (newTop > 100) {
            heart.remove();
        } else {
            heart.style.top = newTop + '%';
        }
    });
}

function catchHeart(heartEl) {
    heartEl.remove();
    score++;
    document.getElementById('score').textContent = score;

    if (score >= 10) {
        gameActive = false;
        clearInterval(gameInterval);
        clearInterval(heartMoveInterval);

        document.getElementById('game-complete-msg').classList.remove('hidden');

        setTimeout(() => {
            nextSection();
        }, 1500);
    }
}

/* ===================================
   SECTION 3: LOVE PUZZLE
   =================================== */

function initPuzzle() {
    selectedPuzzleIndices = [];
    const lettersContainer = document.getElementById('puzzle-letters');
    const selectedContainer = document.getElementById('selected-letters');

    lettersContainer.innerHTML = '';
    selectedContainer.innerHTML = '';
    document.getElementById('puzzle-complete-msg').classList.add('hidden');

    // Choose random word
    currentPuzzleWord = puzzleWords[Math.floor(Math.random() * puzzleWords.length)];
    correctOrder = currentPuzzleWord.split('');
    puzzleLetters = [...correctOrder].sort(() => Math.random() - 0.5);

    // Update section title
    document.querySelector('#section-puzzle .section-title').textContent = `Arrange the letters to form: ${currentPuzzleWord}`;

    puzzleLetters.forEach((letter, index) => {
        const btn = document.createElement('button');
        btn.className = 'puzzle-letter unselected';
        btn.textContent = letter;
        btn.dataset.index = index;
        btn.addEventListener('click', () => togglePuzzleLetter(index));
        lettersContainer.appendChild(btn);
    });
}

function togglePuzzleLetter(index) {
    const selectedContainer = document.getElementById('selected-letters');

    if (selectedPuzzleIndices.includes(index)) {
        // Deselect
        selectedPuzzleIndices = selectedPuzzleIndices.filter(i => i !== index);
    } else if (selectedPuzzleIndices.length < 4) {
        // Select
        selectedPuzzleIndices.push(index);
    } else {
        return; // Already 4 selected
    }

    updatePuzzleDisplay();

    if (selectedPuzzleIndices.length === 4) {
        checkPuzzle();
    }
}

function updatePuzzleDisplay() {
    // Update letter buttons
    document.querySelectorAll('.puzzle-letter').forEach((btn, index) => {
        if (selectedPuzzleIndices.includes(index)) {
            btn.classList.remove('unselected');
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
            btn.classList.add('unselected');
        }
    });

    // Update selected display
    const selectedContainer = document.getElementById('selected-letters');
    selectedContainer.innerHTML = '';

    selectedPuzzleIndices.forEach(index => {
        const box = document.createElement('div');
        box.className = 'selected-box';
        box.textContent = puzzleLetters[index];
        selectedContainer.appendChild(box);
    });
}

function checkPuzzle() {
    const selectedLetters = selectedPuzzleIndices.map(i => puzzleLetters[i]);
    const isCorrect = JSON.stringify(selectedLetters) === JSON.stringify(correctOrder);

    if (isCorrect) {
        document.getElementById('puzzle-complete-msg').classList.remove('hidden');
        setTimeout(() => {
            nextSection();
        }, 2000);
    } else {
        // Wrong answer - reset after delay
        setTimeout(() => {
            selectedPuzzleIndices = [];
            updatePuzzleDisplay();
        }, 1000);
    }
}

/* ===================================
   SECTION 4: PHOTO ALBUM
   =================================== */

function showPhoto(index) {
    const photo = photos[index];
    const photoImage = document.getElementById('photo-image');

    photoImage.src = photo.src;
    photoImage.alt = photo.caption;
    document.getElementById('photo-date').textContent = photo.date;
    document.getElementById('photo-caption').textContent = photo.caption;
    document.getElementById('photo-counter').textContent = `${index + 1} / ${photos.length}`;

    if (index === photos.length - 1) {
        document.getElementById('album-btn-text').textContent = 'Continue ➡️';
    } else {
        document.getElementById('album-btn-text').textContent = 'Next 💕';
    }
}

function nextPhoto() {
    if (currentPhotoIndex < photos.length - 1) {
        currentPhotoIndex++;
        showPhoto(currentPhotoIndex);
    } else {
        nextSection();
    }
}

/* ===================================
   SECTION 5: CHAT SIMULATION
   =================================== */

function startChat() {
    chatIndex = 0;
    charIndex = 0;
    document.getElementById('chat-container').innerHTML = '';
    typeNextMessage();
}

function typeNextMessage() {
    if (chatIndex >= messages.length) {
        // All messages done
        setTimeout(() => {
            nextSection();
        }, 2000);
        return;
    }

    const message = messages[chatIndex];
    const container = document.getElementById('chat-container');

    // Create message bubble
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${message.sender}`;

    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${message.sender}`;
    bubble.id = `chat-bubble-${chatIndex}`;

    messageDiv.appendChild(bubble);
    container.appendChild(messageDiv);

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;

    // Type characters
    typeCharacter(bubble, message.text, 0);
}

function typeCharacter(bubble, text, index) {
    if (index < text.length) {
        bubble.textContent = text.substring(0, index + 1);
        bubble.innerHTML += '<span class="typing-cursor">|</span>';

        typingTimeout = setTimeout(() => {
            typeCharacter(bubble, text, index + 1);
        }, 50);
    } else {
        // Remove cursor
        bubble.textContent = text;

        // Move to next message
        chatIndex++;
        setTimeout(() => {
            typeNextMessage();
        }, 800);
    }
}

/* ===================================
   SECTION 6: CHOICE SECTION
   =================================== */

function initChoice() {
    noButtonAttempts = 0;
    const noButton = document.getElementById('no-button');
    noButton.classList.remove('moving');
    noButton.style.position = 'relative';
    noButton.style.left = '';
    noButton.style.top = '';

    document.getElementById('choice-hint').classList.add('hidden');

    noButton.addEventListener('mouseenter', moveNoButton);
    noButton.addEventListener('touchstart', moveNoButton);
}

function moveNoButton(e) {
    e.preventDefault();
    noButtonAttempts++;

    const noButton = document.getElementById('no-button');
    const maxX = window.innerWidth - 200;
    const maxY = window.innerHeight - 100;

    noButton.classList.add('moving');
    noButton.style.left = Math.random() * maxX + 'px';
    noButton.style.top = Math.random() * maxY + 'px';

    if (noButtonAttempts > 3) {
        document.getElementById('choice-hint').classList.remove('hidden');
    }
}

/* ===================================
   SECTION 7: CONFESSION & CONFETTI
   =================================== */

function startConfetti() {
    const container = document.getElementById('confetti-container');
    container.innerHTML = '';

    const emojis = ['💖', '💝', '💕', '💗', '🌸', '✨', '💫', '⭐'];

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.animationDuration = (3 + Math.random() * 2) + 's';
        container.appendChild(confetti);
    }
}