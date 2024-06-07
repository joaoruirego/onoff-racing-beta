"use client";
import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import NextImage from "next/image";
import styles from "../../../styles/page.module.css";
import logoStep from "../../../../public/logoStepTransparent.png";
import copyIcon from "../../../../public/copy.png";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { loadGLBModel } from "../../utils";
import { fetchScene } from "./utils";
import { db } from "@/firebase";
import { getDoc, doc } from "firebase/firestore";
import { useLanguage } from "@/context/ContentContext";

const FabricCanvas = ({ params }) => {
  const { content } = useLanguage();
  const canvasRefs = useRef({});
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [objectNames, setObjectNames] = useState([]);

  let orbit;

  const model = params.id[params.id.length - 1];

  const modelUrls = {
    1: "/hoodieTest.glb",
    2: "/1.glb",
    3: "/2.glb",
    4: "/3.glb",
    5: "/4.glb",
  };

  const url = modelUrls[model] || null;

  const mesh = useRef(null);

  const getBase64Data = async (docId) => {
    try {
      const docSnap = await getDoc(doc(db, "base64", docId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        return data.base64;
      } else {
        console.log("No such document!");
        return null;
      }
    } catch (e) {
      console.error("Error getting document:", e);
      return null;
    }
  };

  useEffect(() => {
    const initializeCanvas = async () => {
      const sceneDataArray = await fetchScene(params);

      if (!sceneDataArray || !Array.isArray(sceneDataArray)) {
        return;
      }
      sceneDataArray.forEach((sceneData, index) => {
        const { width, height, backgroundColor, texts, images, part } =
          sceneData;

        const canvas = new fabric.Canvas(`${part}`, {
          width,
          height,
        });

        canvas.setBackgroundColor(
          backgroundColor,
          canvas.renderAll.bind(canvas)
        );

        canvas.backgroundColor = backgroundColor;

        if (texts && texts.length > 0) {
          texts.forEach(
            ({
              text,
              fontFamily,
              color,
              top,
              left,
              fontSize,
              width,
              textAlign,
            }) => {
              const textObject = new fabric.Textbox(text, {
                fontFamily,
                fontSize,
                fill: color,
                left,
                top,
                width,
                originX: "center",
                originY: "center",
                textAlign,
              });
              canvas.add(textObject);
            }
          );
        }

        if (images && images.length > 0) {
          images.forEach(
            async ({
              base64,
              top,
              left,
              width,
              height,
              scaleX,
              scaleY,
              angle,
              flipX,
            }) => {
              const base64String = await getBase64Data(base64);
              if (base64String) {
                fabric.Image.fromURL(
                  base64String,
                  (img) => {
                    img.set({
                      left,
                      top,
                      scaleX,
                      scaleY,
                      width,
                      height,
                      angle,
                      originX: "center",
                      originY: "center",
                      flipX,
                    });

                    canvas.add(img);
                  },
                  { crossOrigin: "anonymous" } // Add crossOrigin to handle CORS if needed
                );
              }
            }
          );
        }

        canvas.renderAll();

        canvasRefs.current[`${part}`] = canvas;
      });

      setTimeout(() => {
        scene.children.forEach((child) => {
          console.log(child instanceof THREE.Group);
          if (child instanceof THREE.Group) {
            console.log("WW", child);
            child.children.forEach((meshh) => {
              console.log(meshh);
              if (Object.keys(canvasRefs.current).includes(meshh.name)) {
                mesh.current = meshh;
                console.log(meshh.name);
                try {
                  const newTexture = new THREE.CanvasTexture(
                    canvasRefs.current[meshh.name].lowerCanvasEl
                  );
                  newTexture.flipY = false;
                  mesh.current.material.map = newTexture;
                  mesh.current.material.map.needsUpdate = true;
                } catch (error) {
                  console.error("Error creating texture:", error);
                }
              }
            });
          }
        });

        animate();
      }, 5000);
    };

    initializeCanvas();

    const scene = new THREE.Scene();

    loadGLBModel(url, scene, setIsLoading, setObjectNames);

    const camera = new THREE.PerspectiveCamera(
      35,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 25;
    camera.position.y = -5;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xf4f4f4);
    renderer.setPixelRatio(2);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
    scene.add(hemisphereLight);

    const directionalLight = new THREE.DirectionalLight(0xf4f4f4, 1.5);
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(90, 45, -45);
    directionalLight2.position.set(-45, 90, 90);
    directionalLight.castShadow = true;
    directionalLight2.castShadow = true;

    scene.add(directionalLight);
    scene.add(directionalLight2);

    containerRef.current.appendChild(renderer.domElement);

    orbit = new OrbitControls(camera, renderer.domElement);
    orbit.target.set(0, 0, 0);
    orbit.enableDamping = true;
    orbit.dampingFactor = 0.161;
    orbit.screenSpacePanning = false;
    orbit.maxPolarAngle = Math.PI / 1.61;
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

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
      orbit.update();
    };

    return () => {};
  }, [params]);

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(`http://localhost:3000/visualize/${params.id}`)
      .then(
        () => {
          alert(content.successCopy); // Optionally show a message
        },
        (err) => {
          console.error("Não foi possível copiar o link: ", err); // Error handling
        }
      );
  };

  return (
    <>
      <div ref={containerRef}></div>
      <button onClick={copyToClipboard} className={styles.copiaTextMain}>
        <NextImage src={copyIcon} width={17} height={17} />
        <p className={styles.copiaText}>{content.copyLink}</p>
      </button>
      <div className={styles.poweredTextMain}>
        <p className={styles.poweredText}>Powered by</p>
        <NextImage
          className={styles.poweredLogo}
          src={logoStep}
          width={105}
          height={45}
        />
      </div>
    </>
  );
};

export default FabricCanvas;
