import { Select } from "@tamagui/select";
import { Paragraph } from "@tamagui/text";
import { SUPPORTED_LANGUAGES } from "../../constants/languages";

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
      <Select.Trigger iconAfter={<Paragraph>▼</Paragraph>}>
        <Select.Value placeholder="Select language..." />
      </Select.Trigger>

      <Select.Content zIndex={999999}>
        <Select.ScrollUpButton
          alignItems="center"
          justifyContent="center"
          position="relative"
          width="100%"
          height="$3"
        >
          <Paragraph>▲</Paragraph>
        </Select.ScrollUpButton>

        <Select.Viewport minHeight={200}>
          <Select.Group>
            {SUPPORTED_LANGUAGES.map((lang, index) => (
              <Select.Item key={lang.id} index={index} value={lang.id}>
                <Select.ItemText>{lang.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Group>
        </Select.Viewport>

        <Select.ScrollDownButton
          alignItems="center"
          justifyContent="center"
          position="relative"
          width="100%"
          height="$3"
        >
          <Paragraph>▼</Paragraph>
        </Select.ScrollDownButton>
      </Select.Content>
    </Select>
  );
}
