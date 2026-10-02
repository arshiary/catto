// Multi-Cat & Game State
let daysCompleted = 0; // Total days completed
let activeCatIndex = 0;
let coins = 100;
let soundEnabled = true;
let isBusy = false;
let audioCtx = null;
let lastDateString = new Date().toDateString();

// Cats Data Array
let cats = [
    { id: 1, name: "Ginger", breed: "ginger", hunger: 80.0, thirst: 75.0, happiness: 90.0, energy: 85.0, isSleeping: false },
    { id: 2, name: "Snowy", breed: "snowy", hunger: 80.0, thirst: 75.0, happiness: 90.0, energy: 85.0, isSleeping: false }
];

let eyeState = 'normal'; // 'normal', 'happy'
let sleepTimer = null;

// Item Price Config
const itemPrices = {
    'chicken': 35,
    'salmon': 40,
    'cod': 20,
    'meat': 50,
    'water': 20,
    'milk': 35
};

// Dynamic Slot Calculation
// Starter = 2 slots
// Day 1 completed = +1 slot (3)
// Day 10 completed = +1 slot (4)
// Day 20, 30... = +1 slot every 10 days
function getMaxSlots() {
    let slots = 2;
    if (daysCompleted >= 1) slots += 1;
    if (daysCompleted >= 10) {
        slots += 1 + Math.floor((daysCompleted - 10) / 10);
    }
    return slots;
}

function getActiveCat() {
    return cats[activeCatIndex] || cats[0];
}

const canvas = document.getElementById('pixelCatCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const breedPalettes = {
    'snowy': { outline: '#1e1b18', body: '#ffffff', shadow: '#d1d5db', innerEar: '#f895a7', eyeLeft: '#0284c7', eyeRight: '#f97316', nose: '#f43f5e', tail: '#ffffff' },
    'calico': { outline: '#1e1b18', body: '#ffffff', patch1: '#f97316', patch2: '#6b7280', shadow: '#e5e7eb', innerEar: '#f895a7', eyeLeft: '#0284c7', eyeRight: '#0284c7', nose: '#f43f5e', tail: '#f97316' },
    'ginger': { outline: '#1e1b18', body: '#f97316', stripes: '#ea580c', belly: '#ffedd5', innerEar: '#fbcfe8', eyeLeft: '#10b981', eyeRight: '#10b981', nose: '#f43f5e', tail: '#ea580c' },
    'smokey': { outline: '#1e1b18', body: '#9ca3af', stripes: '#4b5563', belly: '#f3f4f6', innerEar: '#fbcfe8', eyeLeft: '#ef4444', eyeRight: '#ef4444', nose: '#f43f5e', tail: '#4b5563' },
    'siamese': { outline: '#1e1b18', body: '#fef3c7', mask: '#451a03', shadow: '#fde68a', innerEar: '#78350f', eyeLeft: '#3b82f6', eyeRight: '#3b82f6', nose: '#1e1b18', tail: '#451a03' },
    'shadow': { outline: '#000000', body: '#1f2937', shadow: '#111827', innerEar: '#374151', eyeLeft: '#eab308', eyeRight: '#eab308', nose: '#000000', tail: '#111827' }
};

function drawPixelCat() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const activeCat = getActiveCat();
    const p = breedPalettes[activeCat.breed] || breedPalettes['ginger'];
    const scale = 4;

    function drawPx(x, y, color, width = 1, height = 1) {
        ctx.fillStyle = color;
        ctx.fillRect(x * scale, y * scale, width * scale, height * scale);
    }

    // Tail
    drawPx(22, 18, p.outline, 2, 8);
    drawPx(24, 16, p.outline, 4, 3);
    drawPx(26, 14, p.tail, 2, 4);

    // Body
    drawPx(8, 16, p.outline, 16, 12);
    drawPx(9, 17, p.body, 14, 10);

    // Belly
    const bellyColor = p.belly || p.shadow || '#ffffff';
    drawPx(12, 19, bellyColor, 8, 7);

    // Paws
    drawPx(10, 26, p.outline, 3, 3);
    drawPx(11, 27, '#ffffff', 1, 2);
    drawPx(19, 26, p.outline, 3, 3);
    drawPx(20, 27, '#ffffff', 1, 2);

    // Head
    drawPx(7, 6, p.outline, 18, 11);
    drawPx(8, 7, p.body, 16, 9);

    // Ears
    drawPx(8, 2, p.outline, 4, 5);
    drawPx(9, 3, p.innerEar, 2, 3);
    drawPx(20, 2, p.outline, 4, 5);
    drawPx(21, 3, p.innerEar, 2, 3);

    // Patterns
    if (activeCat.breed === 'siamese') {
        drawPx(13, 9, p.mask, 6, 5);
    } else if (p.stripes) {
        drawPx(15, 7, p.stripes, 2, 3);
        drawPx(12, 7, p.stripes, 1, 2);
        drawPx(19, 7, p.stripes, 1, 2);
    } else if (activeCat.breed === 'calico') {
        drawPx(8, 7, p.patch1, 5, 4);
        drawPx(19, 7, p.patch2, 5, 4);
    }

    // Whiskers
    drawPx(4, 11, p.outline, 3, 1);
    drawPx(4, 13, p.outline, 3, 1);
    drawPx(25, 11, p.outline, 3, 1);
    drawPx(25, 13, p.outline, 3, 1);

    // Eyes
    if (activeCat.isSleeping) {
        drawPx(11, 11, p.outline, 3, 1);
        drawPx(18, 11, p.outline, 3, 1);
    } else if (eyeState === 'happy') {
        drawPx(11, 10, p.outline, 3, 1);
        drawPx(10, 11, p.outline, 1, 1);
        drawPx(13, 11, p.outline, 1, 1);

        drawPx(18, 10, p.outline, 3, 1);
        drawPx(17, 11, p.outline, 1, 1);
        drawPx(20, 11, p.outline, 1, 1);
    } else {
        drawPx(11, 10, p.eyeLeft, 2, 3);
        drawPx(11, 10, '#ffffff', 1, 1);
        drawPx(19, 10, p.eyeRight, 2, 3);
        drawPx(19, 10, '#ffffff', 1, 1);
    }

    // Nose & Mouth
    drawPx(15, 12, p.nose, 2, 1);
    drawPx(15, 13, p.outline, 2, 1);
    drawPx(14, 14, p.outline, 1, 1);
    drawPx(17, 14, p.outline, 1, 1);

    // Cheeks
    drawPx(9, 12, '#f895a7', 2, 1);
    drawPx(21, 12, '#f895a7', 2, 1);
}

// Audio System
function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playSound(type) {
    if (!soundEnabled) return;
    initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const now = audioCtx.currentTime;

    if (type === 'meow') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(750, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.35);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

        osc.start(now);
        osc.stop(now + 0.35);
    } else if (type === 'eat' || type === 'drink') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(type === 'eat' ? 220 : 600, now);
        osc.frequency.linearRampToValueAtTime(type === 'eat' ? 330 : 900, now + 0.12);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        osc.start(now);
        osc.stop(now + 0.2);
    } else if (type === 'purr') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        osc.start(now);
        osc.stop(now + 0.4);
    } else if (type === 'coin') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, now);
        osc.frequency.setValueAtTime(1318.51, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'bomb') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(40, now + 0.25);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

        osc.start(now);
        osc.stop(now + 0.25);
    }
}

function renderCatSlots() {
    const container = document.getElementById('cat-slots-container');
    container.innerHTML = '';
    const maxSlots = getMaxSlots();

    cats.forEach((cat, idx) => {
        const isSelected = idx === activeCatIndex;
        const btn = document.createElement('button');
        btn.onclick = () => switchCat(idx);
        btn.className = isSelected 
            ? "pixel-btn-primary px-2 py-1 text-[10px] font-pixel shrink-0 flex items-center gap-1"
            : "pixel-btn px-2 py-1 text-[10px] font-pixel shrink-0 flex items-center gap-1 text-[#3a2e39]";
        btn.innerHTML = `<span>🐱</span> ${cat.name}`;
        container.appendChild(btn);
    });

    // If slots available
    if (cats.length < maxSlots) {
        const addBtn = document.createElement('button');
        addBtn.onclick = openAdoptModal;
        addBtn.className = "pixel-btn bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-2 py-1 text-[10px] font-pixel shrink-0 flex items-center gap-1";
        addBtn.innerHTML = `<i class="fa-solid fa-plus text-[9px]"></i> ADOPT`;
        container.appendChild(addBtn);
    } else {
        const lockedBtn = document.createElement('div');
        lockedBtn.className = "bg-slate-200 border border-slate-400 text-slate-500 px-2 py-1 text-[9px] font-pixel shrink-0 flex items-center gap-1 rounded-none opacity-80 cursor-help";
        
        let nextUnlockText = "1 Day";
        if (daysCompleted >= 1) {
            const nextThreshold = 10 + Math.floor((daysCompleted - 10) / 10) * 10 + 10;
            nextUnlockText = `${nextThreshold} Days`;
        }
        lockedBtn.title = `Unlock next slot at ${nextUnlockText} completed!`;
        lockedBtn.innerHTML = `<i class="fa-solid fa-lock text-[8px]"></i> SLOT LOCKED (${nextUnlockText})`;
        container.appendChild(lockedBtn);
    }
}

function switchCat(index) {
    if (index < 0 || index >= cats.length) return;
    activeCatIndex = index;
    const cat = getActiveCat();

    document.getElementById('cat-name-display').innerText = cat.name;
    playSound('meow');
    showSpeech(`Hi! I'm ${cat.name}! Meow~`);
    updateUI();
}

function updateUI() {
    const cat = getActiveCat();
    document.getElementById('cat-name-display').innerText = cat.name;
    document.getElementById('coin-count').innerText = coins;
    document.getElementById('days-count').innerText = `DAY ${daysCompleted}`;

    // Smooth high precision float bar widths
    ['hunger', 'thirst', 'happiness', 'energy'].forEach(stat => {
        const val = Math.round(cat[stat === 'happiness' ? 'happiness' : stat]);
        const barKey = stat === 'happiness' ? 'happy' : stat;
        document.getElementById(`${barKey}-bar`).style.width = Math.min(100, Math.max(0, cat[stat === 'happiness' ? 'happiness' : stat])) + '%';
        document.getElementById(`${barKey}-val`).innerText = val + '%';
    });

    // Price checks
    const checkAffordability = (btnId, price) => {
        const btn = document.getElementById(btnId);
        if (btn) btn.disabled = coins < price || isBusy || cat.isSleeping;
    };

    checkAffordability('btn-feed-chicken', itemPrices['chicken']);
    checkAffordability('btn-feed-salmon', itemPrices['salmon']);
    checkAffordability('btn-feed-cod', itemPrices['cod']);
    checkAffordability('btn-feed-meat', itemPrices['meat']);
    checkAffordability('btn-drink-water', itemPrices['water']);
    checkAffordability('btn-drink-milk', itemPrices['milk']);

    // Status text
    const statusText = document.getElementById('cat-status-text');
    if (cat.isSleeping) {
        statusText.innerText = "Status: Sleeping Peacefully 💤";
        statusText.className = "text-sm font-bold text-indigo-400 mt-0.5";
    } else if (cat.hunger < 30) {
        statusText.innerText = "Status: Very Hungry! 😿";
        statusText.className = "text-sm font-bold text-red-500 mt-0.5";
    } else if (cat.thirst < 30) {
        statusText.innerText = "Status: Thirsty 😿";
        statusText.className = "text-sm font-bold text-amber-500 mt-0.5";
    } else if (cat.energy < 25) {
        statusText.innerText = "Status: Sleepy & Tired 😴";
        statusText.className = "text-sm font-bold text-purple-500 mt-0.5";
    } else {
        statusText.innerText = "Status: Happy & Energetic ✨";
        statusText.className = "text-sm font-bold text-[#eeadb3] mt-0.5";
    }

    renderCatSlots();
    drawPixelCat();
}

// Extremely Smooth Gradual Stat Add
function addStatsGradually(targetIncrements, durationMs = 1200) {
    const cat = getActiveCat();
    const fps = 30;
    const steps = Math.floor(durationMs / (1000 / fps));
    const stepIncrements = {};

    for (const key in targetIncrements) {
        stepIncrements[key] = targetIncrements[key] / steps;
    }

    let currentStep = 0;
    const interval = setInterval(() => {
        currentStep++;
        for (const key in targetIncrements) {
            const prop = key === 'happiness' ? 'happiness' : key;
            cat[prop] = Math.min(100, Math.max(0, cat[prop] + stepIncrements[key]));
        }
        updateUI();

        if (currentStep >= steps) {
            clearInterval(interval);
        }
    }, 1000 / fps);
}

function showSpeech(text, duration = 2500) {
    const bubble = document.getElementById('speech-bubble');
    const speechText = document.getElementById('speech-text');
    speechText.innerText = text;
    bubble.classList.remove('scale-0');
    bubble.classList.add('scale-100');

    setTimeout(() => {
        bubble.classList.remove('scale-100');
        bubble.classList.add('scale-0');
    }, duration);
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('block');
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.className = "tab-btn font-pixel text-[10px] sm:text-xs px-3 py-2 pixel-btn flex items-center gap-1.5 shrink-0";
    });

    document.getElementById('content-' + tabName).classList.remove('hidden');
    document.getElementById('content-' + tabName).classList.add('block');

    const activeBtn = document.getElementById('tab-' + tabName);
    activeBtn.className = "tab-btn font-pixel text-[10px] sm:text-xs px-3 py-2 pixel-btn-primary flex items-center gap-1.5 shrink-0";
}

function petCat(event) {
    const cat = getActiveCat();
    if (cat.isSleeping) {
        showSpeech("Zzz... Don't wake me up meow~");
        return;
    }

    eyeState = 'happy';
    playSound('purr');
    showSpeech("Purrrr... Meow~ ❤️");
    addStatsGradually({ happiness: 6 }, 600);

    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.innerText = '❤️';
    heart.style.left = (event.clientX - 10) + 'px';
    heart.style.top = (event.clientY - 20) + 'px';
    document.body.appendChild(heart);

    setTimeout(() => heart.remove(), 1000);
    setTimeout(() => { eyeState = 'normal'; updateUI(); }, 1000);

    updateUI();
}

function feedCat(type) {
    const cat = getActiveCat();
    if (isBusy || cat.isSleeping) return;

    const foodData = {
        'chicken': { emoji: '🍗', hunger: 25, price: 35, msg: "Yummy Chicken! 🍗" },
        'salmon': { emoji: '🐟', hunger: 35, price: 40, msg: "Delicious Salmon! 🐟" },
        'cod': { emoji: '🐠', hunger: 20, price: 20, msg: "Tasty Cod Fish! 🐠" },
        'meat': { emoji: '🥩', hunger: 30, price: 50, msg: "Juicy Meat! 🥩" }
    };

    const item = foodData[type];
    if (coins < item.price) {
        showSpeech("Not enough coins! Need 🪙 " + item.price);
        return;
    }

    coins -= item.price;
    isBusy = true;
    updateUI();

    document.getElementById('item-in-bowl').innerText = item.emoji;
    document.getElementById('bowl-container').style.opacity = '1';

    playSound('eat');
    showSpeech("Nom nom nom~ " + item.emoji);

    setTimeout(() => {
        addStatsGradually({ hunger: item.hunger }, 1200);
        document.getElementById('bowl-container').style.opacity = '0';
        showSpeech(item.msg);
        isBusy = false;
        updateUI();
    }, 1000);
}

function giveDrink(type) {
    const cat = getActiveCat();
    if (isBusy || cat.isSleeping) return;

    const drinkData = {
        'water': { emoji: '💧', thirst: 30, energy: 0, price: 20, msg: "Refreshing Water! 💧" },
        'milk': { emoji: '🥛', thirst: 40, energy: 10, price: 35, msg: "Sweet Creamy Milk! 🥛" }
    };

    const item = drinkData[type];
    if (coins < item.price) {
        showSpeech("Not enough coins! Need 🪙 " + item.price);
        return;
    }

    coins -= item.price;
    isBusy = true;
    updateUI();

    document.getElementById('item-in-bowl').innerText = item.emoji;
    document.getElementById('bowl-container').style.opacity = '1';

    playSound('drink');
    showSpeech("Slurp slurp~ " + item.emoji);

    setTimeout(() => {
        const boost = { thirst: item.thirst };
        if (item.energy > 0) boost.energy = item.energy;
        addStatsGradually(boost, 1200);

        document.getElementById('bowl-container').style.opacity = '0';
        showSpeech(item.msg);
        isBusy = false;
        updateUI();
    }, 1000);
}

function playToy(toy) {
    const cat = getActiveCat();
    if (isBusy || cat.isSleeping) return;
    if (cat.energy < 15) {
        showSpeech("Too tired to play... Need sleep 😴");
        return;
    }

    isBusy = true;
    playSound('meow');

    const toyData = {
        'laser': "Chasing the red dot! 🔴",
        'yarn': "Playing with yarn ball! 🧶",
        'mouse': "Caught the toy mouse! 🐭"
    };

    showSpeech(toyData[toy]);
    addStatsGradually({ happiness: 22, energy: -10 }, 1000);

    const catWrapper = document.getElementById('cat-wrapper');
    catWrapper.classList.add('translate-x-3');
    setTimeout(() => catWrapper.classList.remove('translate-x-3'), 200);
    setTimeout(() => catWrapper.classList.add('-translate-x-3'), 400);
    setTimeout(() => {
        catWrapper.classList.remove('-translate-x-3');
        isBusy = false;
        updateUI();
    }, 600);
}

function toggleSleep() {
    const cat = getActiveCat();
    cat.isSleeping = !cat.isSleeping;

    const nightOverlay = document.getElementById('night-overlay');
    const lampGlow = document.getElementById('lamp-glow');
    const lampBulb = document.getElementById('lamp-bulb');
    const zzzContainer = document.getElementById('zzz-container');

    const sleepIcon = document.getElementById('sleep-mode-icon');
    const sleepTitle = document.getElementById('sleep-status-title');
    const sleepDesc = document.getElementById('sleep-status-desc');
    const sleepLabel = document.getElementById('sleep-btn-label');
    const sleepBtnIcon = document.getElementById('sleep-btn-icon');

    if (cat.isSleeping) {
        nightOverlay.style.opacity = '0.9';
        lampGlow.style.opacity = '1';
        lampBulb.className = 'w-2 h-2 bg-amber-300 rounded-full transition-colors duration-300';
        zzzContainer.style.opacity = '1';

        sleepIcon.innerText = "💤";
        sleepTitle.innerText = "SLEEPING PEACEFULLY";
        sleepDesc.innerText = "Room is dimmed. Energy is gradually restoring...";
        sleepLabel.innerText = "WAKE UP";
        sleepBtnIcon.className = "fa-solid fa-sun";

        showSpeech("Zzz... Good night~ 🌙");
    } else {
        syncRealTimeAndDay();
        zzzContainer.style.opacity = '0';

        sleepIcon.innerText = "😴";
        sleepTitle.innerText = "AWAKE & ACTIVE";
        sleepDesc.innerText = "Put your cat to sleep to restore Energy gradually over time!";
        sleepLabel.innerText = "PUT TO SLEEP";
        sleepBtnIcon.className = "fa-solid fa-moon";

        playSound('meow');
        showSpeech("Good morning! Meow~ ☀️");
    }

    updateUI();
}

// Coat Modal Handlers
function openCoatModal() {
    const cat = getActiveCat();
    document.getElementById('coat-modal-cat-name').innerText = cat.name;
    document.getElementById('coat-modal').classList.remove('hidden');
}

function closeCoatModal() {
    document.getElementById('coat-modal').classList.add('hidden');
}

function applyCoat(breedKey) {
    const cat = getActiveCat();
    cat.breed = breedKey;
    playSound('meow');
    showSpeech("Love my new coat style! ✨");
    closeCoatModal();
    updateUI();
}

// Rename Handlers
function openRenameModal() {
    const cat = getActiveCat();
    document.getElementById('rename-input').value = cat.name;
    document.getElementById('rename-modal').classList.remove('hidden');
}

function closeRenameModal() {
    document.getElementById('rename-modal').classList.add('hidden');
}

function saveCatName() {
    const inputVal = document.getElementById('rename-input').value.trim();
    if (inputVal.lengt
