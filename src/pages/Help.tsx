import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

const faqs = [
  { q: 'How do I invite family members?', a: 'Go to the Family tab, tap "Invite", and share the generated link via any messenger.' },
  { q: 'What media formats are supported?', a: 'Photos (JPG, PNG, WebP up to 20MB), Videos (MP4 up to 500MB), Audio (M4A, MP3 up to 100MB).' },
  { q: 'How does the AI assistant work?', a: 'The AI can transcribe audio stories, polish raw text into readable narratives, and help you search through family memories.' },
  { q: 'Can I export my data?', a: 'Yes! Go to Settings → Export Data. Your photos, stories, and family tree can be downloaded as a ZIP archive.' },
  { q: 'Is my data private?', a: 'Absolutely. Angelo is a private family network. Your content is only visible to your invited family members.' },
];

const Help: React.FC = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen bg-background px-6 pt-6 pb-8">
      <button onClick={() => navigate(-1)} className="mb-8 flex items-center gap-2 text-muted-foreground/60 hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span className="text-xs tracking-widest uppercase font-light">Back</span>
      </button>

      <h1 className="editorial-title text-2xl mb-8">Help & FAQ</h1>

      <Accordion type="single" collapsible className="mb-10">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="border-border/30">
            <AccordionTrigger className="text-sm font-light text-left tracking-wide py-5">{faq.q}</AccordionTrigger>
            <AccordionContent className="text-sm font-light text-muted-foreground editorial-body pb-5">{faq.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <p className="editorial-caption text-muted-foreground mb-6">Contact support</p>

      {sent ? (
        <div className="py-12 text-center">
          <p className="editorial-title text-2xl mb-2">Message sent</p>
          <p className="text-sm font-light text-muted-foreground">We'll get back to you soon.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <Input
            placeholder="Your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="rounded-none border-0 border-b border-border bg-transparent px-0 text-sm font-light focus-visible:ring-0 focus-visible:border-foreground"
          />
          <Textarea
            placeholder="Describe your issue..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="rounded-none border-0 border-b border-border bg-transparent px-0 text-sm font-light focus-visible:ring-0 focus-visible:border-foreground resize-none"
          />
          <button
            onClick={() => setSent(true)}
            disabled={!message.trim()}
            className="w-full h-12 border border-foreground/20 text-sm font-light tracking-widest uppercase hover:bg-foreground hover:text-background transition-all duration-300 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-foreground"
          >
            Send message
          </button>
        </div>
      )}
    </div>
  );
};

export default Help;
