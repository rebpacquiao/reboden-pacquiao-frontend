import { Center, Text } from "@mantine/core";

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--mantine-color-dark-5)",
        padding: "20px 24px",
        background: "var(--mantine-color-dark-8)",
        marginTop: "auto",
      }}
    >
      <Center>
        <Text size="sm" c="dimmed">
          Reboden Pacquiao· {new Date().getFullYear()}
        </Text>
      </Center>
    </footer>
  );
}
