import RoomViewHelper from "../components/organisms/RoomView-deprecated/roomviewhelper";
import { createCanvas, downloadImageData } from "../utils/canvasUtils";

export const downloadRendered3dIllNQ = async ({
  designName, roomName, roomViewHelper
})=>{
  const mime = "jpeg";
  const downloadName = `${designName} in ${roomName}.${mime}`;
  roomViewHelper.downloadRendering(downloadName,"image/" + mime);
}
// window.downloadRendered3dIllNQ = async ({
//   designName, roomName, roomViewHelper
// }) => {
//   const mime = "jpeg";
//   const downloadName = `${designName} in ${roomName}.${mime}`;
//   roomViewHelper.downloadRendering(downloadName, mime);
// };

export const downloadRendered3dIllHQ = async ({
  isDownloading,
  setIsDownloading,
  designName,
  designImagePath,
  roomData,
  roomViewHelper
}) => {
  if (isDownloading) return;
  if(setIsDownloading) setIsDownloading(true);
  const { Name: roomName, Dir: dir, Files: files, baseUrl, config } = roomData;
  const mime = "jpg";
  const downloadName = `${designName} in ${roomName}.${mime}`;  
  const { width, height } = config;
  const bgCanvas = createCanvas(width, height);
  const threeCanvas = createCanvas(width, height);
  const maskCanvas = createCanvas(width, height);
  const shadowCanvas = createCanvas(width, height);
  const container = { clientWidth: width, clientHeight: height };
  const inputCanvas = createCanvas(width, height);
  const canvasConfig = {
      bgCanvas,
      threeCanvas,
      maskCanvas,
      shadowCanvas,
      container,
      inputCanvas,
  };
  const rh = new RoomViewHelper();
  rh.initCanvas(canvasConfig);
  await Promise.all(rh.initConfig({ baseUrl, config, files }));
  rh.updateBackground();

  rh.updateMask();
  await rh.updatethreeCanvas();
  if (typeof designImagePath === "string") {
    await roomViewHelper.renderDesignFromCustomUrl({
      customUrl: designImagePath,
    });
  } else {
    await roomViewHelper.renderFromJpg({ designImage: designImagePath });
  }

  const objectConfig = roomViewHelper.threeView.getObjectConfig();
  if (objectConfig) {
      rh.threeView.carpetMesh.position.copy(objectConfig.position);
      rh.threeView.carpetMesh.rotation.copy(objectConfig.rotation);
      rh.threeView.render();
  }
  await rh.updateShadow();
  const renderedCanvas = rh.renderInCanvas();
  setIsDownloading(false);
  downloadImageData(renderedCanvas, downloadName, "image/" + mime);
};
