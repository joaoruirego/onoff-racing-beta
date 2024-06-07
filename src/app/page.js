"use client";
import Head from "next/head";
import ThreeDViewer from "./ThreeDViewer";
import { useState, useEffect } from "react";
import NextImage from "next/image";
import styles from "../styles/page.module.css";
import logo from "../imgs/logoOnOff.png";
import logoStep from "../../public/logoStepTransparent.png";
import ImageEditor from "./ImageEditor";
import { useLanguage } from "@/context/ContentContext";

const Home = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const { language, content, setLanguage } = useLanguage();

  return (
    <div>
      <Head>
        <title>OnOff Racing {content.simuladorTitle}</title>
        {/* <meta name="description" content="Your 3D Sweat Design Simulator" /> */}
        <link rel="icon" href="/favicon.ico" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </Head>
      <div className={styles.titleZone}>
        <div className={styles.titleStruct}>
          <NextImage src={logo} width={126} height={35} alt="Step" />
          {/* <p className={styles.desc}>{content.simuladorTitle}</p> */}
        </div>
        <div className={styles.poweredTextMainHeader}>
          <p className={styles.poweredText}>Powered by</p>
          <NextImage
            className={styles.poweredLogo}
            src={logoStep}
            width={105}
            height={45}
            alt="Step"
          />
        </div>
        {/* <div className={styles.buttonsLang}>
          <button
            style={{ fontWeight: language == "pt" ? "bold" : 400 }}
            onClick={() => setLanguage("pt")}
          >
            PT
          </button>
          <button
            style={{ fontWeight: language == "en" ? "bold" : 400 }}
            onClick={() => setLanguage("en")}
          >
            EN
          </button>
        </div> */}
      </div>

      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f4f4f4",
          margin: "auto",
        }}
      >
        <ThreeDViewer product={product} />
      </main>
    </div>
  );
};

export default Home;
