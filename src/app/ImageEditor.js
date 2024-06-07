import React, {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import styles from "../styles/page.module.css";
import deleteIcon from "@/imgs/binIcon.png";
import mirrorIcon from "@/imgs/mirrorIcon.png";
import NextImage from "next/image";
import { calculateAverageUV, getUVDimensions } from "./get-uv-data";
import { useLanguage } from "@/context/ContentContext";
const ImageEditor = forwardRef(
  (
    {
      closeTabs,
      fabricCanvas,
      updateTexture,
      activeObject,
      imageSrc,
      setImageSrc,
      editingComponent,
    },
    ref
  ) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [colorToRemove, setColorToRemove] = useState(null);
    const canvasRef = useRef(null);
    const imgRef = useRef(new Image());
    const [imgTest, setimgTeste] = useState(null);
    const [picker, setPicker] = useState(false);
    const [removeBtn, setRemoveBtn] = useState(false);

    const { content } = useLanguage();

    const initialHeight = window.innerWidth <= 750 ? 120 : 292;
    const [heightWindow, setHeightWindow] = useState(initialHeight);

    const [windowCanvas, setWindowCanvas] = useState(0);
    const [opacityHint, setOpacityHint] = useState(1);
    const [opacityHintText, setOpacityHintText] = useState(1);
    const [indexHint, setIndexHint] = useState(0);
    const [widthHint, setWidthHint] = useState(190);
    const [fontHint, setFontHint] = useState(12);
    const [displayHint, setDisplayHint] = useState("flex");
    const [escolheBtn, setEscolheBtn] = useState(false);
    const [deleteBtn, setDeleteBtn] = useState(false);
    const [showCanvas, setShowCanvas] = useState(false);

    const removeBgImgCanva = (newImg) => {
      const canvas = fabricCanvas.current;

      if (activeObject && activeObject.type === "image") {
        const originalProps = {
          left: activeObject.left,
          top: activeObject.top,
          angle: activeObject.angle,
          scaleX: activeObject.scaleX,
          scaleY: activeObject.scaleY,
          originX: "center",
          originY: "center",
          flipX: activeObject.flipX,
        };

        // Verifica se já existe uma imagem substituta e remove-a antes de adicionar uma nova
        const existingImage = canvas
          .getObjects()
          .find((obj) => obj.type === "image" && obj !== activeObject);
        if (existingImage) {
          canvas.remove(existingImage);
        }

        fabric.Image.fromURL(newImg, (newImgObj) => {
          newImgObj.set({
            ...originalProps,
            width: newImgObj.width,
            height: newImgObj.height,
            scaleX: originalProps.scaleX,
            scaleY: originalProps.scaleY,
            flipX: originalProps.flipX,
            cornerSize: 15,
            borderColor: "transparent",
            cornerColor: "rgba(0, 0, 0, 0.2)",
            transparentCorners: false,
            cornerStyle: "circle",
          });

          canvas.remove(activeObject); // Remove a imagem antiga
          canvas.add(newImgObj); // Adiciona a nova imagem
          canvas.setActiveObject(newImgObj); // Define a nova imagem como objeto ativo
          canvas.renderAll();
          updateTexture();
        });
      }
    };

    const handleHoverHint = () => {
      // Immediately start fading out the hint text
      setOpacityHintText(0);

      setTimeout(() => {
        // After 400ms, hide the hint completely
        setOpacityHint(0);
        setWidthHint(0);
        // Optionally, adjust the font hint here if needed
      }, 400);
    };

    const handleLeaveHint = () => {
      // Wait for 5 seconds before resetting the hint's appearance
      setTimeout(() => {
        setOpacityHint(1);
        setWidthHint(190);
        setOpacityHintText(1);
        // Optionally, reset the font hint size here if needed
      }, 5000);
    };

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          // img.onload = () => addImage(img.src);

          img.onload = () => {
            // Suponha que 'targetCanvasId' seja uma prop que você passa para o ImageEditor
            // indicando se é para atualizar 'fabricCanvas' ou 'fabricCanvasMesh'
            addImage(img.src, targetCanvasId);
          };
          img.src = event.target.result;
        };

        reader.readAsDataURL(file);
        setSelectedFile(URL.createObjectURL(file));
        updateTexture();
      }
    };

    const handleImage = (e) => {
      const file = e.target.files[0];
      let position = calculateAverageUV(editingComponent.current);
      let scaleF = getUVDimensions(editingComponent.current) * 0.8;
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
          const aspectRatio = fabricImage.width / fabricImage.height;
          fabricImage.set({
            selectable: true,
            left: fabricCanvas.current.width * position.averageU,
            top: fabricCanvas.current.height * (position.averageV - 0.1),
            originX: "center",
            originY: "center",
            scaleX: scale * 0.65,
            scaleY: scale * 0.65,
            cornerSize: (scale * 0.65 * fabricImage.scaleX) / 10,
            cornerStyle: "circle",
            transparentCorners: false,
            cornerColor: "rgba(0,0,0,0.4)",
            borderColor: "transparent",
          });
          fabricCanvas.current.add(fabricImage);
          fabricCanvas.current.renderAll();
          updateTexture();
        };
      };
      reader.readAsDataURL(file);
    };

    // useEffect(() => {
    //   const handleSelection = () => {
    //     if (fabricCanvas.current) {
    //       const activeObject = fabricCanvas.current.getActiveObject();
    //       if (activeObject && activeObject.type === "image") {
    //         setImageSrc(activeObject.getSrc()); // Salva a URL da imagem no estado
    //       }
    //     }
    //   };
    //   console.log("fabricname:", fabricCanvas.current);

    //   if (fabricCanvas.current) {
    //     fabricCanvas.current.on("selection:created", handleSelection);
    //     fabricCanvas.current.on("selection:updated", handleSelection);
    //   }

    //   return () => {
    //     if (fabricCanvas.current) {
    //       fabricCanvas.current.off("selection:created", handleSelection);
    //       fabricCanvas.current.off("selection:updated", handleSelection);
    //     }
    //   };
    // }, [fabricCanvas]);

    // Then export the canvas as before
    const exportCanvasAsImage = () => {
      // Temporarily set canvas background to #0f0 for export
      const originalBg = fabricCanvas.backgroundColor;
      fabricCanvas.backgroundColor = "#fff"; // Set to white
      fabricCanvas.renderAll();

      const dataURL = fabricCanvas.toDataURL({
        format: "png",
        quality: 1.0,
      });

      // Revert canvas background to its original state after export, if needed
      fabricCanvas.backgroundColor = originalBg;
      fabricCanvas.renderAll();

      return dataURL;
    };

    useEffect(() => {
      if (ref) {
        ref.current = { exportCanvasAsImage };
      }
    }, [ref, exportCanvasAsImage]);

    // const handleExport = () => {
    //   setTimeout(() => {
    //     exportTexture(exportCanvasAsImage());
    //   }, 100);
    // };

    // remove color

    useEffect(() => {
      loadImageOnCanvas();
      if (activeObject && activeObject.type == "image") setRemoveBtn(true);
    }, [activeObject]);

    const loadImageOnCanvas = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        const img = imgRef.current;
        img.src = imageSrc;
        img.onload = () => {
          setWindowCanvas(311);
          const canvasWidth = img.width;
          const aspectRatio = img.height / img.width;
          const canvasHeight = canvasWidth * aspectRatio;

          canvas.width = canvasWidth;
          canvas.height = canvasHeight;

          ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
        };
      }
    };

    useEffect(() => {
      if (showCanvas) {
        loadImageOnCanvas();
      }
    }, [showCanvas, imageSrc]); // Garanta que ele seja chamado novamente se `showCanvas` ou `imageSrc` mudar

    const pickColor = (event) => {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const scaleX = imgRef.current.naturalWidth / rect.width; // Proporção de escala em X
      const scaleY = imgRef.current.naturalHeight / rect.height; // Proporção de escala em Y
      const x = (event.clientX - rect.left) * scaleX; // Coordenada X ajustada
      const y = (event.clientY - rect.top) * scaleY; // Coordenada Y ajustada

      const ctx = canvas.getContext("2d");
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      setColorToRemove(`${pixel[0]},${pixel[1]},${pixel[2]}`);
    };

    const removeColor = () => {
      if (!colorToRemove || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const [rToRemove, gToRemove, bToRemove] = colorToRemove
        .split(",")
        .map(Number);

      for (let i = 0; i < data.length; i += 4) {
        if (
          isWithinRange(data[i], rToRemove) &&
          isWithinRange(data[i + 1], gToRemove) &&
          isWithinRange(data[i + 2], bToRemove)
        ) {
          data[i + 3] = 0; // Torna o pixel transparente
        }
      }

      ctx.putImageData(imageData, 0, 0);
      const editedImageData = canvas.toDataURL();
      setImageSrc(editedImageData); // Atualiza a fonte da imagem com a imagem editada
      removeBgImgCanva(editedImageData);
    };

    const isWithinRange = (value, target) => {
      const tolerance = 16.1;
      return value >= target - tolerance && value <= target + tolerance;
    };

    // mudar parametros da imagem para mudar com o removeColor

    const handleWidthChange = (event) => {
      const newWidth = event.target.value;
      setWidth(newWidth);
    };

    const handleRemoverCor = () => {
      setPicker(true);
      setShowCanvas(true); // Ativa a visibilidade do canvas
      loadImageOnCanvas();
      setHeightWindow(450);
    };

    const handleDelete = () => {
      setDeleteBtn(!deleteBtn);
      if (fabricCanvas.current && activeObject) {
        fabricCanvas.current.remove(activeObject);
        fabricCanvas.current.discardActiveObject(); // Remove a seleção atual
        fabricCanvas.current.renderAll(); // Atualiza o canvas
        // closeTabs(); // Fecha as abas de edição se necessário
        updateTexture(); // Atualiza a textura para refletir as mudanças
        closeTabs();
      }
    };

    const handleFlipH = () => {
      if (fabricCanvas.current.getActiveObject()) {
        const obj = fabricCanvas.current.getActiveObject();
        obj.set({
          flipX: !obj.flipX,
        });
        fabricCanvas.current.renderAll();
        updateTexture();
      }
    };

    const handleFlipV = () => {
      if (fabricCanvas.current.getActiveObject()) {
        const obj = fabricCanvas.current.getActiveObject();
        obj.set({
          flipY: !obj.flipY,
        });
        fabricCanvas.current.renderAll();
        updateTexture();
      }
    };

    const adjustHeight = () => {
      const newHeight = window.innerWidth <= 750 ? 150 : 292;
      setHeightWindow(newHeight);
    };

    useEffect(() => {
      // Adiciona o event listener ao montar
      window.addEventListener("resize", adjustHeight);

      // Limpa o event listener ao desmontar
      return () => {
        window.removeEventListener("resize", adjustHeight);
      };
    }, []); // Array de dependências vazio para rodar apenas uma vez

    return (
      <>
        <div style={{ height: heightWindow }} className={styles.editZoneImg}>
          <div className={styles.nameZone}>
            <button
              className={styles.fileUploadLabealBack}
              onClick={() => {
                closeTabs();
                setPicker(false);
              }}
            >
              <p
                style={{
                  marginTop: -15,
                  justifyContent: "center",
                  fontSize: 12,
                  marginLeft: -1,
                  color: "#fff",
                }}
              >
                &#8592;
              </p>
            </button>
            <p className={styles.trititle}>{content.editImage}</p>
            <label className={styles.fileUploadLabealAdd}>
              <p
                style={{
                  marginTop: -13,
                  marginLeft: -1,
                  fontSize: 15,
                  color: "#fff",
                }}
              >
                +
              </p>
              <input
                type="file"
                onChange={handleImage}
                style={{ display: "none" }}
              />
            </label>
          </div>

          {/* {activeObject != null ||
        activeObjectMesh != null ||
        activeObjectMangaL != null ||
        activeObjectMangaR != null ||
        activeObjectHoodOut != null ? ( */}

          <div className={styles.menuPicker}>
            {removeBtn ? (
              <>
                {!picker && (
                  <>
                    <div className={styles.editImageMain}>
                      <div>
                        <button
                          className={styles.divAreaEspecifica}
                          style={{ borderWidth: 0 }}
                          onClick={handleRemoverCor}
                        >
                          <div className={styles.divIcon}>
                            <img
                              src={"./removeIcon.png"}
                              style={{ width: 25, height: 25 }}
                              alt="step"
                            />
                          </div>
                          <div>
                            <p className={styles.titleText}>
                              {content.removeColor}
                            </p>
                            <p className={styles.infoText}>
                              {content.removeColorDesc}
                            </p>
                          </div>
                        </button>
                        <button
                          className={styles.divAreaEspecifica}
                          style={{ borderWidth: 0 }}
                          onClick={handleFlipH}
                        >
                          <div className={styles.divIcon}>
                            <NextImage
                              src={mirrorIcon}
                              width={25}
                              height={25}
                              alt="step"
                            />
                          </div>
                          <div>
                            <p className={styles.titleText}>
                              {content.mirrorImage}
                            </p>
                            <p className={styles.infoText}>
                              {content.mirrorImageDesc}
                            </p>
                          </div>
                        </button>
                      </div>
                      <button
                        onClick={handleDelete}
                        className={styles.deleteButtonImage}
                      >
                        <NextImage src={deleteIcon} width={25} height={25} />

                        {/* <p>Apagar Imagem</p> */}
                      </button>
                    </div>

                    <div className={styles.editImageMainMobile}>
                      <button
                        className={styles.divAreaEspecifica}
                        style={{ borderWidth: 0 }}
                        onClick={handleRemoverCor}
                      >
                        <div className={styles.divIcon}>
                          <img
                            src={"./removeIcon.png"}
                            style={{ width: 25, height: 25 }}
                            alt="step"
                          />
                        </div>
                      </button>
                      <button
                        className={styles.divAreaEspecifica}
                        style={{ borderWidth: 0 }}
                        onClick={handleFlipH}
                      >
                        <div className={styles.divIcon}>
                          <NextImage
                            src={mirrorIcon}
                            width={25}
                            height={25}
                            alt="step"
                          />
                        </div>
                      </button>
                      <button
                        className={styles.divAreaEspecifica}
                        style={{ borderWidth: 0 }}
                        onClick={handleDelete}
                      >
                        <div className={styles.divIcon}>
                          <NextImage
                            src={deleteIcon}
                            width={25}
                            height={25}
                            alt="step"
                          />
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div>
                <input
                  type="file"
                  onChange={handleImage}
                  style={{
                    width: 311,
                    position: "absolute",
                    height: 380,
                    top: 0,
                    zIndex: -1,
                    opacity: 0,
                  }}
                />
                <div className={styles.noImage}>
                  <p className={styles.trititle}>{content.dragImgToStart}</p>
                </div>
              </div>
            )}

            <>
              {/* {activeObject && activeObject.type == "image" && picker && (
                <div
                  style={{
                    opacity: opacityHint,
                    transition: "all 0.4s ease-in-out",
                    width: widthHint,
                    display: displayHint,
                  }}
                  className={styles.hintText}
                  onMouseOver={handleHoverHint}
                  onMouseLeave={handleLeaveHint}
                  onMouseUp={handleLeaveHint} // Consider if onMouseUp is necessary for your use case
                >
                  <img
                    src="./removeIcon.png"
                    style={{ width: 15, height: 15 }}
                  />
                  <p
                    style={{
                      color: "#333",
                      textAlign: "center",
                      opacity: opacityHintText,
                      fontSize: fontHint,
                      letterSpacing: -0.4,
                    }}
                    className={styles.trititle}
                  >
                    {content.clickColor}
                  </p>
                </div>
              )} */}
            </>

            {picker ? (
              <div className={styles.bottomWindow}>
                <button
                  style={{
                    backgroundColor: "#fff",
                    boxShadow: "0px 0px 35px rgba(0, 0, 0, 0.05)",
                  }}
                  className={styles.fecharBtn}
                  onClick={removeColor}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      alignSelf: "center",
                      textAlign: "center",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        backgroundColor: `rgb(${colorToRemove})`,
                        borderRadius: 100,
                        border: "1px solid #f2f2f2",
                        boxShadow: "0 0 15px rgba(0, 0, 0, 0.1)",
                      }}
                    ></div>
                    {content.removeColor}
                  </div>
                </button>
              </div>
            ) : null}

            {showCanvas && (
              <div
                style={{
                  width: window.innerWidth > 750 ? windowCanvas : "100%",
                  alignContent: "center",
                  justifyContent: "center",
                  backgroundColor: "#f9f9f9",
                  borderRadius: 10,
                  border: "1px solid transparent",
                  boxShadow: "0 0 15px rgba(0, 0, 0, 0.1)",
                  marginTop: 10,
                  marginBottom: 55,
                }}
              >
                <canvas
                  ref={canvasRef}
                  onClick={pickColor}
                  style={{
                    cursor: "crosshair",
                    borderRadius: 15,
                    width: "100%",
                    border: "1px solid transparent",
                    justifyContent: "center",
                    display: showCanvas ? "block" : "none",
                  }}
                />
              </div>
            )}
          </div>
          {/* ) : (
          <div
            style={{
              marginTop: 165,
              alignSelf: "center",
            }}
          >
            <p className={styles.trititle}>Adicione uma imagem para começar</p>
          </div>
        )} */}
        </div>
      </>
    );
  }
);

export default ImageEditor;
