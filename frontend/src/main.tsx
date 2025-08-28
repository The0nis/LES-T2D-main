import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/App.tsx';
import '@/index.css';

import AgoraRTC, { AgoraRTCProvider } from 'agora-rtc-react';

const agoraClient = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AgoraRTCProvider client={agoraClient}>
      <App />
    </AgoraRTCProvider>
  </StrictMode>
);
