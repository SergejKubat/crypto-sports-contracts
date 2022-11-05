// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

interface ISportEventFactory {
    function createEvent(
        string memory baseURI,
        string memory name,
        string memory symbol,
        uint256[] memory ticketTypes,
        uint256 index
    ) external returns (address eventAddress);
}
