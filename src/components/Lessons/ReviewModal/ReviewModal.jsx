import { useEffect, useState } from "react";

import { MessageSquareText, Star, X } from "lucide-react";

import { AnimatePresence, motion } from "motion/react";

import "./reviewModal.css";

function ReviewModal({ open, lesson, tutor, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);

  const [hoverRating, setHoverRating] = useState(0);

  const [review, setReview] = useState("");

  /* =====================================
     RESET WHEN OPENED
  ===================================== */

  useEffect(() => {
    if (!open) {
      return;
    }

    setRating(lesson?.rating || 0);

    setReview(lesson?.review || "");

    setHoverRating(0);
  }, [open, lesson]);

  /* =====================================
     ESC + BODY LOCK
  ===================================== */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  /* =====================================
     SUBMIT
  ===================================== */

  const handleSubmit = () => {
    if (rating < 1) {
      return;
    }

    onSubmit({
      rating,

      review: review.trim(),

      reviewed: true,

      reviewedAt: new Date().toISOString(),
    });
  };

  const visibleRating = hoverRating || rating;

  return (
    <AnimatePresence>
      {open && lesson && tutor && (
        <motion.div
          className="review-modal-backdrop"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          transition={{
            duration: 0.18,
          }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            className="review-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-modal-title"
            initial={{
              opacity: 0,
              y: 16,
              scale: 0.985,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 10,
              scale: 0.99,
            }}
            transition={{
              type: "tween",
              duration: 0.22,
              ease: "easeOut",
            }}
          >
            {/* HEADER */}

            <div className="review-modal-header">
              <div className="review-modal-heading">
                <div className="review-modal-icon">
                  <Star size={18} />
                </div>

                <div>
                  <h2 id="review-modal-title">Rate your lesson</h2>

                  <p>Share your experience with your tutor.</p>
                </div>
              </div>

              <button
                type="button"
                className="review-modal-close"
                onClick={onClose}
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </div>

            {/* TUTOR */}

            <div className="review-modal-tutor">
              <img src={tutor.image} alt={tutor.name} />

              <div>
                <span>{lesson.subject}</span>

                <strong>{tutor.name}</strong>

                <small>{tutor.shortTitle}</small>
              </div>
            </div>

            {/* RATING */}

            <div className="review-modal-rating-section">
              <strong>How was your lesson?</strong>

              <span>
                Your rating helps other students choose the right tutor.
              </span>

              <div
                className="review-modal-stars"
                onMouseLeave={() => setHoverRating(0)}
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={value <= visibleRating ? "active" : ""}
                    aria-label={`Rate ${value} out of 5`}
                    onMouseEnter={() => setHoverRating(value)}
                    onFocus={() => setHoverRating(value)}
                    onBlur={() => setHoverRating(0)}
                    onClick={() => setRating(value)}
                  >
                    <Star
                      size={25}
                      fill={value <= visibleRating ? "currentColor" : "none"}
                    />
                  </button>
                ))}
              </div>

              <div className="review-modal-rating-text">
                {rating === 0 && "Select a rating"}

                {rating === 1 && "Not great"}

                {rating === 2 && "Could be better"}

                {rating === 3 && "Good"}

                {rating === 4 && "Very good"}

                {rating === 5 && "Excellent"}
              </div>
            </div>

            {/* REVIEW */}

            <div className="review-modal-comment">
              <label htmlFor="lesson-review">
                <MessageSquareText size={14} />
                Write a review
                <span>Optional</span>
              </label>

              <div className="review-modal-textarea">
                <textarea
                  id="lesson-review"
                  rows="5"
                  maxLength="500"
                  value={review}
                  placeholder="What did you like about this lesson?"
                  onChange={(event) => setReview(event.target.value)}
                />

                <span>
                  {review.length}
                  /500
                </span>
              </div>
            </div>

            {/* ACTIONS */}

            <div className="review-modal-actions">
              <button
                type="button"
                className="review-modal-later"
                onClick={onClose}
              >
                Maybe later
              </button>

              <button
                type="button"
                className="review-modal-submit"
                disabled={rating < 1}
                onClick={handleSubmit}
              >
                <Star size={14} />
                Submit review
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ReviewModal;
