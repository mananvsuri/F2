
let breathingInterval;
let breathingActive = false;
let currentPattern = '4-7-8';
let punchCount = 0;
let squeezeCount = 0;
let destroyerScore = 0;
let dailySessions = 0;
let totalBreaths = 0;
let gamesPlayed = 0;
let audioTime = 0;
let audioTimerInterval;
let currentStressLevel = 1;
let journalEntries = [];
let activeSounds = new Map();
let destroyerGameActive = false;
let stressBallPressed = false;
let destroyerInterval;
let squeezeInterval;
let userHasInteracted = false;
let audioContext = null;


const audioBuffers = new Map();


async function initializeAudioContext() {
    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContextClass();
        
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }
        
        console.log('Audio context initialized');
        return true;
    } catch (error) {
        console.error('Failed to initialize audio context:', error);
        return false;
    }
}


async function generateAudioBuffers() {
    if (!audioContext) return;
    
    const soundConfigs = {
        rain: { duration: 5, type: 'noise', intensity: 0.1 },
        ocean: { duration: 8, type: 'wave', frequency: 0.3 },
        forest: { duration: 6, type: 'nature', complexity: 0.5 },
        fire: { duration: 4, type: 'crackle', warmth: 0.8 },
        birds: { duration: 3, type: 'chirp', pitch: 800 },
        meditation: { duration: 10, type: 'bell', resonance: 0.9 }
    };
    
    for (const [soundType, config] of Object.entries(soundConfigs)) {
        try {
            const buffer = await createAudioBuffer(soundType, config);
            audioBuffers.set(soundType, buffer);
        } catch (error) {
            console.error(`Failed to generate ${soundType} audio:`, error);
        }
    }
}

async function createAudioBuffer(soundType, config) {
    const sampleRate = audioContext.sampleRate;
    const length = sampleRate * config.duration;
    const buffer = audioContext.createBuffer(1, length, sampleRate);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
        const time = i / sampleRate;
        let sample = 0;
        
        switch (config.type) {
            case 'noise': 
                sample = (Math.random() - 0.5) * config.intensity * 
                         Math.sin(time * 0.5 + Math.random());
                break;
                
            case 'wave': 
                sample = Math.sin(time * config.frequency * Math.PI) * 0.15 +
                         Math.sin(time * config.frequency * 2 * Math.PI) * 0.05 +
                         (Math.random() - 0.5) * 0.02;
                break;
                
            case 'nature': 
                sample = (Math.random() - 0.5) * 0.03 +
                         Math.sin(time * 2 + Math.random() * 4) * 0.02 +
                         Math.sin(time * 0.1) * 0.01;
                break;
                
            case 'crackle': 
                const crackleFactor = Math.random() > 0.95 ? Math.random() * 0.3 : 0;
                sample = (Math.random() - 0.5) * 0.08 * (1 + Math.sin(time * 0.5)) +
                         crackleFactor;
                break;
                
            case 'chirp': 
                const chirp = Math.sin(time * config.pitch + 
                             Math.sin(time * 3) * 20) * 0.05;
                const fadeIn = Math.min(time * 10, 1);
                const fadeOut = Math.max(1 - ((time - config.duration + 1) * 10), 0);
                sample = chirp * fadeIn * fadeOut;
                break;
                
            case 'bell': 
                sample = Math.sin(time * 220) * 0.1 * 
                         Math.exp(-time * config.resonance) +
                         Math.sin(time * 440) * 0.05 * 
                         Math.exp(-time * config.resonance * 1.5);
                break;
        }
        
        channelData[i] = sample;
    }
    
    return buffer;
}


function setupUserInteractionDetection() {
    const handleFirstInteraction = async () => {
        if (userHasInteracted) return;
        
        userHasInteracted = true;
        console.log('User interaction detected - enabling audio');
        
        
        await initializeAudioContext();
        await generateAudioBuffers();
        
        
        document.querySelectorAll('audio').forEach(audio => {
            audio.muted = false;
        });
        
        showNotification('🔊 Audio system activated! Sounds are now enabled.');
        
        
        ['click', 'touchstart', 'keydown'].forEach(event => {
            document.removeEventListener(event, handleFirstInteraction);
        });
    };
    
    ['click', 'touchstart', 'keydown'].forEach(event => {
        document.addEventListener(event, handleFirstInteraction, { once: true });
    });
}


document.addEventListener('DOMContentLoaded', function() {
    console.log('FrustrateFree (F2) App Initialized');
    initializeApp();
    loadStoredData();
    setupEventListeners();
    setupAudioSystem();
    setupUserInteractionDetection();
    updateProgressDisplay();
    checkDailyReset();
    
    
    setTimeout(() => {
        if (!userHasInteracted) {
            showNotification('👆 Click anywhere to enable audio features!');
        }
    }, 2000);
});

function initializeApp() {
    setupSmoothScrolling();
    initializeZenGarden();
    loadJournalEntries();
    
    
    document.getElementById('punchCount').textContent = punchCount;
    document.getElementById('squeezeCount').textContent = squeezeCount;
    document.getElementById('destroyerScore').textContent = destroyerScore;
    
    console.log('All systems initialized successfully');
}


function setupEventListeners() {
    
    document.querySelectorAll('.stress-btn').forEach(btn => {
        btn.addEventListener('click', handleStressLevelSelect);
    });

    
    const startBreathingBtn = document.getElementById('startBreathing');
    const stopBreathingBtn = document.getElementById('stopBreathing');
    
    if (startBreathingBtn) startBreathingBtn.addEventListener('click', startBreathingExercise);
    if (stopBreathingBtn) stopBreathingBtn.addEventListener('click', stopBreathingExercise);
    
    
    document.querySelectorAll('.pattern-btn').forEach(btn => {
        btn.addEventListener('click', handlePatternSelect);
    });

    
    const createBubblesBtn = document.getElementById('createBubbles');
    const punchingBag = document.getElementById('punchingBag');
    const screamBtn = document.getElementById('screamBtn');
    const clearGardenBtn = document.getElementById('clearGarden');
    
    if (createBubblesBtn) createBubblesBtn.addEventListener('click', createBubbles);
    if (punchingBag) punchingBag.addEventListener('click', punchBag);
    if (screamBtn) screamBtn.addEventListener('click', virtualScream);
    if (clearGardenBtn) clearGardenBtn.addEventListener('click', clearZenGarden);

    
    const stressBall = document.getElementById('stressBall');
    if (stressBall) {
        stressBall.addEventListener('mousedown', startStressBallSqueeze);
        stressBall.addEventListener('mouseup', stopStressBallSqueeze);
        stressBall.addEventListener('mouseleave', stopStressBallSqueeze);
        stressBall.addEventListener('touchstart', startStressBallSqueeze);
        stressBall.addEventListener('touchend', stopStressBallSqueeze);
        stressBall.addEventListener('touchcancel', stopStressBallSqueeze);
    }

    
    const startDestroyerBtn = document.getElementById('startDestroyer');
    if (startDestroyerBtn) startDestroyerBtn.addEventListener('click', startDestroyerGame);

    
    document.querySelectorAll('.prompt-btn').forEach(btn => {
        btn.addEventListener('click', handleJournalPrompt);
    });

    const saveEntryBtn = document.getElementById('saveEntry');
    const clearEntryBtn = document.getElementById('clearEntry');
    
    if (saveEntryBtn) saveEntryBtn.addEventListener('click', saveJournalEntry);
    if (clearEntryBtn) clearEntryBtn.addEventListener('click', clearJournalEntry);

    
    document.querySelectorAll('.sound-toggle').forEach(btn => {
        btn.addEventListener('click', toggleSound);
    });

    const stopAllSoundsBtn = document.getElementById('stopAllSounds');
    const masterVolumeSlider = document.getElementById('masterVolume');
    
    if (stopAllSoundsBtn) stopAllSoundsBtn.addEventListener('click', stopAllSounds);
    if (masterVolumeSlider) masterVolumeSlider.addEventListener('input', adjustMasterVolume);
}


function handleStressLevelSelect() {
    document.querySelectorAll('.stress-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    currentStressLevel = parseInt(this.dataset.level);
    updateStressDisplay();
    incrementDailySessions();
    showNotification(`Stress level set to: ${this.textContent}`);
}

function handlePatternSelect() {
    document.querySelectorAll('.pattern-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    currentPattern = this.dataset.pattern;
    
    if (breathingActive) {
        stopBreathingExercise();
        setTimeout(() => startBreathingExercise(), 500);
    }
    
    showNotification(`Switched to ${this.textContent}`);
}

function handleJournalPrompt() {
    const journalTextarea = document.getElementById('journalText');
    if (journalTextarea) {
        journalTextarea.value = this.dataset.prompt + '\n\n';
        journalTextarea.focus();
    }
}


function setupAudioSystem() {
    document.querySelectorAll('.sound-card').forEach(card => {
        const soundType = card.dataset.sound;
        const audio = card.querySelector('audio');
        
        if (!audio) return;
        
        
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBS2H0fPVeSYELYDO9dyKNgkcZLrq6qBFFAp';
        audio.volume = 0.5;
        audio.loop = true;
        audio.muted = true; 
        
        audio.addEventListener('error', function() {
            console.log(`Using generated audio for ${soundType}`);
        });
    });
}

async function playGeneratedSound(soundType) {
    if (!audioContext || !userHasInteracted) {
        showNotification('⚠️ Please click anywhere first to enable audio!');
        return false;
    }
    
    try {
        const buffer = audioBuffers.get(soundType);
        if (!buffer) {
            console.error(`No buffer found for ${soundType}`);
            return false;
        }
        
        const source = audioContext.createBufferSource();
        const gainNode = audioContext.createGain();
        
        source.buffer = buffer;
        source.loop = true;
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        
        source.start();
        
        
        activeSounds.set(soundType, { source, gainNode });
        
        return true;
    } catch (error) {
        console.error(`Error playing generated ${soundType} sound:`, error);
        return false;
    }
}

function stopGeneratedSound(soundType) {
    const soundData = activeSounds.get(soundType);
    if (soundData && soundData.source) {
        try {
            soundData.source.stop();
            soundData.source.disconnect();
            soundData.gainNode.disconnect();
        } catch (error) {
            console.log('Sound already stopped');
        }
    }
    activeSounds.delete(soundType);
}

async function toggleSound(e) {
    const card = e.target.closest('.sound-card');
    const soundType = card.dataset.sound;
    const btn = e.target;
    
    if (!soundType) return;
    
    if (card.classList.contains('playing')) {
        
        stopGeneratedSound(soundType);
        card.classList.remove('playing');
        btn.textContent = 'Play';
        
        if (activeSounds.size === 0 && audioTimerInterval) {
            clearInterval(audioTimerInterval);
            audioTimerInterval = null;
        }
    } else {
        
        const success = await playGeneratedSound(soundType);
        
        if (success) {
            card.classList.add('playing');
            btn.textContent = 'Stop';
            
            if (!audioTimerInterval) {
                startAudioTimer();
            }
            
            showNotification(`🎵 Playing ${soundType} sounds for relaxation`);
            incrementDailySessions();
        } else {
            showNotification(`❌ Could not play ${soundType} sounds`);
        }
    }
}

function stopAllSounds() {
    const soundTypes = ['rain', 'ocean', 'forest', 'fire', 'birds', 'meditation'];
    
    soundTypes.forEach(type => {
        stopGeneratedSound(type);
        
        const card = document.querySelector(`[data-sound="${type}"]`);
        if (card) {
            card.classList.remove('playing');
            const btn = card.querySelector('.sound-toggle');
            if (btn) btn.textContent = 'Play';
        }
    });
    
    if (audioTimerInterval) {
        clearInterval(audioTimerInterval);
        audioTimerInterval = null;
    }
    
    showNotification('🔇 All sounds stopped');
}

function adjustMasterVolume(e) {
    const volume = e.target.value / 100;
    const volumeDisplay = document.getElementById('volumeDisplay');
    
    if (volumeDisplay) {
        volumeDisplay.textContent = `${e.target.value}%`;
    }
    
    
    activeSounds.forEach((soundData) => {
        if (soundData.gainNode) {
            soundData.gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        }
    });
    
    
    document.querySelectorAll('audio').forEach(audio => {
        audio.volume = volume;
    });
}

function startAudioTimer() {
    audioTimerInterval = setInterval(() => {
        if (activeSounds.size > 0) {
            audioTime++;
            updateProgressDisplay();
            saveToLocalStorage();
        }
    }, 60000);
}


function startBreathingExercise() {
    if (breathingActive) return;
    
    breathingActive = true;
    const circle = document.getElementById('breathingCircle');
    const text = document.getElementById('breathingText');
    
    if (!circle || !text) return;
    
    let phase = 'inhale';
    let count = 0;
    
    const patterns = {
        '4-7-8': { inhale: 4, hold: 7, exhale: 8 },
        'box': { inhale: 4, hold: 4, exhale: 4, hold2: 4 },
        'simple': { inhale: 4, exhale: 6 }
    };
    
    const pattern = patterns[currentPattern];
    
    function breathingCycle() {
        if (!breathingActive) return;
        
        switch(currentPattern) {
            case '4-7-8':
                handle478Breathing(phase, count, pattern, text, circle);
                break;
            case 'box':
                handleBoxBreathing(phase, count, pattern, text, circle);
                break;
            case 'simple':
                handleSimpleBreathing(phase, count, pattern, text, circle);
                break;
        }
        
        count++;
        
        
        if (currentPattern === '4-7-8') {
            if (phase === 'inhale' && count >= pattern.inhale) {
                phase = 'hold'; count = 0;
            } else if (phase === 'hold' && count >= pattern.hold) {
                phase = 'exhale'; count = 0;
            } else if (phase === 'exhale' && count >= pattern.exhale) {
                phase = 'inhale'; count = 0; totalBreaths++; updateProgressDisplay();
            }
        } else if (currentPattern === 'box') {
            if (phase === 'inhale' && count >= pattern.inhale) {
                phase = 'hold1'; count = 0;
            } else if (phase === 'hold1' && count >= pattern.hold) {
                phase = 'exhale'; count = 0;
            } else if (phase === 'exhale' && count >= pattern.exhale) {
                phase = 'hold2'; count = 0;
            } else if (phase === 'hold2' && count >= pattern.hold2) {
                phase = 'inhale'; count = 0; totalBreaths++; updateProgressDisplay();
            }
        } else if (currentPattern === 'simple') {
            if (phase === 'inhale' && count >= pattern.inhale) {
                phase = 'exhale'; count = 0;
            } else if (phase === 'exhale' && count >= pattern.exhale) {
                phase = 'inhale'; count = 0; totalBreaths++; updateProgressDisplay();
            }
        }
    }
    
    breathingInterval = setInterval(breathingCycle, 1000);
    incrementDailySessions();
    playBreathingSound();
    showNotification('🧘 Breathing exercise started. Focus on your breath.');
}

function handle478Breathing(phase, count, pattern, text, circle) {
    switch(phase) {
        case 'inhale':
            text.textContent = `Inhale... ${count + 1}`;
            circle.classList.remove('exhale');
            circle.classList.add('inhale');
            break;
        case 'hold':
            text.textContent = `Hold... ${count + 1}`;
            break;
        case 'exhale':
            text.textContent = `Exhale... ${count + 1}`;
            circle.classList.remove('inhale');
            circle.classList.add('exhale');
            break;
    }
}

function handleBoxBreathing(phase, count, pattern, text, circle) {
    switch(phase) {
        case 'inhale':
            text.textContent = `Inhale... ${count + 1}`;
            circle.classList.remove('exhale');
            circle.classList.add('inhale');
            break;
        case 'hold1':
            text.textContent = `Hold... ${count + 1}`;
            break;
        case 'exhale':
            text.textContent = `Exhale... ${count + 1}`;
            circle.classList.remove('inhale');
            circle.classList.add('exhale');
            break;
        case 'hold2':
            text.textContent = `Hold... ${count + 1}`;
            break;
    }
}

function handleSimpleBreathing(phase, count, pattern, text, circle) {
    switch(phase) {
        case 'inhale':
            text.textContent = `Breathe In... ${count + 1}`;
            circle.classList.remove('exhale');
            circle.classList.add('inhale');
            break;
        case 'exhale':
            text.textContent = `Breathe Out... ${count + 1}`;
            circle.classList.remove('inhale');
            circle.classList.add('exhale');
            break;
    }
}

function stopBreathingExercise() {
    breathingActive = false;
    if (breathingInterval) {
        clearInterval(breathingInterval);
    }
    
    const circle = document.getElementById('breathingCircle');
    const text = document.getElementById('breathingText');
    
    if (circle && text) {
        circle.classList.remove('inhale', 'exhale');
        text.textContent = 'Click Start to Begin';
    }
    
    showNotification('Breathing exercise stopped.');
}

function playBreathingSound() {
    if (!audioContext || !userHasInteracted) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.log('Breathing sound not available');
    }
}


function createBubbles() {
    const container = document.getElementById('bubbleContainer');
    if (!container) return;
    
    const numBubbles = 15;
    
    for (let i = 0; i < numBubbles; i++) {
        setTimeout(() => {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            
            const size = Math.random() * 40 + 20;
            bubble.style.width = size + 'px';
            bubble.style.height = size + 'px';
            bubble.style.left = Math.random() * (container.offsetWidth - size) + 'px';
            bubble.style.bottom = '0px';
            
            bubble.addEventListener('click', function() {
                const rect = this.getBoundingClientRect();
                createPopEffect(rect.left + rect.width/2, rect.top + rect.height/2);
                this.remove();
                playPopSound();
            });
            
            container.appendChild(bubble);
            
            setTimeout(() => {
                if (bubble.parentNode) {
                    bubble.remove();
                }
            }, 3000);
        }, i * 200);
    }
    
    incrementDailySessions();
    incrementGamesPlayed();
    showNotification('🫧 Bubbles created! Pop them for satisfaction!');
}

function createPopEffect(x, y) {
    const pop = document.createElement('div');
    pop.style.cssText = `
        position: fixed;
        left: ${x - 12}px;
        top: ${y - 12}px;
        font-size: 24px;
        color: #667eea;
        pointer-events: none;
        z-index: 9999;
        animation: pulse 0.5s ease-out forwards;
    `;
    pop.textContent = '✨';
    
    document.body.appendChild(pop);
    setTimeout(() => pop.remove(), 500);
}

function playPopSound() {
    if (!audioContext || !userHasInteracted) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
        console.log('Pop sound not available');
    }
}


function punchBag() {
    const bag = document.getElementById('punchingBag');
    const face = bag ? bag.querySelector('.bag-face') : null;
    const counter = document.getElementById('punchCount');
    
    if (!bag || !face || !counter) return;
    
    bag.classList.add('punch');
    punchCount++;
    counter.textContent = punchCount;
    
    const faces = ['😤', '😵', '🥴', '😴', '😌'];
    const faceIndex = Math.min(Math.floor(punchCount / 5), faces.length - 1);
    face.textContent = faces[faceIndex];
    
    playPunchSound();
    
    setTimeout(() => bag.classList.remove('punch'), 100);
    
    if (punchCount % 10 === 0) {
        document.body.classList.add('shake');
        setTimeout(() => document.body.classList.remove('shake'), 500);
        showNotification(`💪 ${punchCount} punches! Great stress relief!`);
    }
    
    incrementDailySessions();
    incrementGamesPlayed();
    saveToLocalStorage();
}

function playPunchSound() {
    if (!audioContext || !userHasInteracted) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
        console.log('Punch sound not available');
    }
}


function virtualScream() {
    const btn = document.getElementById('screamBtn');
    const waves = document.getElementById('screamWaves');
    
    if (!btn || !waves) return;
    
    btn.style.background = 'linear-gradient(45deg, #ff4757, #c44569)';
    btn.textContent = 'AHHHHHH!';
    btn.disabled = true;
    
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const wave = document.createElement('div');
            wave.className = 'wave';
            waves.appendChild(wave);
            
            setTimeout(() => {
                if (wave.parentNode) wave.remove();
            }, 1000);
        }, i * 200);
    }
    
    playScreamSound();
    
    setTimeout(() => {
        btn.style.background = 'linear-gradient(45deg, #ff6b6b, #ee5a24)';
        btn.textContent = 'SCREAM!';
        btn.disabled = false;
    }, 2000);
    
    incrementDailySessions();
    incrementGamesPlayed();
    showNotification('🗣️ Let it all out! Feel better?');
}

function playScreamSound() {
    if (!audioContext || !userHasInteracted) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 1.5);
        
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 1.5);
    } catch (error) {
        console.log('Scream sound not available');
    }
}


function initializeZenGarden() {
    const canvas = document.getElementById('zenGarden');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    
    ctx.fillStyle = '#F5DEB3';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    function startDrawing(e) {
        isDrawing = true;
        draw(e);
    }
    
    function draw(e) {
        if (!isDrawing) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#8B4513';
        
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
    
    function stopDrawing() {
        if (isDrawing) {
            isDrawing = false;
            ctx.beginPath();
            incrementDailySessions();
            incrementGamesPlayed();
        }
    }
    
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    
    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });
    
    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });
    
    canvas.addEventListener('touchend', function(e) {
        e.preventDefault();
        canvas.dispatchEvent(new MouseEvent('mouseup', {}));
    });
}

function clearZenGarden() {
    const canvas = document.getElementById('zenGarden');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#F5DEB3';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    showNotification('🏯 Zen garden cleared. Start fresh!');
}


function startStressBallSqueeze(e) {
    e.preventDefault();
    if (stressBallPressed) return;
    
    stressBallPressed = true;
    const ball = document.getElementById('stressBall');
    const indicator = document.getElementById('squeezeIndicator');
    
    if (!ball || !indicator) return;
    
    ball.classList.add('squeezing');
    
    let squeezeIntensity = 0;
    squeezeInterval = setInterval(() => {
        if (!stressBallPressed) {
            clearInterval(squeezeInterval);
            return;
        }
        
        squeezeIntensity = Math.min(squeezeIntensity + 2, 100);
        indicator.textContent = `${squeezeIntensity}%`;
        
        if (squeezeIntensity >= 100) {
            squeezeCount++;
            const counter = document.getElementById('squeezeCount');
            if (counter) counter.textContent = squeezeCount;
            
            ball.classList.add('pulse');
            setTimeout(() => ball.classList.remove('pulse'), 300);
            
            playSqueezeSound();
            showNotification('💪 Great squeeze! Tension released!');
            incrementGamesPlayed();
            
            squeezeIntensity = 0;
        }
    }, 50);
}

function stopStressBallSqueeze() {
    if (!stressBallPressed) return;
    
    stressBallPressed = false;
    const ball = document.getElementById('stressBall');
    const indicator = document.getElementById('squeezeIndicator');
    
    if (squeezeInterval) {
        clearInterval(squeezeInterval);
    }
    
    if (ball) ball.classList.remove('squeezing');
    
    if (indicator) {
        setTimeout(() => {
            indicator.textContent = '0%';
        }, 200);
    }
}

function playSqueezeSound() {
    if (!audioContext || !userHasInteracted) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
        console.log('Squeeze sound not available');
    }
}


function startDestroyerGame() {
    if (destroyerGameActive) return;
    
    destroyerGameActive = true;
    const targetArea = document.getElementById('targetArea');
    const crosshair = document.getElementById('crosshair');
    const startBtn = document.getElementById('startDestroyer');
    
    if (!targetArea || !crosshair || !startBtn) return;
    
    startBtn.textContent = 'Game Active!';
    startBtn.disabled = true;
    
    targetArea.addEventListener('mousemove', moveCrosshair);
    targetArea.addEventListener('click', shootTarget);
    
    spawnTargets();
    incrementGamesPlayed();
    
    showNotification('🎯 Frustration Destroyer started! Destroy the targets!');
    
    setTimeout(() => {
        endDestroyerGame();
    }, 30000);
}

function moveCrosshair(e) {
    const crosshair = document.getElementById('crosshair');
    if (!crosshair) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - 10;
    const y = e.clientY - rect.top - 10;
    
    crosshair.style.left = `${Math.max(0, Math.min(x, rect.width - 20))}px`;
    crosshair.style.top = `${Math.max(0, Math.min(y, rect.height - 20))}px`;
}

function shootTarget(e) {
    if (!destroyerGameActive) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const targets = document.querySelectorAll('.frustration-target');
    let hit = false;
    
    targets.forEach(target => {
        const targetRect = target.getBoundingClientRect();
        const targetX = targetRect.left - rect.left + targetRect.width / 2;
        const targetY = targetRect.top - rect.top + targetRect.height / 2;
        
        const distance = Math.sqrt((x - targetX) ** 2 + (y - targetY) ** 2);
        
        if (distance < 25) {
            hit = true;
            destroyerScore += 10;
            const scoreElement = document.getElementById('destroyerScore');
            if (scoreElement) scoreElement.textContent = destroyerScore;
            
            createExplosion(targetX, targetY);
            target.remove();
            
            playHitSound();
            showNotification('💥 Target destroyed! +10 points');
        }
    });
    
    if (!hit) {
        destroyerScore = Math.max(0, destroyerScore - 1);
        const scoreElement = document.getElementById('destroyerScore');
        if (scoreElement) scoreElement.textContent = destroyerScore;
        playMissSound();
    }
}

function spawnTargets() {
    if (!destroyerGameActive) return;
    
    const targetArea = document.getElementById('targetArea');
    if (!targetArea) return;
    
    const target = document.createElement('div');
    target.className = 'frustration-target';
    target.textContent = ['😠', '😡', '🤬', '💢', '😤'][Math.floor(Math.random() * 5)];
    
    const maxX = targetArea.offsetWidth - 40;
    const maxY = targetArea.offsetHeight - 40;
    target.style.left = `${Math.random() * maxX}px`;
    target.style.top = `${Math.random() * maxY}px`;
    
    targetArea.appendChild(target);
    
    setTimeout(() => {
        if (target.parentNode) {
            target.remove();
        }
    }, 3000);
    
    if (destroyerGameActive) {
        setTimeout(() => spawnTargets(), 800 + Math.random() * 1500);
    }
}

function createExplosion(x, y) {
    const targetArea = document.getElementById('targetArea');
    if (!targetArea) return;
    
    const explosion = document.createElement('div');
    explosion.className = 'explosion';
    explosion.style.left = `${x - 30}px`;
    explosion.style.top = `${y - 30}px`;
    explosion.textContent = '💥';
    
    targetArea.appendChild(explosion);
    setTimeout(() => {
        if (explosion.parentNode) {
            explosion.remove();
        }
    }, 500);
}

function endDestroyerGame() {
    destroyerGameActive = false;
    const targetArea = document.getElementById('targetArea');
    const startBtn = document.getElementById('startDestroyer');
    
    if (!targetArea || !startBtn) return;
    
    targetArea.removeEventListener('mousemove', moveCrosshair);
    targetArea.removeEventListener('click', shootTarget);
    
    document.querySelectorAll('.frustration-target').forEach(target => target.remove());
    document.querySelectorAll('.explosion').forEach(explosion => explosion.remove());
    
    startBtn.textContent = 'Start Destroyer';
    startBtn.disabled = false;
    
    showNotification(`🎯 Game Over! Final Score: ${destroyerScore} points`);
    incrementDailySessions();
    saveToLocalStorage();
}

function playHitSound() {
    if (!audioContext || !userHasInteracted) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
        console.log('Hit sound not available');
    }
}

function playMissSound() {
    if (!audioContext || !userHasInteracted) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
        console.log('Miss sound not available');
    }
}


function saveJournalEntry() {
    const textArea = document.getElementById('journalText');
    if (!textArea) return;
    
    const text = textArea.value.trim();
    if (!text) {
        showNotification('⚠️ Please write something before saving!');
        return;
    }
    
    const entry = {
        id: Date.now(),
        content: text,
        date: new Date().toLocaleString(),
        timestamp: Date.now()
    };
    
    journalEntries.unshift(entry);
    
    if (journalEntries.length > 50) {
        journalEntries = journalEntries.slice(0, 50);
    }
    
    saveToLocalStorage();
    displayJournalEntries();
    textArea.value = '';
    updateProgressDisplay();
    incrementDailySessions();
    
    showNotification('📝 Journal entry saved successfully!');
}

function clearJournalEntry() {
    const textArea = document.getElementById('journalText');
    if (textArea) {
        textArea.value = '';
        showNotification('📄 Journal entry cleared.');
    }
}

function displayJournalEntries() {
    const container = document.getElementById('entriesList');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (journalEntries.length === 0) {
        container.innerHTML = '<p style="color: #666; font-style: italic;">No entries yet. Start writing!</p>';
        return;
    }
    
    journalEntries.slice(0, 5).forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'journal-entry';
        
        const dateDiv = document.createElement('div');
        dateDiv.className = 'entry-date';
        dateDiv.textContent = entry.date;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'entry-content';
        contentDiv.textContent = entry.content.length > 200 ? 
            entry.content.substring(0, 200) + '...' : 
            entry.content;
        
        entryDiv.appendChild(dateDiv);
        entryDiv.appendChild(contentDiv);
        container.appendChild(entryDiv);
    });
}

function loadJournalEntries() {
    displayJournalEntries();
}


function updateProgressDisplay() {
    const elements = {
        dailySessions: document.getElementById('dailySessions'),
        totalBreaths: document.getElementById('totalBreaths'),
        totalEntries: document.getElementById('totalEntries'),
        gamesPlayed: document.getElementById('gamesPlayed'),
        audioTime: document.getElementById('audioTime')
    };
    
    if (elements.dailySessions) elements.dailySessions.textContent = dailySessions;
    if (elements.totalBreaths) elements.totalBreaths.textContent = totalBreaths;
    if (elements.totalEntries) elements.totalEntries.textContent = journalEntries.length;
    if (elements.gamesPlayed) elements.gamesPlayed.textContent = gamesPlayed;
    if (elements.audioTime) elements.audioTime.textContent = `${audioTime}m`;
    
    updateStressDisplay();
}

function updateStressDisplay() {
    const stressElement = document.getElementById('currentStress');
    if (!stressElement) return;
    
    const stressEmojis = ['😌', '😐', '😤', '😡', '🤬'];
    stressElement.textContent = stressEmojis[currentStressLevel - 1] || '😌';
}

function incrementDailySessions() {
    dailySessions++;
    updateProgressDisplay();
    saveToLocalStorage();
}

function incrementGamesPlayed() {
    gamesPlayed++;
    updateProgressDisplay();
    saveToLocalStorage();
}


function saveToLocalStorage() {
    try {
        const data = {
            dailySessions,
            totalBreaths,
            punchCount,
            squeezeCount,
            destroyerScore,
            journalEntries,
            currentStressLevel,
            gamesPlayed,
            audioTime,
            lastSaveDate: new Date().toDateString()
        };
        
        localStorage.setItem('frustrateFreeF2Data', JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function loadStoredData() {
    try {
        const stored = localStorage.getItem('frustrateFreeF2Data');
        if (!stored) return;
        
        const data = JSON.parse(stored);
        
        dailySessions = data.dailySessions || 0;
        totalBreaths = data.totalBreaths || 0;
        punchCount = data.punchCount || 0;
        squeezeCount = data.squeezeCount || 0;
        destroyerScore = data.destroyerScore || 0;
        journalEntries = data.journalEntries || [];
        currentStressLevel = data.currentStressLevel || 1;
        gamesPlayed = data.gamesPlayed || 0;
        audioTime = data.audioTime || 0;
        
        console.log('Data loaded from localStorage');
    } catch (error) {
        console.error('Error loading from localStorage:', error);
    }
}


function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function showNotification(message) {
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        z-index: 10000;
        font-weight: 600;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 4000);
}

function checkDailyReset() {
    try {
        const lastDate = localStorage.getItem('lastActiveDate');
        const today = new Date().toDateString();
        
        if (lastDate !== today) {
            dailySessions = 0;
            localStorage.setItem('lastActiveDate', today);
            updateProgressDisplay();
            saveToLocalStorage();
            console.log('Daily stats reset');
        }
    } catch (error) {
        console.error('Error checking daily reset:', error);
    }
}


window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    showNotification('⚠️ Something went wrong, but the app is still working!');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    e.preventDefault();
});

window.addEventListener('beforeunload', function() {
    if (breathingInterval) clearInterval(breathingInterval);
    if (audioTimerInterval) clearInterval(audioTimerInterval);
    if (squeezeInterval) clearInterval(squeezeInterval);
    if (destroyerInterval) clearInterval(destroyerInterval);
    
    stopAllSounds();
    saveToLocalStorage();
});

console.log('FrustrateFree (F2) JavaScript loaded successfully with working audio! 🧘‍♂️🔊');
