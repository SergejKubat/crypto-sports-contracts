// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "./interfaces/ISportEventFactory.sol";
import "./interfaces/ISportEvent.sol";

// import "hardhat/console.sol";

contract SportEventRegistry is AccessControl, ReentrancyGuard {
    // TYPE DECLARATIONS

    struct SportEventStruct {
        address sportEventAddress;
        address creator;
        address organizer;
        string baseURI;
        string name;
        string symbol;
        uint32 endTimestamp;
        bool active;
    }

    // STATE VARIABLES

    address private _owner;

    // track count of events
    uint256 private _eventsCount = 0;

    bytes32 public constant SPORT_EVENT_CREATOR_ROLE = keccak256("SPORT_EVENT_CREATOR_ROLE");

    // SportEventFactory contract address
    address public immutable factory;

    // map sport events addresses to sport events details
    mapping(address => SportEventStruct) private _events;

    // map sport events to ticket amounts per ticket type (0, 1, 2, 3)
    mapping(address => mapping(uint256 => uint256)) private _amounts;

    // map sport events to ticket prices per ticket type (0, 1, 2, 3)
    mapping(address => mapping(uint256 => uint256)) private _prices;

    // map accounts to ticket purchases per sport events
    mapping(address => mapping(address => uint256)) private _purchases;

    // map accounts to balances from sport events
    mapping(address => mapping(address => uint256)) private _balances;

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
    event TicketsSold(address sportEventAddress, address to, uint256[] ticketTypes, uint256 startId);

    // emits when earnings are withdrew
    event EarningsWithdrew(address sportEventAddress, address to, uint256 amount);

    // FUNCTIONS

    // constructor

    constructor(address _factory) {
        _owner = msg.sender;
        factory = _factory;

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(SPORT_EVENT_CREATOR_ROLE, msg.sender);
    }

    // external

    // get number of purchased tickets for specific account and sport event
    function getPurchases(address walletAddress, address sportEventAdress) external view returns (uint256) {
        return _purchases[walletAddress][sportEventAdress];
    }

    // get amount of available tickets for specific ticket type
    function getAmount(address sportEventAddress, uint256 ticketType) external view returns (uint256) {
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
    function getPrice(address sportEventAddress, uint256 ticketType) external view returns (uint256) {
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

    function getBalance(address sportEventAddress) external view returns (uint256) {
        return _balances[msg.sender][sportEventAddress];
    }

    // withdraw funds from specific sport event
    function withdraw(address sportEventAddress, uint256 amount) external nonReentrant {
        require(amount > 0, "Invalid amount.");
        require(_balances[msg.sender][sportEventAddress] >= amount, "The amount is greater than earning.");

        // send specified amount
        payable(msg.sender).transfer(amount);

        // update earnings
        _balances[msg.sender][sportEventAddress] = _balances[msg.sender][sportEventAddress] - amount;

        emit EarningsWithdrew(sportEventAddress, msg.sender, amount);
    }

    // create new sport event
    function createSportEvent(
        string memory baseURI,
        string memory name,
        string memory symbol,
        uint256[] memory amounts,
        uint256[] memory prices,
        address organizerAddress,
        uint32 endTimestamp
    ) external {
        require(hasRole(SPORT_EVENT_CREATOR_ROLE, msg.sender), "Caller isn't authorized to create new event.");
        require(amounts.length == prices.length, "Prices and amounts must be same size.");

        // determine supported ticket types
        uint256[] memory ticketTypes = new uint256[](amounts.length);

        for (uint256 i = 0; i < amounts.length; i++) {
            ticketTypes[i] = i;
        }

        // deploy and get new sport event address
        address sportEventAddress = ISportEventFactory(factory).createEvent(
            baseURI,
            name,
            symbol,
            ticketTypes,
            _eventsCount
        );

        // update events counter
        _eventsCount = _eventsCount + 1;

        // update amounts and prices
        for (uint256 i = 0; i < amounts.length; i++) {
            _amounts[sportEventAddress][i] = amounts[i];
            _prices[sportEventAddress][i] = prices[i];
        }

        // add new sport event to map
        _events[sportEventAddress] = SportEventStruct(
            sportEventAddress,
            msg.sender,
            organizerAddress,
            baseURI,
            name,
            symbol,
            endTimestamp,
            true
        );

        emit SportEventCreated(sportEventAddress, msg.sender, baseURI, name, endTimestamp);
    }

    // pause sport event
    function pauseEvent(address sportEventAddress) external {
        require(hasRole(SPORT_EVENT_CREATOR_ROLE, msg.sender), "Caller isn't authorized to pause an event.");
        require(_events[sportEventAddress].sportEventAddress != address(0), "Event doesn't exist.");
        require(_events[sportEventAddress].active != false, "Event is already paused.");

        // update sport event flag
        _events[sportEventAddress].active = false;

        // pause sport event
        ISportEvent(sportEventAddress).pause();

        emit SportEventPaused(sportEventAddress);
    }

    // unpause sport event
    function unpauseEvent(address sportEventAddress) external {
        require(hasRole(SPORT_EVENT_CREATOR_ROLE, msg.sender), "Caller isn't authorized to pause an event.");
        require(_events[sportEventAddress].sportEventAddress != address(0), "Event doesn't exist.");
        require(_events[sportEventAddress].active != true, "Event is already active.");

        // update sport event flag
        _events[sportEventAddress].active = true;

        // pause sport event
        ISportEvent(sportEventAddress).unpause();

        emit SportEventUnpaused(sportEventAddress);
    }

    // buy tickets for the provided sport event
    function buyTickets(address sportEventAddress, uint256[] memory ticketTypes) external payable nonReentrant {
        require(_events[sportEventAddress].sportEventAddress != address(0), "Event doesn't exist.");
        require(ticketTypes.length > 0, "Ticket types cannot be 0.");
        require(_events[sportEventAddress].endTimestamp > block.timestamp, "The event has passed.");

        uint256 totalPrice = 0;

        // calculate total price
        for (uint256 i = 0; i < ticketTypes.length; i++) {
            // check if there is enought amount of tickets
            require(_amounts[sportEventAddress][ticketTypes[i]] > 0, "Not enough tickets.");
            // add specific ticket type price to total price
            totalPrice = totalPrice + _prices[sportEventAddress][ticketTypes[i]];
            // decrement amount of specific ticket type
            _amounts[sportEventAddress][ticketTypes[i]] = _amounts[sportEventAddress][ticketTypes[i]] - 1;
        }

        // check payment
        require(msg.value >= totalPrice, "Insufficient funds.");

        // mint tickets
        uint256 startId = ISportEvent(sportEventAddress).mint(msg.sender, ticketTypes);

        // if exceed amount return change
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }

        // update organizer balances
        address organizerAddress = _events[sportEventAddress].organizer;

        uint256 organizerShare = (totalPrice * 9) / 10;

        _balances[organizerAddress][sportEventAddress] = _balances[organizerAddress][
            sportEventAddress
        ] += organizerShare;

        // update admin balances
        uint256 adminShare = totalPrice - organizerShare;

        _balances[_owner][sportEventAddress] = _balances[_owner][sportEventAddress] + adminShare;

        // update purchases
        _purchases[msg.sender][sportEventAddress] = _purchases[msg.sender][sportEventAddress] + ticketTypes.length;

        emit TicketsSold(sportEventAddress, msg.sender, ticketTypes, startId);
    }

    // internal

    // get all amounts of available tickets fot all ticket types
    function _getAmounts(address sportEventAddress, uint256[] memory ticketTypes)
        internal
        view
        returns (uint256[] memory)
    {
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
