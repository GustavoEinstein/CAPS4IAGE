import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
// import Dashboard from './Dashboard'; // Faremos isso no próximo passo

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
      </Routes>
    </Router>
  );
}

export default App;