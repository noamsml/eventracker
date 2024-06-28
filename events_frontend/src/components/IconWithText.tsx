import React, { FC, ReactNode } from "react";
import { Stack, Icon, Text, StackProps, IconProps } from "@chakra-ui/react";

interface IconWithTextProps extends StackProps {
  icon: React.ElementType;
  iconColor?: IconProps["color"];
  children: ReactNode;
}

export const IconWithText: FC<IconWithTextProps> = ({
  icon,
  iconColor = "teal.500",
  children,
  ...stackProps
}) => {
  return (
    <Stack direction="row" alignItems="center" spacing={2} {...stackProps}>
      <Icon as={icon} color={iconColor} />
      <Text>{children}</Text>
    </Stack>
  );
};
