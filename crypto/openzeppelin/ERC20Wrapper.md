---
sidebar_position: 4
title: ERC20Wrapper 包装
---

## ERC20Wrapper 的内容

### 什么是 ERC20Wrapper？

`ERC20Wrapper` 通常是指在以太坊生态系统中，将非 ERC20 兼容的资产包装成符合 ERC20 标准的代币的一种智能合约。ERC20 是以太坊上最流行的代币标准之一，定义了一套通用的规则，使得不同的 ERC20 代币可以在各种应用中轻松交互，包括钱包、交易所和其他智能合约。

然而，并非所有的资产都是以 ERC20 标准发行的。例如，以太坊上的原生代币 ETH 本身就不是一个 ERC20 代币。这就需要一种机制来允许这些非 ERC20 资产在需要 ERC20 接口的应用中使用。

`ERC20Wrapper` 就是这样一种机制。它允许用户将非 ERC20 资产（比如 ETH 或者其他标准的代币，如 ERC721）“包装”起来，从而创建一个新的 ERC20 兼容代币。这个新的代币保留了原始资产的价值，并且可以在任何支持 ERC20 的平台上使用。

这个过程通常涉及以下几个步骤：

1. **存入**：用户将原始资产存入`ERC20Wrapper`智能合约。
2. **包装**：智能合约铸造出一个等值的 ERC20 代币，代表用户存入的原始资产。
3. **使用**：用户现在可以使用这个新的 ERC20 代币在任何支持 ERC20 的平台上进行交易和互动。
4. **解包**：用户可以随时将 ERC20 代币发送回智能合约以赎回原始资产。

一个常见的例子是 WETH，即 Wrapped Ether。由于 ETH 不符合 ERC20 标准，所以通过将 ETH 发送到一个智能合约并得到等量的 WETH，用户就可以在那些仅支持 ERC20 代币的 DApps 或 DeFi 协议中使用 ETH 了。

类似的包装机制也可以用于其他类型的代币或资产，以确保它们能够在需要 ERC20 标准代币的生态系统中无缝运作。

### 包装只是为了 ERC20 标准代币的生态系统中无缝运作？我看不包装也不影响交易和使用？

是的，包装（Wrapping）主要是为了让某些不符合 ERC20 标准的资产能在那些专门设计来支持 ERC20 代币的生态系统中无缝运作。这并不是说不包装的资产不能进行交易或使用，而是包装可以提供一些额外的便利和兼容性。

以下是包装资产的一些主要优势：

1. **兼容性**：很多去中心化应用（DApps）和去中心化金融（DeFi）平台是基于 ERC20 标准构建的，因此它们只能接受 ERC20 代币。通过将非 ERC20 资产包装成 ERC20 代币，这些资产就可以在这些平台上使用了。

2. **标准化交互**：ERC20 代币遵循一套标准化的接口规范，这使得钱包、交易所、智能合约等可以很容易地集成和交互。包装后的资产可以利用这些现成的集成。

3. **流动性**：在某些情况下，包装资产可以帮助用户访问更多的流动性池和交易对，因为 ERC20 代币在交易所和流动性平台上更加普及。

4. **统一的操作体验**：用户可能更熟悉操作 ERC20 代币，包装资产可以提供统一的用户体验，尤其是在进行跨平台交易和互动时。

然而，这并不意味着非 ERC20 资产不能进行交易或使用。例如，以太坊原生代币 ETH 是可以直接在支持以太坊的各种钱包和交易所中交易的，不需要包装。同样，其他标准的代币，如 ERC721（用于非同质化代币，或 NFTs）也有其自己的使用场景和市场。

包装只是为了解决特定的兼容性问题，当用户需要在 ERC20 中心的生态系统中使用那些非 ERC20 资产时，它们才变得必要。如果用户的交易和使用不需要这种特定的兼容性，那么包装就不是必须的。

### 包装代码

```solidity
// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC20/extensions/ERC20Wrapper.sol)

pragma solidity ^0.8.20;

import {IERC20, IERC20Metadata, ERC20} from "../ERC20.sol";
import {SafeERC20} from "../utils/SafeERC20.sol";

/**
 * @dev Extension of the ERC-20 token contract to support token wrapping.
 *
 * Users can deposit and withdraw "underlying tokens" and receive a matching number of "wrapped tokens". This is useful
 * in conjunction with other modules. For example, combining this wrapping mechanism with {ERC20Votes} will allow the
 * wrapping of an existing "basic" ERC-20 into a governance token.
 *
 * WARNING: Any mechanism in which the underlying token changes the {balanceOf} of an account without an explicit transfer
 * may desynchronize this contract's supply and its underlying balance. Please exercise caution when wrapping tokens that
 * may undercollateralize the wrapper (i.e. wrapper's total supply is higher than its underlying balance). See {_recover}
 * for recovering value accrued to the wrapper.
 */
abstract contract ERC20Wrapper is ERC20 {
    IERC20 private immutable _underlying;

    /**
     * @dev The underlying token couldn't be wrapped.
     */
    error ERC20InvalidUnderlying(address token);

    constructor(IERC20 underlyingToken) {
        if (underlyingToken == this) {
            revert ERC20InvalidUnderlying(address(this));
        }
        _underlying = underlyingToken;
    }

    /**
     * @dev See {ERC20-decimals}.
     */
    function decimals() public view virtual override returns (uint8) {
        try IERC20Metadata(address(_underlying)).decimals() returns (uint8 value) {
            return value;
        } catch {
            return super.decimals();
        }
    }

    /**
     * @dev Returns the address of the underlying ERC-20 token that is being wrapped.
     */
    function underlying() public view returns (IERC20) {
        return _underlying;
    }

    /**
     * @dev Allow a user to deposit underlying tokens and mint the corresponding number of wrapped tokens.
     */
    function depositFor(address account, uint256 value) public virtual returns (bool) {
        address sender = _msgSender();
        if (sender == address(this)) {
            revert ERC20InvalidSender(address(this));
        }
        if (account == address(this)) {
            revert ERC20InvalidReceiver(account);
        }
        SafeERC20.safeTransferFrom(_underlying, sender, address(this), value);
        _mint(account, value);
        return true;
    }

    /**
     * @dev Allow a user to burn a number of wrapped tokens and withdraw the corresponding number of underlying tokens.
     */
    function withdrawTo(address account, uint256 value) public virtual returns (bool) {
        if (account == address(this)) {
            revert ERC20InvalidReceiver(account);
        }
        _burn(_msgSender(), value);
        SafeERC20.safeTransfer(_underlying, account, value);
        return true;
    }

    /**
     * @dev Mint wrapped token to cover any underlyingTokens that would have been transferred by mistake or acquired from
     * rebasing mechanisms. Internal function that can be exposed with access control if desired.
     */
    function _recover(address account) internal virtual returns (uint256) {
        uint256 value = _underlying.balanceOf(address(this)) - totalSupply();
        _mint(account, value);
        return value;
    }
}
```

### 解释代码

这段代码是一个智能合约的示例，它实现了一个 ERC20 代币的包装机制。这个合约是一个抽象合约，因为它包含了至少一个没有实现的`virtual`函数。这意味着你不能直接部署这个合约，而是需要通过创建一个子类并实现所有的`virtual`函数来使用它。

下面是代码的主要部分及其功能的解释：

1. **合约声明**：合约继承自`ERC20`标准合约，并使用`SafeERC20`库来安全地处理 ERC20 代币。

2. **私有变量**：`_underlying`是一个私有变量，它存储了被包装的 ERC20 代币的地址。

3. **构造函数**：构造函数接收一个`IERC20`代表底层代币，它将这个代币设置为不可变的，这意味着它在合约的整个生命周期中都不能被改变。如果尝试将合约自身作为底层代币，构造函数会回退并抛出一个错误。

4. **decimals 函数**：这个函数覆盖了 ERC20 标准中的`decimals`函数。它尝试获取底层代币的小数位数，如果失败了，则返回包装代币合约中定义的小数位数。

5. **underlying 函数**：这个函数返回底层 ERC20 代币的地址。

6. **depositFor 函数**：允许用户存入底层代币并铸造相应数量的包装代币。这个函数使用`SafeERC20.safeTransferFrom`来从发送者账户中安全地转移底层代币到合约地址，并使用`_mint`来铸造相同数量的包装代币到指定账户。

7. **withdrawTo 函数**：允许用户销毁一定数量的包装代币，并取回相应数量的底层代币。这个函数首先销毁发送者账户中的包装代币，然后使用`SafeERC20.safeTransfer`将底层代币安全地转移到指定账户。

8. **\_recover 函数**：这是一个内部函数，用于恢复任何意外转入或通过代币重新基准化机制获得的底层代币。它计算合约持有的底层代币与包装代币总供应量的差额，并将这个差额铸造为包装代币给指定账户。

请注意，这个合约中还有一些错误处理，比如`ERC20InvalidUnderlying`，`ERC20InvalidSender`和`ERC20InvalidReceiver`，它们在特定条件下被触发，以防止不合理的操作。

这个合约的设计意图是作为其他合约的扩展，例如可以与`ERC20Votes`结合使用，将普通的 ERC20 代币转换为具有治理功能的代币。然而，使用这个合约时需要注意，任何不通过显式转账改变账户`balanceOf`的机制都可能导致包装代币的供应量和底层余额不同步，因此在处理可能导致包装代币超额抵押的资产时需要格外小心。

### 包装是不是导致同一个 ETH, 会变成一个 ETH 和一个 WETH,导致数量增加了？

包装（Wrapping）代币并不会导致原始代币的数量增加，而是在创建一个新的代币表示形式的同时锁定了原始代币。以 ETH 和 WETH（Wrapped ETH）为例，这个过程可以这样理解：

1. **存入 ETH**：用户将 ETH 存入包装合约中。在这一步，用户的 ETH 实际上被发送到了智能合约的地址，并且在以太坊的区块链上被锁定。

2. **铸造 WETH**：智能合约随后会铸造等量的 WETH 代币给用户。这些 WETH 代币是 ERC20 兼容的，这意味着它们可以在那些只接受 ERC20 标准代币的应用中使用。

3. **保持价值一致**：WETH 的价值被设计为与 ETH 保持 1:1 的价值关系。也就是说，1 WETH 应该总是等于 1 ETH 的价值。

4. **取回 ETH**：用户可以随时将 WETH 兑换回相等数量的 ETH。在这个过程中，用户将 WETH 发送回智能合约，智能合约销毁这些 WETH 并释放相等数量的 ETH 给用户。

在整个过程中，ETH 和 WETH 的总价值是保持不变的。如果用户存入 1 ETH，他们将会得到 1 WETH，而区块链上的 ETH 总量并没有增加。当用户想要将 WETH 兑换回 ETH 时，WETH 会被销毁，ETH 会被释放回用户的控制之下，整个系统的 ETH 数量保持不变。

因此，包装不会导致 ETH 的数量增加，它只是提供了一种方式，让 ETH 可以以 ERC20 代币的形式参与那些需要 ERC20 标准的 DeFi 应用程序或服务。

### 是否认可包装？

这会不会存在一个问题，ETH 社区公认，而包装后的 WETH 社区不认可？

是的，这种情况是可能发生的。包装后的代币（如 WETH）虽然在技术上与原始代币（如 ETH）等值，但它们的接受度和认可度可能会有所不同，这主要由以下几个因素决定：

1. **信任和安全性**：WETH 依赖于其背后的智能合约的安全性。如果社区对智能合约的安全性存在疑虑，或者如果出现了安全漏洞，人们可能会对 WETH 持怀疑态度。

2. **使用场景**：ETH 作为原生代币，在以太坊网络上被广泛接受和使用，用于交易费用（Gas）支付、投资、交易等。而 WETH 主要是为了在 ERC20 代币标准下使用 ETH，它在特定的应用场景（如某些 DeFi 平台）中更为常见。

3. **流动性**：在某些市场或交易所中，WETH 可能具有更高的流动性，因为它符合 ERC20 标凈，可以更容易地与其他 ERC20 代币进行交易。然而，这并不意味着所有社区成员都会认可 WETH，特别是那些不常使用 DeFi 平台的用户。

4. **社区共识**：ETH 是以太坊网络的原生代币，拥有广泛的社区共识和支持。WETH 虽然在技术上与 ETH 等价，但它是基于社区共识和智能合约创建的。如果社区对 WETH 的需求减少或者对其持有疑虑，那么 WETH 的认可度可能会降低。

5. **教育和认知**：用户对 WETH 的认可度还取决于他们对于包装代币概念的理解和认知。如果大多数用户不理解 WETH 的作用或者不信任包装过程，他们可能会更倾向于持有 ETH。

总之，虽然 WETH 在技术上与 ETH 等值，但它的认可度受到社区信任、使用场景、流动性、社区共识以及用户教育和认知等多方面因素的影响。因此，确实存在 WETH 可能不被部分社区成员认可的情况。这就是为什么推广和教育对于任何新兴技术或概念的接受都至关重要。

### 每次看到 decimals 就懵逼，这个是将代币的数量进行比例缩放吗？

在加密货币和代币的世界里，`decimals` 这个参数确实有点令人困惑。但实际上，它的概念非常简单。`decimals` 是一个属性，用于定义一个代币可以被分割的程度。这个概念类似于现实世界货币的最小单位，比如美元和分（1 美元 = 100 分）。

对于加密货币来说，`decimals` 决定了用户可以交易的最小代币单位。例如：

- 如果一个代币的 `decimals` 为 0，那么你只能交易整数个代币，无法交易小数。
- 如果 `decimals` 为 2，你可以交易的最小单位是 0.01 代币。
- 如果 `decimals` 为 18（像 ETH 和许多 ERC-20 代币那样），你可以交易的最小单位是 $0.000000000000000001$ 代币。

在智能合约中设置 `decimals` 是为了在代币的运算和交易中提供灵活性。由于区块链并不直接支持浮点数运算，`decimals` 实际上是一个帮助我们理解代币数量的虚拟概念。在智能合约的存储和运算中，所有的代币数量都以最小单位（称为"wei"对于以太坊，"satoshi"对于比特币）来处理，就像处理整数一样。

例如，如果你想发送 1.5 个 `decimals` 为 18 的代币，你实际上会发送 1.5 x $10^{18}$ 的最小单位。智能合约会记录这个数字，而用户界面（如钱包或交易所）会将其除以 $10^{18}$ 并显示为 1.5 代币，这样用户就可以容易地理解和操作了。

所以，`decimals` 并不是对代币数量的比例缩放，而是定义了代币的最小可分割单位，从而允许在智能合约中以整数形式处理和存储小数代币。
