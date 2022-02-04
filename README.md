# Subgraphs
Subgraph for Matic contracts

Please take a look at [Graph protocol](https://github.com/graphprotocol/graph-node) for more information.

## Polygon hosted node endpoints

**Root**
- Mainnet: `https://thegraph.com/hosted-service/subgraph/maticnetwork/mainnet-root-subgraphs`
- Goerli: `https://thegraph.com/hosted-service/subgraph/maticnetwork/mumbai-root-subgraphs`

## For Mumbai hosted node endpoints
- Graph node: `https://mumbai-graph.matic.today`
- GraphQL endpoint: `https://api.mumbai-graph.matic.today/subgraphs/name/<YOUR_GITHUB_USERNAME>/<SUBGRAPH_NAME>/graphql`
- HTTP endpoint: `https://api.mumbai-graph.matic.today/subgraphs/name/<YOUR_GITHUB_USERNAME>/<SUBGRAPH_NAME>`
- IPFS endpoint: `https://ipfs.infura.io:5001/`

## Subgraphs

This repository contains subgraphs for two chains: `root` (Ethereum) and `child` (Matic) with respective testnets. 

**To prepare root (Ethereum) subgraphs**

```bash
cd root

# install dependencies
npm install

# For goerli
npm run prepare:goerli

# For mainnet
# npm run prepare:mainnet
```

**To prepare child (Matic) subgraphs**

```bash
cd child

# install dependencies
npm install

# For mumbai
npm run prepare:mumbai

# For mainnet
# npm run prepare:mainnet
```

### Build

```bash
# generate code
npm run codegen

# build
npm run build
```

### Deploy locally

**For goerli**

```bash
# create sub graph in local node
npm run graph -- create --node http://localhost:8020/ nglglhtr/goerli-matic-subgraph

# deploy sub graph locally
npm run graph -- deploy --node http://localhost:8020/ --ipfs https://ipfs.infura.io:5001/ nglglhtr/goerli-matic-subgraph 
```

### Deploy on Graph's hosted node

**For goerli**

```bash
# create sub graph in local node
npm run graph -- create --node https://api.thegraph.com/deploy/  nglglhtr/goerli-matic-subgraph

# deploy sub graph locally
npm run graph -- deploy --node https://api.thegraph.com/deploy/ --ipfs https://api.thegraph.com/ipfs/ nglglhtr/goerli-matic-subgraph 
```

**For mumbai**

```bash
# create sub graph in local node
npm run graph -- create --node https://mumbai-graph.matic.today  nglglhtr/mumbai-matic-subgraph

# deploy sub graph locally
npm run graph -- deploy --node https://mumbai-graph.matic.today --ipfs https://ipfs.infura.io:5001/ nglglhtr/mumbai-matic-subgraph
```

## Run local graph node

```bash
$ cargo run -p graph-node --release -- \
    --postgres-url postgresql://localhost:5432/token-transfer \
    --ethereum-rpc http://localhost:8545/ \
    --ipfs 127.0.0.1:5001 \
    --subgraph <IPFS_HASH from .ipfs.hash>
```

You can open graphiQL UI at http://localhost:8000

## License

MIT