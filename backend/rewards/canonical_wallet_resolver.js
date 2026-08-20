'use strict';

const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');
const driverWalletService = require('../services/driver_wallet_service');

const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');
const DRIVERS_FILE = path.join(__dirname, '..', 'data', 'drivers.json');
const DRIVERS_LIVE_FILE = path.join(__dirname, '..', 'data', 'drivers_live.json');

const PLACEHOLDER_WALLETS = new Set([
  'TEST-WALLET',
  'API-TEST-WALLET',
  'PILOT-TEST-WALLET',
  'TEST_WALLET',
  'API_TEST_WALLET',
  'PILOT_TEST_WALLET',
  'PLACEHOLDER',
  'PLACEHOLDER-WALLET',
  'YOUR-WALLET',
  'YOUR_WALLET',
  'NULL',
  'UNDEFINED'
]);

function normaliseIdentity(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const result = String(value).trim();

  return result.length ? result : null;
}

function isPlaceholderWallet(value) {
  if (typeof value !== 'string') {
    return true;
  }

  const normalised = value.trim().toUpperCase();

  if (!normalised) {
    return true;
  }

  if (PLACEHOLDER_WALLETS.has(normalised)) {
    return true;
  }

  if (
    normalised.includes('TEST-WALLET') ||
    normalised.includes('TEST_WALLET') ||
    normalised.includes('PILOT-TEST') ||
    normalised.includes('PLACEHOLDER')
  ) {
    return true;
  }

  return false;
}

function validateWallet(value) {
  if (isPlaceholderWallet(value)) {
    return null;
  }

  const wallet = String(value).trim();

  if (!ethers.isAddress(wallet)) {
    return null;
  }

  return ethers.getAddress(wallet);
}

function readJson(file) {
  try {
    if (!fs.existsSync(file)) {
      return [];
    }

    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function findWalletInRecord(record) {
  if (!record || typeof record !== 'object') {
    return null;
  }

  const candidates = [
    record.wallet,
    record.walletAddress,
    record.wallet_address,
    record.address
  ];

  for (const candidate of candidates) {
    const validWallet = validateWallet(candidate);

    if (validWallet) {
      return validWallet;
    }
  }

  return null;
}

// PATCH 14: legacy fallback only. This used to be the ONLY place
// findLinkedWallet looked — flat JSON files that driver_wallet_api.js
// no longer writes to since patch 13. Kept as a read-only fallback so
// a wallet linked before that patch still resolves, but it is no
// longer the primary source.
function findLinkedWalletInLegacyFiles(id) {
  const sources = [
    readJson(USERS_FILE),
    readJson(DRIVERS_FILE),
    readJson(DRIVERS_LIVE_FILE)
  ];

  for (const records of sources) {
    for (const record of records) {
      if (!record || typeof record !== 'object') {
        continue;
      }

      if (
        String(record.id || '').trim() === id ||
        String(record.userId || '').trim() === id ||
        String(record.driverId || '').trim() === id
      ) {
        const wallet = findWalletInRecord(record);

        if (wallet) {
          return wallet;
        }
      }
    }
  }

  return null;
}

// PATCH 14: now async, and now checks the real, current wallet
// store (backend/services/driver_wallet_service.js — the same
// LOCAL/FIRESTORE dual-mode persistence driver_wallet_api.js
// writes to since patch 13) FIRST, before falling back to the old
// flat files for anything linked before that fix. This is the
// change that actually makes linked wallets visible to the reward
// pipeline again in production.
async function findLinkedWallet(identity) {
  const id = normaliseIdentity(identity);

  if (!id) {
    return null;
  }

  const current = await driverWalletService.getWallet(id);
  const validCurrent = validateWallet(current);

  if (validCurrent) {
    return validCurrent;
  }

  return findLinkedWalletInLegacyFiles(id);
}

/**
 * Canonical wallet resolution.
 *
 * Identity -> linked wallet -> validation -> canonical address
 *
 * Returns null when:
 * - identity is missing
 * - no linked wallet exists
 * - wallet is a placeholder
 * - wallet is not a valid EVM address
 *
 * The treasury wallet is deliberately NOT used as a fallback.
 *
 * PATCH 14: now async — see findLinkedWallet above. Every caller
 * of resolveWallet must now `await` it.
 */
async function resolveWallet(identity, suppliedWallet) {
  const linkedWallet = await findLinkedWallet(identity);

  if (linkedWallet) {
    return linkedWallet;
  }

  return validateWallet(suppliedWallet);
}

module.exports = {
  resolveWallet,
  validateWallet,
  isPlaceholderWallet,
  findLinkedWallet
};
