import{aU as b,aV as w,aW as f,aX as h}from"./react-icons.esm-BP2DjauK.js";import{r as a,j as u}from"./index-CNjFkONN.js";const k=e=>{const n=b(),{setChain:s}=n,{wallets:t,chains:o}=w(),r=(()=>{const i=t[0];return i&&i.chains?i.chains[0]:null})(),[c,p]=a.useState(!1),d=a.useCallback(async i=>{p(!0);const m=await s({...i,wallet:e});return p(!1),m},[]);return[{chains:o,connectedChain:r,settingChain:c},d]};function g(e){return e?!["0xa4b1","0xa"].includes(e.id):!1}const x=[{network:"mainnet",icon:"/assets/arbitrum.svg",id:"0xa4b1",token:"ETH",label:"Arbitrum One",rpcUrl:"https://arbitrum-one.publicnode.com"},{network:"mainnet",icon:"/assets/optimism.svg",id:"0xa",token:"ETH",label:"OP Mainnet",rpcUrl:"https://mainnet.optimism.io"},{network:"mainnet",icon:"/assets/base.svg",id:"0x2105",token:"ETH",label:"Base",rpcUrl:"https://base-rpc.publicnode.com"},{network:"testnet",icon:"/assets/arbitrum_sepolia.svg",id:"0x66eee",token:"ETH",label:"Arbitrum Sepolia",rpcUrl:"https://arbitrum-sepolia.publicnode.com"},{network:"testnet",icon:"/assets/optimism_sepolia.svg",id:"0xaa37dc",token:"ETH",label:"OP Sepolia",rpcUrl:"https://optimism-sepolia.publicnode.com"},{network:"testnet",icon:"/assets/base_sepolia.svg",id:"0x14a34",token:"ETH",label:"Base Sepolia",rpcUrl:"https://base-sepolia-rpc.publicnode.com"}],E=x.map(({id:e})=>Number(e));function I(){const[e,n]=a.useState(),[{connectedChain:s}]=k();let t;s!=null?t=g(s):typeof window<"u"?t=window.localStorage.getItem("networkId")==="testnet":t=!1;const o=t&&e==="mainnet"||!t&&e==="testnet";return a.useEffect(()=>{typeof window<"u"&&n(window.localStorage.getItem("networkId")??"mainnet")},[]),a.useEffect(()=>{s!=null&&n(t?"testnet":"mainnet")},[s]),[t,o]}const v=({onClick:e,className:n,type:s,disabled:t,children:o})=>{const[l,r]=a.useState(!1);return u.jsxs(f,{className:`relative ${n??""}`,type:s,disabled:t||l,onClick:async c=>{r(!0);try{await e(c)}finally{r(!1)}},children:[l&&u.jsx(h,{overlay:!0})," ",o]})};export{v as P,k as a,x as b,E as s,I as u};
