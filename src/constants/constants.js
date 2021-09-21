export const assetsFolder = './';//process.env.SERVER !=='local' ? 'https://cdn.explorug.com/explorugentry/roomview/':  './'; //'./'
console.log("assetsFolder", assetsFolder)
export const defaultRoomdata = {
  Dir: "Rooms/ARBEITSZIMMER1",
  Name: "ARBEITSZIMMER1",
  Files: [
    "Config.json",
    "Shot_1.bg.jpg",
    "Shot_1.sh.jpg",
    "Shot_1.m.png",
    "backgroundVideo.mp4"
  ]
};
export const initialDesignProps = {
  designName: "Thornure",
  designImagePath: "Designs/Thornure.jpg"
}