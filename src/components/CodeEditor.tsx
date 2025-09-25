import { useCallback } from "react";
import Editor from "react-simple-code-editor";
import { Card, useTheme } from "tamagui";
import { safeHighlight } from "../prismUtils";
import "prismjs/themes/prism-tomorrow.css";

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

  const editorStyle = {
    fontFamily: '"Inconsolata", monospace',
    fontSize: 14,
    lineHeight: 1.4,
    minHeight,
    backgroundColor: theme.background?.get(),
    color: theme.color?.get(),
    ...style,
  };

  return (
    <Card padding="$0" bordered>
      <Editor
        value={value}
        onValueChange={onChange}
        highlight={highlightCode}
        padding={12}
        placeholder={placeholder}
        style={editorStyle}
      />
    </Card>
  );
}
