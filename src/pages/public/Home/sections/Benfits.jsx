import "./benfits.css";
import { motion } from "motion/react";
import {
  Accessibility,
  Dumbbell,
  Presentation,
  BadgeDollarSign,
} from "lucide-react";

const benefits = [
  {
    id: 1,
    icon: Accessibility,
    title: "One-on-one Teaching",
    description:
      "All of our special education experts have a degree in special education.",
    color: "#087bf0",
  },
  {
    id: 2,
    icon: Dumbbell,
    title: "24/7 Tutor Availability",
    description:
      "Our tutors are always available to respond as quick as possible for you.",
    color: "#69c900",
  },
  {
    id: 3,
    icon: Presentation,
    title: "Interactive Whiteboard",
    description:
      "Our digital whiteboard equipped with audio and video chat features.",
    color: "#ff6b00",
  },
  {
    id: 4,
    icon: BadgeDollarSign,
    title: "Affordable Prices",
    description: "Choose an expert tutor based on your budget and per hour.",
    color: "#f458a1",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    x: 100,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 1,
    },
  },
};
function Benefits() {
  return (
    <section className="benefits">
      <div className="container">
        <div className="benefits-heading">
          <span>WHY CHOOSE US</span>

          <h2>
            Benefits of online tutoring
            <br />
            services with us
          </h2>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="benefits-grid"
        >
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <motion.div
                variants={cardVariants}
                className="benefit-card"
                key={benefit.id}
              >
                <div
                  className="benefit-icon"
                  style={{ backgroundColor: benefit.color }}
                >
                  <Icon size={22} />
                </div>

                <h3>{benefit.title}</h3>

                <p>{benefit.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export default Benefits;
