import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import * as htmlToImage from 'html-to-image';
import EPISODE_DB from './data/bilibili_episodes.json';
import {
    CheckCircle2,
    Circle,
    ChevronDown,
    ChevronUp,
    Search,
    Trophy,
    Ship,
    Skull,
    Sun,
    Moon,
    Compass,
    Film,
    Play,
    Trash2,
    ExternalLink,
    Menu,
    X,
    LayoutGrid,
    List,
    Download,
    Upload,
    Camera,
    CircleMinus,
    Bell
} from 'lucide-react';

// --- Konfigurasi & Data ---
const appId = 'op-tracker-v4';

const isFillerEpisode = (ep: number) => {
    // Rentang episode filler One Piece (Berdasarkan panduan umum)
    const fillerRanges = [
        [50, 51], [54, 61], [93, 93], [98, 99], [101, 102], [131, 143], [196, 206],
        [213, 216], [220, 226], [279, 283], [291, 292], [303, 303], [317, 319],
        [326, 336], [382, 384], [406, 407], [426, 429], [457, 458], [492, 492],
        [542, 542], [575, 578], [590, 590], [626, 628], [747, 750], [775, 775],
        [780, 782], [807, 807], [881, 881], [895, 896], [907, 907], [1029, 1030],
        [1084, 1085]
    ];
    // Reverie mixed fillers that are heavily filler-leaning:
    const reverieMixedFillers = [878, 879, 882, 883, 884, 885, 887, 888, 889];
    return fillerRanges.some(([start, end]) => ep >= start && ep <= end) || reverieMixedFillers.includes(ep);
};

const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    let device = "Dekstop";
    if (/tablet|ipad|playbook|silk/i.test(ua)) device = "Tablet";
    else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) device = "Mobile";

    let os = "OS Tidak Diketahui";
    if (ua.indexOf("Win") !== -1) os = "Windows";
    if (ua.indexOf("Mac") !== -1) os = "macOS";
    if (ua.indexOf("Linux") !== -1) os = "Linux";
    if (ua.indexOf("Android") !== -1) os = "Android";
    if (ua.indexOf("like Mac") !== -1) os = "iOS";

    return { device, os };
};

// Episode Database is now imported from ./data/bilibili_episodes.json

const getBilibiliUrl = (epNum: string | number) => {
    const epData = (EPISODE_DB as any)[epNum];
    if (epData && epData.url) {
        return epData.url;
    }
    return `https://www.bilibili.tv/id/search-result?q=One+Piece+Episode+${epNum}`;
};



const SAGA_DATA = [
    {
        id: 'east-blue',
        title: 'East Blue Saga',
        description: 'Perjalanan Luffy mencari kru pertama: Zoro, Nami, Usopp, dan Sanji.',
        arcs: [
            { id: 'romance-dawn', title: 'Romance Dawn', start: 1, end: 3, type: 'Canon' },
            { id: 'orange-town', title: 'Orange Town', start: 4, end: 8, type: 'Canon' },
            { id: 'syrup-village', title: 'Syrup Village', start: 9, end: 18, type: 'Canon' },
            { id: 'baratie', title: 'Baratie', start: 19, end: 30, type: 'Canon' },
            { id: 'arlong-park', title: 'Arlong Park', start: 31, end: 44, type: 'Canon' },
            { id: 'loguetown', title: 'Loguetown', start: 45, end: 53, type: 'Mixed' },
            { id: 'warship-island', title: 'Warship Island', start: 54, end: 61, type: 'Filler' },
        ]
    },
    {
        id: 'arabasta',
        title: 'Arabasta Saga',
        description: 'Membantu Putri Vivi menyelamatkan Alabasta dari Baroque Works.',
        arcs: [
            { id: 'reverse-mountain', title: 'Reverse Mountain', start: 62, end: 63, type: 'Canon' },
            { id: 'whiskey-peak', title: 'Whiskey Peak', start: 64, end: 67, type: 'Canon' },
            { id: 'koby-helmeppo', title: 'Koby & Helmeppo', start: 68, end: 69, type: 'Canon' },
            { id: 'little-garden', title: 'Little Garden', start: 70, end: 77, type: 'Canon' },
            { id: 'drum-island', title: 'Drum Island', start: 78, end: 91, type: 'Canon' },
            { id: 'arabasta-arc', title: 'Arabasta', start: 92, end: 130, type: 'Canon' },
            { id: 'post-arabasta', title: 'Post-Arabasta', start: 131, end: 135, type: 'Filler' },
        ]
    },
    {
        id: 'sky-island',
        title: 'Sky Island Saga',
        description: 'Petualangan ke langit untuk mencari Kota Emas legendaris Shandora.',
        arcs: [
            { id: 'goat-island', title: 'Goat Island', start: 136, end: 138, type: 'Filler' },
            { id: 'ruluka-island', title: 'Ruluka Island', start: 139, end: 143, type: 'Filler' },
            { id: 'jaya', title: 'Jaya', start: 144, end: 152, type: 'Canon' },
            { id: 'skypiea', title: 'Skypiea', start: 153, end: 195, type: 'Canon' },
            { id: 'g8', title: 'G-8 (Navarone)', start: 196, end: 206, type: 'Recommended Filler' },
        ]
    },
    {
        id: 'water-7',
        title: 'Water 7 Saga',
        description: 'Konflik internal kru dan pertarungan epik di Enies Lobby.',
        arcs: [
            { id: 'long-ring', title: 'Long Ring Long Land', start: 207, end: 219, type: 'Canon' },
            { id: 'oceans-dream', title: 'Ocean\'s Dream', start: 220, end: 224, type: 'Filler' },
            { id: 'foxy-return', title: 'Foxy\'s Return', start: 225, end: 226, type: 'Filler' },
            { id: 'water-7-arc', title: 'Water 7', start: 227, end: 263, type: 'Canon' },
            { id: 'enies-lobby', title: 'Enies Lobby', start: 264, end: 312, type: 'Canon' },
            { id: 'post-enies', title: 'Post-Enies Lobby', start: 313, end: 325, type: 'Canon' },
        ]
    },
    {
        id: 'thriller-bark',
        title: 'Thriller Bark Saga',
        description: 'Pertarungan melawan Shichibukai Gecko Moria dan merekrut Brook.',
        arcs: [
            { id: 'lovely-land', title: 'Lovely Land', start: 326, end: 336, type: 'Filler' },
            { id: 'thriller-bark-arc', title: 'Thriller Bark', start: 337, end: 381, type: 'Canon' },
            { id: 'spa-island', title: 'Spa Island', start: 382, end: 384, type: 'Filler' },
        ]
    },
    {
        id: 'summit-war',
        title: 'Summit War Saga',
        description: 'Puncak perang era lama untuk menyelamatkan Ace di Marineford.',
        arcs: [
            { id: 'sabaody', title: 'Sabaody Archipelago', start: 385, end: 405, type: 'Canon' },
            { id: 'chopper-man', title: 'Special: Chopper Man', start: 406, end: 407, type: 'Filler' },
            { id: 'amazon-lily', title: 'Amazon Lily', start: 408, end: 421, type: 'Canon' },
            { id: 'impel-down-1', title: 'Impel Down (Part 1)', start: 422, end: 425, type: 'Canon' },
            { id: 'little-east-blue', title: 'Little East Blue', start: 426, end: 429, type: 'Filler' },
            { id: 'impel-down-2', title: 'Impel Down (Part 2)', start: 430, end: 452, type: 'Canon' },
            { id: 'separation', title: 'Straw Hat\'s Separation', start: 453, end: 456, type: 'Mixed' },
            { id: 'marineford', title: 'Marineford', start: 457, end: 489, type: 'Canon' },
            { id: 'post-war', title: 'Post-War', start: 490, end: 516, type: 'Canon' },
        ]
    },
    {
        id: 'fishman-island',
        title: 'Fish-Man Island Saga',
        description: 'Kembalinya kru setelah 2 tahun masa latihan (Timeskip).',
        arcs: [
            { id: 'return-sabaody', title: 'Return to Sabaody', start: 517, end: 522, type: 'Canon' },
            { id: 'fishman-arc', title: 'Fish-Man Island', start: 523, end: 574, type: 'Canon' },
        ]
    },
    {
        id: 'dressrosa-saga',
        title: 'Dressrosa Saga',
        description: 'Aliansi untuk menjatuhkan Shichibukai Doflamingo di Dressrosa.',
        arcs: [
            { id: 'z-ambition', title: 'Z\'s Ambition', start: 575, end: 578, type: 'Filler' },
            { id: 'punk-hazard', title: 'Punk Hazard', start: 579, end: 625, type: 'Canon' },
            { id: 'caesar-retrieval', title: 'Caesar Retrieval', start: 626, end: 628, type: 'Filler' },
            { id: 'dressrosa-arc', title: 'Dressrosa', start: 629, end: 746, type: 'Canon' },
            { id: 'silver-mine', title: 'Silver Mine', start: 747, end: 750, type: 'Filler' },
        ]
    },
    {
        id: 'yonko-saga',
        title: 'Yonko Saga',
        description: 'Konfrontasi melawan Kaisar Lautan: Big Mom dan Kaido.',
        arcs: [
            { id: 'zou', title: 'Zou', start: 751, end: 779, type: 'Canon' },
            { id: 'marine-rookie', title: 'Marine Rookie', start: 780, end: 782, type: 'Filler' },
            { id: 'whole-cake', title: 'Whole Cake Island', start: 783, end: 877, type: 'Canon' },
            { id: 'reverie', title: 'Reverie', start: 878, end: 889, type: 'Mixed' },
            { id: 'wano', title: 'Wano Country', start: 890, end: 1088, type: 'Canon' },
        ]
    },
    {
        id: 'final-saga',
        title: 'Final Saga',
        description: 'Awal puncak pencarian harta karun di Pulau Masa Depan.',
        arcs: [
            { id: 'egghead-1', title: 'Egghead Island (Part 1)', start: 1089, end: 1122, type: 'Canon' },
            { id: 'egghead-2', title: 'Egghead Island (Part 2)', start: 1123, end: 1155, type: 'Canon' },
        ]
    }
];

const MOVIE_DATA = [
    { id: 'm1', title: 'One Piece: The Movie', year: 2000 },
    { id: 'm10', title: 'Strong World', year: 2009, recommended: true },
    { id: 'm12', title: 'Film: Z', year: 2012, recommended: true },
    { id: 'm13', title: 'Film: Gold', year: 2016, recommended: true },
    { id: 'm14', title: 'Stampede', year: 2019, recommended: true },
    { id: 'm15', title: 'Film: Red', year: 2022, recommended: true },
];

const successSound = typeof Audio !== 'undefined' ? new Audio('/success.mp3') : null;

export default function App() {
    const [watchedEpisodes, setWatchedEpisodes] = useState<string[]>([]);
    const [watchedMovies, setWatchedMovies] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState('episodes');
    const [showFiller, setShowFiller] = useState(true);
    const [hideWatched, setHideWatched] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
    const [sagaViewMode, setSagaViewMode] = useState<'card' | 'list'>('card');
    const [isExporting, setIsExporting] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    const [expandedSagas, setExpandedSagas] = useState<string[]>([]);
    const [expandedArcs, setExpandedArcs] = useState<string[]>([]);

    const [loading, setLoading] = useState(true);

    const arcRefs = useRef<any>({});

    // --- Data Persistence using LocalStorage ---
    useEffect(() => {
        // Apply dark mode class to root for Tailwind dark: variants
        document.documentElement.classList.toggle('dark', isDarkMode);

        // Sync Browser Address Bar Color (theme-color)
        const themeColor = isDarkMode ? '#0a0a0a' : '#fafafa';
        let metaThemeColor = document.getElementById('theme-color-meta');
        if (!metaThemeColor) {
            metaThemeColor = document.querySelector('meta[name="theme-color"]') || document.createElement('meta');
            (metaThemeColor as any).name = 'theme-color';
            metaThemeColor.id = 'theme-color-meta';
            if (!metaThemeColor.parentNode) document.head.appendChild(metaThemeColor);
        }
        metaThemeColor.setAttribute('content', themeColor);

        // Remove duplicate theme-color tags if they exist (to prevent conflicts)
        const allMetaThemes = document.querySelectorAll('meta[name="theme-color"]');
        for (let i = 0; i < allMetaThemes.length; i++) {
            if (allMetaThemes[i].id !== 'theme-color-meta') {
                allMetaThemes[i].remove();
            }
        }
    }, [isDarkMode]);

    useEffect(() => {
        // Load data on mount
        const savedData = localStorage.getItem(`gl-tracker-${appId}`);
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                if (data.watchedEpisodes) setWatchedEpisodes(data.watchedEpisodes);
                if (data.watchedMovies) setWatchedMovies(data.watchedMovies);
                if (data.isDarkMode !== undefined) setIsDarkMode(data.isDarkMode);
            } catch (e) {
                console.error("Failed to load local storage:", e);
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!loading && 'Notification' in window) {
            setNotificationsEnabled(Notification.permission === 'granted');
            
            if (Notification.permission === 'granted') {
                const keys = Object.keys(EPISODE_DB).map(Number).filter(n => !isNaN(n));
                const maxEp = keys.length > 0 ? Math.max(...keys) : 0;
                const savedMaxEpStr = localStorage.getItem(`gl-tracker-${appId}-lastep`);
                const savedMaxEp = savedMaxEpStr ? parseInt(savedMaxEpStr, 10) : maxEp;

                if (maxEp > savedMaxEp) {
                    const n = new Notification('Episode Baru Telah Rilis! 🏴‍☠️', {
                        body: `One Piece Episode ${maxEp} sekarang tersedia. Siap Berlayar!`,
                        icon: '/mugiwara-logo.png'
                    });
                    n.onclick = () => {
                        window.focus();
                        n.close();
                    };
                    localStorage.setItem(`gl-tracker-${appId}-lastep`, maxEp.toString());
                } else if (!savedMaxEpStr) {
                    localStorage.setItem(`gl-tracker-${appId}-lastep`, maxEp.toString());
                }
            }
        }
    }, [loading]);

    const saveLocally = (updates: any) => {
        const currentData = JSON.parse(localStorage.getItem(`gl-tracker-${appId}`) || '{}');
        const newData = { ...currentData, ...updates };
        localStorage.setItem(`gl-tracker-${appId}`, JSON.stringify(newData));
    };

    // --- Actions ---
    const toggleEpisode = (epNum: string | number) => {
        const epKey = `ep-${epNum}`;
        const newWatched = watchedEpisodes.includes(epKey)
            ? watchedEpisodes.filter(id => id !== epKey)
            : [...watchedEpisodes, epKey];

        setWatchedEpisodes(newWatched);
        saveLocally({ watchedEpisodes: newWatched });

        // Evaluasi penyelesaian Arc untuk Confetti
        if (!watchedEpisodes.includes(epKey)) {
            const epNumVal = Number(epNum);
            for (const saga of SAGA_DATA) {
                for (const arc of saga.arcs) {
                    if (epNumVal >= arc.start && epNumVal <= arc.end) {
                        let allFinished = true;
                        for (let i = arc.start; i <= arc.end; i++) {
                            if (!newWatched.includes(`ep-${i}`)) {
                                allFinished = false;
                                break;
                            }
                        }
                        if (allFinished) fireConfetti();
                        return;
                    }
                }
            }
        }
    };

    const fireConfetti = () => {
        // Play success sound
        if (successSound) {
            successSound.currentTime = 0;
            successSound.play().catch(() => console.log("Audio play blocked"));
        }

        const duration = 2500;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({
                ...defaults, particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: randomInRange(0.2, 0.4) },
                colors: ['#ef4444', '#f59e0b', '#3b82f6']
            });
            confetti({
                ...defaults, particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: randomInRange(0.2, 0.4) },
                colors: ['#ef4444', '#f59e0b', '#3b82f6']
            });
        }, 250);
    };

    const toggleMovie = (movieId: string) => {
        const newWatched = watchedMovies.includes(movieId)
            ? watchedMovies.filter(id => id !== movieId)
            : [...watchedMovies, movieId];

        setWatchedMovies(newWatched);
        saveLocally({ watchedMovies: newWatched });
    };

    const toggleArcComplete = (arc: any, e: React.MouseEvent) => {
        e.stopPropagation();
        const epKeys: string[] = [];
        for (let i = arc.start; i <= arc.end; i++) epKeys.push(`ep-${i}`);

        const allWatched = epKeys.every(k => watchedEpisodes.includes(k));
        let newWatched: string[];

        if (allWatched) {
            newWatched = watchedEpisodes.filter(k => !epKeys.includes(k));
        } else {
            newWatched = [...new Set([...watchedEpisodes, ...epKeys])];
            fireConfetti();
        }

        setWatchedEpisodes(newWatched);
        saveLocally({ watchedEpisodes: newWatched });
    };

    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        saveLocally({ isDarkMode: newMode });
    };

    const getSagaProgress = (saga: any) => {
        let count = 0;
        let total = 0;
        saga.arcs.forEach((arc: any) => {
            const numEps = arc.end - arc.start + 1;
            total += numEps;
            for (let i = arc.start; i <= arc.end; i++) {
                if (watchedEpisodes.includes(`ep-${i}`)) count++;
            }
        });
        return { count, total, percent: total > 0 ? Math.round((count / total) * 100) : 0 };
    };

    const toggleSagaComplete = (saga: any, e: React.MouseEvent) => {
        e.stopPropagation();
        const epKeys: string[] = [];
        saga.arcs.forEach((arc: any) => {
            for (let i = arc.start; i <= arc.end; i++) epKeys.push(`ep-${i}`);
        });

        const allWatched = epKeys.every(k => watchedEpisodes.includes(k));
        let newWatched: string[];

        if (allWatched) {
            newWatched = watchedEpisodes.filter(k => !epKeys.includes(k));
        } else {
            newWatched = [...new Set([...watchedEpisodes, ...epKeys])];
            fireConfetti();
        }

        setWatchedEpisodes(newWatched);
        saveLocally({ watchedEpisodes: newWatched });
    };

    const toggleSaga = (sagaId: string) => {
        setExpandedSagas(prev =>
            prev.includes(sagaId) ? prev.filter(id => id !== sagaId) : [...prev, sagaId]
        );
    };

    const toggleArcDropdown = (arcId: string) => {
        setExpandedArcs(prev =>
            prev.includes(arcId) ? prev.filter(id => id !== arcId) : [...prev, arcId]
        );
    };


    const resetProgress = () => {
        if (window.confirm("Hapus semua progres tontonan Anda secara lokal?")) {
            setWatchedEpisodes([]);
            setWatchedMovies([]);
            saveLocally({ watchedEpisodes: [], watchedMovies: [], lastUpdated: new Date().toISOString() });
        }
    };

    const exportProgress = () => {
        const data = {
            watchedEpisodes,
            watchedMovies,
            lastUpdated: new Date().toISOString(),
            device: getDeviceInfo().device
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gp-tracker-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const importProgress = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                if (data.watchedEpisodes) setWatchedEpisodes(data.watchedEpisodes);
                if (data.watchedMovies) setWatchedMovies(data.watchedMovies);
                saveLocally({
                    watchedEpisodes: data.watchedEpisodes || [],
                    watchedMovies: data.watchedMovies || [],
                    lastUpdated: new Date().toISOString()
                });
                alert("Progres berhasil diimpor!");
            } catch (err) {
                alert("Format file tidak valid.");
            }
        };
        reader.readAsText(file);
    };

    const requestNotification = () => {
        if (!('Notification' in window)) {
            alert("Browser Anda tidak mendukung notifikasi desktop.");
            return;
        }
        Notification.requestPermission().then(permission => {
            setNotificationsEnabled(permission === 'granted');
            if (permission === 'granted') {
                alert("Notifikasi untuk episode baru telah diaktifkan!");
                const keys = Object.keys(EPISODE_DB).map(Number).filter(n => !isNaN(n));
                const maxEp = keys.length > 0 ? Math.max(...keys) : 0;
                localStorage.setItem(`gl-tracker-${appId}-lastep`, maxEp.toString());
            }
        });
    };

    const deviceInfo = useMemo(() => getDeviceInfo(), []);

    const continueWatching = () => {
        let firstUnwatchedArc: any = null;
        for (const saga of SAGA_DATA) {
            for (const arc of saga.arcs) {
                if (!isArcFinished(arc)) {
                    firstUnwatchedArc = arc;
                    break;
                }
            }
            if (firstUnwatchedArc) break;
        }

        if (firstUnwatchedArc) {
            const sagaId = SAGA_DATA.find(s => s.arcs.some(a => a.id === firstUnwatchedArc.id))?.id;
            if (sagaId && !expandedSagas.includes(sagaId)) setExpandedSagas(prev => [...prev, sagaId]);
            if (!expandedArcs.includes(firstUnwatchedArc.id)) setExpandedArcs(prev => [...prev, firstUnwatchedArc.id]);

            setTimeout(() => {
                arcRefs.current[firstUnwatchedArc.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    };

    const getEpisodeTitle = (num: number | string) => {
        const epData = (EPISODE_DB as any)[num];
        return epData?.title || `Episode ${num}: Petualangan`;
    };

    // Auto-expand arcs and sagas when searching for a specific term
    useEffect(() => {
        const q = searchQuery.toLowerCase().trim();
        if (q.length > 2) {
            const sagasToApp: string[] = [];
            const arcsToApp: string[] = [];

            SAGA_DATA.forEach(saga => {
                let sagaTitleMatch = saga.title.toLowerCase().includes(q);

                saga.arcs.forEach(arc => {
                    let arcMatched = false;
                    if (arc.title.toLowerCase().includes(q) || sagaTitleMatch) {
                        arcMatched = true;
                    } else {
                        for (let i = arc.start; i <= arc.end; i++) {
                            const epStr = i.toString();
                            const epTitle = getEpisodeTitle(i).toLowerCase();
                            if (epStr === q || epTitle.includes(q)) {
                                arcMatched = true;
                                break;
                            }
                        }
                    }

                    if (arcMatched) {
                        if (!sagasToApp.includes(saga.id)) sagasToApp.push(saga.id);
                        if (!arcsToApp.includes(arc.id)) arcsToApp.push(arc.id);
                    }
                });
            });

            if (sagasToApp.length > 0) {
                setExpandedSagas(prev => Array.from(new Set([...prev, ...sagasToApp])));
            }
            if (arcsToApp.length > 0) {
                setExpandedArcs(prev => Array.from(new Set([...prev, ...arcsToApp])));
            }
        }
    }, [searchQuery]);

    // --- Statistics ---
    const stats = useMemo(() => {
        let canonTotal = 0;
        let canonWatched = 0;
        let fillerTotal = 0;
        let fillerWatched = 0;
        let sagasWatched = 0;

        SAGA_DATA.forEach(saga => {
            let sagaAllWatched = true;
            saga.arcs.forEach(arc => {
                const isCanon = arc.type === 'Canon' || arc.type === 'Mixed';
                for (let i = arc.start; i <= arc.end; i++) {
                    const watched = watchedEpisodes.includes(`ep-${i}`);
                    if (isCanon) {
                        canonTotal++;
                        if (watched) canonWatched++;
                    } else {
                        fillerTotal++;
                        if (watched) fillerWatched++;
                    }
                    if (!watched) sagaAllWatched = false;
                }
            });
            if (sagaAllWatched) sagasWatched++;
        });

        const moviePercent = Math.round((watchedMovies.length / MOVIE_DATA.length) * 100);
        const sagasTotal = SAGA_DATA.length;

        return {
            canonPercent: canonTotal > 0 ? Math.round((canonWatched / canonTotal) * 100) : 0,
            canonWatched,
            canonTotal,
            fillerPercent: fillerTotal > 0 ? Math.round((fillerWatched / fillerTotal) * 100) : 0,
            fillerWatched,
            fillerTotal,
            sagasPercent: Math.round((sagasWatched / sagasTotal) * 100),
            sagasWatched,
            sagasTotal,
            moviePercent,
            movieWatched: watchedMovies.length,
            movieTotal: MOVIE_DATA.length
        };
    }, [watchedEpisodes, watchedMovies]);

    const gamerRank = useMemo(() => {
        const total = stats.canonWatched + stats.fillerWatched;
        if (total === 0) return { title: 'Tukang Pel (Rookie)', color: 'text-neutral-500' };
        if (total < 100) return { title: 'Kadet Berani', color: 'text-blue-500' };
        if (total < 300) return { title: 'Kapten Bajak Laut', color: 'text-green-500' };
        if (total < 500) return { title: 'Supernova', color: 'text-amber-500' };
        if (total < 800) return { title: 'Shichibukai', color: 'text-purple-500' };
        if (total < 1000) return { title: 'Komandan Yonko', color: 'text-rose-500' };
        return { title: 'Yonko / Raja Bajak Laut', color: 'text-red-500 drop-shadow-md' };
    }, [stats]);

    const filteredEps = useMemo(() => {
        return SAGA_DATA.map(saga => ({
            ...saga,
            arcs: saga.arcs.filter(arc => {
                const q = searchQuery.toLowerCase().trim();
                let matchesSearch = false;

                if (q === '') {
                    matchesSearch = true;
                } else {
                    if (arc.title.toLowerCase().includes(q) || saga.title.toLowerCase().includes(q)) {
                        matchesSearch = true;
                    } else {
                        for (let i = arc.start; i <= arc.end; i++) {
                            const epStr = i.toString();
                            const epTitle = getEpisodeTitle(i).toLowerCase();
                            if (epStr === q || epTitle.includes(q)) {
                                matchesSearch = true;
                                break;
                            }
                        }
                    }
                }

                const matchesFiller = showFiller || (arc.type !== 'Filler' && arc.type !== 'Special/Crossover');

                let notFullyWatched = true;
                if (hideWatched) {
                    let allWatched = true;
                    for (let i = arc.start; i <= arc.end; i++) {
                        if (!watchedEpisodes.includes(`ep-${i}`)) {
                            allWatched = false;
                            break;
                        }
                    }
                    if (allWatched) notFullyWatched = false;
                }

                return matchesSearch && matchesFiller && notFullyWatched;
            })
        })).filter(saga => saga.arcs.length > 0);
    }, [searchQuery, showFiller, hideWatched, watchedEpisodes]);

    const filteredMovies = useMemo(() => {
        return MOVIE_DATA.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [searchQuery]);

    const isArcFinished = (arc: any) => {
        for (let i = arc.start; i <= arc.end; i++) {
            if (!watchedEpisodes.includes(`ep-${i}`)) return false;
        }
        return true;
    };

    const getArcProgress = (arc: any) => {
        let count = 0;
        const total = arc.end - arc.start + 1;
        for (let i = arc.start; i <= arc.end; i++) {
            if (watchedEpisodes.includes(`ep-${i}`)) count++;
        }
        return { count, total };
    };

    const getSagaRange = (saga: any) => {
        const starts = saga.arcs.map((a: any) => a.start);
        const ends = saga.arcs.map((a: any) => a.end);
        return `${Math.min(...starts)} - ${Math.max(...ends)}`;
    };

    const exportImage = async () => {
        setIsExporting(true);
        // Beri waktu sebentar agar flag isExporting memicu re-render judul di poster
        setTimeout(async () => {
            const element = document.getElementById('stats-poster');
            if (!element) {
                setIsExporting(false);
                return;
            }

            try {
                const dataUrl = await htmlToImage.toPng(element, {
                    backgroundColor: isDarkMode ? '#0a0a0a' : '#fafafa',
                    pixelRatio: 3,
                    skipFonts: true,
                    style: { transform: 'scale(1)', transformOrigin: 'top left' }
                });
                const link = document.createElement('a');
                link.download = `OPTracker_${gamerRank.title.replace(/\s+/g, '_')}.png`;
                link.href = dataUrl;
                link.click();

                setTimeout(() => {
                    fireConfetti();
                }, 300);
            } catch (e) {
                console.error('Error exporting image', e);
            } finally {
                setIsExporting(false);
            }
        }, 100);
    };

    const theme = {
        bg: isDarkMode ? 'bg-neutral-950 text-neutral-100' : 'bg-neutral-50 text-neutral-900',
        header: isDarkMode ? 'bg-neutral-900/95 border-neutral-800' : 'bg-white/95 border-neutral-200',
        card: isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm',
        hover: isDarkMode ? 'hover:bg-neutral-800/50' : 'hover:bg-neutral-100/50',
        input: isDarkMode ? 'bg-neutral-800 text-neutral-100 placeholder:text-neutral-500' : 'bg-white text-neutral-900 placeholder:text-neutral-400 border-neutral-200 border',
        muted: isDarkMode ? 'text-neutral-400' : 'text-neutral-500',
        border: isDarkMode ? 'border-neutral-700/60' : 'border-neutral-200',
        dropdownBg: isDarkMode ? 'bg-neutral-950/50' : 'bg-neutral-50',
        buttonInactive: isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-400' : 'bg-neutral-100 border-neutral-200 text-neutral-500',
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${isDarkMode ? 'bg-neutral-950' : 'bg-neutral-50'}`}>
                <div className="flex flex-col items-center gap-4 text-red-600 animate-pulse">
                    <Ship size={64} className="animate-bounce" />
                    <p className="font-bold text-xl uppercase tracking-widest text-center bg-gradient-to-r from-red-600 to-amber-500 text-transparent bg-clip-text">Menyiapkan Logbook...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen font-sans selection:bg-amber-500/30 transition-colors duration-500 flex flex-col lg:flex-row-reverse ${theme.bg}`}>


            {/* Menu FAB */}
            {!isSidebarOpen && (
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="fixed bottom-6 right-6 z-40 p-4 rounded-2xl bg-gradient-to-br from-red-600 to-amber-500 text-white shadow-2xl shadow-red-500/30 transition-transform hover:scale-110 active:scale-95 flex items-center justify-center border border-white/20"
                    title="Buka Menu"
                >
                    <Menu size={26} strokeWidth={2.5} />
                </button>
            )}

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
            )}

            {/* Sidebar / Header */}
            <aside className={`fixed inset-y-0 right-0 z-50 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:border-l backdrop-blur-3xl shadow-2xl transition-all duration-200 overflow-hidden ${isSidebarOpen ? 'w-full lg:w-[380px] translate-x-0 opacity-100' : 'w-full lg:w-0 translate-x-full lg:translate-x-0 opacity-0 lg:border-none'} ${isDarkMode ? 'bg-neutral-950/90 border-neutral-800/50' : 'bg-white/95 border-neutral-200'}`}>
                <div className="w-[100vw] lg:w-[380px] p-5 sm:p-6 lg:p-8 flex flex-col min-h-full scrollbar-hidden overflow-y-auto">
                    {/* Brand & Theme */}
                    <div className="flex items-center justify-between mb-8 sm:mb-10">
                        <div>
                            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] text-neutral-400 dark:text-neutral-500 mb-1 block">Logbook Navigation</span>
                            <span className={`text-xl sm:text-2xl font-black uppercase tracking-tight drop-shadow-sm transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-neutral-800'}`}>Menu Utama</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={toggleDarkMode} className={`p-3 rounded-[1.25rem] transition-all duration-300 hover:scale-110 active:scale-95 ${isDarkMode ? 'bg-neutral-800/80 border border-neutral-700/50 text-yellow-400 shadow-lg shadow-yellow-500/5' : 'bg-neutral-100 border border-neutral-200 text-neutral-600 shadow-sm'}`}>
                                {isDarkMode ? <Sun size={20} strokeWidth={2.5} /> : <Moon size={20} strokeWidth={2.5} />}
                            </button>
                            <button onClick={() => setIsSidebarOpen(false)} className={`p-3 rounded-[1.25rem] transition-all duration-300 hover:scale-110 active:scale-95 ${isDarkMode ? 'bg-red-900/30 border border-red-800/30 text-red-400 hover:bg-red-900/50' : 'bg-red-50 border border-red-100 text-red-600'}`}>
                                <X size={20} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>

                    {/* Navigation / Search Controls */}
                    <div className="flex flex-col mb-5 sm:mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -tranneutral-y-1/2 text-neutral-400" size={16} />
                            <input type="text" placeholder="Temukan Arc/Saga..." className={`w-full rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-amber-500 transition-all outline-none ${theme.input}`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                    </div>

                    {/* Compact Stats Section / Poster Export */}
                    <div id="stats-poster" className={`transition-all duration-300 ${isExporting ? 'p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-950 shadow-2xl min-w-[360px]' : ''}`}>

                        {/* Judul & Pangkat Khusus untuk Hasil Export Poster */}
                        {isExporting && (
                            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-neutral-200 dark:border-neutral-800">
                                <img src="/mugiwara-logo.png" className="w-12 h-12 object-contain drop-shadow-sm" alt="Logo" />
                                <div className="flex-1">
                                    <h3 className="text-[18px] font-black uppercase tracking-tight bg-gradient-to-r from-red-600 to-amber-500 text-transparent bg-clip-text leading-none pb-1">OP Tracker</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${isDarkMode ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-200 text-neutral-500'}`}>Pangkat</span>
                                        <span className={`text-[11px] font-black uppercase tracking-widest pt-0.5 ${gamerRank.color}`}>{gamerRank.title}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-2.5 mb-2">
                            {/* Canon Stats */}
                            <div className={`p-3 sm:p-3.5 rounded-[1.25rem] border transition-all hover:scale-[1.02] shadow-sm ${isDarkMode ? 'bg-red-950/20 border-red-500/20 shadow-red-500/5' : 'bg-red-50/80 border-red-100 shadow-red-500/5'}`}>
                                <div className="flex items-center gap-3 mb-2 sm:mb-2.5">
                                    <div className={`p-1.5 sm:p-2 rounded-xl shrink-0 ${isDarkMode ? 'bg-red-900/40 text-red-400' : 'bg-red-100 text-red-600'}`}>
                                        <Trophy size={14} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-wrap items-center justify-between gap-y-0.5 gap-x-2">
                                        <h4 className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider leading-tight ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
                                            Cerita Utama
                                        </h4>
                                        <div className="flex flex-col items-end shrink-0 ml-auto">
                                            <span className={`text-[13px] sm:text-sm font-black leading-none ${isDarkMode ? 'text-red-500' : 'text-red-700'}`}>{stats.canonPercent}%</span>
                                            <span className={`text-[8px] font-bold tracking-widest uppercase mt-1 ${isDarkMode ? 'text-red-500/80' : 'text-red-700/60'}`}>{stats.canonWatched} / {stats.canonTotal} Ep</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-red-950/50 shadow-inner border border-red-900/30' : 'bg-red-200/50'}`}>
                                    <div className="h-full rounded-full bg-gradient-to-r from-red-400 to-red-600 transition-all duration-1000" style={{ width: `${stats.canonPercent}%` }} />
                                </div>
                            </div>

                            {/* Saga Stats */}
                            <div className={`p-3 sm:p-3.5 rounded-[1.25rem] border transition-all hover:scale-[1.02] shadow-sm ${isDarkMode ? 'bg-amber-950/20 border-amber-500/20 shadow-amber-500/5' : 'bg-amber-50/80 border-amber-100 shadow-amber-500/5'}`}>
                                <div className="flex items-center gap-3 mb-2 sm:mb-2.5">
                                    <div className={`p-1.5 sm:p-2 rounded-xl shrink-0 ${isDarkMode ? 'bg-amber-900/40 text-amber-400' : 'bg-amber-100 text-amber-600'}`}>
                                        <Compass size={14} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-wrap items-center justify-between gap-y-0.5 gap-x-2">
                                        <h4 className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider leading-tight ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                                            Saga Tamat
                                        </h4>
                                        <div className="flex flex-col items-end shrink-0 ml-auto">
                                            <span className={`text-[13px] sm:text-sm font-black leading-none ${isDarkMode ? 'text-amber-500' : 'text-amber-700'}`}>{stats.sagasPercent}%</span>
                                            <span className={`text-[8px] font-bold tracking-widest uppercase mt-1 ${isDarkMode ? 'text-amber-500/80' : 'text-amber-700/60'}`}>{stats.sagasWatched} / {stats.sagasTotal} Saga</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-amber-950/50 shadow-inner border border-amber-900/30' : 'bg-amber-200/50'}`}>
                                    <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500 transition-all duration-1000" style={{ width: `${stats.sagasPercent}%` }} />
                                </div>
                            </div>

                            {/* Filler Stats */}
                            <div className={`p-3 sm:p-3.5 rounded-[1.25rem] border transition-all hover:scale-[1.02] shadow-sm ${isDarkMode ? 'bg-neutral-800/20 border-neutral-700 shadow-black/10' : 'bg-neutral-50 border-neutral-200 shadow-neutral-500/5'}`}>
                                <div className="flex items-center gap-3 mb-2 sm:mb-2.5">
                                    <div className={`p-1.5 sm:p-2 rounded-xl shrink-0 ${isDarkMode ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-200 text-neutral-500'}`}>
                                        <Skull size={14} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-wrap items-center justify-between gap-y-0.5 gap-x-2">
                                        <h4 className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider leading-tight ${isDarkMode ? 'text-neutral-400' : 'text-neutral-700'}`}>
                                            Filler Tontonan
                                        </h4>
                                        <div className="flex flex-col items-end shrink-0 ml-auto">
                                            <span className={`text-[13px] sm:text-sm font-black leading-none ${isDarkMode ? 'text-neutral-400' : 'text-neutral-700'}`}>{stats.fillerPercent}%</span>
                                            <span className={`text-[8px] font-bold tracking-widest uppercase mt-1 ${isDarkMode ? 'text-neutral-500/80' : 'text-neutral-600/60'}`}>{stats.fillerWatched} / {stats.fillerTotal} Ep</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-neutral-900/50 shadow-inner border border-neutral-800/30' : 'bg-neutral-200/60'}`}>
                                    <div className="h-full rounded-full bg-neutral-400 transition-all duration-1000" style={{ width: `${stats.fillerPercent}%` }} />
                                </div>
                            </div>

                            {/* Movie Stats */}
                            <div className={`p-3 sm:p-3.5 rounded-[1.25rem] border transition-all hover:scale-[1.02] shadow-sm ${isDarkMode ? 'bg-indigo-950/20 border-indigo-500/20 shadow-indigo-500/5' : 'bg-indigo-50/80 border-indigo-100 shadow-indigo-500/5'}`}>
                                <div className="flex items-center gap-3 mb-2 sm:mb-2.5">
                                    <div className={`p-1.5 sm:p-2 rounded-xl shrink-0 ${isDarkMode ? 'bg-indigo-900/40 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                                        <Film size={14} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-wrap items-center justify-between gap-y-0.5 gap-x-2">
                                        <h4 className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider leading-tight ${isDarkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>
                                            Film Layar Lebar
                                        </h4>
                                        <div className="flex flex-col items-end shrink-0 ml-auto">
                                            <span className={`text-[13px] sm:text-sm font-black leading-none ${isDarkMode ? 'text-indigo-500' : 'text-indigo-700'}`}>{stats.moviePercent}%</span>
                                            <span className={`text-[8px] font-bold tracking-widest uppercase mt-1 ${isDarkMode ? 'text-indigo-500/80' : 'text-indigo-700/60'}`}>{stats.movieWatched} / {stats.movieTotal} Film</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-indigo-950/50 shadow-inner border border-indigo-900/30' : 'bg-indigo-200/50'}`}>
                                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600 transition-all duration-1000" style={{ width: `${stats.moviePercent}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button onClick={exportImage} disabled={isExporting} className="mt-1 mb-4 w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-gradient-to-r from-orange-500/10 to-red-500/10 hover:from-orange-500/20 hover:to-red-500/20 text-orange-600 dark:text-orange-500 transition-all font-black text-[11px] uppercase tracking-widest border border-orange-500/20 hover:border-orange-500/40 hover:scale-[1.02] active:scale-95 shadow-sm">
                        {isExporting ? (
                            <div className="w-4 h-4 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                        ) : (
                            <><Camera size={18} strokeWidth={2.5} /> Pamer Hasil!</>
                        )}
                    </button>

                    {/* Compact Sync & Backup Card */}
                    <div className="mt-auto pt-4 pb-2">
                        <div className={`p-4 rounded-[1.75rem] border transition-all relative overflow-hidden group ${isDarkMode ? 'bg-neutral-900/40 border-neutral-800/50 backdrop-blur-xl shadow-lg' : 'bg-white border-neutral-100 shadow-xl shadow-neutral-200/30'}`}>
                            {/* Decorative background element */}
                            <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all duration-700" />

                            <div className="flex flex-col gap-2.5 relative z-10">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 block ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>Unit Perangkat</span>
                                        <div className="flex items-center gap-2">
                                            <div className={`p-1.5 rounded-lg scale-90 ${isDarkMode ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-50 text-amber-600'}`}>
                                                <Compass size={14} strokeWidth={2.5} />
                                            </div>
                                            <span className={`text-sm font-black uppercase tracking-tight truncate ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{deviceInfo.os}</span>
                                        </div>
                                    </div>
                                    <div className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all ${isDarkMode ? 'bg-neutral-800/50 border-neutral-700/50 text-green-500' : 'bg-green-50 border-green-100 text-green-600'}`}>
                                        <div className={`w-1 h-1 rounded-full animate-pulse ${isDarkMode ? 'bg-green-500' : 'bg-green-600'}`} />
                                        <span className="text-[7px] font-black uppercase tracking-widest">Live Sync</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={exportProgress} className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all hover:scale-[1.03] active:scale-95 shadow-sm border ${isDarkMode ? 'bg-neutral-800 border-neutral-700 text-amber-500 hover:bg-neutral-700' : 'bg-neutral-50 border-neutral-200 text-amber-700 hover:bg-neutral-100'}`}>
                                        <Download size={13} strokeWidth={3} />
                                        <span className="text-[9px] font-black uppercase tracking-widest pt-0.5">Export</span>
                                    </button>
                                    <label className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all hover:scale-[1.03] active:scale-95 shadow-sm border cursor-pointer ${isDarkMode ? 'bg-neutral-800 border-neutral-700 text-amber-500 hover:bg-neutral-700' : 'bg-neutral-50 border-neutral-200 text-amber-700 hover:bg-neutral-100'}`}>
                                        <Upload size={13} strokeWidth={3} />
                                        <span className="text-[9px] font-black uppercase tracking-widest pt-0.5">Import</span>
                                        <input type="file" className="hidden" accept=".json" onChange={(e) => { importProgress(e); setIsSidebarOpen(false); }} />
                                    </label>
                                </div>

                                <button onClick={requestNotification} disabled={notificationsEnabled} className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-sm border ${notificationsEnabled ? (isDarkMode ? 'bg-green-900/20 border-green-800/50 text-green-500 opacity-80' : 'bg-green-50 border-green-200 text-green-600 opacity-80') : (isDarkMode ? 'bg-neutral-800 border-neutral-700 text-blue-400 hover:bg-neutral-700' : 'bg-neutral-50 border-neutral-200 text-blue-600 hover:bg-neutral-100')}`}>
                                    <Bell size={13} strokeWidth={3} className={notificationsEnabled ? "" : "animate-pulse"} />
                                    <span className="text-[9px] font-black uppercase tracking-widest pt-0.5">{notificationsEnabled ? "Notifikasi Aktif" : "Aktifkan Notifikasi"}</span>
                                </button>

                                <div className="text-center">
                                    <p className={`text-[8px] font-bold uppercase ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'} leading-relaxed tracking-wider opacity-80`}>
                                        Tersimpan di browser {deviceInfo.device}. <br /> Cadangkan berkala untuk keamanan.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-5xl mx-auto px-4 lg:px-10 pb-10 relative">
                <div className={`sticky -top-0.5 z-40 pt-2 sm:pt-4 pb-2 sm:pb-4 -mx-4 px-4 lg:-mx-10 lg:px-10 transition-all duration-300 backdrop-blur-xl ${isDarkMode ? 'bg-neutral-950/75' : 'bg-neutral-50/50'}`}>
                    <div className="flex flex-col gap-2 sm:gap-4">
                        {/* Header Row 1: Brand & Switcher */}
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                                <img src="/mugiwara-logo.png" alt="Logo" className="w-8 h-8 sm:w-12 sm:h-12 object-contain drop-shadow-sm shrink-0" />
                                <div className="min-w-0">
                                    <h2 className={`text-xs sm:text-lg lg:text-3xl font-black uppercase tracking-tight bg-gradient-to-r from-red-600 to-amber-500 text-transparent bg-clip-text leading-none truncate`}>
                                        {activeTab === 'episodes' ? 'OP Tracker' : 'Movie Archive'}
                                    </h2>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className={`text-[8px] sm:text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'} shrink-0 hidden sm:block`}>
                                            Pantau Jejak Petualanganmu
                                        </span>
                                        <div className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700 shrink-0 hidden sm:block"></div>
                                        <span className={`text-[7px] sm:text-[10px] font-black uppercase tracking-widest px-1 py-0.5 rounded border ${isDarkMode ? 'bg-neutral-800 border-neutral-700 text-neutral-400' : 'bg-neutral-100 border-neutral-200 text-neutral-500'} shrink-0`}>Rank</span>
                                        <span className={`text-[7px] sm:text-[10px] font-black uppercase tracking-widest pt-0.5 truncate ${gamerRank.color}`}>{gamerRank.title}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Compact Tab Switcher */}
                                <div className={`flex p-0.5 rounded-lg border transition-all ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-neutral-200/50 border-neutral-300'}`}>
                                    <button onClick={() => setActiveTab('episodes')} className={`px-2 py-1 text-[9px] sm:text-xs font-bold uppercase rounded-md transition-all ${activeTab === 'episodes' ? (isDarkMode ? 'bg-neutral-800 text-red-500 shadow-lg' : 'bg-white text-red-600 shadow-sm') : 'opacity-50 text-neutral-500'}`}>Saga</button>
                                    <button onClick={() => setActiveTab('movies')} className={`px-2 py-1 text-[9px] sm:text-xs font-bold uppercase rounded-md transition-all ${activeTab === 'movies' ? (isDarkMode ? 'bg-neutral-800 text-indigo-400 shadow-lg' : 'bg-white text-indigo-600 shadow-sm') : 'opacity-50 text-neutral-500'}`}>Movie</button>
                                </div>

                                {activeTab === 'episodes' && (
                                    <div className={`hidden sm:flex p-0.5 rounded-xl border transition-all ${isDarkMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-neutral-100 border-neutral-200 shadow-inner'}`}>
                                        <button onClick={() => setSagaViewMode('list')} className={`p-1.5 rounded-lg transition-all ${sagaViewMode === 'list' ? 'bg-gradient-to-br from-red-600 to-amber-600 text-white shadow-md' : 'text-neutral-500 opacity-60 hover:opacity-100 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'}`}><List size={16} /></button>
                                        <button onClick={() => setSagaViewMode('card')} className={`p-1.5 rounded-lg transition-all ${sagaViewMode === 'card' ? 'bg-gradient-to-br from-red-600 to-amber-600 text-white shadow-md' : 'text-neutral-500 opacity-60 hover:opacity-100 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'}`}><LayoutGrid size={16} /></button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Header Row 2: Search & Quick Actions */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                                <input type="text" placeholder="Cari Judul, Arc, Episode..." className={`w-full rounded-xl py-2.5 sm:py-2.5 pl-9 pr-4 text-[12px] sm:text-sm transition-all outline-none focus:ring-2 focus:ring-amber-500 shadow-none border ${isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900 shadow-sm'}`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-red-500 transition-colors"><X size={14} strokeWidth={3} /></button>
                                )}
                            </div>

                            <div className="flex items-center gap-2 pb-1 sm:pb-0">
                                {activeTab === 'episodes' && (
                                    <>
                                        <button onClick={() => setShowFiller(!showFiller)} title="Sembunyikan Filler" className={`flex-1 sm:flex-none px-2 py-2 rounded-xl border transition-all active:scale-95 flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap ${!showFiller ? 'bg-gradient-to-r from-red-600 to-rose-600 border-rose-500 text-white shadow-lg shadow-red-500/20' : theme.buttonInactive}`}>
                                            <CircleMinus size={14} strokeWidth={2.5} />
                                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tight sm:tracking-widest"><span className="hidden sm:inline">Tanpa </span>Filler</span>
                                        </button>
                                        <button onClick={() => setHideWatched(!hideWatched)} title="Sembunyikan Selesai" className={`flex-1 sm:flex-none px-2 py-2 rounded-xl border transition-all active:scale-95 flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap ${hideWatched ? 'bg-gradient-to-r from-emerald-600 to-green-600 border-green-500 text-white shadow-lg shadow-green-500/20' : theme.buttonInactive}`}>
                                            <CheckCircle2 size={14} strokeWidth={2.5} />
                                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tight sm:tracking-widest"><span className="hidden sm:inline">Sembunyikan </span>Selesai</span>
                                        </button>
                                        <button onClick={continueWatching} title="Lanjutkan Menonton" className="flex-1 sm:flex-none px-2 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white border border-rose-400/20 active:scale-95 transition-all shadow-xl shadow-red-500/20 flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap">
                                            <Play size={14} fill="currentColor" strokeWidth={2.5} />
                                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tight sm:tracking-widest">Lanjut</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pb-10 pt-4 sm:pt-6">

                    {activeTab === 'episodes' ? (
                        filteredEps.length === 0 ? (
                            <div className="text-center py-20 px-4">
                                <Ship size={64} className="mx-auto mb-4 text-neutral-400 dark:text-neutral-600 opacity-50" />
                                <h3 className="text-xl font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">Pencarian Tidak Ditemukan</h3>
                                <p className="text-sm font-medium text-neutral-400 dark:text-neutral-500 max-w-sm mx-auto">Coba gunakan kata kunci lain, atau hapus filter untuk melihat daftar episode lainnya.</p>
                                <button onClick={() => { setSearchQuery(''); setShowFiller(true); setHideWatched(false); }} className="mt-8 px-8 py-3 rounded-2xl bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 font-bold uppercase tracking-widest text-xs hover:bg-red-200 transition-colors shadow-sm"> Reset Filter </button>
                            </div>
                        ) : (
                            <div className={sagaViewMode === 'card' ? 'grid grid-cols-1 md:grid-cols-2 gap-4 items-start' : 'space-y-4'}>
                                {filteredEps.map((saga) => (
                                    <section key={saga.id} className={`rounded-[1.25rem] overflow-hidden border transition-all duration-300 ${theme.card} ${sagaViewMode === 'card' && expandedSagas.includes(saga.id) ? 'md:col-span-2' : ''}`}>
                                        <div className={`cursor-pointer ${sagaViewMode === 'card' ? 'p-4 sm:p-5' : 'p-3 sm:px-4'} ${theme.hover}`} onClick={() => toggleSaga(saga.id)}>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0 pr-3">
                                                    <div className={sagaViewMode === 'list' ? 'flex items-center gap-3' : ''}>
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"> Saga </span>
                                                            <span className={`text-[10px] font-bold ${theme.muted} ${sagaViewMode === 'list' ? 'hidden sm:inline' : ''}`}> {getSagaRange(saga)} </span>
                                                        </div>
                                                        <h2 className={`${sagaViewMode === 'card' ? 'text-lg sm:text-xl' : 'text-[15px] sm:text-base'} font-black truncate`}>{saga.title}</h2>
                                                        {sagaViewMode === 'card' && <p className={`text-[11px] font-medium leading-relaxed mt-1 line-clamp-2 ${theme.muted}`}> {saga.description} </p>}
                                                    </div>
                                                </div>

                                                {/* Expand Toggle */}
                                                <div className={`p-1.5 rounded-xl shrink-0 mt-0.5 ${isDarkMode ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                                                    {expandedSagas.includes(saga.id) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                </div>
                                            </div>

                                            {/* Saga Progress Bar */}
                                            {(() => {
                                                const progress = getSagaProgress(saga);
                                                const finished = progress.count === progress.total;
                                                return (
                                                    <div className={`flex items-center gap-3 ${sagaViewMode === 'card' ? 'mt-4 pt-4 border-t' : 'mt-2 pl-0 sm:pl-[72px]'} ${theme.border}`}>
                                                        <button onClick={(e) => toggleSagaComplete(saga, e)} className={`flex-shrink-0 transition-all hover:scale-110 active:scale-95 ${finished ? 'text-green-500' : 'text-neutral-300'}`}>
                                                            {finished ? <CheckCircle2 size={24} className="text-green-500 dark:bg-transparent rounded-full" /> : <Circle size={24} />}
                                                        </button>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between text-[9px] font-bold mb-1">
                                                                <span className={theme.muted}>{progress.percent}% Selesai SAGA Ini</span>
                                                                <span className={theme.muted}>{progress.count} / {progress.total} Misi</span>
                                                            </div>
                                                            <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-neutral-800' : 'bg-neutral-200'}`}>
                                                                <div className="h-full bg-gradient-to-r from-red-500 to-amber-500 transition-all duration-1000" style={{ width: `${progress.percent}%` }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>

                                        <AnimatePresence initial={false}>
                                            {expandedSagas.includes(saga.id) && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                    className={`border-t overflow-hidden ${theme.border}`}
                                                >
                                                    {saga.arcs.map((arc, arcIdx) => {
                                                        const finished = isArcFinished(arc);
                                                        const progress = getArcProgress(arc);
                                                        const isExpanded = expandedArcs.includes(arc.id);

                                                        return (
                                                            <div key={arc.id} className={`group ${arcIdx < saga.arcs.length - 1 ? `border-b ${theme.border}` : ''}`} ref={el => { arcRefs.current[arc.id] = el }}>
                                                                <div className={`flex items-center py-2.5 px-3 sm:py-3 sm:px-4 transition-colors cursor-pointer ${theme.hover}`} onClick={() => toggleArcDropdown(arc.id)}>
                                                                    <button onClick={(e) => toggleArcComplete(arc, e)} className={`flex-shrink-0 mr-3 sm:mr-3.5 transition-all hover:scale-110 active:scale-95 ${finished ? 'text-green-500' : 'text-neutral-300'}`}>
                                                                        {finished ? <CheckCircle2 size={22} className="text-green-500" /> : <Circle size={22} />}
                                                                    </button>

                                                                    <div className="flex-1 min-w-0 pr-3 sm:pr-4">
                                                                        <h4 className={`font-bold truncate text-sm sm:text-[15px] ${finished ? 'line-through text-neutral-400 decoration-green-500/80 decoration-2' : ''}`}> {arc.title} </h4>
                                                                        <div className={`flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-0.5 text-[9.5px] font-bold ${theme.muted}`}>
                                                                            <span className="whitespace-nowrap">Ep {arc.start} - {arc.end}</span>
                                                                            <div className="flex items-center gap-1.5 w-full sm:w-auto">
                                                                                <div className="flex-1 sm:w-16 sm:flex-none h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                                                                                    <div className="h-full bg-red-500" style={{ width: `${(progress.count / progress.total) * 100}%` }} />
                                                                                </div>
                                                                                <span className="whitespace-nowrap">{progress.count} / {progress.total}</span>
                                                                            </div>
                                                                            <span className={`px-1 py-0.5 rounded text-[8px] uppercase tracking-tighter ${arc.type === 'Filler' ? 'bg-neutral-100 dark:bg-neutral-900/40 dark:text-neutral-400' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600'} whitespace-nowrap`}> {arc.type} </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className={`p-1 flex-shrink-0 rounded-lg transition-all ${isExpanded ? 'bg-red-500 text-white shadow-md' : theme.muted}`}>
                                                                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                                    </div>
                                                                </div>

                                                                <AnimatePresence initial={false}>
                                                                    {isExpanded && (
                                                                        <motion.div
                                                                            initial={{ height: 0, opacity: 0 }}
                                                                            animate={{ height: 'auto', opacity: 1 }}
                                                                            exit={{ height: 0, opacity: 0 }}
                                                                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                                                                            className={`border-t overflow-hidden ${theme.border} ${theme.dropdownBg}`}
                                                                        >
                                                                            <div className="max-h-[300px] sm:max-h-[400px] overflow-y-auto custom-scrollbar pt-1 pb-2">
                                                                                {Array.from({ length: arc.end - arc.start + 1 }, (_, i) => {
                                                                                    const epNum = arc.start + i;
                                                                                    const isWatched = watchedEpisodes.includes(`ep-${epNum}`);
                                                                                    const isLastEp = i === (arc.end - arc.start);
                                                                                    const epTitle = getEpisodeTitle(epNum).toLowerCase();
                                                                                    const q = searchQuery.toLowerCase().trim();

                                                                                    // Filter episodes by query if active
                                                                                    if (q && !epNum.toString().includes(q) && !epTitle.includes(q)) {
                                                                                        return null;
                                                                                    }

                                                                                    return (
                                                                                        <div key={epNum} className={`flex items-center gap-2 sm:gap-4 py-2.5 sm:py-3 px-3 sm:px-5 transition-all group/ep ${isWatched ? 'bg-green-500/5 opacity-90' : ''} ${!isLastEp ? `border-b border-dashed ${isDarkMode ? 'border-neutral-800' : 'border-neutral-200'}` : ''}`}>
                                                                                            <div className="flex items-center flex-1 min-w-0 gap-2 sm:gap-3">
                                                                                                <button onClick={() => toggleEpisode(epNum)} className={`flex-shrink-0 transition-all ${isWatched ? 'text-green-500' : theme.muted}`}>
                                                                                                    {isWatched ? <CheckCircle2 size={20} className="text-green-500 dark:bg-transparent rounded-full" /> : <Circle size={20} />}
                                                                                                </button>
                                                                                                <div className={`flex items-center justify-center px-1.5 sm:px-2 min-w-[30px] sm:min-w-[34px] h-[20px] sm:h-[22px] rounded-md border shadow-sm ${isWatched ? 'bg-green-50 border-green-200 text-green-600 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400' : 'bg-white border-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400'} font-black text-[9px] sm:text-[10px] tracking-tight`}>
                                                                                                    {epNum}
                                                                                                </div>
                                                                                                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleEpisode(epNum)}>
                                                                                                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                                                                                        <h5 className={`text-xs sm:text-[13px] font-bold leading-tight line-clamp-2 sm:line-clamp-none ${isWatched ? 'line-through decoration-green-500/80 decoration-[2px] text-neutral-400' : ''}`}>
                                                                                                            {getEpisodeTitle(epNum)}
                                                                                                        </h5>
                                                                                                        {arc.type === 'Mixed' && (
                                                                                                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest shrink-0 ${isFillerEpisode(epNum)
                                                                                                                ? 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
                                                                                                                : 'bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-400'}`}>
                                                                                                                {isFillerEpisode(epNum) ? 'Filler' : 'Canon'}
                                                                                                            </span>
                                                                                                        )}
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <a href={getBilibiliUrl(epNum)} target="_blank" rel="noopener noreferrer" className={`flex-shrink-0 flex items-center justify-center p-2 sm:px-3 sm:py-1.5 rounded-lg text-[10px] font-black uppercase transition-all border ${isDarkMode ? 'bg-neutral-900 border-red-900/50 text-red-400 hover:bg-neutral-800' : 'bg-white border-neutral-200 text-red-600 hover:bg-red-50 shadow-sm'} h-8 sm:h-auto`}>
                                                                                                <Play size={12} fill="currentColor" className="sm:mr-1" />
                                                                                                <span className="hidden sm:inline">Nonton</span>
                                                                                                <span className="hidden lg:inline ml-1">di Bilibili</span>
                                                                                                <ExternalLink size={10} className="hidden sm:inline ml-1.5" />
                                                                                            </a>
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>
                                                        );
                                                    })}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </section>
                                ))}
                            </div>
                        )
                    ) : (
                        filteredMovies.length === 0 ? (
                            <div className="text-center py-20 px-4">
                                <Film size={64} className="mx-auto mb-4 text-neutral-400 dark:text-neutral-600 opacity-50" />
                                <h3 className="text-xl font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">Film Tidak Ditemukan</h3>
                                <p className="text-sm font-medium text-neutral-400 dark:text-neutral-500 max-w-sm mx-auto">Tidak ada judul film layar lebar yang cocok dengan pencarian Anda.</p>
                                <button onClick={() => setSearchQuery('')} className="mt-8 px-8 py-3 rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 font-bold uppercase tracking-widest text-xs hover:bg-indigo-200 transition-colors shadow-sm"> Reset Pencarian </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {filteredMovies.map((movie) => (
                                    <div key={movie.id} className={`p-4 rounded-3xl border transition-all flex items-center justify-between group ${watchedMovies.includes(movie.id) ? 'border-green-500 bg-green-500/5' : `${theme.card} ${theme.hover}`}`}>
                                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 pr-2 cursor-pointer" onClick={() => toggleMovie(movie.id)}>
                                            <div className={`p-3 rounded-2xl flex-shrink-0 ${watchedMovies.includes(movie.id) ? 'bg-green-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'}`}>
                                                <Film size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`font-bold truncate text-sm sm:text-base ${watchedMovies.includes(movie.id) ? 'text-green-600 dark:text-green-400' : ''}`}> {movie.title} </h4>
                                                <p className={`text-[10px] font-bold truncate ${theme.muted}`}> {movie.year} {movie.recommended && '• Rekomendasi'} </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <a href={`https://www.bilibili.tv/id/search-result?q=One+Piece+${movie.title.replace(' ', '+')}`} target="_blank" rel="noopener noreferrer" className={`p-2 rounded-xl text-red-600 dark:text-red-400`}> <ExternalLink size={16} /></a>
                                            <div className={watchedMovies.includes(movie.id) ? 'text-green-500' : 'text-neutral-300'} onClick={() => toggleMovie(movie.id)}>
                                                {watchedMovies.includes(movie.id) ? <CheckCircle2 size={24} className="text-green-500" /> : <Circle size={24} />}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    <div className="mt-12 flex flex-col items-center gap-4 border-t border-neutral-200 dark:border-neutral-800 pt-8">
                        <button onClick={resetProgress} className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-500 transition-all active:scale-95">
                            <Trash2 size={14} /> Reset Seluruh Log Progres
                        </button>
                        <p className="text-[10px] font-bold opacity-30 text-center">Data ini hanya ada di browser {deviceInfo.device} ini. <br /> Simpan file jika ingin pindah perangkat.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
