"use client";
import {
  Container,
  Stack,
  Alert,
  Text,
  Center,
  Button,
  ThemeIcon,
  Title,
  Paper,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconWallet,
  IconCurrencyEthereum,
  IconDownload,
  IconRefresh,
} from "@tabler/icons-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BalanceCard from "@/components/BalanceCard";
import TransactionTable from "@/components/TransactionTable";
import { useWallet } from "@/hooks/useWallet";

export default function Home() {
  const {
    address,
    balance,
    transactions,
    loading,
    error,
    noWallet,
    connect,
    disconnect,
    clearError,
  } = useWallet();

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Header
        address={address}
        loading={loading}
        onConnect={connect}
        onDisconnect={disconnect}
      />

      <Container size="lg" py="xl" style={{ flex: 1 }}>
        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            mb="lg"
            withCloseButton
            onClose={clearError}
          >
            {error}
          </Alert>
        )}

        {noWallet ? (
          <Center style={{ minHeight: "60vh" }}>
            <Stack align="center" gap="lg">
              <ThemeIcon size={96} radius="xl" color="orange" variant="light">
                <IconWallet size={52} />
              </ThemeIcon>
              <Stack align="center" gap="xs">
                <Title order={2}>No Wallet Detected</Title>
                <Text c="dimmed" ta="center" maw={400}>
                  You need MetaMask to use this app. Install it, then refresh
                  the page.
                </Text>
              </Stack>
              <Stack align="center" gap="sm">
                <Button
                  component="a"
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  leftSection={<IconDownload size={16} />}
                  size="lg"
                  variant="gradient"
                  gradient={{ from: "orange", to: "yellow" }}
                >
                  Install MetaMask
                </Button>
                <Button
                  variant="subtle"
                  leftSection={<IconRefresh size={16} />}
                  onClick={() => window.location.reload()}
                >
                  Refresh after install
                </Button>
              </Stack>
            </Stack>
          </Center>
        ) : !address ? (
          <Center style={{ minHeight: "60vh" }}>
            <Stack align="center" gap="lg">
              <ThemeIcon
                size={96}
                radius="xl"
                variant="gradient"
                gradient={{ from: "violet", to: "blue" }}
              >
                <IconCurrencyEthereum size={56} />
              </ThemeIcon>
              <Stack align="center" gap="xs">
                <Title order={1}>Ethereum Wallet Dashboard</Title>
                <Text c="dimmed" ta="center" maw={420} size="md">
                  Connect your MetaMask wallet to view your ETH balance and last
                  10 transactions.
                </Text>
              </Stack>
              <Button
                leftSection={<IconWallet size={18} />}
                onClick={connect}
                loading={loading}
                size="lg"
                variant="gradient"
                gradient={{ from: "violet", to: "blue" }}
              >
                Connect Wallet
              </Button>
            </Stack>
          </Center>
        ) : (
          <Stack gap="xl">
            {balance && <BalanceCard balance={balance} address={address} />}
            <Paper withBorder radius="md" p="lg">
              <Text fw={700} size="lg" mb="md">
                Recent Transactions
              </Text>
              <TransactionTable transactions={transactions} />
            </Paper>
          </Stack>
        )}
      </Container>

      <Footer />
    </div>
  );
}
