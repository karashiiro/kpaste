import { Image } from "@tamagui/image";
import { Link } from "react-router";

export function HeaderLogo() {
  return (
    <Link to="/">
      <Image source={{ width: 125, height: 50, uri: "/kpaste.webp" }} />
    </Link>
  );
}
