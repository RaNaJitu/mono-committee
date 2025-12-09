export interface CreateWalletInput {
  userId: number;
  userType: string;
  accountNumber: string;
  balance?: string;
  creditLimit?: string;
  creditBalance: string;
}

export interface MintPointsInput {
  accountNumber: string;
  userId: number;
  pointsToMint: number;
  sender: number;
}

export interface TransactionAmountInput {
  accountNumber: string;
  userId: number;
  amount: number;
}

export interface CreateTransactionInput {
  amount: number;
  sender: any;
  receiver: any;
  senderRole: string;
  receiverRole: string;
  nature: string;
  description: string;
  senderBalanceType: string,
  receiverBalanceType: string
  walletType?: number;
  typeOfTransaction: string;
  bonus: number;
  bonusType: string;
}
