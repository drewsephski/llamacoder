module.exports=[28964,a=>{"use strict";var b=a.i(214376),c=a.i(682436),d=a.i(948663),e=a.i(880946),f=a.i(263555),g=a.i(127860),h=a.i(241994),i=a.i(872016),j=a.i(225700);let k=(0,j.default)("cloud-sun",[["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}],["path",{d:"M15.947 12.65a4 4 0 0 0-5.925-4.128",key:"dpwdj0"}],["path",{d:"M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z",key:"s09mg5"}]]);var l=a.i(450488),m=a.i(809955),n=a.i(483886);let o=(0,j.default)("files",[["path",{d:"M15 2h-4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8",key:"14sh0y"}],["path",{d:"M16.706 2.706A2.4 2.4 0 0 0 15 2v5a1 1 0 0 0 1 1h5a2.4 2.4 0 0 0-.706-1.706z",key:"1970lx"}],["path",{d:"M5 7a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8a2 2 0 0 0 1.732-1",key:"l4dndm"}]]);var p=a.i(162147);let q=(0,j.default)("landmark",[["path",{d:"M10 18v-7",key:"wt116b"}],["path",{d:"M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z",key:"1m329m"}],["path",{d:"M14 18v-7",key:"vav6t3"}],["path",{d:"M18 18v-7",key:"aexdmj"}],["path",{d:"M3 22h18",key:"8prr45"}],["path",{d:"M6 18v-7",key:"1ivflk"}]]);var r=a.i(810584),s=a.i(40642);let t=(0,j.default)("monitor-play",[["path",{d:"M15.033 9.44a.647.647 0 0 1 0 1.12l-4.065 2.352a.645.645 0 0 1-.968-.56V7.648a.645.645 0 0 1 .967-.56z",key:"vbtd3f"}],["path",{d:"M12 17v4",key:"1riwvh"}],["path",{d:"M8 21h8",key:"1ev6f3"}],["rect",{x:"2",y:"3",width:"20",height:"14",rx:"2",key:"x3v2xh"}]]),u=(0,j.default)("radio",[["path",{d:"M16.247 7.761a6 6 0 0 1 0 8.478",key:"1fwjs5"}],["path",{d:"M19.075 4.933a10 10 0 0 1 0 14.134",key:"ehdyv1"}],["path",{d:"M4.925 19.067a10 10 0 0 1 0-14.134",key:"1q22gi"}],["path",{d:"M7.753 16.239a6 6 0 0 1 0-8.478",key:"r2q7qm"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}]]);var v=a.i(575635),w=a.i(340695),x=a.i(589471),y=a.i(342645),z=a.i(701143),A=a.i(559653),B=a.i(220521),C=a.i(42380),D=a.i(489172),E=a.i(584034),F=a.i(943224),G="Collapsible",[H,I]=(0,x.createContextScope)(G),[J,K]=H(G),L=f.forwardRef((a,c)=>{let{__scopeCollapsible:d,open:e,defaultOpen:g,disabled:h,onOpenChange:i,...j}=a,[k,l]=(0,B.useControllableState)({prop:e,defaultProp:g??!1,onChange:i,caller:G});return(0,b.jsx)(J,{scope:d,disabled:h,contentId:(0,F.useId)(),open:k,onOpenToggle:f.useCallback(()=>l(a=>!a),[l]),children:(0,b.jsx)(C.Primitive.div,{"data-state":R(k),"data-disabled":h?"":void 0,...j,ref:c})})});L.displayName=G;var M="CollapsibleTrigger",N=f.forwardRef((a,c)=>{let{__scopeCollapsible:d,...e}=a,f=K(M,d);return(0,b.jsx)(C.Primitive.button,{type:"button","aria-controls":f.contentId,"aria-expanded":f.open||!1,"data-state":R(f.open),"data-disabled":f.disabled?"":void 0,disabled:f.disabled,...e,ref:c,onClick:(0,A.composeEventHandlers)(a.onClick,f.onOpenToggle)})});N.displayName=M;var O="CollapsibleContent",P=f.forwardRef((a,c)=>{let{forceMount:d,...e}=a,f=K(O,a.__scopeCollapsible);return(0,b.jsx)(E.Presence,{present:d||f.open,children:({present:a})=>(0,b.jsx)(Q,{...e,ref:c,present:a})})});P.displayName=O;var Q=f.forwardRef((a,c)=>{let{__scopeCollapsible:d,present:e,children:g,...h}=a,i=K(O,d),[j,k]=f.useState(e),l=f.useRef(null),m=(0,z.useComposedRefs)(c,l),n=f.useRef(0),o=n.current,p=f.useRef(0),q=p.current,r=i.open||j,s=f.useRef(r),t=f.useRef(void 0);return f.useEffect(()=>{let a=requestAnimationFrame(()=>s.current=!1);return()=>cancelAnimationFrame(a)},[]),(0,D.useLayoutEffect)(()=>{let a=l.current;if(a){t.current=t.current||{transitionDuration:a.style.transitionDuration,animationName:a.style.animationName},a.style.transitionDuration="0s",a.style.animationName="none";let b=a.getBoundingClientRect();n.current=b.height,p.current=b.width,s.current||(a.style.transitionDuration=t.current.transitionDuration,a.style.animationName=t.current.animationName),k(e)}},[i.open,e]),(0,b.jsx)(C.Primitive.div,{"data-state":R(i.open),"data-disabled":i.disabled?"":void 0,id:i.contentId,hidden:!r,...h,ref:m,style:{"--radix-collapsible-content-height":o?`${o}px`:void 0,"--radix-collapsible-content-width":q?`${q}px`:void 0,...a.style},children:r&&g})});function R(a){return a?"open":"closed"}var S=a.i(333749),T="Accordion",U=["Home","End","ArrowDown","ArrowUp","ArrowLeft","ArrowRight"],[V,W,X]=(0,y.createCollection)(T),[Y,Z]=(0,x.createContextScope)(T,[X,I]),$=I(),_=f.default.forwardRef((a,c)=>{let{type:d,...e}=a;return(0,b.jsx)(V.Provider,{scope:a.__scopeAccordion,children:"multiple"===d?(0,b.jsx)(af,{...e,ref:c}):(0,b.jsx)(ae,{...e,ref:c})})});_.displayName=T;var[aa,ab]=Y(T),[ac,ad]=Y(T,{collapsible:!1}),ae=f.default.forwardRef((a,c)=>{let{value:d,defaultValue:e,onValueChange:g=()=>{},collapsible:h=!1,...i}=a,[j,k]=(0,B.useControllableState)({prop:d,defaultProp:e??"",onChange:g,caller:T});return(0,b.jsx)(aa,{scope:a.__scopeAccordion,value:f.default.useMemo(()=>j?[j]:[],[j]),onItemOpen:k,onItemClose:f.default.useCallback(()=>h&&k(""),[h,k]),children:(0,b.jsx)(ac,{scope:a.__scopeAccordion,collapsible:h,children:(0,b.jsx)(ai,{...i,ref:c})})})}),af=f.default.forwardRef((a,c)=>{let{value:d,defaultValue:e,onValueChange:g=()=>{},...h}=a,[i,j]=(0,B.useControllableState)({prop:d,defaultProp:e??[],onChange:g,caller:T}),k=f.default.useCallback(a=>j((b=[])=>[...b,a]),[j]),l=f.default.useCallback(a=>j((b=[])=>b.filter(b=>b!==a)),[j]);return(0,b.jsx)(aa,{scope:a.__scopeAccordion,value:i,onItemOpen:k,onItemClose:l,children:(0,b.jsx)(ac,{scope:a.__scopeAccordion,collapsible:!0,children:(0,b.jsx)(ai,{...h,ref:c})})})}),[ag,ah]=Y(T),ai=f.default.forwardRef((a,c)=>{let{__scopeAccordion:d,disabled:e,dir:g,orientation:h="vertical",...i}=a,j=f.default.useRef(null),k=(0,z.useComposedRefs)(j,c),l=W(d),m="ltr"===(0,S.useDirection)(g),n=(0,A.composeEventHandlers)(a.onKeyDown,a=>{if(!U.includes(a.key))return;let b=a.target,c=l().filter(a=>!a.ref.current?.disabled),d=c.findIndex(a=>a.ref.current===b),e=c.length;if(-1===d)return;a.preventDefault();let f=d,g=e-1,i=()=>{(f=d+1)>g&&(f=0)},j=()=>{(f=d-1)<0&&(f=g)};switch(a.key){case"Home":f=0;break;case"End":f=g;break;case"ArrowRight":"horizontal"===h&&(m?i():j());break;case"ArrowDown":"vertical"===h&&i();break;case"ArrowLeft":"horizontal"===h&&(m?j():i());break;case"ArrowUp":"vertical"===h&&j()}let k=f%e;c[k].ref.current?.focus()});return(0,b.jsx)(ag,{scope:d,disabled:e,direction:g,orientation:h,children:(0,b.jsx)(V.Slot,{scope:d,children:(0,b.jsx)(C.Primitive.div,{...i,"data-orientation":h,ref:k,onKeyDown:e?void 0:n})})})}),aj="AccordionItem",[ak,al]=Y(aj),am=f.default.forwardRef((a,c)=>{let{__scopeAccordion:d,value:e,...f}=a,g=ah(aj,d),h=ab(aj,d),i=$(d),j=(0,F.useId)(),k=e&&h.value.includes(e)||!1,l=g.disabled||a.disabled;return(0,b.jsx)(ak,{scope:d,open:k,disabled:l,triggerId:j,children:(0,b.jsx)(L,{"data-orientation":g.orientation,"data-state":as(k),...i,...f,ref:c,disabled:l,open:k,onOpenChange:a=>{a?h.onItemOpen(e):h.onItemClose(e)}})})});am.displayName=aj;var an="AccordionHeader";f.default.forwardRef((a,c)=>{let{__scopeAccordion:d,...e}=a,f=ah(T,d),g=al(an,d);return(0,b.jsx)(C.Primitive.h3,{"data-orientation":f.orientation,"data-state":as(g.open),"data-disabled":g.disabled?"":void 0,...e,ref:c})}).displayName=an;var ao="AccordionTrigger",ap=f.default.forwardRef((a,c)=>{let{__scopeAccordion:d,...e}=a,f=ah(T,d),g=al(ao,d),h=ad(ao,d),i=$(d);return(0,b.jsx)(V.ItemSlot,{scope:d,children:(0,b.jsx)(N,{"aria-disabled":g.open&&!h.collapsible||void 0,"data-orientation":f.orientation,id:g.triggerId,...i,...e,ref:c})})});ap.displayName=ao;var aq="AccordionContent",ar=f.default.forwardRef((a,c)=>{let{__scopeAccordion:d,...e}=a,f=ah(T,d),g=al(aq,d),h=$(d);return(0,b.jsx)(P,{role:"region","aria-labelledby":g.triggerId,"data-orientation":f.orientation,...h,...e,ref:c,style:{"--radix-accordion-content-height":"var(--radix-collapsible-content-height)","--radix-accordion-content-width":"var(--radix-collapsible-content-width)",...a.style}})});function as(a){return a?"open":"closed"}ar.displayName=aq;let at=(0,j.default)("file",[["path",{d:"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",key:"1oefj6"}],["path",{d:"M14 2v5a1 1 0 0 0 1 1h5",key:"wfsgrz"}]]),au=(0,j.default)("folder",[["path",{d:"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",key:"1kt360"}]]),av=(0,j.default)("folder-open",[["path",{d:"m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2",key:"usdka0"}]]);var aw=a.i(132576),ax=a.i(872543),ay=a.i(497895),az=a.i(572217),aA=a.i(48972),aB="ScrollArea",[aC,aD]=(0,x.createContextScope)(aB),[aE,aF]=aC(aB),aG=f.forwardRef((a,c)=>{let{__scopeScrollArea:d,type:e="hover",dir:g,scrollHideDelay:h=600,...i}=a,[j,k]=f.useState(null),[l,m]=f.useState(null),[n,o]=f.useState(null),[p,q]=f.useState(null),[r,s]=f.useState(null),[t,u]=f.useState(0),[v,w]=f.useState(0),[x,y]=f.useState(!1),[A,B]=f.useState(!1),D=(0,z.useComposedRefs)(c,a=>k(a)),E=(0,S.useDirection)(g);return(0,b.jsx)(aE,{scope:d,type:e,dir:E,scrollHideDelay:h,scrollArea:j,viewport:l,onViewportChange:m,content:n,onContentChange:o,scrollbarX:p,onScrollbarXChange:q,scrollbarXEnabled:x,onScrollbarXEnabledChange:y,scrollbarY:r,onScrollbarYChange:s,scrollbarYEnabled:A,onScrollbarYEnabledChange:B,onCornerWidthChange:u,onCornerHeightChange:w,children:(0,b.jsx)(C.Primitive.div,{dir:E,...i,ref:D,style:{position:"relative","--radix-scroll-area-corner-width":t+"px","--radix-scroll-area-corner-height":v+"px",...a.style}})})});aG.displayName=aB;var aH="ScrollAreaViewport",aI=f.forwardRef((a,c)=>{let{__scopeScrollArea:d,children:e,nonce:g,...h}=a,i=aF(aH,d),j=f.useRef(null),k=(0,z.useComposedRefs)(c,j,i.onViewportChange);return(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)("style",{dangerouslySetInnerHTML:{__html:"[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}"},nonce:g}),(0,b.jsx)(C.Primitive.div,{"data-radix-scroll-area-viewport":"",...h,ref:k,style:{overflowX:i.scrollbarXEnabled?"scroll":"hidden",overflowY:i.scrollbarYEnabled?"scroll":"hidden",...a.style},children:(0,b.jsx)("div",{ref:i.onContentChange,style:{minWidth:"100%",display:"table"},children:e})})]})});aI.displayName=aH;var aJ="ScrollAreaScrollbar",aK=f.forwardRef((a,c)=>{let{forceMount:d,...e}=a,g=aF(aJ,a.__scopeScrollArea),{onScrollbarXEnabledChange:h,onScrollbarYEnabledChange:i}=g,j="horizontal"===a.orientation;return f.useEffect(()=>(j?h(!0):i(!0),()=>{j?h(!1):i(!1)}),[j,h,i]),"hover"===g.type?(0,b.jsx)(aL,{...e,ref:c,forceMount:d}):"scroll"===g.type?(0,b.jsx)(aM,{...e,ref:c,forceMount:d}):"auto"===g.type?(0,b.jsx)(aN,{...e,ref:c,forceMount:d}):"always"===g.type?(0,b.jsx)(aO,{...e,ref:c}):null});aK.displayName=aJ;var aL=f.forwardRef((a,c)=>{let{forceMount:d,...e}=a,g=aF(aJ,a.__scopeScrollArea),[h,i]=f.useState(!1);return f.useEffect(()=>{let a=g.scrollArea,b=0;if(a){let c=()=>{window.clearTimeout(b),i(!0)},d=()=>{b=window.setTimeout(()=>i(!1),g.scrollHideDelay)};return a.addEventListener("pointerenter",c),a.addEventListener("pointerleave",d),()=>{window.clearTimeout(b),a.removeEventListener("pointerenter",c),a.removeEventListener("pointerleave",d)}}},[g.scrollArea,g.scrollHideDelay]),(0,b.jsx)(E.Presence,{present:d||h,children:(0,b.jsx)(aN,{"data-state":h?"visible":"hidden",...e,ref:c})})}),aM=f.forwardRef((a,c)=>{var d;let{forceMount:e,...g}=a,h=aF(aJ,a.__scopeScrollArea),i="horizontal"===a.orientation,j=a4(()=>l("SCROLL_END"),100),[k,l]=(d={hidden:{SCROLL:"scrolling"},scrolling:{SCROLL_END:"idle",POINTER_ENTER:"interacting"},interacting:{SCROLL:"interacting",POINTER_LEAVE:"idle"},idle:{HIDE:"hidden",SCROLL:"scrolling",POINTER_ENTER:"interacting"}},f.useReducer((a,b)=>d[a][b]??a,"hidden"));return f.useEffect(()=>{if("idle"===k){let a=window.setTimeout(()=>l("HIDE"),h.scrollHideDelay);return()=>window.clearTimeout(a)}},[k,h.scrollHideDelay,l]),f.useEffect(()=>{let a=h.viewport,b=i?"scrollLeft":"scrollTop";if(a){let c=a[b],d=()=>{let d=a[b];c!==d&&(l("SCROLL"),j()),c=d};return a.addEventListener("scroll",d),()=>a.removeEventListener("scroll",d)}},[h.viewport,i,l,j]),(0,b.jsx)(E.Presence,{present:e||"hidden"!==k,children:(0,b.jsx)(aO,{"data-state":"hidden"===k?"hidden":"visible",...g,ref:c,onPointerEnter:(0,A.composeEventHandlers)(a.onPointerEnter,()=>l("POINTER_ENTER")),onPointerLeave:(0,A.composeEventHandlers)(a.onPointerLeave,()=>l("POINTER_LEAVE"))})})}),aN=f.forwardRef((a,c)=>{let d=aF(aJ,a.__scopeScrollArea),{forceMount:e,...g}=a,[h,i]=f.useState(!1),j="horizontal"===a.orientation,k=a4(()=>{if(d.viewport){let a=d.viewport.offsetWidth<d.viewport.scrollWidth,b=d.viewport.offsetHeight<d.viewport.scrollHeight;i(j?a:b)}},10);return a5(d.viewport,k),a5(d.content,k),(0,b.jsx)(E.Presence,{present:e||h,children:(0,b.jsx)(aO,{"data-state":h?"visible":"hidden",...g,ref:c})})}),aO=f.forwardRef((a,c)=>{let{orientation:d="vertical",...e}=a,g=aF(aJ,a.__scopeScrollArea),h=f.useRef(null),i=f.useRef(0),[j,k]=f.useState({content:0,viewport:0,scrollbar:{size:0,paddingStart:0,paddingEnd:0}}),l=a_(j.viewport,j.content),m={...e,sizes:j,onSizesChange:k,hasThumb:!!(l>0&&l<1),onThumbChange:a=>h.current=a,onThumbPointerUp:()=>i.current=0,onThumbPointerDown:a=>i.current=a};function n(a,b){return function(a,b,c,d="ltr"){let e=a0(c),f=b||e/2,g=c.scrollbar.paddingStart+f,h=c.scrollbar.size-c.scrollbar.paddingEnd-(e-f),i=c.content-c.viewport;return a2([g,h],"ltr"===d?[0,i]:[-1*i,0])(a)}(a,i.current,j,b)}return"horizontal"===d?(0,b.jsx)(aP,{...m,ref:c,onThumbPositionChange:()=>{if(g.viewport&&h.current){let a=a1(g.viewport.scrollLeft,j,g.dir);h.current.style.transform=`translate3d(${a}px, 0, 0)`}},onWheelScroll:a=>{g.viewport&&(g.viewport.scrollLeft=a)},onDragScroll:a=>{g.viewport&&(g.viewport.scrollLeft=n(a,g.dir))}}):"vertical"===d?(0,b.jsx)(aQ,{...m,ref:c,onThumbPositionChange:()=>{if(g.viewport&&h.current){let a=a1(g.viewport.scrollTop,j);h.current.style.transform=`translate3d(0, ${a}px, 0)`}},onWheelScroll:a=>{g.viewport&&(g.viewport.scrollTop=a)},onDragScroll:a=>{g.viewport&&(g.viewport.scrollTop=n(a))}}):null}),aP=f.forwardRef((a,c)=>{let{sizes:d,onSizesChange:e,...g}=a,h=aF(aJ,a.__scopeScrollArea),[i,j]=f.useState(),k=f.useRef(null),l=(0,z.useComposedRefs)(c,k,h.onScrollbarXChange);return f.useEffect(()=>{k.current&&j(getComputedStyle(k.current))},[k]),(0,b.jsx)(aT,{"data-orientation":"horizontal",...g,ref:l,sizes:d,style:{bottom:0,left:"rtl"===h.dir?"var(--radix-scroll-area-corner-width)":0,right:"ltr"===h.dir?"var(--radix-scroll-area-corner-width)":0,"--radix-scroll-area-thumb-width":a0(d)+"px",...a.style},onThumbPointerDown:b=>a.onThumbPointerDown(b.x),onDragScroll:b=>a.onDragScroll(b.x),onWheelScroll:(b,c)=>{if(h.viewport){var d,e;let f=h.viewport.scrollLeft+b.deltaX;a.onWheelScroll(f),d=f,e=c,d>0&&d<e&&b.preventDefault()}},onResize:()=>{k.current&&h.viewport&&i&&e({content:h.viewport.scrollWidth,viewport:h.viewport.offsetWidth,scrollbar:{size:k.current.clientWidth,paddingStart:a$(i.paddingLeft),paddingEnd:a$(i.paddingRight)}})}})}),aQ=f.forwardRef((a,c)=>{let{sizes:d,onSizesChange:e,...g}=a,h=aF(aJ,a.__scopeScrollArea),[i,j]=f.useState(),k=f.useRef(null),l=(0,z.useComposedRefs)(c,k,h.onScrollbarYChange);return f.useEffect(()=>{k.current&&j(getComputedStyle(k.current))},[k]),(0,b.jsx)(aT,{"data-orientation":"vertical",...g,ref:l,sizes:d,style:{top:0,right:"ltr"===h.dir?0:void 0,left:"rtl"===h.dir?0:void 0,bottom:"var(--radix-scroll-area-corner-height)","--radix-scroll-area-thumb-height":a0(d)+"px",...a.style},onThumbPointerDown:b=>a.onThumbPointerDown(b.y),onDragScroll:b=>a.onDragScroll(b.y),onWheelScroll:(b,c)=>{if(h.viewport){var d,e;let f=h.viewport.scrollTop+b.deltaY;a.onWheelScroll(f),d=f,e=c,d>0&&d<e&&b.preventDefault()}},onResize:()=>{k.current&&h.viewport&&i&&e({content:h.viewport.scrollHeight,viewport:h.viewport.offsetHeight,scrollbar:{size:k.current.clientHeight,paddingStart:a$(i.paddingTop),paddingEnd:a$(i.paddingBottom)}})}})}),[aR,aS]=aC(aJ),aT=f.forwardRef((a,c)=>{let{__scopeScrollArea:d,sizes:e,hasThumb:g,onThumbChange:h,onThumbPointerUp:i,onThumbPointerDown:j,onThumbPositionChange:k,onDragScroll:l,onWheelScroll:m,onResize:n,...o}=a,p=aF(aJ,d),[q,r]=f.useState(null),s=(0,z.useComposedRefs)(c,a=>r(a)),t=f.useRef(null),u=f.useRef(""),v=p.viewport,w=e.content-e.viewport,x=(0,az.useCallbackRef)(m),y=(0,az.useCallbackRef)(k),B=a4(n,10);function D(a){t.current&&l({x:a.clientX-t.current.left,y:a.clientY-t.current.top})}return f.useEffect(()=>{let a=a=>{let b=a.target;q?.contains(b)&&x(a,w)};return document.addEventListener("wheel",a,{passive:!1}),()=>document.removeEventListener("wheel",a,{passive:!1})},[v,q,w,x]),f.useEffect(y,[e,y]),a5(q,B),a5(p.content,B),(0,b.jsx)(aR,{scope:d,scrollbar:q,hasThumb:g,onThumbChange:(0,az.useCallbackRef)(h),onThumbPointerUp:(0,az.useCallbackRef)(i),onThumbPositionChange:y,onThumbPointerDown:(0,az.useCallbackRef)(j),children:(0,b.jsx)(C.Primitive.div,{...o,ref:s,style:{position:"absolute",...o.style},onPointerDown:(0,A.composeEventHandlers)(a.onPointerDown,a=>{0===a.button&&(a.target.setPointerCapture(a.pointerId),t.current=q.getBoundingClientRect(),u.current=document.body.style.webkitUserSelect,document.body.style.webkitUserSelect="none",p.viewport&&(p.viewport.style.scrollBehavior="auto"),D(a))}),onPointerMove:(0,A.composeEventHandlers)(a.onPointerMove,D),onPointerUp:(0,A.composeEventHandlers)(a.onPointerUp,a=>{let b=a.target;b.hasPointerCapture(a.pointerId)&&b.releasePointerCapture(a.pointerId),document.body.style.webkitUserSelect=u.current,p.viewport&&(p.viewport.style.scrollBehavior=""),t.current=null})})})}),aU="ScrollAreaThumb",aV=f.forwardRef((a,c)=>{let{forceMount:d,...e}=a,f=aS(aU,a.__scopeScrollArea);return(0,b.jsx)(E.Presence,{present:d||f.hasThumb,children:(0,b.jsx)(aW,{ref:c,...e})})}),aW=f.forwardRef((a,c)=>{let{__scopeScrollArea:d,style:e,...g}=a,h=aF(aU,d),i=aS(aU,d),{onThumbPositionChange:j}=i,k=(0,z.useComposedRefs)(c,a=>i.onThumbChange(a)),l=f.useRef(void 0),m=a4(()=>{l.current&&(l.current(),l.current=void 0)},100);return f.useEffect(()=>{let a=h.viewport;if(a){let b=()=>{m(),l.current||(l.current=a3(a,j),j())};return j(),a.addEventListener("scroll",b),()=>a.removeEventListener("scroll",b)}},[h.viewport,m,j]),(0,b.jsx)(C.Primitive.div,{"data-state":i.hasThumb?"visible":"hidden",...g,ref:k,style:{width:"var(--radix-scroll-area-thumb-width)",height:"var(--radix-scroll-area-thumb-height)",...e},onPointerDownCapture:(0,A.composeEventHandlers)(a.onPointerDownCapture,a=>{let b=a.target.getBoundingClientRect(),c=a.clientX-b.left,d=a.clientY-b.top;i.onThumbPointerDown({x:c,y:d})}),onPointerUp:(0,A.composeEventHandlers)(a.onPointerUp,i.onThumbPointerUp)})});aV.displayName=aU;var aX="ScrollAreaCorner",aY=f.forwardRef((a,c)=>{let d=aF(aX,a.__scopeScrollArea),e=!!(d.scrollbarX&&d.scrollbarY);return"scroll"!==d.type&&e?(0,b.jsx)(aZ,{...a,ref:c}):null});aY.displayName=aX;var aZ=f.forwardRef((a,c)=>{let{__scopeScrollArea:d,...e}=a,g=aF(aX,d),[h,i]=f.useState(0),[j,k]=f.useState(0),l=!!(h&&j);return a5(g.scrollbarX,()=>{let a=g.scrollbarX?.offsetHeight||0;g.onCornerHeightChange(a),k(a)}),a5(g.scrollbarY,()=>{let a=g.scrollbarY?.offsetWidth||0;g.onCornerWidthChange(a),i(a)}),l?(0,b.jsx)(C.Primitive.div,{...e,ref:c,style:{width:h,height:j,position:"absolute",right:"ltr"===g.dir?0:void 0,left:"rtl"===g.dir?0:void 0,bottom:0,...a.style}}):null});function a$(a){return a?parseInt(a,10):0}function a_(a,b){let c=a/b;return isNaN(c)?0:c}function a0(a){let b=a_(a.viewport,a.content),c=a.scrollbar.paddingStart+a.scrollbar.paddingEnd;return Math.max((a.scrollbar.size-c)*b,18)}function a1(a,b,c="ltr"){let d=a0(b),e=b.scrollbar.paddingStart+b.scrollbar.paddingEnd,f=b.scrollbar.size-e,g=b.content-b.viewport,h=(0,aA.clamp)(a,"ltr"===c?[0,g]:[-1*g,0]);return a2([0,g],[0,f-d])(h)}function a2(a,b){return c=>{if(a[0]===a[1]||b[0]===b[1])return b[0];let d=(b[1]-b[0])/(a[1]-a[0]);return b[0]+d*(c-a[0])}}var a3=(a,b=()=>{})=>{let c={left:a.scrollLeft,top:a.scrollTop},d=0;return!function e(){let f={left:a.scrollLeft,top:a.scrollTop},g=c.left!==f.left,h=c.top!==f.top;(g||h)&&b(),c=f,d=window.requestAnimationFrame(e)}(),()=>window.cancelAnimationFrame(d)};function a4(a,b){let c=(0,az.useCallbackRef)(a),d=f.useRef(0);return f.useEffect(()=>()=>window.clearTimeout(d.current),[]),f.useCallback(()=>{window.clearTimeout(d.current),d.current=window.setTimeout(c,b)},[c,b])}function a5(a,b){let c=(0,az.useCallbackRef)(b);(0,D.useLayoutEffect)(()=>{let b=0;if(a){let d=new ResizeObserver(()=>{cancelAnimationFrame(b),b=window.requestAnimationFrame(c)});return d.observe(a),()=>{window.cancelAnimationFrame(b),d.unobserve(a)}}},[a,c])}let a6=f.forwardRef(({className:a,children:c,...d},e)=>(0,b.jsxs)(aG,{ref:e,className:(0,ay.cn)("relative overflow-hidden",a),...d,children:[(0,b.jsx)(aI,{className:"h-full w-full rounded-[inherit]",children:c}),(0,b.jsx)(a7,{}),(0,b.jsx)(aY,{})]}));a6.displayName=aG.displayName;let a7=f.forwardRef(({className:a,orientation:c="vertical",...d},e)=>(0,b.jsx)(aK,{ref:e,orientation:c,className:(0,ay.cn)("flex touch-none select-none transition-colors","vertical"===c&&"h-full w-2.5 border-l border-l-transparent p-[1px]","horizontal"===c&&"h-2.5 flex-col border-t border-t-transparent p-[1px]",a),...d,children:(0,b.jsx)(aV,{className:"relative flex-1 rounded-full bg-border"})}));function a8({className:a,...c}){return(0,b.jsx)("div",{"data-slot":"tree",className:(0,ay.cn)("size-full overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm",a),...c})}a7.displayName=aK.displayName;let a9=(0,f.createContext)(null),ba=()=>{let a=(0,f.useContext)(a9);if(!a)throw Error("useTree must be used within a TreeProvider");return a},bb=a=>a.type?"folder"===a.type:Array.isArray(a.children),bc=(a,b)=>[...new Set([...a??[],...b])],bd=new Intl.Collator("en",{numeric:!0,sensitivity:"base"}),be=(a,b)=>{let c=bb(a);return c!==bb(b)?c?-1:1:bd.compare(a.name,b.name)},bf=(a,b)=>{let c=(a=>{if("none"!==a)return"default"===a?be:a})(b),d=a.map(a=>Array.isArray(a.children)?{...a,children:bf(a.children,b)}:a);return c?[...d].sort(c):d},bg=(a,c)=>bf(a,c).map(a=>bb(a)?(0,b.jsx)(bj,{value:a.id,element:a.name,isSelectable:a.isSelectable,children:Array.isArray(a.children)?bg(a.children,c):null},a.id):(0,b.jsx)(bk,{value:a.id,isSelectable:a.isSelectable,children:(0,b.jsx)("span",{children:a.name})},a.id)),bh=(0,f.forwardRef)(({className:a,elements:c,initialSelectedId:d,initialExpandedItems:e,children:g,indicator:h=!0,openIcon:i,closeIcon:j,sort:k="default",dir:l,...m},n)=>{let[o,p]=(0,f.useState)(d),[q,r]=(0,f.useState)(e),s=(0,f.useCallback)(a=>{p(a)},[]),t=(0,f.useCallback)(a=>{r(b=>b?.includes(a)?b.filter(b=>b!==a):[...b??[],a])},[]),u=(0,f.useCallback)((a,b)=>{if(!a||!b)return;let c=(a,d=[])=>{let e=a.isSelectable??!0,f=[...d,a.id];a.id===b?e?r(a=>bc(a,f)):f.includes(a.id)&&(f.pop(),r(a=>bc(a,f))):Array.isArray(a.children)&&a.children.length>0&&a.children.forEach(a=>{c(a,f)})};a.forEach(a=>{c(a)})},[]);(0,f.useEffect)(()=>{d&&u(c,d)},[d,c,u]);let v="rtl"===l?"rtl":"ltr",w=g??(c?bg(c,k):null);return(0,b.jsx)(a9.Provider,{value:{selectedId:o,expandedItems:q,handleExpand:t,selectItem:s,setExpandedItems:r,indicator:h,openIcon:i,closeIcon:j,direction:v},children:(0,b.jsx)(a8,{className:(0,ay.cn)("size-full border-0 shadow-none",a),children:(0,b.jsx)(a6,{ref:n,className:"relative h-full px-2",dir:l,children:(0,b.jsx)(_,{...m,type:"multiple",value:q,className:"flex flex-col gap-1",dir:l,children:w})})})})});bh.displayName="Tree";let bi=(0,f.forwardRef)(({className:a,...c},d)=>{let{direction:e}=ba();return(0,b.jsx)("div",{dir:e,ref:d,className:(0,ay.cn)("absolute left-1.5 h-full w-px rounded-md bg-muted py-3 duration-300 ease-in-out hover:bg-slate-300 rtl:right-1.5",a),...c})});bi.displayName="TreeIndicator";let bj=(0,f.forwardRef)(({className:a,element:c,value:d,isSelectable:e=!0,isSelect:f,children:g,...h},i)=>{let{direction:j,handleExpand:k,expandedItems:l,indicator:m,selectedId:n,selectItem:o,openIcon:p,closeIcon:q}=ba(),r=f??n===d;return(0,b.jsxs)(am,{ref:i,...h,value:d,className:"relative h-full overflow-hidden",children:[(0,b.jsx)(ap,{asChild:!0,children:(0,b.jsxs)(aw.motion.button,{className:(0,ay.cn)("flex w-full items-center gap-1 rounded-md px-1 py-0.5 text-sm",a,{"bg-muted":r&&e,"cursor-pointer":e,"cursor-not-allowed opacity-50":!e}),disabled:!e,onClick:()=>{o(d),k(d)},whileHover:e?{x:2}:void 0,whileTap:e?{scale:.98}:void 0,children:[(0,b.jsx)(aw.motion.div,{initial:!1,animate:{rotate:(l?.includes(d),0)},transition:{duration:.2},children:l?.includes(d)?p??(0,b.jsx)(av,{className:"size-4 text-primary"}):q??(0,b.jsx)(au,{className:"size-4 text-primary"})}),(0,b.jsx)("span",{className:(0,ay.cn)("transition-colors duration-200",r&&"font-medium"),children:c})]})}),(0,b.jsx)(ar,{asChild:!0,children:(0,b.jsxs)(aw.motion.div,{initial:{opacity:0,height:0},animate:{opacity:1,height:"auto"},exit:{opacity:0,height:0},transition:{duration:.2,ease:[.4,0,.2,1]},className:"relative h-full overflow-hidden text-sm",children:[c&&m&&(0,b.jsx)(bi,{"aria-hidden":"true"}),(0,b.jsx)(_,{dir:j,type:"multiple",className:"ml-5 flex flex-col gap-1 py-1 rtl:mr-5",value:l,children:(0,b.jsx)(ax.AnimatePresence,{mode:"popLayout",children:g})})]})})]})});bj.displayName="Folder";let bk=(0,f.forwardRef)(({value:a,className:c,handleSelect:d,onClick:e,isSelectable:f=!0,isSelect:g,fileIcon:h,children:i},j)=>{let{direction:k,selectedId:l,selectItem:m}=ba(),n=g??l===a;return(0,b.jsxs)(aw.motion.button,{ref:j,type:"button",disabled:!f,initial:{opacity:0,x:-10},animate:{opacity:1,x:0},exit:{opacity:0,x:-10},transition:{duration:.15,ease:[.4,0,.2,1]},whileHover:f?{x:2}:void 0,whileTap:f?{scale:.98}:void 0,className:(0,ay.cn)("flex w-fit items-center gap-1 rounded-md pr-1 text-sm duration-200 ease-in-out rtl:pl-1 rtl:pr-0",{"bg-muted":n&&f},f?"cursor-pointer":"cursor-not-allowed opacity-50","rtl"===k?"rtl":"ltr",c),onClick:b=>{m(a),d?.(a),e?.(b)},children:[(0,b.jsx)(aw.motion.div,{initial:!1,animate:{scale:n?1.1:1},transition:{duration:.15},children:h??(0,b.jsx)(at,{className:"size-4"})}),i]})});bk.displayName="File",(0,f.forwardRef)(({className:a,elements:c,expandAll:d=!1,children:e,...g},h)=>{let{expandedItems:i,setExpandedItems:j}=ba(),k=(0,f.useCallback)(a=>{let b=[],c=a=>{if((a.isSelectable??!0)&&a.children&&a.children.length>0)for(let d of(b.push(a.id),a.children))c(d)};for(let b of a)c(b);return[...new Set(b)]},[]),l=(0,f.useCallback)(()=>{j?.([])},[j]);return(0,f.useEffect)(()=>{d&&j?.(k(c))},[d,c,k,j]),(0,b.jsxs)(w.Button,{variant:"ghost",className:(0,ay.cn)("absolute bottom-1 right-2 h-8 w-fit p-1",a),onClick:i&&i.length>0?l:()=>j?.(k(c)),ref:h,...g,children:[e,(0,b.jsx)("span",{className:"sr-only",children:"Toggle"})]})}).displayName="CollapseButton";let bl=["Create a responsive command-center layout with a delivery map, working command menu, and contextual live-data rail.","Make Kanban work interactive with drag and drop, keyboard-friendly move controls, filtering, and quick task creation.","Add a drift-resistant focus timer tied to the team’s current priority.","Fetch browser-safe weather from Open-Meteo and central-bank reference rates from Frankfurter v2 in parallel.","Provide honest loading, refresh, attribution, fallback, focus, and responsive states so the exported app remains usable."],bm=[{path:"App.tsx",language:"tsx",fullMatch:"",code:`import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, Check, Command, LayoutDashboard, Search, Settings2, Users, Wifi, X } from "lucide-react";

import { Board } from "./components/Board";
import { CurrencyCard } from "./components/CurrencyCard";
import { FocusTimer } from "./components/FocusTimer";
import { WeatherCard } from "./components/WeatherCard";
import { seedTasks, type Task } from "./data/tasks";
import "./styles.css";

const commandItems = [
  { label: "Open delivery board", detail: "Workspace", icon: LayoutDashboard },
  { label: "Review team handoffs", detail: "People", icon: Users },
  { label: "Open workspace settings", detail: "System", icon: Settings2 },
];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(seedTasks);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const commandInput = useRef<HTMLInputElement>(null);
  const completed = useMemo(() => tasks.filter((task) => task.status === "done").length, [tasks]);
  const activeCount = useMemo(() => tasks.filter((task) => task.status === "active").length, [tasks]);
  const activeTask = tasks.find((task) => task.status === "active")?.title ?? "Plan the next milestone";
  const progress = Math.round((completed / Math.max(tasks.length, 1)) * 100);
  const visibleCommands = commandItems.filter((item) => item.label.toLowerCase().includes(commandQuery.trim().toLowerCase()));

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((current) => !current);
      }
      if (event.key === "Escape") setCommandOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!commandOpen) return;
    const frame = window.requestAnimationFrame(() => commandInput.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [commandOpen]);

  return (
    <main className="workspace-shell">
      <header className="topbar">
        <a className="wordmark" href="#workspace" aria-label="Waypoint home">
          <span className="wordmark-mark" aria-hidden="true">W</span>
          <span><strong>Waypoint</strong><small>Atlas delivery ledger</small></span>
        </a>

        <button className="command-pill" type="button" onClick={() => setCommandOpen(true)} aria-label="Open command menu">
          <Search aria-hidden="true" />
          <span>Find a task or action</span>
          <kbd>⌘ K</kbd>
        </button>

        <div className="topbar-actions">
          <div className="presence" aria-label="Three teammates online">
            {[
              ["DA", "Drew"],
              ["MS", "Mina"],
              ["JL", "Jon"],
            ].map(([initials, name]) => <span key={initials} title={name}>{initials}</span>)}
          </div>
          <span className="sync-state"><Wifi aria-hidden="true" /> Live sync</span>
          <button className="icon-button" type="button" aria-label="Notifications"><Bell aria-hidden="true" /><span className="notification-dot" /></button>
        </div>
      </header>

      <div className="workspace" id="workspace">
        <section className="orientation" aria-labelledby="workspace-heading">
          <div className="orientation-copy">
            <p className="route-line"><span>Chicago</span><span>London</span><span>Tokyo</span></p>
            <h1 id="workspace-heading">Three desks. One launch ledger.</h1>
            <p>Decisions, delivery, time, weather, and reference rates—held in one operating view for the Atlas launch.</p>
          </div>

          <dl className="delivery-index" aria-label="Launch delivery status">
            <div><dt>Closed</dt><dd>{completed}<span>/{tasks.length}</span></dd></div>
            <div><dt>In motion</dt><dd>{activeCount}</dd></div>
            <div><dt>Delivery</dt><dd>{progress}<span>%</span></dd></div>
            <div className="delivery-progress" aria-hidden="true"><span style={{ transform: "scaleX(" + progress / 100 + ")" }} /></div>
          </dl>
        </section>

        <div className="map-legend" aria-label="Workspace map legend">
          <span><i className="legend-mark legend-work" /> Work ledger</span>
          <span><i className="legend-mark legend-live" /> Live public data</span>
          <span><i className="legend-mark legend-focus" /> Current focus</span>
        </div>

        <section className="operations-map" aria-label="Atlas launch operations map">
          <div className="map-board"><Board tasks={tasks} onChange={setTasks} /></div>
          <aside className="signal-rail" aria-label="Live planning signals">
            <FocusTimer task={activeTask} />
            <WeatherCard />
            <CurrencyCard />
          </aside>
        </section>
      </div>

      {commandOpen ? (
        <div className="command-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCommandOpen(false); }}>
          <section className="command-menu" role="dialog" aria-modal="true" aria-labelledby="command-heading">
            <div className="command-field">
              <Command aria-hidden="true" />
              <label htmlFor="command-search" id="command-heading">Search Waypoint</label>
              <input ref={commandInput} id="command-search" value={commandQuery} onChange={(event) => setCommandQuery(event.target.value)} placeholder="Type a task or action…" />
              <button className="icon-button" type="button" onClick={() => setCommandOpen(false)} aria-label="Close command menu"><X aria-hidden="true" /></button>
            </div>
            <div className="command-results">
              <p>Suggested actions</p>
              {visibleCommands.map((item) => {
                const Icon = item.icon;
                return <button key={item.label} type="button" onClick={() => setCommandOpen(false)}><Icon aria-hidden="true" /><span><strong>{item.label}</strong><small>{item.detail}</small></span><Check aria-hidden="true" /></button>;
              })}
              {visibleCommands.length === 0 ? <div className="command-empty">No matching action. Try “board” or “settings”.</div> : null}
            </div>
            <footer className="command-footer"><span><kbd>esc</kbd> close</span><span><kbd>↵</kbd> open</span></footer>
          </section>
        </div>
      ) : null}
    </main>
  );
}`},{path:"components/Board.tsx",language:"tsx",fullMatch:"",code:`import { useMemo, useState, type DragEvent, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, GripVertical, Plus, Search } from "lucide-react";

import type { Status, Task } from "../data/tasks";

const columns: { id: Status; label: string; note: string }[] = [
  { id: "backlog", label: "Ready", note: "Clear to start" },
  { id: "active", label: "In motion", note: "Work in progress" },
  { id: "done", label: "Shipped", note: "Closed this cycle" },
];

export function Board({ tasks, onChange }: { tasks: Task[]; onChange: (tasks: Task[]) => void }) {
  const [query, setQuery] = useState("");
  const [newTask, setNewTask] = useState("");
  const [activeColumn, setActiveColumn] = useState<Status>("backlog");
  const visibleTasks = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized ? tasks.filter((task) => (task.title + " " + task.label).toLowerCase().includes(normalized)) : tasks;
  }, [query, tasks]);

  const move = (taskId: number, status: Status) => {
    onChange(tasks.map((task) => (task.id === taskId ? { ...task, status } : task)));
    setActiveColumn(status);
  };

  const addTask = (event: FormEvent) => {
    event.preventDefault();
    const title = newTask.trim();
    if (!title) return;
    onChange(tasks.concat({ id: Date.now(), title, label: "New request", priority: "medium", owner: "YO", status: "backlog", estimate: "30m" }));
    setNewTask("");
    setActiveColumn("backlog");
  };

  const drop = (event: DragEvent<HTMLElement>, status: Status) => {
    event.preventDefault();
    const taskId = Number(event.dataTransfer.getData("text/task-id"));
    if (Number.isFinite(taskId)) move(taskId, status);
  };

  return (
    <section className="board" aria-labelledby="board-heading">
      <header className="board-header">
        <div><h2 id="board-heading">Delivery board</h2><p>Drag on desktop. Use move controls everywhere.</p></div>
        <label className="filter-field"><Search aria-hidden="true" /><span className="sr-only">Filter tasks</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find work" /></label>
      </header>

      <form className="quick-add" onSubmit={addTask}>
        <label><span>Next outcome</span><input value={newTask} onChange={(event) => setNewTask(event.target.value)} placeholder="Name the work that moves the launch…" /></label>
        <button type="submit" disabled={!newTask.trim()}><Plus aria-hidden="true" /> Add task</button>
      </form>

      <div className="mobile-column-tabs" role="group" aria-label="Board columns">
        {columns.map((column) => <button key={column.id} type="button" aria-pressed={activeColumn === column.id} onClick={() => setActiveColumn(column.id)}>{column.label}<span>{visibleTasks.filter((task) => task.status === column.id).length}</span></button>)}
      </div>

      <div className="board-columns">
        {columns.map((column, columnIndex) => {
          const items = visibleTasks.filter((task) => task.status === column.id);
          return (
            <section key={column.id} className={(activeColumn === column.id ? "board-column is-visible" : "board-column") + " column-" + column.id} aria-labelledby={column.id + "-heading"} onDragOver={(event) => event.preventDefault()} onDrop={(event) => drop(event, column.id)}>
              <header><span className="column-signal" aria-hidden="true" /><div><h3 id={column.id + "-heading"}>{column.label}</h3><p>{column.note}</p></div><strong>{items.length}</strong></header>
              <div className="task-list">
                {items.map((task) => (
                  <article key={task.id} className="task-card" draggable onDragStart={(event) => event.dataTransfer.setData("text/task-id", String(task.id))}>
                    <div className="task-card-top"><span className={"priority priority-" + task.priority}>{task.priority}</span><GripVertical aria-hidden="true" /></div>
                    <h4>{task.title}</h4><p>{task.label}</p>
                    <footer><span className="owner">{task.owner}</span><span className="estimate">{task.estimate}</span><div className="move-controls">
                      {columnIndex > 0 ? <button type="button" onClick={() => move(task.id, columns[columnIndex - 1].id)} aria-label={"Move " + task.title + " left"}><ArrowLeft aria-hidden="true" /></button> : null}
                      {columnIndex < columns.length - 1 ? <button type="button" onClick={() => move(task.id, columns[columnIndex + 1].id)} aria-label={"Move " + task.title + " right"}><ArrowRight aria-hidden="true" /></button> : null}
                    </div></footer>
                  </article>
                ))}
                {items.length === 0 ? <div className="empty-column"><strong>No matching work.</strong><span>Change the filter or add an outcome.</span></div> : null}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}`},{path:"components/FocusTimer.tsx",language:"tsx",fullMatch:"",code:`import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, TimerReset } from "lucide-react";

const SESSION_SECONDS = 25 * 60;

export function FocusTimer({ task }: { task: string }) {
  const [seconds, setSeconds] = useState(SESSION_SECONDS);
  const [running, setRunning] = useState(false);
  const endsAt = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const update = () => {
      if (endsAt.current === null) return;
      const next = Math.max(0, Math.ceil((endsAt.current - Date.now()) / 1000));
      setSeconds(next);
      if (next === 0) setRunning(false);
    };
    const timer = window.setInterval(update, 250);
    update();
    return () => window.clearInterval(timer);
  }, [running]);

  const toggle = () => {
    if (running) {
      if (endsAt.current !== null) setSeconds(Math.max(0, Math.ceil((endsAt.current - Date.now()) / 1000)));
      setRunning(false);
      return;
    }
    endsAt.current = Date.now() + seconds * 1000;
    setRunning(true);
  };

  const reset = () => { setRunning(false); setSeconds(SESSION_SECONDS); endsAt.current = null; };
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const remainder = String(seconds % 60).padStart(2, "0");
  const progress = (SESSION_SECONDS - seconds) / SESSION_SECONDS;

  return (
    <section className="signal-card focus-card" aria-labelledby="focus-heading" data-state={running ? "active" : "ready"}>
      <header><span className="signal-icon"><TimerReset aria-hidden="true" /></span><div><h2 id="focus-heading">Current priority</h2><p>{running ? "Focus block running" : "25 minute focus block"}</p></div><span className="state-chip"><i />{running ? "Live" : "Ready"}</span></header>
      <p className="focus-task">{task}</p>
      <div className="timer-row"><p className="timer-value">{minutes}<span>:</span>{remainder}</p><div className="signal-actions"><button className="primary-icon-button" type="button" onClick={toggle} aria-label={running ? "Pause focus timer" : "Start focus timer"}>{running ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}</button><button className="icon-button" type="button" onClick={reset} aria-label="Reset focus timer"><RotateCcw aria-hidden="true" /></button></div></div>
      <div className="timer-progress" aria-hidden="true"><span style={{ transform: "scaleX(" + progress + ")" }} /></div>
    </section>
  );
}`},{path:"components/WeatherCard.tsx",language:"tsx",fullMatch:"",code:`import { useCallback, useEffect, useState } from "react";
import { CloudSun, RefreshCw, Wind } from "lucide-react";

import { fetchJsonWithRetry } from "../lib/public-api";

type Weather = { temperature: number; apparent: number; wind: number; code: number; high: number; low: number; unit: string; windUnit: string };
const sampleWeather: Weather = { temperature: 76, apparent: 78, wind: 9, code: 2, high: 82, low: 67, unit: "\xb0F", windUnit: "mph" };
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function describe(code: number) { if (code === 0) return "Clear"; if (code <= 3) return "Partly cloudy"; if (code <= 48) return "Low visibility"; if (code <= 67) return "Rain nearby"; if (code <= 77) return "Snow nearby"; return "Showers possible"; }

export function WeatherCard() {
  const [weather, setWeather] = useState<Weather>(sampleWeather);
  const [state, setState] = useState<"loading" | "live" | "sample">("loading");
  const refresh = useCallback(async () => {
    setState("loading");
    try {
      const data = await fetchJsonWithRetry("https://api.open-meteo.com/v1/forecast?latitude=41.8781&longitude=-87.6298&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FChicago&forecast_days=1");
      if (!isRecord(data) || !isRecord(data.current) || !isRecord(data.current_units) || !isRecord(data.daily) || !Array.isArray(data.daily.temperature_2m_max) || !Array.isArray(data.daily.temperature_2m_min)) throw new Error("Weather response changed");
      const current = data.current; const units = data.current_units; const daily = data.daily;
      if (typeof current.temperature_2m !== "number" || typeof current.apparent_temperature !== "number" || typeof current.weather_code !== "number" || typeof current.wind_speed_10m !== "number" || typeof daily.temperature_2m_max[0] !== "number" || typeof daily.temperature_2m_min[0] !== "number") throw new Error("Weather fields are unavailable");
      setWeather({ temperature: current.temperature_2m, apparent: current.apparent_temperature, wind: current.wind_speed_10m, code: current.weather_code, high: daily.temperature_2m_max[0], low: daily.temperature_2m_min[0], unit: typeof units.temperature_2m === "string" ? units.temperature_2m : "\xb0F", windUnit: typeof units.wind_speed_10m === "string" ? units.wind_speed_10m : "mph" });
      setState("live");
    } catch { setWeather(sampleWeather); setState("sample"); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  return (
    <section className="signal-card weather-card" aria-labelledby="weather-heading" data-state={state}>
      <header><span className="signal-icon"><CloudSun aria-hidden="true" /></span><div><h2 id="weather-heading">Chicago conditions</h2><p>{state === "sample" ? "Sample—API unavailable" : state === "loading" ? "Refreshing Open-Meteo…" : "Live from Open-Meteo"}</p></div><button className="icon-button refresh-button" type="button" onClick={() => void refresh()} aria-label="Refresh Chicago weather" data-state={state}><RefreshCw aria-hidden="true" /></button></header>
      <div className="weather-reading"><p>{Math.round(weather.temperature)}<span>{weather.unit}</span></p><dl><div><dt>High / low</dt><dd>{Math.round(weather.high)}\xb0 / {Math.round(weather.low)}\xb0</dd></div><div><dt>Feels like</dt><dd>{Math.round(weather.apparent)}\xb0</dd></div></dl></div>
      <footer><span>{describe(weather.code)}</span><span><Wind aria-hidden="true" />{Math.round(weather.wind)} {weather.windUnit}</span></footer>
    </section>
  );
}`},{path:"components/CurrencyCard.tsx",language:"tsx",fullMatch:"",code:`import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, RefreshCw, TrendingUp } from "lucide-react";

import { fetchJsonWithRetry } from "../lib/public-api";

type Quote = "EUR" | "GBP" | "JPY";
type RateRow = { date: string; base: string; quote: string; rate: number };
const sampleRates: Record<Quote, number> = { EUR: 0.86, GBP: 0.74, JPY: 147.2 };
function isRateRow(value: unknown): value is RateRow { return typeof value === "object" && value !== null && typeof (value as RateRow).date === "string" && typeof (value as RateRow).base === "string" && typeof (value as RateRow).quote === "string" && typeof (value as RateRow).rate === "number"; }

export function CurrencyCard() {
  const [amount, setAmount] = useState("1000");
  const [quote, setQuote] = useState<Quote>("EUR");
  const [rates, setRates] = useState(sampleRates);
  const [rateDate, setRateDate] = useState("Reference rate");
  const [state, setState] = useState<"loading" | "live" | "sample">("loading");
  const refresh = useCallback(async () => {
    setState("loading");
    try {
      const data = await fetchJsonWithRetry("https://api.frankfurter.dev/v2/rates?base=USD&quotes=EUR,GBP,JPY");
      if (!Array.isArray(data)) throw new Error("Rate response changed");
      const rows = data.filter(isRateRow);
      if (rows.length < 3) throw new Error("Rate response changed");
      const next = { ...sampleRates };
      rows.forEach((row) => { if (row.quote === "EUR" || row.quote === "GBP" || row.quote === "JPY") next[row.quote] = row.rate; });
      setRates(next); setRateDate(rows[0]?.date ?? "Latest"); setState("live");
    } catch { setRates(sampleRates); setRateDate("Sample rate"); setState("sample"); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  const converted = useMemo(() => { const numericAmount = Number(amount); return Number.isFinite(numericAmount) ? numericAmount * rates[quote] : 0; }, [amount, quote, rates]);

  return (
    <section className="signal-card currency-card" aria-labelledby="currency-heading" data-state={state}>
      <header><span className="signal-icon"><TrendingUp aria-hidden="true" /></span><div><h2 id="currency-heading">Currency reference</h2><p>{state === "sample" ? "Sample—API unavailable" : state === "loading" ? "Refreshing Frankfurter…" : rateDate + " \xb7 Frankfurter"}</p></div><button className="icon-button refresh-button" type="button" onClick={() => void refresh()} aria-label="Refresh exchange rates" data-state={state}><RefreshCw aria-hidden="true" /></button></header>
      <div className="conversion-inputs"><label><span>From USD</span><input aria-label="Amount in US dollars" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} /></label><ArrowRight aria-hidden="true" /><label><span>To</span><select aria-label="Target currency" value={quote} onChange={(event) => setQuote(event.target.value as Quote)}><option>EUR</option><option>GBP</option><option>JPY</option></select></label></div>
      <div className="conversion-result"><span>Reference value</span><strong>{new Intl.NumberFormat("en-US", { style: "currency", currency: quote, maximumFractionDigits: quote === "JPY" ? 0 : 2 }).format(converted)}</strong></div>
    </section>
  );
}`},{path:"lib/public-api.ts",language:"ts",fullMatch:"",code:`const MAX_RETRIES = 1;
const REQUEST_TIMEOUT_MS = 6500;
function wait(milliseconds: number) { return new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds)); }
function isJsonValue(value: unknown): boolean { if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") return true; if (Array.isArray(value)) return value.every(isJsonValue); if (typeof value === "object") return Object.values(value).every(isJsonValue); return false; }
export async function fetchJsonWithRetry(url: string, attempt = 0): Promise<unknown> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error("Public API returned HTTP " + response.status);
    const payload: unknown = await response.json();
    if (!isJsonValue(payload)) throw new Error("Public API returned invalid JSON");
    return payload;
  } catch (error) {
    if (attempt < MAX_RETRIES) { await wait(350 * (attempt + 1)); return fetchJsonWithRetry(url, attempt + 1); }
    throw error;
  } finally { window.clearTimeout(timeout); }
}`},{path:"data/tasks.ts",language:"ts",fullMatch:"",code:`export type Status = "backlog" | "active" | "done";
export type Priority = "high" | "medium" | "low";
export type Task = { id: number; title: string; label: string; priority: Priority; owner: string; status: Status; estimate: string };
export const seedTasks: Task[] = [
  { id: 1, title: "Lock the launch narrative", label: "Go-to-market", priority: "high", owner: "DA", status: "backlog", estimate: "45m" },
  { id: 2, title: "Map partner handoff states", label: "Operations", priority: "medium", owner: "MS", status: "backlog", estimate: "30m" },
  { id: 3, title: "Prototype live API cards", label: "Product design", priority: "high", owner: "JL", status: "active", estimate: "1h" },
  { id: 4, title: "Verify mobile board controls", label: "Quality", priority: "medium", owner: "DA", status: "active", estimate: "25m" },
  { id: 5, title: "Publish pricing decision log", label: "Finance", priority: "low", owner: "MS", status: "done", estimate: "20m" },
  { id: 6, title: "Confirm launch-week owners", label: "Planning", priority: "medium", owner: "JL", status: "done", estimate: "15m" },
];`},{path:"tokens.css",language:"css",fullMatch:"",code:`/* Hallmark \xb7 tokens \xb7 theme: Coral \xb7 paper: light \xb7 display: geometric-sans \xb7 accent: warm */
@import url("https://fonts.googleapis.com/css2?family=Geist:wght@400;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap");
:root {
  --color-paper: oklch(97% 0.012 62);
  --color-paper-raised: oklch(99% 0.008 62);
  --color-paper-muted: oklch(94% 0.014 62);
  --color-ink: oklch(19% 0.018 45);
  --color-ink-soft: oklch(39% 0.018 45);
  --color-ink-muted: oklch(52% 0.016 45);
  --color-rule: oklch(84% 0.018 58);
  --color-rule-strong: oklch(69% 0.025 52);
  --color-accent: oklch(61% 0.19 31);
  --color-accent-dark: oklch(47% 0.16 31);
  --color-accent-soft: oklch(92% 0.045 31);
  --color-focus: oklch(48% 0.17 31);
  --color-positive: oklch(52% 0.12 154);
  --color-positive-soft: oklch(93% 0.035 154);
  --color-warning: oklch(62% 0.13 78);
  --color-warning-soft: oklch(94% 0.04 78);
  --color-info: oklch(52% 0.11 232);
  --color-info-soft: oklch(94% 0.03 232);
  --color-overlay: oklch(19% 0.018 45 / 0.52);
  --color-selection: oklch(61% 0.19 31 / 0.2);
  --font-display: "Geist", "Avenir Next", sans-serif;
  --font-body: "Geist", "Avenir Next", sans-serif;
  --font-mono: "IBM Plex Mono", monospace;
  --space-3xs: 0.125rem;
  --space-2xs: 0.25rem;
  --space-xs: 0.5rem;
  --space-sm: 0.75rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2.5rem;
  --space-2xl: 4rem;
  --text-xs: 0.7rem;
  --text-sm: 0.82rem;
  --text-base: 1rem;
  --text-lg: 1.25rem;
  --text-xl: 1.75rem;
  --text-display: clamp(2.4rem, 5vw, 4.8rem);
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.7, 0, 0.84, 0);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --dur-micro: 120ms;
  --dur-short: 220ms;
  --dur-long: 420ms;
  --rule-hairline: 1px;
  --rule-strong: 2px;
  --radius-xs: 0.25rem;
  --radius-sm: 0.5rem;
  --radius-md: 0.875rem;
  --radius-pill: 999px;
  --shadow-whisper: 0 1px 2px oklch(19% 0.018 45 / 0.06);
  --z-sticky: 200;
  --z-modal: 400;
}`},{path:"styles.css",language:"css",fullMatch:"",code:`/* Hallmark \xb7 pre-emit critique: P5 H5 E5 S5 R5 V5 */
/* Hallmark \xb7 macrostructure: Map / Diagram \xb7 genre: modern-minimal \xb7 theme: Coral \xb7 tone: technical editorial \xb7 anchor hue: coral \xb7 nav: N13 \xb7 footer: none \xb7 enrichment: none */
@import "./tokens.css";
* { box-sizing: border-box; }
html, body { overflow-x: clip; background: var(--color-paper); }
body { margin: 0; min-width: 0; color: var(--color-ink); font-family: var(--font-body); font-size: var(--text-base); }
button, input, select { font: inherit; }
button { cursor: pointer; }
button:disabled { cursor: not-allowed; }
svg { width: 1em; height: 1em; stroke-width: 1.8; }
::selection { background: var(--color-selection); }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }

.workspace-shell { min-height: 100vh; background: var(--color-paper); }
.topbar { position: sticky; top: 0; z-index: var(--z-sticky); display: grid; grid-template-columns: minmax(12rem, .8fr) minmax(18rem, 1.2fr) minmax(12rem, .8fr); align-items: center; gap: var(--space-lg); min-height: 4.5rem; padding: var(--space-sm) var(--space-lg); border-bottom: var(--rule-hairline) solid var(--color-rule); background: var(--color-paper-raised); }
.wordmark { display: inline-flex; align-items: center; gap: var(--space-sm); width: fit-content; color: var(--color-ink); text-decoration: none; white-space: nowrap; }
.wordmark-mark { display: grid; width: 2.5rem; height: 2.5rem; place-items: center; border-radius: 50%; background: var(--color-ink); color: var(--color-paper-raised); font-family: var(--font-mono); font-size: var(--text-sm); font-weight: 600; }
.wordmark strong, .wordmark small { display: block; }
.wordmark strong { font-family: var(--font-display); font-size: var(--text-sm); letter-spacing: -0.02em; }
.wordmark small { margin-top: var(--space-3xs); color: var(--color-ink-muted); font-size: var(--text-xs); }
.command-pill { justify-self: center; display: flex; width: min(100%, 28rem); min-height: 2.75rem; align-items: center; gap: var(--space-sm); padding: 0 var(--space-xs) 0 var(--space-md); border: var(--rule-hairline) solid var(--color-rule); border-radius: var(--radius-pill); background: var(--color-paper); color: var(--color-ink-muted); text-align: left; transition: transform var(--dur-micro) var(--ease-out), border-color var(--dur-short) var(--ease-out); }
.command-pill:hover { border-color: var(--color-rule-strong); transform: translateY(-1px); }
.command-pill:active { transform: translateY(0); }
.command-pill span { flex: 1; white-space: nowrap; }
.command-pill kbd, .command-footer kbd { border: var(--rule-hairline) solid var(--color-rule); border-radius: var(--radius-xs); background: var(--color-paper-raised); padding: var(--space-2xs) var(--space-xs); color: var(--color-ink-soft); font-family: var(--font-mono); font-size: var(--text-xs); }
.topbar-actions { display: flex; align-items: center; justify-content: flex-end; gap: var(--space-sm); }
.presence { display: flex; padding-left: var(--space-xs); }
.presence span { display: grid; width: 2rem; height: 2rem; place-items: center; margin-left: calc(var(--space-xs) * -1); border: var(--rule-strong) solid var(--color-paper-raised); border-radius: 50%; background: var(--color-paper-muted); color: var(--color-ink-soft); font-family: var(--font-mono); font-size: var(--text-xs); }
.sync-state { display: inline-flex; align-items: center; gap: var(--space-xs); color: var(--color-positive); font-size: var(--text-sm); white-space: nowrap; }
.icon-button, .primary-icon-button { display: grid; width: 2.75rem; height: 2.75rem; place-items: center; border-radius: 50%; transition: transform var(--dur-micro) var(--ease-out), background-color var(--dur-short) var(--ease-out), color var(--dur-short) var(--ease-out); }
.icon-button { border: var(--rule-hairline) solid var(--color-rule); background: var(--color-paper-raised); color: var(--color-ink-soft); }
.icon-button:hover { background: var(--color-paper-muted); color: var(--color-ink); transform: translateY(-1px); }
.icon-button:active, .primary-icon-button:active { transform: translateY(0); }
.primary-icon-button { border: var(--rule-hairline) solid var(--color-ink); background: var(--color-ink); color: var(--color-paper-raised); }
.primary-icon-button:hover { background: var(--color-accent-dark); border-color: var(--color-accent-dark); transform: translateY(-1px); }
.notification-dot { position: absolute; width: .4rem; height: .4rem; margin: -1.2rem 0 0 1.1rem; border: var(--rule-hairline) solid var(--color-paper-raised); border-radius: 50%; background: var(--color-accent); }

.workspace { width: min(100%, 108rem); margin: 0 auto; padding: var(--space-xl) var(--space-lg) var(--space-2xl); }
.orientation { display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(20rem, .55fr); gap: var(--space-2xl); align-items: end; padding: var(--space-lg) 0 var(--space-xl); border-bottom: var(--rule-hairline) solid var(--color-rule-strong); }
.orientation-copy { min-width: 0; }
.route-line { display: flex; align-items: center; gap: var(--space-sm); margin: 0 0 var(--space-lg); color: var(--color-ink-muted); font-family: var(--font-mono); font-size: var(--text-xs); }
.route-line span { display: inline-flex; align-items: center; gap: var(--space-sm); white-space: nowrap; }
.route-line span:not(:last-child)::after { content: "→"; color: var(--color-accent); }
.orientation h1 { max-width: 15ch; min-width: 0; margin: 0; font-family: var(--font-display); font-size: var(--text-display); font-style: normal; font-weight: 700; line-height: .96; letter-spacing: -.055em; overflow-wrap: anywhere; }
.orientation-copy > p:last-child { max-width: 62ch; margin: var(--space-lg) 0 0; color: var(--color-ink-soft); line-height: 1.65; }
.delivery-index { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); margin: 0; border-top: var(--rule-hairline) solid var(--color-rule); border-bottom: var(--rule-hairline) solid var(--color-rule); }
.delivery-index div:not(.delivery-progress) { min-width: 0; padding: var(--space-md); border-left: var(--rule-hairline) solid var(--color-rule); }
.delivery-index div:first-child { border-left: 0; }
.delivery-index dt { color: var(--color-ink-muted); font-size: var(--text-xs); }
.delivery-index dd { margin: var(--space-xs) 0 0; font-family: var(--font-mono); font-size: var(--text-xl); font-weight: 600; letter-spacing: -.04em; font-variant-numeric: tabular-nums; }
.delivery-index dd span { color: var(--color-ink-muted); font-size: var(--text-sm); }
.delivery-progress { grid-column: 1 / -1; height: var(--space-2xs); overflow: hidden; background: var(--color-paper-muted); }
.delivery-progress span, .timer-progress span { display: block; width: 100%; height: 100%; transform-origin: left center; background: var(--color-accent); transition: transform var(--dur-long) var(--ease-out); }
.map-legend { display: flex; flex-wrap: wrap; gap: var(--space-lg); padding: var(--space-md) 0; color: var(--color-ink-muted); font-size: var(--text-xs); }
.map-legend span { display: inline-flex; align-items: center; gap: var(--space-xs); white-space: nowrap; }
.legend-mark { width: .5rem; height: .5rem; border-radius: 50%; background: var(--color-ink-soft); }
.legend-live { background: var(--color-info); }
.legend-focus { background: var(--color-accent); }
.operations-map { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) minmax(18rem, 23rem); gap: var(--space-lg); min-width: 0; }
.operations-map::after { content: ""; position: absolute; top: var(--space-xl); right: calc(23rem + var(--space-sm)); bottom: var(--space-xl); border-left: var(--rule-hairline) dashed var(--color-rule-strong); pointer-events: none; }
.map-board, .signal-rail { min-width: 0; }
.signal-rail { display: grid; align-content: start; gap: var(--space-md); }

.board { min-width: 0; border-top: var(--rule-strong) solid var(--color-ink); background: var(--color-paper-raised); box-shadow: var(--shadow-whisper); }
.board-header { display: flex; align-items: center; justify-content: space-between; gap: var(--space-lg); padding: var(--space-lg); border-bottom: var(--rule-hairline) solid var(--color-rule); }
.board h2, .signal-card h2 { margin: 0; font-family: var(--font-display); font-style: normal; font-weight: 700; letter-spacing: -.025em; }
.board h2 { font-size: var(--text-lg); }
.board-header p, .signal-card header p { margin: var(--space-2xs) 0 0; color: var(--color-ink-muted); font-size: var(--text-xs); line-height: 1.5; }
.filter-field { position: relative; display: flex; align-items: center; min-width: 13rem; }
.filter-field svg { position: absolute; left: var(--space-sm); color: var(--color-ink-muted); }
.filter-field input { width: 100%; min-height: 2.75rem; padding: 0 var(--space-md) 0 2.25rem; border: var(--rule-hairline) solid var(--color-rule); border-radius: var(--radius-pill); background: var(--color-paper); color: var(--color-ink); }
.quick-add { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: var(--space-sm); padding: var(--space-sm) var(--space-lg); border-bottom: var(--rule-hairline) solid var(--color-rule); background: var(--color-paper-muted); }
.quick-add label, .conversion-inputs label { display: grid; gap: var(--space-2xs); color: var(--color-ink-muted); font-size: var(--text-xs); }
.quick-add input { width: 100%; min-height: 2.75rem; border: 0; border-bottom: var(--rule-hairline) solid var(--color-rule-strong); background: transparent; color: var(--color-ink); }
.quick-add button { display: inline-flex; min-height: 2.75rem; align-items: center; gap: var(--space-xs); padding: 0 var(--space-md); border: var(--rule-hairline) solid var(--color-ink); border-radius: var(--radius-pill); background: var(--color-ink); color: var(--color-paper-raised); font-weight: 600; white-space: nowrap; transition: transform var(--dur-micro) var(--ease-out), background-color var(--dur-short) var(--ease-out); }
.quick-add button:hover { background: var(--color-accent-dark); transform: translateY(-1px); }
.quick-add button:active { transform: translateY(0); }
.quick-add button:disabled { border-color: var(--color-rule); background: var(--color-rule); color: var(--color-ink-muted); transform: none; }
.mobile-column-tabs { display: none; }
.board-columns { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); min-width: 0; }
.board-column { min-width: 0; min-height: 32rem; padding: var(--space-md); border-left: var(--rule-hairline) solid var(--color-rule); background: var(--color-paper); }
.board-column:first-child { border-left: 0; }
.board-column > header { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: var(--space-sm); padding: 0 var(--space-2xs) var(--space-md); }
.column-signal { width: .55rem; height: .55rem; border-radius: 50%; background: var(--color-ink-muted); }
.column-active .column-signal { background: var(--color-accent); }
.column-done .column-signal { background: var(--color-positive); }
.board-column h3 { margin: 0; font-size: var(--text-sm); }
.board-column header p { margin: var(--space-3xs) 0 0; color: var(--color-ink-muted); font-size: var(--text-xs); }
.board-column header strong { display: grid; width: 1.75rem; height: 1.75rem; place-items: center; border: var(--rule-hairline) solid var(--color-rule); border-radius: 50%; font-family: var(--font-mono); font-size: var(--text-xs); }
.task-list { display: grid; gap: var(--space-sm); }
.task-card { padding: var(--space-md); border: var(--rule-hairline) solid var(--color-rule); border-radius: var(--radius-sm); background: var(--color-paper-raised); transition: transform var(--dur-short) var(--ease-out), border-color var(--dur-short) var(--ease-out); }
.task-card:hover, .task-card:focus-within { border-color: var(--color-rule-strong); transform: translateY(-2px); }
.task-card:active { transform: translateY(0); }
.task-card-top, .task-card footer { display: flex; align-items: center; justify-content: space-between; gap: var(--space-xs); }
.task-card-top > svg { color: var(--color-ink-muted); cursor: grab; }
.priority { padding: var(--space-2xs) var(--space-xs); border-radius: var(--radius-pill); font-family: var(--font-mono); font-size: var(--text-xs); }
.priority-high { background: var(--color-accent-soft); color: var(--color-accent-dark); }
.priority-medium { background: var(--color-warning-soft); color: var(--color-ink-soft); }
.priority-low { background: var(--color-paper-muted); color: var(--color-ink-soft); }
.task-card h4 { min-height: 2.8em; margin: var(--space-md) 0 var(--space-2xs); font-size: var(--text-sm); line-height: 1.4; }
.task-card > p { margin: 0; color: var(--color-ink-muted); font-size: var(--text-xs); }
.task-card footer { margin-top: var(--space-md); padding-top: var(--space-sm); border-top: var(--rule-hairline) solid var(--color-rule); }
.owner { display: grid; width: 1.75rem; height: 1.75rem; place-items: center; border-radius: 50%; background: var(--color-ink); color: var(--color-paper-raised); font-family: var(--font-mono); font-size: var(--text-xs); }
.estimate { margin-right: auto; color: var(--color-ink-muted); font-family: var(--font-mono); font-size: var(--text-xs); }
.move-controls { display: flex; gap: var(--space-2xs); }
.move-controls button { display: grid; width: 2.5rem; height: 2.5rem; place-items: center; border: 0; border-radius: 50%; background: transparent; color: var(--color-ink-muted); }
.move-controls button:hover { background: var(--color-paper-muted); color: var(--color-ink); }
.empty-column { display: grid; min-height: 8rem; place-content: center; gap: var(--space-xs); border: var(--rule-hairline) dashed var(--color-rule-strong); color: var(--color-ink-muted); text-align: center; }
.empty-column strong { color: var(--color-ink-soft); font-size: var(--text-sm); }
.empty-column span { font-size: var(--text-xs); }

.signal-card { position: relative; padding: var(--space-lg); border-top: var(--rule-strong) solid var(--color-ink); background: var(--color-paper-raised); box-shadow: var(--shadow-whisper); }
.signal-card > header { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: var(--space-sm); }
.signal-card h2 { font-size: var(--text-sm); }
.signal-icon { display: grid; width: 2.25rem; height: 2.25rem; place-items: center; border-radius: 50%; background: var(--color-paper-muted); color: var(--color-ink-soft); }
.state-chip { display: inline-flex; align-items: center; gap: var(--space-xs); color: var(--color-ink-muted); font-family: var(--font-mono); font-size: var(--text-xs); white-space: nowrap; }
.state-chip i { width: .45rem; height: .45rem; border-radius: 50%; background: var(--color-rule-strong); }
.focus-card[data-state="active"] .state-chip { color: var(--color-accent-dark); }
.focus-card[data-state="active"] .state-chip i { background: var(--color-accent); }
.focus-task { min-height: 3.2rem; margin: var(--space-lg) 0; font-size: var(--text-base); font-weight: 600; line-height: 1.5; }
.timer-row, .weather-reading, .weather-card footer { display: flex; align-items: flex-end; justify-content: space-between; gap: var(--space-md); }
.timer-value { margin: 0; font-family: var(--font-mono); font-size: clamp(2rem, 4vw, 3.25rem); font-weight: 600; letter-spacing: -.08em; font-variant-numeric: tabular-nums; }
.timer-value span { color: var(--color-accent); }
.signal-actions { display: flex; gap: var(--space-xs); }
.timer-progress { height: var(--space-2xs); margin-top: var(--space-lg); overflow: hidden; background: var(--color-paper-muted); }
.weather-card { border-top-color: var(--color-info); }
.weather-reading { margin-top: var(--space-xl); }
.weather-reading > p { margin: 0; font-family: var(--font-display); font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 700; letter-spacing: -.07em; line-height: 1; font-variant-numeric: tabular-nums; }
.weather-reading > p span { margin-left: var(--space-2xs); color: var(--color-info); font-size: var(--text-base); }
.weather-reading dl { display: grid; gap: var(--space-xs); margin: 0; text-align: right; }
.weather-reading dl div { display: grid; gap: var(--space-3xs); }
.weather-reading dt { color: var(--color-ink-muted); font-size: var(--text-xs); }
.weather-reading dd { margin: 0; font-family: var(--font-mono); font-size: var(--text-xs); font-variant-numeric: tabular-nums; }
.weather-card footer { align-items: center; margin-top: var(--space-lg); padding-top: var(--space-sm); border-top: var(--rule-hairline) solid var(--color-rule); color: var(--color-ink-soft); font-size: var(--text-xs); }
.weather-card footer span:last-child { display: inline-flex; align-items: center; gap: var(--space-xs); }
.refresh-button[data-state="loading"] svg { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.currency-card { border-top-color: var(--color-positive); }
.conversion-inputs { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: end; gap: var(--space-xs); margin-top: var(--space-lg); }
.conversion-inputs > svg { margin-bottom: var(--space-sm); color: var(--color-ink-muted); }
.conversion-inputs input, .conversion-inputs select { width: 100%; min-height: 2.75rem; padding: 0 var(--space-sm); border: var(--rule-hairline) solid var(--color-rule); border-radius: var(--radius-xs); background: var(--color-paper); color: var(--color-ink); font-family: var(--font-mono); font-size: var(--text-sm); }
.conversion-result { display: grid; gap: var(--space-xs); margin-top: var(--space-md); padding: var(--space-md); background: var(--color-positive-soft); }
.conversion-result span { color: var(--color-ink-muted); font-size: var(--text-xs); }
.conversion-result strong { font-family: var(--font-mono); font-size: var(--text-lg); font-variant-numeric: tabular-nums; }

.command-layer { position: fixed; inset: 0; z-index: var(--z-modal); display: grid; place-items: start center; padding: 12vh var(--space-md) var(--space-md); background: var(--color-overlay); animation: layer-in var(--dur-short) var(--ease-out) both; }
.command-menu { width: min(100%, 38rem); overflow: hidden; border: var(--rule-hairline) solid var(--color-rule); border-radius: var(--radius-md); background: var(--color-paper-raised); box-shadow: var(--shadow-whisper); animation: menu-in var(--dur-short) var(--ease-out) both; }
.command-field { display: grid; grid-template-columns: auto auto minmax(0, 1fr) auto; align-items: center; gap: var(--space-sm); padding: var(--space-md); border-bottom: var(--rule-hairline) solid var(--color-rule); }
.command-field label { color: var(--color-ink-muted); font-size: var(--text-xs); white-space: nowrap; }
.command-field input { min-width: 0; min-height: 2.75rem; border: 0; background: transparent; color: var(--color-ink); outline: 0; }
.command-results { padding: var(--space-sm); }
.command-results > p { margin: var(--space-xs) var(--space-sm); color: var(--color-ink-muted); font-family: var(--font-mono); font-size: var(--text-xs); }
.command-results > button { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: var(--space-sm); width: 100%; min-height: 3.75rem; padding: var(--space-sm); border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--color-ink); text-align: left; }
.command-results > button:hover, .command-results > button:focus-visible { background: var(--color-paper-muted); }
.command-results > button span, .command-results > button strong, .command-results > button small { display: block; min-width: 0; }
.command-results > button strong { font-size: var(--text-sm); }
.command-results > button small { margin-top: var(--space-2xs); color: var(--color-ink-muted); font-size: var(--text-xs); }
.command-results > button > svg:last-child { color: var(--color-accent); opacity: 0; }
.command-results > button:hover > svg:last-child, .command-results > button:focus-visible > svg:last-child { opacity: 1; }
.command-empty { padding: var(--space-xl) var(--space-md); color: var(--color-ink-muted); text-align: center; }
.command-footer { display: flex; justify-content: flex-end; gap: var(--space-lg); padding: var(--space-sm) var(--space-md); border-top: var(--rule-hairline) solid var(--color-rule); color: var(--color-ink-muted); font-size: var(--text-xs); }
@keyframes layer-in { from { opacity: 0; } }
@keyframes menu-in { from { opacity: 0; transform: translateY(-.5rem) scale(.98); } }

button:focus-visible, a:focus-visible, input:focus-visible, select:focus-visible { outline: var(--rule-strong) solid var(--color-focus); outline-offset: var(--space-2xs); }
input:hover, select:hover { border-color: var(--color-rule-strong); }
input:disabled, select:disabled { background: var(--color-paper-muted); color: var(--color-ink-muted); cursor: not-allowed; }
[data-state="sample"] .refresh-button { color: var(--color-warning); }
[data-state="live"] .refresh-button { color: var(--color-positive); }

@media (max-width: 78rem) {
  .orientation { grid-template-columns: minmax(0, 1fr) minmax(18rem, .65fr); gap: var(--space-xl); }
  .operations-map { grid-template-columns: minmax(0, 1fr); }
  .operations-map::after { display: none; }
  .signal-rail { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 56rem) {
  .topbar { grid-template-columns: minmax(0, 1fr) auto; }
  .command-pill { grid-column: 1 / -1; grid-row: 2; justify-self: stretch; width: 100%; }
  .orientation { grid-template-columns: minmax(0, 1fr); }
  .delivery-index { max-width: 34rem; }
  .signal-rail { grid-template-columns: minmax(0, 1fr); }
  .board-columns { grid-template-columns: minmax(0, 1fr); }
  .board-column { display: none; min-height: 24rem; border-left: 0; }
  .board-column.is-visible { display: block; }
  .mobile-column-tabs { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-bottom: var(--rule-hairline) solid var(--color-rule); }
  .mobile-column-tabs button { display: flex; min-width: 0; min-height: 3rem; align-items: center; justify-content: center; gap: var(--space-xs); border: 0; border-left: var(--rule-hairline) solid var(--color-rule); background: var(--color-paper-raised); color: var(--color-ink-muted); font-size: var(--text-xs); white-space: nowrap; }
  .mobile-column-tabs button:first-child { border-left: 0; }
  .mobile-column-tabs button[aria-pressed="true"] { background: var(--color-accent-soft); color: var(--color-accent-dark); }
  .mobile-column-tabs span { font-family: var(--font-mono); }
}
@media (max-width: 40rem) {
  .topbar { padding: var(--space-sm) var(--space-md); }
  .wordmark small, .sync-state, .presence { display: none; }
  .command-pill span { overflow: hidden; text-overflow: ellipsis; }
  .workspace { padding: var(--space-lg) var(--space-md) var(--space-xl); }
  .orientation { padding-top: var(--space-md); }
  .orientation h1 { font-size: clamp(2.35rem, 13vw, 3.5rem); }
  .orientation-copy > p:last-child { font-size: var(--text-sm); }
  .route-line { gap: var(--space-xs); }
  .delivery-index { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .delivery-index div:not(.delivery-progress) { padding: var(--space-sm) var(--space-xs); }
  .delivery-index dd { font-size: var(--text-lg); }
  .map-legend { gap: var(--space-sm); }
  .board-header { align-items: stretch; flex-direction: column; }
  .filter-field { min-width: 0; width: 100%; }
  .quick-add { grid-template-columns: minmax(0, 1fr); }
  .quick-add button { justify-content: center; }
  .task-card { padding: var(--space-sm); }
  .signal-card { padding: var(--space-md); }
  .conversion-inputs { grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); }
  .command-layer { align-items: stretch; padding: 0; }
  .command-menu { width: 100%; min-height: 100svh; border: 0; border-radius: 0; }
  .command-field { grid-template-columns: auto minmax(0, 1fr) auto; }
  .command-field label { display: none; }
  .command-footer { margin-top: auto; }
}
@media (max-width: 23.5rem) {
  .topbar-actions .icon-button { display: none; }
  .route-line span { font-size: .65rem; }
  .map-legend span { font-size: .65rem; }
  .conversion-inputs { grid-template-columns: minmax(0, 1fr); }
  .conversion-inputs > svg { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; animation-duration: 150ms !important; animation-iteration-count: 1 !important; transition-duration: 150ms !important; }
  .refresh-button[data-state="loading"] svg { animation-duration: 1.4s !important; animation-iteration-count: infinite !important; }
}`}];var bn=a.i(866760);let bo=(0,c.default)(async()=>{},{loadableGenerated:{modules:[344847]},ssr:!1}),bp=[{id:"Prompt",description:"Original request",icon:p.FileText},{id:"Plan",description:"Approved decisions",icon:r.ListChecks},{id:"Preview",description:"Interactive app",icon:t},{id:"Files",description:"Portable source",icon:o},{id:"Quality",description:"Verification report",icon:v.ShieldCheck}];function bq({label:a,value:c}){return(0,b.jsxs)("div",{className:"flex min-h-20 items-center justify-between gap-5 border-b border-border/70 py-4",children:[(0,b.jsx)("p",{className:"text-sm text-muted-foreground",children:a}),(0,b.jsx)("p",{className:"text-2xl font-semibold tabular-nums",children:c})]})}function br({icon:a,label:c,value:d}){return(0,b.jsxs)("div",{className:"min-w-0 border-b border-border/70 px-3 py-4 even:border-l [&:nth-child(n+3)]:border-b-0",children:[(0,b.jsx)(a,{className:"size-4 text-primary"}),(0,b.jsx)("p",{className:"mt-3 text-xs text-muted-foreground",children:c}),(0,b.jsx)("p",{className:"mt-1 whitespace-nowrap text-sm font-medium text-foreground",children:d})]})}a.s(["ExampleWorkspace",0,function(){let[a,c]=(0,f.useState)("Preview"),[j,o]=(0,f.useState)("App.tsx"),t=(0,f.useMemo)(()=>(0,bn.buildExportBundle)(bm),[]),x=(0,f.useMemo)(()=>(function(a){let b=[];for(let c of a){let a=c.split("/"),d=b,e="";a.forEach((b,c)=>{e=e?`${e}/${b}`:b;let f=c===a.length-1,g=d.find(a=>a.id===e);g||(g={id:e,name:b,type:f?"file":"folder",children:f?void 0:[]},d.push(g)),f||(d=g.children??[])})}return b})(bm.map(a=>a.path)),[]),y=bm.find(a=>a.path===j)??bm[0],z=t.qualityReport.diagnostics.length+t.qualityReport.accessibilityWarnings.length,A=t.qualityReport.apiIntegration.policyWarnings.length,B=async()=>{let a=new g.default;for(let b of t.files)a.file(b.path,b.content);let b=await a.generateAsync({type:"blob"}),c=URL.createObjectURL(b),d=document.createElement("a");d.href=c,d.download=(0,bn.getExportFilename)("Waypoint"),d.click(),URL.revokeObjectURL(c)};return(0,b.jsxs)("main",{className:"min-h-screen overflow-x-clip bg-background text-foreground",children:[(0,b.jsx)("header",{className:"sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85",children:(0,b.jsxs)("div",{className:"mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6",children:[(0,b.jsxs)(e.default,{href:"/",className:"inline-flex min-h-11 items-center gap-2.5 whitespace-nowrap text-sm font-medium tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",children:[(0,b.jsx)(d.default,{src:"/squidagent-logo.svg",alt:"Squid Agent",width:28,height:28,className:"size-7",priority:!0}),(0,b.jsx)("span",{className:"hidden sm:inline",children:"Squid Agent"}),(0,b.jsx)("span",{className:"hidden text-muted-foreground sm:inline",children:"/ public example"})]}),(0,b.jsxs)("div",{className:"flex items-center gap-2",children:[(0,b.jsxs)(w.Button,{variant:"outline",onClick:B,"aria-label":"Download source",className:"min-h-11 min-w-11 whitespace-nowrap px-0 sm:px-4",children:[(0,b.jsx)(m.Download,{className:"size-4"}),(0,b.jsx)("span",{className:"hidden sm:inline",children:"Download source"})]}),(0,b.jsx)(w.Button,{asChild:!0,className:"min-h-11 whitespace-nowrap",children:(0,b.jsxs)(e.default,{href:"/?starter=kanban-board",children:[(0,b.jsx)("span",{className:"hidden sm:inline",children:"Remix in Squid"}),(0,b.jsx)("span",{className:"sm:hidden",children:"Remix"}),(0,b.jsx)(h.ArrowRight,{className:"size-4"})]})})]})]})}),(0,b.jsxs)("section",{className:"mx-auto grid max-w-7xl gap-10 px-4 pb-10 pt-12 sm:px-6 sm:pb-12 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-end",children:[(0,b.jsxs)("div",{className:"min-w-0",children:[(0,b.jsxs)("p",{className:"inline-flex items-center gap-2 font-mono text-xs font-medium text-primary",children:[(0,b.jsx)("span",{className:"size-2 rounded-full bg-emerald-500","aria-hidden":"true"}),"PUBLIC BUILD · NO ACCOUNT REQUIRED"]}),(0,b.jsx)("h1",{className:"mt-5 max-w-3xl text-4xl font-semibold leading-[0.96] tracking-[-0.055em] [overflow-wrap:anywhere] sm:text-5xl lg:text-7xl",children:"A generated app you can interrogate."}),(0,b.jsx)("p",{className:"mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8",children:"Use the board. Start the timer. Refresh two public APIs. Then inspect the original prompt, approved plan, portable source, and recorded quality checks behind Waypoint."})]}),(0,b.jsxs)("div",{className:"grid grid-cols-2 border-y border-border/70",children:[(0,b.jsx)(br,{icon:n.Eye,label:"App runtime",value:"Interactive"}),(0,b.jsx)(br,{icon:l.Code2,label:"Source export",value:"Portable"}),(0,b.jsx)(br,{icon:u,label:"API contracts",value:"2 public"}),(0,b.jsx)(br,{icon:i.Check,label:"Recorded quality",value:`${t.files.length} files`})]})]}),(0,b.jsx)("div",{className:"mx-auto max-w-7xl px-4 sm:px-6",children:(0,b.jsxs)("div",{className:"grid border-y border-border/70 text-sm sm:grid-cols-[auto_minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center",children:[(0,b.jsxs)("div",{className:"flex min-h-14 items-center gap-3 border-b border-border/70 py-3 sm:border-b-0 sm:border-r sm:px-4",children:[(0,b.jsx)(k,{className:"size-4 shrink-0 text-primary"}),(0,b.jsx)("span",{className:"whitespace-nowrap font-medium",children:"Open-Meteo"})]}),(0,b.jsx)("p",{className:"border-b border-border/70 py-3 text-muted-foreground sm:border-b-0 sm:px-4",children:"Live Chicago forecast with explicit sample fallback."}),(0,b.jsxs)("div",{className:"flex min-h-14 items-center gap-3 border-b border-border/70 py-3 sm:border-b-0 sm:border-l sm:border-r sm:px-4",children:[(0,b.jsx)(q,{className:"size-4 shrink-0 text-primary"}),(0,b.jsx)("span",{className:"whitespace-nowrap font-medium",children:"Frankfurter v2"})]}),(0,b.jsx)("p",{className:"py-3 text-muted-foreground sm:px-4",children:"Reference USD rates with timeout and retry handling."})]})}),(0,b.jsxs)("div",{className:"mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-14",children:[(0,b.jsxs)("div",{className:"grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)]",children:[(0,b.jsxs)("aside",{className:"min-w-0 lg:sticky lg:top-6 lg:self-start",children:[(0,b.jsx)("p",{className:"mb-3 text-sm font-medium text-foreground",children:"Inspect the build"}),(0,b.jsx)("nav",{"aria-label":"Example workspace sections",className:"grid grid-cols-2 border-t border-border/70 sm:grid-cols-5 lg:flex lg:flex-col",children:bp.map(d=>{let e=d.icon,f=a===d.id;return(0,b.jsxs)("button",{type:"button","aria-pressed":f,onClick:()=>c(d.id),className:`group flex min-h-14 min-w-0 items-center gap-3 border-b border-border/70 px-2 text-left transition-[background-color,border-color,color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary lg:min-h-16 lg:border-l-2 lg:px-3 ${f?"border-l-primary bg-primary/[0.05] text-foreground":"border-l-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`,children:[(0,b.jsx)(e,{className:`size-4 shrink-0 ${f?"text-primary":""}`}),(0,b.jsxs)("span",{className:"min-w-0",children:[(0,b.jsx)("span",{className:"block whitespace-nowrap text-sm font-medium",children:d.id}),(0,b.jsx)("span",{className:"mt-0.5 hidden text-xs text-muted-foreground lg:block",children:d.description})]})]},d.id)})}),(0,b.jsxs)(e.default,{href:"/?starter=kanban-board",className:"mt-5 hidden min-h-11 items-center gap-2 whitespace-nowrap text-sm font-medium text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary lg:inline-flex",children:["Build from this example",(0,b.jsx)(h.ArrowRight,{className:"size-4"})]})]}),(0,b.jsxs)("section",{"aria-label":`${a} view`,className:"min-h-[640px] min-w-0 overflow-hidden border-y border-border/70 bg-card shadow-[0_1px_2px_hsl(var(--foreground)/0.04)]",children:["Prompt"===a&&(0,b.jsxs)("div",{className:"mx-auto max-w-4xl px-5 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16",children:[(0,b.jsxs)("div",{className:"flex items-center gap-3 text-primary",children:[(0,b.jsx)("span",{className:"grid size-10 place-items-center rounded-lg bg-primary/10",children:(0,b.jsx)(p.FileText,{className:"size-5"})}),(0,b.jsx)("p",{className:"text-sm font-medium",children:"Original request"})]}),(0,b.jsx)("h2",{className:"mt-8 max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-4xl",children:"The brief behind Waypoint"}),(0,b.jsx)("blockquote",{className:"mt-8 border-l-2 border-primary pl-5 text-xl leading-8 text-foreground/90 sm:pl-7 sm:text-2xl sm:leading-9",children:"Build a premium global delivery workspace with an interactive Kanban board, an active-task focus timer, live Chicago weather, and reference currency conversion powered by public APIs."}),(0,b.jsx)("p",{className:"mt-8 max-w-2xl text-sm leading-6 text-muted-foreground",children:"Squid turned this request into an approved plan before generating the project. Open the Plan view to inspect those decisions."})]}),"Plan"===a&&(0,b.jsxs)("div",{className:"mx-auto max-w-4xl px-5 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16",children:[(0,b.jsxs)("div",{className:"flex items-center gap-3 text-primary",children:[(0,b.jsx)("span",{className:"grid size-10 place-items-center rounded-lg bg-primary/10",children:(0,b.jsx)(r.ListChecks,{className:"size-5"})}),(0,b.jsx)("p",{className:"text-sm font-medium",children:"Approved before generation"})]}),(0,b.jsx)("h2",{className:"mt-8 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl",children:"Approved build plan"}),(0,b.jsx)("ol",{className:"mt-10 border-t border-border/70",children:bl.map((a,c)=>(0,b.jsxs)("li",{className:"grid gap-3 border-b border-border/70 py-5 sm:grid-cols-[3rem_minmax(0,1fr)] sm:items-start sm:gap-5",children:[(0,b.jsx)("span",{className:"font-mono text-sm font-medium tabular-nums text-primary",children:String(c+1).padStart(2,"0")}),(0,b.jsx)("p",{className:"text-base leading-7 text-foreground/80",children:a})]},a))})]}),"Preview"===a&&(0,b.jsxs)("div",{className:"min-w-0",children:[(0,b.jsxs)("div",{className:"grid gap-4 border-b border-border/70 bg-muted/30 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5",children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("h2",{className:"text-sm font-semibold",children:"Interactive preview"}),(0,b.jsx)("p",{className:"mt-1 text-xs leading-5 text-muted-foreground",children:"Drag a task, start the focus timer, or refresh the live data."})]}),(0,b.jsxs)("div",{className:"flex flex-wrap items-center gap-x-4 gap-y-2 text-xs",children:[(0,b.jsxs)("span",{className:"inline-flex items-center gap-2 whitespace-nowrap font-medium text-emerald-600 dark:text-emerald-400",children:[(0,b.jsx)("span",{className:"size-2 rounded-full bg-emerald-500"}),"Running locally"]}),(0,b.jsx)("span",{className:"whitespace-nowrap text-muted-foreground",children:"Open-Meteo · Frankfurter"})]})]}),(0,b.jsx)("div",{className:"h-[72svh] max-h-[820px] min-h-[620px] bg-slate-100",children:(0,b.jsx)(bo,{files:bm.map(a=>({path:a.path,content:a.code}))})})]}),"Files"===a&&(0,b.jsxs)("div",{className:"grid min-h-[680px] min-w-0 lg:grid-cols-[18rem_minmax(0,1fr)]",children:[(0,b.jsxs)("aside",{className:"min-w-0 bg-muted/30",children:[(0,b.jsxs)("div",{className:"flex min-h-14 items-center justify-between gap-3 bg-muted/40 px-4",children:[(0,b.jsxs)("div",{className:"min-w-0",children:[(0,b.jsx)("p",{className:"text-sm font-semibold",children:"Project source"}),(0,b.jsxs)("p",{className:"mt-0.5 text-xs text-muted-foreground",children:[bm.length," generated files"]})]}),(0,b.jsxs)("span",{className:"inline-flex min-h-8 items-center gap-1.5 whitespace-nowrap rounded-md bg-primary px-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-primary-foreground shadow-sm",children:[(0,b.jsx)(s.LockKeyhole,{className:"size-3","aria-hidden":"true"}),"Read-only"]})]}),(0,b.jsx)("nav",{"aria-label":"Generated files",className:"h-52 py-3 lg:h-[624px]",children:(0,b.jsx)(bh,{elements:x,initialSelectedId:j,initialExpandedItems:["components","data","lib"],className:"h-full",children:x.map(a=>(function a(c,d,e){return"folder"===c.type||c.children?(0,b.jsx)(bj,{value:c.id,element:c.name,isSelect:d.startsWith(`${c.id}/`),className:"min-h-9 px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",children:c.children?.map(b=>a(b,d,e))},c.id):(0,b.jsxs)(bk,{value:c.id,isSelect:d===c.id,handleSelect:e,className:"min-h-9 w-full min-w-0 px-2 text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",children:[(0,b.jsx)("span",{"aria-hidden":"true",className:"truncate",children:c.name}),(0,b.jsx)("span",{className:"sr-only",children:c.id})]},c.id)})(a,y.path,o))})})]}),(0,b.jsxs)("section",{"aria-label":`${y.path} source`,className:"min-w-0 bg-slate-950 text-slate-200",children:[(0,b.jsxs)("div",{className:"flex min-h-14 items-center justify-between gap-4 bg-slate-900/80 px-4 sm:px-5",children:[(0,b.jsxs)("div",{className:"flex min-w-0 items-center gap-2.5",children:[(0,b.jsx)(l.Code2,{className:"size-4 shrink-0 text-blue-400"}),(0,b.jsx)("span",{className:"truncate font-mono text-xs text-slate-200 sm:text-sm",children:y.path})]}),(0,b.jsxs)("div",{className:"flex shrink-0 items-center gap-3 text-[10px] uppercase tracking-wider text-slate-500",children:[(0,b.jsx)("span",{children:y.language}),(0,b.jsxs)("span",{className:"hidden sm:inline",children:[y.code.split("\n").length," lines"]})]})]}),(0,b.jsx)("pre",{className:"max-h-[720px] min-h-[520px] overflow-auto py-4 text-xs leading-6 sm:py-5 sm:text-[13px]",children:(0,b.jsx)("code",{className:"block min-w-max",children:y.code.split("\n").map((a,c)=>(0,b.jsxs)("span",{className:"grid grid-cols-[3.25rem_minmax(0,1fr)] px-4 hover:bg-slate-900/70 sm:grid-cols-[4rem_minmax(0,1fr)] sm:px-5",children:[(0,b.jsx)("span",{"aria-hidden":"true",className:"select-none pr-3 text-right font-mono text-slate-600",children:c+1}),(0,b.jsx)("span",{className:"pl-4 font-mono text-slate-300",children:a||" "})]},`${y.path}-${c}`))})})]})]}),"Quality"===a&&(0,b.jsxs)("div",{className:"grid min-h-[680px] lg:grid-cols-[minmax(0,1.08fr)_minmax(18rem,0.92fr)]",children:[(0,b.jsxs)("div",{className:"flex flex-col justify-between border-b border-border/70 px-5 py-10 sm:px-10 sm:py-14 lg:border-b-0 lg:border-r lg:px-12",children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("span",{className:"grid size-12 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",children:(0,b.jsx)(v.ShieldCheck,{className:"size-6"})}),(0,b.jsx)("h2",{className:"mt-8 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl",children:"Quality report"}),(0,b.jsx)("p",{className:"mt-5 max-w-xl text-base leading-7 text-muted-foreground",children:"The export records what was checked, what remains advisory, and how the connected public APIs are expected to behave."})]}),(0,b.jsxs)("div",{className:"mt-10 border-l-2 border-emerald-500 pl-5",children:[(0,b.jsx)("p",{className:"font-semibold text-foreground",children:"Static checks passed"}),(0,b.jsx)("p",{className:"mt-2 text-sm leading-6 text-muted-foreground",children:"The download includes provider notes, resilient fallbacks, source, package scripts, a README, the quality report, and deployment configuration."})]})]}),(0,b.jsxs)("div",{className:"px-5 py-8 sm:px-8 sm:py-10",children:[(0,b.jsx)("h3",{className:"text-sm font-semibold",children:"Recorded results"}),(0,b.jsxs)("div",{className:"mt-5 border-t border-border/70",children:[(0,b.jsx)(bq,{label:"Files generated",value:t.qualityReport.filesGenerated}),(0,b.jsx)(bq,{label:"Imports resolved",value:t.qualityReport.importsResolved}),(0,b.jsx)(bq,{label:"Warnings",value:z}),(0,b.jsx)(bq,{label:"API policy notes",value:A})]}),(0,b.jsxs)(w.Button,{variant:"outline",onClick:B,className:"mt-8 min-h-11 w-full whitespace-nowrap",children:[(0,b.jsx)(m.Download,{className:"size-4"})," Download verified source"]})]})]})]})]}),(0,b.jsxs)(e.default,{href:"/?starter=kanban-board",className:"mt-6 inline-flex min-h-11 items-center gap-2 whitespace-nowrap text-sm font-medium text-primary underline decoration-primary/30 underline-offset-4 lg:hidden",children:["Build from this example",(0,b.jsx)(h.ArrowRight,{className:"size-4"})]})]}),(0,b.jsx)("footer",{className:"border-t border-border/70",children:(0,b.jsxs)("div",{className:"mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6",children:[(0,b.jsx)("p",{children:"Waypoint is a public Squid Agent build—not a product mockup."}),(0,b.jsxs)("p",{className:"flex flex-wrap gap-x-3 gap-y-2",children:[(0,b.jsx)("span",{children:"Open-Meteo"}),(0,b.jsx)("span",{"aria-hidden":"true",children:"·"}),(0,b.jsx)("span",{children:"Frankfurter v2"}),(0,b.jsx)("span",{"aria-hidden":"true",children:"·"}),(0,b.jsx)(e.default,{className:"whitespace-nowrap text-foreground underline decoration-border underline-offset-4 hover:decoration-primary",href:"/?starter=kanban-board",children:"Remix this build"})]})]})})]})}],28964)}];

//# sourceMappingURL=app_example_workspace_tsx_1hw9mck._.js.map