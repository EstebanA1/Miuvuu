import './ImageEditor.css';
import 'cropperjs/dist/cropper.css';
import Cropper from 'react-cropper';
import React, { useState, useRef, useEffect } from 'react';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { Button } from '@mui/material';

const ImageEditor = ({ image, setImage, setImageEdited, onClose }) => {
    const cropperRef = useRef(null);
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [rotation, setRotation] = useState(0);
    const [imageURL, setImageURL] = useState(null);

    useEffect(() => {
        if (image) {
            if (typeof image === 'string') {
                setImageURL(image);
            } else {
                const url = URL.createObjectURL(image);
                setImageURL(url);
                return () => {
                    URL.revokeObjectURL(url);
                };
            }
        }
    }, [image]);

    useEffect(() => {
        const cropper = cropperRef.current?.cropper;
        if (cropper) {
            cropper.rotateTo(rotation);
        }
    }, [rotation]);

    const handleSave = () => {
        const cropper = cropperRef.current?.cropper;
        if (cropper) {
            const croppedCanvas = cropper.getCroppedCanvas();
            if (!croppedCanvas) return;

            const finalCanvas = document.createElement('canvas');
            finalCanvas.width = croppedCanvas.width;
            finalCanvas.height = croppedCanvas.height;
            const ctx = finalCanvas.getContext('2d');

            ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

            if (rotation !== 0) {
                ctx.save();
                ctx.translate(finalCanvas.width / 2, finalCanvas.height / 2);
                ctx.rotate((rotation * Math.PI) / 180);
                ctx.drawImage(
                    croppedCanvas,
                    -croppedCanvas.width / 2,
                    -croppedCanvas.height / 2,
                    croppedCanvas.width,
                    croppedCanvas.height
                );
                ctx.restore();
            } else {
                ctx.drawImage(croppedCanvas, 0, 0);
            }

            finalCanvas.toBlob((blob) => {
                if (blob) {
                    const editedFile = new File([blob], 'edited-image.png', { type: 'image/png' });
                    setImage(editedFile);
                    if (typeof setImageEdited === 'function') {
                        setImageEdited(true);
                    }
                    onClose();
                }
            }, 'image/png');
        }
    };


    return (
        <div className="modal image-editor-modal">
            <div className="modal-content image-editor-content">
                <h2 className="modal-title">Editar Imagen</h2>
                <div className="modal-body image-editor-body">
                    <div div className="editor-container">
                        <div className="image-container">
                            {imageURL && (
                                <Cropper
                                    src={imageURL}
                                    ref={cropperRef}
                                    style={{
                                        height: '100%',
                                        width: 'auto',
                                        filter: `brightness(${brightness}%) contrast(${contrast}%)`
                                    }}
                                    viewMode={1}
                                    guides={false}
                                    autoCropArea={1}
                                    responsive={true}
                                    background={false}
                                />
                            )}
                        </div>
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
                                <Button
                                    variant="contained"
                                    color="error"
                                    startIcon={<CloseIcon />}
                                    onClick={onClose}
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: '#b71c1c',
                                        }
                                    }}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="success"
                                    endIcon={<SaveIcon />}
                                    onClick={handleSave}
                                    sx={{
                                        color: 'success.main',
                                        borderColor: 'success.main',
                                        '&:hover': {
                                            backgroundColor: 'rgba(46, 125, 50, 0.04)',
                                            borderColor: '#2e7d32',
                                            color: '#2e7d32'
                                        }
                                    }}
                                >
                                    Guardar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageEditor;
