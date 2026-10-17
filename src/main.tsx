import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import '@excalidraw/excalidraw/index.css';
import './styles.css';
window.EXCALIDRAW_ASSET_PATH=new URL('./',window.location.href).toString();
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
