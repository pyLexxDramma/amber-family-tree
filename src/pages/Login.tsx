import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!value.trim()) { setError('Please enter your phone or email'); return; }
    if (!value.includes('@') && !/^\+?\d{7,}$/.test(value.replace(/\s/g, ''))) {
      setError('Invalid phone or email format');
      return;
    }
    setError('');
    navigate('/confirm-code', { state: { contact: value, mode: 'login' } });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 pt-4">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-1 text-muted-foreground text-sm">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <h1 className="text-2xl font-bold mb-1">Sign In</h1>
      <p className="text-muted-foreground text-sm mb-8">Enter your phone number or email</p>
      <div className="space-y-4">
        <div>
          <Label htmlFor="contact">Phone or Email</Label>
          <Input id="contact" placeholder="+39 333 123 4567 or you@email.com" value={value} onChange={e => { setValue(e.target.value); setError(''); }} className="mt-1.5" />
          {error && <p className="text-destructive text-xs mt-1">{error}</p>}
        </div>
        <Button className="w-full rounded-xl h-11" onClick={handleSubmit}>Get Code</Button>
      </div>
    </div>
  );
};

export default Login;
