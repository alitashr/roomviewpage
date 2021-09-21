export const config2Point1 = (name, baseUrl, config) => {
  return new Promise((resolve) => {
    let image = new Image();
    image.onload = () => {
      let canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      canvas.getContext('2d').drawImage(image, 0, 0);
      let imgdata = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < imgdata.data.length; i += 4) {
        imgdata.data[i + 3] = imgdata.data[i];

      }
      canvas.getContext('2d').putImageData(imgdata, 0, 0);
      canvas.toBlob(function (blob) {
        let url = URL.createObjectURL(blob);
        const mappedConfig = {
          version: 2.1,
          name: name,
          designinroomformat: "roomview",
          width: config.width,
          height: config.height,
          dims: { width: 1920, height: 1080 },
          roomElements: {
            shots: { Shot_1: {} },
            lights: {},
            objects: {}
          },
          defaultview: ["view1"],
          scenes: ["scene1"],
          hasShadow: true,
          mouseControls: true,
          realTimeDynamicRendering: true,
          canvases: [],
          scene1: {
            overwriteFbx: config.scene1.overwriteFbx,
            modelUrl: config.scene1.modelUrl,
            adjustObjects: [],
            hideObjects: [],
            Shot_1: {
              ...config.scene1.Shot_1
            },
            surface1: {
              ...config.scene1.surface1
            },
            objects3d: ["surface1"]
          },
          roomAssets: {
            Shot_1: {
              background: { "url": "Shot_1.bg.jpg" },
              mask: { "url": url },
              shadow: { "url": "Shot_1.sh.jpg" }
            }
          }
        }
        resolve(mappedConfig);
      });


    }
    image.crossOrigin = "Anonymous";
    image.src = baseUrl + "/" + "Shot_1.m.png";

  })

}