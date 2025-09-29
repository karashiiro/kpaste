import { XStack } from "@tamagui/stacks";
import { Paragraph } from "@tamagui/text";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <XStack
      justifyContent="center"
      alignItems="center"
      paddingVertical="$3"
      paddingHorizontal="$4"
      borderTopWidth={2}
      borderTopColor="$borderColor"
      borderStyle="dashed"
      backgroundColor="$background"
    >
      <Paragraph fontSize="$2" color="$color11">
        View on{" "}
        <a
          href="https://github.com/karashiiro/kpaste"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.footerLink}
        >
          GitHub
        </a>
      </Paragraph>
    </XStack>
  );
}
