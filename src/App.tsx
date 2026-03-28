import React, { useState, useEffect, useMemo, useRef } from 'react';
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
    Share2,
    Trash2,
    ExternalLink,
    Menu,
    X,
    LayoutGrid,
    List,
    Download,
    Upload
} from 'lucide-react';

// --- Konfigurasi & Data ---
const appId = 'one-piece-tracker-v4';

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

export default function App() {
    const [watchedEpisodes, setWatchedEpisodes] = useState<string[]>([]);
    const [watchedMovies, setWatchedMovies] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState('episodes');
    const [showFiller] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [sagaViewMode, setSagaViewMode] = useState<'card' | 'list'>('card');

    const [expandedSagas, setExpandedSagas] = useState<string[]>([]);
    const [expandedArcs, setExpandedArcs] = useState<string[]>([]);

    const [loading, setLoading] = useState(true);
    const [copyFeedback, setCopyFeedback] = useState(false);

    const arcRefs = useRef<any>({});

    // --- Data Persistence using LocalStorage ---
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

    const shareProgress = () => {
        const text = `Progres One Piece-ku: ${stats.canonPercent}% Tamat (Canon). Lacak progresmu di Grand Line Tracker!`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
            setCopyFeedback(true);
            setTimeout(() => setCopyFeedback(false), 2000);
        }
    };

    const getEpisodeTitle = (num: number | string) => {
        const epData = (EPISODE_DB as any)[num];
        return epData?.title || `Episode ${num}: Petualangan Menuju One Piece`;
    };

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

    const filteredEps = useMemo(() => {
        return SAGA_DATA.map(saga => ({
            ...saga,
            arcs: saga.arcs.filter(arc => {
                const matchesSearch = arc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    saga.title.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesFiller = showFiller || (arc.type !== 'Filler' && arc.type !== 'Special/Crossover');
                return matchesSearch && matchesFiller;
            })
        })).filter(saga => saga.arcs.length > 0);
    }, [searchQuery, showFiller]);

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

    const theme = {
        bg: isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900',
        header: isDarkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200',
        card: isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm',
        hover: isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-100/50',
        input: isDarkMode ? 'bg-slate-800 text-slate-100 placeholder:text-slate-500' : 'bg-white text-slate-900 placeholder:text-slate-400 border-slate-200 border',
        muted: isDarkMode ? 'text-slate-400' : 'text-slate-500',
        border: isDarkMode ? 'border-slate-700/60' : 'border-slate-200',
        dropdownBg: isDarkMode ? 'bg-slate-950/50' : 'bg-slate-50',
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
                <div className="flex flex-col items-center gap-4 text-red-600 animate-pulse">
                    <Ship size={64} className="animate-bounce" />
                    <p className="font-bold text-xl uppercase tracking-widest text-center bg-gradient-to-r from-red-600 to-amber-500 text-transparent bg-clip-text">Menyiapkan Logbook...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen font-sans selection:bg-amber-500/30 transition-colors duration-500 flex flex-col lg:flex-row-reverse ${theme.bg}`}>


            {/* Mobile Menu FAB */}
            {!isSidebarOpen && (
                <button 
                    onClick={() => setIsSidebarOpen(true)} 
                    className="lg:hidden fixed bottom-6 right-6 z-40 p-4 rounded-2xl bg-gradient-to-br from-red-600 to-amber-500 text-white shadow-2xl shadow-red-500/30 transition-transform hover:scale-110 active:scale-95 flex items-center justify-center border border-white/20"
                    title="Menu Utama"
                >
                    <Menu size={26} strokeWidth={2.5} />
                </button>
            )}

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
            )}

            {/* Sidebar / Header */}
            <aside className={`fixed inset-y-0 right-0 z-50 w-full lg:w-[360px] lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:border-l backdrop-blur-2xl shadow-2xl transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 overflow-y-auto ${theme.header}`}>
                <div className="p-4 sm:p-5 lg:p-6 flex flex-col min-h-full">
                    {/* Brand & Theme */}
                    <div className="flex items-center justify-between mb-5 sm:mb-6">
                        <div>
                            <span className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-100">Menu Utama</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={toggleDarkMode} className={`p-2.5 rounded-2xl transition-all ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-yellow-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
                                {isDarkMode ? <Sun size={20} strokeWidth={2.5} /> : <Moon size={20} strokeWidth={2.5} />}
                            </button>
                            <button onClick={() => setIsSidebarOpen(false)} className={`lg:hidden p-2.5 rounded-2xl transition-all ${isDarkMode ? 'bg-red-900/40 text-red-400 hover:bg-red-900/60' : 'bg-red-100 hover:bg-red-200 text-red-600'}`}>
                                <X size={20} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>

                    {/* Navigation / Search Controls */}
                    <div className="flex flex-col gap-2.5 mb-5 sm:mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input type="text" placeholder="Temukan Arc/Saga..." className={`w-full rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-amber-500 transition-all outline-none ${theme.input}`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                        <button onClick={() => { continueWatching(); setIsSidebarOpen(false); }} className="bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold active:scale-95 transition-all shadow-lg shadow-red-500/20 w-full shrink-0">
                            <Ship size={18} className="shrink-0" />
                            <span className="truncate">Lanjut Petualangan!</span>
                        </button>
                    </div>

                    {/* Compact Stats Section */}
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
                        <div className={`p-3 sm:p-3.5 rounded-[1.25rem] border transition-all hover:scale-[1.02] shadow-sm ${isDarkMode ? 'bg-slate-800/20 border-slate-700 shadow-black/10' : 'bg-slate-50 border-slate-200 shadow-slate-500/5'}`}>
                            <div className="flex items-center gap-3 mb-2 sm:mb-2.5">
                                <div className={`p-1.5 sm:p-2 rounded-xl shrink-0 ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>
                                    <Skull size={14} strokeWidth={2.5} />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-wrap items-center justify-between gap-y-0.5 gap-x-2">
                                    <h4 className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider leading-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>
                                        Filler Tontonan
                                    </h4>
                                    <div className="flex flex-col items-end shrink-0 ml-auto">
                                        <span className={`text-[13px] sm:text-sm font-black leading-none ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>{stats.fillerPercent}%</span>
                                        <span className={`text-[8px] font-bold tracking-widest uppercase mt-1 ${isDarkMode ? 'text-slate-500/80' : 'text-slate-600/60'}`}>{stats.fillerWatched} / {stats.fillerTotal} Ep</span>
                                    </div>
                                </div>
                            </div>
                            <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-900/50 shadow-inner border border-slate-800/30' : 'bg-slate-200/60'}`}>
                                <div className="h-full rounded-full bg-slate-400 transition-all duration-1000" style={{ width: `${stats.fillerPercent}%` }} />
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

                    {/* Device Persistence Card */}
                    <div className="mt-auto flex flex-col pt-3 sm:pt-4 pb-2 shrink-0">
                        <div className={`p-4 rounded-[1.25rem] border transition-all flex flex-col gap-3.5 ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/50 border-slate-200 shadow-sm'}`}>
                            <div className="flex items-center justify-between gap-2">
                                <span className={`flex-1 min-w-0 flex items-center gap-2.5 text-xs font-black uppercase tracking-[0.15em] ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                    <Compass size={16} className="text-amber-500 shrink-0" strokeWidth={2.5} />
                                    <span className="truncate">{deviceInfo.os}</span>
                                </span>
                                <div className={`flex items-center gap-3 border-l-[1.5px] pl-3 sm:pl-3.5 shrink-0 h-6 ${isDarkMode ? 'border-slate-700/50' : 'border-slate-800'}`}>
                                    <button onClick={exportProgress} title="Cadangkan Data" className={`transition-all hover:scale-110 active:scale-95 ${isDarkMode ? 'text-amber-500 hover:text-amber-400' : 'text-amber-600 hover:text-amber-500'}`}>
                                        <Download size={16} strokeWidth={2.5} />
                                    </button>
                                    <label title="Pulihkan Data" className={`cursor-pointer transition-all hover:scale-110 active:scale-95 ${isDarkMode ? 'text-amber-500 hover:text-amber-400' : 'text-amber-600 hover:text-amber-500'}`}>
                                        <Upload size={16} strokeWidth={2.5} />
                                        <input type="file" className="hidden" accept=".json" onChange={(e) => { importProgress(e); setIsSidebarOpen(false); }} />
                                    </label>
                                </div>
                            </div>
                            <p className="text-[9px] font-black uppercase text-slate-400 leading-relaxed tracking-wider">
                                Data tersimpan otomatis di browser ini. Cadangkan ke .json jika ingin pindah perangkat.
                            </p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-5xl mx-auto px-4 lg:px-10 py-8 pb-32 lg:overflow-y-auto">
                {/* Global Header & Toggles */}
                <div className={`flex flex-col md:flex-row md:items-end justify-between gap-5 lg:gap-4 mb-6 ${sagaViewMode === 'card' && activeTab === 'episodes' ? 'md:col-span-2' : ''}`}>
                    <div className="flex items-center gap-3 lg:gap-4 flex-1 min-w-0">
                        <img src="/mugiwara-logo.png" alt="Mugiwara Logo" className="w-[12vw] max-w-[48px] h-auto lg:max-w-none lg:w-14 lg:h-14 object-contain drop-shadow-sm shrink-0" />
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h2 className="text-[5.5vw] sm:text-2xl lg:text-4xl font-black uppercase tracking-tight bg-gradient-to-r from-red-600 to-amber-500 text-transparent bg-clip-text leading-none pb-0.5 truncate">
                                {activeTab === 'episodes' ? 'One Piece Tracker' : 'Movie Logbook'}
                            </h2>
                            <p className={`text-[2.5vw] sm:text-[10px] lg:text-xs font-bold uppercase tracking-widest ${theme.muted} truncate leading-tight`}>
                                {activeTab === 'episodes' ? 'Catat Jejak Perjalanan Cerita One Piece' : 'Koleksi Film Layar Lebar'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 self-start md:self-end shrink-0 w-full md:w-auto">
                        {/* Type Toggle */}
                        <div className="flex flex-1 md:flex-none p-1 bg-slate-200 dark:bg-slate-800 rounded-lg shadow-inner min-w-0">
                            <button onClick={() => setActiveTab('episodes')} className={`flex-1 md:flex-none px-2 sm:px-4 py-1.5 text-[10px] sm:text-xs font-bold uppercase rounded-md transition-all truncate ${activeTab === 'episodes' ? 'bg-white dark:bg-slate-700 shadow-sm text-red-600' : 'opacity-50 hover:opacity-100 text-slate-500'}`}>
                                SAGA
                            </button>
                            <button onClick={() => setActiveTab('movies')} className={`flex-1 md:flex-none px-2 sm:px-4 py-1.5 text-[10px] sm:text-xs font-bold uppercase rounded-md transition-all truncate ${activeTab === 'movies' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'opacity-50 hover:opacity-100 text-slate-500'}`}>
                                MOVIE
                            </button>
                        </div>

                        {/* Layout Toggle (Saga Only) */}
                        {activeTab === 'episodes' && (
                            <div className="flex p-1 bg-slate-200 dark:bg-slate-800 rounded-lg shadow-inner shrink-0">
                                <button onClick={() => setSagaViewMode('list')} className={`p-1.5 rounded-md transition-all ${sagaViewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-red-600' : 'opacity-50 hover:opacity-100 text-slate-500'}`}>
                                    <List size={16} />
                                </button>
                                <button onClick={() => setSagaViewMode('card')} className={`p-1.5 rounded-md transition-all ${sagaViewMode === 'card' ? 'bg-white dark:bg-slate-700 shadow-sm text-red-600' : 'opacity-50 hover:opacity-100 text-slate-500'}`}>
                                    <LayoutGrid size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {activeTab === 'episodes' ? (
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
                                        <div className={`p-1.5 rounded-xl shrink-0 mt-0.5 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                            {expandedSagas.includes(saga.id) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </div>
                                    </div>

                                    {/* Saga Progress Bar */}
                                    {(() => {
                                        const progress = getSagaProgress(saga);
                                        const finished = progress.count === progress.total;
                                        return (
                                            <div className={`flex items-center gap-3 ${sagaViewMode === 'card' ? 'mt-4 pt-4 border-t' : 'mt-2 pl-0 sm:pl-[72px]'} ${theme.border}`}>
                                                <button onClick={(e) => toggleSagaComplete(saga, e)} className={`flex-shrink-0 transition-all hover:scale-110 active:scale-95 ${finished ? 'text-green-500' : 'text-slate-300'}`}>
                                                    {finished ? <CheckCircle2 size={24} className="text-green-500 bg-white dark:bg-transparent rounded-full" /> : <Circle size={24} />}
                                                </button>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between text-[9px] font-bold mb-1">
                                                        <span className={theme.muted}>{progress.percent}% Selesai SAGA Ini</span>
                                                        <span className={theme.muted}>{progress.count} / {progress.total} Misi</span>
                                                    </div>
                                                    <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                                                        <div className="h-full bg-gradient-to-r from-red-500 to-amber-500 transition-all duration-1000" style={{ width: `${progress.percent}%` }} />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>

                                {expandedSagas.includes(saga.id) && (
                                    <div className={`border-t ${theme.border}`}>
                                        {saga.arcs.map((arc, arcIdx) => {
                                            const finished = isArcFinished(arc);
                                            const progress = getArcProgress(arc);
                                            const isExpanded = expandedArcs.includes(arc.id);

                                            return (
                                                <div key={arc.id} className={`group ${arcIdx < saga.arcs.length - 1 ? `border-b ${theme.border}` : ''}`} ref={el => { arcRefs.current[arc.id] = el }}>
                                                    <div className={`flex items-center py-2.5 px-3 sm:py-3 sm:px-4 transition-colors cursor-pointer ${theme.hover}`} onClick={() => toggleArcDropdown(arc.id)}>
                                                        <button onClick={(e) => toggleArcComplete(arc, e)} className={`flex-shrink-0 mr-3 sm:mr-3.5 transition-all hover:scale-110 active:scale-95 ${finished ? 'text-green-500' : 'text-slate-300'}`}>
                                                            {finished ? <CheckCircle2 size={22} className="text-green-500" /> : <Circle size={22} />}
                                                        </button>

                                                        <div className="flex-1 min-w-0 pr-3 sm:pr-4">
                                                            <h4 className={`font-bold truncate text-sm sm:text-[15px] ${finished ? 'line-through text-slate-400 decoration-green-500/50' : ''}`}> {arc.title} </h4>
                                                            <div className={`flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-0.5 text-[9.5px] font-bold ${theme.muted}`}>
                                                                <span className="whitespace-nowrap">Ep {arc.start} - {arc.end}</span>
                                                                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                                                                    <div className="flex-1 sm:w-16 sm:flex-none h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                                                        <div className="h-full bg-red-500" style={{ width: `${(progress.count / progress.total) * 100}%` }} />
                                                                    </div>
                                                                    <span className="whitespace-nowrap">{progress.count} / {progress.total}</span>
                                                                </div>
                                                                <span className={`px-1 py-0.5 rounded text-[8px] uppercase tracking-tighter ${arc.type === 'Filler' ? 'bg-slate-100 dark:bg-slate-800' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600'} whitespace-nowrap`}> {arc.type} </span>
                                                            </div>
                                                        </div>
                                                        <div className={`p-1 flex-shrink-0 rounded-lg transition-all ${isExpanded ? 'bg-red-500 text-white shadow-md' : theme.muted}`}>
                                                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                        </div>
                                                    </div>

                                                    {isExpanded && (
                                                        <div className={`border-t ${theme.border} ${theme.dropdownBg}`}>
                                                            {Array.from({ length: arc.end - arc.start + 1 }, (_, i) => {
                                                                const epNum = arc.start + i;
                                                                const isWatched = watchedEpisodes.includes(`ep-${epNum}`);
                                                                const isLastEp = i === (arc.end - arc.start);
                                                                return (
                                                                    <div key={epNum} className={`flex items-center gap-2 sm:gap-4 py-2.5 sm:py-3 px-3 sm:px-5 transition-all group/ep ${isWatched ? 'bg-green-500/5 opacity-90' : ''} ${!isLastEp ? `border-b border-dashed ${theme.border}` : ''}`}>
                                                                        <div className="flex items-center flex-1 min-w-0 gap-2 sm:gap-3">
                                                                            <button onClick={() => toggleEpisode(epNum)} className={`flex-shrink-0 transition-all ${isWatched ? 'text-green-500' : theme.muted}`}>
                                                                                {isWatched ? <CheckCircle2 size={20} className="text-green-500 bg-white dark:bg-transparent rounded-full" /> : <Circle size={20} />}
                                                                            </button>
                                                                            <div className={`flex items-center justify-center px-1.5 sm:px-2 min-w-[30px] sm:min-w-[34px] h-[20px] sm:h-[22px] rounded-md border shadow-sm ${isWatched ? 'bg-green-50 border-green-200 text-green-600 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400' : 'bg-white border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'} font-black text-[9px] sm:text-[10px] tracking-tight`}>
                                                                                {epNum}
                                                                            </div>
                                                                            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleEpisode(epNum)}>
                                                                                <h5 className={`text-xs sm:text-[13px] font-bold leading-tight line-clamp-2 sm:line-clamp-none ${isWatched ? 'line-through decoration-green-500/30 text-slate-400' : ''}`}>
                                                                                    {getEpisodeTitle(epNum)}
                                                                                </h5>
                                                                            </div>
                                                                        </div>
                                                                        <a href={getBilibiliUrl(epNum)} target="_blank" rel="noopener noreferrer" className={`flex-shrink-0 flex items-center justify-center p-2 sm:px-3 sm:py-1.5 rounded-lg text-[10px] font-black uppercase transition-all border ${isDarkMode ? 'bg-slate-900 border-red-900/50 text-red-400 hover:bg-red-900/30' : 'bg-white border-slate-200 text-red-600 hover:bg-red-50 shadow-sm'} h-8 sm:h-auto`}>
                                                                            <Play size={12} fill="currentColor" className="sm:mr-1" />
                                                                            <span className="hidden sm:inline">Nonton</span>
                                                                            <span className="hidden lg:inline ml-1">di Bilibili</span>
                                                                            <ExternalLink size={10} className="hidden sm:inline ml-1.5" />
                                                                        </a>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </section>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filteredMovies.map((movie) => (
                            <div key={movie.id} className={`p-4 rounded-3xl border transition-all flex items-center justify-between group ${watchedMovies.includes(movie.id) ? 'border-green-500 bg-green-500/5' : `${theme.card} ${theme.hover}`}`}>
                                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 pr-2 cursor-pointer" onClick={() => toggleMovie(movie.id)}>
                                    <div className={`p-3 rounded-2xl flex-shrink-0 ${watchedMovies.includes(movie.id) ? 'bg-green-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                        <Film size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`font-bold truncate text-sm sm:text-base ${watchedMovies.includes(movie.id) ? 'text-green-600 dark:text-green-400' : ''}`}> {movie.title} </h4>
                                        <p className={`text-[10px] font-bold truncate ${theme.muted}`}> {movie.year} {movie.recommended && '• Rekomendasi'} </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <a href={`https://www.bilibili.tv/id/search-result?q=One+Piece+${movie.title.replace(' ', '+')}`} target="_blank" rel="noopener noreferrer" className={`p-2 rounded-xl text-red-600 dark:text-red-400`}> <ExternalLink size={16} /></a>
                                    <div className={watchedMovies.includes(movie.id) ? 'text-green-500' : 'text-slate-300'} onClick={() => toggleMovie(movie.id)}>
                                        {watchedMovies.includes(movie.id) ? <CheckCircle2 size={24} className="text-green-500" /> : <Circle size={24} />}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-12 flex flex-col items-center gap-4 border-t border-slate-200 dark:border-slate-800 pt-8">
                    <button onClick={resetProgress} className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-500 transition-all active:scale-95">
                        <Trash2 size={14} /> Reset Seluruh Log Progres
                    </button>
                    <p className="text-[10px] font-bold opacity-30 text-center">Data ini hanya ada di browser {deviceInfo.device} ini. <br /> Simpan file jika ingin pindah perangkat.</p>
                </div>
            </main>

            {/* Popups */}
            {copyFeedback && (
                <div className="fixed bottom-10 left-1/2 lg:left-[calc(50%+160px)] -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full text-xs font-bold animate-bounce z-50 shadow-2xl"> Progres disalin! 📋</div>
            )}
        </div>
    );
}
