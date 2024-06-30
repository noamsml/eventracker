import { theme, extendTheme, StyleFunctionProps } from "@chakra-ui/react";

const decenteredTheme = extendTheme({
  components: {
    Button: {
      variants: {
        dcOutline: (props: StyleFunctionProps) => ({
          ...theme.components.Button.variants?.outline(props), // Use the existing outline variant styles
          borderRadius: "full", // Add custom styles
          borderColor: "red.200",
        }),
      },
    },
  },
});

export default decenteredTheme;
