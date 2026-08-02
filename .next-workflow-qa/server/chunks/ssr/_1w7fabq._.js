module.exports=[729366,a=>{"use strict";var b=a.i(748790),c=a.i(182248);let d="loading-ui-comet-shadow",e="loading-ui-comet-rotation";function f(a,b,c){return Number.isFinite(a)?Math.min(Math.max(a,b),c):b}function g({"aria-label":a="Loading",className:h,style:i,headScale:j,radiusScale:k,variant:l="inline",role:m="status",...n}){let o=f(j??("page"===l?.2:.14),.08,.35),p=f(k??("page"===l?.83:.46),.3,1.1),q={...i,containerType:"size","--loading-ui-comet-head":`${(100*o).toFixed(2)}cqmin`,"--loading-ui-comet-radius":`${(100*p).toFixed(2)}cqmin`};return(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)("style",{href:"loading-ui-comet-spinner",precedence:"default",children:`
        @keyframes ${d} {
          0% {
            box-shadow:
              0 calc(var(--loading-ui-comet-radius) * -1) 0 calc(var(--loading-ui-comet-head) * -2),
              0 calc(var(--loading-ui-comet-radius) * -1) 0 calc(var(--loading-ui-comet-head) * -2.1),
              0 calc(var(--loading-ui-comet-radius) * -1) 0 calc(var(--loading-ui-comet-head) * -2.2),
              0 calc(var(--loading-ui-comet-radius) * -1) 0 calc(var(--loading-ui-comet-head) * -2.3),
              0 calc(var(--loading-ui-comet-radius) * -1) 0 calc(var(--loading-ui-comet-head) * -2.385);
          }

          5%,
          95% {
            box-shadow:
              0 calc(var(--loading-ui-comet-radius) * -1) 0 calc(var(--loading-ui-comet-head) * -2),
              0 calc(var(--loading-ui-comet-radius) * -1) 0 calc(var(--loading-ui-comet-head) * -2.1),
              0 calc(var(--loading-ui-comet-radius) * -1) 0 calc(var(--loading-ui-comet-head) * -2.2),
              0 calc(var(--loading-ui-comet-radius) * -1) 0 calc(var(--loading-ui-comet-head) * -2.3),
              0 calc(var(--loading-ui-comet-radius) * -1) 0 calc(var(--loading-ui-comet-head) * -2.385);
          }

          10%,
          59% {
            box-shadow:
              0 calc(var(--loading-ui-comet-radius) * -1) 0 calc(var(--loading-ui-comet-head) * -2),
              calc(var(--loading-ui-comet-radius) * -0.105) calc(var(--loading-ui-comet-radius) * -0.994) 0 calc(var(--loading-ui-comet-head) * -2.1),
              calc(var(--loading-ui-comet-radius) * -0.208) calc(var(--loading-ui-comet-radius) * -0.978) 0 calc(var(--loading-ui-comet-head) * -2.2),
              calc(var(--loading-ui-comet-radius) * -0.308) calc(var(--loading-ui-comet-radius) * -0.95) 0 calc(var(--loading-ui-comet-head) * -2.3),
              calc(var(--loading-ui-comet-radius) * -0.358) calc(var(--loading-ui-comet-radius) * -0.934) 0 calc(var(--loading-ui-comet-head) * -2.385);
          }

          20% {
            box-shadow:
              0 calc(var(--loading-ui-comet-radius) * -1) 0 calc(var(--loading-ui-comet-head) * -2),
              calc(var(--loading-ui-comet-radius) * -0.407) calc(var(--loading-ui-comet-radius) * -0.913) 0 calc(var(--loading-ui-comet-head) * -2.1),
              calc(var(--loading-ui-comet-radius) * -0.669) calc(var(--loading-ui-comet-radius) * -0.743) 0 calc(var(--loading-ui-comet-head) * -2.2),
              calc(var(--loading-ui-comet-radius) * -0.808) calc(var(--loading-ui-comet-radius) * -0.588) 0 calc(var(--loading-ui-comet-head) * -2.3),
              calc(var(--loading-ui-comet-radius) * -0.902) calc(var(--loading-ui-comet-radius) * -0.41) 0 calc(var(--loading-ui-comet-head) * -2.385);
          }

          38% {
            box-shadow:
              0 calc(var(--loading-ui-comet-radius) * -1) 0 calc(var(--loading-ui-comet-head) * -2),
              calc(var(--loading-ui-comet-radius) * -0.454) calc(var(--loading-ui-comet-radius) * -0.892) 0 calc(var(--loading-ui-comet-head) * -2.1),
              calc(var(--loading-ui-comet-radius) * -0.777) calc(var(--loading-ui-comet-radius) * -0.629) 0 calc(var(--loading-ui-comet-head) * -2.2),
              calc(var(--loading-ui-comet-radius) * -0.934) calc(var(--loading-ui-comet-radius) * -0.358) 0 calc(var(--loading-ui-comet-head) * -2.3),
              calc(var(--loading-ui-comet-radius) * -0.988) calc(var(--loading-ui-comet-radius) * -0.108) 0 calc(var(--loading-ui-comet-head) * -2.385);
          }

          100% {
            box-shadow:
              0 calc(var(--loading-ui-comet-radius) * -1) 0 calc(var(--loading-ui-comet-head) * -2),
              0 calc(var(--loading-ui-comet-radius) * -1) 0 calc(var(--loading-ui-comet-head) * -2.1),
              0 calc(var(--loading-ui-comet-radius) * -1) 0 calc(var(--loading-ui-comet-head) * -2.2),
              0 calc(var(--loading-ui-comet-radius) * -1) 0 calc(var(--loading-ui-comet-head) * -2.3),
              0 calc(var(--loading-ui-comet-radius) * -1) 0 calc(var(--loading-ui-comet-head) * -2.385);
          }
        }

        @keyframes ${e} {
          0% {
            transform: rotate(0deg);
          }

          100% {
            transform: rotate(360deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .loading-ui-comet-orbit {
            animation: none !important;
            transform: rotate(40deg) translateZ(0) !important;
          }
        }
      `}),(0,b.jsxs)("span",{"data-slot":"comet-spinner",role:m,"aria-label":a,className:(0,c.cn)("relative inline-flex aspect-square size-4 shrink-0 items-center justify-center align-middle",h),style:q,...n,children:[(0,b.jsx)("span",{"aria-hidden":"true",className:"loading-ui-comet-orbit absolute inset-0 rounded-full",style:{animation:`${d} var(--duration, 1.7s) infinite var(--easing, ease), ${e} var(--duration, 1.7s) infinite var(--easing, ease)`,transform:"translateZ(0)"}}),(0,b.jsx)("span",{className:"sr-only",children:a})]})]})}function h({children:a,className:d,variant:e="page",...f}){return(0,b.jsx)("div",{className:(0,c.cn)("flex flex-col items-center justify-center px-4","page"===e?"min-h-dvh":"min-h-full",d),"data-slot":"page-status-shell",...f,children:a})}a.s(["FullPageStatus",0,function({description:a,label:d,spinnerClassName:e,variant:f="page"}){return(0,b.jsx)(h,{variant:f,children:(0,b.jsxs)("div",{"aria-atomic":"true","aria-live":"polite",className:"flex flex-col items-center justify-center gap-4 text-center",role:"status",children:[(0,b.jsx)(g,{"aria-hidden":"true",className:(0,c.cn)("block size-8",e),role:"presentation",variant:"page"}),(0,b.jsxs)("div",{className:"space-y-1",children:[(0,b.jsx)("p",{className:"text-sm text-muted-foreground",children:d}),a?(0,b.jsx)("div",{className:"text-xs text-muted-foreground",children:a}):null]})]})})}],729366)},893589,a=>{"use strict";var b=a.i(748790),c=a.i(729366);a.s(["default",0,function(){return(0,b.jsx)(c.FullPageStatus,{label:"Loading..."})}])},424808,a=>{a.n(a.i(893589))}];

//# sourceMappingURL=_1w7fabq._.js.map