import GeneralInformation from "../components/Dashboard/GeneralInformation";
import Address from "../components/Dashboard/GoogleMap";
import Numberofgoods from "../components/Dashboard/Numberofgoods";
import YearInformation from "../components/Dashboard/YearInformation";

const HomePage = () => {
  return (
    <div style={{ height: "auto", width: "auto" }}>
      <YearInformation />
      <GeneralInformation />
      <Numberofgoods />
      <Address />
    </div>
  );
};

export default HomePage;
