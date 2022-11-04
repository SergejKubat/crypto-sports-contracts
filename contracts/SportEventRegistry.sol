// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SportEventRegistry is AccessControl, ReentrancyGuard {
    // TYPE DECLARATIONS

    struct SportEventStruct {
        address sportEventAddress;
        address creator;
        string baseURI;
        string name;
        string symbol;
        uint256 endTimestamp;
        bool active;
    }

    // STATE VARIABLES

    bytes32 public constant SPORT_EVENT_CREATOR_ROLE =
        keccak256("SPORT_EVENT_CREATOR_ROLE");

    // SportEventFactory contract address
    address public immutable factory;

    // array of all created sport events addresses
    address[] private _events;

    //mapping(address => SportEventStruct) private getEvent;

    // map sport events to ticket amounts per ticket type (0, 1, 2, 3)
    mapping(address => mapping(uint256 => uint256)) private _amounts;

    // map sport events to ticket prices per ticket type (0, 1, 2, 3)
    mapping(address => mapping(uint256 => uint256)) private _prices;

    // map accounts to ticket purchases per sport events
    mapping(address => mapping(address => uint256)) private _purchases;

    // map accounts to earnings from sport events
    mapping(address => mapping(address => uint256)) private _earnings;

    // EVENTS

    // emits when new sport event is created
    event SportEventCreated(
        address sportEventAddress,
        address creator,
        string baseURI,
        string name,
        uint256 endTimestamp
    );

    // emits when existing sport event is paused
    event SportEventPaused(address eventAddress);

    // emits when existing sport event is unpaused
    event SportEventUnpaused(address eventAddress);

    // emits when ticket is sold
    event TicketsSold(
        address sportEventAddress,
        address to,
        uint256[] ticketTypes,
        uint256 startId
    );

    // emits when earnings are withdrew
    event EarningsWithdrew(
        address sportEventAddress,
        address to,
        uint256 amount
    );

    // FUNCTIONS

    // constructor

    constructor(address _factory) {
        factory = _factory;

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(SPORT_EVENT_CREATOR_ROLE, msg.sender);
    }

    // external

    // get number of purchased tickets for specific account
    function getPurchases(address walletAddress, address sportEventAdress)
        external
        view
        returns (uint256)
    {
        return _purchases[walletAddress][sportEventAdress];
    }

    // get amount of available tickets for specific ticket type
    function getAmount(address sportEventAddress, uint256 ticketType)
        external
        view
        returns (uint256)
    {
        return _amounts[sportEventAddress][ticketType];
    }

    // get amounts of available tickets fot all ticket types
    function getAmounts(address sportEventAddress, uint256[] memory ticketTypes)
        external
        view
        returns (uint256[] memory)
    {
        return _getAmounts(sportEventAddress, ticketTypes);
    }

    // get price of available tickets for specific ticket type
    function getPrice(address sportEventAddress, uint256 ticketType)
        external
        view
        returns (uint256)
    {
        return _prices[sportEventAddress][ticketType];
    }

    // get prices of available tickets fot all ticket types
    function getPrices(address sportEventAddress, uint256[] memory ticketTypes)
        external
        view
        returns (uint256[] memory)
    {
        return _getPrices(sportEventAddress, ticketTypes);
    }

    // withdraw from specific sport event
    function withdraw(address sportEventAddress, uint256 amount)
        external
        nonReentrant
    {
        require(amount > 0, "Invalid amount.");
        require(
            _earnings[msg.sender][sportEventAddress] >= amount,
            "The amount is greater than earning."
        );

        // send specified amount
        payable(msg.sender).transfer(amount);

        // update earnings
        _earnings[msg.sender][sportEventAddress] =
            _earnings[msg.sender][sportEventAddress] -
            amount;

        emit EarningsWithdrew(sportEventAddress, msg.sender, amount);
    }

    // internal

    // get all amounts of available tickets fot all ticket types
    function _getAmounts(
        address sportEventAddress,
        uint256[] memory ticketTypes
    ) internal view returns (uint256[] memory) {
        uint256[] memory amounts = new uint256[](ticketTypes.length);

        for (uint256 i = 0; i < ticketTypes.length; i++) {
            amounts[i] = _amounts[sportEventAddress][ticketTypes[i]];
        }

        return amounts;
    }

    // get all prices amounts of available tickets fot all ticket types
    function _getPrices(address sportEventAddress, uint256[] memory ticketTypes)
        internal
        view
        returns (uint256[] memory)
    {
        uint256[] memory prices = new uint256[](ticketTypes.length);

        for (uint256 i = 0; i < ticketTypes.length; i++) {
            prices[i] = _prices[sportEventAddress][ticketTypes[i]];
        }

        return prices;
    }
}
