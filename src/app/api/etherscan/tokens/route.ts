/**
 * Etherscan Tokens API Route - Server-Side Proxy (V2 API)
 * 
 * This Next.js API route acts as a server-side proxy to the Etherscan V2 API
 * for Base blockchain (Chain ID: 8453), handling token balance and transfer 
 * requests while bypassing CORS restrictions.
 * 
 * Uses Etherscan V2 unified API with Base chain ID: 8453
 * @see https://docs.etherscan.io/ - Etherscan V2 API Documentation
 * 
 * Endpoint: GET /api/etherscan/tokens?address={address}&type={balances|transfers}
 * 
 * @author Sniffer Web3 Team
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { etherscanAPI } from '@/lib/etherscan';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  try {
    const address = searchParams.get('address');
    const type = searchParams.get('type') || 'balances'; // 'balances' or 'transfers'
    const page = parseInt(searchParams.get('page') || '1');
    const offset = parseInt(searchParams.get('offset') || '10');

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      );
    }

    console.log(`Fetching ${type} for address:`, address);

    let data;
    let formattedData;

    if (type === 'balances') {
      data = await etherscanAPI.getTokenBalances(address);
      formattedData = data.map(balance => ({
        contractAddress: balance.contractAddress,
        tokenName: balance.tokenName,
        tokenSymbol: balance.tokenSymbol,
        tokenDecimal: parseInt(balance.tokenDecimal),
        balance: balance.balance,
        balanceFormatted: parseFloat(balance.balance) / Math.pow(10, parseInt(balance.tokenDecimal))
      }));
    } else if (type === 'transfers') {
      data = await etherscanAPI.getTokenTransfers(address, page, offset);
      formattedData = data.map(transfer => 
        etherscanAPI.formatTokenTransfer(transfer)
      );
    } else {
      return NextResponse.json(
        { error: 'Invalid type parameter. Use "balances" or "transfers"' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: formattedData,
      type,
      pagination: type === 'transfers' ? {
        page,
        offset,
        total: formattedData.length
      } : undefined
    });

  } catch (error) {
    console.error(`Error fetching ${searchParams.get('type')}:`, error);
    return NextResponse.json(
      { 
        success: false,
        error: `Failed to fetch ${searchParams.get('type')}`,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
