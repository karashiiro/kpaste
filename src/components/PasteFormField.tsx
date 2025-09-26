import { YStack } from "@tamagui/stacks";
import { Label } from "@tamagui/label";
import { Input } from "@tamagui/input";

export interface PasteFormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  required?: boolean;
  size?: "$3" | "$4" | "$5";
}

export function PasteFormField({
  label,
  value,
  onChangeText,
  placeholder,
  required = false,
  size = "$4",
}: PasteFormFieldProps) {
  return (
    <YStack gap="$2">
      <Label fontSize="$4" fontWeight="500">
        {label}
        {required && " *"}
      </Label>
      <Input
        value={value}
        onChangeText={(e) => onChangeText(e.nativeEvent.text)}
        placeholder={placeholder}
        size={size}
      />
    </YStack>
  );
}
