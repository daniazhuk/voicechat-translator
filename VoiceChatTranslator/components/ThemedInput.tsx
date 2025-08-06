import {useThemeColor} from "@/hooks/useThemeColor";
import { TextInput, TextInputProps,} from "react-native";

export type ThemedInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedInput({
                              lightColor,
                              darkColor,
                              style,
                              ...rest
                            }: ThemedInputProps) {
  const color = useThemeColor({light: lightColor, dark: darkColor}, 'text');

  return (
    <TextInput style={[{color}, style]} {...rest}/>
  );
}
