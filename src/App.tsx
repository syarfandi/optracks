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
    X
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
        description: 'Awal perjalanan Luffy mencari kru pertama: Zoro, Nami, Usopp, dan Sanji.',
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
    const [activeTab] = useState('episodes');
    const [showFiller] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
            moviePercent
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
                <div className="flex flex-col items-center gap-4 text-indigo-600 animate-pulse">
                    <Ship size={64} className="animate-bounce" />
                    <p className="font-bold text-xl uppercase tracking-widest text-center">Menyiapkan Logbook...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen font-sans selection:bg-indigo-500/30 transition-colors duration-500 flex flex-col lg:flex-row-reverse ${theme.bg}`}>
            
            {/* Mobile Header */}
            <div className={`lg:hidden sticky top-0 z-40 flex items-center justify-between p-4 border-b backdrop-blur-md shadow-sm ${theme.header}`}>
                <div className="flex items-center gap-3">
                    <img src="/mugiwara-logo.png" alt="Mugiwara Logo" className="w-8 h-8 object-contain drop-shadow-md" />
                    <div>
                        <h1 className="text-xl font-black tracking-tight uppercase">Grand Line Logbook</h1>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${theme.muted}`}>Catat Jejak Perjalananmu</p>
                    </div>
                </div>
                <button onClick={() => setIsSidebarOpen(true)} className={`p-2 rounded-xl transition-all ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    <Menu size={24} />
                </button>
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
            )}

            {/* Sidebar / Header */}
            <aside className={`fixed inset-y-0 right-0 z-50 w-80 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:border-l backdrop-blur-2xl shadow-2xl transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 overflow-y-auto ${theme.header}`}>
                <div className="p-4 lg:p-8 flex flex-col h-full">
                    {/* Brand & Theme */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="bg-slate-900 p-2 rounded-lg shadow-black/20 shadow-lg border border-slate-700 hidden lg:block">
                                <img src="/mugiwara-logo.png" alt="Mugiwara Logo" className="w-8 h-8 object-contain drop-shadow-md" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black tracking-tight uppercase lg:block hidden">Grand Line Logbook</h1>
                                <p className={`text-[10px] font-bold uppercase tracking-widest ${theme.muted} lg:block hidden`}>Catat Jejak Perjalananmu</p>
                                <span className="lg:hidden text-lg font-black uppercase">Menu Utama</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={toggleDarkMode} className={`p-2 rounded-xl transition-all ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                            <button onClick={() => { setIsSidebarOpen(false); shareProgress(); }} className={`p-2 rounded-xl transition-all ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                <Share2 size={20} />
                            </button>
                            <button onClick={() => setIsSidebarOpen(false)} className={`lg:hidden p-2 rounded-xl transition-all ${isDarkMode ? 'bg-slate-800 text-red-400 hover:bg-slate-700' : 'bg-slate-100 text-red-500 hover:bg-slate-200'}`}>
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Device Persistence Card */}
                    <div className={`p-4 rounded-3xl mb-8 border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-indigo-600/10 p-2 rounded-xl text-indigo-600">
                                <Compass size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Penyimpanan Lokal</p>
                                <h3 className="text-xs font-bold">📍 {deviceInfo.os} ({deviceInfo.device})</h3>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <button onClick={exportProgress} className={`p-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2 transition-all ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'}`}>
                                📥 Cadangkan
                            </button>
                            <label className={`p-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'}`}>
                                📤 Pulihkan
                                <input type="file" className="hidden" accept=".json" onChange={(e) => { importProgress(e); setIsSidebarOpen(false); }} />
                            </label>
                        </div>
                        
                        <p className={`text-[9px] font-bold opacity-40 uppercase tracking-tighter text-center`}>Tidak perlu login. Data tersimpan di web browser Anda.</p>
                    </div>

                    {/* Compact Stats Section */}
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 mb-8">
                        {/* Canon Stats */}
                        <div className={`p-3 rounded-xl border transition-all hover:scale-[1.01] ${isDarkMode ? 'bg-indigo-950/20 border-indigo-500/20' : 'bg-indigo-50/50 border-indigo-100'}`}>
                            <div className="flex items-center justify-between text-[9px] font-black uppercase mb-1.5">
                                <span className="text-indigo-600 flex items-center gap-1"> <Trophy size={12} className="text-amber-500" /> Cerita Utama</span>
                                <span className="text-indigo-600">{stats.canonPercent}%</span>
                            </div>
                            <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
                                <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${stats.canonPercent}%` }} />
                            </div>
                        </div>

                        {/* Saga Stats */}
                        <div className={`p-3 rounded-xl border transition-all hover:scale-[1.01] ${isDarkMode ? 'bg-amber-950/20 border-amber-500/20' : 'bg-amber-50/50 border-amber-100'}`}>
                            <div className="flex items-center justify-between text-[9px] font-black uppercase mb-1.5">
                                <span className="text-amber-600 flex items-center gap-1"> <Compass size={12} /> Saga Tamat</span>
                                <span className="text-amber-600">{stats.sagasPercent}%</span>
                            </div>
                            <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
                                <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${stats.sagasPercent}%` }} />
                            </div>
                        </div>

                        {/* Filler Stats */}
                        <div className={`p-3 rounded-xl border transition-all hover:scale-[1.01] ${isDarkMode ? 'bg-rose-950/20 border-rose-500/20' : 'bg-rose-50/50 border-rose-100'}`}>
                            <div className="flex items-center justify-between text-[9px] font-black uppercase mb-1.5">
                                <span className="text-rose-600 flex items-center gap-1"> <Skull size={12} /> Filler Tontonan</span>
                                <span className="text-rose-600">{stats.fillerPercent}%</span>
                            </div>
                            <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
                                <div className="h-full bg-rose-500 transition-all duration-1000" style={{ width: `${stats.fillerPercent}%` }} />
                            </div>
                        </div>

                        {/* Movie Stats */}
                        <div className={`p-3 rounded-xl border transition-all hover:scale-[1.01] ${isDarkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-100/50 border-slate-200'}`}>
                            <div className="flex items-center justify-between text-[9px] font-black uppercase mb-1.5">
                                <span className={`${theme.muted} flex items-center gap-1`}> <Film size={12} /> Film Layar Lebar</span>
                                <span>{stats.moviePercent}%</span>
                            </div>
                            <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-indigo-100'}`}>
                                <div className="h-full bg-slate-500 transition-all duration-1000" style={{ width: `${stats.moviePercent}%` }} />
                            </div>
                        </div>
                    </div>

                    {/* Navigation / Search Controls */}
                    <div className="flex flex-col gap-3 mt-auto lg:mt-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input type="text" placeholder="Temukan Arc/Saga..." className={`w-full rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none ${theme.input}`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                        <button onClick={() => { continueWatching(); setIsSidebarOpen(false); }} className="bg-indigo-600 text-white flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold active:scale-95 transition-all shadow-lg shadow-indigo-600/20 w-full">
                            <Ship size={18} /> <span>Mulai Petualangan!</span>
                        </button>
                    </div>

                    <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 hidden lg:block opacity-40">
                        <p className="text-[9px] font-black uppercase tracking-widest text-center italic">© Grand Line Tracker v4.1</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-5xl mx-auto px-4 lg:px-10 py-8 pb-32 lg:overflow-y-auto">
                {activeTab === 'episodes' ? (
                    <div className="space-y-10">
                        {filteredEps.map((saga) => (
                            <section key={saga.id} className={`rounded-3xl overflow-hidden border transition-all duration-300 ${theme.card}`}>
                                <div className={`p-6 cursor-pointer flex items-center justify-between ${theme.hover}`} onClick={() => toggleSaga(saga.id)}>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"> Saga </span>
                                            <span className={`text-[10px] font-bold ${theme.muted}`}> {getSagaRange(saga)} </span>
                                        </div>
                                        <h2 className="text-xl font-black">{saga.title}</h2>
                                        <p className={`text-sm leading-relaxed mt-1 ${theme.muted}`}> {saga.description} </p>
                                    </div>
                                    <div className={`p-2 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                        {expandedSagas.includes(saga.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                </div>

                                {expandedSagas.includes(saga.id) && (
                                    <div className={`border-t ${theme.border}`}>
                                        {saga.arcs.map((arc, arcIdx) => {
                                            const finished = isArcFinished(arc);
                                            const progress = getArcProgress(arc);
                                            const isExpanded = expandedArcs.includes(arc.id);

                                            return (
                                                <div key={arc.id} className={`group ${arcIdx < saga.arcs.length - 1 ? `border-b ${theme.border}` : ''}`} ref={el => { arcRefs.current[arc.id] = el }}>
                                                    <div className={`flex items-center p-4 transition-colors cursor-pointer ${theme.hover}`} onClick={() => toggleArcDropdown(arc.id)}>
                                                        <button onClick={(e) => toggleArcComplete(arc, e)} className={`flex-shrink-0 mr-4 transition-all hover:scale-110 active:scale-95 ${finished ? 'text-green-500' : 'text-slate-300'}`}>
                                                            {finished ? <CheckCircle2 size={32} fill="currentColor" /> : <Circle size={32} />}
                                                        </button>

                                                        <div className="flex-1 min-w-0 pr-4">
                                                            <h4 className={`font-bold truncate text-base ${finished ? 'line-through text-slate-400 decoration-green-500/50' : ''}`}> {arc.title} </h4>
                                                            <div className={`flex items-center gap-3 text-[11px] font-bold ${theme.muted}`}>
                                                                <span>Ep {arc.start} - {arc.end} </span>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-20 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                                                        <div className="h-full bg-indigo-500" style={{ width: `${(progress.count / progress.total) * 100}%` }} />
                                                                    </div>
                                                                    <span> {progress.count} / {progress.total} </span>
                                                                </div>
                                                                <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase tracking-tighter ${arc.type === 'Filler' ? 'bg-slate-100 dark:bg-slate-800' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'}`}> {arc.type} </span>
                                                            </div>
                                                        </div>
                                                        <div className={`p-2 rounded-xl transition-all ${isExpanded ? 'bg-indigo-600 text-white shadow-md' : theme.muted}`}>
                                                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                        </div>
                                                    </div>

                                                    {isExpanded && (
                                                        <div className={`border-t border-l-4 ml-4 ${theme.border} ${theme.dropdownBg}`}>
                                                            {Array.from({ length: arc.end - arc.start + 1 }, (_, i) => {
                                                                const epNum = arc.start + i;
                                                                const isWatched = watchedEpisodes.includes(`ep-${epNum}`);
                                                                const isLastEp = i === (arc.end - arc.start);
                                                                return (
                                                                    <div key={epNum} className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 pl-8 transition-all group/ep ${isWatched ? 'bg-green-500/5 opacity-90' : ''} ${!isLastEp ? `border-b ${theme.border}` : ''}`}>
                                                                        <div className="flex items-center flex-1 min-w-0 gap-4">
                                                                            <button onClick={() => toggleEpisode(epNum)} className={`flex-shrink-0 transition-all ${isWatched ? 'text-green-500' : theme.muted}`}>
                                                                                {isWatched ? <CheckCircle2 size={24} fill="currentColor" className="text-green-500 bg-white rounded-full" /> : <Circle size={24} />}
                                                                            </button>
                                                                            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleEpisode(epNum)}>
                                                                                <span className={`text-[10px] font-black uppercase ${theme.muted}`}># {epNum} </span>
                                                                                <h5 className={`text-sm font-bold leading-tight ${isWatched ? 'line-through decoration-green-500/30 text-slate-400' : ''}`}>
                                                                                    {getEpisodeTitle(epNum)}
                                                                                </h5>
                                                                            </div>
                                                                        </div>
                                                                        <a href={getBilibiliUrl(epNum)} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase transition-all border ${isDarkMode ? 'bg-slate-900 border-indigo-900 text-indigo-400 hover:bg-indigo-900/30' : 'bg-white border-slate-200 text-indigo-600 hover:bg-indigo-50 shadow-sm'}`}>
                                                                            <Play size={14} fill="currentColor" />
                                                                            <span>Nonton di Bilibili </span>
                                                                            <ExternalLink size={12} />
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
                                <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleMovie(movie.id)}>
                                    <div className={`p-3 rounded-2xl ${watchedMovies.includes(movie.id) ? 'bg-green-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                        <Film size={20} />
                                    </div>
                                    <div>
                                        <h4 className={`font-bold ${watchedMovies.includes(movie.id) ? 'text-green-600 dark:text-green-400' : ''}`}> {movie.title} </h4>
                                        <p className={`text-[10px] font-bold ${theme.muted}`}> {movie.year} {movie.recommended && '• Rekomendasi'} </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <a href={`https://www.bilibili.tv/id/search-result?q=One+Piece+${movie.title.replace(' ', '+')}`} target="_blank" rel="noopener noreferrer" className={`p-2 rounded-xl text-indigo-600 dark:text-indigo-400`}> <ExternalLink size={16} /></a>
                                    <div className={watchedMovies.includes(movie.id) ? 'text-green-500' : 'text-slate-300'} onClick={() => toggleMovie(movie.id)}>
                                        {watchedMovies.includes(movie.id) ? <CheckCircle2 size={24} fill="currentColor" /> : <Circle size={24} />}
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
                    <p className="text-[10px] font-bold opacity-30 text-center">Data ini hanya ada di browser {deviceInfo.device} ini. <br/> Simpan file jika ingin pindah perangkat.</p>
                </div>
            </main>

            {/* Popups */}
            {copyFeedback && (
                <div className="fixed bottom-10 left-1/2 lg:left-[calc(50%+160px)] -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full text-xs font-bold animate-bounce z-50 shadow-2xl"> Progres disalin! 📋</div>
            )}
        </div>
    );
}
