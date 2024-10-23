# Orderly Example DEX

This repository can be used as an example of how to use [Orderly Hooks SDKs](https://orderly.network/docs/sdks/hooks/overview) to develop a fully fledged DEX.

The example uses [Remix](https://remix.run/) with React and is deployed via Docker.

[>> open dapp <<](https://orderly-dex.pages.dev/)

## Docker

Run this repository via Docker:

```sh
docker build -t example-dex .
docker run -it --rm -p 3000:3000 example-dex
```
