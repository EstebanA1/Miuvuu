import React, { useState } from "react";
import "./Footer.css";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) {
      alert("Por favor, ingresa un correo electrónico válido.");
      return;
    }

    alert(`Bienvenido a Miuvuu! 🎉\n\nGracias por suscribirte, ${email}!\nPronto recibirás nuestras novedades.`);
    setEmail("");
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
                href="https://mail.google.com/mail/?view=cm&fs=1&to=stnbrivasa@gmail.com"
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
            />
            <button type="submit">Suscribirse</button>
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
