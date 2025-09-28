import { useCallback } from "react";
import Editor from "react-simple-code-editor";
import { useTheme } from "@tamagui/core";
import { safeHighlight } from "../../prismUtils";
import "prismjs/themes/prism-tomorrow.css";
import { Card } from "@tamagui/card";

export interface CodeEditorProps {
  value: string;
  onChange: (code: string) => void;
  language: string;
  placeholder?: string;
  minHeight?: string;
  style?: React.CSSProperties;
}

export function CodeEditor({
  value,
  onChange,
  language,
  placeholder = "Paste your code or text here...",
  minHeight = "200px",
  style = {},
}: CodeEditorProps) {
  const theme = useTheme();

  const highlightCode = useCallback(
    (code: string) => safeHighlight(code, language),
    [language],
  );

  return (
    <Card padding={2} bordered>
      <Editor
        value={value}
        onValueChange={onChange}
        highlight={highlightCode}
        padding={12}
        placeholder={placeholder}
        style={{
          fontFamily: '"Inconsolata", monospace',
          fontSize: 14,
          lineHeight: 1.4,
          minHeight,
          backgroundColor: theme.background?.get(),
          color: theme.color?.get(),
          ...style,
        }}
      />
    </Card>
  );
}
