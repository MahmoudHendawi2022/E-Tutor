import Annoncebar from "./sections/Annoncebar";
import "../Home/home.css";
import Hero from "./sections/Hero";
import Stats from "./sections/Stats";
import Benfits from "./sections/Benfits";
import Banner from "./sections/Banner";
import OurSubjects from "./sections/OurSubjects";
import Testimonials from "./sections/Testimonials";
function Home() {
  return (
    <>
      <div className="home">
        <Annoncebar />
        <Hero />
        <Stats />
        <Benfits />
        <Banner />
        <OurSubjects />
        <Testimonials />
      </div>
    </>
  );
}

export default Home;
