---
sidebar_position: 6
title: SafeERC20
---

## SafeERC20.sol

简单来说，`SafeERC20` 库预先处理了与 ERC-20 代币交互时可能遇到的一些常见问题。它通过封装标准的 ERC-20 函数调用，并在这些调用失败时抛出错误，确保了更高层次的安全性和可靠性。这样，智能合约的开发者就不需要在每次调用 ERC-20 函数时重复编写相同的检查代码，而是可以依赖 `SafeERC20` 提供的方法来处理这些情况。

```solidity
// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC20/utils/SafeERC20.sol)

pragma solidity ^0.8.20;

import {IERC20} from "../IERC20.sol";
import {IERC1363} from "../../../interfaces/IERC1363.sol";
import {Address} from "../../../utils/Address.sol";

/**
 * @title SafeERC20
 * @dev Wrappers around ERC-20 operations that throw on failure (when the token
 * contract returns false). Tokens that return no value (and instead revert or
 * throw on failure) are also supported, non-reverting calls are assumed to be
 * successful.
 * To use this library you can add a `using SafeERC20 for IERC20;` statement to your contract,
 * which allows you to call the safe operations as `token.safeTransfer(...)`, etc.
 */
library SafeERC20 {
    using Address for address;

    /**
     * @dev An operation with an ERC-20 token failed.
     */
    error SafeERC20FailedOperation(address token);

    /**
     * @dev Indicates a failed `decreaseAllowance` request.
     */
    error SafeERC20FailedDecreaseAllowance(address spender, uint256 currentAllowance, uint256 requestedDecrease);

    /**
     * @dev Transfer `value` amount of `token` from the calling contract to `to`. If `token` returns no value,
     * non-reverting calls are assumed to be successful.
     */
    function safeTransfer(IERC20 token, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeCall(token.transfer, (to, value)));
    }

    /**
     * @dev Transfer `value` amount of `token` from `from` to `to`, spending the approval given by `from` to the
     * calling contract. If `token` returns no value, non-reverting calls are assumed to be successful.
     */
    function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeCall(token.transferFrom, (from, to, value)));
    }

    /**
     * @dev Increase the calling contract's allowance toward `spender` by `value`. If `token` returns no value,
     * non-reverting calls are assumed to be successful.
     */
    function safeIncreaseAllowance(IERC20 token, address spender, uint256 value) internal {
        uint256 oldAllowance = token.allowance(address(this), spender);
        forceApprove(token, spender, oldAllowance + value);
    }

    /**
     * @dev Decrease the calling contract's allowance toward `spender` by `requestedDecrease`. If `token` returns no
     * value, non-reverting calls are assumed to be successful.
     */
    function safeDecreaseAllowance(IERC20 token, address spender, uint256 requestedDecrease) internal {
        unchecked {
            uint256 currentAllowance = token.allowance(address(this), spender);
            if (currentAllowance < requestedDecrease) {
                revert SafeERC20FailedDecreaseAllowance(spender, currentAllowance, requestedDecrease);
            }
            forceApprove(token, spender, currentAllowance - requestedDecrease);
        }
    }

    /**
     * @dev Set the calling contract's allowance toward `spender` to `value`. If `token` returns no value,
     * non-reverting calls are assumed to be successful. Meant to be used with tokens that require the approval
     * to be set to zero before setting it to a non-zero value, such as USDT.
     */
    function forceApprove(IERC20 token, address spender, uint256 value) internal {
        bytes memory approvalCall = abi.encodeCall(token.approve, (spender, value));

        if (!_callOptionalReturnBool(token, approvalCall)) {
            _callOptionalReturn(token, abi.encodeCall(token.approve, (spender, 0)));
            _callOptionalReturn(token, approvalCall);
        }
    }

    /**
     * @dev Performs an {ERC1363} transferAndCall, with a fallback to the simple {ERC20} transfer if the target has no
     * code. This can be used to implement an {ERC721}-like safe transfer that rely on {ERC1363} checks when
     * targeting contracts.
     *
     * Reverts if the returned value is other than `true`.
     */
    function transferAndCallRelaxed(IERC1363 token, address to, uint256 value, bytes memory data) internal {
        if (to.code.length == 0) {
            safeTransfer(token, to, value);
        } else if (!token.transferAndCall(to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Performs an {ERC1363} transferFromAndCall, with a fallback to the simple {ERC20} transferFrom if the target
     * has no code. This can be used to implement an {ERC721}-like safe transfer that rely on {ERC1363} checks when
     * targeting contracts.
     *
     * Reverts if the returned value is other than `true`.
     */
    function transferFromAndCallRelaxed(
        IERC1363 token,
        address from,
        address to,
        uint256 value,
        bytes memory data
    ) internal {
        if (to.code.length == 0) {
            safeTransferFrom(token, from, to, value);
        } else if (!token.transferFromAndCall(from, to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Performs an {ERC1363} approveAndCall, with a fallback to the simple {ERC20} approve if the target has no
     * code. This can be used to implement an {ERC721}-like safe transfer that rely on {ERC1363} checks when
     * targeting contracts.
     *
     * NOTE: When the recipient address (`to`) has no code (i.e. is an EOA), this function behaves as {forceApprove}.
     * Opposedly, when the recipient address (`to`) has code, this function only attempts to call {ERC1363-approveAndCall}
     * once without retrying, and relies on the returned value to be true.
     *
     * Reverts if the returned value is other than `true`.
     */
    function approveAndCallRelaxed(IERC1363 token, address to, uint256 value, bytes memory data) internal {
        if (to.code.length == 0) {
            forceApprove(token, to, value);
        } else if (!token.approveAndCall(to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract), relaxing the requirement
     * on the return value: the return value is optional (but if data is returned, it must not be false).
     * @param token The token targeted by the call.
     * @param data The call data (encoded using abi.encode or one of its variants).
     */
    function _callOptionalReturn(IERC20 token, bytes memory data) private {
        // We need to perform a low level call here, to bypass Solidity's return data size checking mechanism, since
        // we're implementing it ourselves. We use {Address-functionCall} to perform this call, which verifies that
        // the target address contains contract code and also asserts for success in the low-level call.

        bytes memory returndata = address(token).functionCall(data);
        if (returndata.length != 0 && !abi.decode(returndata, (bool))) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract), relaxing the requirement
     * on the return value: the return value is optional (but if data is returned, it must not be false).
     * @param token The token targeted by the call.
     * @param data The call data (encoded using abi.encode or one of its variants).
     *
     * This is a variant of {_callOptionalReturn} that silents catches all reverts and returns a bool instead.
     */
    function _callOptionalReturnBool(IERC20 token, bytes memory data) private returns (bool) {
        // We need to perform a low level call here, to bypass Solidity's return data size checking mechanism, since
        // we're implementing it ourselves. We cannot use {Address-functionCall} here since this should return false
        // and not revert is the subcall reverts.

        (bool success, bytes memory returndata) = address(token).call(data);
        return success && (returndata.length == 0 || abi.decode(returndata, (bool))) && address(token).code.length > 0;
    }
}
```

## 代码释义及为什么安全

在 Solidity 中，`SafeERC20` 是一个库，它提供了一组函数，用以安全地与遵循 ERC-20 标准的代币合约进行交互。这个库是由 OpenZeppelin 提供的，它解决了一些 ERC-20 代币实现中可能存在的问题，比如没有返回值的函数调用或者返回错误的布尔值。`SafeERC20` 通过确保每次代币操作都成功执行，或者在失败时抛出错误，来提高合约代码的安全性。

下面是每个方法的意义以及它们为何安全：

1. **safeTransfer**

   安全地将 `value` 数量的 `token` 从调用合约转移到 `to` 地址。如果 `token` 没有返回值，非回退调用被假定为成功。这是安全的，因为如果代币合约的 `transfer` 函数失败了，`_callOptionalReturn` 会检测到并且抛出错误。

2. **safeTransferFrom**

   安全地从 `from` 地址向 `to` 地址转移 `value` 数量的 `token`，使用 `from` 地址给调用合约的批准。与 `safeTransfer` 类似，这个方法通过 `_callOptionalReturn` 包装 `transferFrom` 调用来确保操作的安全性。

3. **safeIncreaseAllowance**

   安全地增加调用合约对 `spender` 地址的批准额度 `value`。这是通过调用 `forceApprove` 实现的，它确保即使在代币合约不返回任何值的情况下，批准也会成功设置。

4. **safeDecreaseAllowance**

   安全地减少调用合约对 `spender` 地址的批准额度 `requestedDecrease`。如果当前批准额度小于请求减少的额度，会抛出错误。

5. **forceApprove**

   强制设置调用合约对 `spender` 地址的批准额度为 `value`。这对于某些需要将批准额度设置为零再设置为非零值的代币（如 USDT）是有用的。

6. **transferAndCallRelaxed**

   执行一个 `ERC1363` 的 `transferAndCall` 操作，如果目标没有代码，则回退到简单的 `ERC20` 转账。这是一种安全的转账方式，它在目标是合约时依赖 `ERC1363` 检查。

7. **transferFromAndCallRelaxed**

   执行一个 `ERC1363` 的 `transferFromAndCall` 操作，如果目标没有代码，则回退到简单的 `ERC20` `transferFrom`。它的安全性与 `transferAndCallRelaxed` 类似。

8. **approveAndCallRelaxed**

   执行一个 `ERC1363` 的 `approveAndCall` 操作，如果目标没有代码，则表现为 `forceApprove`。如果目标有代码，则依赖于返回值为真。

9. **\_callOptionalReturn**

   模拟 Solidity 高级别调用（即对合约的常规函数调用），放宽对返回值的要求：返回值是可选的（但如果返回数据，则必须不为假）。

10. **\_callOptionalReturnBool**

    这是 `_callOptionalReturn` 的一个变体，它在所有回退情况下都会返回布尔值而不是抛出错误。

这些函数之所以“安全”，是因为它们通过检查 ERC-20 代币合约的返回值来确保每次操作都按预期成功。如果操作失败，它们会抛出错误，这样调用这些函数的合约就可以处理这些错误，而不是假设操作已成功。这避免了在代币交互中可能出现的一些常见问题，如忽略返回值或错误处理。
