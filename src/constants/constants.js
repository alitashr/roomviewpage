console.log("process.env.SERVER", process.env.SERVER)
export const assetsFolder = './';//process.env.SERVER !=='local'? 'https://cdn.explorug.com/explorugentry/roomview/':  './'; //'./'
export const defaultRoomdata = {
  Dir: assetsFolder + "Rooms/beach",
  Name: "Seashore",
  Files: [
    "Shot_1.bg.jpg",
    "Shot_1.sh.jpg",
    "Shot_1.m.png"
  ]
};
export const initialDesignProps = {
  designName: "Atlas",
  designImagePath: assetsFolder+"Designs/Atlas.jpg"
}