---
sidebar_position: 3
title: ERC20FlashMint 闪电贷
---

## 闪电贷

IERC3156 是一个关于闪电贷（Flash Loans）的以太坊改进提案（EIP），它定义了两个接口：`IERC3156FlashLender` 和 `IERC3156FlashBorrower`。这两个接口共同定义了闪电贷服务的标准化流程。在这个标准中，`IERC3156FlashLender` 是指能够提供闪电贷的实体，而 `IERC3156FlashBorrower` 是指希望借入资金并能够在同一个交易中还款的实体。

### 闪电贷的工作流程

1. **借款者发起贷款：** 借款者（实现了 `IERC3156FlashBorrower` 接口的合约）调用贷款者合约（实现了 `IERC3156FlashLender` 接口）的 `flashLoan` 方法，请求借款。
2. **贷款者提供资金：** 贷款者合约转移资金给借款者，并调用借款者的 `onFlashLoan` 方法。
3. **借款者使用资金：** 在 `onFlashLoan` 方法中，借款者可以使用这些资金进行各种操作，如套利、提供流动性等。
4. **借款者还款：** 借款者必须在 `onFlashLoan` 方法结束之前将借入的资金加上费用一起还给贷款者。
5. **验证还款：** 贷款者在 `flashLoan` 方法结束前验证借款者是否已经完全还款。

如果借款者未能在同一交易中还款，贷款者将会回滚整个交易，这意味着资金从未真正离开过贷款者的控制。

这种机制允许市场参与者无需提供抵押即可借入大量资金，同时也确保了贷款者的资金安全。闪电贷是去中心化金融（DeFi）领域的一个创新工具，它为套利、自动化市场做市（AMM）以及其他金融策略提供了可能。

### IERC3156FlashLender

`IERC3156FlashLender` 接口定义了一个能够提供闪电贷的贷款者。这个接口主要负责：

- 告知借款者可以借多少资金（`maxFlashLoan`）。
- 告知借款者借款的费用（`flashFee`）。
- 执行贷款操作，将资金借给借款者（`flashLoan`）。

通过这个接口，贷款者可以控制哪些资产可以被借出，以及每次闪电贷的最大数量。它还能够收取一定的费用，作为提供资金的报酬。

```solidity
// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (interfaces/IERC3156FlashLender.sol)

pragma solidity ^0.8.20;

import {IERC3156FlashBorrower} from "./IERC3156FlashBorrower.sol";

/**
 * @dev Interface of the ERC-3156 FlashLender, as defined in
 * https://eips.ethereum.org/EIPS/eip-3156[ERC-3156].
 */
interface IERC3156FlashLender {
    /**
     * @dev The amount of currency available to be lended.
     * @param token The loan currency.
     * @return The amount of `token` that can be borrowed.
     */
    function maxFlashLoan(address token) external view returns (uint256);

    /**
     * @dev The fee to be charged for a given loan.
     * @param token The loan currency.
     * @param amount The amount of tokens lent.
     * @return The amount of `token` to be charged for the loan, on top of the returned principal.
     */
    function flashFee(address token, uint256 amount) external view returns (uint256);

    /**
     * @dev Initiate a flash loan.
     * @param receiver The receiver of the tokens in the loan, and the receiver of the callback.
     * @param token The loan currency.
     * @param amount The amount of tokens lent.
     * @param data Arbitrary data structure, intended to contain user-defined parameters.
     */
    function flashLoan(
        IERC3156FlashBorrower receiver,
        address token,
        uint256 amount,
        bytes calldata data
    ) external returns (bool);
}
```

### IERC3156FlashBorrower

`IERC3156FlashBorrower` 接口定义了一个借款者，它希望从贷款者那里借入资金。这个接口主要包含：

- 一个回调函数，贷款者在提供资金给借款者后会调用这个函数（`onFlashLoan`）。

当借款者接收到资金后，它必须在同一个区块交易中还款，包括借款的本金和费用。`onFlashLoan` 回调函数是借款者接收、使用并还款资金的地方。

```solidity
// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (interfaces/IERC3156FlashBorrower.sol)

pragma solidity ^0.8.20;

/**
 * @dev Interface of the ERC-3156 FlashBorrower, as defined in
 * https://eips.ethereum.org/EIPS/eip-3156[ERC-3156].
 */
interface IERC3156FlashBorrower {
    /**
     * @dev Receive a flash loan.
     * @param initiator The initiator of the loan.
     * @param token The loan currency.
     * @param amount The amount of tokens lent.
     * @param fee The additional amount of tokens to repay.
     * @param data Arbitrary data structure, intended to contain user-defined parameters.
     * @return The keccak256 hash of "ERC3156FlashBorrower.onFlashLoan"
     */
    function onFlashLoan(
        address initiator,
        address token,
        uint256 amount,
        uint256 fee,
        bytes calldata data
    ) external returns (bytes32);
}
```

### ERC20FlashMint

```solidity
// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC20/extensions/ERC20FlashMint.sol)

pragma solidity ^0.8.20;

import {IERC3156FlashBorrower} from "../../../interfaces/IERC3156FlashBorrower.sol";
import {IERC3156FlashLender} from "../../../interfaces/IERC3156FlashLender.sol";
import {ERC20} from "../ERC20.sol";

/**
 * @dev Implementation of the ERC-3156 Flash loans extension, as defined in
 * https://eips.ethereum.org/EIPS/eip-3156[ERC-3156].
 *
 * Adds the {flashLoan} method, which provides flash loan support at the token
 * level. By default there is no fee, but this can be changed by overriding {flashFee}.
 *
 * NOTE: When this extension is used along with the {ERC20Capped} or {ERC20Votes} extensions,
 * {maxFlashLoan} will not correctly reflect the maximum that can be flash minted. We recommend
 * overriding {maxFlashLoan} so that it correctly reflects the supply cap.
 */
abstract contract ERC20FlashMint is ERC20, IERC3156FlashLender {
    bytes32 private constant RETURN_VALUE = keccak256("ERC3156FlashBorrower.onFlashLoan");

    /**
     * @dev The loan token is not valid.
     */
    error ERC3156UnsupportedToken(address token);

    /**
     * @dev The requested loan exceeds the max loan value for `token`.
     */
    error ERC3156ExceededMaxLoan(uint256 maxLoan);

    /**
     * @dev The receiver of a flashloan is not a valid {onFlashLoan} implementer.
     */
    error ERC3156InvalidReceiver(address receiver);

    /**
     * @dev Returns the maximum amount of tokens available for loan.
     * @param token The address of the token that is requested.
     * @return The amount of token that can be loaned.
     *
     * NOTE: This function does not consider any form of supply cap, so in case
     * it's used in a token with a cap like {ERC20Capped}, make sure to override this
     * function to integrate the cap instead of `type(uint256).max`.
     */
    function maxFlashLoan(address token) public view virtual returns (uint256) {
        return token == address(this) ? type(uint256).max - totalSupply() : 0;
    }

    /**
     * @dev Returns the fee applied when doing flash loans. This function calls
     * the {_flashFee} function which returns the fee applied when doing flash
     * loans.
     * @param token The token to be flash loaned.
     * @param value The amount of tokens to be loaned.
     * @return The fees applied to the corresponding flash loan.
     */
    function flashFee(address token, uint256 value) public view virtual returns (uint256) {
        if (token != address(this)) {
            revert ERC3156UnsupportedToken(token);
        }
        return _flashFee(token, value);
    }

    /**
     * @dev Returns the fee applied when doing flash loans. By default this
     * implementation has 0 fees. This function can be overloaded to make
     * the flash loan mechanism deflationary.
     * @param token The token to be flash loaned.
     * @param value The amount of tokens to be loaned.
     * @return The fees applied to the corresponding flash loan.
     */
    function _flashFee(address token, uint256 value) internal view virtual returns (uint256) {
        // silence warning about unused variable without the addition of bytecode.
        token;
        value;
        return 0;
    }

    /**
     * @dev Returns the receiver address of the flash fee. By default this
     * implementation returns the address(0) which means the fee amount will be burnt.
     * This function can be overloaded to change the fee receiver.
     * @return The address for which the flash fee will be sent to.
     */
    function _flashFeeReceiver() internal view virtual returns (address) {
        return address(0);
    }

    /**
     * @dev Performs a flash loan. New tokens are minted and sent to the
     * `receiver`, who is required to implement the {IERC3156FlashBorrower}
     * interface. By the end of the flash loan, the receiver is expected to own
     * value + fee tokens and have them approved back to the token contract itself so
     * they can be burned.
     * @param receiver The receiver of the flash loan. Should implement the
     * {IERC3156FlashBorrower-onFlashLoan} interface.
     * @param token The token to be flash loaned. Only `address(this)` is
     * supported.
     * @param value The amount of tokens to be loaned.
     * @param data An arbitrary datafield that is passed to the receiver.
     * @return `true` if the flash loan was successful.
     */
    // This function can reenter, but it doesn't pose a risk because it always preserves the property that the amount
    // minted at the beginning is always recovered and burned at the end, or else the entire function will revert.
    // slither-disable-next-line reentrancy-no-eth
    function flashLoan(
        IERC3156FlashBorrower receiver,
        address token,
        uint256 value,
        bytes calldata data
    ) public virtual returns (bool) {
        uint256 maxLoan = maxFlashLoan(token);
        if (value > maxLoan) {
            revert ERC3156ExceededMaxLoan(maxLoan);
        }
        uint256 fee = flashFee(token, value);
        _mint(address(receiver), value);
        if (receiver.onFlashLoan(_msgSender(), token, value, fee, data) != RETURN_VALUE) {
            revert ERC3156InvalidReceiver(address(receiver));
        }
        address flashFeeReceiver = _flashFeeReceiver();
        _spendAllowance(address(receiver), address(this), value + fee);
        if (fee == 0 || flashFeeReceiver == address(0)) {
            _burn(address(receiver), value + fee);
        } else {
            _burn(address(receiver), value);
            _transfer(address(receiver), flashFeeReceiver, fee);
        }
        return true;
    }
}
```

### 闪电贷怎么涉及到造币和销毁？

在传统的金融或加密货币交易中，借款通常确实是通过转账现有资金来完成的。然而，在闪电贷的上下文中，铸造代币而不是转账现有代币有几个关键原因：

1. **资金池的限制**：如果借款是基于现有资金池的转账，那么借款金额将受到资金池大小的限制。这意味着，如果资金池中的资金不足，大额的闪电贷将无法进行。通过铸造代币，理论上可以借出任何数量的代币，只要在交易结束时能够完全偿还。

2. **资金利用率**：如果使用转账，那么资金池中的资金在没有被借出时将处于非活跃状态。通过铸造代币，只有在需要时才创建新的代币，这样可以提高资金的利用率。

3. **无需预存资金**：对于合约的维护者来说，不需要预先存入大量资金到合约中，因为铸造是按需进行的。这降低了维护合约所需的资本，并且降低了资金被盗的风险。

4. **简化操作**：铸造和销毁代币可以确保闪电贷前后代币供应量的一致性。如果使用转账，那么合约还必须管理和跟踪借贷关系，以及确保资金的来源和归还。

5. **合约编程逻辑**：在智能合约中，铸造新代币通常比转移现有代币更简单，因为它不需要检查合约余额或处理潜在的资金不足问题。借款人必须确保在同一个交易中还款，否则整个交易会被回滚。

6. **风险管理**：通过闪电贷铸造代币，可以确保只有在借款人能够在同一交易中偿还借款和费用的情况下才能成功借款。这种机制内置了风险管理，因为如果借款人未能偿还，交易将自动回滚，代币供应量不会被永久改变。

总的来说，闪电贷中的铸造操作允许闪电贷系统灵活地提供大量资金，而不会受到现有资金池大小的限制，也不需要合约维护者预存大量资金。这种设计使得闪电贷可以在没有实际持有等量资金的情况下运作，只要确保在交易结束时所有新铸造的代币都能被销毁，以维护代币的总供应量不变。

### 比如闪电贷，贷的是 USDT，贷出的人是如何有权力铸造 USDT 给借款人的？

DAI 是由 MakerDAO 系统发行的一种去中心化稳定币，其价值主要与美元挂钩，也就是说，1 DAI 大致等于 1 美元的价值。这种挂钩是通过一系列复杂的智能合约和去中心化的自治组织（DAO）来维持的，其中关键的机制是抵押。用户通过抵押超过 DAI 价值的加密货币（如以太坊 ETH）来铸造 DAI，如果抵押的资产价值下跌到一定比例，这些资产将会被自动清算以确保 DAI 的稳定性。

DAI 之所以被认为有价值，是因为它背后有实际的加密资产作为抵押，并且有一个广泛认可的框架来维护其与美元的 1:1 价值关系。此外，DAI 的去中心化特性和其稳定性使其在加密货币市场中受到青睐，常被用作交易和储值的媒介。

借款人可能会出于多种原因借用 DAI 代币：

1. **交易和套利**：借款人可以使用闪电贷借入 DAI 进行无风险套利，例如在不同的交易所或不同的 DeFi 协议之间利用价格差异来赚取利润。

2. **杠杆投资**：通过借入 DAI，投资者可以增加他们的投资头寸，从而放大潜在的收益（同时也放大风险）。

3. **流动性挖矿**：借款人可能会使用借来的 DAI 参与其他 DeFi 平台的流动性挖矿或农场种植活动，从而赚取交易费和代币奖励。

4. **避免卖出持有资产**：如果用户需要流动性但不想卖出他们持有的加密资产，他们可以借用 DAI 来满足短期资金需求。

5. **偿还债务**：如果借款人在其他地方有债务，他们可能会通过闪电贷借入 DAI 来快速偿还，尤其是在他们预计很快能够用其他方式偿还这笔借入的 DAI 时。

6. **支付费用**：在某些情况下，借款人可能需要支付费用（如智能合约的操作费），而借入 DAI 可以让他们在不出售自己的资产的情况下支付这些费用。

7. **自动化策略**：某些复杂的金融策略可能需要借入稳定币来执行，比如在自动化的交易策略或金融产品中。

DAI 之所以受到重视，是因为它提供了一种稳定而可预测的价值存储方式，这在加密货币这个高波动性的市场中非常有吸引力。

### 意思是 DAI 这种代币的价值是公认的有价值的，借款人通过抵押进行铸造 DAI，使用后归还，销毁 DAI？

是的，DAI 代币的价值在加密货币市场上是被公认的，并且与美元保持大致 1:1 的价值关系。这种稳定性主要是通过抵押和智能合约机制实现的。具体来说，DAI 的生命周期通常包括以下几个步骤：

1. **抵押**：用户将加密资产（如以太坊 ETH）存入 MakerDAO 系统的智能合约中，作为抵押品。

2. **铸造 DAI**：用户通过智能合约铸造 DAI，数量通常是低于其抵押资产市值的一定比例（这称为超额抵押）。

3. **使用 DAI**：用户可以自由地使用这些 DAI，比如进行交易、支付、投资或者其他任何需要稳定币的场合。

4. **归还 DAI 并解除抵押**：当用户想要取回他们抵押的资产时，他们需要归还等同于他们铸造出来的 DAI 数量加上一定的稳定费（这是系统的利息）。一旦 DAI 被归还，相应数量的 DAI 会被销毁。

5. **销毁 DAI**：归还 DAI 并不是简单地把代币转移给某个人或实体，而是通过智能合约将这些 DAI“烧毁”或销毁，从而从流通中移除，确保总量的稳定。

通过这种机制，DAI 的供应量能够根据市场的需求和抵押资产的价值自适应调整，同时保持其与美元的价值锚定。这种设计允许 DAI 作为一种去中心化的稳定币存在，并在加密货币市场中得到广泛应用。
