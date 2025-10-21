import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="brand">Visitor Pass</div>
          <div className="muted">Secure, fast, and paperless visitor management.</div>
        </div>
        <div className="footer-links">
          <div className="footer-col">
            <div className="footer-title">Product</div>
            <Link to="/">Home</Link>
            <Link to="/passes">Passes</Link>
            <Link to="/appointments">Appointments</Link>
            <Link to="/visitors">Visitors</Link>
          </div>
          <div className="footer-col">
            <div className="footer-title">Help</div>
            <a href="#" onClick={(e)=>e.preventDefault()}>Docs (coming soon)</a>
            <a href="#" onClick={(e)=>e.preventDefault()}>Support</a>
            <Link to="/login">Login</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <span className="muted">© {new Date().getFullYear()} Visitor Pass</span>
        </div>
      </div>
    </footer>
  );
}