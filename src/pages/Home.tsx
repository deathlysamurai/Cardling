import React, { useEffect, useRef, useState } from 'react';
import PageTransition from '../components/PageTransition';

const Home: React.FC = () => {
    const [showTransition, setShowTransition] = useState(false);
    const initialFeatures = [
        { icon: '🎨', description: 'Customize your postcards with unique designs and messages.' },
        { icon: '📱', description: 'Download your Cardling for easy sharing.' },
        { icon: '🌍', description: 'Send your postcards digitally to anyone, anywhere!' },
        { icon: '💌', description: 'Perfect for any occasion—birthdays, holidays, or just because!' },
    ];

    const initialFavorites = [
        { src: '/images/Happy_Birthday_Cardling.png', alt: 'Postcard Example 1'},
        { src: '/images/I_Love_You_Cardling.png', alt: 'Postcard Example 2'},
        { src: '/images/Summer_Cardling.png', alt: 'Postcard Example 3'},
        { src: '/images/Plant_Cardling.png', alt: 'Postcard Example 4'},
    ]

    const [features] = useState(initialFeatures);
    const [favorites] = useState(initialFavorites);
    const featureMarqueeRef = useRef<HTMLDivElement>(null);
    const favoriteMarqueeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        handleMarquee(featureMarqueeRef.current, "FEATURE");
        handleMarquee(favoriteMarqueeRef.current, "FAVORITE");        
    });

    const handleMarquee = async (marquee: HTMLDivElement | null, marqueeType: string) => {
        if (marquee) {
            const newHeight = marquee.children[0].clientHeight + 10;
            marquee.style.height = newHeight + 'px';
            if (marqueeType === "FAVORITE") {
                const allImagesLoaded = Array.from(marquee.children).map(async (child: any, index) => {
                    return await setupMarqueeChildren(child, index);
                });
                Promise.all(allImagesLoaded).then(() => {
                    moveMarquee(marquee, marqueeType);
                });
            }
            else {
                let previousWidth = 0;
                Array.from(marquee.children).forEach((child: any) => {
                    let positionOffset = previousWidth;
                    child.style.transform = `translateX(${positionOffset}px)`;
                    previousWidth += child.clientWidth + 10;
                });
                moveMarquee(marquee, marqueeType);
            }
        }
    }

    const moveMarquee = (marquee: HTMLDivElement, marqueeType: string) => {
        let totalMarqueeWidth = 0;
        let childrenWidthsChecked = 0;
        const animateMarquee = () => {
            Array.from(marquee.children).forEach((child: any, index) => {
                let currentPosition = parseInt(child.style.transform?.split('(')[1]?.split(')')[0] || 0);
                let newPosition = currentPosition - 1;
                child.style.transform = `translateX(${newPosition}px)`;
                if (childrenWidthsChecked < marquee.children.length) {
                    childrenWidthsChecked++;
                    totalMarqueeWidth += child.clientWidth;
                }
                if (index === 0) {
                    if (Math.abs(newPosition) > (child.clientWidth + 40)) {
                        if (marqueeType === "FEATURE") {
                            newPosition = currentPosition + (marquee.children.length * 10) + totalMarqueeWidth;
                        } else {
                            newPosition = currentPosition + ((child.clientWidth + 10) * marquee.children.length);
                        }
                        child.style.transform = `translateX(${newPosition}px)`;
                        let moveChild = marquee.children[0];
                        marquee.removeChild(moveChild);
                        marquee.appendChild(moveChild);
                    }
                }
            });           
            let playAnimationFrame = true;
            if (marqueeType === "FEATURE") {
                playAnimationFrame = !playAnimationFrame;
            }
            if (playAnimationFrame) {
                requestAnimationFrame(animateMarquee);
            } else {
                setTimeout(() => {
                    requestAnimationFrame(animateMarquee);
                }, 20)
            }
        };
        animateMarquee();
    }

    const setupMarqueeChildren = (child: any, index: number) => {
        return new Promise((resolve) => {
            child.onload = () => {
                let positionOffset = (child.clientWidth + 10) * index;
                child.style.transform = `translateX(${positionOffset}px)`;
                resolve(null);
            }
        });
    }

    const getStarted = () => {
        setShowTransition(true);
    }
    
    return (
        <>
            {showTransition && <PageTransition to="/create" />}
            <div className='flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300'>
                <div className="flex flex-col md:flex-row items-stretch justify-center gap-2 p-2 w-full">
                    <header className="flex flex-col items-center text-center p-10 rounded-lg shadow-lg bg-white bg-opacity-90 w-full md:w-1/2">
                        <h1 className="flex flex-wrap justify-center text-5xl items-end font-extrabold text-gray-800 mb-2">
                            <img src="/logo-big.png" alt="Logo" className="w-[4rem]" />
                            Cardling
                        </h1>
                        <p className="text-xl text-gray-600 mb-4">Share your heart, one Cardling at a time</p>
                        <div className="overflow-hidden w-full">
                            <div ref={featureMarqueeRef} className="flex whitespace-nowrap relative">
                                {features.map((feature, index) => (
                                    <div key={index} className="flex items-center bg-gray-100 p-4 rounded-lg shadow-md transition-transform duration-0 transform hover:scale-105 mx-2 absolute">
                                        <span className="text-4xl mr-4">{feature.icon}</span>
                                        <span>{feature.description}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className='grow flex items-center w-full justify-center'>
                            <button onClick={getStarted} type="submit" className="bg-pink-500 text-white p-3 rounded hover:bg-pink-600 transition duration-300 w-[50%]">
                                Get Started
                            </button>
                        </div>
                    </header>

                    <section className="max-w-4xl text-center p-8 bg-white bg-opacity-90 rounded-lg shadow-lg w-full md:w-1/2">
                        <p className="text-lg text-gray-600 mb-6">
                            Cardling allows you to express your creativity and connect with friends and family in a unique way. 
                            Whether it's a birthday, holiday, or just a friendly hello, our platform makes it easy to create beautiful postcards that stand out.
                        </p>
                        <p className="text-lg text-gray-600 mb-4">Check out some of our favorite postcard designs:</p>
                        <div className="overflow-hidden w-full">
                            <div ref={favoriteMarqueeRef} className="flex items-center relative">
                                {favorites.map((favorite, index) => (
                                    <img key={index} src={favorite.src} alt={favorite.alt} className="h-32 object-cover rounded-lg shadow-md transition-transform duration-0 transform hover:scale-105 mx-2 absolute" />
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
                <footer className="text-gray-700">
                    <p>© 2025 Cardling. All rights reserved.</p>
                </footer>
            </div>
        </>
    );
};

export default Home;
