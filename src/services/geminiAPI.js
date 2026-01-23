/**
 * 🤖 GEMINI AI SERVICE
 *
 * Menggunakan Google Gemini AI untuk generate dynamic NPC dialog
 * Sesuai dengan konteks situasi dan personality karakter
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

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
 */
export const generateAIDialog = async ({
    character = 'spirit',
    situation = '',
    playerAction = '',
    mood = 'neutral',
    maxLength = 150,
}) => {
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
        return generatedText
            .trim()
            .replace(/^["']|["']$/g, '') // Remove quotes
            .substring(0, maxLength); // Enforce max length
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
