import {
  Button,
  HStack,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Spacer,
  Tag,
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
  icon?: React.ReactElement; // Optional icon prop
}

export const SelectSomething: FC<SelectSomethingProps> = ({
  options,
  selection,
  onSelect,
  icon,
}) => {
  const handleChange = (value: String | String[]) => {
    if (typeof value === "string") {
      const option = options.find((o) => o.value === value);
      option && onSelect(option);
    }
  };

  return (
    <Menu>
      <MenuButton
        as={Button}
        size="sm"
        leftIcon={icon}
        rightIcon={<BiChevronDown />}
        textAlign="left"
        boxShadow="md"
        background="gray.600"
        color="white"
        _hover={{ background: "gray.800" }}
        _active={{ background: "gray.800" }}
      >
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
              fontSize="xl"
              fontWeight="semibold"
              color="black"
              isDisabled={option.count === 0}
            >
              <HStack>
                <div>{option.label ?? option.value} </div>
                <Spacer />
                {option.count !== undefined && (
                  <Tag size="sm" color="gray">
                    {option.count}
                  </Tag>
                )}
              </HStack>
            </MenuItemOption>
          ))}
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  );
};
