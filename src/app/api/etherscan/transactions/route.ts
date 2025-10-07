/**
 * Etherscan Transactions API Route - Server-Side Proxy (V2 API)
 * 
 * This Next.js API route acts as a server-side proxy to the Etherscan V2 API
 * for Base blockchain (Chain ID: 8453), handling transaction requests while 
 * bypassing CORS restrictions.
 * 
 * Uses Etherscan V2 unified API with Base chain ID: 8453
 * @see https://docs.etherscan.io/ - Etherscan V2 API Documentation
 * 
 * Endpoint: GET /api/etherscan/transactions?address={address}&page={page}&offset={offset}
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
    const page = parseInt(searchParams.get('page') || '1');
    const offset = parseInt(searchParams.get('offset') || '10');
    // const startBlock = parseInt(searchParams.get('startBlock') || '0');
    // const endBlock = parseInt(searchParams.get('endBlock') || '99999999');
    // const sort = searchParams.get('sort') || 'desc';

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      );
    }

    console.log('Fetching transactions for address:', address);

    const transactions = await etherscanAPI.getAccountTransactions(address, offset);

    // Format transactions for display
    const formattedTransactions = transactions.map(tx => 
      etherscanAPI.formatTransaction(tx)
    );

    return NextResponse.json({
      success: true,
      data: formattedTransactions,
      pagination: {
        page,
        offset,
        total: formattedTransactions.length
      }
    });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch transactions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
