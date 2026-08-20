import "./banner.css";
import ban1 from "../../../../assets/71546681-40ac-408f-b453-a9f07f171eeb.png";
import ban2 from "../../../../assets/30f6b127-6876-4b0a-a189-e5d5584e541d.png";
import { motion } from "motion/react";

const textContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const textItem = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "tween",
      duration: 0.8,
    },
  },
};

function Banner() {
  return (
    <div className="banner">
      <div className="container">
        <div className="ban-top">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{
              type: "spring",
              damping: 15,
              duration: 0.5,
            }}
            className="banImage"
          >
            <img src={ban1} alt="" />
          </motion.div>
          <motion.div
            variants={textContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.3,
            }}
            className="ban-top-right ban"
          >
            <motion.h5 variants={textItem} className="ban-heading">
              CUSTOMIZE WITH YOUR SCHEDULE
            </motion.h5>
            <motion.p variants={textItem} className="ban-title">
              Personalized professional Online Tutor On Your Schedule
            </motion.p>
            <motion.div variants={textItem} className="ban-desc">
              Our scheduling system allows you to select based on your free
              time. Lorem ipsum demo text for template. Keep track of your
              students class and tutoring schedules, and never miss your
              lectures. The best online class scheduling system with easy
              accessibility. Lorem ipsum is a placeholder text commonly used to
              demonstrate the visual form.
            </motion.div>
            <motion.a
              variants={textItem}
              whileHover={{
                scale: 1.05,
              }}
              className="get-started"
              href="/"
            >
              Get Started
            </motion.a>
          </motion.div>
        </div>
        <div className="ban-bottom">
          <motion.div
            variants={textContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.3,
            }}
            className="ban-bottom-left ban"
          >
            <motion.h5 variants={textItem} className="ban-heading">
              CUSTOMIZE WITH YOUR SCHEDULE
            </motion.h5>
            <motion.p variants={textItem} className="ban-title">
              Talented And Qualified Tutors To Serve You For Help
            </motion.p>
            <motion.div variants={textItem} className="ban-desc">
              Our scheduling system allows you to select based on your free
              time. Lorem ipsum demo text for template. Keep track of your
              students class and tutoring schedules, and never miss your
              lectures. The best online class scheduling system with easy
              accessibility. Lorem ipsum is a placeholder text commonly used.
            </motion.div>
            <motion.a
              variants={textItem}
              whileHover={{ scale: 1.05 }}
              className="get-started"
              href={"/"}
            >
              Get Started
            </motion.a>
          </motion.div>
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{
              type: "spring",
              damping: 15,
              duration: 0.5,
            }}
            className="banImage"
          >
            <img src={ban2} alt="" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Banner;
