function getExplorugUrl({ page = "", initDesign = "", initView = "", customDesignUrl = "", customClass='' }) {
   let windowUrl = `https://v3.explorug.com/explorug.html?page=${page}&initview=${initView}`;
  //let windowUrl = `http://localhost:23456/explorug.html?page=${page}&initview=${initView}`;
  windowUrl = customClass ? windowUrl+'&customclass='+customClass: windowUrl;

  if (customDesignUrl === "") {
    windowUrl = windowUrl + `&initdesign=${initDesign}`;
  } else {
    windowUrl = windowUrl + `&customdesignurl=${customDesignUrl}`;
  }
  return windowUrl;
}
const designsOptions = [
  {
    text: "designs/cubinia.jpg",
    value: "cubinia",
  },
  {
    text: "designs/dream kaleen.jpg",
    value: "Designs/ART ACRYLIC/Dream Kaleen.ctf",
  },
  {
    text: "designs/sublimopar.jpg",
    value: "sublimopar",
  },
  {
    text: "designs/atlas.jpg",
    value: "Designs/2020 EPI1/atlasia.ctf",
  },
  {
    text: "designs/tappeto classico.png",
    value: "Designs/Artwork/Assorted Design/Tappeto Classico.ctf"
  }
];
const roomOptions = [
  {
    text: "rooms/bedroom arcadus",
    value: "bedroom arcadus",
  },
  {
    text: "rooms/kitchen dining astroph",
    value: "kitchen dining astroph.crf3d",
  },
  {
    text: "rooms/roman passage",
    value: "roman passage",
  },
  {
    text: "rooms/beach",
    value: "seashore.crf3d",
  },
];
const getPathValue = (key = "", optionListName = "designs") => {
  const optionList = optionListName === "designs" ? designsOptions : roomOptions;
  var optionChosen = optionList.find((item) => item.text.toLowerCase() === key.toLowerCase());
  var value = optionChosen ? optionChosen.value : key;
  return value;
};
//const defaultDesign = "cubinia";
const defaultRoom = "bedroom arcadus";
const defaultPage = "ruglife";

window.defaultDesign = {
  designName: "cubinia",
  fullpath: "Designs/Cubinia.jpg"
}
window.defaultRoomdata = {
  Path:'bedroom arcadus',
  Dir: "./Rooms/Bedroom Arcadus",
  Name: "Bedroom Arcadus",
  Files: [
    "Config.json",
    "Shot_1.bg.jpg",
    "Shot_1.sh.jpg",
    "Shot_1.m.png",
    "backgroundVideo.mp4"
  ]
};

function getUrlToOpen({ design, room, page }) {
  console.log("getUrlToOpen -> { design, room, page }", { design, room, page })
  page = page || defaultPage; // "beyonddreams2";
  sessionStorage.setItem('page', page);
  design = design || window.defaultDesign.designName;
  room = room || defaultRoom;

  const designChosen = getPathValue(design, "designs");
  const roomChosen = getPathValue(room, "rooms");

  window.initDesign = designChosen;
  window.initView = roomChosen;

  let windowUrl = "";
  windowUrl = getExplorugUrl({ page, initDesign: designChosen, initView: roomChosen });
  window.urlToOpen = windowUrl;
  console.log("getUrlToOpen -> windowUrl", windowUrl)
  return windowUrl;

  // console.log("getUrlToOpen -> designChosen", designChosen)
  // const OUTDOOR_PLUTITH = "outdoor plutith";
  // const SEASHORE = "beach";

  // const BEDROOM = "bedroom arcadus";
  // const KITCHEN = "kitchen dining astroph";
  // const AMBER_CABIN = "amber cabin";
  // const ROMAN_PASSAGE = "roman passage";

  // const THORNURE = "designs/thornure.jpg";
  // const TAPPETO = "designs/tappeto classico.png";
  // const ATLAS = "designs/atlas.jpg";
  // const CUBINIA = "cubinia";
  // const DREAMKALEEN = "Dream Kaleen";
  // const SUBLIMOPAR = "sublimopar";

  // let page = "beyonddreams2";
  // let design = sessionStorage.getItem("initdesign") || "";
  // let room = sessionStorage.getItem("initview") || "";

  // let initDesign = "Designs/Cubinia.ctf"; // "Designs/Artwork/Assorted Design/Thornure.ctf";
  // let initView = "Amber Cabin.crf3d";

  // let windowUrl = ""; //getExplorugUrl({page,initDesign, initView});;

  // if (room.toLowerCase() === AMBER_CABIN.toLowerCase()) {
  //   page = "beyonddreams2";
  //   initView = "Amber Cabin.crf3d";
  // } else if (room.toLowerCase() === ROMAN_PASSAGE.toLowerCase()) {
  //   page = "beyonddreams2";
  //   initView = "Roman Passage.crf3d";
  // } else if (room.toLowerCase() === OUTDOOR_PLUTITH.toLowerCase()) {
  //   page = "beyonddreams2";
  //   initView = "Outdoor Plutith.crf3d";
  // } else if (room.toLowerCase() === SEASHORE.toLowerCase()) {
  //   page = "beyonddreams";
  //   initView = "Seashore.crf3d";
  // } else {
  //   const roomName = room.split("/").pop();
  //   initView = roomName.toLowerCase().indexOf(".crf3d") !== -1 ? roomName : roomName + ".crf3d";
  // }

  // if (design.toLowerCase() === THORNURE) {
  //   page = "beyonddreams2";
  //   initDesign = "Designs/Artwork/Assorted Design/Thornure.ctf";
  // } else if (design.toLowerCase() === TAPPETO) {
  //   page = "beyonddreams2";
  //   initDesign = "Designs/Artwork/Assorted Design/Tappeto Classico.ctf";
  // } else if (design.toLowerCase() === ATLAS) {
  //   page = "beyonddreams";
  //   initDesign = "Designs/2020 EPI1/Atlasia.ctf";
  // }
  // sessionStorage.setItem("page", page);
  // window.initDesign = initDesign;
  // window.initView = initView;
}
