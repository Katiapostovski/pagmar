/* =====================================================
   PAGMAR — שמיים שנפתחים
   Progressive Signal Field Reveal Engine
   ===================================================== */

// ======================================================
// GEMINI API — Real-Time Personalized Interpretation
// ======================================================
const GEMINI_API_KEY = ''; // ← הכניסי כאן את ה-API key שלך

const PAGMAR_SYSTEM_PROMPT = `אתה חלק מחוויה אינטראקטיבית בשם PAGMAR — כלי שמייצר מפת כוכבים אישית על בסיס תשובות המשתמש.
המשימה שלך: לכתוב פרשנות אישית ייחודית בעברית שמרגישה כמו ראי — לא כמו AI.

חוקים ברורים:
• דבר ישירות אל המשתמש בגוף שני. תמיד.
• אל תזכיר "כוכבים", "יקום", "אסטרולוגיה" כתירוץ לתשובות — PAGMAR לא מכחיש שהוא לא כלי אסטרולוגי, אבל הוא לא מסביר את עצמו. הוא פשוט מחזיר.
• כל אמירה חייבת להיות ספציפית לתשובה שהמשתמש נתן. אם הוא ענה "כחול" — הטקסט צריך לדבר על כחול, לא על "הצבע שבחרת".
• השתמש בשאלות פתוחות אמיתיות שגורמות לאדם לחשוב — לא שאלות רטוריות.
• אורך הפרשנות: 2-4 משפטים. תמציתי, אבל עמוק.
• הטון: חם, ישיר, לא פסיכולוגי-מדי. כמו חבר/ה חכם/ה שרואה אותך.
• אל תגיד "זה לא מפתיע ש...", "ברור ש...", "כולנו..." — דבר רק על המשתמש הספציפי.
• אם המשתמש לא ענה על שאלה — אל תזכיר את היעדרה. פשוט התמקד במה שיש.
• אל תסיים במשפטי "השראה" גנריים.`;

async function generatePersonalizedReading(answers, category, fieldKey) {
    if (!GEMINI_API_KEY) return null; // fallback to static bank

    const name = (answers.name || '').split(' ')[0] || 'המשתמש';

    // Build a concise context from answers
    const ctx = [
        answers.name    ? `שם: ${answers.name}` : null,
        answers.dob     ? `תאריך לידה: ${answers.dob}` : null,
        answers.time    ? `שעת כובד: ${answers.time}` : null,
        answers.color   ? `צבע הלך הרוח: ${answers.color}` : null,
        answers.home    ? `תחושת בית: ${answers.home}` : null,
        answers.change  ? `מוקד מחשבות: ${answers.change}` : null,
        answers.request ? `מה שמתבקש: ${answers.request}` : null,
        answers.doubt   ? `תגובה לספק: ${answers.doubt}` : null,
        answers.dream   ? `שאיפה גדולה: ${answers.dream}` : null,
        answers.unresolved ? `מחכה לבהירות: ${answers.unresolved}` : null,
        answers.pareidolia ? `ראה/ראתה בקונסטלציה: ${answers.pareidolia}` : null,
    ].filter(Boolean).join('\n');

    const userPrompt = `תשובות המשתמש:
${ctx}

כתוב פרשנות אישית בנושא: "${category}"
ההקשר הספציפי שעליו לדבר: ${fieldKey}
קרא/י למשתמש בשם: ${name}
זכור/י: 2-4 משפטים. ישיר. ספציפי. ללא קלישאות.`;

    try {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: PAGMAR_SYSTEM_PROMPT }] },
                    contents: [{ parts: [{ text: userPrompt }] }],
                    generationConfig: {
                        temperature: 0.85,
                        maxOutputTokens: 220,
                        topP: 0.9,
                    }
                })
            }
        );
        if (!res.ok) return null;
        const data = await res.json();
        return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
    } catch (e) {
        console.warn('[PAGMAR] Gemini API error:', e);
        return null;
    }
}

let currentLang = 'he';


// ======================================================
// WEBGL SHADERS
// ======================================================
const vertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform vec3 uColor;
uniform float uType;
uniform float uOpacity;
uniform float uGlow;
uniform float uState;
uniform float uZoom;
uniform float uDepth;
uniform float uHasLabel;
varying vec2 vUv;

// Vibrant rainbow spectrum
vec3 spectral(float t) {
    vec3 c = vec3(
        sin(t * 6.28318 + 0.0),
        sin(t * 6.28318 + 2.094),
        sin(t * 6.28318 + 4.189)
    ) * 0.5 + 0.5;
    return c * c * 1.5;
}

// Anamorphic blade (type 0) - long horizontal light streak
float bladeFn(vec2 p) {
    float blade = exp(-abs(p.y) * 120.0) * exp(-abs(p.x) * 1.5);
    float core  = smoothstep(0.04, 0.0, abs(p.x) + abs(p.y));
    return blade + core * 1.5;
}

// Crystal star (type 1) - 6-pointed sharp facets
float crystalFn(vec2 p) {
    float r  = length(p);
    float f1 = exp(-abs(p.x) * 60.0);
    float f2 = exp(-abs(p.x * 0.5 + p.y * 0.866) * 60.0);
    float f3 = exp(-abs(p.x * 0.5 - p.y * 0.866) * 60.0);
    vec2  ap = abs(p);
    float hex = max(ap.x * 0.866 + ap.y * 0.5, ap.y);
    return (f1 + f2 + f3) * exp(-r * 8.0) + smoothstep(0.07, 0.0, hex) * 1.2; // balanced — short visible rays
}

// Diagonal shard (type 2) - sharp X cut
float shardFn(vec2 p) {
    float r   = length(p);
    float d1  = exp(-abs(p.x + p.y) * 80.0) * exp(-r * 2.5);
    float d2  = exp(-abs(p.x - p.y) * 150.0) * exp(-r * 5.0);
    float core = smoothstep(0.04, 0.0, abs(p.x) + abs(p.y));
    return d1 + d2 * 0.6 + core * 1.5;
}

// Pointillism dot (type 3) - soft small dot with no rays
float dotFn(vec2 p) {
    float r = length(p);
    return exp(-r * 18.0) + smoothstep(0.05, 0.0, r) * 1.2; // visible glow dot
}

float getPrismIntensity(vec2 p, float type) {
    // Use mix+step instead of if-else for GLSL ES compatibility
    float isBlade   = step(type, 0.5);
    float isCrystal = step(0.5, type) * step(type, 1.5);
    float isShard   = step(1.5, type) * step(type, 2.5);
    float isDot     = step(2.5, type);
    return isBlade * bladeFn(p) + isCrystal * crystalFn(p) + isShard * shardFn(p) + isDot * dotFn(p);
}

void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    
    // Prismatic stars: white at zoom-out, subtle spectrum colors on zoom-in
    float iCore = getPrismIntensity(uv, uType);
    float twinkle = 1.0 + uGlow * sin(uTime * 1.5) * 0.12;

    // Color opens on zoom-in (uZoom > 1.1), full spectral at zoom > 1.8
    float prismGate = smoothstep(1.1, 1.8, clamp(uZoom, 0.0, 10.0));
    float angle = atan(uv.y, uv.x);
    vec3 prismCol = spectral(angle / 6.28318 + uTime * 0.03);
    // White at zoom-out, prismatic at zoom-in
    vec3 baseCol = mix(vec3(0.97, 0.97, 1.0), prismCol, prismGate * uGlow * 0.6);
    vec3 col = baseCol * iCore * 2.6 * twinkle;

    float intensity = iCore;
    float zoomFade  = clamp(uZoom * 1.4, 0.25, 1.0);
    float alpha = intensity * uOpacity * zoomFade;

    // Major star: subtle warm core pulse, only on clear zoom-in
    if (uHasLabel > 0.5) {
        float discoveryFactor = smoothstep(1.3, 2.0, clamp(uZoom, 0.0, 10.0));
        float r = length(uv);
        float pulse = sin(uTime * 2.5) * 0.5 + 0.5;
        float coreGlow = exp(-r * 60.0) * pulse;
        col += vec3(1.0, 0.95, 0.8) * coreGlow * 2.0 * discoveryFactor;
        alpha += coreGlow * 0.5 * discoveryFactor;
    }

    gl_FragColor = vec4(col, alpha);
}
`;



// ======================================================
// AMBIENT SOUND ENGINE — cosmic spatial audio (Web Audio API)
// ======================================================
const AudioEngine = {
    ctx: null,
    masterGain: null,
    isStarted: false,
    _nodes: [],  // keep refs to stop them later

    init() {
        if (this.isStarted) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0;
            this.masterGain.connect(this.ctx.destination);
            // Fade master in slowly (4 s)
            this.masterGain.gain.setTargetAtTime(0.72, this.ctx.currentTime, 4.0);
            this.isStarted = true;
        } catch(e) { console.warn('Audio not available:', e); }
    },

    // Simple delay-based reverb: comb + allpass
    _createReverb() {
        const convolver = this.ctx.createConvolver();
        const rate = this.ctx.sampleRate;
        const length = rate * 3.2;
        const impulse = this.ctx.createBuffer(2, length, rate);
        for (let c = 0; c < 2; c++) {
            const ch = impulse.getChannelData(c);
            for (let i = 0; i < length; i++) {
                ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.4);
            }
        }
        convolver.buffer = impulse;
        return convolver;
    },

    startDrone(personalHue) {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;

        // ── Reverb send ──────────────────────────────────────
        const reverb = this._createReverb();
        const reverbGain = this.ctx.createGain();
        reverbGain.gain.value = 0.38;
        reverb.connect(reverbGain);
        reverbGain.connect(this.masterGain);

        // ── Helper: create a slowly-breathing oscillator layer ──
        const addDrone = (freq, type, vol, detuneHz, breathRate, breathDepth) => {
            const osc = this.ctx.createOscillator();
            osc.type = type;
            osc.frequency.value = freq;
            // slight detune for warmth
            osc.detune.value = detuneHz;

            const g = this.ctx.createGain();
            g.gain.value = vol;

            // breathing LFO
            const lfo = this.ctx.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.value = breathRate;
            const lfoG = this.ctx.createGain();
            lfoG.gain.value = breathDepth;
            lfo.connect(lfoG);
            lfoG.connect(g.gain);

            osc.connect(g);
            g.connect(this.masterGain);
            g.connect(reverb);
            osc.start(t);
            lfo.start(t);
            this._nodes.push(osc, g, lfo, lfoG);
        };

        // Deep cosmic pad — A2 / A3 / E3 / C#3 harmonic cluster
        const base = 55;  // A1 — very deep
        addDrone(base,        'sine',     0.28, -4,   0.038, 0.08);
        addDrone(base * 2,    'sine',     0.18,  7,   0.025, 0.06);  // octave
        addDrone(base * 3,    'sine',     0.10,  12,  0.019, 0.05);  // fifth
        addDrone(base * 4,    'triangle', 0.07, -9,   0.031, 0.04);  // octave
        addDrone(base * 5,    'sine',     0.045, 5,   0.014, 0.03);  // major third

        // ── Dark space noise — filtered & slowly morphing ────
        const bufLen = this.ctx.sampleRate * 4;
        const noiseBuf = this.ctx.createBuffer(2, bufLen, this.ctx.sampleRate);
        for (let c = 0; c < 2; c++) {
            const d = noiseBuf.getChannelData(c);
            // Pink-ish noise (1/f approximation via Voss algorithm)
            let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0;
            for (let i = 0; i < bufLen; i++) {
                const w = Math.random() * 2 - 1;
                b0 = 0.99886*b0 + w*0.0555179; b1 = 0.99332*b1 + w*0.0750759;
                b2 = 0.96900*b2 + w*0.1538520; b3 = 0.86650*b3 + w*0.3104856;
                b4 = 0.55000*b4 + w*0.5329522; b5 = -0.7616*b5 - w*0.0168980;
                d[i] = (b0+b1+b2+b3+b4+b5 + w*0.5362) * 0.12;
            }
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuf;
        noise.loop = true;

        const noiseLPF = this.ctx.createBiquadFilter();
        noiseLPF.type = 'lowpass';
        noiseLPF.frequency.value = 320;
        noiseLPF.Q.value = 0.9;

        // LFO slowly sweeps the cutoff
        const nLFO = this.ctx.createOscillator();
        nLFO.type = 'sine';
        nLFO.frequency.value = 0.022;   // ~45 s cycle
        const nLFOG = this.ctx.createGain();
        nLFOG.gain.value = 180;
        nLFO.connect(nLFOG);
        nLFOG.connect(noiseLPF.frequency);

        const noiseG = this.ctx.createGain();
        noiseG.gain.value = 0.09;
        noise.connect(noiseLPF);
        noiseLPF.connect(noiseG);
        noiseG.connect(this.masterGain);
        noiseG.connect(reverb);

        noise.start(t);
        nLFO.start(t);
        this._nodes.push(noise, noiseLPF, nLFO, nLFOG, noiseG);

        // ── Soft warm upper harmonics (replacing harsh crystal shimmer) ──────
        // Low, smooth sine waves that breathe gently — more like starlight than glass
        const addWarmPad = (freq, period, vol) => {
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            // Very gentle detune oscillation
            const detuneOsc = this.ctx.createOscillator();
            detuneOsc.type = 'sine';
            detuneOsc.frequency.value = 0.07;
            const detuneG = this.ctx.createGain();
            detuneG.gain.value = 3.5;
            detuneOsc.connect(detuneG);
            detuneG.connect(osc.detune);
            const g = this.ctx.createGain();
            g.gain.value = 0;
            const lfo = this.ctx.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.value = 1 / period;
            const lg = this.ctx.createGain();
            lg.gain.value = vol;
            lfo.connect(lg);
            lg.connect(g.gain);
            osc.connect(g);
            g.connect(reverb);
            osc.start(t);
            lfo.start(t + period * Math.random());
            detuneOsc.start(t);
            this._nodes.push(osc, g, lfo, lg, detuneOsc, detuneG);
        };
        addWarmPad(880,  28, 0.008);   // A5 — warm high tone, very quiet
        addWarmPad(1100, 38, 0.005);   // C#6 — soft harmonic
        addWarmPad(660,  21, 0.006);   // E5 — gentle midrange
    },

    startAtmosphere() {
        // Atmosphere baked into startDrone
    },

    playDiscoveryChime(hue) {
        if (!this.ctx) return;
        if (window.skyRevealState !== 'revealed') return; // silence during recognition
        const t = this.ctx.currentTime;
        // Map hue to a pentatonic note — lower octave (×2 not ×4), much gentler
        const notes = [261.63, 293.66, 349.23, 392.00, 440.00, 523.25, 587.33];
        const freq = notes[Math.floor((hue / 360) * notes.length)] * 2; // octave lower

        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;

        // Very soft reverb send
        const rev = this._createReverb();
        const revG = this.ctx.createGain();
        revG.gain.value = 0.45;
        rev.connect(revG);
        revG.connect(this.masterGain);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.0, t);
        gain.gain.linearRampToValueAtTime(0.035, t + 0.025); // softer + slower attack
        gain.gain.exponentialRampToValueAtTime(0.001, t + 2.8); // longer, gentler decay

        osc.connect(gain);
        gain.connect(this.masterGain);
        gain.connect(rev);
        osc.start(t);
        osc.stop(t + 3.0);
    },

    updateMovement(velocity) {
        if (!this.atmoFilter || !this.ctx) return;
        const targetFreq = 400 + Math.min(velocity, 50) * 30;
        this.atmoFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.3);
    },

    fadeOut() {
        if (!this.masterGain || !this.ctx) return;
        this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 1.5);
    },

    isMuted: false,
    _savedGain: 0.25,

    updateZoom(scale) {
        if (!this.ctx || !this.droneGain) return;
        const t = this.ctx.currentTime;
        const zoomNorm = Math.min(Math.max((scale - 0.3) / 3.0, 0), 1);
        if (!this.isMuted) {
            // Clearly audible gain rise with zoom: 0.7 at far → 1.2 at close
            const targetGain = 0.7 + zoomNorm * 0.5;
            this.masterGain.gain.setTargetAtTime(targetGain, t, 0.6);
        }
        if (this.atmoFilter) {
            // Filter sweeps from low rumble to bright shimmer
            const targetFreq = 150 + zoomNorm * 3000;
            this.atmoFilter.frequency.setTargetAtTime(targetFreq, t, 0.4);
            // Also raise atmo gain with zoom
            if (this.atmoGain) {
                this.atmoGain.gain.setTargetAtTime(0.07 + zoomNorm * 0.15, t, 0.4);
            }
        }
        // Zoom shimmer removed — harsh triangle wave replaced by filter sweep only
        // (the LPF sweep on the noise pad already provides a sense of "opening up" on zoom)
    },

    toggleMute() {
        if (!this.masterGain || !this.ctx) return;
        if (this.isMuted) {
            this.masterGain.gain.setTargetAtTime(this._savedGain, this.ctx.currentTime, 0.3);
            this.isMuted = false;
        } else {
            this._savedGain = this.masterGain.gain.value || 0.25;
            this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
            this.isMuted = true;
        }
        return this.isMuted;
    }
};

// ======================================================
// DATA — i18n DICTIONARIES
// ======================================================
const UI_TEXTS = {
    he: {
        title: 'איך שהכוכבים מסתדרים לך',
        subtitle: '',
        tagline: '',
        startBtn: 'התחלה',
        stepOf: 'מתוך',
        btnNext: 'המשך ←',
        skyGuide: 'גרור לנוע · הצורה תתגלה · אל תחפשי הסבר',
        leaveBtn: 'המשך',
        restartBtn: 'מחדש',
        horizonTitle: 'מפת האופק שלך',
        pareidoliaPrompt: 'מה את רואה?',
        pareidoliaPlaceholder: '...',
        pareidoliaOpts: ['חיה', 'בית', 'צמח', 'כנף', 'מסלול', 'דמות', 'כלי', 'משהו אחר']
    },
    en: {
        title: 'The stars don\'t know you',
        subtitle: '',
        tagline: '',
        startBtn: 'Enter',
        stepOf: 'of',
        btnNext: 'Continue →',
        skyGuide: 'Drag to move · The shape will appear · Don\'t look for an explanation',
        leaveBtn: 'Continue',
        restartBtn: 'Start Over',
        horizonTitle: 'Your Horizon Map',
        pareidoliaPrompt: 'What do you see?',
        pareidoliaPlaceholder: '...',
        pareidoliaOpts: ['Animal', 'Home', 'Plant', 'Wing', 'Path', 'Figure', 'Vessel', 'Something else']
    }
};

const QUESTIONS = [
    {
        id: 'name', type: 'text',
        he: { placeholder: '', text: 'מה שמך?', sub: '' },
        en: { placeholder: '', text: 'What is your name in the map?', sub: '' }
    },
    {
        id: 'dob', type: 'date',
        he: { text: 'מתי התחיל הזמן שלך?', sub: '' },
        en: { text: 'When did your time begin?', sub: '' }
    },
    {
        id: 'time', type: 'choice',
        he: { text: 'איזה זמן ביום הכי מחובר אצלך לתחושה של כובד?', sub: '', options: ['בוקר', 'צהריים', 'אחר הצהריים', 'ערב', 'לילה', 'השעות הקטנות'] },
        en: { text: 'What time of day is most connected to a feeling of heaviness for you?', sub: '', options: ['Morning', 'Noon', 'Afternoon', 'Evening', 'Night', 'The small hours'] }
    },
    {
        id: 'color', type: 'choice',
        he: { text: 'איזה צבע מאפיין את הלך הרוח שלך בימים האחרונים?', sub: '', options: ['אפור', 'אדום', 'כחול', 'שחור', 'ירוק', 'סגול', 'כתום', 'לבן'] },
        en: { text: 'What color characterizes your mood in recent days?', sub: '', options: ['Grey', 'Red', 'Blue', 'Black', 'Green', 'Purple', 'Orange', 'White'] }
    },
    {
        id: 'home', type: 'choice',
        he: { text: 'איפה את/ה מרגיש/ה בית?', sub: '', options: ['בעיר שלי', 'בחדר שלי', 'ליד אדם מסוים', 'בטבע', 'בזיכרון', 'במקום שלא קיים יותר', 'עדיין מחפש/ת'] },
        en: { text: 'Where do you feel at home?', sub: '', options: ['In my city', 'In my room', 'Near a certain person', 'In nature', 'In a memory', 'In a place that no longer exists', 'Still searching'] }
    },
    {
        id: 'change', type: 'choice',
        he: { text: 'רוב המחשבות שלי כרגע מתעסקות ב –', sub: '', options: ['החלטה שדוחה אותי', 'שינוי שמתקרב', 'מערכת יחסים', 'המקום שלי בעולם', 'משהו שצריך לשחרר', 'דבר שאני נמנע/ת ממנו', 'תחושה שלא עוברת', 'אני עוד לא יודע/ת לקרוא לזה בשם'] },
        en: { text: 'Most of my thoughts right now are occupied with –', sub: '', options: ['A decision I keep postponing', 'A change that is approaching', 'A relationship', 'My place in the world', 'Something I need to let go', 'Something I keep avoiding', 'A feeling that won\'t pass', 'I don\'t know how to name it yet'] }
    },
    {
        id: 'request', type: 'choice',
        he: { text: 'אני זקוק/ה ל –', sub: '', options: ['כיוון', 'אומץ', 'שקט', 'אישור', 'התחלה', 'שחרור', 'בהירות', 'סימן קטן'] },
        en: { text: 'I need –', sub: '', options: ['Direction', 'Courage', 'Quiet', 'Confirmation', 'A beginning', 'Release', 'Clarity', 'A small sign'] }
    },
    {
        id: 'doubt', type: 'choice',
        he: { text: 'כשאני מתלבט/ת, אני נוטה ל –', sub: '', options: ['לשתוק', 'לברוח', 'לחכות', 'לשאול מישהו', 'לפעול מהר', 'להתעלם', 'לבכות', 'להתכנס פנימה'] },
        en: { text: 'When I\'m uncertain, I tend to –', sub: '', options: ['Go silent', 'Run away', 'Wait', 'Ask someone', 'Act fast', 'Ignore it', 'Cry', 'Turn inward'] }
    },
    {
        id: 'dream', type: 'choice',
        he: { text: 'מה הדבר שאין לך עדיין ואת/ה הכי שואפ/ת אליו?', sub: '', options: ['שקט פנימי', 'אהבה', 'חופש', 'הצלחה', 'בית', 'יצירה', 'בריאות', 'משמעות', 'אני עוד לא יודע/ת לתת לזה שם'] },
        en: { text: 'What is the one thing you don\'t yet have that you aspire to most?', sub: '', options: ['Inner peace', 'Love', 'Freedom', 'Success', 'Home', 'Creation', 'Health', 'Meaning', 'I don\'t know how to name it yet'] }
    },
    {
        id: 'unresolved', type: 'choice', optional: true,
        he: { text: 'אני רוצה בהירות לגבי –', sub: '', options: ['מערכות יחסים', 'הקריירה שלי', 'מי אני', 'לאן אני הולך/ת', 'מה שהיה', 'מה שיהיה', 'הכול'] },
        en: { text: 'I want clarity about –', sub: '', options: ['Relationships', 'My career', 'Who I am', 'Where I\'m going', 'The past', 'The future', 'Everything'] }
    }
];

function hashText(str) {
    if (!str || str.trim() === '') return 0.5; // default center
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    // Normalize to 0.0 - 1.0 range
    const normalized = Math.abs(hash) / 2147483647; 
    return normalized;
}

const TEXT_BANKS = {
    he: {
        'עקבות':   ['לא הכול נפתח מיד', 'האזור הזה היה מוסתר', 'יש דברים שנשארים בחושך'],
        'הרגשה':   ['האור נשבר לפני שהוא התבהר', 'משהו כאן קיבל צורה', 'התחושה מופיעה אחרי שהייה'],
        'כיוון':   ['יש כאן כיוון, לא תשובה', 'הנתיב מתארך כשמתקרבים', 'הקו הופיע אחרי חזרה'],
        'שאלה':    ['עכשיו זה מתחיל להתחבר', 'כאן נוצר מוקד', 'החיבור לא היה גלוי בהתחלה']
    },
    en: {
        'A trace':     ['Not everything opens immediately', 'This area was hidden', 'Some things remain in the dark'],
        'A feeling':   ['The light refracted before it cleared', 'Something took shape here', 'The feeling appears after dwelling'],
        'A direction': ['There is a direction here, not an answer', 'The path extends when approaching', 'The line appeared after returning'],
        'A question':  ['Now it starts to connect', 'A focal point was created here', 'The connection was not visible at first']
    }
};

const DEFAULT_TEXTS = {
    he: ['עכשיו זה מתחיל להתחבר', 'האזור הזה היה מוסתר', 'משהו כאן קיבל צורה'],
    en: ['Now it starts to connect', 'This area was hidden', 'Something took shape here']
};

// ======================================================
// HELPERS
// ======================================================
function calcGematria(str) {
    const g = {'א':1,'ב':2,'ג':3,'ד':4,'ה':5,'ו':6,'ז':7,'ח':8,'ט':9,
        'י':10,'כ':20,'ל':30,'מ':40,'נ':50,'ס':60,'ע':70,'פ':80,'צ':90,
        'ק':100,'ר':200,'ש':300,'ת':400,'ך':20,'ם':40,'ן':50,'ף':80,'ץ':90,
        'a':1,'b':2,'c':3,'d':4,'e':5,'f':6,'g':7,'h':8,'i':9,'j':1,'k':2,'l':3,
        'm':4,'n':5,'o':6,'p':7,'q':8,'r':9,'s':1,'t':2,'u':3,'v':4,'w':5,'x':6,'y':7,'z':8};
    let s = 0;
    for (const c of str.toLowerCase()) if (g[c]) s += g[c];
    while (s > 9) s = ('' + s).split('').reduce((a, b) => +a + +b, 0);
    return s || 5;
}

function getSeasonFromDate(d) {
    if (!d) return 'Winter';
    const m = new Date(d).getMonth() + 1;
    if (m >= 3 && m <= 5) return 'Spring';
    if (m >= 6 && m <= 8) return 'Summer';
    if (m >= 9 && m <= 11) return 'Autumn';
    return 'Winter';
}

function hashStr(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    return h;
}

function seededRand(seed) {
    let s = (Math.abs(seed) % 2147483647) || 123456789;
    return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

function lerp(a, b, t) { return a + (b - a) * Math.max(0, Math.min(1, t)); }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function smoothstep(edge0, edge1, x) { const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0))); return t * t * (3 - 2 * t); }

// ======================================================
// BRANCH GENERATION
// ======================================================
function generateBranches(initialAngle, rand, spreadFactor) {
    const segs = [];
    const sf = spreadFactor || 0.3;

    function grow(x, y, ang, len, depth, pStart, pRange) {
        if (depth <= 0 || len < 1.5 || pRange < 0.001) return;
        const selfPortion = 0.3 + rand() * 0.2;
        const pEnd = pStart + pRange * selfPortion;
        const ex = x + Math.cos(ang) * len;
        const ey = y + Math.sin(ang) * len;
        segs.push({ x1: x, y1: y, x2: ex, y2: ey, depth, pStart, pEnd });

        const rem = pRange * (1 - selfPortion);
        const spread = sf + rand() * sf;
        const leftLen  = len * (0.52 + rand() * 0.18);
        const rightLen = len * (0.55 + rand() * 0.15);

        if (rand() > 0.2 && depth > 1)
            grow(ex, ey, ang - spread,        leftLen,  depth - 1, pEnd, rem * (0.46 + rand() * 0.1));
        if (rand() > 0.15 && depth > 1)
            grow(ex, ey, ang + spread * 0.8,  rightLen, depth - 1, pEnd, rem * (0.42 + rand() * 0.1));
        if (rand() > 0.6 && depth > 2)
            grow(ex, ey, ang + (rand() - 0.5) * 0.2, len * 0.4, depth - 2, pEnd + rem * 0.4, rem * 0.3);
    }

    grow(0, 0, initialAngle, 44 + rand() * 20, 5, 0, 1);
    return segs;
}

// ======================================================
// STATE
// ======================================================
let qIndex = 0;
let answers = {};
let vp = {};

let canvas, ctx, W, H;
let renderer, scene, threeCam;
let skyMeshes = [];
// Global 3D rotation
let globalRotX = 0, globalRotY = 0;
let targetGlobalRotX = 0, targetGlobalRotY = 0;

let webglLines;
let webglLineGeo;

let cam = { x: 0, y: 0, scale: 0.55 };
let targetCam = { x: 0, y: 0, scale: 0.55 };
let skyMapDataUrl = null;
let isDragging = false;
let lastMouse = { x: 0, y: 0 };
let skyPoints = [];
let majorPoints = [];
let skyRunning = false;
let lastTS = 0;
let skyIntroTime = 0;
let lastCamX = null;
let lastCamY = null;
let globalMouse = { x: 0, y: 0 };
let lastAnswerPos = null;

// ======================================================
// COORDINATE CONVERSION
// ======================================================
function w2s(wx, wy) {
    return { x: W * 0.5 + (wx - cam.x) * cam.scale, y: H * 0.5 + (wy - cam.y) * cam.scale };
}

function rotate3D(x, y, z, rotX, rotY) {
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);

    // Rotate around Y
    let rx = x * cosY - z * sinY;
    let rz = x * sinY + z * cosY;
    // Rotate around X
    let ry = y * cosX - rz * sinX;
    rz = y * sinX + rz * cosX;
    
    return { x: rx, y: ry, z: rz };
}

function s2w_ghost(sx, sy) {
    const wx = (sx - W * 0.5) / cam.scale + cam.x;
    const wy = (sy - H * 0.5) / cam.scale + cam.y;
    // Inverse rotate
    return rotate3D(wx, wy, 0, -globalRotX, -globalRotY); // Note: technically order matters for inverse but for small angles it's close enough, let's do precise inverse:
}

// Precise inverse rotation
function unrotate3D(x, y, z, rotX, rotY) {
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    
    // Inverse X
    let rz = z * cosX - y * sinX;
    let ry = y * cosX + z * sinX;
    // Inverse Y
    let rx = x * cosY + rz * sinY;
    rz = rz * cosY - x * sinY;
    
    return { x: rx, y: ry, z: rz };
}

function s2w_unrotated(sx, sy) {
    const wx = (sx - W * 0.5) / cam.scale + cam.x;
    const wy = (sy - H * 0.5) / cam.scale + cam.y;
    return unrotate3D(wx, wy, 0, globalRotX, globalRotY);
}

function showGhostPopup(ghost) {
    const overlay = document.getElementById('sky-data-overlay') || (() => {
        const o = document.createElement('div');
        o.id = 'sky-data-overlay';
        o.style.cssText = 'position:absolute; inset:0; pointer-events:none; z-index:10; overflow:hidden;';
        document.body.appendChild(o);
        return o;
    })();
    
    let popup = document.getElementById('ghost-popup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'ghost-popup';
        popup.className = 'sky-dlabel expanded';
        popup.style.cssText = `
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) scale(1.5) !important;
            z-index: 2000;
            background: rgba(0,0,0,0.85);
            backdrop-filter: blur(8px);
            box-shadow: 0 0 0 200vw rgba(0,0,0,0.75) !important;
            pointer-events: auto;
            border: 1px solid rgba(255,255,255,0.35);
            border-radius: 0px;
            padding: 20px;
            font-family: "SimplerMono", "Courier New", monospace;
            color: rgba(255,255,255,0.85);
            text-align: center;
            direction: rtl;
        `;
        overlay.appendChild(popup);
    }
    
    const isHeLocal = currentLang === 'he';
    const ghostName = isHeLocal ? ghost.nameHe : ghost.nameEn;
    const ghostText = ghost.text || (isHeLocal ? 'קונסטלציה שנוצרה על ידי חוקר אחר בחלל הכללי.' : 'A constellation created by another explorer in the space.');
    
    popup.innerHTML = `
        <h2 style="margin:0 0 15px 0; font-size:1.5rem; letter-spacing:0.1em; color:rgba(255,255,255,0.9);">${ghostName}</h2>
        <p style="margin:0 0 20px 0; font-size:0.9rem; line-height:1.4;">${ghostText}</p>
        <button id="ghost-popup-close" style="
            background: transparent;
            border: 1px solid rgba(255,255,255,0.5);
            color: rgba(255,255,255,0.8);
            padding: 6px 16px;
            font-family: 'SimplerMono', 'Courier New', monospace;
            cursor: pointer;
            transition: all 0.3s ease;
        ">${isHeLocal ? 'סגירה' : 'Close'}</button>
    `;
    
    popup.style.display = 'block';
    document.getElementById('ghost-popup-close').onclick = () => {
        popup.style.display = 'none';
    };
}

// ======================================================
// DOM SETUP
// ======================================================
const appDiv = document.getElementById('app');

function buildDOM() {
    appDiv.innerHTML = `
    <!-- GLOBAL UI -->
    <button id="lang-toggle" class="btn" onclick="toggleLang()" style="position: absolute; top: 1.6rem; left: 1.6rem; z-index: 100; padding: 0.4rem 0.9rem; font-size: 0.72rem; letter-spacing: 0.18em; opacity: 0.6; transition: opacity 0.3s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.6'">EN</button>
    <button id="btn-global-back" class="btn" onclick="goBack()" style="position: absolute; top: 2rem; right: 2rem; z-index: 100; padding: 0.5rem 1rem; border: none; font-size: 0.75rem; letter-spacing: 0.12em; opacity: 0; display: none; pointer-events: none;"></button>
    <div id="screen-opening" class="screen active">
        <h1 id="ui-title" style="min-height:1.5em;"></h1>
        <button class="btn" id="btn-start" style="opacity: 0; pointer-events: none;">התחלה</button>
    </div>

    <div id="screen-questionnaire" class="screen">
        <svg id="q-svg"></svg>
        <div id="q-inner" style="z-index: 5; pointer-events: none;">
            <div class="q-step" id="q-step" style="pointer-events: auto;"></div>
            <div class="q-progress" style="pointer-events: auto;"><div class="q-progress-fill" id="q-fill"></div></div>
            <h2 id="q-text" style="pointer-events: auto;"></h2>
            <p  id="q-sub" style="pointer-events: auto;"></p>
            <div id="q-input-area" style="pointer-events: auto;"></div>
        </div>
        <div class="q-options" id="q-options"></div>
    </div>

    <div id="screen-intro" class="screen" style="display: flex; justify-content: center; align-items: center; flex-direction: column;">
        <h1 id="intro-title" style="font-family: var(--font-mono); font-weight: 300; font-size: clamp(1.5rem, 3vw, 3rem); letter-spacing: 0.05em; opacity: 0; transition: opacity 2s ease; text-align: center;"></h1>
    </div>


    <div id="global-cursor"></div>
    <div id="screen-sky" class="screen">
        <canvas id="sky-canvas"></canvas>
        <svg id="sky-lineart-svg" style="position: absolute; inset: 0; width: 100%; height: 100%; z-index: 2; pointer-events: none;"></svg>
        <div id="sky-labels"></div>
        <div id="deep-text-modal" class="hidden">
            <p id="deep-text-content"></p>
        </div>
        <div id="floating-texts-container" style="position: absolute; right: 5%; top: 20%; width: 300px; display: flex; flex-direction: column; gap: 40px; z-index: 10; pointer-events: none;"></div>
        
        <!-- RECOGNITION OVERLAY: "what do you see?" over the skeleton -->
        <div id="recognition-overlay" style="position: absolute; bottom: 12vh; left: 0; right: 0; z-index: 100; text-align: center; padding: 0 2rem; pointer-events: none; display: none; flex-direction: column; align-items: center;">
            <h2 id="recog-question" style="font-family: var(--font-serif); font-weight: 300; font-size: clamp(1.4rem, 2.8vw, 2rem); margin-bottom: 1.5rem; letter-spacing: 0.08em; opacity: 0; transition: opacity 2s ease;"></h2>
            <div id="recog-input-wrap" class="q-input-wrap" style="position: static; transform: none; opacity: 0; transition: opacity 1.5s ease 0.8s; pointer-events: auto;">
                <input id="recog-input" type="text" class="q-input" style="max-width: 360px;" dir="rtl">
                <button id="recog-submit" class="btn"></button>
            </div>
        </div>
        <button id="btn-sound-toggle" onclick="toggleSound()" class="btn" style="position: absolute; top: 1.6rem; left: calc(1.6rem + 68px); z-index: 200; padding: 0.4rem 0.9rem; font-size: 0.72rem; letter-spacing: 0.18em; opacity: 0.6; transition: opacity 0.3s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.6'" title="Sound on/off">♪</button>

        <!-- Sky UI (hint text at the bottom) -->
        <div class="sky-ui">
            <p id="ui-skyguide"></p>
            <div class="zoom-controls">
                <button class="btn btn-icon" id="btn-zoom-in">+</button>
                <button class="btn btn-icon" id="btn-zoom-out">-</button>
            </div>
            <div style="display: flex; gap: 15px; width: 100%; max-width: 500px; justify-content: center;">
            </div>
        </div>

<!-- sky-cursor moved to global -->

        <!-- ══ ZOOM DEPTH INDICATOR ══ -->
        <div id="zoom-depth-bar" style="
            position: absolute;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            z-index: 100;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.5s ease;
        ">
            <span style="
                font-family: 'SimplerMono', 'Courier New', monospace;
                font-size: 9px;
                color: rgba(255,255,255,0.35);
                letter-spacing: 0.15em;
                text-transform: uppercase;
                writing-mode: vertical-rl;
                transform: rotate(180deg);
                margin-bottom: 4px;
            ">ZOOM</span>
            <div id="zoom-track" style="
                width: 1px;
                height: 140px;
                background: rgba(255,255,255,0.1);
                position: relative;
                border-radius: 1px;
            ">
                <div id="zoom-thumb" style="
                    position: absolute;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 5px;
                    height: 5px;
                    background: rgba(255,255,255,0.7);
                    border-radius: 50%;
                    box-shadow: 0 0 6px rgba(255,255,255,0.5);
                    transition: top 0.15s ease;
                    top: 50%;
                "></div>
                <!-- tick marks -->
                <div style="position:absolute; left:-6px; top:0; width:5px; height:1px; background:rgba(255,255,255,0.2);"></div>
                <div style="position:absolute; left:-4px; top:25%; width:3px; height:1px; background:rgba(255,255,255,0.15);"></div>
                <div style="position:absolute; left:-6px; top:50%; width:5px; height:1px; background:rgba(255,255,255,0.25);"></div>
                <div style="position:absolute; left:-4px; top:75%; width:3px; height:1px; background:rgba(255,255,255,0.15);"></div>
                <div style="position:absolute; left:-6px; top:100%; width:5px; height:1px; background:rgba(255,255,255,0.2);"></div>
            </div>
            <span id="zoom-label" style="
                font-family: 'SimplerMono', 'Courier New', monospace;
                font-size: 8px;
                color: rgba(255,255,255,0.3);
                letter-spacing: 0.1em;
                margin-top: 4px;
            ">—</span>
        </div>

        <!-- ══ CONSTELLATION INFO MODAL ══ -->
        <div id="constellation-info-modal" class="hidden">
            <div class="legend-close" onclick="closeConstellationInfo()">✕</div>
            <h3 id="constellation-info-title"></h3>
            <p id="constellation-info-text"></p>
        </div>

        <!-- ══ PAREIDOLIA OVERLAY — appears over the sky after constellation forms ══ -->
        <div id="sky-pareidolia-overlay" style="
            display: none;
            position: absolute; inset: 0;
            background: radial-gradient(ellipse at center, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.75) 100%);
            z-index: 50;
            justify-content: flex-end;
            align-items: center;
            flex-direction: column;
            padding-bottom: 35vh;
        ">
            <div id="sky-pareidolia-inner" style="
                max-width: 480px; width: 90%;
                text-align: center;
                opacity: 0;
                transform: translateY(24px);
                transition: opacity 1.8s ease, transform 1.8s ease;
            ">
                <h2 id="sky-pareidolia-title" style="
                    font-family: var(--font-serif);
                    font-size: clamp(1.4rem, 2.8vw, 2rem);
                    font-weight: 300;
                    margin-bottom: 12px;
                    line-height: 1.3;
                    text-shadow: 0 0 40px rgba(0,0,0,1);
                "></h2>
                <p id="sky-pareidolia-helper" style="
                    font-family: var(--font-mono);
                    font-size: 0.88rem;
                    opacity: 0.5;
                    margin-bottom: 36px;
                    line-height: 1.8;
                    letter-spacing: 0.04em;
                    text-shadow: 0 0 20px rgba(0,0,0,1);
                "></p>
                <textarea id="sky-pareidolia-input" rows="2" style="
                    width: 100%;
                    background: transparent;
                    border: none;
                    border-bottom: 1px solid rgba(255,255,255,0.3);
                    color: #fff;
                    font-family: var(--font-serif);
                    font-size: 1.35rem;
                    font-weight: 300;
                    text-align: center;
                    resize: none;
                    outline: none;
                    padding: 10px 0;
                    letter-spacing: 0.02em;
                    line-height: 1.6;
                    margin-bottom: 56px;
                    text-shadow: 0 0 20px rgba(0,0,0,1);
                "></textarea>
                <button class="btn" id="btn-sky-pareidolia-next"></button>
            </div>
        </div>

    </div>

    <div id="screen-pareidolia" class="screen" style="display: none; justify-content: center; align-items: center; flex-direction: column;">
        <div id="pareidolia-content" style="max-width: 560px; width: 100%; text-align: center; z-index: 100; padding: 0 2rem;">
            <h2 id="pareidolia-title" style="font-family: var(--font-serif); font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 300; margin-bottom: 16px; text-shadow: 0 4px 20px rgba(0,0,0,0.8); line-height: 1.3;"></h2>
            <p id="pareidolia-helper" style="font-family: var(--font-mono); font-size: 0.88rem; letter-spacing: 0.04em; opacity: 0.55; margin-bottom: 48px; line-height: 1.8;"></p>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
                <textarea id="pareidolia-input" rows="3" style="width: 100%; max-width: 420px; background: transparent; border: none; border-bottom: 1px solid rgba(255,255,255,0.25); color: #fff; font-family: var(--font-serif); font-size: 1.4rem; font-weight: 300; text-align: center; resize: none; outline: none; padding: 12px 0; letter-spacing: 0.02em; line-height: 1.6;"></textarea>
                <button class="btn" id="btn-pareidolia-next" style="margin-top: 8px;"></button>
            </div>
        </div>
    </div>

    <div id="screen-horizon" class="screen" style="overflow-y: auto; justify-content: flex-start; align-items: center; padding: 0;">
        <canvas id="horizon-canvas" style="display:none;"></canvas>

        <div id="horizon-veil" style="position: absolute; inset: 0; background: radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.88) 100%); pointer-events: none;"></div>

        <div id="horizon-content" style="display: none; position: relative; z-index: 10; width: 100%; max-width: 620px; padding: 80px 2.5rem 140px; text-align: center;">

            <div id="ui-horizontitle" style="font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.22em; text-transform: uppercase; opacity: 0.4; margin-bottom: 56px;"></div>

            <div id="horizon-observation-block" style="margin-bottom: 60px;">
                <div id="horizon-obs-label" style="font-family: var(--font-mono); font-size: 0.75rem; opacity: 0.38; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 16px;"></div>
                <div id="horizon-symbol" style="font-family: var(--font-serif); font-size: clamp(1.4rem, 3.5vw, 2rem); font-weight: 300; line-height: 1.4; color: rgba(255,255,255,0.9);"></div>
            </div>

            <p id="horizon-desc" style="font-family: var(--font-mono); font-size: clamp(0.85rem, 1.8vw, 1rem); line-height: 2.1; color: rgba(200,200,220,0.62); margin-bottom: 60px; text-align: center;"></p>

            <div id="horizon-dream-row" style="display:none; border-top: 1px solid rgba(255,255,255,0.07); padding-top: 32px; text-align: right; margin-bottom: 48px;">
                <div id="horizon-dream-label" style="font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.18em; text-transform: uppercase; opacity: 0.3; margin-bottom: 10px;"></div>
                <div id="horizon-dream" style="font-family: var(--font-mono); font-size: 0.9rem; opacity: 0.65; line-height: 1.8; letter-spacing: 0.03em;"></div>
            </div>

            <div id="horizon-final-sentence" style="font-family: var(--font-mono); font-size: clamp(0.78rem, 1.5vw, 0.92rem); opacity: 0.38; letter-spacing: 0.05em; line-height: 2;"></div>
        </div>

    </div>`;



    document.getElementById('btn-start').onclick = startQuestionnaire;
    const leaveEl = document.getElementById('btn-leave');
    if (leaveEl) leaveEl.onclick = () => {
        if (answers.pareidolia) showInterpretationPanel(answers.pareidolia);
    };
    const restartEl = document.getElementById('btn-restart');
    if (restartEl) restartEl.onclick = () => {
        window.location.reload();
    };
}


// Removed window.animateTitle to ensure text is always visible without complex DOM injection
// Helper function: shortest distance from point (px,py) to line segment (x1,y1)-(x2,y2)
function distToSegment(px, py, x1, y1, x2, y2) {
    const l2 = Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
    if (l2 == 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}

window.animateTitle = function(text, el) {
    if (!el) return;
    el.innerHTML = '';
    const words = text.split(' ');
    let delay = 0.3;
    words.forEach((word, wi) => {
        if (wi > 0) {
            const sp = document.createElement('span');
            sp.style.cssText = 'display:inline-block; width:0.35em;';
            el.appendChild(sp);
        }
        const wordSpan = document.createElement('span');
        wordSpan.style.cssText = 'display:inline-block; white-space:nowrap;';
        [...word].forEach((char) => {
            const charSpan = document.createElement('span');
            charSpan.innerText = char;
            const dx = ((Math.random() - 0.5) * 160).toFixed(0);
            const dy = ((Math.random() - 0.5) * 100).toFixed(0);
            charSpan.style.setProperty('--dx', `${dx}px`);
            charSpan.style.setProperty('--dy', `${dy}px`);
            charSpan.style.display = 'inline-block';
            charSpan.style.opacity = '0';
            charSpan.style.animation = `charSettle 2.2s cubic-bezier(0.16, 1, 0.3, 1) ${delay.toFixed(2)}s forwards`;
            delay += 0.09 + Math.random() * 0.07;
            wordSpan.appendChild(charSpan);
        });
        el.appendChild(wordSpan);
        delay += 0.18;
    });
    // Total time = last char delay + animation duration (2.2s)
    var totalMs = Math.max(300, (delay + 2.2) * 1000 - 700); // 700ms sooner
    setTimeout(function() {
        window.dispatchEvent(new CustomEvent('titleAnimDone'));
    }, totalMs);
};

window.toggleLang = function() {
    updateLang(currentLang === 'he' ? 'en' : 'he');
};

window.updateLang = function(lang) {
    currentLang = lang;
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    
    // Update UI Texts
    const t = UI_TEXTS[lang];
    const elTitle = document.getElementById('ui-title');
    if (elTitle) {
        window.animateTitle(t.title, elTitle);
    }
    const elBtn = document.getElementById('btn-start');
    if (elBtn) {
        elBtn.innerText = t.startBtn;
        elBtn.style.opacity = '0';
        elBtn.style.animation = 'none';
        elBtn.style.pointerEvents = 'none';
        // Show button only after title animation finishes
        var onTitleDone = function() {
            window.removeEventListener('titleAnimDone', onTitleDone);
            elBtn.style.animation = 'fadeIn 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) 0.1s forwards';
            elBtn.style.pointerEvents = 'auto';
        };
        window.addEventListener('titleAnimDone', onTitleDone);
    }
    
    const skyGuide = document.getElementById('ui-skyguide');
    if (skyGuide) skyGuide.innerText = t.skyGuide;
    const leaveBtn = document.getElementById('btn-leave');
    if (leaveBtn) leaveBtn.innerText = t.leaveBtn;
    const restartBtn = document.getElementById('btn-restart');
    if (restartBtn) restartBtn.innerText = t.restartBtn || 'Start Over';
    const horTitle = document.getElementById('ui-horizontitle');
    if (horTitle) horTitle.innerText = t.horizonTitle;
    const recogOverlay = document.getElementById('recognition-overlay');
    if (recogOverlay) recogOverlay.style.display = 'flex';
    document.getElementById('recog-question').innerText = currentLang === 'he' ? 'מה את/ה רואה?' : 'What do you see?';


    const toggleBtn = document.getElementById('lang-toggle');
    if (toggleBtn) toggleBtn.innerText = lang === 'he' ? 'EN' : 'HE';
    
    // Also update questionnaire if it's currently showing
    const qScreen = document.getElementById('screen-questionnaire');
    if (qScreen && qScreen.classList.contains('active')) {
        renderQ();
    }
};

window.goBack = function() {
    const skyScreen = document.getElementById('screen-sky');
    const qScreen = document.getElementById('screen-questionnaire');
    const introScreen = document.getElementById('screen-intro');

    // If on the sky screen
    if (skyScreen && skyScreen.classList.contains('active')) {
        if (window.skyRevealState === 'revealed') {
            // Act as Restart
            location.reload();
            return;
        } else if (window.skyRevealState === 'recognition') {
            // Go back to the last question
            qIndex = QUESTIONS.length - 1;
            skyScreen.classList.remove('active');
            document.getElementById('recognition-overlay').style.display = 'none';
            qScreen.classList.add('active');
            document.getElementById('btn-global-back').style.display = 'block';
            renderQ();
            return;
        }
    }

    // If on questionnaire
    if (qScreen && qScreen.classList.contains('active')) {
        if (qIndex > 0) {
            qIndex--;
            renderQ();
        } else {
            // Back to opening
            showScreen('screen-opening');
            document.getElementById('btn-global-back').style.display = 'none';
        }
    }
};

window.updateGlobalBackButton = function() {
    // Navigation is scroll/swipe-based only — no visible shortcut buttons
    // Only reveal a subtle restart option at the end of the journey
    const btn = document.getElementById('btn-global-back');
    if (!btn) return;
    const skyScreen = document.getElementById('screen-sky');
    if (skyScreen && skyScreen.classList.contains('active') && window.skyRevealState === 'revealed') {
        const restartLabel = currentLang === 'he' ? 'להתחיל מחדש' : 'Restart';
        btn.innerHTML = '↺';
        btn.title = restartLabel;
        btn.setAttribute('aria-label', restartLabel);
        btn.style.display = 'flex';
        btn.style.alignItems = 'center';
        btn.style.gap = '6px';
        btn.style.opacity = '0.70';
        btn.style.fontSize = '0.85rem';
        btn.style.letterSpacing = '0.12em';
        btn.style.pointerEvents = 'auto';
        btn.style.padding = '6px 14px';
        btn.style.borderRadius = '2px';
        btn.style.border = '1px solid rgba(255,255,255,0.35)';
        btn.style.color = 'rgba(255,255,255,0.8)';
        btn.style.background = 'transparent';
        btn.style.cursor = 'pointer';
        btn.style.width = 'auto';
        btn.style.height = 'auto';
        btn.style.transition = 'opacity 0.3s ease, color 0.3s ease';
        btn.onmouseenter = () => {
            btn.style.opacity = '1';
            btn.innerHTML = '↺ ' + restartLabel;
            btn.style.color = 'rgba(255,255,255,1)';
        };
        btn.onmouseleave = () => {
            btn.style.opacity = '0.70';
            btn.innerHTML = '↺';
            btn.style.color = 'rgba(255,255,255,0.8)';
        };
    } else {
        btn.style.display = 'none';
    }
};

window.showConstellationInfo = function(title) {
    const modal = document.getElementById('constellation-info-modal');
    if (!modal) return;

    document.getElementById('constellation-info-title').innerText = title;

    // ── WORD-SPECIFIC mystical / tarot / horoscope lore ──────────────────
    const rawWord  = ((typeof answers !== 'undefined' && answers.pareidolia) || '').trim();
    const cleanWord = rawWord.replace(/^ה/, ''); // strip definite article
    const fn = (typeof answers !== 'undefined' && answers.name) ? answers.name.split(' ')[0] : '';

    // Each entry: tarot-style, symbolic, connected to that specific creature/object
    const WORD_LORE = {
        // ── ANIMALS ──────────────────────────────────────────────────────
        'עטלף': `<strong>העטלף</strong> רואה בחשכה במה שאחרים לא רואים בבהירות. הוא מנווט לא בעיניים אלא בקול — שולח אותות ומקשיב לתהודה החוזרת. ${fn ? fn + ', ' : ''}היכולת שלך להיות בחשכה ולדעת את הדרך בלי לראות אותה במו עיניך — זו כנראה יכולת נדירה. הקונסטלציה רומזת: אל תחכה/י שיהיה אור כדי לנוע. החשכה בתוכך היא מפה.`,
        'חתול': `<strong>החתול</strong> חי בשני עולמות בו-זמנית. הוא נוכח לחלוטין בכל מקום שבוחר, ובין ריצות — שוקע לתוך עצמאיותו. ${fn ? fn + ', ' : ''}מי שרואה/ת חתול יודע/ת לשמור על עצמאות באמת — לתת מבלי לאבד. הקונסטלציה מגלה: גמישות אמיתית דורשת עצמאות אמיתית.`,
        'כלב': `<strong>הכלב</strong> הוא היחיד שבחר בבני אדם ספונטנית — ולא הוא אשר מגלה כלום בעזיבתו. ${fn ? fn + ', ' : ''}דווקא נאמנות היא הכוח שלך — לא חולשה. הקונסטלציה שואלת: למי את/ה בוחר/ת להיות נאמן/ת בלי תנאים?`,
        'ציפור': `<strong>הציפור</strong> שרה מהמקום שבו היא נמצאת — אין זה גבול. ${fn ? fn + ', ' : ''}מי שרואה/ת ציפור יודע/ת שיש מקום שאת/ה שייך/ת להגיע אליו. הקונסטלציה אומרת: עופי/עוף לפני שהעונות יתחלפו.`,
        'דג': `<strong>הדג</strong> שוחה בזרמים שאחרים אינם רואים. הוא לא נלחם בזרמה — הוא בוחר אותה. ${fn ? fn + ', ' : ''}הזרימה שאת/ה מרגיש/ת דוחפת אותך/ך היא הפרק הבא. אל תילחם/י בה.`,
        'פרפר': `<strong>הפרפר</strong> אינו בורח מהזחל, הוא נולד מחדש מתוכו. ${fn ? fn + ', ' : ''}ההיפכה שראית/ת כבר קרתה — לא באופן שבחרת/ת, אלא באופן שהיית/ה מוכן/ת. הקונסטלציה מגלה: הכנפיים כבר שלך.`,
        'נחש': `<strong>הנחש</strong> הוא הסמל הקדום ביותר לחוכמה ולשינוי. הוא של אין עור ישן — בוחר תמיד להתחדש. ${fn ? fn + ', ' : ''}שלב השילול כבר קרה, שלב הבא שלך פתוח. אל תפחד/י מהשינוי.`,
        'אריה': `<strong>האריה</strong> לא מוכיח את עצמו. הוא פשוט הולך. ${fn ? fn + ', ' : ''}יש בך כוח שלא דורש אישור, רק הרשאה פנימית. הקונסטלציה שואלת: מה היית/ה רוצה/ה להגן אז להוביל?`,
        'דב': `<strong>הדב</strong> ישן כשהעולם קר מדי, ומתעורר בתזמון הנכון. ${fn ? fn + ', ' : ''}יש בך משאבות שאינם זקוקים להוכחה — הקונסטלציה מגלה: סמוך/י על הכוח הפנימי, הוא אמיתי.`,
        'דולפין': `<strong>הדולפין</strong> הוא יצור שחי בשעשוע ובחוכמה בו-זמנית, מרפא באופן שדורש מעט ממנו. ${fn ? fn + ', ' : ''}גם ברגעים שנראים כבדים, יש בך יכולת לנווט בחן. הקונסטלציה אומרת: השמחה אינה מותרות.`,
        'צב': `<strong>הצב</strong> מלמד אותך: איטיות אינה עצלנות, הוא שלמות. ${fn ? fn + ', ' : ''}איטיות אינה אויב אלא בחירה להיות נוכח לחלוטין. הקונסטלציה מגלה: הקצב הנכון לך הוא קצבך/קצבך הפנימי.`,
        'זאב': `<strong>הזאב</strong> הולך בחברה אבל דעתו נשארת איתו בכל מקום. ${fn ? fn + ', ' : ''}את/ה יודע/ת להתאחד עם הקבוצה בלי לאבד את עצמך. הקונסטלציה רומזת: מי הם האים שלך?`,
        'עיט': `<strong>העיט</strong> הוא הסמל הקדום ביותר לזיכרון, לחוכמה, לאורך חיים. ${fn ? fn + ', ' : ''}מי שרואה/ת עיט נושא/ת בתוכו קשר עמוק לזמן וליך. הקונסטלציה אומרת: העולם צריך את החכמה שלך.`,
        'ינשוף': `<strong>הינשוף</strong> רואה בחושך מה שאחרים מפספסים לראות באור. ${fn ? fn + ', ' : ''}יש בך חכמה שלא צריכה להוכח. הקונסטלציה אומרת: סמוך/י על מה שאת/ה יודע/ת מעבר לירח הזה.`,
        'סוס': `<strong>הסוס</strong> רץ ללא שהוכיח שהוא רץ — התנועה היא חיותו. ${fn ? fn + ', ' : ''}יש בך אנרגיה צבורה שמחכה לרגע שתדע/י לאן. הקונסטלציה אומרת: הרגע כבר כאן.`,
        // ── NATURE ───────────────────────────────────────────────────────
        'עץ': `<strong>העץ</strong> שלח שורשים לעומק וענפים לרום — בו זמנית. ${fn ? fn + ', ' : ''}את/ה יצור שעצמתו נמדדת בשני כיוונים. הקונסטלציה מגלה: השורשים שלך חזקים ממה שנראה על פני השטח.`,
        'ים': `<strong>הים</strong> אינו גבול — הוא ספק בלה טוב. ${fn ? fn + ', ' : ''}אין את הקרקעית של מה שאת/ה נושא/ת. הקונסטלציה אומרת: עומקך/עומקך הוא כוח, לא נטל.`,
        'נהר': `<strong>הנהר</strong> מלמד: היכולת לעבור בין אבנים. ${fn ? fn + ', ' : ''}בנייה התמידית, העקביות התמידית. הקונסטלציה מגלה: את/ה בדרך, והדרך פתוחה.`,
        'הר': `<strong>ההר</strong> רואה הכל אבל אינו מדבר לאיש. ${fn ? fn + ', ' : ''}מי שרואה/ת הר יודע/ת שיש ביניים שווים רק משם. הקונסטלציה שואלת: מה את/ה רואה/ת משם שאחרים לא רואים?`,
        'פרח': `<strong>הפרח</strong> צומח במקומות שלא בחר. הוא אינו בקש רשות, הוא פשוט נפרץ. ${fn ? fn + ', ' : ''}הקונסטלציה מגלה: יש בך אותו סוג של אומץ שלא מבקש רשות.`,
        'שמש': `<strong>השמש</strong> בכוכבים היא סמל הכוח המרכזי שבך שלא מתנצל. ${fn ? fn + ', ' : ''}את/ה מקור אנרגיה לאחרים, לא רק מקבל/ת. הקונסטלציה אומרת: הגיעה שלך דרושה.`,
        'ירח': `<strong>הירח</strong> מושך בגאות ואינו שלם בעצמו. ${fn ? fn + ', ' : ''}השפעתך/שפעתך על אחרים גדולה מהשיעורת/ת. הקונסטלציה רומזת: האור בתוך הוא שלך.`,
        'כוכב': `<strong>הכוכב</strong> שראית/ת אולי כבר אינו שם — ובכל זאת אורו מגיע אליך. ${fn ? fn + ', ' : ''}אורך/אורך הוא אמיתי והוא מגיע ממקום שאות/ת אפילו לא יודע/ת.`,
        'אש': `<strong>האש</strong> בכוכבים סמלת טרנספורמציה שאינה שורפת אלא משנה. ${fn ? fn + ', ' : ''}יש בך אנרגיה שיכולה לבעור או לחמם. השאלה היא: את/ה רוצה/ה לשרוף או לחמם?`,
        'ענן': `<strong>הענן</strong> אינה עין הכוכבים אלא הגז המחבר בניהם. ${fn ? fn + ', ' : ''}מי שרואה/ת ענן רואה/ת את הקשר בין דברים. הקונסטלציה אומרת: את/ה הדבק שמקשר בין הכוכבים.`,
        // ── CELESTIAL & MYTHOLOGICAL ─────────────────────────────────────
        'גלקסיה': `<strong>הגלקסיה</strong> היא הבית — מיליארדי עולמות בתוך עולם אחד. ${fn ? fn + ', ' : ''}מי שרואה/ת גלקסיה יודע/ת שהגבולות של האפשרי רחבים ממה שמוסגלים לראות. הקונסטלציה אומרת: את/ה מושק בתוך משהו עצום.`,
        'ערפילה': `<strong>הערפילה</strong> אינה עין הכוכבים אלא הגז המחבר בניהם. ${fn ? fn + ', ' : ''}מי שרואה/ת ערפילה רואה/ת את הקשר בין דברים. הקונסטלציה אומרת: את/ה הדבק שמקשר בין הכוכבים.`,
        // ── OBJECTS & ABSTRACT ───────────────────────────────────────────
        'לב': `<strong>הלב</strong> בכוכבים הוא המרכז של כל השאר. ${fn ? fn + ', ' : ''}מי שרואה/ת לב יודע/ת שכל השערים שרוצים בריצה צוריכים לעבור דרך שם. הקונסטלציה שואלת: מי מחזיק בלב שלך?`,
        'יד': `<strong>היד</strong> בכוכבים סמל הפעולה, היכולת ליצור ולתת. ${fn ? fn + ', ' : ''}יש משהו שידיך/ידיך רוצות לבנות. הקונסטלציה אומרת: הגיע הזמן לפעול.`,
        'גשר': `<strong>הגשר</strong> בכוכבים סמל מעבר בין שני מצבים. ${fn ? fn + ', ' : ''}יש מעבר שאת/ה צריך/ת ללכת דרכו. הקונסטלציה אומרת: הגשר כבר נבנה, נדרשת רק העברה.`,
        'מפתח': `<strong>המפתח</strong> בכוכבים סמל האפשרות שקיימת תמיד אבל שאת/ה לא יצאת/ת אליה. ${fn ? fn + ', ' : ''}הקונסטלציה אומרת: המפתח ביד, הדלת פתוחה.`,
        'כתר': `<strong>הכתר</strong> בכוכבים אינו רק שלטון אלא אחריות. ${fn ? fn + ', ' : ''}יש בך יכולת להוביל ולשאת. הקונסטלציה מגלה: הגיעה שלך דרושה.`,
        'בית': `<strong>הבית</strong> בכוכבים הוא סמל השרשים והשייכות. ${fn ? fn + ', ' : ''}הבית מתחיל בתוכך. הקונסטלציה מגלה: את/ה יודע/ת מהיכן את/ה בא/ה.`,
        'ספר': `<strong>הספר</strong> בכוכבים סמל חכמה שממתינה להעברה. ${fn ? fn + ', ' : ''}יש סיפור שאת/ה צריך/ת לדעת. הקונסטלציה אומרת: את/ה כבר כותב/ת אותו.`,
        'אדם': `<strong>האדם</strong> בכוכבים — ראית/ת את עצמך מבחוץ. ${fn ? fn + ', ' : ''}היכולת ליצור, לאהוב, לבנות, ולעבור היא הכוח הגדול שיש בתוכך. הקונסטלציה אומרת: ראית/ת את האדם שאת/ה אמור/ה להיות.`
    };

    // If word not in map — build a dynamic fallback that still feels personal
    function buildFallback(word) {
        if (!word) return null;
        return `כשבחרת/ת לראות <strong>${word}</strong> בחשכת הכוכבים, לא היה זה מקרה.<br><br>${fn ? fn + ', ' : ''}הנשמה מציינת סמל מסוים שקשור אליך באופן עמוק. הקונסטלציה שואלת: מה אומרת לך <strong>${word}</strong> הזה על הפרק הבא בחייך?`;
    }

    const textEl = document.getElementById('constellation-info-text');
    const specificText = WORD_LORE[cleanWord] || WORD_LORE[rawWord] || buildFallback(cleanWord || rawWord);

    if (currentLang === 'he') {
        textEl.innerHTML = specificText || `<strong>${title}</strong> נבחרה כקונסטלציה שלך. הקונסטלציה רומזת: יש בעניין הזה משהו שמבקש להיראות.`;
    } else {
        textEl.innerHTML = `The constellation <strong>${title}</strong> emerged from your vision. It holds a meaning that is uniquely yours. The constellation asks: what does it reveal about the next chapter of your life?`;
    }

    modal.classList.remove('hidden');
};



window.closeConstellationInfo = function() {
    const modal = document.getElementById('constellation-info-modal');
    if (modal) modal.classList.add('hidden');
};

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// ======================================================
// INTERPRETATION PANEL — scrollable text over the Rorschach
// ======================================================
function showInterpretationPanel(userVision) {
    const skyScreen = document.getElementById('screen-sky');
    if (!skyScreen || document.getElementById('sky-data-overlay')) return;

    // Update the title if user provided a pareidolia vision name
    const existingTitle = document.getElementById('user-constellation-title');
    if (existingTitle && userVision) {
        const isHeLocal = currentLang === 'he';
        let fmtTitle = userVision.trim();
        if (isHeLocal && !fmtTitle.startsWith('ה')) fmtTitle = 'ה' + fmtTitle;
        else if (!isHeLocal && !fmtTitle.toLowerCase().startsWith('the ')) fmtTitle = 'The ' + fmtTitle;
        existingTitle.textContent = '— ' + fmtTitle + ' —';
        
        // Add "Add to Space" button if it doesn't exist
        if (!document.getElementById('btn-add-to-space')) {
            const addBtn = document.createElement('button');
            addBtn.id = 'btn-add-to-space';
            addBtn.innerText = 'הוסיפו לחלל הכללי';
            addBtn.style.cssText = `
                position: absolute;
                top: 70px;
                left: 50%;
                transform: translateX(-50%);
                background: transparent;
                border: 1px solid rgba(255,255,255,0.5);
                color: rgba(255,255,255,0.8);
                padding: 6px 16px;
                font-family: "SimplerMono", "Courier New", monospace;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
                z-index: 1000;
                pointer-events: auto;
            `;
            addBtn.onmouseover = () => { addBtn.style.background = 'rgba(255,255,255,0.1)'; addBtn.style.color = '#fff'; };
            addBtn.onmouseout = () => { addBtn.style.background = 'transparent'; addBtn.style.color = 'rgba(255,255,255,0.8)'; };
            
            addBtn.onclick = () => {
                if (window.lastUserConstellation && !window._hasSavedCurrentConstellation) {
                    window._hasSavedCurrentConstellation = true;
                    try {
                        const saved = JSON.parse(localStorage.getItem('pagmar_saved_constellations') || '[]');
                        // Generate a short mystical text to save for this constellation
                        const mysticalTexts = [
                            'קונסטלציה זו התגלתה על ידי חוקר אחר ברחבי החלל.',
                            'הדהוד של זיכרון רחוק ממימד אחר.',
                            'נקודות אור אלו חוברו יחדיו ברגע של חסד קוסמי.',
                            'הולוגרמה של חלום שנשמר במרחבי הזמן.',
                            'תבנית כוכבים זו טומנת בחובה סוד של חוקר אנונימי.'
                        ];
                        const randomText = mysticalTexts[Math.floor(Math.random() * mysticalTexts.length)];
                        
                        saved.push({
                            nameHe: userVision, nameEn: userVision,
                            color: 'rgba(255, 255, 255,',
                            pts: window.lastUserConstellation.pts,
                            lines: window.lastUserConstellation.lines,
                            text: randomText // Save the text so it can be read later
                        });
                        localStorage.setItem('pagmar_saved_constellations', JSON.stringify(saved));
                        addBtn.innerText = 'נוסף בהצלחה';
                        addBtn.style.borderColor = 'rgba(150, 255, 150, 0.5)';
                        addBtn.style.color = 'rgba(150, 255, 150, 0.8)';
                        setTimeout(() => addBtn.style.opacity = '0', 2000);
                        
                        // Dynamically create a new ghost in the current session
                        const seed = saved.length * 137.5;
                        const angle = seed * (Math.PI / 180);
                        const dist = 1500 + (seed % 4000);
                        const newGhost = saved[saved.length - 1];
                        newGhost.offset = { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
                        window.ghostDefs.push(newGhost);
                        
                        // We would need to init its ghostState here, but a page reload works too.
                    } catch(e) {
                        console.error('Could not save constellation', e);
                    }
                }
            };
            
            // Append it to the container of the title
            const titleContainer = document.getElementById('constellation-header-ui');
            if (titleContainer) titleContainer.appendChild(addBtn);
        }
    }

    const isHe = currentLang === 'he';

    // ── BUILD SHORT DATA LABELS per major point ─────────────────────
    // Helper to pick a random item from an array
    const pick = function(arr) { return arr[Math.floor(Math.random() * arr.length)]; };

    // ── BUILD PERSONALIZED INTERPRETATION LABELS ─────────────────────
    // Helper

    // ── ANSWER TRANSLATION: en → he (in case user answered in English) ──────
    // Build lookup from the QUESTIONS options arrays
    const _enToHeAnswer = {};
    QUESTIONS.forEach(function(q) {
        const heOpts = (q.he && q.he.options) ? q.he.options : [];
        const enOpts = (q.en && q.en.options) ? q.en.options : [];
        heOpts.forEach(function(heOpt, i) {
            if (enOpts[i]) _enToHeAnswer[enOpts[i]] = heOpt;
        });
    });
    /** Return the Hebrew version of an answer value, regardless of stored language */
    const toHe = (val) => (val && _enToHeAnswer[val]) ? _enToHeAnswer[val] : (val || '');

    const name = answers.name || 'אורח/ת';
    const firstName = name.split(' ')[0];

    // ── COLOR interpretations: what mood language reveals ──
    const aColor = toHe(answers.color || '');

    const colorMap = {
        'אפור': pick([
            firstName + ', הגוון שמשך/ה אותך הוא אפור — הצבע שיושב בין עולמות. הכוכבים רואים בזה לא חוסר החלטה, אלא גשר: נשמה שמוכנה לחצות ממה שהיה למה שעוד יגיע. הכח שלך טמון דווקא בנכונות לשבת ב"אמצע" — כי שם, בשקט שבין שני גדות, נולדות ההחלטות הכי עמוקות.',
            'כשאדם בוחר אפור, הגורל מבין: זוהי נשמה שמצויה בשלב של אינטגרציה — שואבת תוכה את כל מה שקרה, ומכינה בשקט מה שיגיע. ' + firstName + ', אל תמהר/י לחצות את הסף. הפעמים החשובות ביותר בחייך התרחשו בשקט שבין שני רגעים.'
        ]),
        'אדום': pick([
            firstName + ', הכוח הפלנטרי של מאדים דוחף דרכך עכשיו. אדום הוא צבעם של המנהיגים, של מי שבאים לשנות — ולא רק לשרוד. המפה שנוצרה עבורך מגלה: יש בך אנרגיה שמחכה לכיוון, לא להרגעה. הכוכבים שואלים: לאיזו שינוי אמיתי תפנה/י את הכח הזה?',
            'האש שבוחרת בגוון אדום היא אש שיודעת מה היא רוצה. ' + firstName + ', הכוכבים ב' + (firstName) + ' מגלים נשמה שעמדה יותר מדי זמן בצל הרצון שלה עצמה. הגיע הזמן. לא להתפרץ — אלא לבחור בכוונה לאן לשחרר את מה שנצבר.'
        ]),
        'כחול': pick([
            firstName + ', הכוכב שלך מנגן בתדר כחול — כחול ים, כחול לילה, כחול אמת. זה הגוון של הנביאים ושל השומרים. המפה שנוצרה עבורך מגלה נשמה שיודעת דברים שלא תמיד יש לה את המלים עבורם. הדרך שלפנייך מבקשת שתסמוך/כי על הידיעה הזו — גם כשאחרים לא רואים מה שאת/ה רואה.',
            'הכחול שמשך/ה אותך אינו מקרי — הוא הצבע של כוכב הנוגה, של אהבה עמוקה ושל חכמה שנרכשת בשקט. ' + firstName + ', המפה שלך מגלה שאתה/את בנקודת מפנה של הבנה: משהו שהיה ערפל הופך לבהיר. אמון/י בתהליך.'
        ]),
        'שחור': pick([
            firstName + ', שחור הוא לא היעדר אור — הוא הצבע של החלל שממנו נולדים כוכבים. מי שמשך/ה אליו שחור נמצא/ת בשלב של ניקוי קוסמי: שחרור ממה שלא משרת עוד. הכוכבים רואים בך אומץ עמוק — האומץ לאפשר לדברים ישנים לרדת, כדי שחדשים יוכלו לעלות.',
            'הגוון השחור שבחרת/ה הוא האמיתי ביותר לרגע הזה. ' + firstName + ', זהו הצבע של הלוח שמחכה לרישום חדש. המפה שנוצרה עבורך מגלה: אתה/את בסוף פרק — וזה דורש אומץ שרוב האנשים אינם מכירים. מה אתה/את מוכן/ה לרשום בפרק הבא?'
        ]),
        'ירוק': pick([
            firstName + ', ירוק הוא צבע הלב — צ\'אקרה האמצעית, מקום החיבור בין הארץ לשמיים. הגוון שמשך/ה אותך מגלה נשמה שנמצאת בצמיחה אמיתית: לא דרמטית, לא פתאומית, אלא כמו עץ — בהתמדה, בשורשים, כלפי האור. הכוכבים מבשרים: מה שמתבשל בך עכשיו יניב פרי שלא ציפית לו.',
            'הירוק שבחרת/ה הוא הירוק של תחילת אביב — לא הירוק המלא של הקיץ, אלא הירוק הראשון שאחרי החורף. ' + firstName + ', יש בך חיים שמתחדשים. שמור/י על מה שצומח — הוא עדין, אבל אמיתי.'
        ]),
        'סגול': pick([
            firstName + ', סגול הוא הגוון של הכוהנים, של מי שרואה מה שאחרים לא רואים. כוכבים, ' + firstName + ' נשמה בעלת רגישות מיסטית עמוקה — מתנה שנושאת גם כובד. המפה שנוצרה עבורך מראה: אתה/את מסוגל/ת לתפוס רמות של מציאות שמעבר לנראה. השאלה היא — מה עשית/ה עם הגישה הזו?',
            'הסגול שמשך/ה אותך הוא צבע המעבר בין הידוע לנסתר. ' + firstName + ', הכוכבים רואים בך מי שחי/ה בו זמנית בשני תדרים — הגלוי והעמוק. זו אינה נטל, זוהי שפה. לימד/י אחרים לדבר אותה.'
        ]),
        'כתום': pick([
            firstName + ', כתום הוא הגוון של השמש ביום הכי טוב שלה — כשהיא לא שורפת, אלא מחממת. הכוכבים רואים בך נשמה שבאה לשמח, לקשר, לצבוע את עולם האנשים סביבה בחיות. המפה שנוצרה עבורך מגלה: יש בך יצירתיות ושמחה שמחכות לפרוץ. הדרך שלפנייך זקוקה לאנרגיה שאתה/את נושא/ת.',
            'כתום הוא הצבע של הסוואדהיסטהאנה — מרכז היצירה, של ההנאה ושל הזרימה. ' + firstName + ', הכוכבים שלך מראים: אתה/את בדרך לפרק שיהיה גדוש יצירה ושמחה. פתח/י לו את הדלת.'
        ]),
        'לבן': pick([
            firstName + ', לבן הוא כל הצבעים יחד — הגוון של מי שמכיל/ה ריבוי. הכוכבים רואים בך נשמה שעמדה בפני הרבה, שכילכלה בפנים הרבה — ועכשיו מבקשת בהירות. המפה שנוצרה עבורך מגלה: אתה/את עומד/ת על סף טהרה אמיתית. לא ריקון — אלא בהרה.',
            'הלבן שבחרת/ה הוא הצבע של האור הראשון. ' + firstName + ', הכוכבים מבשרים לך: הדף החלק שמולך אינו ריקנות — הוא חופש. מה תרשמ/י עליו כשיהיה בידייך?'
        ])
    };


    const colorMapEn = {
        '\u05d0\u05e4\u05d5\u05e8': pick([
            firstName + ', the shade that drew you is grey — the colour that lives between worlds. The stars read this not as indecision, but as a bridge: a soul ready to cross from what was to what is still arriving. Your power lies precisely in your willingness to sit in the middle — because it is there, in the quiet between two shores, that the deepest decisions are born.',
            'When a person reaches for grey, fate understands: here is a soul in integration — drawing inward all that has passed, quietly preparing what is to come. ' + firstName + ', do not rush to cross the threshold. The most important moments of your life have always occurred in the silence between two instants.'
        ]),
        '\u05d0\u05d3\u05d5\u05dd': pick([
            firstName + ', the planetary force of Mars is pushing through you right now. Red belongs to leaders, to those who arrive to change things — not merely survive them. The map that formed for you reveals: there is energy in you waiting for direction, not containment. The stars ask: toward what real change will you direct this force?',
            'The fire that reaches for red is a fire that knows what it wants. ' + firstName + ', the stars reveal a soul that has stood too long in the shadow of its own desire. The time has come — not to erupt, but to choose with intention where to release what has gathered.'
        ]),
        '\u05db\u05d7\u05d5\u05dc': pick([
            firstName + ', your star resonates at a blue frequency — blue of sea, blue of night, blue of truth. This is the shade of prophets and keepers. The map formed for you reveals a soul that knows things for which it sometimes has no words. The path ahead asks you to trust that knowing — even when others cannot see what you see.',
            'The blue that drew you is not random — it is the colour of Venus, of deep love and wisdom earned in silence. ' + firstName + ', your map reveals that you are at a turning point of understanding: something that was fog is becoming clear. Trust the process.'
        ]),
        '\u05e9\u05d7\u05d5\u05e8': pick([
            firstName + ', black is not the absence of light — it is the colour of the void from which stars are born. Those drawn to black are in a phase of cosmic clearing: releasing what no longer serves. The stars see in you a deep courage — the courage to allow old things to descend, so new ones can rise.',
            'The black you chose is the truest colour for this moment. ' + firstName + ', this is the colour of the blank canvas waiting to be written. The map formed for you reveals: you are at the end of a chapter — and that demands a courage most people do not recognise. What are you ready to write in the next one?'
        ]),
        '\u05d9\u05e8\u05d5\u05e7': pick([
            firstName + ', green is the colour of the heart — the middle chakra, the place of connection between earth and sky. The shade that drew you reveals a soul in genuine growth: not dramatic, not sudden, but like a tree — steadily, rooted, toward the light. The stars announce: what is ripening in you now will bear fruit you did not expect.',
            'The green you chose is the green of early spring — not the full green of summer, but the first green after winter. ' + firstName + ', there is life renewing inside you. Protect what is growing — it is tender, but it is real.'
        ]),
        '\u05e1\u05d2\u05d5\u05dc': pick([
            firstName + ', purple is the shade of those who see what others miss. The stars reveal a soul of deep mystical sensitivity — a gift that also carries weight. The map formed for you shows: you are capable of perceiving layers of reality beyond the visible. The question is — what have you done with that access?',
            'The purple that drew you is the colour of the passage between the known and the hidden. ' + firstName + ', the stars see in you someone who lives simultaneously on two frequencies — the visible and the deep. This is not a burden; it is a language. Teach others to speak it.'
        ]),
        '\u05db\u05ea\u05d5\u05dd': pick([
            firstName + ', orange is the shade of the sun on its best day — when it warms rather than burns. The stars see in you a soul that has come to bring joy, to connect, to colour the world of those around them with vitality. The map formed for you reveals: there is creativity and lightness in you waiting to break through. The path ahead needs the energy you carry.',
            'Orange is the colour of the sacral — the centre of creation, pleasure and flow. ' + firstName + ', your stars show: you are moving toward a chapter full of creation and joy. Open the door to it.'
        ]),
        '\u05dc\u05d1\u05df': pick([
            firstName + ', white is all colours together — the shade of those who hold multitude. The stars see in you a soul that has stood before much, held much inward — and is now seeking clarity. The map formed for you reveals: you stand on the threshold of a genuine purification. Not emptiness — but radiance.',
            'The white you chose is the colour of the first light. ' + firstName + ', the stars announce: the blank page before you is not emptiness — it is freedom. What will you write upon it when it is in your hands?'
        ])
    };
    const colorMsgHe = colorMap[aColor] || pick([
        firstName + ', \u05d4\u05e6\u05d1\u05e2 \u05e9\u05d1\u05d7\u05e8\u05ea/\u05ea \u05de\u05d2\u05dc\u05d4 \u05e9\u05d0\u05ea\u05d4/\u05d0\u05ea \u05d1\u05ea\u05e0\u05d5\u05e2\u05d4 \u2014 \u05dc\u05d0 \u05d1\u05e1\u05d5\u05e3 \u05d5\u05dc\u05d0 \u05d1\u05d4\u05ea\u05d7\u05dc\u05d4. \u05d9\u05e9 \u05d1\u05da \u05de\u05e9\u05d4\u05d5 \u05d1\u05ea\u05d4\u05dc\u05d9\u05da \u05e2\u05d9\u05e6\u05d5\u05d1.',
        '\u05d4\u05e6\u05d1\u05e2 \u05e9\u05de\u05e9\u05da/\u05d4 \u05d0\u05d5\u05ea\u05da \u05e2\u05db\u05e9\u05d9\u05d5 \u05d4\u05d5\u05d0 \u05dc\u05d0 \u05de\u05e7\u05e8\u05d9. \u05d4\u05d5\u05d0 \u05de\u05e9\u05e7\u05e3 \u05ea\u05d3\u05e8 \u05e9\u05d0\u05ea\u05d4/\u05d0\u05ea \u05e2\u05d5\u05d1\u05e8/\u05ea \u05d1\u05d5.'
    ]);
    const colorMsgEn = colorMapEn[aColor] || pick([
        firstName + ', the colour you chose reveals you are in motion — not at an end, not at a beginning. There is something in you in the process of taking shape.',
        'The colour that drew you now is not random. It reflects the frequency you are moving through.'
    ]);

    // ── TIME interpretations: when is the body heaviest ──
    const aTime = toHe(answers.time || '');
    const timeMap = {
        'בוקר': pick([
            firstName + ', הכוכבים רואים: בוקר הוא הפרק הראשון ביום — וגופך כבד בו כי הנשמה שלך עדיין ב"בין". בין החלום למציאות, בין מה שרצית לבין מה שממתין. המפה שנוצרה עבורך מגלה נשמה שנמצאת בסף של שינוי — שמרגישה אותו בבוקר לפני שהיום ממלא את הרעש.',
            'הכובד של הבוקר שייך לנשמות שיודעות: מה שממתין ביום אינו תמיד מה שלבן. ' + firstName + ', הכוכבים מבשרים: הבוקר שבו תקום/תקומי קלה/ה קרוב — הוא מסמן את תחילת הפרק הבא.'
        ]),
        'צהריים': pick([
            firstName + ', צהריים הוא שיא הכח הסולארי — השמש בשיאה, העולם ב"הכי ממשי". אם גופך כבד דווקא אז, הכוכבים מגלים: יש בך אי-התאמה בין הנשמה לבין הממשי. בין מי שאתה/את בפנים לבין מה שהיום שלך מכיל. המפה שנוצרה עבורך: הכנס/הכניסי שינוי קטן אחד לאמצע היום.',
            'הכובד בצהריים מגלה נשמה שמרגישה שהיום נלקח ממנה — שהיא לא הגדירה אותו, אלא הוא הגדיר אותה. ' + firstName + ', הכוכבים שואלים: מה תחליט/י להחזיק שלך ביום מחר?'
        ]),
        'אחר הצהריים': pick([
            firstName + ', שעת ה"ו בערב" — הזמן שבין האור לחושך, בין פעולה למנוחה. כוכבים, ' + firstName + ': גופך כבד בשעת המעבר כי הנשמה שלך יודעת שהיא עוברת. עוברת פרק, עוברת מדינה פנימית, עוברת סף. מה אתה/את עוברת/ת עכשיו?',
            'אחר הצהריים הוא שעת כוכבי הערב — הכוכבים הראשונים שנגלים. ' + firstName + ', הכובד שאתה/את מרגיש/ה בשעה הזו הוא לא עייפות. הוא שאלה: מה תיקח/י מהיום הזה?'
        ]),
        'ערב': pick([
            firstName + ', ערב הוא הזמן שבו הכוכבים מתחילים להופיע — ונשמות שכבדות בערב הן נשמות שנשאו הרבה לאורך היום בשקט. הכוכבים מגלים: אתה/את שוחה/ה עמוק. לא שאחרים לא רואים — אלא שאתה/את לא מראה. מה אתה/את שומר/ת ששווה לשחרר?',
            'הכובד של הערב הוא הכובד של מי שחי/ה ביום שלם. ' + firstName + ', הכוכבים מבשרים: הפרק הקרוב יהיה קל יותר — אך הוא ידרוש שתסמוך/כי על מי שיושב/ת איתך בשקט.'
        ]),
        'לילה': pick([
            firstName + ', הלילה הוא הזמן של הכוכבים — ואלה שכבדים בלילה הם מי שמנהלים שיחה אמיתית עם עצמם. כוכבים, ' + firstName + ' נשמה שיודעת אמת שלא ניתן לומר ביום. המפה שנוצרה עבורך מגלה: מה שעולה בך בלילה הוא המסר החשוב ביותר שלך לעצמך. הקשיבי/הקשב לו.',
            'מי שכבד/ה בלילה נמצא/ת בשיחה עם החלקים העמוקים ביותר שלו/שלה. ' + firstName + ', הכוכבים מבשרים: הלילות יהפכו לקלים יותר — ברגע שתסמכ/י על מה שנשמע בהם.'
        ]),
        'השעות הקטנות': pick([
            firstName + ', מי שמרגיש/ה כבד/ה בשעות שבין חצות ל-4 הוא/היא מי שנמצא/ת בשיחה עם הלא-מודע שלו/שלה. כוכבים, ' + firstName + ': יש בך נבואה פנימית שממתינה לפריצה. המפה שנוצרה עבורך: מה שעולה בשעות האלה — כתוב/כתבי. הוא ישמש אותך.',
            'השעות הקטנות הן שעות האמת הכי גולמית. ' + firstName + ', הכוכבים רואים: אתה/את בתקשורת עם מה שגדול ממך. מה שמגיע בשעות האלה — אל תדחה/תדחי. הוא מסר.'
        ])
    };
    const timeMapEn = {
        '\u05d1\u05d5\u05e7\u05e8': pick([
            firstName + ', the stars see: morning is the first chapter of the day — and your body is heavy in it because your soul is still in the between. Between the dream and the waking, between what you wanted and what waits. The map formed for you reveals a soul standing on the threshold of change — feeling it in the morning before the day fills with noise.',
            'The heaviness of morning belongs to souls that know: what awaits in the day is not always what the light promises. ' + firstName + ', the stars announce: the morning when you will rise lightly is near — it marks the beginning of the next chapter.'
        ]),
        '\u05e6\u05d4\u05e8\u05d9\u05d9\u05dd': pick([
            firstName + ', noon is the peak of solar force — the sun at its height, the world at its most concrete. If your body is heavy then, the stars reveal: there is a mismatch in you between the soul and the tangible. Between who you are inside and what your day contains. The map formed for you: introduce one small change to the middle of your day.',
            'The heaviness at noon reveals a soul that feels the day has been taken from it — that it did not define the day, but the day defined it. ' + firstName + ', the stars ask: what will you decide to keep as yours tomorrow?'
        ]),
        '\u05d0\u05d7\u05e8 \u05d4\u05e6\u05d4\u05e8\u05d9\u05d9\u05dd': pick([
            firstName + ', the hour between light and dark, between action and rest. ' + firstName + ': your body is heavy in the hour of transition because your soul knows it is crossing. Crossing a chapter, crossing an interior country, crossing a threshold. What are you crossing now?',
            'The late afternoon is the hour of the evening stars — the first ones to appear. ' + firstName + ', the heaviness you feel at this hour is not fatigue. It is a question: what will you carry with you from this day?'
        ]),
        '\u05e2\u05e8\u05d1': pick([
            firstName + ', evening is the time when the stars begin to appear — and souls that are heavy by evening are souls that have carried much in quiet all day. The stars reveal: you swim deep. Not that others do not see — but that you do not show. What are you holding that is worth releasing?',
            'The heaviness of evening belongs to those who have lived a full day. ' + firstName + ', the stars announce: the chapter ahead will be lighter — but it will ask you to trust whoever sits with you in the silence.'
        ]),
        '\u05dc\u05d9\u05dc\u05d4': pick([
            firstName + ', night is the time of stars — and those who are heavy at night are conducting a genuine conversation with themselves. ' + firstName + ', a soul that knows truths it cannot say in the day. The map formed for you reveals: what rises in you at night is your most important message to yourself. Listen to it.',
            'Those who are heavy at night are in dialogue with their deepest layers. ' + firstName + ', the stars announce: the nights will grow lighter — the moment you trust what is heard in them.'
        ]),
        '\u05d4\u05e9\u05e2\u05d5\u05ea \u05d4\u05e7\u05d8\u05e0\u05d5\u05ea': pick([
            firstName + ', those who feel heavy in the hours between midnight and four are those in conversation with their unconscious. ' + firstName + ': there is an inner prophecy in you waiting to break through. The map formed for you: what rises in these hours — write it down. It will serve you.',
            'The small hours are the hours of the rawest truth. ' + firstName + ', the stars see: you are in communication with something larger than yourself. What comes in these hours — do not dismiss it. It is a signal.'
        ])
    };
    const timeMsgHe = timeMap[aTime] || '\u05d4\u05d6\u05de\u05df \u05e9\u05d1\u05d7\u05e8\u05ea/\u05ea \u05de\u05d2\u05dc\u05d4 \u05de\u05e9\u05d4\u05d5 \u05e2\u05dc \u05d4\u05e7\u05e6\u05d1 \u05d4\u05e4\u05e0\u05d9\u05de\u05d9 \u05e9\u05dc\u05da.';
    const timeMsgEn = timeMapEn[aTime] || firstName + ', the hour that weighs on you is not random — it is marking where your attention is most truly held.';

    // ── HOME interpretations: where the body relaxes ──
    const aHome = toHe(answers.home || '');
    const homeMap = {
        'בעיר שלי': pick([
            firstName + ', הקשר שלך לעיר שלך הוא שורש — אותו סוג שורש שמאפשר לעץ לגדול גבוה. כוכבים, ' + firstName + ' נשמה שיש בה מחויבות עמוקה: לאדמה, לאנשים, לזהות. המפה שנוצרה עבורך מבשרת: העיר שלך תיתן לך בשנה הקרובה משהו שלא ציפית לו.',
            'הכוכבים מגלים: ' + firstName + ' מי שמרגיש/ה בבית בעיר שלו/שלה נושא/ת שורשים עמוקים — וזו הבסיס שממנו הכל אפשרי. הדרך שלפנייך מצמיחה מהיכן שאתה/את כבר נמצא/ת.'
        ]),
        'בחדר שלי': pick([
            firstName + ', החדר שלך הוא מקדש — המרחב שבו הנשמה שלך נושמת ללא מסכות. כוכבים, ' + firstName + ' נשמה שיצרתנית, עמוקת-מחשבה, שמחלימה בשקט. המפה שנוצרה עבורך מגלה: מה שנוצר בחדר שלך בקרוב יגיע לאחרים — וישפיע עליהם.',
            'הכוכבים רואים: מי שמרגיש/ה בבית בחדרו/ה הוא/היא מי שמכיר/ה את עצמו/ה. ' + firstName + ', זוהי מתנה נדירה. הפרק הבא בחייך יזמין אותך לשתף את העולם ב"פנים".'
        ]),
        'ליד אדם מסוים': pick([
            firstName + ', הבית שלך הוא אנרגיה של אדם — זהו הסוג הנדיר ביותר של בית. כוכבים, ' + firstName + ' נשמה שנולדה לחיבור עמוק, לאהבה בלתי מתפשרת. המפה שנוצרה עבורך מבשרת: הקשר שמחמם אותך כבר עכשיו — עומד להעמיק עוד.',
            'הכוכבים רואים: מי שמרגיש/ה בבית ליד אדם מסוים נושא/ת בפנים קיבולת לאהבה שרוב האנשים לא מסוגלים לה. ' + firstName + ', שמור/י על הקשר הזה — ועל עצמך בתוכו.'
        ]),
        'בטבע': pick([
            firstName + ', הטבע הוא ביתה של הנשמה הקדומה — ואתה/את מרגיש/ה זאת. כוכבים, ' + firstName + ': יש בך חיבור לאנרגיות גדולות יותר מהיומיום. המפה שנוצרה עבורך מבשרת: ברגע שתחזור/תחזרי לטבע, תקבל/י שם תשובה לשאלה שעומדת לפניך.',
            'הכוכבים רואים: מי שמרגיש/ה בבית בטבע נמצא/ת בהדהוד עם המקצבים הקוסמיים עצמם. ' + firstName + ', הפרק הבא בחייך יכיל יותר טבע — והוא יביא איתו בהירות.'
        ]),
        'בזיכרון': pick([
            firstName + ', הזיכרון שמרגיש כמו בית הוא לא חולשה — הוא ידיעה שמשהו יקר קרה. כוכבים, ' + firstName + ' נשמה שיש בה עומק היסטורי — שמרגישה את משקל הזמן. המפה שנוצרה עבורך: הזיכרון הזה הוא מפתח לפרק הבא, לא עוגן לעבר.',
            'הכוכבים מגלים: מי שחי/ה בזיכרון כבית, לומד/ת מהעבר באופן עמוק. ' + firstName + ', מה שלמדת/ה מהזמנים שהיו — הפרק הקרוב יזמין אותך ליישם.'
        ]),
        'במקום שלא קיים יותר': pick([
            firstName + ', מי שביתו/ה נעלם הוא/היא מי שכבר עבר/ה דרך האש ויצא/ה עם ידע שאחרים לא מסוגלים לו. כוכבים, ' + firstName + ': יש בך כח שנולד ממה שהיה ואינו עוד. המפה שנוצרה עבורך מבשרת: מה שנבנה הלאה יהיה חזק יותר ממה שהיה.',
            firstName + ' נושא/ת בתוכו/ה בית שנוצר ממה שאוהב — גם כשהוא אינו. זוהי עוצמה. הדרך שלפנייך מכילה בית חדש שייבנה על היסוד שכבר קיים בך.'
        ]),
        'עדיין מחפש/ת': pick([
            firstName + ', המחפשים הם הנביאים — כי הם לא מסכימים להתיישב במקום שאינו מתאים. כוכבים, ' + firstName + ' נשמה שיודעת שיש לה יעד, גם אם עוד לא ראתה אותו. המפה שנוצרה עבורך מבשרת: הבית שאתה/את מחפש/ת קיים — ואתה/את מתקרב/ת אליו.',
            'הכוכבים מגלים: ' + firstName + ' נמצא/ת בין שתי נחלות — זה שהיה, וזה שיהיה. המחפשים לא הולכים לאיבוד; הם ממפים שטחים שאחרים פחדו לגשת אליהם.'
        ])
    };
    const homeMapEn = {
        '\u05d1\u05e2\u05d9\u05e8 \u05e9\u05dc\u05d9': pick([
            firstName + ', your bond to your city is a root — the kind that allows a tree to grow tall. ' + firstName + ', a soul with deep commitment: to the earth, to the people, to identity. The map formed for you announces: your city will give you something in the coming year that you did not expect.',
            'The stars reveal: ' + firstName + ', one who feels at home in their city carries deep roots — and that is the foundation from which everything is possible. The path ahead grows from where you already are.'
        ]),
        '\u05d1\u05d7\u05d3\u05e8 \u05e9\u05dc\u05d9': pick([
            firstName + ', your room is a sanctuary — the space where your soul breathes without masks. ' + firstName + ', a creative, deeply thoughtful soul that heals in quiet. The map formed for you reveals: what is created in your room soon will reach others — and touch them.',
            'The stars see: one who feels at home in their room is one who knows themselves. ' + firstName + ', this is a rare gift. The next chapter of your life will invite you to share the inside with the world.'
        ]),
        '\u05dc\u05d9\u05d3 \u05d0\u05d3\u05dd \u05de\u05e1\u05d5\u05d9\u05dd': pick([
            firstName + ', your home is the energy of a person — this is the rarest kind of home. ' + firstName + ', a soul born for deep connection, for uncompromising love. The map formed for you announces: the connection that warms you right now is about to deepen further.',
            'The stars see: one who feels at home near a certain person carries within them a capacity for love that most people are not capable of. ' + firstName + ', protect that bond — and protect yourself within it.'
        ]),
        '\u05d1\u05d8\u05d1\u05e2': pick([
            firstName + ', nature is the home of the ancient soul — and you feel that. ' + firstName + ': there is in you a connection to forces larger than the everyday. The map formed for you announces: the moment you return to nature, you will receive there an answer to the question that stands before you.',
            'The stars see: one who feels at home in nature is in resonance with the cosmic rhythms themselves. ' + firstName + ', the next chapter of your life will contain more nature — and it will bring clarity with it.'
        ]),
        '\u05d1\u05d6\u05d9\u05db\u05e8\u05d5\u05df': pick([
            firstName + ', the memory that feels like home is not weakness — it is the knowledge that something precious happened. ' + firstName + ', a soul with historical depth — one that feels the weight of time. The map formed for you: that memory is a key to the next chapter, not an anchor to the past.',
            'The stars reveal: one who lives in a memory as home, learns from the past at a deep level. ' + firstName + ', what you have learned from the times that were — the coming chapter will invite you to apply.'
        ]),
        '\u05d1\u05de\u05e7\u05d5\u05dd \u05e9\u05dc\u05d0 \u05e7\u05d9\u05d9\u05dd \u05d9\u05d5\u05ea\u05e8': pick([
            firstName + ', one whose home has vanished is one who has already passed through the fire and emerged with knowledge others cannot access. ' + firstName + ': there is in you a strength born from what was and is no more. The map formed for you announces: what is built next will be stronger than what was.',
            firstName + ' carries within a home built from what was loved — even when it is no longer. That is power. The path ahead contains a new home that will be built on the foundation that already exists in you.'
        ]),
        '\u05e2\u05d3\u05d9\u05d9\u05df \u05de\u05d7\u05e4\u05e9/\u05ea': pick([
            firstName + ', seekers are the prophets — because they refuse to settle for a place that does not fit. ' + firstName + ', a soul that knows it has a destination, even if it has not yet seen it. The map formed for you announces: the home you seek exists — and you are getting closer.',
            'The stars reveal: ' + firstName + ' stands between two territories — what was, and what will be. Seekers do not get lost; they map terrain others feared to enter.'
        ])
    };
    const homeMsgHe = homeMap[aHome] || firstName + ', \u05ea\u05d7\u05d5\u05e9\u05ea \u05d4\u05d1\u05d9\u05ea \u05e9\u05dc\u05da \u05de\u05d3\u05d1\u05e8\u05ea \u05e2\u05dc \u05de\u05d4 \u05d4\u05db\u05d9 \u05de\u05d7\u05d6\u05d9\u05e7 \u05d0\u05d5\u05ea\u05da.';
    const homeMsgEn = homeMapEn[aHome] || firstName + ', where you feel at home speaks to what holds you most fundamentally. The search itself is a form of knowing.';

    // ── CHANGE interpretations: what's occupying the mind ──
    const aChange = toHe(answers.change || '');
    const changeMap = {
        'החלטה שדוחה אותי': pick([
            firstName + ', כוכבים מגלים: ההחלטה שמסרבת לרדת ממחשבתך אינה שם במקרה — היא שם כי היא בשלה. המפה שנוצרה עבורך מגלה: בסוף השבוע הקרוב יהיה לך רגע שבו הדבר הנכון לעשות יהיה ברור. בחר/בחרי לזהות אותו.',
            'הכוכבים מגלים: ' + firstName + ' ההחלטה הנדחית מכילה תוך תוכה את המפתח לפרק הבא. הדחייה אינה חולשה — אבל הגיע הזמן. הקוסמוס מגבה אותך בצעד הזה.'
        ]),
        'שינוי שמתקרב': pick([
            firstName + ', כוכבים מגלים: מי שמרגיש/ה שינוי לפני שהוא מגיע נמצא/ת בהדהוד עם הזרם הגדול. המפה שנוצרה עבורך מבשרת: השינוי המתקרב הוא אחד שסימנת/ה לעצמך מזמן. הוא מגיע. הכן/הכיני עצמך לפגוש אותו פתוח/ה.',
            firstName + ' בתקופה שבה הכל עומד להשתנות, נשמות שחשות את השינוי מראש הן הנשמות שמכוונות אותו. לא מוכנעים על ידו. אתה/את אחד/ת מהן.'
        ]),
        'מערכת יחסים': pick([
            firstName + ', כוכבים מגלים: מערכת היחסים שתופסת מקום בראשך כרגע מגיעה לנקודת מפנה. המפה שנוצרה עבורך מגלה: מה שלא נאמר עדיין — בפרק הקרוב תהיה לך הזדמנות לומר אותו. ואתה/את מוכן/ה.',
            'הכוכבים מגלים: ' + firstName + ' יש בך ידיעה על מערכת היחסים הזו שעדיין לא שיתפת/ה איתה. הפרק הקרוב יביא רגע שבו תוכל/תוכלי לעשות זאת. והתוצאה תפתיע אותך לטובה.'
        ]),
        'המקום שלי בעולם': pick([
            firstName + ', כוכבים מגלים: מי ששואל/ת "מה המקום שלי בעולם" הוא/היא מי שמוכן/ה לתפוס מקום גדול יותר ממה שתפס/ה עד עכשיו. המפה שנוצרה עבורך מגלה: המקום קיים. הוא ממתין לך.',
            firstName + ' הנשמה שלך תפסה תמיד מקום גדול יותר ממה שהציגה. הפרק הקרוב יזמין אותך להציג אותה במלואה.'
        ]),
        'משהו שצריך לשחרר': pick([
            firstName + ', כוכבים מגלים: מה שנושא/ת כרגע כבד ממה שהנשמה שלך יכולה לשאת לטווח ארוך. המפה שנוצרה עבורך מגלה: השחרור לא יוביל לריקנות — הוא יוביל לחופש שלא הרגשת/ה בתקופה ארוכה.',
            'הכוכבים מגלים: ' + firstName + ' מה שצריך להניח — ברגע שתניח/תניחי, יפתחו ידיים שיאפשרו לך לאחוז במה שממתין. הפרק הקרוב מכיל דבר חדש שדורש ידיים פנויות.'
        ]),
        'דבר שאני נמנע/ת ממנו': pick([
            firstName + ', כוכבים מגלים: הנמנעות שלך אינה חולשה — היא שמירה. אבל המפה שנוצרה עבורך מגלה: הגיע הזמן לגשת אל מה שנמנעת/ה ממנו. הוא כבר לא גדול כמו שנראה מרחוק.',
            firstName + ' מה שנמנעים ממנו לרוב מכיל בפנימיותו תשובה לשאלה הגדולה ביותר. הפרק הקרוב — גש/גשי אל מה שנמנעת/ה ממנו. אחת. ותראה/תראי.'
        ]),
        'תחושה שלא עוברת': pick([
            firstName + ', כוכבים מגלים: תחושה שאינה עוברת היא תחושה שנושאת מסר חיוני. המפה שנוצרה עבורך מגלה: התחושה הזו אינה עצרה — היא מצפן. היא מכוונת אותך לעבר מה שחשוב.',
            firstName + ' מה שמרגיש/ה ומסרב/ת לרדת הוא דבר שדורש הכרה — לא פתרון. הפרק הקרוב יביא מישהו שיאמר לך: כן, אני רואה.'
        ]),
        'אני עוד לא יודע/ת לקרוא לזה בשם': pick([
            firstName + ', כוכבים מגלים: מה שאין לו עדיין שם הוא גדול מדי לשם. הוא מסרב לתכולת המלים הרגילות. המפה שנוצרה עבורך מגלה: הפרק הקרוב יביא לך את השם — ואיתו, הבהירות.',
            'הכוכבים מגלים: ' + firstName + ' מה שאין לו שם הוא בדרך כלל החלק הכי חשוב בנשמה — זה שמעבר לשפה. תן/תני לו להיות. הוא יתגלה בזמן הנכון.'
        ])
    };
    const changeMapEn = {
        '\u05d4\u05d7\u05dc\u05d8\u05d4 \u05e9\u05d3\u05d5\u05d7\u05d4 \u05d0\u05d5\u05ea\u05d9': pick([
            firstName + ', the stars reveal: the decision that refuses to leave your mind is not there by accident — it is there because it is ripe. The map formed for you reveals: in the coming days there will be a moment when the right thing to do will be clear. Choose to recognise it.',
            'The stars reveal: ' + firstName + ', the postponed decision contains within it the key to the next chapter. Postponement is not weakness — but the time has come. The cosmos supports you in this step.'
        ]),
        '\u05e9\u05d9\u05e0\u05d5\u05d9 \u05e9\u05de\u05ea\u05e7\u05e8\u05d1': pick([
            firstName + ', the stars reveal: one who feels a change before it arrives is in resonance with the great current. The map formed for you announces: the approaching change is one you signed up for a long time ago. It is coming. Prepare yourself to meet it openly.',
            firstName + ', in a time when everything is about to shift, souls that sense the change in advance are the souls directing it. Not overwhelmed by it. You are one of them.'
        ]),
        '\u05de\u05e2\u05e8\u05db\u05ea \u05d9\u05d7\u05e1\u05d9\u05dd': pick([
            firstName + ', the stars reveal: the relationship occupying your mind right now is reaching a turning point. The map formed for you reveals: what has not yet been said — in the coming chapter you will have the opportunity to say it. And you are ready.',
            'The stars reveal: ' + firstName + ', there is something you know about this relationship that you have not yet shared. The coming chapter will bring a moment when you can. And the outcome will surprise you for the better.'
        ]),
        '\u05d4\u05de\u05e7\u05d5\u05dd \u05e9\u05dc\u05d9 \u05d1\u05e2\u05d5\u05dc\u05dd': pick([
            firstName + ', the stars reveal: one who asks "what is my place in the world" is one who is ready to claim more space than they have until now. The map formed for you reveals: that place exists. It is waiting for you.',
            firstName + ', your soul has always occupied more space than it has presented. The coming chapter will invite you to present it in full.'
        ]),
        '\u05de\u05e9\u05d4\u05d5 \u05e9\u05e6\u05e8\u05d9\u05da \u05dc\u05e9\u05d7\u05e8\u05e8': pick([
            firstName + ', the stars reveal: what you carry now is heavier than your soul can bear long-term. The map formed for you reveals: the release will not lead to emptiness — it will lead to a freedom you have not felt in a long time.',
            'The stars reveal: ' + firstName + ', what needs to be set down — once you set it down, hands will open that allow you to hold what is waiting. The coming chapter contains something new that needs free hands.'
        ]),
        '\u05d3\u05d1\u05e8 \u05e9\u05d0\u05e0\u05d9 \u05e0\u05de\u05e0\u05e2/\u05ea \u05de\u05de\u05e0\u05d5': pick([
            firstName + ', the stars reveal: your avoidance is not weakness — it is protection. But the map formed for you reveals: the time has come to approach what you have been avoiding. It is no longer as large as it appeared from a distance.',
            firstName + ', what we avoid most often contains within it the answer to the biggest question. The coming chapter — approach what you have been avoiding. Once. And see.'
        ]),
        '\u05ea\u05d7\u05d5\u05e9\u05d4 \u05e9\u05dc\u05d0 \u05e2\u05d5\u05d1\u05e8\u05ea': pick([
            firstName + ', the stars reveal: a feeling that will not pass is a feeling carrying a vital message. The map formed for you reveals: this feeling is not a stopping point — it is a compass. It is pointing you toward what matters.',
            firstName + ', what is felt and refuses to leave demands recognition — not resolution. The coming chapter will bring someone who will say to you: yes, I see.'
        ]),
        '\u05d0\u05e0\u05d9 \u05e2\u05d5\u05d3 \u05dc\u05d0 \u05d9\u05d5\u05d3\u05e2/\u05ea \u05dc\u05e7\u05e8\u05d0 \u05dc\u05d6\u05d4 \u05d1\u05e9\u05dd': pick([
            firstName + ', the stars reveal: what does not yet have a name is too large for a name. It refuses to fit inside ordinary words. The map formed for you reveals: the coming chapter will bring you the name — and with it, clarity.',
            'The stars reveal: ' + firstName + ', what has no name is usually the most important part of the soul — the part beyond language. Let it be. It will reveal itself at the right time.'
        ])
    };
    const changeMsgHe = changeMap[aChange] || firstName + ', \u05de\u05d4 \u05e9\u05de\u05e9\u05de\u05e9 \u05d0\u05ea \u05d4\u05de\u05d7\u05e9\u05d1\u05d5\u05ea \u05e9\u05dc\u05da \u05db\u05e8\u05d2\u05e2 \u05d4\u05d5\u05d0 \u05de\u05e6\u05e4\u05df \u2014 \u05dc\u05d0 \u05e0\u05d8\u05dc.';
    const changeMsgEn = changeMapEn[aChange] || firstName + ', what occupies your thoughts is not distraction — it is your mind pointing at something important. It deserves your attention.';

    // ── REQUEST interpretations: what the person needs ──
    const aRequest = toHe(answers.request || '');
    const requestMap = {
        'כיוון': pick([
            firstName + ', כוכבים מגלים נשמה שעומדת בצומת דרכים — לא כי היא אבודה, אלא כי היא גדולה מדי למסלול אחד. המפה שנוצרה עבורך מבשרת: הכיוון שאתה/את מחפש/ת לא מגיע מבחוץ — הוא מתגלה מתוך המפה שבנית לעצמך כאן.',
            firstName + ' זקוק/ה לכיוון — וזו הכרת אמת. המפה שנוצרה עבורך מגלה: תוך שלושה חודשים, נקודה אחת תהפוך ברורה יותר. הכן/הכיני עצמך לזהות אותה.'
        ]),
        'אומץ': pick([
            firstName + ', כוכבים מגלים: האומץ שאתה/את מחפש/ת כבר קיים בך — הוא פשוט ממתין לאות. המפה שנוצרה עבורך מבשרת: יש בך עוצמה שנצברה מכל מה שעברת/ה. הפעולה הנדרשת קטנה ממה שנדמה.',
            'הכוכבים מגלים: ' + firstName + ' עמד/ה כבר בפני דברים שדרשו אומץ — ועמד/ה בהם. המפה שלך מגלה: מה שמחכה לפנייך עכשיו קטן יותר מהם. אבל תחושת הפחד דומה. אמון/י.'
        ]),
        'שקט': pick([
            firstName + ', כוכבים מגלים: מה שנראה כצורך בשקט חיצוני הוא למעשה צורך בשקט פנימי — שהמחשבות יתיישבו. המפה שנוצרה עבורך מבשרת: הפרק הקרוב יביא שקט אם תבחר/תבחרי לפנות לו מרחב.',
            firstName + ' נמצא/ת בגל גבוה. כל הגלים נגמרים. גם זה. הפרק שאחריו יהיה שקט יותר — אבל הוא ידרוש שתעצור/תעצרי ותרשה/תרשי לאדים להתפזר.'
        ]),
        'אישור': pick([
            firstName + ', כוכבים, רואים: מי שמחפש/ת אישור הוא/היא מי שכבר יודע/ת — אבל עדיין לא סומך/ת על הידיעה שלו/שלה. המפה שנוצרה עבורך מגלה: האישור שאתה/את מחפש/ת יגיע — ברגע שתסמוך/כי על מה שכבר בפנים.',
            'הכוכבים מגלים: ' + firstName + ' ראוי/ה לאישור — וגם לתת אישור לעצמך. הפרק שלפנייך מכיל מישהו שיראה בך בדיוק מה שאתה/את מחפש/ת לשמוע. הכן/הכיני עצמך לקבל.'
        ]),
        'התחלה': pick([
            firstName + ', כוכבים מגלים: אתה/את עומד/ת בשער. לא לפניו — בשערו ממש. המפה שנוצרה עבורך מבשרת: ההתחלה שאתה/את מחפש/ת לא דורשת תנאים מיוחדים. היא דורשת רגל אחת. יש לך אותה.',
            firstName + ' כבר התחיל/ה — כאן, בשיטוט הזה, בשאלות שענית/ה. ההתחלה לא ממתינה לאחרי. היא כבר קרה. מה הצעד הבא?'
        ]),
        'שחרור': pick([
            firstName + ', כוכבים מגלים: מה שאתה/את צריך/ה לשחרר לא ייעלם עם השחרור — הוא יהפוך לחלק אחר של הסיפור שלך. המפה שנוצרה עבורך מגלה: השחרור קרב. הוא מחכה לרגע שתפנה/י לו.',
            firstName + ' נושא/ת משהו שאמור לרדת. לא מתוך כניעה — מתוך הבנה שמשקל זה אינו שלך. המפה שנוצרה עבורך מבשרת: לאחר השחרור, תרגיש/י אוויר שלא הרגשת/ה בזמן רב.'
        ]),
        'בהירות': pick([
            firstName + ', כוכבים מגלים: הבהירות שאתה/את מחפש/ת כבר נוצרה בתוכך בשיטוט הזה — בתשובות שנתת/ה, בבחירות שבחרת/ה. המפה שנוצרה עבורך היא הבהירות. הנח/הניחי לה לחדור.',
            'הכוכבים מגלים: ' + firstName + ' קרוב/ה לבהירות יותר ממה שנדמה. מה חסם אותה עד עכשיו? הפרק הקרוב יסיר מחסום אחד — וזה יספיק לגלות את כל השאר.'
        ]),
        'סימן קטן': pick([
            firstName + ', כוכבים מגלים: מי שמחפש/ת סימן, מתקשר/ת עם הקוסמוס ברמה של בטחון. אתה/את כבר קיבלת/ה את הסימן — הוא ה' + firstName + ' שנבנה כאן. מה הוא אומר לך?',
            firstName + ' — הסימן שאתה/את מחפש/ת כבר הופיע. שלוש פעמים בשבוע האחרון. הפעם הכר/י בו.'
        ])
    };
    const requestMapEn = {
        '\u05db\u05d9\u05d5\u05d5\u05df': pick([
            firstName + ', the stars reveal a soul standing at a crossroads — not because it is lost, but because it is too large for a single path. The map formed for you announces: the direction you seek does not come from outside — it reveals itself from within the map you have built here.',
            firstName + ' needs direction — and that is an act of truth. The map formed for you reveals: within three months, one point will become clearer. Prepare yourself to recognise it.'
        ]),
        '\u05d0\u05d5\u05de\u05e5': pick([
            firstName + ', the stars reveal: the courage you seek already exists in you — it is simply waiting for a signal. The map formed for you announces: there is a strength in you accumulated from everything you have been through. The action required is smaller than it appears.',
            'The stars reveal: ' + firstName + ' has already stood before things that demanded courage — and stood through them. The map shows: what awaits you now is smaller than those were. But the feeling of fear is similar. Trust.'
        ]),
        '\u05e9\u05e7\u05d8': pick([
            firstName + ', the stars reveal: what appears as a need for external quiet is really a need for internal quiet — for thoughts to settle. The map formed for you announces: the coming chapter will bring quiet if you choose to make space for it.',
            firstName + ' is riding a high wave. All waves end. So does this one. The chapter after it will be quieter — but it will ask you to stop and let the steam disperse.'
        ]),
        '\u05d0\u05d9\u05e9\u05d5\u05e8': pick([
            firstName + ', the stars see: one who seeks confirmation is one who already knows — but does not yet trust their knowing. The map formed for you reveals: the confirmation you seek will come — the moment you trust what is already inside.',
            'The stars reveal: ' + firstName + ' deserves confirmation — and also to give confirmation to yourself. The chapter ahead contains someone who will see in you exactly what you have been seeking to hear. Prepare to receive it.'
        ]),
        '\u05d4\u05ea\u05d7\u05dc\u05d4': pick([
            firstName + ', the stars reveal: you are standing at the gate. Not before it — at the very gate. The map formed for you announces: the beginning you seek does not require special conditions. It requires one foot. You have it.',
            firstName + ' has already begun — here, in this wandering, in the questions you answered. The beginning is not waiting for after. It has already happened. What is the next step?'
        ]),
        '\u05e9\u05d7\u05e8\u05d5\u05e8': pick([
            firstName + ', the stars reveal: what you need to release will not vanish with the release — it will become a different part of your story. The map formed for you reveals: the release is near. It awaits the moment you turn toward it.',
            firstName + ' carries something that needs to come down. Not from defeat — from understanding that this weight is not yours to hold. The map formed for you announces: after the release, you will feel air you have not felt in a long time.'
        ]),
        '\u05d1\u05d4\u05d9\u05e8\u05d5\u05ea': pick([
            firstName + ', the stars reveal: the clarity you seek was already created within you in this wandering — in the answers you gave, the choices you made. The map formed for you is the clarity. Allow it to settle.',
            'The stars reveal: ' + firstName + ' is closer to clarity than it seems. What has blocked it until now? The coming chapter will remove one obstacle — and that will be enough to reveal all the rest.'
        ]),
        '\u05e1\u05d9\u05de\u05df \u05e7\u05d8\u05df': pick([
            firstName + ', the stars reveal: one who seeks a sign is communicating with the cosmos at the level of trust. You have already received the sign — it is the ' + firstName + ' built here. What is it saying to you?',
            firstName + ' — the sign you seek has already appeared. Three times in the past week. This time, recognise it.'
        ])
    };
    const requestMsgHe = requestMap[aRequest] || firstName + ', \u05d4\u05e6\u05d5\u05e8\u05da \u05e9\u05d4\u05d1\u05e2\u05ea/\u05ea \u05d4\u05d5\u05d0 \u05e8\u05d9\u05d0\u05dc\u05d9. \u05d4\u05d5\u05d0 \u05de\u05d7\u05db\u05d4 \u05dc\u05da \u05dc\u05d4\u05db\u05d9\u05e8 \u05d1\u05d5.';
    const requestMsgEn = requestMapEn[aRequest] || firstName + ', the need you named is real — naming it is already the first step toward meeting it.';

    // ── DOUBT interpretations: how the person handles uncertainty ──
    const aDoubt = toHe(answers.doubt || '');
    const doubtMap = {
        'לשתוק': pick([
            firstName + ', כוכבים מגלים: מי שלשותק/ת כשמתלבט/ת מתנהל/ת מתוך עומק. לא חולשה — חכמת הבאר. המפה שנוצרה עבורך מגלה: בתוך השתיקה שלך נמצאת התשובה. הפעם היא בשלה לצאת.',
            firstName + ' שתיקתך בזמן ספק היא מכבד עצמי — אתה/את לא מדבר/ת לפני שאתה/את בטוח/ה. הפרק הקרוב יביא רגע שבו תדבר/תדברי, ויהיה לך ברור שהחלטת/ה נכון.'
        ]),
        'לברוח': pick([
            firstName + ', כוכבים מגלים: הבריחה שלך בזמן ספק היא לא פחדנות — היא אסטרטגיה ישנה של הנשמה. אבל המפה שנוצרה עבורך מגלה: מה שבורח/ת ממנו כרגע, הגיע הזמן לפגוש אותו. ואתה/את מוכן/ה.',
            firstName + ' הבריחה לימדה אותך להכיר מה מאיים ומה לא. עכשיו הגיע הזמן לשנות גישה: במקום לברוח, לגשת. התוצאה תפתיע אותך.'
        ]),
        'לחכות': pick([
            firstName + ', כוכבים מגלים: ההמתנה שלך בזמן ספק מגלה נשמה שיודעת שהזמן הנכון קיים. המפה שנוצרה עבורך מגלה: הזמן הנכון לפעולה שממתינה קרוב. היה/היי נכון/ה לזהות אותו.',
            firstName + ' ממתין/ה — ולפעמים ההמתנה היא הפעולה הנכונה. אבל הפרק הקרוב ידרוש שתזוז/תזזי לפני שהנוחות הושגה. הכן/הכיני עצמך.'
        ]),
        'לשאול מישהו': pick([
            firstName + ', כוכבים מגלים: מי שפונה לאחרים בספק יש בו/בה ענווה ויכולת לקשר. המפה שנוצרה עבורך מבשרת: האדם הנכון — שיתן לך את הפרספקטיבה שחסרה — מוכן לפגוש אותך. אפשר לפנות.',
            firstName + ' יודע/ת שחכמה באה גם מאחרים. זוהי מתנה. הפרק הקרוב יביא שיחה שתשנה משהו.'
        ]),
        'לפעול מהר': pick([
            firstName + ', כוכבים מגלים: הפעולה המהירה שלך בזמן ספק מגלה נשמה שמוכנה לקחת אחריות. המפה שנוצרה עבורך: העוצמה הזו תשרת אותך — אם תקדים/תקדימי אותה בשנייה אחת של עצירה.',
            firstName + ' פועל/ת מהר כי הספק מפחיד אותך. זה הגיוני. אבל הפרק הקרוב ידרוש שנייה אחת נוספת של עצירה — ותגלה/תגלי שהפעולה הנכונה שונה מהמהירה.'
        ]),
        'להתעלם': pick([
            firstName + ', כוכבים מגלים: ההתעלמות לפעמים מאפשרת לדברים לא-חשובים לפוג. אבל המפה שנוצרה עבורך מגלה: מה שמסרב לפוג הפעם — אינו פוג. הוא מבשר. הגיע הזמן לפנות אליו.',
            firstName + ' הדבר שהתעלמת/ה ממנו כבר שלוש פעמים — הפעם אל תתעלם/תתעלמי. בתוכו יש תשובה חשובה.'
        ]),
        'לבכות': pick([
            firstName + ', כוכבים מגלים: דמעות בזמן ספק הן לא חולשה — הן פינוי של מקום. מי שמסוגל/ת לבכות בזמן קושי מסוגל/ת גם לפרוח אחרי. המפה שנוצרה עבורך מגלה: מה שנשפך בדמעות יפנה מקום לדבר חדש.',
            firstName + ' הדמעות שלך הן קדושות — הן מוכיחות שאתה/את אכפתי/ת, שאתה/את אמיתי/ת. הפרק הקרוב יביא רגע של הקלה שיגיע בדיוק בעקבות הפינוי.'
        ]),
        'להתכנס פנימה': pick([
            firstName + ', כוכבים מגלים: מי שמתכנס/ת פנימה בזמן ספק הוא/היא מי שמוצא/ת תשובות שם. המפה שנוצרה עבורך מגלה: בפנים, בשכבה העמוקה, יש תשובה שמחכה. היא בשלה.',
            firstName + ' ההתכנסות שלך בזמן קושי היא מסלול הבשלה. הפרק הקרוב ידרוש שתוציא/תוציאי מה שהבשיל — ושתשתף/תשתפי אותו.'
        ])
    };
    const doubtMapEn = {
        '\u05dc\u05e9\u05ea\u05d5\u05e7': pick([
            firstName + ', the stars reveal: those who go silent when uncertain are listening to something others cannot hear. Your silence is not passivity — it is depth. The map formed for you reveals: what you hear in the quiet will guide you more precisely than any advice.',
            firstName + ', silence in the face of doubt is not surrender — it is strategy. The coming chapter will show you that what you held inside was right.'
        ]),
        '\u05dc\u05d1\u05e8\u05d5\u05d7': pick([
            firstName + ', those who move when uncertain are in motion before the decision — and motion is information. The map formed for you reveals: the direction you are moving in is telling you something about where you actually want to be.',
            firstName + ', what looks like running away is sometimes the body leading before the mind catches up. The coming chapter: follow where you go.'
        ]),
        '\u05dc\u05d7\u05db\u05d5\u05ea': pick([
            firstName + ', waiting in the face of doubt is one of the highest forms of knowing. The stars reveal: the wait you give yourself is productive, not passive. The map formed for you reveals: what you are waiting for is approaching. The timing is yours to receive.',
            firstName + ', patience in uncertainty is not indecision — it is wisdom. The coming chapter will show that what arrived in its own time was exactly right.'
        ]),
        '\u05dc\u05e9\u05d0\u05d5\u05dc \u05de\u05d9\u05e9\u05d4\u05d5': pick([
            firstName + ', those who ask others when uncertain know one truth: wisdom exists in many forms. The stars reveal: the person you will ask in the coming chapter will give you a piece of understanding you had not yet found on your own.',
            firstName + ', asking is not weakness — it is openness. The coming chapter contains a conversation that will clarify something you have been circling for a while.'
        ]),
        '\u05dc\u05e4\u05e2\u05d5\u05dc \u05de\u05d4\u05e8': pick([
            firstName + ', those who act fast when uncertain are souls that trust motion. The stars reveal: your instinct is more calibrated than it appears. The map formed for you reveals: the fast move you made, or will make — trust it.',
            firstName + ', speed in the face of doubt is a form of courage. The coming chapter will confirm that action at the right moment was exactly what was needed.'
        ]),
        '\u05dc\u05d4\u05ea\u05e2\u05dc\u05dd': pick([
            firstName + ', those who ignore doubt are not in denial — they are choosing their battles. The stars reveal: there is one thing you have been ignoring that deserves more attention than you have given it. The map formed for you reveals: the moment you turn toward it, it will be smaller than it looked.',
            firstName + ', ignoring can be protection or avoidance. The coming chapter will make clear which one this is — and give you the opportunity to address it.'
        ]),
        '\u05dc\u05d1\u05db\u05d5\u05ea': pick([
            firstName + ', tears in the face of uncertainty are not weakness — they are pressure releasing so clarity can enter. The stars reveal: what is released in tears carries out what was blocking the answer. The map formed for you reveals: after the release, something will become clear.',
            firstName + ', crying when uncertain is the body knowing before the mind does. The coming chapter will bring a moment of clarity that comes after a moment of honesty.'
        ]),
        '\u05dc\u05d4\u05ea\u05db\u05e0\u05e1 \u05e4\u05e0\u05d9\u05de\u05d4': pick([
            firstName + ', those who turn inward when uncertain are those who find answers there. The map formed for you reveals: inside, in the deep layer, there is an answer that is ripe.',
            firstName + ', turning inward in difficulty is a path of ripening. The coming chapter will ask you to bring out what has ripened — and share it.'
        ])
    };
    const doubtMsgHe = doubtMap[aDoubt] || firstName + ', \u05d4\u05d3\u05e8\u05da \u05e9\u05d1\u05d4 \u05d0\u05ea\u05d4/\u05d0\u05ea \u05de\u05d2\u05d9\u05d1/\u05d4 \u05dc\u05e1\u05e4\u05e7 \u05de\u05d2\u05dc\u05d4 \u05de\u05e9\u05d4\u05d5 \u05e2\u05dc \u05de\u05d4 \u05d0\u05ea\u05d4/\u05d0\u05ea \u05de\u05d2\u05df \u05e2\u05dc\u05d9\u05d5.';
    const doubtMsgEn = doubtMapEn[aDoubt] || firstName + ', the way you respond to uncertainty is not a flaw — it is a pattern worth knowing. It reveals where your instinct lives.';

    // ── DREAM interpretations: deepest aspiration ──
    const aDream = toHe(answers.dream || '');
    const dreamMap = {
        'חופש': pick([
            firstName + ', חופש הוא לא היעדר מחויבויות — הוא נוכחות של בחירה. הכוכבים שלך מגלים נשמה שלמדה מה זה להרגיש כלואה, ועכשיו — מתגעגעת לאוויר. המפה שנוצרה עבורך מבשרת: הדרך לחופש שאתה/את מחפש/ת מתחילה בהחלטה פנימית אחת שטרם קיבלת/ה.',
            'שאיפתך לחופש אינה בריחה — היא שאיפה קוסמית. ' + firstName + ', הכוכבים רואים: אתה/את כבר חצית/ה את רוב הדרך. שלב אחד נוסף של אומץ, ואת/ה שם.'
        ]),
        'אהבה': pick([
            firstName + ', האהבה שאתה/את שואפ/ת אליה אינה מקרה — היא כח גרביטציה. כוכבים, ' + firstName + ' נשמה שמוכנה לאהוב עמוק, מלא, ומשחרר. המפה שלך מבשרת: מה שבא אלייך קרוב יותר ממה שנדמה.',
            firstName + ' נושא/ת בפנים יכולת לאהוב שהיא גדולה ממה שנראה בחוץ. שאיפתך לאהבה היא לא חולשה — היא העוצמה הגדולה ביותר שיש. הדרך שלפנייך מכילה חיבור שיפתיע אותך.'
        ]),
        'יצירה': pick([
            firstName + ', היצירה שואבת אותך כי היא אמיתית בך יותר מכל דבר אחר. הכוכבים רואים: אתה/את אמן/ית של הקיום — גם בלי לדעת זאת. המפה שנוצרה עבורך בנויה מאותה יצירתיות שבחרת/ה. הדרך שלפנייך מבקשת שתפנה/י לה יותר מרחב.',
            'שאיפתך ליצירה אינה ילדותית — היא נבואית. ' + firstName + ', מי שנמשך/ת ליצירה בשאיפתו/ה העמוקה ביותר, בדרך כלל נושא/ת מסר שהעולם זקוק לו. מה המסר שלך?'
        ]),
        'שקט': pick([
            firstName + ', שקט הוא לא ריקנות — הוא מלאות. כוכבים, ' + firstName + ' נשמה שיודעת שהאמת הכי עמוקה לא נשמעת בצעקה. המפה שנוצרה עבורך מגלה: הדרך לשקט שאתה/את מחפש/ת כבר נמצאת בך. אתה/את רק צריך/ה להוריד שכבה אחת.',
            'שאיפתך לשקט היא שאיפה של מי שיודע/ת שבתוך הדממה יש תשובות. ' + firstName + ', הכוכבים מבשרים: הפרק הבא בחייך יכניס לך יותר שקט מהפרקים הקודמים. אבל הוא ידרוש שתחליט/י לעצור.'
        ]),
        'הצלחה': pick([
            firstName + ', ההצלחה שאתה/את שואפ/ת אליה גדולה יותר ממה שאתה/את מרשה/ה לעצמך לדמיין. כוכבים, ' + firstName + ': העוצמה שבך מגוייסת לגמרי — רק המנגנון הפנימי עדיין מחכה לפתיחת הנתיב הנכון. המפה שנוצרה עבורך מגלה: הנתיב כבר שם.',
            'שאיפתך להצלחה אינה יהירות — היא מצפן. ' + firstName + ', הכוכבים רואים: אתה/את בנקודת מפנה. ההחלטות שתקבל/י בשלושת החודשים הקרובים יגדירו את הנרטיב של הפרק הגדול הבא.'
        ]),
        'חיבור': pick([
            firstName + ', החיבור שאתה/את מחפש/ת הוא אחד המניעים הקדומים ביותר של הנשמה האנושית. הכוכבים רואים בך מי שמסוגל/ת לחיבורים עמוקים ואמיתיים — ואולי עייפת/ה מחיבורים שטחיים. המפה שלך מגלה: אנשים שיתחברו אלייך ברמה האמיתית קרובים ממה שנדמה.',
            'שאיפתך לחיבור מגלה נשמה שיודעת שהיא לא נועדה ללכת לבד. ' + firstName + ', הכוכבים מבשרים: חיבור אמיתי אחד, שיתרחש בפרק הקרוב, ישנה את כל התמונה.'
        ])
    };
    const dreamMapEn = {
        '\u05d7\u05d5\u05e4\u05e9': pick([
            firstName + ', freedom is not the absence of commitment — it is the presence of choice. Your stars reveal a soul that has learned what it is to feel constrained, and is now longing for air. The map formed for you announces: the path toward the freedom you seek begins with one inner decision not yet made.',
            firstName + ', your aspiration for freedom is not escape — it is a cosmic aspiration. The stars see: you have already crossed most of the way. One more step of courage, and you are there.'
        ]),
        '\u05d0\u05d4\u05d1\u05d4': pick([
            firstName + ', the love you aspire to is not coincidence — it is a gravitational force. ' + firstName + ', a soul ready to love deeply, fully, and with freedom. The map announces: what is coming toward you is closer than it appears.',
            firstName + ' carries within a capacity to love that is larger than what appears on the surface. Your aspiration for love is not weakness — it is the greatest strength there is. The path ahead contains a connection that will surprise you.'
        ]),
        '\u05d9\u05e6\u05d9\u05e8\u05d4': pick([
            firstName + ', creation draws you because it is more real in you than anything else. The stars see: you are an artist of existence — even without knowing it. The map formed for you is built from that same creativity you chose. The path ahead asks you to give it more space.',
            firstName + ', your aspiration for creation is not childish — it is prophetic. One who is drawn to creation in their deepest aspiration usually carries a message the world needs. What is yours?'
        ]),
        '\u05e9\u05e7\u05d8': pick([
            firstName + ', quiet is not emptiness — it is fullness. ' + firstName + ', a soul that knows the deepest truth is not heard in noise. The map formed for you reveals: the path to the quiet you seek is already within you. You only need to lower one layer.',
            firstName + ', your aspiration for quiet is the aspiration of one who knows that in stillness there are answers. The stars announce: the next chapter of your life will bring more quiet than the previous ones. But it will ask you to decide to stop.'
        ]),
        '\u05d4\u05e6\u05dc\u05d7\u05d4': pick([
            firstName + ', the success you aspire to is larger than you allow yourself to imagine. ' + firstName + ': the strength within you is fully mobilised — only the inner mechanism is still waiting for the right path to open. The map formed for you reveals: the path is already there.',
            firstName + ', your aspiration for success is not arrogance — it is a compass. The stars see: you are at a turning point. The decisions you make in the coming months will define the narrative of the next great chapter.'
        ]),
        '\u05d1\u05d9\u05ea': pick([
            firstName + ', the longing for a home you can truly rest in is one of the soul\'s deepest callings. The stars see in you someone who knows what it means to feel untethered — and who is ready to build something lasting. The map reveals: the foundations are already within you.',
            firstName + ', home is not always a place. The coming chapter will show you that what you were seeking was also something within you that was waiting to be recognised.'
        ]),
        '\u05d1\u05e8\u05d9\u05d0\u05d5\u05ea': pick([
            firstName + ', the body keeps the score of everything the soul has carried. The aspiration for health is often the soul\'s way of saying: I want to be present for what comes next. The map formed for you reveals: a gentle return to your body will open something unexpected.',
            firstName + ', health is not just the absence of illness — it is the presence of vitality. The coming chapter contains something that will reconnect you to the energy you have been missing.'
        ]),
        '\u05de\u05e9\u05de\u05e2\u05d5\u05ea': pick([
            firstName + ', the aspiration for meaning is the most honest aspiration there is — it means you refuse to move through life on the surface. The stars reveal: meaning is not found, it is built. And you are already building it here.',
            firstName + ', those who seek meaning are the ones who give it to others. The coming chapter will bring you an encounter that makes your why clearer than it has been in years.'
        ]),
        '\u05e9\u05dc\u05d5\u05dd \u05e4\u05e0\u05d9\u05de\u05d9': pick([
            firstName + ', inner peace is not a destination — it is a practice of return. The stars reveal: you have touched it before, and you will touch it again. The map formed for you reveals: the path back to it is shorter than it feels.',
            firstName + ', the aspiration for inner peace means you know there is something quieter and truer beneath the noise. The coming chapter will give you at least one moment of genuine stillness. Let it land.'
        ]),
        '\u05d7\u05d9\u05d1\u05d5\u05e8': pick([
            firstName + ', the connection you aspire to is one of the oldest drivers of the human soul. The stars see in you someone capable of deep and genuine connections — and perhaps tired of surface ones. The map reveals: people who will connect with you at the real level are closer than they seem.',
            firstName + ', your aspiration for connection reveals a soul that knows it was not meant to walk alone. The stars announce: one genuine connection, arriving in the coming chapter, will change the whole picture.'
        ])
    };
    const dreamMsgHe = dreamMap[aDream] || firstName + ', \u05d4\u05e9\u05d0\u05d9\u05e4\u05d4 \u05e9\u05dc\u05da \u2014 \u05d2\u05dd \u05d0\u05dd \u05e2\u05d5\u05d3 \u05dc\u05d0 \u05e7\u05d9\u05d1\u05dc\u05d4 \u05e9\u05dd \u2014 \u05db\u05d1\u05e8 \u05de\u05e0\u05d9\u05e2\u05d4 \u05d0\u05d5\u05ea\u05da.';
    const dreamMsgEn = dreamMapEn[aDream] || firstName + ', your aspiration — even if it has no name yet — is already moving you. It is a compass, not just a wish.';

    // ── UNRESOLVED interpretations: where clarity is needed ──
    const aUnresolved = toHe(answers.unresolved || '');
    const unresolvedMap = {
        'מערכות יחסים': pick([
            firstName + ', כוכבים מגלים: הבהירות שחסרה לך במערכות יחסים מסמנת פרק שבו מה שלא אמרת/ה מבקש לצאת. המפה שנוצרה עבורך מגלה: הרגע הנכון לאמת הזו מתקרב — וכשיגיע, אתה/את תדע/תדעי.',
            'הכוכבים מגלים: ' + firstName + ' הבהירות שמחפש/ת במערכות יחסים תגיע ברגע שתבחר/תבחרי לומר את מה שעוד לא נאמר. הפרק הקרוב מכיל שיחה שתשנה הכל.'
        ]),
        'הקריירה שלי': pick([
            firstName + ', כוכבים מגלים: הבהירות שחסרה בקריירה מגיעה מהפרש בין מה שנבנה ובין מה שמבקש להיבנות. המפה שנוצרה עבורך מגלה: הכיוון הנכון כבר ידוע לך — הוא רק ממתין לאישורך.',
            firstName + ' הקריירה שלך עומדת בפרק של מפנה. לא ניתן לדחות אותו — ולא כדאי. הפרק הקרוב מכיל הזדמנות שתתאים לנשמה שלך יותר מכל דבר שהיה עד כה.'
        ]),
        'מי אני': pick([
            firstName + ', כוכבים מגלים: מי ששואל/ת "מי אני" הוא/היא מי שכבר עבר/ה את הגרסה הפשוטה של עצמו/ה ומגיע/ה לגרסה העמוקה. המפה שנוצרה עבורך מגלה: הגרסה הזו מתגלה בסיפור שנבנה כאן.',
            'הכוכבים מגלים: ' + firstName + ' "מי אני" היא שאלה חיה — היא אינה מקבלת תשובה אחת. הפרק הקרוב יוסיף שכבה חדשה לתשובה, ואיתה — יותר שלמות.'
        ]),
        'לאן אני הולך/ת': pick([
            firstName + ', כוכבים מגלים: הכיוון שאתה/את מחפש/ת מסומן בכוכבים שנוצרו כאן עבורך. כל בחירה שבחרת/ה הייתה חלק מהמפה הזו. הדרך שלפנייך מכילה את מה שתמיד חיפשת/ה — רק בצורה שעדיין לא ציפית לה.',
            firstName + ' הדרך שלפנייך אינה מקרית. היא נבנית מהתשובות שנתת/ה כאן. כל כוכב ב' + firstName + ' הוא נקודה על הדרך הזו.'
        ]),
        'מה שהיה': pick([
            firstName + ', כוכבים מגלים: מה שהיה הוא הבסיס — לא הגג. המפה שנוצרה עבורך מגלה: הפרק הקרוב יאפשר לך לראות את העבר שלך לא כעוגן, אלא כגשר.',
            'הכוכבים מגלים: ' + firstName + ' הבהירות על מה שהיה תגיע ברגע שתבחר/תבחרי לשחרר את הצורך להבין הכל. לפעמים מה שקרה לא זקוק להסבר — רק להכרה.'
        ]),
        'מה שיהיה': pick([
            firstName + ', כוכבים מגלים: מה שיהיה כבר מתעצב — ואתה/את חלק מהעיצוב הזה. המפה שנוצרה עבורך אינה ניחוש — היא בניה. כל תשובה שנתת/ה היא לבנה.',
            firstName + ' הבהירות על מה שיהיה לא תגיע דרך ידיעה — היא תגיע דרך בניה. הפרק הקרוב: בנה/בני. צעד קטן, בכוונה.'
        ]),
        'עצמי': pick([
            firstName + ', כוכבים מגלים: הבהירות על עצמך היא הבהירות הנדירה ביותר — ולך יש את הכלים לה. המפה שנוצרה עבורך היא ראי: מה שראית/ה בה הוא לא אקראי.',
            'הכוכבים מגלים: ' + firstName + ' הבהירות על עצמך מגיעה בגלים. הגל הבא מתקרב. והפעם הוא יביא איתו שכבה שלא ידעת/ה שהיא שם.'
        ]),
        'כל הנ"ל': pick([
            firstName + ', כוכבים מגלים: נשמה שמחפשת בהירות בכל הממדים בו-זמנית נמצאת בשלב של עיבוד גדול. המפה שנוצרה עבורך מגלה: לא הכל יתברר בבת-אחת — אבל חלק אחד, הפרק הקרוב, יהיה ברור מאוד.',
            firstName + ' מי שזקוק/ה לבהירות בכל מקום בו-זמנית — הוא/היא נשמה שעוברת שינוי רדיקלי. תן/תני לו להתרחש. הכוכבים מגבים.'
        ])
    };
    const unresolvedMapEn = {
        '\u05de\u05e2\u05e8\u05db\u05d5\u05ea \u05d9\u05d7\u05e1\u05d9\u05dd': pick([
            firstName + ', the stars reveal: the clarity missing for you in relationships marks a chapter where what has not been said is asking to emerge. The map formed for you reveals: the right moment for this truth is approaching — and when it comes, you will know.',
            firstName + ', the clarity you seek in relationships will come the moment you choose to say what has not yet been said. The coming chapter contains a conversation that will change everything.'
        ]),
        '\u05d4\u05e7\u05e8\u05d9\u05d9\u05e8\u05d4 \u05e9\u05dc\u05d9': pick([
            firstName + ', the stars reveal: the clarity missing in your career comes from the gap between what has been built and what is asking to be built. The map formed for you reveals: the right direction is already known to you — it is only waiting for your confirmation.',
            firstName + ', your career is standing at a pivot point. It cannot be postponed — and it should not be. The coming chapter contains an opportunity that will fit your soul more than anything before.'
        ]),
        '\u05de\u05d9 \u05d0\u05e0\u05d9': pick([
            firstName + ', the stars reveal: one who asks "who am I" has already moved beyond the simple version of themselves and is arriving at the deeper one. The map formed for you reveals: this version is revealing itself in the story being built here.',
            firstName + ', "who am I" is a living question — it does not receive a single answer. The coming chapter will add a new layer to the answer, and with it — more wholeness.'
        ]),
        '\u05dc\u05d0\u05df \u05d0\u05e0\u05d9 \u05d4\u05d5\u05dc\u05da/\u05ea': pick([
            firstName + ', the stars reveal: the direction you seek is marked in the stars formed here for you. Every choice you made was part of this map. The path ahead contains what you have always sought — only in a form you have not yet expected.',
            firstName + ', the path before you is not random. It is being built from the answers you gave here. Every star in ' + firstName + ' is a point on that path.'
        ]),
        '\u05de\u05d4 \u05e9\u05d4\u05d9\u05d4': pick([
            firstName + ', the stars reveal: what was is the foundation — not the ceiling. The map formed for you reveals: the coming chapter will allow you to see your past not as an anchor, but as a bridge.',
            firstName + ', the clarity about what was will come the moment you choose to release the need to understand everything. Sometimes what happened does not need explanation — only recognition.'
        ]),
        '\u05de\u05d4 \u05e9\u05d9\u05d4\u05d9\u05d4': pick([
            firstName + ', the stars reveal: what will be is already taking shape — and you are part of that shaping. The map formed for you is not a guess — it is a construction. Every answer you gave is a building block.',
            firstName + ', clarity about what will be will not come through knowing — it will come through building. The coming chapter: build. One small step, with intention.'
        ]),
        '\u05d4\u05db\u05d5\u05dc': pick([
            firstName + ', the stars reveal: a soul seeking clarity in every dimension simultaneously is in a phase of major processing. The map formed for you reveals: not everything will become clear at once — but one part, in the coming chapter, will be very clear.',
            firstName + ', one who needs clarity everywhere simultaneously is a soul going through a radical transformation. Allow it to happen. The stars support it.'
        ])
    };
    const unresolvedMsgHe = unresolvedMap[aUnresolved] || firstName + ', \u05d4\u05e6\u05d5\u05e8\u05da \u05d1\u05d1\u05d4\u05d9\u05e8\u05d5\u05ea \u05e9\u05d7\u05e9\u05ea/\u05ea \u05d4\u05d5\u05d0 \u05ea\u05d6\u05db\u05d5\u05e8\u05ea \u05e9\u05d9\u05e9 \u05e9\u05dd \u05d3\u05d1\u05e8 \u05e9\u05d3\u05d5\u05e8\u05e9 \u05e0\u05d5\u05db\u05d7\u05d5\u05ea.';
    const unresolvedMsgEn = unresolvedMapEn[aUnresolved] || firstName + ', the clarity you seek is real. Sitting with the question is already part of the answer.';

    // ── BIRTH MONTH interpretation (from dob question) ──
    const birthMonth = answers.dob ? new Date(answers.dob).getMonth() + 1 : 0;
    const monthMapHe = {
        1:  firstName + ', ינואר הוא חודש של ראשיתות שנולדות מתוך הקור — שלג שמכסה, אבל שורשים שגדלים. מי שנולד/ה בינואר יודע/ת שהסוד הוא הסבלנות. הפרק שמגיע עבורך יידרוש אותה.',
        2:  firstName + ', פברואר הוא החודש שבין — לא חורף ולא אביב. אנשי פברואר חיים בין עולמות ויודעים לנווט בשני מקביל. הכוכבים מראים: הגבול שמציק לך הוא בדיוק המקום שבו תמצא/י את החלק הבא שלך.',
        3:  firstName + ', מרץ הוא חודש הפריחה שלא מבקשת רשות — היא פורצת. נולדת/ה בחודש שמגלם אומץ טבעי. הצורה שנוצרה כאן מגלה: יש בך כוח שמחכה לאות. האות הגיע.',
        4:  firstName + ', אפריל הוא חודש הגשם שמכין את האדמה לקציר. מי שנולד/ה בו/בה מבינ/ה שהתנאים הקשים הם ההכנה. הקונסטלציה שלך מגלה: מה שגדל עכשיו הוא כבר שם — הוא רק ממתין לרגע הנכון.',
        5:  firstName + ', מאי הוא שיא הבריחה לתוך החיים — כוחות שנפתחים, צבעים שמוצפים, חושים שמתחדדים. אנשי מאי הם עמוקים ועדינים בו-זמנית. הכוכבים מראים: אתה/את בשיא הכוח הטבעי שלך.',
        6:  firstName + ', יוני הוא חודש של אמצע — האור הכי ארוך, הכוח בשיאו. מי שנולד/ה ביוני מנהל/ת ניגודים פנימיים בחן. הכוכבים מגלים: מה שנראה כחלוקה הוא בעצם שלמות של שני פנים.',
        7:  firstName + ', יולי הוא חום שלא מתנצל — ישיר, עמוק, מוחשי. אנשי יולי מרגישים כל דבר בעוצמה. הפרק שמגיע מגלה: העוצמה הזו היא המתנה, לא הנטל.',
        8:  firstName + ', אוגוסט הוא שיא הקיץ — רגע לפני פנייה. מי שנולד/ה באוגוסט חי/ה על הסף בין שני עידנים. הכוכבים מגלים: השינוי שמרגיש/ה בא — הוא כבר כאן.',
        9:  firstName + ', ספטמבר הוא תחילת הקצירה אחרי הגידול. אנשי ספטמבר יודעים לקחת מה שגדלו ולהפוך אותו למוחשי. הקונסטלציה מגלה: הגיע הזמן לאסוף מה שצמח בשנים האחרונות.',
        10: firstName + ', אוקטובר הוא זמן של עלים שנושרים מבחירה — לא כישלון, אלא שחרור. מי שנולד/ה בו/ה הוא/היא מאסטר/ית של שחרור. הכוכבים מגלים: מה שאתה/את מוכן/ה לשחרר פותח מרחב לדבר הבא.',
        11: firstName + ', נובמבר הוא חושך שמכיל אור — ירח ולא שמש. אנשי נובמבר הם נביאי הפנים, מי שמכיר/ה את האמת לפני שהיא מגיעה לאחרים. הקונסטלציה אומרת: הידיעה שיש בך — סמוך/י עליה.',
        12: firstName + ', דצמבר הוא סוף וראשית בו-זמנית — ה-12 חודשים הולכים, ה-12 הבאים כבר בדרך. מי שנולד/ה בדצמבר נושא/ת בתוכו/ה גם סיכום וגם הבטחה. הכוכבים אומרים: הפרק הבא גדול מהקודם.'
    };
    const monthMsgHe = monthMapHe[birthMonth] || '';

    // ── PAREIDOLIA WORD — specific tarot interpretation ──
    const _rawVision = (answers.pareidolia || '').trim();
    const _cleanVision = _rawVision.replace(/^ה/, ''); // remove definite article if present
    
    const pareidoliaWordMap = {
        // ── ANIMALS ──
        'חתול': firstName + ', החתול הוא יצור שחי בשני עולמות בוזמנית ובבודד. מי שרואה/ת חתול בכוכבים יודע/ת לנווט בין עצמאיות לבין חיבור. הקונסטלציה מגלה: יש לך יכולת לשמור על עצמך/עצמך באותו זמן שאתה/את נותן/ת לאחרים.',
        'כלב': firstName + ', הכלב בכוכבים מסומן נאמנות שלא מוותרת עליך. אבל הנאמנות הזו דורשת שתדע/י למי אתה/את נאמן/ת. הקונסטלציה שואלת: למי אתה/את נותן/ת את הלב המלא?',
        'ציפור': firstName + ', הציפור רואה את העולם מגובה ומסייעת שמשיכת בעצמך את היכולת לראות מעל. מודעת/י שיש מקום שאתה/את שייכת/ת להגיע אליו. השאלה היא: מה מונע ממך לעוף?',
        'דג': firstName + ', הדג שוחה בבו -זמנית בשדות הנראים ובסתרים. מי שרואה/ת דג יודע/ת לנווט באי -ודאות בלי לאבד את העצמאיות. הקונסטלציה מגלה: הזרימה שאתה/את מרגיש/ת דוחפת אותך/אותך היא הפרק הבא.',
        'פרפר': firstName + ', הפרפר הוא סמל השינוי שבא מבפנים ולא מבחוץ. הכנפיים לא ניתנו לפרפר מבחוץ הין נבנו באפלה. מי שראה/ת פרפר בכוכבים נושא/ת בתוכו הכוח להפוך משהו שנסגר ליפהי כנפות.',
        'נחש': firstName + ', הנחש אינו סכנה אלא סמל של התחדשות. כל התחלה חדשה קדמה לה שלב שהשיל עור ישן. הקונסטלציה אומרת: שלב השילול כבר קרה, השלב הבא שלך פתוח.',
        'אריה': firstName + ', האריה בכוכבים הוא סמל של מנהיגות שלא מתנצלת על עצמה. יש בך כוח שלא יצא אל הפועל במלואו. הקונסטלציה שואלת: מה היה רוצה/ה להגנ או להוביל?',
        'דב': firstName + ', הדב הוא כוח שלא מוכיח את עצמו ולא זקוק לאישור. יש בך משאבות שאינם זקוקים להוכחה. הקונסטלציה מגלה: סמוך/י על הכוח הפנימי הזה, הוא אמיתי.',
        'סוס': firstName + ', הסוס רץ ללא שהוכיח שהוא רץ. יש בך אנרגיה צבורה שמחכה לרגע שתדע/י לאן. הקונסטלציה אומרת: הרגע כבר כאן.',
        'ינשוף': firstName + ', הינשוף רואה בחושך מה שאחרים מפספים לראות באור. יש בך חכמה שלא צריכה להוכח. הקונסטלציה אומרת: סמוך/י על מה שאתה/את יודע/ת מעבר לירח הזה.',
        'דולפין': firstName + ', הדולפין הוא יצור שחי בשעשוע ובחוכמה בוזמנית. גם ברגעים שנראים כבדים, יש בך יכולת לנווט בחן. הקונסטלציה אומרת: השמחה אינה מותרות, היא זכות.',
        'צב': firstName + ', הצב מלמד אותך: הבית של הצב אינו עצלנות, הוא שלמות. איטיות אינה אויב אלא בחירה להיות נוכח לחלוטין. הקונסטלציה מגלה: הקצב הנכון לך הוא קצבך/קצבך הפנימי.',
        'עכביש': firstName + ', העכביש בונה ברשתות מורכבות משריגים דקים בשקט. יש בך יכולת לבנות משהו שלמו לא רואים עד שהוא מוכן. הקונסטלציה אומרת: הרשתת שאתה/את אורג/ת היא קסים.',
        // ── NATURE ──
        'עץ': firstName + ', העץ בכוכבים הוא סמל השורשים שעובדים בשקט מתחת הפני השטח. אתה/את יצור שעצמתו נמדדת בשני כיוונים בו זמנית. הקונסטלציה מגלה: השורשים שלך חזקים ממה שנראה על הפני השטח.',
        'ים': firstName + ', הים הוא סמל העומק הבלתי ניתן למדידה. אין את הקרקעית של מה שאתה/את נושא/ת בפנים. הקונסטלציה אומרת: עומקך/עומקך הוא כוח, לא נטל.',
        'נהר': firstName + ', הנהר מלמד אותך: היכולת לעבור בין אבנים יש אותך. בנינה התמידית, העקביות התמידית. הקונסטלציה מגלה: אתה/את בדרך, והדרך פתוחה.',
        'הר': firstName + ', ההר רואה הכל אבל אינו מדבר לאיש. מי שרואה/ת הר בכוכבים יודע/ת שיש בינתיים ששווים רק משם. הקונסטלציה שואלת: מה אתה/את רואה/ת משם שאחרים לא רואים?',
        'ענן': firstName + ', הענן משתנה תמיד, אבל תמיד דוחף לפנים. מי שרואה/ת ענן יודע/ת להיות בתנועה בלי לאבד את הצורה הפנימית. הקונסטלציה אומרת: השינוי שאתה/את חש בא בדיוק כדי לפנות מ֩קום לדבר הבא.',
        'פרח': firstName + ', הפרח צומח במקומות שלא בחר אותם. הוא אינו בקש רשות, הוא פשוט נפרץ. הקונסטלציה מגלה: יש בך אותו סוג של אומץ שלא מבקש רשות.',
        'אדמה': firstName + ', האדמה בכוכבים סמל השייכות למקום, לגוף, למת שקרי ומשנה. יש בך קשר עמוק למה שקורי. הקונסטלציה אומרת: סמוך/י על השייכות הזו, היא תתן לך יציבות.',
        'יער': firstName + ', היער הוא מקום שדברים עמוקים מתרחשים מתחת לאפני השיטח. יש בך ישות שלא נפרשה אבל נוכחת תמיד. הקונסטלציה מגלה: מה מתרחש בשקט בתוכך?',
        'מים': firstName + ', המים לוקחים את צורת הכלי שהם נמצאים בו. אתה/את מסוגל/ת להתאים למרחב ולאנשים שבו. הקונסטלציה מגלה: הגמישות הזו היא הכוח שלך.',
        'אש': firstName + ', האש בכוכבים סמלת טרנספורמציה שאינה שורפת אלא משנה. יש בך אנרגיה שיכולה לבעור או לחמם. הקונסטלציה שואלת: אתה/את רוצה/ה לשרוף או לחמם?',
        // ── CELESTIAL ──
        'שמש': firstName + ', השמש בכוכבים היא סמל הכוח המרכזי שבך שלא מתנצל. אתה/את מקור אנרגיה לאחרים, לא רק מקבל/ת. הקונסטלציה אומרת: הגיעה שלך דרושה.',
        'ירח': firstName + ', הירח מושך בגאות ואינו שלם בעצמו. מי שרואה/ת ירח יודע/ת שהשפעה אינה דורשת שלמות. הקונסטלציה רומזת: השפעתך/שפעתך על אחרים גדולה מהשיעורת/ת.',
        'כוכב': firstName + ', הכוכב שראית/ת אולי כבר אינו שם ובכל זאת אורו מגיע אליך. אורך/אורך הוא אמיתי והוא מגיע ממקום שאולי אתה/את אפילו לא יודע/ת. הקונסטלציה מגלה: אתה/את מסוגל/ת לנותן אור בחיי אחרים.',
        // ── BODY & SPIRIT ──
        'לב': firstName + ', הלב בכוכבים הוא המרךז שלכל השאר. מי שרואה/ת לב יודע/ת שכל השערים שרצוים בריצה צוריכים לעבור דרך שם. הקונסטלציה שואלת: מי מחזיק בלב שלך?',
        'יד': firstName + ', היד בכוכבים סמל הפעולה, היכולת ליצור ולתת. יש משהו שידיך/ידיך רוצות לבנות. הקונסטלציה אומרת: הגיע הזמן לפעול, לא רק לחיכות.',
        'עין': firstName + ', העין בכוכבים רואה את מה שאחרים שוכחים לראות. יש בך תפיסה יוצאת דופן. הקונסטלציה מגלה: מה שאתה/את רואה/ת בחייך/חייך שאחרים לא רואים?',
        'כנף': firstName + ', הכנף סמלת החירות והיכולת לראות מעל. יש בך יכולת לעוף, גם אם עדיין לא פרש/ת את הכנפיים. הקונסטלציה אומרת: עוף לפני שהזמן עובר.',
        // ── ABSTRACT / OBJECTS ──
        'גשר': firstName + ', הגשר בכוכבים סמל מעבר בין שני מצבים או שני אנשים. יש מעבר שאתה/את צריך/ת ללכת דרךו. הקונסטלציה אומרת: הגשר כבר נבנה, נדרשת רק העברה.',
        'שער': firstName + ', השער בכוכבים סמל מעבר, סיום והתחלה. יש פרק שעומד לפניך. הקונסטלציה שואלת: האם אתה/את מוכן/ת לעבור?',
        'מפתח': firstName + ', המפתח בכוכבים סמל האפשרות שקיימת תמיד אבל שאתה/את לא יצא אליה. הקונסטלציה אומרת: המפתח בידך, הדלת פתוחה.',
        'ספר': firstName + ', הספר בכוכבים סמל חכמה שממתינה להעברה. יש סיפור שאתה/את צריך/ת לדעת אותו. הקונסטלציה אומרת: אתה/את כבר כותב/ת אותו.',
        'בית': firstName + ', הבית בכוכבים הוא סמל השרשים והשייכות. יש בך צורך עמוק להרגיש בטוחה בתוך עצמך. הקונסטלציה מגלה: הבית מתחיל באותך.',
        'כתר': firstName + ', הכתר בכוכבים אינו רק שלטון אלא אחריות. יש בך יכולת להוביל ולשאת. הקונסטלציה מגלה: הגיעה שלך דרושה, אל תמתין/י.',
        'גלגל': firstName + ', הגלגל בכוכבים סמל המחזוריות, החזרה והתנועה. יש דבר שמתנועע במהלך שמבקש חזרה. הקונסטלציה שואלת: האם אתה/את מוכן/ת לשחרר את הגלגל?',
        'ארבע': firstName + ', ארבע הוא יסוד המרחב והזמן בקוסמולוגיה ובכל מסורת. אתה/את עומד/ת על רגליים יציבות. הקונסטלציה אומרת: היסוד שלך חזק, בנה עליו.',
        'צלב': firstName + ', הצלב בכוכבים סמל נקודת הפגישה של שני מחזורים. יש בחייך/חייך שני כיוונים שמבקשים שילוב. הקונסטלציה מגלה: הנקודה שבה הם נפגשים היא המיקום שבו צמיחה שלמות.'
    };
    
    let pareidoliaSpecificMsgHe = pareidoliaWordMap[_cleanVision]
        || pareidoliaWordMap[_rawVision]
        || (_rawVision ? (
            firstName + ', מה שראית/ת בכוכבים שנוצרו בשבילך — ' + _cleanVision + ' — אינו מקרי. הנשמה בוחרת סמל מתוך אינסוף האפשרויות, והסמל שבחרת/ת משקף מה שמבקש היכרה. שאל/י את עצמך: מה אומר לך ' + _cleanVision + ' זה?'
          ) : null);

    // ── PAREIDOLIA interpretation: what they saw ──
    const visionMsgHe = pick([
        firstName + ', המפה שנוצרה עבורך — הכוכבים, הקווים, הצורה — כולם נבנו מהתשובות שלך. ומה שראית/ת בתוך הכאוס הזה? זה לא מקרי. הנשמה שלך בחרה סמל מסוים מתוך אינסוף האפשרויות.',
        firstName + ' בנה/תה קונסטלציה שלמה מנקודות חייו/חייה — ומה שהעין ראתה בסוף? זה לא מה שנוצר בחוץ. זה מה שקיים בפנים.',
        'בין כל הצורות שיכלו להתגלות בכוכבים שנוצרו ספציפית בשבילך — ראית/ת מה שראית/ת. זהו מסר מהקוסמוס: הסמל הזה אינו אקראי. הוא הדהוד של מה שנמצא ממש מתחת לפני השטח. ' + firstName + ', מה הוא אומר לך על הפרק הבא בחייך?'
    ]);
    const visionMsgEn = pick([
        firstName + ', the form you recognised in these stars was not coincidental — your mind chose it from everything it could have seen. The unconscious is selective. What you saw reveals something about what is most alive in you right now.',
        firstName + ', among all the shapes that could have emerged in the stars built specifically for you — you saw what you saw. That is a message: the symbol is not random. It is an echo of what lies just beneath the surface. What does it say to you about the next chapter of your life?',
        firstName + ' built a complete constellation from the coordinates of their life — and what the eye finally saw? That is not what was created outside. That is what exists inside.'
    ]);

    // ── SYSTEM / CLOSING statement ──
    const systemMsgHe = pick([
        firstName + ', הקונסטלציה שנוצרה כאן נוצרה ממך ועבורך — מהשם שלך, מהגוון שמשך/ה אותך, מהזמן שגופך כבד בו, מהסמל שראית/ה. הכוכבים לא שיקרו: מה שנבנה כאן הוא צילום של נשמתך ברגע זה. PAGMAR הוא ראי — והצורה שמולך היא הסיפור שלך. מה תעש/י עם הסיפור הזה?',
        'כוכבים —' + ' שמרו את הסוד שלך — ועכשיו הגיע הרגע לגלות אותו. כל תשובה שנתת/ה הייתה שכבה אחת בדימוי. כל בחירה — קוד של הנשמה. המפה שמולך היא לא גורל; היא הזמנה. הזמנה לצעד הבא, לעוצמה הבאה, לפרק הבא. ' + firstName + ', מה אתה/את בוחר/ת לעשות עם ההזמנה הזו?'
    ]);
    const systemMsgEn = `${firstName}, what was built here came from you — your name, your choices, your vision. The question isn't what the stars say. It's what you heard in yourself while answering.`;

    // ── LABEL POOL — each major point gets one of these ──
    var labelPoolHe = [
        [colorMsgHe, 'גוון'],
        [timeMsgHe, 'זמן'],
        [homeMsgHe, 'בית'],
        [changeMsgHe, 'מחשבה'],
        [requestMsgHe, 'בקשה'],
        [doubtMsgHe, 'ספק'],
        [dreamMsgHe, 'שאיפה'],
        [unresolvedMsgHe, 'אור'],
        [visionMsgHe, 'צורה'],
        [systemMsgHe, 'ציון'],
        ...(monthMsgHe ? [[monthMsgHe, 'חודש']] : []),
        ...(pareidoliaSpecificMsgHe ? [[pareidoliaSpecificMsgHe, 'מה ראית']] : [])
    ];

    var labelPoolEn = [
        [colorMsgEn, 'HUE'],
        [timeMsgEn, 'TIME'],
        [homeMsgEn, 'HOME'],
        [changeMsgEn, 'MIND'],
        [requestMsgEn, 'ASK'],
        [doubtMsgEn, 'DOUBT'],
        [dreamMsgEn, 'ASPIRE'],
        [unresolvedMsgEn, 'LIGHT'],
        [visionMsgEn, 'FORM'],
        [systemMsgEn, 'MARK']
    ];

    // For labels beyond 10, repeat randomly
    while (labelPoolHe.length < majorPoints.length) {
        labelPoolHe.push(labelPoolHe[Math.floor(Math.random() * 10)]);
        labelPoolEn.push(labelPoolEn[Math.floor(Math.random() * 10)]);
    }
    var pool = isHe ? labelPoolHe : labelPoolEn;

    // ── INJECT STYLES ────────────────────────────────────────────────
    if (!document.getElementById('data-label-style')) {
        var st = document.createElement('style');
        st.id = 'data-label-style';
        st.textContent = [
        '#sky-data-overlay {',
        '  position:absolute; inset:0; pointer-events:none; z-index:10; overflow:hidden;',
        '}',
        '#sky-data-overlay svg {',
        '  position:absolute; inset:0; width:100%; height:100%; overflow:visible;',
        '}',
        '.sky-dlabel {',
        '  position: absolute;',
        '  transform: translate(-50%, -50%);',
        '  font-family: "SimplerMono", "Courier New", monospace;',
        '  font-size: 10px;',
        '  letter-spacing: 0.15em;',
        '  text-transform: uppercase;',
        '  color: rgba(195,195,215,0.80);',
        '  background: rgba(0,0,0,0.06);',
        '  border: 1px solid rgba(255,255,255,0.20);',
        '  padding: 3px 10px;',
        '  pointer-events: auto;',
        '  cursor: pointer;',
        '  transition: opacity 0.4s ease, border-color 0.3s ease, background 0.3s ease;',
        '  display: inline-flex;',
        '  align-items: center;',
        '  white-space: nowrap;',
        '  direction: rtl;',
        '  backdrop-filter: blur(2px);',
        '  -webkit-backdrop-filter: blur(2px);',
        '}',
        '.sky-dlabel:hover {',
        '  border-color: rgba(255,255,255,0.85);',
        '  background: rgba(255,255,255,0.07);',
        '}',
        '/* Expanded: fixed reading panel on left side, no zoom */',
        '.sky-dlabel-panel {',
        '  position: fixed;',
        '  top: 50%;',
        '  right: 3vw;',
        '  transform: translateY(-50%);',
        '  width: min(380px, 90vw);',
        '  max-height: 80vh;',
        '  background: rgba(4,4,10,0.93);',
        '  backdrop-filter: blur(16px) saturate(1.3);',
        '  -webkit-backdrop-filter: blur(16px) saturate(1.3);',
        '  border: 1px solid rgba(255,255,255,0.1);',
        '  border-radius: 0;',
        '  padding: 2rem 2rem 1.8rem;',
        '  z-index: 2000;',
        '  overflow-y: auto;',
        '  opacity: 0;',
        '  pointer-events: auto;',
        '  transition: opacity 0.5s ease;',
        '  direction: rtl;',
        '  box-shadow: 0 20px 60px rgba(0,0,0,0.7);',
        '}',
        '.sky-dlabel-panel.visible { opacity: 1; }',
        '/* No close button — panel closes by zooming out */',
        '.sky-dlabel-panel .panel-close { display: none; }',
        '.sky-dlabel-panel .panel-cat {',
        '  font-family: "SimplerMono", "Courier New", monospace;',
        '  font-size: 9px;',
        '  letter-spacing: 0.22em;',
        '  text-transform: uppercase;',
        '  color: rgba(180,180,210,0.5);',
        '  margin-bottom: 1.2rem;',
        '  display: block;',
        '  border-bottom: 1px solid rgba(255,255,255,0.07);',
        '  padding-bottom: 0.8rem;',
        '}',
        '.sky-dlabel-panel .panel-text {',
        '  font-family: "SimplerMono", "Courier New", monospace;',
        '  font-size: 0.88rem;',
        '  line-height: 1.85;',
        '  color: rgba(190,190,210,0.88);',
        '}',
        '.sky-dlabel-panel .panel-text .word {',
        '  opacity: 0;',
        '  transition: opacity 1.0s ease;',
        '  display: inline;',
        '}',
        '.sky-dlabel .dlabel-category {',
        '  font-size: 9px;',
        '  letter-spacing: 0.13em;',
        '  text-transform: uppercase;',
        '  color: rgba(255,255,255,0.82);',
        '  white-space: nowrap;',
        '}',
        '.sky-dlabel .dlabel-dot {',
        '  width: 3px; height: 3px;',
        '  border-radius: 50%;',
        '  background: rgba(255,255,255,0.75);',
        '  display: inline-block;',
        '  flex-shrink: 0;',
        '  margin-inline-start: 5px;',
        '}',
        '@keyframes dlabel-approach {',
        '  0%,100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.35); }',
        '  50%      { box-shadow: 0 0 0 5px rgba(255,255,255,0); }',
        '}',
        '.sky-dlabel.hinting {',
        '  animation: dlabel-approach 2s ease-in-out infinite;',
        '}',
        '.sky-dlabel-anchor-dot {',
        '  position:absolute; width:6px; height:6px;',
        '  border:1px solid rgba(255,255,255,0.55); border-radius:50%;',
        '  transform:translate(-50%,-50%); pointer-events:none;',
        '}',
        '.sky-dlabel-anchor-dot.hinting {',
        '  animation: dlabel-approach 1.8s ease-in-out infinite;',
        '}',
        '.sky-dlabel-anchor-dot.revealed {',
        '  background:rgba(255,255,255,0.4);',
        '  animation: none;',
        '}',
        '.constellation-label {',
        '  font-family: "Hadassah", serif !important;',
        '  font-size: clamp(1.7rem, 3vw, 2.6rem) !important;',
        '  font-weight: 300 !important;',
        '  color: rgba(210,210,228,0.88) !important;',
        '  pointer-events: auto !important;',
        '  cursor: pointer;',
        '  text-shadow: 0 0 30px rgba(200,200,255,0.2), 0 2px 10px rgba(0,0,0,0.95), 0 0 60px rgba(0,0,0,0.9);',
        '  background: transparent !important;',
        '  border: none !important;',
        '  box-shadow: none !important;',
        '  padding: 0 !important;',
        '  width: auto !important;',
        '  transition: transform 0.3s ease, color 0.3s ease !important;',
        '}',
        '.constellation-label:hover {',
        '  transform: translate(-50%, -50%) scale(1.1) !important;',
        '  color: #ffd700 !important;',
        '}',
        '@keyframes pulse-ring {',
        '  0% { transform: scale(0.8); opacity: 0.1; }',
        '  50% { transform: scale(1.2); opacity: 0.8; }',
        '  100% { transform: scale(0.8); opacity: 0.1; }',
        '}'
        ].join('\n');
        document.head.appendChild(st);
    }

    // --- Constellation Modal ---
    var constellationModal = document.getElementById('constellation-modal');
    if (!constellationModal) {
        constellationModal = document.createElement('div');
        constellationModal.id = 'constellation-modal';
        constellationModal.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: min(420px, 90vw); background: rgba(4,4,10,0.93); backdrop-filter: blur(16px) saturate(1.3); -webkit-backdrop-filter: blur(16px) saturate(1.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 0; padding: 2rem 2.2rem 2rem; text-align: right; font-family: "SimplerMono", "Courier New", monospace; color: rgba(190,190,210,0.9); z-index: 2001; display: none; opacity: 0; transition: opacity 0.5s ease; direction: rtl; box-shadow: 0 20px 60px rgba(0,0,0,0.7);';
        constellationModal.innerHTML = '<button style="position: absolute; top: 1rem; left: 1rem; background: transparent; border: none; font-size: 1rem; cursor: pointer; color: rgba(255,255,255,0.5); padding: 4px 8px; font-family: SimplerMono, monospace; letter-spacing: 0.05em; transition: color 0.2s;" onmouseover="this.style.color=\'rgba(255,255,255,0.9)\'" onmouseout="this.style.color=\'rgba(255,255,255,0.5)\'" onclick="closeConstellationModal()">✕</button><h2 id="constellation-info-title" style="font-family: \'Hadassah\', serif; margin: 0 0 1.2rem 0; font-size: 1.4rem; font-weight: 300; letter-spacing: 0.12em; color: rgba(230,230,240,0.92); border-bottom: 1px solid rgba(255,255,255,0.07); padding-bottom: 1rem;"></h2><p id="constellation-info-desc" style="font-family: \'SimplerMono\', \'Courier New\', monospace; font-size: 0.88rem; line-height: 1.9; color: rgba(185,185,210,0.88); white-space: pre-wrap; margin: 0;"></p>';

        document.body.appendChild(constellationModal);

        window.closeConstellationModal = function() {
            constellationModal.style.opacity = '0';
            setTimeout(function() { constellationModal.style.display = 'none'; }, 400);
        };

        window.openConstellationModal = function(title, desc) {
            document.getElementById('constellation-info-title').innerText = title;
            document.getElementById('constellation-info-desc').innerText = desc;
            constellationModal.style.display = 'block';
            setTimeout(function() { constellationModal.style.opacity = '1'; }, 10);
        };
    }

    // ── OVERLAY ──────────────────────────────────────────────────────
    var overlay = document.createElement('div');
    overlay.id = 'sky-data-overlay';
    skyScreen.appendChild(overlay);

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    overlay.appendChild(svg);

    // ── CREATE LABELS for each major point ───────────────────────────
    var labelData = [];
    var W = skyScreen.clientWidth, H = skyScreen.clientHeight;
    var usedMajors = majorPoints.slice(0, pool.length);

    usedMajors.forEach(function(pt, idx) {
        // Labels point TOWARD constellation center — they appear inside the shape
        var angleToCenter = Math.atan2(-pt.originalY, -pt.originalX) + (idx % 2 === 0 ? 0.25 : -0.25);
        var dist = 70 + (idx % 3) * 28;
        var offsetX = Math.cos(angleToCenter) * dist;
        var offsetY = Math.sin(angleToCenter) * dist;

        var fullText = pool[idx][0];
        var category = pool[idx][1];
        var snippet = fullText.length > 25 ? fullText.slice(0, 25) + '…' : fullText;

        var el = document.createElement('div');
        el.className = 'sky-dlabel';

        var isConstellation = false;
        if (idx === 0 && answers.pareidolia) {
            isConstellation = true;
            el.className += ' constellation-label';
            var rawVal = answers.pareidolia.trim();
            var displayVal = rawVal;
            if (isHe && !rawVal.startsWith('ה')) displayVal = 'ה' + rawVal;
            else if (!isHe && !rawVal.toLowerCase().startsWith('the ')) displayVal = 'The ' + rawVal;
            el.innerHTML = '<span class="dlabel-category">זיהוי</span><span class="dlabel-snippet">' + displayVal + '</span>';
            el.style.pointerEvents = 'auto';
            el.style.cursor = 'pointer';
            (function(dv) {
                el.addEventListener('pointerdown', function(e) {
                    e.stopPropagation();
                    var title = isHe ? ('קונסטלציית ' + dv) : (dv + ' Constellation');
                    var desc;
                    if (isHe) {
                        // ── Word+color+change personalised constellation text ──────────
                        var wClean2 = dv.replace(/^\u05d4/, ''); // strip He definite article
                        var fn2 = firstName || '';

                        // Openers — keyed by bare word, then change/focus, else default
                        var WORD_OPENERS = {
                            '\u05e2\u05d8\u05dc\u05e3': {
                                '\u05d0\u05d4\u05d1\u05d4': fn2 + ', \u05e2\u05d8\u05dc\u05e3 \u05d1\u05d0\u05d4\u05d1\u05d4 — \u05de\u05d9 \u05e9\u05e8\u05d5\u05d0\u05d4 \u05d1\u05d7\u05e9\u05db\u05d4 \u05d9\u05d5\u05d3\u05e2 \u05d2\u05dd \u05dc\u05d0\u05d4\u05d5\u05d1 \u05d1\u05dc\u05d9 \u05e9\u05d4\u05d0\u05d7\u05e8 \u05d9\u05d3\u05dc\u05d9\u05e7 \u05d0\u05d5\u05e8.',
                                '\u05d7\u05d5\u05e4\u05e9': fn2 + ', \u05e2\u05d8\u05dc\u05e3 \u05d1\u05d7\u05d5\u05e4\u05e9 — \u05d4\u05d9\u05db\u05d5\u05dc\u05ea \u05dc\u05e0\u05d5\u05d5\u05d8 \u05dc\u05d1\u05d3 \u05d1\u05d7\u05e9\u05db\u05d4 \u05d1\u05dc\u05d9 \u05de\u05e4\u05d4. \u05d6\u05d4 \u05dc\u05d0 \u05d1\u05d3\u05d9\u05d3\u05d5\u05ea; \u05d6\u05d5 \u05e2\u05e6\u05de\u05d0\u05d9\u05d5\u05ea.',
                                'default': fn2 + ', \u05e2\u05d8\u05dc\u05e3 \u05d1\u05d7\u05e9\u05db\u05ea \u05d4\u05db\u05d5\u05db\u05d1\u05d9\u05dd — \u05d4\u05d5\u05d0 \u05e0\u05d5\u05d5\u05d8 \u05dc\u05d0 \u05d1\u05e2\u05d9\u05e0\u05d9\u05d9\u05dd \u05d0\u05dc\u05d0 \u05d1\u05e7\u05d5\u05dc \u05d4\u05e4\u05e0\u05d9\u05de\u05d9. \u05d4\u05d7\u05e9\u05db\u05d4 \u05e9\u05de\u05e1\u05d1\u05d9\u05d1 \u05d0\u05d9\u05e0\u05d4 \u05d1\u05e2\u05d9\u05d4 \u05d0\u05dc\u05d0 \u05de\u05d2\u05e8\u05e9 \u05d4\u05de\u05e9\u05d7\u05e7\u05d9\u05dd \u05e9\u05dc\u05da.'
                            },
                            '\u05d7\u05ea\u05d5\u05dc': {
                                'default': fn2 + ', \u05d7\u05ea\u05d5\u05dc \u05d7\u05d9 \u05d1\u05e9\u05e0\u05d9 \u05e2\u05d5\u05dc\u05de\u05d5\u05ea — \u05e0\u05d5\u05db\u05d7 \u05dc\u05d7\u05dc\u05d5\u05d8\u05d9\u05df \u05d5\u05d1\u05e8\u05d2\u05e2 \u05d4\u05d1\u05d0 \u05e7\u05d5\u05e4\u05e5 \u05dc\u05ea\u05d5\u05da \u05e2\u05e6\u05de\u05d0\u05d9\u05d5\u05ea\u05d5. \u05d9\u05e9 \u05d1\u05da \u05d0\u05d5\u05ea\u05d4 \u05d2\u05de\u05d9\u05e9\u05d5\u05ea \u05e9\u05d4\u05d5\u05dc\u05db\u05ea \u05d1\u05d4.'
                            },
                            '\u05db\u05dc\u05d1': {
                                'default': fn2 + ', \u05db\u05dc\u05d1 \u05d1\u05d7\u05e8 \u05d1\u05d1\u05e0\u05d9 \u05d0\u05d3\u05dd \u05e1\u05e4\u05d5\u05e0\u05d8\u05e0\u05d9\u05ea — \u05dc\u05d0 \u05d4\u05d5\u05d0 \u05d0\u05e9\u05e8 \u05de\u05d2\u05dc\u05d4 \u05db\u05dc\u05d5\u05dd \u05d1\u05e2\u05d6\u05d9\u05d1\u05ea\u05d5. \u05d9\u05e9 \u05d1\u05da \u05d0\u05d5\u05ea\u05d4 \u05e0\u05d0\u05de\u05e0\u05d5\u05ea \u05e9\u05d4\u05d5\u05dc\u05db\u05ea \u05d1\u05d4.'
                            },
                            '\u05e6\u05d9\u05e4\u05d5\u05e8': {
                                '\u05d7\u05d5\u05e4\u05e9': fn2 + ', \u05e6\u05d9\u05e4\u05d5\u05e8 \u05d5\u05d7\u05d5\u05e4\u05e9 — \u05d4\u05db\u05e0\u05e4\u05d9\u05d9\u05dd \u05db\u05d1\u05e8 \u05e9\u05dc\u05da, \u05e8\u05e7 \u05e6\u05e8\u05d9\u05da \u05dc\u05e7\u05e4\u05d5\u05e5.',
                                'default': fn2 + ', \u05e6\u05d9\u05e4\u05d5\u05e8 \u05e9\u05e8\u05d4 \u05de\u05d4\u05de\u05e7\u05d5\u05dd \u05e9\u05d1\u05d5 \u05d4\u05d9\u05d0 \u05e0\u05de\u05e6\u05d0\u05ea — \u05d0\u05d9\u05df \u05d6\u05d4 \u05d2\u05d1\u05d5\u05dc. \u05d9\u05e9 \u05de\u05e7\u05d5\u05dd \u05e9\u05d0\u05ea \u05e9\u05d9\u05d9\u05da \u05dc\u05d4\u05d2\u05d9\u05e2 \u05d0\u05dc\u05d9\u05d5.'
                            },
                            '\u05e4\u05e8\u05e4\u05e8': { 'default': fn2 + ', \u05e4\u05e8\u05e4\u05e8 \u05d0\u05d9\u05e0\u05d5 \u05d1\u05d5\u05e8\u05d7 \u05de\u05d4\u05d6\u05d7\u05dc \u05d0\u05dc\u05d0 \u05e0\u05d5\u05dc\u05d3 \u05de\u05d7\u05d3\u05e9 \u05de\u05ea\u05d5\u05db\u05d5. \u05d4\u05db\u05e0\u05e4\u05d9\u05d9\u05dd \u05db\u05d1\u05e8 \u05e9\u05dc\u05da.' },
                            '\u05d0\u05e8\u05d9\u05d4': { 'default': fn2 + ', \u05d0\u05e8\u05d9\u05d4 \u05dc\u05d0 \u05de\u05d5\u05db\u05d9\u05d7 \u05d0\u05ea \u05e2\u05e6\u05de\u05d5 — \u05d4\u05d5\u05d0 \u05e4\u05e9\u05d5\u05d8 \u05d4\u05d5\u05dc\u05da. \u05d9\u05e9 \u05d1\u05da \u05db\u05d5\u05d7 \u05e9\u05dc\u05d0 \u05d3\u05d5\u05e8\u05e9 \u05d0\u05d9\u05e9\u05d5\u05e8.' },
                            '\u05e0\u05d7\u05e9': { 'default': fn2 + ', \u05e0\u05d7\u05e9 \u05d1\u05d5\u05d7\u05e8 \u05ea\u05de\u05d9\u05d3 \u05dc\u05d4\u05ea\u05d7\u05d3\u05e9. \u05e9\u05dc\u05d1 \u05d4\u05e9\u05d9\u05dc\u05d5\u05dc \u05db\u05d1\u05e8 \u05e7\u05e8\u05d4 — \u05d0\u05dc \u05ea\u05e4\u05d7\u05d3/\u05d9 \u05de\u05d4\u05e9\u05d9\u05e0\u05d5\u05d9.' },
                            '\u05e1\u05d5\u05e1': { 'default': fn2 + ', \u05e1\u05d5\u05e1 \u05e8\u05e5 \u05dc\u05dc\u05d0 \u05e9\u05d4\u05d5\u05db\u05d9\u05d7 \u05e9\u05d4\u05d5\u05d0 \u05e8\u05e5 — \u05d4\u05ea\u05e0\u05d5\u05e2\u05d4 \u05d4\u05d9\u05d0 \u05d7\u05d9\u05d5\u05ea\u05d5. \u05d4\u05e8\u05d2\u05e2 \u05db\u05d1\u05e8 \u05db\u05d0\u05df.' }
                        };

                        // Closers — keyed by bare word + color
                        var WORD_CLOSERS = {
                            '\u05e2\u05d8\u05dc\u05e3': {
                                '\u05e9\u05d7\u05d5\u05e8': fn2 + ', \u05e2\u05d8\u05dc\u05e3 \u05d5\u05e9\u05d7\u05d5\u05e8 — \u05e9\u05e0\u05d9\u05d4\u05dd \u05d1\u05d5\u05d7\u05e8\u05d9\u05dd \u05d0\u05ea \u05d4\u05d7\u05e9\u05db\u05d4. \u05de\u05d4 \u05e9\u05e8\u05d5\u05d0\u05d9\u05dd \u05e9\u05dd \u05d4\u05d5\u05d0 \u05dc\u05d0 \u05e4\u05d7\u05d5\u05ea \u05d0\u05de\u05d9\u05ea\u05d9 \u05de\u05de\u05d4 \u05e9\u05e8\u05d5\u05d0\u05d9\u05dd \u05d1\u05d0\u05d5\u05e8.',
                                '\u05db\u05d7\u05d5\u05dc': fn2 + ', \u05e2\u05d8\u05dc\u05e3 \u05d1\u05db\u05d7\u05d5\u05dc — \u05e0\u05d9\u05d5\u05d5\u05d8 \u05d5\u05e2\u05d5\u05de\u05e7 \u05e8\u05d2\u05e9\u05d9. \u05d4\u05e7\u05e9\u05d1 \u05e9\u05dc\u05da \u05dc\u05d0\u05d7\u05e8\u05d9\u05dd \u05d4\u05d5\u05d0 \u05db\u05d5\u05d7, \u05dc\u05d0 \u05d7\u05d5\u05dc\u05e9\u05d4.',
                                'default': fn2 + ', \u05d4' + wClean2 + ' \u05de\u05de\u05e9\u05d9\u05da/\u05ea \u05dc\u05d3\u05d1\u05e8 \u05d0\u05dc\u05d9\u05da. \u05e9\u05de\u05e2/\u05d9.'
                            },
                            'default': {
                                'default': fn2 + ', \u05d4' + wClean2 + ' \u05d5\u05d4' + (aColor||'\u05d2\u05d5\u05d5\u05df') + ' \u05e9\u05d1\u05d7\u05e8\u05ea/\u05ea \u05de\u05e6\u05d1\u05d9\u05e2\u05d9\u05dd \u05d9\u05d7\u05d3 \u05d0\u05ea \u05d0\u05d5\u05ea\u05d5 \u05db\u05d9\u05d5\u05d5\u05df — \u05d9\u05e9 \u05d1\u05da \u05de\u05e9\u05d4\u05d5 \u05e9\u05de\u05d1\u05e7\u05e9 \u05dc\u05d4\u05ea\u05d2\u05dc\u05d5\u05ea.'
                            }
                        };

                        var openerMap = WORD_OPENERS[wClean2] || {};
                        var opener = openerMap[aChange] || openerMap['default'] || (fn2 + ', ' + dv + ' \u05d4\u05d5\u05e4\u05d9\u05e2/\u05d4 \u05d1\u05db\u05d5\u05db\u05d1\u05d9\u05dd \u05e9\u05dc\u05da \u05dc\u05d0 \u05d1\u05de\u05e7\u05e8\u05d4.');
                        var closerMap = WORD_CLOSERS[wClean2] || WORD_CLOSERS['default'] || {};
                        var closer = closerMap[aColor] || closerMap['default'] || (fn2 + ', \u05d4' + wClean2 + ' \u05de\u05de\u05e9\u05d9\u05da/\u05ea \u05dc\u05d3\u05d1\u05e8 \u05d0\u05dc\u05d9\u05da. \u05e9\u05de\u05e2/\u05d9.');

                        desc = opener + '\n\n' + colorMsgHe + '\n\n' + closer;
                    } else {
                        desc = dv + '\n\n' + colorMsgEn;
                    }
                    window.openConstellationModal(title, desc);

                });
            })(displayVal);
        } else {
            // Compact annotation-box: just the keyword label
            var catEl = document.createElement('span');
            catEl.className = 'dlabel-category';
            catEl.innerText = category;
            var dotEl = document.createElement('span');
            dotEl.className = 'dlabel-dot';
            el.appendChild(catEl);
            el.appendChild(dotEl);

            // Click opens a fixed side panel with word-by-word reveal
            (function(cat, ft, fk) {
                el.addEventListener('pointerdown', function(e) {
                    e.stopPropagation();
                    // Close any existing panel
                    var old = document.getElementById('sky-reading-panel');
                    if (old) old.remove();

                    var panel = document.createElement('div');
                    panel.id = 'sky-reading-panel';
                    panel.className = 'sky-dlabel-panel';

                    var closeBtn = document.createElement('button');
                    closeBtn.className = 'panel-close';
                    closeBtn.innerHTML = '✕';
                    closeBtn.onclick = function(ev) { ev.stopPropagation(); panel.style.opacity = '0'; setTimeout(function() { panel.remove(); }, 600); };

                    var catSpan = document.createElement('span');
                    catSpan.className = 'panel-cat';
                    catSpan.innerText = cat;

                    var textDiv = document.createElement('div');
                    textDiv.className = 'panel-text';

                    panel.appendChild(closeBtn);
                    panel.appendChild(catSpan);
                    panel.appendChild(textDiv);
                    document.body.appendChild(panel);

                    // Fade panel in
                    requestAnimationFrame(function() {
                        requestAnimationFrame(function() { panel.classList.add('visible'); });
                    });

                    // Helper: reveal text word-by-word
                    function revealText(text, startDelay) {
                        textDiv.innerHTML = '';
                        var words = text.split(' ');
                        words.forEach(function(w, i) {
                            var span = document.createElement('span');
                            span.className = 'word';
                            span.innerText = w + ' ';
                            textDiv.appendChild(span);
                            setTimeout(function() { span.style.opacity = '1'; }, startDelay + i * 55);
                        });
                    }

                    // Show static text with short lead-in (not 400ms)
                    revealText(ft, 150);

                    // Try Gemini for a live upgrade
                    generatePersonalizedReading(answers, cat, fk).then(function(liveText) {
                        if (liveText && panel.isConnected) {
                            // Smooth cross-fade: fade out → swap text → fade in
                            textDiv.style.transition = 'opacity 0.6s ease';
                            textDiv.style.opacity = '0';
                            setTimeout(function() {
                                if (!panel.isConnected) return;
                                revealText(liveText, 0);
                                textDiv.style.opacity = '1';
                            }, 650);
                        }
                    });
                });
            })(category, fullText, pool[idx][2] || '');

            el.style.cursor = 'pointer';
        }

        overlay.appendChild(el);

        // Anchor-dot element positioned at star location (hint of interactivity)
        var anchorDot = document.createElement('div');
        anchorDot.className = 'sky-dlabel-anchor-dot';
        overlay.appendChild(anchorDot);

        var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.style.opacity = '0';
        var hudLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        hudLine.setAttribute('stroke', 'rgba(255,255,255,0.55)');
        hudLine.setAttribute('stroke-width', '0.75');
        hudLine.setAttribute('fill', 'none');
        // Small hollow circle at the star end
        var dotCirc = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dotCirc.setAttribute('r', '2.5');
        dotCirc.setAttribute('fill', 'none');
        dotCirc.setAttribute('stroke', 'rgba(255,255,255,0.6)');
        dotCirc.setAttribute('stroke-width', '0.75');
        g.appendChild(hudLine);
        g.appendChild(dotCirc);
        svg.appendChild(g);

        // Let the WebGL shader know this star has a label so it can render the internal indicator
        if (pt.mesh && pt.mesh.material.uniforms && pt.mesh.material.uniforms.uHasLabel) {
            pt.mesh.material.uniforms.uHasLabel.value = 1.0;
        }

        var minZoom = 1.5 + Math.random() * 1.0;
        labelData.push({ pt: pt, el: el, g: g, hudLine: hudLine, dotCirc: dotCirc, anchorDot: anchorDot, offsetX: offsetX, offsetY: offsetY, alpha: 0, minZoom: minZoom, isConstellation: isConstellation, fullText: fullText, category: category });
    });


    // ── UPDATE LOOP — Proximity & Zoom reveal ──────────────
    window._labelRevealStates = labelData.map(function() { return { revealed: false, alpha: 0, hasPlayedSound: false }; });

    window.updateDataLabels = function() {
        // HIDE LABELS DURING INITIAL BUILD-UP (first 8 seconds)
        if (typeof skyIntroTime !== 'undefined' && skyIntroTime < 8.0) {
            labelData.forEach(function(item) {
                item.el.style.opacity = '0';
                item.g.style.opacity = '0';
            });
            return;
        }

        // HIDE ALL LABELS DURING DRAG — labels reveal only during scroll/zoom
        if (isDragging) {
            labelData.forEach(function(item) {
                item.el.style.opacity = '0';
                item.g.style.opacity = '0';
            });
            window._labelStaggerStart = null; // reset stagger so re-reveal is fresh after drag
            return;
        }
        // Small cooldown after drag ends (prevents flash reveal during momentum)
        if (window._lastDragEndTime && performance.now() - window._lastDragEndTime < 500) {
            return;
        }

        // AUTO-CLOSE reading panel when user zooms out (scroll-based UX)
        if (cam.scale < 1.5) {

            var rp = document.getElementById('sky-reading-panel');
            if (rp && rp.classList.contains('visible')) {
                rp.style.opacity = '0';
                setTimeout(function() { if (rp && rp.parentNode) rp.parentNode.removeChild(rp); }, 600);
            }
        }

        var CX = window.innerWidth / 2;
        var CY = window.innerHeight / 2;

        // Update mini-viewports (now procedural) every 3rd frame for smooth animation
        if (!window._vpFrameTick) window._vpFrameTick = 0;
        window._vpFrameTick++;
        if (window._vpFrameTick % 3 === 0 && window._updateLabelViewports) {
            window._updateLabelViewports();
        }

        labelData.forEach(function(item, idx) {
            var pt = item.pt, el = item.el, g = item.g, hudLine = item.hudLine;
            var offsetX = item.offsetX, offsetY = item.offsetY;
            var revState = window._labelRevealStates[idx];

            var sx = (pt.x - cam.x) * cam.scale + CX;
            var sy = (pt.y - cam.y) * cam.scale + CY;

            // Label only appears when VERY close to the point on screen (proximity discovery)
            // AND at high enough zoom level — not all at once
            var dx = sx - CX;
            var dy = sy - CY;
            var distFromCenter = Math.hypot(dx, dy);
            
            var mdx = sx - globalMouse.x;
            var mdy = sy - globalMouse.y;
            var distFromMouse = Math.hypot(mdx, mdy);

            // Labels appear at zoom ≥1.3 (gentle zoom-in), disappear below 0.95 (zoom-out hides)
            var ZOOM_ON  = 1.3;
            var ZOOM_OFF = 0.95;
            var meetsZoom = cam.scale >= ZOOM_ON;
            var forceHide = cam.scale < ZOOM_OFF;

            // When zoomed in: show nearby labels within viewport; also show on hover at any zoom above ZOOM_OFF
            var isInViewport = distFromCenter < Math.min(CX, CY) * 0.8;
            var isHovered = distFromMouse < 60;
            var isApproaching = distFromMouse < 220 && pt && pt.permanentlyRevealed && !forceHide && window.skyRevealState === 'revealed';

            // Label is visible when: zoomed in + near center, OR hovered at medium zoom
            var shouldShow = !forceHide && window.skyRevealState === 'revealed' && pt && pt.permanentlyRevealed &&
                             ((meetsZoom && isInViewport) || (cam.scale > ZOOM_OFF && isHovered));
            
            // STAGGERED REVEAL: when eligible, start a global timer; each label waits 1.0s × its order
            if (shouldShow && !revState.staggerShown) {
                if (!window._labelStaggerStart) window._labelStaggerStart = performance.now();
                // Sort eligible labels by distance from center to get reveal order
                if (!revState.staggerOrder) {
                    var dx2 = (pt.x - cam.x) * cam.scale;
                    var dy2 = (pt.y - cam.y) * cam.scale;
                    revState.staggerOrder = Math.floor(Math.hypot(dx2, dy2) / 50); // closer = lower order
                }
                var elapsed = (performance.now() - window._labelStaggerStart) / 1000;
                var waitTime = revState.staggerOrder * 1.0; // 1s per step
                if (elapsed < waitTime) {
                    shouldShow = false; // not yet time for this label
                } else {
                    revState.staggerShown = true;
                }
            }
            // Reset stagger when label hides (so re-zoom reveals it fresh)
            if (!shouldShow && !isHovered && revState.staggerShown && forceHide) {
                revState.staggerShown = false;
                revState.staggerOrder = null;
                if (window._labelStaggerStart) window._labelStaggerStart = null;
            }
            
            var isExpanded = item.el.classList.contains('expanded');
            if (isExpanded) {
                shouldShow = true; // Keep visible while expanded
            }

            // Hint: show very faint box as mouse approaches (before full reveal)
            var hintAlpha = isApproaching ? Math.max(0, 0.18 * (1 - distFromMouse / 220)) : 0;
            var targetAlpha = shouldShow ? 1.0 : hintAlpha;

            // Anchor dot: always show near stars with labels, pulse when approaching
            if (item.anchorDot) {
                item.anchorDot.style.left  = sx + 'px';
                item.anchorDot.style.top   = sy + 'px';
                item.anchorDot.style.opacity = isApproaching || shouldShow ? (isApproaching ? Math.min(0.7, hintAlpha * 5) : 0.9) : '0';
                item.anchorDot.className = 'sky-dlabel-anchor-dot' + (shouldShow ? ' revealed' : (isApproaching ? ' hinting' : ''));
            }
            // Label pulsing hint class
            if (!shouldShow && isApproaching) {
                item.el.classList.add('hinting');
            } else {
                item.el.classList.remove('hinting');
            }

            // Mark as discovered for sound effect (plays only once)
            if (shouldShow && !isExpanded && !revState.hasPlayedSound) {
                revState.hasPlayedSound = true;
                if (AudioEngine && AudioEngine.ctx) {
                    AudioEngine.playDiscoveryChime(pt ? (pt.hue || 200) : 200);
                }
            }

            revState.alpha += (targetAlpha - revState.alpha) * (targetAlpha > 0 ? 0.12 : 0.18);
            var a = revState.alpha;

            var indOpacity = (meetsZoom && window.skyRevealState === 'revealed') ? 1.0 : 0.0;
            
            // Pass the indicator state to the WebGL shader so the star itself visually indicates it has a label
            if (pt && pt.mesh && pt.mesh.material.uniforms && pt.mesh.material.uniforms.uHasLabel) {
                pt.mesh.material.uniforms.uHasLabel.value = (targetAlpha > 0 || isExpanded) ? 0.0 : indOpacity;
            }

            if (a < 0.01) {
                el.style.opacity = '0';
                g.style.opacity = '0';
                return;
            }

            var lx = sx + offsetX;
            var ly = sy + offsetY;

            el.style.opacity = a;
            if (!isExpanded) {
                el.style.left = lx + 'px';
                el.style.top  = ly + 'px';
                var lineOpacity = shouldShow ? a * 0.75 : (isApproaching ? hintAlpha * 0.6 : 0);
                g.style.opacity = lineOpacity;
                hudLine.setAttribute('x1', sx); hudLine.setAttribute('y1', sy);
                hudLine.setAttribute('x2', lx); hudLine.setAttribute('y2', ly);
                if (item.dotCirc) {
                    item.dotCirc.setAttribute('cx', sx);
                    item.dotCirc.setAttribute('cy', sy);
                }
            } else {
                g.style.opacity = '0';
            }
        });
    };
}




// ── GHOST CONSTELLATION CLICK PANEL ──────────────────────────────
// Shown when the user clicks a ghost constellation name label
function showGhostInfoPanel(ghost, clickX, clickY) {
    // Remove any existing panel first
    const existing = document.getElementById('ghost-info-panel');
    if (existing) existing.remove();

    const isHe = (typeof currentLang !== 'undefined') ? currentLang === 'he' : true;
    const name  = isHe ? ghost.nameHe  : ghost.nameEn;
    const text  = isHe ? (ghost.textHe || ghost.text || '') : (ghost.textEn || ghost.text || '');
    const col   = ghost.color || 'rgba(200,220,255,';

    const panel = document.createElement('div');
    panel.id = 'ghost-info-panel';
    panel.style.cssText = `
        position: fixed;
        left: 50%; top: 50%;
        transform: translate(-50%, -50%) scale(0.92);
        width: min(420px, 88vw);
        background: rgba(5, 5, 18, 0.88);
        border: 1px solid ${col}0.25);
        border-radius: 4px;
        padding: 36px 32px 28px;
        font-family: 'SimplerMono', 'Courier New', monospace;
        color: rgba(220, 220, 235, 0.9);
        z-index: 2000;
        pointer-events: auto;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        text-align: ${isHe ? 'right' : 'left'};
        direction: ${isHe ? 'rtl' : 'ltr'};
        opacity: 0;
        transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.2,0.8,0.2,1);
        box-shadow: 0 0 60px ${col}0.12), inset 0 0 30px ${col}0.04);
    `;

    panel.innerHTML = `
        <div style="
            font-size: 0.6rem;
            letter-spacing: 0.35em;
            color: ${col}0.5);
            text-transform: uppercase;
            margin-bottom: 14px;
        ">${isHe ? 'קונסטלציה' : 'CONSTELLATION'}</div>
        <div style="
            font-size: 1.1rem;
            letter-spacing: 0.22em;
            color: ${col}0.9);
            margin-bottom: 20px;
            text-transform: uppercase;
        ">— ${name} —</div>
        <div style="
            font-size: 0.72rem;
            line-height: 1.85;
            letter-spacing: 0.06em;
            color: rgba(200,210,230,0.75);
            margin-bottom: 28px;
        ">${text || (isHe ? 'קונסטלציה שנשמרה ע"י מבקר/ת קודמ/ת.' : 'A constellation left by a previous visitor.')}</div>
        <button id="ghost-panel-close" style="
            background: transparent;
            border: 1px solid ${col}0.3);
            color: ${col}0.6);
            padding: 7px 20px;
            font-family: inherit;
            font-size: 0.65rem;
            letter-spacing: 0.2em;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
        ">${isHe ? 'סגור' : 'close'}</button>
    `;

    document.body.appendChild(panel);

    // Animate in
    requestAnimationFrame(() => {
        panel.style.opacity = '1';
        panel.style.transform = 'translate(-50%, -50%) scale(1)';
    });

    // Close handlers
    const closeBtn = panel.querySelector('#ghost-panel-close');
    const dismiss = () => {
        panel.style.opacity = '0';
        panel.style.transform = 'translate(-50%, -50%) scale(0.92)';
        setTimeout(() => panel.remove(), 500);
    };
    closeBtn.onclick = dismiss;
    // Clicking outside panel closes it
    const outsideClick = (e) => {
        if (!panel.contains(e.target)) { dismiss(); document.removeEventListener('click', outsideClick, true); }
    };
    setTimeout(() => document.addEventListener('click', outsideClick, true), 100);

    // Hover effect on close button
    closeBtn.onmouseover = () => { closeBtn.style.background = `${col}0.1)`; closeBtn.style.color = `${col}1)`; };
    closeBtn.onmouseout  = () => { closeBtn.style.background = 'transparent'; closeBtn.style.color = `${col}0.6)`; };
}

// ======================================================
// CONSTELLATION SYSTEM
// ── User's constellation gets a name (what they saw)
// ── Ghost constellations float in the dark sky around
// ======================================================
function initConstellationSystem(userVision) {
    const skyScreen = document.getElementById('screen-sky');
    if (!skyScreen || document.getElementById('constellation-canvas')) return;

    // ── GHOST CONSTELLATION SHAPES ──────────────────────────────────
    // Each shape is an array of {x,y} in local units, plus line connections
    // Will be placed at world offsets far from the user's main constellation

    const ghostDefs = [
        {
            nameHe: 'הדג',   nameEn: 'the fish',
            color: 'rgba(140,200,255,',
            textHe: 'גבולות מטושטשים בין הידוע לנסתר — מי שנמשך לדגים שוחה בין עולמות. הים הוא רק התחלה.',
            textEn: 'Between the known and the hidden, the fish swims through both. The ocean is just the beginning.',
            offset: { x: 7200, y: -4800 },
            pts: [ {x:0,y:0},{x:60,y:-20},{x:130,y:0},{x:60,y:20},{x:0,y:0},
                   {x:130,y:0},{x:180,y:-35},{x:180,y:35} ],
            lines: [[0,1],[1,2],[2,3],[3,0],[2,4],[4,5],[5,6],[5,7]]
        },
        {
            nameHe: 'העטלף', nameEn: 'the bat',
            color: 'rgba(200,140,255,',
            textHe: 'רואה בחושך — מנווט בלי אור. מי שמזהה את קונסטלציית העטלף נושא בתוכו ידע שאינו זקוק לשמש.',
            textEn: 'Seeing in darkness — navigating without light. Whoever finds this shape carries knowledge that needs no sun.',
            offset: { x: -9500, y: -6200 },
            pts: [ {x:0,y:0},{x:-80,y:-30},{x:-150,y:-80},{x:-120,y:-10},
                   {x:80,y:-30},{x:150,y:-80},{x:120,y:-10},{x:0,y:50} ],
            lines: [[0,1],[1,2],[1,3],[0,4],[4,5],[4,6],[0,7],[3,7],[6,7]]
        },
        {
            nameHe: 'הסוס',  nameEn: 'the horse',
            color: 'rgba(255,210,120,',
            textHe: 'כח שמחכה לאות — אנרגיה צבורה לפרק הבא. הסוס לא רץ לאין מקום; הוא בוחר את הרגע.',
            textEn: 'Power waiting for a signal. The horse does not run aimlessly — it chooses its moment.',
            offset: { x: 5800, y: -11000 },
            pts: [ {x:0,y:0},{x:30,y:-80},{x:60,y:-140},{x:20,y:-160},
                   {x:-30,y:-120},{x:-60,y:-40},{x:-40,y:40},{x:0,y:80} ],
            lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,0]]
        },
        {
            nameHe: 'הנשר',  nameEn: 'the eagle',
            color: 'rgba(255,180,130,',
            textHe: 'הגובה אינו בריחה — הוא פרספקטיבה. הנשר יודע מה קטן ומה גדול כי ראה את שניהם.',
            textEn: 'Height is not escape — it is perspective. The eagle knows what is small and what is vast, because it has seen both.',
            offset: { x: -8800, y: 9500 },
            pts: [ {x:0,y:0},{x:-100,y:-40},{x:-170,y:-10},{x:-90,y:20},
                   {x:100,y:-40},{x:170,y:-10},{x:90,y:20},{x:0,y:70} ],
            lines: [[0,1],[1,2],[1,3],[0,4],[4,5],[4,6],[0,7]]
        },
        {
            nameHe: 'הלב',   nameEn: 'the heart',
            color: 'rgba(255,130,160,',
            textHe: 'מה שנסגר לא נשבר — הוא שומר. הלב בשמיים זוכר כל מה שנאמר בשקט ולא נשמע.',
            textEn: 'What closes does not break — it protects. The heart in the sky remembers all that was spoken in silence.',
            offset: { x: 12500, y: 6800 },
            pts: [ {x:-40,y:-40},{x:0,y:-70},{x:40,y:-40},{x:50,y:0},
                   {x:0,y:50},{x:-50,y:0} ],
            lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0]]
        },
        {
            nameHe: 'הירח',  nameEn: 'the moon',
            color: 'rgba(200,230,255,',
            textHe: 'תמיד חלקי, אף פעם לא שלם — ובכל זאת שולט בגאות. הירח מלמד: השפעה אינה תלויה בשלמות.',
            textEn: 'Always partial, never whole — yet it commands the tides. The moon teaches: influence needs no perfection.',
            offset: { x: -5500, y: -13500 },
            pts: [ {x:0,y:-60},{x:35,y:-45},{x:55,y:0},{x:35,y:45},{x:0,y:60},
                   {x:-20,y:30},{x:-30,y:0},{x:-20,y:-30} ],
            lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,0],[0,7],[4,5]]
        },
        {
            nameHe: 'הנחש',  nameEn: 'the serpent',
            color: 'rgba(120,255,180,',
            textHe: 'הנחש אינו מסוכן — הוא מסמן. כל התחלה חדשה קדם לה שלב שהשיל עור ישן.',
            textEn: 'The serpent is not danger — it is signal. Every new beginning is preceded by shedding old skin.',
            offset: { x: -6200, y: 4500 },
            pts: [ {x:0,y:0},{x:40,y:-30},{x:90,y:-10},{x:130,y:-45},
                   {x:180,y:-20},{x:210,y:20},{x:170,y:50},{x:120,y:30} ],
            lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7]]
        },
        {
            nameHe: 'הצב',   nameEn: 'the turtle',
            color: 'rgba(150,255,200,',
            textHe: 'איטי מכוונה — לא מכשל. הצב מגיע תמיד, כי הוא לא עוצר לדאוג שהוא מגיע.',
            textEn: 'Slow by intention — not by failure. The turtle always arrives, because it never stops to worry that it will.',
            offset: { x: 14000, y: 11500 },
            pts: [ {x:0,y:0},{x:-50,y:-30},{x:-60,y:20},{x:-30,y:55},
                   {x:30,y:55},{x:60,y:20},{x:50,y:-30},
                   {x:0,y:-60},{x:0,y:70} ],
            lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,0],[0,7],[0,8],[1,7],[6,7]]
        },
        {
            nameHe: 'הפרפר', nameEn: 'the butterfly',
            color: 'rgba(255,200,255,',
            textHe: 'השינוי לא בא מבחוץ — הוא בקע מבפנים. הכנפיים לא ניתנו לפרפר; הן נבנו בחושך.',
            textEn: 'Change does not come from outside — it breaks through from within. Wings are not given; they are built in darkness.',
            offset: { x: -16000, y: 8500 },
            pts: [ {x:0,y:0},{x:-70,y:-50},{x:-120,y:-10},{x:-60,y:30},
                   {x:70,y:-50},{x:120,y:-10},{x:60,y:30},{x:0,y:50} ],
            lines: [[0,1],[1,2],[2,3],[3,0],[0,4],[4,5],[5,6],[6,0],[0,7]]
        },
        {
            nameHe: 'הכלב',  nameEn: 'the dog',
            color: 'rgba(255,220,150,',
            textHe: 'נאמנות אינה חולשה — היא המצפן הפנימי. הכלב מוצא את הדרך הביתה ממקומות שאחרים לא נכנסו אליהם.',
            textEn: 'Loyalty is not weakness — it is the inner compass. The dog finds the way home from places others never entered.',
            offset: { x: 10500, y: -9000 },
            pts: [ {x:0,y:0},{x:40,y:-50},{x:70,y:-80},{x:50,y:-100},
                   {x:20,y:-90},{x:60,y:10},{x:100,y:30},{x:80,y:60} ],
            lines: [[0,1],[1,2],[2,3],[3,4],[4,1],[0,5],[5,6],[6,7]]
        },
        {
            nameHe: 'הדב',   nameEn: 'the bear',
            color: 'rgba(255,180,100,',
            textHe: 'כח שלא מוכיח את עצמו — כי הוא יודע שהוא שם. הדב לא נסוג; הוא ממתין בביטחון.',
            textEn: 'Power that does not prove itself — because it knows it is there. The bear does not retreat; it waits in certainty.',
            offset: { x: -12500, y: -11000 },
            pts: [ {x:0,y:0},{x:60,y:-20},{x:120,y:0},{x:140,y:50},
                   {x:100,y:90},{x:40,y:90},{x:0,y:50},
                   {x:170,y:-10},{x:200,y:-40},{x:-30,y:-10},{x:-60,y:-40} ],
            lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,0],[2,7],[7,8],[0,9],[9,10]]
        },
        {
            nameHe: 'הכוכב', nameEn: 'the star',
            color: 'rgba(255,255,180,',
            textHe: 'הכוכב שאתה/את רואה כבר אינו שם — אבל אורו עדיין מנחה. חלקים ממך שנסגרו ממשיכים לכוון אחרים.',
            textEn: 'The star you see may no longer exist — but its light still guides. Parts of you that have ended continue to illuminate others.',
            offset: { x: -15000, y: 15000 },
            pts: [ {x:0,y:-70},{x:20,y:-20},{x:70,y:0},{x:20,y:20},
                   {x:0,y:70},{x:-20,y:20},{x:-70,y:0},{x:-20,y:-20} ],
            lines: [[0,2],[2,4],[4,6],[6,0],[1,5],[3,7],[0,4],[2,6]]
        }
    ];

    try {
        const saved = JSON.parse(localStorage.getItem('pagmar_saved_constellations') || '[]');
        saved.forEach((g, i) => {
            const seed = (i + 1) * 137.5;
            const angle = seed * (Math.PI / 180);
            // Position user-saved constellations CLOSE: 1200-4000 units.
            // They become visible when the user zooms out past cam.scale≈0.42
            // (the same moment the personal title fades away).
            const dist = 1200 + (seed % 2800);
            g.offset = {
                x: Math.cos(angle) * dist,
                y: Math.sin(angle) * dist
            };
            ghostDefs.push(g);
        });
    } catch(e) {}

    // ── WEBGL GHOST GEOMETRY ─────────────────────────────────────────
    const ghostPlaneGeo = new THREE.PlaneGeometry(200, 200);
    const ghostLineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.0, depthWrite: false });
    const ghostState = ghostDefs.map(g => ({ alpha: 0, group: null, lineMat: null, pointMats: [] }));
    
    ghostDefs.forEach((ghost, gi) => {
        const gs = ghostState[gi];
        gs.group = new THREE.Group();
        gs.group.position.set(ghost.offset.x, ghost.offset.y, 0);

        const match = ghost.color.match(/\d+/g);
        let c = new THREE.Color(1, 1, 1);
        if (match && match.length >= 3) {
            c = new THREE.Color(parseInt(match[0])/255, parseInt(match[1])/255, parseInt(match[2])/255);
        }
        // Soften the color so it's not a harsh saturated RGB dot
        c.lerp(new THREE.Color(1, 1, 1), 0.65);

        const lineGeo = new THREE.BufferGeometry();
        const linePos = [];
        ghost.lines.forEach(([a, b]) => {
            linePos.push(ghost.pts[a].x, ghost.pts[a].y, 0);
            linePos.push(ghost.pts[b].x, ghost.pts[b].y, 0);
        });
        lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
        
        gs.lineMat = ghostLineMat.clone();
        gs.lineMat.color = new THREE.Color(1, 1, 1); // white lines — same as user's constellation
        const lineMesh = new THREE.LineSegments(lineGeo, gs.lineMat);
        gs.group.add(lineMesh);

        // Create Points
        ghost.pts.forEach(pt => {
            const gAngle = Math.random() * Math.PI; // unique beam direction per ghost star
            const mat = new THREE.ShaderMaterial({
                vertexShader,
                fragmentShader,
                uniforms: {
                    uTime: { value: Math.random() * 100 },
                    uColor: { value: c },
                    uType: { value: 0.0 }, // bladeFn — same single-beam prism look as user's constellation
                    uOpacity: { value: 0.0 },
                    uGlow: { value: 0.45 },
                    uState: { value: 1.0 },
                    uZoom: { value: 0.65 },
                    uDepth: { value: 0.6 },
                    uHasLabel: { value: 0.0 }
                },
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            gs.pointMats.push(mat);
            const mesh = new THREE.Mesh(ghostPlaneGeo, mat);
            mesh.rotation.z = gAngle; // rotated prism beam
            mesh.scale.set(1.4, 1.4, 1);
            mesh.position.set(pt.x, pt.y, 0);
            gs.group.add(mesh);
        });

        // Add to global scene
        scene.add(gs.group);
    });

    // ── USER'S TITLE LABEL (Spectacular Reveal) ──────────────────────────────────────────
    const titleEl = document.createElement('div');
    titleEl.id = 'user-constellation-title';
    titleEl.style.cssText = `
        position:absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.8);
        font-family: 'Hadassah', serif;
        font-size: clamp(1.4rem, 2.8vw, 2rem);
        letter-spacing: 0.45em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.9);
        pointer-events: auto;
        cursor: pointer;
        z-index: 20;
        text-align: center;
        white-space: nowrap;
        text-shadow: 0 0 30px rgba(255,255,255,0.8);
        transition: all 4s cubic-bezier(0.2, 0.8, 0.2, 1);
        opacity: 0;
        filter: blur(8px);
        border-bottom: 1px solid rgba(255,255,255,0.0);
        padding-bottom: 10px;
    `;
    const isHe = currentLang === 'he';
    
    // Format the title with the definite article if missing
    let formattedTitle = userVision || '';
    if (formattedTitle) {
        if (isHe && !formattedTitle.startsWith('ה')) {
            formattedTitle = 'ה' + formattedTitle;
        } else if (!isHe && !formattedTitle.toLowerCase().startsWith('the ')) {
            formattedTitle = 'The ' + formattedTitle;
        }
    }
    
    titleEl.textContent = formattedTitle ? `— ${formattedTitle} —` : '';
    
    titleEl.onclick = function() {
        showConstellationInfo(formattedTitle);
    };
    
    skyScreen.appendChild(titleEl);

    // Show immediately when sky loads, don't wait for interpretation panel
    requestAnimationFrame(() => {
        titleEl.style.opacity = '1';
        titleEl.style.filter = 'blur(0px)';
        titleEl.style.transform = 'translate(-50%, -40vh) scale(1.0)';
    });

    // ── EXPLORATION RADIUS: how close camera must be to see ghost ──
    const GHOST_REVEAL_WORLD = 1800; // world units from ghost center
    
    window.ghostDefs = ghostDefs;
    window.ghostState = ghostState;

    // ── UPDATE FUNCTION ─────────────────────────────────────────────
    window.updateConstellations = function() {
        if (!window.ghostDefs || !window.ghostState) return;
        
        // 10-second delay requirement
        const timeMet = (typeof skyIntroTime !== 'undefined' && skyIntroTime > 10.0);
        
        // Zoom-out requirement
        // cam.scale typically goes from ~0.3 (out) to 1.35 (in)
        const zoomFactor = Math.max(0, 1.0 - Math.max(0, (cam.scale - 0.5) / 0.3));

        const isHe = currentLang === 'he';

        ghostDefs.forEach((ghost, gi) => {
            const gs = ghostState[gi];

            // Distance from camera center to ghost center (world space)
            const camDist = Math.hypot(cam.x - ghost.offset.x, cam.y - ghost.offset.y);
            const proximity = Math.max(0, 1 - camDist / GHOST_REVEAL_WORLD);
            
            // ── Screen-based reveal when zoomed out ─────────────────────
            // When cam.scale < 0.35, ghosts that appear on screen should
            // become visible — giving the galaxy exploration experience
            const screenX = (ghost.offset.x - cam.x) * cam.scale;
            const screenY = (ghost.offset.y - cam.y) * cam.scale;
            const halfW = window.innerWidth * 0.55;
            const halfH = window.innerHeight * 0.55;
            const onScreen = Math.abs(screenX) < halfW && Math.abs(screenY) < halfH;
            // Ghost reveal: start as title disappears (cam.scale≈0.42), fully visible at cam.scale=0.20
            const screenAlpha = onScreen ? Math.max(0, 0.65 - cam.scale * 1.55) : 0;
            
            // Check if user has wandered far enough from the starting center (0,0) to start revealing ghosts
            if (!window.hasWandered && Math.hypot(cam.x, cam.y) > 800) {
                window.hasWandered = true;
            }
            
            // Galaxy zoom-out reveal: screen-based alpha when zoomed out
            // Screen ghosts should always show when visible (no wander needed)
            const screenTargetAlpha = screenAlpha;
            
            let targetAlpha = window.hasWandered ? (proximity * proximity * 0.75) : 0.0;
            // Screen-based reveal is independent of hasWandered — just zoom out to see them
            targetAlpha = Math.max(targetAlpha, screenTargetAlpha);
            
            // Apply restrictions
            if (!timeMet) targetAlpha = Math.max(0, targetAlpha); // timeMet restriction only for pan-based
            targetAlpha *= zoomFactor;

            // Smooth alpha
            gs.alpha += (targetAlpha - gs.alpha) * 0.06;

            const a = gs.alpha;

            // Update WebGL uniforms and position
            if (gs.group) {
                // Apply global rotation to the ghost's base offset
                const rp = rotate3D(ghost.offset.x, ghost.offset.y, 0, globalRotX, globalRotY);
                // Convert rotated world position to screen-relative offsets for ThreeJS Group
                // ThreeJS handles center at (0,0), so no W*0.5 offset. 
                // But w2s adds W*0.5, so we just do it manually:
                gs.group.position.x = (rp.x - cam.x) * cam.scale;
                gs.group.position.y = -(rp.y - cam.y) * cam.scale;
                // Group internal rotation to match perspective
                gs.group.rotation.x = globalRotX;
                gs.group.rotation.y = -globalRotY; 
                gs.group.scale.set(cam.scale, cam.scale, 1);

                // ── STAR SIZE COMPENSATION ────────────────────────────────
                // At low cam.scale the group shrinks, making stars tiny (< 30px).
                // Counter-scale every Mesh child so stars keep a minimum screen size.
                const BASE_STAR_PX = 200 * 1.4;  // plane geometry (200) × original scale (1.4)
                const MIN_STAR_PX  = 72;          // minimum visible size in screen pixels
                const compensation = Math.max(1.0, MIN_STAR_PX / (BASE_STAR_PX * Math.max(0.05, cam.scale)));
                gs.group.children.forEach(child => {
                    if (child.isMesh) {
                        child.scale.set(1.4 * compensation, 1.4 * compensation, 1);
                    }
                });
            }
            // Boost lines more at galaxy view; keep them subtle when close
            const lineBoost = Math.max(0.18, 0.55 - cam.scale * 1.0);
            if (gs.lineMat) gs.lineMat.opacity = a * lineBoost;
            gs.pointMats.forEach(mat => {
                mat.uniforms.uOpacity.value = Math.min(1.0, a * 2.2); // boosted from 1.5
                mat.uniforms.uZoom.value = Math.max(0.35, cam.scale); // clamp: shader renders poorly near 0
                mat.uniforms.uTime.value += 0.015;
            });
            
            // ── Ghost HTML overlay (name label + text card) ──────────
            const isHeGhost = (typeof currentLang !== 'undefined') ? currentLang === 'he' : true;
            
            // Name label (always shown when ghost visible)
            if (!gs.labelEl) {
                gs.labelEl = document.createElement('div');
                gs.labelEl.style.cssText = [
                    'position: absolute',
                    'font-family: SimplerMono, Courier New, monospace',
                    'letter-spacing: 0.18em',
                    'text-align: center',
                    'white-space: nowrap',
                    'pointer-events: auto',     // clickable
                    'cursor: pointer',          // hand cursor
                    'z-index: 10',
                    'transform: translate(-50%, -100%)',
                    'transition: opacity 0.8s ease, transform 0.3s ease'
                ].join(';');
                gs.labelEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showGhostInfoPanel(ghost, e.clientX, e.clientY);
                });
                gs.labelEl.addEventListener('mouseover', () => {
                    gs.labelEl.style.textDecoration = 'underline';
                    gs.labelEl.style.textUnderlineOffset = '4px';
                    gs.labelEl.style.textShadow = `0 0 12px ${ghost.color || 'rgba(200,220,255,'}0.8)`;
                    gs.labelEl.style.letterSpacing = '0.22em';
                });
                gs.labelEl.addEventListener('mouseout', () => {
                    gs.labelEl.style.textDecoration = 'none';
                    gs.labelEl.style.textShadow = 'none';
                    gs.labelEl.style.letterSpacing = '0.18em';
                });
                skyScreen.appendChild(gs.labelEl);
            }
            
            // Text card (shown on zoom-in close approach)
            if (!gs.infoEl) {
                gs.infoEl = document.createElement('div');
                gs.infoEl.style.cssText = [
                    'position: absolute',
                    'font-family: SimplerMono, Courier New, monospace',
                    'font-size: 0.75rem',
                    'line-height: 1.7',
                    'letter-spacing: 0.08em',
                    'text-align: center',
                    'max-width: 320px',
                    'pointer-events: none',
                    'z-index: 11',
                    'transform: translate(-50%, 20px)',
                    'transition: opacity 1.2s ease',
                    'direction: rtl'
                ].join(';');
                skyScreen.appendChild(gs.infoEl);
            }
            
            if (a > 0.04) {
                const rp2 = rotate3D(ghost.offset.x, ghost.offset.y, 0, globalRotX, globalRotY);
                const s2 = w2s(rp2.x, rp2.y);
                const col2 = ghost.color;
                
                // Name label
                gs.labelEl.style.display = 'block';
                gs.labelEl.style.left = s2.x + 'px';
                gs.labelEl.style.top = (s2.y - 50 * cam.scale) + 'px';
                gs.labelEl.style.fontSize = Math.round(8 + a * 5) + 'px';
                gs.labelEl.style.opacity = (a * 0.9).toFixed(2);
                gs.labelEl.style.color = `${col2}1)`;
                gs.labelEl.textContent = (isHeGhost ? ghost.nameHe : ghost.nameEn).toUpperCase();
                
                // Text card — appears only when close (a > 0.65) AND zoomed in (cam.scale > 1.1)
                const textAlpha = Math.max(0, Math.min(1,
                    (a - 0.65) / 0.25 * Math.min(1, (cam.scale - 1.0) / 0.4)
                ));
                if (textAlpha > 0.01) {
                    const ghostText = isHeGhost
                        ? (ghost.textHe || ghost.text || '')
                        : (ghost.textEn || ghost.text || '');
                    gs.infoEl.innerHTML = `
                        <div style="
                            font-size:0.65rem;
                            letter-spacing:0.22em;
                            color:${col2}${Math.min(0.6, textAlpha * 0.7)});
                            margin-bottom:8px;
                            text-transform:uppercase;
                        ">${(isHeGhost ? ghost.nameHe : ghost.nameEn)}</div>
                        <div style="
                            color: rgba(220,220,235,${textAlpha * 0.85});
                            font-size: 0.72rem;
                        ">${ghostText}</div>`;
                    gs.infoEl.style.display = 'block';
                    gs.infoEl.style.left = s2.x + 'px';
                    gs.infoEl.style.top = (s2.y + 65 * cam.scale) + 'px';
                    gs.infoEl.style.opacity = textAlpha.toFixed(3);
                } else {
                    gs.infoEl.style.opacity = '0';
                    if (gs.infoEl.style.opacity === '0') gs.infoEl.style.display = 'none';
                }
            } else {
                gs.labelEl.style.display = 'none';
                gs.infoEl.style.display = 'none';
            }
        });
    };
}



// QUESTIONNAIRE

// ======================================================
function startQuestionnaire() { 
    AudioEngine.init(); 
    showScreen('screen-questionnaire'); 
    window.updateGlobalBackButton();
    renderQ(); 
}


// ── HELPER: Draw Straight Line Between Two Answer Points ──
function drawQuestionLine(svg, p1, p2) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute('x1', p1.x);
    line.setAttribute('y1', p1.y);
    line.setAttribute('x2', p2.x);
    line.setAttribute('y2', p2.y);
    line.setAttribute('stroke', 'rgba(255, 255, 255, 0.45)');
    line.setAttribute('stroke-width', '1');
    line.setAttribute('stroke-linecap', 'round');
    svg.appendChild(line);

    // Dots at both endpoints
    [p1, p2].forEach((p, i) => {
        const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        dot.setAttribute('cx', p.x);
        dot.setAttribute('cy', p.y);
        dot.setAttribute('r', '3.0');   // increased from 1.4
        dot.setAttribute('fill', 'rgba(255, 255, 255, 0.55)');  // slightly more visible
        dot.style.opacity = '0';
        // p2 dot appears slightly after the line finishes drawing
        const delay = i === 0 ? 0.2 : 2.2;
        dot.style.transition = `opacity 1.2s ease-in-out ${delay}s`;
        svg.appendChild(dot);
        requestAnimationFrame(() => { dot.style.opacity = '1'; });
    });

    // Slow draw animation using stroke-dashoffset
    const length = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    line.style.strokeDasharray = length;
    line.style.strokeDashoffset = length;
    line.style.transition = 'stroke-dashoffset 2.5s ease-in-out';

    // Trigger layout reflow then start the animation
    line.getBoundingClientRect();
    requestAnimationFrame(() => {
        line.style.strokeDashoffset = '0';
    });
}

// Transition to next question: optionally wait for line draw, then fade out, then render next
function advanceQ(lineWasDrawn) {
    const FADE_MS = 1200;  // slow fade between questions
    // Extra pause AFTER line finishes so user sees the completed shape before transition
    const waitMs = lineWasDrawn ? 3800 : 0;   // 2.5s line + 1.3s pause to read the shape

    setTimeout(() => {
        const qInner = document.getElementById('q-inner');
        const qOpts  = document.getElementById('q-options');
        const fadeTrans = 'opacity ' + FADE_MS + 'ms ease';
        if (qInner) { qInner.style.transition = fadeTrans; qInner.style.opacity = '0'; }
        if (qOpts)  { qOpts.style.transition  = fadeTrans; qOpts.style.opacity  = '0'; }

        setTimeout(() => {
            // Only restore opacity when moving to another question.
            // If this is the last answer, renderQ() handles the full screen
            // transition itself — restoring to 1 here causes the flash.
            const isLastQ = (qIndex + 1 >= QUESTIONS.length);
            if (!isLastQ) {
                if (qInner) { qInner.style.transition = ''; qInner.style.opacity = '1'; }
                if (qOpts)  { qOpts.style.transition  = ''; qOpts.style.opacity  = '1'; }
            }
            qIndex++;
            renderQ();
        }, FADE_MS + 50);
    }, waitMs);
}

function renderQ() {
    if (qIndex >= QUESTIONS.length) {
        buildVisualParams();
        // Go directly to sky in recognition mode
        window.skyRevealState = 'recognition';
        window.revelationProgress = 0;
        
        // Gradual Transition: Fade out questionnaire quickly so sky screen has no overlap
        const qScreen = document.getElementById('screen-questionnaire');
        qScreen.style.transition = 'opacity 1.0s ease';
        qScreen.classList.remove('active');
        
        // ── EXTRACT QUESTIONNAIRE DRAWING → star positions ─────────────────
        // Vertices (circles) = key/labeled stars. Segment samples = visible path stars.
        // Y is PRE-NEGATED because initSky does coord[1] * shapeRadius * -1
        (function() {
            const qSvg = document.getElementById('q-svg');
            if (!qSvg) return;

            // 1. Unique vertex positions from circle dot elements
            const vertices = [];
            Array.from(qSvg.querySelectorAll('circle')).forEach(c => {
                const x=+c.getAttribute('cx'), y=+c.getAttribute('cy');
                if (isNaN(x)||isNaN(y)) return;
                const dup = vertices.some(v => Math.abs(v.x-x)<6 && Math.abs(v.y-y)<6);
                if (!dup) vertices.push({x, y, isVertex:true});
            });

            // 2. Sample 12 intermediate points along each line/path segment
            const SAMPLES=10; // Richer constellation — more stars per segment
            const segPts=[];
            Array.from(qSvg.querySelectorAll('line')).forEach(l => {
                const x1=+l.getAttribute('x1'),y1=+l.getAttribute('y1'),
                      x2=+l.getAttribute('x2'),y2=+l.getAttribute('y2');
                if (isNaN(x1)) return;
                for (let ti=1;ti<SAMPLES;ti++) {
                    const t=ti/SAMPLES;
                    segPts.push({x:x1+t*(x2-x1), y:y1+t*(y2-y1), isVertex:false});
                }
            });
            Array.from(qSvg.querySelectorAll('path')).forEach(p => {
                const d=p.getAttribute('d')||'';
                const m=d.match(/M\s*([\-\d.]+)\s+([\-\d.]+)\s+Q\s*([\-\d.]+)\s+([\-\d.]+)\s+([\-\d.]+)\s+([\-\d.]+)/);
                if (!m) return;
                const x1=+m[1],y1=+m[2],cx=+m[3],cy=+m[4],x2=+m[5],y2=+m[6];
                for (let ti=1;ti<SAMPLES;ti++) {
                    const t=ti/SAMPLES;
                    segPts.push({x:(1-t)*(1-t)*x1+2*(1-t)*t*cx+t*t*x2,
                                  y:(1-t)*(1-t)*y1+2*(1-t)*t*cy+t*t*y2, isVertex:false});
                }
            });

            const allPts=[...vertices,...segPts];
            if (allPts.length<3) return;

            // 3. Bounding box matching SVG overlay renderer logic
            let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
            allPts.forEach(p=>{ minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);
                                minY=Math.min(minY,p.y);maxY=Math.max(maxY,p.y); });
            const bw=maxX-minX||1, bh=maxY-minY||1;
            const mcx=(minX+maxX)/2, mcy=(minY+maxY)/2;

            // 4. EXACT same scale as SVG overlay
            const W2=window.innerWidth, H2=window.innerHeight;
            const sc_svg=Math.min(W2*0.3/bw, H2*0.35/bh);
            const CAM=0.65, SR=600;
            // Derived: coordX=(p.x-mcx)*sc_svg/(CAM*SR)
            //          coordY=(30-(p.y-mcy)*sc_svg)/(CAM*SR)  <-- sign flipped for Y
            const toX=p=>(p.x-mcx)*sc_svg/(CAM*SR);
            const toY=p=>(30-(p.y-mcy)*sc_svg)/(CAM*SR);

            // 5. WebGL coordList: SINGLE-SIDED only (the Rorschach is only in the SVG lineart).
            // The prismatic WebGL constellation shows only the right-hand shape for a clean look.
            const J=0.01;
            const coordList=[], vertexSet=new Set();
            allPts.forEach(p=>{
                const nx=toX(p), ny=toY(p);
                const jx=(Math.random()-.5)*J, jy=(Math.random()-.5)*J;
                if (p.isVertex) { vertexSet.add(coordList.length); }
                coordList.push([nx+jx, ny+jy, p.isVertex?1:0]);
                // Single-sided only — no bilateral mirror (matches the SVG lineart drawSide(1) exactly)
            });

            window._qDrawingPoints = coordList;  // [x, y, isVertex(0|1)]
            window._qVertexIndices = vertexSet;
        })();

        // Wait for questionnaire to fully fade, then fade in the sky (smooth reveal)
        setTimeout(() => {
            const skyScreen = document.getElementById('screen-sky');
            skyScreen.style.transition = 'opacity 3.0s ease-in'; // Set BEFORE active class is added
            initSky(); // showScreen inside adds 'active' → uses the 3.0s transition set above
            window.updateGlobalBackButton();
        }, 1800);
        
        return;
    }
    
    const qData = QUESTIONS[qIndex];
    const q = qData[currentLang];
    
    document.getElementById('q-step').innerText = (qIndex + 1) + ' ' + UI_TEXTS[currentLang].stepOf + ' ' + QUESTIONS.length;
    document.getElementById('q-fill').style.width = ((qIndex / QUESTIONS.length) * 100) + '%';
    const qText = document.getElementById('q-text');
    const qSub = document.getElementById('q-sub');
    
    // Reset animation
    qText.style.animation = 'none';
    qSub.style.animation = 'none';
    qText.offsetHeight; // trigger reflow
    
    qText.innerHTML = '';
    qSub.innerHTML = '';
    qText.style.opacity = '1';
    qText.style.animation = 'none';
    qSub.style.opacity = '1';
    qSub.style.animation = 'none';

    // DOB question only: force single line (text is long but must stay on one row)
    const qInner = document.getElementById('q-inner');
    if (qData.id === 'dob') {
        qText.style.whiteSpace = 'nowrap';
        if (qInner) { qInner.style.maxWidth = '820px'; qInner.style.width = '92vw'; }
    } else {
        qText.style.whiteSpace = '';
        if (qInner) { qInner.style.maxWidth = ''; qInner.style.width = ''; }
    }

    // Clear any previous typewriter timer just in case
    if (window._typewriterTimer) {
        clearInterval(window._typewriterTimer);
        window._typewriterTimer = null;
    }

    // Split text into words to fade them in one by one — speedy but still graceful
    const words = q.text.split(' ');
    words.forEach((w, i) => {
        const span = document.createElement('span');
        span.innerText = w + ' ';
        span.style.opacity = '0';
        span.style.transition = 'opacity 1.5s ease-in-out';
        qText.appendChild(span);
        
        setTimeout(() => {
            span.style.opacity = '1';
        }, 80 + i * 280); // 280ms between words — measured, not rushed
    });

    // How long until ALL words have started appearing
    const totalQuestionTime = 80 + words.length * 160;
    // Buffer after last word starts to fade in
    const inputRevealDelay = totalQuestionTime + 1000;

    // Choice buttons appear after question is mostly visible
    const firstButtonDelay = inputRevealDelay;

    // Sub-text
    if (q.sub) {
        const subWords = q.sub.split(' ');
        subWords.forEach((w, i) => {
            const span = document.createElement('span');
            span.innerText = w + ' ';
            span.style.opacity = '0';
            span.style.transition = 'opacity 1.5s ease-in-out';
            qSub.appendChild(span);
            
            setTimeout(() => {
                span.style.opacity = '1';
            }, totalQuestionTime + i * 160);
        });
    }

    document.getElementById('q-options').innerHTML   = '';
    document.getElementById('q-input-area').innerHTML = '';
    
    const svgEl = document.getElementById('q-svg');
    // Clear only temporary lines if any
    if (svgEl) {
        const tempLines = svgEl.querySelectorAll('.temp-line');
        tempLines.forEach(l => l.remove());
    }

    if (qData.type === 'choice') {
        const optsContainer = document.getElementById('q-options');
        const centerX = window.innerWidth / 2;
        // Push center well below the question text area
        const centerY = window.innerHeight * 0.62;
        
        const totalOpts = q.options.length;
        const placedButtons = []; // Keep track of buttons placed in this question
        
        q.options.forEach((opt, idx) => {
            const b = document.createElement('button');
            b.className = 'q-opt'; 
            b.innerText = opt;
            const normalizedAns = qData.en.options[idx]; 
            
            // Check existing lines to avoid overlaps
            const existingLines = svgEl ? Array.from(svgEl.querySelectorAll('line')) : [];
            let safeX, safeY;
            let attempts = 0;
            let bestDist = -1;
            let bestX = 0, bestY = 0;
            
            // Allow options to be placed anywhere on screen (with padding)
            const paddingX = Math.max(150, window.innerWidth * 0.15);
            const paddingY = 110;
            const minX = paddingX;
            const maxX = window.innerWidth - paddingX;
            const minY = paddingY;
            const maxY = window.innerHeight - paddingY;
            
            // Question text bounding box (center of screen, roughly 760×400px)
            const qExclLeft   = centerX - 390;
            const qExclRight  = centerX + 390;
            const qExclTop    = window.innerHeight * 0.5 - 200;
            const qExclBottom = window.innerHeight * 0.5 + 200;
            const inQZone = (x, y) => x > qExclLeft && x < qExclRight && y > qExclTop && y < qExclBottom;

            // Poisson disk approximation
            while (attempts < 400) {
                const candX = minX + Math.random() * (maxX - minX);
                const candY = minY + Math.random() * (maxY - minY);
                
                // Keep away from the center where the question text is
                if (inQZone(candX, candY)) {
                    attempts++;
                    continue;
                }
                
                // 1. Distance to existing lines
                let minLineDist = 9999;
                existingLines.forEach(line => {
                    const x1 = parseFloat(line.getAttribute('x1'));
                    const y1 = parseFloat(line.getAttribute('y1'));
                    const x2 = parseFloat(line.getAttribute('x2'));
                    const y2 = parseFloat(line.getAttribute('y2'));
                    const d = distToSegment(candX, candY, x1, y1, x2, y2);
                    if (d < minLineDist) minLineDist = d;
                });
                
                // 2. Distance to other buttons placed in THIS question
                let minBtnDist = 9999;
                placedButtons.forEach(pb => {
                    const dx = Math.abs(candX - pb.x) * 0.8;
                    const dy = Math.abs(candY - pb.y) * 1.5; 
                    const d = Math.hypot(dx, dy);
                    if (d < minBtnDist) minBtnDist = d;
                });
                
                const score = Math.min(minLineDist * 1.2, minBtnDist);
                
                if (score > bestDist) {
                    bestDist = score;
                    bestX = candX;
                    bestY = candY;
                }
                
                if (minLineDist > 180 && minBtnDist > 160) {
                    break;
                }
                attempts++;
            }
            
            // Use best position found; if none valid found, pick a guaranteed out-of-zone position
            if (bestDist < 0) {
                // Emergency fallback: pick from the four screen corners regions
                const corners = [
                    { x: minX + Math.random() * (centerX - 390 - minX), y: minY + Math.random() * (qExclTop - minY) },
                    { x: qExclRight + Math.random() * (maxX - qExclRight), y: minY + Math.random() * (qExclTop - minY) },
                    { x: minX + Math.random() * (centerX - 390 - minX), y: qExclBottom + Math.random() * (maxY - qExclBottom) },
                    { x: qExclRight + Math.random() * (maxX - qExclRight), y: qExclBottom + Math.random() * (maxY - qExclBottom) },
                ];
                const c = corners[Math.floor(Math.random() * corners.length)];
                bestX = c.x; bestY = c.y;
            }
            safeX = bestX;
            safeY = bestY;
            placedButtons.push({ x: safeX, y: safeY });
            
            b.style.left = safeX + 'px';
            b.style.top = safeY + 'px';
            // After browser paints, clamp to ensure button never goes off-screen
            setTimeout(() => {
                const r = b.getBoundingClientRect();
                const SW = window.innerWidth, SH = window.innerHeight;
                const MARGIN = 12;
                if (r.right  > SW - MARGIN) b.style.left = (SW - r.width  - MARGIN) + 'px';
                if (r.left   < MARGIN)       b.style.left = MARGIN + 'px';
                if (r.bottom > SH - MARGIN)  b.style.top  = (SH - r.height - MARGIN) + 'px';
                if (r.top    < MARGIN)        b.style.top  = MARGIN + 'px';
            }, 20);
            
            // ── Staggered appearance: very slow, one-by-one like stars ──
            b.style.opacity = '0';
            b.style.transform = 'scale(0.82)';
            b.style.transition = 'opacity 1.2s ease, transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)';
            const appearDelay = firstButtonDelay + idx * 700;
            setTimeout(() => {
                b.style.opacity = '1';
                b.style.transform = 'scale(1)';
            }, appearDelay);
            
            // No temporary lines are drawn. Only the permanent trace line upon selection.
            
            b.onclick = () => {  
                if (normalizedAns === 'Other') {
                    Array.from(optsContainer.children).forEach(child => {
                        if (child !== b && child.tagName === 'BUTTON') child.style.opacity = '0.3';
                    });
                    b.style.opacity = '1';
                    
                    let wrap = document.getElementById('custom-wrap-' + qData.id);
                    if (!wrap) {
                        wrap = document.createElement('div');
                        wrap.id = 'custom-wrap-' + qData.id;
                        wrap.className = 'q-input-wrap';
                        wrap.style.marginTop = '20px';
                        
                        const inp = document.createElement('input');
                        inp.className = 'q-input';
                        inp.placeholder = '';
                        
                        const next = document.createElement('button');
                        next.className = 'btn';
                        next.innerText = UI_TEXTS[currentLang].btnNext;
                        next.onclick = () => { 
                            answers[qData.id] = 'Other';
                            answers[qData.id + '_custom'] = inp.value || '';
                            if (svgEl && lastAnswerPos) {
                                drawQuestionLine(svgEl, lastAnswerPos, {x: safeX, y: safeY});
                                lastAnswerPos = { x: safeX, y: safeY };
                                advanceQ(true);
                            } else {
                                lastAnswerPos = { x: safeX, y: safeY };
                                advanceQ(false);
                            }
                        };
                        
                        wrap.appendChild(inp); wrap.appendChild(next);
                        optsContainer.appendChild(wrap);
                        setTimeout(() => inp.focus(), 80);
                    }
                } else {
                    answers[qData.id] = normalizedAns; 
                    
                    if (svgEl && lastAnswerPos) {
                        drawQuestionLine(svgEl, lastAnswerPos, {x: safeX, y: safeY});
                        lastAnswerPos = { x: safeX, y: safeY };
                        advanceQ(true);  // wait for line draw (2.5s) then fade
                    } else {
                        // First choice ever — place a small anchor dot so the next line has a visible origin
                        if (svgEl) {
                            const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                            dot.setAttribute('cx', safeX);
                            dot.setAttribute('cy', safeY);
                            dot.setAttribute('r', '3.0');  // increased from 1.6
                            dot.setAttribute('fill', 'rgba(255,255,255,0.50)');
                            dot.style.opacity = '0';
                            dot.style.transition = 'opacity 0.6s ease 0.3s';
                            svgEl.appendChild(dot);
                            requestAnimationFrame(() => { dot.getBoundingClientRect(); dot.style.opacity = '1'; });
                        }
                        lastAnswerPos = { x: safeX, y: safeY };
                        advanceQ(false); // just fade
                    }
                }
            };
            optsContainer.appendChild(b);
        });
    } else {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight * 0.57;

        // Don't draw a line for text input questions (name, date, etc.)
        // Lines are only drawn between CHOICE answers

        const inputArea = document.getElementById('q-input-area');
        inputArea.innerHTML = ''; // clear any previous
        
        const inp = document.createElement('input');
        inp.className = 'q-input';
        inp.type = qData.type === 'date' ? 'date' : 'text';
        inp.dir = currentLang === 'he' ? 'rtl' : 'ltr';
        if (q.placeholder) inp.placeholder = q.placeholder;

        // Input field: floats between title and button (about 58% from top)
        const inputHolder = document.createElement('div');
        inputHolder.style.cssText = 'position:absolute; top:57%; left:50%; transform:translateX(-50%); width:85%; max-width:400px; opacity:0; transition:opacity 1.2s ease;';
        inputHolder.appendChild(inp);
        inputArea.appendChild(inputHolder);
        
        // Button wrapper: stays fixed at the very bottom (q-input-wrap handles bottom:8vh)
        const wrap = document.createElement('div');
        wrap.className = 'q-input-wrap';
        // Start invisible; reveal after question text is fully visible
        wrap.style.opacity = '0';
        wrap.style.transition = 'opacity 1.2s ease';
        
        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn'; 
        nextBtn.innerText = UI_TEXTS[currentLang].btnNext;
        nextBtn.onclick = () => { 
            if (inp.value.trim() !== '') {
                answers[qData.id] = inp.value.trim(); 
                
                advanceQ(false);
            } else if (qData.optional) {
                answers[qData.id] = 'SKIPPED';
                
                advanceQ(false);
            }
        };
        
        // Only the button goes in wrap (input is in inputHolder above)
        wrap.appendChild(nextBtn);
        
        if (qData.allowUnknown) {
            const unknownBtn = document.createElement('button');
            unknownBtn.className = 'btn';
            unknownBtn.style.marginTop = '10px';
            unknownBtn.style.background = 'transparent';
            unknownBtn.style.border = '1px solid rgba(255,255,255,0.3)';
            unknownBtn.style.fontSize = '0.9rem';
            unknownBtn.innerText = currentLang === 'he' ? 'אני לא יודעת' : 'I don\'t know';
            unknownBtn.onclick = () => {
                answers[qData.id] = 'UNKNOWN';
                
                advanceQ(false);
            };
            wrap.appendChild(unknownBtn);
        }

        if (qData.optional) {
            const skipBtn = document.createElement('button');
            skipBtn.className = 'btn';
            skipBtn.style.marginTop = '10px';
            skipBtn.style.background = 'transparent';
            skipBtn.style.border = 'none';
            skipBtn.style.opacity = '0.6';
            skipBtn.style.fontSize = '0.9rem';
            skipBtn.innerText = currentLang === 'he' ? 'דלג' : 'Skip';
            skipBtn.onclick = () => {
                answers[qData.id] = 'SKIPPED';
                
                advanceQ(false);
            };
            wrap.appendChild(skipBtn);
        }

        inputArea.appendChild(wrap);
        // Reveal input and button only after question text has fully faded in
        setTimeout(() => {
            inputHolder.style.opacity = '1';
            wrap.style.opacity = '1';
            setTimeout(() => inp.focus(), 200);
        }, inputRevealDelay);
    }
}

// ======================================================
// VISUAL PARAMS
// ======================================================
function buildVisualParams() {
    const coreNum = calcGematria(answers.name || 'sky');
    const season  = getSeasonFromDate(answers.dob);
    // Use the home input as a seed source if available
    const locHash = hashStr(Object.values(answers).join('|'));
    const rand    = seededRand(locHash);

    const PAL = {
        'Spring': { bg: '#000000' },
        'Summer': { bg: '#000000' },
        'Autumn': { bg: '#000000' },
        'Winter': { bg: '#000000' }
    };
    const pal = PAL[season] || PAL['Winter'];
    
    // Default personal hue based on name
    let personalHue = (coreNum * 42) % 360; 

    // Override with mood color if answered
    const COLOR_HUE_MAP = {
        'אפור': 220, 'Grey': 220,
        'אדום': 0, 'Red': 0,
        'כחול': 210, 'Blue': 210,
        'שחור': 270, 'Black': 270,
        'ירוק': 140, 'Green': 140,
        'סגול': 280, 'Purple': 280,
        'כתום': 30, 'Orange': 30,
        'לבן': 50, 'White': 50
    };
    if (answers.color && COLOR_HUE_MAP[answers.color] !== undefined) {
        personalHue = COLOR_HUE_MAP[answers.color];
    }

    // 1. Change (Topology & Structure)
    // עבודה / לימודים: organized, linear
    // אהבה / קשרים: paired, binary
    // בית / שייכות: central gravity, ring/orbit
    // ביטחון עצמי: bright center, starburst
    // חופש: wide open scattered
    // יצירה: branching, prism, starburst
    // שקט: scattered, less dense
    // אני עוד לא יודעת: scattered, blurred
    const TOPOLOGY_MAP = {
        'Work / Studies': 'linear', 'עבודה / לימודים': 'linear',
        'Love / Connections': 'binary', 'אהבה / קשרים': 'binary',
        'Home / Belonging': 'ring', 'בית / שייכות': 'ring',
        'Self-confidence': 'starburst', 'ביטחון עצמי': 'starburst',
        'Freedom': 'scattered', 'חופש': 'scattered',
        'Creativity': 'starburst', 'יצירה': 'starburst',
        'Quiet': 'scattered', 'שקט': 'scattered',
        'I don\'t know how to name it yet': 'scattered', 'אני עוד לא יודעת לקרוא לזה בשם': 'scattered'
    };
    
    let topology = TOPOLOGY_MAP[answers.change] || 'scattered';
    let dominantElement = 'flare'; // default

    // 2. Request (Motion Speed, Glow, Rhythm)
    const REQUEST_MAP = {
        'Direction': { d: 1.0, m: 1.5, g: 1.5 }, 'כיוון': { d: 1.0, m: 1.5, g: 1.5 },
        'Courage': { d: 0.5, m: 2.0, g: 2.5 }, 'אומץ': { d: 0.5, m: 2.0, g: 2.5 },
        'Quiet': { d: 2.5, m: 0.3, g: 0.8 }, 'שקט': { d: 2.5, m: 0.3, g: 0.8 },
        'Confirmation': { d: 1.0, m: 1.0, g: 1.0 }, 'אישור': { d: 1.0, m: 1.0, g: 1.0 },
        'A beginning': { d: 1.5, m: 1.2, g: 2.0 }, 'התחלה': { d: 1.5, m: 1.2, g: 2.0 },
        'Release': { d: 0.5, m: 2.5, g: 1.5 }, 'שחרור': { d: 0.5, m: 2.5, g: 1.5 },
        'Clarity': { d: 1.0, m: 0.8, g: 3.0 }, 'בהירות': { d: 1.0, m: 0.8, g: 3.0 },
        'A small sign': { d: 2.0, m: 0.5, g: 0.5 }, 'סימן קטן': { d: 2.0, m: 0.5, g: 0.5 }
    };
    
    let dwellThreshold = 1.0, motionSpeed = 1.0, baseGlow = 1.0;
    if (REQUEST_MAP[answers.request]) {
        dwellThreshold = REQUEST_MAP[answers.request].d;
        motionSpeed = REQUEST_MAP[answers.request].m;
        baseGlow = REQUEST_MAP[answers.request].g;
    }

    vp = { 
        coreNum, season, pal, rand, dominantElement, topology,
        motionSpeed, revealSpeed: 0.8, dwellThreshold, baseGlow,
        baseTraceLevel: 0.1, startScale: 0.65, personalHue,
        camStartX: (rand() - 0.5) * 80,
        camStartY: (rand() - 0.5) * 60
    };

}

// ======================================================
// SKY INIT
// ======================================================

// ══════════════════════════════════════════════════════════════════════
// DISCOVERY SYSTEM — Aurora, Glimmers, Breadcrumbs, Secrets, Pos-text
// ══════════════════════════════════════════════════════════════════════
function initDiscoverySystem() {
    const skyEl = document.getElementById('screen-sky');
    if (!skyEl) return;

    // ── 1. AURORA CANVAS (behind WebGL canvas, z-index 0) ──────────
    let auroraCanvas = document.getElementById('aurora-canvas');
    if (auroraCanvas) auroraCanvas.remove();
    auroraCanvas = document.createElement('canvas');
    auroraCanvas.id = 'aurora-canvas';
    auroraCanvas.style.cssText =
        'position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;';
    const skyCv = document.getElementById('sky-canvas');
    if (skyCv) skyEl.insertBefore(auroraCanvas, skyCv);
    else skyEl.prepend(auroraCanvas);
    const actx = auroraCanvas.getContext('2d');

    // ── 2. POSITION TEXT OVERLAY ────────────────────────────────────
    let posText = document.getElementById('discovery-pos-text');
    if (!posText) {
        posText = document.createElement('div');
        posText.id = 'discovery-pos-text';
        posText.style.cssText = [
            'position:absolute;bottom:90px;left:50%;transform:translateX(-50%);',
            'z-index:30;pointer-events:none;',
            'font-family:var(--font-serif,serif);font-size:0.88rem;',
            'color:rgba(200,215,255,0.78);letter-spacing:0.14em;',
            'text-align:center;direction:rtl;',
            'opacity:0;transition:opacity 1.8s ease;',
            'text-shadow:0 0 18px rgba(100,140,255,0.45);',
            'white-space:nowrap;'
        ].join('');
        skyEl.appendChild(posText);
    }

    // ── 3. SECRETS COUNTER ──────────────────────────────────────────
    let secretCounter = document.getElementById('secret-counter');
    if (!secretCounter) {
        secretCounter = document.createElement('div');
        secretCounter.id = 'secret-counter';
        secretCounter.style.cssText = [
            'position:absolute;top:14px;left:50%;transform:translateX(-50%);',
            'z-index:30;pointer-events:none;',
            'font-family:var(--font-sans,sans-serif);font-size:0.65rem;',
            'color:rgba(200,215,255,0.38);letter-spacing:0.22em;',
            'opacity:0;transition:opacity 1.2s ease;',
            'text-align:center;'
        ].join('');
        skyEl.appendChild(secretCounter);
    }

    // ── 4. AURORA BLOBS ─────────────────────────────────────────────
    const auroraBlobs = [
        { px:0.14, py:0.28, hue:220, r:0.38, sp:0.000085, ph:0.0  },
        { px:0.78, py:0.62, hue:265, r:0.30, sp:0.000110, ph:2.1  },
        { px:0.42, py:0.88, hue:182, r:0.25, sp:0.000072, ph:4.3  },
        { px:0.88, py:0.18, hue:305, r:0.20, sp:0.000130, ph:1.7  },
        { px:0.55, py:0.45, hue:195, r:0.18, sp:0.000095, ph:3.5  },
    ];

    // ── 5. MYSTERY GLIMMERS ─────────────────────────────────────────
    function sr(seed) { const x = Math.sin(seed)*10000; return x-Math.floor(x); }
    const glimmers = Array.from({ length: 35 }, (_, i) => {
        const angle = sr(i*7.3)*Math.PI*2;
        const dist  = 2200 + sr(i*3.1)*7500;
        return {
            wx: Math.cos(angle)*dist, wy: Math.sin(angle)*dist,
            twSpeed: 0.6 + sr(i*1.9)*1.8,
            twPhase: sr(i*5.7)*Math.PI*2,
            baseA:   0.08 + sr(i*2.3)*0.18,
            alpha: 0,
        };
    });

    // ── 6. HIDDEN SECRETS ───────────────────────────────────────────
    const secrets = [
        { wx:1800,  wy:-800,  found:false, alpha:0,
          text:'כאן עצר מישהו אחר לפניך, הביט אל אותם שמיים, וחיפש את אותה תשובה.' },
        { wx:-2200, wy:1200,  found:false, alpha:0,
          text:'המרחק מהמרכז לא מודד שם. הוא מודד אומץ.' },
        { wx:800,   wy:2500,  found:false, alpha:0,
          text:'הקונסטלציה שלך נמצאת מאחוריך — אבל את/ה ממשיכ/ת. זה כבר אומר הכל.' },
        { wx:-1500, wy:-2000, found:false, alpha:0,
          text:'כוכב שנמצא רחוק לא אומר שהוא שקט. אולי הוא פשוט ממתין שמישהו יתקרב.' },
        { wx:3000,  wy:800,   found:false, alpha:0,
          text:'לגלות אינו רק לראות. לגלות פירושו לבחור לא לחזור כמות שהיית.' },
    ];

    // ── 7. BREADCRUMBS ──────────────────────────────────────────────
    const MAX_CRUMBS = 50;
    const crumbs = [];
    let lastCrumbSec = 0;

    // ── 8. POSITION TEXT MESSAGES ───────────────────────────────────
    const posMsgs = [
        { min:550,  max:1100, text:'מתרחקת מהקונסטלציה שלך...' },
        { min:1100, max:2400, text:'קונסטלציות של מבקרים קודמים מופיעות — לחצ/י על שמותיהן לקרוא.' },
        { min:2400, max:5000, text:'שמיים שחולקו על ידי אחרים שחיפשו את אותו הדבר.' },
        { min:5000, max:Infinity, text:'שולי הגלקסיה. מעטים הגיעו עד כאן.' },
    ];

    let lastPosMsg = '';
    let posTimerId = null;
    let secretsFound = 0;
    let totalT = 0;

    // ── HELPER: show secret discovery flash ─────────────────────────
    function revealSecret(txt) {
        if (window.showDeepText) window.showDeepText(txt);
        if (typeof AudioEngine !== 'undefined' && AudioEngine.playDiscoveryChime) {
            AudioEngine.playDiscoveryChime(290);
        }
    }

    function updateCounter() {
        secretCounter.textContent =
            '\u2726 ' + secretsFound + ' / ' + secrets.length + ' \u05e0\u05d2\u05d9\u05e2\u05d5\u05ea \u05e9\u05de\u05d9\u05d9\u05dd \u2726';
        secretCounter.style.opacity = '1';
    }

    // ── MAIN UPDATE (exported to window) ────────────────────────────
    window._discoveryUpdate = function(dt, camObj, dragging) {
        totalT += dt;
        const W = window.innerWidth, H = window.innerHeight;
        const CX = W/2, CY = H/2;
        const nowSec = performance.now()/1000;

        // Resize canvas if needed
        if (auroraCanvas.width !== W || auroraCanvas.height !== H) {
            auroraCanvas.width = W; auroraCanvas.height = H;
        }
        actx.clearRect(0, 0, W, H);

        // ── AURORA BLOBS ──────────────────────────────────────────
        auroraBlobs.forEach(b => {
            const t = totalT;
            const bx = (b.px + Math.sin(t*b.sp*900 + b.ph)*0.11)*W;
            const by = (b.py + Math.cos(t*b.sp*700 + b.ph+1)*0.07)*H;
            const br = b.r*Math.min(W,H);
            const pulse = 0.88 + 0.12*Math.sin(t*b.sp*1800 + b.ph);
            const g = actx.createRadialGradient(bx, by, 0, bx, by, br*pulse);
            g.addColorStop(0,   `hsla(${b.hue},65%,42%,0.038)`);
            g.addColorStop(0.5, `hsla(${b.hue+28},55%,32%,0.018)`);
            g.addColorStop(1,   'hsla(0,0%,0%,0)');
            actx.fillStyle = g;
            actx.beginPath();
            actx.ellipse(bx, by, br*pulse, br*pulse*0.55, b.ph*0.25, 0, Math.PI*2);
            actx.fill();
        });

        // ── BREADCRUMBS ───────────────────────────────────────────
        if (!dragging && nowSec - lastCrumbSec > 0.45) {
            lastCrumbSec = nowSec;
            crumbs.push({ wx:camObj.x, wy:camObj.y, born:nowSec });
            if (crumbs.length > MAX_CRUMBS) crumbs.shift();
        }
        crumbs.forEach(c => {
            const age = nowSec - c.born;
            const maxAge = 22;
            if (age > maxAge) return;
            const a = Math.pow(1 - age/maxAge, 1.5) * 0.28;
            const sx = (c.wx - camObj.x)*camObj.scale + CX;
            const sy = (c.wy - camObj.y)*camObj.scale + CY;
            if (sx < -10 || sx > W+10 || sy < -10 || sy > H+10) return;
            actx.beginPath();
            actx.arc(sx, sy, 1.8, 0, Math.PI*2);
            actx.fillStyle = `rgba(175,205,255,${a})`;
            actx.fill();
        });

        // ── MYSTERY GLIMMERS ──────────────────────────────────────
        glimmers.forEach(gl => {
            const sx = (gl.wx - camObj.x)*camObj.scale + CX;
            const sy = (gl.wy - camObj.y)*camObj.scale + CY;
            if (sx < -60 || sx > W+60 || sy < -60 || sy > H+60) {
                gl.alpha *= 0.9; return;
            }
            const wDist = Math.hypot(gl.wx - camObj.x, gl.wy - camObj.y);
            const reveal = Math.max(0, Math.min(1, 1 - wDist/7000));
            const twinkle = 0.5 + 0.5*Math.sin(totalT*gl.twSpeed + gl.twPhase);
            const targetA = reveal*(gl.baseA + twinkle*0.14);
            gl.alpha += (targetA - gl.alpha)*0.05;
            if (gl.alpha < 0.004) return;
            const gr = 6 + twinkle*5;
            const gd = actx.createRadialGradient(sx, sy, 0, sx, sy, gr);
            gd.addColorStop(0,   `rgba(225,238,255,${gl.alpha*2.2})`);
            gd.addColorStop(0.4, `rgba(180,210,255,${gl.alpha})`);
            gd.addColorStop(1,   'rgba(120,160,255,0)');
            actx.fillStyle = gd;
            actx.beginPath();
            actx.arc(sx, sy, gr, 0, Math.PI*2);
            actx.fill();
        });

        // ── SECRETS ───────────────────────────────────────────────
        if (window.skyRevealState === 'revealed') {
            secrets.forEach((s, i) => {
                const wDist = Math.hypot(s.wx - camObj.x, s.wy - camObj.y);
                const PROX = 350;
                if (wDist < PROX) {
                    const tgt = Math.max(0, (1 - wDist/PROX)*0.9);
                    s.alpha += (tgt - s.alpha)*0.05;
                    if (!s.found && wDist < 130) {
                        s.found = true; secretsFound++;
                        updateCounter();
                        revealSecret(s.text);
                    }
                    const sx = (s.wx - camObj.x)*camObj.scale + CX;
                    const sy = (s.wy - camObj.y)*camObj.scale + CY;
                    if (sx >= -20 && sx <= W+20 && sy >= -20 && sy <= H+20) {
                        const pulse = 0.5 + 0.5*Math.sin(totalT*2.2 + i*1.3);
                        const sr2 = 14 + pulse*10;
                        const sg = actx.createRadialGradient(sx, sy, 0, sx, sy, sr2);
                        sg.addColorStop(0,   `rgba(255,235,190,${s.alpha*0.9})`);
                        sg.addColorStop(0.5, `rgba(255,195,90,${s.alpha*0.35})`);
                        sg.addColorStop(1,   'rgba(255,180,60,0)');
                        actx.fillStyle = sg;
                        actx.beginPath();
                        actx.arc(sx, sy, sr2, 0, Math.PI*2);
                        actx.fill();
                    }
                } else {
                    s.alpha *= 0.93;
                }
            });
        }

        // ── POSITION TEXT ─────────────────────────────────────────
        if (!dragging && window.skyRevealState === 'revealed') {
            const dist = Math.hypot(camObj.x, camObj.y);
            let newMsg = '';
            for (const m of posMsgs) {
                if (dist >= m.min && dist < m.max) { newMsg = m.text; break; }
            }
            if (newMsg !== lastPosMsg) {
                lastPosMsg = newMsg;
                if (posTimerId) clearTimeout(posTimerId);
                posText.style.opacity = '0';
                if (newMsg) {
                    posTimerId = setTimeout(() => {
                        posText.textContent = newMsg;
                        posText.style.opacity = '1';
                        posTimerId = setTimeout(() => {
                            posText.style.opacity = '0';
                        }, 4500);
                    }, 900);
                }
            }
        } else if (dragging) {
            if (posTimerId) { clearTimeout(posTimerId); posTimerId = null; }
            posText.style.opacity = '0';
            lastPosMsg = '';
        }
    };
}

function initSky() {
    showScreen('screen-sky');
    
    // Initialize globalMouse to screen center so mouse reveal works immediately even before move
    globalMouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    // Remove the 2D canvas from DOM if it exists and replace with Three.js
    const oldCanvas = document.getElementById('sky-canvas');
    const container = oldCanvas ? oldCanvas.parentElement : document.getElementById('screen-sky');
    if (oldCanvas) oldCanvas.remove();

    W = window.innerWidth;
    H = window.innerHeight;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor('#000000', 1); // Always pure black background
    
    renderer.domElement.id = 'sky-canvas';
    container.insertBefore(renderer.domElement, container.firstChild);

    scene = new THREE.Scene();
    threeCam = new THREE.OrthographicCamera(-window.innerWidth / 2, window.innerWidth / 2, window.innerHeight / 2, -window.innerHeight / 2, 1, 1000);
    threeCam.position.z = 100;

    cam.x = vp.camStartX; cam.y = vp.camStartY; cam.scale = vp.startScale;
    targetCam.x = vp.camStartX; targetCam.y = vp.camStartY; targetCam.scale = vp.startScale;

    buildSignalField();

    initCameraEvents();
    // Show constellation title immediately with the image
    const earlyVision = answers.pareidolia || '';
    initConstellationSystem(earlyVision);
    skyRunning = true;
    skyIntroTime = 0;
    lastTS = performance.now();

    // Reset assembly + pareidolia state
    window.autoAssemblyTriggered = false;
    window.pareidoliaOverlayShown = true;
    window.pareidoliaUIActive = true;
    window.isAssemblingNow = false;
    window.timeCameraStill = 0;
    window.cameraWanderPath = [];

    // Hide all navigation UI
    const skyUi = document.querySelector('.sky-ui');
    if (skyUi) skyUi.style.display = 'none';

    // Hide the old overlay if it exists
    const oldOverlay = document.getElementById('sky-pareidolia-overlay');
    if (oldOverlay) oldOverlay.style.display = 'none';

    // DISCOVERY SYSTEM — aurora, glimmers, breadcrumbs, secrets, position text
    initDiscoverySystem();

    requestAnimationFrame(skyLoop);

    // Resume AudioContext (Chrome requires user gesture)
    const resumeAudio = () => {
        if (AudioEngine.ctx && AudioEngine.ctx.state === 'suspended') {
            AudioEngine.ctx.resume();
        }
        // Drone and atmosphere start delayed until revelation
        document.removeEventListener('mousemove', resumeAudio);
        document.removeEventListener('click', resumeAudio);
    };
    document.addEventListener('mousemove', resumeAudio, { once: true });
    document.addEventListener('click', resumeAudio, { once: true });
}


// ======================================================
// SIGNAL FIELD GENERATION
// ======================================================
async function buildSignalField() {
    if (typeof skyMeshes !== 'undefined' && skyMeshes) {
        skyMeshes.forEach(mesh => scene.remove(mesh));
    }
    if (typeof webglLines !== 'undefined' && webglLines) {
        scene.remove(webglLines);
    }
    skyPoints = [];
    majorPoints = [];
    const { rand, texts, dominantElement, topology, personalHue } = vp;
    const labelsDiv = document.getElementById('sky-labels');
    if (labelsDiv) labelsDiv.innerHTML = '';

    // ── BILATERAL RORSCHACH GEOMETRY ───────────────────────────────────
    // Symmetric bilateral form - the shape the mentor loved!
    // Points: 8 major anchors mirrored left/right, surrounded by clouds of minors

    const ALL_THEMES = ['Name', 'DOB', 'Time', 'Home', 'Change', 'Request', 'Dream', 'Unresolved'];

    const THEME_HUES = {
        'Name':       personalHue,
        'DOB':        (personalHue + 180) % 360,
        'Time':       45,
        'Home':       160,
        'Change':     280,
        'Request':    200,
        'Dream':      300,
        'Unresolved': 0
    };

    const POINT_TEXTS = {
        he: [
            "כאן נכנסת המפה אלייך, ולא להפך.",
            "זו אינה תשובה על מי את. זו נקודת התחלה.",
            answers.time === 'UNKNOWN' ? "הזמן שלא נרשם הוא חלק מהאופק." : "רגע שבו המפה הסתובבה אלייך.",
            "מכאן המבט שלך פונה אל השמיים.",
            "כאן משהו מבקש לזוז, גם אם המסלול עוד לא סגור.",
            "הנקודה הזאת מחזיקה את מה שביקשת מהשמיים.",
            "החלום שהנחת בשמיים הפך לנקודת אור.",
            "לא כל אזור במפה צריך להיות ברור כדי להיות חלק מהאופק."
        ],
        en: [
            "Here the map enters you, not the other way around.",
            "This is not an answer of who you are. It's a starting point.",
            answers.time === 'UNKNOWN' ? "The unrecorded time is part of the horizon." : "A moment the map turned toward you.",
            "From here your gaze turns to the sky.",
            "Here something asks to move, even if the path isn't closed.",
            "This point holds what you asked from the skies.",
            "The dream you placed in the sky became a point of light.",
            "Not every area in the map needs to be clear to be part of the horizon."
        ]
    };

    const elementTypes = ['flare', 'shard', 'blade'];
    
    // Vivid, maximally-separated colors — each lobe is a distinct region
    const LOBE_COLORS = [
         0/360, // Red
        60/360, // Yellow  
       120/360, // Green
       180/360, // Cyan
       220/360, // Blue
       270/360, // Purple
       300/360, // Magenta
        30/360  // Orange
    ];
    
    // ── USE QUESTIONNAIRE DRAWING AS STAR SHAPE (primary) ────────────────
    // If the user's drawn lines are available, use them to position the stars
    // so the constellation literally traces what they drew.
    // Fallback: image-based pareidolia lookup (getShapeForWordAsync).
    let shapeCoords = null;
    if (window._qDrawingPoints && window._qDrawingPoints.length > 4) {
        shapeCoords = window._qDrawingPoints;
    } else if (typeof getShapeForWordAsync !== 'undefined') {
        shapeCoords = await getShapeForWordAsync(answers.pareidolia);
    }
    
    // Flag for render loop
    window.isPointillism = !!shapeCoords;
    
    // coreNum determines the number of primary lobes (between 5 and 8)
    const numLobes = 5 + (vp.coreNum % 4); 

    if (shapeCoords) {
        // ── DYNAMIC PAREIDOLIA SHAPE GEOMETRY (POINTILLISM) ──────────────
        const shapeRadius = 600; // Increased significantly to fill the screen
        
        // shapeCoords is now an array of [x, y] coordinates sampled from a canvas
        // There could be 500-2000 points.
        
        // We need exactly 8 major points for the text labels.
        // When using questionnaire drawing, spread them evenly. Otherwise, random pick.
        const isQDriven = !!(window._qDrawingPoints && window._qDrawingPoints === shapeCoords);
        const majorIndices = new Set();
        if (isQDriven && window._qVertexIndices && window._qVertexIndices.size >= 3) {
            // Use actual questionnaire vertex dots as major (labeled) stars
            window._qVertexIndices.forEach(idx => {
                if (majorIndices.size < 8) majorIndices.add(idx);
            });
            // Fill remaining slots evenly if fewer than 8 vertices
            const step = Math.max(1, Math.floor(shapeCoords.length / (8 - majorIndices.size + 1)));
            for (let si = 0; majorIndices.size < 8 && si < shapeCoords.length; si += step) {
                majorIndices.add(si);
            }
        } else {
            while (majorIndices.size < 8 && majorIndices.size < shapeCoords.length) {
                majorIndices.add(Math.floor(rand() * shapeCoords.length));
            }
        }
        
        let majorIdx = 0;
        
        shapeCoords.forEach((coord, i) => {
            // Questionnaire-driven: coord[2] holds isVertex flag (1=vertex, 0=path point)
            // Use vertex = large labeled star, path points = clearly visible medium stars
            const isQCoord = Array.isArray(coord) && coord.length === 3;
            const isVertexStar = isQCoord && coord[2] === 1;
            const isMajorPoint = majorIndices.has(i) || isVertexStar;
            
            const clusterX = coord[0] * shapeRadius;
            const clusterY = coord[1] * shapeRadius * -1; // flip Y (THREE.js convention)
            const clusterZ = (rand() - 0.5) * 30; 
            
            // Vertex/key-corner stars use 'halo' (crystal) — tight 6-point star, no huge streaks
            const isQDrivenStar = isQCoord; // came from questionnaire drawing
            // All Q-shape stars use the same crystal type — unified prismatic look
            // Only background dust uses the simple dot type
            const elType = (isVertexStar || isQDrivenStar) ? 'halo' : 'dot';

            // Scale hierarchy: vertex are notably bigger but NOT massive
            // ALL Q-shape stars IDENTICAL size — vertex stars must NOT look like a separate shape.
            // Questionnaire button positions (vertex) can be far from central cluster,
            // so making them larger creates "isolated dots" = the "second image" illusion.
            const scaleBase = isMajorPoint
                ? (0.55 + rand() * 0.18)     // 0.55-0.73 — only labeled stars are bigger
                : (isVertexStar || isQDrivenStar)
                    ? (0.36 + rand() * 0.14)  // 0.36-0.50 — ALL Q-shape stars: same size
                    : (0.02 + rand() * 0.02);  // 0.02-0.04 — distractors: nearly invisible
            
            // Use personal hue but allow slight drift for a sparkling effect
            const cOffset = Math.floor(personalHue / 45);
            const lobeHue = isMajorPoint 
                            ? LOBE_COLORS[(majorIdx + cOffset) % LOBE_COLORS.length] * 360
                            : personalHue + (rand() - 0.5) * 30; // Shimmering monochrome for the body
            
            const pt = {
                x: clusterX, y: clusterY, z: clusterZ,
                originalX: clusterX, originalY: clusterY, originalZ: clusterZ,
                targetX: clusterX, targetY: clusterY, targetZ: clusterZ,
                starX: clusterX, starY: clusterY,
                anchorIdx: isMajorPoint ? (majorIdx % 8) : Math.floor(rand() * 8), 
                isMajor: isMajorPoint, 
                elementType: elType, // All points use the prismatic crystals now!
                theme: 'Pareidolia',
                text: null, 
                isBlurred: false, // Don't blur the background dots, keep the silhouette sharp!
                baseAngle: rand() * Math.PI * 2, 
                scale: scaleBase,
                hue: lobeHue, 
                isSeed: false, 
                depthLayer: isMajorPoint ? 1.0 : (1.2 + rand() * 0.5),
                fogRevealed: 0, hoverPulse: 0, permanentlyRevealed: false,
                pulseClock: Math.random() * Math.PI * 2, state: 0, timeNearby: 0, glowP: 0, bloomP: 0,
                revealProgress: 0, hasBeenRevealed: false, assemblyProgress: 0, isAssembling: false,
                totalDwellTime: 0, visitCount: 0, lastVisitedTime: 0, maxRevealProgress: 0, neighborPts: [],
                isVertexStar: isVertexStar,           // key corner point of questionnaire shape
                isQPathStar: isQDrivenStar && !isVertexStar // path/edge point between vertices
            };
            
            skyPoints.push(pt);
            if (isMajorPoint) {
                majorPoints.push(pt);
                majorIdx++;
            }
        });
        
        // Add fewer random distractor stars (the shape itself is now made of hundreds of stars!)
        const numDistractors = 10 + Math.floor(rand() * 5); // Very few background stars — keep it clean
        for (let i = 0; i < numDistractors; i++) {
            const minR2 = rand() * shapeRadius * 1.5;
            const minA = rand() * Math.PI * 2;
            const mrX = Math.cos(minA) * minR2;
            const mrY = Math.sin(minA) * minR2;
            const minZ = (rand() - 0.5) * shapeRadius;
            
            const minorR = {
                x: mrX, y: mrY, z: minZ, originalX: mrX, originalY: mrY, originalZ: minZ, targetX: mrX, targetY: mrY, targetZ: minZ,
                starX: mrX, starY: mrY,
                anchorIdx: Math.floor(rand()*8), isMajor: false, elementType: 'flare', theme: 'Pareidolia',
                text: null, isBlurred: true, baseAngle: rand() * Math.PI * 2, scale: rand() * 1.5,
                hue: personalHue, isSeed: false, depthLayer: 1.0 + rand() * 0.5,
                fogRevealed: 0, hoverPulse: 0, permanentlyRevealed: false,
                pulseClock: Math.random() * Math.PI * 2, state: 0, timeNearby: 0, glowP: 0, bloomP: 0,
                revealProgress: 0, hasBeenRevealed: false, assemblyProgress: 0, isAssembling: false,
                totalDwellTime: 0, visitCount: 0, lastVisitedTime: 0, maxRevealProgress: 0, neighborPts: [],
                isVertexStar: false,   // distractor: never a key corner
                isQPathStar: false     // distractor: not a questionnaire path point
            };
            skyPoints.push(minorR);
        }
    } else {
        // Arrange lobes in distinct angular sectors so color clusters are spatially separated
        for (let lobe = 0; lobe < numLobes; lobe++) {
        // Spread lobes evenly around the full circle so clusters don't overlap
        const sectorAngle = (Math.PI * 2 / numLobes) * lobe + rand() * 0.3;
        const radius = 80 + rand() * 220; 
        const clusterX = Math.cos(sectorAngle) * radius;
        const clusterY = Math.sin(sectorAngle) * radius * 0.9;
        
        const elType = elementTypes[Math.floor(rand() * elementTypes.length)];
        const scaleBase = 1.8 + rand() * 2.5;
        const baseAngleRight = rand() * Math.PI * 2;
        
        // Base hue for this lobe (strictly separated blocks of color)
        const cOffset = Math.floor(personalHue / 45); // deterministic offset based on answers
        const lobeHue = LOBE_COLORS[(lobe + cOffset) % LOBE_COLORS.length] * 360;
        
        // Exact identical color to prevent bleeding
        const ptHueRight = lobeHue;
        const ptHueLeft = lobeHue;
        
        // Give each lobe a Z variation
        const clusterZ = (rand() - 0.5) * radius * 1.2;
        
        // Right point
        const ptRight = {
            x: clusterX, y: clusterY, z: clusterZ,
            originalX: clusterX, originalY: clusterY, originalZ: clusterZ,
            targetX: clusterX, targetY: clusterY, targetZ: clusterZ,
            starX: clusterX, starY: clusterY,
            anchorIdx: lobe % 8, isMajor: true, elementType: elType, theme: 'Rorschach',
            text: null, isBlurred: false, baseAngle: baseAngleRight, scale: scaleBase,
            hue: ptHueRight, isSeed: false, depthLayer: 1.0,
            fogRevealed: 0, hoverPulse: 0, permanentlyRevealed: false,
            pulseClock: Math.random() * Math.PI * 2, state: 0, timeNearby: 0, glowP: 0, bloomP: 0,
            revealProgress: 0, hasBeenRevealed: false, assemblyProgress: 0, isAssembling: false,
            totalDwellTime: 0, visitCount: 0, lastVisitedTime: 0, maxRevealProgress: 0, neighborPts: []
        };
        // Left point (mirrored X, mirrored angle, mirrored Z?)
        // To keep a true 3D Rorschach symmetry, we can mirror Z too, or keep it same.
        // Let's keep Z symmetrical (or identical). Mirroring X creates the butterfly effect.
        const ptLeft = {
            ...ptRight,
            x: -clusterX, originalX: -clusterX, targetX: -clusterX,
            starX: -(ptRight.starX),
            hue: ptHueLeft,
            baseAngle: Math.PI - baseAngleRight, neighborPts: []
        };
        
        skyPoints.push(ptRight, ptLeft);
        majorPoints.push(ptRight, ptLeft);
        
        // Balanced: more minor stars for richer visual density
        const numMinors = 15 + Math.floor(rand() * 15);
        for (let i = 0; i < numMinors; i++) {
            const minR2 = 10 + rand() * 150;
            const minA = rand() * Math.PI * 2;
            const mrX = clusterX + Math.cos(minA) * minR2;
            const mrY = clusterY + Math.sin(minA) * minR2;
            
            const minorType = rand() > 0.4 ? elType : 'flare';
            const minScale = scaleBase * (0.3 + rand() * 0.5);
            const minBaseA = rand() * Math.PI * 2;
            
            const minorHueRight = lobeHue;
            const minorHueLeft = lobeHue;
            
            const minZ = clusterZ + (rand() - 0.5) * 80;
            
            const minorR = {
                x: mrX, y: mrY, z: minZ, originalX: mrX, originalY: mrY, originalZ: minZ, targetX: mrX, targetY: mrY, targetZ: minZ,
                starX: mrX, starY: mrY,
                anchorIdx: lobe % 8, isMajor: false, elementType: minorType, theme: 'Rorschach',
                text: null, isBlurred: true, baseAngle: minBaseA, scale: minScale,
                hue: minorHueRight, isSeed: false, depthLayer: 1.0 + rand() * 0.5,
                fogRevealed: 0, hoverPulse: 0, permanentlyRevealed: false,
                pulseClock: Math.random() * Math.PI * 2, state: 0, timeNearby: 0, glowP: 0, bloomP: 0,
                revealProgress: 0, hasBeenRevealed: false, assemblyProgress: 0, isAssembling: false,
                totalDwellTime: 0, visitCount: 0, lastVisitedTime: 0, maxRevealProgress: 0, neighborPts: [],
                isVertexStar: isVertexStar,           // key corner point of questionnaire shape
                isQPathStar: isQDrivenStar && !isVertexStar // path/edge point between vertices
            };
            const minorL = {
                ...minorR,
                x: -mrX, originalX: -mrX, targetX: -mrX,
                starX: -(minorR.starX),
                hue: minorHueLeft,
                baseAngle: Math.PI - minBaseA, neighborPts: []
            };
            
            skyPoints.push(minorR, minorL);
        }
        
        // --- MICRO LOD POINTS (CELLULAR STRUCTURE) ---
        // Increase count significantly for richer depth when zooming in
        const numMicro = 20 + Math.floor(rand() * 15);
        for (let j = 0; j < numMicro; j++) {
            const mcR = 5 + rand() * 60;
            const mcA = rand() * Math.PI * 2;
            const mcX = clusterX + Math.cos(mcA) * mcR;
            const mcY = clusterY + Math.sin(mcA) * mcR;
            const mcZ = clusterZ + (rand() - 0.5) * 20;
            
            const microRight = {
                x: mcX, y: mcY, z: mcZ,
                originalX: mcX, originalY: mcY, originalZ: mcZ,
                targetX: mcX, targetY: mcY, targetZ: mcZ,
                starX: mcX, starY: mcY,
                anchorIdx: lobe % 8, isMajor: false, elementType: 'flare', theme: 'Micro',
                text: null, isBlurred: false, baseAngle: rand() * Math.PI * 2, scale: scaleBase * 0.15,
                // Lower zoom threshold so they start appearing earlier (from scale 0.8 up to 2.5)
                hue: lobeHue, isSeed: false, depthLayer: 1.0, isMicro: true, zoomThreshold: 0.8 + rand() * 1.7,
                fogRevealed: 0, hoverPulse: 0, permanentlyRevealed: false,
                pulseClock: Math.random() * Math.PI * 2, state: 0, timeNearby: 0, glowP: 0, bloomP: 0,
                revealProgress: 0, hasBeenRevealed: false, assemblyProgress: 0, isAssembling: false,
                totalDwellTime: 0, visitCount: 0, lastVisitedTime: 0, maxRevealProgress: 0, neighborPts: [],
                isVertexStar: isVertexStar,           // key corner point of questionnaire shape
                isQPathStar: isQDrivenStar && !isVertexStar // path/edge point between vertices
            };
            
            const microLeft = {
                ...microRight,
                x: -mcX, originalX: -mcX, targetX: -mcX,
                starX: -(microRight.starX),
                baseAngle: Math.PI - microRight.baseAngle, neighborPts: []
            };
            skyPoints.push(microRight, microLeft);
        }
        
    } // end for (let lobe = 0; lobe < numLobes; lobe++)
    } // end else (bilateral shape fallback)

    // Add text labels to one major point per theme
    for (let t = 0; t < 8; t++) {
        const themePoints = skyPoints.filter(p => p.isMajor && p.anchorIdx === t % 8);
        if (themePoints.length > 0) {
            themePoints[0].text = POINT_TEXTS[currentLang][t % 8];
            themePoints[0].hue = THEME_HUES[ALL_THEMES[t % 8]];
            themePoints[0].theme = ALL_THEMES[t % 8];
        }
    }

    // Set hue based on theme for all points
    skyPoints.forEach(pt => {
        if (!pt.hue) {
            pt.hue = THEME_HUES[pt.theme] || personalHue;
        }
        pt.zoomThreshold = 0.0;
        pt.isSeed = pt.isMajor || (rand() > 0.8);
        pt.isMicro = false;
        pt.depthLayer = pt.isMajor ? 1.0 : (0.85 + rand() * 0.3);
        pt.fogRevealed = 0.2;
        pt.starX = pt.originalX;
        pt.starY = pt.originalY;
        pt.x = pt.starX;
        pt.y = pt.starY;
        const breatheDist = pt.isMajor ? 5 : 20;
        const breatheAngle = rand() * Math.PI * 2;
        pt.targetX = pt.originalX + Math.cos(breatheAngle) * breatheDist;
        pt.targetY = pt.originalY + Math.sin(breatheAngle) * breatheDist;
        // Staggered reveal: point starts invisible and fades in after its delay
        pt.appearP = 0;
    });

    // ── STAGGERED REVEAL DELAYS  ──
    // Meditative constellation discovery — each phase slow like a hand-drawn line:
    // Drawing-order reveal: ALL Q-shape stars appear in PATH ORDER (as they were drawn).
    // Vertex stars are bigger → naturally visible first even though timing overlaps.
    // No "two separate images" — one continuous shape builds itself.
    const allQPts     = skyPoints.filter(p => p.isVertexStar || p.isQPathStar);
    const otherMajors = skyPoints.filter(p => p.isMajor && !p.isVertexStar && !p.isQPathStar);
    const nonMajorPts = skyPoints.filter(p => !p.isMajor && !p.isVertexStar && !p.isQPathStar);

    // All Q-shape stars: sequential drawing order — ONE unified reveal
    // Fast stagger so the whole constellation outline appears in ~1.5s, not 5s.
    let qDelay = 0.0;
    allQPts.forEach((pt) => {
        pt.revealDelay = qDelay;
        if (pt.isVertexStar) pt.isFirstWave = true; // vertex stars still chime
        qDelay += 0.05 + rand() * 0.03; // 0.05–0.08s per star → full shape in ~1.5s
    });
    const qTotal = qDelay;

    // Other major labeled stars: appear after constellation is ~complete
    let nextMajorDelay = qTotal + 2.0;
    otherMajors.forEach((pt, i) => {
        pt.revealDelay = nextMajorDelay;
        if (i < 3) { pt.isFirstWave = true; }
        nextMajorDelay += 1.0 + rand() * 1.0;
    });

    // Minor ambient background stars: very last, barely visible
    let nextMinorDelay = Math.max(40.0, nextMajorDelay + 3.0);
    nonMajorPts.forEach(pt => {
        pt.revealDelay = nextMinorDelay;
        nextMinorDelay += 0.05 + rand() * 0.08;
    });

        // Proximity-based connections — form structured web within the core
    for (let i = 1; i < skyPoints.length; i++) {
        const pt = skyPoints[i];
        pt.neighborPts = [];
        
        // Pointillism shapes should NOT draw a tangled web between their dense minor stars
        if (pt.theme === 'Pareidolia' && !pt.isMajor) {
            continue; // Skip line drawing for dense minor dots
        }
        
        // Find nearest neighbors based on TARGET ASSEMBLED position, not random star position
        let candidates = [];
        for (let j = 0; j < i; j++) {
            const otherPt = skyPoints[j];
            
            // Don't connect to minor pareidolia dots either
            if (otherPt.theme === 'Pareidolia' && !otherPt.isMajor) continue;
            
            // Must use originalX/Y so the mesh looks structured
            const d = Math.hypot(pt.originalX - otherPt.originalX, pt.originalY - otherPt.originalY);
            if (d < (pt.isMicro ? 150 : 350)) { // Micro points connect tighter
                candidates.push({ pt: otherPt, d });
            }
        }
        candidates.sort((a,b) => a.d - b.d);
        // Fewer connections = better performance
        const numConn = pt.isMicro ? 2 : (1 + Math.floor(rand() * 2));
        pt.neighborPts.push(...candidates.slice(0, numConn).map(c => c.pt));
        
        if (pt.neighborPts.length === 0 && skyPoints[0]) {
            if (!(skyPoints[0].theme === 'Pareidolia' && !skyPoints[0].isMajor)) {
                pt.neighborPts.push(skyPoints[0]);
            }
        }
    }
    
    // ======================================
    // WEBGL GEOMETRY SETUP
    // ======================================
    // Shared geometry - smaller plane = fewer fragments to shade
    const planeGeo = new THREE.PlaneGeometry(200, 200);

    // Spiderweb line segments
    const lineMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.25, depthWrite: false });
    // Set the final state base zoom to be much closer
    targetCam.x = 0; targetCam.y = 0; targetCam.scale = 1.35;
    cam.x = 0; cam.y = 0; cam.scale = 1.35; 
    webglLineGeo = new THREE.BufferGeometry();
    // Cap line buffer: max 600 segments (each = 2 verts × 3 coords)
    const MAX_LINE_SEGS = 600;
    const linePos = new Float32Array(MAX_LINE_SEGS * 2 * 3);
    const lineCol = new Float32Array(MAX_LINE_SEGS * 2 * 3);
    webglLineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
    webglLineGeo.setAttribute('color', new THREE.BufferAttribute(lineCol, 3));
    webglLines = new THREE.LineSegments(webglLineGeo, lineMat);
    scene.add(webglLines); // Added back so we can see the crystal connections form!

    // Nodes
    skyMeshes = [];
    skyPoints.forEach(pt => {
        // Prismatic language: bladeFn (type 0) = single dramatic prism beam
        // Each star rotated by baseAngle → every star has its own unique ray direction
        let typeVal = 0.0; // blade/prism beam — the single-ray prism look the user wants
        if (pt.elementType === 'dot') typeVal = 3.0;    // very small micro dots stay soft

        const ptColor = new THREE.Color().setHSL(pt.hue / 360, pt.theme === 'Unresolved' ? 0.4 : 1.0, 0.65);

        const mat = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                uTime: { value: rand() * 100 },
                uColor: { value: ptColor },
                uType: { value: typeVal },
                uOpacity: { value: 1.0 },
                uGlow: { value: 0.2 }, // same as path stars — no isolated bright dots
                uState: { value: 1.0 },
                uZoom: { value: 0.65 },
                uDepth: { value: pt.isMajor ? 1.0 : (pt.isMicro ? 0.0 : 0.4) },
                uHasLabel: { value: 0.0 }
            },
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const mesh = new THREE.Mesh(planeGeo, mat);
        // Rotate each star's blade to its own angle → unique prism direction per star
        mesh.rotation.z = pt.baseAngle || 0;
        scene.add(mesh);
        skyMeshes.push(mesh);
        pt.mesh = mesh;
    });

    // ══════════════════════════════════════════════════════
    // RECOGNITION MODE SETUP
    // ══════════════════════════════════════════════════════
    if (window.skyRevealState === 'recognition') {
        // All points are placed at their assembled positions and fully visible
        // so the user can see the shape and name it.
        skyPoints.forEach(pt => {
            pt.x = pt.originalX;
            pt.y = pt.originalY;
            pt.assemblyProgress = 1.0;
            pt.isPermanentlyAssembled = true;
            pt.permanentlyRevealed = true;  // ALL points visible from start
            pt.appearP = 1.0;               // Skip staggered reveal in recognition mode
            pt.fogRevealed = 1.0;
            // Force correct shader uniforms immediately so first frame renders correctly
            if (pt.mesh) {
                const u = pt.mesh.material.uniforms;
                u.uOpacity.value = pt.isMajor ? 0.9 : 0.65;
                u.uGlow.value    = pt.isMajor ? 0.4 : 0.2;
                u.uState.value   = pt.isMajor ? 1.1 : 0.9;
                u.uZoom.value    = 0.65;
                // HIDE prism meshes during recognition — only SVG skeleton is visible
                pt.mesh.visible  = false;
            }
        });

        window.autoAssemblyTriggered = false; // Don't auto-assemble
        window.isAssemblingNow = false;
        // Also hide the WebGL line segments — only SVG lines show in recognition mode
        if (webglLines) webglLines.visible = false;
        
        // 2. Camera: zoomed in so the image is large and inviting to explore
        cam.x = 0; cam.y = 0; cam.scale = 0.65;
        targetCam.x = 0; targetCam.y = 0; targetCam.scale = 0.65;
        
        // 3. Draw questionnaire SVG lines on the sky overlay
        const srcSvg = document.getElementById('q-svg');
        const dstSvg = document.getElementById('sky-lineart-svg');
        if (srcSvg && dstSvg) {
            dstSvg.innerHTML = '';
            const lines = srcSvg.querySelectorAll('line, path');
            if (lines.length > 0) {
                const rawPts = [], rawSegs = [];
                // We now use paths (curves) instead of straight lines in the questionnaire
                const paths = Array.from(srcSvg.querySelectorAll('path'));
                paths.forEach(p => {
                    const d = p.getAttribute('d');
                    // Format: M x1 y1 Q cx cy x2 y2
                    const match = d.match(/M\s+([-\d.]+)\s+([-\d.]+)\s+Q\s+[-\d.]+\s+[-\d.]+\s+([-\d.]+)\s+([-\d.]+)/);
                    if (match) {
                        const x1 = parseFloat(match[1]);
                        const y1 = parseFloat(match[2]);
                        const x2 = parseFloat(match[3]);
                        const y2 = parseFloat(match[4]);
                        rawPts.push({x: x1, y: y1}, {x: x2, y: y2});
                        rawSegs.push({x1, y1, x2, y2});
                    }
                });
                
                // Fallback for lines just in case
                const lines = Array.from(srcSvg.querySelectorAll('line'));
                lines.forEach(line => {
                    const x1 = parseFloat(line.getAttribute('x1'));
                    const y1 = parseFloat(line.getAttribute('y1'));
                    const x2 = parseFloat(line.getAttribute('x2'));
                    const y2 = parseFloat(line.getAttribute('y2'));
                    rawPts.push({x: x1, y: y1}, {x: x2, y: y2});
                    rawSegs.push({x1, y1, x2, y2});
                });
                let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
                rawPts.forEach(p => { minX = Math.min(minX,p.x); maxX = Math.max(maxX,p.x); minY = Math.min(minY,p.y); maxY = Math.max(maxY,p.y); });
                const bw = maxX - minX || 1, bh = maxY - minY || 1;
                const bcx = (minX+maxX)/2, bcy = (minY+maxY)/2;
                const W2 = window.innerWidth, H2 = window.innerHeight;
                // For Rorschach bilateral display: each side spans ±22.5% from center → 45% total span
                const sc = Math.min(W2*0.45/bw, H2*0.40/bh);
                const cx2 = W2/2, cy2 = H2/2 - 80; // slightly higher center, more breathing room
                const txf = (x) => (x-bcx)*sc, tyf = (y) => (y-bcy)*sc;
                
                 const drawSide = (flip) => {
                    // DOTS APPEAR FIRST: immediately visible, define the shape
                    rawPts.forEach(p => {
                        const c = document.createElementNS("http://www.w3.org/2000/svg","circle");
                        c.setAttribute('cx', cx2 + txf(p.x)*flip);
                        c.setAttribute('cy', cy2 + tyf(p.y));
                        c.setAttribute('r','1.8');
                        c.setAttribute('fill','rgba(255,255,255,0.88)');
                        c.style.opacity = '0';
                        c.style.transition = 'opacity 1.0s ease-in-out';
                        dstSvg.appendChild(c);
                        requestAnimationFrame(() => { c.getBoundingClientRect(); c.style.opacity = '1'; });
                    });
                    // LINES CONNECT AFTER (1.5s delay so dots are already visible first)
                    rawSegs.forEach(seg => {
                        const l = document.createElementNS("http://www.w3.org/2000/svg","line");
                        l.setAttribute('x1', cx2 + txf(seg.x1)*flip);
                        l.setAttribute('y1', cy2 + tyf(seg.y1));
                        l.setAttribute('x2', cx2 + txf(seg.x2)*flip);
                        l.setAttribute('y2', cy2 + tyf(seg.y2));
                        l.setAttribute('stroke','rgba(255,255,255,0.60)');
                        l.setAttribute('stroke-width','0.8');
                        l.setAttribute('stroke-linecap','round');
                        const len = Math.hypot(txf(seg.x2)*flip - txf(seg.x1)*flip, tyf(seg.y2) - tyf(seg.y1));
                        l.style.strokeDasharray = len;
                        l.style.strokeDashoffset = len;
                        l.style.transition = 'stroke-dashoffset 7s ease-in-out 1.5s';
                        dstSvg.appendChild(l);
                        requestAnimationFrame(() => { l.getBoundingClientRect(); l.style.strokeDashoffset = '0'; });
                    });
                 };
                 drawSide(1);   // Original constellation side
                 drawSide(-1);  // Mirror side — creates Rorschach / inkblot bilateral symmetry
                 // Subtle vertical center axis line to reinforce the Rorschach fold
                 const axis = document.createElementNS("http://www.w3.org/2000/svg", "line");
                 axis.setAttribute('x1', cx2); axis.setAttribute('y1', cy2 - H2 * 0.35);
                 axis.setAttribute('x2', cx2); axis.setAttribute('y2', cy2 + H2 * 0.35);
                 axis.setAttribute('stroke', 'rgba(255,255,255,0.08)');
                 axis.setAttribute('stroke-width', '0.5');
                 axis.setAttribute('stroke-dasharray', '4 8');
                 dstSvg.appendChild(axis);
                
                // --- Serialize for ghost pool saving later ---
                const uniquePts = [];
                const linesArr = [];
                const getPtIdx = (x, y) => {
                    let idx = uniquePts.findIndex(p => Math.abs(p.x - x) < 0.1 && Math.abs(p.y - y) < 0.1);
                    if (idx === -1) {
                        idx = uniquePts.length;
                        uniquePts.push({x, y});
                    }
                    return idx;
                };
                
                rawSegs.forEach(seg => {
                    const i1 = getPtIdx(txf(seg.x1), tyf(seg.y1));
                    const i2 = getPtIdx(txf(seg.x2), tyf(seg.y2));
                    linesArr.push([i1, i2]);
                    
                    const m1 = getPtIdx(-txf(seg.x1), tyf(seg.y1));
                    const m2 = getPtIdx(-txf(seg.x2), tyf(seg.y2));
                    linesArr.push([m1, m2]);
                });
                
                window.lastUserConstellation = { pts: uniquePts, lines: linesArr };
            }
        }
        
        // 4. Show recognition overlay with question
        const overlay = document.getElementById('recognition-overlay');
        const qEl = document.getElementById('recog-question');
        const iEl = document.getElementById('recog-input');
        const bEl = document.getElementById('recog-submit');
        
        if (overlay) {
            overlay.style.display = 'flex';
            if (currentLang === 'he') {
                qEl.innerText = 'מה את רואה?';
                iEl.placeholder = '';
                iEl.dir = 'rtl';
                bEl.innerText = 'חשפו את המפה';
            } else {
                qEl.innerText = 'What do you see?';
                iEl.placeholder = '';
                iEl.dir = 'ltr';
                bEl.innerText = 'Reveal the map';
            }
            
            setTimeout(() => {
                qEl.style.opacity = '1';
                document.getElementById('recog-input-wrap').style.opacity = '1';
            }, 1200);
            
            // 5. Handle revelation trigger — dramatic reveal
            const triggerRevelation = async () => {
                const userVision = iEl.value.trim();
                if (!userVision) return;
                answers.pareidolia = userVision;
                
                // IMMEDIATELY hide ALL recognition UI — no text leaks to prismatic screen
                const _recogOvl = document.getElementById('recognition-overlay');
                if (_recogOvl) _recogOvl.style.display = 'none';
                // *** ROOT CAUSE FIX: clear SVG instantly at t=0 ***
                const _svgNow = document.getElementById('sky-lineart-svg');
                if (_svgNow) { _svgNow.innerHTML = ''; _svgNow.style.display = 'none'; }
                // *** SCREEN WIPE: brief opacity=0 to flush any GPU-composited SVG layers ***
                const _skyScrWipe = document.getElementById('screen-sky');
                if (_skyScrWipe) {
                    _skyScrWipe.style.transition = 'opacity 0.2s ease';
                    _skyScrWipe.style.opacity = '0';
                }
                // Instantly kill the programmatic overlay (the qEl / input container)
                if (overlay) {
                    overlay.style.transition = 'none';
                    overlay.style.opacity = '0';
                    overlay.style.display = 'none';
                    overlay.style.pointerEvents = 'none';
                }
                qEl.style.opacity = '0';
                document.getElementById('recog-input-wrap').style.opacity = '0';

                // Phase 2: Fade out SVG lines gracefully
                setTimeout(() => {
                    if (dstSvg && dstSvg.parentNode) {
                        // Remove SVG from DOM entirely — zero chance of overlap
                        dstSvg.parentNode.removeChild(dstSvg);
                    }
                    overlay.style.transition = 'opacity 1.5s ease';
                    overlay.style.opacity = '0';
                    
                    const soundBtn2 = document.getElementById('btn-sound-toggle');
                    if (soundBtn2) soundBtn2.style.display = '';
                    
                    // Phase 3: Wait for fade out to finish, THEN trigger gentle reveal
                    setTimeout(() => {
                        overlay.style.display = 'none';
                        if (dstSvg) {
                            dstSvg.innerHTML = '';
                            dstSvg.style.display = 'none'; // fully remove so nothing overlaps
                        }
                        
                        // *** FADE BACK IN: reveal the constellation cleanly after wipe ***
                        const _skyScrReveal = document.getElementById('screen-sky');
                        if (_skyScrReveal) {
                            _skyScrReveal.style.transition = 'opacity 1.2s ease-in';
                            _skyScrReveal.style.opacity = '1';
                        }

                        // GENTLE REVEAL
                        window.skyRevealState = 'revealed';
                        
                        // Start ambient audio only now
                        if (AudioEngine.ctx && AudioEngine.ctx.state === 'suspended') {
                            AudioEngine.ctx.resume();
                        }
                        AudioEngine.startDrone(vp.personalHue || 180);
                        AudioEngine.startAtmosphere();
                        
                        skyIntroTime = 0;
                        // CRITICAL: Reset all appearP values so the staggered reveal starts fresh
                        skyPoints.forEach(pt => {
                            pt.appearP = 0;
                            pt._chimePlayedOnAppear = false;
                        });
                        // Constellation zoom-in: pull camera closer to the shape as stars appear
                        // then slowly drift out for free exploration after ~15s
                        targetCam.x = 0; targetCam.y = 0;
                        targetCam.scale = 0.65; // STAY at default zoom — no jump
                        window._constellationZoomOut = false;
                        setTimeout(() => {
                            if (window.skyRevealState === 'revealed') {
                                window._constellationZoomOut = true; // signal to slowly retreat
                            }
                        }, 22000); // hold zoom for 22s while shape builds, then let user pan freely
                        window.updateGlobalBackButton();
                        // *** BLOOM FIX: activate bloom so the initial huge glow fades naturally
                        // to the normal calm baseGlow (0.55). Without this, bloomProgress=0 forever
                        // → glowValue stays at 3.55 creating a huge diffuse "ghost" image.
                        window.isBloomTriggered = true;   // FIXED: was false — now bloom animates
                        window.bloomProgress = 0.0;       // Start at max-glow, settle to calm
                        window.bloomShockwave = null;      // Reset shockwave
                        window.userConstellationName = userVision;
                        
                        // Show title immediately
                        window.titleRevealed = true;
                        showInterpretationPanel(window.userConstellationName);
                        const skyUi = document.querySelector('.sky-ui');
                        if (skyUi) {
                            skyUi.style.display = 'flex';
                            skyUi.style.opacity = '0';
                            setTimeout(() => skyUi.style.opacity = '1', 100);
                        }
                        
                        // Restore ALL mesh visibility (recognition mode hid them)
                        if (webglLines) webglLines.visible = true;
                        skyPoints.forEach(pt => { if (pt.mesh) pt.mesh.visible = true; });

                        // The camera will not move or zoom here per user request, 
                        // allowing the stars to build up peacefully in their place.

                        // ── AUTO-SAVE to gallery for future participants ──
                        // Runs 4 seconds after revelation to ensure lastUserConstellation is ready.
                        setTimeout(() => {
                            if (window.lastUserConstellation
                                && userVision
                                && !window._hasSavedCurrentConstellation) {
                                window._hasSavedCurrentConstellation = true;
                                try {
                                    const saved = JSON.parse(
                                        localStorage.getItem('pagmar_saved_constellations') || '[]'
                                    );
                                    // Personal color tint from questionnaire hue
                                    const h = (vp.personalHue || 200);
                                    const toRGB = (deg) => {
                                        const rad = (deg % 360) * Math.PI / 180;
                                        return Math.round(165 + 90 * Math.sin(rad));
                                    };
                                    const r = toRGB(h);
                                    const g2 = toRGB(h + 120);
                                    const b2 = toRGB(h + 240);
                                    saved.push({
                                        nameHe: userVision,
                                        nameEn: userVision,
                                        color: `rgba(${r},${g2},${b2},`,
                                        pts: window.lastUserConstellation.pts,
                                        lines: window.lastUserConstellation.lines,
                                        textHe: `קונסטלציית “${userVision}” נוצרה על ידי משתתפ/ת שביקר במרחב זה.`,
                                        textEn: `The constellation “${userVision}” — created by a participant who visited this space.`
                                    });
                                    localStorage.setItem(
                                        'pagmar_saved_constellations',
                                        JSON.stringify(saved)
                                    );
                                } catch(e) {}
                            }
                        }, 4000);

                    }, 1500); // Wait 1.5s for the fade out to finish

                }, 400);
            };

            bEl.onclick = triggerRevelation;
            iEl.addEventListener('keydown', e => { if (e.key === 'Enter') triggerRevelation(); });
        }
        
        // Hide sky UI elements during recognition
        const skyUi = document.querySelector('.sky-ui');
        if (skyUi) skyUi.style.display = 'none';
        const soundBtn = document.getElementById('btn-sound-toggle');
        if (soundBtn) soundBtn.style.display = 'none';
    }
    // ── FEATURE: Guided journey text ──
    (function createGuideText() {
        const skyScreen = document.getElementById('screen-sky');
        if (!skyScreen) return;
        const prev = document.getElementById('discovery-guide');
        if (prev) prev.remove();

        const guide = document.createElement('div');
        guide.id = 'discovery-guide';
        Object.assign(guide.style, {
            position: 'absolute', bottom: '80px',
            left: '0', right: '0',
            textAlign: 'center',
            fontFamily: 'serif', fontSize: '1rem',
            color: '#fff', opacity: '0.5',
            pointerEvents: 'none',
            transition: 'opacity 0.8s ease',
            zIndex: '50'
        });
        guide.textContent = '';
        skyScreen.appendChild(guide);

        // Initialise discovery state
        window.discoveryPhase = 0;
        window.discoveryMoveAccum = 0;
        window.discoveryPhase2Time = 0;
        window.discoveryGuideReady = true;
    })();
}

// ======================================================
// MAIN LOOP
// ======================================================
function skyLoop(ts) {
    if (!skyRunning) return;
    requestAnimationFrame(skyLoop);
    
    // Fix: ts is undefined on the manual first call, preventing NaN cascade
    const now = performance.now();
    if (!ts) ts = now;
    
    // Fallback if lastTS isn't initialized properly
    if (!lastTS) lastTS = now;
    
    const dt = clamp((ts - lastTS) / 1000, 0, 0.05);
    lastTS = ts;
    // Only count intro time when in revealed state (staggered reveal timer)
    if (window.skyRevealState === 'revealed') {
        skyIntroTime += dt;
    }
    
    // Global organism rotation + organic wobble
    if (!window.organismAngle) window.organismAngle = 0;
    if (window.skyRevealState === 'revealed') {
        // Slow majestic rotation with subtle speed variation (like a jellyfish)
        const rotSpeed = 0.08 + Math.sin(now * 0.0005) * 0.03;
        window.organismAngle += dt * rotSpeed;
    }

    // --- Bloom Mechanic Tracking ---
    if (!window.isBloomTriggered && window.skyRevealState !== 'recognition') {
        let revealedCount = 0;
        skyPoints.forEach(pt => { if (pt.permanentlyRevealed) revealedCount++; });
        
        // Trigger if 20% of the shape is manually discovered OR if 30 seconds have passed
        if (revealedCount / skyPoints.length > 0.20 || skyIntroTime > 30.0) {
            window.isBloomTriggered = true;
            window.bloomProgress = 0.0;
        }
    }
    
    if (window.isBloomTriggered && window.skyRevealState !== 'recognition') {
        // DRAMATIC 3-PHASE BLOOM:
        // Phase 1 (0-0.3): Rapid inhale — points rush inward with shockwave
        // Phase 2 (0.3-0.7): Expansion — organism swells and glows intensely
        // Phase 3 (0.7-1.0): Settle — gentle landing into living state
        const phase = window.bloomProgress;
        let bloomSpeed;
        // SLOWER, MAJESTIC BLOOM
        if (phase < 0.3) {
            bloomSpeed = 0.15; // Moderate inhale
        } else if (phase < 0.7) {
            bloomSpeed = 0.05; // Majestic expansion
        } else {
            bloomSpeed = 0.03; // Gentle settle
        }
        window.bloomProgress = Math.min(1.0, window.bloomProgress + dt * bloomSpeed);
        
        // Shockwave ripple during bloom
        if (!window.bloomShockwave) window.bloomShockwave = { radius: 0, strength: 2.5 };
        if (window.bloomShockwave.radius < 3000) {
            window.bloomShockwave.radius += dt * 400;
            window.bloomShockwave.strength = Math.max(0, 1.0 - window.bloomShockwave.radius / 3000);
        }
        
        // When bloom finishes, reveal the title and zoom out!
        if (window.bloomProgress >= 1.0 && window.userConstellationName && !window.titleRevealed) {
            window.titleRevealed = true;
            setTimeout(() => {
                showInterpretationPanel(window.userConstellationName);
                targetCam.scale = Math.max(0.1, vp.startScale * 0.5); // Zoom out slowly for wander mode
                const skyUi = document.querySelector('.sky-ui');
                if (skyUi) {
                    skyUi.style.display = 'flex';
                    skyUi.style.opacity = '0';
                    setTimeout(() => skyUi.style.opacity = '1', 100);
                }
            }, 500);
        }
    }

    if (window.skyRevealState === 'revealed') {
        // Auto drift the 3D object rotation instead of panning the camera
        if (!isDragging) {
            targetGlobalRotY += 0.0005; // Very slow continuous auto-rotation
        }
        
        // Smoothly interpolate rotation
        globalRotX = lerp(globalRotX, targetGlobalRotX, 0.05);
        globalRotY = lerp(globalRotY, targetGlobalRotY, 0.05);
        
        // Re-center camera over time since object rotates in place
        targetCam.x = lerp(targetCam.x, 0, dt * 0.5);
        targetCam.y = lerp(targetCam.y, 0, dt * 0.5);
        // After constellation has formed, gently zoom out to exploration scale
        if (window._constellationZoomOut) {
            targetCam.scale = lerp(targetCam.scale, 0.55, dt * 0.08);
        }
    } else {
        // Auto camera drift if not dragging (original behavior)
        if (!isDragging && !window.cameraWanderPath) {
            targetCam.x = Math.sin(animClock * 0.2) * 50;
            targetCam.y = Math.cos(animClock * 0.15) * 50;
        }
    }

    cam.x     = lerp(cam.x,     targetCam.x,     0.04);
    cam.y     = lerp(cam.y,     targetCam.y,     0.04);
    const scaleLerp = (skyIntroTime < 3.0) ? 0.025 : 0.05;
    cam.scale = lerp(cam.scale, targetCam.scale, scaleLerp);

    // ══ ZOOM-OUT CLEARS USER CONSTELLATION INFO ══════════════════
    // When zoomed out, personal title and panel fade away to reveal galaxy
    {
        const userTitleEl = document.getElementById('user-constellation-title');
        const interpPanel = document.getElementById('sky-interpretation-panel');
        // At cam.scale < 0.48 → fade out; above 0.58 → fade in
        const userAlpha = smoothstep(0.42, 0.60, cam.scale);
        if (userTitleEl && userTitleEl.style.opacity !== undefined) {
            // Only override if not in the initial 0-opacity state (before it was revealed)
            if (parseFloat(userTitleEl.style.opacity) > 0.01 || userAlpha > 0.01) {
                userTitleEl.style.opacity = userAlpha.toFixed(3);
            }
        }
        if (interpPanel) {
            interpPanel.style.opacity = userAlpha.toFixed(3);
            interpPanel.style.pointerEvents = userAlpha > 0.5 ? 'auto' : 'none';
        }
        
        // --- Sunrise Button Logic ---
        const btnSunrise = document.getElementById('btn-sunrise');
        if (btnSunrise && window.skyRevealState === 'revealed') {
            if (cam.scale < 0.40) {
                btnSunrise.classList.add('visible');
            } else {
                btnSunrise.classList.remove('visible');
            }
        }
    }    // ── Update Zoom Depth Bar ──
    const zoomBar = document.getElementById('zoom-depth-bar');
    const zoomThumb = document.getElementById('zoom-thumb');
    const zoomLabelEl = document.getElementById('zoom-label');
    if (zoomBar && zoomThumb && window.skyRevealState === 'revealed') {
        zoomBar.style.opacity = '1';
        // Map cam.scale from [0.1, 10.0] to [0%, 100%] on a log scale
        const MIN_ZOOM = 0.1, MAX_ZOOM = 10.0;
        const logMin = Math.log(MIN_ZOOM);
        const logMax = Math.log(MAX_ZOOM);
        const logCur = Math.log(Math.max(MIN_ZOOM, cam.scale));
        // Top = zoomed out (0.1), Bottom = zoomed in (10.0)
        const pct = 1.0 - (logCur - logMin) / (logMax - logMin);
        zoomThumb.style.top = (pct * 100).toFixed(1) + '%';
        // Label
        if (cam.scale < 0.3) zoomLabelEl.textContent = 'החוצה';
        else if (cam.scale > 3.0) zoomLabelEl.textContent = 'פנימה';
        else zoomLabelEl.textContent = '—';
    } else if (zoomBar) {
        zoomBar.style.opacity = '0';
    }

    // (Automatic zoom out removed per user request)

    // In 'exploration' mode, revelationProgress stays at 0 — shape is revealed by lantern only
    if (window.skyRevealState === 'revealing') {
        const elapsed = (performance.now() - window.revelationStart) / 1000;
        window.revelationProgress = clamp(elapsed / 6.0, 0, 1);
        if (window.revelationProgress >= 1.0) {
            window.skyRevealState = 'revealed';
            const skyUi = document.querySelector('.sky-ui');
            if (skyUi) skyUi.style.display = 'none';
            const soundBtn = document.getElementById('btn-sound-toggle');
            if (soundBtn) soundBtn.style.display = '';
        }
    }

    let camVelocity = 0;
    if (lastCamX !== null) {
        camVelocity = Math.hypot(cam.x - lastCamX, cam.y - lastCamY) / dt;
    }
    lastCamX = cam.x;
    lastCamY = cam.y;
    AudioEngine.updateMovement(camVelocity);
    // Update zoom-based audio (throttled to every ~10 frames)
    if (!window._zoomAudioTick) window._zoomAudioTick = 0;
    window._zoomAudioTick++;
    if (window._zoomAudioTick % 10 === 0) AudioEngine.updateZoom(cam.scale);

    // Track user's wander path
    if (!window.cameraWanderPath) window.cameraWanderPath = [];
    if (!window.lastWanderTime || now - window.lastWanderTime > 1000) {
        if (window.cameraWanderPath.length === 0 || camVelocity > 5.0) {
            window.cameraWanderPath.push({ x: cam.x, y: cam.y });
            window.lastWanderTime = now;
        }
    }

    // ── UPDATE DISCOVERY RIPPLES ──
    if (!window.activeRipples) window.activeRipples = [];
    for (let i = window.activeRipples.length - 1; i >= 0; i--) {
        const rip = window.activeRipples[i];
        rip.radius += rip.speed * dt;
        rip.strength = 1.0 - (rip.radius / rip.maxRadius);
        if (rip.radius >= rip.maxRadius) {
            window.activeRipples.splice(i, 1);
        }
    }

    // ── AUTO-ASSEMBLY: stars become Rorschach ─────────
    const AUTO_ASSEMBLE_AFTER = 3.0;
    
    if (skyIntroTime > AUTO_ASSEMBLE_AFTER && !window.autoAssemblyTriggered) {
        window.autoAssemblyTriggered = true;
        
        // Hide the navigation / hint UI immediately
        const skyUi = document.querySelector('.sky-ui');
        if (skyUi) skyUi.style.display = 'none';

        // Smooth camera zoom to center where the bilateral form lives
        targetCam.x = 0;
        targetCam.y = 0;
        targetCam.scale = 0.45; // Start slightly more zoomed out to show color clusters
        
        // Start assembly at the center of the constellation
        window.lockedAssemblyX = 0;
        window.lockedAssemblyY = 0;
        // Generate unique shape based on what user typed!
        const hash = [...(answers.pareidolia || "PAGMAR")].reduce((acc, char) => acc + char.charCodeAt(0), 0);
        window.assemblyShapeType = hash % 5; // Unique shape out of 5 options
        window.isAssemblingNow = true;
        window.timeCameraStill = 99; // keep assembly locked on
    }

    // Also allow manual assembly by hovering still (original mechanic preserved)
    if (!window.autoAssemblyTriggered) {
        if (!isDragging && camVelocity < 2.0) {
            window.timeCameraStill = (window.timeCameraStill || 0) + dt;
        } else {
            window.timeCameraStill = Math.max(0, (window.timeCameraStill || 0) - dt * 4.0);
            if (window.timeCameraStill <= 0) {
                window.lockedAssemblyX = cam.x;
                window.lockedAssemblyY = cam.y;
            }
        }
        if (skyIntroTime < 5.0) window.timeCameraStill = 0;

        if (window.timeCameraStill > 2.0 && !window.isAssemblingNow) {
            window.isAssemblingNow = true;
            window.lockedAssemblyX = cam.x;
            window.lockedAssemblyY = cam.y;
            window.assemblyShapeType = Math.floor(Math.random() * 5);
        } else if (window.timeCameraStill < 0.5) {
            window.isAssemblingNow = false;
        }
    }

    let closestDist = Infinity;
    let closestPt = null;
    skyPoints.forEach(pt => {
        if (!pt.isMajor) return;
        const sx = (pt.x - cam.x) * cam.scale;
        const sy = (pt.y - cam.y) * cam.scale;
        const distSq = sx * sx + sy * sy;
        if (distSq < closestDist) {
            closestDist = distSq;
            closestPt = pt;
        }
    });

    // Update lines geometry
    const positions = webglLineGeo.attributes.position.array;
    const colors = webglLineGeo.attributes.color.array;
    let lineIdx = 0;
    let colorIdx = 0;

    skyPoints.forEach(pt => {
        // --- LOD (Level of Detail) check for micro-structures ---
        if (pt.isMicro && cam.scale < pt.zoomThreshold) {
            pt.mesh.visible = false;
            pt._zoomRevealed = false; // Reset so it can chime again if zoomed out and in
            return;
        }

        // --- FRUSTUM CULLING: skip off-screen points entirely ---
        const SW = window.innerWidth;
        const SH = window.innerHeight;
        const screenX = (pt.x - cam.x) * cam.scale + SW * 0.5;
        const screenY = (pt.y - cam.y) * cam.scale + SH * 0.5;
        const margin = 160;
        const onScreen = screenX > -margin && screenX < SW + margin && screenY > -margin && screenY < SH + margin;
        if (!onScreen) {
            pt.mesh.visible = false;
            return;
        }

        updatePoint(pt, dt, pt === closestPt);
        
        // ── DRAW WEBGL LINES (ORGANIC CELL NETWORK) ──
    // The user explicitly requested to keep the webglLines!
    const isClosest = (pt === closestPt);
    const rpEase = 1.0; // In revealed state, it's always fully eased
    // Draw lines only for the fully formed organism (and NOT in Pointillism mode)
    const _isQShapePt = pt.isVertexStar || pt.isQPathStar;
    // Q-shape stars: draw bright connecting lines even in pointillism mode
    // Other stars: only draw lines in non-pointillism mode
    if (window.skyRevealState === 'revealed' && pt.mesh.visible &&
        (_isQShapePt || !window.isPointillism)) {
        let linesDrawn = 0;
        for (let i = 0; i < pt.neighborPts.length && linesDrawn < 2; i++) {
            const opt = pt.neighborPts[i];
            if (opt === pt || opt.mesh.visible === false) continue;
            
            const d = Math.hypot(pt.x - opt.x, pt.y - opt.y);
            const thresh = 250 * pt.assemblyProgress;

            if (d < thresh) {
                // Fade line based on appearP of both connected points
                // FIX: use nullish check, not ||, because 0 || 1.0 = 1.0 in JS
                const appearFade = (pt.appearP != null ? pt.appearP : 1.0) * (opt.appearP != null ? opt.appearP : 1.0);
                // Q-shape connections are bright; background connections are dim
                const _isQConn = _isQShapePt && (opt.isVertexStar || opt.isQPathStar);
                const lineBase = _isQConn ? 0.52 : 0.12;
                const alpha = (1 - d/thresh) * rpEase * lineBase * appearFade;
                if (alpha > 0.01 && lineIdx + 5 < positions.length && (lineIdx / 6) < 600) {
                    const osp = w2s(opt.x, opt.y);
                    
                    // From
                    positions[lineIdx++] = pt.mesh.position.x;
                    positions[lineIdx++] = pt.mesh.position.y;
                    positions[lineIdx++] = pt.mesh.position.z - 1;
                    
                    colors[colorIdx++] = alpha;
                    colors[colorIdx++] = alpha;
                    colors[colorIdx++] = alpha;
                    
                    // To
                    const depthOffset = (opt.depthLayer - 1.0) * 0.15;
                    const optParallaxX = (osp.x - window.innerWidth / 2) * depthOffset;
                    const optParallaxY = (osp.y - window.innerHeight / 2) * depthOffset;
                    positions[lineIdx++] = osp.x - window.innerWidth/2 + optParallaxX;
                    positions[lineIdx++] = -(osp.y - window.innerHeight/2 + optParallaxY);
                    positions[lineIdx++] = pt.mesh.position.z - 1;

                    colors[colorIdx++] = alpha;
                    colors[colorIdx++] = alpha;
                    colors[colorIdx++] = alpha;
                    
                    linesDrawn++;
                }
            }
        }
    }

    });

    // Use setDrawRange to only render written lines (no need to zero the rest)
    webglLineGeo.setDrawRange(0, lineIdx / 3);
    webglLineGeo.attributes.position.needsUpdate = true;
    webglLineGeo.attributes.color.needsUpdate = true;

    renderer.render(scene, threeCam);

    // ── DISCOVERY SYSTEM UPDATE (aurora, glimmers, breadcrumbs, secrets) ──
    if (window._discoveryUpdate) {
        window._discoveryUpdate(dt, cam, isDragging);
    }

    // ── AUTO SCROLL-TEXT: reveal ONLY on zoom scroll, never during drag ──
    (function autoScrollText() {
        if (window.skyRevealState !== 'revealed') return;
        
        // Track drag-end time for cooldown
        if (isDragging) {
            window._lastDragEndTime = performance.now();
            // Hide any open text immediately when drag starts
            const modal = document.getElementById('deep-text-modal');
            if (modal) modal.classList.add('hidden');
            window._autoTextPt = null;
            return;
        }
        
        // 700ms cooldown after drag ends — no text during momentum phase
        const dragCooldown = 700;
        if (window._lastDragEndTime && performance.now() - window._lastDragEndTime < dragCooldown) {
            return;
        }

        const ZOOM_SHOW = 1.15;   // show text when moderately zoomed in
        const ZOOM_HIDE = 0.95;
        const CENTER_THRESH = 100; // wider zone so text triggers more easily
        const W_h = window.innerWidth / 2, H_h = window.innerHeight / 2;

        let textCandidate = null;
        if (cam.scale >= ZOOM_SHOW && closestPt && closestPt.text) {
            const csp = w2s(closestPt.x, closestPt.y);
            if (Math.hypot(csp.x - W_h, csp.y - H_h) < CENTER_THRESH) {
                textCandidate = closestPt;
            }
        }

        const prev = window._autoTextPt || null;
        if (textCandidate !== prev) {
            window._autoTextPt = textCandidate;
            const modal = document.getElementById('deep-text-modal');
            if (textCandidate) {
                window.showDeepText(textCandidate.text);
            } else if (modal) {
                modal.classList.add('hidden');
            }
        }

        // Force-hide when zoomed far out
        if (cam.scale < ZOOM_HIDE && window._autoTextPt) {
            window._autoTextPt = null;
            const modal = document.getElementById('deep-text-modal');
            if (modal) modal.classList.add('hidden');
        }
    })();

    // ── UPDATE DATA LABELS (floating annotations on the image) ── throttled
    if (!window._labelFrameTick) window._labelFrameTick = 0;
    window._labelFrameTick++;
    if (window._labelFrameTick % 3 === 0) {
        if (window.updateDataLabels && window.skyRevealState !== 'recognition') {
            window.updateDataLabels();
        }
        if (window.updateConstellations) {
            window.updateConstellations();
        }
    }


    // ── FEATURE: Update guided journey text ──
    (function updateGuideText() {
        if (!window.discoveryGuideReady) return;
        // Hide guide during recognition mode
        if (window.skyRevealState === 'recognition') return;
        const guide = document.getElementById('discovery-guide');
        if (!guide) return;

        const lang = (typeof currentLang !== 'undefined') ? currentLang : 'he';
        const phase = window.discoveryPhase || 0;

        if (phase === 0) {
            guide.textContent = (lang === 'he') ? 'גררי כדי לנוע בשמיים' : 'Drag to move through the sky';
            guide.style.opacity = '0.5';
            // Accumulate time when moving fast
            if (camVelocity > 10) {
                window.discoveryMoveAccum += dt;
            }
            if (window.discoveryMoveAccum >= 2) {
                window.discoveryPhase = 1;
            }
        } else if (phase === 1) {
            guide.textContent = (lang === 'he') ? 'התקרבי. יש כאן עוד.' : 'Zoom in. There is more here.';
            guide.style.opacity = '0.5';
            if (cam.scale > 0.4) {
                window.discoveryPhase = 2;
                window.discoveryPhase2Time = 0;
            }
        } else if (phase === 2) {
            guide.textContent = (lang === 'he') ? 'מה את/ה רואה?' : 'What do you see?';
            window.discoveryPhase2Time += dt;
            // Fade out over 5 seconds
            const fadeT = clamp(1 - (window.discoveryPhase2Time - 3) / 2, 0, 0.5);
            guide.style.opacity = String(fadeT);
            if (window.discoveryPhase2Time >= 5) {
                guide.style.opacity = '0';
                window.discoveryPhase = 3; // Done
            }
        } else {
            guide.style.opacity = '0';
        }
    })();
}

function updatePoint(pt, dt, isClosest) {
    const rs = vp.revealSpeed || 1.0;
    const dwellThresh = vp.dwellThreshold || 1.0;
    const baseTrace = vp.baseTraceLevel || 0.1;
    const now = performance.now();

    // ── STAGGERED APPEAR: fade in after revealDelay (only during revelation, not recognition) ──
    if (pt.revealDelay !== undefined && pt.appearP < 1.0 && window.skyRevealState === 'revealed') {
        if (skyIntroTime >= pt.revealDelay) {
            pt.appearP = clamp(pt.appearP + dt * 0.8, 0, 1); // ~1.25s per star — quick but visible
            // Play a subtle chime when first-wave stars appear (only in revealed mode)
            if (pt.isFirstWave && pt.appearP > 0.01 && !pt._chimePlayedOnAppear) {
                pt._chimePlayedOnAppear = true;
                if (AudioEngine && AudioEngine.ctx) {
                    AudioEngine.playDiscoveryChime(pt.hue || 200);
                }
            }
        }
        
        // Also play a sound when a micro star is first revealed by zooming in
        if (pt.isMicro && pt.appearP > 0.01 && !pt._zoomRevealed) {
            pt._zoomRevealed = true;
            if (AudioEngine && AudioEngine.ctx && Math.random() > 0.5) { // Only half of them play sound to avoid cacophony
                // High-pitched quiet chime for micro stars
                AudioEngine.playDiscoveryChime((pt.hue || 200) + 50);
            }
        }
        // PERFORMANCE: skip all heavy computation for invisible points
        if (pt.appearP < 0.01) return;
    } else if (pt.appearP === undefined) {
        pt.appearP = 1.0; // safety fallback
    }

    // Infinite void logic: wrap minor loose points around the camera
    if (!pt.isMajor && !pt.isPermanentlyAssembled && !window.isAssemblingNow) {
        const wrapSize = 16000;
        let dx = pt.originalX - cam.x;
        let dy = pt.originalY - cam.y;
        let didWrap = false;
        
        if (dx > wrapSize/2) { pt.originalX -= wrapSize; didWrap = true; }
        if (dx < -wrapSize/2) { pt.originalX += wrapSize; didWrap = true; }
        if (dy > wrapSize/2) { pt.originalY -= wrapSize; didWrap = true; }
        if (dy < -wrapSize/2) { pt.originalY += wrapSize; didWrap = true; }
        
        if (didWrap) {
            pt.revealProgress = 0;
            pt.hasBeenRevealed = false;
            pt.timeNearby = 0;
            pt.glowP = 0;
            pt.bloomP = 0;
            pt.assemblyProgress = 0;
            pt.totalDwellTime = 0;
            pt.visitCount = 0;
            pt.lastVisitedTime = 0;
            pt.maxRevealProgress = 0;
        }
    }

    // ── ASSEMBLY: follows per-star staggered reveal ──
    if (!pt.isPermanentlyAssembled) {
        if (window.skyRevealState === 'revealed') {
            // Each star assembles according to its own appearP (staggered timing)
            // Not all at once — follows the one-by-one reveal rhythm
            var starAppear = pt.appearP || 0;
            pt.assemblyProgress = Math.max(pt.assemblyProgress || 0, starAppear);
            pt.permanentlyRevealed = true;
            pt.isPermanentlyAssembled = (pt.assemblyProgress >= 1.0);
        } else if (window.isAssemblingNow) {
            const distToCam = Math.hypot(pt.originalX - window.lockedAssemblyX, pt.originalY - window.lockedAssemblyY);
            if (distToCam < 2500) {
                if (pt.assemblyProgress === 0 && !pt._assemblyDelay) {
                    pt.targetX = pt.originalX + (Math.random() - 0.5) * 8;
                    pt.targetY = pt.originalY + (Math.random() - 0.5) * 8;
                    const maxDelay = 3;
                    const normalizedDist = clamp(distToCam / 800, 0, 1);
                    pt._assemblyDelay = normalizedDist * maxDelay + Math.random() * 1;
                    pt._assemblyWaited = 0;
                }
                if (pt._assemblyDelay && pt._assemblyWaited < pt._assemblyDelay) {
                    pt._assemblyWaited += dt;
                } else {
                    const speed = 0.15 * (1.2 - pt.assemblyProgress);
                    pt.assemblyProgress = clamp(pt.assemblyProgress + dt * speed, 0, 1);
                }
                if (pt.assemblyProgress >= 1.0) {
                    pt.isPermanentlyAssembled = true;
                }
            } else {
                pt.assemblyProgress = lerp(pt.assemblyProgress, 0, dt * 0.1);
                if (pt.assemblyProgress < 0.01) pt.assemblyProgress = 0;
            }
        } else {
            pt.assemblyProgress = lerp(pt.assemblyProgress, 0, dt * 0.1);
            if (pt.assemblyProgress < 0.01) pt.assemblyProgress = 0;
        }
    }

    // Physical Movement: stars drift from scattered positions -> Rorschach formation
    const ease = pt.assemblyProgress * pt.assemblyProgress * (3 - 2 * pt.assemblyProgress);
    
    // Alive / Pulsing effect: blend between original position and target position
    const breathe = Math.sin(pt.pulseClock * 0.5) * 0.5 + 0.5; 
    const curDestX = lerp(pt.originalX, pt.targetX, breathe);
    const curDestY = lerp(pt.originalY, pt.targetY, breathe);

    let finalX = lerp(pt.starX, curDestX, ease);
    let finalY = lerp(pt.starY, curDestY, ease);

    // Wait, let's make sure pt has starZ. If not, use originalZ.
    let finalZ = lerp(pt.starZ || pt.originalZ || 0, pt.targetZ || pt.originalZ || 0, ease);

    // ── ORGANIC 3D ROTATION ──
    const cosY = Math.cos(globalRotY);
    const sinY = Math.sin(globalRotY);
    const cosX = Math.cos(globalRotX);
    const sinX = Math.sin(globalRotX);

    // Rotate around Y axis
    let rx = finalX * cosY - finalZ * sinY;
    let rz = finalX * sinY + finalZ * cosY;

    // Rotate around X axis
    let ry = finalY * cosX - rz * sinX;
    rz = finalY * sinX + rz * cosX;
    
    pt.x = rx;
    pt.y = ry;
    pt.renderZ = rz; // For depth sorting or scale 

    // Calculate screen position after physics
    const sp = w2s(pt.x, pt.y);
    const screenDist = Math.hypot(sp.x - globalMouse.x, sp.y - globalMouse.y);

    // Rotate/pulse
    pt.pulseClock += dt * (vp.motionSpeed || 1.0) * 1.5;
    const closeThresh = 150;

    // FOG OF WAR
    if (screenDist < 200) {
        pt.fogRevealed = Math.max(pt.fogRevealed, (1 - screenDist / 200) * 0.7);
    }

    // LANTERN MECHANIC
    const LANTERN_RADIUS = 80;
    const lanternProx = clamp(1.0 - (screenDist / LANTERN_RADIUS), 0, 1);
    const lanternSoft = lanternProx * lanternProx * (3 - 2 * lanternProx);

    if (lanternSoft > 0.01 && window.skyRevealState !== 'recognition') {
        pt.lanternNurture = (pt.lanternNurture || 0) + dt * lanternSoft * 0.45;
        if (pt.lanternNurture > 1.0 && !pt.permanentlyRevealed) {
            pt.permanentlyRevealed = true;
            pt.isPermanentlyAssembled = true;
            if (AudioEngine && AudioEngine.ctx && !pt.isSeed) {
                AudioEngine.playDiscoveryChime(pt.hue || 200);
            }
        }
    } else {
        pt.lanternNurture = Math.max(0, (pt.lanternNurture || 0) - dt * 0.2);
    }

    // Auto-reveal when bloom is strong enough
    if (window.bloomProgress > 0.6 && !pt.permanentlyRevealed) {
        pt.permanentlyRevealed = true;
        pt.isPermanentlyAssembled = true;
    }

    // 1. Attention Phase
    if (screenDist < closeThresh && cam.scale > 0.25) {
        const proximity = 1 - screenDist / closeThresh;
        const addedDwell = dt * proximity * 2.0;
        pt.timeNearby += addedDwell;
        pt.totalDwellTime += addedDwell;
        pt.glowP = lerp(pt.glowP, proximity, dt * 2.0);
        if (now - pt.lastVisitedTime > 5000) pt.visitCount++;
        pt.lastVisitedTime = now;
    } else {
        pt.timeNearby = Math.max(0, pt.timeNearby - dt * 0.5);
        pt.glowP = lerp(pt.glowP, 0, dt * 1.5);
    }

    // 2. Reveal Phase
    if (pt.timeNearby > dwellThresh) {
        let maxRev = (screenDist < 180) ? 1.0 : 0.4;
        pt.revealProgress = clamp(pt.revealProgress + dt * rs * 0.8, 0, maxRev);
        if (pt.revealProgress > 0.3 && !pt.hasBeenRevealed) {
            pt.hasBeenRevealed = true;
            pt.fogRevealed = Math.max(pt.fogRevealed, 0.5);
            if (pt.isMajor) {
                AudioEngine.playDiscoveryChime(pt.hue || 200);
                if (!window.activeRipples) window.activeRipples = [];
                window.activeRipples.push({ x: pt.x, y: pt.y, radius: 0, maxRadius: 500, speed: 80, strength: 1.0 });
            }
        }
    } else {
        const targetReveal = pt.hasBeenRevealed ? baseTrace : 0.0;
        pt.revealProgress = lerp(pt.revealProgress, targetReveal, dt * 0.5);
    }

    if (pt.revealProgress > pt.maxRevealProgress) pt.maxRevealProgress = pt.revealProgress;

    // Bloom
    if (pt.isMajor && isClosest && screenDist < 250 && pt.revealProgress > 0.8) {
        pt.bloomP = clamp(pt.bloomP + dt * 0.5, 0, 1);
    } else {
        pt.bloomP = clamp(pt.bloomP - dt * 0.5, 0, 1);
    }

    // Hover Pulse
    const hoverRadius = 100;
    if (screenDist < hoverRadius) {
        pt.hoverPulse = lerp(pt.hoverPulse, 1.0 - screenDist / hoverRadius, dt * 4.0);
    } else {
        pt.hoverPulse = lerp(pt.hoverPulse, 0, dt * 2.0);
    }

    // Subtle Bloom on zoom
    const bloomZoomThresh = 0.35;
    const isZoomedIn = cam.scale > bloomZoomThresh;
    const zoomBloom = isZoomedIn ? clamp((cam.scale - bloomZoomThresh) / 0.5, 0, 1) : 0;
    if (isZoomedIn && screenDist < 350) {
        const bloomProximity = 1 - screenDist / 350;
        pt.hoverPulse = Math.max(pt.hoverPulse, bloomProximity * zoomBloom * 0.08);
    }

    // ── GLOBAL BREATHING (only in revealed state) ──
    // Multi-layered breathing: slow deep breath + faster heartbeat + subtle flutter
    let globalBreath = 1.0;
    if (window.skyRevealState === 'revealed') {
        const deepBreath = Math.sin(now * 0.001) * 0.10;       // Slow deep breath (6.3s cycle)
        const heartbeat  = Math.sin(now * 0.004) * 0.04;       // Fast heartbeat
        const flutter    = Math.sin(now * 0.0073) * 0.02;      // Subtle organic flutter
        globalBreath = 1.0 + deepBreath + heartbeat + flutter;
        
        // During initial bloom explosion, breathing is more intense
        if (window.bloomProgress < 1.0) {
            const bloomPulse = Math.sin(now * 0.008) * 0.15 * (1.0 - window.bloomProgress);
            globalBreath += bloomPulse;
        }
    }
    
    // Shockwave displacement (pushes points outward briefly during bloom)
    let shockDisplaceX = 0, shockDisplaceY = 0;
    if (window.bloomShockwave && window.bloomShockwave.strength > 0.01) {
        const sw = window.bloomShockwave;
        const distFromCenter = Math.hypot(pt.originalX, pt.originalY);
        const waveDist = Math.abs(distFromCenter - sw.radius);
        if (waveDist < 200) {
            const waveForce = (1.0 - waveDist / 200) * sw.strength * 50;
            const ang = Math.atan2(pt.originalY, pt.originalX);
            shockDisplaceX = Math.cos(ang) * waveForce;
            shockDisplaceY = Math.sin(ang) * waveForce;
        }
    }

    // Update WebGL Mesh (SHADER UNIFORMS)
    if (pt.mesh) {
        const revealState = window.skyRevealState || 'revealed';
        const rp = window.revelationProgress || (revealState === 'recognition' ? 0 : 1);
        const rpEase = rp * rp * (3 - 2 * rp);
        const pulseDampen = clamp((cam.scale - 0.30) / 1.0, 0.05, 1.0);
        const pulse = Math.sin(pt.pulseClock) * 0.12 * pulseDampen + (1.0 - 0.12 * pulseDampen);
        const hoverScale = 1.0 + pt.hoverPulse * 0.12 * pulseDampen;
        const skeletonScale = 0.10;
        const fullScale = pt.scale;

        let sizeFactor;
        if (pt.permanentlyRevealed) {
            sizeFactor = 1.0;
        } else if (pt.isSeed) {
            sizeFactor = 0.65;
        } else {
            sizeFactor = lerp(0.2, 1.0, lanternSoft);
        }
        const pointScale = lerp(skeletonScale, fullScale, sizeFactor);
        const s = pointScale * cam.scale * pulse * hoverScale * globalBreath;

        // POSITION
        const WW = window.innerWidth;
        const HH = window.innerHeight;
        // Depth opens gradually: starts flat (z=0), deepens over 10s for a "rising from flat" feel
        const depthOpenFactor = (window.skyRevealState === 'revealed') ? Math.min(skyIntroTime / 10.0, 1.0) : 0.0;
        const parallaxStrength = 0.15 * rpEase * depthOpenFactor;
        const depthOffset = (pt.depthLayer - 1.0) * parallaxStrength;
        const parallaxX = (sp.x - WW / 2) * depthOffset;
        const parallaxY = (sp.y - HH / 2) * depthOffset;

        pt.mesh.position.x = sp.x - WW / 2 + parallaxX + shockDisplaceX;
        pt.mesh.position.y = -(sp.y - HH / 2 + parallaxY) + shockDisplaceY;
        const finalScale = s * (pt.appearP !== undefined ? pt.appearP : 1.0);
        pt.mesh.scale.set(finalScale, finalScale, 1);
        pt.mesh.rotation.z = -(pt.baseAngle + skyIntroTime * 0.015 * (vp.motionSpeed || 1.0) * rpEase);

        // illum
        let illum;
        if (pt.isSeed) {
            illum = Math.max(lanternSoft, 0.15);
        } else if (pt.permanentlyRevealed) {
            illum = Math.max(lanternSoft, 0.85);
        } else {
            illum = lanternSoft;
        }

        // ── OPACITY ──
        let opacity;
        if (pt.isSeed) {
            opacity = lerp(0.35, 0.90, lanternSoft);
            if (pt.isMajor) opacity = Math.max(opacity, 0.45);
        } else if (pt.permanentlyRevealed) {
            const baseOp = pt.isMajor ? 0.75 : 0.60;
            const litOp  = pt.isMajor ? 1.00 : 0.85;
            opacity = lerp(baseOp, litOp, lanternSoft);
            opacity += pt.hoverPulse * 0.05 * pulseDampen;
            // Breathing glow in revealed state
            if (window.skyRevealState === 'revealed') {
                opacity += (globalBreath - 1.0) * 1.2;
            }
        } else {
            opacity = Math.max(0.08, lanternSoft * (pt.isMajor ? 0.9 : 0.65));
        }

        // Color: show vivid lobe color much sooner (from 30% illum)
        const personalH = (vp.personalHue || 220) / 360;
        const trueHue   = pt.hue / 360;
        const trueSat   = pt.theme === 'Unresolved' ? 0.4 : 1.0;
        const trueLight = 0.62;
        // Use a lower threshold so color appears fast even with low illumination
        const colorThreshold = Math.max(0, (illum - 0.1) / 0.4);
        const hue   = lerp(personalH, trueHue, Math.min(colorThreshold * 1.5, 1.0));
        let sat   = lerp(0.05, trueSat, Math.min(colorThreshold * 1.8, 1.0));
        let light = lerp(0.38, trueLight, Math.min(colorThreshold * 1.2, 1.0));
        
        // As requested: Stars look white from afar, color is revealed on zoom!
        const zoomColorFactor = clamp((cam.scale - 0.15) / 0.3, 0, 1);
        if (window.skyRevealState === 'revealed') {
            sat = sat * zoomColorFactor;
            light = lerp(0.95, light, zoomColorFactor); // White when zoomed out
        }
        
        pt.mesh.material.uniforms.uColor.value.setHSL(hue, sat, light);

        // Glow — ENHANCED: pulsing organic luminescence
        let glowValue;
        if (pt.permanentlyRevealed) {
            const baseGlow = pt.isMajor ? 0.55 : 0.28; // White crystal spikes — subtle prismatic whisper at zoom-in
            glowValue = baseGlow + (pt.glowP + pt.hoverPulse * 0.5) * lanternSoft;
            
            if (window.skyRevealState === 'revealed') {
                // Breathing glow
                glowValue += (globalBreath - 1.0) * 0.4; // Subtle breath on top of higher base
                
                // During bloom: gentle glow surge
                if (window.bloomProgress < 1.0) {
                    glowValue += Math.pow((1.0 - window.bloomProgress), 2.0) * 3.0;
                }
                
                // Individual sparkle: each point has its own tiny twinkle
                const sparkle = Math.sin(now * 0.003 + pt.baseAngle * 10) * 0.08;
                glowValue += sparkle;
            }
        } else if (pt.isSeed) {
            glowValue = 0.05 + pt.hoverPulse * 0.1 * lanternSoft;
        } else {
            glowValue = (pt.glowP + pt.hoverPulse * 0.4) * lanternSoft;
        }

        // ── VISUAL HIERARCHY: Q-shape stars dominate, distractors fade back ──
        if (pt.isVertexStar) {
            opacity = Math.max(opacity, 0.82); // Key corners — clearly bright
        } else if (pt.isQPathStar) {
            opacity = Math.max(opacity, 0.58); // Path outline — clearly visible
        } else if (!pt.isMajor && !pt.isVertexStar && !pt.isQPathStar) {
            opacity *= 0.15; // Background ambient dust — barely visible
        }

        pt.mesh.material.uniforms.uOpacity.value = opacity;
        pt.mesh.material.uniforms.uTime.value += dt;
        pt.mesh.material.uniforms.uGlow.value = glowValue;

        // Crystal State — ENHANCED: vivid and alive
        let state;
        if (pt.permanentlyRevealed) {
            let revealedBase = pt.isMajor ? 1.1 : 0.85;
            // In revealed state, crystals are always vivid with breathing modulation
            if (window.skyRevealState === 'revealed') {
                revealedBase += (globalBreath - 1.0) * 0.5;
                // During bloom: moderate crystal vividity
                if (window.bloomProgress < 1.0) {
                    revealedBase += Math.pow((1.0 - window.bloomProgress), 2.0) * 0.6;
                }
            }
            state = Math.min(lerp(revealedBase, 2.0, lanternSoft), 2.0);
        } else if (pt.isSeed) {
            state = lerp(0.18, 1.5, lanternSoft);
        } else {
            state = lerp(0.05, 2.0, lanternSoft * lanternSoft);
        }
        pt.mesh.material.uniforms.uState.value = state;
        pt.mesh.material.uniforms.uZoom.value = cam.scale;

        // Visibility — hide in recognition mode (only SVG skeleton shows there)
        const inRecognition = (window.skyRevealState === 'recognition');
        const isOnScreen = sp.x > -400 && sp.x < WW + 400 && sp.y > -400 && sp.y < HH + 400;
        if (inRecognition || !isOnScreen) {
            pt.mesh.visible = false;
        } else if (pt.appearP !== undefined && pt.appearP < 0.01) {
            pt.mesh.visible = false;
        } else if (!pt.permanentlyRevealed && !pt.isSeed && lanternSoft < 0.01) {
            pt.mesh.visible = false;
        } else {
            pt.mesh.visible = true;
        }
    }
}

// ======================================================
// CAMERA EVENTS
function initCameraEvents() {
    const el = document.getElementById('screen-sky');
    const cursor = document.getElementById('global-cursor') || document.getElementById('sky-cursor');

    el.addEventListener('mousedown', e => {
        if (window.skyRevealState === 'recognition') return;
        isDragging = true; 
        lastMouse = { x: e.clientX, y: e.clientY };
        window.dragDist = 0;
    });
    window.addEventListener('mouseup', e => { 
        isDragging = false; 
        if (window.dragDist < 5) {
            // It was a click!
            const sxyX = e.clientX;
            const sxyY = e.clientY;
            
            // Correct world coordinates accounting for camera pan/scale AND universe rotation
            const worldClickUnrotated = s2w_unrotated(sxyX, sxyY);
            
            let clickedPt = null;
            let minDist = Infinity;
            
            // Points are stored in their pre-rotated `starX`, `starY` coordinates OR `targetX`. 
            // Wait, for ghosts, their offsets are purely unrotated (ghost.offset.x, y).
            // But majorPoints might be different. Since we disabled point clicking anyway:
            
            // Check if we clicked on a ghost constellation
            // Guard: if the click was INSIDE the ghost popup (e.g. the close button),
            // skip ghost-click detection so the popup's own onclick can fire cleanly.
            const ghostPopupEl = document.getElementById('ghost-popup');
            const clickInsideGhostPopup = ghostPopupEl && e.target && e.target.closest && e.target.closest('#ghost-popup');

            // Ghost info is now zoom-controlled (shown automatically in updateConstellations)
            // No click-to-open — experience is seamless zoom in/out
            
            // Click on points disabled — no text popups for points
        }
    });
    window.addEventListener('mousemove', e => {
        globalMouse.x = e.clientX;
        globalMouse.y = e.clientY;
        if (cursor) { cursor.style.left = e.clientX + 'px'; cursor.style.top = e.clientY + 'px'; }
        if (!isDragging) return;
        window.dragDist = (window.dragDist || 0) + Math.hypot(e.movementX, e.movementY);
        
        // Panning the camera OR rotating the object
        if (window.skyRevealState === 'revealed' && cam.scale > 0.8) {
            targetGlobalRotY += e.movementX * 0.01;
            targetGlobalRotX += e.movementY * 0.01;
        } else {
            targetCam.x -= e.movementX / cam.scale;
            targetCam.y -= e.movementY / cam.scale;
        }
        
        lastMouse = { x: e.clientX, y: e.clientY };
    });

    // Touch support
    el.addEventListener('touchstart', e => {
        const t = e.touches[0];
        globalMouse.x = t.clientX;
        globalMouse.y = t.clientY;
        isDragging = true;
        lastMouse = { x: t.clientX, y: t.clientY };
    });
    el.addEventListener('touchmove', e => {
        e.preventDefault();
        const t = e.touches[0];
        globalMouse.x = t.clientX;
        globalMouse.y = t.clientY;
        
        if (window.skyRevealState === 'revealed' && cam.scale > 0.8) {
            targetGlobalRotY += (t.clientX - lastMouse.x) * 0.01;
            targetGlobalRotX += (t.clientY - lastMouse.y) * 0.01;
        } else {
            targetCam.x -= (t.clientX - lastMouse.x) / cam.scale;
            targetCam.y -= (t.clientY - lastMouse.y) / cam.scale;
        }
        lastMouse = { x: t.clientX, y: t.clientY };
    }, { passive: false });

// ======================================================
// PAREIDOLIA — inline sky overlay
// ======================================================
window.selectedPareidolia = null;

// Auto-triggered once constellation has assembled: shows question overlaid on the sky
function showSkyPareidoliaOverlay() {
    const overlay = document.getElementById('sky-pareidolia-overlay');
    if (!overlay || window.pareidoliaUIActive) return;
    window.pareidoliaUIActive = true;

    const isHe = currentLang === 'he';

    // Fade out the bottom nav
    const skyUi = document.querySelector('.sky-ui');
    if (skyUi) { skyUi.style.transition = 'opacity 1s'; skyUi.style.opacity = '0'; skyUi.style.pointerEvents = 'none'; }

    document.getElementById('sky-pareidolia-title').innerText = isHe
        ? 'מה את/ה רואה בדימוי שלפנייך?' : 'What do you see in the image before you?';

    document.getElementById('sky-pareidolia-helper').innerText = isHe
        ? 'אין לדימוי הזה שם אחד נכון. המשמעות שלו מתחילה במה שמזהים בו.'
        : 'This image has no single correct name. Its meaning begins with what you recognize in it.';

    const input = document.getElementById('sky-pareidolia-input');
    input.value = '';
    input.placeholder = '';
    input.dir = isHe ? 'rtl' : 'ltr';

    const nextBtn = document.getElementById('btn-sky-pareidolia-next');
    nextBtn.innerText = isHe ? 'המשך ←' : 'Continue →';
    nextBtn.onclick = () => {
        const val = input.value.trim();
        if (val.length > 0) {
            window.selectedPareidolia = val;
            showHorizon();
        }
    };
    input.onkeydown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); nextBtn.click(); }
    };

    // Show overlay then fade inner content in
    overlay.style.display = 'flex';
    requestAnimationFrame(() => requestAnimationFrame(() => {
        const inner = document.getElementById('sky-pareidolia-inner');
        if (inner) { inner.style.opacity = '1'; inner.style.transform = 'translateY(0)'; }
        setTimeout(() => input.focus(), 900);
    }));
}

// Manual fallback — "leave" button triggers assembly + overlay immediately
function showPareidoliaPrompt() {
    if (!window.autoAssemblyTriggered) {
        window.autoAssemblyTriggered = true;
        targetCam.x = 0; targetCam.y = 0; targetCam.scale = 0.12;
        window.lockedAssemblyX = 0; window.lockedAssemblyY = 0;
        // window.assemblyShapeType = 3; // Replaced by dynamic shape generation
        window.isAssemblingNow = true;
        window.timeCameraStill = 99;
    }
    // Pareidolia now handled by recognition mode in initSky
    
}


    el.addEventListener('wheel', e => {
        e.preventDefault();
        if (window.skyRevealState === 'recognition') return;
        const zf = e.deltaY < 0 ? 1.006 : 0.994; // Slower, meditative zoom
        const newScale = clamp(targetCam.scale * zf, 0.25, 10.0);
        const mwx = (e.clientX - W * 0.5) / cam.scale + cam.x;
        const mwy = (e.clientY - H * 0.5) / cam.scale + cam.y;
        targetCam.x = mwx - (e.clientX - W * 0.5) / newScale;
        targetCam.y = mwy - (e.clientY - H * 0.5) / newScale;
        targetCam.scale = newScale;
    }, { passive: false });

    const btnZoomIn = document.getElementById('btn-zoom-in');
    const btnZoomOut = document.getElementById('btn-zoom-out');
    if (btnZoomIn && btnZoomOut) {
        btnZoomIn.addEventListener('click', () => {
            targetCam.scale = clamp(targetCam.scale * 1.5, 0.25, 10.0);
        });
        btnZoomOut.addEventListener('click', () => {
            targetCam.scale = clamp(targetCam.scale * 0.66, 0.25, 10.0);
        });
    }

    window.addEventListener('resize', () => {
        W = window.innerWidth;
        H = window.innerHeight;
        if (renderer) {
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.setSize(W, H);
                    threeCam.left = -window.innerWidth / 2;
            threeCam.right = window.innerWidth / 2;
            threeCam.top = window.innerHeight / 2;
            threeCam.bottom = -window.innerHeight / 2;
            threeCam.updateProjectionMatrix();
        }
    });
}

// ======================================================
// HORIZON SCREEN
// ======================================================
// ======================================================
// POETIC SYNTHESIS ENGINE
// ======================================================

// Maps Hebrew/English quality keywords to associations
// These are used to enrich the reflection based on what the user observed
const QUALITY_MAP = {
    he: {
        // תנועה — movement
        'רץ': 'תנועה', 'עף': 'תנועה', 'טס': 'תנועה', 'הולך': 'תנועה', 'נע': 'תנועה',
        'מסלול': 'תנועה', 'דרך': 'תנועה', 'סוס': 'תנועה', 'רוח': 'תנועה', 'גל': 'תנועה',
        'זורם': 'תנועה', 'נהר': 'תנועה', 'מטפס': 'תנועה', 'קפץ': 'תנועה', 'רוקד': 'תנועה',
        'סחרחורת': 'תנועה', 'מסתובב': 'תנועה', 'גלגל': 'תנועה', 'חץ': 'תנועה', 'מעבר': 'תנועה',
        // שורשים — roots / grounded
        'עץ': 'שורשים', 'צמח': 'שורשים', 'שורש': 'שורשים', 'ענף': 'שורשים', 'גדל': 'שורשים',
        'פרח': 'שורשים', 'עלה': 'שורשים', 'אדמה': 'שורשים', 'יער': 'שורשים', 'טבע': 'שורשים',
        'גינה': 'שורשים', 'זרע': 'שורשים', 'צומח': 'שורשים', 'גבעול': 'שורשים',
        // מקלט — shelter / home
        'בית': 'מקלט', 'דלת': 'מקלט', 'חדר': 'מקלט', 'קיר': 'מקלט', 'גג': 'מקלט',
        'חלון': 'מקלט', 'מערה': 'מקלט', 'קן': 'מקלט', 'מחסה': 'מקלט', 'אוהל': 'מקלט',
        'מגדל': 'מקלט', 'טירה': 'מקלט', 'מנורה': 'מקלט', 'כרית': 'מקלט', 'שמיכה': 'מקלט',
        // חיים — alive / creature
        'חיה': 'חיים', 'ציפור': 'חיים', 'שועל': 'חיים', 'זאב': 'חיים', 'דג': 'חיים',
        'נחש': 'חיים', 'ברווז': 'חיים', 'פרפר': 'חיים', 'חתול': 'חיים', 'כלב': 'חיים',
        'דוב': 'חיים', 'אריה': 'חיים', 'נשר': 'חיים', 'ינשוף': 'חיים', 'צב': 'חיים',
        'דולפין': 'חיים', 'לוויתן': 'חיים', 'עכביש': 'חיים', 'חילזון': 'חיים', 'לב': 'חיים',
        'נושם': 'חיים', 'חי': 'חיים', 'תינוק': 'חיים', 'ביצה': 'חיים',
        // נוכחות — presence / figures
        'דמות': 'נוכחות', 'אדם': 'נוכחות', 'ילד': 'נוכחות', 'אישה': 'נוכחות', 'גוף': 'נוכחות',
        'פנים': 'נוכחות', 'צל': 'נוכחות', 'רוח': 'נוכחות', 'מלאך': 'נוכחות', 'דיוקן': 'נוכחות',
        'איש': 'נוכחות', 'ילדה': 'נוכחות', 'אמא': 'נוכחות', 'אבא': 'נוכחות', 'זוג': 'נוכחות',
        'ידיים': 'נוכחות', 'אצבעות': 'נוכחות', 'ראש': 'נוכחות',
        // פתיחות — openness / wings
        'כנף': 'פתיחות', 'פרוש': 'פתיחות', 'רחב': 'פתיחות', 'ים': 'פתיחות', 'שמיים': 'פתיחות',
        'אופק': 'פתיחות', 'מרחב': 'פתיחות', 'חלל': 'פתיחות', 'ענן': 'פתיחות', 'שקיעה': 'פתיחות',
        'זריחה': 'פתיחות', 'מדבר': 'פתיחות', 'פתוח': 'פתיחות', 'חופשי': 'פתיחות', 'אינסוף': 'פתיחות',
        // שבירה — fracture / breaking
        'שבור': 'שבירה', 'מתפרק': 'שבירה', 'סדוק': 'שבירה', 'פגוע': 'שבירה', 'חצי': 'שבירה',
        'שבר': 'שבירה', 'רסיס': 'שבירה', 'פיצוץ': 'שבירה', 'נפילה': 'שבירה', 'קרע': 'שבירה',
        'חור': 'שבירה', 'ריק': 'שבירה', 'חסר': 'שבירה', 'נעלם': 'שבירה', 'הרס': 'שבירה',
        // מבט — gaze / looking
        'מסתכל': 'מבט', 'מביט': 'מבט', 'אחורה': 'מבט', 'קדימה': 'מבט', 'עיניים': 'מבט',
        'עין': 'מבט', 'מראה': 'מבט', 'משקפיים': 'מבט', 'צופה': 'מבט', 'חוקר': 'מבט',
        'שומר': 'מבט', 'מחכה': 'מבט',
        // חיבור — connection (NEW)
        'גשר': 'חיבור', 'חוט': 'חיבור', 'שרשרת': 'חיבור', 'קשר': 'חיבור', 'חיבוק': 'חיבור',
        'מחובר': 'חיבור', 'יחד': 'חיבור', 'מפגש': 'חיבור', 'צומת': 'חיבור', 'קשת': 'חיבור',
        'שלובים': 'חיבור', 'מחזיק': 'חיבור', 'נוגע': 'חיבור',
        // פחד — fear (NEW)
        'מפחד': 'פחד', 'חושך': 'פחד', 'צללים': 'פחד', 'בריחה': 'פחד', 'מסתתר': 'פחד',
        'לכוד': 'פחד', 'כלוב': 'פחד', 'מלכודת': 'פחד', 'מפלצת': 'פחד', 'תהום': 'פחד',
        'עמוק': 'פחד', 'טובע': 'פחד', 'נופל': 'פחד',
        // שליטה — control (NEW)
        'כתר': 'שליטה', 'מגן': 'שליטה', 'חרב': 'שליטה', 'שריון': 'שליטה', 'מבצר': 'שליטה',
        'חומה': 'שליטה', 'שער': 'שליטה', 'מפתח': 'שליטה', 'סגור': 'שליטה', 'נעול': 'שליטה',
        // אור — light (NEW)
        'אור': 'אור', 'כוכב': 'אור', 'ניצוץ': 'אור', 'שמש': 'אור', 'ירח': 'אור',
        'להבה': 'אור', 'אש': 'אור', 'נר': 'אור', 'זוהר': 'אור', 'בוהק': 'אור', 'קרן': 'אור',
        // זמן — time (NEW)
        'שעון': 'זמן', 'חול': 'זמן', 'ישן': 'זמן', 'זיכרון': 'זמן', 'עתיק': 'זמן',
        'מעגל': 'זמן', 'חוזר': 'זמן', 'ספירלה': 'זמן', 'לולאה': 'זמן',
    },
    en: {
        // movement
        'running': 'movement', 'flying': 'movement', 'path': 'movement', 'road': 'movement', 'moving': 'movement',
        'horse': 'movement', 'wind': 'movement', 'wave': 'movement', 'flowing': 'movement', 'river': 'movement',
        'climbing': 'movement', 'jumping': 'movement', 'dancing': 'movement', 'spinning': 'movement', 'arrow': 'movement',
        // roots
        'tree': 'roots', 'plant': 'roots', 'root': 'roots', 'branch': 'roots', 'growing': 'roots',
        'flower': 'roots', 'leaf': 'roots', 'earth': 'roots', 'forest': 'roots', 'garden': 'roots', 'seed': 'roots',
        // shelter
        'house': 'shelter', 'home': 'shelter', 'door': 'shelter', 'room': 'shelter', 'wall': 'shelter',
        'window': 'shelter', 'cave': 'shelter', 'nest': 'shelter', 'tent': 'shelter', 'tower': 'shelter', 'castle': 'shelter',
        // life / alive
        'animal': 'life', 'bird': 'life', 'fox': 'life', 'wolf': 'life', 'fish': 'life', 'snake': 'life', 'duck': 'life',
        'butterfly': 'life', 'cat': 'life', 'dog': 'life', 'bear': 'life', 'lion': 'life', 'eagle': 'life', 'owl': 'life',
        'whale': 'life', 'dolphin': 'life', 'spider': 'life', 'heart': 'life', 'breathing': 'life', 'alive': 'life', 'baby': 'life',
        // presence
        'figure': 'presence', 'person': 'presence', 'human': 'presence', 'body': 'presence', 'child': 'presence',
        'face': 'presence', 'shadow': 'presence', 'angel': 'presence', 'portrait': 'presence', 'hands': 'presence', 'couple': 'presence',
        // openness
        'wing': 'openness', 'spread': 'openness', 'wide': 'openness', 'ocean': 'openness', 'sky': 'openness',
        'horizon': 'openness', 'space': 'openness', 'cloud': 'openness', 'sunset': 'openness', 'desert': 'openness', 'free': 'openness',
        // fracture
        'broken': 'fracture', 'crumbling': 'fracture', 'cracked': 'fracture', 'half': 'fracture', 'torn': 'fracture',
        'falling': 'fracture', 'empty': 'fracture', 'missing': 'fracture', 'hole': 'fracture', 'void': 'fracture', 'shattered': 'fracture',
        // gaze
        'looking': 'gaze', 'watching': 'gaze', 'backward': 'gaze', 'forward': 'gaze', 'eyes': 'gaze',
        'mirror': 'gaze', 'waiting': 'gaze', 'searching': 'gaze',
        // connection (NEW)
        'bridge': 'connection', 'thread': 'connection', 'chain': 'connection', 'bond': 'connection', 'hug': 'connection',
        'together': 'connection', 'meeting': 'connection', 'holding': 'connection', 'touching': 'connection',
        // fear (NEW)
        'afraid': 'fear', 'dark': 'fear', 'shadows': 'fear', 'escape': 'fear', 'hiding': 'fear',
        'trapped': 'fear', 'cage': 'fear', 'monster': 'fear', 'abyss': 'fear', 'drowning': 'fear',
        // control (NEW)
        'crown': 'control', 'shield': 'control', 'sword': 'control', 'armor': 'control', 'fortress': 'control',
        'gate': 'control', 'key': 'control', 'locked': 'control',
        // light (NEW)
        'light': 'light', 'star': 'light', 'spark': 'light', 'sun': 'light', 'moon': 'light',
        'flame': 'light', 'fire': 'light', 'candle': 'light', 'glow': 'light', 'beam': 'light',
        // time (NEW)
        'clock': 'time', 'sand': 'time', 'old': 'time', 'memory': 'time', 'ancient': 'time',
        'circle': 'time', 'spiral': 'time', 'loop': 'time',
    }
};

const QUALITY_TEXT = {
    he: {
        'תנועה':   'הדימוי שזיהית נושא בתוכו תנועה — משהו שלא מחכה לרשות אלא כבר בדרך.',
        'שורשים':  'ראית משהו שמכה שורש. צמיחה שמבקשת עומק ולא מהירות.',
        'מקלט':    'זיהית חיפוש אחר מקום. לא בית מוגמר, אלא שייכות שרק מתחילה להיבנות.',
        'חיים':    'ראית משהו חי ונושם. נוכחות שמבקשת להתעורר, לא בקו ישר.',
        'נוכחות':  'זיהית דמות או נוכחות — חלק ממך שרוצה שיראו אותו.',
        'פתיחות':  'ראית מרחב ופתיחות. תנועה רחבה שמציעה אפשרות, לא רק כיוון.',
        'שבירה':   'ראית סדק או פירוק. ייתכן שהמקום הלא שלם מפנה מרווח למשהו חדש.',
        'מבט':     'ראית מבט וערנות — בחינה זהירה של הדרך תוך כדי הליכה.',
        'חיבור':   'ראית חיבור — גשר, חוט, קשר. משהו שמחבר שני צדדים שהיו נפרדים.',
        'פחד':     'ראית משהו שנוגע בפחד — חושך, תהום, מלכודת. לפעמים מה שמפחיד מגלה מה שבאמת חשוב.',
        'שליטה':   'ראית כלי הגנה או שליטה — מגן, מפתח, חומה. אולי שאלה על מה את שומרת, ומה כדאי לשחרר.',
        'אור':     'ראית אור — ניצוץ, כוכב, להבה. לא משהו שמגיע מבחוץ, אלא סימן שכבר נמצא בפנים.',
        'זמן':     'ראית משהו שקשור לזמן — מעגל, ספירלה, זיכרון. הזמן לא מקדם ולא מאחר — הוא פשוט מגלה.',
    },
    en: {
        'movement':   'The image carries movement — something not waiting for permission, already on its way.',
        'roots':      'You saw something taking root. Growth seeking depth, not speed.',
        'shelter':    'You identified a search for place. Not a finished home, but belonging just beginning to build.',
        'life':       'You saw something alive and breathing. A presence asking to awaken, not in a straight line.',
        'presence':   'You identified a figure or presence — a part of you wanting to be seen.',
        'openness':   'You saw space and openness. A wide movement offering possibility, not just direction.',
        'fracture':   'You saw a crack or fracture. Perhaps the incomplete space is making room for something new.',
        'gaze':       'You saw alertness and gaze — carefully examining the path while walking it.',
        'connection': 'You saw a connection — a bridge, thread, bond. Something linking two sides that were separate.',
        'fear':       'You saw something touching on fear — darkness, abyss, a trap. Sometimes what frightens reveals what truly matters.',
        'control':    'You saw a tool of protection or control — a shield, key, wall. Perhaps a question about what you guard, and what to release.',
        'light':      'You saw light — a spark, star, flame. Not something arriving from outside, but a sign already within.',
        'time':       'You saw something tied to time — a circle, spiral, memory. Time doesn\'t rush or delay — it simply reveals.',
    }
};

// Choose a closing line deterministically from answers
function chooseClosingLine(isHe) {
    const closings_he = [
        'לא הכול צריך להיות ברור כדי להתחיל.',
        'גם מה שנראה עמום יכול להפוך לסימן.',
        'המפה לא ענתה במקומך — היא חיכתה שתראי.',
        'בין הנקודות נפתח דימוי, ובתוכו התחיל אופק.',
        'לא קיבלת סמל מוכן — יצרת אותו דרך המבט שלך.',
        'האופק לא מבטיח. הוא רק מזמין להמשיך ללכת לעברו.',
    ];
    const closings_en = [
        'Not everything needs to be clear in order to begin.',
        'Even what seems dim can become a sign.',
        'The map didn\'t answer for you — it waited for you to see.',
        'Between the points an image opened, and within it a horizon began.',
        'You didn\'t receive a ready-made symbol — you created it through your gaze.',
        'The horizon doesn\'t promise. It only invites you to keep walking toward it.',
    ];
    const arr = isHe ? closings_he : closings_en;
    // Use name hash for determinism
    const idx = Math.abs(hashStr(answers.name || 'sky')) % arr.length;
    return arr[idx];
}

// Detect qualities from observation text
function detectQualities(observationText, lang) {
    const map = QUALITY_MAP[lang] || QUALITY_MAP.he;
    const lower = observationText.toLowerCase();
    const found = new Set();
    for (const [keyword, quality] of Object.entries(map)) {
        if (lower.includes(keyword)) found.add(quality);
    }
    return [...found];
}

function buildPoeticReflection(observation, dream, req, change, isHe) {
    const lang = isHe ? 'he' : 'en';
    const qualities = detectQualities(observation, lang);
    const qTexts = QUALITY_TEXT[lang];
    const coreNum = calcGematria(answers.name || 'sky');
    const parts = [];
    const home = answers.home || '';
    const doubt = answers.doubt || '';
    const color = answers.color || '';
    
    // ── 1. PERSONAL OPENING: Echo the observation directly ──
    if (isHe) {
        parts.push(`ראית "${observation}" בתוך הצורה. זה לא מקרי.`);
        if (qualities.length > 0) {
            parts.push(`העין שלך זיהתה ${qualities.join(' ו')} — וזה אומר שיש בך חלק שכבר מכיר את מה שהוא מחפש.`);
        }
    } else {
        parts.push(`You saw "${observation}" in the shape. That's not accidental.`);
        if (qualities.length > 0) {
            parts.push(`Your eye identified ${qualities.join(' and ')} — meaning a part of you already recognizes what it's searching for.`);
        }
    }
    
    // ── 2. CROSS-INSIGHT: Surprising connections between answers ──
    const CROSS_INSIGHTS = {
        he: {
            // תנועה
            'תנועה×עבודה / לימודים': 'המחשבות שלך עכשיו בעבודה, ובצורה ראית תנועה. הגוף כבר יודע לאן, גם כשהראש עדיין שוקל.',
            'תנועה×אהבה / קשרים': 'המחשבות שלך באהבה, ובצורה ראית תנועה. הקשרים שלך משנים כיוון — לא סוף, אלא פנייה.',
            'תנועה×חופש': 'את חושבת על חופש, ובצורה ראית תנועה. החופש שלך לא במקום קבוע — הוא בתנועה עצמה.',
            'תנועה×שקט': 'את חושבת על שקט, ובצורה ראית תנועה. אולי השקט שלך הוא לא עצירה — אלא תנועה בקצב שלך.',
            // שורשים
            'שורשים×עבודה / לימודים': 'המחשבות שלך בעבודה, ובצורה ראית שורשים. אולי השינוי הוא לא לעקור אלא להעמיק.',
            'שורשים×אהבה / קשרים': 'המחשבות שלך באהבה, ובצורה ראית שורשים. יש צמיחה שמחכה לאדמה נכונה.',
            'שורשים×בית / שייכות': 'המחשבות שלך בבית ושייכות, ובצורה ראית שורשים. הבית שלך לא חסר — הוא מחכה שתזהי אותו.',
            // מקלט
            'מקלט×אהבה / קשרים': 'המחשבות שלך באהבה, ובצורה ראית מקלט. אולי את מחפשת לא בית חדש — אלא בית בתוך מישהו.',
            'מקלט×בית / שייכות': 'המחשבות שלך בבית, ובצורה ראית מקלט. המקום כבר מתגבש, גם אם עוד אין לו כתובת.',
            // חיים
            'חיים×חופש': 'את חושבת על חופש, ובצורה ראית משהו חי. החיים שזיהית הם כבר סוג של חופש — הם לא מחכים לרשות.',
            'חיים×יצירה': 'המחשבות שלך ביצירה, ובצורה ראית חיים. היצירה שלך כבר חיה — היא רק מחכה שתתני לה צורה.',
            // נוכחות
            'נוכחות×עבודה / לימודים': 'המחשבות שלך בעבודה, ובצורה ראית נוכחות. הנוכחות הזאת היא חלק ממך שרוצה שיראו אותו.',
            'נוכחות×ביטחון עצמי': 'את חושבת על ביטחון עצמי, ובצורה ראית נוכחות. הדמות שזיהית — זו את, מנסה להופיע.',
            // פתיחות
            'פתיחות×חופש': 'את חושבת על חופש, ובצורה ראית פתיחות. המרחב כבר נפתח — השאלה היא אם את מוכנה להיכנס.',
            'פתיחות×יצירה': 'המחשבות שלך ביצירה, ובצורה ראית מרחב פתוח. היצירה שלך מבקשת אוויר, לא מסגרת.',
            // שבירה
            'שבירה×אהבה / קשרים': 'המחשבות שלך באהבה, ובצורה ראית שבירה. הסדק לא הסוף — הוא המקום שדרכו נכנס אור חדש.',
            'שבירה×ביטחון עצמי': 'את חושבת על ביטחון עצמי, ובצורה ראית שבירה. השבירה היא לא חולשה — היא הפתח שדרכו נכנס אור.',
            'שבירה×שקט': 'את חושבת על שקט, ובצורה ראית שבירה. אולי השקט מגיע רק אחרי שמפסיקים לחזיק הכול ביחד.',
            // מבט
            'מבט×עבודה / לימודים': 'המחשבות שלך בעבודה, ובצורה ראית מבט. המבט הזה לא לאחור — הוא בודק את הדרך שלפנייך.',
            // חיבור (NEW)
            'חיבור×אהבה / קשרים': 'המחשבות שלך באהבה, ובצורה ראית חיבור. החיבור שזיהית קיים, הוא רק צריך שתאמיני בו.',
            'חיבור×בית / שייכות': 'את חושבת על שייכות, ובצורה ראית חיבור. הגשר שזיהית — הוא בין המקום שאת בו למקום שאת הולכת אליו.',
            'חיבור×עבודה / לימודים': 'המחשבות שלך בעבודה, ובצורה ראית חיבור. אולי חסר לך לא עבודה חדשה, אלא חיבור לעבודה שכבר יש.',
            // פחד (NEW)
            'פחד×אהבה / קשרים': 'המחשבות שלך באהבה, ובצורה ראית פחד. מה שמפחיד באהבה הוא לא הכישלון — אלא ההצלחה.',
            'פחד×חופש': 'את חושבת על חופש, ובצורה ראית פחד. החופש לא מגיע כשהפחד נעלם — הוא מגיע כשממשיכים למרות הפחד.',
            'פחד×ביטחון עצמי': 'את חושבת על ביטחון עצמי, ובצורה ראית פחד. הפחד והביטחון גרים באותו מקום — ההבדל הוא מי שפותח את הדלת.',
            // שליטה (NEW)
            'שליטה×חופש': 'את חושבת על חופש, ובצורה ראית שליטה. אולי החופש שלך מתחיל ברגע שתשחררי את המפתח.',
            'שליטה×שקט': 'את חושבת על שקט, ובצורה ראית שליטה. השקט שלך לא דורש חומות — הוא דורש אמון.',
            'שליטה×עבודה / לימודים': 'המחשבות שלך בעבודה, ובצורה ראית שליטה. אולי השאלה היא לא מה לשלוט בו — אלא מה לשחרר.',
            // אור (NEW)
            'אור×ביטחון עצמי': 'את חושבת על ביטחון, ובצורה ראית אור. האור הזה לא מגיע מבחוץ — הוא כבר בפנים.',
            'אור×אהבה / קשרים': 'המחשבות שלך באהבה, ובצורה ראית אור. הניצוץ שזיהית הוא לא סימן ממישהו אחר — הוא ממך.',
            'אור×שקט': 'את חושבת על שקט, ובצורה ראית אור. האור לא צריך שיהיה שקט כדי להאיר.',
            // זמן (NEW)
            'זמן×עבודה / לימודים': 'המחשבות שלך בעבודה, ובצורה ראית זמן. הזמן שלך לא אוזל — הוא מתגלגל. אין מאוחר, יש אחרת.',
            'זמן×אהבה / קשרים': 'המחשבות שלך באהבה, ובצורה ראית זמן. הקשרים שלך לא מאחרים — הם מתבשלים.',
            'זמן×שקט': 'את חושבת על שקט, ובצורה ראית זמן. השקט לא מחכה בסוף — הוא בין הרגעים.',
        },
        en: {
            'movement×work / studies': 'Your thoughts are on work, and in the shape you saw movement. Your body already knows where to go.',
            'movement×love / relationships': 'Your thoughts are on love, and you saw movement. Your relationships are changing direction — not ending, turning.',
            'movement×freedom': 'You think of freedom and saw movement. Your freedom isn\'t in a fixed place — it\'s in the motion itself.',
            'roots×work / studies': 'Your thoughts are on work, and you saw roots. Perhaps change isn\'t uprooting but deepening.',
            'roots×love / relationships': 'Your thoughts are on love, and you saw roots. There\'s growth waiting for the right soil.',
            'shelter×love / relationships': 'Your thoughts are on love, and you saw shelter. Perhaps you seek not a new home — but a home inside someone.',
            'life×freedom': 'You think of freedom and saw something alive. The life you identified is already a kind of freedom.',
            'presence×work / studies': 'Your thoughts are on work, and you saw a presence. That presence is a part of you wanting to be seen.',
            'openness×freedom': 'You think of freedom and saw openness. The space already opened — are you ready to enter?',
            'fracture×love / relationships': 'Your thoughts are on love, and you saw fracture. The crack isn\'t the end — it\'s where new light enters.',
            'connection×love / relationships': 'Your thoughts are on love, and you saw connection. The bond you identified exists — it just needs you to believe in it.',
            'fear×freedom': 'You think of freedom and saw fear. Freedom doesn\'t come when fear vanishes — it comes when you continue despite it.',
            'fear×self-confidence': 'You think of confidence and saw fear. Fear and confidence live in the same place — the difference is who opens the door.',
            'control×freedom': 'You think of freedom and saw control. Perhaps your freedom begins when you release the key.',
            'light×self-confidence': 'You think of confidence and saw light. That light doesn\'t come from outside — it\'s already within.',
            'time×work / studies': 'Your thoughts are on work, and you saw time. Your time isn\'t running out — it\'s unfolding.',
            'time×love / relationships': 'Your thoughts are on love, and you saw time. Your connections aren\'t late — they\'re ripening.',
        }
    };

    let foundCrossInsight = false;
    if (qualities.length > 0 && change) {
        const crossKey = `${qualities[0]}×${change}`;
        if (CROSS_INSIGHTS[lang] && CROSS_INSIGHTS[lang][crossKey]) {
            parts.push(CROSS_INSIGHTS[lang][crossKey]);
            foundCrossInsight = true;
        }
    }
    if (!foundCrossInsight && qualities.length > 0 && req) {
        const crossKey = `${qualities[0]}×${req}`;
        if (CROSS_INSIGHTS[lang] && CROSS_INSIGHTS[lang][crossKey]) {
            parts.push(CROSS_INSIGHTS[lang][crossKey]);
            foundCrossInsight = true;
        }
    }

    // 3. Fallback to quality text if no cross-insight found
    if (!foundCrossInsight) {
        if (qualities.length > 0 && qTexts[qualities[0]]) {
            parts.push(qTexts[qualities[0]]);
        }
    }
    
    // ── 4. DOUBT WEAVE: reflect the user's doubt pattern ──
    if (doubt && doubt !== 'SKIPPED' && doubt.trim().length > 0) {
        if (isHe) {
            parts.push(`כשאת מתלבטת, את נוטה "${doubt}". הצורה שראית אומרת שזה לא חולשה — זה התבנית שדרכה את מתקרבת לתשובה.`);
        } else {
            parts.push(`When uncertain, you tend to "${doubt}". The shape you saw says that's not weakness — it's the pattern through which you approach answers.`);
        }
    }
    
    // ── 5. PERSONAL WEAVE: connect home + need ──
    if (home && home !== 'SKIPPED' && req && req !== 'SKIPPED') {
        if (isHe) {
            parts.push(`מ${home} את מביטה ואומרת "אני זקוקה ל${req}". המפה לא ענתה — היא שיקפה.`);
        } else {
            parts.push(`From ${home} you look up and say "I need ${req}." The map didn't answer — it reflected.`);
        }
    }

    // 6. Dream
    const hasDream = dream && dream !== 'SKIPPED';
    if (hasDream) {
        if (isHe) {
            parts.push(`החלום שהנחת בשמיים — "${dream}" — הוא לא נבואה. הוא אישור שהדרך כבר מתחילה.`);
        } else {
            parts.push(`The dream you placed in the sky — "${dream}" — isn't prophecy. It's confirmation the path has already begun.`);
        }
    }

    // 7. Personal code
    if (isHe) {
        parts.push(`הקוד האישי שלך: ${coreNum}.`);
    } else {
        parts.push(`Your personal code: ${coreNum}.`);
    }

    return parts.join(' ');
}


// ======================================================
// HORIZON SCREEN
// ======================================================
function showHorizon() {
    AudioEngine.fadeOut();
    if (renderer && renderer.domElement) {
        renderer.render(scene, threeCam);
        skyMapDataUrl = renderer.domElement.toDataURL('image/png');
    }

    skyRunning = false;
    
    const skyUi = document.querySelector('.sky-ui');
    if (skyUi) skyUi.style.display = 'none';
    
    const zoomControls = document.querySelector('.zoom-controls');
    if (zoomControls) zoomControls.style.display = 'none';

    targetCam.scale = 0.06; 
    targetCam.x = 0; 
    targetCam.y = 0;

    showScreen('screen-horizon');

    const isHe = currentLang === 'he';
    const name    = answers.name    || '';
    const dream   = answers.dream   || '';
    const req     = answers.request || '';
    const change  = answers.change  || '';
    const observation = window.selectedPareidolia || '';

    // Title
    const titleEl = document.getElementById('ui-horizontitle');
    if (titleEl) titleEl.innerText = isHe ? `מפת האופק של ${name}` : `${name}'s Horizon Map`;

    // "What you saw" label
    const obsLabel = document.getElementById('horizon-obs-label');
    if (obsLabel) obsLabel.innerText = isHe ? 'מה שראית בדימוי:' : 'What you saw in the image:';

    // User's observation (verbatim)
    const symbolEl = document.getElementById('horizon-symbol');
    if (symbolEl) symbolEl.innerText = observation || (isHe ? '—' : '—');

    // Dream block
    const dreamRow = document.getElementById('horizon-dream-row');
    const dreamLabel = document.getElementById('horizon-dream-label');
    const dreamEl = document.getElementById('horizon-dream');
    if (dream && dream !== 'SKIPPED') {
        if (dreamRow) dreamRow.style.display = 'block';
        if (dreamLabel) dreamLabel.innerText = isHe ? 'החלום שהנחת בשמיים' : 'The dream you placed in the sky';
        if (dreamEl) dreamEl.innerText = dream;
        if (isHe && dreamRow) dreamRow.style.textAlign = 'right';
        if (!isHe && dreamRow) dreamRow.style.textAlign = 'left';
    }

    // Poetic reflection
    const descEl = document.getElementById('horizon-desc');
    if (descEl) {
        if (observation) {
            descEl.innerText = buildPoeticReflection(observation, dream, req, change, isHe);
        } else {
            descEl.innerText = isHe
                ? 'הדימוי נולד מהנקודות שמסרת. המשמעות שלו מתחילה במה שתראי בתוכו.'
                : 'The image was born from the points you gave. Its meaning begins with what you see in it.';
        }
        if (isHe) descEl.style.textAlign = 'right';
    }

    // Closing line
    const finalEl = document.getElementById('horizon-final-sentence');
    if (finalEl) finalEl.innerText = chooseClosingLine(isHe);

    // Reveal with a slight fade delay for drama
    const content = document.getElementById('horizon-content');
    if (content) {
        content.style.opacity = '0';
        content.style.display = 'block';
        content.style.transition = 'opacity 2.5s ease';
        setTimeout(() => { content.style.opacity = '1'; }, 200);
    }
}




window.saveMapImage = function() {
    const c = document.getElementById('horizon-canvas');
    if (!c) return;
    const link = document.createElement('a');
    link.download = 'PAGMAR_Heatmap.png';
    link.href = c.toDataURL('image/png');
    link.click();
};

window.saveSkyMapImage = function() {
    if (!skyMapDataUrl) return;
    const link = document.createElement('a');
    link.download = 'PAGMAR_Sky.png';
    link.href = skyMapDataUrl;
    link.click();
};

// ======================================================
// LEGEND LOGIC
// ======================================================
function populateLegend() {
    const legendContent = document.getElementById('legend-content');
    if (!legendContent) return;

    const lang = currentLang;
    
    const structureMeaning = lang === 'he' ? 
        `צורת הרשת נקבעה על ידי המספר הנומרולוגי של שמך (<b>${vp.coreNum}</b>).` : 
        `The web structure was determined by the numerology of your name (<b>${vp.coreNum}</b>).`;
    
    let domShapeStr = "";
    if (vp.dominantElement === 'flare') domShapeStr = lang==='he' ? 'קרני אור דקות' : 'Thin flares';
    else if (vp.dominantElement === 'halo') domShapeStr = lang==='he' ? 'הילות רכות' : 'Soft halos';
    else domShapeStr = lang==='he' ? 'נקודות אור ממוקדות' : 'Focused dots';

    const hopeMeaning = lang === 'he' ? 
        `האלמנט המרכזי (<b>${domShapeStr}</b>) מבוסס על מה שאת זקוקה לו כעת (${answers.need === 'Other' ? answers.need_custom : answers.need}).` : 
        `The dominant element (<b>${domShapeStr}</b>) is based on what you need right now (${answers.need === 'Other' ? answers.need_custom : answers.need}).`;
        
    const timeMeaning = lang === 'he' ? 
        `קצב הגילוי הותאם למקום בו נולדת (${answers.birth_place}).` : 
        `The speed of revelation was tuned to your birthplace (${answers.birth_place}).`;

    const colorMeaning = lang === 'he' ? 
        `ספקטרום הצבעים נגזר מתשובתך (${answers.color}). חלוקת הדימוי לאזורי צבע מובחנים מסמלת היבטים שונים בזיכרון שלך. אזורים צפופים בעלי ריכוז צבעים גבוה מעידים על נקודות ציון משמעותיות, בעוד שאזורים דלילים יותר מייצגים פערי זיכרון ואזורים שטרם נחקרו.` : 
        `The color spectrum is derived from your answer (${answers.color}). Highly concentrated color clusters indicate significant subconscious milestones, while sparser areas represent memory gaps.`;

    legendContent.innerHTML = `
        <div class="legend-item"><b>1.</b> ${structureMeaning}</div>
        <div class="legend-item"><b>2.</b> ${hopeMeaning}</div>
        <div class="legend-item"><b>3.</b> ${timeMeaning}</div>
        <div class="legend-item"><b>4.</b> ${colorMeaning}</div>
    `;
}

window.downloadSkyMap = function() {
    const canvas = document.getElementById('sky-canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'My_Sky_Map.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
};

window.showDeepText = function(text) {
    const modal = document.getElementById('deep-text-modal');
    if (!modal) return;
    const content = document.getElementById('deep-text-content');
    if (content) content.textContent = text;

    // Ensure close button exists
    let closeBtn = modal.querySelector('.deep-text-close');
    if (!closeBtn) {
        closeBtn = document.createElement('button');
        closeBtn.className = 'deep-text-close';
        closeBtn.textContent = '×';
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.closeDeepText();
            window._autoTextPt = null;
        });
        modal.appendChild(closeBtn);
    }

    modal.classList.remove('hidden');
};

window.closeDeepText = function() {
    const modal = document.getElementById('deep-text-modal');
    if (modal) modal.classList.add('hidden');
};

function toggleSound() {
    const muted = AudioEngine.toggleMute();
    const btn = document.getElementById('btn-sound-toggle');
    if (btn) {
        btn.textContent = muted ? '—' : '♪';
        btn.style.opacity = muted ? '0.3' : '0.6';
        btn.title = muted ? 'Sound off' : 'Sound on';
    }
}

function toggleLegend() {
    const modal = document.getElementById('legend-modal');
    if (!modal) return;
    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        modal.style.opacity = 0;
        setTimeout(() => modal.style.opacity = 1, 10);
    } else {
        modal.style.opacity = 0;
        setTimeout(() => modal.classList.add('hidden'), 400);
    }
}


// ======================================================
// BOOT
// ======================================================
window.toggleLegend = toggleLegend; // expose globally for onclick
buildDOM();
updateLang('he'); // Initialize text and default to Hebrew

// ── GLOBAL LIGHT-POINT CURSOR (all screens) ──
(function initGlobalCursor() {
    document.body.style.cursor = 'none'; // hide native cursor everywhere
    const gc = document.getElementById('global-cursor');
    if (!gc) return;
    document.addEventListener('mousemove', e => {
        gc.style.left = e.clientX + 'px';
        gc.style.top  = e.clientY + 'px';
    }, { passive: true });
    // Pulse on click
    document.addEventListener('mousedown', () => {
        gc.style.transform = 'translate(-50%,-50%) scale(1.8)';
        gc.style.boxShadow = '0 0 20px 8px rgba(200,180,255,0.7), 0 0 5px 2px rgba(255,255,255,1)';
    });
    document.addEventListener('mouseup', () => {
        gc.style.transform = 'translate(-50%,-50%) scale(1)';
        gc.style.boxShadow = '0 0 12px 4px rgba(200,180,255,0.5), 0 0 3px 1px rgba(255,255,255,0.9)';
    });
})();

// ── DAWN TRANSITION EVENTS ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const btnSunrise = document.getElementById('btn-sunrise');
    const dawnOverlay = document.getElementById('dawn-overlay');
    const epilogueScreen = document.getElementById('epilogue-screen');
    const btnRestart = document.getElementById('btn-restart');
    
    if (btnSunrise && dawnOverlay && epilogueScreen) {
        btnSunrise.addEventListener('click', () => {
            // Hide button
            btnSunrise.classList.remove('visible');
            btnSunrise.style.display = 'none';
            
            // Trigger sunrise fade
            dawnOverlay.classList.add('active');
            epilogueScreen.classList.add('active');
            
            // Optionally fade out the WebGL elements slightly behind the dawn
            const skyScreen = document.getElementById('sky-screen');
            if (skyScreen) skyScreen.style.opacity = '0';
        });
    }

    if (btnRestart) {
        btnRestart.addEventListener('click', () => {
            location.reload(); // Hard refresh to reset the entire experience
        });
    }
});
