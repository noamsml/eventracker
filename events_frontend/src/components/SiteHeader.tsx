import {
  Box,
  Button,
  Heading,
  HStack,
  Icon,
  Image,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { BiPlus, BiSolidHeart } from "react-icons/bi";
import { MobileFilters } from "./Filters";
import { DONATE_LINK, SUBMIT_URL } from "../data/constants";

export const SiteHeader = () => {
  return (
    <Stack spacing={0} background="red.300" color="white">
      <Stack
        direction="row"
        paddingX={3}
        paddingY={8}
        spacing={{ base: 3, md: 6 }}
        alignItems="center"
        width="100%"
        maxWidth={{ base: "100%", lg: "1000px" }}
        minHeight={{ lg: "200px" }}
        marginX="auto"
        outlineColor={{ base: "yellow", sm: "orange", md: "blue", lg: "green" }}
      >
        <Image
          src="/logo/decentered.png"
          boxSize={{ base: "80px", md: "100px" }}
          objectFit="cover"
          alignSelf={{ base: "flex-start", md: "center" }}
          alt="Decentered Logo"
        />
        <Stack spacing={1}>
          <Heading size="lg">Decentered Eventracker</Heading>
          <Text fontSize="md">
            A curated list of Bay Area events to create an interconnected art
            scene by{" "}
            <Link href="https://decentered.org" color="white">
              Decentered Arts
            </Link>
            .
          </Text>

          {/* Add Event and Donation Links */}
          <HStack>
            <Link
              href={SUBMIT_URL}
              isExternal
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                leftIcon={<Icon as={BiPlus} color="red.300" />}
                size="xs"
                variant="dcOutline"
                iconSpacing={1}
                background="whiteAlpha.700"
                border="none"
              >
                Add an event
              </Button>
            </Link>
            <Link
              href={DONATE_LINK}
              isExternal
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                leftIcon={<Icon as={BiSolidHeart} color="red.300" />}
                size="xs"
                variant="dcOutline"
                iconSpacing={1}
                background="whiteAlpha.700"
                border="none"
              >
                Donate
              </Button>
            </Link>
          </HStack>
        </Stack>
      </Stack>
      {/* Show the filters on small devices but hide it on the medium breakpoint on up */}
      <Box display={{ base: "block", sm: "block", md: "none" }}>
        <MobileFilters />
      </Box>
    </Stack>
  );
};
