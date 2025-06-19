import { Canvas } from 'fabric/*';
import React, { useEffect, useRef, useState } from 'react';

interface CardlingPreviewProps {
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    canvas: Canvas | null,
}

const CardlingPreview: React.FC<CardlingPreviewProps> = ({ canvasRef, canvas }) => {
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const parentRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        resizeCanvas();

        window.addEventListener('resize', resizeCanvas);

        return () => {
        window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    useEffect(() => {
        if (canvas) {
            canvas.setDimensions({
              width: dimensions.width,
              height: dimensions.height,
            });
        }
    }, [canvas, dimensions])

    const resizeCanvas = () => {
        if (parentRef.current) {
            setDimensions({ width: parentRef.current.clientWidth, height: parentRef.current.clientHeight });
        }
    }

    return (
        <div className='w-full aspect-[3/2]' ref={parentRef}>
            <canvas 
                ref={canvasRef} 
                width={width} 
                height={height} 
                className="border-2 border-black rounded-lg"
            />
        </div>
    );
};

export default CardlingPreview;
