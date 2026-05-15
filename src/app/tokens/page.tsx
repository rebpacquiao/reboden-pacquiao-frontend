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
  NumberFormatter,
} from "@mantine/core";
import {
  IconSearch,
  IconCoin,
  IconAlertCircle,
  IconRefresh,
} from "@tabler/icons-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useWallet } from "@/hooks/useWallet";
import { fetchTokens, tokenActions } from "@/store/tokenSlice";
import type { RootState, AppDispatch } from "@/store";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export default function TokensPage() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    address: walletAddress,
    connect,
    disconnect,
    loading: walletLoading,
  } = useWallet();
  const {
    tokens,
    count,
    loading,
    error,
    address: fetchedAddress,
    fetchedAt,
  } = useSelector((state: RootState) => state.tokens);

  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (walletAddress) setInput(walletAddress);
  }, [walletAddress]);

  function submit() {
    const addr = input.trim();
    if (!addr) return;
    dispatch(fetchTokens({ address: addr, apiBase: API_BASE }));
    setSearch("");
  }

  function refresh() {
    if (!fetchedAddress) return;
    dispatch(tokenActions.resetTokens());
    dispatch(fetchTokens({ address: fetchedAddress, apiBase: API_BASE }));
  }

  const filtered = tokens.filter(
    (t) =>
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.symbol.toLowerCase().includes(search.toLowerCase()),
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
            gradient={{ from: "violet", to: "blue" }}
          >
            <IconCoin size={28} />
          </ThemeIcon>
          <div>
            <Title order={2}>Token Balances</Title>
            <Text c="dimmed" size="sm">
              ERC-20 tokens held by any Ethereum address via Alchemy API
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
              gradient={{ from: "violet", to: "blue" }}
            >
              Fetch
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
              Fetching token balances and metadata…
            </Text>
          </Paper>
        )}

        {!loading && fetchedAddress && (
          <Paper withBorder radius="md" p="md">
            <Group justify="space-between" mb="md">
              <Group gap="sm">
                <Text fw={600}>Results for</Text>
                <Badge variant="light" color="violet" size="sm">
                  {fetchedAddress.slice(0, 10)}…{fetchedAddress.slice(-6)}
                </Badge>
                <Badge variant="light" color="teal" size="sm">
                  {count} token{count !== 1 ? "s" : ""}
                </Badge>
              </Group>
              <Group gap="sm">
                {fetchedAt && (
                  <Text size="xs" c="dimmed">
                    {new Date(fetchedAt).toLocaleTimeString()}
                  </Text>
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

            {count > 0 && (
              <TextInput
                mb="md"
                leftSection={<IconSearch size={14} />}
                placeholder="Filter by name or symbol…"
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                size="sm"
              />
            )}

            {count === 0 ? (
              <Text c="dimmed" ta="center" py="xl">
                No ERC-20 tokens found for this address.
              </Text>
            ) : (
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>#</Table.Th>
                    <Table.Th>Token</Table.Th>
                    <Table.Th>Symbol</Table.Th>
                    <Table.Th>Balance</Table.Th>
                    <Table.Th>Contract</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filtered.map((token, i) => (
                    <Table.Tr key={token.contractAddress}>
                      <Table.Td>
                        <Text size="sm" c="dimmed">
                          {i + 1}
                        </Text>
                      </Table.Td>
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
            )}
          </Paper>
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
              <IconCoin size={32} />
            </ThemeIcon>
            <Title order={4} mb="xs">
              {walletAddress
                ? "Ready to fetch your tokens"
                : "Enter an address to get started"}
            </Title>
            <Text c="dimmed" size="sm">
              {walletAddress
                ? "Your address is pre-filled. Press Fetch to load ERC-20 balances."
                : "Connect MetaMask or paste any Ethereum address above."}
            </Text>
          </Paper>
        )}
      </Container>

      <Footer />
    </Stack>
  );
}
