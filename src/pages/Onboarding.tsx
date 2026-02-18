import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AvatarPlaceholder } from '@/components/AvatarPlaceholder';
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

  const handleNext = () => { if (validate()) navigate('/tree'); };

  const field = (key: keyof typeof form, label: string, required = false, type = 'text') => (
    <div>
      <Label htmlFor={key}>{label}{required && ' *'}</Label>
      {key === 'about' ? (
        <Textarea id={key} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="mt-1" placeholder="Tell your family about yourself..." />
      ) : (
        <Input id={key} type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="mt-1" />
      )}
      {errors[key] && <p className="text-destructive text-xs mt-0.5">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 pt-6 pb-8">
      <h1 className="text-2xl font-bold mb-1">Your Profile</h1>
      <p className="text-muted-foreground text-sm mb-6">Tell your family a bit about you</p>

      <div className="flex justify-center mb-6">
        <div className="relative">
          <AvatarPlaceholder size="xl" name="?" />
          <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
            <Camera className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {field('lastName', 'Last Name', true)}
        {field('firstName', 'First Name', true)}
        {field('middleName', 'Middle Name')}
        {field('birthDate', 'Birth Date', true, 'date')}
        {field('city', 'City')}
        {field('about', 'About')}
      </div>

      <div className="mt-8 flex gap-3">
        <Button variant="outline" className="flex-1 rounded-xl h-11" onClick={() => navigate('/tree')}>Skip</Button>
        <Button className="flex-1 rounded-xl h-11" onClick={handleNext}>Next</Button>
      </div>
    </div>
  );
};

export default Onboarding;
