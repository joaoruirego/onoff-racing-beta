import React, { useRef, useState, useEffect, forwardRef } from "react";
import styles from "@/styles/page.module.css";
import { useLanguage } from "@/context/ContentContext";
const ColorEditor = forwardRef(({ setBGColor, closeTabs }, ref) => {
  const { content } = useLanguage();

  const [heightWindow, setHeightWindow] = useState(292);

  // This example assumes you have a function that's called when the color changes
  const onColorChange = (color) => {
    // Assume que `color` já é uma string hexadecimal como '#ffffff'
    setBGColor(color);
  };

  // const handleColorButtonClick = (colorHex) => {
  //   // Assuming 'bodyF' is the target mesh name. Change as needed.
  //   const meshName = "bodyF";
  //   const color = parseInt(colorHex.replace(/^#/, ""), 16);
  //   changeColor(meshName, color);
  // };

  return (
    <>
      <div style={{ height: heightWindow }} className={styles.editZoneCor}>
        <div className={styles.nameZone}>
          <button className={styles.fileUploadLabealBack} onClick={closeTabs}>
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
          <p className={styles.trititle}>{content.editColor}</p>
          <label style={{ opacity: 0 }} className={styles.fileUploadLabealAdd}>
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
          </label>
        </div>

        <div className={styles.coresDisposalTlm}>
          <div className={styles.coresDisposal}>
            <button
              style={{ backgroundColor: "#feff00" }}
              className={styles.addCorBtn}
              onClick={() => setBGColor("#feff00")}
            />
            <button
              style={{ backgroundColor: "#88bcec" }}
              className={styles.addCorBtn}
              onClick={() => setBGColor("#88bcec")}
            />
            <button
              style={{ backgroundColor: "#f8c404" }}
              className={styles.addCorBtn}
              onClick={() => setBGColor("#f8c404")}
            />
            <button
              style={{ backgroundColor: "#000000" }}
              className={styles.addCorBtn}
              onClick={() => setBGColor("#070707")}
            />
            <button
              style={{ backgroundColor: "#90240c" }}
              className={styles.addCorBtn}
              onClick={() => setBGColor("#90240c")}
            />
          </div>
          <div className={styles.coresDisposal}>
            <button
              style={{ backgroundColor: "#188434" }}
              className={styles.addCorBtn}
              onClick={() => setBGColor("#188434")}
            />
            <button
              style={{ backgroundColor: "#f0540c" }}
              className={styles.addCorBtn}
              onClick={() => setBGColor("#f0540c")}
            />
            <button
              style={{ backgroundColor: "#1004d4" }}
              className={styles.addCorBtn}
              onClick={() => setBGColor("#1004d4")}
            />
            <button
              style={{ backgroundColor: "#08a4d4" }}
              className={styles.addCorBtn}
              onClick={() => setBGColor("#08a4d4")}
            />
            <button
              style={{ backgroundColor: "#600c14" }}
              className={styles.addCorBtn}
              onClick={() => setBGColor("#600c14")}
            />
          </div>
          <div className={styles.coresDisposal}>
            <button
              style={{ backgroundColor: "#48cc3c" }}
              className={styles.addCorBtn}
              onClick={() => setBGColor("#48cc3c")}
            />
            <button
              style={{ backgroundColor: "#d8d49c" }}
              className={styles.addCorBtn}
              onClick={() => setBGColor("#d8d49c")}
            />
            <button
              style={{ backgroundColor: "#c8c4c4" }}
              className={styles.addCorBtn}
              onClick={() => setBGColor("#c8c4c4")}
            />
            <button
              style={{ backgroundColor: "#082c0c" }}
              className={styles.addCorBtn}
              onClick={() => setBGColor("#082c0c")}
            />
            <button
              style={{ backgroundColor: "#080c1c" }}
              className={styles.addCorBtn}
              onClick={() => setBGColor("#080c1c")}
            />
          </div>
          <div className={styles.coresDisposal}>
            <button
              style={{ backgroundColor: "#d02414" }}
              className={styles.addCorBtn}
              onClick={() => setBGColor("#d02414")}
            />
            <button
              style={{ backgroundColor: "#68147c" }}
              className={styles.addCorBtn}
              onClick={() => setBGColor("#68147c")}
            />
            <button
              style={{ backgroundColor: "#ffffff" }}
              className={styles.addCorBtn}
              onClick={() => setBGColor("#ffffff")}
            />
            <button
              style={{ backgroundColor: "#ffffff", opacity: 0 }}
              className={styles.addCorBtn}
              onClick={() => setBGColor("#ffffff")}
            />
            <button
              style={{ backgroundColor: "#ffffff", opacity: 0 }}
              className={styles.addCorBtn}
              onClick={() => setBGColor("#ffffff")}
            />
          </div>
        </div>
      </div>
    </>
  );
});

export default ColorEditor;
