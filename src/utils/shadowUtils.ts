/**
 * Shared shadow utilities for consistent styling across components
 */

export interface ShadowProps {
  /** Shadow for the component */
  shadow?: boolean | string;
}

export const getShadowStyle = (shadow: boolean | string | undefined) => {
  if (!shadow) return {};

  return {
    boxShadow:
      typeof shadow === "string" ? shadow : "2px 4px 8px rgba(0, 0, 0, 0.25)", // Offset 2px to the right
  };
};

export const DEFAULT_SHADOW = "2px 4px 8px rgba(0, 0, 0, 0.2)";
