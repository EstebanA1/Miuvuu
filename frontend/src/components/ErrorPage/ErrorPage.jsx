import React from 'react';
import './ErrorPage.css';
import { AxiosError } from 'axios';

console.log('Detalles: ' + AxiosError);

const ErrorPage = () => (
    <div className="error-page">
        <h2>Error 404</h2>
        <p>Ocurrio un error inesperado</p>
    </div>
);

export default ErrorPage;
