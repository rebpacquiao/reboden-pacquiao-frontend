"use client";
import { useState, useEffect, useCallback, useRef } from "react";
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
  Paper,
  Stack,
  Loader,
  Alert,
  ThemeIcon,
  Card,
  SimpleGrid,
  Anchor,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconCode,
  IconAlertCircle,
  IconRefresh,
  IconPlus,
  IconCopy,
  IconCheck,
  IconExternalLink,
  IconHistory,
} from "@tabler/icons-react";
import { ethers } from "ethers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useWallet } from "@/hooks/useWallet";
import {
  fetchContractInfo,
  fetchOwnedTokens,
  fetchMintHistory,
  saveMintRecord,
  contractActions,
} from "@/store/contractSlice";
import type { RootState, AppDispatch } from "@/store";
import ABI from "@/abi/CryptoWalletNFT.json";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const SEPOLIA_CHAIN_ID = "0xaa36a7";

function isContractDeployed() {
  return (
    !!CONTRACT_ADDRESS &&
    CONTRACT_ADDRESS !== ZERO_ADDRESS &&
    CONTRACT_ADDRESS.startsWith("0x")
  );
}

function parseContractError(err: unknown): string {
  if (typeof err !== "object" || !err) return "Transaction failed";
  const e = err as { code?: string; reason?: string; message?: string };
  if (e.code === "ACTION_REJECTED") return "Transaction rejected by user";
  if (e.code === "INSUFFICIENT_FUNDS")
    return "Insufficient funds to pay for gas";
  if (e.code === "NETWORK_ERROR")
    return "Network error — check your connection";
  if (e.code === "UNSUPPORTED_OPERATION")
    return "Unsupported operation — ensure MetaMask is connected";
  if (e.reason) return e.reason;
  if (e.message) return e.message.split("(")[0].trim();
  return "Transaction failed";
}

function decodeTokenName(tokenURI: string): string {
  try {
    if (tokenURI.startsWith("data:application/json;base64,")) {
      const decoded = atob(
        tokenURI.replace("data:application/json;base64,", ""),
      );
      return JSON.parse(decoded).name ?? tokenURI;
    }
  } catch {
    // fall through
  }
  return tokenURI;
}

export default function ContractsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    address: walletAddress,
    connect,
    disconnect,
    loading: walletLoading,
  } = useWallet();
  const {
    info,
    ownedTokens,
    history,
    historyLoading,
    minting,
    pendingTxHash,
    mintTxHash,
    mintTokenId,
    loading,
    error,
  } = useSelector((state: RootState) => state.contract);
  const [tokenName, setTokenName] = useState("");
  const [tokenDesc, setTokenDesc] = useState("");
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const mintingRef = useRef(false);
  const deployed = isContractDeployed();

  const load = useCallback(() => {
    dispatch(fetchContractInfo({ apiBase: API_BASE }));
    dispatch(fetchMintHistory({ apiBase: API_BASE }));
    if (walletAddress && deployed) {
      dispatch(fetchOwnedTokens({ address: walletAddress, apiBase: API_BASE }));
    }
  }, [dispatch, walletAddress, deployed]);

  useEffect(() => {
    load();
  }, [load]);

  async function switchToSepolia(): Promise<boolean> {
    const ethereum = (
      window as unknown as {
        ethereum?: { request: (args: unknown) => Promise<unknown> };
      }
    ).ethereum;
    if (!ethereum) return false;
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
      return true;
    } catch {
      return false;
    }
  }

  async function mint() {
    if (mintingRef.current || !walletAddress || !tokenName.trim() || !deployed)
      return;
    mintingRef.current = true;
    setNetworkError(null);
    dispatch(contractActions.setMinting());
    try {
      const ethereum = (window as unknown as { ethereum?: object }).ethereum;
      if (!ethereum) throw new Error("MetaMask not detected");

      // Switch to Sepolia before creating the provider so it's always on the right network
      const chainIdHex = await (
        ethereum as { request: (a: unknown) => Promise<string> }
      ).request({ method: "eth_chainId" });
      if (chainIdHex !== SEPOLIA_CHAIN_ID) {
        const switched = await switchToSepolia();
        if (!switched) {
          dispatch(
            contractActions.setMintError(
              "Please switch MetaMask to the Sepolia testnet",
            ),
          );
          return;
        }
      }

      // Create provider AFTER ensuring correct network
      const provider = new ethers.BrowserProvider(
        ethereum as ethers.Eip1193Provider,
      );
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        ABI as string[],
        signer,
      );
      const metadata = JSON.stringify({
        name: tokenName.trim(),
        description: tokenDesc.trim() || tokenName.trim(),
        image: `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(tokenName.trim())}`,
        attributes: [{ trait_type: "Minted By", value: walletAddress }],
      });
      const tokenURI = `data:application/json;base64,${btoa(metadata)}`;
      const tx = await (
        contract.mint as (
          uri: string,
        ) => Promise<ethers.ContractTransactionResponse>
      )(tokenURI);

      // Show tx hash immediately — before waiting for confirmation
      dispatch(contractActions.setPendingTx(tx.hash));

      const receipt = await tx.wait();
      const tokenId =
        receipt?.logs
          ?.filter((l): l is ethers.EventLog => "args" in l)
          .find((l) => l.fragment?.name === "Minted")
          ?.args?.[1]?.toString() ?? "?";
      dispatch(
        contractActions.setMintSuccess({
          txHash: tx.hash,
          tokenId: tokenId.toString(),
        }),
      );
      dispatch(
        saveMintRecord({
          apiBase: API_BASE,
          tokenId: tokenId.toString(),
          tokenURI,
          owner: walletAddress,
          txHash: tx.hash,
        }),
      );
      setTokenName("");
      setTokenDesc("");
      dispatch(fetchOwnedTokens({ address: walletAddress, apiBase: API_BASE }));
      dispatch(fetchContractInfo({ apiBase: API_BASE }));
    } catch (err) {
      dispatch(contractActions.setMintError(parseContractError(err)));
    } finally {
      mintingRef.current = false;
    }
  }

  function copyAddress() {
    if (!info?.address) return;
    navigator.clipboard.writeText(info.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

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
            gradient={{ from: "indigo", to: "violet" }}
          >
            <IconCode size={28} />
          </ThemeIcon>
          <div>
            <Title order={2}>Smart Contracts</Title>
            <Text c="dimmed" size="sm">
              ERC-721 NFT minting on Sepolia testnet
            </Text>
          </div>
        </Group>

        {!deployed && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="orange"
            mb="lg"
            radius="md"
            title="Contract not deployed"
          >
            Set <code>NEXT_PUBLIC_CONTRACT_ADDRESS</code> in your{" "}
            <code>.env</code> after running the deploy script.
          </Alert>
        )}

        {networkError && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            mb="lg"
            radius="md"
            withCloseButton
            onClose={() => setNetworkError(null)}
          >
            {networkError}
          </Alert>
        )}

        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            mb="lg"
            radius="md"
            withCloseButton
            onClose={() => dispatch(contractActions.clearError())}
          >
            {error}
          </Alert>
        )}

        {minting && pendingTxHash && (
          <Alert
            color="blue"
            mb="lg"
            radius="md"
            title="Transaction submitted!"
          >
            <Group gap="xs">
              <Loader size="xs" color="blue" />
              <Text size="sm">Waiting for confirmation on Sepolia…</Text>
              <Anchor
                href={`https://sepolia.etherscan.io/tx/${pendingTxHash}`}
                target="_blank"
                size="sm"
              >
                View on Etherscan <IconExternalLink size={12} />
              </Anchor>
            </Group>
          </Alert>
        )}

        {mintTxHash && (
          <Alert color="teal" mb="lg" radius="md" title="Minted successfully!">
            <Group gap="sm" justify="space-between">
              <Group gap="xs">
                <Text size="sm">Token ID: {mintTokenId}</Text>
                <Anchor
                  href={`https://sepolia.etherscan.io/tx/${mintTxHash}`}
                  target="_blank"
                  size="sm"
                >
                  View on Etherscan <IconExternalLink size={12} />
                </Anchor>
              </Group>
              <Button
                size="xs"
                variant="light"
                color="teal"
                onClick={() => dispatch(contractActions.resetMint())}
              >
                + Mint Another
              </Button>
            </Group>
          </Alert>
        )}

        {/* Contract info cards */}
        {loading && !info && (
          <Paper p="xl" withBorder radius="md" ta="center" mb="lg">
            <Loader size="md" color="violet" mx="auto" />
          </Paper>
        )}

        {info && (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} mb="lg">
            <Card withBorder radius="md" p="md">
              <Text size="xs" c="dimmed" mb={4}>
                Contract
              </Text>
              <Group gap={4}>
                <Text fw={600} size="sm" style={{ fontFamily: "monospace" }}>
                  {info.address.slice(0, 8)}…{info.address.slice(-6)}
                </Text>
                <Tooltip label={copied ? "Copied!" : "Copy address"}>
                  <ActionIcon
                    variant="subtle"
                    size="xs"
                    onClick={copyAddress}
                    color={copied ? "teal" : "gray"}
                  >
                    {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Card>
            <Card withBorder radius="md" p="md">
              <Text size="xs" c="dimmed" mb={4}>
                Name
              </Text>
              <Text fw={600}>{info.name}</Text>
            </Card>
            <Card withBorder radius="md" p="md">
              <Text size="xs" c="dimmed" mb={4}>
                Symbol
              </Text>
              <Badge variant="light" color="violet">
                {info.symbol}
              </Badge>
            </Card>
            <Card withBorder radius="md" p="md">
              <Text size="xs" c="dimmed" mb={4}>
                Total Minted
              </Text>
              <Text fw={600}>{info.totalSupply}</Text>
            </Card>
          </SimpleGrid>
        )}

        {/* Mint form */}
        {!mintTxHash && (
          <Paper p="lg" withBorder radius="md" mb="lg">
            <Group mb="md" justify="space-between">
              <Text fw={600}>Mint New NFT</Text>
              {!walletAddress && (
                <Button
                  size="xs"
                  variant="light"
                  color="violet"
                  onClick={connect}
                >
                  Connect Wallet
                </Button>
              )}
            </Group>
            <Stack gap="sm">
              <TextInput
                label="Token Name"
                placeholder="My Awesome NFT"
                value={tokenName}
                onChange={(e) => setTokenName(e.currentTarget.value)}
                disabled={!walletAddress || !deployed}
              />
              <TextInput
                label="Description (optional)"
                placeholder="A unique NFT minted on Sepolia"
                value={tokenDesc}
                onChange={(e) => setTokenDesc(e.currentTarget.value)}
                disabled={!walletAddress || !deployed}
              />
              <Group justify="flex-end">
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={mint}
                  loading={minting}
                  disabled={!walletAddress || !deployed || !tokenName.trim()}
                  variant="gradient"
                  gradient={{ from: "indigo", to: "violet" }}
                >
                  {minting ? "Minting…" : "Mint NFT"}
                </Button>
              </Group>
            </Stack>
          </Paper>
        )}

        {/* Your NFTs */}
        {walletAddress && deployed && (
          <Paper withBorder radius="md" p="lg" mb="lg">
            <Group justify="space-between" mb="md">
              <Text fw={600}>Your NFTs</Text>
              <ActionIcon
                variant="subtle"
                color="violet"
                onClick={() =>
                  dispatch(
                    fetchOwnedTokens({
                      address: walletAddress,
                      apiBase: API_BASE,
                    }),
                  )
                }
              >
                <IconRefresh size={16} />
              </ActionIcon>
            </Group>
            {loading && (
              <Group justify="center" py="lg">
                <Loader size="sm" color="violet" />
              </Group>
            )}
            {!loading && ownedTokens.length === 0 && (
              <Text c="dimmed" size="sm" ta="center" py="lg">
                No NFTs found for this address.
              </Text>
            )}
            {!loading && ownedTokens.length > 0 && (
              <Table highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Token ID</Table.Th>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Etherscan</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {ownedTokens.map((token) => (
                    <Table.Tr key={token.tokenId}>
                      <Table.Td>
                        <Text size="sm" fw={500}>
                          #{token.tokenId}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{decodeTokenName(token.tokenURI)}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Anchor
                          href={`https://sepolia.etherscan.io/token/${CONTRACT_ADDRESS}?a=${token.tokenId}`}
                          target="_blank"
                          size="xs"
                        >
                          <Group gap={4}>
                            View <IconExternalLink size={12} />
                          </Group>
                        </Anchor>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Paper>
        )}

        {/* Global mint history from MongoDB */}
        <Paper withBorder radius="md" p="lg">
          <Group justify="space-between" mb="md">
            <Group gap="sm">
              <ThemeIcon size={28} radius="md" variant="light" color="violet">
                <IconHistory size={16} />
              </ThemeIcon>
              <div>
                <Text fw={600} size="sm">
                  Mint History
                </Text>
                <Text size="xs" c="dimmed">
                  All mints recorded on-chain and saved to MongoDB
                </Text>
              </div>
            </Group>
            <ActionIcon
              variant="subtle"
              color="violet"
              onClick={() => dispatch(fetchMintHistory({ apiBase: API_BASE }))}
            >
              <IconRefresh size={16} />
            </ActionIcon>
          </Group>
          {historyLoading && (
            <Group justify="center" py="lg">
              <Loader size="sm" color="violet" />
            </Group>
          )}
          {!historyLoading && history.length === 0 && (
            <Text c="dimmed" size="sm" ta="center" py="lg">
              No mints recorded yet.
            </Text>
          )}
          {!historyLoading && history.length > 0 && (
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Token ID</Table.Th>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Minted By</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Tx</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {history.map((record) => (
                  <Table.Tr key={record.id}>
                    <Table.Td>
                      <Text size="sm" fw={500}>
                        #{record.tokenId}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{decodeTokenName(record.tokenURI)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" style={{ fontFamily: "monospace" }}>
                        {record.owner.slice(0, 8)}…{record.owner.slice(-6)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dimmed">
                        {new Date(record.mintedAt).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Anchor
                        href={`https://sepolia.etherscan.io/tx/${record.txHash}`}
                        target="_blank"
                        size="xs"
                      >
                        <Group gap={4}>
                          View <IconExternalLink size={12} />
                        </Group>
                      </Anchor>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Paper>
      </Container>
      <Footer />
    </Stack>
  );
}
