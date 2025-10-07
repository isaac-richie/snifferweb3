/**
 * Etherscan Wallet API Route - Server-Side Proxy (V2 API)
 * 
 * This Next.js API route acts as a server-side proxy to the Etherscan V2 API
 * for Base blockchain (Chain ID: 8453), providing comprehensive wallet 
 * information including balance, transaction count, and gas information.
 * 
 * Uses Etherscan V2 unified API with Base chain ID: 8453
 * @see https://docs.etherscan.io/ - Etherscan V2 API Documentation
 * 
 * Endpoint: GET /api/etherscan/wallet?address={address}
 * 
 * @author Sniffer Web3 Team
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { etherscanAPI } from '@/lib/etherscan';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      );
    }

    console.log('Fetching wallet info for address:', address);

    // Use the new getWalletInfo method
    const walletInfo = await etherscanAPI.getWalletInfo(address);

    return NextResponse.json({
      success: true,
      data: {
        address: address.toLowerCase(),
        ethBalance: walletInfo.ethBalance,
        transactionCount: walletInfo.transactionCount,
        gasPrice: {
          wei: walletInfo.gasPrice,
          gwei: parseInt(walletInfo.gasPrice) / Math.pow(10, 9),
          formatted: `${(parseInt(walletInfo.gasPrice) / Math.pow(10, 9)).toFixed(2)} Gwei`
        },
        blockNumber: walletInfo.blockNumber,
        summary: {
          isActive: walletInfo.transactionCount > 0 || parseFloat(walletInfo.ethBalance.eth) > 0,
          totalTransactions: walletInfo.transactionCount,
          ethBalance: parseFloat(walletInfo.ethBalance.eth)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching wallet info:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch wallet information',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
