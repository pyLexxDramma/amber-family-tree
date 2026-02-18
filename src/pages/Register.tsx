import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
    <div className="flex min-h-screen flex-col bg-background px-6 pt-4">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-1 text-muted-foreground text-sm">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <h1 className="text-2xl font-bold mb-1">Create Account</h1>
      <p className="text-muted-foreground text-sm mb-8">Join your family on Angelo</p>
      <div className="space-y-4">
        <div>
          <Label htmlFor="contact">Phone or Email</Label>
          <Input id="contact" placeholder="+39 333 123 4567 or you@email.com" value={value} onChange={e => { setValue(e.target.value); setError(''); }} className="mt-1.5" />
        </div>

        <div className="space-y-3 pt-2">
          <label className="flex items-start gap-2.5 text-sm">
            <Checkbox checked={terms} onCheckedChange={v => setTerms(!!v)} className="mt-0.5" />
            <span>I agree to the <span className="text-primary underline cursor-pointer">Terms of Service</span> *</span>
          </label>
          <label className="flex items-start gap-2.5 text-sm">
            <Checkbox checked={privacy} onCheckedChange={v => setPrivacy(!!v)} className="mt-0.5" />
            <span>I agree to the <span className="text-primary underline cursor-pointer">Privacy Policy</span> *</span>
          </label>
          <label className="flex items-start gap-2.5 text-sm">
            <Checkbox checked={dataProcessing} onCheckedChange={v => setDataProcessing(!!v)} className="mt-0.5" />
            <span>I consent to data processing *</span>
          </label>
        </div>

        {error && <p className="text-destructive text-xs">{error}</p>}
        <Button className="w-full rounded-xl h-11" onClick={handleSubmit}>Get Code</Button>
      </div>
    </div>
  );
};

export default Register;
