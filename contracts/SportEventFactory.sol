// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/AccessControl.sol";

import "./SportEvent.sol";

contract SportEventFactory is AccessControl {
    // STATE VARIABLES

    bytes32 public constant SPORT_EVENT_CREATOR_ROLE =
        keccak256("SPORT_EVENT_CREATOR_ROLE");

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
    ) external returns (address eventAddress) {
        require(
            hasRole(SPORT_EVENT_CREATOR_ROLE, msg.sender),
            "Caller isn't authorized to create new event."
        );

        bytes memory bytecode = getSportEventBytecode(
            baseURI,
            name,
            symbol,
            ticketTypes,
            msg.sender
        );

        bytes32 salt = keccak256(abi.encodePacked(name, index));

        eventAddress = deploy(bytecode, salt);
    }

    // internal

    function getSportEventBytecode(
        string memory baseURI,
        string memory name,
        string memory symbol,
        uint256[] memory ticketTypes,
        address registryAddress
    ) internal pure returns (bytes memory) {
        return
            abi.encodePacked(
                type(SportEvent).creationCode,
                abi.encode(baseURI, name, symbol, ticketTypes, registryAddress)
            );
    }

    function deploy(bytes memory bytecode, bytes32 salt)
        internal
        returns (address)
    {
        address sportEventAddress;

        assembly {
            sportEventAddress := create2(
                0,
                add(bytecode, 0x20),
                mload(bytecode),
                salt
            )

            if iszero(extcodesize(sportEventAddress)) {
                revert(0, 0)
            }
        }

        return sportEventAddress;
    }
}
