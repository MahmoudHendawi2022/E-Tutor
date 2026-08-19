import { motion } from "motion/react";
import "./OurSubjects.css";
import {
  BookOpen,
  CodeXml,
  Atom,
  Landmark,
  Brain,
  Palette,
  Grid2X2,
} from "lucide-react";

const subjects = [
  {
    id: 1,
    title: "Engineering",
    icon: BookOpen,
    color: "#2589ff",
    bg: "#e8f2ff",
  },
  {
    id: 2,
    title: "English",
    icon: BookOpen,
    color: "#16c79a",
    bg: "#e5faf4",
  },
  {
    id: 3,
    title: "Programming",
    icon: CodeXml,
    color: "#9c27b0",
    bg: "#f5e8f8",
  },
  {
    id: 4,
    title: "Science",
    icon: Atom,
    color: "#e68919",
    bg: "#fff2e3",
  },
  {
    id: 5,
    title: "History",
    icon: Landmark,
    color: "#21727a",
    bg: "#e5f2f3",
  },
  {
    id: 6,
    title: "Psychology",
    icon: Brain,
    color: "#ae8c26",
    bg: "#f7f2df",
  },
  {
    id: 7,
    title: "Web design",
    icon: Palette,
    color: "#bf3f48",
    bg: "#fae9ea",
  },
  {
    id: 8,
    title: "See all",
    icon: Grid2X2,
    color: "#333",
    bg: "#eeeeee",
  },
];

const cardsContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardItem = {
  hidden: {
    x: -80,
    opacity: 0,
  },

  visible: {
    x: 0,
    opacity: 1,

    transition: {
      type: "tween",
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

function OurSubjects() {
  return (
    <div className="subjects">
      <div className="container">
        <div className="subjects-heading">
          <h5>OUR TUTOR SUBJECTS</h5>
          <h2>Find Online Tutor in Any Subject</h2>
        </div>
        <motion.div
          variants={ cardsContainer }
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.2,
          }}
          className="subjects-grid"
        >
          {subjects.map((subject) => {
            const Icon = subject.icon;

            return (
              <motion.div
                variants={ cardItem }
                whileHover={{
                  scale: 1.01,
                  boxShadow: "0 6px 16px rgba(0, 0, 0, 0.1)",
                }}
                transition={{
                  type: "tween",
                  duration: 0.4,
                }}
                className="subject"
                key={subject.id}
              >
                <div
                  className="subject-icon"
                  style={{ backgroundColor: subject.bg }}
                >
                  <Icon size={22} style={{ color: subject.color }} />
                </div>

                <span>{subject.title}</span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

export default OurSubjects;
