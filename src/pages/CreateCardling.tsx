import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from 'fabric';
import CardlingPreview from '../components/CreateCardling/CardlingPreview';
import CardlingToolbar from '../components/CreateCardling/CardlingToolbar';
import StateManager from '../classes/StateManager';
import { useNavigate } from 'react-router-dom';
import LZString from 'lz-string';

const CreateCardling: React.FC = () => {
    const navigate = useNavigate();
    const [canvas, setCanvas] = useState<Canvas | null>(null);
    const [link, setLink] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [url, setURL] = useState('');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const stateManagerRef = useRef<StateManager | null>(null);

    useEffect(() => {
        const fabricCanvas = new Canvas(canvasRef.current!);       
        setCanvas(fabricCanvas);   
        stateManagerRef.current = new StateManager(fabricCanvas);
        
        const handleCanvasEvent = () => {
            if (stateManagerRef.current) {
                stateManagerRef.current.saveState();
                fabricCanvas?.renderAll();
            }
        };

        // Add event listeners
        fabricCanvas.on("object:added", handleCanvasEvent);
        fabricCanvas.on("object:modified", handleCanvasEvent);

        // Save initial state
        stateManagerRef.current.saveState();

        return () => {
            // Remove event listeners
            fabricCanvas.off("object:added", handleCanvasEvent);
            fabricCanvas.off("object:modified", handleCanvasEvent);
            fabricCanvas.dispose();
        };
    }, [canvasRef, setCanvas, stateManagerRef]);

    const createCardling = () => {
        if (!canvas) return;
        const data = {
            cardling: canvas.toDataURL(),
        };
        const json = JSON.stringify(data);
        const compressed = LZString.compressToEncodedURIComponent(json);
        let compressedURL = `${window.location.origin}${process.env.PUBLIC_URL || ''}/#/view/${compressed}`;
        console.log(compressedURL);
        setURL(compressedURL);
        setShowModal(true);
    };

    return (
        <div className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 h-fit">
            <div className="flex flex-col md:flex-row items-stretch justify-start gap-2 w-[calc(100vw-10px)] h-[calc(100vh-10px)] mt-[5px] mb-[5px] min-h-fit md:min-h-[unset] relative">
                <img onClick={() => navigate("/")} src="/logo-small.png" alt="Logo" className="absolute w-[25px] p-[5px] cursor-pointer hover:scale-105" />
                <CardlingToolbar 
                    createCardling={createCardling} 
                    canvas={canvas} 
                    stateManager={stateManagerRef.current} 
                />
                <CardlingPreview canvasRef={canvasRef} canvas={canvas} />
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center z-50 py-2">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 overflow-scroll">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Share</h2>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        {/* <QRCodeSVG value={url} size={200} className="mx-auto" /> */}
                        <div className="bg-gray-100 p-4 rounded break-all">
                            <p className="text-sm">{url}</p>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CreateCardling;