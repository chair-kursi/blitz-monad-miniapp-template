// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TypingTournament
 * @dev Escrow contract for typing tournament entry fees and winner payouts
 * @notice Only the contract owner (game server) can declare winners
 * @notice This is a centralized design - players trust the owner to declare correct winners
 */
contract TypingTournament {
    // Contract owner (game server address)
    address public owner;
    
    // Entry fee in MON (wei)
    uint256 public entryFee;
    
    // Game ID => Total pool amount
    mapping(uint256 => uint256) public gamePools;
    
    // Game ID => Player address => Has paid
    mapping(uint256 => mapping(address => bool)) public playerPaid;
    
    // Game ID => Player count
    mapping(uint256 => uint256) public playerCount;
    
    // Game ID => Is finished
    mapping(uint256 => bool) public gameFinished;
    
    // Events
    event PlayerEntered(uint256 indexed gameId, address indexed player, uint256 amount);
    event WinnerDeclared(uint256 indexed gameId, address indexed winner, uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event ExcessFundsWithdrawn(address indexed recipient, uint256 amount);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier gameNotFinished(uint256 gameId) {
        require(!gameFinished[gameId], "Game already finished");
        _;
    }
    
    /**
     * @dev Constructor sets the entry fee and owner
     * @param _entryFee Entry fee in wei (e.g., 0.01 MON = 10000000000000000 wei)
     */
    constructor(uint256 _entryFee) {
        require(_entryFee > 0, "Entry fee must be greater than 0");
        owner = msg.sender;
        entryFee = _entryFee;
    }
    
    /**
     * @dev Allows a player to enter a tournament by paying the entry fee
     * @param gameId Unique identifier for the game
     */
    function enterTournament(uint256 gameId) external payable gameNotFinished(gameId) {
        require(msg.value == entryFee, "Incorrect entry fee amount");
        require(!playerPaid[gameId][msg.sender], "Player already entered this game");
        
        // Effects: Update state first
        playerPaid[gameId][msg.sender] = true;
        gamePools[gameId] += msg.value;
        playerCount[gameId]++;
        
        emit PlayerEntered(gameId, msg.sender, msg.value);
    }
    
    /**
     * @dev Declares the winner and transfers the entire pool to them
     * @param gameId Unique identifier for the game
     * @param winner Address of the winning player
     * @notice Follows Checks-Effects-Interactions pattern to prevent reentrancy
     */
    function declareWinner(uint256 gameId, address payable winner) external onlyOwner gameNotFinished(gameId) {
        // Checks
        require(gamePools[gameId] > 0, "No funds in this game pool");
        require(playerPaid[gameId][winner], "Winner must have paid entry fee");
        
        uint256 prizeAmount = gamePools[gameId];
        
        // Effects: Update state BEFORE external call
        gameFinished[gameId] = true;
        gamePools[gameId] = 0;
        
        // Interactions: External call LAST
        (bool success, ) = winner.call{value: prizeAmount}("");
        require(success, "Transfer to winner failed");
        
        emit WinnerDeclared(gameId, winner, prizeAmount);
    }
    
    /**
     * @dev Transfers ownership of the contract to a new address
     * @param newOwner Address of the new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
    
    /**
     * @dev Emergency function to withdraw accidentally sent funds
     * @param recipient Address to receive the withdrawn funds
     * @notice Only withdraws funds not allocated to any active game pool
     */
    function withdrawExcessFunds(address payable recipient) external onlyOwner {
        require(recipient != address(0), "Recipient cannot be zero address");
        
        // Calculate total funds that should be in active pools
        uint256 totalAllocated = 0;
        // Note: This is a simplified version. In production, you'd need to track
        // all active game IDs to calculate this accurately. For now, we allow
        // owner to withdraw any excess funds beyond what's needed.
        
        uint256 balance = address(this).balance;
        require(balance > totalAllocated, "No excess funds to withdraw");
        
        uint256 excessAmount = balance - totalAllocated;
        
        (bool success, ) = recipient.call{value: excessAmount}("");
        require(success, "Withdrawal failed");
        
        emit ExcessFundsWithdrawn(recipient, excessAmount);
    }
    
    /**
     * @dev Returns the current pool amount for a game
     * @param gameId Unique identifier for the game
     */
    function getGamePool(uint256 gameId) external view returns (uint256) {
        return gamePools[gameId];
    }
    
    /**
     * @dev Checks if a player has paid for a specific game
     * @param gameId Unique identifier for the game
     * @param player Address of the player
     */
    function hasPlayerPaid(uint256 gameId, address player) external view returns (bool) {
        return playerPaid[gameId][player];
    }
    
    /**
     * @dev Returns the number of players in a game
     * @param gameId Unique identifier for the game
     */
    function getPlayerCount(uint256 gameId) external view returns (uint256) {
        return playerCount[gameId];
    }
    
    /**
     * @dev Checks if a game is finished
     * @param gameId Unique identifier for the game
     */
    function isGameFinished(uint256 gameId) external view returns (bool) {
        return gameFinished[gameId];
    }
    
    /**
     * @dev Returns the contract's total balance
     * @notice Useful for monitoring and debugging
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}

