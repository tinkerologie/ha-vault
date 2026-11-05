var e=globalThis,t=e.ShadowRoot&&(e.ShadyCSS===void 0||e.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,n=Symbol(),r=new WeakMap,i=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,n=this.t;if(t&&e===void 0){let t=n!==void 0&&n.length===1;t&&(e=r.get(n)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&r.set(n,e))}return e}toString(){return this.cssText}},a=e=>new i(typeof e==`string`?e:e+``,void 0,n),o=(e,...t)=>new i(e.length===1?e[0]:t.reduce((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if(typeof e==`number`)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: `+e+`. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[r+1],e[0]),e,n),s=(n,r)=>{if(t)n.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let t of r){let r=document.createElement(`style`),i=e.litNonce;i!==void 0&&r.setAttribute(`nonce`,i),r.textContent=t.cssText,n.appendChild(r)}},c=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return a(t)})(e):e,{is:l,defineProperty:u,getOwnPropertyDescriptor:d,getOwnPropertyNames:f,getOwnPropertySymbols:ee,getPrototypeOf:p}=Object,m=globalThis,te=m.trustedTypes,ne=te?te.emptyScript:``,re=m.reactiveElementPolyfillSupport,h=(e,t)=>e,g={toAttribute(e,t){switch(t){case Boolean:e=e?ne:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},ie=(e,t)=>!l(e,t),ae={attribute:!0,type:String,converter:g,reflect:!1,useDefault:!1,hasChanged:ie};Symbol.metadata??=Symbol(`metadata`),m.litPropertyMetadata??=new WeakMap;var _=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=ae){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&u(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??ae}static _$Ei(){if(this.hasOwnProperty(h(`elementProperties`)))return;let e=p(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(h(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(h(`properties`))){let e=this.properties,t=[...f(e),...ee(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(c(e))}else e!==void 0&&t.push(c(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return s(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?g:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?g:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??ie)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};_.elementStyles=[],_.shadowRootOptions={mode:`open`},_[h(`elementProperties`)]=new Map,_[h(`finalized`)]=new Map,re?.({ReactiveElement:_}),(m.reactiveElementVersions??=[]).push(`2.1.2`);var v=globalThis,oe=e=>e,y=v.trustedTypes,se=y?y.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,ce=`$lit$`,b=`lit$${Math.random().toFixed(9).slice(2)}$`,le=`?`+b,ue=`<${le}>`,x=document,S=()=>x.createComment(``),C=e=>e===null||typeof e!=`object`&&typeof e!=`function`,w=Array.isArray,de=e=>w(e)||typeof e?.[Symbol.iterator]==`function`,T="[ \t\n\f\r]",E=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,fe=/-->/g,pe=/>/g,D=RegExp(`>|${T}(?:([^\\s"'>=/]+)(${T}*=${T}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),me=/'/g,he=/"/g,ge=/^(?:script|style|textarea|title)$/i,_e=e=>(t,...n)=>({_$litType$:e,strings:t,values:n}),O=_e(1),ve=_e(2),k=Symbol.for(`lit-noChange`),A=Symbol.for(`lit-nothing`),ye=new WeakMap,j=x.createTreeWalker(x,129);function be(e,t){if(!w(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return se===void 0?t:se.createHTML(t)}var xe=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=E;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===E?c[1]===`!--`?o=fe:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=D):(ge.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=D):o=pe:o===D?c[0]===`>`?(o=i??E,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?D:c[3]===`"`?he:me):o===he||o===me?o=D:o===fe||o===pe?o=E:(o=D,i=void 0);let d=o===D&&e[t+1].startsWith(`/>`)?` `:``;a+=o===E?n+ue:l>=0?(r.push(s),n.slice(0,l)+ce+n.slice(l)+b+d):n+b+(l===-2?t:d)}return[be(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]},Se=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=xe(t,n);if(this.el=e.createElement(l,r),j.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=j.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(ce)){let t=u[o++],n=i.getAttribute(e).split(b),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?we:r[1]===`?`?Te:r[1]===`@`?Ee:P}),i.removeAttribute(e)}else e.startsWith(b)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(ge.test(i.tagName)){let e=i.textContent.split(b),t=e.length-1;if(t>0){i.textContent=y?y.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],S()),j.nextNode(),c.push({type:2,index:++a});i.append(e[t],S())}}}else if(i.nodeType===8){if(i.data===le)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(b,e+1))!==-1;)c.push({type:7,index:a}),e+=b.length-1}}a++}}static createElement(e,t){let n=x.createElement(`template`);return n.innerHTML=e,n}};function M(e,t,n=e,r){if(t===k)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=C(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=M(e,i._$AS(e,t.values),i,r)),t}var Ce=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??x).importNode(t,!0);j.currentNode=r;let i=j.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new N(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new De(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=j.nextNode(),a++)}return j.currentNode=x,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},N=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=A,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=M(this,e,t),C(e)?e===A||e==null||e===``?(this._$AH!==A&&this._$AR(),this._$AH=A):e!==this._$AH&&e!==k&&this._(e):e._$litType$===void 0?e.nodeType===void 0?de(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==A&&C(this._$AH)?this._$AA.nextSibling.data=e:this.T(x.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=Se.createElement(be(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new Ce(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=ye.get(e.strings);return t===void 0&&ye.set(e.strings,t=new Se(e)),t}k(t){w(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(S()),this.O(S()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=oe(e).nextSibling;oe(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},P=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=A,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=A}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=M(this,e,t,0),a=!C(e)||e!==this._$AH&&e!==k,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=M(this,r[n+o],t,o),s===k&&(s=this._$AH[o]),a||=!C(s)||s!==this._$AH[o],s===A?e=A:e!==A&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===A?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},we=class extends P{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===A?void 0:e}},Te=class extends P{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==A)}},Ee=class extends P{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=M(this,e,t,0)??A)===k)return;let n=this._$AH,r=e===A&&n!==A||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==A&&(n===A||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},De=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){M(this,e)}},Oe=v.litHtmlPolyfillSupport;Oe?.(Se,N),(v.litHtmlVersions??=[]).push(`3.3.3`);var ke=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new N(t.insertBefore(S(),e),e,void 0,n??{})}return i._$AI(e),i},F=globalThis,I=class extends _{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=ke(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return k}};I._$litElement$=!0,I.finalized=!0,F.litElementHydrateSupport?.({LitElement:I});var Ae=F.litElementPolyfillSupport;Ae?.({LitElement:I}),(F.litElementVersions??=[]).push(`4.2.2`);var je=[o`
  :host {
    --vault-primary: var(--primary-color, #009ac7);
    --vault-text: var(--primary-text-color, #212121);
    --vault-subtext: var(--secondary-text-color, #5f6368);
    --vault-border: var(--ha-color-border-neutral-quiet, var(--divider-color, rgba(127, 127, 127, 0.25)));
    --vault-surface: var(--ha-color-fill-neutral-quiet-resting, color-mix(in srgb, var(--vault-text) 4%, transparent));
    --vault-surface-hover: var(--ha-color-fill-neutral-quiet-hover, color-mix(in srgb, var(--vault-text) 8%, transparent));
    --vault-track: var(--ha-color-fill-neutral-normal-resting, color-mix(in srgb, var(--vault-text) 14%, transparent));
    --vault-focus: var(--ha-color-focus, var(--primary-color, #009ac7));
    --vault-radius: var(--ha-card-border-radius, 12px);
    --vault-row-radius: var(--ha-border-radius-lg, 12px);

    --vault-ok-fill: var(--ha-color-fill-success-quiet-resting, color-mix(in srgb, var(--success-color, #43a047) 16%, transparent));
    --vault-ok-text: var(--ha-color-on-success-normal, var(--success-color, #2e7d32));
    --vault-ok: var(--ha-color-fill-success-loud-resting, var(--success-color, #43a047));
    --vault-warning-fill: var(--ha-color-fill-warning-quiet-resting, color-mix(in srgb, var(--warning-color, #ffa600) 18%, transparent));
    --vault-warning-text: var(--ha-color-on-warning-normal, #8a5300);
    --vault-warning: var(--ha-color-fill-warning-loud-resting, var(--warning-color, #ffa600));
    --vault-failed-fill: var(--ha-color-fill-danger-quiet-resting, color-mix(in srgb, var(--error-color, #db4437) 16%, transparent));
    --vault-failed-text: var(--ha-color-on-danger-normal, var(--error-color, #b3261e));
    --vault-failed: var(--ha-color-fill-danger-loud-resting, var(--error-color, #db4437));
    --vault-running-fill: var(--ha-color-fill-primary-quiet-resting, color-mix(in srgb, var(--vault-primary) 16%, transparent));
    /* No primary text token reaches 4.5:1 on the quiet primary fill, so use body text. */
    --vault-running-text: var(--vault-text);
    --vault-running: var(--ha-color-fill-primary-loud-resting, var(--vault-primary));
    --vault-neutral-fill: var(--ha-color-fill-neutral-quiet-resting, color-mix(in srgb, var(--vault-text) 8%, transparent));
    --vault-neutral-text: var(--ha-color-on-neutral-normal, var(--vault-subtext));
    --vault-neutral: var(--ha-color-fill-neutral-loud-resting, var(--disabled-text-color, #8a8a8a));
  }
`,o`
  :host {
    display: block;
    min-width: 0;
    height: 100%;
    container-type: inline-size;
    container-name: vault-card;
    color: var(--vault-text);
  }

  ha-card {
    box-sizing: border-box;
    height: 100%;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    /* Never hide content: a card given less room than it needs scrolls. */
    overflow: auto;
  }

  :host([embedded]) ha-card {
    padding: 0;
    background: none;
    border: none;
    box-shadow: none;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    min-width: 0;
  }

  .title {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    font: inherit;
    font-size: var(--ha-font-size-l, 1rem);
    font-weight: var(--ha-font-weight-medium, 500);
    line-height: 1.4;
    color: var(--vault-text);
  }

  .title .title-text {
    overflow-wrap: anywhere;
  }

  .title-icon {
    flex: none;
    color: var(--vault-primary);
  }

  svg.icon {
    flex: none;
    fill: currentColor;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: var(--ha-font-size-s, 0.8125rem);
    font-weight: var(--ha-font-weight-medium, 500);
    line-height: 1.5;
    white-space: nowrap;
    background: var(--vault-neutral-fill);
    color: var(--vault-neutral-text);
  }

  .lvl-ok { background: var(--vault-ok-fill); color: var(--vault-ok-text); }
  .lvl-idle { background: var(--vault-neutral-fill); color: var(--vault-neutral-text); }
  .lvl-disabled { background: var(--vault-neutral-fill); color: var(--vault-neutral-text); }
  .lvl-running { background: var(--vault-running-fill); color: var(--vault-running-text); }
  .lvl-warning { background: var(--vault-warning-fill); color: var(--vault-warning-text); }
  .lvl-failed { background: var(--vault-failed-fill); color: var(--vault-failed-text); }
  .lvl-unknown { background: var(--vault-neutral-fill); color: var(--vault-neutral-text); }

  .status {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  .status-icon {
    flex: none;
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }

  .status-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .value {
    font-size: var(--ha-font-size-2xl, 1.5rem);
    font-weight: var(--ha-font-weight-medium, 500);
    line-height: 1.25;
    overflow-wrap: anywhere;
  }

  .value small {
    font-size: var(--ha-font-size-m, 0.875rem);
    font-weight: var(--ha-font-weight-normal, 400);
    color: var(--vault-subtext);
  }

  .label {
    font-weight: var(--ha-font-weight-medium, 500);
    overflow-wrap: anywhere;
  }

  .sub {
    font-size: var(--ha-font-size-s, 0.8125rem);
    color: var(--vault-subtext);
    overflow-wrap: anywhere;
  }

  .muted {
    color: var(--vault-subtext);
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: var(--vault-row-radius);
    border: 1px solid var(--vault-border);
    min-width: 0;
  }

  .row-main {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .row-title {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px 8px;
    min-width: 0;
  }

  .reason {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    text-align: start;
    overflow-wrap: anywhere;
  }

  .reason svg {
    margin-top: 1px;
  }

  .row-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    flex: none;
  }

  .link {
    all: unset;
    box-sizing: border-box;
    cursor: pointer;
    border-radius: 6px;
    max-width: 100%;
  }

  .link:hover .label,
  .link:hover.label {
    text-decoration: underline;
  }

  .tappable {
    cursor: pointer;
  }

  .tappable:hover {
    background: var(--vault-surface-hover);
  }

  :is(.link, .tappable, .btn, a, .alert button):focus-visible {
    outline: 2px solid var(--vault-focus);
    outline-offset: 2px;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 36px;
    padding: 0 14px;
    border: 1px solid var(--vault-border);
    border-radius: 999px;
    background: var(--vault-surface);
    color: var(--vault-text);
    font: inherit;
    font-size: var(--ha-font-size-m, 0.875rem);
    font-weight: var(--ha-font-weight-medium, 500);
    text-decoration: none;
    cursor: pointer;
    white-space: nowrap;
  }

  .btn:hover {
    background: var(--vault-surface-hover);
  }

  /* White on the default primary blue is only about 3.3:1, so use the tinted fill with body text. */
  .btn.primary {
    background: var(--ha-color-fill-primary-normal-resting, color-mix(in srgb, var(--vault-primary) 20%, transparent));
    border-color: var(--vault-primary);
    color: var(--vault-text);
  }

  .btn[aria-disabled="true"] {
    opacity: 0.6;
    cursor: default;
  }

  @media (pointer: coarse) {
    .btn {
      min-height: 44px;
    }
  }

  .meter {
    position: relative;
    height: 8px;
    border-radius: 999px;
    background: var(--vault-track);
    overflow: hidden;
  }

  .meter-fill {
    height: 100%;
    border-radius: inherit;
    background: var(--vault-ok);
    transition: width 0.4s ease;
  }

  .meter-fill.lvl-running {
    background-color: var(--vault-running);
    background-image: linear-gradient(
      45deg,
      color-mix(in srgb, var(--vault-running) 70%, #fff) 25%,
      transparent 25%,
      transparent 50%,
      color-mix(in srgb, var(--vault-running) 70%, #fff) 50%,
      color-mix(in srgb, var(--vault-running) 70%, #fff) 75%,
      transparent 75%
    );
    background-size: 16px 16px;
    animation: vault-stripes 1s linear infinite;
  }

  .meter-fill.lvl-warning { background: var(--vault-warning); }
  .meter-fill.lvl-failed { background: var(--vault-failed); }
  .meter-fill.lvl-unknown { background: var(--vault-neutral); }

  @keyframes vault-stripes {
    from { background-position: 0 0; }
    to { background-position: 16px 0; }
  }

  .alert {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 8px 12px;
    border-radius: var(--vault-row-radius);
    background: var(--vault-failed-fill);
    color: var(--vault-failed-text);
    font-size: var(--ha-font-size-s, 0.8125rem);
  }

  .alert .alert-text {
    flex: 1;
    overflow-wrap: anywhere;
  }

  .alert button {
    all: unset;
    cursor: pointer;
    border-radius: 4px;
    display: grid;
    place-items: center;
    min-width: 24px;
    min-height: 24px;
  }

  .confirm {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px 12px;
    border-radius: var(--vault-row-radius);
    background: var(--vault-surface);
  }

  .empty {
    color: var(--vault-subtext);
    padding: 4px 0;
  }

  .grid-2 {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .grid-3 {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }

  .fact {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .fact-label {
    font-size: var(--ha-font-size-s, 0.8125rem);
    color: var(--vault-subtext);
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  @container vault-card (max-width: 420px) {
    .row {
      flex-wrap: wrap;
    }
    .reason {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    text-align: start;
    overflow-wrap: anywhere;
  }

  .reason svg {
    margin-top: 1px;
  }

  .row-actions {
      width: 100%;
    }
    .grid-3 {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @container vault-card (max-width: 300px) {
    .grid-2 {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation: none !important;
      transition: none !important;
    }
  }
`],Me=3e4,L=new WeakMap;function Ne(e){let t=e.connection??e,n=L.get(t);if(n&&n.entities===e.entities&&(n.expires===void 0||Date.now()<n.expires))return n.promise;if(!e.callWS)return Promise.resolve([]);let r=e.callWS({type:`vault/entity_map`}).then(e=>e.entries??[]),i={entities:e.entities,promise:r};return L.set(t,i),r.then(e=>{e.length===0&&(i.expires=Date.now()+Me)},()=>{L.get(t)===i&&L.delete(t)}),r}function Pe(e,t,n,r){let i=new CustomEvent(t,{bubbles:r?.bubbles??!0,cancelable:!!r?.cancelable,composed:r?.composed??!0,detail:n});return e.dispatchEvent(i),i}var Fe=`M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z`,Ie=`M20,6C20.58,6 21.05,6.2 21.42,6.59C21.8,7 22,7.45 22,8V19C22,19.55 21.8,20 21.42,20.41C21.05,20.8 20.58,21 20,21H4C3.42,21 2.95,20.8 2.58,20.41C2.2,20 2,19.55 2,19V8C2,7.45 2.2,7 2.58,6.59C2.95,6.2 3.42,6 4,6H8V4C8,3.42 8.2,2.95 8.58,2.58C8.95,2.2 9.42,2 10,2H14C14.58,2 15.05,2.2 15.42,2.58C15.8,2.95 16,3.42 16,4V6H20M4,8V19H20V8H4M14,6V4H10V6H14Z`,Le=`M15,13H16.5V15.82L18.94,17.23L18.19,18.53L15,16.69V13M19,8H5V19H9.67C9.24,18.09 9,17.07 9,16A7,7 0 0,1 16,9C17.07,9 18.09,9.24 19,9.67V8M5,21C3.89,21 3,20.1 3,19V5C3,3.89 3.89,3 5,3H6V1H8V3H16V1H18V3H19A2,2 0 0,1 21,5V11.1C22.24,12.36 23,14.09 23,16A7,7 0 0,1 16,23C14.09,23 12.36,22.24 11.1,21H5M16,11.15A4.85,4.85 0 0,0 11.15,16C11.15,18.68 13.32,20.85 16,20.85A4.85,4.85 0 0,0 20.85,16C20.85,13.32 18.68,11.15 16,11.15Z`,Re=`M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20M16.59 7.58L10 14.17L7.41 11.59L6 13L10 17L18 9L16.59 7.58Z`,ze=`M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z`,Be=`M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2C6.47,2 2,6.47 2,12C2,17.53 6.47,22 12,22C17.53,22 22,17.53 22,12C22,6.47 17.53,2 12,2M14.59,8L12,10.59L9.41,8L8,9.41L10.59,12L8,14.59L9.41,16L12,13.41L14.59,16L16,14.59L13.41,12L16,9.41L14.59,8Z`,Ve=`M23.5 17L18.5 22L15 18.5L16.5 17L18.5 19L22 15.5L23.5 17M6 2C4.89 2 4 2.9 4 4V20C4 21.11 4.89 22 6 22H13.81C13.45 21.38 13.2 20.7 13.08 20H6V4H13V9H18V13.08C18.33 13.03 18.67 13 19 13C19.34 13 19.67 13.03 20 13.08V8L14 2M8 12V14H16V12M8 16V18H13V16Z`,He=`M7,5H21V7H7V5M7,13V11H21V13H7M4,4.5A1.5,1.5 0 0,1 5.5,6A1.5,1.5 0 0,1 4,7.5A1.5,1.5 0 0,1 2.5,6A1.5,1.5 0 0,1 4,4.5M4,10.5A1.5,1.5 0 0,1 5.5,12A1.5,1.5 0 0,1 4,13.5A1.5,1.5 0 0,1 2.5,12A1.5,1.5 0 0,1 4,10.5M7,19V17H21V19H7M4,16.5A1.5,1.5 0 0,1 5.5,18A1.5,1.5 0 0,1 4,19.5A1.5,1.5 0 0,1 2.5,18A1.5,1.5 0 0,1 4,16.5Z`,Ue=`M6,2H18A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2M12,4A6,6 0 0,0 6,10C6,13.31 8.69,16 12.1,16L11.22,13.77C10.95,13.29 11.11,12.68 11.59,12.4L12.45,11.9C12.93,11.63 13.54,11.79 13.82,12.27L15.74,14.69C17.12,13.59 18,11.9 18,10A6,6 0 0,0 12,4M12,9A1,1 0 0,1 13,10A1,1 0 0,1 12,11A1,1 0 0,1 11,10A1,1 0 0,1 12,9M7,18A1,1 0 0,0 6,19A1,1 0 0,0 7,20A1,1 0 0,0 8,19A1,1 0 0,0 7,18M12.09,13.27L14.58,19.58L17.17,18.08L12.95,12.77L12.09,13.27Z`,We=`M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z`,Ge=`M13.5,8H12V13L16.28,15.54L17,14.33L13.5,12.25V8M13,3A9,9 0 0,0 4,12H1L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3`,Ke=`M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M7,13H17V11H7`,qe=`M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z`,Je=`M8,5.14V19.14L19,12.14L8,5.14Z`,Ye=`M13,2.03V2.05L13,4.05C17.39,4.59 20.5,8.58 19.96,12.97C19.5,16.61 16.64,19.5 13,19.93V21.93C18.5,21.38 22.5,16.5 21.95,11C21.5,6.25 17.73,2.5 13,2.03M11,2.06C9.05,2.25 7.19,3 5.67,4.26L7.1,5.74C8.22,4.84 9.57,4.26 11,4.06V2.06M4.26,5.67C3,7.19 2.25,9.04 2.05,11H4.05C4.24,9.58 4.8,8.23 5.69,7.1L4.26,5.67M2.06,13C2.26,14.96 3.03,16.81 4.27,18.33L5.69,16.9C4.81,15.77 4.24,14.42 4.06,13H2.06M7.1,18.37L5.67,19.74C7.18,21 9.04,21.79 11,22V20C9.58,19.82 8.23,19.25 7.1,18.37M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z`,Xe=`M21,11C21,16.55 17.16,21.74 12,23C6.84,21.74 3,16.55 3,11V5L12,1L21,5V11M12,21C15.75,20 19,15.54 19,11.22V6.3L12,3.18L5,6.3V11.22C5,15.54 8.25,20 12,21M11,7H13V13H11V7M11,15H13V17H11V15Z`,Ze=`M21,11C21,16.55 17.16,21.74 12,23C6.84,21.74 3,16.55 3,11V5L12,1L21,5V11M12,21C15.75,20 19,15.54 19,11.22V6.3L12,3.18L5,6.3V11.22C5,15.54 8.25,20 12,21M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9`,Qe=`M21,11C21,16.55 17.16,21.74 12,23C6.84,21.74 3,16.55 3,11V5L12,1L21,5V11M12,21C15.75,20 19,15.54 19,11.22V6.3L12,3.18L5,6.3V11.22C5,15.54 8.25,20 12,21Z`,$e=`M12,18A6,6 0 0,1 6,12C6,11 6.25,10.03 6.7,9.2L5.24,7.74C4.46,8.97 4,10.43 4,12A8,8 0 0,0 12,20V23L16,19L12,15M12,4V1L8,5L12,9V6A6,6 0 0,1 18,12C18,13 17.75,13.97 17.3,14.8L18.76,16.26C19.54,15.03 20,13.57 20,12A8,8 0 0,0 12,4Z`;function R(e,t=20,n=`icon`){return O`<svg
    class=${n}
    width=${t}
    height=${t}
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    ${ve`<path d=${e}></path>`}
  </svg>`}var et={"card.health.name":`Vault health`,"card.health.description":`Overall status of a Vault server and what needs attention.`,"card.protected.name":`Vault protected items`,"card.protected.description":`How many containers, VMs and folders are in a backup.`,"card.next_run.name":`Vault next run`,"card.next_run.description":`When the next scheduled backup starts.`,"card.last_backup.name":`Vault last backup`,"card.last_backup.description":`Outcome, size and duration of the latest backup.`,"card.progress.name":`Vault backup in progress`,"card.progress.description":`Progress of running backups and restores.`,"card.jobs.name":`Vault backup jobs`,"card.jobs.description":`Backup jobs with their status, schedule and a Run backup action.`,"card.activity.name":`Vault recent activity`,"card.activity.description":`Each job's latest run, newest first.`,"card.storage.name":`Vault storage`,"card.storage.description":`Storage destinations with health and capacity.`,"card.anomalies.name":`Vault anomalies`,"card.anomalies.description":`Open anomalies Vault detected in your backups.`,"card.rules.name":`Vault 3-2-1 rule`,"card.rules.description":`Checks the 3-2-1 rule against the destinations your jobs back up to.`,"card.dashboard.name":`Vault summary`,"card.dashboard.description":`One status, what needs attention, the last and next backup.`,"title.health":`Vault health`,"title.protected":`Protected`,"title.next_run":`Next run`,"title.last_backup":`Last backup`,"title.progress":`Backup in progress`,"title.restore_progress":`Restore in progress`,"title.jobs":`Backup jobs`,"title.activity":`Recent activity`,"title.storage":`Storage destinations`,"title.anomalies":`Anomalies`,"title.rules":`3-2-1 backup rule`,"editor.server":`Vault server`,"editor.server_helper":`Leave empty to use the first Vault server.`,"editor.title":`Title`,"editor.max_items":`Anomalies to show`,"level.failed":`Failed`,"level.warning":`Needs attention`,"level.unknown":`Unknown`,"level.running":`Running`,"level.disabled":`Disabled`,"level.ok":`Healthy`,"level.idle":`Never run`,"server.ok":`Healthy`,"server.running":`Backing up`,"server.restoring":`Restoring`,"server.warning":`Needs attention`,"server.failed":`Problem`,"server.unknown":`Status unknown`,"server.offline":`Offline`,"job.ok":`Completed`,"job.disabled":`Disabled`,"job.enabled_unknown":`Schedule unknown`,"common.unavailable":`Unavailable`,"common.not_set_up":`No Vault server found. Add the Vault integration to use this card.`,"common.load_error":`Couldn't load Vault entities: {error}`,"common.loading":`Loading…`,"common.open_in_vault":`Open in Vault`,"common.open_in_vault_job":`Open {job} in Vault`,"common.version":`Version {version}`,"common.separator":` · `,"common.more.one":`+{count} more`,"common.more.other":`+{count} more`,"common.items.one":`{count} item`,"common.items.other":`{count} items`,"common.jobs.one":`{count} job`,"common.jobs.other":`{count} jobs`,"common.destinations.one":`{count} destination`,"common.destinations.other":`{count} destinations`,"common.dismiss":`Dismiss`,"attention.offline":`Vault is offline`,"attention.unreachable":`Vault data is unavailable`,"attention.daemon":`Vault reports {state}`,"attention.job_failed":`{subject} failed`,"attention.job_warning":`{subject} needs attention`,"attention.job_unknown":`{subject} status is unknown`,"attention.anomalies.one":`{count} open anomaly`,"attention.anomalies.other":`{count} open anomalies`,"attention.storage":`{subject} storage needs attention`,"attention.unprotected.one":`{count} item isn't backed up`,"attention.unprotected.other":`{count} items aren't backed up`,"attention.none":`Nothing needs attention`,"protected.of_total":`of {total}`,"protected.all":`All items are backed up`,"protected.unprotected.one":`{count} item isn't backed up`,"protected.unprotected.other":`{count} items aren't backed up`,"protected.pending.one":`{count} waiting for its first backup`,"protected.pending.other":`{count} waiting for their first backup`,"protected.total_unknown":`Items no job covers can't be counted`,"protected.unknown":`Coverage unknown`,"protected.meter":`Protected items`,"next_run.running":`Running now`,"next_run.restoring":`Restore running now`,"next_run.none":`No backup scheduled`,"next_run.unknown":`Next run unknown`,"next_run.job":`{job}`,"next_run.jobs_enabled":`{jobs}, {enabled} enabled`,"last_backup.none":`No backups yet`,"progress.idle":`No backup or restore running`,"progress.backing_up":`Backing up`,"progress.restoring":`Restoring`,"progress.next":`Next: {time}`,"progress.label":`Backup progress of {job}`,"progress.restore_label":`Restore progress of {job}`,"progress.queue.one":`{count} job queued`,"progress.queue.other":`{count} jobs queued`,"jobs.empty":`No backup jobs on this Vault server`,"jobs.last_run":`Last run {time}`,"jobs.never_run":`Never run`,"jobs.next_run":`Next {time}`,"jobs.not_scheduled":`Not scheduled`,"jobs.run":`Run backup`,"jobs.run_label":`Run {job} now`,"jobs.starting":`Starting…`,"jobs.started":`Started`,"jobs.confirm_title":`Run {job} now?`,"jobs.confirm_text":`This starts a backup of {job} outside its schedule. Depending on the job's settings, Vault may stop containers or VMs while it backs them up.`,"jobs.confirm_ok":`Run backup`,"jobs.confirm_cancel":`Cancel`,"jobs.run_failed":`Couldn't start {job}: {error}`,"jobs.restore_points.one":`{count} restore point`,"jobs.restore_points.other":`{count} restore points`,"activity.empty":`No backups have run yet`,"storage.empty":`No storage destinations`,"storage.free":`{free} free`,"storage.used":`{percent} used`,"storage.capacity_unknown":`Capacity not reported`,"storage.usage":`Space used on {name}`,"storage.health_ok":`Healthy`,"storage.health_unknown":`Health unknown`,"storage.type.local":`Local`,"storage.type.smb":`SMB`,"storage.type.nfs":`NFS`,"storage.type.s3":`S3`,"storage.type.sftp":`SFTP`,"storage.type.webdav":`WebDAV`,"anomalies.none":`No open anomalies`,"anomalies.scope":`Job: {job}`,"anomalies.system":`Whole server`,"anomalies.severity.critical":`Critical`,"anomalies.severity.warning":`Warning`,"anomalies.severity.info":`Info`,"rules.met":`Met`,"rules.likely_met":`Likely met`,"rules.not_met":`Not met`,"rules.unknown":`Unknown`,"rules.copies":`3 copies`,"rules.copies_detail.one":`{count} destination backed up to`,"rules.copies_detail.other":`{count} destinations backed up to`,"rules.media":`2 media`,"rules.media_detail.one":`{count} media type`,"rules.media_detail.other":`{count} media types`,"rules.offsite":`1 offsite`,"rules.offsite_detail_yes":`Remote destination`,"rules.offsite_detail_no":`Local only`,"rules.footnote":`Counts destinations that enabled jobs have backed up to, not copies of each item. Vault doesn't know where a destination is, so any network destination counts as remote, even an SMB or NFS share on the same site.`},tt={en:et};function z(e){let t=typeof document>`u`?``:document.documentElement.lang;return e?.locale?.language||e?.language||t||`en`}function nt(e){return tt[e]??tt[e.split(`-`)[0]??`en`]??et}function B(e,t){return nt(e)[t]??et[t]}function V(e,t,n={}){let r=z(e),i;if(typeof n.count==`number`){let e=`other`;try{e=new Intl.PluralRules(r).select(n.count)}catch{e=n.count===1?`one`:`other`}i=B(r,`${t}.${e}`)??B(r,`${t}.other`)}return i??=B(r,t)??t,i.replace(/\{(\w+)\}/g,(t,r)=>{let i=n[r];return i===void 0?t:typeof i==`number`?H(e,i):i})}function rt(e){let t=z(e);switch(e?.locale?.number_format){case`comma_decimal`:return`en-US`;case`decimal_comma`:return`de`;case`space_comma`:return`fr`;case`system`:return;default:return t}}function H(e,t,n){if(e?.locale?.number_format===`none`)return String(t);try{return new Intl.NumberFormat(rt(e),n).format(t)}catch{return String(t)}}function U(e,t){return e?.locale?.number_format===`none`?`${Math.round(t)}%`:H(e,t/100,{style:`percent`,maximumFractionDigits:0})}function it(e){return e?.locale?.time_zone===`server`?e.config?.time_zone:void 0}function at(e){if(e?.locale?.time_format===`12`)return!0;if(e?.locale?.time_format===`24`)return!1}function ot(e,t){let n={month:`short`,day:`numeric`,hour:`numeric`,minute:`2-digit`,hour12:at(e),timeZone:it(e)};try{return new Intl.DateTimeFormat(z(e),n).format(new Date(t))}catch{return new Date(t).toLocaleString()}}var st=[[`day`,864e5],[`hour`,36e5],[`minute`,6e4]];function ct(e,t,n=Date.now()){let r=t-n,i;try{i=new Intl.RelativeTimeFormat(z(e),{numeric:`auto`})}catch{i=new Intl.RelativeTimeFormat(`en`,{numeric:`auto`})}for(let[e,t]of st)if(Math.abs(r)>=t)return i.format(Math.round(r/t),e);return i.format(0,`minute`)}var lt=new Set([`unavailable`,`unknown`,``]);function W(e,t){if(!t)return;let n=e[t];return n&&!lt.has(n.state)?n:void 0}function G(e,t){let n=W(e,t);if(!n)return null;let r=Number(n.state);return Number.isFinite(r)?r:null}function K(e,t){let n=W(e,t);return n?n.state===`on`||n.state!==`off`&&null:null}function q(e,t){let n=W(e,t);if(!n)return null;let r=Date.parse(n.state);return Number.isNaN(r)?null:r}var ut=[`failed`,`warning`,`unknown`,`running`,`disabled`,`ok`,`idle`];function dt(e){let t=`idle`;for(let n of e)ut.indexOf(n)<ut.indexOf(t)&&(t=n);return t}function J(e){return e.running===!0||e.status===`running`||e.status===`restoring`?`running`:e.status===null?`unknown`:e.status===`failed`?`failed`:[`partial`,`skipped`,`cancelled`].includes(e.status)||(e.itemsFailed??0)>0||e.problem===!0||e.status!==`idle`&&e.lastRunSuccessful===!1?`warning`:e.enabled===!1?`disabled`:e.status===`idle`?`idle`:`ok`}function ft(e){if(e.status!==`running`&&e.status!==`restoring`&&e.running!==!0)return J({...e,enabled:null});if(e.lastRunSuccessful===null)return`unknown`;let t=e.lastRunSuccessful?`completed`:`partial`;return J({...e,status:t,running:!1,enabled:null})}function pt(e,t){let n=t.entities,r=W(e,n.job_status),i=e[n.job_status??``]?.attributes?.enabled,a={status:r?r.state:null,running:K(e,n.job_running),problem:K(e,n.job_problem),lastRunSuccessful:K(e,n.job_last_success),itemsFailed:G(e,n.job_items_failed),enabled:typeof i==`boolean`?i:null},o=J(a);return{id:t.job_id,name:t.name,entities:n,status:a.status,enabled:a.enabled,running:o===`running`,restoring:o===`running`&&(a.status===`restoring`||e[n.job_running??``]?.attributes?.run_type===`restore`),progress:G(e,n.job_progress),lastRun:q(e,n.job_last_run),nextRun:q(e,n.job_next_run),itemsDone:G(e,n.job_items_backed_up),itemsFailed:a.itemsFailed,restorePoints:G(e,n.job_restore_points),level:o,outcome:ft(a)}}function Y(e){return e.filter(e=>e.lastRun!==null).sort((e,t)=>(t.lastRun??0)-(e.lastRun??0))}var mt={b:1,kb:1e3,mb:1e6,gb:1e9,tb:0xe8d4a51000,pb:0x38d7ea4c68000,kib:1024,mib:2**20,gib:2**30,tib:2**40,pib:2**50};function X(e,t){let n=G(e,t);if(n===null)return null;let r=mt[String(e[t??``]?.attributes?.unit_of_measurement??`B`).toLowerCase()];return r===void 0?null:n*r}function ht(e,t){let n=t.entities,r=W(e,n.storage_health)?.state??null,i=X(e,n.storage_total_space),a=X(e,n.storage_used_space),o=X(e,n.storage_free_space);a===null&&i!==null&&o!==null&&(a=i-o);let s=i!==null&&i>0&&a!==null?Math.min(100,Math.max(0,a/i*100)):null,c=`unknown`;return r!==null&&(c=r.toLowerCase()===`ok`?`ok`:`warning`),c===`ok`&&s!==null&&s>=90&&(c=`warning`),{id:t.storage_id,name:W(e,n.storage_name)?.state??t.name,entities:n,type:W(e,n.storage_type)?.state??null,health:r,usedPercent:s,level:c}}function gt(e){let t=e?.attributes?.anomalies;return Array.isArray(t)?t.filter(e=>typeof e==`object`&&!!e).map(e=>({summary:String(e.summary??e.detector??``),severity:String(e.severity??`warning`),job:typeof e.job==`string`?e.job:null,detector:String(e.detector??``)})):[]}function _t(e,t){let n=t.entities,r=K(e,n.vault_online),i=W(e,n.vault_status)?.state??null,a=t.jobs.map(t=>pt(e,t)),o=t.storage.map(t=>ht(e,t)),s=W(e,n.open_anomalies),c=G(e,n.open_anomalies),l=W(e,n.runner_current_job_id)?.state??null,u=q(e,n.next_backup),d=e[n.next_backup??``]?.attributes?.job_name,f=e[n.destinations_in_use??``],ee=W(e,n.destinations_in_use)!==void 0,p=W(e,n.unprotected_items),m={entry:t,online:r,daemonStatus:i,version:W(e,n.vault_version)?.state??null,activeJob:l&&l!==`idle`?l:null,activeRunType:l&&l!==`idle`?vt(e[n.runner_current_job_id??``]):null,anomalies:gt(s),anomalyCount:c,nextBackup:u===null?null:{time:u,job:typeof d==`string`?d:null},coverage:{protected:G(e,n.protected_items),unprotected:G(e,n.unprotected_items),pending:typeof p?.attributes?.pending_items==`number`?p.attributes.pending_items:null},rules:{destinations:G(e,n.destinations_in_use),mediaTypes:ee?yt(f,`media_types`):null,remote:ee?yt(f,`remote_destinations`):null},jobs:a,storage:o,running:a.filter(e=>e.running),attention:[],level:`ok`};return m.attention=bt(m),m.level=xt(m),m}function vt(e){let t=e?.attributes?.run_type;return typeof t==`string`?t:null}function Z(e){return e.running.length>0?e.running.every(e=>e.restoring):e.activeRunType===`restore`}function yt(e,t){let n=e?.attributes?.[t];return typeof n==`number`?n:null}function bt(e){let t=e.entry.entities,n=[];if(e.online===!1)return n.push({kind:`offline`,level:`failed`,entityId:t.vault_online}),n;if(e.online===null&&e.daemonStatus===null)return n.push({kind:`unreachable`,level:`unknown`,entityId:t.vault_online??t.vault_status}),n;e.daemonStatus!==null&&e.daemonStatus.toLowerCase()!==`ok`&&n.push({kind:`daemon`,level:`failed`,entityId:t.vault_status,subject:e.daemonStatus});for(let t of e.jobs)t.level===`failed`&&n.push({kind:`job_failed`,level:`failed`,entityId:t.entities.job_status,subject:t.name});for(let t of e.jobs)t.level===`warning`&&n.push({kind:`job_warning`,level:`warning`,entityId:t.entities.job_problem??t.entities.job_status,subject:t.name});for(let t of e.jobs)t.level===`unknown`&&n.push({kind:`job_unknown`,level:`unknown`,entityId:t.entities.job_status,subject:t.name});if((e.anomalyCount??0)>0){let r=e.anomalies.some(e=>e.severity===`critical`);n.push({kind:`anomalies`,level:r?`failed`:`warning`,entityId:t.open_anomalies,count:e.anomalyCount??0})}for(let t of e.storage)t.level===`warning`&&n.push({kind:`storage`,level:`warning`,entityId:t.entities.storage_health,subject:t.name});return(e.coverage.unprotected??0)>0&&n.push({kind:`unprotected`,level:`warning`,entityId:t.unprotected_items,count:e.coverage.unprotected??0}),n}function xt(e){return e.attention.length>0?dt(e.attention.map(e=>e.level)):e.running.length>0||e.activeJob!==null?`running`:e.online===null?`unknown`:`ok`}function St(e){return Y(e.jobs)[0]??null}function Ct(e,t,n={}){if(t){let r=t.toLowerCase(),i=e.find(e=>e.device_id===t||e.entry_id===t||e.title.toLowerCase()===r||e.device_id!==null&&(n[e.device_id]??[]).some(e=>e.toLowerCase()===r));if(i)return i}return e[0]}function wt(e){let t=Object.values(e.entities);for(let n of e.jobs)t.push(...Object.values(n.entities));for(let n of e.storage)t.push(...Object.values(n.entities));return t}var Tt={failed:Be,warning:Fe,unknown:We,running:Ye,disabled:Ke,ok:Re,idle:Ke},Et=6e4,Q=class extends I{static styles=je;static properties={hass:{attribute:!1},config:{attribute:!1},_entries:{state:!0},_error:{state:!0}};model;_tracked=new Set;_loadingFor;_timer;_refetchTimer;constructor(){super(),this.config={type:``}}static extraFormSchema(){return[]}static getConfigForm(){let e=[{name:`server`,selector:{device:{filter:{integration:`vault`}}}},{name:`title`,selector:{text:{}}},...this.extraFormSchema()],t={server:`editor.server`,title:`editor.title`,max_items:`editor.max_items`};return{schema:e,computeLabel:e=>t[e.name]?V(void 0,t[e.name]):void 0,computeHelper:e=>e.name===`server`?V(void 0,`editor.server_helper`):void 0}}static getStubConfig(){return{}}setConfig(e){if(!e||typeof e.type!=`string`)throw Error(`Invalid card configuration`);this.config={...e}}getCardSize(){return 2}getGridOptions(){return{columns:6,rows:`auto`,min_columns:3}}connectedCallback(){super.connectedCallback(),this._timer=window.setInterval(()=>this.requestUpdate(),Et)}disconnectedCallback(){super.disconnectedCallback(),window.clearInterval(this._timer),window.clearTimeout(this._refetchTimer),this._refetchTimer=void 0}shouldUpdate(e){if(!e.has(`hass`)||e.size>1)return!0;let t=e.get(`hass`),n=this.hass;if(!t||!n||t.locale!==n.locale||t.language!==n.language||t.devices!==n.devices||t.entities!==n.entities)return!0;for(let e of this._tracked)if(t.states[e]!==n.states[e])return!0;return!1}willUpdate(e){super.willUpdate(e),this.toggleAttribute(`embedded`,!!this.config.embedded),this._entries!==void 0&&this._entries.length===0&&!this._refetchTimer&&(this._refetchTimer=window.setTimeout(()=>{this._refetchTimer=void 0,this._loadingFor=void 0,this.requestUpdate()},3e4)),this.hass&&this._loadingFor!==this.hass.entities&&(this._loadingFor=this.hass.entities,Ne(this.hass).then(e=>{this._entries=e,this._error=void 0},e=>{this._loadingFor=void 0,this._error=e instanceof Error?e.message:String(e?.message??e)}));let t=this._entries?this.selectedEntry(this._entries):void 0;this.model=t&&this.hass?_t(this.hass.states,t):void 0,this._tracked=new Set(t?wt(t):[])}selectedEntry(e){let t={};for(let e of Object.values(this.hass?.devices??{}))t[e.id]=[e.name,e.name_by_user].filter(e=>!!e);return Ct(e,this.config.server,t)}render(){if(!this.hass)return O``;if(!this.model){let e=this._error?this.t(`common.load_error`,{error:this._error}):this._entries?this.t(`common.not_set_up`):this.t(`common.loading`);return O`<ha-card>
        ${this.renderHeader()}
        <div class=${this._error?`alert`:`empty`} role=${this._error?`alert`:A}>${e}</div>
      </ha-card>`}return this.renderCard(this.model)}t(e,t){return V(this.hass,e,t)}renderHeader(e=A){let t=this.config.title||this.t(this.titleKey),n=O`${R(this.titleIcon,20,`icon title-icon`)}<span class="title-text">${t}</span>`;return O`<div class="header">
      ${this.config.embedded?O`<h3 class="title">${n}</h3>`:O`<h2 class="title">${n}</h2>`}
      ${e}
    </div>`}levelIcon(e,t=20){return R(Tt[e],t)}levelBadge(e,t){return O`<span class="badge lvl-${e}">${this.levelIcon(e,14)}${t}</span>`}moreInfo(e){e&&Pe(this,`hass-more-info`,{entityId:e})}entityLink(e,t,n=``){return!e||!this.hass?.states[e]?O`<span class=${n}>${t}</span>`:O`<button type="button" class="link ${n}" @click=${()=>this.moreInfo(e)}>
      ${t}
    </button>`}formatState(e){let t=e?this.hass?.states[e]:void 0;if(!t)return this.t(`common.unavailable`);if(this.hass?.formatEntityState)return this.hass.formatEntityState(t);let n=t.attributes.unit_of_measurement;return n?`${t.state} ${String(n)}`:t.state}relative(e){return ct(this.hass,e)}dateTime(e){return ot(this.hass,e)}timeTemplate(e){return O`<time datetime=${new Date(e).toISOString()} title=${this.dateTime(e)}>${this.relative(e)}</time>`}withTime(e,t){let[n=``,r=``]=this.t(e,{time:`\0`}).split(`\0`);return O`${n}${this.timeTemplate(t)}${r}`}runDetails(e){let t=[],n=this.hass?.states??{};for(let r of[`job_last_size`,`job_last_duration`]){let i=e.entities[r];i&&n[i]&&![`unknown`,`unavailable`].includes(n[i].state)&&t.push(this.formatState(i))}return e.itemsDone!==null&&t.push(this.t(`common.items`,{count:e.itemsDone})),t.join(this.t(`common.separator`))}get language(){return z(this.hass)}serverLabel(e){if(e.online===!1)return this.t(`server.offline`);switch(e.level){case`failed`:return this.t(`server.failed`);case`warning`:return this.t(`server.warning`);case`running`:return Z(e)?this.t(`server.restoring`):this.t(`server.running`);case`unknown`:return this.t(`server.unknown`);default:return this.t(`server.ok`)}}jobLabel(e,t=e.level){if(e={...e,level:t},e.level===`unknown`)return this.t(`level.unknown`);if(e.level===`disabled`)return this.t(`job.disabled`);if(e.level===`warning`||e.level===`failed`||e.level===`running`||e.level===`ok`||e.level===`idle`){let n=e.entities.job_status,r=n?this.hass?.states[n]:void 0,i=t===`running`||![`running`,`restoring`].includes(r?.state??``);if(r&&i&&this.hass?.formatEntityState&&![`unknown`,`unavailable`].includes(r.state))return e.level===`warning`&&r.state===`completed`?this.t(`level.warning`):this.hass.formatEntityState(r)}return this.t(e.level===`ok`?`job.ok`:`level.${e.level}`)}},Dt=`vault-health-card`,Ot=`vault-protected-card`,kt=`vault-next-run-card`,At=`vault-last-backup-card`,jt=`vault-progress-card`,Mt=`vault-jobs-card`,Nt=`vault-activity-card`,Pt=`vault-storage-card`,Ft=`vault-anomalies-card`,It=`vault-rules-card`,Lt=`vault-dashboard-card`,Rt=`https://github.com/tinkerologie/ha-vault/blob/main/docs/user/CONFIGURATION.md#dashboard-cards`;function zt(e,t){if(!customElements.get(e))try{customElements.define(e,t)}catch(n){if(n instanceof Error&&(n.name===`NotSupportedError`||n.message.includes(`already been registered`))){class n extends t{}customElements.define(e,n)}else throw n}}function $(e){zt(e.tag,e.card),window.customCards??=[],window.customCards.some(t=>t.type===e.tag)||window.customCards.push({type:e.tag,name:V(void 0,e.nameKey),description:V(void 0,e.descriptionKey),preview:!0,documentationURL:Rt,...e.getEntitySuggestion?{getEntitySuggestion:e.getEntitySuggestion}:{}})}var Bt=3;function Vt(e,t){let n=e.t.bind(e);switch(t.kind){case`daemon`:return n(`attention.daemon`,{state:t.subject??``});case`job_failed`:case`job_warning`:case`job_unknown`:case`storage`:return n(`attention.${t.kind}`,{subject:t.subject??``});case`anomalies`:case`unprotected`:return n(`attention.${t.kind}`,{count:t.count??0});default:return n(`attention.${t.kind}`)}}$({tag:Dt,card:class extends Q{titleKey=`title.health`;titleIcon=Ze;getCardSize(){return 2+Math.min(this.model?.attention.length??0,Bt)}renderCard(e){let t=e.attention.slice(0,Bt),n=e.attention.length-t.length;return O`<ha-card>
      ${this.renderHeader()}
      <div class="status">
        <span class="status-icon lvl-${e.level}">${this.levelIcon(e.level,24)}</span>
        <div class="status-text">
          ${this.entityLink(e.entry.entities.vault_status,O`<span class="label">${this.serverLabel(e)}</span>`)}
          <span class="sub">
            ${e.attention.length===0?this.t(`attention.none`):A}
            ${e.attention.length===0&&e.version?this.t(`common.separator`):A}
            ${e.version?this.t(`common.version`,{version:e.version}):A}
          </span>
        </div>
      </div>
      ${t.length?O`<ul class="list">
            ${t.map(e=>O`<li>
                ${this.entityLink(e.entityId,O`<span class="reason">${this.levelIcon(e.level,18)}<span>${Vt(this,e)}</span></span>`)}
              </li>`)}
            ${n>0?O`<li class="sub">${this.t(`common.more`,{count:n})}</li>`:A}
          </ul>`:A}
    </ha-card>`}},nameKey:`card.health.name`,descriptionKey:`card.health.description`}),$({tag:Ot,card:class extends Q{titleKey=`title.protected`;titleIcon=Qe;renderCard(e){let{protected:t,unprotected:n,pending:r}=e.coverage,i=e.entry.entities,a=t!==null&&n!==null?t+n:null,o=a?t/a*100:null,s=t===null||n===null?`unknown`:n>0?`warning`:`ok`,c;return c=t===null?this.t(`protected.unknown`):n===null?this.t(`protected.total_unknown`):n===0?this.t(`protected.all`):this.t(`protected.unprotected`,{count:n}),O`<ha-card>
      ${this.renderHeader(s===`unknown`?A:this.levelBadge(s,s===`ok`?this.t(`level.ok`):this.t(`level.warning`)))}
      ${this.entityLink(i.protected_items,O`<span class="value">${t===null?`—`:H(this.hass,t)}
          ${a===null?A:O`<small>${this.t(`protected.of_total`,{total:a})}</small>`}</span>`)}
      ${o===null?A:O`<div
            class="meter"
            role="meter"
            aria-label=${this.t(`protected.meter`)}
            aria-valuemin="0"
            aria-valuemax=${a}
            aria-valuenow=${t}
            aria-valuetext=${`${H(this.hass,t)} / ${H(this.hass,a)} (${U(this.hass,o)})`}
          >
            <div class="meter-fill lvl-${s}" style="width: ${o}%"></div>
          </div>`}
      ${this.entityLink(n?i.unprotected_items:void 0,O`<span class="sub">${c}${r?O`${this.t(`common.separator`)}${this.t(`protected.pending`,{count:r})}`:A}</span>`)}
    </ha-card>`}},nameKey:`card.protected.name`,descriptionKey:`card.protected.description`}),$({tag:kt,card:class extends Q{titleKey=`title.next_run`;titleIcon=Le;renderCard(e){let t=e.entry.entities,n=e.jobs.filter(e=>e.enabled===!0).length,r=this.t(`common.jobs`,{count:e.jobs.length}),i=e.running[0]?.name??e.activeJob,a=Z(e),o,s;return i?(o=this.t(a?`next_run.restoring`:`next_run.running`),s=i):e.nextBackup?(o=this.timeTemplate(e.nextBackup.time),s=`${e.nextBackup.job??``}${e.nextBackup.job?this.t(`common.separator`):``}${this.dateTime(e.nextBackup.time)}`):this.hass?.states[t.next_backup??``]?.state===`unknown`&&n===0?(o=this.t(`next_run.none`),s=``):(o=this.t(`next_run.unknown`),s=``),O`<ha-card>
      ${this.renderHeader()}
      ${this.entityLink(i?t.runner_current_job_id:t.next_backup,O`<span class="value">${o}</span>`)}
      ${s?O`<span class="label">${s}</span>`:``}
      <span class="sub">${this.t(`next_run.jobs_enabled`,{jobs:r,enabled:n})}</span>
    </ha-card>`}},nameKey:`card.next_run.name`,descriptionKey:`card.next_run.description`}),$({tag:At,card:class extends Q{titleKey=`title.last_backup`;titleIcon=Ge;renderCard(e){let t=St(e);return t?O`<ha-card>
      ${this.renderHeader(this.levelBadge(t.outcome,this.jobLabel(t,t.outcome)))}
      ${this.entityLink(t.entities.job_last_run,O`<span class="value">${this.timeTemplate(t.lastRun)}</span>`)}
      ${this.entityLink(t.entities.job_status,O`<span class="label">${t.name}</span>`)}
      ${this.runDetails(t)?O`<span class="sub">${this.runDetails(t)}</span>`:A}
    </ha-card>`:O`<ha-card>${this.renderHeader()}<span class="empty">${this.t(`last_backup.none`)}</span></ha-card>`}},nameKey:`card.last_backup.name`,descriptionKey:`card.last_backup.description`});function Ht(e,t){let n=e.hass,r=t.progress!==null&&t.progress>0?Math.min(100,t.progress):null;return O`<div class="row-main">
    <span class="row-title">
      ${e.entityLink(t.entities.job_progress,O`<span class="label">${t.name}</span>`)}
      <span class="badge lvl-running">
        ${e.t(t.restoring?`progress.restoring`:`progress.backing_up`)}${r===null?A:O`${e.t(`common.separator`)}${U(n,r)}`}
      </span>
    </span>
    <div
      class="meter"
      role="progressbar"
      aria-label=${e.t(t.restoring?`progress.restore_label`:`progress.label`,{job:t.name})}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuenow=${r??A}
    >
      <!-- Show a sliver of the stripes while progress is unknown or 0. -->
      <div class="meter-fill lvl-running" style="width: ${Math.max(5,r??0)}%"></div>
    </div>
  </div>`}$({tag:jt,card:class extends Q{get titleKey(){return this.model&&Z(this.model)?`title.restore_progress`:`title.progress`}titleIcon=$e;getCardSize(){return 2+(this.model?.running.length??0)}renderCard(e){let t=e.entry.entities.runner_queue_length,n=t&&this.hass?.states[t]?Number(this.hass.states[t].state):0;return e.running.length===0?O`<ha-card>
        ${this.renderHeader()}
        <span class="sub">
          ${this.t(`progress.idle`)}${e.nextBackup?O`${this.t(`common.separator`)}${this.t(`progress.next`,{time:this.relative(e.nextBackup.time)})}`:A}
        </span>
      </ha-card>`:O`<ha-card>
      ${this.renderHeader(this.levelBadge(`running`,this.t(Z(e)?`server.restoring`:`server.running`)))}
      <ul class="list">
        ${e.running.map(e=>O`<li class="row">${Ht(this,e)}</li>`)}
      </ul>
      ${n>0?O`<span class="sub">${this.t(`progress.queue`,{count:n})}</span>`:A}
    </ha-card>`}},nameKey:`card.progress.name`,descriptionKey:`card.progress.description`}),$({tag:It,card:class extends Q{titleKey=`title.rules`;titleIcon=Ve;getGridOptions(){return{columns:12,rows:`auto`,min_columns:6}}getCardSize(){return 3}renderCard(e){let{destinations:t,mediaTypes:n,remote:r}=e.rules,i=[{label:this.t(`rules.copies`),detail:t===null?this.t(`rules.unknown`):this.t(`rules.copies_detail`,{count:t}),met:t===null?null:t>=3},{label:this.t(`rules.media`),detail:n===null?this.t(`rules.unknown`):this.t(`rules.media_detail`,{count:n}),met:n===null?null:n>=2},{label:this.t(`rules.offsite`),detail:r===null?this.t(`rules.unknown`):r>0?this.t(`rules.offsite_detail_yes`):this.t(`rules.offsite_detail_no`),met:r===null?null:r>0}],a=i.some(e=>e.met===null),o=i.every(e=>e.met===!0),s=a?`unknown`:o?`ok`:`warning`,c=a?this.t(`rules.unknown`):o?this.t(`rules.likely_met`):this.t(`rules.not_met`),l=e=>e===null?`unknown`:e?`ok`:`failed`;return O`<ha-card>
      ${this.renderHeader(this.entityLink(e.entry.entities.destinations_in_use,this.levelBadge(s,c)))}
      <ul class="grid-3 list">
        ${i.map(e=>O`<li class="row">
            <span class="status-icon lvl-${l(e.met)}" style="width: 32px; height: 32px;">${this.levelIcon(l(e.met),18)}</span>
            <div class="row-main">
              <span class="label">${e.label}</span>
              <span class="sub">
                <span class="visually-hidden">${e.met===null?this.t(`rules.unknown`):e.met?this.t(`rules.met`):this.t(`rules.not_met`)}:</span>
                ${e.detail}
              </span>
            </div>
          </li>`)}
      </ul>
      <span class="sub">${this.t(`rules.footnote`)}</span>
    </ha-card>`}},nameKey:`card.rules.name`,descriptionKey:`card.rules.description`});var Ut=4e3;async function Wt(){try{return(await window.loadCardHelpers?.())?.showConfirmationDialog}catch{return}}$({tag:Mt,card:class extends Q{titleKey=`title.jobs`;titleIcon=Ie;static properties={...Q.properties,_run:{state:!0},_errors:{state:!0}};constructor(){super(),this._run=new Map,this._errors=new Map}getCardSize(){return 1+2*(this.model?.jobs.length??1)}getGridOptions(){return{columns:12,rows:`auto`,min_columns:6}}setRun(e,t){let n=new Map(this._run);t?n.set(e.id,t):n.delete(e.id),this._run=n}setError(e,t){let n=new Map(this._errors);t?n.set(e.id,t):n.delete(e.id),this._errors=n}async onRunClick(e){if(this._run.get(e.id)===`starting`)return;this.setError(e,void 0);let t=await Wt();if(!t){this.setRun(e,`confirm`);return}await t(this,{title:this.t(`jobs.confirm_title`,{job:e.name}),text:this.t(`jobs.confirm_text`,{job:e.name}),confirmText:this.t(`jobs.confirm_ok`),dismissText:this.t(`jobs.confirm_cancel`)})&&await this.runBackup(e)}async runBackup(e){if(this.hass){this.setRun(e,`starting`);try{let t=e.entities.run_backup;t?await this.hass.callService(`button`,`press`,{entity_id:t}):await this.hass.callService(`vault`,`run_backup`,{job_id:e.id}),this.setRun(e,`started`),window.setTimeout(()=>{this._run.get(e.id)===`started`&&this.setRun(e,void 0)},Ut)}catch(t){console.error(`Failed to start Vault job ${e.name}:`,t),this.setRun(e,void 0);let n=t instanceof Error?t.message:String(t?.message??t);this.setError(e,this.t(`jobs.run_failed`,{job:e.name,error:n}))}}}jobMeta(e){let t=[];return e.lastRun===null?e.running||t.push(this.t(`jobs.never_run`)):t.push(this.withTime(`jobs.last_run`,e.lastRun)),e.enabled===!1?e.level!==`disabled`&&t.push(this.t(`job.disabled`)):e.nextRun===null?e.enabled===!0?t.push(this.t(`jobs.not_scheduled`)):t.push(this.t(`job.enabled_unknown`)):t.push(this.withTime(`jobs.next_run`,e.nextRun)),e.restorePoints!==null&&t.push(this.t(`jobs.restore_points`,{count:e.restorePoints})),O`${t.map((e,t)=>O`${t?this.t(`common.separator`):A}${e}`)}`}renderRunButton(e){let t=this._run.get(e.id),n=t===`starting`||e.running,r=e.running?this.t(e.restoring?`progress.restoring`:`level.running`):t===`starting`?this.t(`jobs.starting`):t===`started`?this.t(`jobs.started`):this.t(`jobs.run`);return O`<button
      type="button"
      class="btn"
      aria-label=${t===`starting`||t===`started`||e.running?r:this.t(`jobs.run_label`,{job:e.name})}
      aria-disabled=${n?`true`:`false`}
      @click=${()=>n?void 0:this.onRunClick(e)}
    >
      ${R(Je,18)}${r}
    </button>`}renderJob(e){let t=this._errors.get(e.id),n=this._run.get(e.id)===`confirm`;return O`<li class="row" style="flex-direction: column; align-items: stretch;">
      <div class="row" style="padding: 0; border: none; gap: 12px;">
        <div class="row-main">
          <span class="row-title">
            ${this.entityLink(e.entities.job_status,O`<span class="label">${e.name}</span>`)}
            ${this.levelBadge(e.level,this.jobLabel(e))}
          </span>
          <span class="sub">${this.jobMeta(e)}</span>
        </div>
        <div class="row-actions">${this.renderRunButton(e)}</div>
      </div>
      ${n?O`<div class="confirm" role="group" aria-label=${this.t(`jobs.confirm_title`,{job:e.name})}>
            <span class="label">${this.t(`jobs.confirm_title`,{job:e.name})}</span>
            <span class="sub">${this.t(`jobs.confirm_text`,{job:e.name})}</span>
            <div class="row-actions">
              <button type="button" class="btn primary" @click=${()=>this.runBackup(e)}>${this.t(`jobs.confirm_ok`)}</button>
              <button type="button" class="btn" @click=${()=>this.setRun(e,void 0)}>${this.t(`jobs.confirm_cancel`)}</button>
            </div>
          </div>`:A}
      ${t?O`<div class="alert" role="alert">
            <span class="alert-text">${t}</span>
            <button type="button" aria-label=${this.t(`common.dismiss`)} @click=${()=>this.setError(e,void 0)}>
              ${R(ze,18)}
            </button>
          </div>`:A}
    </li>`}renderCard(e){let t=e.entry.configuration_url;return O`<ha-card>
      ${this.renderHeader(t?O`<a class="btn" href=${t} target="_blank" rel="noopener noreferrer">
              ${R(qe,18)}${this.t(`common.open_in_vault`)}
            </a>`:A)}
      ${e.jobs.length===0?O`<span class="empty">${this.t(`jobs.empty`)}</span>`:O`<ul class="list">${e.jobs.map(e=>this.renderJob(e))}</ul>`}
    </ha-card>`}},nameKey:`card.jobs.name`,descriptionKey:`card.jobs.description`}),$({tag:Nt,card:class extends Q{titleKey=`title.activity`;titleIcon=He;getCardSize(){return 1+2*(this.model?Y(this.model.jobs).length:1)}getGridOptions(){return{columns:12,rows:`auto`,min_columns:6}}renderCard(e){let t=Y(e.jobs);return O`<ha-card>
      ${this.renderHeader()}
      ${t.length===0?O`<span class="empty">${this.t(`activity.empty`)}</span>`:O`<ol class="list">
            ${t.map(e=>{let t=this.runDetails(e);return O`<li class="row">
                <div class="row-main">
                  <span class="row-title">
                    ${this.entityLink(e.entities.job_status,O`<span class="label">${e.name}</span>`)}
                    ${this.levelBadge(e.outcome,this.jobLabel(e,e.outcome))}
                  </span>
                  <span class="sub">
                    ${this.entityLink(e.entities.job_last_run,O`${this.dateTime(e.lastRun)}`)}
                    ${t?O`${this.t(`common.separator`)}${t}`:A}
                  </span>
                </div>
              </li>`})}
          </ol>`}
    </ha-card>`}},nameKey:`card.activity.name`,descriptionKey:`card.activity.description`}),$({tag:Pt,card:class extends Q{titleKey=`title.storage`;titleIcon=Ue;getCardSize(){return 1+2*(this.model?.storage.length??1)}getGridOptions(){return{columns:12,rows:`auto`,min_columns:6}}typeLabel(e){let t=`storage.type.${e.toLowerCase()}`,n=this.t(t);return n===t?e.toUpperCase():n}healthLabel(e){return e.health===null?this.t(`storage.health_unknown`):e.health.toLowerCase()===`ok`?this.t(`storage.health_ok`):this.formatState(e.entities.storage_health)}renderDestination(e){let t=e.entities,n=e.health===null?`unknown`:e.health.toLowerCase()===`ok`?`ok`:`warning`,r=e.usedPercent===null?`unknown`:e.usedPercent>=90?`failed`:e.usedPercent>=80?`warning`:`ok`;return O`<li class="row">
      <div class="row-main">
        <span class="row-title">
          ${this.entityLink(t.storage_name??t.storage_health,O`<span class="label">${e.name}</span>`)}
          ${e.type?O`<span class="badge">${this.typeLabel(e.type)}</span>`:A}
          ${this.entityLink(t.storage_health,this.levelBadge(n,this.healthLabel(e)))}
        </span>
        ${e.usedPercent===null?O`<span class="sub">${this.t(`storage.capacity_unknown`)}</span>`:O`<div
                class="meter"
                role="meter"
                aria-label=${this.t(`storage.usage`,{name:e.name})}
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow=${Math.round(e.usedPercent)}
                aria-valuetext=${this.t(`storage.used`,{percent:U(this.hass,e.usedPercent)})}
              >
                <div class="meter-fill lvl-${r}" style="width: ${e.usedPercent}%"></div>
              </div>
              <span class="sub">
                ${this.entityLink(t.storage_free_space,this.t(`storage.free`,{free:this.formatState(t.storage_free_space)}))}
                ${this.t(`common.separator`)}${this.t(`storage.used`,{percent:U(this.hass,e.usedPercent)})}
              </span>`}
      </div>
    </li>`}renderCard(e){return O`<ha-card>
      ${this.renderHeader()}
      ${e.storage.length===0?O`<span class="empty">${this.t(`storage.empty`)}</span>`:O`<ul class="list">${e.storage.map(e=>this.renderDestination(e))}</ul>`}
    </ha-card>`}},nameKey:`card.storage.name`,descriptionKey:`card.storage.description`});var Gt=5;function Kt(e,t){let n=`anomalies.severity.${t}`,r=e.t(n);return r===n?t:r}function qt(e,t,n){let r=t.slice(0,Math.max(1,n)),i=t.length-r.length;return O`<ul class="list">
    ${r.map(t=>O`<li class="row">
        <div class="row-main">
          <span class="row-title">
            <span class="label">${t.summary||t.detector}</span>
            <span class="badge lvl-${t.severity===`critical`?`failed`:`warning`}">${Kt(e,t.severity)}</span>
          </span>
          <span class="sub">${t.job?e.t(`anomalies.scope`,{job:t.job}):e.t(`anomalies.system`)}</span>
        </div>
      </li>`)}
    ${i>0?O`<li class="sub">${e.t(`common.more`,{count:i})}</li>`:A}
  </ul>`}$({tag:Ft,card:class extends Q{titleKey=`title.anomalies`;titleIcon=Xe;static extraFormSchema(){return[{name:`max_items`,selector:{number:{min:1,max:20,mode:`box`}}}]}getCardSize(){return 2+Math.min(this.model?.anomalies.length??0,this.maxItems)}getGridOptions(){return{columns:12,rows:`auto`,min_columns:6}}get maxItems(){let e=Number(this.config.max_items);return Number.isInteger(e)&&e>0?e:Gt}renderCard(e){let t=e.anomalyCount,n=t===null?`unknown`:t===0?`ok`:e.anomalies.some(e=>e.severity===`critical`)?`failed`:`warning`,r=t===null?this.t(`level.unknown`):t===0?this.t(`anomalies.none`):this.t(`attention.anomalies`,{count:t});return O`<ha-card>
      ${this.renderHeader(this.entityLink(e.entry.entities.open_anomalies,this.levelBadge(n,r)))}
      ${t?qt(this,e.anomalies,this.maxItems):A}
    </ha-card>`}},nameKey:`card.anomalies.name`,descriptionKey:`card.anomalies.description`,getEntitySuggestion:(e,t)=>{let n=e.entities?.[t];return n?.platform!==`vault`||n.translation_key!==`open_anomalies`?null:{config:{type:`custom:${Ft}`,...n.device_id?{server:n.device_id}:{}}}}});var Jt=4,Yt=3;$({tag:Lt,card:class extends Q{titleKey=`title.health`;titleIcon=Ze;getCardSize(){let e=this.model;return e?3+Math.min(e.attention.length,Jt)+(e.anomalyCount?Math.min(e.anomalies.length,Yt):0)+e.running.length:3}getGridOptions(){return{columns:`full`,rows:`auto`,min_columns:6}}serverName(e){let t=e.entry.device_id?this.hass?.devices?.[e.entry.device_id]:void 0;return this.config.title||t?.name_by_user||t?.name||e.entry.title}renderCard(e){let t=e.attention.slice(0,Jt),n=e.attention.length-t.length,r=St(e),i=e.entry.configuration_url,{protected:a,unprotected:o}=e.coverage;return O`<ha-card>
      <div class="header">
        <h2 class="title">
          ${R(this.titleIcon,20,`icon title-icon`)}<span class="title-text">${this.serverName(e)}</span>
        </h2>
        <span class="row-actions">
          ${this.entityLink(e.entry.entities.vault_status,this.levelBadge(e.level,this.serverLabel(e)))}
          ${i?O`<a class="btn" href=${i} target="_blank" rel="noopener noreferrer">
                ${R(qe,18)}${this.t(`common.open_in_vault`)}
              </a>`:A}
        </span>
      </div>

      ${t.length?O`<ul class="list" aria-label=${this.t(`server.warning`)}>
            ${t.map(e=>O`<li>
                ${this.entityLink(e.entityId,O`<span class="reason">${this.levelIcon(e.level,18)}<span>${Vt(this,e)}</span></span>`)}
              </li>`)}
            ${n>0?O`<li class="sub">${this.t(`common.more`,{count:n})}</li>`:A}
          </ul>`:O`<span class="sub">${this.t(`attention.none`)}</span>`}

      ${e.anomalyCount?qt(this,e.anomalies,Yt):A}

      ${e.running.length?O`<ul class="list">${e.running.map(e=>O`<li class="row">${Ht(this,e)}</li>`)}</ul>`:A}

      <div class="grid-2">
        <div class="fact">
          <span class="fact-label">${this.t(`title.last_backup`)}</span>
          ${r?O`${this.entityLink(r.entities.job_last_run,O`<span class="label">${this.timeTemplate(r.lastRun)}</span>`)}
                <span class="sub">${r.name}${this.t(`common.separator`)}${this.jobLabel(r,r.outcome)}</span>`:O`<span class="sub">${this.t(`last_backup.none`)}</span>`}
        </div>
        <div class="fact">
          <span class="fact-label">${this.t(`title.next_run`)}</span>
          ${e.nextBackup?O`${this.entityLink(e.entry.entities.next_backup,O`<span class="label">${this.timeTemplate(e.nextBackup.time)}</span>`)}
                ${e.nextBackup.job?O`<span class="sub">${e.nextBackup.job}</span>`:A}`:O`<span class="sub">${this.t(`next_run.unknown`)}</span>`}
        </div>
        <div class="fact">
          <span class="fact-label">${this.t(`title.protected`)}</span>
          ${a===null?O`<span class="sub">${this.t(`protected.unknown`)}</span>`:O`${this.entityLink(e.entry.entities.protected_items,O`<span class="label">${H(this.hass,a)}${o===null?A:O` <span class="muted">${this.t(`protected.of_total`,{total:a+o})}</span>`}</span>`)}`}
        </div>
        <div class="fact">
          <span class="fact-label">${this.t(`title.jobs`)}</span>
          <span class="label">${this.t(`common.jobs`,{count:e.jobs.length})}</span>
          ${e.version?O`<span class="sub">${this.t(`common.version`,{version:e.version})}</span>`:A}
        </div>
      </div>
    </ha-card>`}},nameKey:`card.dashboard.name`,descriptionKey:`card.dashboard.description`});