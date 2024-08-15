import { Suspense } from "react";
import { SiteHeader } from "./SiteHeader";
import { EventList } from "./EventList";
import { SiteFooter } from "./SiteFooter";
import { Box, HStack } from "@chakra-ui/react";
import { DesktopFilters } from "./Filters";

export const EventListPage = () => (
  <>
    <SiteHeader />
    <Suspense>
      <HStack
        alignItems="top"
        maxWidth={{ base: "100%", lg: "1000px" }}
        marginX="auto"
        paddingTop={{ base: 0, md: 8 }}
        minHeight="80vh"
      >
        <Box display={{ base: "none", sm: "none", md: "block" }}>
          <DesktopFilters />
        </Box>
        <EventList />
      </HStack>
    </Suspense>
    <SiteFooter />
  </>
);
