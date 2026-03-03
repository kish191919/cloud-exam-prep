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
import { CATEGORY_LABELS, type ContactCategory } from '@/types/contact';
import { MessageSquare, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
}

const CATEGORIES: ContactCategory[] = ['complaint', 'suggestion', 'inquiry', 'other'];

export default function ContactModal({ open, onClose }: ContactModalProps) {
  const { user, openAuthModal } = useAuth();

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
      toast.error('제목과 내용을 모두 입력해주세요.');
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
      toast.error('전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
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
            고객의 소리
          </DialogTitle>
        </DialogHeader>

        {!user ? (
          <div className="py-10 flex flex-col items-center gap-4 text-center">
            <LogIn className="h-10 w-10 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground text-sm">문의하려면 로그인이 필요합니다.</p>
            <Button
              onClick={() => {
                handleClose();
                openAuthModal('login');
              }}
            >
              로그인하기
            </Button>
          </div>
        ) : submitted ? (
          <div className="py-8 flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <p className="font-semibold text-lg">문의가 접수되었습니다!</p>
            <p className="text-sm text-muted-foreground">
              소중한 의견 감사합니다. 검토 후 빠르게 답변드리겠습니다.
            </p>
            <Button onClick={handleClose} className="mt-2">
              닫기
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-1">
              <div className="space-y-1.5">
                <Label>유형</Label>
                <Select value={category} onValueChange={v => setCategory(v as ContactCategory)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {CATEGORY_LABELS[cat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contact-subject">제목</Label>
                <Input
                  id="contact-subject"
                  placeholder="제목을 입력해주세요"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contact-message">내용</Label>
                <Textarea
                  id="contact-message"
                  placeholder="불편사항, 건의사항, 문의사항 등 자유롭게 작성해주세요."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={6}
                  maxLength={2000}
                  className="resize-none"
                />
                <p className="text-xs text-right text-muted-foreground">{message.length}/2000</p>
              </div>

              <div className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                <span className="font-medium">{user?.email}</span> 계정으로 제출됩니다.
                제출 후 마이페이지에서 답변을 확인하실 수 있습니다.
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={submitting}>
                취소
              </Button>
              <Button onClick={handleSubmit} disabled={submitting || !subject.trim() || !message.trim()}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    전송 중...
                  </>
                ) : (
                  '문의 보내기'
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
