// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/AccessControl.sol";

import "./interfaces/ISportEventFactory.sol";
import "./SportEvent.sol";

contract SportEventFactory is ISportEventFactory, AccessControl {
    // STATE VARIABLES

    bytes32 public constant SPORT_EVENT_CREATOR_ROLE = keccak256("SPORT_EVENT_CREATOR_ROLE");

    // FUNCTIONS

    // constructor

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(SPORT_EVENT_CREATOR_ROLE, msg.sender);
    }

    // external

    function createEvent(
        string memory baseURI,
        string memory name,
        string memory symbol,
        uint256[] memory ticketTypes,
        uint256 index
    ) external override returns (address) {
        require(hasRole(SPORT_EVENT_CREATOR_ROLE, msg.sender), "Caller isn't authorized to create new event.");

        bytes32 salt = keccak256(abi.encodePacked(name, index));

        return address(new SportEvent{salt: salt}(baseURI, name, symbol, ticketTypes, msg.sender));
    }
}
