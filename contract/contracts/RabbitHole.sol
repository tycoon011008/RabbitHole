// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/access/Ownable.sol";

contract RabbitHole is Ownable {
    struct Player {
        address player;
        uint256 fuel;
        uint256 speed;
	    bool alive;
    }

    uint256 numOfplayers = 2;

    Player[] private players;
    // mapping(uint256 => Player) private players;

    constructor(address initialAddress) Ownable(initialAddress) {
        players.push(Player({
            player: address(0),
            fuel: 50,
            speed: 500,
            alive: true
        }));
        players.push(Player({
            player: address(0),
            fuel: 50,
            speed: 600,
            alive: true
        }));
    }

    function setPlayerSpeed(uint256 speed) public {
        uint i = 0;
        for (i = 0; i < numOfplayers;i ++) {
            if (players[i].player == msg.sender) {
                players[i].speed = speed;
                return;
            }
        }
        numOfplayers++;
        players.push(Player({
            player: msg.sender,
            fuel: 50,
            speed: speed,
            alive: true
        }));
    }

    function setPlayerData(uint256 fuel) public {
        uint i = 0;
        // uint playerSpeed = 0;
        uint index = 0;
        for (i = 0; i < numOfplayers;i ++) {
            if (players[i].player == msg.sender) {
                players[i].fuel = fuel;
                if (fuel == 0)
                    players[i].alive = false;
                
                for (index = 0;index<numOfplayers; index ++) {
                    if(players[i].speed > players[index].speed && index != i) {
                        return;
                    }
                }
                players[i].alive = false;
            }
        }
    }
    
    function getPlayers() public view returns(Player[] memory) {
        // Player[] memory _players = new Player[](numOfplayers);
        // for(uint i = 0;i < numOfplayers;i ++) {
        //     _players[i] = players[i];
        // }

        // uint speed = random();

        // GameData memory gameData;
        // gameData.players = _players;
        // gameData.speed = speed;
        // return gameData;
        return players;
    }

    function setPlayerAlive(bool alive) public onlyOwner {
        uint i = 0;
        for (i = 0;i < numOfplayers;i ++) {
            if (players[i].player == msg.sender) {
                players[i].alive = alive;
                return;
            }
        }
    }

    function random() public view returns(uint) {
        uint seed = uint(keccak256(abi.encodePacked(block.timestamp))) % 300;
        uint adjusted = seed + 500;
        return adjusted;
    }
}
