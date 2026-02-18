import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
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
    <div className="min-h-screen bg-background px-4 pt-4 pb-8">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-muted-foreground text-sm">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <h1 className="text-xl font-bold mb-4">Help & FAQ</h1>

      <Accordion type="single" collapsible className="mb-6">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger className="text-sm text-left">{faq.q}</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <h2 className="text-lg font-bold mb-3">Contact Support</h2>
      {sent ? (
        <div className="rounded-2xl bg-card p-6 text-center">
          <p className="text-2xl mb-2">✓</p>
          <p className="font-medium">Message sent!</p>
          <p className="text-sm text-muted-foreground">We'll get back to you soon.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <Input placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)} />
          <Textarea placeholder="Describe your issue..." value={message} onChange={e => setMessage(e.target.value)} />
          <Button className="w-full rounded-xl" onClick={() => setSent(true)} disabled={!message.trim()}>Send Message</Button>
        </div>
      )}
    </div>
  );
};

export default Help;
