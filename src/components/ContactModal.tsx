import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn } from 'lucide-react';
import { submitContact } from '@/services/contactService';
import { type ContactCategory } from '@/types/contact';
import { MessageSquare, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation, Trans } from 'react-i18next';

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
}

const CATEGORIES: ContactCategory[] = ['complaint', 'suggestion', 'inquiry', 'other'];

export default function ContactModal({ open, onClose }: ContactModalProps) {
  const { user, openAuthModal } = useAuth();
  const { t } = useTranslation('common');

  const [category, setCategory] = useState<ContactCategory>('inquiry');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleClose = () => {
    if (submitting) return;
    onClose();
    // 성공 상태면 폼 초기화 (딜레이 후)
    setTimeout(() => {
      setSubmitted(false);
      setCategory('inquiry');
      setSubject('');
      setMessage('');
    }, 300);
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!subject.trim() || !message.trim()) {
      toast.error(t('contact.errorEmpty'));
      return;
    }
    setSubmitting(true);
    try {
      await submitContact({
        userId: user.id,
        userEmail: user.email ?? '',
        userName: user.user_metadata?.full_name ?? undefined,
        category,
        subject: subject.trim(),
        message: message.trim(),
      });
      setSubmitted(true);
    } catch {
      toast.error(t('contact.errorSend'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-accent" />
            {t('contact.title')}
          </DialogTitle>
        </DialogHeader>

        {!user ? (
          <div className="py-10 flex flex-col items-center gap-4 text-center">
            <LogIn className="h-10 w-10 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground text-sm">{t('contact.loginRequired')}</p>
            <Button
              onClick={() => {
                handleClose();
                openAuthModal('login');
              }}
            >
              {t('contact.signIn')}
            </Button>
          </div>
        ) : submitted ? (
          <div className="py-8 flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <p className="font-semibold text-lg">{t('contact.successTitle')}</p>
            <p className="text-sm text-muted-foreground">
              {t('contact.successMessage')}
            </p>
            <Button onClick={handleClose} className="mt-2">
              {t('contact.close')}
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-1">
              <div className="space-y-1.5">
                <Label>{t('contact.typeLabel')}</Label>
                <Select value={category} onValueChange={v => setCategory(v as ContactCategory)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {t(`contact.categories.${cat}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contact-subject">{t('contact.subjectLabel')}</Label>
                <Input
                  id="contact-subject"
                  placeholder={t('contact.subjectPlaceholder')}
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contact-message">{t('contact.messageLabel')}</Label>
                <Textarea
                  id="contact-message"
                  placeholder={t('contact.messagePlaceholder')}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={6}
                  maxLength={2000}
                  className="resize-none"
                />
                <p className="text-xs text-right text-muted-foreground">{message.length}/2000</p>
              </div>

              <div className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                <Trans
                  i18nKey="contact.accountInfo"
                  ns="common"
                  values={{ email: user?.email }}
                  components={{ bold: <span className="font-medium" /> }}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={submitting}>
                {t('contact.cancel')}
              </Button>
              <Button onClick={handleSubmit} disabled={submitting || !subject.trim() || !message.trim()}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('contact.sending')}
                  </>
                ) : (
                  t('contact.send')
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
