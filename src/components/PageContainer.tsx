import { View, type ViewProps } from "@tamagui/core";
import type { ReactNode } from "react";

interface PageContainerProps extends Omit<ViewProps, "children"> {
  children: ReactNode;
}

export function PageContainer({ children, ...props }: PageContainerProps) {
  return (
    <View
      padding="$6"
      maxWidth={1200}
      marginHorizontal="auto"
      width="100%"
      $xs={{ padding: "$4" }}
      {...props}
    >
      {children}
    </View>
  );
}
