import { Table, Badge, Text, Anchor, ScrollArea, Center } from "@mantine/core";
import { formatEther } from "ethers";
import { IconInbox } from "@tabler/icons-react";
import type { Transaction } from "@/types";
import { shorten } from "@/lib/utils";

export default function TransactionTable({ transactions }: { transactions: Transaction[] }) {
  if (!transactions.length) {
    return (
      <Center py="xl">
        <Text c="dimmed" ta="center">
          <IconInbox size={32} style={{ display: "block", margin: "0 auto 8px" }} />
          No transactions found.
        </Text>
      </Center>
    );
  }

  return (
    <ScrollArea>
      <Table striped highlightOnHover withTableBorder withColumnBorders verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Tx Hash</Table.Th>
            <Table.Th>From</Table.Th>
            <Table.Th>To</Table.Th>
            <Table.Th>Value (ETH)</Table.Th>
            <Table.Th>Status</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {transactions.map((tx) => (
            <Table.Tr key={tx.hash}>
              <Table.Td>
                <Anchor
                  href={`https://etherscan.io/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="sm"
                  ff="monospace"
                >
                  {shorten(tx.hash, 10, 8)}
                </Anchor>
              </Table.Td>
              <Table.Td>
                <Text size="sm" ff="monospace">{shorten(tx.from)}</Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm" ff="monospace">
                  {tx.to ? shorten(tx.to) : <Badge variant="outline" size="xs">Contract</Badge>}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{parseFloat(formatEther(tx.value)).toFixed(6)}</Text>
              </Table.Td>
              <Table.Td>
                <Badge color={tx.isError === "0" ? "teal" : "red"} variant="light" size="sm">
                  {tx.isError === "0" ? "Success" : "Failed"}
                </Badge>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
