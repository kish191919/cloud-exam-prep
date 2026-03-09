import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { isAdmin } from '@/lib/admin';
import { getUnreadContactCount } from '@/services/contactService';

type SubscriptionTier = 'free' | 'premium';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isPremium: boolean;
  hasFullAccess: boolean;
  subscriptionTier: SubscriptionTier;
  unreadReportCount: number;
  markReportsRead: () => void;
  unreadContactCount: number;
  markContactsRead: () => void;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<{ data: any; error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithApple: () => Promise<{ error: Error | null }>;
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
  const [freeEventExpiresAt, setFreeEventExpiresAt] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');
  const [unreadReportCount, setUnreadReportCount] = useState(0);
  const [unreadContactCount, setUnreadContactCount] = useState(0);

  // 무료 이벤트 설정 조회
  const fetchFreeEvent = async () => {
    const { data } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'free_access_event')
      .single();
    setFreeEventExpiresAt(data?.value?.expires_at ?? null);
  };

  // 사용자 구독 등급 조회
  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .maybeSingle();
    if (!data) {
      // profiles 행이 없으면 생성 (트리거가 실패한 경우 복구)
      await supabase.from('profiles').upsert({ id: userId }, { onConflict: 'id' });
    }
    setSubscriptionTier((data?.subscription_tier as SubscriptionTier) ?? 'free');
  };

  useEffect(() => {
    let profileChannel: ReturnType<typeof supabase.channel> | null = null;
    let reportChannel: ReturnType<typeof supabase.channel> | null = null;
    let contactChannel: ReturnType<typeof supabase.channel> | null = null;

    // OAuth redirect error 감지
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get('error');
    const oauthErrorDesc = params.get('error_description');
    if (oauthError) {
      console.error('[Auth] OAuth error:', oauthError, oauthErrorDesc);
      toast.error(oauthErrorDesc || '소셜 로그인에 실패했습니다.');
      window.history.replaceState({}, '', window.location.pathname);
    }

    // OAuth(PKCE) 및 카카오/네이버 매직링크 리다이렉트 처리
    // PKCE 모드: ?code= 쿼리파라미터로 돌아옴 → exchangeCodeForSession 수동 호출
    // 매직링크(implicit fallback): #access_token 해시로 돌아옴 → setSession 수동 호출
    const code = params.get('code');
    const hash = window.location.hash;

    if (code) {
      supabase.auth.exchangeCodeForSession(code)
        .then(({ error }) => {
          if (error) {
            console.error('[Auth] PKCE code exchange failed:', error);
            toast.error('로그인 처리 중 오류가 발생했습니다.');
          }
          window.history.replaceState({}, '', window.location.pathname);
        });
    } else if (hash && hash.includes('access_token')) {
      const hashParams = new URLSearchParams(hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const tokenType = hashParams.get('type');
      // recovery 타입(비밀번호 재설정)은 ResetPassword.tsx에서 별도 처리
      if (accessToken && refreshToken && tokenType !== 'recovery') {
        supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
          .then(({ error }) => {
            if (error) {
              console.error('[Auth] Failed to set session from hash:', error);
              toast.error('로그인 처리 중 오류가 발생했습니다.');
            }
            window.history.replaceState({}, '', window.location.pathname);
          });
      }
    }

    // 앱 시작 시 무료 이벤트 설정 조회 및 realtime 구독
    fetchFreeEvent();
    const freeEventChannel = supabase
      .channel('free-access-event')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'app_settings', filter: 'key=eq.free_access_event' },
        (payload) => {
          const expiresAt = (payload.new as { value?: { expires_at?: string } }).value?.expires_at ?? null;
          setFreeEventExpiresAt(expiresAt);
        },
      )
      .subscribe();

    const subscribeToUserChannels = (userId: string, email?: string) => {
      // 구독 등급 변경 감지
      if (profileChannel) {
        supabase.removeChannel(profileChannel);
        profileChannel = null;
      }
      profileChannel = supabase
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

      // 신고 처리 결과 감지 (resolved 상태로 변경 시 알림 카운트 증가)
      if (reportChannel) {
        supabase.removeChannel(reportChannel);
        reportChannel = null;
      }
      reportChannel = supabase
        .channel(`my-reports-${userId}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'question_reports', filter: `user_id=eq.${userId}` },
          (payload) => {
            const newStatus = (payload.new as { status?: string }).status;
            if (newStatus === 'resolved' || newStatus === 'dismissed') {
              setUnreadReportCount(c => c + 1);
            }
          },
        )
        .subscribe();

      // 관리자: 신규 문의 INSERT 감지 → 미읽음 카운트 증가
      if (isAdmin(email)) {
        if (contactChannel) {
          supabase.removeChannel(contactChannel);
          contactChannel = null;
        }
        // 초기 미읽음 카운트 로드
        getUnreadContactCount().then(setUnreadContactCount).catch(() => {});
        contactChannel = supabase
          .channel('admin-contact-messages')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'contact_messages' },
            () => {
              setUnreadContactCount(c => c + 1);
            },
          )
          .subscribe();
      }
    };

    const unsubscribeFromUserChannels = () => {
      if (profileChannel) {
        supabase.removeChannel(profileChannel);
        profileChannel = null;
      }
      if (reportChannel) {
        supabase.removeChannel(reportChannel);
        reportChannel = null;
      }
      if (contactChannel) {
        supabase.removeChannel(contactChannel);
        contactChannel = null;
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        fetchProfile(data.session.user.id);
        subscribeToUserChannels(data.session.user.id, data.session.user.email);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        subscribeToUserChannels(session.user.id, session.user.email);
        if (event === 'SIGNED_IN') {
          setAuthModalOpen(false);
        }

      } else {
        setSubscriptionTier('free');
        setUnreadReportCount(0);
        setUnreadContactCount(0);
        unsubscribeFromUserChannels();
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      unsubscribeFromUserChannels();
      supabase.removeChannel(freeEventChannel);
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

  const signInWithApple = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
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

  const markReportsRead = () => setUnreadReportCount(0);
  const markContactsRead = () => setUnreadContactCount(0);

  const openAuthModal = (tab: 'login' | 'signup' = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => setAuthModalOpen(false);

  const isPremium = subscriptionTier === 'premium';
  const isFreeEventActive =
    freeEventExpiresAt !== null && new Date() < new Date(freeEventExpiresAt);
  const hasFullAccess = isPremium || isFreeEventActive;

  return (
    <AuthContext.Provider value={{
      user, session, loading,
      isPremium,
      hasFullAccess,
      subscriptionTier,
      unreadReportCount,
      markReportsRead,
      unreadContactCount,
      markContactsRead,
      signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithApple, signInWithKakao, signInWithNaver, signOut, resetPasswordForEmail,
      openAuthModal, closeAuthModal, authModalOpen, authModalTab,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
