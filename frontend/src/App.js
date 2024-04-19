import './App.css';
import { useState, useEffect, useRef, createRef } from 'react';
import { ethers } from 'ethers';
import rabbit from './artifacts/contracts/RabbitHole.sol/RabbitHole.json';
import { useSDK } from "@metamask/sdk-react";
import {
  Row,
  Col,
  Table,
  Button,
  Image,
  InputNumber,
  Spin,
  Tag
} from 'antd';

function App() {
  const contractAddress = "0x57830C221Eb19d5f6d3Bc758e659F0709ef37e14";
  const rpcUrl = "https://sepolia.infura.io/v3/a27749044b104f099370a5b6c5ea2914";
  const privateKey = "0x244ac182355e773cef95391540ae9f73970798d17dc8330a3a03237e3e37ca7c";
  const [flag, setFlag] = useState(false);
  const [account, setAccount] = useState();
  const { sdk, connected, connecting, provider, chainId } = useSDK();
  const [speed, setSpeed] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [idealSpeed, setIdealSpeed] = useState(1);
  const [state, setState] = useState('ready');
  const [phase, setPhase] = useState('Default');
  const [last, setLast] = useState('1');

  const ColorList = ['#f56a00', '#7265e6', '#ffbf00', '#87d068'];
  
  const [players, setPlayers] = useState([
    {key: '1', id: 'Player 1', player: 'Bot 1', src: 'https://i.ibb.co/SN7JyMF/sheeepy.png', fuel: 50, speed: 5, status: 'ready', position: 0},
    {key: '2', id: 'Player 2', player: 'Bot 2', src: 'https://i.ibb.co/SN7JyMF/sheeepy.png', fuel: 50, speed: 5, status: 'ready', position: 0},
    {key: '3', id: 'Player 3', player: 'Player', src: 'https://i.ibb.co/vXGDsDD/blacksheep.png', fuel: 50, speed: 5, status: 'ready', position: 0}
  ])

  const columns = [
    {
      title: 'Player',
      dataIndex: 'player',
      key: 'player',
    },
    {
      title: 'Speed',
      dataIndex: 'speed',
      key: 'speed',
      render: item => flag == false ? '-' : item
    },
    {
      title: 'Fuel',
      dataIndex: 'fuel',
      key: 'fuel',
      render: item => flag == false ? '-' : item
    },
    // {
    //   title: 'Status',
    //   dataIndex: 'status',
    //   key: 'status',
    //   render: (item) => (
    //     <>
    //       {item == 'ready' && <Avatar style={{ backgroundColor: ColorList[2], verticalAlign: 'middle' }} size="small" />}
    //       {item == 'success' && <Avatar style={{ backgroundColor: ColorList[3], verticalAlign: 'middle' }} size="small" />}
    //       {item == 'failed' && <Avatar style={{ backgroundColor: ColorList[0], verticalAlign: 'middle' }} size="small" />}
    //     </>
    //   )
    // },
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
      render: (item, record) => (
        <>
          {record.status == 'ready' && '-'}
          {record.status == 'success' && <span>{record.position + 1}</span>}
          {record.status == 'failed' && <span>Loser</span>}
        </>
      )
    }
  ];

  const connect = async () => {
    try {
        const accounts = await sdk?.connect();
        setAccount(accounts?.[0]);
    } catch (err) {
        console.warn("failed to connect..", err);
    }
  };

  const getData = async () => {
    setIsLoading(true);
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, rabbit.abi, signer);

    const tx = await contract.setPlayerSpeed(speed * 100);
    await tx.wait();

    const datas = await contract.getPlayers();
    setIsLoading(false);
    return datas;
  }

  const handleChangeSpeed = async () => {
    if (state == 'start') {
      return;
    }
    setIsLoading(true);
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, rabbit.abi, signer);
    
    const tx = await contract.setPlayerSpeed(speed * 100);
    await tx.wait();
    
    const datas = await contract.getPlayers();
    console.log(datas[0][1]);
    setFlag(true);
    setIsLoading(false);
    // const datas = getData();
    let data = [
      {fuel: parseInt(datas[0][1]), speed: parseInt(datas[0][2]), alive: datas[0][3]},
      {fuel: parseInt(datas[1][1]), speed: parseInt(datas[1][2]), alive: datas[1][3]},
      {fuel: parseInt(datas[2][1]), speed: parseInt(datas[2][2]), alive: datas[2][3]},
    ];
    
    setIdealSpeed((parseInt(datas[1]) / 100).toFixed(0));

    setPlayers(players.map((item, index) => {
      return {
        ...item,
        fuel: data[index].fuel,
        speed: (data[index].speed / 100).toFixed(0),
        status: data[index].alive == true ? 'ready' : 'failed'
      }
    }));
    if (data[2].alive == false)
      setFlag(false);
  }

  const handleStartEvent = () => {
    let data = players.sort((a, b) => b.speed - a.speed);
    let pos = 0;
    data = data.map((item, index) => {
      if (index == 0) {
        item.position = pos;
      }
      else {
        if (parseFloat(item.speed) == parseFloat(data[index - 1].speed))
          item.position = pos;
        else {
          item.position = pos + 1;
          pos++;
        }
      }
      return item;
    })

    setLast(pos);

    setPlayers(players.map((item) => {
      let idx = data.findIndex(ele => ele.id == item.id);
      if (idx >= 0) {
        return {
          ...item,
          position: data[idx].position
        }
      }
      return item;
    }))

    setState('start');
    setPhase('CloseTunnel'); // Close tunnel: Head moves to swallow everything. Open tunnel: cars get out
    setTimeout(() => setPhase('OpenTunnel'), 5000); 
    setTimeout(() => setPhase('Reset'), 16000);
    // setState('ready');
  }

  useEffect(() => {
    let intervalId;
    if (phase == 'OpenTunnel') {
      intervalId = setTimeout(() => {
        setPlayers(players.map(item => {
          return {
            ...item,
            fuel: (parseInt(item.fuel) - parseInt(item.speed))
          }
        }));
      }, 9000);
    }
    if (phase == 'Reset') {
      setData();
    }
  }, [phase]);

  // useEffect(() => {
  //   if (flag == false) {
  //     setFlag(true);
  //     const datas = getData();
  //     console.log(datas);
  //     setPlayers(players.map(item => {
  //       if (datas[0][2] != null) {
  //         setPlayers(players.map((item, index) => {
  //           if (index == 2) {
  //             return {
  //               ...item,
  //               fuel: datas[0][2][1]
  //             }
  //           }
  //           return item;
  //         }))
  //       }
  //     }))
  //   }
  // }, []);

  const setData = async () => {
    setIsLoading(true);
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, rabbit.abi, signer);

    const index = players.findIndex(item => item.key == '3');
    const tx = await contract.setPlayerData(players[index].fuel);
    await tx.wait();
    setIsLoading(false);
    setPlayers(players.map(item => {
        return {
          ...item,
          status: parseFloat(item.fuel) >= 0 ? item.position == last ? last != 0 ? 'failed': 'success' : 'success' : 'failed'
        }
    }));
  }

  return (
    <div className='h-100'>
      <Spin id="spin" tip="Loading..." size='large' style={{width: "100%", height: "100%"}} spinning={isLoading}>
        <Row className='h-25'>
          <Col className='player-table' span={24}>
            <Table
              columns={columns}
              dataSource={players}
              pagination={false}
              rowClassName={(record, index) => {
                if (record.status == 'success')
                  return 'winner'
                if (record.status == 'failed')
                  return 'loser'
                return ''
              }}
            />
          </Col>
        </Row>
        <Row className='h-50 align-center'>
          <div className='tunnel'>
            {/* <div className="player-container">
              {players.map((player, index) => (
                <img
                  key={player.id}
                  // ref={playerRefs.current[index]}
                  src={player.src}
                  alt={player.id}
                  style={{left: "50%", top: `${25 * (index + 1)}px`}}
                  // className={`player-${player.id}`}
                />
              ))}
            </div> */}
            <PlayerMovement phase={phase} players={players} />
            <Darkness phase={phase} />
            <RabbitHead phase={phase}/>
            <RabbitTail phase={phase} />
          </div>
        </Row>
        <Row className='h-12 control'>
          <Col className='flex justify-end h-full' span={11}>
            <div className="panel">
              <div className="number-display">1</div>
            </div>
          </Col>
          <Col className='flex justify-center h-full' span={2}>
            <div className="lever-container">
              <Image className='center-img' src="https://i.ibb.co/fXQVWpW/Lever-handle.png" alt="Rotating Lever" id="lever" preview={false} />
            </div>
          </Col>
          <Col className='h-full' span={11}>
            <div className="panel">
              <div className="number-display">
                <InputNumber
                  min={1}
                  max={10}
                  value={speed}
                  onChange={e => e != null && setSpeed(e.valueOf())}
                />
              </div>
            </div>
          </Col>
        </Row>
        <Row className="block h-12 control pt-1">
          <Row className='flex justify-center'>
            <Button className='mr-2' type='primary' onClick={handleStartEvent} disabled={state == 'start' || flag == false}>Start</Button>
            <Button type='primary' onClick={handleChangeSpeed} disabled={state == 'start' ? true : false}>Set Speed</Button>
          </Row>
          {/* <Row className='flex justify-center'>
            {
              phase == 'Reset' && <p>Ideal Speed: {idealSpeed}</p>
            }
          </Row> */}
        </Row>
      </Spin>
    </div>
  );
}

function RabbitHead({ phase }) {
  useEffect(() => {
    const head = document.querySelector('.rabbit-head');
    if (phase === 'CloseTunnel') {
     
      head.style.transform = 'translateX(-150vw)'; 
    } else if (phase === 'OpenTunnel') { // it goes back in position
       head.style.visibility = 'hidden';
      head.style.transform = 'translateX(50vw)';

    } else if (phase === 'Reset') {
        head.style.visibility = 'visible';
      head.style.transform = 'translateX(0)'; 
    }
  }, [phase]);

  return <img className="rabbit-head" src="https://i.ibb.co/pvJj4gh/rabbit.png" alt="Rabbit Head" />;
}

function Darkness({ phase }) {
  useEffect(() => {
    const darkness = document.querySelector('.darkness');
    if (phase === 'CloseTunnel') {
      darkness.style.visibility = 'visible';
      darkness.style.left = '-10%'; // Cover the screen
    } else if (phase === 'OpenTunnel') {
      darkness.style.left = '-110%'; // Move off-screen to the left
    } else if (phase === 'Reset') {
      darkness.style.visibility = 'hidden';
      darkness.style.left = '100%';
   

    }
  }, [phase]);

  return <div className="darkness"></div>;
}

function RabbitTail({ phase }) {
  useEffect(() => {
    const tail = document.querySelector('.rabbit-tail');
    if (phase === 'OpenTunnel') {
      tail.style.visibility = 'visible'; 
      tail.style.transform = 'translateX(-100vw)'; 
      setTimeout(() => {
        tail.style.transform = 'translateX(-100vw) rotate(-25deg) translateY(-20px)';
      }, 1500);
      
      setTimeout(() => {
        tail.style.transform = 'translateX(-150vw)';
      }, 5000);


    } else if (phase === 'Reset') {
      tail.style.visibility = 'hidden';
      tail.style.transform = 'translateX(0) rotate(0) translateY(0)'; 
   
    }
  }, [phase]);

  return <img className="rabbit-tail" src="https://i.ibb.co/3FG2ch1/flufflytail.png" alt="Rabbit Tail" />;
}

const PlayerMovement = ({ phase, players }) => {

  // Sort players by speed
  const sortedPlayers = [...players].sort((a, b) => a.speed - b.speed);
  const playerRefs = useRef(sortedPlayers.map(() => createRef()));

  useEffect(() => {
    sortedPlayers.forEach((player, index) => {
      const playerElement = playerRefs.current[index].current;
      if (!playerElement) return;

      const positionStyle = `${25 * (index + 1)}px`;

      if (phase === 'Default' || phase === 'Reset') {
        setTimeout(() => {
          playerElement.style.transition = 'all 1.5s ease-out';
          playerElement.style.left = '46%';
          playerElement.style.visibility = 'visible';
          playerElement.style.top = positionStyle;
        }, player.position * 300);
      } else if (phase === 'CloseTunnel') {
        playerElement.style.left = '80%';
        setTimeout(() => {
          playerElement.style.transition = 'all 0.5s ease-out';
          playerElement.style.left = '-100%';
        }, 3000);
      } else if (phase === 'OpenTunnel') {
        const delay = player.position * 1000;
        setTimeout(() => {
          playerElement.style.top = positionStyle;
          playerElement.style.left = '150vw';
          playerElement.style.transition = 'all 12s ease-out';
        }, 1000 + delay);

        setTimeout(() => {
          playerElement.style.visibility = 'hidden';
          playerElement.style.left = '-10vw';
          playerElement.style.transition = 'none';
        }, 9000 + delay);
      }
    });
  }, [phase]);

  return (
    <div className="player-container">
      {sortedPlayers.map((player, index) => (
        player.status != 'failed' && <img
          key={player.id}
          ref={playerRefs.current[index]}
          src={player.src}
          alt={player.id}
          className={`player-${player.id}`}
        />
      ))}
    </div>
  );
};

export default App;
