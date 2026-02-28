import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import type { PyqItem } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ProblemSolver } from './components/ProblemSolver';
import { Concepts } from './components/Concepts';
import { Practice } from './components/Practice';
import { Analytics } from './components/Analytics';
import { Achievements } from './components/Achievements';
import { PYQBank } from './components/PYQBank';
import { LoginPage } from './components/LoginPage';
import { SettingsPage } from './components/SettingsPage';
import { translations, Language } from './translations';
import { Globe } from 'lucide-react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
    collection,
    onSnapshot,
    addDoc,
    deleteDoc,
    doc,
    query,
    orderBy
} from 'firebase/firestore';

interface User { name: string; email: string }

export interface Activity {
    id: string;
    title: string;
    category: string;
    time: string;
    xp: string;
    type: 'solve' | 'concept' | 'achievement';
}

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [pyqs, setPyqs] = useState<PyqItem[]>([]);
    const [authLoading, setAuthLoading] = useState(true);
    const [language, setLanguage] = useState<Language>(() => {
        const stored = localStorage.getItem('stem_lang');
        return (stored as Language) || 'English';
    });
    const [theme, setTheme] = useState<'dark' | 'light' | 'system'>(() => {
        return (localStorage.getItem('stem_theme') as any) || 'dark';
    });
    const [accent, setAccent] = useState<'blue' | 'purple' | 'emerald' | 'orange'>(() => {
        return (localStorage.getItem('stem_accent') as any) || 'blue';
    });
    const [activities, setActivities] = useState<Activity[]>(() => {
        const stored = localStorage.getItem('stem_activities');
        return stored ? JSON.parse(stored) : [{
            id: 'initial',
            title: 'Welcome to STEM Engine',
            category: 'System',
            time: 'Just now',
            xp: '+0 XP',
            type: 'concept'
        }];
    });

    const t = translations[language];

    useEffect(() => {
        localStorage.setItem('stem_lang', language);
    }, [language]);

    useEffect(() => {
        localStorage.setItem('stem_theme', theme);
        const root = window.document.documentElement;
        if (theme === 'light') root.classList.add('light-theme');
        else root.classList.remove('light-theme');
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('stem_accent', accent);
        const colors = {
            blue: '#3b82f6',
            purple: '#a855f7',
            emerald: '#10b981',
            orange: '#f97316'
        };
        document.documentElement.style.setProperty('--brand-accent', colors[accent]);
    }, [accent]);

    useEffect(() => {
        localStorage.setItem('stem_activities', JSON.stringify(activities));
    }, [activities]);

    const addActivity = (activity: Omit<Activity, 'id' | 'time'>) => {
        const newActivity: Activity = {
            ...activity,
            id: Math.random().toString(36).substr(2, 9),
            time: 'Just now'
        };
        setActivities(prev => [newActivity, ...prev].slice(0, 10));
    };

    // Sync PYQs from Firestore (Universal Bank)
    useEffect(() => {
        const q = query(collection(db, 'universal_pyqs'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as (PyqItem & { id: string })[];
            setPyqs(items);
        });
        return () => unsubscribe();
    }, []);

    // Initial session observer
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                const userData = {
                    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                    email: firebaseUser.email || ''
                };
                setUser(userData);
                localStorage.setItem('stem_user', JSON.stringify(userData));
            } else {
                // If not in Firebase, check if it's a guest session (local only)
                const stored = localStorage.getItem('stem_user');
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        if (parsed.name === 'Guest') {
                            setUser(parsed);
                        } else {
                            setUser(null);
                        }
                    } catch { setUser(null); }
                } else {
                    setUser(null);
                }
            }
            setAuthLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleLogin = (u: User) => setUser(u);

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (err) {
            console.error('Sign out error', err);
        }
        localStorage.removeItem('stem_user');
        setUser(null);
        setActiveTab('dashboard');
    };

    const handleAddPyq = async (q: PyqItem) => {
        const key = `${q.question}__${q.exam}__${q.year}`;
        if (!pyqs.find(p => `${p.question}__${p.exam}__${p.year}` === key)) {
            try {
                await addDoc(collection(db, 'universal_pyqs'), {
                    ...q,
                    createdAt: new Date().toISOString(),
                    addedBy: user?.email || 'unknown'
                });
            } catch (err) {
                console.error('Error adding PYQ to Firestore:', err);
            }
        }
    };

    const handleRemovePyq = async (idxOrId: number | string) => {
        // Find the doc ID if an index was passed
        let docId = typeof idxOrId === 'string' ? idxOrId : '';
        if (typeof idxOrId === 'number') {
            const item = pyqs[idxOrId] as any;
            docId = item.id;
        }

        if (docId) {
            try {
                await deleteDoc(doc(db, 'universal_pyqs', docId));
            } catch (err) {
                console.error('Error removing PYQ from Firestore:', err);
            }
        }
    };

    const handlePractice = (q: PyqItem) => {
        setActiveTab('solver');
        window.dispatchEvent(new CustomEvent('pyq-practice', { detail: q.question }));
    };

    const handleUseFormula = (equation: string) => {
        setActiveTab('solver');
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('pyq-practice', { detail: equation }));
        }, 80);
    };

    const tabLabel: Record<string, string> = {
        dashboard: t.sidebar.dashboard,
        solver: t.sidebar.solver,
        concepts: t.sidebar.concepts,
        practice: t.sidebar.practice,
        pyqbank: t.sidebar.pyqbank,
        analytics: t.sidebar.analytics,
        achievements: t.sidebar.achievements,
        settings: t.sidebar.settings,
    };

    // Show loading while checking auth
    if (authLoading) {
        return (
            <div className="h-screen bg-[#050c1a] flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm font-medium animate-pulse">Initializing STEM Engine...</p>
                </div>
            </div>
        );
    }

    // Show login if not authenticated
    if (!user) {
        return <LoginPage onLogin={handleLogin} />;
    }

    const langClass = language === 'Hindi' ? 'lang-hi' : language === 'Telugu' ? 'lang-te' : '';

    return (
        <div className={`flex h-screen bg-[#0b1121] text-brand-text font-sans overflow-hidden ${langClass}`}>
            {/* Left Navigation */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} pyqs={pyqs} language={language} />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#080e1a]">

                {/* Top Bar */}
                <header className="px-8 py-4 flex items-center justify-between shrink-0 bg-[#0b1121]/80 backdrop-blur-md sticky top-0 z-50">
                    <h2 className="text-lg font-semibold text-white tracking-wide">
                        {tabLabel[activeTab] ?? activeTab}
                    </h2>
                    <div className="flex items-center space-x-6">
                        {/* Language Selector */}
                        <div className="flex items-center space-x-2 bg-brand-surface/50 border border-brand-muted/10 px-3 py-1.5 rounded-xl">
                            <Globe className="w-4 h-4 text-blue-400" />
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value as Language)}
                                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer font-medium"
                            >
                                <option value="English" className="bg-[#0b1121]">English</option>
                                <option value="Hindi" className="bg-[#0b1121]">हिन्दी</option>
                                <option value="Telugu" className="bg-[#0b1121]">తెలుగు</option>
                            </select>
                        </div>

                        {/* User avatar */}
                        <button
                            onClick={() => setActiveTab('settings')}
                            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl hover:bg-brand-surface/50 transition-all group"
                            title="Settings"
                        >
                            <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shadow-sm">
                                <span className="text-[11px] font-bold text-blue-300">
                                    {user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                                </span>
                            </div>
                            <span className="text-sm text-brand-muted group-hover:text-white transition-colors hidden sm:block">{user.name}</span>
                        </button>
                    </div>
                </header>

                {/* Tab Content */}
                <div className="p-4 md:p-8 flex-1 overflow-y-auto">
                    {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} language={language} activities={activities} />}
                    {activeTab === 'solver' && <ProblemSolver onAddPyq={handleAddPyq} language={language} onSolveSuccess={() => addActivity({ title: 'Solved Problem', category: 'Solver', xp: '+20 XP', type: 'solve' })} />}
                    {activeTab === 'concepts' && <Concepts onUseFormula={handleUseFormula} language={language} onTopicSelect={(topic) => addActivity({ title: topic, category: 'Concepts', xp: '+5 XP', type: 'concept' })} />}
                    {activeTab === 'practice' && <Practice onSolveProblem={handleUseFormula} language={language} />}
                    {activeTab === 'pyqbank' && <PYQBank pyqs={pyqs} onRemovePyq={handleRemovePyq} onPractice={handlePractice} language={language} />}
                    {activeTab === 'analytics' && <Analytics language={language} />}
                    {activeTab === 'achievements' && <Achievements language={language} />}
                    {activeTab === 'settings' && (
                        <SettingsPage
                            user={user!}
                            onLogout={handleLogout}
                            language={language}
                            onLanguageChange={setLanguage}
                            theme={theme}
                            setTheme={setTheme}
                            accent={accent}
                            setAccent={setAccent}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}

export default App;
