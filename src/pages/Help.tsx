import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

const faqs: { q: string; a: string }[] = [
  { q: 'Как пригласить родственников?', a: 'Откройте вкладку «Семья», нажмите «Пригласить» и отправьте ссылку любым мессенджером.' },
  { q: 'Какие форматы медиа поддерживаются?', a: 'Фото (JPG, PNG, WebP до 20 МБ), видео (MP4 до 500 МБ), аудио (M4A, MP3 до 100 МБ).' },
  { q: 'Как работает голосовой помощник?', a: 'Помощник может расшифровывать аудиоистории, оформлять заметки в читаемые тексты и помогать искать по семейным воспоминаниям.' },
  { q: 'Можно ли выгрузить свои данные?', a: 'Да. В настройках выберите «Экспорт данных». Фото, истории и дерево можно скачать архивом ZIP.' },
  { q: 'Мои данные конфиденциальны?', a: 'Да. Angelo — приватная семейная сеть. Контент виден только приглашённым членам семьи.' },
];

const Help: React.FC = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen bg-background px-0 pt-6 pb-8 page-enter">
      <button onClick={() => navigate(-1)} className="touch-target mb-8 flex items-center gap-2 rounded-xl border-2 border-primary/50 text-foreground/90 hover:text-primary hover:bg-primary/10 hover:border-primary/70 transition-colors px-3 py-2 font-semibold shadow-sm">
        <ArrowLeft className="h-5 w-5" />
        <span className="text-base tracking-wide">Назад</span>
      </button>

      <h1 className="editorial-title text-3xl font-bold text-foreground mb-8 px-3">Помощь и поддержка</h1>

      <p className="section-title text-primary mb-4 px-3 text-lg">Частые вопросы</p>
      <Accordion type="single" collapsible className="mb-10 space-y-3">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="content-card border-2 border-border rounded-2xl overflow-hidden px-0 min-h-0 [&[data-state=open]]:border-primary/40 [&[data-state=open]]:bg-primary/5">
            <AccordionTrigger className="w-full min-h-[72px] py-5 px-5 text-left cursor-pointer touch-target flex items-center justify-between gap-3 hover:no-underline hover:bg-foreground/5 rounded-2xl [&[data-state=open]]:bg-primary/10 [&[data-state=open]]:text-primary">
              <span className="text-base font-bold text-foreground tracking-wide flex-1 pr-2">{faq.q}</span>
            </AccordionTrigger>
            <AccordionContent className="text-base font-medium text-foreground/90 editorial-body px-5 pb-5 pt-0">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <p className="section-title text-primary mb-4 px-3 text-lg">Написать в поддержку</p>

      {sent ? (
        <div className="py-12 text-center px-3">
          <p className="editorial-title text-2xl font-bold text-foreground mb-2">Сообщение отправлено</p>
          <p className="text-base font-medium text-foreground/90">Мы ответим вам в ближайшее время.</p>
        </div>
      ) : (
        <div className="space-y-4 px-3">
          <Input
            placeholder="Ваш email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="rounded-xl border-2 border-input text-base font-medium min-h-[48px]"
          />
          <Textarea
            placeholder="Опишите проблему..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="rounded-xl border-2 border-input min-h-[100px] resize-none text-base font-medium"
          />
          <button
            onClick={() => setSent(true)}
            disabled={!message.trim()}
            className="content-card w-full min-h-[56px] rounded-2xl border-2 border-primary text-base font-bold tracking-wide hover:bg-primary hover:text-primary-foreground transition-all duration-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-foreground py-3"
          >
            Отправить сообщение
          </button>
        </div>
      )}
    </div>
  );
};

export default Help;
