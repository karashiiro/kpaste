import { Image } from "@tamagui/image";
import { Link } from "react-router";
import { useEffect, useState } from "react";

export function HeaderLogo() {
  const [useAnimated, setUseAnimated] = useState(false);
  const [animatedLoaded, setAnimatedLoaded] = useState(false);

  useEffect(() => {
    // Preload the animated image after component mounts
    const animatedImg = new window.Image();
    animatedImg.onload = () => {
      setAnimatedLoaded(true);
      // Small delay to ensure smooth transition
      setTimeout(() => setUseAnimated(true), 100);
    };
    animatedImg.src = "/kpaste.webp";
  }, []);

  return (
    <Link to="/" aria-label="Go to home page">
      <Image
        source={{
          width: 125,
          height: 50,
          uri:
            useAnimated && animatedLoaded
              ? "/kpaste.webp"
              : "/kpaste_static.webp",
        }}
      />
    </Link>
  );
}
