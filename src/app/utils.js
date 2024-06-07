import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { fabric } from "fabric";
import TWEEN from "@tweenjs/tween.js";
import { TextureLoader } from "three";
import { calculateAverageUV, getUVDimensions } from "./get-uv-data";

const loadGLBModel = (
  path,
  scenario,
  setIsLoading,
  onNamesLoaded,
  editingComponent,
  fabricTexture,
  animBack
) => {
  const loader = new GLTFLoader();
  const textureLoader = new TextureLoader();

  const objectNames = []; // Array para armazenar os nomes dos objetos
  const normalMap = textureLoader.load("/normal.png");
  const roughnessMap = textureLoader.load("/roughness.png");

  loader.load(
    path,
    function (gltf) {
      gltf.scene.position.set(0, 0, 0);
      gltf.scene.traverse(function (child) {
        if (child.isMesh) {
          child.material.map = fabricTexture; // Apply Fabric.js canvas texture
          child.material.normalMap = normalMap;
          child.material.roughnessMap = roughnessMap;
          child.material.needsUpdate = true;
          child.castShadow = true;
          child.receiveShadow = true;

          objectNames.push(child.name);
        }
      });

      scenario.add(gltf.scene);

      // Simultaneous opacity and scale animation for smoother transition
      new TWEEN.Tween({ opacity: 0, scale: 0.1 })
        .to({ opacity: 1, scale: 1.1 }, 2000)
        .easing(TWEEN.Easing.Exponential.InOut)
        .onUpdate(({ opacity, scale }) => {
          gltf.scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.material.transparent = true;
              child.material.opacity = opacity;
            }
          });
          gltf.scene.scale.set(scale, scale, scale);
        })
        .start();

      // Rotational animation with delayed start for dramatic effect
      new TWEEN.Tween({ rotation: 0 })
        .to({ rotation: Math.PI * 2 }, 3000)
        .easing(TWEEN.Easing.Exponential.InOut)
        .onUpdate(({ rotation }) => {
          gltf.scene.rotation.set(0, rotation, 0);
        })
        .delay(500)
        .start();

      setIsLoading(false);
      if (onNamesLoaded) {
        onNamesLoaded(objectNames);
      }
    },
    undefined,
    function (error) {
      setIsLoading(false);
      console.error("Error loading the GLB model:", error);
    }
  );
};

// Function to change the color of specific components
const changeColorOfSpecificComponents = (scene, hexColor, targetName) => {
  const endColor = new THREE.Color(hexColor.trim()); // Convert hex color to THREE.Color

  scene.traverse((child) => {
    if (
      child.isMesh &&
      child.material &&
      child.material.color &&
      child.name === targetName
    ) {
      const startColor = new THREE.Color(child.material.color.getHex()); // Get current color

      const tween = new TWEEN.Tween({ t: 0 }) // Start at '0'
        .to({ t: 1 }, 400) // Go to '1' over 400 milliseconds
        .onUpdate(({ t }) => {
          child.material.color.copy(startColor.clone().lerp(endColor, t)); // Interpolate color
        })
        .start(); // Start the tween
    }
  });

  function animate() {
    requestAnimationFrame(animate);
    TWEEN.update(); // Update the tweening
  }
  animate();
};

function getIntersections(raycaster, camera, scene, mouse) {
  raycaster.setFromCamera(mouse, camera);
  let intersections = raycaster.intersectObjects(scene.children, true);
  return intersections;
}

function getIntersection(raycaster, camera, object, mouse) {
  raycaster.setFromCamera(mouse, camera);
  let intersection = raycaster.intersectObject(object, false);
  return intersection;
}

function selectImage(
  initialUVCursor,
  fabricCanvas,
  isImageSelected,
  rotated,
  selectedHandle,
  isHandleSelected
) {
  let isSelected = false;
  const point = new fabric.Point(initialUVCursor.x, initialUVCursor.y);
  let imageSelectedContainsPoint = false;

  //itera o canvas e verifica se algum objeto contém o ponto
  fabricCanvas.current.forEachObject(function (obj) {
    if (
      obj.containsPoint(point) &&
      fabricCanvas.current.getActiveObject() == obj
    ) {
      isSelected = true;
      fabricCanvas.current.setActiveObject(obj).bringToFront(obj).renderAll();
      updateTexture();
    } else if (obj.containsPoint(point) && !imageSelectedContainsPoint) {
      rotated = obj.angle;
      isSelected = true;
      fabricCanvas.current.setActiveObject(obj).bringToFront(obj).renderAll();
      updateTexture();
    }

    let tolerance = (obj.scaleX * obj.width) / 10;
    rotated = obj.angle;
    for (let i in obj.oCoords) {
      let supLimX = obj.oCoords[i].x + tolerance;
      let supLimY = obj.oCoords[i].y + tolerance;
      let infLimX = obj.oCoords[i].x - tolerance;
      let infLimY = obj.oCoords[i].y - tolerance;
      if (
        initialUVCursor.x <= supLimX &&
        initialUVCursor.x >= infLimX &&
        initialUVCursor.y >= infLimY &&
        initialUVCursor.y <= supLimY
      ) {
        selectedHandle = i;
        isHandleSelected = true;
        isImageSelected = true;
        isSelected = true;
      }
    }
  });

  if (!isSelected) {
    fabricCanvas.current.discardActiveObject().renderAll();
    isImageSelected = false;
    updateTexture();
  }
  return isSelected;
}

function copyCanvas(origin, destination) {
  destination.clear();
  destination.backgroundColor = origin.backgroundColor;
  origin.forEachObject(function (i) {
    destination.add(i);
  });
}

const updateTexture = (fabricTexture) => {
  if (fabricTexture) fabricTexture.needsUpdate = true;
};

const handleImage = (e, fabricCanvas) => {
  const file = e.target.files[0];
  let position = calculateAverageUV(editingComponent.current);
  let scaleF = getUVDimensions(editingComponent.current) * 0.5;
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const imgObj = new Image();
    imgObj.src = e.target.result;
    imgObj.onload = function () {
      const fabricImage = new fabric.Image(imgObj);
      const scale =
        Math.min(
          fabricCanvas.current.width / fabricImage.width,
          fabricCanvas.current.height / fabricImage.height
        ) * scaleF;
      fabricImage.set({
        selectable: true,
        left: fabricCanvas.current.width * position.averageU,
        top: fabricCanvas.current.height * (position.averageV - 0.1),
        originX: "center",
        originY: "center",
        scaleX: scale * 0.65,
        scaleY: scale * 0.65,
        cornerSize: (fabricImage.width * fabricImage.scaleX) / 100,
        transparentCorners: false,
        cornerColor: "rgb(255,0,0)",
      });
      fabricCanvas.current.add(fabricImage);
      fabricCanvas.current.renderAll();
      updateTexture();
    };
  };
  reader.readAsDataURL(file);
};

function calculateAngle(centralPoint, initialCursor, currentCursor) {
  const vetorInicial = {
    x: initialCursor.x - centralPoint.x,
    y: initialCursor.y - centralPoint.y,
  };

  const vetorAtual = {
    x: currentCursor.x - centralPoint.x,
    y: currentCursor.y - centralPoint.y,
  };

  const anguloInicial = Math.atan2(vetorInicial.y, vetorInicial.x);
  const anguloAtual = Math.atan2(vetorAtual.y, vetorAtual.x);

  let anguloRotacao = anguloAtual - anguloInicial;

  anguloRotacao *= 180 / Math.PI;

  anguloRotacao = (anguloRotacao + 360) % 360;

  initialCursor.x = currentCursor.x;
  initialCursor.y = currentCursor.y;

  return anguloRotacao;
}

function toHexString(color) {
  // Check if isColor is true before proceeding

  // Convert each color component to an integer in the range 0-255
  const red = Math.round(color.r * 255);
  const green = Math.round(color.g * 255);
  const blue = Math.round(color.b * 255);

  // Convert each component to a hexadecimal string and pad with zeros
  const redHex = red.toString(16).padStart(2, "0");
  const greenHex = green.toString(16).padStart(2, "0");
  const blueHex = blue.toString(16).padStart(2, "0");

  // Concatenate the hex strings with a '#' prefix
  return `#${redHex}${greenHex}${blueHex}`;
}

export {
  loadGLBModel,
  getIntersections,
  getIntersection,
  selectImage,
  copyCanvas,
  updateTexture,
  handleImage,
  calculateAngle,
  toHexString,
  changeColorOfSpecificComponents,
};
