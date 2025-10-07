/**
 * Utility Functions - Common Helper Functions
 * 
 * This file contains common utility functions used throughout the application.
 * It provides reusable helper functions for styling, formatting, and other common operations.
 * 
 * @author Sniffer Web3 Team
 * @version 1.0.0
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines and merges CSS class names using clsx and tailwind-merge
 * 
 * This utility function combines multiple class values and intelligently merges
 * Tailwind CSS classes, resolving conflicts and removing duplicates.
 * 
 * @param {...ClassValue[]} inputs - Variable number of class values to combine
 * @returns {string} Merged and optimized class string
 * 
 * @example
 * cn('px-4 py-2', 'px-6', 'bg-blue-500') // Returns: 'py-2 px-6 bg-blue-500'
 * cn('text-red-500', { 'text-blue-500': true }) // Returns: 'text-blue-500'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

