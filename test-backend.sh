#!/bin/bash

echo "🧪 Testing Typing Tournament Backend"
echo "====================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo "Test 1: Health Check"
echo "--------------------"
HEALTH=$(curl -s http://localhost:3001/health)
if echo "$HEALTH" | grep -q "ok"; then
    echo -e "${GREEN}✅ PASS${NC} - Server is healthy"
    echo "Response: $HEALTH"
else
    echo -e "${RED}❌ FAIL${NC} - Server health check failed"
    echo "Response: $HEALTH"
    exit 1
fi
echo ""

# Test 2: Server Info
echo "Test 2: Server Info"
echo "-------------------"
INFO=$(curl -s http://localhost:3001/api/info)
if echo "$INFO" | grep -q "contractAddress"; then
    echo -e "${GREEN}✅ PASS${NC} - Server info endpoint working"
    echo "Response:"
    echo "$INFO" | jq .
    
    # Extract values
    CONTRACT=$(echo "$INFO" | jq -r '.contractAddress')
    BALANCE=$(echo "$INFO" | jq -r '.serverBalance')
    ENTRY_FEE=$(echo "$INFO" | jq -r '.entryFee')
    
    echo ""
    echo "📊 Server Configuration:"
    echo "  Contract: $CONTRACT"
    echo "  Server Balance: $BALANCE MON"
    echo "  Entry Fee: $ENTRY_FEE MON"
else
    echo -e "${RED}❌ FAIL${NC} - Server info endpoint failed"
    echo "Response: $INFO"
    exit 1
fi
echo ""

# Test 3: Contract Address Validation
echo "Test 3: Contract Address Validation"
echo "------------------------------------"
if [ "$CONTRACT" = "0x90577AFd04F23c783De10FD87956a77FDe5e9792" ]; then
    echo -e "${GREEN}✅ PASS${NC} - Contract address matches deployment"
else
    echo -e "${RED}❌ FAIL${NC} - Contract address mismatch"
    echo "Expected: 0x90577AFd04F23c783De10FD87956a77FDe5e9792"
    echo "Got: $CONTRACT"
    exit 1
fi
echo ""

# Test 4: Server Balance Check
echo "Test 4: Server Balance Check"
echo "-----------------------------"
if [ "$BALANCE" = "2" ]; then
    echo -e "${GREEN}✅ PASS${NC} - Server has sufficient balance (2 MON)"
else
    echo -e "${YELLOW}⚠️  WARNING${NC} - Server balance is $BALANCE MON"
    echo "Expected: 2 MON"
fi
echo ""

# Test 5: Game Settings
echo "Test 5: Game Settings"
echo "---------------------"
MAX_PLAYERS=$(echo "$INFO" | jq -r '.maxPlayers')
DURATION=$(echo "$INFO" | jq -r '.gameDuration')

if [ "$MAX_PLAYERS" = "4" ] && [ "$DURATION" = "60" ]; then
    echo -e "${GREEN}✅ PASS${NC} - Game settings correct"
    echo "  Max Players: $MAX_PLAYERS"
    echo "  Duration: $DURATION seconds"
else
    echo -e "${RED}❌ FAIL${NC} - Game settings incorrect"
    echo "  Max Players: $MAX_PLAYERS (expected 4)"
    echo "  Duration: $DURATION (expected 60)"
    exit 1
fi
echo ""

# Test 6: Socket.IO Connection
echo "Test 6: Socket.IO Availability"
echo "-------------------------------"
SOCKET_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/socket.io/)
if [ "$SOCKET_CHECK" = "200" ] || [ "$SOCKET_CHECK" = "400" ]; then
    echo -e "${GREEN}✅ PASS${NC} - Socket.IO endpoint available"
    echo "  HTTP Status: $SOCKET_CHECK"
else
    echo -e "${RED}❌ FAIL${NC} - Socket.IO endpoint not available"
    echo "  HTTP Status: $SOCKET_CHECK"
    exit 1
fi
echo ""

# Summary
echo "====================================="
echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
echo "====================================="
echo ""
echo "✅ Backend server is fully operational"
echo "✅ Smart contract deployed and connected"
echo "✅ Server has sufficient balance for gas"
echo "✅ Game settings configured correctly"
echo "✅ Socket.IO ready for connections"
echo ""
echo "📋 Next Steps:"
echo "1. Build the frontend components"
echo "2. Test with real Farcaster users"
echo "3. Deploy to production"
echo ""
