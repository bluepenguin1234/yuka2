import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Profile, Stage } from './types';

const STORAGE_KEY = 'expecta_profile_v1';

export const DEFAULT_PROFILE: Profile = {
  onboarded: false,
  stage: 't2',
  dueDate: null,
  email: null,
  premium: false,
};

const WEEKS_TOTAL = 40;
const T1_END_WEEK = 14;
const T2_END_WEEK = 28;
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

/**
 * Resolve the user's current stage. If a due date is set, the trimester is
 * derived from it so the verdicts shift automatically as pregnancy progresses.
 */
export function currentStage(profile: Profile, now: Date = new Date()): Stage {
  if (profile.stage === 'bf') return 'bf';
  if (profile.dueDate) {
    const due = new Date(profile.dueDate + 'T12:00:00');
    if (!Number.isNaN(due.getTime())) {
      const weeksUntilDue = (due.getTime() - now.getTime()) / MS_PER_WEEK;
      const weeksPregnant = WEEKS_TOTAL - weeksUntilDue;
      if (weeksPregnant < T1_END_WEEK) return 't1';
      if (weeksPregnant < T2_END_WEEK) return 't2';
      return 't3';
    }
  }
  return profile.stage;
}

export function stageLabel(stage: Stage): string {
  switch (stage) {
    case 't1':
      return 'Trimester 1';
    case 't2':
      return 'Trimester 2';
    case 't3':
      return 'Trimester 3';
    case 'bf':
      return 'Breastfeeding';
  }
}

interface ProfileContextValue {
  profile: Profile;
  ready: boolean;
  update: (patch: Partial<Profile>) => Promise<void>;
  reset: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled) return;
        if (raw) {
          try {
            setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(raw) });
          } catch {
            // corrupted store: fall back to defaults rather than crashing
          }
        }
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      ready,
      update: async (patch) => {
        setProfile((prev) => {
          const next = { ...prev, ...patch };
          AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
          return next;
        });
      },
      reset: async () => {
        setProfile(DEFAULT_PROFILE);
        await AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
      },
    }),
    [profile, ready]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
  return ctx;
}
