"use client";
import React, { createContext, useState, useContext, useEffect } from "react";

const LanguageContext = createContext();

const localStorageKey = "language";
import { en } from "@/locales/en";
import { pt } from "@/locales/pt";

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [content, setContent] = useState(null);

  const setLanguage = (lang) => {
    localStorage.setItem(localStorageKey, lang);
    setLanguageState(lang);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const storedLanguage = localStorage.getItem(localStorageKey);
      const lang = storedLanguage || "pt";

      if (lang === "en") {
        setContent(en);
      } else {
        setContent(pt);
      }

      setLanguageState(lang);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const updateContent = async () => {
      if (language) {
        if (language === "en") {
          setContent(en);
        } else {
          setContent(pt);
        }
      }
    };

    updateContent();
  }, [language]);

  if (isLoading) return;

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, isLoading, content }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  return useContext(LanguageContext);
};
