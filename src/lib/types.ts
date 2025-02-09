export const sounds = ['alarm', 'buzzer', 'chime', 'digital'] as const;
export type Sound = typeof sounds[number];

export interface Settings {
    audio: Sound;
    volume: number; // 0..=1
};

export const default_settings = (): Settings => ({
    audio: 'alarm', // TODO: add other alarm options
    volume: 1,
});

export interface HMS {
    h: number | '';
    m: number | '';
    s: number | '';
}

