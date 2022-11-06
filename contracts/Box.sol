// This contract is going to be our Implementation contract(logic)

//SPDX-License-Identifier: MIT

// we are gonna have 1 contract address orignially use the logic in Box SC and then we are gonna upgrade it to the logic in BoxV2
// so we are going to learn all the tools that we have been using to create this logic
pragma solidity ^0.8.7;

contract Box {
    uint256 internal value;

    event ValueChanged(uint256 newValue);

    function store(uint256 newValue) public {
        value = newValue;
        emit ValueChanged(newValue);
    }

    function retreive() public view returns (uint256) {
        return value;
    }

    function version() public pure returns (uint256) {
        return 1;
    }
}
