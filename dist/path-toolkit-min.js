!function(e,r){"object"==typeof exports&&"undefined"!=typeof module?module.exports=r():"function"==typeof define&&define.amd?define(r):e.PathToolkit=r()}(this,function(){"use strict";var e=function(e){return e}(),r="*",t="undefined",n="string",o="parent",s="root",i="placeholder",a="context",c="property",f="collection",l="singlequote",p="doublequote",u="call",h="evalProperty",x=function(e,t){var n=(e.indexOf(r),e.split(r,2)),o=!0;if(n[0]){if(n[0]===e)return n[0]===t;o=o&&t.substr(0,n[0].length)===n[0]}return n[1]&&(o=o&&t.substr(-1*n[1].length)===n[1]),o},y=function(e){return typeof e===t||null===e?!1:"function"==typeof e||"object"==typeof e},w=function(e){var r;return typeof e!==n?e&&!0:(r=e.toUpperCase(),"TRUE"===r||"YES"===r||"ON"===r)},v=function(e,r){var t=new RegExp(e,"g");return e+r.replace(t,"\\"+e)+e},d=function(d){var C,g,P,m,E,O,b,A,S,j,k,R,q=this,D={},F={},T=function(){C=Object.keys(F.prefixes),g=Object.keys(F.separators),P=Object.keys(F.containers),m=P.map(function(e){return F.containers[e].closer}),E="",Object.keys(F.separators).forEach(function(e){F.separators[e].exec===c&&(E=e)}),O="",Object.keys(F.containers).forEach(function(e){F.containers[e].exec===l&&(O=e)}),b="[\\\\"+[r].concat(C).concat(g).concat(P).join("\\").replace("\\"+E,"")+"]",A=new RegExp(b),S="[\\\\\\"+[r].concat(C).concat(g).concat(P).concat(m).join("\\")+"]",j=new RegExp(S,"g"),k=new RegExp("\\"+S.replace(/^\[/,"[^")),R=new RegExp("\\"+r)},U=function(){F=F||{},F.useCache=!0,F.simple=!1,F.force=!1,F.prefixes={"<":{exec:o},"~":{exec:s},"%":{exec:i},"@":{exec:a}},F.separators={".":{exec:c},",":{exec:f}},F.containers={"[":{closer:"]",exec:c},"'":{closer:"'",exec:l},'"':{closer:'"',exec:p},"(":{closer:")",exec:u},"{":{closer:"}",exec:h}}},$=function(t){var o="",s=!0,i=[],a=[],u={},h=0,x="",y=!1,w="",v=0,d="",C="",g="",P=[],m=0,O=0;if(F.useCache&&D[t]!==e)return D[t];if(o=t.replace(k,"$&".substr(1)),h=o.length,typeof t===n&&!A.test(t))return i=o.split(E),F.useCache&&(D[t]={t:i,simple:s}),{t:i,simple:s};for(v=0;h>v;v++){if(O||"\\"!==o[v]||(O=v+1,v++),o[v]===r&&(y=!0),m>0)if(!O&&o[v]===d&&d!==C.closer&&m++,!O&&o[v]===C.closer&&m--,m>0)w+=o[v];else{if(h>v+1&&F.separators[o[v+1]]&&F.separators[o[v+1]].exec===f){if(a=$(w),a===e)return;a.exec=C.exec,P.push(a)}else if(P[0]){if(a=$(w),a===e)return;a.exec=C.exec,P.push(a),i.push(P),P=[],s&=!1}else if(C.exec===c){if(a=$(w),a===e)return;i=i.concat(a.t),s&=a.simple}else if(C.exec===l||C.exec===p)i.push(w),s&=!0;else{if(a=$(w),a===e)return;a.exec=C.exec,i.push(a),s&=!1}w=""}else if(!O&&o[v]in F.prefixes&&F.prefixes[o[v]].exec)u.has=!0,u[F.prefixes[o[v]].exec]?u[F.prefixes[o[v]].exec]++:u[F.prefixes[o[v]].exec]=1;else if(!O&&F.separators.hasOwnProperty(o[v])&&F.separators[o[v]].exec){if(g=F.separators[o[v]],!x&&(u.has||y))return;x&&(u.has||y)&&(x={w:x,mods:u},u={},s&=!1),g.exec===c?P[0]!==e?(x&&P.push(x),i.push(P),P=[],s&=!1):(x&&i.push(x),s&=!0):g.exec===f&&x&&P.push(x),x="",y=!1}else!O&&F.containers.hasOwnProperty(o[v])&&F.containers[o[v]].exec?(C=F.containers[o[v]],x&&(u.has||y)&&(x={w:x,mods:u},u={}),P[0]!==e?x&&P.push(x):(x&&i.push(x),s&=!0),x="",y=!1,d=o[v],m++):h>v&&(x+=o[v]);h>v&&v===O&&(O=0)}return O||(x&&(u.has||y)&&(x={w:x,mods:u},u={},s&=!1),P[0]!==e?(x&&P.push(x),i.push(P),s&=!1):(x&&i.push(x),s&=!0),0!==m)?void 0:(F.useCache&&(D[t]={t:i,simple:s}),{t:i,simple:s})},N=function(r,t,o,s,i){var a,c,f,l=o!==e,p=[],y=0,w=0,v=1,d=0,C=r,g="",P=0,m="",E=0,O=r,b=!1,A=0,S="";if(typeof t===n)if(F.useCache&&D[t])p=D[t].t;else{if(p=$(t),p===e)return;p=p.t}else p=t.t?t.t:[t];if(y=p.length,0!==y){for(w=y-1,i?v=i.length:i=[r];C!==e&&y>E;){if(g=p[E],b=l&&E===w,typeof g===n){if(l)if(b){if(O[g]=o,O[g]!==o)return}else F.force&&(Array.isArray(C)?O[g]!==e:!O.hasOwnProperty(g))&&(O[g]={});c=O[g]}else if(g===e)c=void 0;else if(Array.isArray(g))for(c=[],P=g.length,d=0;P>d;d++){if(a=N(O,g[d],o,s,i.slice()),a===e)return;b?g[d].t&&g[d].exec===h?O[a]=o:c=c.concat(a):c=g[d].t&&g[d].exec===h?c.concat(O[a]):c.concat(a)}else if(g.w){if(m=g.w+"",g.mods.parent&&(O=i[v-1-g.mods.parent],O===e))return;if(g.mods.root&&(O=i[0],i=[O],v=1),g.mods.placeholder){if(A=m-1,s[A]===e)return;m=s[A].toString()}if(g.mods.context){if(A=m-1,s[A]===e)return;c=s[A]}else if(O[m]!==e)b&&(O[m]=o),c=O[m];else if("function"==typeof O)c=m;else{if(!R.test(m))return;c=[];for(S in O)O.hasOwnProperty(S)&&x(m,S)&&(b&&(O[S]=o),c.push(O[S]))}}else g.exec===h?(b&&(O[N(O,g,e,s,i.slice())]=o),c=O[N(O,g,e,s,i.slice())]):g.exec===u&&(g.t&&g.t.length?(f=N(O,g,e,s),c=f===e?O.apply(i[v-2]):Array.isArray(f)?O.apply(i[v-2],f):O.call(i[v-2],f)):c=O.call(i[v-2]));i.push(c),v++,O=c,C=c,E++}return O}},V=function(r,t,n){var o=n!==e,s=[],i=0,a=0;for(s=t.split(E),F.useCache&&(D[t]={t:s,simple:!0}),a=s.length;r!==e&&a>i;){if(""===s[i])return;o&&(i===a-1?r[s[i]]=n:F.force&&(Array.isArray(r)?r[s[i]]!==e:!r.hasOwnProperty(s[i]))&&(r[s[i]]={})),r=r[s[i++]]}return r},Y=function(r,t,n){for(var o=n!==e,s=0,i=t.length;null!=r&&i>s;){if(""===t[s])return;o&&(s===i-1?r[t[s]]=n:F.force&&(Array.isArray(r)?r[t[s]]!==e:!r.hasOwnProperty(t[s]))&&(r[t[s]]={})),r=r[t[s++]]}return r},z=function(e,r,t,n){var o,s,i,a,c;if(n=n?n:"",e===r)return t(n);if(Array.isArray(e)){for(s=e.length,o=0;s>o;o++)if(i=z(e[o],r,t,n+E+o),!i)return;return!0}if(y(e)){for(a=Object.keys(e),s=a.length,s>1&&(a=a.sort()),o=0;s>o;o++)if(e.hasOwnProperty(a[o])&&(c=a[o],j.test(c)&&(c=v(O,c)),i=z(e[a[o]],r,t,n+E+c),!i))return;return!0}return!0};q.getTokens=function(e){var r=$(e);if(typeof r!==t)return r},q.isValid=function(e){return typeof $(e)!==t},q.escape=function(e){return e.replace(j,"\\$&")},q.get=function(e,r){var t,o=0,s=arguments.length;if(typeof r===n){if(F.useCache&&D[r]&&D[r].simple)return Y(e,D[r].t);if(!A.test(r))return V(e,r)}else if(Object.hasOwnProperty.call(r,"t")&&Array.isArray(r.t)&&r.simple)return Y(e,r.t);if(t=[],s>2)for(o=2;s>o;o++)t[o-2]=arguments[o];return N(e,r,void 0,t)},q.set=function(r,t,o){var s,i,a=0,c=arguments.length,f=!1;if(typeof t===n?F.useCache&&D[t]&&D[t].simple?(i=Y(r,D[t].t,o),f|=!0):A.test(t)||(i=V(r,t,o),f|=!0):Object.hasOwnProperty.call(t,"t")&&Array.isArray(t.t)&&t.simple&&(i=Y(r,t.t,o),f|=!0),!f){if(c>3)for(s=[],a=3;c>a;a++)s[a-3]=arguments[a];i=N(r,t,o,s)}return Array.isArray(i)?-1===i.indexOf(void 0):i!==e},q.find=function(e,r,t){var n=[],o=function(e){return n.push(e.substr(1)),t&&"one"!==t?!0:(n=n[0],!1)};return z(e,r,o),n[0]?n:void 0};var B=function(e,r,t,n){var o="";Object.keys(e).forEach(function(t){e[t].exec===r&&(o=t)}),delete e[o],e[t]={exec:r},n&&(e[t].closer=n)},G=function(e){var r={};typeof e===n&&1===e.length||(e="."),r[e]={exec:c},F.prefixes={},F.containers={},F.separators=r};q.setOptions=function(e){if(e.prefixes&&(F.prefixes=e.prefixes,D={}),e.separators&&(F.separators=e.separators,D={}),e.containers&&(F.containers=e.containers,D={}),typeof e.cache!==t&&(F.useCache=!!e.cache),typeof e.simple!==t){var r=F.useCache,n=F.force;F.simple=w(e.simple),F.simple?G():(U(),F.useCache=r,F.force=n),D={}}typeof e.force!==t&&(F.force=w(e.force)),T()},q.setCache=function(e){F.useCache=w(e)},q.setCacheOn=function(){F.useCache=!0},q.setCacheOff=function(){F.useCache=!1},q.setForce=function(e){F.force=w(e)},q.setForceOn=function(){F.force=!0},q.setForceOff=function(){F.force=!1},q.setSimple=function(e,r){var t=F.useCache,n=F.force;F.simple=w(e),F.simple?(G(r),T()):(U(),T(),F.useCache=t,F.force=n),D={}},q.setSimpleOn=function(e){F.simple=!0,G(e),T(),D={}},q.setSimpleOff=function(){var e=F.useCache,r=F.force;F.simple=!1,U(),T(),F.useCache=e,F.force=r,D={}},q.setSeparatorProperty=function(e){if(typeof e!==n||1!==e.length)throw new Error("setSeparatorProperty - invalid value");if(e===r||F.separators[e]&&F.separators[e].exec!==c||F.prefixes[e]||F.containers[e])throw new Error("setSeparatorProperty - value already in use");B(F.separators,c,e),T(),D={}},q.setSeparatorCollection=function(e){if(typeof e!==n||1!==e.length)throw new Error("setSeparatorCollection - invalid value");if(e===r||F.separators[e]&&F.separators[e].exec!==f||F.prefixes[e]||F.containers[e])throw new Error("setSeparatorCollection - value already in use");B(F.separators,f,e),T(),D={}},q.setPrefixParent=function(e){if(typeof e!==n||1!==e.length)throw new Error("setPrefixParent - invalid value");if(e===r||F.prefixes[e]&&F.prefixes[e].exec!==o||F.separators[e]||F.containers[e])throw new Error("setPrefixParent - value already in use");B(F.prefixes,o,e),T(),D={}},q.setPrefixRoot=function(e){if(typeof e!==n||1!==e.length)throw new Error("setPrefixRoot - invalid value");if(e===r||F.prefixes[e]&&F.prefixes[e].exec!==s||F.separators[e]||F.containers[e])throw new Error("setPrefixRoot - value already in use");B(F.prefixes,s,e),T(),D={}},q.setPrefixPlaceholder=function(e){if(typeof e!==n||1!==e.length)throw new Error("setPrefixPlaceholder - invalid value");if(e===r||F.prefixes[e]&&F.prefixes[e].exec!==i||F.separators[e]||F.containers[e])throw new Error("setPrefixPlaceholder - value already in use");B(F.prefixes,i,e),T(),D={}},q.setPrefixContext=function(e){if(typeof e!==n||1!==e.length)throw new Error("setPrefixContext - invalid value");if(e===r||F.prefixes[e]&&F.prefixes[e].exec!==a||F.separators[e]||F.containers[e])throw new Error("setPrefixContext - value already in use");B(F.prefixes,a,e),T(),D={}},q.setContainerProperty=function(e,t){if(typeof e!==n||1!==e.length||typeof t!==n||1!==t.length)throw new Error("setContainerProperty - invalid value");if(e===r||F.containers[e]&&F.containers[e].exec!==c||F.separators[e]||F.prefixes[e])throw new Error("setContainerProperty - value already in use");B(F.containers,c,e,t),T(),D={}},q.setContainerSinglequote=function(e,t){if(typeof e!==n||1!==e.length||typeof t!==n||1!==t.length)throw new Error("setContainerSinglequote - invalid value");if(e===r||F.containers[e]&&F.containers[e].exec!==l||F.separators[e]||F.prefixes[e])throw new Error("setContainerSinglequote - value already in use");B(F.containers,l,e,t),T(),D={}},q.setContainerDoublequote=function(e,t){if(typeof e!==n||1!==e.length||typeof t!==n||1!==t.length)throw new Error("setContainerDoublequote - invalid value");if(e===r||F.containers[e]&&F.containers[e].exec!==p||F.separators[e]||F.prefixes[e])throw new Error("setContainerDoublequote - value already in use");B(F.containers,p,e,t),T(),D={}},q.setContainerCall=function(e,t){if(typeof e!==n||1!==e.length||typeof t!==n||1!==t.length)throw new Error("setContainerCall - invalid value");if(e===r||F.containers[e]&&F.containers[e].exec!==u||F.separators[e]||F.prefixes[e])throw new Error("setContainerCall - value already in use");B(F.containers,u,e,t),T(),D={}},q.setContainerEvalProperty=function(e,t){if(typeof e!==n||1!==e.length||typeof t!==n||1!==t.length)throw new Error("setContainerProperty - invalid value");if(e===r||F.containers[e]&&F.containers[e].exec!==h||F.separators[e]||F.prefixes[e])throw new Error("setContainerEvalProperty - value already in use");B(F.containers,h,e,t),T(),D={}},q.resetOptions=function(){U(),T(),D={}},U(),T(),d&&q.setOptions(d)};return d});
//# sourceMappingURL=path-toolkit-min.js.map