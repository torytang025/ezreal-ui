import"../sb-preview/runtime.js";(function(){const _=document.createElement("link").relList;if(_&&_.supports&&_.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))l(t);new MutationObserver(t=>{for(const e of t)if(e.type==="childList")for(const r of e.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&l(r)}).observe(document,{childList:!0,subtree:!0});function s(t){const e={};return t.integrity&&(e.integrity=t.integrity),t.referrerPolicy&&(e.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?e.credentials="include":t.crossOrigin==="anonymous"?e.credentials="omit":e.credentials="same-origin",e}function l(t){if(t.ep)return;t.ep=!0;const e=s(t);fetch(t.href,e)}})();const d="modulepreload",m=function(i,_){return new URL(i,_).href},O={},o=function(_,s,l){if(!s||s.length===0)return _();const t=document.getElementsByTagName("link");return Promise.all(s.map(e=>{if(e=m(e,l),e in O)return;O[e]=!0;const r=e.endsWith(".css"),E=r?'[rel="stylesheet"]':"";if(!!l)for(let c=t.length-1;c>=0;c--){const a=t[c];if(a.href===e&&(!r||a.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${e}"]${E}`))return;const n=document.createElement("link");if(n.rel=r?"stylesheet":d,r||(n.as="script",n.crossOrigin=""),n.href=e,document.head.appendChild(n),r)return new Promise((c,a)=>{n.addEventListener("load",c),n.addEventListener("error",()=>a(new Error(`Unable to preload CSS for ${e}`)))})})).then(()=>_()).catch(e=>{const r=new Event("vite:preloadError",{cancelable:!0});if(r.payload=e,window.dispatchEvent(r),!r.defaultPrevented)throw e})},{createBrowserChannel:f}=__STORYBOOK_MODULE_CHANNELS__,{addons:p}=__STORYBOOK_MODULE_PREVIEW_API__,u=f({page:"preview"});p.setChannel(u);window.__STORYBOOK_ADDONS_CHANNEL__=u;window.CONFIG_TYPE==="DEVELOPMENT"&&(window.__STORYBOOK_SERVER_CHANNEL__=u);const R={"./stories/Button.stories.tsx":async()=>o(()=>import("./Button.stories-33b7f4e2.js"),["./Button.stories-33b7f4e2.js","./index-76fb7be0.js","./_commonjsHelpers-de833af9.js","./Button.stories-0ead5783.css"],import.meta.url)};async function w(i){return R[i]()}const{composeConfigs:P,PreviewWeb:T,ClientApi:L}=__STORYBOOK_MODULE_PREVIEW_API__,S=async()=>{const i=await Promise.all([o(()=>import("./config-36d15c1d.js"),["./config-36d15c1d.js","./index-76fb7be0.js","./_commonjsHelpers-de833af9.js","./_getPrototype-c468d7b4.js","./index-356e4a49.js"],import.meta.url),o(()=>import("./preview-87eac49b.js"),["./preview-87eac49b.js","./index-d37d4223.js"],import.meta.url),o(()=>import("./preview-102edb91.js"),[],import.meta.url),o(()=>import("./preview-bed967c6.js"),[],import.meta.url),o(()=>import("./preview-108c1c3c.js"),["./preview-108c1c3c.js","./index-356e4a49.js"],import.meta.url),o(()=>import("./preview-2059b184.js"),[],import.meta.url),o(()=>import("./preview-b8d6c68d.js"),["./preview-b8d6c68d.js","./index-356e4a49.js"],import.meta.url),o(()=>import("./preview-b3c37142.js"),[],import.meta.url),o(()=>import("./preview-6751e51d.js"),["./preview-6751e51d.js","./_commonjsHelpers-de833af9.js"],import.meta.url),o(()=>import("./preview-1e5c59db.js"),[],import.meta.url)]);return P(i)};window.__STORYBOOK_PREVIEW__=window.__STORYBOOK_PREVIEW__||new T;window.__STORYBOOK_STORY_STORE__=window.__STORYBOOK_STORY_STORE__||window.__STORYBOOK_PREVIEW__.storyStore;window.__STORYBOOK_CLIENT_API__=window.__STORYBOOK_CLIENT_API__||new L({storyStore:window.__STORYBOOK_PREVIEW__.storyStore});window.__STORYBOOK_PREVIEW__.initialize({importFn:w,getProjectAnnotations:S});export{o as _};
//# sourceMappingURL=iframe-1e062255.js.map
