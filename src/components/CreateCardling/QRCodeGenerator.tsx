import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeGeneratorProps {
    link: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ link }) => {
    return (
        <div className="text-center mt-4">
            <h3 className="text-lg font-semibold">Share this postcard:</h3>
            <QRCodeSVG value={link} size={200} className="mx-auto" />
            <p className="mt-2">Scan the QR code or share the link!</p>
        </div>
    );
};

export default QRCodeGenerator;
