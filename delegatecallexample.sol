// SPDX-License-Identifier: MIT
// Be sure to check out solidity-by-example
// https://solidity-by-example.org/delegatecall
pragma solidity ^0.8.13;

// NOTE: Deploy this contract first
contract B {
    // NOTE: storage layout must be the same as contract A
    uint public num;
    address public sender;
    uint public value;

    function setVars(uint _num) public payable {
        num = _num;
        sender = msg.sender;
        value = msg.value;
    }
}

contract A {
    uint public BlaVlaue; // we have tested changing the type of this variable here to:
    // 1. bool      > this way it will still work and pass the tx, but upon retreive it will just return true/false based on if the value you saved was either >= zero then true or false if it is zero
    // 2. address   >
    address public idiotAddress;
    uint public poorAmount;

    function setVars(address _contract, uint _num) public payable {
        // A's storage is set, B is not modified.
        (bool success, bytes memory data) = _contract.delegatecall(
            abi.encodeWithSignature("setVars(uint256)", _num)
        );
    }

    // whats going on behind the scenes in these contracts delegate call:
    //its just borrowing the function /**setVars*/ of contractB and calling it here
    //even if you dont have variables in the contract A it will still be storing the values in the storage slots;
    // function setVars(uint _num) public payable {
    //  //   num = _num;
    //    //storageSlot[0] = _num;
    //     BlaVlaue = _num;
    //     //storageSlot[1] = idiotAddress;
    //     idiotAddress = msg.sender;
    //     //storageSlot[2] = poorAmount;
    //     poorAmount = msg.value;
}
