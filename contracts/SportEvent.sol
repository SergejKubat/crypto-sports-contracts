// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "./extensions/ERC721A.sol";
import "./extensions/ERC721APausable.sol";
import "./extensions/ERC721ABurnable.sol";

import "./interfaces/ISportEvent.sol";

contract SportEvent is ISportEvent, ERC721A, ERC721APausable, ERC721ABurnable {
    // STATE VARIABLES

    string private _baseTokenURI;

    // FUNCTIONS

    // constructor

    constructor(
        string memory baseTokenURI,
        string memory name,
        string memory symbol,
        uint256[] memory ticketTypes,
        address registry
    ) ERC721A(name, symbol, ticketTypes) {
        _baseTokenURI = baseTokenURI;

        transferOwnership(registry);
    }

    // external

    function mint(address to, uint256[] memory ticketTypes) external onlyOwner returns (uint256 startId) {
        require(to != address(0), "ERC721: mint to the zero address");

        startId = _nextTokenId();

        _mint(to, ticketTypes);
    }

    // public

    function pause() public virtual onlyOwner {
        _pause();
    }

    function unpause() public virtual onlyOwner {
        _unpause();
    }

    // internal

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function _beforeTokenTransfers(
        address from,
        address to,
        uint256 startTokenId,
        uint256 quantity
    ) internal virtual override(ERC721A, ERC721APausable) {
        super._beforeTokenTransfers(from, to, startTokenId, quantity);
        require(!paused(), "ERC721Pausable: token transfer while paused");
    }
}
