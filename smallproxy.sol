// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

//importing proxy.sol from openzeppelin
// openzeppelin has this minimalistic proxy contract that we can use to start working with this delegate call
//  This contract uses alot of assembly or something called /**yul */ which is an intermediate language that can be compiled to bytecode for different backends
//its sort of inline assembly inside solidity it allows us to to write low level codes close to the opcodes\
//even if somebody is very advanced code, he is advised to not use Yul much, as it is very low level so there are lots of chances to mess things up

import "@openzeppelin/contracts/proxy/Proxy.sol";

// so the Proxy.sol uses a delegate function which has implementation of code written in Yul; ok so the SC also uses receive and fallback function; whenever
//the SC receive a function call that it doesnt recognize,  the recieve function calls the fallback function and it in turn calls the delegatecall to an implementation proxy

/*Storage*/
// to work with proxies, we dont want to have anything in Storage
//because if we do delegate calls and delegatecalls changes some storage we will be messing up our SCs' storage
//  we still need to store that implementations address somewhere so we can call it
//  EIP-1967: Standard Proxy Storage Slots  > it is an ETH improvement proposals for having certain storage slots specifically used for proxies

////so this contract has a function called setImplementation so we have coded such that anytime we call this proxy contract; we are going to delegatecall functions to implementationA
contract SmallProxy is Proxy {
    // This is the keccak-256 hash of "eip1967.proxy.implementation" subtracted by 1

    /**EIP-1967 we have to set implementation slot to that location in storage */
    //so in this Implementation slot we are saving the address of the implementation contract in storage
    bytes32 private constant _IMPLEMENTATION_SLOT =
        0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

    // this function will change where those delegate calls are going to be sending
    // this can be equivalent to like upgrading our SC
    function setImplementation(address newImplementation) public {
        assembly {
            sstore(_IMPLEMENTATION_SLOT, newImplementation)
        }
    }

    //then we have this _implementation function which reads what implementataion contract is

    function _implementation()
        internal
        view
        override
        returns (address implementationAddress)
    {
        assembly {
            implementationAddress := sload(_IMPLEMENTATION_SLOT)
        }
    }

    //lets make it easier to figure out how to get that DATA that we need to use in the setValue function on implementationA contract
    // *helper function**/
    function getDataToTransact(
        uint256 numberToUpdate //giving this a number to we want to call a new Value
    ) public pure returns (bytes memory) {
        //getting the DATA that we need
        //calling anything with its raw bytes
        return abi.encodeWithSignature("setValue(uint256)", numberToUpdate);
    }

    //we know when we call ImplementationA, from our SmallProxy we are going to update our smallProxy storage
    //so we are gonna create a function to read from smallProxy Storage
    function readStorage()
        public
        view
        returns (uint256 valueAtStorageSlotZero)
    {
        assembly {
            valueAtStorageSlotZero := sload(0) //":=" this is how we set things > we are setting it at sload index 0, remember sload is the command
            //to read from storage slot
        }
    }
}

// when we call implementationA from our smallPrxoy SC we are gonna update our smallProxy storage; so we are gonna create a function to read from Storage
//so now anytime somebody call small proxy contract, its gonna delegate call it over to our ImplementationA and save the storage in our small proxy address
//SO we are gonna call our small proxy with the DATA to use this setValue function selector

contract ImplementationA {
    uint256 public value;

    function setValue(uint256 newValue) public {
        value = newValue;
    }
}

contract ImplementationB {
    uint256 public value;

    function setValue(uint256 newValue) public {
        value = newValue + 2;
    }
}

// function setImplementation(){}
// Transparent Proxy -> Ok, only admins can call functions on the proxy
// anyone else ALWAYS gets sent to the fallback contract.

// UUPS -> Where all upgrade logic is in the implementation contract, and
// you can't have 2 functions with the same function selector.
