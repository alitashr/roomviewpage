import React, { PropTypes } from "react";
import AtButton from "../../atoms/AtButton";
import RoomViewPage from "../RoomViewPage";

const AllInOnePage = (props) => {
  const onCustomizeRug = () => {
    window.open(window.urlToOpen, "_blank");
  };
  const onMyroomClick = () => {
    let url = window.urlToOpen;
    url = url.substr(url.indexOf("?"), url.length - 1);
    const json = window.getJsonFromUrl(url);
    const myRoomUrl = window.getExplorugUrl({ page: json.page, initDesign: json.initdesign, initView: "myroom" });
    window.open(myRoomUrl, "_blank");
  };
  return (
    <div>
      <RoomViewPage showButton={false} onButtonClick={onCustomizeRug}></RoomViewPage>
      <AtButton text="See in your own room" className="at-btn-myroom" onClick={onMyroomClick}></AtButton>
      <AtButton text="Customize Rug" className="at-btn-myroom" onClick={onCustomizeRug}></AtButton>
    </div>
  );
};

AllInOnePage.propTypes = {};

export default AllInOnePage;
