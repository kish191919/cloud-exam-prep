import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Cloud, Eye, EyeOff, Loader2, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// ─── Schemas ───────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
});

type LoginForm = z.infer<typeof loginSchema>;
type SignupForm = z.infer<typeof signupSchema>;

// ─── Social Icons ──────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const KakaoIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#000000">
    <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.607 5.084 4.063 6.527L5.09 21l4.493-2.99A11.3 11.3 0 0 0 12 18.6c5.523 0 10-3.477 10-7.8S17.523 3 12 3z"/>
  </svg>
);

const NaverIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#FFFFFF">
    <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"/>
  </svg>
);

// ─── Login Form ────────────────────────────────────────────────────────────────
const LoginForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { t } = useTranslation('auth');
  const { signInWithEmail, signInWithGoogle, signInWithKakao, signInWithNaver } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    const { error } = await signInWithEmail(data.email, data.password);
    if (error) {
      toast.error(t('loginFailed'));
    } else {
      toast.success(t('loginSuccess'));
      onSuccess();
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(t('socialLoginFailed'));
      setGoogleLoading(false);
    }
  };

  const handleKakao = () => {
    signInWithKakao();
  };

  const handleNaver = () => {
    signInWithNaver();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      {/* Google */}
      <Button
        type="button"
        variant="outline"
        className="w-full gap-3 h-12 text-sm font-medium"
        onClick={handleGoogle}
        disabled={googleLoading}
      >
        {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
        {t('continueWithGoogle')}
      </Button>

      {/* Kakao */}
      <Button
        type="button"
        variant="outline"
        className="w-full gap-3 h-12 text-sm font-medium bg-[#FEE500] hover:bg-[#FEE500]/90 border-[#FEE500] text-black hover:text-black"
        onClick={handleKakao}
      >
        <KakaoIcon />
        {t('continueWithKakao')}
      </Button>

      {/* Naver */}
      <Button
        type="button"
        variant="outline"
        className="w-full gap-3 h-12 text-sm font-medium bg-[#03C75A] hover:bg-[#03C75A]/90 border-[#03C75A] text-white hover:text-white"
        onClick={handleNaver}
      >
        <NaverIcon />
        {t('continueWithNaver')}
      </Button>

      <div className="relative pt-1">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">
          {t('or')}
        </span>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="login-email">{t('email')}</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="example@email.com"
          {...register('email')}
          className={errors.email ? 'border-destructive' : ''}
        />
        {errors.email && <p className="text-xs text-destructive">{t('invalidEmail')}</p>}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="login-password">{t('password')}</Label>
        <div className="relative">
          <Input
            id="login-password"
            type={showPw ? 'text' : 'password'}
            placeholder={t('passwordPlaceholder')}
            {...register('password')}
            className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPw(!showPw)}
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-destructive">{t('passwordMinLength')}</p>}
      </div>

      <Button type="submit" className="w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t('login')}
      </Button>
    </form>
  );
};

// ─── Signup Form ───────────────────────────────────────────────────────────────
const SignupForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { t } = useTranslation('auth');
  const { signUpWithEmail, signInWithGoogle, signInWithKakao, signInWithNaver } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [emailExists, setEmailExists] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    const { data: signupData, error } = await signUpWithEmail(data.email, data.password, data.name);
    if (error) {
      toast.error(t('signupFailed'));
    } else if (signupData?.user?.identities?.length === 0) {
      setEmailExists(true);
    } else {
      setDone(true);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(t('socialLoginFailed'));
      setGoogleLoading(false);
    }
  };

  const handleKakao = () => {
    signInWithKakao();
  };

  const handleNaver = () => {
    signInWithNaver();
  };

  if (emailExists) {
    return (
      <div className="text-center py-8 space-y-3">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <Mail className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="font-semibold text-lg">{t('emailAlreadyExists')}</h3>
        <p className="text-sm text-muted-foreground">{t('emailAlreadyExistsDesc')}</p>
        <Button onClick={onSuccess} className="mt-2 w-full">{t('goToLogin')}</Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center py-8 space-y-3">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
          <Cloud className="h-8 w-8 text-accent" />
        </div>
        <h3 className="font-semibold text-lg">{t('checkEmail')}</h3>
        <p className="text-sm text-muted-foreground">{t('checkEmailDesc')}</p>
        <Button variant="outline" onClick={onSuccess} className="mt-2">{t('backToLogin')}</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      {/* Google */}
      <Button
        type="button"
        variant="outline"
        className="w-full gap-3 h-12 text-sm font-medium"
        onClick={handleGoogle}
        disabled={googleLoading}
      >
        {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
        {t('signupWithGoogle')}
      </Button>

      {/* Kakao */}
      <Button
        type="button"
        variant="outline"
        className="w-full gap-3 h-12 text-sm font-medium bg-[#FEE500] hover:bg-[#FEE500]/90 border-[#FEE500] text-black hover:text-black"
        onClick={handleKakao}
      >
        <KakaoIcon />
        {t('signupWithKakao')}
      </Button>

      {/* Naver */}
      <Button
        type="button"
        variant="outline"
        className="w-full gap-3 h-12 text-sm font-medium bg-[#03C75A] hover:bg-[#03C75A]/90 border-[#03C75A] text-white hover:text-white"
        onClick={handleNaver}
      >
        <NaverIcon />
        {t('signupWithNaver')}
      </Button>

      <div className="relative pt-1">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">
          {t('or')}
        </span>
      </div>

      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="signup-name">{t('name')}</Label>
        <Input
          id="signup-name"
          placeholder={t('namePlaceholder')}
          {...register('name')}
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && <p className="text-xs text-destructive">{t('nameMinLength')}</p>}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="signup-email">{t('email')}</Label>
        <Input
          id="signup-email"
          type="email"
          placeholder="example@email.com"
          {...register('email')}
          className={errors.email ? 'border-destructive' : ''}
        />
        {errors.email && <p className="text-xs text-destructive">{t('invalidEmail')}</p>}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="signup-password">{t('password')}</Label>
        <div className="relative">
          <Input
            id="signup-password"
            type={showPw ? 'text' : 'password'}
            placeholder={t('signupPasswordPlaceholder')}
            {...register('password')}
            className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
          />
          <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPw(!showPw)}>
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-destructive">{t('signupPasswordMin')}</p>}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <Label htmlFor="signup-confirm">{t('confirmPassword')}</Label>
        <div className="relative">
          <Input
            id="signup-confirm"
            type={showConfirm ? 'text' : 'password'}
            placeholder={t('confirmPasswordPlaceholder')}
            {...register('confirmPassword')}
            className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
          />
          <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowConfirm(!showConfirm)}>
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
      </div>

      <Button type="submit" className="w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t('createAccount')}
      </Button>
    </form>
  );
};

// ─── Main Modal ────────────────────────────────────────────────────────────────
const AuthModal = () => {
  const { t } = useTranslation('auth');
  const { authModalOpen, authModalTab, closeAuthModal, openAuthModal } = useAuth();

  return (
    <Dialog open={authModalOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-8 py-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Cloud className="h-6 w-6 text-accent" />
            <span className="font-bold text-lg">CloudMaster</span>
          </div>
          <p className="text-sm text-primary-foreground/70">{t('headerSubtitle')}</p>
        </div>

        {/* Tabs */}
        <Tabs value={authModalTab} onValueChange={(v) => openAuthModal(v as 'login' | 'signup')} className="px-8 py-6">
          <TabsList className="w-full mb-6 h-11">
            <TabsTrigger value="login" className="flex-1 font-medium">{t('login')}</TabsTrigger>
            <TabsTrigger value="signup" className="flex-1 font-medium">{t('signup')}</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-0">
            <LoginForm onSuccess={closeAuthModal} />
            <p className="text-center text-sm text-muted-foreground mt-4">
              {t('noAccount')}{' '}
              <button type="button" className="text-accent hover:underline font-medium" onClick={() => openAuthModal('signup')}>
                {t('signupLink')}
              </button>
            </p>
          </TabsContent>

          <TabsContent value="signup" className="mt-0">
            <SignupForm onSuccess={() => openAuthModal('login')} />
            <p className="text-center text-sm text-muted-foreground mt-4">
              {t('haveAccount')}{' '}
              <button type="button" className="text-accent hover:underline font-medium" onClick={() => openAuthModal('login')}>
                {t('loginLink')}
              </button>
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
