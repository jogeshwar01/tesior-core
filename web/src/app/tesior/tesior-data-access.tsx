import { TesiorIDL, getTesiorProgramId } from '@tesior/anchor';
import { Program } from '@coral-xyz/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { Cluster, Keypair, PublicKey } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { useTransactionToast } from '../ui/ui-layout';

export function useTesiorProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getTesiorProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = new Program(TesiorIDL, programId, provider);

  const accounts = useQuery({
    queryKey: ['tesior', 'all', { cluster }],
    queryFn: () => program.account.tesior.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const initialize = useMutation({
    mutationKey: ['tesior', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods
        .initialize()
        .accounts({ tesior: keypair.publicKey })
        .signers([keypair])
        .rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: () => toast.error('Failed to initialize account'),
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  };
}

export function useTesiorProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts } = useTesiorProgram();

  const accountQuery = useQuery({
    queryKey: ['tesior', 'fetch', { cluster, account }],
    queryFn: () => program.account.tesior.fetch(account),
  });

  const closeMutation = useMutation({
    mutationKey: ['tesior', 'close', { cluster, account }],
    mutationFn: () =>
      program.methods.close().accounts({ tesior: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accounts.refetch();
    },
  });

  const decrementMutation = useMutation({
    mutationKey: ['tesior', 'decrement', { cluster, account }],
    mutationFn: () =>
      program.methods.decrement().accounts({ tesior: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  const incrementMutation = useMutation({
    mutationKey: ['tesior', 'increment', { cluster, account }],
    mutationFn: () =>
      program.methods.increment().accounts({ tesior: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  const setMutation = useMutation({
    mutationKey: ['tesior', 'set', { cluster, account }],
    mutationFn: (value: number) =>
      program.methods.set(value).accounts({ tesior: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  };
}
