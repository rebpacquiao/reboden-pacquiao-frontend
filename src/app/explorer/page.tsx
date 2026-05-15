"use client";
import { useState, useEffect } from "react";
import {
  Container,
  TextInput,
  Button,
  Table,
  Title,
  Badge,
  Text,
  Group,
  Paper,
  Stack,
  SimpleGrid,
  Alert,
  Skeleton,
  ThemeIcon,
  Anchor,
} from "@mantine/core";
import {
  IconSearch,
  IconGasStation,
  IconCube,
  IconCurrencyEthereum,
  IconAlertCircle,
  IconHistory,
  IconRefresh,
} from "@tabler/icons-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useWallet } from "@/hooks/useWallet";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

interface GasPrice {
  slow: string;
  standard: string;
  fast: string;
  unit: string;
}

interface AccountData {
  address: string;
  balance: string;
  balanceUnit: string;
  gasPrice: GasPrice;
  blockNumber: number;
  fetchedAt: string;
}

interface HistoryItem {
  id: string;
  balance: string;
  blockNumber: number;
  fetchedAt: string;
}

export default function ExplorerPage() {
  const {
    address: walletAddress,
    connect,
    disconnect,
    loading: walletLoading,
  } = useWallet();

  // Pre-fill with connected wallet address, fall back to empty
  const [input, setInput] = useState("");

  // Auto-fill input when wallet connects/changes
  useEffect(() => {
    if (walletAddress) setInput(walletAddress);
  }, [walletAddress]);
  const [data, setData] = useState<AccountData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchData() {
    const address = input.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      setError(
        "Invalid Ethereum address. Must be 0x followed by 40 hex characters.",
      );
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [accRes, histRes] = await Promise.all([
        fetch(`${API_BASE}/api/ethereum/account/${address}`),
        fetch(`${API_BASE}/api/ethereum/account/${address}/history`),
      ]);
      const accJson = await accRes.json();
      const histJson = await histRes.json();
      if (!accJson.success)
        throw new Error(accJson.error ?? "Failed to fetch account data");
      setData(accJson.data);
      setHistory(histJson.success ? histJson.data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "An unexpected error occurred");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") fetchData();
  }

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Header
        address={walletAddress}
        loading={walletLoading}
        onConnect={connect}
        onDisconnect={disconnect}
      />

      <Container size="lg" py="xl" style={{ flex: 1 }}>
        {/* Page title */}
        <Stack gap="xs" mb="xl">
          <Group gap="xs">
            <ThemeIcon
              size={36}
              radius="md"
              variant="gradient"
              gradient={{ from: "violet", to: "blue" }}
            >
              <IconSearch size={20} />
            </ThemeIcon>
            <Title order={2}>Ethereum Explorer</Title>
          </Group>
          <Text c="dimmed" size="sm">
            Enter any Ethereum address to fetch live gas price, block number,
            and ETH balance via the Alchemy JSON-RPC API.
          </Text>
        </Stack>

        {/* Search bar */}
        <Paper
          p="md"
          mb="xl"
          withBorder
          style={{ borderColor: "var(--mantine-color-dark-4)" }}
        >
          <Group gap="sm">
            <TextInput
              placeholder={
                walletAddress
                  ? walletAddress
                  : "Connect wallet or paste 0x address…"
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              leftSection={<IconSearch size={16} />}
              style={{ flex: 1 }}
              styles={{ input: { fontFamily: "monospace" } }}
            />
            <Button
              onClick={fetchData}
              loading={loading}
              variant="gradient"
              gradient={{ from: "violet", to: "blue" }}
              leftSection={<IconRefresh size={16} />}
            >
              Fetch
            </Button>
          </Group>
        </Paper>

        {/* Error */}
        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            mb="xl"
            withCloseButton
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Loading skeletons */}
        {loading && (
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height={100} radius="md" />
              ))}
            </SimpleGrid>
            <Skeleton height={300} radius="md" />
          </Stack>
        )}

        {/* Data */}
        {!loading && data && (
          <Stack gap="xl">
            {/* Stat cards */}
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
              <Paper
                p="lg"
                withBorder
                radius="md"
                style={{ borderColor: "var(--mantine-color-violet-8)" }}
              >
                <Group gap="sm" mb="xs">
                  <ThemeIcon
                    size={32}
                    radius="md"
                    color="violet"
                    variant="light"
                  >
                    <IconCurrencyEthereum size={18} />
                  </ThemeIcon>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                    ETH Balance
                  </Text>
                </Group>
                <Text size="xl" fw={700}>
                  {parseFloat(data.balance).toLocaleString(undefined, {
                    minimumFractionDigits: 4,
                  })}
                </Text>
                <Text size="xs" c="dimmed">
                  ETH
                </Text>
              </Paper>

              <Paper
                p="lg"
                withBorder
                radius="md"
                style={{ borderColor: "var(--mantine-color-teal-8)" }}
              >
                <Group gap="sm" mb="xs">
                  <ThemeIcon size={32} radius="md" color="teal" variant="light">
                    <IconGasStation size={18} />
                  </ThemeIcon>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                    Gas Price
                  </Text>
                </Group>
                <Text size="xl" fw={700}>
                  {data.gasPrice.standard}
                </Text>
                <Text size="xs" c="dimmed">
                  Gwei (standard)
                </Text>
              </Paper>

              <Paper
                p="lg"
                withBorder
                radius="md"
                style={{ borderColor: "var(--mantine-color-blue-8)" }}
              >
                <Group gap="sm" mb="xs">
                  <ThemeIcon size={32} radius="md" color="blue" variant="light">
                    <IconCube size={18} />
                  </ThemeIcon>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                    Block Number
                  </Text>
                </Group>
                <Text size="xl" fw={700}>
                  {data.blockNumber.toLocaleString()}
                </Text>
                <Text size="xs" c="dimmed">
                  Latest block
                </Text>
              </Paper>
            </SimpleGrid>

            {/* Account detail table */}
            <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
              <Group
                px="lg"
                py="md"
                style={{
                  borderBottom: "1px solid var(--mantine-color-dark-4)",
                }}
              >
                <IconSearch size={16} color="var(--mantine-color-violet-4)" />
                <Title order={4}>Account Details</Title>
              </Group>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: 200 }}>Field</Table.Th>
                    <Table.Th>Value</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  <Table.Tr>
                    <Table.Td fw={500} c="dimmed">
                      Address
                    </Table.Td>
                    <Table.Td>
                      <Anchor
                        href={`https://etherscan.io/address/${data.address}`}
                        target="_blank"
                        size="sm"
                        style={{ fontFamily: "monospace" }}
                      >
                        {data.address}
                      </Anchor>
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td fw={500} c="dimmed">
                      Balance
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Text fw={600}>{data.balance}</Text>
                        <Badge size="sm" color="violet" variant="light">
                          {data.balanceUnit}
                        </Badge>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td fw={500} c="dimmed">
                      Gas Price (Slow)
                    </Table.Td>
                    <Table.Td>
                      <Badge color="green" variant="light">
                        {data.gasPrice.slow} {data.gasPrice.unit}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td fw={500} c="dimmed">
                      Gas Price (Standard)
                    </Table.Td>
                    <Table.Td>
                      <Badge color="yellow" variant="light">
                        {data.gasPrice.standard} {data.gasPrice.unit}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td fw={500} c="dimmed">
                      Gas Price (Fast)
                    </Table.Td>
                    <Table.Td>
                      <Badge color="red" variant="light">
                        {data.gasPrice.fast} {data.gasPrice.unit}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td fw={500} c="dimmed">
                      Block Number
                    </Table.Td>
                    <Table.Td fw={600}>
                      {data.blockNumber.toLocaleString()}
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td fw={500} c="dimmed">
                      Fetched At
                    </Table.Td>
                    <Table.Td c="dimmed">
                      {new Date(data.fetchedAt).toLocaleString()}
                    </Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
            </Paper>

            {/* Balance history table */}
            <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
              <Group
                px="lg"
                py="md"
                style={{
                  borderBottom: "1px solid var(--mantine-color-dark-4)",
                }}
              >
                <IconHistory size={16} color="var(--mantine-color-teal-4)" />
                <Title order={4}>Balance History</Title>
                <Badge size="sm" variant="light" color="teal" ml="auto">
                  {history.length} records
                </Badge>
              </Group>
              {history.length === 0 ? (
                <Text c="dimmed" ta="center" py="xl" size="sm">
                  No history yet. Fetch this address a few more times to
                  populate history.
                </Text>
              ) : (
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>#</Table.Th>
                      <Table.Th>Balance (ETH)</Table.Th>
                      <Table.Th>Block Number</Table.Th>
                      <Table.Th>Fetched At</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {history.map((item, i) => (
                      <Table.Tr key={item.id}>
                        <Table.Td c="dimmed">{i + 1}</Table.Td>
                        <Table.Td fw={500}>{item.balance}</Table.Td>
                        <Table.Td>{item.blockNumber.toLocaleString()}</Table.Td>
                        <Table.Td c="dimmed">
                          <Text size="sm">
                            {new Date(item.fetchedAt).toLocaleString()}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              )}
            </Paper>
          </Stack>
        )}

        {/* Empty state */}
        {!loading && !data && !error && (
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
              <IconSearch size={32} />
            </ThemeIcon>
            <Title order={4} mb="xs">
              {walletAddress
                ? "Ready to explore your wallet"
                : "Connect your wallet or enter an address"}
            </Title>
            <Text c="dimmed" size="sm" maw={400} mx="auto">
              {walletAddress
                ? `Your address ${walletAddress.slice(0, 10)}… has been pre-filled. Press Fetch to see live data.`
                : "Connect MetaMask to auto-fill your address, or paste any Ethereum address above and press Fetch."}
            </Text>
          </Paper>
        )}
      </Container>

      <Footer />
    </div>
  );
}
