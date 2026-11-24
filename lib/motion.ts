import { Transition, Variants } from "framer-motion";

/**
 * iOS-like crisp spring physics
 * stiffness: 380, damping: 30
 */
export const iosSpring: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 30,
};

export const iosGentleSpring: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 28,
};

export const iosSnappySpring: Transition = {
  type: "spring",
  stiffness: 450,
  damping: 32,
};

/**
 * Tactile touch / click animation for buttons, cards, and pills
 */
export const tactilePress = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.96 },
  transition: iosSpring,
};

export const tactileButton = {
  whileTap: { scale: 0.96 },
  transition: iosSpring,
};

/**
 * Segmented Pill selector indicator transition
 */
export const segmentedPillTransition: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 32,
};

/**
 * iOS Bottom Sheet modal variants
 */
export const bottomSheetVariants: Variants = {
  hidden: {
    y: "100%",
    opacity: 0.5,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: iosSpring,
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: { duration: 0.22, ease: [0.32, 0.72, 0, 1] },
  },
};

/**
 * Backdrop backdrop blur fade variants
 */
export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

/**
 * iOS Card enter transition
 */
export const fadeInScaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: iosSpring,
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: -8,
    transition: { duration: 0.18 },
  },
};

/**
 * Staggered container for list items
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: iosSpring,
  },
};
