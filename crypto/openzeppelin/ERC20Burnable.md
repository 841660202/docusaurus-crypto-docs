---
sidebar_position: 11
title: ERC20Burnable
---

## ERC20Burnable.sol

```solidity title="contracts/token/ERC20/extensions/ERC20Burnable.sol"
// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC20/extensions/ERC20Burnable.sol)

pragma solidity ^0.8.20;

import {ERC20} from "../ERC20.sol";
import {Context} from "../../../utils/Context.sol";

/**
 * @dev Extension of {ERC20} that allows token holders to destroy both their own
 * tokens and those that they have an allowance for, in a way that can be
 * recognized off-chain (via event analysis).
 */
abstract contract ERC20Burnable is Context, ERC20 {
    /**
     * @dev Destroys a `value` amount of tokens from the caller.
     *
     * See {ERC20-_burn}.
     */
    function burn(uint256 value) public virtual {
        _burn(_msgSender(), value);
    }

    /**
     * @dev Destroys a `value` amount of tokens from `account`, deducting from
     * the caller's allowance.
     *
     * See {ERC20-_burn} and {ERC20-allowance}.
     *
     * Requirements:
     *
     * - the caller must have allowance for ``accounts``'s tokens of at least
     * `value`.
     */
    function burnFrom(address account, uint256 value) public virtual {
        _spendAllowance(account, _msgSender(), value);
        _burn(account, value);
    }
}
```

## 解释代码

这段代码定义了一个名为 `ERC20Burnable` 的智能合约，它是 `ERC20` 标准代币的一个扩展。这个扩展允许代币持有者销毁（燃烧）他们自己的代币以及他们有权使用的代币。代币的销毁会减少流通中的代币总量，这种行为能够通过链下的事件分析（event analysis）被识别和验证。

以下是代码的具体解释：

- `abstract contract ERC20Burnable`：声明了一个抽象合约 `ERC20Burnable`，这意味着它不能直接部署，而是需要被其他合约继承并实现其方法。

- `is Context, ERC20`：合约继承自 `Context` 和 `ERC20` 合约。`Context` 合约提供了 `_msgSender()` 函数，用于获取当前函数调用的发送者地址。`ERC20` 是实现了 ERC-20 代币标准的基础合约。

- `function burn(uint256 value) public virtual`：这是一个公开的函数，任何人都可以调用来销毁其持有的代币。参数 `value` 指定了要销毁的代币数量。关键字 `virtual` 表示这个函数可以在子合约中被重写（override）。

- `_burn(_msgSender(), value)`：调用了 `ERC20` 合约中定义的内部 `_burn` 函数，销毁调用者（`_msgSender()`）持有的 `value` 数量的代币。

- `function burnFrom(address account, uint256 value) public virtual`：这是另一个公开函数，它允许调用者销毁他们有权使用的代币，即那些被代币持有者授权给调用者的代币。参数 `account` 是代币持有者的地址，`value` 是要销毁的代币数量。

- `_spendAllowance(account, _msgSender(), value)`：在销毁之前，此函数首先调用 `_spendAllowance` 函数来检查并更新调用者被授权的代币数量。这确保了调用者不能销毁超过他们被授权的数量。

- `_burn(account, value)`：如果调用者有足够的授权，`_burn` 函数被调用来从指定账户 `account` 销毁 `value` 数量的代币。

总体而言，`ERC20Burnable` 合约提供了两种销毁代币的方法：一种是代币持有者可以直接销毁自己的代币，另一种是代币持有者可以允许其他人销毁一定数量的代币。这些操作都会触发相应的事件，这些事件可以被链下服务监控以便追踪代币的销毁行为。

## Context.sol

```solidity title="contracts/utils/Context.sol"
// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.1) (utils/Context.sol)

pragma solidity ^0.8.20;

/** * @dev 提供有关当前执行上下文的信息，包括
 * 交易及其数据的发送者。虽然这些都是普遍可用的
 * 通过 msg.sender 和 msg.data，不应该以这样的方式直接访问它们
 * 方式，因为在处理元交易时，帐户发送和
 * 支付执行费用可能不是实际的发送者（就应用程序而言）
 * 此合同仅适用于中间类库合同。
 * */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
    // chatgpt说这个没有用
    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}
```

## ERC-165 与 ERC-1363

ERC-165 和 ERC-1363 都是以太坊智能合约的标准接口，但它们服务于不同的目的。

### ERC-165: 标准接口检测

**ERC-165** 是一种标准化方法，用于声明和检测智能合约是否实现了某个接口。这个标准允许智能合约在运行时查询是否支持（实现了）其他合约的特定接口。这是通过定义一个全局的`supportsInterface`函数来实现的，该函数可以告诉调用者合约是否实现了一个给定的接口。

这个机制对于提高智能合约的互操作性非常重要，因为它允许开发者编写能够与任何遵循相同标准接口的合约交互的代码。例如，如果你有一个 NFT 市场，你可能想要确认一个智能合约是否遵循了 ERC-721 标准，以确保它能够处理 NFT。使用 ERC-165，你可以在合约中进行检查，以确保合约实现了必要的函数。
