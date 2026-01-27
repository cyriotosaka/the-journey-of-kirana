/**
 * 🤖 GEMINI AI SERVICE
 *
 * Menggunakan Google Gemini AI untuk generate dynamic NPC dialog
 * Sesuai dengan konteks situasi dan personality karakter
 * 
 * Features:
 * - Memory cache untuk response yang sudah di-generate
 * - LRU-style eviction (max 50 entries)
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
// Updated to new model - gemini-pro is deprecated
const GEMINI_API_URL =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// ========== MEMORY CACHE ==========
const CACHE_MAX_SIZE = 50;
const responseCache = new Map();

/**
 * Generate cache key dari parameter dialog
 */
const generateCacheKey = ({ character, situation, playerAction, mood }) => {
    return `${character}:${situation}:${playerAction}:${mood}`.toLowerCase();
};

/**
 * Get dari cache, update access time
 */
const getFromCache = (key) => {
    if (responseCache.has(key)) {
        const cached = responseCache.get(key);
        // Update timestamp untuk LRU
        cached.accessedAt = Date.now();
        console.log('📦 Cache hit for:', key.substring(0, 50) + '...');
        return cached.response;
    }
    return null;
};

/**
 * Save ke cache, evict jika penuh
 */
const saveToCache = (key, response) => {
    // Evict oldest jika cache penuh
    if (responseCache.size >= CACHE_MAX_SIZE) {
        let oldestKey = null;
        let oldestTime = Infinity;
        
        for (const [k, v] of responseCache) {
            if (v.accessedAt < oldestTime) {
                oldestTime = v.accessedAt;
                oldestKey = k;
            }
        }
        
        if (oldestKey) {
            responseCache.delete(oldestKey);
            console.log('🗑️ Cache evicted:', oldestKey.substring(0, 30) + '...');
        }
    }
    
    responseCache.set(key, {
        response,
        accessedAt: Date.now(),
        createdAt: Date.now(),
    });
    console.log('💾 Cache saved:', key.substring(0, 50) + '...');
};

/**
 * Clear all cache (untuk testing/reset)
 */
export const clearAICache = () => {
    responseCache.clear();
    console.log('🧹 AI cache cleared');
};

/**
 * Get cache stats
 */
export const getCacheStats = () => ({
    size: responseCache.size,
    maxSize: CACHE_MAX_SIZE,
    keys: Array.from(responseCache.keys()),
});

/**
 * Character personalities untuk consistent dialog generation
 */
const CHARACTER_PERSONALITIES = {
    kirana: {
        name: 'Kirana',
        personality:
            'Seorang gadis muda yang pemberani namun ketakutan. Berbicara lembut dan penuh harap meski dalam situasi mengerikan.',
        tone: 'Takut namun penuh tekad, sering berbicara dalam bisikan',
        language: 'Bahasa Indonesia dengan sedikit kata-kata Jawa kuno',
    },

    galuh: {
        name: 'Galuh (Nenek Penyihir)',
        personality:
            'Penyihir jahat yang obsesif dan manipulatif. Dulu cantik, sekarang haus kecantikan kembali.',
        tone: 'Sarkastik, mengejek, kadang lembut palsu lalu berubah kejam',
        language: 'Bahasa Indonesia formal dengan nada merendahkan',
    },

    spirit: {
        name: 'Roh Pelindung',
        personality:
            'Entitas misterius yang memberikan petunjuk samar. Bijaksana namun cryptic.',
        tone: 'Tenang, misterius, seperti suara angin berbisik',
        language: 'Bahasa puitis dengan metafora alam',
    },
};

/**
 * Generate AI dialog berdasarkan konteks situasi
 * Uses memory cache to avoid repeated API calls
 */
export const generateAIDialog = async ({
    character = 'spirit',
    situation = '',
    playerAction = '',
    mood = 'neutral',
    maxLength = 150,
    useCache = true, // Set false untuk force fresh response
}) => {
    // Check cache first
    const cacheKey = generateCacheKey({ character, situation, playerAction, mood });
    
    if (useCache) {
        const cached = getFromCache(cacheKey);
        if (cached) return cached;
    }

    if (!GEMINI_API_KEY) {
        console.warn('Gemini API key tidak ditemukan. Gunakan dialog default.');
        return getDefaultDialog(character, situation);
    }

    const personality =
        CHARACTER_PERSONALITIES[character] || CHARACTER_PERSONALITIES.spirit;

    const prompt = `
Kamu adalah ${personality.name} dalam game horror "The Journey of Kirana".

Personality: ${personality.personality}
Tone: ${personality.tone}
Bahasa: ${personality.language}

SITUASI SAAT INI: ${situation}
AKSI PLAYER: ${playerAction || 'Baru memasuki area'}
MOOD: ${mood}

Berikan 1 dialog pendek (maksimal ${maxLength} karakter) yang sesuai dengan personality karakter ini.
Jangan gunakan tanda petik atau format markdown. Langsung tulis dialognya saja.
Buat dialog yang atmospheric dan sesuai genre horror survival.
`;

    try {
        const response = await fetch(
            `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt,
                                },
                            ],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.9,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 200,
                    },
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const generatedText = data.candidates[0]?.content?.parts[0]?.text || '';

        // Clean up the response
        const cleanedResponse = generatedText
            .trim()
            .replace(/^["']|["']$/g, '') // Remove quotes
            .substring(0, maxLength); // Enforce max length

        // Save to cache for future use
        saveToCache(cacheKey, cleanedResponse);

        return cleanedResponse;
    } catch (error) {
        console.error('Error generating AI dialog:', error);
        return getDefaultDialog(character, situation);
    }
};

/**
 * Fallback dialog jika AI gagal atau API key tidak ada
 */
const getDefaultDialog = (character, situation) => {
    const defaultDialogs = {
        kirana: [
            'Aku harus terus berjalan... meski gelap menakutkan.',
            'Suara apa itu? Jantungku berdebar kencang...',
            'Cangkang emas ini... satu-satunya yang melindungiku.',
        ],

        galuh: [
            'Kau pikir bisa kabur dariku, bocah kecil?',
            'Kecantikanmu akan menjadi milikku... selamanya.',
            'Sia-sia berlari. Hutan ini adalah wilayahku!',
        ],

        spirit: [
            'Cahaya dalam gelap... jalan masih ada.',
            'Dengarkan bisikan angin, ia akan menuntunmu.',
            'Keberanian sejati bukan tanpa rasa takut, tapi melangkah meski takut.',
        ],
    };

    const characterDialogs = defaultDialogs[character] || defaultDialogs.spirit;
    return characterDialogs[
        Math.floor(Math.random() * characterDialogs.length)
    ];
};

/**
 * Generate contextual hint untuk player
 */
export const generateHint = async (currentObjective, playerProgress) => {
    const hints = [
        'Tekan SHIFT untuk bersembunyi dalam cangkang emas.',
        'Musuh tidak bisa melihatmu saat kamu bersembunyi.',
        'Cari area gelap untuk menghindari musuh.',
        'Dengarkan suara langkah kaki musuh yang mendekat.',
        'Beberapa objek bisa digerakkan untuk membuka jalan.',
    ];

    // Bisa diperluas dengan AI generation
    return hints[Math.floor(Math.random() * hints.length)];
};

/**
 * Generate dynamic narrative berdasarkan player choices
 */
export const generateNarrative = async (choice, context) => {
    // Placeholder untuk future implementation
    // Bisa generate cutscene text atau ending variations
    return `Kirana memilih: ${choice}. Takdir dunia berubah...`;
};

export default {
    generateAIDialog,
    generateHint,
    generateNarrative,
};
