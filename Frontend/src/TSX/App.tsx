import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainMenu from './MainMenu';
import CrudMenu from './CrudMenu';
import '../CSS/App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="container">
        <header>
          <h1>MongoDB Hypixel stats</h1>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<MainMenu />} />
            <Route path="/crud" element={<CrudMenu />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;