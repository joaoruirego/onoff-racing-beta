"use client";
import * as THREE from "three";
import { fabric } from "fabric";
import { useEffect, useRef, useState } from "react";
import TWEEN from "@tweenjs/tween.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  loadGLBModel,
  toHexString,
  changeColorOfAllComponents,
  changeColorOfSpecificComponents,
} from "./utils";
import NextImage from "next/image";
import styles from "@/styles/page.module.css";
import colorIcon from "@/imgs/colorIcon.webp";
import ColorEditor from "./ColorEditor";
import { calculateUVArea, getUVDimensions } from "@/app/get-uv-data";
import { useLanguage } from "@/context/ContentContext";

const ThreeDViewer = () => {
  const { content, language } = useLanguage();
  let colorTshirtG;

  let fabricCanvas = useRef(null);
  let editingComponent = useRef(null);
  const containerRef = useRef();
  const sceneRef = useRef(null); // Create a ref for the scene
  const raycaster = new THREE.Raycaster();
  let initialMouse = new THREE.Vector2();
  let initialUVCursor = new THREE.Vector2();
  let orbit;
  const [isLoading, setIsLoading] = useState(false);
  const [tutorial, setTutorial] = useState(false);
  const [canvasSize, setCanvasSize] = useState(1024); // Default to larger size
  const [fabricTexture, setFabricTexture] = useState(null);
  const [objectNames, setObjectNames] = useState([]); // Estado para armazenar os nomes dos objetos
  const [firstClick, setFirstClick] = useState(true);
  let localFirstClick = firstClick; // Copia o estado atual para uma variável local
  const [colorEditor, setColorEditor] = useState(false);
  const [activeObject, setActiveObject] = useState(null);

  function setBGColor(hexColor) {
    const color = hexColor.trim(); // Clean the input
    if (color[0] !== "#" || color.length !== 7) return; // Ensure valid color
    editingComponent.current.material.emissive.setHex(0x000000); // Reset emissive color

    const canvas = fabricCanvas.current;
    if (!canvas) return;

    const startColor = new THREE.Color(canvas.backgroundColor); // Current color
    const endColor = new THREE.Color(color); // New color from input

    let progress = 0; // Initialize progress
    const duration = 400; // Duration of the transition in milliseconds
    const stepTime = 10; // Time each step takes

    function step() {
      progress += stepTime;
      const lerpFactor = progress / duration;
      if (lerpFactor < 1) {
        // Continue interpolation
        const interpolatedColor = startColor.lerpColors(
          startColor,
          endColor,
          lerpFactor
        );
        const cssColor = "#" + interpolatedColor.getHexString();
        canvas.setBackgroundColor(cssColor, canvas.renderAll.bind(canvas));
        requestAnimationFrame(step); // Request the next animation frame
      } else {
        // Final color set after the animation ends
        canvas.setBackgroundColor(color, canvas.renderAll.bind(canvas));
      }
      updateTexture(); // Update texture if needed
    }
    step();
  }

  const updateTexture = () => {
    if (fabricTexture) fabricTexture.needsUpdate = true;
  };

  // Load fabric canvas
  useEffect(() => {
    fabricCanvas.current = new fabric.Canvas("fabric-canvas", {
      width: canvasSize,
      height: canvasSize,
      backgroundColor: "transparent", // Define fundo transparente
      part: editingComponent.current
        ? editingComponent.current.name
        : "bodyFMIX",
    });

    const texture = new THREE.CanvasTexture(fabricCanvas.current.getElement());
    texture.repeat.y = -1;
    texture.offset.y = 1;
    setFabricTexture(texture);

    return () => fabricCanvas.current.dispose();
  }, [canvasSize]);

  const images = [
    "/rosa-choque.png",
    "/white.png",
    "/verde-neon.png",
    "/azul-neon.png",
    "/white.png",
  ];

  // Associative array to map colors to images
  const colorToImageMap = {
    "#ffffff": images[0], // Assuming colors are like these
    "#000000": images[1],
    "rgb(54, 71, 58)": images[2],
    "rgb(50, 50, 50)": images[3],
    "rgb(200, 200, 200)": images[4],
  };

  // Function to preload and add image to canvas
  function preloadImageAndAddToCanvas(imagePath) {
    const img = new Image();
    img.src = imagePath;
    img.onload = () => {
      if (!fabricCanvas.current) {
        console.error("Fabric canvas is not initialized.");
        return;
      }
      fabricCanvas.current.clear();
      const fabricImg = new fabric.Image(img, {
        left: fabricCanvas.current.width / 2,
        top: fabricCanvas.current.height / 2,
        originX: "center",
        originY: "center",
        selectable: false,
        evented: false,
      });
      fabricCanvas.current.add(fabricImg);
      fabricCanvas.current.renderAll();
      updateTexture();
    };
    img.onerror = () => {
      console.error("Error loading the image from path:", imagePath);
    };
  }

  const [tshirtImage, setTshirtImage] = useState("/shirt4.001.png");

  const handleChangeColor = (colorTshirt) => {
    if (colorTshirt == "#000") {
      setTshirtImage("/preto_azul.png");
    } else if (colorTshirt == "#fff") {
      setTshirtImage("/shirt4.001.png");
    } else if (colorTshirt == "rgb(54, 71, 58)") {
      setTshirtImage("/verdes.png");
    } else if (colorTshirt == "rgb(50, 50, 50)") {
      setTshirtImage("/rosa-cinzaesc.png");
    } else if (colorTshirt == "rgb(200, 200, 200)") {
      setTshirtImage("/rosa-cinzaclaro.png");
    }
    changeColorOfSpecificComponents(sceneRef.current, "#ff0000", "bodyFMIX");

    updateTexture();
    // Muda a cor para vermelho
  };

  const image = tshirtImage;

  useEffect(() => {
    preloadImageAndAddToCanvas(image);
  }, [image, tshirtImage]);

  useEffect(() => {
    if (!fabricTexture) return;

    // Setup three.js scene
    const scene = new THREE.Scene();
    sceneRef.current = scene; // Assign the created scene to the ref

    scene.background = new THREE.Color(0xf4f4f4);
    const camera = new THREE.PerspectiveCamera(
      35,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 25;
    camera.position.y = 5;
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xf4f4f4); // cor de fundo da cena
    renderer.setPixelRatio(2); // aumentar os pixeis por pixeis para o dobro

    containerRef.current.appendChild(renderer.domElement);
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
    scene.add(hemisphereLight);

    const directionalLight = new THREE.DirectionalLight(0xf4f4f4, 1.5); // luz para se ver à frente
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.5); // luz para se ver à frente
    directionalLight.position.set(90, 45, -45);
    directionalLight2.position.set(-45, 90, 90);
    directionalLight.castShadow = true;
    directionalLight2.castShadow = true;

    scene.add(directionalLight);
    scene.add(directionalLight2);

    preloadImageAndAddToCanvas(image);

    const url = "/tshirtRightPlace.glb";

    loadGLBModel(
      url,
      scene,
      setIsLoading,
      setObjectNames,
      editingComponent,
      fabricTexture
    );

    orbit = new OrbitControls(camera, renderer.domElement);
    orbit.target.set(0, 0, 0);
    orbit.enableDamping = true;
    orbit.dampingFactor = 0.161;
    orbit.screenSpacePanning = false;
    orbit.maxPolarAngle = Math.PI / 1.61; // nao deixa ir o user ver por baixo do hoodie, so o suficiente
    orbit.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: null,
    };
    orbit.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: null,
    };
    orbit.enabled = true;
    orbit.minDistance = 16.1;
    orbit.maxDistance = 35;
    scene.fog = new THREE.FogExp2(0xffffff, 0.0161);

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    const animate = () => {
      requestAnimationFrame(animate);
      TWEEN.update(); // Atualiza todas as animações do Tween
      orbit.update(); // Ensures damping effects are recalculated each frame

      renderer.render(scene, camera);
    };
    animate();

    const container = containerRef.current;

    window.addEventListener("resize", onWindowResize);

    fabricCanvas.current.on("object:modified", updateTexture);
    fabricCanvas.current.on("object:added", updateTexture);

    return () => {
      renderer.domElement.remove();
      renderer.dispose();
      window.removeEventListener("resize", onWindowResize);

      fabricCanvas.current.off("object:modified", updateTexture);
      fabricCanvas.current.off("object:added", updateTexture);
    };
  }, [fabricTexture]);

  const colorEditorTab = () => {
    setColorEditor(!colorEditor);
  };

  return (
    <>
      {isLoading && (
        <div className={styles.loadingContainer}>
          <p>A carregar...</p>
        </div>
      )}
      <div ref={containerRef}> </div>

      <div className={styles.paleteZone}>
        <button
          onClick={() => handleChangeColor("#000")}
          className={styles.divAreaEspecifica}
          style={{ backgroundColor: "#000" }}
        />

        <button
          onClick={() => handleChangeColor("#fff")}
          className={styles.divAreaEspecifica}
          style={{ backgroundColor: "#fff" }}
        />

        <button
          onClick={() => handleChangeColor("rgb(54, 71, 58)")}
          className={styles.divAreaEspecifica}
          style={{ backgroundColor: "rgb(54, 71, 58)" }}
        />

        <button
          onClick={() => handleChangeColor("rgb(50, 50, 50)")}
          className={styles.divAreaEspecifica}
          style={{ backgroundColor: "rgb(50, 50, 50)" }}
        />

        <button
          onClick={() => handleChangeColor("rgb(200, 200, 200)")}
          className={styles.divAreaEspecifica}
          style={{ backgroundColor: "rgb(200, 200, 200)" }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            display: "none",
          }}
        >
          <canvas
            id="fabric-canvas"
            style={{
              border: "1px solid #00bfff",
              marginRight: "20px",
              position: "absolute",
              top: "0",
              left: "0",
            }}
          />
        </div>
      </div>

      {colorEditor && <ColorEditor setBGColor={setBGColor} />}
    </>
  );
};

export default ThreeDViewer;
