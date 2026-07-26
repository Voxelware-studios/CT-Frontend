import { Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { EditorPage } from './pages/EditorPage';
import { Expired } from './pages/Expired';
import { NotFound } from './pages/NotFound';

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/e/:sessionId" element={<EditorPage />} />
        <Route path="/expired" element={<Expired />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
