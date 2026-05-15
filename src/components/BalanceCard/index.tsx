import { Card, Group, Text, ThemeIcon, Stack } from "@mantine/core";
import { IconCurrencyEthereum } from "@tabler/icons-react";

interface Props {
  balance: string;
  address: string;
}

export default function BalanceCard({ balance, address }: Props) {
  return (
    <Card
      withBorder
      radius="lg"
      p="xl"
      style={{
        background:
          "linear-gradient(135deg, var(--mantine-color-violet-9) 0%, var(--mantine-color-blue-9) 100%)",
        borderColor: "var(--mantine-color-violet-7)",
      }}
    >
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600} style={{ letterSpacing: 1 }}>
            Connected Wallet
          </Text>
          <Text size="xs" ff="monospace" c="gray.4">
            {address}
          </Text>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600} style={{ letterSpacing: 1 }} mt="md">
            Balance
          </Text>
          <Group gap="xs" align="baseline">
            <Text size="2.8rem" fw={800} lh={1}>
              {parseFloat(balance).toFixed(4)}
            </Text>
            <Text size="xl" fw={600} c="violet.3">
              ETH
            </Text>
          </Group>
        </Stack>

        <ThemeIcon
          size={64}
          radius="xl"
          variant="gradient"
          gradient={{ from: "violet", to: "blue" }}
        >
          <IconCurrencyEthereum size={36} />
        </ThemeIcon>
      </Group>
    </Card>
  );
}
