import React from 'react';
import { isDemoMode } from '@/lib/demoMode';
import CreatePublication from '@/pages/CreatePublication';
import DemoAddPhoto from '@/pages/DemoAddPhoto';

const CreatePublicationEntry: React.FC = () => {
  return isDemoMode() ? <DemoAddPhoto /> : <CreatePublication />;
};

export default CreatePublicationEntry;

