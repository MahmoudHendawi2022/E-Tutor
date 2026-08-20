import "../sections/annonceBar.css";
import { Link } from "react-router";
import { X } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";

function Annoncebar() {
  const [showAnnonce, setshowAnnonce] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0}}
      animate={{ opacity: 1}}
      transition={{
        duration: 1,
      }}
      className={`annonceBar ${showAnnonce ? "closing" : ""}`}
    >
      <div className="container">
        <div className="annonceContent">
          <p>
            Are you a university or school students for an online tutoring
            partnership?
          </p>
          <Link to={"/"}>Talk to us</Link>
        </div>
        <button
          onClick={() => {
            setshowAnnonce(true);
          }}
          className="closeAnnonce"
        >
          <X size={15} />
        </button>
      </div>
    </motion.div>
  );
}
export default Annoncebar;
