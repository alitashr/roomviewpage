import * as THREE from "three";
import { OrbitControls } from "../../../utils/OrbitControls";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { CanvasTexture, Box3, MeshBasicMaterial } from "three";
import { convertArrintoDeg, convertArrIntoRad, convertUnit, degToRad } from "../../../utils/converter";
import { areaOfellipse, createVector } from "../../../utils/utils";
import { makeUrl } from "../../../utils/fileUtils";

export default class ThreeViewHelper {
  constructor() {

    this.scene = new THREE.Scene();

    this.textureLoader = new THREE.TextureLoader();
    this.fbxLoader = new FBXLoader();
    this.raycaster = new THREE.Raycaster();
    this.offset = new THREE.Vector3();
    this.carpetLoaded = false;
    this.objectLoaded = false;
  }
  init({ canvas, config = {}, shots, dims = {}, surfaceName = "surface1", resolution }) {
    let { width = window.innerWidth, height = window.innerHeight } = dims;
    this.w = width
    this.h = height
    this.surfaceName = surfaceName;
    this.sceneConfig = config;
    this.objProps = config[surfaceName];

    this.renderer = renderer(canvas, { ...config, width, height, resolution });
    const camConfig = config[shots[0]];
    this.camera = perspectiveCamera({ ...camConfig, width, height });
    this.scene.add(this.camera);
    window.scene = this.scene
    this.orbit = addOrbitControl(this.renderer, this.scene, this.camera, camConfig);
    this.orbit.enabled = false;
    // this.orbit.screenSpacePanning = true;
  }
  setupLights() {
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.9)
    this.scene.add(this.directionalLight)
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    this.scene.add(this.ambientLight)
  }
  removeLights() {
    if (this.directionalLight)
      this.scene.remove(this.directionalLight)
    if (this.ambientLight)
      this.scene.remove(this.ambientLight)
  }
  setup3dObject({ fbxUrl }) {
    const objKey = "surface1"
    this.objConf = this.sceneConfig[objKey];
    if (this.carpetLoaded) {
      this.scene.remove(this.carpetMesh)
      const tarObj = this.scene.getObjectByName("TargetObject")
      this.scene.remove(tarObj)

      this.carpetLoaded = false
      this.removeLights()
    }
    const { position = [0, 0, 0], rotation = [90, 0, 0], scale } = this.objConf;
    return new Promise((resolve, reject) => {
      const setup = () => {
        this.object.position.fromArray(position);
        this.object.scale.fromArray(scale);
        this.object.rotation.fromArray(convertArrIntoRad(rotation));
        if (this.material) {
          this.object.material = this.material
          this.object.material.needsUpdate = true
          this.render()
        }
        this.objectLoaded = true
        this.render()
        resolve();
      }
      if (!this.objectLoaded)

        this.fbxLoader.load(fbxUrl, obj => {

          this.object = obj.getObjectByName(objKey)
          this.scene.add(this.object);
          setup()
        }, undefined, console.error);
      else setup()
    })

  }
  setupCarpet({ fbxUrl }) {
    this.objConf = this.sceneConfig[this.surfaceName];
    const { position = [0, 0, 0], rotation = [90, 0, 0] } = this.objConf;
    if (this.objectLoaded) {
      this.scene.remove(this.object)
      const tarObj = this.scene.getObjectByName("TargetObject")
      if (tarObj)
        this.scene.remove(tarObj)
      this.removeLights()
      this.objectLoaded = false
    }
    return new Promise((resolve, reject) => {
      const setup = () => {
        // this.originalMesh = 
        this.carpetMesh.position.fromArray(position);
        const { flagged } = this.sceneConfig;
        let fact = flagged ? 10 : 1
        this.directionalLight.position.set(position[0] - 3000 / fact, position[1] + 3000 / fact, position[2])
        var targetObject = new THREE.Object3D();
        targetObject.name = "TargetObject"
        targetObject.position.set(...position);
        this.scene.add(targetObject);
        this.directionalLight.target = targetObject;
        // let helper = new THREE.DirectionalLightHelper(this.directionalLight, 100, 0xff0000);
        // this.scene.add(helper);

        this.carpetMesh.rotation.fromArray(convertArrIntoRad(rotation.slice(0, 3)));
        if (this.designDetails)
          this.setCarpetScale(this.designDetails)

        if (this.material) {
          this.carpetMesh.material = this.material
          this.carpetMesh.material.needsUpdate = true
          this.render()
        }
        this.carpetLoaded = true
        this.render()
        resolve();
      }
      if (!this.carpetLoaded)

        this.fbxLoader.load(fbxUrl, obj => {

          this.carpetMesh = obj.getObjectByName(this.surfaceName)
          this.scene.add(this.carpetMesh);
          this.setupLights()
          setup()
        }, undefined, console.error);
      else setup()
    })

  }
  setCarpetScale(designDetails) {
    const { PhysicalWidth, PhysicalHeight, Unit } = designDetails
    if (!PhysicalWidth || !PhysicalHeight || !Unit) {
      console.error("Could not set carept scale")
      return
    }
    const { flagged } = this.sceneConfig;
    let fact = flagged ? 10 : 1

    const wid = convertUnit(Unit, "ft", PhysicalWidth)
    const hgt = convertUnit(Unit, "ft", PhysicalHeight)
    this.carpetMesh.scale.set(wid / fact, hgt / fact, 2 / fact)

  }
  setObjectVisibility(visibility) {
    this.object.visible = visibility
    this.render()
  }
  setCarpetVisibility(visibility) {
    this.carpetMesh.visible = visibility
    this.render()
  }
  setObjectTexture({ designDetails, designCanvas }) {
    return new Promise((resolve, reject) => {
      const { surfaceUnit = "in", doubleSide } = this.objProps;
      const PhysicalWidth = convertUnit(designDetails.Unit, surfaceUnit, designDetails.PhysicalWidth);
      const PhysicalHeight = convertUnit(designDetails.Unit, surfaceUnit, designDetails.PhysicalHeight);
      this.designDetails = { ...designDetails, PhysicalHeight, PhysicalWidth, Unit: surfaceUnit }
      const designTexture = new CanvasTexture(designCanvas);
      designTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
      designTexture.wrapS = designTexture.wrapT = THREE.RepeatWrapping;
      this.material = new THREE.MeshBasicMaterial({
        map: designTexture,
        transparent: true,
        side: doubleSide ? THREE.DoubleSide : THREE.FrontSide,
        alphaTest: 0.5,
      });
      if (!this.object) {
        console.error("could not find the object")
        resolve()
        return;
      }
      this.object.material = this.material;
      this.object.material.needsUpdate = true;

      this.render()
      resolve()

    })

  }
  setCarpetTexture({ designDetails, designCanvas, normapCanvas }) {
    this.designDetails = designDetails

    const designTexture = new CanvasTexture(designCanvas);
    const normalTexture = new CanvasTexture(normapCanvas);
    // designTexture.magFilter = THREE.LinearFilter;
    // designTexture.minFilter = THREE.LinearFilter;
    designTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    normalTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    this.material = new THREE.MeshStandardMaterial({
      map: designTexture,
      normalMap: normalTexture,
      roughness: 1,
      metalness: 0.1,
      needsUpdate: true,
      transparent: true,
      side: THREE.FrontSide
    })
    if (!this.carpetMesh) return;
    this.setCarpetScale(this.designDetails)
    this.carpetMesh.material = this.material
    this.carpetMesh.material.needsUpdate = true
    this.render()
  }
  render() {
    this.renderer.render(this.scene, this.camera);
  }
  setFov(value) {
    const { camera } = this;
    camera.fov = value;
    camera.updateProjectionMatrix();
    this.render();
  }
  mouseDownTouchStart(e) {
    if (!this.carpetMesh) return;
    let intersect = this.raycastMouseOnCarpet(e);
    if (!intersect) return
    const objPos = this.carpetMesh.position.clone();
    this.offset.copy(intersect.point).sub(objPos);
    return intersect
  }

  mouseTouchMove(e) {
    if (!this.carpetMesh) return;
    //TODO:instead of casting on carpet, cast on an infinite plane 
    let intersect = this.raycastMouseOnCarpet(e);
    if (!intersect) return
    const objPos = this.carpetMesh.position.clone();
    const sub = intersect.point.sub(this.offset);
    sub.y = objPos.y;
    this.carpetMesh.position.copy(sub);
    this.render();
  }
  raycastMouseOnCarpet(e) {
    const { x, y } = e;
    let { mouseX, mouseY } = this.convMouseCord(x, y);
    var mouse = new THREE.Vector3(mouseX, mouseY, 0.99);
    this.raycaster.setFromCamera(mouse, this.camera);
    var intersects = this.raycaster.intersectObject(this.carpetMesh);
    return intersects[0];
  }
  raycastMouseOnSurface(e) {
    if(!e) return false;
    const { x, y } = e;
    let { mouseX, mouseY } = this.convMouseCord(x, y);
    var mouse = new THREE.Vector3(mouseX, mouseY, 0.99);
    this.raycaster.setFromCamera(mouse, this.camera);
    var intersects = this.raycaster.intersectObject(this.scene.getObjectByName(this.surfaceName));
    return intersects[0];
  }
  convMouseCord(x, y) {
    // const { offsetX, offsetY } = this.getRendererOffset();
    const vec = new THREE.Vector2();
    const { width, height } = this.renderer.getSize(vec);

    var mouseX = ((x) / width) * 2 - 1;
    var mouseY = -((y) / height) * 2 + 1;
    return { mouseX, mouseY };
  }
  getCameraConfig() {
    const position = this.camera.position.toArray();
    const rotation = convertArrintoDeg(this.camera.rotation.toArray());
    const target = this.orbit.target.position.toArray();
    return { position, rotation, target };
  }
  rotateCarpet(rotationInDegrees, axis) {
    if (!this.carpetMesh) return
    this.carpetMesh.rotation[axis] += (rotationInDegrees * Math.PI) / 180;
    this.render();
  }
  scaleObject(surfaceName, scaleFactor, axis) {
    let object = this.scene.getObjectByName(surfaceName);
    object.scale[axis] += scaleFactor;
    this.render();
  }
  attachTransformControls(surfaceName) {
    let object = this.scene.getObjectByName(surfaceName);

    this.transform.attach(object);
    this.scene.add(this.transform);
  }
  getRendererOffset() {
    var offsetY = this.renderer.domElement.offsetTop;
    var offsetX = this.renderer.domElement.offsetLeft;
    return { offsetX, offsetY };
  }
  clearScene() {
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }
    this.render();
  }


  toScreenXY(position, camera) {
    var pos = position.clone();
    let projScreenMat = new THREE.Matrix4();
    projScreenMat.multiply(camera.projectionMatrix, camera.matrixWorldInverse);
    projScreenMat.multiplyVector3(pos);
    const { offsetX, offsetY } = this.getRendererOffset()
    return {
      x: (pos.x + 1) * this.w / 2 + offsetX,
      y: (- pos.y + 1) * this.h / 2 + offsetY
    };

  }

  getCarpetPositions() {
    this.carpetMesh.geometry.computeBoundingBox();
    let box = this.carpetMesh.geometry.boundingBox;
    const widthheight = box.max.sub(box.min)

    const plane = new THREE.PlaneGeometry(widthheight.x, widthheight.y)
    const mat = new THREE.MeshBasicMaterial({ color: 0xff0000 })
    const m = new THREE.Mesh(plane, mat)
    m.scale.copy(this.carpetMesh.scale)
    m.position.copy(this.carpetMesh.position)
    m.rotation.copy(this.carpetMesh.rotation)
    const a = []
    plane.vertices.forEach(vertex => {
      const v = vertex.clone()
      v.applyMatrix4(this.carpetMesh.matrixWorld);
      a.push(v)
    })
    const b = a.map(vertex => createVector(vertex, this.camera, this.w, this.h))
    return [b[0], b[1], b[3], b[2]]
  }
  getCarpetArea() {
    const positions = this.getCarpetPositions();
    // positions[0].x
  }
  getCarpetMask() {
    const originalBg = this.scene.background;
    const object = this.scene.getObjectByName(this.surfaceName)
    const originalMat = object.material;
    // this.scene.background = new THREE.Color(0xffffff);
    const material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    object.material = material;
    object.material.needsUpdate = true;
    this.render();
    const dataurl = this.renderer.domElement.toDataURL();
    this.scene.background = originalBg;
    object.material = originalMat;
    this.render();
    return dataurl
  }
  toggleOrbitControls(enable) {
    this.orbit.enabled = enable;
    this.orbit.update();
  }
  toggleScreenSpacePanning(enable) {
    this.orbit.screenSpacePanning = enable;
    this.orbit.update();
  }
  toggleOrbitLockAxis(axis, enable) {
    if (axis === 0) {
      this.orbit.lockVertical = enable;
      this.orbit.update();
    } else if (axis === 1) {
      this.orbit.lockHorizontal = enable;
      this.orbit.update();
    }
  }
  changeShot(shotConfig) {
    const { position, rotation, target, fov } = shotConfig;
    const { camera } = this;
    camera.fov = fov;
    camera.updateProjectionMatrix();
    camera.position.fromArray(position);
    camera.rotation.fromArray(rotation);
    // camera.lookAt(...target);
    this.orbit.target.fromArray(target);
    this.orbit.update();
    this.render();
  }
  updateMap() {
    if (this.carpetMesh && this.carpetMesh.material.map) {
      this.carpetMesh.material.map.needsUpdate = true;
      this.carpetMesh.material.normalMap.needsUpdate = true;
    }
    if (this.object && this.object.material.map) {
      this.object.material.map.needsUpdate = true;
      // this.object.material.normalMap.needsUpdate = true;

    }
    this.render()
  }
  resizeRenderer({ width, height }) {
    this.w = width;
    this.h = height
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }
  getObjectConfig() {
    if (this.objectLoaded) {
      return null
    } else {
      return this.carpetMesh
    }
  }
  calculateCarpetSize() {
    const carpetSize = new THREE.Vector3();
    var box = new THREE.Box3();
    box.setFromObject(this.carpetMesh);
    box.getSize(carpetSize)
    // this.carpetMesh.geometry.computeBoundingBox();
    // this.carpetMesh.geometry.boundingBox.getSize(carpetSize);
    return carpetSize;
  }
  distbetween2Vertices(vertex1, vertex2, axis) {
    const { camera, renderer } = this;
    const vec = new THREE.Vector2()
    renderer.getSize(vec);
    const { x: width, y: height } = vec;
    const v1 = createVector(vertex1, camera, width, height);
    const v2 = createVector(vertex2, camera, width, height);
    const xDist = Math.abs(Math.abs(v2.x) - Math.abs(v1.x));
    const yDist = Math.abs(Math.abs(v2.y) - Math.abs(v1.y));
    return { xDist: xDist, yDist: yDist };
  }
  getGizmoCordinates() {
    const carpetSize = this.calculateCarpetSize();
    const smallerDim = carpetSize.x > carpetSize.y ? carpetSize.x : carpetSize.y;
    const carpetRadius = smallerDim / 5;
    const carpetCenter = this.carpetMesh.position.clone();

    const vertex1 = carpetCenter.clone();
    const vertex2 = new THREE.Vector3(
      carpetCenter.x,
      carpetCenter.y,
      carpetCenter.z + carpetRadius)

    const dist1 = this.distbetween2Vertices(vertex1, vertex2);
    const radYY = dist1.yDist;
    const radYX = dist1.xDist;

    const vertex3 = new THREE.Vector3(
      carpetCenter.x + carpetRadius,
      carpetCenter.y,
      carpetCenter.z);
    //TODO:this could be point of failure
    const vertex4 = carpetCenter.clone();
    const dist2 = this.distbetween2Vertices(vertex3, vertex4);
    const radXX = dist2.xDist;
    const radXY = dist2.yDist;

    const area1 = areaOfellipse(radYY, radXX);
    const area2 = areaOfellipse(radXY, radYX);
    let radX, radY;
    if (area1 > area2) {
      radX = radXX;
      radY = radYY;
    } else {
      radX = radXY;
      radY = radYX;
    }
    const canvasCenter = createVector(carpetCenter, this.camera, this.w, this.h);
    return { radX, radY, canvasCenter }
  }
  // downloadImageData() {
  //   const dataurl = this.renderer.domElement.toBlob(blob => {
  //     var strData = URL.createObjectURL(blob);
  //     var link = document.createElement("a");
  //     document.body.appendChild(link); //Firefox requires the link to be in the body
  //     link.setAttribute("download", "download.png");
  //     link.href = strData;
  //     link.click()
  //     document.body.removeChild(link); //remove the link when done
  //   })


  // }
}
const perspectiveCamera = (config = {}) => {
  const { innerWidth, innerHeight } = window;
  let {
    fov = 40,
    near = 0.1,
    far = 100000,
    height = innerHeight,
    width = innerWidth,
    position = [0, 200, 500],
    target = [0, 0, 0],
    rotation = [0, 0, 0],
  } = config;
  const aspect = width / height;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.lookAt(new THREE.Vector3(...target)); // This seems to be disabled by OrbitControls
  camera.position.set(...position);
  camera.rotation.set(...convertArrIntoRad(rotation));
  return camera;
};
const renderer = (canvas, config = {}) => {
  const { innerWidth, innerHeight, devicePixelRatio } = window;
  let {
    width = innerWidth,
    height = innerHeight,
    preserveDrawingBuffer = true,
    alpha = true,
    antialias = false,
    resolution = 1
  } = config;
  //console.log(width, height);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    preserveDrawingBuffer,
    alpha,
    antialias
  });
  // renderer.autoClear = false;
  // renderer.setClearColor(0x000000);
  renderer.setPixelRatio(resolution);
  renderer.setSize(width, height);
  return renderer;
};

const addOrbitControl = function (renderer, scene, camera, config = {}) {
  let { target = [0, 0, 0] } = config;
  const control = new OrbitControls(camera, renderer.domElement);
  window.orbit = control;
  control.enableKeys = false;
  control.target = new THREE.Vector3(...target);
  // controls .rotateSpeed = 5;
  // controls .zoomSpeed = 2.5;
  control.addEventListener("change", () => {
    renderer.render(scene, camera);
  });
  function animate() {
    requestAnimationFrame(animate);
    control.update();
  }
  animate();
  return control;
};
export const loadFbx = (url) => {
  return new Promise((resolve, reject) => {
    new FBXLoader().load(
      url,
      resolve,
      undefined,
      reject
    );
  });
}