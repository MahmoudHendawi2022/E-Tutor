import { Outlet } from "react-router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../layouts/mainLayouts.css";
function MainLayouts() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default MainLayouts;
