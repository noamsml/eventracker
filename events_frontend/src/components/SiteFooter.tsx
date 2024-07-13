import { Box, HStack, Link, Spacer, Stack } from "@chakra-ui/react";
import {
  BiLogoFacebookCircle,
  BiLogoInstagramAlt,
  BiLogoLinkedinSquare,
  BiLogoYoutube,
} from "react-icons/bi";
import { SPREADSHEET_URL } from "../data/constants";

export const SiteFooter = () => (
  <Stack p={8} mt={14} borderTopWidth={1}>
    <HStack
      maxWidth={{ base: "100%", lg: "1000px" }}
      marginX="auto"
      width="100%"
    >
      <Box>
        Imported from the the{" "}
        <Link href={SPREADSHEET_URL} color="red.400" isExternal>
          Decentered Eventracker spreadsheet
        </Link>
        .
        <br /> © {new Date().getFullYear()} Decentered Arts
      </Box>
      <Spacer />
      <HStack>
        <Link
          isExternal
          href="https://www.facebook.com/people/Decentered-Arts/61557033081908/"
          aria-label="Decentered Arts on Facebook"
        >
          <BiLogoFacebookCircle size="30" />
        </Link>
        <Link
          isExternal
          href="https://www.instagram.com/decenteredarts/"
          aria-label="Decentered Arts on Instagram"
        >
          <BiLogoInstagramAlt size="30" />
        </Link>
        <Link
          isExternal
          href="https://www.youtube.com/@decentered"
          aria-label="Decentered Arts on YouTube"
        >
          <BiLogoYoutube size="30" />
        </Link>
        <Link
          isExternal
          href="https://www.linkedin.com/company/decentered-arts/"
          aria-label="Decentered Arts on LinkedIn"
        >
          <BiLogoLinkedinSquare size="30" />
        </Link>
      </HStack>
    </HStack>
  </Stack>
);
