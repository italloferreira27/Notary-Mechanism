// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

error CallerNotBridge();
error NotEnoughStake();
error AlreadyBlacklisted();
error AlreadyExecuted();
error Locked();

contract Notary {
    using SafeERC20 for IERC20;

    uint256 public constant LOCK_PERIOD = 60; // 60 seconds
    
    // CORREÇÃO 1: Ajustado para 6 casas decimais (Padrão USDT/USDC)
    // 10 * 10^6 = 10 USDT. Antes era 10^18 (10 trilhões de USDT)
    uint256 public constant MINIMUM_STAKE_AMOUNT = 10 * 10**6; 
    
    // CORREÇÃO 2: Taxa reduzida para 1% (5% é muito alto para stablecoins)
    uint256 public constant BRIDGE_FEE_PERCENTAGE = 1;
    uint256 public constant HUNDRED = 100;

    uint256 public lastDepositID;
    uint256 public totalStaked;
    IERC20 public token;

    mapping(address => uint256) public stakes;
    mapping(address => uint256) public blacklistVotes;
    mapping(address => uint256) public lockedUntil;
    mapping(uint256 => bool) public executedDeposits;

    event Deposit(uint256 indexed depositID, address indexed sender, address indexed receiver, uint256 amount);
    event ExecuteBridge(uint256 indexed depositID, address indexed node, address indexed receiver, uint256 amount);
    event Stake(address indexed sender, uint256 indexed amount);
    event Unstake(address indexed sender, uint256 indexed amount);
    event VoteToBlacklistNode(address indexed voter, address indexed node);

    modifier onlyBridgeNode() {
        if (stakes[msg.sender] < MINIMUM_STAKE_AMOUNT) { // Segurança extra
            revert CallerNotBridge();
        }
        _;
    }

    constructor(address tokenAddress) {
        // Verifica se o endereço não é zero para evitar erro no deploy
        require(tokenAddress != address(0), "Endereco invalido");
        token = IERC20(tokenAddress);
    }

    function deposit(uint256 amount, address receiver) external {
        // Segurança: O usuário precisa aprovar o token antes
        token.safeTransferFrom(msg.sender, address(this), amount);
        lastDepositID++;
        emit Deposit(lastDepositID, msg.sender, receiver, amount);
    }

    function executeBridge(
        uint256 originChainDepositID,
        address receiver,
        uint256 amount
    ) external onlyBridgeNode {
        if (executedDeposits[originChainDepositID]) {
            revert AlreadyExecuted();
        }

        if (lockedUntil[msg.sender] > block.timestamp) {
            revert Locked();
        }

        // CORREÇÃO 3: Ajuste de colateral. 
        // Antes exigia 10x o valor da transação (ineficiente).
        // Agora exige que o stake seja pelo menos IGUAL ao valor transacionado.
        if (amount > stakes[msg.sender]) { 
            revert NotEnoughStake();
        }

        uint256 fee = (amount * BRIDGE_FEE_PERCENTAGE) / HUNDRED;
        uint256 amountAfterFee = amount - fee;

        executedDeposits[originChainDepositID] = true;
        lockedUntil[msg.sender] = block.timestamp + LOCK_PERIOD;

        token.safeTransfer(receiver, amountAfterFee);
        token.safeTransfer(msg.sender, fee); // Paga a taxa ao nó
        
        emit ExecuteBridge(originChainDepositID, msg.sender, receiver, amount);
    }

    function stake(uint256 amount) external {
        // Permite stake acumulativo, mas verifica mínimo apenas na primeira vez ou no total
        token.safeTransferFrom(msg.sender, address(this), amount);
        stakes[msg.sender] += amount;
        totalStaked += amount;
        
        if (stakes[msg.sender] < MINIMUM_STAKE_AMOUNT) {
             revert NotEnoughStake();
        }

        emit Stake(msg.sender, amount);
    }

    function unstake(uint256 amount) external {
        if (amount > stakes[msg.sender]) {
            revert NotEnoughStake();
        }
        if (lockedUntil[msg.sender] > block.timestamp) {
            revert Locked();
        }

        stakes[msg.sender] -= amount;
        totalStaked -= amount;
        token.safeTransfer(msg.sender, amount);
        emit Unstake(msg.sender, amount);
    }

    function voteToBlacklistNode(address node) external onlyBridgeNode {
        if (stakes[node] == 0) revert AlreadyBlacklisted();

        blacklistVotes[node] += stakes[msg.sender];
        
        // Se mais de 50% do total votou, pune o nó
        if (blacklistVotes[node] > totalStaked / 2) {
            stakes[node] = 0; // CUIDADO: Isso queima o dinheiro do nó (centralização perigosa)
        }
        emit VoteToBlacklistNode(msg.sender, node);
    }
}