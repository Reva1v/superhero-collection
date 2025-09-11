// import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/home/HomePage.tsx';
// import CreateHero from './pages/CreateHero/CreateHero';
// import HeroDetails from './pages/HeroDetails/HeroDetails';
// import EditHero from './pages/EditHero/EditHero';
import './App.css';
import Layout from "./components/Layout/Layout.tsx";

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    {/*<Route path="/create" element={<CreateHero />} />*/}
                    {/*<Route path="/superhero/:id" element={<HeroDetails />} />*/}
                    {/*<Route path="/edit/:id" element={<EditHero />} />*/}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Layout>
        </Router>
    );
}

// Простой компонент для 404 страницы
const NotFound = () => (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
    </div>
);

export default App;
