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
    Bell,
    ArrowUpDown
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
    { id: 'm1', title: 'One Piece: The Movie', year: 2000, imdbId: 'tt0814243', poster: 'https://m.media-amazon.com/images/M/MV5BOWNhMDU3NDQtYWViMC00M2Y4LTk4YTUtYjI2M2ZmN2Q5NDViXkEyXkFqcGc@._V1_.jpg' },
    { id: 'm2', title: 'One Piece: Clockwork Island Adventure', year: 2001, imdbId: 'tt0832449', poster: 'https://m.media-amazon.com/images/M/MV5BNDRjN2NmNDAtZDE3Mi00ZDJlLTkwODktMmNkMTBkYTRjMTY3XkEyXkFqcGc@._V1_.jpg' },
    { id: 'm3', title: "One Piece: Chopper's Kingdom in the Strange Animal Island", year: 2002, imdbId: 'tt0997084', poster: 'https://m.media-amazon.com/images/M/MV5BMWM2NzE5NTMtNGMyZi00ODRiLTljOGUtZWEzOTE2ZWUxNzdlXkEyXkFqcGc@._V1_.jpg' },
    { id: 'm4', title: 'One Piece: Dead End Adventure', year: 2003, imdbId: 'tt1006926', poster: 'https://m.media-amazon.com/images/M/MV5BNmU5ZjU1ZGMtMTM0YS00NTZjLWI1NjctMjIzNDVmNTI0ZGQ4XkEyXkFqcGc@._V1_.jpg' },
    { id: 'm5', title: 'One Piece: The Cursed Holy Sword', year: 2004, imdbId: 'tt1010435', poster: 'https://m.media-amazon.com/images/M/MV5BNjkwYjdhNzktZWMyZS00MjBkLTg0NzgtZDRkNzQ2ODY5ZTUxXkEyXkFqcGc@._V1_.jpg' },
    { id: 'm6', title: 'One Piece: Baron Omatsuri and the Secret Island', year: 2005, imdbId: 'tt1018764', poster: 'https://m.media-amazon.com/images/M/MV5BMTU4ZDkwMDMtYmFkMS00ODIyLTgxYTQtNzA3M2QyOTQ5ODMzXkEyXkFqcGc@._V1_.jpg' },
    { id: 'm7', title: 'One Piece: The Giant Mechanical Soldier of Karakuri Castle', year: 2006, imdbId: 'tt1059950', poster: 'https://m.media-amazon.com/images/M/MV5BMmI3OWU1MjktMzc0YS00ZDdlLWFkZjktNjM1YTM1OGZiZDRkXkEyXkFqcGc@._V1_.jpg' },
    { id: 'm8', title: 'One Piece: Episode of Alabasta - The Desert Princess and the Pirates', year: 2007, imdbId: 'tt1037116', poster: 'https://m.media-amazon.com/images/M/MV5BMTc2MGRkZTgtYmI2My00M2VjLTlmNTItYmJiNTY3ZmNkNTIyXkEyXkFqcGc@._V1_.jpg' },
    { id: 'm9', title: 'One Piece: Episode of Chopper Plus - Bloom in the Winter, Miracle Sakura', year: 2008, imdbId: 'tt1206326', poster: 'https://m.media-amazon.com/images/M/MV5BYTY2YzBhMTktOTc3Yi00OGZiLWE1ZTQtNjM3NTJjOTFiYTRkXkEyXkFqcGc@._V1_.jpg' },
    { id: 'm10', title: 'One Piece: Strong World', year: 2009, imdbId: 'tt1485763', poster: 'https://m.media-amazon.com/images/M/MV5BMTA5MTM5YWQtNzE1Yi00OWUyLTk1MWItMWVkODM4ZGM5OWUzXkEyXkFqcGc@._V1_.jpg', recommended: true },
    { id: 'm11', title: 'One Piece 3D: Straw Hat Chase', year: 2011, imdbId: 'tt1865467', poster: 'https://m.media-amazon.com/images/M/MV5BNjUyZjJkNWMtMDU5YS00MGZiLWE2OTMtYjkzMjZlNGViZjkyXkEyXkFqcGc@._V1_.jpg' },
    { id: 'm12', title: 'One Piece Film Z', year: 2012, imdbId: 'tt2375379', poster: 'https://m.media-amazon.com/images/M/MV5BNjY3ODNiZjgtY2RmNS00MjAyLWIwMzUtNTE0ZWIxNDU3YThhXkEyXkFqcGc@._V1_.jpg', recommended: true },
    { id: 'm13', title: 'One Piece Film: Gold', year: 2016, imdbId: 'tt5251328', poster: 'https://m.media-amazon.com/images/M/MV5BYjRlNmY2ZmUtNTZjMS00Y2ZlLThkN2ItMmY5MTBiZDJhZTE5XkEyXkFqcGc@._V1_.jpg', recommended: true },
    { id: 'm14', title: 'One Piece: Stampede', year: 2019, imdbId: 'tt9430698', poster: 'https://m.media-amazon.com/images/M/MV5BY2FlYzRmZGMtM2Y5OC00NzFhLTgyNDAtZDk1YjdkZTlmMjE3XkEyXkFqcGc@._V1_.jpg', recommended: true },
    { id: 'm15', title: 'One Piece Film: Red', year: 2022, imdbId: 'tt15933454', poster: 'https://m.media-amazon.com/images/M/MV5BNTdjY2YxYTQtNjIzYy00ZDczLThhNTUtNmY2ZWNkZjZiMTYzXkEyXkFqcGc@._V1_.jpg', recommended: true },
];

const successSound = typeof Audio !== 'undefined' ? new Audio('/success.mp3') : null;

// --- Helper Components for Circular Progress ---
const StatCircle = ({ percent, color, isDarkMode, isExporting }: { percent: number, color: string, isDarkMode: boolean, isExporting?: boolean }) => {
    const size = 56;
    const strokeWidth = 5;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percent / 100) * circumference;

    const colorClasses: Record<string, string> = {
        red: isDarkMode ? '#ef4444' : '#dc2626',
        amber: isDarkMode ? '#f59e0b' : '#d97706',
        neutral: isDarkMode ? '#a3a3a3' : '#737373',
        indigo: isDarkMode ? '#818cf8' : '#4f46e5',
    };

    return (
        <div className="relative flex items-center justify-center shrink-0">
            <svg width={size} height={size} className="transform -rotate-90" style={{ overflow: 'visible' }}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={isDarkMode ? '#262626' : '#f5f5f5'}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={colorClasses[color] || '#ef4444'}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className={!isExporting ? 'transition-all duration-1000 ease-out' : ''}
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
};

const StatCard = ({ title, icon, current, total, percent, color, isDarkMode, isExporting }: any) => {
    const bgClasses: Record<string, string> = {
        red: isDarkMode ? 'bg-red-500/5 border-red-500/10' : 'bg-red-50/50 border-red-100 shadow-sm',
        amber: isDarkMode ? 'bg-amber-500/5 border-amber-500/10' : 'bg-amber-50/50 border-amber-100 shadow-sm',
        neutral: isDarkMode ? 'bg-neutral-500/5 border-neutral-500/10' : 'bg-white border-neutral-100 shadow-sm',
        indigo: isDarkMode ? 'bg-indigo-500/5 border-indigo-500/10' : 'bg-indigo-50/50 border-indigo-100 shadow-sm',
    };

    const textClasses: Record<string, string> = {
        red: isDarkMode ? 'text-red-400' : 'text-red-700',
        amber: isDarkMode ? 'text-amber-400' : 'text-amber-700',
        neutral: isDarkMode ? 'text-neutral-400' : 'text-neutral-600',
        indigo: isDarkMode ? 'text-indigo-400' : 'text-indigo-700',
    };

    return (
        <div className={`p-3.5 sm:p-4 rounded-[2rem] border transition-all hover:scale-[1.03] flex flex-col items-center text-center gap-2 active:scale-95 group ${bgClasses[color]}`}>
            <div className="relative shrink-0 flex items-center justify-center p-0.5 rounded-full">
                <StatCircle percent={percent} color={color} isDarkMode={isDarkMode} isExporting={isExporting} />
                <div className={`absolute inset-0 flex items-center justify-center ${textClasses[color]} transition-transform duration-500 group-hover:scale-110`}>
                    {icon}
                </div>
            </div>
            <div className="w-full space-y-0.5">
                <h4 className={`text-[9px] font-black uppercase tracking-[0.15em] leading-tight ${textClasses[color]} opacity-90`}>
                    {title}
                </h4>
                <div className="flex flex-col items-center leading-none">
                    <span className={`text-[15px] font-black tracking-tight ${textClasses[color]}`}>{percent}%</span>
                    <span className={`text-[7px] font-black uppercase tracking-[0.1em] mt-0.5 opacity-40 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                        {current} / {total}
                    </span>
                </div>
            </div>
        </div>
    );
};

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
    const [movieSortOrder, setMovieSortOrder] = useState<'asc' | 'desc'>('desc');

    const [expandedSagas, setExpandedSagas] = useState<string[]>([]);
    const [expandedArcs, setExpandedArcs] = useState<string[]>([]);

    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState<string>(localStorage.getItem('op-tracker-username') || '');
    const [isEnteringName, setIsEnteringName] = useState(false);

    useEffect(() => {
        localStorage.setItem('op-tracker-username', userName);
    }, [userName]);

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
        const isWatched = watchedMovies.includes(movieId);
        const newWatched = isWatched
            ? watchedMovies.filter(id => id !== movieId)
            : [...watchedMovies, movieId];

        setWatchedMovies(newWatched);
        saveLocally({ watchedMovies: newWatched });

        if (!isWatched) {
            fireConfetti();
        }
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
        let firstUnwatchedEp = 0;
        for (const saga of SAGA_DATA) {
            for (const arc of saga.arcs) {
                if (!isArcFinished(arc)) {
                    firstUnwatchedArc = arc;
                    for (let ep = arc.start; ep <= arc.end; ep++) {
                        if (!watchedEpisodes.includes(`ep-${ep}`)) {
                            firstUnwatchedEp = ep;
                            break;
                        }
                    }
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
                const epElement = document.getElementById(`episode-${firstUnwatchedEp}`);
                if (epElement) {
                    epElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    epElement.classList.add('ring-2', 'ring-amber-500', 'bg-amber-500/10');
                    setTimeout(() => {
                        epElement.classList.remove('ring-2', 'ring-amber-500', 'bg-amber-500/10');
                    }, 2500);
                } else {
                    arcRefs.current[firstUnwatchedArc.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 350);
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
        const filtered = MOVIE_DATA.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));
        return [...filtered].sort((a, b) => movieSortOrder === 'desc' ? b.year - a.year : a.year - b.year);
    }, [searchQuery, movieSortOrder]);

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
        if (!userName.trim()) {
            setIsEnteringName(true);
            return;
        }
        
        setIsExporting(true);
        // Beri waktu lebih lama agar flag isExporting memicu re-render judul di poster dan mematikan animasi
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
                link.download = `OPTracker_${userName.replace(/\s+/g, '_')}_${gamerRank.title.replace(/\s+/g, '_')}.png`;
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
            <AnimatePresence>
                {!isSidebarOpen && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0, opacity: 0, y: 20 }}
                        className="fixed bottom-6 right-6 z-40"
                    >
                        {/* Glowing Background Aura */}
                        <motion.div 
                            animate={{ 
                                scale: [1, 1.2, 1],
                                opacity: [0.2, 0.5, 0.2]
                            }}
                            transition={{ 
                                duration: 4, 
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="absolute inset-0 bg-gradient-to-br from-red-600 to-amber-500 rounded-3xl blur-2xl -z-10"
                        />
                        
                        <motion.button
                            onClick={() => setIsSidebarOpen(true)}
                            whileHover={{ 
                                scale: 1.1,
                                boxShadow: "0 20px 40px -10px rgba(220, 38, 38, 0.5)"
                            }}
                            whileTap={{ scale: 0.9 }}
                            className="relative group flex items-center justify-center p-4 rounded-[1.5rem] bg-gradient-to-br from-red-600 via-red-600 to-amber-500 text-white shadow-2xl border border-white/20 backdrop-blur-xl group overflow-hidden"
                            title="Buka Menu Utama"
                        >
                            {/* Inner shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full" />
                            
                            <div className="flex items-center gap-0 group-hover:gap-3 transition-all duration-500 ease-out">
                                <Menu size={24} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-500" />
                                <span className="max-w-0 opacity-0 overflow-hidden whitespace-nowrap group-hover:max-w-[100px] group-hover:opacity-100 transition-all duration-500 text-[11px] font-black uppercase tracking-[0.2em] pt-0.5">
                                    Navigasi
                                </span>
                            </div>
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

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


                    {/* Compact Stats Section / Poster Export */}
                    <div id="stats-poster" className={`transition-all duration-300 ${isExporting ? 'p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-950 shadow-2xl min-w-[360px]' : ''}`}>
                        {/* Judul & Pangkat Khusus untuk Hasil Export Poster */}
                        {isExporting && (
                            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-neutral-200 dark:border-neutral-800">
                                <img src="/mugiwara-logo.png" className="w-12 h-12 object-contain drop-shadow-sm" alt="Logo" />
                                <div className="flex-1">
                                    <h3 className="text-[18px] font-black uppercase tracking-tight bg-gradient-to-r from-red-600 to-amber-500 text-transparent bg-clip-text leading-none pb-1">{userName || 'OP Tracker'}</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${isDarkMode ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-200 text-neutral-500'}`}>Pangkat</span>
                                        <span className={`text-[11px] font-black uppercase tracking-widest pt-0.5 ${gamerRank.color}`}>{gamerRank.title}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 px-1">
                            {/* Canon Stats */}
                            <StatCard 
                                title="Cerita Utama" 
                                icon={<Trophy size={20} strokeWidth={2.5} />}
                                current={stats.canonWatched}
                                total={stats.canonTotal}
                                percent={stats.canonPercent}
                                color="red"
                                isDarkMode={isDarkMode}
                                isExporting={isExporting}
                            />

                            {/* Saga Stats */}
                            <StatCard 
                                title="Saga Selesai" 
                                icon={<Compass size={20} strokeWidth={2.5} />}
                                current={stats.sagasWatched}
                                total={stats.sagasTotal}
                                percent={stats.sagasPercent}
                                color="amber"
                                isDarkMode={isDarkMode}
                                isExporting={isExporting}
                            />

                            {/* Filler Stats */}
                            <StatCard 
                                title="Filler Tontonan" 
                                icon={<Skull size={20} strokeWidth={2.5} />}
                                current={stats.fillerWatched}
                                total={stats.fillerTotal}
                                percent={stats.fillerPercent}
                                color="neutral"
                                isDarkMode={isDarkMode}
                                isExporting={isExporting}
                            />

                            {/* Movie Stats */}
                            <StatCard 
                                title="Film Layar Lebar" 
                                icon={<Film size={20} strokeWidth={2.5} />}
                                current={stats.movieWatched}
                                total={stats.movieTotal}
                                percent={stats.moviePercent}
                                color="indigo"
                                isDarkMode={isDarkMode}
                                isExporting={isExporting}
                            />
                        </div>
                    </div>

                    {isEnteringName ? (
                        <div className="mt-1 mb-4 w-full relative group">
                            <input 
                                autoFocus
                                type="text" 
                                placeholder="Masukkan Nama Anda..." 
                                className={`w-full p-3.5 pr-12 rounded-2xl font-black uppercase tracking-widest text-[11px] outline-none transition-all border ${isDarkMode ? 'bg-neutral-900 border-orange-500/40 text-white focus:border-orange-500' : 'bg-white border-orange-500/40 text-neutral-900 focus:border-orange-500 shadow-sm'}`}
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && userName.trim()) {
                                        setIsEnteringName(false);
                                        setTimeout(exportImage, 100);
                                    }
                                    if (e.key === 'Escape') setIsEnteringName(false);
                                }}
                                onBlur={() => { if (!userName.trim()) setIsEnteringName(false); }}
                            />
                            <button 
                                onClick={() => {
                                    if (userName.trim()) {
                                        setIsEnteringName(false);
                                        setTimeout(exportImage, 100);
                                    }
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-orange-500 hover:scale-110 transition-transform"
                            >
                                <CheckCircle2 size={20} strokeWidth={3} />
                            </button>
                        </div>
                    ) : (
                        <button onClick={exportImage} disabled={isExporting} className="mt-1 mb-4 w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-gradient-to-r from-orange-500/10 to-red-500/10 hover:from-orange-500/20 hover:to-red-500/20 text-orange-600 dark:text-orange-500 transition-all font-black text-[11px] uppercase tracking-widest border border-orange-500/20 hover:border-orange-500/40 hover:scale-[1.02] active:scale-95 shadow-sm">
                            {isExporting ? (
                                <div className="w-4 h-4 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                            ) : (
                                <><Camera size={18} strokeWidth={2.5} /> {userName ? 'Pamer Hasil!' : 'Input Nama & Pamer!'}</>
                            )}
                        </button>
                    )}

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
                                        {activeTab === 'episodes' ? 'OP Tracker' : 'OP Movie Archive'}
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
                                    <button onClick={() => setActiveTab('episodes')} className={`px-2 py-1 text-[9px] sm:text-xs font-bold uppercase rounded-md transition-all ${activeTab === 'episodes' ? (isDarkMode ? 'bg-neutral-800 text-red-500 shadow-lg' : 'bg-white text-red-600 shadow-sm') : 'opacity-50 text-neutral-500'}`}>Anime</button>
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
                            <div className="relative flex-1 flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                                    <input type="text" placeholder="Cari Judul, Arc, Episode..." className={`w-full rounded-xl py-2.5 sm:py-2.5 pl-9 pr-4 text-[12px] sm:text-sm transition-all outline-none focus:ring-2 focus:ring-amber-500 shadow-none border ${isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900 shadow-sm'}`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                    {searchQuery && (
                                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-red-500 transition-colors"><X size={14} strokeWidth={3} /></button>
                                    )}
                                </div>

                                {activeTab === 'movies' && (
                                    <button 
                                        onClick={() => setMovieSortOrder(movieSortOrder === 'desc' ? 'asc' : 'desc')}
                                        className={`px-3 rounded-xl border flex items-center gap-2 transition-all active:scale-95 ${isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white' : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 shadow-sm'}`}
                                        title={`Urutkan: ${movieSortOrder === 'desc' ? 'Terbaru' : 'Terlama'}`}
                                    >
                                        <ArrowUpDown size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">
                                            {movieSortOrder === 'desc' ? 'Terbaru' : 'Terlama'}
                                        </span>
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-2 pb-1 sm:pb-0">
                                {activeTab === 'episodes' && (
                                    <>
                                        <motion.button 
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setShowFiller(!showFiller)} 
                                            title="Sembunyikan Filler" 
                                            className={`flex-1 sm:flex-none px-2 py-2 rounded-xl border transition-all flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap ${!showFiller ? 'bg-gradient-to-r from-red-600 to-rose-600 border-rose-500 text-white shadow-lg shadow-red-500/20' : theme.buttonInactive}`}
                                        >
                                            <CircleMinus size={14} strokeWidth={2.5} />
                                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tight sm:tracking-widest"><span className="hidden sm:inline">Tanpa </span>Filler</span>
                                        </motion.button>

                                        <motion.button 
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setHideWatched(!hideWatched)} 
                                            title="Sembunyikan Selesai" 
                                            className={`flex-1 sm:flex-none px-2 py-2 rounded-xl border transition-all flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap ${hideWatched ? 'bg-gradient-to-r from-emerald-600 to-green-600 border-green-500 text-white shadow-lg shadow-green-500/20' : theme.buttonInactive}`}
                                        >
                                            <CheckCircle2 size={14} strokeWidth={2.5} />
                                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tight sm:tracking-widest"><span className="hidden sm:inline">Sembunyikan </span>Selesai</span>
                                        </motion.button>

                                        <motion.button 
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={continueWatching} 
                                            title="Lanjutkan Menonton" 
                                            className="relative overflow-hidden group/btn flex-1 sm:flex-none px-2 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white border border-rose-400/20 transition-all shadow-xl shadow-red-500/20 flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap"
                                        >
                                            {/* Shine Sweep Effect */}
                                            <motion.div 
                                                animate={{ x: ['-200%', '200%'] }}
                                                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12"
                                            />
                                            <Play size={14} fill="currentColor" strokeWidth={2.5} className="relative z-10" />
                                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tight sm:tracking-widest relative z-10">Lanjut</span>
                                        </motion.button>
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
                                {filteredEps.map((saga) => {
                                    const progress = getSagaProgress(saga);
                                    const finished = progress.count === progress.total;

                                    return (
                                        <section key={saga.id} className={`rounded-[1.25rem] overflow-hidden border transition-all duration-300 ${theme.card} ${sagaViewMode === 'card' && expandedSagas.includes(saga.id) ? 'md:col-span-2' : ''}`}>
                                            <div className={`cursor-pointer ${sagaViewMode === 'card' ? 'p-4 sm:p-5' : 'p-3 sm:px-4'} ${theme.hover}`} onClick={() => toggleSaga(saga.id)}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <div className={sagaViewMode === 'list' ? 'flex flex-row items-center gap-3 sm:gap-5' : ''}>
                                                            <div className={`flex ${sagaViewMode === 'list' ? 'flex-col items-center justify-center gap-0.5 shrink-0 min-w-[50px] sm:min-w-[56px]' : 'items-center gap-2 mb-0.5'}`}>
                                                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-[0.05em] bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">Saga</span>
                                                                <span className={`${sagaViewMode === 'list' ? 'text-[11px]' : 'text-[10px]'} font-bold ${theme.muted} whitespace-nowrap text-center`}> {getSagaRange(saga)} </span>
                                                            </div>

                                                            <div className={`flex-1 min-w-0 ${sagaViewMode === 'list' ? 'flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6' : ''}`}>
                                                                <h2 className={`${sagaViewMode === 'card' ? 'text-lg sm:text-xl' : 'text-[15px] sm:text-base'} font-black truncate shrink-0`}>{saga.title}</h2>
                                                                {sagaViewMode === 'card' && <p className={`text-[11px] font-medium leading-relaxed mt-1 line-clamp-2 ${theme.muted}`}> {saga.description} </p>}

                                                                {sagaViewMode === 'list' && (
                                                                    <div className="flex-1 flex items-center gap-3 sm:gap-4 lg:px-4" onClick={(e) => e.stopPropagation()}>
                                                                        <button onClick={(e) => toggleSagaComplete(saga, e)} className={`flex-shrink-0 transition-all hover:scale-110 active:scale-95 ${finished ? 'text-green-500' : 'text-neutral-300'}`}>
                                                                            {finished ? <CheckCircle2 size={20} className="text-green-500" /> : <Circle size={20} />}
                                                                        </button>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-bold mb-0.5 sm:mb-1">
                                                                                <span className={theme.muted}>{progress.percent}%</span>
                                                                                <span className={theme.muted}>{progress.count} / {progress.total} Misi</span>
                                                                            </div>
                                                                            <div className={`h-1 sm:h-1.5 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                                                                                <div
                                                                                    className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-700 ease-out"
                                                                                    style={{ width: `${progress.percent}%` }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Expand Toggle */}
                                                    <div className={`p-1.5 rounded-xl shrink-0 ${isDarkMode ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                                                        {expandedSagas.includes(saga.id) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                    </div>
                                                </div>

                                                {/* Saga Progress Bar - Only for Card View or Mobile in List Mode */}
                                                {sagaViewMode === 'card' && (
                                                    <div className={`flex items-center gap-3 mt-4 pt-4 border-t ${theme.border}`}>
                                                        <button onClick={(e) => toggleSagaComplete(saga, e)} className={`flex-shrink-0 transition-all hover:scale-110 active:scale-95 ${finished ? 'text-green-500' : 'text-neutral-300'}`}>
                                                            {finished ? <CheckCircle2 size={24} className="text-green-500" /> : <Circle size={24} />}
                                                        </button>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between text-[9px] font-bold mb-1">
                                                                <span className={theme.muted}>{progress.percent}% Selesai SAGA Ini</span>
                                                                <span className={theme.muted}>{progress.count} / {progress.total} Misi</span>
                                                            </div>
                                                            <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                                                                <div
                                                                    className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-700 ease-out"
                                                                    style={{ width: `${progress.percent}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
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
                                                                                        <div id={`episode-${epNum}`} key={epNum} className={`flex items-center gap-2 sm:gap-4 py-2.5 sm:py-3 px-3 sm:px-5 transition-all duration-500 group/ep ${isWatched ? 'bg-green-500/5 opacity-90' : ''} ${!isLastEp ? `border-b border-dashed ${isDarkMode ? 'border-neutral-800' : 'border-neutral-200'}` : ''}`}>
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
                                );
                            })}
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
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                                {filteredMovies.map((movie) => (
                                    <div 
                                        key={movie.id} 
                                        className={`flex flex-col rounded-[2rem] overflow-hidden transition-all duration-500 group border h-full ${watchedMovies.includes(movie.id) ? 'border-green-500/50 bg-green-500/[0.02]' : `${theme.card} hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-1`}`}
                                    >
                                        {/* Poster Section */}
                                        <div className="relative aspect-[2/3] overflow-hidden cursor-pointer" onClick={() => toggleMovie(movie.id)}>
                                            {movie.poster ? (
                                                <img 
                                                    src={movie.poster} 
                                                    alt={movie.title} 
                                                    className={`w-full h-full object-cover transition-transform duration-700 ${watchedMovies.includes(movie.id) ? 'opacity-60 scale-100' : 'group-hover:scale-110'}`}
                                                    referrerPolicy="no-referrer"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
                                                    <Film size={40} className="text-neutral-400" />
                                                </div>
                                            )}
                                            
                                            {/* Overlays */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            
                                            {/* Top Actions */}
                                            <div className="absolute top-3 right-3 flex flex-col gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                                <a 
                                                    href={`https://www.imdb.com/title/${movie.imdbId}/`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="p-2.5 rounded-xl bg-black/60 backdrop-blur-md text-amber-500 border border-white/10 hover:bg-amber-500 hover:text-white transition-all shadow-xl"
                                                    title="Lihat di IMDb"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <ExternalLink size={18} strokeWidth={2.5} />
                                                </a>
                                            </div>

                                            {/* Status Badge */}
                                            {watchedMovies.includes(movie.id) && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-green-500/10 backdrop-blur-[2px]">
                                                    <div className="bg-green-500 text-white p-3 rounded-full shadow-2xl scale-110 ring-4 ring-green-500/30">
                                                        <CheckCircle2 size={32} strokeWidth={3} />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Recommended Badge */}
                                            {movie.recommended && (
                                                <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-amber-500 text-black text-[10px] font-black uppercase tracking-tighter shadow-lg">
                                                    HOT
                                                </div>
                                            )}
                                        </div>

                                        {/* Info Section */}
                                        <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                                            <div className="cursor-pointer" onClick={() => toggleMovie(movie.id)}>
                                                <h4 className={`font-black leading-tight mb-1 text-sm sm:text-base line-clamp-2 transition-colors ${watchedMovies.includes(movie.id) ? 'text-green-600 dark:text-green-400' : 'group-hover:text-red-600'}`}> 
                                                    {movie.title} 
                                                </h4>
                                                <p className={`text-[10px] font-bold uppercase tracking-widest ${theme.muted}`}> 
                                                    {movie.year} 
                                                </p>
                                            </div>

                                            <button 
                                                onClick={() => toggleMovie(movie.id)}
                                                className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${watchedMovies.includes(movie.id) 
                                                    ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                                                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-red-600 hover:text-white border border-transparent'}`}
                                            >
                                                {watchedMovies.includes(movie.id) ? 'Selesai Ditonton' : 'Tandai Tonton'}
                                            </button>
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
