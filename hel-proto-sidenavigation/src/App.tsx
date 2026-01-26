import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CurrentDemo } from './CurrentDemo';
import { V2Demo } from './V2Demo';
import { V3Demo } from './V3Demo';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<CurrentDemo />} />
        <Route path="/v2" element={<V2Demo />} />
        <Route path="/v3" element={<V3Demo />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
