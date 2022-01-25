let publicUrl = process.env.PUBLIC_URL;
publicUrl = publicUrl ==='' ||publicUrl==='.' ? './': publicUrl;
publicUrl = publicUrl[publicUrl.length-1]!=='/' ? publicUrl+'/': publicUrl;

export const assetsFolder = publicUrl ;// process.env.PUBLIC_URL==='' || process.env.PUBLIC_URL==='.' ? './': process.env.PUBLIC_URL ;//'https://cdn.explorug.com/explorugentry/roomview/';//process.env.SERVER !=='local' ? 'https://cdn.explorug.com/explorugentry/roomview/':  './'; //'./'
console.log("assetsFolder", assetsFolder, 'process.env.PUBLIC_URL', process.env.PUBLIC_URL)
export const defaultRoomdata = {
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
export const initialDesignProps =  window.defaultDesign
// {
//   designName: "cubinia",
//   fullpath: "Designs/Thornure.jpg"
// }