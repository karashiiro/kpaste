import { YStack } from "@tamagui/stacks";
import { Label } from "@tamagui/label";
import { Input } from "@tamagui/input";

export interface PasteFormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function PasteFormField({
  label,
  value,
  onChangeText,
  placeholder,
}: PasteFormFieldProps) {
  return (
    <YStack gap="$2">
      <Label fontSize="$4" fontWeight="500">
        {label}
      </Label>
      <Input
        value={value}
        onChange={(e) => onChangeText((e.target as HTMLInputElement).value)}
        placeholder={placeholder}
        size="$4"
      />
    </YStack>
  );
}
