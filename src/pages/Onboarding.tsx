import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Camera } from 'lucide-react';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ lastName: '', firstName: '', middleName: '', birthDate: '', city: '', about: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.birthDate) e.birthDate = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validate()) navigate('/'); };

  const field = (key: keyof typeof form, label: string, required = false, type = 'text') => (
    <div>
      <Label htmlFor={key} className="text-xs tracking-wider uppercase font-light text-muted-foreground">
        {label}{required && ' *'}
      </Label>
      {key === 'about' ? (
        <Textarea
          id={key}
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="mt-2 rounded-none border-0 border-b border-border bg-transparent px-0 text-sm font-light focus-visible:ring-0 focus-visible:border-foreground resize-none"
          placeholder="Tell your family about yourself..."
        />
      ) : (
        <Input
          id={key}
          type={type}
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="mt-2 rounded-none border-0 border-b border-border bg-transparent px-0 text-sm font-light focus-visible:ring-0 focus-visible:border-foreground"
        />
      )}
      {errors[key] && <p className="text-destructive text-xs mt-1 font-light">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 pt-8 pb-8">
      <h1 className="editorial-title text-3xl mb-2">Your Profile</h1>
      <p className="text-sm font-light text-muted-foreground mb-10">Tell your family a bit about you</p>

      <div className="flex justify-center mb-10">
        <div className="relative">
          <div className="h-24 w-24 bg-secondary flex items-center justify-center">
            <span className="text-2xl font-serif text-foreground/30">?</span>
          </div>
          <button className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center bg-foreground text-background">
            <Camera className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {field('lastName', 'Last Name', true)}
        {field('firstName', 'First Name', true)}
        {field('middleName', 'Middle Name')}
        {field('birthDate', 'Birth Date', true, 'date')}
        {field('city', 'City')}
        {field('about', 'About')}
      </div>

      <div className="mt-12 flex gap-3">
        <button
          onClick={() => navigate('/')}
          className="flex-1 h-12 border border-foreground/20 text-sm font-light tracking-widest uppercase hover:bg-foreground hover:text-background transition-all duration-300"
        >
          Skip
        </button>
        <button
          onClick={handleNext}
          className="flex-1 h-12 bg-foreground text-background text-sm font-light tracking-widest uppercase hover:bg-foreground/80 transition-all duration-300"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
