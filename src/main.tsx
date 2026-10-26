import './index.css';
import '@core/i18n/index.ts';
import '@core/imports.ts';
import '@module/imports.ts';

import { createRoot } from 'react-dom/client';

import App from './App.tsx';
/**
 * The `root` variable references a DOM element with the ID 'root'.
 * It is used as the entry point for operations or manipulations
 * within the specified section of the document. This typically
 * involves rendering or interacting with content inside this element.
 */
const root = document.getElementById('root');

createRoot(root!).render(<App />);
