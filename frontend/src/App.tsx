// import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/home/HomePage.tsx';
import CreatePage from './pages/create/CreatePage.tsx';
import './App.css';
import Layout from "./components/Layout/Layout.tsx";
import SuperheroDetailPage from "./pages/superhero[id]/SuperheroDetailPage.tsx";
import EditSuperheroPage from "./pages/edit[id]/EditSuperheroPage.tsx";

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/create" element={<CreatePage />} />
                    <Route path="/superhero/:id" element={<SuperheroDetailPage />} />
                    <Route path="/edit/:id" element={<EditSuperheroPage />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Layout>
        </Router>
    );
}

const NotFound = () => (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
    </div>
);

export default App;
