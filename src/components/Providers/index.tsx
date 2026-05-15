"use client";
import { MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { Provider as ReduxProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/store";

const theme = createTheme({
  primaryColor: "violet",
  fontFamily: "Inter, sans-serif",
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          <Notifications position="top-right" />
          {children}
        </MantineProvider>
      </PersistGate>
    </ReduxProvider>
  );
}
