import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

const container = document.getElementById('root');

if (container) {
  createRoot(container).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
