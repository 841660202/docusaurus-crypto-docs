---
sidebar_position: 1
---

# ERC20 的内容

## IERC20 与 ERC20 的区别？

`IERC20` 是一个 Solidity 接口，它定义了 ERC20 代币标准的核心功能。

`ERC20 代币`是一种遵循特定规则的智能合约，这些规则允许代币在以太坊网络上被转移和追踪。每个遵循 ERC20 标准的代币合约必须实现`IERC20`接口中的以下方法和事件：

## IERC20 的 6 方法+2 事件

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    // 返回存在的代币总量
    function totalSupply() external view returns (uint256);

    // 返回特定账户的代币余额
    function balanceOf(address account) external view returns (uint256);

    // 用于代币的转移，返回一个布尔值表示操作是否成功
    function transfer(address recipient, uint256 amount) external returns (bool);



    // 用于代币所有者授权给其他人转移代币，返回一个布尔值表示操作是否成功
    function approve(address spender, uint256 amount) external returns (bool);

    // 返回代币所有者允许代理人使用的代币数量
    function allowance(address owner, address spender) external view returns (uint256);

    // 用于代理人转移代币，返回一个布尔值表示操作是否成功
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);




    // 当代币从一个账户转移到另一个账户时触发的事件
    event Transfer(address indexed from, address indexed to, uint256 value);

    // 当代币所有者授权给其他人使用特定数量的代币时触发的事件
    event Approval(address indexed owner, address indexed spender, uint256 value);
}
```

关于这些方法和事件的详细信息：

1. `totalSupply()`: 返回代币的总供应量。
2. `balanceOf(address account)`: 返回指定地址的账户余额。
3. `transfer(address recipient, uint256 amount)`: 允许账户向另一个账户转移代币，如果转移成功则返回`true`。
4. `approve(address spender, uint256 amount)`: 允许`spender`代表调用者转移最多`amount`数量的代币，如果授权成功则返回`true`。
5. `allowance(address owner, address spender)`: 返回`spender`仍被允许从`owner`账户中提取的代币数量。
6. `transferFrom(address sender, address recipient, uint256 amount)`: 允许`spender`将`amount`数量的代币从`sender`转移到`recipient`，如果转移成功则返回`true`。
7. `Transfer`: 当代币从一个账户转移到另一个账户时必须触发的事件。
8. `Approval`: 当一个代币所有者调用`approve`来设置`spender`的允许量时必须触发的事件。

开发者在创建新的 ERC20 代币时，通常会从这个接口开始，确保他们的代币合约实现了所有必要的功能。这样做可以确保代币与以太坊生态系统中的其他合约和服务兼容。

## ERC20 代币 3 种供应

1. 固定供应量
2. 奖励矿工
3. 自动奖励

<a href="https://docs.openzeppelin.com/contracts/5.x/erc20-supply#wrapping-up" target="_blank" >https://docs.openzeppelin.com/contracts/5.x/erc20-supply#wrapping-up</a>
