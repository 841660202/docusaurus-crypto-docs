---
sidebar_position: 2
title: ERC20Permit 代币授权
---

## 代码

````solidity
// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC20/extensions/IERC20Permit.sol)

pragma solidity ^0.8.20;

/**
 * @dev Interface of the ERC-20 Permit extension allowing approvals to be made via signatures, as defined in
 * https://eips.ethereum.org/EIPS/eip-2612[ERC-2612].
 *
 * Adds the {permit} method, which can be used to change an account's ERC-20 allowance (see {IERC20-allowance}) by
 * presenting a message signed by the account. By not relying on {IERC20-approve}, the token holder account doesn't
 * need to send a transaction, and thus is not required to hold Ether at all.
 *
 * ==== Security Considerations
 *
 * There are two important considerations concerning the use of `permit`. The first is that a valid permit signature
 * expresses an allowance, and it should not be assumed to convey additional meaning. In particular, it should not be
 * considered as an intention to spend the allowance in any specific way. The second is that because permits have
 * built-in replay protection and can be submitted by anyone, they can be frontrun. A protocol that uses permits should
 * take this into consideration and allow a `permit` call to fail. Combining these two aspects, a pattern that may be
 * generally recommended is:
 *
 * ```solidity
 * function doThingWithPermit(..., uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) public {
 *     try token.permit(msg.sender, address(this), value, deadline, v, r, s) {} catch {}
 *     doThing(..., value);
 * }
 *
 * function doThing(..., uint256 value) public {
 *     token.safeTransferFrom(msg.sender, address(this), value);
 *     ...
 * }
 * ```
 *
 * Observe that: 1) `msg.sender` is used as the owner, leaving no ambiguity as to the signer intent, and 2) the use of
 * `try/catch` allows the permit to fail and makes the code tolerant to frontrunning. (See also
 * {SafeERC20-safeTransferFrom}).
 *
 * Additionally, note that smart contract wallets (such as Argent or Safe) are not able to produce permit signatures, so
 * contracts should have entry points that don't rely on permit.
 */
interface IERC20Permit {
    /**
     * @dev Sets `value` as the allowance of `spender` over ``owner``'s tokens,
     * given ``owner``'s signed approval.
     *
     * IMPORTANT: The same issues {IERC20-approve} has related to transaction
     * ordering also apply here.
     *
     * Emits an {Approval} event.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     * - `deadline` must be a timestamp in the future.
     * - `v`, `r` and `s` must be a valid `secp256k1` signature from `owner`
     * over the EIP712-formatted function arguments.
     * - the signature must use ``owner``'s current nonce (see {nonces}).
     *
     * For more information on the signature format, see the
     * https://eips.ethereum.org/EIPS/eip-2612#specification[relevant EIP
     * section].
     *
     * CAUTION: See Security Considerations above.
     */
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    /**
     * @dev Returns the current nonce for `owner`. This value must be
     * included whenever a signature is generated for {permit}.
     *
     * Every successful call to {permit} increases ``owner``'s nonce by one. This
     * prevents a signature from being used multiple times.
     */
    function nonces(address owner) external view returns (uint256);

    /**
     * @dev Returns the domain separator used in the encoding of the signature for {permit}, as defined by {EIP712}.
     */
    // solhint-disable-next-line func-name-mixedcase
    function DOMAIN_SEPARATOR() external view returns (bytes32);
}
````

这个接口 `IERC20Permit` 是一个遵循 ERC-2612 标准的 ERC-20 代币扩展，允许通过签名来进行代币的授权。这里，我们会逐一解释接口中的方法和参数。

### 方法和参数解释

#### permit 方法

```solidity
function permit(
    address owner,
    address spender,
    uint256 value,
    uint256 deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
) external;
```

- **owner**: 代币所有者的地址，也就是签名者的地址。
- **spender**: 被授权者的地址，也就是可以使用`owner`代币的地址。
- **value**: `spender`被授权转移的代币数量。
- **deadline**: 签名的截止时间，必须是未来的一个时间戳。如果当前时间超过了`deadline`，那么这个签名就无效了。
- **v, r, s**: 这三个参数组成了一个 ECDSA 签名。在以太坊中，签名被分为这三部分以方便传输。`v`是恢复标识符，`r`和`s`是签名本身。这个签名证明了`owner`已经同意让`spender`转移最多`value`数量的代币。

#### nonces 方法

```solidity
function nonces(address owner) external view returns (uint256);
```

- **owner**: 代币所有者的地址。

这个方法返回`owner`当前的 nonce 值。在生成签名时，必须包含这个 nonce 值，每次成功调用`permit`方法后，`owner`的 nonce 值会增加，这样可以防止签名被重复使用。

#### DOMAIN_SEPARATOR 方法

```solidity
function DOMAIN_SEPARATOR() external view returns (bytes32);
```

这个方法返回用于`permit`方法签名编码的域分隔符，按照 EIP-712 标准定义。域分隔符是一个哈希值，通常包含了合约的名称、版本、链 ID 和合约地址等信息，它用于区分不同合约的签名，以防止在不同的合约间重放攻击。

### 安全考虑

在接口注释中提到了两点安全考虑：

1. **签名仅表示授权**：一个有效的签名表示了一个授权，但不应该假设它传达了其他任何意图。特别是，不应该被视为以任何特定方式使用授权的意图。

2. **可能会被前置交易**：由于`permit`具有内置的重放保护，并且任何人都可以提交，因此它们可能会被前置交易（frontrun）。使用`permit`的协议应该考虑到这一点，并允许`permit`调用失败。

合约开发者在使用`permit`功能时应该考虑到这些安全问题，并且在实现时应当采取相应的措施来防止潜在的安全漏洞。

## 这几个方法不会用，举个例子

当然，下面我会通过一个例子来说明如何使用 `IERC20Permit` 接口中的 `permit` 方法。

假设我们有一个简单的场景：Alice 想要通过签名的方式授权给 Bob 一定数量的代币，而不是通过发送一个普通的 `approve` 交易。这样做的好处是 Alice 不需要支付矿工费用，因为 Bob 可以将 Alice 的签名提交给区块链。

### 步骤 1：生成签名

Alice 需要生成一个签名，这个签名代表她授权给 Bob 一定数量的代币（`value`）。为了生成这个签名，Alice 需要使用她的私钥和一些特定的数据来构造一个消息。这个消息通常包括：

- `owner`（Alice 的地址）
- `spender`（Bob 的地址）
- `value`（Bob 被授权的代币数量）
- `nonce` <span style={{color: 'red'}}>（Alice 当前的 nonce，从 `nonces` 函数获取）</span>
- `deadline`（签名的有效期限）
- `DOMAIN_SEPARATOR` <span style={{color: 'red'}}>（从 `DOMAIN_SEPARATOR` 函数获取）</span>

Alice 使用这些数据和她的私钥生成签名，并将签名分解为 `v`, `r`, `s` 三部分。

### 步骤 2：Bob 调用 `permit` 方法

一旦 Alice 生成了签名，她可以将 `v`, `r`, `s`, 以及其他必要信息发给 Bob。Bob 现在可以调用 `permit` 方法，将这些信息提交到区块链上：

```solidity
// Bob 在前端使用 JavaScript 或者在后端使用 Web3.js 或 ethers.js 等库来调用这个函数
erc20PermitContract.permit(
    aliceAddress, // Alice 的地址
    bobAddress,   // Bob 的地址
    value,        // Bob 被授权的代币数量
    deadline,     // 签名的有效期限
    v,            // 签名的 v
    r,            // 筴名的 r
    s             // 签名的 s
);
```

### 步骤 3：交易确认

一旦 `permit` 方法的交易被矿工确认并添加到区块链上，Bob 就被授权了 Alice 账户中指定数量的代币。Bob 现在可以调用 `transferFrom` 方法来转移这些代币，而无需 Alice 进一步介入。

这个例子展示了如何使用 `permit` 方法来通过签名的方式授权代币交易。这种方法减少了交易费用，并且提高了用户体验，因为代币所有者不需要亲自发送交易。然而，实际的实现可能会更复杂，需要考虑到前端的用户界面和后端与智能合约交互的逻辑。

## v,r,s 从哪里获取？

在以太坊中，`v`, `r`, `s` 是从 ECDSA（Elliptic Curve Digital Signature Algorithm）签名中提取出来的三个参数，它们一起构成了一个完整的签名。要获取这些值，你需要对一条消息进行签名，通常这个消息是由需要签名的数据构成的一串字节。

在以太坊和其他支持 EIP-712 的区块链上，通常会使用 EIP-712 标准来构造一个结构化的消息，这样可以生成更为人类可读的签名。以下是获取 `v`, `r`, `s` 的步骤：

### 步骤 1: 构造消息

首先，你需要构造一个需要签名的消息。这通常涉及到将数据（如代币数量、接收者地址、nonce、截止时间等）格式化为一定的结构。在 EIP-712 中，这通常是一个结构化的数据对象。

### 步骤 2: 用户签名

用户（在这个例子中是 Alice）需要使用她的私钥对这个消息进行签名。这通常在用户的客户端进行，例如使用 MetaMask 或其他区块链钱包。这些钱包提供了签名功能，可以在用户的私钥不离开钱包的情况下生成签名。

### 步骤 3: 提取签名参数

签名后，钱包会返回一个签名字符串。在以太坊中，这个签名字符串通常是 65 字节长，可以被分解为 `r`, `s` 和 `v`。在 JavaScript 中使用 web3.js 或 ethers.js 时，可以通过以下方式来提取这些参数：

```javascript
// 假设 `signature` 是从钱包获取的签名字符串
const r = signature.slice(0, 66);
const s = '0x' + signature.slice(66, 130);
const v = '0x' + signature.slice(130, 132);
```

或者，如果你使用的是 ethers.js 库，它提供了一个更简单的方法来处理这些参数：

```javascript
const sig = ethers.utils.splitSignature(signature);
const r = sig.r;
const s = sig.s;
const v = sig.v;
```

### 步骤 4: 使用签名参数

一旦你有了 `v`, `r`, `s`，你就可以将它们作为参数传递给智能合约的 `permit` 方法，允许无需交易费用的代币授权。

需要注意的是，构造签名消息和用户签名这两个步骤通常需要结合前端应用程序和用户的钱包来完成。用户的私钥用于生成签名，但从来不会离开用户的钱包，确保了安全性。

## signature 从哪里获取的？

`signature` 是由用户（在我们的例子中是 Alice）通过她的私钥对特定数据进行签名得到的。在 Web3 应用中，这通常是通过用户的以太坊钱包（如 MetaMask、Trust Wallet 等）来完成的。这些钱包可以与用户的浏览器或移动设备集成，并提供签名功能，而不会暴露用户的私钥。

以下是获取签名的基本步骤：

### 步骤 1: 准备签名数据

首先，你需要有一组要签名的数据。在使用 `permit` 函数的场景中，这通常包括代币的持有者（`owner`）地址、被授权者（`spender`）地址、代币数量（`value`）、`nonce`（为了防止重放攻击，每次签名都需要唯一的`nonce`）、以及签名的截止时间（`deadline`）。

### 步骤 2: 创建签名消息

使用 EIP-712 标准，你可以创建一个结构化的签名消息，这样签名更加安全且易于理解。你需要定义消息的类型以及相应的数据字段。

### 步骤 3: 用户签名

用户通过她的钱包对消息进行签名。在 Web3 应用中，你可以通过编程方式请求用户的钱包签名消息。这通常涉及到调用钱包提供的 API，如 `eth_signTypedData` 或者 `eth_sign`（根据所使用的 EIP 标准），并将消息数据传递给这个函数。

### 步骤 4: 获取签名

用户确认签名请求后，钱包将执行签名操作，并将签名作为响应返回给 Web3 应用。这个签名通常是一个字符串，包含了 `r`, `s`, 和 `v` 参数。

使用 JavaScript 和 ethers.js 库的例子：

```javascript
async function getSignature(ethereumProvider, owner, spender, value, nonce, deadline) {
  // 这是EIP-712标准的签名数据结构
  const domain = {
    name: 'YourTokenName',
    version: '1',
    chainId: 1, // 主网的chainId是1，根据你的网络环境这可能不同
    verifyingContract: '0xContractAddress', // 你的ERC20合约地址
  };

  const types = {
    Permit: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  };

  const message = {
    owner,
    spender,
    value,
    nonce,
    deadline,
  };

  // 签名
  const signature = await ethereumProvider.send('eth_signTypedData_v4', [owner, JSON.stringify({ domain, types, message })]);
  return signature;
}
```

在这个例子中，`ethereumProvider` 是与用户钱包连接的 Web3 提供者，例如 `window.ethereum`。这个函数将返回一个签名字符串，该字符串可以被分解为 `v`, `r`, `s` 参数，然后用于调用智能合约的 `permit` 方法。

需要注意的是，用户需要在其钱包中有足够的权限来进行签名操作，而且钱包需要支持相应的签名方法。在实际应用中，你可能还需要处理用户拒绝签名的情况以及其他潜在的错误。

## 完整示例代码

以下是一个使用 ethers.js 库和以太坊钱包（例如 MetaMask）在前端 Web3 应用中创建和获取签名的完整示例。这个例子假设你正在编写一个允许用户签名一个`permit`调用的页面。

首先，确保你的项目中安装了`ethers`库，你可以使用 npm 或 yarn 来安装它：

```bash
npm install ethers
# or
yarn add ethers
```

然后，你可以使用以下代码来实现签名过程：

```javascript
import { ethers } from 'ethers';

// 假设这是你的ERC20代币合约地址和ABI
const tokenAddress = '0xYourTokenContractAddress';
const tokenAbi = [
  // ... 你的ERC20代币合约的ABI ...
];

// 这个函数用来请求用户的签名
async function requestPermitSignature(
  provider, // 这是一个 ethers 提供者，连接到用户的钱包
  owner, // 代币持有者的地址
  spender, // 被授权者的地址
  value, // 授权的代币数量
  nonce, // nonce，用于防止重放攻击
  deadline // 签名有效期截止时间
) {
  // EIP-712 域分隔符
  const domain = {
    name: 'YourTokenName',
    version: '1',
    chainId: await provider.getNetwork().then((network) => network.chainId),
    verifyingContract: tokenAddress,
  };

  // EIP-712 类型定义
  const types = {
    Permit: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  };

  // 要签名的消息
  const message = {
    owner,
    spender,
    value,
    nonce,
    deadline,
  };

  // 使用 ethers.js 的签名函数
  const signature = await provider.send('eth_signTypedData_v4', [owner, JSON.stringify({ domain, types, message })]);

  // 分割签名以获取 r, s, v 参数
  const sig = ethers.utils.splitSignature(signature);

  return {
    r: sig.r,
    s: sig.s,
    v: sig.v,
  };
}

// 连接到用户的MetaMask钱包
async function connectWallet() {
  // 检查是否安装了MetaMask
  if (typeof window.ethereum !== 'undefined') {
    try {
      // 请求用户授权连接钱包
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      // 连接到钱包
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      return {
        provider,
        signer: provider.getSigner(),
        owner: accounts[0],
      };
    } catch (error) {
      console.error('An error occurred during wallet connection:', error);
    }
  } else {
    console.log('Please install MetaMask!');
  }
}

// 示例用法
async function main() {
  const { provider, signer, owner } = await connectWallet();

  // 这里你需要有逻辑来获取合适的值，如spender地址、value、nonce和deadline
  const spender = '0xSpenderAddress';
  const value = ethers.utils.parseUnits('10', 18); // 假设代币有18位小数
  const nonce = 0; // 你需要从合约中获取正确的nonce
  const deadline = Math.floor(Date.now() / 1000) + 3600; // 1小时后过期

  const signature = await requestPermitSignature(provider, owner, spender, value, nonce, deadline);

  console.log('Signature:', signature);

  // 现在你可以使用这个签名来调用合约的permit函数
  const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, signer);
  const tx = await tokenContract.permit(owner, spender, value, deadline, signature.v, signature.r, signature.s);

  console.log('Transaction hash:', tx.hash);
}

main();
```

:::danger[Take care]
请注意，这个示例代码假设你已经有了一个 ERC20 代币合约，并且该合约实现了`permit`函数。你需要替换`tokenAddress`和`tokenAbi`为你自己的合约地址和 ABI。此外，`nonce`应该是从合约中获取的当前 nonce，这通常是一个函数调用。
:::

在实际应用中，你需要根据你的应用逻辑和用户界面来调整这些函数。例如，<span style={{fontWeight: 'bold'}}>你可能需要在用户界面中添加按钮来触发连接钱包和请求签名的功能</span>。
