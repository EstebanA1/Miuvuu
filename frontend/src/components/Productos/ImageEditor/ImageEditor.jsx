import './ImageEditor.css';
import 'cropperjs/dist/cropper.css';
import Cropper from 'react-cropper';
import React, { useState, useRef, useEffect } from 'react';

const ImageEditor = ({ image, setImage, setImageEdited, onClose }) => {
    const cropperRef = useRef(null);
    const [brightness, setBrightness] = useState(100); // Brillo a 100 por defecto
    const [contrast, setContrast] = useState(100); // Contraste a 100 por defecto
    const [rotation, setRotation] = useState(0);
    const [updatedImage, setUpdatedImage] = useState(null);

    const applyFilters = () => {
        if (!updatedImage) return;

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = img.width;
            canvas.height = img.height;

            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(rotation * Math.PI / 180);
            ctx.translate(-canvas.width / 2, -canvas.height / 2);

            ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
            ctx.drawImage(img, 0, 0, img.width, img.height);

            canvas.toBlob((filteredBlob) => {
                if (filteredBlob) {
                    setUpdatedImage(URL.createObjectURL(filteredBlob));
                }
            }, 'image/png');
        };
        img.src = updatedImage;
    };

    useEffect(() => {
        if (image && !updatedImage) {
            setUpdatedImage(URL.createObjectURL(image));
        }
    }, [image]);

    useEffect(() => {
        applyFilters();
    }, [brightness, contrast, rotation]);

    const handleSave = () => {
        const cropper = cropperRef.current?.cropper;
        const croppedCanvas = cropper?.getCroppedCanvas({
            width: 100,
            height: 100,
        });

        if (croppedCanvas) {
            croppedCanvas.toBlob((blob) => {
                if (blob) {
                    const filteredFile = new File([blob], 'edited-image.png', { type: 'image/png' });
                    setImage(filteredFile);
                    setImageEdited(true); 
                    onClose(); 
                }
            }, 'image/png');
        }
    };

    return (
        <div className="modal image-editor-modal">
            <div className="modal-content image-editor-content">
                <h2 className="modal-title">Editar Imagen</h2>
                
                {/* Nuevo div de modal-body */}
                <div className="modal-body image-editor-body">
                    <div className="editor-container">
                        <div className="image-container">
                            <Cropper
                                src={updatedImage || URL.createObjectURL(image)}
                                ref={cropperRef}
                                style={{ height: '100%', width: 'auto' }}
                                aspectRatio={1}
                                viewMode={1}
                                guides={false}
                                autoCropArea={1}
                                responsive={true}
                                background={false}
                                zoomTo={false}
                                rotateTo={rotation}
                            />
                        </div>
                        
                        {/* Nuevo div de slider-container */}
                        <div className="slider-container controls">
                            <div className="control brightness-control">
                                <label>Brillo:</label>
                                <input
                                    type="range"
                                    min="50"
                                    max="150"
                                    value={brightness}
                                    onChange={(e) => setBrightness(Number(e.target.value))}
                                />
                            </div>
                            <div className="control contrast-control">
                                <label>Contraste:</label>
                                <input
                                    type="range"
                                    min="50"
                                    max="150"
                                    value={contrast}
                                    onChange={(e) => setContrast(Number(e.target.value))}
                                />
                            </div>
                            <div className="control rotation-control">
                                <label>Rotación:</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="360"
                                    value={rotation}
                                    onChange={(e) => setRotation(Number(e.target.value))}
                                />
                            </div>
                            <div className="buttons control-buttons">
                                <button className="save-button" onClick={handleSave}>Guardar</button>
                                <button className="cancel-button" onClick={onClose}>Cancelar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageEditor;
