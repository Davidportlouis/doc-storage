//jshint esversion:8
import React, { Component } from 'react';
// import logo from './logo.svg';
import web3 from './web3';
import ipfs from './ipfs';
import storehash from './storehash';
// import { Button } from 'reactstrap';
import './App.css';
//eslint-disable-next-line
import { read } from 'fs';
import { async } from 'q';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ipfsHash: null,
      buffer: '',
      ethAddress: '',
      blockNumber: '',
      transactionHash: '',
      gasUsed: '',
      txRecipt: ''
    };
  }
  captureFile = (event) => {
    event.stopPropagation();
    event.preventDefault();
    const file = event.target.files[0]
    let reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.convertToBuffer(reader);
    }
  }
  convertToBuffer = async (reader) => {
    const buffer = await Buffer.from(reader.result);
    this.setState({ buffer });
  }
  onClick = async () => {
    try {
      this.setState({ blockNumber: "Loading...." });
      this.setState({ gasUsed: "Loading...." });
      await web3.eth.getTransactionReceipt(this.state.transactionHash, (err, txRecipt) => {
        console.log(err, txRecipt);
        if(txRecipt !== null)
        {
          this.setState({txRecipt,blockNumber: txRecipt.blockNumber, gasUsed: txRecipt.gasUsed });
        }
      });
    }
    catch (error) {
      console.log(error);
    }
  }
  onSubmit = async (event) => {
    event.preventDefault();
    const accounts = await web3.eth.getAccounts();
    console.log(accounts[0]);
    const ethAddress = await storehash.options.address;
    this.setState({ ethAddress });
    await ipfs.add(this.state.buffer, (err, ipfsHash) => {
      console.log(err, ipfsHash);
      this.setState({ ipfsHash: ipfsHash[0].hash });
      storehash.methods.setHash(this.state.ipfsHash).send({ from: accounts[0] }, (error, transactionHash) => {
        console.log(error, transactionHash);
        this.setState({ transactionHash });
      });
    });
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Tangler Technologies</h1>
          <h3>DocStorage</h3>
          <h3>Reimage Decentralized storage</h3>
        </header>
        <hr />
        <h3>Select Document</h3>
        <form onSubmit={this.onSubmit}>
          <input
            className="input"
            type="file"
            onChange={this.captureFile} />
          <button type="submit">Upload</button>
        </form>
        <hr />
        <button onClick={this.onClick}>Tx Details</button>
        <table className="table">
          <thead>
            <tr>
              <th>Tx Data</th>
              <th>Value</th>
              <th>View Link</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>IPFS Hash</td>
              <td>{this.state.ipfsHash}</td>
              <td><a href={`https://gateway.ipfs.io/ipfs/${this.state.ipfsHash}`} target='_blank'>Show Document</a></td>
            </tr>
            <tr>
              <td>Ethereum Address</td>
              <td>{this.state.ethAddress}</td>
            </tr>
            <tr>
              <td>Tx hash</td>
              <td>{this.state.transactionHash}</td>
              <td><a href={`https://rinkeby.etherscan.io/tx/${this.state.transactionHash}`} target='_blank'>Explore Block</a></td>
            </tr>
            <tr>
              <td>Block Number</td>
              <td>{this.state.blockNumber}</td>
            </tr>
            <tr>
              <td>Gas Consumed</td>
              <td>{this.state.gasUsed}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}
export default App;
