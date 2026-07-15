# CabLink Architecture

## Frontend

Responsible for:
- Passenger interface
- Driver interface
- Ride state display
- Wallet UI
- GPS UI

## Backend

Responsible for:
- Ride lifecycle
- Driver management
- Dispatch
- Payments
- Rewards
- Blockchain

## Core Ride Flow

BOOKED
 ↓
ACCEPTED
 ↓
ARRIVING
 ↓
PICKED_UP
 ↓
STARTED
 ↓
COMPLETED
 ↓
SETTLEMENT
 ↓
REWARD

## Principle

One responsibility per module.
One source of truth per domain.
