
import './css/App.css'
import './css/index.css'
import Dashboard from './pages/Dashboard';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import NavBar from './components/NavBar';
import { BookProvider } from './context/BookProvider';
import {Routes, Route} from "react-router-dom"

function App() {
  return(
    <BookProvider>
      <NavBar />
      <main className = "main-content">
      <Routes>

          <Route path ="/" element={<Dashboard />} />
          <Route path ="/favorites" element={<Favorites />} />
          <Route path ="/profile" element={<Profile />} />

      </Routes>
    </main>
    </BookProvider>
    
  );
}

export default App
