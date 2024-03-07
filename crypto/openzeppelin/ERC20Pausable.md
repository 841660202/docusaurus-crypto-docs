---
sidebar_position: 8
title: ERC20Pausable
---

## ERC20Pausable 是什么？

`ERC20Pausable` 是一个标准的 ERC-20 代币合约，它继承了 `ERC20` 和 `Pausable`。`Pausable` 是一个 OpenZeppelin 的库，它提供了一个 `paused` 状态，可以暂停和恢复合约的功能。`ERC20Pausable` 代币合约在 `Pausable` 的基础上增加了 ERC-20 代币的标准功能。

`ERC20Pausable` 合约的主要特点是它可以暂停和恢复代币的转账和授权功能。这对于合约的管理者来说是一个非常有用的功能，因为它可以在合约出现问题时暂停代币的交易，以防止进一步的损失。

## 如何使用 ERC20Pausable？

`ERC20Pausable` 合约可以像其他 OpenZeppelin 的合约一样使用。你可以在你的合约中导入它，然后继承它，就可以使用它的功能了。

## ERC20Pausable.sol

<p style={{color: 'red'}}>whenNotPaused</p>

```solidity
// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC20/extensions/ERC20Pausable.sol)

pragma solidity ^0.8.20;

import {ERC20} from "../ERC20.sol";
import {Pausable} from "../../../utils/Pausable.sol";

/**
 * @dev ERC-20 token with pausable token transfers, minting and burning.
 *
 * Useful for scenarios such as preventing trades until the end of an evaluation
 * period, or having an emergency switch for freezing all token transfers in the
 * event of a large bug.
 *
 * IMPORTANT: This contract does not include public pause and unpause functions. In
 * addition to inheriting this contract, you must define both functions, invoking the
 * {Pausable-_pause} and {Pausable-_unpause} internal functions, with appropriate
 * access control, e.g. using {AccessControl} or {Ownable}. Not doing so will
 * make the contract pause mechanism of the contract unreachable, and thus unusable.
 */
abstract contract ERC20Pausable is ERC20, Pausable {
    /**
     * @dev See {ERC20-_update}.
     *
     * Requirements:
     *
     * - the contract must not be paused.
     */
    function _update(address from, address to, uint256 value) internal virtual override whenNotPaused {
        super._update(from, to, value);
    }
}
```

## Pausable.sol

```solidity title="contracts/utils/Pausable.sol"
// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (utils/Pausable.sol)

pragma solidity ^0.8.20;

import {Context} from "../utils/Context.sol";

/**
 * @dev Contract module which allows children to implement an emergency stop
 * mechanism that can be triggered by an authorized account.
 *
 * This module is used through inheritance. It will make available the
 * modifiers `whenNotPaused` and `whenPaused`, which can be applied to
 * the functions of your contract. Note that they will not be pausable by
 * simply including this module, only once the modifiers are put in place.
 */
abstract contract Pausable is Context {
    bool private _paused;

    /**
     * @dev Emitted when the pause is triggered by `account`.
     */
    event Paused(address account);

    /**
     * @dev Emitted when the pause is lifted by `account`.
     */
    event Unpaused(address account);

    /**
     * @dev The operation failed because the contract is paused.
     */
    error EnforcedPause();

    /**
     * @dev The operation failed because the contract is not paused.
     */
    error ExpectedPause();

    /**
     * @dev Initializes the contract in unpaused state.
     */
    constructor() {
        _paused = false;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is not paused.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    modifier whenNotPaused() {
        _requireNotPaused();
        _;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is paused.
     *
     * Requirements:
     *
     * - The contract must be paused.
     */
    modifier whenPaused() {
        _requirePaused();
        _;
    }

    /**
     * @dev Returns true if the contract is paused, and false otherwise.
     */
    function paused() public view virtual returns (bool) {
        return _paused;
    }

    /**
     * @dev Throws if the contract is paused.
     */
    function _requireNotPaused() internal view virtual {
        if (paused()) {
            revert EnforcedPause();
        }
    }

    /**
     * @dev Throws if the contract is not paused.
     */
    function _requirePaused() internal view virtual {
        if (!paused()) {
            revert ExpectedPause();
        }
    }

    /**
     * @dev Triggers stopped state.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    function _pause() internal virtual whenNotPaused {
        _paused = true;
        emit Paused(_msgSender());
    }

    /**
     * @dev Returns to normal state.
     *
     * Requirements:
     *
     * - The contract must be paused.
     */
    function _unpause() internal virtual whenPaused {
        _paused = false;
        emit Unpaused(_msgSender());
    }
}

```

## 像\_requirePaused 这样的单写一个函数，这代码写的怎么这么散，显得很不紧凑

在智能合约开发中，代码的组织方式通常旨在优化清晰度、安全性和可维护性，而不仅仅是紧凑性。`Pausable` 合约中的 `_requireNotPaused` 和 `_requirePaused` 函数是这种设计哲学的例子。

这种设计方式有几个优点：

1. **清晰的逻辑分割**：将检查合约是否暂停的逻辑封装在单独的函数中，可以清晰地表达这一逻辑，而不是将其嵌入到每一个使用这些检查的函数中。

2. **重用代码**：如果有多个函数需要在合约未暂停时调用，使用 `whenNotPaused` 修饰符可以避免重复代码。同样，如果有多个函数需要在合约暂停时调用，使用 `whenPaused` 修饰符也可以达到同样的效果。

3. **减少错误**：通过将检查逻辑封装在单独的函数中，可以降低在多个地方重复相同逻辑时出错的风险。

4. **易于测试和验证**：单独的函数可以被单独测试和验证，确保它们的行为是正确的。

5. **更好的错误处理**：在 Solidity 0.8 版本及以上，通过使用自定义错误，可以为特定的失败情况提供更具描述性的错误信息，这比传统的 `require` 语句返回的错误信息更有帮助。

6. **减少气体成本**：虽然这可能看起来不直观，但在某些情况下，将逻辑分离到函数中可以减少重复代码，这可能会减少智能合约的部署和交互成本。

总的来说，虽然代码看起来不是很紧凑，但这种设计提高了代码的可读性和可维护性，这在智能合约开发中是至关重要的，因为错误可能导致重大的金融损失。
