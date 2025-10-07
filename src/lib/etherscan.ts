/**
 * Etherscan API Service - Base Blockchain Real Data (V2 API)
 * 
 * This service provides real blockchain data using Etherscan's unified V2 API
 * for Base blockchain (Chain ID: 8453). The V2 API allows querying data from
 * 50+ supported chains with a single API key.
 * 
 * Features:
 * - Real transaction history and details
 * - Actual token balances and transfers
 * - Gas usage and transaction costs
 * - Block information and confirmations
 * - Base blockchain specific endpoints (Chain ID: 8453)
 * - Error handling and rate limiting
 * - Unified V2 API across multiple chains
 * 
 * @see https://docs.etherscan.io/ - Etherscan V2 API Documentation
 * @author Sniffer Web3 Team
 * @version 1.0.0
 */

// Etherscan API Configuration for Base (V2 API)
const ETHERSCAN_API_KEY = '4BX3N5QR9QQREKWAKT5IJQTWF5R8SM8ZV9';
const BASE_API_URL = 'https://api.etherscan.io/v2/api'; // Unified Etherscan V2 API endpoint

/**
 * Etherscan Transaction Interface
 * 
 * @interface EtherscanTransaction
 * @property {string} hash - Transaction hash
 * @property {string} from - Sender address
 * @property {string} to - Recipient address
 * @property {string} value - Transaction value in wei
 * @property {string} gas - Gas limit
 * @property {string} gasPrice - Gas price in wei
 * @property {string} gasUsed - Gas used
 * @property {string} timeStamp - Transaction timestamp
 * @property {string} blockNumber - Block number
 * @property {string} isError - Error status (0 = success, 1 = error)
 * @property {string} methodId - Method ID
 * @property {string} functionName - Function name
 */
export interface EtherscanTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  timeStamp: string;
  blockNumber: string;
  isError: string;
  methodId: string;
  functionName: string;
}

/**
 * Etherscan Token Transfer Interface
 * 
 * @interface EtherscanTokenTransfer
 * @property {string} blockNumber - Block number
 * @property {string} timeStamp - Transfer timestamp
 * @property {string} hash - Transaction hash
 * @property {string} from - Sender address
 * @property {string} to - Recipient address
 * @property {string} value - Transfer amount
 * @property {string} tokenName - Token name
 * @property {string} tokenSymbol - Token symbol
 * @property {string} tokenDecimal - Token decimals
 * @property {string} contractAddress - Token contract address
 */
export interface EtherscanTokenTransfer {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  contractAddress: string;
}

/**
 * Etherscan Token Balance Interface
 * 
 * @interface EtherscanTokenBalance
 * @property {string} account - Wallet address
 * @property {string} balance - Token balance
 * @property {string} tokenName - Token name
 * @property {string} tokenSymbol - Token symbol
 * @property {string} tokenDecimal - Token decimals
 * @property {string} contractAddress - Token contract address
 */
export interface EtherscanTokenBalance {
  account: string;
  balance: string;
  balanceFormatted?: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  contractAddress: string;
}

/**
 * Etherscan API Response Interface
 * 
 * @interface EtherscanResponse
 * @property {string} status - Response status
 * @property {string} message - Response message
 * @property {any} result - Response data
 */
// interface EtherscanResponse {
//   status: string;
//   message: string;
//   result: any;
// }

/**
 * EtherscanAPI Class - Main API Service Handler
 * 
 * This class handles all communication with the Etherscan Base API,
 * providing methods for fetching real blockchain data including
 * transactions, token transfers, and wallet balances.
 * 
 * @class EtherscanAPI
 * @property {string} apiKey - Etherscan API key for authentication
 * @property {string} baseUrl - Base URL for Etherscan Base API endpoints
 */
class EtherscanAPI {
  private apiKey: string;
  private baseUrl: string;
  private lastRequestTime: number = 0;

  /**
   * Constructor for EtherscanAPI class
   * 
   * @param {string} apiKey - Etherscan API key for authentication
   */
  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = BASE_API_URL;
  }

  /**
   * Rate limiting helper - ensures max 4 requests per second
   */
  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = 250; // 250ms = 4 requests per second (safe margin)
    
    if (timeSinceLastRequest < minInterval) {
      const waitTime = minInterval - timeSinceLastRequest;
      console.log(`Rate limiting: waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Make a request to Etherscan API with retry logic and enhanced error handling
   * 
   * @param {string} module - API module (account, transaction, etc.)
   * @param {string} action - API action (txlist, tokentx, etc.)
   * @param {Record<string, string | number>} params - Additional parameters
   * @param {number} maxRetries - Maximum number of retries (default: 3)
   * @returns {Promise<unknown>} API response data
   * @private
   */
  private async makeRequest(
    module: string,
    action: string,
    params: Record<string, string | number> = {},
    maxRetries: number = 3
  ): Promise<unknown> {
    const url = new URL(this.baseUrl);
    
    // V2 API format
    url.searchParams.append('chainid', '8453'); // Base chain ID
    url.searchParams.append('module', module);
    url.searchParams.append('action', action);
    url.searchParams.append('apikey', this.apiKey);
    
    // Add additional parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value.toString());
    });

    console.log(`Making Base V2 API request: ${module}.${action}`, params);

    // Apply rate limiting
    await this.rateLimit();

    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${maxRetries} for ${module}.${action}`);
        
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        const response = await fetch(url.toString(), {
          signal: controller.signal,
          headers: {
            'User-Agent': 'SnifferWeb3/1.0',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Base V2 API HTTP error: ${response.status} ${response.statusText}`, errorText);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json() as { status: string; result: unknown; message?: string };
        
        // Validate response structure
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid response format: not an object');
        }
        
        // Handle both Etherscan format and JSON-RPC format
        if (data.status !== undefined) {
          // Standard Etherscan format
          if (data.status !== '1') {
            const errorMsg = data.message || 'Unknown error';
            const errorResult = data.result;
            
            console.error(`Base V2 API returned error: ${errorMsg} - ${errorResult}`);
            
            // Handle specific error cases
            if (errorMsg === 'NOTOK' && typeof errorResult === 'string') {
              if (errorResult.includes('rate limit') || errorResult.includes('Max rate limit reached')) {
                const waitTime = Math.min(1000 * attempt, 5000); // Exponential backoff, max 5 seconds
                console.log(`Rate limit hit, waiting ${waitTime}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue; // Retry
              } else if (errorResult.includes('Invalid address') || errorResult.includes('No transactions found')) {
                // These are not retryable errors
                console.log(`Non-retryable error: ${errorResult}`);
                return []; // Return empty array for missing data
              }
            }
            
            // For other errors, retry if we have attempts left
            if (attempt < maxRetries) {
              const waitTime = 1000 * attempt; // Exponential backoff
              console.log(`API error, retrying in ${waitTime}ms...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              continue;
            }
            
            throw new Error(`Base V2 API error: ${errorMsg} - ${errorResult}`);
          }
          
          // Validate result data
          if (data.result === null || data.result === undefined) {
            console.warn(`API returned null result for ${module}.${action}`);
            return [];
          }
          
          return data.result;
        } else if ((data as { jsonrpc?: string }).jsonrpc !== undefined) {
          // JSON-RPC format
          const jsonRpcData = data as unknown as { jsonrpc: string; result?: unknown; error?: { message: string; code: number } };
          if (jsonRpcData.error) {
            console.error(`Base V2 JSON-RPC error: ${jsonRpcData.error.message} - ${jsonRpcData.error.code}`);
            throw new Error(`JSON-RPC error: ${jsonRpcData.error.message} (${jsonRpcData.error.code})`);
          }
          
          if (jsonRpcData.result === null || jsonRpcData.result === undefined) {
            console.warn(`JSON-RPC returned null result for ${module}.${action}`);
            return [];
          }
          
          return jsonRpcData.result;
        } else {
          console.error(`Unknown API response format:`, data);
          throw new Error(`Unknown API response format`);
        }
      } catch (error) {
        lastError = error as Error;
        console.error(`Attempt ${attempt} failed for ${module}.${action}:`, error);
        
        if (error.name === 'AbortError') {
          console.log('Request timeout, will retry if attempts remaining');
          if (attempt < maxRetries) {
            const waitTime = 2000 * attempt; // Longer wait for timeouts
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
          throw new Error('Request timeout - API took too long to respond after all retries');
        }
        
        // For network errors, retry with exponential backoff
        if (attempt < maxRetries && (
          error.message?.includes('fetch') || 
          error.message?.includes('network') || 
          error.message?.includes('ECONNRESET') ||
          error.message?.includes('ETIMEDOUT')
        )) {
          const waitTime = 1000 * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(`Network error, retrying in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        // If this is the last attempt or a non-retryable error, throw
        if (attempt === maxRetries) {
          throw lastError;
        }
      }
    }
    
    throw lastError || new Error('All retry attempts failed');
  }

  /**
   * Get transaction list for an address
   * 
   * @param {string} address - Wallet address
   * @param {number} [startBlock=0] - Start block number
   * @param {number} [endBlock=99999999] - End block number
   * @param {number} [page=1] - Page number
   * @param {number} [offset=10] - Number of transactions per page
   * @param {string} [sort='desc'] - Sort order (asc/desc)
   * @returns {Promise<EtherscanTransaction[]>} Array of transactions
   */
  async getTransactionList(
    address: string,
    startBlock: number = 0,
    endBlock: number = 99999999,
    page: number = 1,
    offset: number = 10,
    sort: string = 'desc'
  ): Promise<EtherscanTransaction[]> {
    try {
      const result = await this.makeRequest('account', 'txlist', {
        address: address.toLowerCase(),
        startblock: startBlock,
        endblock: endBlock,
        page,
        offset,
        sort
      });

      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Error fetching transaction list:', error);
      return [];
    }
  }

  /**
   * Get token transfers for an address
   * 
   * @param {string} address - Wallet address
   * @param {number} [page=1] - Page number
   * @param {number} [offset=10] - Number of transfers per page
   * @param {string} [sort='desc'] - Sort order (asc/desc)
   * @returns {Promise<EtherscanTokenTransfer[]>} Array of token transfers
   */
  async getTokenTransfers(
    address: string,
    page: number = 1,
    offset: number = 10,
    sort: string = 'desc'
  ): Promise<EtherscanTokenTransfer[]> {
    try {
      // Token transfers can be slow, so we'll add a timeout
      console.log('Fetching token transfers for address:', address);
      const result = await this.makeRequest('account', 'tokentx', {
        address: address.toLowerCase(),
        page,
        offset,
        sort
      });

      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Error fetching token transfers:', error);
      if (error.message?.includes('timeout') || error.message?.includes('Connect Timeout')) {
        console.log('Token transfer request timed out, returning empty array');
      }
      return [];
    }
  }

  /**
   * Get token balances for an address
   * 
   * @param {string} address - Wallet address
   * @returns {Promise<EtherscanTokenBalance[]>} Array of token balances
   */
  async getTokenBalances(address: string): Promise<EtherscanTokenBalance[]> {
    try {
      console.log(`Fetching token balances for address: ${address}`);
      
      // Use token transfers to get token information
      const tokenTransfers = await this.getTokenTransfers(address);
      console.log(`Found ${tokenTransfers.length} token transfers`);
      
      // Extract unique tokens from transfers
      const tokenMap = new Map<string, EtherscanTokenBalance>();
      
      tokenTransfers.forEach((transfer: { contractAddress?: string; address?: string; tokenSymbol?: string; tokenName?: string; tokenDecimal?: string }) => {
        const contractAddress = transfer.contractAddress || transfer.address;
        if (contractAddress && !tokenMap.has(contractAddress)) {
          tokenMap.set(contractAddress, {
            account: address,
            balance: '0', // We'll calculate this separately
            tokenName: transfer.tokenName || 'Unknown Token',
            tokenSymbol: transfer.tokenSymbol || 'UNKNOWN',
            tokenDecimal: transfer.tokenDecimal || '18',
            contractAddress: contractAddress,
            balanceFormatted: '0' // Default to 0 for now
          });
        }
      });

      console.log(`Found ${tokenMap.size} unique tokens from transfers`);

      // Convert map to array and return all tokens (even with zero balance for now)
      const tokens = Array.from(tokenMap.values());
      console.log(`Returning ${tokens.length} tokens`);
      
      return tokens;
    } catch (error) {
      console.error('Error fetching token balances:', error);
      return [];
    }
  }

  /**
   * Get ETH balance for an address
   * 
   * @param {string} address - Wallet address
   * @returns {Promise<string>} ETH balance in wei
   */
  async getETHBalance(address: string): Promise<string> {
    try {
      const result = await this.makeRequest('account', 'balance', {
        address: address.toLowerCase(),
        tag: 'latest'
      });

      return typeof result === 'string' ? result : '0';
    } catch (error) {
      console.error('Error fetching ETH balance:', error);
      return '0';
    }
  }

  /**
   * Get transaction count (nonce) for an address with enhanced reliability
   * 
   * @param {string} address - Wallet address
   * @returns {Promise<number>} Transaction count
   */
  async getTransactionCount(address: string): Promise<number> {
    try {
      // First, try to get the actual transaction count from the transaction list
      // This gives us the most accurate count including both incoming and outgoing
      console.log(`Fetching transaction count for address: ${address}`);
      
      const result = await this.makeRequest('account', 'txlist', {
        address: address.toLowerCase(),
        startblock: 0,
        endblock: 99999999,
        page: 1,
        offset: 10000, // Get up to 10k transactions to count
        sort: 'desc'
      });

      if (Array.isArray(result)) {
        const count = result.length;
        console.log(`Found ${count} transactions for address ${address}`);
        return count;
      }

      // Fallback: try to get nonce (outgoing transactions only)
      console.log('Falling back to nonce-based transaction count');
      const nonceResult = await this.makeRequest('proxy', 'eth_getTransactionCount', {
        address: address.toLowerCase(),
        tag: 'latest'
      });

      if (typeof nonceResult === 'string') {
        const nonceCount = parseInt(nonceResult, 16) || 0;
        console.log(`Nonce-based count: ${nonceCount}`);
        return nonceCount;
      }
      
      const nonceCount = parseInt(String(nonceResult)) || 0;
      console.log(`Nonce-based count (parsed): ${nonceCount}`);
      return nonceCount;
    } catch (error) {
      console.error('Error fetching transaction count:', error);
      // Return 0 as fallback - this is better than crashing
      console.log('Returning 0 as fallback transaction count');
      return 0;
    }
  }

  /**
   * Get gas price
   * 
   * @returns {Promise<string>} Gas price in wei
   */
  async getGasPrice(): Promise<string> {
    try {
      const result = await this.makeRequest('proxy', 'eth_gasPrice', {});
      return typeof result === 'string' ? result : '0';
    } catch (error) {
      console.error('Error fetching gas price:', error);
      return '0';
    }
  }

  /**
   * Get block number
   * 
   * @returns {Promise<number>} Latest block number
   */
  async getBlockNumber(): Promise<number> {
    try {
      const result = await this.makeRequest('proxy', 'eth_blockNumber', {});
      return parseInt(String(result), 16) || 0;
    } catch (error) {
      console.error('Error fetching block number:', error);
      return 0;
    }
  }

  /**
   * Format transaction data for display
   * 
   * @param {EtherscanTransaction} tx - Raw transaction data
   * @returns {object} Formatted transaction data
   */
  formatTransaction(tx: EtherscanTransaction) {
    const valueInETH = (parseInt(tx.value) / Math.pow(10, 18)).toFixed(6);
    const gasUsed = parseInt(tx.gasUsed);
    const gasPrice = parseInt(tx.gasPrice);
    const gasCost = (gasUsed * gasPrice / Math.pow(10, 18)).toFixed(6);
    
    return {
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: valueInETH,
      valueWei: tx.value,
      gasUsed,
      gasPrice,
      gasCost,
      timestamp: parseInt(tx.timeStamp) * 1000,
      blockNumber: parseInt(tx.blockNumber),
      isError: tx.isError === '1',
      methodId: tx.methodId,
      functionName: tx.functionName || 'Transfer'
    };
  }

  /**
   * Format token transfer data for display
   * 
   * @param {EtherscanTokenTransfer} transfer - Raw token transfer data
   * @returns {object} Formatted token transfer data
   */
  formatTokenTransfer(transfer: EtherscanTokenTransfer) {
    const decimals = parseInt(transfer.tokenDecimal);
    const value = parseFloat(transfer.value) / Math.pow(10, decimals);
    
    return {
      hash: transfer.hash,
      from: transfer.from,
      to: transfer.to,
      value,
      valueRaw: transfer.value,
      tokenName: transfer.tokenName,
      tokenSymbol: transfer.tokenSymbol,
      tokenDecimal: decimals,
      contractAddress: transfer.contractAddress,
      timestamp: parseInt(transfer.timeStamp) * 1000,
      blockNumber: parseInt(transfer.blockNumber)
    };
  }

  /**
   * Get comprehensive wallet information with enhanced error handling
   * 
   * @param {string} address - Wallet address
   * @returns {Promise<object>} Complete wallet information
   */
  async getWalletInfo(address: string): Promise<{
    ethBalance: { wei: string; eth: string; formatted: string };
    transactionCount: number;
    gasPrice: string;
    blockNumber: number;
  }> {
    try {
      console.log(`Fetching comprehensive wallet info for: ${address}`);
      
      // Validate address format
      if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error('Invalid Ethereum address format');
      }

      // Fetch basic info with individual error handling
      const ethBalance = await this.getETHBalance(address).catch(error => {
        console.warn('Failed to fetch ETH balance:', error);
        return '0';
      });

      const gasPrice = await this.getGasPrice().catch(error => {
        console.warn('Failed to fetch gas price:', error);
        return '0';
      });

      const blockNumber = await this.getBlockNumber().catch(error => {
        console.warn('Failed to fetch block number:', error);
        return 0;
      });

      // Try to get transaction count separately to avoid failing the whole request
      let transactionCount = 0;
      try {
        transactionCount = await this.getTransactionCount(address);
      } catch (txError) {
        console.warn('Could not fetch transaction count, using 0:', txError);
        transactionCount = 0;
      }

      // Format ETH balance safely
      let ethBalanceFormatted = '0';
      try {
        const balanceWei = parseInt(ethBalance);
        if (!isNaN(balanceWei) && balanceWei >= 0) {
          ethBalanceFormatted = (balanceWei / Math.pow(10, 18)).toFixed(6);
        }
      } catch (formatError) {
        console.warn('Failed to format ETH balance:', formatError);
        ethBalanceFormatted = '0';
      }

      const walletInfo = {
        ethBalance: {
          wei: ethBalance,
          eth: ethBalanceFormatted,
          formatted: `${ethBalanceFormatted} ETH`
        },
        transactionCount,
        gasPrice,
        blockNumber
      };

      console.log(`Successfully fetched wallet info:`, {
        balance: walletInfo.ethBalance.formatted,
        transactionCount: walletInfo.transactionCount,
        gasPrice: walletInfo.gasPrice,
        blockNumber: walletInfo.blockNumber
      });

      return walletInfo;
    } catch (error) {
      console.error('Error fetching wallet info:', error);
      // Return safe defaults instead of throwing
      return {
        ethBalance: { wei: '0', eth: '0', formatted: '0 ETH' },
        transactionCount: 0,
        gasPrice: '0',
        blockNumber: 0
      };
    }
  }

  /**
   * Get account transactions (alias for getTransactionList)
   * 
   * @param {string} address - Wallet address
   * @param {number} [offset=10] - Number of transactions per page
   * @returns {Promise<EtherscanTransaction[]>} Array of transactions
   */
  async getAccountTransactions(address: string, offset: number = 10): Promise<EtherscanTransaction[]> {
    return this.getTransactionList(address, 0, 99999999, 1, offset, 'desc');
  }
}

// Create singleton instance
export const etherscanAPI = new EtherscanAPI(ETHERSCAN_API_KEY);
