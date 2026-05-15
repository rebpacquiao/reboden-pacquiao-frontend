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

        {!address ? (
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
