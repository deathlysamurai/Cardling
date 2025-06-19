import React, { useState, useEffect, useRef, act } from 'react';
import { Canvas, FabricImage, IText, PencilBrush, Line } from 'fabric';
import CreateCardling from '../../pages/CreateCardling';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import StateManager from '../../classes/StateManager';

interface CardlingToolbarProps {
    createCardling: () => void,
    canvas: Canvas | null,
    stateManager: StateManager | null
}

const CardlingToolbar: React.FC<CardlingToolbarProps> = ({createCardling, canvas, stateManager}) => {
    const [link, setLink] = useState('');
    const [bgColor, setBgColor] = useState('');
    const [textColor, setTextColor] = useState('#000000');
    const [textBackgroundColor, setTextBackgroundColor] = useState('');
    const [textFont, setTextFont] = useState('Arial');
    const [brushColor, setBrushColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(5);
    const [drawingMode, setDrawingMode] = useState(false);
    const [openTextEdit, setOpenTextEdit] = useState(false);
    const bgColorInputRef = useRef<HTMLInputElement>(null);

    const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    const getContrastColor = (bgColor: string): string => {
        const rgb = hexToRgb(bgColor);
        if (!rgb) return '#007bff'; // Default blue if color parsing fails

        // Calculate relative luminance
        const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
        
        // Return dark blue for light backgrounds, light blue for dark backgrounds
        return luminance > 0.5 ? '#0056b3' : '#66b3ff';
    };

    const checkCenterAlignment = (canvas: Canvas, activeObject: any) => {
        const centerX = canvas.width! / 2;
        const centerY = canvas.height! / 2;
        const threshold = 10; // pixels

        var objLeftCheck = 0;
        var newObjLeft = 0;
        if (activeObject.originX == "left") {
            objLeftCheck = activeObject.left + (activeObject.width / 2);
            newObjLeft = centerX - (activeObject.width / 2);
        } else {
            objLeftCheck = activeObject.left;
            newObjLeft = centerX;
        }

        // Check horizontal center alignment
        if (Math.abs(objLeftCheck - centerX) < threshold) {
            activeObject.set('left', newObjLeft);
        }

        var objTopCheck = 0;
        var newObjTop = 0;
        if (activeObject.originY == "top") {
            objTopCheck = activeObject.top + (activeObject.height / 2);
            newObjTop = centerY - (activeObject.height / 2);
        } else {
            objTopCheck = activeObject.top;
            newObjTop = centerY;
        }

        // Check vertical center alignment
        if (Math.abs(objTopCheck - centerY) < threshold) {
            activeObject.set('top', newObjTop);
        }
    };

    useEffect(() => {
        if (canvas) {
            const brush = new PencilBrush(canvas);
            brush.color = 'black';
            brush.width = 5;
            canvas.freeDrawingBrush = brush;

            // Set selection styling
            canvas.selectionColor = 'rgba(0, 123, 255, 0.3)';
            canvas.selectionBorderColor = '#007bff';
            canvas.selectionLineWidth = 2;

            // Add event listener for new objects
            canvas.on('object:added', (e) => {
                const obj = e.target;
                if (obj) {
                    const borderColor = getContrastColor(bgColor || '#ffffff');
                    obj.set({
                        borderColor: borderColor,
                        cornerColor: borderColor,
                        cornerSize: 12,
                        transparentCorners: false,
                        cornerStyle: 'circle',
                        padding: 5
                    });
                }
            });

            // Add rotation snapping
            canvas.on('object:rotating', (e) => {
                const activeObject = e.target;
                if (activeObject) {
                    var drawnObjectCheck = activeObject as any;
                    if (!drawnObjectCheck.path) {
                        const angle = activeObject.angle!;
                        const snapThreshold = 10; // degrees

                        // Find the nearest 90-degree angle
                        const nearestAngle = Math.round(angle / 90) * 90;
                        
                        // If we're close to a 90-degree angle, snap to it
                        if (Math.abs(angle - nearestAngle) < snapThreshold) {
                            activeObject.set('angle', nearestAngle);
                            canvas.renderAll();
                        }
                    }
                }
            });

            // Add alignment guides
            canvas.on('object:moving', (e) => {
                const activeObject = e.target;
                if (activeObject) {
                    checkCenterAlignment(canvas, activeObject);
                    canvas.renderAll();
                }
            });

            canvas.renderAll();
        }
    }, [canvas, bgColor]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                handleUndo();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                e.preventDefault();
                handleRedo();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                e.preventDefault();
                handleCopy();
            }
            // if (e.key === 'Delete' || e.key === 'Backspace') {
            //     e.preventDefault();
            //     handleDeleteSelected();
            // }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [stateManager]);

    useEffect(() => {
        if (canvas) {
            canvas.backgroundColor = bgColor;
            if (stateManager) {
                stateManager.saveState();
            }

            // Update borders of all objects when background changes
            const borderColor = getContrastColor(bgColor || '#ffffff');
            canvas.getObjects().forEach(obj => {
                obj.set({
                    borderColor: borderColor,
                    cornerColor: borderColor
                });
            });

            canvas.renderAll();
        }
    }, [bgColor]);

    useEffect(() => {
        if (canvas && canvas.freeDrawingBrush) {
            canvas.freeDrawingBrush.color = brushColor;
            canvas.renderAll();
        }
    }, [brushColor]);

    useEffect(() => {
        if (canvas && canvas.freeDrawingBrush) {
            canvas.freeDrawingBrush.width = brushSize;
            canvas.renderAll();
        }
    }, [brushSize]);

    useEffect(() => {
        if (canvas) {
            const activeObject = canvas.getActiveObject();
            if (activeObject && activeObject.type === 'i-text') {
                activeObject.set('fill', textColor);
                if (stateManager) {
                    stateManager.saveState();
                }
                canvas.renderAll();
            }
        }
    }, [textColor, canvas]);

    useEffect(() => {
        if (canvas) {
            const activeObject = canvas.getActiveObject();
            if (activeObject && activeObject.type === 'i-text') {
                activeObject.set('backgroundColor', textBackgroundColor);
                if (stateManager) {
                    stateManager.saveState();
                }
                canvas.renderAll();
            }
        }
    }, [textBackgroundColor, canvas]);

    useEffect(() => {
        if (canvas) {
            const activeObject = canvas.getActiveObject();
            if (activeObject && activeObject.type === 'i-text') {
                activeObject.set('fontFamily', textFont);
                if (stateManager) {
                    stateManager.saveState();
                }
                canvas.renderAll();
            }
        }
    }, [textFont, canvas]);

    const addText = () => {
        const text = new IText('Edit this text', {
            backgroundColor: textBackgroundColor,
            fill: textColor,
            fontFamily: textFont,
            left: canvas?.width ? canvas.width / 2 : 0,
            top: canvas?.height ? canvas.height / 2 : 0,
            originX: 'center',
            originY: 'center'
        });
        canvas?.add(text);
        canvas?.centerObject(text);
        canvas?.setActiveObject(text);
        canvas?.renderAll();
    };

    const clearAll = () => {
        if(window.confirm('Are you sure you want to clear all?')) {
            canvas?.remove(...canvas.getObjects());
            setBgColor('');
        }
    };

    const fileHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {   
                const imgURL = e.target?.result as string;            
                const image = await FabricImage.fromURL(imgURL, { crossOrigin: 'anonymous' });
                image.set({
                    left: canvas?.width ? canvas.width / 2 : 0,
                    top: canvas?.height ? canvas.height / 2 : 0,
                    originX: 'center',
                    originY: 'center'
                });
                image.scale(0.5);
                canvas?.add(image);
                canvas?.centerObject(image);
                canvas?.setActiveObject(image);
                canvas?.renderAll();
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const toggleDrawingMode = () => {
        if (canvas) {
            canvas.isDrawingMode = !canvas.isDrawingMode;
            setDrawingMode(canvas.isDrawingMode);
        }
    };

    const downloadImage = () => {
        if (canvas) {
            const link = document.createElement('a');
            link.download = 'photo_editor_image.png';
            link.href = canvas.toDataURL();
            link.click();
        }
    };

    const handleUndo = () => {
        if (canvas) {
            stateManager?.undo(canvas);
        }
    };
        
    const handleRedo = () => {
        if (canvas) {
            stateManager?.redo(canvas);
        }
    };

    const handleCopy = async () => {
        const activeObjects = canvas?.getActiveObjects();
        if (activeObjects) {
            activeObjects.forEach(async (object) => {
                const cloned = await object.clone();
                if (activeObjects.length > 1) {
                    cloned.set({
                        left: canvas?.width ? (canvas.width / 2) + object.left : object.left, 
                        top: canvas?.height ? (canvas.height / 2) + object.top : object.top,
                        originX: 'left',
                        originY: 'top'
                    });
                } else {
                    cloned.set({
                        left: canvas?.width ? (canvas.width / 2) : 0, 
                        top: canvas?.height ? (canvas.height / 2) : 0,
                        originX: 'center',
                        originY: 'center'
                    });
                }
                canvas?.add(cloned);
        
            });
            canvas?.renderAll();
        }
    };

    const handleBGInput = () => {
        if (bgColorInputRef.current) {
            bgColorInputRef.current.click();
        }
    }

    const handleTextEdit = () => {
        setOpenTextEdit(prev => !prev);
    }

    const handleDeleteSelected = () => {
        if (canvas) {
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                canvas.remove(activeObject);
                if (stateManager) {
                    stateManager.saveState();
                }
                canvas.renderAll();
            }
        }
    };

    return (
        <div className="toolbar w-full md:w-fit bg-white p-6 rounded-lg shadow-lg flex flex-row md:flex-col justify-between gap-2">
            <div className='flex flex-row md:flex-col gap-2 overflow-auto hide-scrollbar'>
                <div className='flex flex-row gap-2 w-fit md:w-full justify-between'>
                    <button
                        title="Undo"
                        onClick={handleUndo}
                        className='border border-black rounded p-2 hover:bg-blue-100'
                    >
                        <FontAwesomeIcon icon="undo" />
                    </button>
                    <button
                        title="Redo"
                        onClick={handleRedo}
                        className='border border-black rounded p-2 hover:bg-blue-100'
                    >
                        <FontAwesomeIcon icon="redo" />
                    </button>
                </div>
                <button title="Drawing mode" onClick={toggleDrawingMode} className={`border border-black rounded p-2 hover:bg-blue-100 ${drawingMode ? 'bg-blue-300' : ''}`}>
                    <FontAwesomeIcon icon="pencil" />
                </button>
                <div className={`${drawingMode ? '' : 'hidden'}`}>
                    <button className='flex flex-row items-center justify-between' title="Change brush color">
                        <FontAwesomeIcon icon="palette" />
                        <input 
                        type="color" 
                        value={brushColor} 
                        onChange={(e) => setBrushColor(e.target.value)} 
                        className="border border-gray-300 rounded"
                        />
                    </button>
                    <button className='flex flex-row items-center justify-between' title="Change brush size">
                        <FontAwesomeIcon icon="brush" />
                        <input 
                            type="range" 
                            min="1" 
                            max="50" 
                            value={brushSize} 
                            onChange={(e) => setBrushSize(Number(e.target.value))} 
                            className="w-full"
                        />
                    </button>
                </div>
                <button onClick={handleBGInput} className='border border-black rounded p-2 hover:bg-blue-100' title="Change background">
                    <FontAwesomeIcon icon="palette" />
                    <input 
                        ref={bgColorInputRef}
                        type="color" 
                        value={bgColor} 
                        onChange={(e) => setBgColor(e.target.value)} 
                        className="border border-gray-300 rounded hidden"
                    />
                </button>
                <button title="Add text" onClick={handleTextEdit} className={`flex items-center justify-center border border-black rounded p-2 hover:bg-blue-100 relative ${openTextEdit ? 'bg-blue-300' : ''}`}>
                    <FontAwesomeIcon icon="font" />
                    <FontAwesomeIcon icon="caret-down" />
                </button>
                <div className={`flex flex-row md:flex-col gap-2 ${openTextEdit ? '' : 'hidden'}`}>
                    <div className='flex flex-row md:flex-col gap-1'>
                        <div>
                            <button className='flex flex-row items-center justify-between w-full' title="Change text color">
                                <div className='flex gap-1'>
                                    <FontAwesomeIcon icon="font" />
                                </div>
                                <input 
                                    type="color" 
                                    value={textColor} 
                                    onChange={(e) => setTextColor(e.target.value)} 
                                    className="border border-gray-300 rounded"
                                />
                            </button>
                            <button className='flex flex-row items-center justify-between w-full' title="Change text background color">
                                <div className='flex gap-1'>
                                    <FontAwesomeIcon icon="display" />
                                </div>
                                <input 
                                    type="color" 
                                    value={textBackgroundColor} 
                                    onChange={(e) => setTextBackgroundColor(e.target.value)} 
                                    className="border border-gray-300 rounded"
                                />
                            </button>
                        </div>
                        <div className='flex flex-row justify-between w-full gap-2 items-start' title="Change font">
                            <div>
                                <FontAwesomeIcon icon="font" />
                            </div>
                            <select 
                                value={textFont}
                                onChange={(e) => setTextFont(e.target.value)}
                                className="border border-gray-300 rounded w-full min-w-[60px] md:min-w-[unset]"
                            >
                                <option value="Arial">Arial</option>
                                <option value="Times New Roman">Times New Roman</option>
                                <option value="Courier New">Courier New</option>
                                <option value="Georgia">Georgia</option>
                                <option value="Verdana">Verdana</option>
                                <option value="Helvetica">Helvetica</option>
                                <option value="Comic Sans MS">Comic Sans MS</option>
                                <option value="Impact">Impact</option>
                            </select>
                        </div>
                    </div>
                    <button onClick={addText} className={`border border-black rounded p-1 w-full hover:bg-blue-300 ${openTextEdit ? 'bg-blue-100' : ''}`}>Add Text</button>
                </div>
                <button className='relative border border-black rounded p-2 hover:bg-blue-100' title="Add image">
                    <FontAwesomeIcon icon="image" />
                    <input
                    type="file"
                    accept=".png, .jpg, .jpeg"
                    onChange={fileHandler} />
                </button>
                <button
                    title="Copy"
                    onClick={handleCopy}
                    className='border border-black rounded p-2 hover:bg-blue-100'
                >
                    <FontAwesomeIcon icon="copy" />
                </button>
                <button
                    title="Delete selected"
                    onClick={handleDeleteSelected}
                    className='border border-black rounded p-2 hover:bg-blue-100'
                >
                    <FontAwesomeIcon icon="delete-left" />
                </button>
                {/* <button title="Download as image" onClick={downloadImage} className='border border-black rounded p-2 hover:bg-blue-100'>
                    <FontAwesomeIcon icon="download" />
                </button> */}
                <button title="Clear all" onClick={clearAll} className='border border-black rounded p-2 hover:bg-blue-100'>
                    <FontAwesomeIcon icon="trash" />
                </button>
            </div>
            <button onClick={downloadImage} type="submit" className="bg-pink-500 text-white p-3 rounded hover:bg-pink-600 transition duration-300">
                Download
            </button>
            {/* <button onClick={createCardling} type="submit" className="bg-pink-500 text-white p-3 rounded hover:bg-pink-600 transition duration-300">
                Create
            </button> */}
        </div>
    );
};

export default CardlingToolbar;