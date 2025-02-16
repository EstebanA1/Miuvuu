import { sendWelcomeEmail } from "../../../services/emailService";
import React, { useState } from "react";
import "./Footer.css";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!email) {
      alert("Por favor, ingresa un correo electrónico válido.");
      return;
    }

    setIsLoading(true);

    try {
      await sendWelcomeEmail(email);
      alert("El correo ha sido enviado.");
      setEmail("");
    } catch (error) {
      console.error("Error al enviar el correo:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4>Sobre Miuvuu</h4>
          <ul>
            <li><a href="/about">Acerca de nosotros</a></li>
            <li><a href="/terms">Términos y condiciones</a></li>
            <li><a href="/privacy">Políticas de privacidad</a></li>
            <li>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=stbnrivasa@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Contacto
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Síguenos</h4>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">🌐 Facebook</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">🌐 Twitter</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">🌐 Instagram</a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Suscríbete</h4>
          <form className="subscribe-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className={isLoading ? 'input-disabled' : ''}
            />
            <button 
              type="submit" 
              disabled={isLoading}
              className={isLoading ? 'button-loading' : ''}
            >
              {isLoading ? 'Enviando...' : 'Suscribirse'}
            </button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Miuvuu. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;