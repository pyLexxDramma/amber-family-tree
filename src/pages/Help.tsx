import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { TopBar } from '@/components/TopBar';
import { Volume2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

const QUICK_GUIDE = `Краткая инструкция по Angelo. 
Дерево семьи: откройте вкладку «Дерево» или скажите «Покажи дерево». Нажмите на человека — появится карточка. 
Лента: вкладка «Лента» или команда «Покажи ленту», «Что нового». 
Создать публикацию: вкладка «Создать» или «Создай публикацию». 
Пригласить родственников: вкладка «Семья» — кнопка «Пригласить» или «Пригласи присоединиться». 
Голосовой помощник: кнопка с микрофоном или страница «Angelo» — говорите команды или пишите текст. 
Навигация: «Открой настройки», «Смени оформление», «Назад». 
Тема: «Тёмная тема» или «Светлая тема».`;

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
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speakGuide = useCallback(() => {
    if (!('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    if (isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
      return;
    }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(QUICK_GUIDE);
    u.lang = 'ru-RU';
    u.rate = 0.9;
    u.onend = () => setIsSpeaking(false);
    u.onerror = () => setIsSpeaking(false);
    synth.speak(u);
    setIsSpeaking(true);
  }, [isSpeaking]);

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)]">
        <TopBar title="Помощь и поддержка" onBack={() => navigate(-1)} light />
        <div className="mx-auto max-w-full px-3 pt-4 pb-8 sm:max-w-md sm:px-5 md:max-w-2xl lg:max-w-4xl overflow-x-hidden">
          <p className="text-xs font-semibold text-[var(--proto-active)] uppercase tracking-wider mb-4">Краткая инструкция</p>
          <div className="rounded-2xl bg-[var(--proto-card)] border border-[var(--proto-border)] p-5 mb-8">
            <p className="text-sm text-[var(--proto-text)] whitespace-pre-line mb-4 leading-relaxed">{QUICK_GUIDE}</p>
            <button
              type="button"
              onClick={speakGuide}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--proto-active)] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              <Volume2 className="h-4 w-4" />
              {isSpeaking ? 'Остановить озвучку' : 'Слушать инструкцию'}
            </button>
          </div>

          <p className="text-xs font-semibold text-[var(--proto-active)] uppercase tracking-wider mb-4">Частые вопросы</p>
          <Accordion type="single" collapsible className="mb-10 space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="rounded-2xl bg-[var(--proto-card)] border border-[var(--proto-border)] overflow-hidden px-0 min-h-0 [&[data-state=open]]:border-[var(--proto-active)]/20">
                <AccordionTrigger className="w-full py-4 px-5 text-left cursor-pointer touch-target flex items-center justify-between gap-3 hover:no-underline hover:opacity-90 rounded-2xl text-[var(--proto-text)]">
                  <span className="text-sm font-semibold flex-1 pr-2">{faq.q}</span>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-[var(--proto-text-muted)] px-5 pb-4 pt-0 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <p className="text-xs font-semibold text-[var(--proto-active)] uppercase tracking-wider mb-4">Написать в поддержку</p>

          {sent ? (
            <div className="py-12 text-center">
              <p className="text-xl font-bold text-[var(--proto-text)] mb-2">Сообщение отправлено</p>
              <p className="text-sm text-[var(--proto-text-muted)]">Мы ответим вам в ближайшее время.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <Input
                placeholder="Ваш email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="rounded-xl border border-[var(--proto-border)] bg-[var(--proto-card)] text-[var(--proto-text)] text-sm min-h-[48px] focus-visible:border-[var(--proto-active)]/50"
              />
              <Textarea
                placeholder="Опишите проблему..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="rounded-xl border border-[var(--proto-border)] bg-[var(--proto-card)] text-[var(--proto-text)] min-h-[100px] resize-none text-sm focus-visible:border-[var(--proto-active)]/50"
              />
              <button
                onClick={() => setSent(true)}
                disabled={!message.trim()}
                className="w-full min-h-[48px] rounded-2xl bg-[var(--proto-active)] text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-30"
              >
                Отправить сообщение
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Help;
