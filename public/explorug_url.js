const getExplorugUrl = ({ page = "", initDesign = "", initView = "" }) => {
  const windowUrl = `https://v3.explorug.com/explorug.html?page=${page}&initdesign=${initDesign}&initview=${initView}`;
  console.log("getUrlToOpen -> windowUrl", windowUrl);
  return windowUrl;
};
window.getUrlToOpen = () => {
  const AMBER_CABIN = "rooms/amber cabin";
  const ROMAN_PASSAGE = "rooms/roman passage";
  const OUTDOOR_PLUTITH = "rooms/outdoor plutith";

  const THORNURE = "designs/thornure.jpg";
  const TAPPETO = "designs/tappeto classico.png";


  let page = "beyonddreams2";
  let design = sessionStorage.getItem("initdesign") || "";
  let room = sessionStorage.getItem("initview") || "";
  console.log("room", room)

  let initDesign = "Designs/Artwork/Assorted Design/Thornure.ctf";
  let initView = "Cozy Dining.crf3d";
  let windowUrl = ""; //getExplorugUrl({page,initDesign, initView});;

  if (room.toLowerCase() === AMBER_CABIN.toLowerCase()) {
    page = "beyonddreams2";
    initView = "Amber Cabin.crf3d";
  } else if (room.toLowerCase() === ROMAN_PASSAGE.toLowerCase()) {
    page = "beyonddreams2";
    initView = "Roman Passage.crf3d";
  }
  if(room.toLowerCase() === OUTDOOR_PLUTITH.toLowerCase()){
    page = "beyonddreams2";
    initView = "Outdoor Plutith.crf3d"
  }

  if (design.toLowerCase() === THORNURE) {
    page = "beyonddreams2";
    initDesign = "Designs/Artwork/Assorted Design/Thornure.ctf";
  } else if (design.toLowerCase() === TAPPETO) {
    page = "beyonddreams2";
    initDesign = "Designs/Artwork/Assorted Design/Tappeto Classico.ctf";
  }

  windowUrl = getExplorugUrl({ page, initDesign, initView });
  return windowUrl;
};