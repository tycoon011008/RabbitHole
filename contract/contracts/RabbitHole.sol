// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

contract RabbitHole {
    struct Player {
        address player;
        uint256 fuel;
        uint256 speed;
    }

    struct GameData {
        Player[] players;
        uint speed;
    }

    uint256 numOfplayers = 2;

    mapping(uint256 => Player) private players;

    constructor() {
        players[0].fuel = 50;
        players[0].speed = 500;
        players[1].fuel = 50;
        players[1].speed = 600;
    }

    function setPlayerSpeed(uint256 speed) public {
        uint i = 0;
        for (i = 0; i < numOfplayers;i ++) {
            if (players[i].player == msg.sender) {
                break;
            }
        }
        players[i].speed = speed;
        players[i].player = msg.sender;
        if (i == numOfplayers) {
            players[i].fuel = 50;
            numOfplayers++;
        }
    }

    function setPlayerData(uint256 fuel) public {
        uint i = 0;
        for (i = 0; i < numOfplayers;i ++) {
            if (players[i].player == msg.sender) {
                break;
            }
        }
        players[i].fuel = fuel;
    }
    
    function getPlayers() public view returns(GameData memory) {
        Player[] memory _players = new Player[](numOfplayers);
        for(uint i = 0;i < numOfplayers;i ++) {
            _players[i] = players[i];
        }

        uint speed = random();

        GameData memory gameData;
        gameData.players = _players;
        gameData.speed = speed;
        return gameData;
    }

    function random() public view returns(uint) {
        uint seed = uint(keccak256(abi.encodePacked(block.timestamp))) % 300;
        uint adjusted = seed + 500;
        return adjusted;
    }
}