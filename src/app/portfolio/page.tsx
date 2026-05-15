"use client";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Title,
  Text,
  TextInput,
  Button,
  Table,
  Group,
  Badge,
  Avatar,
  Paper,
  Stack,
  Loader,
  Alert,
  ThemeIcon,
  SimpleGrid,
  Card,
  NumberFormatter,
} from "@mantine/core";
import {
  IconSearch,
  IconChartPie,
  IconAlertCircle,
  IconRefresh,
  IconCurrencyEthereum,
  IconCoins,
  IconClock,
} from "@tabler/icons-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useWallet } from "@/hooks/useWallet";
import { fetchPortfolio, portfolioActions } from "@/store/portfolioSlice";
import type { RootState, AppDispatch } from "@/store";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export default function PortfolioPage() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    address: walletAddress,
    connect,
    disconnect,
    loading: walletLoading,
  } = useWallet();
  const {
    ethBalance,
    tokens,
    tokenCount,
    loading,
    error,
    address: fetchedAddress,
    fetchedAt,
  } = useSelector((state: RootState) => state.portfolio);

  const [input, setInput] = useState("");

  useEffect(() => {
    if (walletAddress) setInput(walletAddress);
  }, [walletAddress]);

  function submit() {
    const addr = input.trim();
    if (!addr) return;
    dispatch(fetchPortfolio({ address: addr, apiBase: API_BASE }));
  }

  function refresh() {
    if (!fetchedAddress) return;
    dispatch(portfolioActions.resetPortfolio());
    dispatch(fetchPortfolio({ address: fetchedAddress, apiBase: API_BASE }));
  }

  const topTokens = [...tokens].sort(
    (a, b) => parseFloat(b.balance) - parseFloat(a.balance),
  );

  return (
    <Stack gap={0} mih="100vh">
      <Header
        address={walletAddress}
        loading={walletLoading}
        onConnect={connect}
        onDisconnect={disconnect}
      />

      <Container size="lg" py="xl" style={{ flex: 1 }}>
        <Group mb="xl" align="flex-start">
          <ThemeIcon
            size={52}
            radius="xl"
            variant="gradient"
            gradient={{ from: "grape", to: "violet" }}
          >
            <IconChartPie size={28} />
          </ThemeIcon>
          <div>
            <Title order={2}>Portfolio</Title>
            <Text c="dimmed" size="sm">
              Aggregate ETH balance and ERC-20 holdings for any address
            </Text>
          </div>
        </Group>

        <Paper p="md" withBorder radius="md" mb="lg">
          <Group gap="sm">
            <TextInput
              flex={1}
              leftSection={<IconSearch size={16} />}
              placeholder={walletAddress ?? "Enter Ethereum address (0x…)"}
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
            <Button
              leftSection={<IconSearch size={16} />}
              onClick={submit}
              loading={loading}
              variant="gradient"
              gradient={{ from: "grape", to: "violet" }}
            >
              Load Portfolio
            </Button>
          </Group>
        </Paper>

        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            mb="lg"
            radius="md"
          >
            {error}
          </Alert>
        )}

        {loading && (
          <Paper p="xl" withBorder radius="md" ta="center">
            <Loader size="lg" color="violet" mx="auto" />
            <Text c="dimmed" size="sm" mt="md">
              Loading portfolio data…
            </Text>
          </Paper>
        )}

        {!loading && fetchedAddress && (
          <Stack gap="lg">
            <Group justify="space-between">
              <Group gap="sm">
                <Text fw={600}>Portfolio for</Text>
                <Badge variant="light" color="violet" size="sm">
                  {fetchedAddress.slice(0, 10)}…{fetchedAddress.slice(-6)}
                </Badge>
              </Group>
              <Group gap="sm">
                {fetchedAt && (
                  <Group gap={4}>
                    <IconClock size={12} color="var(--mantine-color-dimmed)" />
                    <Text size="xs" c="dimmed">
                      {new Date(fetchedAt).toLocaleTimeString()}
                    </Text>
                  </Group>
                )}
                <Button
                  size="xs"
                  variant="subtle"
                  leftSection={<IconRefresh size={14} />}
                  onClick={refresh}
                >
                  Refresh
                </Button>
              </Group>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 3 }}>
              <Card withBorder radius="md" padding="lg">
                <Group gap="sm" mb="xs">
                  <ThemeIcon size={36} radius="xl" variant="light" color="blue">
                    <IconCurrencyEthereum size={20} />
                  </ThemeIcon>
                  <Text size="sm" c="dimmed" fw={500}>
                    ETH Balance
                  </Text>
                </Group>
                <Text size="xl" fw={700}>
                  <NumberFormatter
                    value={ethBalance ?? "0"}
                    decimalScale={6}
                    thousandSeparator
                  />{" "}
                  <Text span size="sm" c="dimmed">
                    ETH
                  </Text>
                </Text>
              </Card>

              <Card withBorder radius="md" padding="lg">
                <Group gap="sm" mb="xs">
                  <ThemeIcon
                    size={36}
                    radius="xl"
                    variant="light"
                    color="violet"
                  >
                    <IconCoins size={20} />
                  </ThemeIcon>
                  <Text size="sm" c="dimmed" fw={500}>
                    ERC-20 Tokens
                  </Text>
                </Group>
                <Text size="xl" fw={700}>
                  {tokenCount}
                </Text>
                <Text size="xs" c="dimmed">
                  unique contracts
                </Text>
              </Card>

              <Card withBorder radius="md" padding="lg">
                <Group gap="sm" mb="xs">
                  <ThemeIcon size={36} radius="xl" variant="light" color="teal">
                    <IconChartPie size={20} />
                  </ThemeIcon>
                  <Text size="sm" c="dimmed" fw={500}>
                    Top Asset
                  </Text>
                </Group>
                {topTokens[0] ? (
                  <>
                    <Text size="xl" fw={700}>
                      {topTokens[0].symbol}
                    </Text>
                    <Text size="xs" c="dimmed">
                      <NumberFormatter
                        value={topTokens[0].balance}
                        decimalScale={4}
                        thousandSeparator
                      />{" "}
                      tokens
                    </Text>
                  </>
                ) : (
                  <Text size="sm" c="dimmed">
                    ETH only
                  </Text>
                )}
              </Card>
            </SimpleGrid>

            {topTokens.length > 0 && (
              <Paper withBorder radius="md" p="md">
                <Title order={4} mb="md">
                  Token Holdings
                </Title>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Token</Table.Th>
                      <Table.Th>Symbol</Table.Th>
                      <Table.Th>Balance</Table.Th>
                      <Table.Th>Contract</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {topTokens.map((token) => (
                      <Table.Tr key={token.contractAddress}>
                        <Table.Td>
                          <Group gap="sm">
                            <Avatar
                              src={token.logo}
                              size={28}
                              radius="xl"
                              color="violet"
                            >
                              {token.symbol.slice(0, 2).toUpperCase()}
                            </Avatar>
                            <Text size="sm" fw={500}>
                              {token.name}
                            </Text>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Badge variant="outline" size="sm">
                            {token.symbol}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" fw={600}>
                            <NumberFormatter
                              value={token.balance}
                              decimalScale={6}
                              thousandSeparator
                            />
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs" c="dimmed" ff="monospace">
                            {token.contractAddress.slice(0, 10)}…
                            {token.contractAddress.slice(-6)}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Paper>
            )}
          </Stack>
        )}

        {!loading && !fetchedAddress && !error && (
          <Paper
            p="xl"
            withBorder
            radius="md"
            ta="center"
            style={{
              borderStyle: "dashed",
              borderColor: "var(--mantine-color-dark-4)",
            }}
          >
            <ThemeIcon
              size={64}
              radius="xl"
              variant="light"
              color="violet"
              mx="auto"
              mb="md"
            >
              <IconChartPie size={32} />
            </ThemeIcon>
            <Title order={4} mb="xs">
              {walletAddress
                ? "Ready to load your portfolio"
                : "Enter an address to get started"}
            </Title>
            <Text c="dimmed" size="sm">
              {walletAddress
                ? "Your address is pre-filled. Press Load Portfolio to view your holdings."
                : "Connect MetaMask or paste any Ethereum address above."}
            </Text>
          </Paper>
        )}
      </Container>

      <Footer />
    </Stack>
  );
}
