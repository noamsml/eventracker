import "./App.css";
import { ChakraProvider } from "@chakra-ui/react";
import decenteredTheme from "./theme";
import { EventListPage } from "./components/EventListPage";

function App() {
  return (
    <ChakraProvider theme={decenteredTheme}>
      <EventListPage />
    </ChakraProvider>
  );
}

export default App;
