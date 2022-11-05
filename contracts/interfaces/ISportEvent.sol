// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

interface ISportEvent {
    function mint(address to, uint256[] memory ticketTypes)
        external
        returns (uint256 startId);

    function pause() external;

    function unpause() external;
}
