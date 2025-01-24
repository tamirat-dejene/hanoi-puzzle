// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import TowerOfHanoi from './App.tsx'
import './index.css';

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
    <TowerOfHanoi />
  // </StrictMode>,
);
