"use client";
import {
  Group,
  Text,
  Button,
  Badge,
  Burger,
  Drawer,
  Stack,
  NavLink,
  Divider,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconWallet,
  IconCurrencyEthereum,
  IconHome,
  IconSearch,
  IconChartBar,
} from "@tabler/icons-react";
import { useRouter, usePathname } from "next/navigation";
import { shorten } from "@/lib/utils";

interface Props {
  address?: string | null;
  loading?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export default function Header({
  address,
  loading,
  onConnect,
  onDisconnect,
}: Props) {
  const [opened, { toggle, close }] = useDisclosure(false);
  const router = useRouter();
  const pathname = usePathname();

  function navigate(path: string) {
    router.push(path);
    close();
  }

  return (
    <>
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
          <Group gap="sm">
            <Burger
              opened={opened}
              onClick={toggle}
              size="sm"
              color="var(--mantine-color-violet-4)"
            />
            <Group gap="xs">
              <IconCurrencyEthereum
                size={28}
                color="var(--mantine-color-violet-4)"
              />
              <Text
                fw={800}
                size="xl"
                component="span"
                style={{
                  background: "linear-gradient(90deg, #9b59b6, #3498db)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                CryptoWallet
              </Text>
            </Group>
          </Group>

          {onConnect &&
            onDisconnect &&
            (address ? (
              <Group gap="sm">
                <Badge
                  variant="light"
                  color="teal"
                  leftSection={<IconWallet size={12} />}
                  size="lg"
                >
                  {shorten(address)}
                </Badge>
                <Button
                  variant="light"
                  color="red"
                  size="sm"
                  onClick={onDisconnect}
                >
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
            ))}
        </Group>
      </header>

      <Drawer
        opened={opened}
        onClose={close}
        size="xs"
        padding="md"
        styles={{
          content: { background: "var(--mantine-color-dark-8)" },
          header: { background: "var(--mantine-color-dark-8)" },
        }}
        title={
          <Group gap="xs">
            <IconCurrencyEthereum
              size={20}
              color="var(--mantine-color-violet-4)"
            />
            <Text fw={700} size="sm" c="violet">
              CryptoWallet
            </Text>
          </Group>
        }
      >
        <Stack gap="xs" mt="sm">
          <Text size="xs" fw={600} c="dimmed" tt="uppercase" px="sm">
            Explore
          </Text>
          <NavLink
            label="Dashboard"
            leftSection={<IconHome size={16} />}
            active={pathname === "/"}
            onClick={() => navigate("/")}
            styles={{ root: { borderRadius: 8 } }}
          />
          <NavLink
            label="Explorer"
            description="Live blockchain data table"
            leftSection={<IconSearch size={16} />}
            active={pathname === "/explorer"}
            onClick={() => navigate("/explorer")}
            styles={{ root: { borderRadius: 8 } }}
          />
          <Divider my="sm" />
          <Text size="xs" fw={600} c="dimmed" tt="uppercase" px="sm">
            Analytics
          </Text>
          <NavLink
            label="Network Stats"
            leftSection={<IconChartBar size={16} />}
            disabled
            description="Coming soon"
            styles={{ root: { borderRadius: 8 } }}
          />
        </Stack>
      </Drawer>
    </>
  );
}
