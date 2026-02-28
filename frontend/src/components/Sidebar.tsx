import React from 'react';
import {
    LayoutDashboard,
    Atom,
    Compass,
    Target,
    BarChart2,
    Trophy,
    BookMarked,
    ChevronRight,
    Settings,
} from 'lucide-react';
import { translations, Language } from '../translations';

export interface PyqItem {
    question: string;
    exam?: string;
    year?: string;
    subject?: string;
    savedAt: string;
}

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    pyqs?: PyqItem[];
    language: Language;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, pyqs = [], language }) => {
    const t = translations[language];

    const menuItems = [
        { id: 'dashboard', label: t.sidebar.dashboard, icon: LayoutDashboard },
        { id: 'solver', label: t.sidebar.solver, icon: Atom, hasArrow: true },
        { id: 'concepts', label: t.sidebar.concepts, icon: Compass },
        { id: 'practice', label: t.sidebar.practice, icon: Target },
        { id: 'pyqbank', label: t.sidebar.pyqbank, icon: BookMarked, badge: pyqs.length > 0 ? pyqs.length : undefined },
        { id: 'analytics', label: t.sidebar.analytics, icon: BarChart2 },
        { id: 'achievements', label: t.sidebar.achievements, icon: Trophy },
    ];

    const bottomItems = [
        { id: 'settings', label: t.sidebar.settings, icon: Settings },
    ];

    return (
        <div className="w-64 bg-[#0b1121] h-screen flex flex-col hidden md:flex shadow-2xl z-20">
            {/* Logo */}
            <div className="p-6 flex items-center space-x-3 mb-4">
                <div className="bg-brand-accent/20 p-2 rounded-lg">
                    <Atom className="text-brand-accent w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-white font-bold text-lg tracking-wide leading-tight">STEM Engine</h1>
                    <p className="text-brand-muted text-[10px] uppercase font-semibold tracking-wider">AI Intelligence</p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-brand-accent/10 text-brand-accent font-medium shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)]'
                                : 'text-brand-muted hover:bg-brand-surface/50 hover:text-brand-text'
                                }`}
                        >
                            <div className="flex items-center space-x-3">
                                <Icon
                                    className={`w-5 h-5 ${isActive ? 'text-brand-accent' : 'text-brand-muted group-hover:text-brand-text'}`}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                <span className="text-sm">{item.label}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                {item.badge !== undefined && (
                                    <span className="bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                        {item.badge > 9 ? '9+' : item.badge}
                                    </span>
                                )}
                                {item.hasArrow && (
                                    <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-60 transition-opacity ${isActive ? 'opacity-60' : ''}`} />
                                )}
                            </div>
                        </button>
                    );
                })}
            </nav>

            {/* Bottom: Settings + version */}
            <div className="px-4 pb-4 pt-3 space-y-1">
                {bottomItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200 group text-sm ${isActive
                                ? 'bg-brand-accent/10 text-brand-accent font-medium'
                                : 'text-brand-muted hover:bg-brand-surface/50 hover:text-brand-text'
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-brand-accent' : 'text-brand-muted group-hover:text-brand-text'}`} strokeWidth={isActive ? 2.5 : 2} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
                <p className="text-brand-muted/40 text-[10px] uppercase font-semibold tracking-wider text-center pt-2">v2.0 · STEM Engine</p>
            </div>
        </div>
    );
};
