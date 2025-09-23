import { Select, Text } from "tamagui";

export interface LanguageSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  size?: "$3" | "$4" | "$5";
}

export function LanguageSelect({
  value,
  onValueChange,
  size = "$4",
}: LanguageSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} size={size}>
      <Select.Trigger iconAfter={<Text>▼</Text>}>
        <Select.Value placeholder="Select language..." />
      </Select.Trigger>

      <Select.Content zIndex={200000}>
        <Select.ScrollUpButton
          alignItems="center"
          justifyContent="center"
          position="relative"
          width="100%"
          height="$3"
        >
          <Text>▲</Text>
        </Select.ScrollUpButton>

        <Select.Viewport minHeight={200}>
          <Select.Group>
            <Select.Item index={0} value="text">
              <Select.ItemText>Plain Text</Select.ItemText>
            </Select.Item>
            <Select.Item index={1} value="javascript">
              <Select.ItemText>JavaScript</Select.ItemText>
            </Select.Item>
            <Select.Item index={2} value="typescript">
              <Select.ItemText>TypeScript</Select.ItemText>
            </Select.Item>
            <Select.Item index={3} value="python">
              <Select.ItemText>Python</Select.ItemText>
            </Select.Item>
            <Select.Item index={4} value="java">
              <Select.ItemText>Java</Select.ItemText>
            </Select.Item>
            <Select.Item index={5} value="cpp">
              <Select.ItemText>C++</Select.ItemText>
            </Select.Item>
            <Select.Item index={6} value="rust">
              <Select.ItemText>Rust</Select.ItemText>
            </Select.Item>
            <Select.Item index={7} value="go">
              <Select.ItemText>Go</Select.ItemText>
            </Select.Item>
            <Select.Item index={8} value="html">
              <Select.ItemText>HTML</Select.ItemText>
            </Select.Item>
            <Select.Item index={9} value="css">
              <Select.ItemText>CSS</Select.ItemText>
            </Select.Item>
            <Select.Item index={10} value="json">
              <Select.ItemText>JSON</Select.ItemText>
            </Select.Item>
            <Select.Item index={11} value="markdown">
              <Select.ItemText>Markdown</Select.ItemText>
            </Select.Item>
          </Select.Group>
        </Select.Viewport>

        <Select.ScrollDownButton
          alignItems="center"
          justifyContent="center"
          position="relative"
          width="100%"
          height="$3"
        >
          <Text>▼</Text>
        </Select.ScrollDownButton>
      </Select.Content>
    </Select>
  );
}
