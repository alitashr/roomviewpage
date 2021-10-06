import * as THREE from "three";
import { OrbitControls } from "../../../utils/OrbitControls";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { CanvasTexture, Box3, MeshBasicMaterial } from "three";
import { convertArrintoDeg, convertArrIntoRad, convertUnit, degToRad } from "../../../utils/converter";
import { areaOfellipse, createVector } from "../../../utils/utils";
import { makeUrl } from "../../../utils/fileUtils";
import { assetsFolder } from "../../../constants/constants";

export default class ThreeViewHelper {
  constructor () {
    this.scene = new THREE.Scene();

    this.textureLoader = new THREE.TextureLoader();
    this.fbxLoader = new FBXLoader();
    this.raycaster = new THREE.Raycaster();
    this.offset = new THREE.Vector3();
    this.carpetLoaded = false;
    this.objectLoaded = false;
    this.ambientIntensity = undefined;
  }
  init({
    canvas,
    config = {},
    shots,
    dims = {},
    surfaceName = "surface1",
    resolution,
    roomType,
    baseUrl
  }) {
    let { width = window.innerWidth, height = window.innerHeight } = dims;
    this.roomDims = { width: 30, height: 30 };
    if (config.roomSize) this.roomDims = config.roomSize;
    this.w = width;
    this.h = height;
    this.surfaceName = surfaceName;
    this.sceneConfig = config;
    this.objProps = config[surfaceName];
    this.baseUrl = baseUrl;
    this.roomType = roomType;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      preserveDrawingBuffer: true,
      alpha: true,
      antialias: false
    });
    this.renderer.setPixelRatio(resolution);
    this.renderer.setSize(width, height);
    const camConfig = config[shots[0]];
    this.camera = perspectiveCamera({ ...camConfig, width, height });
    this.scene.add(this.camera);
    window.scene = this.scene;
    this.orbit = addOrbitControl(this.renderer, this.scene, this.camera, camConfig);
    this.orbit.enabled = false;
    // this.orbit.screenSpacePanning = true;
  }
  setupLights() {
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    this.scene.add(this.directionalLight);
    // const helper = new THREE.DirectionalLightHelper(this.directionalLight, 50)
    // this.scene.add(helper)
    const intensity = this.sceneConfig.ambientIntensity || 0.5;
    this.ambientLight = new THREE.AmbientLight(0xffffff, intensity);
    this.scene.add(this.ambientLight);
  }
  removeLights() {
    if (this.directionalLight) this.scene.remove(this.directionalLight);
    if (this.ambientLight) this.scene.remove(this.ambientLight);
  }
  setupSceneObjects({ carpetRotation }) {
    switch (this.roomType) {
      case "illustration":
        return this.setup3dObject();
      default:
        const loadCarpet = this.setupCarpet({fbxUrl: assetsFolder +'./Assets/rug.fbx'});
        this.removeObjIfExists("floor");
        this.removeObjIfExists("wallpaper");

        const promiseArr = [loadCarpet];
        if (this.sceneConfig.objects3d) {
          const floorName = this.findObjInConfig("floor");
          const wallpaperName = this.findObjInConfig("wallpaper");

          if (floorName) {
            const loadFloor = this.setupFloor(floorName);
            promiseArr.push(loadFloor);
          }
          if (wallpaperName) {
            const loadWallpaper = this.setupWallpaper(wallpaperName);
            promiseArr.push(loadWallpaper);
          }
        }
        return Promise.all(promiseArr);
    }
  }
  removeObjIfExists(objName) {
    const obj = this.scene.getObjectByName(objName);
    if (obj) {
      this.scene.remove(obj);
    }
  }
  findObjInConfig(objName) {
    return this.sceneConfig.objects3d.find(item => item.toLowerCase() === objName);
  }
  setup3dObject() {
    const { modelUrl } = this.sceneConfig;
    const fbxUrl = makeUrl(this.baseUrl, modelUrl);
    this.clearScene();

    const objKey = "surface1";
    this.objConf = this.sceneConfig[objKey];
    if (this.carpetLoaded) {
      this.scene.remove(this.carpetMesh);
      const tarObj = this.scene.getObjectByName("TargetObject");
      this.scene.remove(tarObj);

      this.carpetLoaded = false;
      this.removeLights();
    }
    const { position = [0, 0, 0], rotation = [90, 0, 0], scale } = this.objConf;
    return new Promise((resolve, reject) => {
      const setup = () => {
        this.object.position.fromArray(position);
        this.object.scale.fromArray(scale);
        this.object.rotation.fromArray(convertArrIntoRad(rotation));
        if (this.material) {
          this.object.material = this.material;
          this.object.material.needsUpdate = true;
          this.render();
        }
        this.objectLoaded = true;
        this.render();
        resolve();
      };
      this.fbxLoader.load(
        fbxUrl,
        obj => {
          this.object = obj.getObjectByName(objKey);
          this.scene.add(this.object);
          setup();
        },
        undefined,
        console.error
      );
    });
  }
  setupFloor() {
    return new Promise((resolve, reject) => {
      const { modelUrl } = this.sceneConfig;
      const fbxUrl = makeUrl(this.baseUrl, modelUrl);
      const objKey = "floor";
      const objConf = this.sceneConfig[objKey];
      const { position = [0, 0, 0], rotation = [90, 0, 0], scale } = objConf;
      const floor =
        this.scene.getObjectByName("floor") ||
        this.scene.getObjectByName("Floor") ||
        this.scene.getObjectByName("FLOOR");
      if (floor) {
        this.scene.remove(floor);
      }
      const setup = () => {
        this.floor.position.fromArray(position);
        this.floor.scale.fromArray(scale);
        this.floor.rotation.fromArray(convertArrIntoRad(rotation));
        this.floor.material = new MeshBasicMaterial({ side: THREE.DoubleSide, transparent: true });
        this.floor.material.needsUpdate = true;
        resolve();
      };
      this.fbxLoader.load(
        fbxUrl,
        obj => {
          this.floor =
            obj.getObjectByName("floor") ||
            obj.getObjectByName("Floor") ||
            obj.getObjectByName("FLOOR");
          this.scene.add(this.floor);
          setup();
        },
        undefined,
        console.error
      );
    });
  }

  setupWallpaper(wallpaperName) {
    return new Promise((resolve, reject) => {
      const { modelUrl } = this.sceneConfig;
      const fbxUrl = makeUrl(this.baseUrl, modelUrl);
      const objKey = wallpaperName;
      const objConf = this.sceneConfig[objKey];
      const { position = [0, 0, 0], rotation = [90, 0, 0], scale } = objConf;
      const wallpaper =
        this.scene.getObjectByName("wallpaper") ||
        this.scene.getObjectByName("Wallpaper") ||
        this.scene.getObjectByName("WALLPAPER");
      if (wallpaper) {
        this.scene.remove(wallpaper);
      }
      const setup = obj => {
        this.wallpaper =
          obj.getObjectByName("wallpaper") ||
          obj.getObjectByName("Wallpaper") ||
          obj.getObjectByName("WALLPAPER");
        this.scene.add(this.wallpaper);
        this.wallpaper.position.fromArray(position);
        this.wallpaper.scale.fromArray(scale);
        this.wallpaper.rotation.fromArray(convertArrIntoRad(rotation));
        this.wallpaper.material = new MeshBasicMaterial({
          side: THREE.DoubleSide,
          transparent: true,
          color: 0xff0000
        });
        this.wallpaper.material.needsUpdate = true;

        resolve();
      };
      if (!this.object3d) this.fbxLoader.load(fbxUrl, setup, undefined, console.error);
      else setup(this.object3d);
    });
  }

  setupCarpet({ carpetRotation, fbxUrl = assetsFolder+ './Assets/rug.fbx' }) {
    this.objConf = this.sceneConfig[this.surfaceName];
    const { position = [0, 0, 0], rotation = [90, 0, 0] } = this.objConf;
    if (this.objectLoaded) {
      this.scene.remove(this.object);
      const tarObj = this.scene.getObjectByName("TargetObject");
      if (tarObj) this.scene.remove(tarObj);
      this.objectLoaded = false;
    }
    return new Promise((resolve, reject) => {
      const setup = () => {
        // this.originalMesh =
        this.carpetMesh.position.fromArray(position);
        const { flagged } = this.sceneConfig;
        let fact = flagged ? 10 : 1;
        this.directionalLight.position.set(
          position[0] - 3000 / fact,
          position[1] + 3000 / fact,
          position[2]
        );
        var targetObject = new THREE.Object3D();
        targetObject.name = "TargetObject";
        targetObject.position.set(...position);
        this.scene.add(targetObject);
        this.directionalLight.target = targetObject;
        // let helper = new THREE.DirectionalLightHelper(this.directionalLight, 100, 0xff0000);
        // this.scene.add(helper);

        this.carpetMesh.rotation.fromArray(convertArrIntoRad(rotation.slice(0, 3)));
        this.initialRotation = (rotation[2] * Math.PI) / 180;
        if (carpetRotation) {
          this.carpetMesh.rotation.z += (carpetRotation * Math.PI) / 180;
        }
        if (this.designDetails) this.setCarpetScale(this.designDetails);

        if (this.material) {
          this.carpetMesh.material = this.material;
          this.carpetMesh.material.needsUpdate = true;
          this.render();
        }
        this.carpetLoaded = true;
        this.render();
        resolve();
      };

      if (this.changedIntensity()) {
        this.ambientIntensity = this.sceneConfig.ambientIntensity;
        if (this.carpetLoaded) {
          this.removeLights();
          this.setupLights();
        }
      }
      if (!this.carpetLoaded) {
        this.fbxLoader.load(
          fbxUrl,
          obj => {
            this.carpetMesh = obj.getObjectByName(this.surfaceName);
            this.scene.add(this.carpetMesh);
            this.setupLights();
            setup();
          },
          undefined,
          console.error
        );
      } else setup();
    });
  }
  changedIntensity() {
    const changedIntensity = this.ambientIntensity !== this.sceneConfig.ambientIntensity;
    if (
      changedIntensity &&
      (this.ambientIntensity !== undefined || this.sceneConfig.ambientIntensity !== undefined)
    ) {
      return true;
    } else {
      return false;
    }
  }
  setCarpetRotation(rotation) {
    const rot = convertArrIntoRad(rotation);
    if (!this.carpetLoaded) return;
    this.carpetMesh.rotation.fromArray(rot);
  }
  setCarpetPositon(position) {
    if (!this.carpetLoaded) return;
    this.carpetMesh.position.fromArray(position);
  }
  setCarpetScale(designDetails) {
    const { PhysicalWidth, PhysicalHeight, Unit, IsIrregular } = designDetails;
    if (!PhysicalWidth || !PhysicalHeight || !Unit) {
      console.error("Could not set carpet scale");
      return;
    }
    const { flagged } = this.sceneConfig;
    let fact = flagged ? 10 : 1;

    let wid = convertUnit(Unit, "ft", PhysicalWidth);
    let hgt = convertUnit(Unit, "ft", PhysicalHeight);

    if (window.InterfaceElements.IsWallToWall) {
      //take it from props/parameteres
      const { position = [0, 0, 0] } = this.objConf;

      const z = 107.6 * hgt; //107.6 = half of the rug.fbx which is 215 units (check in blender) (215 units = 1 ft)
      const x = 107.6 * wid;
      let fac = flagged ? 5 : 1;
      const min = new THREE.Vector3(
        (position[0] - x) / fac,
        position[1] - 30,
        (position[2] - z) / fac
      );
      const max = new THREE.Vector3(
        (position[0] + x) / fac,
        position[1] + 30,
        (position[2] + z) / fac
      );
      this.bounds = new Box3(min, max);

      wid = this.roomDims.width;
      hgt = this.roomDims.height;
    }
    //set carpet scale according to design details or specific ratio
    this.carpetMesh.scale.set(wid / fact, hgt / fact, IsIrregular ? 0.01 : 2 / fact);
  }
  setObjectVisibility(visibility) {
    this.object.visible = visibility;
    this.render();
  }
  setCarpetVisibility(visibility) {
    this.carpetMesh.visible = visibility;
    this.render();
  }
  setObjectTexture({ designDetails, designCanvas }) {
    return new Promise((resolve, reject) => {
      const { surfaceUnit = "in", doubleSide, defaultScale, fitWidth, offset } = this.objProps;
      const PhysicalWidth = convertUnit(
        designDetails.Unit,
        surfaceUnit,
        designDetails.PhysicalWidth
      );
      const PhysicalHeight = convertUnit(
        designDetails.Unit,
        surfaceUnit,
        designDetails.PhysicalHeight
      );
      this.designDetails = { ...designDetails, PhysicalHeight, PhysicalWidth, Unit: surfaceUnit };
      const designTexture = new CanvasTexture(designCanvas);
      designTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
      designTexture.wrapS = designTexture.wrapT = THREE.RepeatWrapping;
      let repeat = [1, 1];
      if (defaultScale)
        if (!fitWidth) {
          repeat = [defaultScale[0] / PhysicalWidth, defaultScale[1] / PhysicalHeight];
        } else {
          repeat = [1, (defaultScale[1] / defaultScale[0]) * (PhysicalWidth / PhysicalHeight)];
        }
      if (offset) {
        designTexture.offset.fromArray(offset);
      } else {
        designTexture.offset.fromArray([0, 0]);
      }
      designTexture.repeat.fromArray(repeat);
      //designTexture.rotation= Math.PI/2;
      this.material = new THREE.MeshBasicMaterial({
        map: designTexture,
        transparent: true,
        side: doubleSide ? THREE.DoubleSide : THREE.FrontSide,
        alphaTest: 0.5
      });
      if (!this.object) {
        console.error("could not find the object");
        resolve();
        return;
      }
      this.object.material = this.material;
      this.object.material.needsUpdate = true;

      this.render();
      resolve();
    });
  }

  setCarpetTexture({ designDetails, designCanvas, normapCanvas }) {
    const designTexture = new CanvasTexture(designCanvas);
    const normalTexture = new CanvasTexture(normapCanvas);
    designTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    normalTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    designTexture.wrapS = designTexture.wrapT = THREE.RepeatWrapping;
    normalTexture.wrapS = normalTexture.wrapT = THREE.RepeatWrapping;
    designTexture.generateMipmaps = false;
    designTexture.minFilter = THREE.LinearFilter;
    designTexture.magFilter = THREE.LinearFilter;
    
    if (window.flags && window.flags.visualizations?.textureWrapType === "clampToEdge") {
      designTexture.wrapS = designTexture.wrapT = THREE.ClampToEdgeWrapping;
      normalTexture.wrapS = normalTexture.wrapT = THREE.ClampToEdgeWrapping;
    }

    const surfaceUnit = "ft";
    const PhysicalWidth = convertUnit(designDetails.Unit, surfaceUnit, designDetails.PhysicalWidth);
    const PhysicalHeight = convertUnit(
      designDetails.Unit,
      surfaceUnit,
      designDetails.PhysicalHeight
    );
    this.designDetails = { ...designDetails, PhysicalHeight, PhysicalWidth, Unit: surfaceUnit };

    if (window.InterfaceElements && window.InterfaceElements.IsWallToWall) {
      let repeat = [this.roomDims.width / PhysicalWidth,
      this.roomDims.height / PhysicalHeight];
      let offsetX = 0;
      let offsetY = 0;
    
      if (window.flags && window.flags.visualizations?.wallToWallCenterRepeat?.x) {
        let halfRepeatX = repeat[0] / 2;
        offsetX = 0.5 - (halfRepeatX - Math.floor(halfRepeatX)); //offset to center the tile center as canvas center horizontally
      }
      if (window.flags && window.flags.visualizations?.wallToWallCenterRepeat?.y) {
        let halfRepeatY = repeat[0] / 2;
        offsetY = 0.5 - (halfRepeatY - Math.floor(halfRepeatY)); //offset to center the tile center as canvas center vertically
      }
      designTexture.offset.fromArray([offsetX, offsetY]);
      designTexture.repeat.fromArray([
        repeat[0],
        repeat[1],
      ]);
    }
    const { normalScale = [1, 1] } = this.sceneConfig;
    const normalScaleVec = new THREE.Vector2(...normalScale);
    this.material = new THREE.MeshStandardMaterial({
      map: designTexture,
      normalMap: normalTexture,
      normalScale: normalScaleVec,
      roughness: 1,
      metalness: 0.1,
      needsUpdate: true,
      transparent: true,
      side: THREE.FrontSide
    });
    if (!this.carpetMesh) return;
    this.carpetMesh.material = this.material;
    this.carpetMesh.material.needsUpdate = true;
    this.setCarpetScale(this.designDetails);
    this.render();
  }
  setFloorTexture({ floorCanvas }) {
    if (!this.floor || !this.floor.material || !this.renderer) return;

    if (!this.floor.material.map) {
      const texture = new CanvasTexture(floorCanvas);
      texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      this.floor.material.map = texture;
    }
    this.floor.material.map.needsUpdate = true;
    this.floor.material.needsUpdate = true;
    if (!this.floor.visible) this.floor.visible = true;
    this.render();
  }

  setWallpaperTexture({ wallpaperCanvas, dims = { width: 1, height: 1 } }) {
    if (!this.wallpaper || !this.wallpaper.material || !this.renderer) return;
    this.wallpaperDims = dims;
    const wallpaperConfig = this.sceneConfig[this.wallpaper.name];
    const { unit, surfaceSize } = wallpaperConfig;

    if (!this.wallpaper.material.map) {
      this.wallpaper.material.color.set("white");
      const texture = new CanvasTexture(wallpaperCanvas);
      texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

      this.wallpaper.material.map = texture;
      this.setWallpaperSurfaceSize({ surfaceSize });
    }
    this.wallpaper.material.map.needsUpdate = true;
    this.wallpaper.material.needsUpdate = true;
    if (!this.wallpaper.visible) this.wallpaper.visible = true;
    this.render();
  }
  setWallpaperSurfaceSize({ surfaceSize }) {
    const dims = this.wallpaperDims;
    if (!dims) return;
    let repeat = [1, 1];
    this.sceneConfig[this.wallpaper.name].surfaceSize = surfaceSize;

    if (surfaceSize) repeat = [surfaceSize[0] / dims.width, surfaceSize[1] / dims.height];
    this.wallpaper.material.map.repeat.set(...repeat);
  }

  changeFloorVisibility(visible) {
    if(this.floor){ this.floor.visible = visible;
    this.render();}
  }

  changeWallpaperVisibility(visible) {
    this.wallpaper.visible = visible;
    this.render();
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
    if (!intersect) return;
    const objPos = this.carpetMesh.position.clone();
    this.offset.copy(intersect.point).sub(objPos);
    return intersect;
  }

  mouseTouchMove(e) {
    if (!this.carpetMesh) return;
    //TODO:instead of casting on carpet, cast on an infinite plane
    let intersect = this.raycastMouseOnCarpet(e);
    if (!intersect) return;
    const objPos = this.carpetMesh.position.clone();
    const sub = intersect.point.sub(this.offset);
    sub.y = objPos.y;
    const subClamped = sub.clone();
    if (this.bounds) {
      this.bounds.clampPoint(sub, subClamped);
    }
    this.carpetMesh.position.copy(subClamped);
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
    if(!e) return null; 
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

    var mouseX = (x / width) * 2 - 1;
    var mouseY = -(y / height) * 2 + 1;
    return { mouseX, mouseY };
  }
  getCameraConfig() {
    const position = this.camera.position.toArray();
    const rotation = convertArrintoDeg(this.camera.rotation.toArray());
    const target = this.orbit.target.position.toArray();
    return { position, rotation, target };
  }
  rotateCarpet(rotationInDegrees, axis) {
    if (!this.carpetMesh) return;
    const { rotationFlag } = this.sceneConfig;
    if (!rotationFlag) this.carpetMesh.rotation[axis] += (rotationInDegrees * Math.PI) / 180;
    else this.carpetMesh.rotation[axis] -= (rotationInDegrees * Math.PI) / 180;
    if (axis === "z") this.initialRotation = this.carpetMesh.rotation.z;
    // const snap = 15 * Math.PI / 180
    // this.carpetMesh.rotation[axis] = Math.round(this.carpetMesh.rotation[axis] / snap) * snap
    this.render();
  }
  rotateCarpetFromInitialValue(rotationInDegrees) {
    if (!this.carpetMesh) return;
    const { rotationFlag } = this.sceneConfig;
    const fact = !rotationFlag ? 1 : -1;
    this.objConf = this.sceneConfig[this.surfaceName];
    const { rotation = [90, 0, 0] } = this.objConf;
    if (rotationInDegrees === 0) this.initialRotation = degToRad(rotation[2]);
    this.carpetMesh.rotation.z = this.initialRotation + degToRad(rotationInDegrees) * fact;
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
    const { offsetX, offsetY } = this.getRendererOffset();
    return {
      x: ((pos.x + 1) * this.w) / 2 + offsetX,
      y: ((-pos.y + 1) * this.h) / 2 + offsetY
    };
  }

  getCarpetPositions() {
    this.carpetMesh.geometry.computeBoundingBox();
    let box = this.carpetMesh.geometry.boundingBox;
    const widthheight = box.max.sub(box.min);

    const plane = new THREE.PlaneGeometry(widthheight.x, widthheight.y);
    const mat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const m = new THREE.Mesh(plane, mat);
    m.scale.copy(this.carpetMesh.scale);
    m.position.copy(this.carpetMesh.position);
    m.rotation.copy(this.carpetMesh.rotation);
    const a = [];
    plane.vertices.forEach(vertex => {
      const v = vertex.clone();
      v.applyMatrix4(this.carpetMesh.matrixWorld);
      a.push(v);
    });
    const b = a.map(vertex => createVector(vertex, this.camera, this.w, this.h));
    return [b[0], b[1], b[3], b[2]];
  }
  getCarpetArea() { }
  getCarpetMask() {
    const object = this.carpetMesh.clone();
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    object.material = material;
    object.material.needsUpdate = true;
    this.render();
    const dataurl = this.renderer.domElement.toDataURL();
    return dataurl;
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
    if (this.carpetMesh) {
      if (this.carpetMesh.material.map) this.carpetMesh.material.map.needsUpdate = true;
      if (this.carpetMesh.material.normalMap) this.carpetMesh.material.normalMap.needsUpdate = true;
      this.carpetMesh.material.needsUpdate = true;
    }
    if (this.object && this.object.material.map) {
      this.object.material.map.needsUpdate = true;
      this.object.material.needsUpdate = true;
      // this.object.material.normalMap.needsUpdate = true;
    }
    this.render();
  }
  resizeRenderer({ width, height }) {
    this.w = width;
    this.h = height;
    if (this.camera) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
    this.renderer.setSize(width, height);
    this.render();
  }
  getObjectConfig() {
    if (this.objectLoaded) {
      return null;
    } else {
      return this.carpetMesh;
    }
  }
  calculateCarpetSize() {
    if (!this.carpetMesh) return;
    const carpetSize = new THREE.Vector3();
    var box = new THREE.Box3();
    box.setFromObject(this.carpetMesh);
    box.getSize(carpetSize);
    // this.carpetMesh.geometry.computeBoundingBox();
    // this.carpetMesh.geometry.boundingBox.getSize(carpetSize);
    return carpetSize;
  }
  distbetween2Vertices(vertex1, vertex2, axis) {
    const { camera, renderer } = this;
    const vec = new THREE.Vector2();
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
    if (!carpetSize) return;
    const { flagged } = this.sceneConfig;
    const fact = flagged ? 10 : 1;
    const carpetRadius = (215 * 3) / fact;
    const carpetCenter = this.carpetMesh.position.clone();

    const vertex1 = carpetCenter.clone();
    const vertex2 = new THREE.Vector3(
      carpetCenter.x,
      carpetCenter.y,
      carpetCenter.z + carpetRadius
    );

    const dist1 = this.distbetween2Vertices(vertex1, vertex2);
    const radYY = dist1.yDist;
    const radYX = dist1.xDist;

    const vertex3 = new THREE.Vector3(
      carpetCenter.x + carpetRadius,
      carpetCenter.y,
      carpetCenter.z
    );
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
    return { radX, radY, canvasCenter };
  }
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
    rotation = [0, 0, 0]
  } = config;
  const aspect = width / height;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.lookAt(new THREE.Vector3(...target)); // This seems to be disabled by OrbitControls
  camera.position.set(...position);
  camera.rotation.set(...convertArrIntoRad(rotation));
  return camera;
};
const addOrbitControl = function (renderer, scene, camera, config = {}) {
  let { target = [0, 0, 0] } = config;
  const control = new OrbitControls(camera, renderer.domElement);
  control.enableKeys = false;
  control.target = new THREE.Vector3(...target);
  control.addEventListener("change", () => {
    renderer.render(scene, camera);
  });
  control.update();
  return control;
};
export const loadFbx = url => {
  return new Promise((resolve, reject) => {
    new FBXLoader().load(url, resolve, undefined, reject);
  });
};
