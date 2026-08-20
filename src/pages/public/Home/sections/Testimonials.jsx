import "swiper/css";
import "swiper/css/pagination";

import "./Testimonials.css";

import test1 from "../../../../assets/young-bearded-man-with-striped-shirt_273609-5677.avif";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

const testimonials = [
  {
    id: 1,
    name: "Kristen",
    username: "Kristen",
    image: test1,
    review:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque reiciendis inventore iste ratione ex alias quis magni at optio.",
    rating: 5,
  },
  {
    id: 2,
    name: "Ariana",
    username: "Ariana",
    image: test1,
    review:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque reiciendis inventore iste ratione ex alias quis magni at optio.",
    rating: 5,
  },
  {
    id: 3,
    name: "John Doe",
    username: "John Doe",
    image: test1,
    review:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque reiciendis inventore iste ratione ex alias quis magni at optio.",
    rating: 5,
  },
  {
    id: 4,
    name: "Ali Mohamed",
    username: "Ali Mohamed",
    image: test1,
    review:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque reiciendis inventore iste ratione ex alias quis magni at optio.",
    rating: 5,
  },
  {
    id: 5,
    name: "Alberto",
    username: "Alberto",
    image: test1,
    review:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque reiciendis inventore iste ratione ex alias quis magni at optio.",
    rating: 5,
  },
];

function Testimonials() {
  return (
    <div className="testimonials">
      <div className="container">
        <div className="testimonials-heading">
          <h4>OUR TETSIMONIALS</h4>
          <h2>What Our Students Say About Us</h2>
        </div>
        <Swiper
          modules={[Pagination]}
          spaceBetween={25}
          slidesPerView={3}
          pagination={{
            clickable: true,
          }}
          breakpoints={{
            0: {
              slidesPerView: 1,
            },
            768: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
          className="testimonials-swiper"
        >
          {testimonials.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="testimonial-card">
                <div className="student-info">
                  <img src={item.image} alt={item.name} />

                  <div>
                    <h3>{item.name}</h3>
                    <span>{item.username}</span>
                  </div>
                </div>

                <p className="item-review">{item.review}</p>

                <div className="rating">★★★★★</div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

export default Testimonials;
