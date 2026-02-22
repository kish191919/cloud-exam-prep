import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Cloud, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const resetSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
});

type ResetForm = z.infer<typeof resetSchema>;

const ResetPassword = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const onSubmit = async (data: ResetForm) => {
    const { error } = await supabase.auth.updateUser({ password: data.password });
    if (error) {
      toast.error(t('resetPasswordFailed'));
    } else {
      await supabase.auth.signOut();
      setDone(true);
      setTimeout(() => navigate('/'), 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl overflow-hidden border shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-8 py-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Cloud className="h-6 w-6 text-accent" />
            <span className="font-bold text-lg">CloudMaster</span>
          </div>
          <p className="text-sm text-primary-foreground/70">{t('headerSubtitle')}</p>
        </div>

        <div className="px-8 py-8">
          {done ? (
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                <Cloud className="h-8 w-8 text-accent" />
              </div>
              <h2 className="font-semibold text-lg">{t('resetPasswordSuccess')}</h2>
              <p className="text-sm text-muted-foreground">{t('resetPasswordSuccessDesc')}</p>
            </div>
          ) : !ready ? (
            <div className="text-center space-y-3 py-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-accent" />
              <p className="text-sm text-muted-foreground">링크를 확인하는 중입니다...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <h2 className="font-semibold text-base">{t('resetPasswordTitle')}</h2>
                <p className="text-sm text-muted-foreground mt-1">{t('resetPasswordDesc')}</p>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <Label htmlFor="reset-password">{t('newPassword')}</Label>
                <div className="relative">
                  <Input
                    id="reset-password"
                    type={showPw ? 'text' : 'password'}
                    placeholder={t('newPasswordPlaceholder')}
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
                {errors.password && <p className="text-xs text-destructive">{t('signupPasswordMin')}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="reset-confirm">{t('confirmPassword')}</Label>
                <div className="relative">
                  <Input
                    id="reset-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder={t('confirmPasswordPlaceholder')}
                    {...register('confirmPassword')}
                    className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t('setNewPassword')}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
