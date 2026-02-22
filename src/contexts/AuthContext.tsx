import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type SubscriptionTier = 'free' | 'premium';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isPremium: boolean;
  subscriptionTier: SubscriptionTier;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<{ data: any; error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithKakao: () => void;
  signInWithNaver: () => void;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ error: Error | null }>;
  openAuthModal: (tab?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  authModalOpen: boolean;
  authModalTab: 'login' | 'signup';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('free');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');

  // 사용자 구독 등급 조회
  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single();
    setSubscriptionTier((data?.subscription_tier as SubscriptionTier) ?? 'free');
  };

  useEffect(() => {
    let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

    const subscribeToProfileChanges = (userId: string) => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
        realtimeChannel = null;
      }
      realtimeChannel = supabase
        .channel(`profile-tier-${userId}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
          (payload) => {
            const newTier = (payload.new as { subscription_tier?: string })
              .subscription_tier as SubscriptionTier | undefined;
            if (newTier) {
              setSubscriptionTier(newTier);
            } else {
              fetchProfile(userId);
            }
          },
        )
        .subscribe();
    };

    const unsubscribeFromProfileChanges = () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
        realtimeChannel = null;
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        fetchProfile(data.session.user.id);
        subscribeToProfileChanges(data.session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        subscribeToProfileChanges(session.user.id);
      } else {
        setSubscriptionTier('free');
        unsubscribeFromProfileChanges();
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      unsubscribeFromProfileChanges();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    return { data, error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    return { error };
  };

  const signInWithKakao = () => {
    window.location.href = '/api/auth/kakao/init';
  };

  const signInWithNaver = () => {
    window.location.href = '/api/auth/naver/init';
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPasswordForEmail = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const openAuthModal = (tab: 'login' | 'signup' = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => setAuthModalOpen(false);

  return (
    <AuthContext.Provider value={{
      user, session, loading,
      isPremium: subscriptionTier === 'premium',
      subscriptionTier,
      signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithKakao, signInWithNaver, signOut, resetPasswordForEmail,
      openAuthModal, closeAuthModal, authModalOpen, authModalTab,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
