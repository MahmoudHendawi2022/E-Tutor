import { Link } from "react-router";
import { Play } from "lucide-react";
import heroImage from "../../../../assets/hero-study.png";
import "../sections/hero.css";
import { motion } from "motion/react";

function Hero() {
  return (
    <div className="hero">
      <div className="container">
        <div className="hero-content">
          <motion.p
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            transition={{
              duration: 1.4,
            }}
            className="hero-pa"
          >
            100% SATISFACTION GUARANTEE
          </motion.p>
          <motion.p
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            transition={{
              duration: 1.6,
            }}
            className="hero-title"
          >
            Find your
          </motion.p>
          <motion.p
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            transition={{
              duration: 1.8,
            }}
            className="hero-title"
          >
            Perfect <span>Tutor</span>
          </motion.p>
          <motion.p
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            transition={{
              duration: 2,
            }}
            className="hero-subtitle"
          >
            We Help You Find Perfect Tutor for 1-on-1 Lessons. it is Completely
            Free And Private.
          </motion.p>
          <motion.div
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            transition={{
              duration: 2.2,
            }}
            className="hero-btns"
          >
            <Link className="get-started" to={"/"}>
              Get Started
            </Link>

            <div className="play">
              <Play size={14} />
              <span>see how it works</span>
            </div>
          </motion.div>
        </div>
        <motion.div
          initial={{ x: 200, opacity: 0 }}
          animate={{
            x: 0,
            opacity: 1,
          }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 12,
            duration: 1.2,
          }}
          className="hero-image"
        >
          <img src={heroImage} alt="" />
        </motion.div>
      </div>
    </div>
  );
}

export default Hero;
