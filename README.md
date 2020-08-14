# Subgraphs

Please take a look at [Graph protocol](https://github.com/graphprotocol/graph-node) for more information.

## Token Subgraph
- `nglglhtr/token-subgraph-2`: http://54.173.110.169/subgraphs/name/nglglhtr/token-subgraph-2/graphql

## Endpoints
- Graph node: `54.173.110.169:8020`
- GraphQL endpoint: `http://54.173.110.169/subgraphs/name/<YOUR_GITHUB_USERNAME>/<SUBGRAPH_NAME>/graphql`
- ipfs endpoint: `https://ipfs.infura.io:5001/`

### Installation

```bash
$ yarn

# change token address in `subgraph.yaml`

$ graph codegen subgraph.yaml 
$ graph build --ipfs https://ipfs.infura.io:5001/ subgraph.yaml
$ graph deploy nglglhtr/token-subgraph --node https://mumbai-graph.matic.today/ --ipfs https://ipfs.infura.io:5001/
```

### Queries
- (HTTP): https://api.mumbai-graph.matic.today/subgraphs/name/nglglhtr/token-subgraph

### Run local graph node

```bash
$ cargo run -p graph-node --release -- \
    --postgres-url postgresql://localhost:5432/token-transfer \
    --ethereum-rpc http://kovan.infura.io/ \
    --ipfs 127.0.0.1:5001 \
    --subgraph <IPFS_HASH from .ipfs.hash>
```

You can open graphiQL UI at http://localhost:8000
