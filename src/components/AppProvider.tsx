"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  UserSettings,
  DEFAULT_SETTINGS,
  BookmakerBalance,
  DEFAULT_BALANCES,
  JournalEntry,
  DEMO_JOURNAL_ENTRIES,
  AppNotification,
  DEMO_NOTIFICATIONS,
} from "@/lib/store-types";

interface AppContextValue {
  settings: UserSettings;
  updateSettings: (partial: Partial<UserSettings>) => void;
  bookmakerBalances: BookmakerBalance[];
  updateBalance: (key: string, balance: number) => void;
  journal: JournalEntry[];
  addJournalEntry: (entry: Omit<JournalEntry, "id" | "createdAt">) => void;
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => void;
  deleteJournalEntry: (id: string) => void;
  notifications: AppNotification[];
  addNotification: (notif: Omit<AppNotification, "id" | "timestamp">) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  unreadCount: number;
  deductVirtualBalance: (amount: number) => void;
  addVirtualBalance: (amount: number) => void;
  watchlist: string[];
  toggleWatchlist: (eventId: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored) as T;
  } catch {
    // ignore
  }
  return fallback;
}

function saveToStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  // Use stable empty/default values that match between server and client
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [bookmakerBalances, setBookmakerBalances] = useState<BookmakerBalance[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);

  // Initialize from storage once — runs only on the client, after hydration
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSettings(loadFromStorage("bukscan:settings", DEFAULT_SETTINGS));
    setBookmakerBalances(loadFromStorage("bukscan:balances", DEFAULT_BALANCES));
    setJournal(loadFromStorage("bukscan:journal", DEMO_JOURNAL_ENTRIES));
    setNotifications(loadFromStorage("bukscan:notifications", DEMO_NOTIFICATIONS));
    setWatchlist(loadFromStorage("bukscan:watchlist", []));
    setIsLoaded(true);
  }, []);

  // Persist to localStorage on every change
  useEffect(() => { if (isLoaded) saveToStorage("bukscan:settings", settings); }, [settings, isLoaded]);
  useEffect(() => { if (isLoaded) saveToStorage("bukscan:balances", bookmakerBalances); }, [bookmakerBalances, isLoaded]);
  useEffect(() => { if (isLoaded) saveToStorage("bukscan:journal", journal); }, [journal, isLoaded]);
  useEffect(() => { if (isLoaded) saveToStorage("bukscan:notifications", notifications); }, [notifications, isLoaded]);
  useEffect(() => { if (isLoaded) saveToStorage("bukscan:watchlist", watchlist); }, [watchlist, isLoaded]);

  const updateSettings = useCallback((partial: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  }, []);

  const updateBalance = useCallback((key: string, balance: number) => {
    setBookmakerBalances(prev =>
      prev.map(b => b.bookmakerKey === key ? { ...b, balance, lastUpdated: new Date().toISOString() } : b)
    );
  }, []);

  const addJournalEntry = useCallback((entry: Omit<JournalEntry, "id" | "createdAt">) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: `j-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setJournal(prev => [newEntry, ...prev]);
  }, []);

  const updateJournalEntry = useCallback((id: string, updates: Partial<JournalEntry>) => {
    setJournal(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, []);

  const deleteJournalEntry = useCallback((id: string) => {
    setJournal(prev => prev.filter(e => e.id !== id));
  }, []);

  const addNotification = useCallback((notif: Omit<AppNotification, "id" | "timestamp">) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `n-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const deductVirtualBalance = useCallback((amount: number) => {
    setSettings(prev => ({ ...prev, virtualBalance: Math.max(0, prev.virtualBalance - amount) }));
  }, []);

  const addVirtualBalance = useCallback((amount: number) => {
    setSettings(prev => ({ ...prev, virtualBalance: prev.virtualBalance + amount }));
  }, []);

  const toggleWatchlist = useCallback((eventId: string) => {
    setWatchlist(prev =>
      prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
    );
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider value={{
      settings,
      updateSettings,
      bookmakerBalances,
      updateBalance,
      journal,
      addJournalEntry,
      updateJournalEntry,
      deleteJournalEntry,
      notifications,
      addNotification,
      markNotificationRead,
      markAllNotificationsRead,
      clearNotifications,
      unreadCount,
      deductVirtualBalance,
      addVirtualBalance,
      watchlist,
      toggleWatchlist,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
