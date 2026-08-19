import "./footer.css";
import { Monitor, MapPin } from "lucide-react";
import { FaInstagram, FaFacebookF, FaLinkedinIn } from "react-icons/fa";

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        {/* Brand */}
        <div className="footer-brand">
          <a href="#home" className="footer-logo">
            <Monitor size={28} />
            <span>E-TUTOR</span>
          </a>

          <p>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ab placeat
            quaerat doloribus odit perferendis autem blanditiis.
          </p>

          <div className="footer-socials">
            <a href="#">
              <MapPin size={24} />
            </a>

            <a href="#">
              <FaInstagram size={24} />
            </a>

            <a href="#">
              <FaFacebookF size={24} />
            </a>

            <a href="#">
              <FaLinkedinIn size={24} />
            </a>
          </div>
        </div>

        {/* Important Links */}
        <div className="footer-links">
          <h3>Important Links</h3>

          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#login">Login</a>
        </div>

        {/* Company */}
        <div className="footer-links">
          <h3>Company Links</h3>

          <a href="#services">Our Services</a>
          <a href="#contact">Contact</a>
          <a href="#privacy">Privacy Policy</a>
        </div>

        {/* Resources */}
        <div className="footer-links">
          <h3>Resources</h3>

          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#login">Login</a>
        </div>
      </div>

      {/* Decorative Shapes */}
      <div className="footer-circle circle-left"></div>
      <div className="footer-circle circle-blue"></div>
      <div className="footer-circle circle-purple"></div>
      <div className="footer-circle circle-green"></div>

      <div className="footer-line"></div>
      <div className="footer-square"></div>

      {/* Copyright */}
      <div className="footer-bottom">© Copyright 2026 E-Tutor</div>
    </footer>
  );
}

export default Footer;
