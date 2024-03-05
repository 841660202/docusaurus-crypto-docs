---
sidebar_position: 7
title: ERC20Capped
---

## ERC20Capped 是什么？

<p style={{color: 'red'}}>限量铸币</p>

`ERC20Capped` 是 ERC-20 代币的一个扩展，它在 OpenZeppelin 的智能合约库中定义。这个扩展添加了一个最大供应量（cap）的概念，限制了代币的发行总量。一旦达到这个上限，就不允许进一步铸造（mint）新的代币，确保了代币的稀缺性和价值。

`ERC20Capped` 继承自 `ERC20` 合约，并添加了一个额外的状态变量来存储上限值。此外，它还覆盖了 `ERC20` 的 `mint` 函数，以确保在铸造新代币时不会超过设定的上限。

以下是一个简化的 `ERC20Capped` 合约示例：

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Capped is ERC20 {
    uint256 private _cap;

    constructor(uint256 cap_) ERC20("CappedToken", "CTKN") {
        require(cap_ > 0, "ERC20Capped: cap is 0");
        _cap = cap_;
    }

    /**
     * @dev Returns the cap on the token's total supply.
     */
    function cap() public view returns (uint256) {
        return _cap;
    }

    /**
     * @dev See {ERC20-_mint}.
     *
     * Requirements:
     *
     * - `mintedAmount` must not cause the total supply to go over the cap.
     */
    function _mint(address account, uint256 amount) internal virtual override {
        require(ERC20.totalSupply() + amount <= cap(), "ERC20Capped: cap exceeded");
        super._mint(account, amount);
    }
}
```

在这个示例中：

- `_cap` 是一个私有变量，存储代币的最大供应量。
- `cap` 函数允许外部访问这个上限值。
- `_mint` 函数在铸造新代币之前检查是否会超过上限，并且如果会超过，则抛出错误。

通过这种方式，`ERC20Capped` 确保了代币总量的控制，在设计代币经济学时这是一个非常有用的属性。
