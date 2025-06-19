import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '../App';

interface PageTransitionProps {
    to: string;
    onComplete?: () => void;
}

const PageTransition: React.FC<PageTransitionProps> = ({ to, onComplete }) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const navigate = useNavigate();

    const getNextPage = () => {
        const route = routes.find(r => r.path === to || (r.path.includes(':') && to.startsWith(r.path.split(':')[0])));
        if (route) {
            const Component = route.element;
            return <Component />;
        }
        return null;
    };

    useEffect(() => {
        setIsAnimating(true);
        const timer = setTimeout(() => {
            navigate(to);
            if (onComplete) onComplete();
        }, 1000);

        return () => clearTimeout(timer);
    }, [to, navigate, onComplete]);

    return (
        <>
        { isAnimating ?
            <div className={`fixed inset-0 z-50 pointer-events-none ${isAnimating ? 'md:animate-wipe-left animate-wipe-down' : ''}`}>
                <div className="w-full h-full">
                    {getNextPage()}
                </div>
            </div> :
            null
        }
        </>
    );
};

export default PageTransition; 