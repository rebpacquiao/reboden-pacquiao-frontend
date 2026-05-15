"use client";
import { Group, Text, Button, Badge } from "@mantine/core";
import { IconWallet, IconCurrencyEthereum } from "@tabler/icons-react";
import { shorten } from "@/lib/utils";

interface Props {
  address: string | null;
  loading: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function Header({ address, loading, onConnect, onDisconnect }: Props) {
  return (
    <header
      style={{
        borderBottom: "1px solid var(--mantine-color-dark-5)",
        padding: "12px 24px",
        background: "var(--mantine-color-dark-8)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <Group justify="space-between" maw={1200} mx="auto">
        <Group gap="xs">
          <IconCurrencyEthereum size={28} color="var(--mantine-color-violet-4)" />
          <Text fw={800} size="xl" variant="gradient" component="span"
            style={{ background: "linear-gradient(90deg, #9b59b6, #3498db)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            CryptoWallet
          </Text>
        </Group>

        {address ? (
          <Group gap="sm">
            <Badge variant="light" color="teal" leftSection={<IconWallet size={12} />} size="lg">
              {shorten(address)}
            </Badge>
            <Button variant="light" color="red" size="sm" onClick={onDisconnect}>
              Disconnect
            </Button>
          </Group>
        ) : (
          <Button
            leftSection={<IconWallet size={16} />}
            onClick={onConnect}
            loading={loading}
            variant="gradient"
            gradient={{ from: "violet", to: "blue" }}
          >
            Connect Wallet
          </Button>
        )}
      </Group>
    </header>
  );
}
