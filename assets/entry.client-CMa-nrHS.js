import{r,a as v,j as R}from"./index-CNjFkONN.js";import{E as h,c as C,i as y,d as b,a as g,m as E,s as F,b as $,e as S,f as k,g as P,h as H,u as O,R as j,j as B,k as D}from"./components-nOY9cIXx.js";/**
 * @remix-run/react v2.13.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function z(d){if(!d)return null;let w=Object.entries(d),s={};for(let[a,e]of w)if(e&&e.__type==="RouteErrorResponse")s[a]=new h(e.status,e.statusText,e.data,e.internal===!0);else if(e&&e.__type==="Error"){if(e.__subType){let i=window[e.__subType];if(typeof i=="function")try{let o=new i(e.message);o.stack=e.stack,s[a]=o}catch{}}if(s[a]==null){let i=new Error(e.message);i.stack=e.stack,s[a]=i}}else s[a]=e;return s}/**
 * @remix-run/react v2.13.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */let n,t,f=!1;let c,I=new Promise(d=>{c=d}).catch(()=>{});function A(d){if(!t){if(window.__remixContext.future.v3_singleFetch){if(!n){let u=window.__remixContext.stream;y(u,"No stream found for single fetch decoding"),window.__remixContext.stream=void 0,n=b(u,window).then(l=>{window.__remixContext.state=l.value,n.value=!0}).catch(l=>{n.error=l})}if(n.error)throw n.error;if(!n.value)throw n}let i=g(window.__remixManifest.routes,window.__remixRouteModules,window.__remixContext.state,window.__remixContext.future,window.__remixContext.isSpaMode),o;if(!window.__remixContext.isSpaMode){o={...window.__remixContext.state,loaderData:{...window.__remixContext.state.loaderData}};let u=E(i,window.location,window.__remixContext.basename);if(u)for(let l of u){let _=l.route.id,x=window.__remixRouteModules[_],m=window.__remixManifest.routes[_];x&&F(m,x,window.__remixContext.isSpaMode)&&(x.HydrateFallback||!m.hasLoader)?o.loaderData[_]=void 0:m&&!m.hasLoader&&(o.loaderData[_]=null)}o&&o.errors&&(o.errors=z(o.errors))}t=$({routes:i,history:S(),basename:window.__remixContext.basename,future:{v7_normalizeFormMethod:!0,v7_fetcherPersist:window.__remixContext.future.v3_fetcherPersist,v7_partialHydration:!0,v7_prependBasename:!0,v7_relativeSplatPath:window.__remixContext.future.v3_relativeSplatPath,v7_skipActionErrorRevalidation:window.__remixContext.future.v3_singleFetch===!0},hydrationData:o,mapRouteProperties:k,dataStrategy:window.__remixContext.future.v3_singleFetch?P(window.__remixManifest,window.__remixRouteModules,()=>t):void 0,patchRoutesOnNavigation:H(window.__remixManifest,window.__remixRouteModules,window.__remixContext.future,window.__remixContext.isSpaMode,window.__remixContext.basename)}),t.state.initialized&&(f=!0,t.initialize()),t.createRoutesForHMR=C,window.__remixRouter=t,c&&c(t)}let[w,s]=r.useState(void 0),[a,e]=r.useState(t.state.location);return r.useLayoutEffect(()=>{f||(f=!0,t.initialize())},[]),r.useLayoutEffect(()=>t.subscribe(i=>{i.location!==a&&e(i.location)}),[a]),O(t,window.__remixManifest,window.__remixRouteModules,window.__remixContext.future,window.__remixContext.isSpaMode),r.createElement(r.Fragment,null,r.createElement(j.Provider,{value:{manifest:window.__remixManifest,routeModules:window.__remixRouteModules,future:window.__remixContext.future,criticalCss:w,isSpaMode:window.__remixContext.isSpaMode}},r.createElement(B,{location:a},r.createElement(D,{router:t,fallbackElement:null,future:{v7_startTransition:!0}}))),window.__remixContext.future.v3_singleFetch?r.createElement(r.Fragment,null):null)}var p,M=v;M.createRoot,p=M.hydrateRoot;r.startTransition(()=>{p(document,R.jsx(r.StrictMode,{children:R.jsx(A,{})}))});
