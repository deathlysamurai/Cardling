import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Canvas } from 'fabric';
import LZString from 'lz-string';

const CardlingView: React.FC = () => {
    const location = useLocation();
    const [cardling, setCardling] = useState(undefined);
    // const canvasRef = useRef<HTMLCanvasElement>(null);
    // const fabricCanvasRef = useRef<Canvas | null>(null);

    // useEffect(() => {
    //     if (!canvasRef.current) return;

    //     const pathParts = location.pathname.split('/');
    //     const encodedData = pathParts[pathParts.length - 1];

        
    //     if (encodedData && canvasRef.current) {
    //         // Dispose of previous Fabric canvas if it exists
    //         if (fabricCanvasRef.current) {
    //             fabricCanvasRef.current.dispose();
    //             fabricCanvasRef.current = null;
    //         }

    //         const decompressed = LZString.decompressFromEncodedURIComponent(encodedData);
    //         const data = JSON.parse(decompressed);

    //         // Create a new Fabric canvas and load the JSON
    //         const fabricCanvas = new Canvas(canvasRef.current);
    //         fabricCanvasRef.current = fabricCanvas;
    //         fabricCanvas.loadFromJSON(data.cardling, () => {
    //             fabricCanvas.renderAll();
    //         });
    //     }

    //     // Cleanup on unmount
    //     return () => {
    //         if (fabricCanvasRef.current) {
    //             fabricCanvasRef.current.dispose();
    //             fabricCanvasRef.current = null;
    //         }
    //     };
    // }, [location, canvasRef.current]);

    useEffect(() => {
        getURLEncodedData();
    }, [])

    const decodeLink = (encodedData: string) => {
        // const decodedData = atob(encodedData);
        // return JSON.parse(decodeURIComponent(decodedData));
        const decompressed = LZString.decompressFromEncodedURIComponent(encodedData);
        return JSON.parse(decompressed);
    };

    const getURLEncodedData = () => {
        const pathParts = location.pathname.split('/');
        const encodedData = pathParts[pathParts.length - 1];

        if (encodedData) {
            const decodedData = decodeLink(encodedData);
            setCardling(decodedData.cardling);
            console.log(decodedData.cardling)
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-4 left-0 right-0 px-4">
            <div className="max-w-md mx-auto">
            Hello
            </div>
        </div>

        Goodbye
        <img src={cardling} alt='User generated Cardling' />
        {/* <canvas ref={canvasRef} width={600} height={400} className="border-2 border-white rounded-lg shadow-lg bg-white" /> */}
        </div>
    );
};

export default CardlingView; 