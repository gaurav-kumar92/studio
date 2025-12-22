
export const astrologySymbols = [
    {
        name: "Sun",
        parts: {
            outer: "M12 5.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zM12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l-1.42-1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l-1.42 1.42",
            inner: "M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"
        },
        defaultColors: {
            outer: '#facc15',
            inner: '#fbbf24'
        }
    },
    {
        name: "Moon",
        parts: {
            shape: "M21.64 13.5A8.96 8.96 0 0 1 11.5 3.36 8.96 8.96 0 0 0 2.5 12.36a8.96 8.96 0 0 0 9.64 9.14 9.32 9.32 0 0 0 .14-1.89A8.96 8.96 0 0 1 21.64 13.5z"
        },
        defaultColors: {
            shape: '#f3f4f6'
        }
    },
    {
        name: "Mercury",
        parts: {
            circle: "M12 14a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
            cross: "M12 18v4M10 20h4",
            horns: "M9.5 6A2.5 2.5 0 0 1 12 3.5a2.5 2.5 0 0 1 2.5 2.5"
        },
        defaultColors: {
            circle: '#a8a29e',
            cross: '#a8a29e',
            horns: '#a8a29e'
        }
    },
    {
        name: "Venus",
        parts: {
            circle: "M12 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
            cross: "M12 12v10M8 16h8"
        },
        defaultColors: {
            circle: '#f472b6',
            cross: '#f472b6'
        }
    },
    {
        name: "Earth",
        parts: {
            circle: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z",
            cross: "M2 12h20M12 2v20"
        },
        defaultColors: {
            circle: '#3b82f6',
            cross: '#34d399'
        }
    },
    {
        name: "Mars",
        parts: {
            circle: "M15 9a6 6 0 1 1-12 0 6 6 0 0 1 12 0z",
            arrow: "M17 2l5 5m0-5v5h-5"
        },
        defaultColors: {
            circle: '#ef4444',
            arrow: '#ef4444'
        }
    },
    {
        name: "Jupiter",
        parts: {
            shape: "M2 12h4m5-10v18M2 5h14c2.76 0 5 2.24 5 5s-2.24 5-5 5H9"
        },
        defaultColors: {
            shape: '#f97316'
        }
    },
    {
        name: "Saturn",
        parts: {
            shape: "M21 12h-4m-7-9v18M2 10h12c2.76 0 5 2.24 5 5s-2.24 5-5 5H9"
        },
        defaultColors: {
            shape: '#eab308'
        }
    },
    {
        name: "Uranus",
        parts: {
            shape: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM4 12h16M12 4v16"
        },
        defaultColors: {
            shape: '#06b6d4'
        }
    },
    {
        name: "Neptune",
        parts: {
            shape: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM4 12h16m-4-4l-4 4-4-4m8 8l-4-4-4 4"
        },
        defaultColors: {
            shape: '#6366f1'
        }
    },
    {
        name: "Pluto",
        parts: {
            shape: "M12 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-6 2h12M12 12v10"
        },
        defaultColors: {
            shape: '#78716c'
        }
    },
    {
        name: "Aries",
        parts: { shape: "M4 9a5 5 0 0 1 5-5h6M4 9a5 5 0 0 0 5 5h6M15 4v10" },
        defaultColors: { shape: '#ef4444' }
    },
    {
        name: "Taurus",
        parts: { shape: "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zm0 0v6m-3-3h6" },
        defaultColors: { shape: '#34d399' }
    },
    {
        name: "Gemini",
        parts: { shape: "M4 5h16M4 19h16M8 5v14M16 5v14" },
        defaultColors: { shape: '#facc15' }
    },
    {
        name: "Cancer",
        parts: { shape: "M3 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0zm10 0a4 4 0 1 0 8 0 4 4 0 0 0-8 0z" },
        defaultColors: { shape: '#a8a29e' }
    },
    {
        name: "Leo",
        parts: { shape: "M3 6a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v12H3V6zm14 12v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" },
        defaultColors: { shape: '#f97316' }
    },
    {
        name: "Virgo",
        parts: { shape: "M4 4v16h4V8h2v12h4V8h2v12h4V4" },
        defaultColors: { shape: '#059669' }
    },
    {
        name: "Libra",
        parts: { shape: "M2 14h20M2 18h20M4 14a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4" },
        defaultColors: { shape: '#3b82f6' }
    },
    {
        name: "Scorpio",
        parts: { shape: "M4 4v12h4V8h2v8h4V8h2v12h4V4m-2 16l-2-2-2 2" },
        defaultColors: { shape: '#be123c' }
    },
    {
        name: "Sagittarius",
        parts: { shape: "M3 21L21 3m-9 0h9v9" },
        defaultColors: { shape: '#7c3aed' }
    },
    {
        name: "Capricorn",
        parts: { shape: "M4 16V4h4l2 4 2-4h4v12a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" },
        defaultColors: { shape: '#57534e' }
    },
    {
        name: "Aquarius",
        parts: {
            upper: "M3 6l4-4 4 4 4-4 4 4",
            lower: "M3 14l4-4 4 4 4-4 4 4"
        },
        defaultColors: {
            upper: '#0ea5e9',
            lower: '#0ea5e9'
        }
    },
    {
        name: "Pisces",
        parts: { shape: "M4 8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8zm4-2v12m8-12v12" },
        defaultColors: { shape: '#6366f1' }
    }
];
