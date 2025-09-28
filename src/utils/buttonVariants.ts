export type ColorVariant = "default" | "green" | "blue" | "red" | "yellow";

export interface VariantStyles {
  backgroundColor?: string;
  color?: string;
  insetBorderColor?: string;
  hoverStyle?: {
    backgroundColor?: string;
    borderColor?: string;
  };
  pressStyle?: {
    backgroundColor?: string;
    borderColor?: string;
  };
}

export function getVariantStyles(colorVariant: ColorVariant): VariantStyles {
  switch (colorVariant) {
    case "green":
      return {
        backgroundColor: "$greenBase",
        color: "$greenText",
        insetBorderColor: "$borderColor",
        hoverStyle: {
          backgroundColor: "$greenHover",
          borderColor: "transparent",
        },
        pressStyle: {
          backgroundColor: "$greenPress",
          borderColor: "transparent",
        },
      };
    case "blue":
      return {
        backgroundColor: "$blueBase",
        color: "$blueText",
        insetBorderColor: "$borderColor",
        hoverStyle: {
          backgroundColor: "$blueHover",
          borderColor: "transparent",
        },
        pressStyle: {
          backgroundColor: "$bluePress",
          borderColor: "transparent",
        },
      };
    case "red":
      return {
        backgroundColor: "$redBase",
        color: "$redText",
        insetBorderColor: "$redText",
        hoverStyle: {
          backgroundColor: "$redHover",
          borderColor: "transparent",
        },
        pressStyle: {
          backgroundColor: "$redPress",
          borderColor: "transparent",
        },
      };
    case "yellow":
      return {
        backgroundColor: "$yellowBase",
        color: "$yellowText",
        insetBorderColor: "$borderColor",
        hoverStyle: {
          backgroundColor: "$yellowHover",
          borderColor: "transparent",
        },
        pressStyle: {
          backgroundColor: "$yellowPress",
          borderColor: "transparent",
        },
      };
    default:
      return {
        insetBorderColor: "white",
        color: "white",
      };
  }
}
