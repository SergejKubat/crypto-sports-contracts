// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "./IERC721A.sol";

/**
 * @dev Interface of an ERC721ABurnable compliant contract.
 */
interface IERC721ABurnable is IERC721A {
    /**
     * @dev Burns `tokenId`. See {ERC721A-_burn}.
     *
     * Requirements:
     *
     * - The caller must own `tokenId` or be an approved operator.
     */
    function burn(uint256 tokenId) external;
}
