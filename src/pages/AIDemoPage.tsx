import React, { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mic, Type, MessageCircle, Image, Loader2, Sparkles, Send } from 'lucide-react';

const AIDemoPage: React.FC = () => {
  // Speech-to-text state
  const [sttState, setSttState] = useState<'idle' | 'processing' | 'done'>('idle');
  const mockTranscript = 'It was the summer of 1985, and we were all gathered at the farmhouse in Tuscany. The air smelled of rosemary and fresh bread. Nonno was telling stories about the old days while Nonna prepared her famous tiramisu...';

  // Text styling state
  const [rawText, setRawText] = useState('so uh we went to tuscany that summer and it was really hot and nonna made food and nonno told stories and we played in the garden');
  const [styledText, setStyledText] = useState('');
  const [stylingState, setStylingState] = useState<'idle' | 'processing' | 'done'>('idle');
  const polishedText = 'That summer in Tuscany was one for the family archives. The heat shimmered over the rolling hills as we gathered at the old farmhouse. Nonna\'s kitchen became the heart of our world — the aroma of her cooking drawing us in like a warm embrace. Meanwhile, Nonno held court in the garden, his stories painting pictures more vivid than any photograph. And we children, wild and free, turned the garden into our kingdom of endless adventures.';

  // AI Chat state
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Hello! I\'m your family memory assistant. Ask me anything about your family\'s photos, stories, and history.' },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Photo animation
  const [animState, setAnimState] = useState<'idle' | 'processing' | 'done'>('idle');

  const handleStt = () => { setSttState('processing'); setTimeout(() => setSttState('done'), 2500); };
  const handleStyle = () => { setStylingState('processing'); setTimeout(() => { setStyledText(polishedText); setStylingState('done'); }, 2000); };
  const handleChat = () => {
    if (!chatInput.trim()) return;
    const q = chatInput;
    setChatMessages(m => [...m, { role: 'user', text: q }]);
    setChatInput('');
    setTimeout(() => {
      setChatMessages(m => [...m, { role: 'ai', text: `I found 3 memories related to "${q}". The most recent one is "Summer in Tuscany, 1985" with 5 photos from the farmhouse. Would you like me to show more details?` }]);
    }, 1200);
  };
  const handleAnimate = () => { setAnimState('processing'); setTimeout(() => setAnimState('done'), 3000); };

  return (
    <AppLayout>
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold mb-1">AI Features</h1>
        <p className="text-sm text-muted-foreground mb-4">Powered by AI to bring your memories to life</p>

        <Tabs defaultValue="stt">
          <TabsList className="w-full grid grid-cols-4 h-9">
            <TabsTrigger value="stt" className="text-xs"><Mic className="h-3 w-3 mr-1" />Voice</TabsTrigger>
            <TabsTrigger value="style" className="text-xs"><Type className="h-3 w-3 mr-1" />Style</TabsTrigger>
            <TabsTrigger value="chat" className="text-xs"><MessageCircle className="h-3 w-3 mr-1" />Chat</TabsTrigger>
            <TabsTrigger value="photo" className="text-xs"><Image className="h-3 w-3 mr-1" />Animate</TabsTrigger>
          </TabsList>

          {/* Speech-to-text */}
          <TabsContent value="stt" className="mt-4 space-y-4">
            <div className="rounded-2xl bg-card p-4 text-center">
              <Mic className="h-10 w-10 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium mb-3">Upload audio to get a transcript</p>
              <Button className="rounded-xl" onClick={handleStt} disabled={sttState === 'processing'}>
                {sttState === 'processing' ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Processing...</> : 'Upload Audio (mock)'}
              </Button>
            </div>
            {sttState === 'done' && (
              <div className="rounded-2xl bg-card p-4">
                <p className="text-xs text-muted-foreground mb-1">Transcript</p>
                <p className="text-sm leading-relaxed">{mockTranscript}</p>
              </div>
            )}
          </TabsContent>

          {/* Text styling */}
          <TabsContent value="style" className="mt-4 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Raw speech / notes</p>
              <Textarea value={rawText} onChange={e => setRawText(e.target.value)} className="min-h-[80px]" />
            </div>
            <Button className="w-full rounded-xl" onClick={handleStyle} disabled={stylingState === 'processing'}>
              {stylingState === 'processing' ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Polishing...</> : <><Sparkles className="h-4 w-4 mr-1" /> Polish into Story</>}
            </Button>
            {stylingState === 'done' && (
              <div className="rounded-2xl bg-card p-4">
                <p className="text-xs text-muted-foreground mb-1">Polished story</p>
                <p className="text-sm leading-relaxed italic">{styledText}</p>
              </div>
            )}
          </TabsContent>

          {/* AI Chat */}
          <TabsContent value="chat" className="mt-4">
            <div className="rounded-2xl bg-card p-3 h-[300px] overflow-y-auto mb-3 space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Ask about your family..." className="flex-1 rounded-xl" onKeyDown={e => e.key === 'Enter' && handleChat()} />
              <Button size="icon" className="rounded-xl" onClick={handleChat}><Send className="h-4 w-4" /></Button>
            </div>
          </TabsContent>

          {/* Photo animation */}
          <TabsContent value="photo" className="mt-4 space-y-4">
            <div className="rounded-2xl bg-card p-4 text-center">
              <div className="aspect-square max-w-[200px] mx-auto rounded-xl bg-muted mb-3 overflow-hidden">
                <img src="https://picsum.photos/seed/angelo1/400/400" alt="Sample" className="h-full w-full object-cover" />
              </div>
              <p className="text-sm font-medium mb-3">Animate this photo</p>
              <Button className="rounded-xl" onClick={handleAnimate} disabled={animState === 'processing'}>
                {animState === 'processing' ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Animating...</> : <><Sparkles className="h-4 w-4 mr-1" /> Animate</>}
              </Button>
            </div>
            {animState === 'done' && (
              <div className="rounded-2xl bg-card p-4 text-center">
                <div className="aspect-square max-w-[200px] mx-auto rounded-xl bg-muted flex items-center justify-center mb-2">
                  <p className="text-muted-foreground text-sm">🎬 Animation ready</p>
                </div>
                <p className="text-xs text-muted-foreground">Mock animation result — video placeholder</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AIDemoPage;
