import {
  Box,
  Button,
  HStack,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  theme,
} from "@chakra-ui/react";

import { FC } from "react";
import { BiChevronDown } from "react-icons/bi";
// import { EVENT_TYPE_COLORS } from "../data/constants";

export interface FilterOption {
  // What the server calls it
  value: string;
  // What humans call it (we'll use the value by default)
  label?: string;
  // What color is it?
  color?: keyof typeof theme.colors;
  // How many things does it represent?
  count?: number;
}

export interface SelectSomethingProps {
  options: FilterOption[];
  selection: FilterOption;
  onSelect: (value: FilterOption) => void;
}

export const SelectSomething: FC<SelectSomethingProps> = ({
  options,
  selection,
  onSelect,
}) => {
  const handleChange = (value: String | String[]) => {
    if (typeof value === "string") {
      const option = options.find((o) => o.value === value);
      option && onSelect(option);
    }
  };

  return (
    <Menu>
      <MenuButton as={Button} size="sm" rightIcon={<BiChevronDown />}>
        {selection.label ?? selection.value}
      </MenuButton>
      <MenuList zIndex={100} boxShadow="2xl">
        <MenuOptionGroup
          type="radio"
          value={selection.value}
          onChange={handleChange}
        >
          {options.map((option) => (
            <MenuItemOption
              key={option.value}
              value={option.value}
              fontSize="2xl"
              fontWeight="semibold"
              // color={theme.colors[EVENT_TYPE_COLORS[option.color]]?.["500"]}
            >
              {option.label ?? option.value}
            </MenuItemOption>
          ))}
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  );
};
