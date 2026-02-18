import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft } from 'lucide-react';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [dataProcessing, setDataProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!value.trim()) { setError('Please enter your phone or email'); return; }
    if (!value.includes('@') && !/^\+?\d{7,}$/.test(value.replace(/\s/g, ''))) { setError('Invalid format'); return; }
    if (!terms || !privacy || !dataProcessing) { setError('Please accept all required consents'); return; }
    setError('');
    navigate('/confirm-code', { state: { contact: value, mode: 'register' } });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 pt-6">
      <button onClick={() => navigate(-1)} className="mb-12 flex items-center gap-2 text-muted-foreground/60 hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span className="text-xs tracking-widest uppercase font-light">Back</span>
      </button>

      <h1 className="editorial-title text-3xl mb-2">Create Account</h1>
      <p className="text-sm font-light text-muted-foreground mb-12">Join your family on Angelo</p>

      <div className="space-y-8">
        <div>
          <Label htmlFor="contact" className="text-xs tracking-wider uppercase font-light text-muted-foreground">
            Phone or Email
          </Label>
          <Input
            id="contact"
            placeholder="+39 333 123 4567 or you@email.com"
            value={value}
            onChange={e => { setValue(e.target.value); setError(''); }}
            className="mt-2 rounded-none border-0 border-b border-border bg-transparent px-0 text-sm font-light focus-visible:ring-0 focus-visible:border-foreground"
          />
        </div>

        <div className="space-y-4">
          <label className="flex items-start gap-3 text-sm font-light">
            <Checkbox checked={terms} onCheckedChange={v => setTerms(!!v)} className="mt-0.5" />
            <span>I agree to the <span className="underline cursor-pointer">Terms of Service</span> *</span>
          </label>
          <label className="flex items-start gap-3 text-sm font-light">
            <Checkbox checked={privacy} onCheckedChange={v => setPrivacy(!!v)} className="mt-0.5" />
            <span>I agree to the <span className="underline cursor-pointer">Privacy Policy</span> *</span>
          </label>
          <label className="flex items-start gap-3 text-sm font-light">
            <Checkbox checked={dataProcessing} onCheckedChange={v => setDataProcessing(!!v)} className="mt-0.5" />
            <span>I consent to data processing *</span>
          </label>
        </div>

        {error && <p className="text-destructive text-xs font-light">{error}</p>}

        <button onClick={handleSubmit} className="w-full h-12 bg-foreground text-background text-sm font-light tracking-widest uppercase hover:bg-foreground/80 transition-all duration-300">
          Get Code
        </button>
      </div>
    </div>
  );
};

export default Register;
