import "./stats.css";
import CountUp from "react-countup";
function Stats() {
  return (
    <div className="stats">
      <div className="container">
        <div className="stat">
          <p className="title">
            <CountUp start={0} end={872} duration={2} enableScrollSpy={true} />
          </p>
          <p className="subtitle">Expert tutors</p>
        </div>
        <div className="stat">
          <p className="title">
            {" "}
            <CountUp start={0} end={20000} duration={2} enableScrollSpy={true} suffix="+" />
          </p>
          <p className="subtitle">Hours content</p>
        </div>
        <div className="stat">
          <p className="title">
            {" "}
            <CountUp start={0} end={312} duration={2} enableScrollSpy={true} />
          </p>
          <p className="subtitle">Subject and courses</p>
        </div>
        <div className="stat">
          <p className="title">
            {" "}
            <CountUp start={0} end={73525} duration={2} enableScrollSpy={true} suffix="+" />
          </p>
          <p className="subtitle">Active students</p>
        </div>
      </div>
    </div>
  );
}

export default Stats;
