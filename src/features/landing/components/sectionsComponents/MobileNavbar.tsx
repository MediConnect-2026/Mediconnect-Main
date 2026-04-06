import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import MediButton from "@/shared/components/landing/MediButton";
import MobileLanguageSelector from "@/shared/components/landing/MobileLanguageSelector";
import { GripIcon } from "@/shared/ui/drop-icon";
import { XIcon } from "@/shared/ui/x-icon";
import { ChevronDownIcon } from "@/shared/ui/chevron-down";
import { useTranslation } from "react-i18next";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { cl } from "@/utils/cloudinary";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/router/routes";

const languages = [
  {
    code: "es",
    label: "Español",
    flag: cl(
      "https://res.cloudinary.com/dy2wtanhl/image/upload/v1771637850/flag-spain_u9cses.png",
      { width: 48, height: 48, fit: "thumb", quality: "auto:good" },
    ),
  },
  {
    code: "en",
    label: "English",
    flag: cl(
      "https://res.cloudinary.com/dy2wtanhl/image/upload/v1771637851/flag-usa_ubewc7.png",
      { width: 48, height: 48, fit: "thumb", quality: "auto:good" },
    ),
  },
];

const overlayVariants: Variants = {
  hidden: { y: "-100%", opacity: 0 },
  visible: {
    y: "0%",
    opacity: 1,
    transition: { duration: 0.25, ease: "easeOut" as const },
  },
  exit: {
    y: "-100%",
    opacity: 0,
    transition: { duration: 0.2, ease: "easeIn" as const },
  },
};

const menuListVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
  exit: {
    transition: { staggerChildren: 0.02, staggerDirection: -1 as const },
  },
};

const menuItemVariants: Variants = {
  hidden: { x: -50, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
  exit: {
    x: -50,
    opacity: 0,
    transition: { duration: 0.2, ease: "easeIn" as const },
  },
};

const buttonsContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.2 },
  },
  exit: {
    transition: { staggerChildren: 0.02, staggerDirection: -1 as const },
  },
};

const buttonItemVariants: Variants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.25, ease: "easeOut" as const },
  },
  exit: {
    y: 30,
    opacity: 0,
    transition: { duration: 0.15, ease: "easeIn" as const },
  },
};

type MobileNavbarProps = {
  id?: string;
  isFixed?: boolean;
};

function MobileNavbar({ id, isFixed = false }: MobileNavbarProps) {
  const { t } = useTranslation("landing");
  const navigate = useNavigate();
  const language = useGlobalUIStore((state) => state.language);
  const [isOpen, setIsOpen] = useState(false);
  const [isLanguageSelectorOpen, setIsLanguageSelectorOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow =
      isOpen || isLanguageSelectorOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, isLanguageSelectorOpen]);

  const menuItems = [
    { href: "#hero-container", label: t("navbar.home") },
    { href: "#about", label: t("navbar.about") },
    { href: "#how", label: t("navbar.how") },
    { href: "#faq", label: t("navbar.faq") },
    { href: "#contact", label: t("navbar.contact") },
  ];

  const handleMenuItemClick = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(false);
    setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  const selectedLang = languages.find((l) => l.code === language);

  const hoverCircleButton =
    "relative after:content-[''] after:absolute after:inset-0 after:rounded-full after:bg-current after:opacity-10 after:scale-0 active:after:scale-100 after:transition-transform after:duration-200 after:ease-out";

  const logoGreen = cl(
    "https://res.cloudinary.com/dy2wtanhl/image/upload/v1771637879/MediConnectLanding-green_trpgvu.png",
    { width: 256, quality: "auto:best" },
  );

  const logoWhite = cl(
    "https://res.cloudinary.com/dy2wtanhl/image/upload/v1771637881/MediConnectLanding_ryopcw.png",
    { width: 256, quality: "auto:best" },
  );

  return (
    <>
      <nav
        id={id}
        className={`w-full flex justify-between items-center px-6 py-4 transition-all duration-300 ${
          isFixed
            ? "fixed top-0 left-0 z-50 bg-white shadow-md"
            : "bg-transparent"
        }`}
      >
        <div className="flex gap-3 items-center">
          <img
            src={isFixed ? logoGreen : logoWhite}
            alt="MediConnect Logo"
            className="h-14 w-14 object-contain pointer-events-none"
          />
          <h1
            className={`text-2xl font-semibold ${
              isFixed ? "text-primary" : "text-white"
            }`}
          >
            Mediconnect
          </h1>
        </div>

        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className={`flex items-center justify-center w-12 h-12 p-2 rounded-full transition-colors duration-200 ${hoverCircleButton} ${
              isFixed ? "text-primary" : "text-white"
            }`}
            aria-label="Toggle menu"
          >
            <GripIcon size={32} />
          </button>
        )}
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[60] bg-white flex flex-col p-6 overflow-y-auto"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex items-center justify-between mb-12 mt-2 ml-2">
              <div className="flex gap-3 items-center">
                <img
                  src={logoGreen}
                  alt="MediConnect Logo"
                  className="h-16 w-16 object-contain pointer-events-none"
                />
                <h1 className="text-3xl font-semibold text-primary">
                  Mediconnect
                </h1>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-center w-12 h-12 rounded-full text-primary ${hoverCircleButton}`}
                aria-label="Close menu"
              >
                <XIcon size={32} />
              </button>
            </div>

            <div className="flex-1 -mx-6">
              <motion.ul
                className="space-y-2"
                variants={menuListVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {menuItems.map((item) => (
                  <motion.li key={item.href} variants={menuItemVariants}>
                    <a
                      href={item.href}
                      onClick={handleMenuItemClick(item.href)}
                      className="block w-full px-8 py-4 text-3xl font-medium text-primary transition-all duration-300 rounded-xl active:bg-primary/10 active:scale-95 text-left"
                    >
                      {item.label}
                    </a>
                  </motion.li>
                ))}
              </motion.ul>
            </div>

            <div className="space-y-6 mt-8">
              <motion.button
                onClick={() => setIsLanguageSelectorOpen(true)}
                className="w-full h-14 px-6 flex items-center justify-center gap-3 text-xl font-medium rounded-full border border-primary bg-white text-primary transition-all duration-150 active:bg-primary/10 active:scale-95"
                variants={buttonItemVariants}
              >
                <img
                  src={selectedLang?.flag}
                  alt={selectedLang?.label}
                  className="w-6 h-6 rounded-full"
                />
                <span className="flex-1 text-left">{selectedLang?.label}</span>
                <ChevronDownIcon size={20} />
              </motion.button>

              <motion.div
                className="space-y-4"
                variants={buttonsContainerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.div variants={buttonItemVariants}>
                  <MediButton
                    variant="secondary"
                    className="w-full h-14 px-6 text-xl font-medium rounded-full border text-primary bg-white border-primary active:bg-primary/10 active:scale-95 transition-all duration-150"
                    onClick={() => {
                      setIsOpen(false);
                      setIsLanguageSelectorOpen(false);
                      navigate(ROUTES.LOGIN);
                    }}
                  >
                    {t("navbar.login")}
                  </MediButton>
                </motion.div>
                <motion.div variants={buttonItemVariants}>
                  <MediButton
                    variant="primary"
                    className="w-full h-14 px-6 text-xl font-medium rounded-full bg-primary text-white active:opacity-90 active:scale-95 transition-all duration-150"
                    onClick={() => {
                      setIsOpen(false);
                      setIsLanguageSelectorOpen(false);
                      navigate(ROUTES.REGISTER);
                    }}
                  >
                    {t("navbar.register")}
                  </MediButton>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <MobileLanguageSelector
        isOpen={isLanguageSelectorOpen}
        onClose={() => setIsLanguageSelectorOpen(false)}
      />
    </>
  );
}

export default MobileNavbar;
