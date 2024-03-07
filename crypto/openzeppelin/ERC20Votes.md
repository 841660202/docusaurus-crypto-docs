---
sidebar_position: 5
title: ERC20Votes
---

## ERC20Votes 是什么？

`ERC20Votes` 是一个扩展了标准 `ERC20` 代币功能的合约接口，它包含了投票功能。这个接口是在 `ERC20` 标准之上实现的，使得代币持有者可以参与到基于他们持有代币数量的治理决策中去。这种类型的代币通常被用于去中心化自治组织（DAO）和其他需要代币投票机制的场景。

`ERC20Votes` 通常包括以下功能：

1. **投票权重**：代币持有者的投票权重通常与其持有的代币数量成正比。

2. **委托投票**：代币持有者可以选择将他们的投票权委托给另一个地址，这样，委托人就可以代表他们投票。

3. **历史投票记录**：`ERC20Votes` 合约能够追踪每个地址在过去的投票权重，这对于实现某些投票机制是必要的，比如快照投票或者基于区块高度的投票权重。

4. **投票快照**：在某些治理机制中，投票权可能会在特定区块的快照基础上计算，这意味着即使后来代币被转移，投票权也保持不变。

5. **治理提案**：`ERC20Votes` 可能会与治理合约交互，允许代币持有者对提案进行投票。

6. **透明度和审计**：由于所有的投票活动都记录在区块链上，它们是完全透明的，可以被任何人审计。

`ERC20Votes` 扩展了 `ERC20` 代币的功能，将治理特性纳入了代币的设计之中。这使得代币不仅仅是价值的载体，还成为了参与项目决策的一种方式。这样的设计对于那些希望通过社区参与来分散决策权力的项目来说是非常有用的。

## ERC20Votes

```solidity title="contracts/token/ERC20/extensions/ERC20Votes.sol"
// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC20/extensions/ERC20Votes.sol)

pragma solidity ^0.8.20;

import {ERC20} from "../ERC20.sol";
import {Votes} from "../../../governance/utils/Votes.sol";
import {Checkpoints} from "../../../utils/structs/Checkpoints.sol";

/**
 * @dev Extension of ERC-20 to support Compound-like voting and delegation. This version is more generic than Compound's,
 * and supports token supply up to 2^208^ - 1, while COMP is limited to 2^96^ - 1.
 *
 * NOTE: This contract does not provide interface compatibility with Compound's COMP token.
 *
 * This extension keeps a history (checkpoints) of each account's vote power. Vote power can be delegated either
 * by calling the {delegate} function directly, or by providing a signature to be used with {delegateBySig}. Voting
 * power can be queried through the public accessors {getVotes} and {getPastVotes}.
 *
 * By default, token balance does not account for voting power. This makes transfers cheaper. The downside is that it
 * requires users to delegate to themselves in order to activate checkpoints and have their voting power tracked.
 */
abstract contract ERC20Votes is ERC20, Votes {
    /**
     * @dev Total supply cap has been exceeded, introducing a risk of votes overflowing.
     */
    error ERC20ExceededSafeSupply(uint256 increasedSupply, uint256 cap);

    /**
     * @dev Maximum token supply. Defaults to `type(uint208).max` (2^208^ - 1).
     *
     * This maximum is enforced in {_update}. It limits the total supply of the token, which is otherwise a uint256,
     * so that checkpoints can be stored in the Trace208 structure used by {{Votes}}. Increasing this value will not
     * remove the underlying limitation, and will cause {_update} to fail because of a math overflow in
     * {_transferVotingUnits}. An override could be used to further restrict the total supply (to a lower value) if
     * additional logic requires it. When resolving override conflicts on this function, the minimum should be
     * returned.
     */
    function _maxSupply() internal view virtual returns (uint256) {
        return type(uint208).max;
    }

    /**
     * @dev Move voting power when tokens are transferred.
     *
     * Emits a {IVotes-DelegateVotesChanged} event.
     */
    function _update(address from, address to, uint256 value) internal virtual override {
        super._update(from, to, value);
        if (from == address(0)) {
            uint256 supply = totalSupply();
            uint256 cap = _maxSupply();
            if (supply > cap) {
                revert ERC20ExceededSafeSupply(supply, cap);
            }
        }
        _transferVotingUnits(from, to, value);
    }

    /**
     * @dev Returns the voting units of an `account`.
     *
     * WARNING: Overriding this function may compromise the internal vote accounting.
     * `ERC20Votes` assumes tokens map to voting units 1:1 and this is not easy to change.
     */
    function _getVotingUnits(address account) internal view virtual override returns (uint256) {
        return balanceOf(account);
    }

    /**
     * @dev Get number of checkpoints for `account`.
     */
    function numCheckpoints(address account) public view virtual returns (uint32) {
        return _numCheckpoints(account);
    }

    /**
     * @dev Get the `pos`-th checkpoint for `account`.
     */
    function checkpoints(address account, uint32 pos) public view virtual returns (Checkpoints.Checkpoint208 memory) {
        return _checkpoints(account, pos);
    }
}
```

## 快照投票或者基于区块高度的投票权重是什么意思？

快照投票（Snapshot Voting）和基于区块高度的投票权重是区块链治理中用来确定投票权的两种机制。

### 快照投票

快照投票指的是在投票开始时，系统会记录一个代币持有情况的“快照”。这个快照固定了在特定时间点上每个账户持有的代币数量。即使在投票过程中代币的实际持有情况发生了变化，投票权重也不会受到影响，因为投票权重是根据快照时的代币数量来决定的。

快照投票的优点是它可以防止在投票期间发生的操纵行为，例如，某人在投票期间临时买入大量代币以增加自己的投票权重，然后在投票结束后再卖出这些代币。

### 基于区块高度的投票权重

基于区块高度的投票权重意味着投票权重是在特定的区块高度确定的。在区块链中，每个区块都有一个唯一的序号，称为区块高度。通过指定一个特定的区块高度，可以确定在那个特定区块时账户中有多少代币，从而确定投票权重。

这种方式允许投票系统引用一个不可变的历史状态，确保即使在投票期间发生交易，也不会影响到已经确定的投票权重。

### 实施机制

在智能合约中实施这些机制通常涉及到记录检查点（Checkpoints）。检查点是账户在特定时间或区块高度的代币余额快照。`ERC20Votes` 合约通过内部方法来记录这些检查点，以便在计算投票权重时可以引用这些历史数据。这样，无论代币在未来如何流动，都可以根据过去的状态来确定投票权重。

在上面提供的代码段中，`checkpoints` 函数可以用来查询特定账户在某个检查点的代币余额，这就是实现基于历史数据投票权重计算的基础。

## Vote.sol

```solidity title="contracts/governance/utils/Votes.sol"
// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (governance/utils/Votes.sol)
pragma solidity ^0.8.20;

import {IERC5805} from "../../interfaces/IERC5805.sol";
import {Context} from "../../utils/Context.sol";
import {Nonces} from "../../utils/Nonces.sol";
import {EIP712} from "../../utils/cryptography/EIP712.sol";
import {Checkpoints} from "../../utils/structs/Checkpoints.sol";
import {SafeCast} from "../../utils/math/SafeCast.sol";
import {ECDSA} from "../../utils/cryptography/ECDSA.sol";
import {Time} from "../../utils/types/Time.sol";

/**
 * @dev This is a base abstract contract that tracks voting units, which are a measure of voting power that can be
 * transferred, and provides a system of vote delegation, where an account can delegate its voting units to a sort of
 * "representative" that will pool delegated voting units from different accounts and can then use it to vote in
 * decisions. In fact, voting units _must_ be delegated in order to count as actual votes, and an account has to
 * delegate those votes to itself if it wishes to participate in decisions and does not have a trusted representative.
 *
 * This contract is often combined with a token contract such that voting units correspond to token units. For an
 * example, see {ERC721Votes}.
 *
 * The full history of delegate votes is tracked on-chain so that governance protocols can consider votes as distributed
 * at a particular block number to protect against flash loans and double voting. The opt-in delegate system makes the
 * cost of this history tracking optional.
 *
 * When using this module the derived contract must implement {_getVotingUnits} (for example, make it return
 * {ERC721-balanceOf}), and can use {_transferVotingUnits} to track a change in the distribution of those units (in the
 * previous example, it would be included in {ERC721-_update}).
 */
abstract contract Votes is Context, EIP712, Nonces, IERC5805 {
    using Checkpoints for Checkpoints.Trace208;

    bytes32 private constant DELEGATION_TYPEHASH =
        keccak256("Delegation(address delegatee,uint256 nonce,uint256 expiry)");

    mapping(address account => address) private _delegatee;

    mapping(address delegatee => Checkpoints.Trace208) private _delegateCheckpoints;

    Checkpoints.Trace208 private _totalCheckpoints;

    /**
     * @dev The clock was incorrectly modified.
     */
    error ERC6372InconsistentClock();

    /**
     * @dev Lookup to future votes is not available.
     */
    error ERC5805FutureLookup(uint256 timepoint, uint48 clock);

    /**
     * @dev Clock used for flagging checkpoints. Can be overridden to implement timestamp based
     * checkpoints (and voting), in which case {CLOCK_MODE} should be overridden as well to match.
     */
    function clock() public view virtual returns (uint48) {
        return Time.blockNumber();
    }

    /**
     * @dev Machine-readable description of the clock as specified in ERC-6372.
     */
    // solhint-disable-next-line func-name-mixedcase
    function CLOCK_MODE() public view virtual returns (string memory) {
        // Check that the clock was not modified
        if (clock() != Time.blockNumber()) {
            revert ERC6372InconsistentClock();
        }
        return "mode=blocknumber&from=default";
    }

    /**
     * @dev Returns the current amount of votes that `account` has.
     */
    function getVotes(address account) public view virtual returns (uint256) {
        return _delegateCheckpoints[account].latest();
    }

    /**
     * @dev Returns the amount of votes that `account` had at a specific moment in the past. If the `clock()` is
     * configured to use block numbers, this will return the value at the end of the corresponding block.
     *
     * Requirements:
     *
     * - `timepoint` must be in the past. If operating using block numbers, the block must be already mined.
     */
    function getPastVotes(address account, uint256 timepoint) public view virtual returns (uint256) {
        uint48 currentTimepoint = clock();
        if (timepoint >= currentTimepoint) {
            revert ERC5805FutureLookup(timepoint, currentTimepoint);
        }
        return _delegateCheckpoints[account].upperLookupRecent(SafeCast.toUint48(timepoint));
    }

    /**
     * @dev Returns the total supply of votes available at a specific moment in the past. If the `clock()` is
     * configured to use block numbers, this will return the value at the end of the corresponding block.
     *
     * NOTE: This value is the sum of all available votes, which is not necessarily the sum of all delegated votes.
     * Votes that have not been delegated are still part of total supply, even though they would not participate in a
     * vote.
     *
     * Requirements:
     *
     * - `timepoint` must be in the past. If operating using block numbers, the block must be already mined.
     */
    function getPastTotalSupply(uint256 timepoint) public view virtual returns (uint256) {
        uint48 currentTimepoint = clock();
        if (timepoint >= currentTimepoint) {
            revert ERC5805FutureLookup(timepoint, currentTimepoint);
        }
        return _totalCheckpoints.upperLookupRecent(SafeCast.toUint48(timepoint));
    }

    /**
     * @dev Returns the current total supply of votes.
     */
    function _getTotalSupply() internal view virtual returns (uint256) {
        return _totalCheckpoints.latest();
    }

    /**
     * @dev Returns the delegate that `account` has chosen.
     */
    function delegates(address account) public view virtual returns (address) {
        return _delegatee[account];
    }

    /**
     * @dev Delegates votes from the sender to `delegatee`.
     */
    function delegate(address delegatee) public virtual {
        address account = _msgSender();
        _delegate(account, delegatee);
    }

    /**
     * @dev Delegates votes from signer to `delegatee`.
     */
    function delegateBySig(
        address delegatee,
        uint256 nonce,
        uint256 expiry,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public virtual {
        if (block.timestamp > expiry) {
            revert VotesExpiredSignature(expiry);
        }
        address signer = ECDSA.recover(
            _hashTypedDataV4(keccak256(abi.encode(DELEGATION_TYPEHASH, delegatee, nonce, expiry))),
            v,
            r,
            s
        );
        _useCheckedNonce(signer, nonce);
        _delegate(signer, delegatee);
    }

    /**
     * @dev Delegate all of `account`'s voting units to `delegatee`.
     *
     * Emits events {IVotes-DelegateChanged} and {IVotes-DelegateVotesChanged}.
     */
    function _delegate(address account, address delegatee) internal virtual {
        address oldDelegate = delegates(account);
        _delegatee[account] = delegatee;

        emit DelegateChanged(account, oldDelegate, delegatee);
        _moveDelegateVotes(oldDelegate, delegatee, _getVotingUnits(account));
    }

    /**
     * @dev Transfers, mints, or burns voting units. To register a mint, `from` should be zero. To register a burn, `to`
     * should be zero. Total supply of voting units will be adjusted with mints and burns.
     */
    function _transferVotingUnits(address from, address to, uint256 amount) internal virtual {
        if (from == address(0)) {
            _push(_totalCheckpoints, _add, SafeCast.toUint208(amount));
        }
        if (to == address(0)) {
            _push(_totalCheckpoints, _subtract, SafeCast.toUint208(amount));
        }
        _moveDelegateVotes(delegates(from), delegates(to), amount);
    }

    /**
     * @dev Moves delegated votes from one delegate to another.
     */
    function _moveDelegateVotes(address from, address to, uint256 amount) private {
        if (from != to && amount > 0) {
            if (from != address(0)) {
                (uint256 oldValue, uint256 newValue) = _push(
                    _delegateCheckpoints[from],
                    _subtract,
                    SafeCast.toUint208(amount)
                );
                emit DelegateVotesChanged(from, oldValue, newValue);
            }
            if (to != address(0)) {
                (uint256 oldValue, uint256 newValue) = _push(
                    _delegateCheckpoints[to],
                    _add,
                    SafeCast.toUint208(amount)
                );
                emit DelegateVotesChanged(to, oldValue, newValue);
            }
        }
    }

    /**
     * @dev Get number of checkpoints for `account`.
     */
    function _numCheckpoints(address account) internal view virtual returns (uint32) {
        return SafeCast.toUint32(_delegateCheckpoints[account].length());
    }

    /**
     * @dev Get the `pos`-th checkpoint for `account`.
     */
    function _checkpoints(
        address account,
        uint32 pos
    ) internal view virtual returns (Checkpoints.Checkpoint208 memory) {
        return _delegateCheckpoints[account].at(pos);
    }

    function _push(
        Checkpoints.Trace208 storage store,
        function(uint208, uint208) view returns (uint208) op,
        uint208 delta
    ) private returns (uint208, uint208) {
        return store.push(clock(), op(store.latest(), delta));
    }

    function _add(uint208 a, uint208 b) private pure returns (uint208) {
        return a + b;
    }

    function _subtract(uint208 a, uint208 b) private pure returns (uint208) {
        return a - b;
    }

    /**
     * @dev Must return the voting units held by an account.
     */
    function _getVotingUnits(address) internal view virtual returns (uint256);
}
```

## 为什么有时钟和检查点？

在区块链上实现投票系统时，时钟和检查点的概念对于确保投票的公正性和安全性至关重要。让我们详细了解它们的作用：

### 时钟（Clock）

在`Votes`合约中，时钟是一个用于确定投票权变化时间的机制。它可以是基于区块号的（默认情况下是这样），也可以是基于时间戳的。这个时钟用于在链上创建投票权的历史记录，这样就可以确保在治理决策中正确地考虑到每个账户在特定时间点的投票权。

为什么需要时钟：

- **防止闪电贷攻击**：通过在特定时点锁定投票权，可以防止所谓的闪电贷攻击，即借用大量代币仅用于投票，然后立即归还的策略。
- **确保历史准确性**：时钟机制确保了在考虑历史投票权时，我们能够准确地回溯到过去的某个特定时间点或区块。

### 检查点（Checkpoints）

检查点是用于追踪每个账户投票权变化的数据结构。每当账户的投票权发生变化时（例如，代币转移、投票权委托变更等），都会创建一个检查点。这样，合约就可以查询到在任何过去的时间点或区块号上，任何账户的投票权数量。

为什么需要检查点：

- **历史查询**：允许合约查询过去任何时间点的投票权，这在投票决策和治理提案中非常重要，因为它允许系统确定在特定时间点有效的投票权总数。
- **防止双重投票**：通过记录投票权的历史变化，可以确保同一份投票权不会在同一个提案上被计算两次。
- **透明度和审计**：检查点提供了一种透明的方式来审计和验证投票权的历史变化，这对于去中心化治理的信任和接受度至关重要。

总之，时钟和检查点机制共同为去中心化治理提供了一个可靠、透明和安全的基础，确保了投票系统的完整性。

## 每个方法的作用

在智能合约中，每个方法通常对应一个特定的功能或行为。在`Votes`合约的上下文中，以下是一些可能存在的方法及其作用：

1. **delegate(address delegatee)**

   - **作用**: 允许持有者将其投票权委托给另一个地址（`delegatee`）。这意味着被委托人（`delegatee`）将能够代表委托人（调用者）投票。

2. **delegateBySig(address delegatee, uint256 nonce, uint256 expiry, uint8 v, bytes32 r, bytes32 s)**

   - **作用**: 允许持有者通过签名来委托其投票权，而不是直接调用合约。这样可以在链下进行委托，节约交易费用，并允许非交互式委托。
   <hr/>

3. **getVotes(address account)**

- **作用**: 返回给定地址（`account`）在当前时刻的投票权数量。

4. **getPastVotes(address account, uint256 blockNumber)**

   - **作用**: 返回给定地址（`account`）在过去某个区块号（`blockNumber`）时的投票权数量。

5. **getPastTotalSupply(uint256 blockNumber)**

   - **作用**: 返回在过去某个区块号（`blockNumber`）时的投票权总供应量。
   <hr/>

6. **\_delegate(address delegator, address delegatee)**

   - **作用**: 内部方法，处理投票权从一个地址（`delegator`）委托给另一个地址（`delegatee`）的逻辑。

7. **\_transferVotingUnits(address from, address to, uint256 amount)**

   - **作用**: 内部方法，处理在地址之间转移投票单位的逻辑。这通常与代币转移挂钩。

8. **\_moveDelegateVotes(address srcRep, address dstRep, uint256 amount)**

   - **作用**: 内部方法，当投票权从一个代表（`srcRep`）转移到另一个代表（`dstRep`）时，更新检查点和投票权计数。

9. **\_getVotingUnits(address account)**

   - **作用**: 虚拟方法，需要由继承`Votes`合约的子合约实现。它应该返回给定地址（`account`）持有的投票单位数量。
   <hr/>

10. **\_mint(address to, uint256 amount)**

    - **作用**: 如果合约也是一个代币合约，这个方法可能被用来铸造新的代币给某个地址（`to`），同时增加该地址的投票单位数量。

11. **\_burn(address from, uint256 amount)**
    - **作用**: 如果合约也是一个代币合约，这个方法可能被用来销毁某个地址（`from`）的代币，同时减少该地址的投票单位数量。

请注意，这些方法的具体实现细节可能会根据合约的具体设计和需求有所不同。上述描述是基于典型的投票权逻辑和 OpenZeppelin 的实践。实际的智能合约可能会包含更多或不同的方法，具体取决于其用途和功能。

## 快照决定投票权重

<p style={{color: 'red'}}>我可以把特定区块理解为特定的时间点，组织者会对这一特定时间点，所有持币人的持币数量来决定投票比重？</p>

是的，您可以这样理解。特定的区块确实代表了区块链上的一个特定时间点。每个区块都是按照时间顺序添加到区块链上的，因此每个区块都有一个独特的时间戳。

在快照投票中，组织者会选择一个特定的区块号（即特定的时间点），并在那个时间点对所有账户的代币余额进行记录。这个记录的快照将用来确定每个持币人在投票中的权重：一个人在快照时拥有的代币越多，他或她在投票中的影响力就越大。

这种机制确保了投票的公平性，因为它基于一个不可变的历史记录（区块链上的数据），而不是基于可能会变化的实时数据。这样，任何在快照之后发生的代币交易都不会影响投票权重，从而防止了在投票期间操纵持币数量来改变投票结果的行为。

## getVotes getPastVotes getPastTotalSupply

这三个方法是在区块链投票系统中查询投票权的常用函数，每个函数都有其特定的用途：

1. **getVotes(address account)**

   - **作用**: 这个方法用于获取指定账户（`account`）在当前最新确认的区块中的投票权数量。这通常用于实时显示用户的投票权，或在即将进行的投票中确定用户的投票能力。

2. **getPastVotes(address account, uint256 blockNumber)**

   - **作用**: 这个方法用于查询指定账户（`account`）在过去某个特定区块号（`blockNumber`）时的投票权数量。这个方法非常重要，因为在投票开始时，系统需要确定在那个特定时间点谁有权投票，以及他们各自有多少投票权。这有助于确保投票的公正性，防止在投票期间改变投票权来影响结果。

3. **getPastTotalSupply(uint256 blockNumber)**
   - **作用**: 这个方法用于获取在过去某个特定区块号（`blockNumber`）时系统内投票权的总供应量。这对于计算投票占比和达成共识非常重要，例如，在某些投票系统中可能需要超过一半的投票权支持才能通过提案。

<p style={{color: 'red'}}>为什么存在这三个方法：</p>

- **实时与历史数据的需求**：`getVotes`提供当前的投票权，而`getPastVotes`和`getPastTotalSupply`提供历史数据。历史数据对于在投票结束后验证投票结果和确保在投票期间的状态未被篡改非常关键。

- **防止操纵**：在投票开始时锁定投票权，可以防止在投票过程中操纵投票权（例如，通过借入代币来增加投票权）。

- **透明度和可验证性**：通过提供这些方法，投票系统可以向所有参与者展示清晰的投票权历史记录，增加系统的透明度，并允许任何人验证投票结果的正确性。

这些方法的存在确保了区块链投票系统的完整性和可信赖性，是去中心化治理和链上投票机制的关键组成部分。
