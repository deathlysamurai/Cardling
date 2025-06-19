import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import CreateCardling from './pages/CreateCardling';
import CardlingView from './pages/CardlingView';

// Define route configuration
export const routes = [
    { path: '/', element: Home },
    { path: '/create', element: CreateCardling },
    // { path: '/view/:encodedData', element: CardlingView }
    { path: '*', element: Home }
];

const App: React.FC = () => {
    return (
        <Router basename={process.env.PUBLIC_URL}>
        {/* <Router basename="/Cardling"> */}
            <Routes>
                {routes.map((route) => (
                    <Route 
                        key={route.path} 
                        path={route.path} 
                        element={<route.element />} 
                    />
                ))}
            </Routes>
        </Router>
    );
};

export default App;
