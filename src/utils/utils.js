
export const areaOfellipse = (x, y) => Math.PI * x * y


export const createVector = (p, camera, width, height) => {
  var vector = p.project(camera);

  vector.x = ((vector.x + 1) / 2) * width;
  vector.y = (-(vector.y - 1) / 2) * height;

  return vector;
};

export function resizeKeepingAspect(image, container, fitType = "fit_inside", resolution = 1) {
  let { width: containerwidth, height: containerheight } = container;
  let { width: imagewidth, height: imageheight } = image;
  if (!imagewidth || !imageheight) return { width: containerwidth, height: containerheight };
  if (containerheight === 0 || containerwidth === 0) return { width: imagewidth, height: imageheight };
  let width = imagewidth,
    height = imageheight;

  switch (fitType) {
    case "fit_inside":
      if (imagewidth > imageheight) {
        if (width > containerwidth) {
          height = (imageheight * containerwidth) / imagewidth;
          width = containerwidth;
        }
        if (height > containerheight) {
          width = (imagewidth * containerheight) / imageheight;
          height = containerheight;
        }
      } else {
        if (height > containerheight) {
          width = (imagewidth * containerheight) / imageheight;
          height = containerheight;
        }
        if (width > containerwidth) {
          height = (imageheight * containerwidth) / imageheight;
          width = containerwidth;
        }
      }
      break;
    case "crop":
      const wdif = width - containerwidth;
      const hdif = height - containerheight;
      if (wdif > hdif) {
        height = containerheight;
        width = (imagewidth * containerheight) / imageheight;
      } else {
        width = containerwidth;
        height = (imageheight * containerwidth) / imagewidth;
      }
      break;

    default:
      break;
  }
  width = width * resolution;
  height = height * resolution;
  return { width, height };
}