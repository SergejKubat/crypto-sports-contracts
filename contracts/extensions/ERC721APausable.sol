// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/security/Pausable.sol";

import "./ERC721A.sol";

abstract contract ERC721APausable is ERC721A, Pausable {
    function _beforeTokenTransfers(
        address from,
        address to,
        uint256 startTokenId,
        uint256 quantity
    ) internal virtual override {
        super._beforeTokenTransfers(from, to, startTokenId, quantity);

        require(!paused(), "ERC721Pausable: token transfer while paused");
    }
}
