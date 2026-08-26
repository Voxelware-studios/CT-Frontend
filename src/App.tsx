import { Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { EditorPage } from './pages/EditorPage';
import { DashboardPage } from './pages/DashboardPage';
import { HealthPage } from './pages/HealthPage';
import { Expired } from './pages/Expired';
import { NotFound } from './pages/NotFound';

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/e/:sessionId" element={<EditorPage />} />
        <Route path="/d/:sessionId" element={<DashboardPage />} />
        <Route path="/h/:serverId" element={<HealthPage />} />
        <Route path="/h" element={<HealthPage />} />
        <Route path="/expired" element={<Expired />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
