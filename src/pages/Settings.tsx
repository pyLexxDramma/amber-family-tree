import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Lock, Palette, Globe } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const Settings: React.FC = () => {
  const navigate = useNavigate();

  const items = [
    { icon: Bell, label: 'Notifications', desc: 'Push and email notifications' },
    { icon: Lock, label: 'Privacy', desc: 'Who can see your content' },
    { icon: Palette, label: 'Appearance', desc: 'Theme and display settings' },
    { icon: Globe, label: 'Language', desc: 'App language' },
  ];

  return (
    <div className="min-h-screen bg-background px-4 pt-4 pb-8">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-muted-foreground text-sm">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <h1 className="text-xl font-bold mb-4">Settings</h1>
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.label} className="flex items-center gap-3 rounded-xl bg-card p-3">
            <item.icon className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <Switch />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Settings;
