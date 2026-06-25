var Da=Object.defineProperty,zg=Object.getOwnPropertyDescriptor,Cg=Object.getOwnPropertyNames,Ag=Object.prototype.hasOwnProperty,Og=(e=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(e,{get:(t,r)=>(typeof require<"u"?require:t)[r]}):e)(function(e){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+e+'" is not supported')}),q=(e,t)=>()=>(e&&(t=e(e=0)),t),Ft=(e,t)=>{for(var r in t)Da(e,r,{get:t[r],enumerable:!0})},Mg=(e,t,r,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let a of Cg(t))!Ag.call(e,a)&&a!==r&&Da(e,a,{get:()=>t[a],enumerable:!(i=zg(t,a))||i.enumerable});return e},hr=e=>Mg(Da({},"__esModule",{value:!0}),e),Qt,ft,Lt,io,Pd,Ud=q(()=>{Qt=new Map,ft=[],Lt=(e,t,r)=>{if(t&&typeof t.init=="function"&&typeof t.createInferenceSessionHandler=="function"){let i=Qt.get(e);if(i===void 0)Qt.set(e,{backend:t,priority:r});else{if(i.priority>r)return;if(i.priority===r&&i.backend!==t)throw new Error(`cannot register backend "${e}" using priority ${r}`)}if(r>=0){let a=ft.indexOf(e);a!==-1&&ft.splice(a,1);for(let n=0;n<ft.length;n++)if(Qt.get(ft[n]).priority<=r){ft.splice(n,0,e);return}ft.push(e)}return}throw new TypeError("not a valid backend")},io=async e=>{let t=Qt.get(e);if(!t)return"backend not found.";if(t.initialized)return t.backend;if(t.aborted)return t.error;{let r=!!t.initPromise;try{return r||(t.initPromise=t.backend.init(e)),await t.initPromise,t.initialized=!0,t.backend}catch(i){return r||(t.error=`${i}`,t.aborted=!0),t.error}finally{delete t.initPromise}}},Pd=async e=>{let t=e.executionProviders||[],r=t.map(l=>typeof l=="string"?l:l.name),i=r.length===0?ft:r,a,n=[],s=new Set;for(let l of i){let p=await io(l);typeof p=="string"?n.push({name:l,err:p}):(a||(a=p),a===p&&s.add(l))}if(!a)throw new Error(`no available backend found. ERR: ${n.map(l=>`[${l.name}] ${l.err}`).join(", ")}`);for(let{name:l,err:p}of n)r.includes(l)&&console.warn(`removing requested execution provider "${l}" from session options because it is not available: ${p}`);let u=t.filter(l=>s.has(typeof l=="string"?l:l.name));return[a,new Proxy(e,{get:(l,p)=>p==="executionProviders"?u:Reflect.get(l,p)})]}}),Rg=q(()=>{Ud()}),Wd,Bg=q(()=>{Wd="1.26.0"}),Si,Ce,qd=q(()=>{Bg(),Si="warning",Ce={wasm:{},webgl:{},webgpu:{},versions:{common:Wd},set logLevel(e){if(e!==void 0){if(typeof e!="string"||["verbose","info","warning","error","fatal"].indexOf(e)===-1)throw new Error(`Unsupported logging level: ${e}`);Si=e}},get logLevel(){return Si}},Object.defineProperty(Ce,"logLevel",{enumerable:!0})}),_e,Dg=q(()=>{qd(),_e=Ce}),Ld,Gd,Ng=q(()=>{Ld=(e,t)=>{let r=typeof document<"u"?document.createElement("canvas"):new OffscreenCanvas(1,1);r.width=e.dims[3],r.height=e.dims[2];let i=r.getContext("2d");if(i!=null){let a,n;t?.tensorLayout!==void 0&&t.tensorLayout==="NHWC"?(a=e.dims[2],n=e.dims[3]):(a=e.dims[3],n=e.dims[2]);let s=t?.format!==void 0?t.format:"RGB",u=t?.norm,l,p;u===void 0||u.mean===void 0?l=[255,255,255,255]:typeof u.mean=="number"?l=[u.mean,u.mean,u.mean,u.mean]:(l=[u.mean[0],u.mean[1],u.mean[2],0],u.mean[3]!==void 0&&(l[3]=u.mean[3])),u===void 0||u.bias===void 0?p=[0,0,0,0]:typeof u.bias=="number"?p=[u.bias,u.bias,u.bias,u.bias]:(p=[u.bias[0],u.bias[1],u.bias[2],0],u.bias[3]!==void 0&&(p[3]=u.bias[3]));let h=n*a,f=0,g=h,y=h*2,_=-1;s==="RGBA"?(f=0,g=h,y=h*2,_=h*3):s==="RGB"?(f=0,g=h,y=h*2):s==="RBG"&&(f=0,y=h,g=h*2);for(let w=0;w<n;w++)for(let k=0;k<a;k++){let x=(e.data[f++]-p[0])*l[0],b=(e.data[g++]-p[1])*l[1],T=(e.data[y++]-p[2])*l[2],S=_===-1?255:(e.data[_++]-p[3])*l[3];i.fillStyle="rgba("+x+","+b+","+T+","+S+")",i.fillRect(k,w,1,1)}if("toDataURL"in r)return r.toDataURL();throw new Error("toDataURL is not supported")}else throw new Error("Can not access image data")},Gd=(e,t)=>{let r=typeof document<"u"?document.createElement("canvas").getContext("2d"):new OffscreenCanvas(1,1).getContext("2d"),i;if(r!=null){let a,n,s;t?.tensorLayout!==void 0&&t.tensorLayout==="NHWC"?(a=e.dims[2],n=e.dims[1],s=e.dims[3]):(a=e.dims[3],n=e.dims[2],s=e.dims[1]);let u=t!==void 0&&t.format!==void 0?t.format:"RGB",l=t?.norm,p,h;l===void 0||l.mean===void 0?p=[255,255,255,255]:typeof l.mean=="number"?p=[l.mean,l.mean,l.mean,l.mean]:(p=[l.mean[0],l.mean[1],l.mean[2],255],l.mean[3]!==void 0&&(p[3]=l.mean[3])),l===void 0||l.bias===void 0?h=[0,0,0,0]:typeof l.bias=="number"?h=[l.bias,l.bias,l.bias,l.bias]:(h=[l.bias[0],l.bias[1],l.bias[2],0],l.bias[3]!==void 0&&(h[3]=l.bias[3]));let f=n*a;if(t!==void 0&&(t.format!==void 0&&s===4&&t.format!=="RGBA"||s===3&&t.format!=="RGB"&&t.format!=="BGR"))throw new Error("Tensor format doesn't match input tensor dims");let g=4,y=0,_=1,w=2,k=3,x=0,b=f,T=f*2,S=-1;u==="RGBA"?(x=0,b=f,T=f*2,S=f*3):u==="RGB"?(x=0,b=f,T=f*2):u==="RBG"&&(x=0,T=f,b=f*2),i=r.createImageData(a,n);for(let I=0;I<n*a;y+=g,_+=g,w+=g,k+=g,I++)i.data[y]=(e.data[x++]-h[0])*p[0],i.data[_]=(e.data[b++]-h[1])*p[1],i.data[w]=(e.data[T++]-h[2])*p[2],i.data[k]=S===-1?255:(e.data[S++]-h[3])*p[3]}else throw new Error("Can not access image data");return i}}),Ir,Vd,Hd,Fd,jd,Kd,Pg=q(()=>{Na(),Ir=(e,t)=>{if(e===void 0)throw new Error("Image buffer must be defined");if(t.height===void 0||t.width===void 0)throw new Error("Image height and width must be defined");if(t.tensorLayout==="NHWC")throw new Error("NHWC Tensor layout is not supported yet");let{height:r,width:i}=t,a=t.norm??{mean:255,bias:0},n,s;typeof a.mean=="number"?n=[a.mean,a.mean,a.mean,a.mean]:n=[a.mean[0],a.mean[1],a.mean[2],a.mean[3]??255],typeof a.bias=="number"?s=[a.bias,a.bias,a.bias,a.bias]:s=[a.bias[0],a.bias[1],a.bias[2],a.bias[3]??0];let u=t.format!==void 0?t.format:"RGBA",l=t.tensorFormat!==void 0&&t.tensorFormat!==void 0?t.tensorFormat:"RGB",p=r*i,h=l==="RGBA"?new Float32Array(p*4):new Float32Array(p*3),f=4,g=0,y=1,_=2,w=3,k=0,x=p,b=p*2,T=-1;u==="RGB"&&(f=3,g=0,y=1,_=2,w=-1),l==="RGBA"?T=p*3:l==="RBG"?(k=0,b=p,x=p*2):l==="BGR"&&(b=0,x=p,k=p*2);for(let S=0;S<p;S++,g+=f,_+=f,y+=f,w+=f)h[k++]=(e[g]+s[0])/n[0],h[x++]=(e[y]+s[1])/n[1],h[b++]=(e[_]+s[2])/n[2],T!==-1&&w!==-1&&(h[T++]=(e[w]+s[3])/n[3]);return l==="RGBA"?new Pe("float32",h,[1,4,r,i]):new Pe("float32",h,[1,3,r,i])},Vd=async(e,t)=>{let r=typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement,i=typeof ImageData<"u"&&e instanceof ImageData,a=typeof ImageBitmap<"u"&&e instanceof ImageBitmap,n=typeof e=="string",s,u=t??{},l=()=>{if(typeof document<"u")return document.createElement("canvas");if(typeof OffscreenCanvas<"u")return new OffscreenCanvas(1,1);throw new Error("Canvas is not supported")},p=h=>typeof HTMLCanvasElement<"u"&&h instanceof HTMLCanvasElement||h instanceof OffscreenCanvas?h.getContext("2d"):null;if(r){let h=l();h.width=e.width,h.height=e.height;let f=p(h);if(f!=null){let g=e.height,y=e.width;if(t!==void 0&&t.resizedHeight!==void 0&&t.resizedWidth!==void 0&&(g=t.resizedHeight,y=t.resizedWidth),t!==void 0){if(u=t,t.tensorFormat!==void 0)throw new Error("Image input config format must be RGBA for HTMLImageElement");u.tensorFormat="RGBA",u.height=g,u.width=y}else u.tensorFormat="RGBA",u.height=g,u.width=y;f.drawImage(e,0,0),s=f.getImageData(0,0,y,g).data}else throw new Error("Can not access image data")}else if(i){let h,f;if(t!==void 0&&t.resizedWidth!==void 0&&t.resizedHeight!==void 0?(h=t.resizedHeight,f=t.resizedWidth):(h=e.height,f=e.width),t!==void 0&&(u=t),u.format="RGBA",u.height=h,u.width=f,t!==void 0){let g=l();g.width=f,g.height=h;let y=p(g);if(y!=null)y.putImageData(e,0,0),s=y.getImageData(0,0,f,h).data;else throw new Error("Can not access image data")}else s=e.data}else if(a){if(t===void 0)throw new Error("Please provide image config with format for Imagebitmap");let h=l();h.width=e.width,h.height=e.height;let f=p(h);if(f!=null){let g=e.height,y=e.width;return f.drawImage(e,0,0,y,g),s=f.getImageData(0,0,y,g).data,u.height=g,u.width=y,Ir(s,u)}else throw new Error("Can not access image data")}else{if(n)return new Promise((h,f)=>{let g=l(),y=p(g);if(!e||!y)return f();let _=new Image;_.crossOrigin="Anonymous",_.src=e,_.onload=()=>{g.width=_.width,g.height=_.height,y.drawImage(_,0,0,g.width,g.height);let w=y.getImageData(0,0,g.width,g.height);u.height=g.height,u.width=g.width,h(Ir(w.data,u))}});throw new Error("Input data provided is not supported - aborted tensor creation")}if(s!==void 0)return Ir(s,u);throw new Error("Input data provided is not supported - aborted tensor creation")},Hd=(e,t)=>{let{width:r,height:i,download:a,dispose:n}=t,s=[1,i,r,4];return new Pe({location:"texture",type:"float32",texture:e,dims:s,download:a,dispose:n})},Fd=(e,t)=>{let{dataType:r,dims:i,download:a,dispose:n}=t;return new Pe({location:"gpu-buffer",type:r??"float32",gpuBuffer:e,dims:i,download:a,dispose:n})},jd=(e,t)=>{let{dataType:r,dims:i,download:a,dispose:n}=t;return new Pe({location:"ml-tensor",type:r??"float32",mlTensor:e,dims:i,download:a,dispose:n})},Kd=(e,t,r)=>new Pe({location:"cpu-pinned",type:e,data:t,dims:r??[t.length]})}),It,or,ki,Zd,Ug=q(()=>{It=new Map([["float32",Float32Array],["uint8",Uint8Array],["int8",Int8Array],["uint16",Uint16Array],["int16",Int16Array],["int32",Int32Array],["bool",Uint8Array],["float64",Float64Array],["uint32",Uint32Array],["int4",Uint8Array],["uint4",Uint8Array]]),or=new Map([[Float32Array,"float32"],[Uint8Array,"uint8"],[Int8Array,"int8"],[Uint16Array,"uint16"],[Int16Array,"int16"],[Int32Array,"int32"],[Float64Array,"float64"],[Uint32Array,"uint32"]]),ki=!1,Zd=()=>{if(!ki){ki=!0;let e=typeof BigInt64Array<"u"&&BigInt64Array.from,t=typeof BigUint64Array<"u"&&BigUint64Array.from,r=globalThis.Float16Array,i=typeof r<"u"&&r.from;e&&(It.set("int64",BigInt64Array),or.set(BigInt64Array,"int64")),t&&(It.set("uint64",BigUint64Array),or.set(BigUint64Array,"uint64")),i?(It.set("float16",r),or.set(r,"float16")):It.set("float16",Uint16Array)}}}),Xd,Qd,Wg=q(()=>{Na(),Xd=e=>{let t=1;for(let r=0;r<e.length;r++){let i=e[r];if(typeof i!="number"||!Number.isSafeInteger(i))throw new TypeError(`dims[${r}] must be an integer, got: ${i}`);if(i<0)throw new RangeError(`dims[${r}] must be a non-negative integer, got: ${i}`);t*=i}return t},Qd=(e,t)=>{switch(e.location){case"cpu":return new Pe(e.type,e.data,t);case"cpu-pinned":return new Pe({location:"cpu-pinned",data:e.data,type:e.type,dims:t});case"texture":return new Pe({location:"texture",texture:e.texture,type:e.type,dims:t});case"gpu-buffer":return new Pe({location:"gpu-buffer",gpuBuffer:e.gpuBuffer,type:e.type,dims:t});case"ml-tensor":return new Pe({location:"ml-tensor",mlTensor:e.mlTensor,type:e.type,dims:t});default:throw new Error(`tensorReshape: tensor location ${e.location} is not supported`)}}}),Pe,Na=q(()=>{Ng(),Pg(),Ug(),Wg(),Pe=class{constructor(e,t,r){Zd();let i,a;if(typeof e=="object"&&"location"in e)switch(this.dataLocation=e.location,i=e.type,a=e.dims,e.location){case"cpu-pinned":{let s=It.get(i);if(!s)throw new TypeError(`unsupported type "${i}" to create tensor from pinned buffer`);if(!(e.data instanceof s))throw new TypeError(`buffer should be of type ${s.name}`);this.cpuData=e.data;break}case"texture":{if(i!=="float32")throw new TypeError(`unsupported type "${i}" to create tensor from texture`);this.gpuTextureData=e.texture,this.downloader=e.download,this.disposer=e.dispose;break}case"gpu-buffer":{if(i!=="float32"&&i!=="float16"&&i!=="int32"&&i!=="int64"&&i!=="uint32"&&i!=="uint8"&&i!=="bool"&&i!=="uint4"&&i!=="int4")throw new TypeError(`unsupported type "${i}" to create tensor from gpu buffer`);this.gpuBufferData=e.gpuBuffer,this.downloader=e.download,this.disposer=e.dispose;break}case"ml-tensor":{if(i!=="float32"&&i!=="float16"&&i!=="int32"&&i!=="int64"&&i!=="uint32"&&i!=="uint64"&&i!=="int8"&&i!=="uint8"&&i!=="bool"&&i!=="uint4"&&i!=="int4")throw new TypeError(`unsupported type "${i}" to create tensor from MLTensor`);this.mlTensorData=e.mlTensor,this.downloader=e.download,this.disposer=e.dispose;break}default:throw new Error(`Tensor constructor: unsupported location '${this.dataLocation}'`)}else{let s,u;if(typeof e=="string")if(i=e,u=r,e==="string"){if(!Array.isArray(t))throw new TypeError("A string tensor's data must be a string array.");s=t}else{let l=It.get(e);if(l===void 0)throw new TypeError(`Unsupported tensor type: ${e}.`);if(Array.isArray(t)){if(e==="float16"&&l===Uint16Array||e==="uint4"||e==="int4")throw new TypeError(`Creating a ${e} tensor from number array is not supported. Please use ${l.name} as data.`);e==="uint64"||e==="int64"?s=l.from(t,BigInt):s=l.from(t)}else if(t instanceof l)s=t;else if(t instanceof Uint8ClampedArray)if(e==="uint8")s=Uint8Array.from(t);else throw new TypeError("A Uint8ClampedArray tensor's data must be type of uint8");else if(e==="float16"&&t instanceof Uint16Array&&l!==Uint16Array)s=new globalThis.Float16Array(t.buffer,t.byteOffset,t.length);else throw new TypeError(`A ${i} tensor's data must be type of ${l}`)}else if(u=t,Array.isArray(e)){if(e.length===0)throw new TypeError("Tensor type cannot be inferred from an empty array.");let l=typeof e[0];if(l==="string")i="string",s=e;else if(l==="boolean")i="bool",s=Uint8Array.from(e);else throw new TypeError(`Invalid element type of data array: ${l}.`)}else if(e instanceof Uint8ClampedArray)i="uint8",s=Uint8Array.from(e);else{let l=or.get(e.constructor);if(l===void 0)throw new TypeError(`Unsupported type for tensor data: ${e.constructor}.`);i=l,s=e}if(u===void 0)u=[s.length];else if(!Array.isArray(u))throw new TypeError("A tensor's dims must be a number array");a=u,this.cpuData=s,this.dataLocation="cpu"}let n=Xd(a);if(this.cpuData&&n!==this.cpuData.length&&!((i==="uint4"||i==="int4")&&Math.ceil(n/2)===this.cpuData.length))throw new Error(`Tensor's size(${n}) does not match data length(${this.cpuData.length}).`);this.type=i,this.dims=a,this.size=n}static async fromImage(e,t){return Vd(e,t)}static fromTexture(e,t){return Hd(e,t)}static fromGpuBuffer(e,t){return Fd(e,t)}static fromMLTensor(e,t){return jd(e,t)}static fromPinnedBuffer(e,t,r){return Kd(e,t,r)}toDataURL(e){return Ld(this,e)}toImageData(e){return Gd(this,e)}get data(){if(this.ensureValid(),!this.cpuData)throw new Error("The data is not on CPU. Use `getData()` to download GPU data to CPU, or use `texture` or `gpuBuffer` property to access the GPU data directly.");return this.cpuData}get location(){return this.dataLocation}get texture(){if(this.ensureValid(),!this.gpuTextureData)throw new Error("The data is not stored as a WebGL texture.");return this.gpuTextureData}get gpuBuffer(){if(this.ensureValid(),!this.gpuBufferData)throw new Error("The data is not stored as a WebGPU buffer.");return this.gpuBufferData}get mlTensor(){if(this.ensureValid(),!this.mlTensorData)throw new Error("The data is not stored as a WebNN MLTensor.");return this.mlTensorData}async getData(e){switch(this.ensureValid(),this.dataLocation){case"cpu":case"cpu-pinned":return this.data;case"texture":case"gpu-buffer":case"ml-tensor":{if(!this.downloader)throw new Error("The current tensor is not created with a specified data downloader.");if(this.isDownloading)throw new Error("The current tensor is being downloaded.");try{this.isDownloading=!0;let t=await this.downloader();return this.downloader=void 0,this.dataLocation="cpu",this.cpuData=t,e&&this.disposer&&(this.disposer(),this.disposer=void 0),t}finally{this.isDownloading=!1}}default:throw new Error(`cannot get data from location: ${this.dataLocation}`)}}dispose(){if(this.isDownloading)throw new Error("The current tensor is being downloaded.");this.disposer&&(this.disposer(),this.disposer=void 0),this.cpuData=void 0,this.gpuTextureData=void 0,this.gpuBufferData=void 0,this.mlTensorData=void 0,this.downloader=void 0,this.isDownloading=void 0,this.dataLocation="none"}ensureValid(){if(this.dataLocation==="none")throw new Error("The tensor is disposed.")}reshape(e){if(this.ensureValid(),this.downloader||this.disposer)throw new Error("Cannot reshape a tensor that owns GPU resource.");return Qd(this,e)}}}),Ie,Yd=q(()=>{Na(),Ie=Pe}),Gr,Ti,it,Xe,Ot,Mt,Jd=q(()=>{qd(),Gr=(e,t)=>{(typeof Ce.trace>"u"?!Ce.wasm.trace:!Ce.trace)||console.timeStamp(`${e}::ORT::${t}`)},Ti=(e,t)=>{let r=new Error().stack?.split(/\r\n|\r|\n/g)||[],i=!1;for(let a=0;a<r.length;a++){if(i&&!r[a].includes("TRACE_FUNC")){let n=`FUNC_${e}::${r[a].trim().split(" ")[1]}`;t&&(n+=`::${t}`),Gr("CPU",n);return}r[a].includes("TRACE_FUNC")&&(i=!0)}},it=e=>{(typeof Ce.trace>"u"?!Ce.wasm.trace:!Ce.trace)||Ti("BEGIN",e)},Xe=e=>{(typeof Ce.trace>"u"?!Ce.wasm.trace:!Ce.trace)||Ti("END",e)},Ot=e=>{(typeof Ce.trace>"u"?!Ce.wasm.trace:!Ce.trace)||console.time(`ORT::${e}`)},Mt=e=>{(typeof Ce.trace>"u"?!Ce.wasm.trace:!Ce.trace)||console.timeEnd(`ORT::${e}`)}}),ep,qg=q(()=>{Ud(),Yd(),Jd(),ep=class tp{constructor(t){this.handler=t}async run(t,r,i){it(),Ot("InferenceSession.run");let a={},n={};if(typeof t!="object"||t===null||t instanceof Ie||Array.isArray(t))throw new TypeError("'feeds' must be an object that use input names as keys and OnnxValue as corresponding values.");let s=!0;if(typeof r=="object"){if(r===null)throw new TypeError("Unexpected argument[1]: cannot be null.");if(r instanceof Ie)throw new TypeError("'fetches' cannot be a Tensor");if(Array.isArray(r)){if(r.length===0)throw new TypeError("'fetches' cannot be an empty array.");s=!1;for(let p of r){if(typeof p!="string")throw new TypeError("'fetches' must be a string array or an object.");if(this.outputNames.indexOf(p)===-1)throw new RangeError(`'fetches' contains invalid output name: ${p}.`);a[p]=null}if(typeof i=="object"&&i!==null)n=i;else if(typeof i<"u")throw new TypeError("'options' must be an object.")}else{let p=!1,h=Object.getOwnPropertyNames(r);for(let f of this.outputNames)if(h.indexOf(f)!==-1){let g=r[f];(g===null||g instanceof Ie)&&(p=!0,s=!1,a[f]=g)}if(p){if(typeof i=="object"&&i!==null)n=i;else if(typeof i<"u")throw new TypeError("'options' must be an object.")}else n=r}}else if(typeof r<"u")throw new TypeError("Unexpected argument[1]: must be 'fetches' or 'options'.");for(let p of this.inputNames)if(typeof t[p]>"u")throw new Error(`input '${p}' is missing in 'feeds'.`);if(s)for(let p of this.outputNames)a[p]=null;let u=await this.handler.run(t,a,n),l={};for(let p in u)if(Object.hasOwnProperty.call(u,p)){let h=u[p];h instanceof Ie?l[p]=h:l[p]=new Ie(h.type,h.data,h.dims)}return Mt("InferenceSession.run"),Xe(),l}async release(){return this.handler.dispose()}static async create(t,r,i,a){it(),Ot("InferenceSession.create");let n,s={};if(typeof t=="string"){if(n=t,typeof r=="object"&&r!==null)s=r;else if(typeof r<"u")throw new TypeError("'options' must be an object.")}else if(t instanceof Uint8Array){if(n=t,typeof r=="object"&&r!==null)s=r;else if(typeof r<"u")throw new TypeError("'options' must be an object.")}else if(t instanceof ArrayBuffer||typeof SharedArrayBuffer<"u"&&t instanceof SharedArrayBuffer){let h=t,f=0,g=t.byteLength;if(typeof r=="object"&&r!==null)s=r;else if(typeof r=="number"){if(f=r,!Number.isSafeInteger(f))throw new RangeError("'byteOffset' must be an integer.");if(f<0||f>=h.byteLength)throw new RangeError(`'byteOffset' is out of range [0, ${h.byteLength}).`);if(g=t.byteLength-f,typeof i=="number"){if(g=i,!Number.isSafeInteger(g))throw new RangeError("'byteLength' must be an integer.");if(g<=0||f+g>h.byteLength)throw new RangeError(`'byteLength' is out of range (0, ${h.byteLength-f}].`);if(typeof a=="object"&&a!==null)s=a;else if(typeof a<"u")throw new TypeError("'options' must be an object.")}else if(typeof i<"u")throw new TypeError("'byteLength' must be a number.")}else if(typeof r<"u")throw new TypeError("'options' must be an object.");n=new Uint8Array(h,f,g)}else throw new TypeError("Unexpected argument[0]: must be 'path' or 'buffer'.");let[u,l]=await Pd(s),p=await u.createInferenceSessionHandler(n,l);return Mt("InferenceSession.create"),Xe(),new tp(p)}startProfiling(){this.handler.startProfiling()}endProfiling(){this.handler.endProfiling()}get inputNames(){return this.handler.inputNames}get outputNames(){return this.handler.outputNames}get inputMetadata(){return this.handler.inputMetadata}get outputMetadata(){return this.handler.outputMetadata}}}),Vr,Lg=q(()=>{qg(),Vr=ep}),Gg=q(()=>{}),Vg=q(()=>{}),Hg=q(()=>{}),Fg=q(()=>{}),jg={};Ft(jg,{InferenceSession:()=>Vr,TRACE:()=>Gr,TRACE_EVENT_BEGIN:()=>Ot,TRACE_EVENT_END:()=>Mt,TRACE_FUNC_BEGIN:()=>it,TRACE_FUNC_END:()=>Xe,Tensor:()=>Ie,env:()=>_e,registerBackend:()=>Lt});var Le=q(()=>{Rg(),Dg(),Lg(),Yd(),Gg(),Vg(),Jd(),Hg(),Fg()}),Pa=q(()=>{}),rp={};Ft(rp,{default:()=>ip});var Ei,Ii,ip,Kg=q(()=>{lf(),Nt(),Ua(),Ei="ort-wasm-proxy-worker",Ii=globalThis.self?.name===Ei,Ii&&(self.onmessage=e=>{let{type:t,in:r}=e.data;try{switch(t){case"init-wasm":Wa(r.wasm).then(()=>{an(r).then(()=>{postMessage({type:t})},i=>{postMessage({type:t,err:i})})},i=>{postMessage({type:t,err:i})});break;case"init-ep":{let{epName:i,env:a}=r;nn(a,i).then(()=>{postMessage({type:t})},n=>{postMessage({type:t,err:n})});break}case"copy-from":{let{buffer:i}=r,a=Qr(i);postMessage({type:t,out:a});break}case"create":{let{model:i,options:a}=r;sn(i,a).then(n=>{postMessage({type:t,out:n})},n=>{postMessage({type:t,err:n})});break}case"release":on(r),postMessage({type:t});break;case"run":{let{sessionId:i,inputIndices:a,inputs:n,outputIndices:s,options:u}=r;un(i,a,n,s,new Array(s.length).fill(null),u).then(l=>{l.some(p=>p[3]!=="cpu")?postMessage({type:t,err:"Proxy does not support non-cpu tensor location."}):postMessage({type:t,out:l},dn([...n,...l]))},l=>{postMessage({type:t,err:l})});break}case"end-profiling":ln(r),postMessage({type:t});break;default:}}catch(i){postMessage({type:t,err:i})}}),ip=Ii?null:e=>new Worker(e??Ne,{type:"module",name:Ei})}),ap={};Ft(ap,{default:()=>np});async function ao(e={}){var t=e,r=!!globalThis.window,i=!!globalThis.WorkerGlobalScope,a=i&&self.name?.startsWith("em-pthread");t.mountExternalData=(o,d)=>{o.startsWith("./")&&(o=o.substring(2)),(t.Xc||(t.Xc=new Map)).set(o,d)},t.unmountExternalData=()=>{delete t.Xc},globalThis.SharedArrayBuffer??new WebAssembly.Memory({initial:0,maximum:0,shared:!0}).buffer.constructor;let n=o=>async(...d)=>{try{if(t.Yc)throw Error("Session already started");let m=t.Yc={Kd:d[0],errors:[]},c=await o(...d);if(t.Yc!==m)throw Error("Session mismatch");t.dd?.flush();let $=m.errors;if(0<$.length){let E=await Promise.all($);if(E=E.filter(C=>C),0<E.length)throw Error(E.join(`
`))}return c}finally{t.Yc=null}};t.jsepInit=(o,d)=>{if(o==="webgpu"){[t.dd,t.Ad,t.Ed,t.ed,t.Dd,t.$b,t.Fd,t.Hd,t.Bd,t.Cd,t.Gd]=d;let m=t.dd;t.jsepRegisterBuffer=(c,$,E,C)=>m.registerBuffer(c,$,E,C),t.jsepGetBuffer=c=>m.getBuffer(c),t.jsepCreateDownloader=(c,$,E)=>m.createDownloader(c,$,E),t.jsepOnCreateSession=c=>{m.onCreateSession(c)},t.jsepOnReleaseSession=c=>{m.onReleaseSession(c)},t.jsepOnRunStart=c=>m.onRunStart(c),t.Id=(c,$)=>{m.upload(c,$)}}else if(o==="webnn"){let m=d[0];[t.Wd,t.sd,t.webnnEnsureTensor,t.td,t.webnnDownloadTensor,t.Rd,t.webnnEnableTraceEvent]=d.slice(1),t.webnnReleaseTensorId=t.sd,t.webnnUploadTensor=t.td,t.webnnRegisterMLContext=t.Rd,t.webnnOnRunStart=c=>m.onRunStart(c),t.webnnOnRunEnd=m.onRunEnd.bind(m),t.webnnOnReleaseSession=c=>{m.onReleaseSession(c)},t.webnnCreateMLTensorDownloader=(c,$)=>m.createMLTensorDownloader(c,$),t.webnnRegisterMLTensor=(c,$,E,C)=>m.registerMLTensor(c,$,E,C),t.webnnCreateMLContext=c=>m.createMLContext(c),t.webnnRegisterMLConstant=(c,$,E,C,B,L)=>m.registerMLConstant(c,$,E,C,B,t.Xc,L),t.webnnRegisterGraphInput=m.registerGraphInput.bind(m),t.webnnIsGraphInput=m.isGraphInput.bind(m),t.webnnRegisterGraphOutput=m.registerGraphOutput.bind(m),t.webnnIsGraphOutput=m.isGraphOutput.bind(m),t.webnnCreateTemporaryTensor=m.createTemporaryTensor.bind(m),t.webnnIsGraphInputOutputTypeSupported=m.isGraphInputOutputTypeSupported.bind(m)}};let s=()=>{let o=d=>(...m)=>{let c=Je;return m=d(...m),Je!=c?new Promise(($,E)=>{pi={resolve:$,reject:E}}):m};(()=>{for(let d of["_OrtAppendExecutionProvider","_OrtCreateSession","_OrtRun","_OrtRunWithBinding","_OrtBindInput"])t[d]=o(t[d])})(),n!==void 0&&(t._OrtRun=n(t._OrtRun),t._OrtRunWithBinding=n(t._OrtRunWithBinding)),s=void 0};t.asyncInit=()=>{s?.()};var u,l,p=(o,d)=>{throw d},h=import.meta.url,f="";if(r||i){try{f=new URL(".",h).href}catch{}i&&(l=o=>{var d=new XMLHttpRequest;return d.open("GET",o,!1),d.responseType="arraybuffer",d.send(null),new Uint8Array(d.response)}),u=async o=>{if(z(o))return new Promise((m,c)=>{var $=new XMLHttpRequest;$.open("GET",o,!0),$.responseType="arraybuffer",$.onload=()=>{$.status==200||$.status==0&&$.response?m($.response):c($.status)},$.onerror=c,$.send(null)});var d=await fetch(o,{credentials:"same-origin"});if(d.ok)return d.arrayBuffer();throw Error(d.status+" : "+d.url)}}var g,y,_,w,k,x,b=console.log.bind(console),T=console.error.bind(console),S=b,I=T,A=!1,z=o=>o.startsWith("file://");function v(){dt.buffer!=U.buffer&&W()}if(a){let o=function(d){try{var m=d.data,c=m.Sc;if(c==="load"){let $=[];self.onmessage=E=>$.push(E),x=()=>{postMessage({Sc:"loaded"});for(let E of $)o(E);self.onmessage=o};for(let E of m.xd)t[E]&&!t[E].proxy||(t[E]=(...C)=>{postMessage({Sc:"callHandler",wd:E,args:C})},E=="print"&&(S=t[E]),E=="printErr"&&(I=t[E]));dt=m.Od,W(),y=m.Pd,Oe(),Er()}else if(c==="run"){(function($){var E=(v(),P)[$+52>>>2>>>0];$=(v(),P)[$+56>>>2>>>0],hs(E,E-$),ue(E)})(m.Rc),gi(m.Rc,0,0,1,0,0),fn(),ui(m.Rc),N||(os(),N=!0);try{$f(m.Md,m.bd)}catch($){if($!="unwind")throw $}}else m.target!=="setimmediate"&&(c==="checkMailbox"?N&&wr():c&&(I(`worker: received unknown command ${c}`),I(m)))}catch($){throw us(),$}};var N=!1;self.onunhandledrejection=d=>{throw d.reason||d},self.onmessage=o}var U,Z,G,K,R,P,j,te,ee,re,ae,O=!1;function W(){var o=dt.buffer;t.HEAP8=U=new Int8Array(o),G=new Int16Array(o),t.HEAPU8=Z=new Uint8Array(o),K=new Uint16Array(o),t.HEAP32=R=new Int32Array(o),t.HEAPU32=P=new Uint32Array(o),j=new Float32Array(o),te=new Float64Array(o),ee=new BigInt64Array(o),re=new BigUint64Array(o)}function H(){O=!0,a?x():nt.sb()}function V(o){throw I(o="Aborted("+o+")"),A=!0,o=new WebAssembly.RuntimeError(o+". Build with -sASSERTIONS for more info."),k?.(o),o}function Ee(){return{a:{ma:Vm,gb:Gm,g:vf,J:xf,f:Sf,o:kf,h:Tf,ha:Ef,b:If,T:zf,Ha:wn,n:Cf,$:Sn,Xa:kn,Da:Tn,Fa:En,Ya:In,Va:zn,Oa:Cn,Ua:An,ka:On,Ea:Mn,Ba:Rn,Wa:Bn,Ca:Dn,bb:Af,ea:Of,wa:Mf,ua:Bf,da:Nf,O:Pf,H:Uf,va:Wf,_:jf,xa:Kf,Ra:Zf,za:Qf,Ia:Yf,sa:Jf,fa:em,Qa:ui,_a:tm,R:nm,r:dm,c:si,hb:pm,y:cm,M:hm,D:fm,l:mm,s:Vn,ib:gm,I:ym,S:_m,j:bm,u:wm,q:$m,k:vm,La:xm,Ma:Sm,Na:km,Ja:Kn,Ka:Zn,ta:Xn,db:Em,ab:zm,v:Cm,aa:Am,ga:Om,$a:Im,W:Mm,Za:Rm,Aa:Bm,F:Tm,U:Dm,la:kr,ya:Pm,fb:Nm,eb:Um,Sa:es,Ta:ts,Ga:ti,V:rs,ja:is,Pa:as,ia:ns,kb:Tg,na:$g,lb:kg,oa:wg,G:pg,d:Km,t:Fm,w:Hm,A:ag,mb:yg,K:ug,x:Qm,pa:_g,Y:vg,ba:gg,nb:mg,ob:fg,P:ng,qa:hg,pb:cg,N:lg,Z:bg,e:jm,B:Xm,m:Zm,jb:Eg,p:Jm,z:eg,C:Ym,E:tg,L:sg,qb:dg,Q:xg,ca:og,X:Sg,rb:ig,ra:rg,i:qm,a:dt,cb:ei}}}async function Oe(){function o(c,$){var E=nt=c.exports;c={};for(let[C,B]of Object.entries(E))typeof B=="function"?(E=rm(B),c[C]=E):c[C]=B;return nt=c,nt=(function(){var C=nt,B=F=>oe=>F(oe)>>>0,L=F=>()=>F()>>>0;return(C=Object.assign({},C)).tb=B(C.tb),C.Xb=L(C.Xb),C.Zb=B(C.Zb),C.lc=B(C.lc),C.mc=L(C.mc),C.qc=B(C.qc),C})(),cn.push(nt._b),ss=(c=nt).tb,os=c.ub,t._OrtInit=c.vb,t._OrtGetLastError=c.wb,t._OrtCreateSessionOptions=c.xb,t._OrtAppendExecutionProvider=c.yb,t._OrtAddFreeDimensionOverride=c.zb,t._OrtAddSessionConfigEntry=c.Ab,t._OrtReleaseSessionOptions=c.Bb,t._OrtCreateSession=c.Cb,t._OrtReleaseSession=c.Db,t._OrtGetInputOutputCount=c.Eb,t._OrtGetInputOutputMetadata=c.Fb,t._OrtFree=c.Gb,t._OrtCreateTensor=c.Hb,t._OrtGetTensorData=c.Ib,t._OrtReleaseTensor=c.Jb,t._OrtCreateRunOptions=c.Kb,t._OrtAddRunConfigEntry=c.Lb,t._OrtReleaseRunOptions=c.Mb,t._OrtCreateBinding=c.Nb,t._OrtBindInput=c.Ob,t._OrtBindOutput=c.Pb,t._OrtClearBoundOutputs=c.Qb,t._OrtReleaseBinding=c.Rb,t._OrtRunWithBinding=c.Sb,t._OrtRun=c.Tb,t._OrtEndProfiling=c.Ub,t._JsepOutput=c.Vb,t._JsepGetNodeName=c.Wb,Tr=c.Xb,et=t._free=c.Yb,Zt=t._malloc=c.Zb,gi=c.ac,us=c.bc,ls=c.cc,ds=c.dc,yi=c.ec,ps=c.fc,cs=c.gc,de=c.hc,Xt=c.ic,hs=c.jc,ue=c.kc,_i=c.lc,le=c.mc,fs=c.nc,bi=c.oc,ms=c.pc,gs=c.qc,ys=c.rc,wi=c.sc,_s=c.tc,bs=c.uc,ws=c.vc,$s=c.wc,vs=c.xc,xs=c.yc,Ss=c.zc,ks=c.Ac,Ts=c.Bc,Es=c.Cc,Is=c.Dc,zs=c.Ec,Cs=c.Fc,As=c.Gc,Os=c.Hc,Ms=c.Ic,Rs=c.Jc,Bs=c.Kc,Ds=c.Lc,Ns=c.Mc,Ps=c.Nc,Us=c.Pc,Ws=c.Qc,qs=c.$c,Ls=c.ad,Gs=c.fd,Vs=c.jd,Hs=c.kd,Fs=c.ld,js=c.md,Ks=c.nd,Zs=c.od,Xs=c.pd,Qs=c.qd,Ys=c.vd,Js=c.Sd,eo=c.Td,to=c.Ud,ro=c.Vd,y=$,nt}var d,m=Ee();return t.instantiateWasm?new Promise(c=>{t.instantiateWasm(m,($,E)=>{c(o($,E))})}):a?o(new WebAssembly.Instance(y,Ee()),y):(ae??=t.locateFile?t.locateFile?t.locateFile("ort-wasm-simd-threaded.jsep.wasm",f):f+"ort-wasm-simd-threaded.jsep.wasm":new URL("/assets/ort-wasm-simd-threaded.jsep-CyqnNavA.wasm",import.meta.url).href,d=await(async function(c){var $=ae;if(!g&&!z($))try{var E=fetch($,{credentials:"same-origin"});return await WebAssembly.instantiateStreaming(E,c)}catch(C){I(`wasm streaming compile failed: ${C}`),I("falling back to ArrayBuffer instantiation")}return(async function(C,B){try{var L=await(async function(F){if(!g)try{var oe=await u(F);return new Uint8Array(oe)}catch{}if(F==ae&&g)F=new Uint8Array(g);else{if(!l)throw"both async and sync fetching of the wasm failed";F=l(F)}return F})(C);return await WebAssembly.instantiate(L,B)}catch(F){I(`failed to asynchronously prepare wasm: ${F}`),V(F)}})($,c)})(m),o(d.instance,d.module))}class ve{name="ExitStatus";constructor(d){this.message=`Program terminated with exit(${d})`,this.status=d}}var Me=o=>{o.terminate(),o.onmessage=()=>{}},ge=[],$e=0,Be=null,mr=o=>{lt.length==0&&(gn(),mn(lt[0]));var d=lt.pop();if(!d)return 6;jt.push(d),wt[o.Rc]=d,d.Rc=o.Rc;var m={Sc:"run",Md:o.Ld,bd:o.bd,Rc:o.Rc};return d.postMessage(m,o.rd),0},Qe=0,xe=(o,d,...m)=>{var c,$=16*m.length,E=le(),C=_i($),B=C>>>3;for(c of m)typeof c=="bigint"?((v(),ee)[B++>>>0]=1n,(v(),ee)[B++>>>0]=c):((v(),ee)[B++>>>0]=0n,(v(),te)[B++>>>0]=c);return o=ls(o,0,$,C,d),ue(E),o};function ei(o){if(a)return xe(0,1,o);if(_=o,!(0<Qe)){for(var d of jt)Me(d);for(d of lt)Me(d);lt=[],jt=[],wt={},A=!0}p(0,new ve(o))}function pn(o){if(a)return xe(1,0,o);ti(o)}var ti=o=>{if(_=o,a)throw pn(o),"unwind";ei(o)},lt=[],jt=[],cn=[],wt={},hn=o=>{var d=o.Rc;delete wt[d],lt.push(o),jt.splice(jt.indexOf(o),1),o.Rc=0,ds(d)};function fn(){cn.forEach(o=>o())}var mn=o=>new Promise(d=>{o.onmessage=$=>{var E=$.data;if($=E.Sc,E.Zc&&E.Zc!=Tr()){var C=wt[E.Zc];C?C.postMessage(E,E.rd):I(`Internal error! Worker sent a message "${$}" to target pthread ${E.Zc}, but that thread no longer exists!`)}else $==="checkMailbox"?wr():$==="spawnThread"?mr(E):$==="cleanupThread"?br(()=>{hn(wt[E.Nd])}):$==="loaded"?(o.loaded=!0,d(o)):E.target==="setimmediate"?o.postMessage(E):$==="uncaughtException"?o.onerror(E.error):$==="callHandler"?t[E.wd](...E.args):$&&I(`worker sent an unknown command ${$}`)},o.onerror=$=>{throw I(`worker sent an error! ${$.filename}:${$.lineno}: ${$.message}`),$};var m,c=[];for(m of[])t.propertyIsEnumerable(m)&&c.push(m);o.postMessage({Sc:"load",xd:c,Od:dt,Pd:y})});function gn(){var o=new Worker((()=>{let d=URL;return import.meta.url>"file:"&&import.meta.url<"file;"?new d("ort.bundle.min.mjs",import.meta.url):new URL(import.meta.url)})(),{type:"module",workerData:"em-pthread",name:"em-pthread"});lt.push(o)}var dt,$f=(o,d)=>{Qe=0,o=wi(o,d),0<Qe?_=o:yi(o)},gr=[],yr=0;function vf(o){var d=new ri(o>>>=0);return(v(),U)[d.Tc+12>>>0]==0&&(yn(d,!0),yr--),_n(d,!1),gr.push(d),gs(o)}var Ut=0,xf=()=>{de(0,0);var o=gr.pop();fs(o.cd),Ut=0};function yn(o,d){d=d?1:0,(v(),U)[o.Tc+12>>>0]=d}function _n(o,d){d=d?1:0,(v(),U)[o.Tc+13>>>0]=d}class ri{constructor(d){this.cd=d,this.Tc=d-24}}var ii=o=>{var d=Ut;if(!d)return Xt(0),0;var m=new ri(d);(v(),P)[m.Tc+16>>>2>>>0]=d;var c=(v(),P)[m.Tc+4>>>2>>>0];if(!c)return Xt(0),d;for(var $ of o){if($===0||$===c)break;if(ms($,c,m.Tc+16))return Xt($),d}return Xt(c),d};function Sf(){return ii([])}function kf(o){return ii([o>>>0])}function Tf(o,d,m,c){return ii([o>>>0,d>>>0,m>>>0,c>>>0])}var Ef=()=>{var o=gr.pop();o||V("no exception to throw");var d=o.cd;throw(v(),U)[o.Tc+13>>>0]==0&&(gr.push(o),_n(o,!0),yn(o,!1),yr++),bi(d),Ut=d};function If(o,d,m){var c=new ri(o>>>=0);throw d>>>=0,m>>>=0,(v(),P)[c.Tc+16>>>2>>>0]=0,(v(),P)[c.Tc+4>>>2>>>0]=d,(v(),P)[c.Tc+8>>>2>>>0]=m,bi(o),yr++,Ut=o}var zf=()=>yr;function bn(o,d,m,c){return a?xe(2,1,o,d,m,c):wn(o,d,m,c)}function wn(o,d,m,c){if(o>>>=0,d>>>=0,m>>>=0,c>>>=0,!globalThis.SharedArrayBuffer)return 6;var $=[];return a&&$.length===0?bn(o,d,m,c):(o={Ld:m,Rc:o,bd:c,rd:$},a?(o.Sc="spawnThread",postMessage(o,$),0):mr(o))}function Cf(o){throw Ut||=o>>>0,Ut}var $n=globalThis.TextDecoder&&new TextDecoder,vn=(o,d,m,c)=>{if(m=d+m,c)return m;for(;o[d]&&!(d>=m);)++d;return d},xn=(o,d=0,m,c)=>{if(16<(m=vn(o,d>>>=0,m,c))-d&&o.buffer&&$n)return $n.decode(o.buffer instanceof ArrayBuffer?o.subarray(d,m):o.slice(d,m));for(c="";d<m;){var $=o[d++];if(128&$){var E=63&o[d++];if((224&$)==192)c+=String.fromCharCode((31&$)<<6|E);else{var C=63&o[d++];65536>($=(240&$)==224?(15&$)<<12|E<<6|C:(7&$)<<18|E<<12|C<<6|63&o[d++])?c+=String.fromCharCode($):($-=65536,c+=String.fromCharCode(55296|$>>10,56320|1023&$))}}else c+=String.fromCharCode($)}return c},Te=(o,d,m)=>(o>>>=0)?xn((v(),Z),o,d,m):"";function Sn(o,d,m){return a?xe(3,1,o,d,m):0}function kn(o,d){if(a)return xe(4,1,o,d)}function Tn(o,d){if(a)return xe(5,1,o,d)}function En(o,d,m){if(a)return xe(6,1,o,d,m)}function In(o,d,m){return a?xe(7,1,o,d,m):0}function zn(o,d){if(a)return xe(8,1,o,d)}function Cn(o,d,m){if(a)return xe(9,1,o,d,m)}function An(o,d,m,c){if(a)return xe(10,1,o,d,m,c)}function On(o,d,m,c){if(a)return xe(11,1,o,d,m,c)}function Mn(o,d,m,c){if(a)return xe(12,1,o,d,m,c)}function Rn(o){if(a)return xe(13,1,o)}function Bn(o,d){if(a)return xe(14,1,o,d)}function Dn(o,d,m){if(a)return xe(15,1,o,d,m)}var Af=()=>V(""),Ye=o=>{o>>>=0;for(var d="";;){var m=(v(),Z)[o++>>>0];if(!m)return d;d+=String.fromCharCode(m)}},ai={},ni={},Wt=class extends Error{constructor(o){super(o),this.name="BindingError"}};function at(o,d,m={}){return(function(c,$,E={}){var C=$.name;if(!c)throw new Wt(`type "${C}" must have a positive integer typeid pointer`);if(ni.hasOwnProperty(c)){if(E.yd)return;throw new Wt(`Cannot register type '${C}' twice`)}ni[c]=$,ai.hasOwnProperty(c)&&($=ai[c],delete ai[c],$.forEach(B=>B()))})(o,d,m)}var Nn=(o,d,m)=>{switch(d){case 1:return m?c=>(v(),U)[c>>>0]:c=>(v(),Z)[c>>>0];case 2:return m?c=>(v(),G)[c>>>1>>>0]:c=>(v(),K)[c>>>1>>>0];case 4:return m?c=>(v(),R)[c>>>2>>>0]:c=>(v(),P)[c>>>2>>>0];case 8:return m?c=>(v(),ee)[c>>>3>>>0]:c=>(v(),re)[c>>>3>>>0];default:throw new TypeError(`invalid integer width (${d}): ${o}`)}};function Of(o,d,m,c,$){o>>>=0,m>>>=0,d=Ye(d>>>0);let E=C=>C;if(c=c===0n){let C=8*m;E=B=>BigInt.asUintN(C,B),$=E($)}at(o,{name:d,Oc:E,Vc:(C,B)=>(typeof B=="number"&&(B=BigInt(B)),B),Uc:Nn(d,m,!c),Wc:null})}function Mf(o,d,m,c){at(o>>>=0,{name:d=Ye(d>>>0),Oc:function($){return!!$},Vc:function($,E){return E?m:c},Uc:function($){return this.Oc((v(),Z)[$>>>0])},Wc:null})}var Pn=[],$t=[0,1,,1,null,1,!0,1,!1,1];function si(o){9<(o>>>=0)&&--$t[o+1]==0&&($t[o]=void 0,Pn.push(o))}var We=o=>{if(!o)throw new Wt(`Cannot use deleted val. handle = ${o}`);return $t[o]},Ge=o=>{switch(o){case void 0:return 2;case null:return 4;case!0:return 6;case!1:return 8;default:let d=Pn.pop()||$t.length;return $t[d]=o,$t[d+1]=1,d}};function oi(o){return this.Oc((v(),P)[o>>>2>>>0])}var Rf={name:"emscripten::val",Oc:o=>{var d=We(o);return si(o),d},Vc:(o,d)=>Ge(d),Uc:oi,Wc:null};function Bf(o){return at(o>>>0,Rf)}var Df=(o,d)=>{switch(d){case 4:return function(m){return this.Oc((v(),j)[m>>>2>>>0])};case 8:return function(m){return this.Oc((v(),te)[m>>>3>>>0])};default:throw new TypeError(`invalid float width (${d}): ${o}`)}};function Nf(o,d,m){m>>>=0,at(o>>>=0,{name:d=Ye(d>>>0),Oc:c=>c,Vc:(c,$)=>$,Uc:Df(d,m),Wc:null})}function Pf(o,d,m,c,$){o>>>=0,m>>>=0,d=Ye(d>>>0);let E=B=>B;if(c===0){var C=32-8*m;E=B=>B<<C>>>C,$=E($)}at(o,{name:d,Oc:E,Vc:(B,L)=>L,Uc:Nn(d,m,c!==0),Wc:null})}function Uf(o,d,m){function c(E){var C=(v(),P)[E>>>2>>>0];return E=(v(),P)[E+4>>>2>>>0],new $((v(),U).buffer,E,C)}var $=[Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array,BigInt64Array,BigUint64Array][d];at(o>>>=0,{name:m=Ye(m>>>0),Oc:c,Uc:c},{yd:!0})}var pt=(o,d,m)=>{var c=(v(),Z);if(d>>>=0,0<m){var $=d;m=d+m-1;for(var E=0;E<o.length;++E){var C=o.codePointAt(E);if(127>=C){if(d>=m)break;c[d++>>>0]=C}else if(2047>=C){if(d+1>=m)break;c[d++>>>0]=192|C>>6,c[d++>>>0]=128|63&C}else if(65535>=C){if(d+2>=m)break;c[d++>>>0]=224|C>>12,c[d++>>>0]=128|C>>6&63,c[d++>>>0]=128|63&C}else{if(d+3>=m)break;c[d++>>>0]=240|C>>18,c[d++>>>0]=128|C>>12&63,c[d++>>>0]=128|C>>6&63,c[d++>>>0]=128|63&C,E++}}c[d>>>0]=0,o=d-$}else o=0;return o},_r=o=>{for(var d=0,m=0;m<o.length;++m){var c=o.charCodeAt(m);127>=c?d++:2047>=c?d+=2:55296<=c&&57343>=c?(d+=4,++m):d+=3}return d};function Wf(o,d){at(o>>>=0,{name:d=Ye(d>>>0),Oc(m){var c=(v(),P)[m>>>2>>>0];return c=Te(m+4,c,!0),et(m),c},Vc(m,c){c instanceof ArrayBuffer&&(c=new Uint8Array(c));var $=typeof c=="string";if(!($||ArrayBuffer.isView(c)&&c.BYTES_PER_ELEMENT==1))throw new Wt("Cannot pass non-string to std::string");var E=$?_r(c):c.length,C=Zt(4+E+1),B=C+4;return(v(),P)[C>>>2>>>0]=E,$?pt(c,B,E+1):(v(),Z).set(c,B>>>0),m!==null&&m.push(et,C),C},Uc:oi,Wc(m){et(m)}})}var Un=globalThis.TextDecoder?new TextDecoder("utf-16le"):void 0,qf=(o,d,m)=>{if(o>>>=1,16<(d=vn((v(),K),o,d/2,m))-o&&Un)return Un.decode((v(),K).slice(o,d));for(m="";o<d;++o){var c=(v(),K)[o>>>0];m+=String.fromCharCode(c)}return m},Lf=(o,d,m)=>{if(m??=2147483647,2>m)return 0;var c=d;m=(m-=2)<2*o.length?m/2:o.length;for(var $=0;$<m;++$){var E=o.charCodeAt($);(v(),G)[d>>>1>>>0]=E,d+=2}return(v(),G)[d>>>1>>>0]=0,d-c},Gf=o=>2*o.length,Vf=(o,d,m)=>{var c="";o>>>=2;for(var $=0;!($>=d/4);$++){var E=(v(),P)[o+$>>>0];if(!E&&!m)break;c+=String.fromCodePoint(E)}return c},Hf=(o,d,m)=>{if(d>>>=0,m??=2147483647,4>m)return 0;var c=d;m=c+m-4;for(var $=0;$<o.length;++$){var E=o.codePointAt($);if(65535<E&&$++,(v(),R)[d>>>2>>>0]=E,(d+=4)+4>m)break}return(v(),R)[d>>>2>>>0]=0,d-c},Ff=o=>{for(var d=0,m=0;m<o.length;++m)65535<o.codePointAt(m)&&m++,d+=4;return d};function jf(o,d,m){if(o>>>=0,d>>>=0,m=Ye(m>>>=0),d===2)var c=qf,$=Lf,E=Gf;else c=Vf,$=Hf,E=Ff;at(o,{name:m,Oc:C=>{var B=(v(),P)[C>>>2>>>0];return B=c(C+4,B*d,!0),et(C),B},Vc:(C,B)=>{if(typeof B!="string")throw new Wt(`Cannot pass non-string to C++ string type ${m}`);var L=E(B),F=Zt(4+L+d);return(v(),P)[F>>>2>>>0]=L/d,$(B,F+4,L+d),C!==null&&C.push(et,F),F},Uc:oi,Wc(C){et(C)}})}function Kf(o,d){at(o>>>=0,{zd:!0,name:d=Ye(d>>>0),Oc:()=>{},Vc:()=>{}})}function Zf(o){gi(o>>>0,!i,1,!r,131072,!1),fn()}var br=o=>{if(!A)try{if(o(),!(0<Qe))try{a?Tr()&&yi(_):ti(_)}catch(d){d instanceof ve||d=="unwind"||p(0,d)}}catch(d){d instanceof ve||d=="unwind"||p(0,d)}},Xf=!Atomics.waitAsync||globalThis.navigator?.userAgent&&91>Number((navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)||[])[2]);function ui(o){o>>>=0,Xf||(Atomics.waitAsync((v(),R),o>>>2,o).value.then(wr),o+=128,Atomics.store((v(),R),o>>>2,1))}var wr=()=>br(()=>{var o=Tr();o&&(ui(o),cs())});function Qf(o,d){(o>>>=0)==d>>>0?setTimeout(wr):a?postMessage({Zc:o,Sc:"checkMailbox"}):(o=wt[o])&&o.postMessage({Sc:"checkMailbox"})}var li=[];function Yf(o,d,m,c,$){for(d>>>=0,$>>>=0,li.length=0,m=$>>>3,c=$+c>>>3;m<c;){var E;E=(v(),ee)[m++>>>0]?(v(),ee)[m++>>>0]:(v(),te)[m++>>>0],li.push(E)}return(d?$i[d]:Lm[o])(...li)}var Jf=()=>{Qe=0};function em(o){o>>>=0,a?postMessage({Sc:"cleanupThread",Nd:o}):hn(wt[o])}function tm(o){}var $r=o=>{try{o()}catch(d){V(d)}};function rm(o){var d=(...m)=>{vr.push(o);try{return o(...m)}finally{A||(vr.pop(),Je&&ct===1&&vr.length===0&&(ct=0,Qe+=1,$r(eo),typeof Fibers<"u"&&Fibers.Zd()))}};return Ln.set(o,d),d}var ct=0,Je=null,Wn=0,vr=[],di=new Map,qn=new Map,Ln=new Map,im=0,pi=null,am=[],Gn=o=>(function(d){if(!A){if(ct===0){var m=!1,c=!1;d(($=0)=>{if(!A&&(Wn=$,m=!0,c)){ct=2,$r(()=>to(Je)),typeof MainLoop<"u"&&MainLoop.ud&&MainLoop.resume(),$=!1;try{var E=(function(){var L=(v(),R)[Je+8>>>2>>>0];return L=qn.get(L),L=Ln.get(L),--Qe,L()})()}catch(L){E=L,$=!0}var C=!1;if(!Je){var B=pi;B&&(pi=null,($?B.reject:B.resolve)(E),C=!0)}if($&&!C)throw E}}),c=!0,m||(ct=1,Je=(function(){var $=Zt(65548),E=$+12;if((v(),P)[$>>>2>>>0]=E,(v(),P)[$+4>>>2>>>0]=E+65536,E=vr[0],!di.has(E)){var C=im++;di.set(E,C),qn.set(C,E)}return E=di.get(E),(v(),R)[$+8>>>2>>>0]=E,$})(),typeof MainLoop<"u"&&MainLoop.ud&&MainLoop.pause(),$r(()=>Js(Je)))}else ct===2?(ct=0,$r(ro),et(Je),Je=null,am.forEach(br)):V(`invalid state: ${ct}`);return Wn}})(d=>{o().then(d)});function nm(o){return o>>>=0,Gn(async()=>{var d=await We(o);return Ge(d)})}var ci=[],sm=o=>{var d=ci.length;return ci.push(o),d},om=(o,d)=>{for(var m=Array(o),c=0;c<o;++c){var $=c,E=(v(),P)[d+4*c>>>2>>>0],C=ni[E];if(C===void 0)throw o=`parameter ${c}`,E=ss(E),d=Ye(E),et(E),new Wt(`${o} has unknown type ${d}`);m[$]=C}return m},um=(o,d,m)=>{var c=[];return o=o(c,m),c.length&&((v(),P)[d>>>2>>>0]=Ge(c)),o},lm={},xr=o=>{var d=lm[o];return d===void 0?Ye(o):d};function dm(o,d,m){var[c,...$]=om(o,d>>>0);d=c.Vc.bind(c);var E=$.map(L=>L.Uc.bind(L));o--;var C={toValue:We};switch(o=E.map((L,F)=>{var oe=`argFromPtr${F}`;return C[oe]=L,`${oe}(args${F?"+"+8*F:""})`}),m){case 0:var B="toValue(handle)";break;case 2:B="new (toValue(handle))";break;case 3:B="";break;case 1:C.getStringOrSymbol=xr,B="toValue(handle)[getStringOrSymbol(methodName)]"}return B+=`(${o})`,c.zd||(C.toReturnWire=d,C.emval_returnValue=um,B=`return emval_returnValue(toReturnWire, destructorsRef, ${B})`),B=`return function (handle, methodName, destructorsRef, args) {
  ${B}
  }`,m=new Function(Object.keys(C),B)(...Object.values(C)),B=`methodCaller<(${$.map(L=>L.name)}) => ${c.name}>`,sm(Object.defineProperty(m,"name",{value:B}))}function pm(o,d){return d>>>=0,(o=We(o>>>0))==We(d)}function cm(o){return(o>>>=0)?(o=xr(o),Ge(globalThis[o])):Ge(globalThis)}function hm(o){return o=xr(o>>>0),Ge(t[o])}function fm(o,d){return d>>>=0,o=We(o>>>0),d=We(d),Ge(o[d])}function mm(o){9<(o>>>=0)&&($t[o+1]+=1)}function Vn(o,d,m,c,$){return ci[o>>>0](d>>>0,m>>>0,c>>>0,$>>>0)}function gm(o,d,m,c,$){return Vn(o>>>0,d>>>0,m>>>0,c>>>0,$>>>0)}function ym(){return Ge([])}function _m(o){o=We(o>>>0);for(var d=Array(o.length),m=0;m<o.length;m++)d[m]=o[m];return Ge(d)}function bm(o){return Ge(xr(o>>>0))}function wm(){return Ge({})}function $m(o){for(var d=We(o>>>=0);d.length;){var m=d.pop();d.pop()(m)}si(o)}function vm(o,d,m){d>>>=0,m>>>=0,o=We(o>>>0),d=We(d),m=We(m),o[d]=m}function xm(o,d){o=-9007199254740992>o||9007199254740992<o?NaN:Number(o),d>>>=0,o=new Date(1e3*o),(v(),R)[d>>>2>>>0]=o.getUTCSeconds(),(v(),R)[d+4>>>2>>>0]=o.getUTCMinutes(),(v(),R)[d+8>>>2>>>0]=o.getUTCHours(),(v(),R)[d+12>>>2>>>0]=o.getUTCDate(),(v(),R)[d+16>>>2>>>0]=o.getUTCMonth(),(v(),R)[d+20>>>2>>>0]=o.getUTCFullYear()-1900,(v(),R)[d+24>>>2>>>0]=o.getUTCDay(),o=(o.getTime()-Date.UTC(o.getUTCFullYear(),0,1,0,0,0,0))/864e5|0,(v(),R)[d+28>>>2>>>0]=o}var Hn=o=>o%4==0&&(o%100!=0||o%400==0),Fn=[0,31,60,91,121,152,182,213,244,274,305,335],jn=[0,31,59,90,120,151,181,212,243,273,304,334];function Sm(o,d){o=-9007199254740992>o||9007199254740992<o?NaN:Number(o),d>>>=0,o=new Date(1e3*o),(v(),R)[d>>>2>>>0]=o.getSeconds(),(v(),R)[d+4>>>2>>>0]=o.getMinutes(),(v(),R)[d+8>>>2>>>0]=o.getHours(),(v(),R)[d+12>>>2>>>0]=o.getDate(),(v(),R)[d+16>>>2>>>0]=o.getMonth(),(v(),R)[d+20>>>2>>>0]=o.getFullYear()-1900,(v(),R)[d+24>>>2>>>0]=o.getDay();var m=(Hn(o.getFullYear())?Fn:jn)[o.getMonth()]+o.getDate()-1|0;(v(),R)[d+28>>>2>>>0]=m,(v(),R)[d+36>>>2>>>0]=-60*o.getTimezoneOffset(),m=new Date(o.getFullYear(),6,1).getTimezoneOffset();var c=new Date(o.getFullYear(),0,1).getTimezoneOffset();o=0|(m!=c&&o.getTimezoneOffset()==Math.min(c,m)),(v(),R)[d+32>>>2>>>0]=o}function km(o){o>>>=0;var d=new Date((v(),R)[o+20>>>2>>>0]+1900,(v(),R)[o+16>>>2>>>0],(v(),R)[o+12>>>2>>>0],(v(),R)[o+8>>>2>>>0],(v(),R)[o+4>>>2>>>0],(v(),R)[o>>>2>>>0],0),m=(v(),R)[o+32>>>2>>>0],c=d.getTimezoneOffset(),$=new Date(d.getFullYear(),6,1).getTimezoneOffset(),E=new Date(d.getFullYear(),0,1).getTimezoneOffset(),C=Math.min(E,$);return 0>m?(v(),R)[o+32>>>2>>>0]=+($!=E&&C==c):0<m!=(C==c)&&($=Math.max(E,$),d.setTime(d.getTime()+6e4*((0<m?C:$)-c))),(v(),R)[o+24>>>2>>>0]=d.getDay(),m=(Hn(d.getFullYear())?Fn:jn)[d.getMonth()]+d.getDate()-1|0,(v(),R)[o+28>>>2>>>0]=m,(v(),R)[o>>>2>>>0]=d.getSeconds(),(v(),R)[o+4>>>2>>>0]=d.getMinutes(),(v(),R)[o+8>>>2>>>0]=d.getHours(),(v(),R)[o+12>>>2>>>0]=d.getDate(),(v(),R)[o+16>>>2>>>0]=d.getMonth(),(v(),R)[o+20>>>2>>>0]=d.getYear(),o=d.getTime(),BigInt(isNaN(o)?-1:o/1e3)}function Kn(o,d,m,c,$,E,C){return a?xe(16,1,o,d,m,c,$,E,C):-52}function Zn(o,d,m,c,$,E){if(a)return xe(17,1,o,d,m,c,$,E)}var Kt={},Tm=()=>performance.timeOrigin+performance.now();function Xn(o,d){if(a)return xe(18,1,o,d);if(Kt[o]&&(clearTimeout(Kt[o].id),delete Kt[o]),!d)return 0;var m=setTimeout(()=>{delete Kt[o],br(()=>ps(o,performance.timeOrigin+performance.now()))},d);return Kt[o]={id:m,Yd:d},0}function Em(o,d,m,c){o>>>=0,d>>>=0,m>>>=0,c>>>=0;var $=new Date().getFullYear(),E=new Date($,0,1).getTimezoneOffset();$=new Date($,6,1).getTimezoneOffset();var C=Math.max(E,$);(v(),P)[o>>>2>>>0]=60*C,(v(),R)[d>>>2>>>0]=+(E!=$),o=(d=B=>{var L=Math.abs(B);return`UTC${0<=B?"-":"+"}${String(Math.floor(L/60)).padStart(2,"0")}${String(L%60).padStart(2,"0")}`})(E),d=d($),$<E?(pt(o,m,17),pt(d,c,17)):(pt(o,c,17),pt(d,m,17))}var Im=()=>Date.now();function zm(o,d,m){return m>>>=0,0<=o&&3>=o?(o===0?o=Date.now():o=performance.timeOrigin+performance.now(),o=Math.round(1e6*o),(v(),ee)[m>>>3>>>0]=BigInt(o),0):28}var hi=[],Qn=(o,d)=>{hi.length=0;for(var m;m=(v(),Z)[o++>>>0];){var c=m!=105;d+=(c&=m!=112)&&d%8?4:0,hi.push(m==112?(v(),P)[d>>>2>>>0]:m==106?(v(),ee)[d>>>3>>>0]:m==105?(v(),R)[d>>>2>>>0]:(v(),te)[d>>>3>>>0]),d+=c?8:4}return hi};function Cm(o,d,m){return o>>>=0,d=Qn(d>>>0,m>>>0),$i[o](...d)}function Am(o,d,m){return o>>>=0,d=Qn(d>>>0,m>>>0),$i[o](...d)}var Om=()=>{};function Mm(o,d){return I(Te(o>>>0,d>>>0))}var Rm=()=>{throw Qe+=1,"unwind"};function Bm(){return 4294901760}var Dm=()=>navigator.hardwareConcurrency,vt={},Sr=o=>{var d;return(d=/\bwasm-function\[\d+\]:(0x[0-9a-f]+)/.exec(o))?+d[1]:(d=/:(\d+):\d+(?:\)|$)/.exec(o))?2147483648|+d[1]:0},Yn=o=>{for(var d of o)(o=Sr(d))&&(vt[o]=d)};function Nm(){var o=Error().stack.toString().split(`
`);return o[0]=="Error"&&o.shift(),Yn(o),vt.gd=Sr(o[3]),vt.Jd=o,vt.gd}function kr(o){if(!(o=vt[o>>>0]))return 0;var d;if(d=/^\s+at .*\.wasm\.(.*) \(.*\)$/.exec(o))o=d[1];else if(d=/^\s+at (.*) \(.*\)$/.exec(o))o=d[1];else{if(!(d=/^(.+?)@/.exec(o)))return 0;o=d[1]}et(kr.hd??0),d=_r(o)+1;var m=Zt(d);return m&&pt(o,m,d),kr.hd=m,kr.hd}function Pm(o){o>>>=0;var d=(v(),Z).length;if(o<=d||4294901760<o)return!1;for(var m=1;4>=m;m*=2){var c=d*(1+.2/m);c=Math.min(c,o+100663296);e:{c=(Math.min(4294901760,65536*Math.ceil(Math.max(o,c)/65536))-dt.buffer.byteLength+65535)/65536|0;try{dt.grow(c),W();var $=1;break e}catch{}$=void 0}if($)return!0}return!1}function Um(o,d,m){if(o>>>=0,d>>>=0,vt.gd==o)var c=vt.Jd;else(c=Error().stack.toString().split(`
`))[0]=="Error"&&c.shift(),Yn(c);for(var $=3;c[$]&&Sr(c[$])!=o;)++$;for(o=0;o<m&&c[o+$];++o)(v(),R)[d+4*o>>>2>>>0]=Sr(c[o+$]);return o}var fi,mi={},Jn=()=>{if(!fi){var o,d={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:(globalThis.navigator?.language??"C").replace("-","_")+".UTF-8",_:"./this.program"};for(o in mi)mi[o]===void 0?delete d[o]:d[o]=mi[o];var m=[];for(o in d)m.push(`${o}=${d[o]}`);fi=m}return fi};function es(o,d){if(a)return xe(19,1,o,d);o>>>=0,d>>>=0;var m,c=0,$=0;for(m of Jn()){var E=d+c;(v(),P)[o+$>>>2>>>0]=E,c+=pt(m,E,1/0)+1,$+=4}return 0}function ts(o,d){if(a)return xe(20,1,o,d);o>>>=0,d>>>=0;var m=Jn();for(var c of((v(),P)[o>>>2>>>0]=m.length,o=0,m))o+=_r(c)+1;return(v(),P)[d>>>2>>>0]=o,0}function rs(o){return a?xe(21,1,o):52}function is(o,d,m,c){return a?xe(22,1,o,d,m,c):52}function as(o,d,m,c){return a?xe(23,1,o,d,m,c):70}var Wm=[null,[],[]];function ns(o,d,m,c){if(a)return xe(24,1,o,d,m,c);d>>>=0,m>>>=0,c>>>=0;for(var $=0,E=0;E<m;E++){var C=(v(),P)[d>>>2>>>0],B=(v(),P)[d+4>>>2>>>0];d+=8;for(var L=0;L<B;L++){var F=o,oe=(v(),Z)[C+L>>>0],ce=Wm[F];oe===0||oe===10?((F===1?S:I)(xn(ce)),ce.length=0):ce.push(oe)}$+=B}return(v(),P)[c>>>2>>>0]=$,0}function qm(o){return o>>>0}a||(function(){for(var o=t.numThreads-1;o--;)gn();ge.push(async()=>{var d=(async function(){if(!a)return Promise.all(lt.map(mn))})();$e++,await d,--$e==0&&Be&&(d=Be,Be=null,d())})})(),a||(dt=new WebAssembly.Memory({initial:256,maximum:65536,shared:!0}),W()),t.wasmBinary&&(g=t.wasmBinary),t.stackSave=()=>le(),t.stackRestore=o=>ue(o),t.stackAlloc=o=>_i(o),t.setValue=function(o,d,m="i8"){switch(m.endsWith("*")&&(m="*"),m){case"i1":case"i8":(v(),U)[o>>>0]=d;break;case"i16":(v(),G)[o>>>1>>>0]=d;break;case"i32":(v(),R)[o>>>2>>>0]=d;break;case"i64":(v(),ee)[o>>>3>>>0]=BigInt(d);break;case"float":(v(),j)[o>>>2>>>0]=d;break;case"double":(v(),te)[o>>>3>>>0]=d;break;case"*":(v(),P)[o>>>2>>>0]=d;break;default:V(`invalid type for setValue: ${m}`)}},t.getValue=function(o,d="i8"){switch(d.endsWith("*")&&(d="*"),d){case"i1":case"i8":return(v(),U)[o>>>0];case"i16":return(v(),G)[o>>>1>>>0];case"i32":return(v(),R)[o>>>2>>>0];case"i64":return(v(),ee)[o>>>3>>>0];case"float":return(v(),j)[o>>>2>>>0];case"double":return(v(),te)[o>>>3>>>0];case"*":return(v(),P)[o>>>2>>>0];default:V(`invalid type for getValue: ${d}`)}},t.UTF8ToString=Te,t.stringToUTF8=pt,t.lengthBytesUTF8=_r;var ss,os,Tr,et,Zt,gi,us,ls,ds,yi,ps,cs,de,Xt,hs,ue,_i,le,fs,bi,ms,gs,ys,wi,_s,bs,ws,$s,vs,xs,Ss,ks,Ts,Es,Is,zs,Cs,As,Os,Ms,Rs,Bs,Ds,Ns,Ps,Us,Ws,qs,Ls,Gs,Vs,Hs,Fs,js,Ks,Zs,Xs,Qs,Ys,Js,eo,to,ro,nt,Lm=[ei,pn,bn,Sn,kn,Tn,En,In,zn,Cn,An,On,Mn,Rn,Bn,Dn,Kn,Zn,Xn,es,ts,rs,is,as,ns],$i={973212:(o,d,m,c,$)=>{if(t===void 0||!t.Xc)return 1;if((o=Te(Number(o>>>0))).startsWith("./")&&(o=o.substring(2)),!(o=t.Xc.get(o)))return 2;if(d=Number(d>>>0),m=Number(m>>>0),c=Number(c>>>0),d+m>o.byteLength)return 3;try{let E=o.subarray(d,d+m);switch($){case 0:(v(),Z).set(E,c>>>0);break;case 1:t.Qd?t.Qd(c,E):t.Id(c,E);break;default:return 4}return 0}catch{return 4}},974036:(o,d,m)=>{t.td(o,(v(),Z).subarray(d>>>0,d+m>>>0))},974100:()=>t.Wd(),974142:o=>{t.sd(o)},974179:()=>{t.Bd()},974210:()=>{t.Cd()},974239:()=>{t.Gd()},974264:o=>t.Ad(o),974297:o=>t.Ed(o),974329:(o,d,m)=>{t.ed(Number(o),Number(d),Number(m),!0)},974392:(o,d,m)=>{t.ed(Number(o),Number(d),Number(m))},974449:()=>typeof wasmOffsetConverter<"u",974506:o=>{t.$b("Abs",o,void 0)},974557:o=>{t.$b("Neg",o,void 0)},974608:o=>{t.$b("Floor",o,void 0)},974661:o=>{t.$b("Ceil",o,void 0)},974713:o=>{t.$b("Reciprocal",o,void 0)},974771:o=>{t.$b("Sqrt",o,void 0)},974823:o=>{t.$b("Exp",o,void 0)},974874:o=>{t.$b("Erf",o,void 0)},974925:o=>{t.$b("Sigmoid",o,void 0)},974980:(o,d,m)=>{t.$b("HardSigmoid",o,{alpha:d,beta:m})},975059:o=>{t.$b("Log",o,void 0)},975110:o=>{t.$b("Sin",o,void 0)},975161:o=>{t.$b("Cos",o,void 0)},975212:o=>{t.$b("Tan",o,void 0)},975263:o=>{t.$b("Asin",o,void 0)},975315:o=>{t.$b("Acos",o,void 0)},975367:o=>{t.$b("Atan",o,void 0)},975419:o=>{t.$b("Sinh",o,void 0)},975471:o=>{t.$b("Cosh",o,void 0)},975523:o=>{t.$b("Asinh",o,void 0)},975576:o=>{t.$b("Acosh",o,void 0)},975629:o=>{t.$b("Atanh",o,void 0)},975682:o=>{t.$b("Tanh",o,void 0)},975734:o=>{t.$b("Not",o,void 0)},975785:(o,d,m)=>{t.$b("Clip",o,{min:d,max:m})},975854:o=>{t.$b("Clip",o,void 0)},975906:(o,d)=>{t.$b("Elu",o,{alpha:d})},975964:o=>{t.$b("Gelu",o,void 0)},976016:o=>{t.$b("Relu",o,void 0)},976068:(o,d)=>{t.$b("LeakyRelu",o,{alpha:d})},976132:(o,d)=>{t.$b("ThresholdedRelu",o,{alpha:d})},976202:(o,d)=>{t.$b("Cast",o,{to:d})},976260:o=>{t.$b("Add",o,void 0)},976311:o=>{t.$b("Sub",o,void 0)},976362:o=>{t.$b("Mul",o,void 0)},976413:o=>{t.$b("Div",o,void 0)},976464:o=>{t.$b("Pow",o,void 0)},976515:o=>{t.$b("Equal",o,void 0)},976568:o=>{t.$b("Greater",o,void 0)},976623:o=>{t.$b("GreaterOrEqual",o,void 0)},976685:o=>{t.$b("Less",o,void 0)},976737:o=>{t.$b("LessOrEqual",o,void 0)},976796:(o,d,m,c,$)=>{t.$b("ReduceMean",o,{keepDims:!!d,noopWithEmptyAxes:!!m,axes:c?Array.from((v(),R).subarray(Number(c)>>>0,Number($)>>>0)):[]})},976971:(o,d,m,c,$)=>{t.$b("ReduceMax",o,{keepDims:!!d,noopWithEmptyAxes:!!m,axes:c?Array.from((v(),R).subarray(Number(c)>>>0,Number($)>>>0)):[]})},977145:(o,d,m,c,$)=>{t.$b("ReduceMin",o,{keepDims:!!d,noopWithEmptyAxes:!!m,axes:c?Array.from((v(),R).subarray(Number(c)>>>0,Number($)>>>0)):[]})},977319:(o,d,m,c,$)=>{t.$b("ReduceProd",o,{keepDims:!!d,noopWithEmptyAxes:!!m,axes:c?Array.from((v(),R).subarray(Number(c)>>>0,Number($)>>>0)):[]})},977494:(o,d,m,c,$)=>{t.$b("ReduceSum",o,{keepDims:!!d,noopWithEmptyAxes:!!m,axes:c?Array.from((v(),R).subarray(Number(c)>>>0,Number($)>>>0)):[]})},977668:(o,d,m,c,$)=>{t.$b("ReduceL1",o,{keepDims:!!d,noopWithEmptyAxes:!!m,axes:c?Array.from((v(),R).subarray(Number(c)>>>0,Number($)>>>0)):[]})},977841:(o,d,m,c,$)=>{t.$b("ReduceL2",o,{keepDims:!!d,noopWithEmptyAxes:!!m,axes:c?Array.from((v(),R).subarray(Number(c)>>>0,Number($)>>>0)):[]})},978014:(o,d,m,c,$)=>{t.$b("ReduceLogSum",o,{keepDims:!!d,noopWithEmptyAxes:!!m,axes:c?Array.from((v(),R).subarray(Number(c)>>>0,Number($)>>>0)):[]})},978191:(o,d,m,c,$)=>{t.$b("ReduceSumSquare",o,{keepDims:!!d,noopWithEmptyAxes:!!m,axes:c?Array.from((v(),R).subarray(Number(c)>>>0,Number($)>>>0)):[]})},978371:(o,d,m,c,$)=>{t.$b("ReduceLogSumExp",o,{keepDims:!!d,noopWithEmptyAxes:!!m,axes:c?Array.from((v(),R).subarray(Number(c)>>>0,Number($)>>>0)):[]})},978551:o=>{t.$b("Where",o,void 0)},978604:(o,d,m)=>{t.$b("Transpose",o,{perm:d?Array.from((v(),R).subarray(Number(d)>>>0,Number(m)>>>0)):[]})},978728:(o,d,m,c)=>{t.$b("DepthToSpace",o,{blocksize:d,mode:Te(m),format:c?"NHWC":"NCHW"})},978861:(o,d,m,c)=>{t.$b("DepthToSpace",o,{blocksize:d,mode:Te(m),format:c?"NHWC":"NCHW"})},978994:(o,d,m,c,$,E,C,B,L,F,oe,ce,ye,we,ht)=>{t.$b("ConvTranspose",o,{format:L?"NHWC":"NCHW",autoPad:d,dilations:[m],group:c,kernelShape:[$],pads:[E,C],strides:[B],wIsConst:()=>!!(v(),U)[F>>>0],outputPadding:oe?Array.from((v(),R).subarray(Number(oe)>>>0,Number(ce)>>>0)):[],outputShape:ye?Array.from((v(),R).subarray(Number(ye)>>>0,Number(we)>>>0)):[],activation:Te(ht)})},979427:(o,d,m,c,$,E,C,B,L,F,oe,ce,ye,we)=>{t.$b("ConvTranspose",o,{format:B?"NHWC":"NCHW",autoPad:d,dilations:Array.from((v(),R).subarray(Number(m)>>>0,2+(Number(m)>>>0)>>>0)),group:c,kernelShape:Array.from((v(),R).subarray(Number($)>>>0,2+(Number($)>>>0)>>>0)),pads:Array.from((v(),R).subarray(Number(E)>>>0,4+(Number(E)>>>0)>>>0)),strides:Array.from((v(),R).subarray(Number(C)>>>0,2+(Number(C)>>>0)>>>0)),wIsConst:()=>!!(v(),U)[L>>>0],outputPadding:F?Array.from((v(),R).subarray(Number(F)>>>0,Number(oe)>>>0)):[],outputShape:ce?Array.from((v(),R).subarray(Number(ce)>>>0,Number(ye)>>>0)):[],activation:Te(we)})},980088:(o,d,m,c,$,E,C,B,L,F,oe,ce,ye,we,ht)=>{t.$b("ConvTranspose",o,{format:L?"NHWC":"NCHW",autoPad:d,dilations:[m],group:c,kernelShape:[$],pads:[E,C],strides:[B],wIsConst:()=>!!(v(),U)[F>>>0],outputPadding:oe?Array.from((v(),R).subarray(Number(oe)>>>0,Number(ce)>>>0)):[],outputShape:ye?Array.from((v(),R).subarray(Number(ye)>>>0,Number(we)>>>0)):[],activation:Te(ht)})},980521:(o,d,m,c,$,E,C,B,L,F,oe,ce,ye,we)=>{t.$b("ConvTranspose",o,{format:B?"NHWC":"NCHW",autoPad:d,dilations:Array.from((v(),R).subarray(Number(m)>>>0,2+(Number(m)>>>0)>>>0)),group:c,kernelShape:Array.from((v(),R).subarray(Number($)>>>0,2+(Number($)>>>0)>>>0)),pads:Array.from((v(),R).subarray(Number(E)>>>0,4+(Number(E)>>>0)>>>0)),strides:Array.from((v(),R).subarray(Number(C)>>>0,2+(Number(C)>>>0)>>>0)),wIsConst:()=>!!(v(),U)[L>>>0],outputPadding:F?Array.from((v(),R).subarray(Number(F)>>>0,Number(oe)>>>0)):[],outputShape:ce?Array.from((v(),R).subarray(Number(ce)>>>0,Number(ye)>>>0)):[],activation:Te(we)})},981182:(o,d)=>{t.$b("GlobalAveragePool",o,{format:d?"NHWC":"NCHW"})},981273:(o,d,m,c,$,E,C,B,L,F,oe,ce,ye,we)=>{t.$b("AveragePool",o,{format:we?"NHWC":"NCHW",auto_pad:d,ceil_mode:m,count_include_pad:c,storage_order:$,dilations:E?Array.from((v(),R).subarray(Number(E)>>>0,Number(C)>>>0)):[],kernel_shape:B?Array.from((v(),R).subarray(Number(B)>>>0,Number(L)>>>0)):[],pads:F?Array.from((v(),R).subarray(Number(F)>>>0,Number(oe)>>>0)):[],strides:ce?Array.from((v(),R).subarray(Number(ce)>>>0,Number(ye)>>>0)):[]})},981752:(o,d)=>{t.$b("GlobalAveragePool",o,{format:d?"NHWC":"NCHW"})},981843:(o,d,m,c,$,E,C,B,L,F,oe,ce,ye,we)=>{t.$b("AveragePool",o,{format:we?"NHWC":"NCHW",auto_pad:d,ceil_mode:m,count_include_pad:c,storage_order:$,dilations:E?Array.from((v(),R).subarray(Number(E)>>>0,Number(C)>>>0)):[],kernel_shape:B?Array.from((v(),R).subarray(Number(B)>>>0,Number(L)>>>0)):[],pads:F?Array.from((v(),R).subarray(Number(F)>>>0,Number(oe)>>>0)):[],strides:ce?Array.from((v(),R).subarray(Number(ce)>>>0,Number(ye)>>>0)):[]})},982322:(o,d)=>{t.$b("GlobalMaxPool",o,{format:d?"NHWC":"NCHW"})},982409:(o,d,m,c,$,E,C,B,L,F,oe,ce,ye,we)=>{t.$b("MaxPool",o,{format:we?"NHWC":"NCHW",auto_pad:d,ceil_mode:m,count_include_pad:c,storage_order:$,dilations:E?Array.from((v(),R).subarray(Number(E)>>>0,Number(C)>>>0)):[],kernel_shape:B?Array.from((v(),R).subarray(Number(B)>>>0,Number(L)>>>0)):[],pads:F?Array.from((v(),R).subarray(Number(F)>>>0,Number(oe)>>>0)):[],strides:ce?Array.from((v(),R).subarray(Number(ce)>>>0,Number(ye)>>>0)):[]})},982884:(o,d)=>{t.$b("GlobalMaxPool",o,{format:d?"NHWC":"NCHW"})},982971:(o,d,m,c,$,E,C,B,L,F,oe,ce,ye,we)=>{t.$b("MaxPool",o,{format:we?"NHWC":"NCHW",auto_pad:d,ceil_mode:m,count_include_pad:c,storage_order:$,dilations:E?Array.from((v(),R).subarray(Number(E)>>>0,Number(C)>>>0)):[],kernel_shape:B?Array.from((v(),R).subarray(Number(B)>>>0,Number(L)>>>0)):[],pads:F?Array.from((v(),R).subarray(Number(F)>>>0,Number(oe)>>>0)):[],strides:ce?Array.from((v(),R).subarray(Number(ce)>>>0,Number(ye)>>>0)):[]})},983446:(o,d,m,c,$)=>{t.$b("Gemm",o,{alpha:d,beta:m,transA:c,transB:$})},983550:o=>{t.$b("MatMul",o,void 0)},983604:(o,d,m,c)=>{t.$b("ArgMax",o,{keepDims:!!d,selectLastIndex:!!m,axis:c})},983712:(o,d,m,c)=>{t.$b("ArgMin",o,{keepDims:!!d,selectLastIndex:!!m,axis:c})},983820:(o,d)=>{t.$b("Softmax",o,{axis:d})},983883:(o,d)=>{t.$b("Concat",o,{axis:d})},983943:(o,d,m,c,$)=>{t.$b("Split",o,{axis:d,numOutputs:m,splitSizes:c?Array.from((v(),R).subarray(Number(c)>>>0,Number($)>>>0)):[]})},984099:o=>{t.$b("Expand",o,void 0)},984153:(o,d)=>{t.$b("Gather",o,{axis:Number(d)})},984224:(o,d)=>{t.$b("GatherElements",o,{axis:Number(d)})},984303:(o,d)=>{t.$b("GatherND",o,{batch_dims:Number(d)})},984382:(o,d,m,c,$,E,C,B,L,F,oe)=>{t.$b("Resize",o,{antialias:d,axes:m?Array.from((v(),R).subarray(Number(m)>>>0,Number(c)>>>0)):[],coordinateTransformMode:Te($),cubicCoeffA:E,excludeOutside:C,extrapolationValue:B,keepAspectRatioPolicy:Te(L),mode:Te(F),nearestMode:Te(oe)})},984744:(o,d,m,c,$,E,C)=>{t.$b("Slice",o,{starts:d?Array.from((v(),R).subarray(Number(d)>>>0,Number(m)>>>0)):[],ends:c?Array.from((v(),R).subarray(Number(c)>>>0,Number($)>>>0)):[],axes:E?Array.from((v(),R).subarray(Number(E)>>>0,Number(C)>>>0)):[]})},985008:o=>{t.$b("Tile",o,void 0)},985060:(o,d,m)=>{t.$b("InstanceNormalization",o,{epsilon:d,format:m?"NHWC":"NCHW"})},985174:(o,d,m)=>{t.$b("InstanceNormalization",o,{epsilon:d,format:m?"NHWC":"NCHW"})},985288:o=>{t.$b("Range",o,void 0)},985341:(o,d)=>{t.$b("Einsum",o,{equation:Te(d)})},985422:(o,d,m,c,$)=>{t.$b("Pad",o,{mode:d,value:m,pads:c?Array.from((v(),R).subarray(Number(c)>>>0,Number($)>>>0)):[]})},985565:(o,d,m,c,$,E)=>{t.$b("BatchNormalization",o,{epsilon:d,momentum:m,spatial:!!$,trainingMode:!!c,format:E?"NHWC":"NCHW"})},985734:(o,d,m,c,$,E)=>{t.$b("BatchNormalization",o,{epsilon:d,momentum:m,spatial:!!$,trainingMode:!!c,format:E?"NHWC":"NCHW"})},985903:(o,d,m)=>{t.$b("CumSum",o,{exclusive:Number(d),reverse:Number(m)})},986e3:(o,d,m)=>{t.$b("DequantizeLinear",o,{axis:d,blockSize:m})},986090:(o,d,m,c,$)=>{t.$b("GridSample",o,{align_corners:d,mode:Te(m),padding_mode:Te(c),format:$?"NHWC":"NCHW"})},986260:(o,d,m,c,$)=>{t.$b("GridSample",o,{align_corners:d,mode:Te(m),padding_mode:Te(c),format:$?"NHWC":"NCHW"})},986430:(o,d)=>{t.$b("ScatterND",o,{reduction:Te(d)})},986515:(o,d,m,c,$,E,C,B,L)=>{t.$b("Attention",o,{numHeads:d,isUnidirectional:m,maskFilterValue:c,scale:$,doRotary:E,qkvHiddenSizes:C?Array.from((v(),R).subarray(Number(B)>>>0,Number(B)+C>>>0)):[],pastPresentShareBuffer:!!L})},986787:o=>{t.$b("BiasAdd",o,void 0)},986842:o=>{t.$b("BiasSplitGelu",o,void 0)},986903:o=>{t.$b("FastGelu",o,void 0)},986959:(o,d,m,c,$,E,C,B,L,F,oe,ce,ye,we,ht,vi)=>{t.$b("Conv",o,{format:ce?"NHWC":"NCHW",auto_pad:d,dilations:m?Array.from((v(),R).subarray(Number(m)>>>0,Number(c)>>>0)):[],group:$,kernel_shape:E?Array.from((v(),R).subarray(Number(E)>>>0,Number(C)>>>0)):[],pads:B?Array.from((v(),R).subarray(Number(B)>>>0,Number(L)>>>0)):[],strides:F?Array.from((v(),R).subarray(Number(F)>>>0,Number(oe)>>>0)):[],w_is_const:()=>!!(v(),U)[Number(ye)>>>0],activation:Te(we),activation_params:ht?Array.from((v(),j).subarray(Number(ht)>>>0,Number(vi)>>>0)):[]})},987543:o=>{t.$b("Gelu",o,void 0)},987595:(o,d,m,c,$,E,C,B,L)=>{t.$b("GroupQueryAttention",o,{numHeads:d,kvNumHeads:m,scale:c,softcap:$,doRotary:E,rotaryInterleaved:C,smoothSoftmax:B,localWindowSize:L})},987812:(o,d,m,c)=>{t.$b("LayerNormalization",o,{axis:d,epsilon:m,simplified:!!c})},987923:(o,d,m,c)=>{t.$b("LayerNormalization",o,{axis:d,epsilon:m,simplified:!!c})},988034:(o,d,m,c,$,E)=>{t.$b("MatMulNBits",o,{k:d,n:m,accuracyLevel:c,bits:$,blockSize:E})},988161:(o,d,m,c,$,E)=>{t.$b("MultiHeadAttention",o,{numHeads:d,isUnidirectional:m,maskFilterValue:c,scale:$,doRotary:E})},988320:(o,d)=>{t.$b("QuickGelu",o,{alpha:d})},988384:(o,d,m,c,$)=>{t.$b("RotaryEmbedding",o,{interleaved:!!d,numHeads:m,rotaryEmbeddingDim:c,scale:$})},988523:(o,d,m)=>{t.$b("SkipLayerNormalization",o,{epsilon:d,simplified:!!m})},988625:(o,d,m)=>{t.$b("SkipLayerNormalization",o,{epsilon:d,simplified:!!m})},988727:(o,d,m,c)=>{t.$b("GatherBlockQuantized",o,{gatherAxis:d,quantizeAxis:m,blockSize:c})},988848:o=>{t.Fd(o)},988882:(o,d)=>t.Hd(Number(o),Number(d),t.Yc.Kd,t.Yc.errors)};function Gm(o,d,m){return Gn(async()=>{await t.Dd(Number(o),Number(d),Number(m))})}function Vm(){return typeof wasmOffsetConverter<"u"}function Hm(o,d,m,c){var $=le();try{return ks(o,d,m,c)}catch(E){if(ue($),E!==E+0)throw E;de(1,0)}}function Fm(o,d,m){var c=le();try{return $s(o,d,m)}catch($){if(ue(c),$!==$+0)throw $;de(1,0)}}function jm(o){var d=le();try{_s(o)}catch(m){if(ue(d),m!==m+0)throw m;de(1,0)}}function Km(o,d){var m=le();try{return wi(o,d)}catch(c){if(ue(m),c!==c+0)throw c;de(1,0)}}function Zm(o,d,m){var c=le();try{ys(o,d,m)}catch($){if(ue(c),$!==$+0)throw $;de(1,0)}}function Xm(o,d){var m=le();try{Ts(o,d)}catch(c){if(ue(m),c!==c+0)throw c;de(1,0)}}function Qm(o,d,m,c,$,E,C){var B=le();try{return xs(o,d,m,c,$,E,C)}catch(L){if(ue(B),L!==L+0)throw L;de(1,0)}}function Ym(o,d,m,c,$,E){var C=le();try{bs(o,d,m,c,$,E)}catch(B){if(ue(C),B!==B+0)throw B;de(1,0)}}function Jm(o,d,m,c){var $=le();try{Ss(o,d,m,c)}catch(E){if(ue($),E!==E+0)throw E;de(1,0)}}function eg(o,d,m,c,$){var E=le();try{ws(o,d,m,c,$)}catch(C){if(ue(E),C!==C+0)throw C;de(1,0)}}function tg(o,d,m,c,$,E,C){var B=le();try{Is(o,d,m,c,$,E,C)}catch(L){if(ue(B),L!==L+0)throw L;de(1,0)}}function rg(o,d,m,c,$,E,C){var B=le();try{zs(o,d,m,c,$,E,C)}catch(L){if(ue(B),L!==L+0)throw L;de(1,0)}}function ig(o,d,m,c,$,E,C,B){var L=le();try{Ms(o,d,m,c,$,E,C,B)}catch(F){if(ue(L),F!==F+0)throw F;de(1,0)}}function ag(o,d,m,c,$){var E=le();try{return Es(o,d,m,c,$)}catch(C){if(ue(E),C!==C+0)throw C;de(1,0)}}function ng(o,d,m){var c=le();try{return Rs(o,d,m)}catch($){if(ue(c),$!==$+0)throw $;de(1,0)}}function sg(o,d,m,c,$,E,C,B){var L=le();try{Bs(o,d,m,c,$,E,C,B)}catch(F){if(ue(L),F!==F+0)throw F;de(1,0)}}function og(o,d,m,c,$,E,C,B,L,F,oe,ce){var ye=le();try{Cs(o,d,m,c,$,E,C,B,L,F,oe,ce)}catch(we){if(ue(ye),we!==we+0)throw we;de(1,0)}}function ug(o,d,m,c,$,E){var C=le();try{return As(o,d,m,c,$,E)}catch(B){if(ue(C),B!==B+0)throw B;de(1,0)}}function lg(o,d,m){var c=le();try{return Ds(o,d,m)}catch($){if(ue(c),$!==$+0)throw $;return de(1,0),0n}}function dg(o,d,m,c,$,E,C,B,L){var F=le();try{vs(o,d,m,c,$,E,C,B,L)}catch(oe){if(ue(F),oe!==oe+0)throw oe;de(1,0)}}function pg(o){var d=le();try{return Ns(o)}catch(m){if(ue(d),m!==m+0)throw m;de(1,0)}}function cg(o,d){var m=le();try{return Ys(o,d)}catch(c){if(ue(m),c!==c+0)throw c;return de(1,0),0n}}function hg(o){var d=le();try{return Ps(o)}catch(m){if(ue(d),m!==m+0)throw m;return de(1,0),0n}}function fg(o,d,m,c){var $=le();try{return Vs(o,d,m,c)}catch(E){if(ue($),E!==E+0)throw E;de(1,0)}}function mg(o,d,m,c,$){var E=le();try{return Hs(o,d,m,c,$)}catch(C){if(ue(E),C!==C+0)throw C;de(1,0)}}function gg(o,d,m,c,$,E){var C=le();try{return Fs(o,d,m,c,$,E)}catch(B){if(ue(C),B!==B+0)throw B;de(1,0)}}function yg(o,d,m,c,$,E){var C=le();try{return js(o,d,m,c,$,E)}catch(B){if(ue(C),B!==B+0)throw B;de(1,0)}}function _g(o,d,m,c,$,E,C,B){var L=le();try{return Os(o,d,m,c,$,E,C,B)}catch(F){if(ue(L),F!==F+0)throw F;de(1,0)}}function bg(o,d,m,c,$){var E=le();try{return Ks(o,d,m,c,$)}catch(C){if(ue(E),C!==C+0)throw C;return de(1,0),0n}}function wg(o,d,m,c){var $=le();try{return Zs(o,d,m,c)}catch(E){if(ue($),E!==E+0)throw E;de(1,0)}}function $g(o,d,m,c){var $=le();try{return Xs(o,d,m,c)}catch(E){if(ue($),E!==E+0)throw E;de(1,0)}}function vg(o,d,m,c,$,E,C,B,L,F,oe,ce){var ye=le();try{return Qs(o,d,m,c,$,E,C,B,L,F,oe,ce)}catch(we){if(ue(ye),we!==we+0)throw we;de(1,0)}}function xg(o,d,m,c,$,E,C,B,L,F,oe){var ce=le();try{Ls(o,d,m,c,$,E,C,B,L,F,oe)}catch(ye){if(ue(ce),ye!==ye+0)throw ye;de(1,0)}}function Sg(o,d,m,c,$,E,C,B,L,F,oe,ce,ye,we,ht,vi){var Ig=le();try{Gs(o,d,m,c,$,E,C,B,L,F,oe,ce,ye,we,ht,vi)}catch(xi){if(ue(Ig),xi!==xi+0)throw xi;de(1,0)}}function kg(o,d,m){var c=le();try{return Us(o,d,m)}catch($){if(ue(c),$!==$+0)throw $;de(1,0)}}function Tg(o,d,m){var c=le();try{return Ws(o,d,m)}catch($){if(ue(c),$!==$+0)throw $;de(1,0)}}function Eg(o,d,m,c){var $=le();try{qs(o,d,m,c)}catch(E){if(ue($),E!==E+0)throw E;de(1,0)}}function Er(){if(0<$e)Be=Er;else if(a)w?.(t),H();else{for(var o=ge;0<o.length;)o.shift()(t);0<$e?Be=Er:(t.calledRun=!0,A||(H(),w?.(t)))}}return a||(nt=await Oe(),Er()),t.PTR_SIZE=4,O?t:new Promise((o,d)=>{w=o,k=d})}var np,no,Zg=q(()=>{np=ao,no=globalThis.self?.name?.startsWith("em-pthread"),no&&ao()}),zi,wa,so,Ne,sp,zr,oo,uo,Ci,lo,Ai,op,Oi,up,Ua=q(()=>{Pa(),zi=typeof location>"u"?void 0:location.origin,wa=import.meta.url>"file:"&&import.meta.url<"file;",so=()=>{{if(wa){let e=URL;return new URL(new e("ort.bundle.min.mjs",import.meta.url).href,zi).href}return import.meta.url}},Ne=so(),sp=()=>{if(Ne&&!Ne.startsWith("blob:"))return Ne.substring(0,Ne.lastIndexOf("/")+1)},zr=(e,t)=>{try{let r=t??Ne;return(r?new URL(e,r):new URL(e)).origin===zi}catch{return!1}},oo=(e,t)=>{let r=t??Ne;try{return(r?new URL(e,r):new URL(e)).href}catch{return}},uo=(e,t)=>`${t??"./"}${e}`,Ci=async e=>{let t=await(await fetch(e,{credentials:"same-origin"})).blob();return URL.createObjectURL(t)},lo=async e=>(await import(e)).default,Ai=(Kg(),hr(rp)).default,op=async()=>{if(!Ne)throw new Error("Failed to load proxy worker: cannot determine the script source URL.");if(zr(Ne))return[void 0,Ai()];let e=await Ci(Ne);return[e,Ai(e)]},Oi=(Zg(),hr(ap)).default,up=async(e,t,r,i)=>{let a=Oi&&!(e||t);if(a)if(Ne)a=zr(Ne)||i&&!r;else if(i&&!r)a=!0;else throw new Error("cannot determine the script source URL.");if(a)return[void 0,Oi];{let n="ort-wasm-simd-threaded.jsep.mjs",s=e??oo(n,t),u=r&&s&&!zr(s,t),l=u?await Ci(s):s??uo(n,t);return[u?l:void 0,await lo(l)]}}}),Mi,Cr,Yt,Ri,po,co,ho,Wa,be,Nt=q(()=>{Ua(),Cr=!1,Yt=!1,Ri=!1,po=()=>{if(typeof SharedArrayBuffer>"u")return!1;try{return typeof MessageChannel<"u"&&new MessageChannel().port1.postMessage(new SharedArrayBuffer(1)),WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,5,4,1,3,1,1,10,11,1,9,0,65,0,254,16,2,0,26,11]))}catch{return!1}},co=()=>{try{return WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,10,30,1,28,0,65,0,253,15,253,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,253,186,1,26,11]))}catch{return!1}},ho=()=>{try{return WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,19,1,17,0,65,1,253,15,65,2,253,15,65,3,253,15,253,147,2,11]))}catch{return!1}},Wa=async e=>{if(Cr)return Promise.resolve();if(Yt)throw new Error("multiple calls to 'initializeWebAssembly()' detected.");if(Ri)throw new Error("previous call to 'initializeWebAssembly()' failed.");Yt=!0;let t=e.initTimeout,r=e.numThreads;if(e.simd!==!1){if(e.simd==="relaxed"){if(!ho())throw new Error("Relaxed WebAssembly SIMD is not supported in the current environment.")}else if(!co())throw new Error("WebAssembly SIMD is not supported in the current environment.")}let i=po();r>1&&!i&&(typeof self<"u"&&!self.crossOriginIsolated&&console.warn("env.wasm.numThreads is set to "+r+", but this will not work unless you enable crossOriginIsolated mode. See https://web.dev/cross-origin-isolation-guide/ for more info."),console.warn("WebAssembly multi-threading is not supported in the current environment. Falling back to single-threading."),e.numThreads=r=1);let a=e.wasmPaths,n=typeof a=="string"?a:void 0,s=a?.mjs,u=s?.href??s,l=a?.wasm,p=l?.href??l,h=e.wasmBinary,[f,g]=await up(u,n,r>1,!!h||!!p),y=!1,_=[];if(t>0&&_.push(new Promise(w=>{setTimeout(()=>{y=!0,w()},t)})),_.push(new Promise((w,k)=>{let x={numThreads:r};if(h)x.wasmBinary=h,x.locateFile=b=>b;else if(p||n)x.locateFile=b=>p??n+b;else if(u&&u.indexOf("blob:")!==0)x.locateFile=b=>new URL(b,u).href;else if(f){let b=sp();b&&(x.locateFile=T=>b+T)}g(x).then(b=>{Yt=!1,Cr=!0,Mi=b,w(),f&&URL.revokeObjectURL(f)},b=>{Yt=!1,Ri=!0,k(b)})})),await Promise.race(_),y)throw new Error(`WebAssembly backend initializing failed due to timeout: ${t}ms`)},be=()=>{if(Cr&&Mi)return Mi;throw new Error("WebAssembly is not initialized yet.")}}),Ze,Hr,me,qa=q(()=>{Nt(),Ze=(e,t)=>{let r=be(),i=r.lengthBytesUTF8(e)+1,a=r._malloc(i);return r.stringToUTF8(e,a,i),t.push(a),a},Hr=(e,t,r,i)=>{if(typeof e=="object"&&e!==null){if(r.has(e))throw new Error("Circular reference in options");r.add(e)}Object.entries(e).forEach(([a,n])=>{let s=t?t+a:a;if(typeof n=="object")Hr(n,s+".",r,i);else if(typeof n=="string"||typeof n=="number")i(s,n.toString());else if(typeof n=="boolean")i(s,n?"1":"0");else throw new Error(`Can't handle extra config type: ${typeof n}`)})},me=e=>{let t=be(),r=t.stackSave();try{let i=t.PTR_SIZE,a=t.stackAlloc(2*i);t._OrtGetLastError(a,a+i);let n=Number(t.getValue(a,i===4?"i32":"i64")),s=t.getValue(a+i,"*"),u=s?t.UTF8ToString(s):"";throw new Error(`${e} ERROR_CODE: ${n}, ERROR_MESSAGE: ${u}`)}finally{t.stackRestore(r)}}}),lp,Xg=q(()=>{Nt(),qa(),lp=e=>{let t=be(),r=0,i=[],a=e||{};try{if(e?.logSeverityLevel===void 0)a.logSeverityLevel=2;else if(typeof e.logSeverityLevel!="number"||!Number.isInteger(e.logSeverityLevel)||e.logSeverityLevel<0||e.logSeverityLevel>4)throw new Error(`log severity level is not valid: ${e.logSeverityLevel}`);if(e?.logVerbosityLevel===void 0)a.logVerbosityLevel=0;else if(typeof e.logVerbosityLevel!="number"||!Number.isInteger(e.logVerbosityLevel))throw new Error(`log verbosity level is not valid: ${e.logVerbosityLevel}`);e?.terminate===void 0&&(a.terminate=!1);let n=0;return e?.tag!==void 0&&(n=Ze(e.tag,i)),r=t._OrtCreateRunOptions(a.logSeverityLevel,a.logVerbosityLevel,!!a.terminate,n),r===0&&me("Can't create run options."),e?.extra!==void 0&&Hr(e.extra,"",new WeakSet,(s,u)=>{let l=Ze(s,i),p=Ze(u,i);t._OrtAddRunConfigEntry(r,l,p)!==0&&me(`Can't set a run config entry: ${s} - ${u}.`)}),[r,i]}catch(n){throw r!==0&&t._OrtReleaseRunOptions(r),i.forEach(s=>t._free(s)),n}}}),fo,mo,go,xt,yo,dp,Qg=q(()=>{Nt(),qa(),fo=e=>{switch(e){case"disabled":return 0;case"basic":return 1;case"extended":return 2;case"layout":return 3;case"all":return 99;default:throw new Error(`unsupported graph optimization level: ${e}`)}},mo=e=>{switch(e){case"sequential":return 0;case"parallel":return 1;default:throw new Error(`unsupported execution mode: ${e}`)}},go=e=>{e.extra||(e.extra={}),e.extra.session||(e.extra.session={});let t=e.extra.session;t.use_ort_model_bytes_directly||(t.use_ort_model_bytes_directly="1"),e.executionProviders&&e.executionProviders.some(r=>(typeof r=="string"?r:r.name)==="webgpu")&&(e.enableMemPattern=!1)},xt=(e,t,r,i)=>{let a=Ze(t,i),n=Ze(r,i);be()._OrtAddSessionConfigEntry(e,a,n)!==0&&me(`Can't set a session config entry: ${t} - ${r}.`)},yo=async(e,t,r)=>{let i=t.executionProviders;for(let a of i){let n=typeof a=="string"?a:a.name,s=[];switch(n){case"webnn":if(n="WEBNN",xt(e,"session.disable_quant_qdq","1",r),xt(e,"session.disable_qdq_constant_folding","1",r),typeof a!="string"){let f=a?.deviceType;f&&xt(e,"deviceType",f,r)}break;case"webgpu":if(n="JS",typeof a!="string"){let f=a;if(f?.preferredLayout){if(f.preferredLayout!=="NCHW"&&f.preferredLayout!=="NHWC")throw new Error(`preferredLayout must be either 'NCHW' or 'NHWC': ${f.preferredLayout}`);xt(e,"preferredLayout",f.preferredLayout,r)}}break;case"wasm":case"cpu":continue;default:throw new Error(`not supported execution provider: ${n}`)}let u=Ze(n,r),l=s.length,p=0,h=0;if(l>0){p=be()._malloc(l*be().PTR_SIZE),r.push(p),h=be()._malloc(l*be().PTR_SIZE),r.push(h);for(let f=0;f<l;f++)be().setValue(p+f*be().PTR_SIZE,s[f][0],"*"),be().setValue(h+f*be().PTR_SIZE,s[f][1],"*")}await be()._OrtAppendExecutionProvider(e,u,p,h,l)!==0&&me(`Can't append execution provider: ${n}.`)}},dp=async e=>{let t=be(),r=0,i=[],a=e||{};go(a);try{let n=fo(a.graphOptimizationLevel??"all"),s=mo(a.executionMode??"sequential"),u=typeof a.logId=="string"?Ze(a.logId,i):0,l=a.logSeverityLevel??2;if(!Number.isInteger(l)||l<0||l>4)throw new Error(`log severity level is not valid: ${l}`);let p=a.logVerbosityLevel??0;if(!Number.isInteger(p)||p<0||p>4)throw new Error(`log verbosity level is not valid: ${p}`);let h=typeof a.optimizedModelFilePath=="string"?Ze(a.optimizedModelFilePath,i):0;if(r=t._OrtCreateSessionOptions(n,!!a.enableCpuMemArena,!!a.enableMemPattern,s,!!a.enableProfiling,0,u,l,p,h),r===0&&me("Can't create session options."),a.executionProviders&&await yo(r,a,i),a.enableGraphCapture!==void 0){if(typeof a.enableGraphCapture!="boolean")throw new Error(`enableGraphCapture must be a boolean value: ${a.enableGraphCapture}`);xt(r,"enableGraphCapture",a.enableGraphCapture.toString(),i)}if(a.freeDimensionOverrides)for(let[f,g]of Object.entries(a.freeDimensionOverrides)){if(typeof f!="string")throw new Error(`free dimension override name must be a string: ${f}`);if(typeof g!="number"||!Number.isInteger(g)||g<0)throw new Error(`free dimension override value must be a non-negative integer: ${g}`);let y=Ze(f,i);t._OrtAddFreeDimensionOverride(r,y,g)!==0&&me(`Can't set a free dimension override: ${f} - ${g}.`)}return a.extra!==void 0&&Hr(a.extra,"",new WeakSet,(f,g)=>{xt(r,f,g,i)}),[r,i]}catch(n){throw r!==0&&t._OrtReleaseSessionOptions(r)!==0&&me("Can't release session options."),i.forEach(s=>t._free(s)),n}}}),zt,ot,Ct,Jr,Fr,La,Ga,$a,ie=q(()=>{zt=e=>{switch(e){case"int8":return 3;case"uint8":return 2;case"bool":return 9;case"int16":return 5;case"uint16":return 4;case"int32":return 6;case"uint32":return 12;case"float16":return 10;case"float32":return 1;case"float64":return 11;case"string":return 8;case"int64":return 7;case"uint64":return 13;case"int4":return 22;case"uint4":return 21;default:throw new Error(`unsupported data type: ${e}`)}},ot=e=>{switch(e){case 3:return"int8";case 2:return"uint8";case 9:return"bool";case 5:return"int16";case 4:return"uint16";case 6:return"int32";case 12:return"uint32";case 10:return"float16";case 1:return"float32";case 11:return"float64";case 8:return"string";case 7:return"int64";case 13:return"uint64";case 22:return"int4";case 21:return"uint4";default:throw new Error(`unsupported data type: ${e}`)}},Ct=(e,t)=>{let r=[-1,4,1,1,2,2,4,8,-1,1,2,8,4,8,-1,-1,-1,-1,-1,-1,-1,.5,.5][e],i=typeof t=="number"?t:t.reduce((a,n)=>a*n,1);return r>0?Math.ceil(i*r):void 0},Jr=e=>{switch(e){case"float16":return typeof Float16Array<"u"&&Float16Array.from?Float16Array:Uint16Array;case"float32":return Float32Array;case"uint8":return Uint8Array;case"int8":return Int8Array;case"uint16":return Uint16Array;case"int16":return Int16Array;case"int32":return Int32Array;case"bool":return Uint8Array;case"float64":return Float64Array;case"uint32":return Uint32Array;case"int64":return BigInt64Array;case"uint64":return BigUint64Array;default:throw new Error(`unsupported type: ${e}`)}},Fr=e=>{switch(e){case"verbose":return 0;case"info":return 1;case"warning":return 2;case"error":return 3;case"fatal":return 4;default:throw new Error(`unsupported logging level: ${e}`)}},La=e=>e==="float32"||e==="float16"||e==="int32"||e==="int64"||e==="uint32"||e==="uint8"||e==="bool"||e==="uint4"||e==="int4",Ga=e=>e==="float32"||e==="float16"||e==="int32"||e==="int64"||e==="uint32"||e==="uint64"||e==="int8"||e==="uint8"||e==="bool"||e==="uint4"||e==="int4",$a=e=>{switch(e){case"none":return 0;case"cpu":return 1;case"cpu-pinned":return 2;case"texture":return 3;case"gpu-buffer":return 4;case"ml-tensor":return 5;default:throw new Error(`unsupported data location: ${e}`)}}}),Va,pp=q(()=>{Pa(),Va=async e=>{if(typeof e=="string"){let t=await fetch(e);if(!t.ok)throw new Error(`failed to load external data file: ${e}`);let r=t.headers.get("Content-Length"),i=r?parseInt(r,10):0;if(i<1073741824)return new Uint8Array(await t.arrayBuffer());{if(!t.body)throw new Error(`failed to load external data file: ${e}, no response body.`);let a=t.body.getReader(),n;try{n=new ArrayBuffer(i)}catch(u){if(u instanceof RangeError){let l=Math.ceil(i/65536);n=new WebAssembly.Memory({initial:l,maximum:l}).buffer}else throw u}let s=0;for(;;){let{done:u,value:l}=await a.read();if(u)break;let p=l.byteLength;new Uint8Array(n,s,p).set(l),s+=p}return new Uint8Array(n,0,i)}}else return e instanceof Blob?new Uint8Array(await e.arrayBuffer()):e instanceof Uint8Array?e:new Uint8Array(e)}}),_o,bo,wo,$o,Ha,vo,pe,ut=q(()=>{ie(),_o=["V","I","W","E","F"],bo=(e,t)=>{console.log(`[${_o[e]},${new Date().toISOString()}]${t}`)},Ha=(e,t)=>{wo=e,$o=t},vo=(e,t)=>{let r=Fr(e),i=Fr(wo);r>=i&&bo(r,typeof t=="function"?t():t)},pe=(...e)=>{$o&&vo(...e)}}),xo,Vt,M,jr,cp,hp,fp,ne=q(()=>{xo=class{static calcMatMulShape(e,t){return e[1]!==t[0]?void 0:[e[0],t[1]]}},Vt=class{static calcShape(e,t,r=!1){let i=e.length,a=t.length;if(i===0)return t;if(a===0)return e;let n=Math.max(e.length,t.length),s=new Array(n);if(r){if(i<2||a<2)return;let u=xo.calcMatMulShape([e[i-2],e[i-1]],[t[a-2],t[a-1]]);if(u===void 0)return;[s[n-2],s[n-1]]=u}for(let u=r?3:1;u<=n;u++){let l=i-u<0?1:e[i-u],p=a-u<0?1:t[a-u];if(l!==p&&l>1&&p>1)return;let h=Math.max(l,p);if(l&&p)s[n-u]=Math.max(l,p);else{if(h>1)return;s[n-u]=0}}return s}static isValidBroadcast(e,t){let r=e.length,i=t.length;if(r>i)return!1;for(let a=1;a<=r;a++)if(e[r-a]!==1&&e[r-a]!==t[i-a])return!1;return!0}},M=class qr{static size(t){return qr.getSizeFromDimensionRange(t,0,t.length)}static convertShape(t,r=4){let i=t.length;if(i===0)return[];let a=new Array(i),n=i-1;for(;n>=0;){if(t[n]%r===0){a[n]=t[n]/r;break}if(r%t[n]!==0)throw new Error("cannot convert shape");a[n]=1,r/=t[n],n--}for(n--;n>=0;n--)a[n]=t[n];return a}static sizeFromDimension(t,r){if(r<0||r>t.length)throw new Error(`invalid dimension of ${r} for sizeFromDimension as Tensor has ${t.length} dimensions.`);return qr.getSizeFromDimensionRange(t,r,t.length)}static sizeToDimension(t,r){if(r<0||r>t.length)throw new Error(`invalid dimension of ${r} for sizeToDimension as Tensor has ${t.length} dimensions.`);return qr.getSizeFromDimensionRange(t,0,r)}static getSizeFromDimensionRange(t,r,i){let a=1;for(let n=r;n<i;n++){if(t[n]<0)throw new Error("cannot get valid size from specified dimension range. Most likely the range contains negative values in them.");a*=Number(t[n])}return a}static computeStrides(t){let r=t.length;if(r===0)return[];if(r===1)return[1];let i=new Array(r);i[r-1]=1,i[r-2]=t[r-1];for(let a=r-3;a>=0;--a)i[a]=i[a+1]*t[a+1];return i}static normalizeAxis(t,r){if(t<-r&&t>=r)throw new Error("unsupported axis for this operation.");return t<0?t+r:t}static normalizeAxes(t,r){return t.map(i=>this.normalizeAxis(i,r??t.length))}static sortBasedOnPerm(t,r){return r?r.map(i=>t[i]):t.slice().reverse()}static padShape(t,r){let i=t.length;return t.map((a,n)=>a+r[n]+r[n+i])}static areEqual(t,r){return t.length!==r.length?!1:t.every((i,a)=>i===r[a])}},jr=class ur{static adjustPoolAttributes(t,r,i,a,n,s){if(!t&&i.length!==r.length-2)throw new Error("length of specified kernel shapes should be 2 less than length of input dimensions");if(t)for(let u=0;u<r.length-2;u++)u>=i.length?i.push(r[u+2]):i[u]=r[u+2];for(let u=0;u<i.length;u++)if(u<a.length){if(a[u]<0)throw new Error("strides should be greater than or equal to 1")}else a.push(1);for(let u=0;u<i.length;u++)if(u<n.length){if(n[u]<0)throw new Error("dilations should be greater than or equal to 1")}else n.push(1);for(let u=0;u<i.length*2;u++)if(u<s.length){if(s[u]<0)throw new Error("pad should be greater than or equal to 1")}else s.push(0);for(let u=0;u<i.length;u++){if(i[u]<=0)throw new Error("kernel shapes need to be greater than 0");if(s[u]>=i[u]||s[u+i.length]>=i[u])throw new Error("pads should be smaller than kernel")}}static adjustPadsBasedOnAutoPad(t,r,i,a,n,s,u){if(u){if(n.length!==2*(t.length-2))throw new Error("length of pads should be twice the length of data dimensions");if(r.length!==t.length-2)throw new Error("length of strides should be the length of data dimensions");if(a.length!==t.length-2)throw new Error("length of kernel shapes should be the length of data dimensions");for(let l=0;l<t.length-2;l++)ur.adjustPadAndReturnShape(t[l+(s?1:2)],r[l],i[l],a[l],n,l,l+t.length-2,u)}}static computePoolOutputShape(t,r,i,a,n,s,u){if(r.length<=0)throw new Error("input shape must be of size greater than 0");let l=[r[0],r[1]];return ur.computeShapeHelper(t,r,l,i,a,n,s,u),l}static computeConvOutputShape(t,r,i,a,n,s,u){if(t.length<=0||r.length<=0)throw new Error("invalid input tensor dims or invalid filter tensor dims");let l=[t[0],r[0]];return ur.computeShapeHelper(!1,t,l,i,a,n,s,u),l}static computeShapeHelper(t,r,i,a,n,s,u,l){if(t)for(let p=0;p<r.length-2;p++)i.push(1);else for(let p=0;p<r.length-2;p++)i.push(ur.adjustPadAndReturnShape(r[p+2],a[p],n[p],s[p],u,p,p+r.length-2,l))}static adjustPadAndReturnShape(t,r,i,a,n,s,u,l){let p=i*(a-1)+1;if(l&&l!=="NOTSET")switch(l){case"VALID":return n[s]=0,n[u]=0,Math.floor((t-p)/r+1);case"SAME_LOWER":case"SAME_UPPER":if(i!==1)throw new Error("Dilation not supported for SAME_UPPER or SAME_LOWER");{let h=((t+r-1)/r-1)*r+a-t;return n[s]=Math.floor(l==="SAME_LOWER"?(h+1)/2:h/2),n[u]=h-n[s],Math.floor((t+h-a)/r+1)}default:throw new Error("Unsupported AutoPad type")}else return Math.floor((t+n[s]+n[u]-p)/r+1)}},cp=class{static getShapeOfGemmResult(e,t,r,i,a){if(e.length!==2||r.length!==2)throw new Error("shape need to be of size 2");let n,s,u;t?(n=e[1],s=e[0]):(n=e[0],s=e[1]);let l=-1;if(i?(u=r[0],l=1):(u=r[1],l=0),r[l]!==s)throw new Error("dimension mismatch");if(n<=0||u<=0||s<=0)throw new Error("invalid shape specified");if(a&&!Vt.isValidBroadcast(a,[n,u]))throw new Error("gemm: invalid bias shape for broadcast");return[n,u,s]}},hp=-34028234663852886e22,fp=34028234663852886e22}),Fa,mp=q(()=>{ie(),Fa=(e,t)=>new(Jr(t))(e)}),Bi,va,Di,So,Ni,ko,Pi,Ui,Wi,To,gp,Yg=q(()=>{ie(),ut(),Bi=new Map([["float32",32],["float16",16],["int32",32],["uint32",32],["int64",64],["uint64",64],["int8",8],["uint8",8],["int4",4],["uint4",4]]),va=(e,t)=>{if(t==="int32")return e;let r=Bi.get(t);if(!r)throw new Error(`WebNN backend does not support data type: ${t}`);let i=r/8;if(e.byteLength%i!==0)throw new Error(`Invalid Uint8Array length - must be a multiple of ${i}.`);let a=e.byteLength/i,n=new(Jr(t))(e.buffer,e.byteOffset,a);switch(t){case"int64":case"uint64":{let s=new Int32Array(a);for(let u=0;u<a;u++){let l=n[u];if(l>2147483647n||l<-2147483648n)throw new Error("Can not convert int64 data to int32 - value out of range.");s[u]=Number(l)}return new Uint8Array(s.buffer)}case"int8":case"uint8":case"uint32":{if(t==="uint32"&&n.some(u=>u>2147483647))throw new Error("Can not convert uint32 data to int32 - value out of range.");let s=Int32Array.from(n,Number);return new Uint8Array(s.buffer)}default:throw new Error(`Unsupported data conversion from ${t} to 'int32'`)}},Di=(e,t)=>{if(t==="int32")return e;if(e.byteLength%4!==0)throw new Error("Invalid Uint8Array length - must be a multiple of 4 (int32).");let r=e.byteLength/4,i=new Int32Array(e.buffer,e.byteOffset,r);switch(t){case"int64":{let a=BigInt64Array.from(i,BigInt);return new Uint8Array(a.buffer)}case"uint64":{if(i.some(n=>n<0))throw new Error("Can not convert int32 data to uin64 - negative value found.");let a=BigUint64Array.from(i,BigInt);return new Uint8Array(a.buffer)}case"int8":{if(i.some(n=>n<-128||n>127))throw new Error("Can not convert int32 data to int8 - value out of range.");let a=Int8Array.from(i,Number);return new Uint8Array(a.buffer)}case"uint8":{if(i.some(a=>a<0||a>255))throw new Error("Can not convert int32 data to uint8 - value out of range.");return Uint8Array.from(i,Number)}case"uint32":{if(i.some(n=>n<0))throw new Error("Can not convert int32 data to uint32 - negative value found.");let a=Uint32Array.from(i,Number);return new Uint8Array(a.buffer)}default:throw new Error(`Unsupported data conversion from 'int32' to ${t}`)}},So=1,Ni=()=>So++,ko=new Map([["int8","int32"],["uint8","int32"],["uint32","int32"],["int64","int32"]]),Pi=(e,t)=>{let r=Bi.get(e);if(!r)throw new Error(`WebNN backend does not support data type: ${e}`);return t.length>0?Math.ceil(t.reduce((i,a)=>i*a)*r/8):0},Ui=class{constructor(e){this.isDataConverted=!1;let{sessionId:t,context:r,tensor:i,dataType:a,shape:n,fallbackDataType:s}=e;this.sessionId=t,this.mlContext=r,this.mlTensor=i,this.dataType=a,this.tensorShape=n,this.fallbackDataType=s}get tensor(){return this.mlTensor}get type(){return this.dataType}get fallbackType(){return this.fallbackDataType}get shape(){return this.tensorShape}get byteLength(){return Pi(this.dataType,this.tensorShape)}destroy(){pe("verbose",()=>"[WebNN] TensorWrapper.destroy"),this.mlTensor.destroy()}write(e){this.mlContext.writeTensor(this.mlTensor,e)}async read(e){if(this.fallbackDataType){let t=await this.mlContext.readTensor(this.mlTensor),r=Di(new Uint8Array(t),this.dataType);if(e){(e instanceof ArrayBuffer?new Uint8Array(e):new Uint8Array(e.buffer,e.byteOffset,e.byteLength)).set(r);return}else return r.buffer}else return e?this.mlContext.readTensor(this.mlTensor,e):this.mlContext.readTensor(this.mlTensor)}canReuseTensor(e,t,r){return this.mlContext===e&&this.dataType===t&&this.tensorShape.length===r.length&&this.tensorShape.every((i,a)=>i===r[a])}setIsDataConverted(e){this.isDataConverted=e}},Wi=class{constructor(e,t){this.tensorManager=e,this.wrapper=t}get tensorWrapper(){return this.wrapper}releaseTensor(){this.tensorWrapper&&(this.tensorManager.releaseTensor(this.tensorWrapper),this.wrapper=void 0)}async ensureTensor(e,t,r,i){let a=this.tensorManager.getMLContext(e),n=this.tensorManager.getMLOpSupportLimits(e),s;if(!n?.input.dataTypes.includes(t)){if(s=ko.get(t),!s||n?.input.dataTypes.includes(s))throw new Error(`WebNN backend does not support data type: ${t}`);pe("verbose",()=>`[WebNN] TensorIdTracker.ensureTensor: fallback dataType from ${t} to ${s}`)}if(this.wrapper){if(this.wrapper.canReuseTensor(a,t,r))return this.wrapper.tensor;if(i){if(this.wrapper.byteLength!==Pi(t,r))throw new Error("Unable to copy data to tensor with different size.");this.activeUpload=new Uint8Array(await this.wrapper.read())}this.tensorManager.releaseTensor(this.wrapper)}let u=typeof MLTensorUsage>"u"?void 0:MLTensorUsage.READ|MLTensorUsage.WRITE;return this.wrapper=await this.tensorManager.getCachedTensor(e,t,r,u,!0,!0,s),i&&this.activeUpload&&(this.wrapper.write(this.activeUpload),this.activeUpload=void 0),this.wrapper.tensor}upload(e){let t=e;if(this.wrapper){if(this.wrapper.fallbackType)if(this.wrapper.fallbackType==="int32")t=va(e,this.wrapper.type),this.wrapper.setIsDataConverted(!0);else throw new Error(`Unsupported fallback data type: ${this.wrapper.fallbackType}`);if(e.byteLength===this.wrapper.byteLength){this.wrapper.write(t);return}else pe("verbose",()=>"Data size does not match tensor size. Releasing tensor."),this.releaseTensor()}this.activeUpload?this.activeUpload.set(t):this.activeUpload=new Uint8Array(t)}async download(e){if(this.activeUpload){let t=this.wrapper?.isDataConverted?Di(this.activeUpload,this.wrapper?.type):this.activeUpload;if(e){e instanceof ArrayBuffer?new Uint8Array(e).set(t):new Uint8Array(e.buffer,e.byteOffset,e.byteLength).set(t);return}else return t.buffer}if(!this.wrapper)throw new Error("Tensor has not been created.");return e?this.wrapper.read(e):this.wrapper.read()}},To=class{constructor(e){this.backend=e,this.tensorTrackersById=new Map,this.freeTensors=[],this.externalTensors=new Set}getMLContext(e){let t=this.backend.getMLContext(e);if(!t)throw new Error("MLContext not found for session.");return t}getMLOpSupportLimits(e){return this.backend.getMLOpSupportLimits(e)}reserveTensorId(){let e=Ni();return this.tensorTrackersById.set(e,new Wi(this)),e}releaseTensorId(e){let t=this.tensorTrackersById.get(e);t&&(this.tensorTrackersById.delete(e),t.tensorWrapper&&this.releaseTensor(t.tensorWrapper))}async ensureTensor(e,t,r,i,a){pe("verbose",()=>`[WebNN] TensorManager.ensureTensor {tensorId: ${t}, dataType: ${r}, shape: ${i}, copyOld: ${a}}`);let n=this.tensorTrackersById.get(t);if(!n)throw new Error("Tensor not found.");return n.ensureTensor(e,r,i,a)}upload(e,t){let r=this.tensorTrackersById.get(e);if(!r)throw new Error("Tensor not found.");r.upload(t)}async download(e,t){pe("verbose",()=>`[WebNN] TensorManager.download {tensorId: ${e}, dstBuffer: ${t?.byteLength}}`);let r=this.tensorTrackersById.get(e);if(!r)throw new Error("Tensor not found.");return r.download(t)}releaseTensorsForSession(e){for(let t of this.freeTensors)t.sessionId===e&&t.destroy();this.freeTensors=this.freeTensors.filter(t=>t.sessionId!==e)}registerTensor(e,t,r,i){let a=this.getMLContext(e),n=Ni(),s=new Ui({sessionId:e,context:a,tensor:t,dataType:r,shape:i});return this.tensorTrackersById.set(n,new Wi(this,s)),this.externalTensors.add(s),n}async getCachedTensor(e,t,r,i,a,n,s){let u=this.getMLContext(e);for(let[p,h]of this.freeTensors.entries())if(h.canReuseTensor(u,t,r)){pe("verbose",()=>`[WebNN] Reusing tensor {dataType: ${t}, ${s?`fallbackDataType: ${s},`:""} shape: ${r}`);let f=this.freeTensors.splice(p,1)[0];return f.sessionId=e,f}pe("verbose",()=>`[WebNN] MLContext.createTensor {dataType: ${t}, ${s?`fallbackDataType: ${s},`:""} shape: ${r}}`);let l=await u.createTensor({dataType:s??t,shape:r,dimensions:r,usage:i,writable:a,readable:n});return new Ui({sessionId:e,context:u,tensor:l,dataType:t,shape:r,fallbackDataType:s})}releaseTensor(e){this.externalTensors.has(e)&&this.externalTensors.delete(e),this.freeTensors.push(e)}},gp=(...e)=>new To(...e)}),Jt,Eo,yp,Jg=q(()=>{ie(),Nt(),mp(),Yg(),ut(),Jt=new Map([[1,"float32"],[10,"float16"],[6,"int32"],[12,"uint32"],[7,"int64"],[13,"uint64"],[22,"int4"],[21,"uint4"],[3,"int8"],[2,"uint8"],[9,"uint8"]]),Eo=(e,t)=>{if(e===t)return!0;if(e===void 0||t===void 0)return!1;let r=Object.keys(e).sort(),i=Object.keys(t).sort();return r.length===i.length&&r.every((a,n)=>a===i[n]&&e[a]===t[a])},yp=class{constructor(e){this.tensorManager=gp(this),this.mlContextBySessionId=new Map,this.sessionIdsByMLContext=new Map,this.mlContextCache=[],this.sessionGraphInputs=new Map,this.sessionGraphOutputs=new Map,this.temporaryGraphInputs=[],this.temporaryGraphOutputs=[],this.temporarySessionTensorIds=new Map,this.mlOpSupportLimitsBySessionId=new Map,Ha(e.logLevel,!!e.debug)}get currentSessionId(){if(this.activeSessionId===void 0)throw new Error("No active session");return this.activeSessionId}onRunStart(e){pe("verbose",()=>`[WebNN] onRunStart {sessionId: ${e}}`),this.activeSessionId=e}onRunEnd(e){pe("verbose",()=>`[WebNN] onRunEnd {sessionId: ${e}}`);let t=this.temporarySessionTensorIds.get(e);if(t){for(let r of t)pe("verbose",()=>`[WebNN] releasing temporary tensor {tensorId: ${r}}`),this.tensorManager.releaseTensorId(r);this.temporarySessionTensorIds.delete(e),this.activeSessionId=void 0}}async createMLContext(e){if(e instanceof GPUDevice){let r=this.mlContextCache.findIndex(i=>i.gpuDevice===e);if(r!==-1)return this.mlContextCache[r].mlContext;{let i=await navigator.ml.createContext(e);return this.mlContextCache.push({gpuDevice:e,mlContext:i}),i}}else if(e===void 0){let r=this.mlContextCache.findIndex(i=>i.options===void 0&&i.gpuDevice===void 0);if(r!==-1)return this.mlContextCache[r].mlContext;{let i=await navigator.ml.createContext();return this.mlContextCache.push({mlContext:i}),i}}let t=this.mlContextCache.findIndex(r=>Eo(r.options,e));if(t!==-1)return this.mlContextCache[t].mlContext;{let r=await navigator.ml.createContext(e);return this.mlContextCache.push({options:e,mlContext:r}),r}}registerMLContext(e,t){this.mlContextBySessionId.set(e,t);let r=this.sessionIdsByMLContext.get(t);r||(r=new Set,this.sessionIdsByMLContext.set(t,r)),r.add(e),this.mlOpSupportLimitsBySessionId.has(e)||this.mlOpSupportLimitsBySessionId.set(e,t.opSupportLimits()),this.temporaryGraphInputs.length>0&&(this.sessionGraphInputs.set(e,this.temporaryGraphInputs),this.temporaryGraphInputs=[]),this.temporaryGraphOutputs.length>0&&(this.sessionGraphOutputs.set(e,this.temporaryGraphOutputs),this.temporaryGraphOutputs=[])}onReleaseSession(e){this.sessionGraphInputs.delete(e),this.sessionGraphOutputs.delete(e);let t=this.mlContextBySessionId.get(e);if(!t)return;this.tensorManager.releaseTensorsForSession(e),this.mlContextBySessionId.delete(e),this.mlOpSupportLimitsBySessionId.delete(e);let r=this.sessionIdsByMLContext.get(t);if(r.delete(e),r.size===0){this.sessionIdsByMLContext.delete(t);let i=this.mlContextCache.findIndex(a=>a.mlContext===t);i!==-1&&this.mlContextCache.splice(i,1)}}getMLContext(e){return this.mlContextBySessionId.get(e)}getMLOpSupportLimits(e){return this.mlOpSupportLimitsBySessionId.get(e)}reserveTensorId(){return this.tensorManager.reserveTensorId()}releaseTensorId(e){pe("verbose",()=>`[WebNN] releaseTensorId {tensorId: ${e}}`),this.tensorManager.releaseTensorId(e)}async ensureTensor(e,t,r,i,a){let n=Jt.get(r);if(!n)throw new Error(`Unsupported ONNX data type: ${r}`);return this.tensorManager.ensureTensor(e??this.currentSessionId,t,n,i,a)}async createTemporaryTensor(e,t,r){pe("verbose",()=>`[WebNN] createTemporaryTensor {onnxDataType: ${t}, shape: ${r}}`);let i=Jt.get(t);if(!i)throw new Error(`Unsupported ONNX data type: ${t}`);let a=this.tensorManager.reserveTensorId();await this.tensorManager.ensureTensor(e,a,i,r,!1);let n=this.temporarySessionTensorIds.get(e);return n?n.push(a):this.temporarySessionTensorIds.set(e,[a]),a}uploadTensor(e,t){if(!be().shouldTransferToMLTensor)throw new Error("Trying to upload to a MLTensor while shouldTransferToMLTensor is false");pe("verbose",()=>`[WebNN] uploadTensor {tensorId: ${e}, data: ${t.byteLength}}`),this.tensorManager.upload(e,t)}async downloadTensor(e,t){return this.tensorManager.download(e,t)}createMLTensorDownloader(e,t){return async()=>{let r=await this.tensorManager.download(e);return Fa(r,t)}}registerMLTensor(e,t,r,i){let a=Jt.get(r);if(!a)throw new Error(`Unsupported ONNX data type: ${r}`);let n=this.tensorManager.registerTensor(e,t,a,i);return pe("verbose",()=>`[WebNN] registerMLTensor {tensor: ${t}, dataType: ${a}, dimensions: ${i}} -> {tensorId: ${n}}`),n}registerMLConstant(e,t,r,i,a,n,s=!1){if(!n)throw new Error("External mounted files are not available.");let u=e;e.startsWith("./")&&(u=e.substring(2));let l=n.get(u);if(!l)throw new Error(`File with name ${u} not found in preloaded files.`);if(t+r>l.byteLength)throw new Error("Out of bounds: data offset and length exceed the external file data size.");let p=l.slice(t,t+r).buffer,h;switch(a.dataType){case"float32":h=new Float32Array(p);break;case"float16":h=typeof Float16Array<"u"&&Float16Array.from?new Float16Array(p):new Uint16Array(p);break;case"int32":h=new Int32Array(p);break;case"uint32":h=new Uint32Array(p);break;case"int64":if(s){let f=va(new Uint8Array(p),"int64");h=new Int32Array(f.buffer),a.dataType="int32"}else h=new BigInt64Array(p);break;case"uint64":h=new BigUint64Array(p);break;case"int8":h=new Int8Array(p);break;case"int4":case"uint4":case"uint8":h=new Uint8Array(p);break;default:throw new Error(`Unsupported data type: ${a.dataType} in creating WebNN Constant from external data.`)}return pe("verbose",()=>`[WebNN] registerMLConstant {dataType: ${a.dataType}, shape: ${a.shape}}} ${s?"(Note: it was int64 data type and registered to int32 as workaround)":""}`),i.constant(a,h)}registerGraphInput(e){this.temporaryGraphInputs.push(e)}registerGraphOutput(e){this.temporaryGraphOutputs.push(e)}isGraphInput(e,t){let r=this.sessionGraphInputs.get(e);return r?r.includes(t):!1}isGraphOutput(e,t){let r=this.sessionGraphOutputs.get(e);return r?r.includes(t):!1}isGraphInputOutputTypeSupported(e,t,r=!0){let i=Jt.get(zt(t)),a=this.mlOpSupportLimitsBySessionId.get(e);return typeof i>"u"?!1:r?!!a?.input.dataTypes.includes(i):!!a?.output.dataTypes.includes(i)}flush(){}}}),ja=q(()=>{}),qi,Ar,Or,Io,zo,Li,xa,Co,_p,ey=q(()=>{ut(),ja(),qi=new Map([[64,250],[128,200],[256,200],[512,200],[2048,230],[4096,200],[8192,50],[16384,50],[32768,50],[65536,50],[131072,50],[262144,50],[524288,50],[1048576,50],[2097152,30],[4194304,20],[8388608,10],[12582912,10],[16777216,10],[26214400,15],[33554432,22],[44236800,2],[58982400,6],[67108864,6],[134217728,6],[167772160,6]]),Ar=[],Or=e=>Math.ceil(Number(e)/16)*16,Io=e=>{for(let t=0;t<Ar.length;t++){let r=Ar[t];if(e<=r)return r}return Math.ceil(e/16)*16},zo=1,Li=()=>zo++,xa=async(e,t,r,i)=>{let a=Or(r),n=e.device.createBuffer({size:a,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});try{let s=e.getCommandEncoder();e.endComputePass(),s.copyBufferToBuffer(t,0,n,0,a),e.flush(),await n.mapAsync(GPUMapMode.READ);let u=n.getMappedRange();if(i){let l=i();return l.set(new Uint8Array(u,0,r)),l}else return new Uint8Array(u.slice(0,r))}finally{n.destroy()}},Co=class{constructor(e){this.backend=e,this.storageCache=new Map,this.freeBuffers=new Map,this.freeUniformBuffers=new Map,this.buffersPending=[],this.capturedPendingBuffers=new Map;for(let[t]of qi)Ar.push(t),this.freeBuffers.set(t,[]),this.freeUniformBuffers.set(t,[]);this.sessionCount=0}upload(e,t){let r=t.buffer,i=t.byteOffset,a=t.byteLength,n=Or(a),s=this.storageCache.get(e);if(!s)throw new Error("gpu data for uploading does not exist");if(Number(s.originalSize)!==a)throw new Error(`inconsistent data size. gpu data size=${s.originalSize}, data size=${a}`);let u=this.backend.device.createBuffer({mappedAtCreation:!0,size:n,usage:GPUBufferUsage.MAP_WRITE|GPUBufferUsage.COPY_SRC}),l=u.getMappedRange();new Uint8Array(l).set(new Uint8Array(r,i,a)),u.unmap();let p=this.backend.device.createCommandEncoder();p.copyBufferToBuffer(u,0,s.gpuData.buffer,0,n),this.backend.device.queue.submit([p.finish()]),u.destroy(),pe("verbose",()=>`[WebGPU] GpuDataManager.upload(id=${e})`)}memcpy(e,t){let r=this.storageCache.get(e);if(!r)throw new Error("source gpu data for memcpy does not exist");let i=this.storageCache.get(t);if(!i)throw new Error("destination gpu data for memcpy does not exist");if(r.originalSize!==i.originalSize)throw new Error("inconsistent source and destination gpu data size");let a=Or(r.originalSize),n=this.backend.getCommandEncoder();this.backend.endComputePass(),n.copyBufferToBuffer(r.gpuData.buffer,0,i.gpuData.buffer,0,a)}registerExternalBuffer(e,t,r){let i;if(r){if(i=r[0],e===r[1])return pe("verbose",()=>`[WebGPU] GpuDataManager.registerExternalBuffer(size=${t}) => id=${i}, buffer is the same, skip.`),i;if(this.backend.capturedCommandList.has(this.backend.currentSessionId))throw new Error(`Registering a different external buffer under graph capture mode is not supported yet.
             Please use the previous external buffer!`)}else i=Li();return this.storageCache.set(i,{gpuData:{id:i,type:0,buffer:e},originalSize:t}),pe("verbose",()=>`[WebGPU] GpuDataManager.registerExternalBuffer(size=${t}) => id=${i}, registered.`),i}unregisterExternalBuffer(e){e!==void 0&&(this.storageCache.delete(e),pe("verbose",()=>`[WebGPU] GpuDataManager.unregisterExternalBuffer() => id=${e}`))}create(e,t=GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST){let r=Io(e),i,a=(t&GPUBufferUsage.STORAGE)===GPUBufferUsage.STORAGE,n=(t&GPUBufferUsage.UNIFORM)===GPUBufferUsage.UNIFORM;if(a||n){let u=(a?this.freeBuffers:this.freeUniformBuffers).get(r);u?u.length>0?i=u.pop():i=this.backend.device.createBuffer({size:r,usage:t}):i=this.backend.device.createBuffer({size:r,usage:t})}else i=this.backend.device.createBuffer({size:r,usage:t});let s={id:Li(),type:0,buffer:i};return this.storageCache.set(s.id,{gpuData:s,originalSize:Number(e)}),pe("verbose",()=>`[WebGPU] GpuDataManager.create(size=${e}) => id=${s.id}`),s}get(e){return this.storageCache.get(e)?.gpuData}release(e){let t=typeof e=="bigint"?Number(e):e,r=this.storageCache.get(t);if(!r){if(this.storageCache.size===0)return 0;throw new Error("releasing data does not exist")}return pe("verbose",()=>`[WebGPU] GpuDataManager.release(id=${t}), gpuDataId=${r.gpuData.id}`),this.storageCache.delete(t),this.buffersPending.push(r.gpuData.buffer),r.originalSize}async download(e,t){let r=this.storageCache.get(Number(e));if(!r)throw new Error("data does not exist");await xa(this.backend,r.gpuData.buffer,r.originalSize,t)}refreshPendingBuffers(){if(this.buffersPending.length!==0)if(this.backend.sessionStatus==="default"){for(let e of this.buffersPending){let t=qi.get(e.size);if((e.usage&GPUBufferUsage.STORAGE)===GPUBufferUsage.STORAGE){let r=this.freeBuffers.get(e.size)||[];t===void 0||r.length>=t?e.destroy():r.push(e)}else if((e.usage&GPUBufferUsage.UNIFORM)===GPUBufferUsage.UNIFORM){let r=this.freeUniformBuffers.get(e.size)||[];t===void 0||r.length>=t?e.destroy():r.push(e)}else e.destroy()}this.buffersPending=[]}else{let e=this.capturedPendingBuffers.get(this.backend.currentSessionId);e||(e=[],this.capturedPendingBuffers.set(this.backend.currentSessionId,e));for(let t of this.buffersPending)e.push(t);this.buffersPending=[]}}dispose(){this.freeBuffers.forEach(e=>{e.forEach(t=>{t.destroy()})}),this.freeUniformBuffers.forEach(e=>{e.forEach(t=>{t.destroy()})}),this.storageCache.forEach(e=>{e.gpuData.buffer.destroy()}),this.capturedPendingBuffers.forEach(e=>{e.forEach(t=>{t.destroy()})}),this.storageCache=new Map,this.freeBuffers=new Map,this.freeUniformBuffers=new Map,this.capturedPendingBuffers=new Map}onCreateSession(){this.sessionCount+=1}onReleaseSession(e){let t=this.capturedPendingBuffers.get(e);t&&(t.forEach(r=>{r.destroy()}),this.capturedPendingBuffers.delete(e)),this.sessionCount-=1,this.sessionCount===0&&(pe("warning",()=>"[WebGPU] Clearing webgpu buffer cache"),this.storageCache.forEach(r=>{r.gpuData.buffer.destroy()}),this.storageCache=new Map)}},_p=(...e)=>new Co(...e)}),Ao,fe,ke=q(()=>{Ao=class{constructor(e){Object.assign(this,e)}get cacheKey(){return this.key||(this.key=Object.getOwnPropertyNames(this).sort().map(e=>`${this[e]}`).join(";")),this.key}},fe=e=>new Ao(e)}),Ht,Mr,ze,Re,J,Se,Sa,Gt,_t,Y,er,D,Q,bp,Ka,Oo,wp,se=q(()=>{ie(),ne(),Ht=64,Mr=(e,t)=>{if(t===3)throw new Error("vec3 has same alignment as vec4, use vec4 instead");switch(Number(e)){case 10:return t>1?`vec${t}<f16>`:"f16";case 1:return t>1?`vec${t}<f32>`:"f32";case 6:return t>1?`vec${t}<i32>`:"i32";case 12:return t>1?`vec${t}<u32>`:"u32";case 7:if(t>1)throw new Error("currently not supported vecX of uint64 yet");return["vec2<u32>","i32"];case 13:if(t>1)throw new Error("currently not supported vecX of uint64 yet");return["vec2<u32>","u32"];case 9:if(t!==4)throw new Error("bool must be vec4");return["u32","vec4<bool>"];case 22:return"i32";case 21:return"u32";default:throw new Error(`Unknown data type: ${e}`)}},ze=(e,t=1)=>{let r=Mr(e,t);return typeof r=="string"?r:r[0]},Re=(e,t=1)=>{let r=Mr(e,t);return typeof r=="string"?r:r[1]},J=(...e)=>{let t=[];return e.forEach(r=>{r.length!==0&&t.push({type:12,data:r},{type:12,data:M.computeStrides(r)})}),t},Se=e=>e%4===0?4:e%2===0?2:1,Sa=(e="f32",t,r="0")=>!t||t===1?`${e}(${r})`:`vec${t}<${e}>(${r})`,Gt=(e,t,r)=>e==="f32"?r:t===1?`f32(${r})`:`vec${t}<f32>(${r})`,_t=(e,t)=>t===4?`(${e}.x + ${e}.y + ${e}.z + ${e}.w)`:t===2?`(${e}.x + ${e}.y)`:t===3?`(${e}.x + ${e}.y + ${e}.z)`:e,Y=(e,t,r,i)=>e.startsWith("uniforms.")&&r>4?typeof t=="string"?i==="f16"?`${e}[(${t}) / 8][(${t}) % 8 / 4][(${t}) % 8 % 4]`:`${e}[(${t}) / 4][(${t}) % 4]`:i==="f16"?`${e}[${Math.floor(t/8)}][${Math.floor(t%8/4)}][${t%8%4}]`:`${e}[${Math.floor(t/4)}][${t%4}]`:r>1?`${e}[${t}]`:e,er=(e,t,r,i,a)=>{let n=typeof r=="number",s=n?r:r.length,u=[...new Array(s).keys()],l=s<2?"u32":s<=4?`vec${s}<u32>`:`array<u32, ${s}>`,p=Mr(t,a),h=typeof p=="string"?p:p[1],f=typeof p=="string"?p:p[0],g={indices:l,value:h,storage:f,tensor:t},y=O=>typeof O=="string"?O:`${O}u`,_={offsetToIndices:!1,indicesToOffset:!1,broadcastedIndicesToOffset:!1,set:!1,setByIndices:!1,get:!1,getByIndices:!1},w=n?"uniforms.":"",k=`${w}${e}_shape`,x=`${w}${e}_strides`,b="";for(let O=0;O<s-1;O++)b+=`
    let dim${O} = current / ${Y(x,O,s)};
    let rest${O} = current % ${Y(x,O,s)};
    indices[${O}] = dim${O};
    current = rest${O};
    `;b+=`indices[${s-1}] = current;`;let T=s<2?"":`
  fn o2i_${e}(offset: u32) -> ${g.indices} {
    var indices: ${g.indices};
    var current = offset;
    ${b}
    return indices;
  }`,S=O=>(_.offsetToIndices=!0,s<2?O:`o2i_${e}(${O})`),I=[];if(s>=2)for(let O=s-1;O>=0;O--)I.push(`${Y(x,O,s)} * (indices[${O}])`);let A=s<2?"":`
  fn i2o_${e}(indices: ${g.indices}) -> u32 {
    return ${I.join("+")};
  }`,z=O=>(_.indicesToOffset=!0,s<2?O:`i2o_${e}(${O})`),v=(...O)=>s===0?"0u":`${g.indices}(${O.map(y).join(",")})`,N=(O,W)=>s<2?`${O}`:`${Y(O,W,s)}`,U=(O,W,H)=>s<2?`${O}=${H};`:`${Y(O,W,s)}=${H};`,Z={},G=(O,W)=>{_.broadcastedIndicesToOffset=!0;let H=`${W.name}broadcastedIndicesTo${e}Offset`;if(H in Z)return`${H}(${O})`;let V=[];for(let Ee=s-1;Ee>=0;Ee--){let Oe=W.indicesGet("outputIndices",Ee+W.rank-s);V.push(`${N(x,Ee)} * (${Oe} % ${N(k,Ee)})`)}return Z[H]=`fn ${H}(outputIndices: ${W.type.indices}) -> u32 {
             return ${V.length>0?V.join("+"):"0u"};
           }`,`${H}(${O})`},K=(O,W)=>(()=>{if(g.storage===g.value)return`${e}[${O}]=${W};`;if(g.storage==="vec2<u32>"&&g.value==="i32")return`${e}[${O}]=vec2<u32>(u32(${W}), select(0u, 0xFFFFFFFFu, ${W} < 0));`;if(g.storage==="vec2<u32>"&&g.value==="u32")return`${e}[${O}]=vec2<u32>(u32(${W}), 0u);`;if(g.storage==="u32"&&g.value==="vec4<bool>")return`${e}[${O}]=dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(${W}));`;throw new Error(`not supported combination of storage type ${g.storage} and value type ${g.value} yet`)})(),R=O=>(()=>{if(g.storage===g.value)return`${e}[${O}]`;if(g.storage==="vec2<u32>"&&g.value==="i32")return`i32(${e}[${O}].x)`;if(g.storage==="vec2<u32>"&&g.value==="u32")return`u32(${e}[${O}].x)`;if(g.storage==="u32"&&g.value==="vec4<bool>")return`vec4<bool>(bool(${e}[${O}] & 0xFFu), bool(${e}[${O}] & 0xFF00u), bool(${e}[${O}] & 0xFF0000u), bool(${e}[${O}] & 0xFF000000u))`;throw new Error(`not supported combination of storage type ${g.storage} and value type ${g.value} yet`)})(),P=s<2?"":`
  fn get_${e}ByIndices(indices: ${g.indices}) -> ${h} {
    return ${R(`i2o_${e}(indices)`)};
  }`,j=s<2?"":(()=>{let O=u.map(H=>`d${H}: u32`).join(", "),W=u.map(H=>`d${H}`).join(", ");return`
  fn get_${e}(${O}) -> ${h} {
    return get_${e}ByIndices(${v(W)});
  }`})(),te=(...O)=>{if(O.length!==s)throw new Error(`indices length must be ${s}`);let W=O.map(y).join(",");return s===0?R("0u"):s===1?R(W[0]):(_.get=!0,_.getByIndices=!0,_.indicesToOffset=!0,`get_${e}(${W})`)},ee=O=>s<2?R(O):(_.getByIndices=!0,_.indicesToOffset=!0,`get_${e}ByIndices(${O})`),re=s<2?"":`
  fn set_${e}ByIndices(indices: ${g.indices}, value: ${h}) {
    ${K(`i2o_${e}(indices)`,"value")}
  }`,ae=s<2?"":(()=>{let O=u.map(H=>`d${H}: u32`).join(", "),W=u.map(H=>`d${H}`).join(", ");return`
  fn set_${e}(${O}, value: ${h}) {
    set_${e}ByIndices(${v(W)}, value);
  }`})();return{impl:()=>{let O=[],W=!1;return _.offsetToIndices&&(O.push(T),W=!0),_.indicesToOffset&&(O.push(A),W=!0),_.broadcastedIndicesToOffset&&(Object.values(Z).forEach(H=>O.push(H)),W=!0),_.set&&(O.push(ae),W=!0),_.setByIndices&&(O.push(re),W=!0),_.get&&(O.push(j),W=!0),_.getByIndices&&(O.push(P),W=!0),!n&&W&&O.unshift(`const ${k} = ${g.indices}(${r.join(",")});`,`const ${x} = ${g.indices}(${M.computeStrides(r).join(",")});`),O.join(`
`)},type:g,offsetToIndices:S,indicesToOffset:z,broadcastedIndicesToOffset:G,indices:v,indicesGet:N,indicesSet:U,set:(...O)=>{if(O.length!==s+1)throw new Error(`indices length must be ${s}`);let W=O[s];if(typeof W!="string")throw new Error("value must be string");let H=O.slice(0,s).map(y).join(",");return s===0?K("0u",W):s===1?K(H[0],W):(_.set=!0,_.setByIndices=!0,_.indicesToOffset=!0,`set_${e}(${H}, ${W})`)},setByOffset:K,setByIndices:(O,W)=>s<2?K(O,W):(_.setByIndices=!0,_.indicesToOffset=!0,`set_${e}ByIndices(${O}, ${W});`),get:te,getByOffset:R,getByIndices:ee,usage:i,name:e,strides:x,shape:k,rank:s}},D=(e,t,r,i=1)=>er(e,t,r,"input",i),Q=(e,t,r,i=1)=>er(e,t,r,"output",i),bp=(e,t,r)=>er(e,t,r,"atomicOutput",1),Ka=(e,t,r,i=1)=>er(e,t,r,"internal",i),Oo=class{constructor(e,t){this.normalizedDispatchGroup=e,this.limits=t,this.internalVariables=[],this.variables=[],this.uniforms=[],this.variableIndex=0}guardAgainstOutOfBoundsWorkgroupSizes(e){return`if (global_idx >= ${typeof e=="number"?`${e}u`:e}) { return; }`}mainStart(e=Ht){let t=typeof e=="number"?e:e[0],r=typeof e=="number"?1:e[1],i=typeof e=="number"?1:e[2];if(t>this.limits.maxComputeWorkgroupSizeX||r>this.limits.maxComputeWorkgroupSizeY||i>this.limits.maxComputeWorkgroupSizeZ)throw new Error(`workgroup size [${t}, ${r}, ${i}] exceeds the maximum workgroup size [${this.limits.maxComputeWorkgroupSizeX}, ${this.limits.maxComputeWorkgroupSizeY}, ${this.limits.maxComputeWorkgroupSizeZ}].`);if(t*r*i>this.limits.maxComputeInvocationsPerWorkgroup)throw new Error(`workgroup size [${t}, ${r}, ${i}] exceeds the maximum workgroup invocations ${this.limits.maxComputeInvocationsPerWorkgroup}.`);let a=this.normalizedDispatchGroup[1]===1&&this.normalizedDispatchGroup[2]===1,n=a?`@builtin(global_invocation_id) global_id : vec3<u32>,
    @builtin(workgroup_id) workgroup_id : vec3<u32>,
    @builtin(local_invocation_index) local_idx : u32,
    @builtin(local_invocation_id) local_id : vec3<u32>`:`@builtin(global_invocation_id) global_id : vec3<u32>,
                                             @builtin(local_invocation_id) local_id : vec3<u32>,
    @builtin(local_invocation_index) local_idx : u32,
    @builtin(workgroup_id) workgroup_id : vec3<u32>,
    @builtin(num_workgroups) num_workgroups : vec3<u32>`,s=a?`let global_idx = global_id.x;
         let workgroup_index = workgroup_id.x;`:`let workgroup_index = workgroup_id.z * num_workgroups[0] * num_workgroups[1] +
             workgroup_id.y * num_workgroups[0] + workgroup_id.x;
         let global_idx = workgroup_index * ${t*r*i}u + local_idx;`;return`@compute @workgroup_size(${t}, ${r}, ${i})
  fn main(${n}) {
    ${s}
  `}appendVariableUniforms(e){e.rank!==0&&(e.shape.startsWith("uniforms.")&&this.uniforms.push({name:e.shape.replace("uniforms.",""),type:"u32",length:e.rank}),e.strides.startsWith("uniforms.")&&this.uniforms.push({name:e.strides.replace("uniforms.",""),type:"u32",length:e.rank}))}declareVariable(e,t){if(e.usage==="internal")throw new Error("cannot use internal variable with declareVariable(). use registerInternalVariables() instead.");this.variables.push(e),this.appendVariableUniforms(e);let r=e.usage==="input"?"read":"read_write",i=e.usage==="atomicOutput"?"atomic<i32>":e.type.storage;return`@group(0) @binding(${t}) var<storage, ${r}> ${e.name}: array<${i}>;`}declareVariables(...e){return e.map(t=>this.declareVariable(t,this.variableIndex++)).join(`
`)}registerInternalVariable(e){if(e.usage!=="internal")throw new Error("cannot use input or output variable with registerInternalVariable(). use declareVariables() instead.");this.internalVariables.push(e),this.appendVariableUniforms(e)}registerInternalVariables(...e){return e.forEach(t=>this.registerInternalVariable(t)),this}registerUniform(e,t,r=1){return this.uniforms.push({name:e,type:t,length:r}),this}registerUniforms(e){return this.uniforms=this.uniforms.concat(e),this}uniformDeclaration(){if(this.uniforms.length===0)return"";let e=[];for(let{name:t,type:r,length:i}of this.uniforms)if(i&&i>4)r==="f16"?e.push(`@align(16) ${t}:array<mat2x4<${r}>, ${Math.ceil(i/8)}>`):e.push(`${t}:array<vec4<${r}>, ${Math.ceil(i/4)}>`);else{let a=i==null||i===1?r:`vec${i}<${r}>`;e.push(`${t}:${a}`)}return`
      struct Uniforms { ${e.join(", ")} };
      @group(0) @binding(${this.variableIndex}) var<uniform> uniforms: Uniforms;`}get additionalImplementations(){return this.uniformDeclaration()+this.variables.map(e=>e.impl()).join(`
`)+this.internalVariables.map(e=>e.impl()).join(`
`)}get variablesInfo(){if(this.uniforms.length===0)return;let e=t=>[12,10,1,6][["u32","f16","f32","i32"].indexOf(t)];return this.uniforms.map(t=>[e(t.type),t.length??1])}},wp=(e,t)=>new Oo(e,t)}),Mo,Gi,Ro,Bo,Do,No,Ue,$p,vp,bt=q(()=>{ie(),ne(),ke(),se(),Mo=(e,t)=>{if(!e||e.length!==1)throw new Error("Transpose requires 1 input.");if(t.length!==0&&t.length!==e[0].dims.length)throw new Error(`perm size ${t.length} does not match input rank ${e[0].dims.length}`)},Gi=(e,t)=>t.length!==0?t:[...new Array(e).keys()].reverse(),Ro=(e,t)=>M.sortBasedOnPerm(e,Gi(e.length,t)),Bo=(e,t,r,i)=>{let a=`fn perm(i: ${i.type.indices}) -> ${r.type.indices} {
    var a: ${r.type.indices};`;for(let n=0;n<t;++n)a+=`a[${e[n]}]=i[${n}];`;return a+="return a;}"},Do=(e,t)=>{let r=[],i=[];for(let a=0;a<e.length;++a)e[a]!==1&&r.push(e[a]),e[t[a]]!==1&&i.push(t[a]);return{newShape:r,newPerm:i}},No=(e,t)=>{let r=0;for(let i=0;i<e.length;++i)if(t[e[i]]!==1){if(e[i]<r)return!1;r=e[i]}return!0},Ue=(e,t)=>{let r=e.dataType,i=e.dims.length,a=Gi(i,t),n=Ro(e.dims,a),s=e.dims,u=n,l=i<2||No(a,e.dims),p;if(l)return p=_=>{let w=D("input",r,s,4),k=Q("output",r,u,4);return`
  ${_.registerUniform("output_size","u32").declareVariables(w,k)}
  ${_.mainStart()}
    ${_.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    output[global_idx] = input[global_idx];
  }`},{name:"TransposeCopy",shaderCache:{inputDependencies:["type"]},getRunData:()=>{let _=M.size(n);return{outputs:[{dims:n,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(_/64/4)},programUniforms:[{type:12,data:Math.ceil(_/4)}]}},getShaderSource:p};let{newShape:h,newPerm:f}=Do(e.dims,a),g=M.areEqual(f,[2,3,1]),y=M.areEqual(f,[3,1,2]);if(h.length===2||g||y){s=g?[h[0],h[1]*h[2]]:y?[h[0]*h[1],h[2]]:h,u=[s[1],s[0]];let _=16;return p=w=>{let k=D("a",r,s.length),x=Q("output",r,u.length);return`
  ${w.registerUniform("output_size","u32").declareVariables(k,x)}
  var<workgroup> tile : array<array<${x.type.value}, ${_+1}>, ${_}>;
  ${w.mainStart([_,_,1])}
    let stride = (uniforms.output_shape[1] - 1) / ${_} + 1;
    let workgroup_id_x = workgroup_index % stride;
    let workgroup_id_y = workgroup_index / stride;
    let input_col = workgroup_id_y * ${_}u + local_id.x;
    let input_row = workgroup_id_x * ${_}u + local_id.y;
    if (input_row < uniforms.a_shape[0] && input_col < uniforms.a_shape[1]) {
      tile[local_id.y][local_id.x] = ${k.getByIndices(`${k.type.indices}(input_row, input_col)`)};
    }
    workgroupBarrier();

    let output_col = workgroup_id_x * ${_}u + local_id.x;
    let output_row = workgroup_id_y * ${_}u + local_id.y;
    if (output_row < uniforms.output_shape[0] && output_col < uniforms.output_shape[1]) {
      ${x.setByIndices(`${x.type.indices}(output_row, output_col)`,"tile[local_id.x][local_id.y]")}
    }
  }`},{name:"TransposeShared",shaderCache:{inputDependencies:["type"]},getRunData:()=>{let w=M.size(n);return{outputs:[{dims:n,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(u[1]/_),y:Math.ceil(u[0]/_)},programUniforms:[{type:12,data:w},...J(s,u)]}},getShaderSource:p}}return p=_=>{let w=D("a",r,s.length),k=Q("output",r,u.length);return`
  ${_.registerUniform("output_size","u32").declareVariables(w,k)}

  ${Bo(a,i,w,k)}

  ${_.mainStart()}
    ${_.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let indices = ${k.offsetToIndices("global_idx")};
    let aIndices = perm(indices);

    ${k.setByOffset("global_idx",w.getByIndices("aIndices"))}
  }`},{name:"Transpose",shaderCache:{hint:`${t}`,inputDependencies:["rank"]},getRunData:()=>{let _=M.size(n);return{outputs:[{dims:n,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(_/64)},programUniforms:[{type:12,data:_},...J(s,u)]}},getShaderSource:p}},$p=(e,t)=>{Mo(e.inputs,t.perm),e.compute(Ue(e.inputs[0],t.perm))},vp=e=>fe({perm:e.perm})}),Po,Uo,Wo,qo,Lo,Go,Vo,Ho,Fo,jo,Ve,xp,Sp,kp,Tp,Ep,Ip,zp,Cp,Ap,Op,ty=q(()=>{ie(),ne(),se(),Za(),bt(),Po={max:"select(bestValue, candidate, candidate > bestValue)",min:"select(bestValue, candidate, candidate < bestValue)",mean:"bestValue + candidate",sum:"bestValue + candidate",prod:"bestValue * candidate",sumSquare:"bestValue + candidate * candidate",logSumExp:"bestValue + exp(candidate)",l1:"bestValue + abs(candidate)",l2:"bestValue + candidate * candidate",logSum:"bestValue + candidate"},Uo={max:"select(bestValue, candidate, candidate > bestValue)",min:"select(bestValue, candidate, candidate < bestValue)",mean:"bestValue + candidate",sum:"bestValue + candidate",prod:"bestValue * candidate",sumSquare:"bestValue + candidate",logSumExp:"bestValue + candidate",l1:"bestValue + candidate",l2:"bestValue + candidate",logSum:"bestValue + candidate"},Wo={max:"_A[offset]",min:"_A[offset]",mean:"0",sum:"0",prod:"1",sumSquare:"0",logSumExp:"0",l1:"0",l2:"0",logSum:"0"},qo={max:"bestValue",min:"bestValue",sum:"bestValue",prod:"bestValue",sumSquare:"bestValue",logSumExp:"log(bestValue)",l1:"bestValue",l2:"sqrt(bestValue)",logSum:"log(bestValue)"},Lo=(e,t)=>{let r=[];for(let i=t-e;i<t;++i)r.push(i);return r},Go=(e,t)=>{let r=[],i=e.length;for(let n=0;n<i;n++)t.indexOf(n)===-1&&r.push(e[n]);let a=t.map(n=>e[n]);return[r,a]},Vo=(e,t)=>{let r=e.length+t.length,i=[],a=0;for(let n=0;n<r;n++)t.indexOf(n)===-1?i.push(e[a++]):i.push(1);return i},Ho=(e,t)=>{for(let r=0;r<e.length;++r)if(e[e.length-r-1]!==t-1-r)return!1;return!0},Fo=(e,t)=>{let r=[];if(!Ho(e,t)){for(let i=0;i<t;++i)e.indexOf(i)===-1&&r.push(i);e.forEach(i=>r.push(i))}return r},jo=(e,t,r,i,a,n,s)=>{let u=r[0].dims,l=M.size(n),p=M.size(s),h=D("_A",r[0].dataType,u),f=Q("output",a,n),g=64;l===1&&(g=256);let y=`
          var<workgroup> aBestValues : array<f32, ${g}>;
       `,_=w=>`
        ${w.registerUniform("reduceSize","u32").declareVariables(h,f)}
        ${y}
        fn DIV_CEIL(a : u32, b : u32) -> u32 {
          return ((a - 1u) / b + 1u);
         }
         ${w.mainStart(g)}

          let outputIndex = global_idx / ${g};
          let offset = outputIndex * uniforms.reduceSize;

          var bestValue = f32(${Wo[i]});
          let Length = uniforms.reduceSize;
          for (var k = local_idx; k < Length; k = k + ${g}) {
           let candidate = f32(${h.getByOffset("offset + k")});
           bestValue = ${Po[i]};
          }
          aBestValues[local_idx] = bestValue;
          workgroupBarrier();

         var reduceSize = min(Length, ${g}u);
         for (var currentSize = reduceSize / 2u; reduceSize > 1u;
             currentSize = reduceSize / 2u) {
           let interval = DIV_CEIL(reduceSize, 2u);
           if (local_idx < currentSize) {
            let candidate = aBestValues[local_idx + interval];
            bestValue = ${Uo[i]};
            aBestValues[local_idx] = bestValue;
           }
           reduceSize = interval;
           workgroupBarrier();
         }

         if (local_idx == 0u) {
          ${f.setByOffset("outputIndex",`${i==="mean"?`${f.type.storage}(bestValue / f32(uniforms.reduceSize))`:`${f.type.storage}(${qo[i]})`}`)};
         }
        }`;return{name:e,shaderCache:{hint:`${t};${g}`,inputDependencies:["type"]},getShaderSource:_,getRunData:()=>({outputs:[{dims:n,dataType:a}],dispatchGroup:{x:l},programUniforms:[{type:12,data:p}]})}},Ve=(e,t,r,i)=>{let a=e.inputs.length===1?r:ka(e.inputs,r),n=a.axes;n.length===0&&!a.noopWithEmptyAxes&&(n=e.inputs[0].dims.map((y,_)=>_));let s=M.normalizeAxes(n,e.inputs[0].dims.length),u=s,l=e.inputs[0],p=Fo(u,e.inputs[0].dims.length);p.length>0&&(l=e.compute(Ue(e.inputs[0],p),{inputs:[0],outputs:[-1]})[0],u=Lo(u.length,l.dims.length));let[h,f]=Go(l.dims,u),g=h;a.keepDims&&(g=Vo(h,s)),e.compute(jo(t,a.cacheKey,[l],i,e.inputs[0].dataType,g,f),{inputs:[l]})},xp=(e,t)=>{Ve(e,"ReduceMeanShared",t,"mean")},Sp=(e,t)=>{Ve(e,"ReduceL1Shared",t,"l1")},kp=(e,t)=>{Ve(e,"ReduceL2Shared",t,"l2")},Tp=(e,t)=>{Ve(e,"ReduceLogSumExpShared",t,"logSumExp")},Ep=(e,t)=>{Ve(e,"ReduceMaxShared",t,"max")},Ip=(e,t)=>{Ve(e,"ReduceMinShared",t,"min")},zp=(e,t)=>{Ve(e,"ReduceProdShared",t,"prod")},Cp=(e,t)=>{Ve(e,"ReduceSumShared",t,"sum")},Ap=(e,t)=>{Ve(e,"ReduceSumSquareShared",t,"sumSquare")},Op=(e,t)=>{Ve(e,"ReduceLogSumShared",t,"logSum")}}),He,Ko,Kr,ka,Fe,Zo,Xo,Qo,Yo,Jo,eu,tu,ru,iu,au,je,Mp,Rp,Bp,Dp,Np,Pp,Up,Wp,qp,Lp,Za=q(()=>{ie(),ne(),ke(),se(),ty(),He=e=>{if(!e||e.length===0||e.length>2)throw new Error("Reduce op requires 1 or 2 inputs.");if(e.length===2&&e[1].dims.length!==1)throw new Error("Invalid axes input dims.")},Ko=e=>["","",`var value = ${e.getByIndices("input_indices")};`,""],Kr=(e,t,r,i,a,n,s=!1,u=!1)=>{let l=[],p=r[0].dims,h=p.length,f=M.normalizeAxes(a,h),g=!u&&f.length===0;p.forEach((w,k)=>{g||f.indexOf(k)>=0?s&&l.push(1):l.push(w)});let y=l.length,_=M.size(l);return{name:e,shaderCache:t,getShaderSource:w=>{let k=[],x=D("_A",r[0].dataType,h),b=Q("output",n,y),T=i(x,b,f),S=T[2];for(let I=0,A=0;I<h;I++)g||f.indexOf(I)>=0?(s&&A++,S=`for(var j${I}: u32 = 0; j${I} < ${p[I]}; j${I}++) {
                  ${T[2].includes("last_index")?`let last_index = j${I};`:""}
                  ${x.indicesSet("input_indices",I,`j${I}`)}
                  ${S}
                }`):(k.push(`${x.indicesSet("input_indices",I,b.indicesGet("output_indices",A))};`),A++);return`

        ${w.registerUniform("output_size","u32").declareVariables(x,b)}

        ${w.mainStart()}
          ${w.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          var input_indices: ${x.type.indices};
          let output_indices = ${b.offsetToIndices("global_idx")};

          ${k.join(`
`)}
          ${T[0]}       // init ops for reduce max/min
          ${T[1]}
          ${S}
          ${T[3]}
          ${T.length===4?b.setByOffset("global_idx","value"):T.slice(4).join(`
`)}
        }`},getRunData:()=>({outputs:[{dims:l,dataType:n}],dispatchGroup:{x:Math.ceil(_/64)},programUniforms:[{type:12,data:_},...J(p,l)]})}},ka=(e,t)=>{let r=[];return e[1].dims[0]>0&&e[1].getBigInt64Array().forEach(i=>r.push(Number(i))),fe({axes:r,keepDims:t.keepDims,noopWithEmptyAxes:t.noopWithEmptyAxes})},Fe=(e,t,r,i)=>{let a=e.inputs,n=a.length===1?r:ka(a,r);e.compute(Kr(t,{hint:n.cacheKey,inputDependencies:["rank"]},[a[0]],n.noopWithEmptyAxes&&n.axes.length===0?Ko:i,n.axes,a[0].dataType,n.keepDims,n.noopWithEmptyAxes),{inputs:[0]})},Zo=(e,t)=>{He(e.inputs),Fe(e,"ReduceLogSum",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += ${r.getByIndices("input_indices")};`,"value = log(value);"])},Xo=(e,t)=>{He(e.inputs),Fe(e,"ReduceL1",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += abs(${r.getByIndices("input_indices")});`,""])},Qo=(e,t)=>{He(e.inputs),Fe(e,"ReduceL2",t,(r,i)=>[`var t = ${i.type.value}(0); var value = ${i.type.value}(0);`,"",`t = ${r.getByIndices("input_indices")}; value += (t * t);`,"value = sqrt(value);"])},Yo=(e,t)=>{He(e.inputs),Fe(e,"ReduceLogSumExp",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += exp(${r.getByIndices("input_indices")});`,"value = log(value);"])},Jo=(e,t)=>{He(e.inputs),Fe(e,"ReduceMax",t,(r,i,a)=>{let n=[];for(let s=0;s<r.rank;s++)(a.indexOf(s)>=0||a.length===0)&&n.push(r.indicesSet("input_indices",s,0));return[`${n.join(`
`)}`,`var value = ${r.getByIndices("input_indices")};`,`value = max(value, ${r.getByIndices("input_indices")});`,""]})},eu=(e,t)=>{He(e.inputs),Fe(e,"ReduceMean",t,(r,i,a)=>{let n=1;for(let s=0;s<r.rank;s++)(a.indexOf(s)>=0||a.length===0)&&(n*=e.inputs[0].dims[s]);return["var sum = f32(0);","",`sum += f32(${r.getByIndices("input_indices")});`,`let value = ${i.type.value}(sum / ${n});`]})},tu=(e,t)=>{He(e.inputs),Fe(e,"ReduceMin",t,(r,i,a)=>{let n=[];for(let s=0;s<r.rank;s++)(a.indexOf(s)>=0||a.length===0)&&n.push(`input_indices[${s}] = 0;`);return[`${n.join(`
`)}`,`var value = ${r.getByIndices("input_indices")};`,`value = min(value, ${r.getByIndices("input_indices")});`,""]})},ru=(e,t)=>{He(e.inputs),Fe(e,"ReduceProd",t,(r,i)=>[`var value = ${i.type.storage}(1);`,"",`value *= ${r.getByIndices("input_indices")};`,""])},iu=(e,t)=>{He(e.inputs),Fe(e,"ReduceSum",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += ${r.getByIndices("input_indices")};`,""])},au=(e,t)=>{He(e.inputs),Fe(e,"ReduceSumSquare",t,(r,i)=>[`var t = ${i.type.value}(0); var value = ${i.type.value}(0);`,"",`t = ${r.getByIndices("input_indices")}; value += t * t;`,""])},je=(e,t,r)=>{if(t.length===0)return r;let i=1,a=1;for(let n=0;n<t.length;n++)t.indexOf(n)===-1?i*=e[n]:a*=e[n];return a<32&&i>1024},Mp=(e,t)=>{je(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?eu(e,t):xp(e,t)},Rp=(e,t)=>{je(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Xo(e,t):Sp(e,t)},Bp=(e,t)=>{je(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Qo(e,t):kp(e,t)},Dp=(e,t)=>{je(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Yo(e,t):Tp(e,t)},Np=(e,t)=>{je(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Jo(e,t):Ep(e,t)},Pp=(e,t)=>{je(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?tu(e,t):Ip(e,t)},Up=(e,t)=>{je(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?ru(e,t):zp(e,t)},Wp=(e,t)=>{je(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?iu(e,t):Cp(e,t)},qp=(e,t)=>{je(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?au(e,t):Ap(e,t)},Lp=(e,t)=>{je(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Zo(e,t):Op(e,t)}}),Vi,Gp,Vp,Ta,ry=q(()=>{ie(),ke(),Za(),Vi=e=>{if(!e||e.length===0||e.length>2)throw new Error("ArgMinMaxOp op requires 1 or 2 inputs.");if(e[0].dataType!==1)throw new Error("Invalid input type.")},Gp=(e,t)=>{Vi(e.inputs);let r=(i,a,n)=>{let s=[];for(let u=0;u<i.rank;u++)(n.indexOf(u)>=0||n.length===0)&&s.push(`input_indices[${u}] = 0;`);return[`${s.join(`
`)}`,`var value = ${i.getByIndices("input_indices")};
var best_index : i32 = 0;`,`if (${i.getByIndices("input_indices")} ${t.selectLastIndex>0?"<=":"<"} value) {
         value = ${i.getByIndices("input_indices")};
         best_index = i32(last_index);
       }`,"",a.setByOffset("global_idx","best_index")]};e.compute(Kr("ArgMin",{hint:t.cacheKey,inputDependencies:["rank"]},[e.inputs[0]],r,[t.axis],7,t.keepDims),{inputs:[0]})},Vp=(e,t)=>{Vi(e.inputs);let r=(i,a,n)=>{let s=[];for(let u=0;u<i.rank;u++)(n.indexOf(u)>=0||n.length===0)&&s.push(`input_indices[${u}] = 0;`);return[`${s.join(`
`)}`,`var value = ${i.getByIndices("input_indices")};
var best_index : i32 = 0;`,`if (${i.getByIndices("input_indices")} ${t.selectLastIndex>0?">=":">"} value) {
         value = ${i.getByIndices("input_indices")};
         best_index = i32(last_index);
       }`,"",a.setByOffset("global_idx","best_index")]};e.compute(Kr("argMax",{hint:t.cacheKey,inputDependencies:["rank"]},[e.inputs[0]],r,[t.axis],7,t.keepDims),{inputs:[0]})},Ta=e=>fe(e)}),nu,Rr,su,ou,uu,fr,lu,Hp,Xa=q(()=>{ie(),ne(),ja(),se(),nu=(e,t)=>{let r=e[0],i=e[1],a=e[2],n=e[3],s=e[4],u=e[5];if(s&&u)throw new Error("Attention cannot have both past and attention_bias");if(r.dims.length!==3)throw new Error('Input "input" must have 3 dimensions');let l=r.dims[0],p=r.dims[1],h=r.dims[2];if(a.dims.length!==1)throw new Error('Input "bias" is expected to have 1 dimensions');if(i.dims.length!==2)throw new Error('Input "weights" is expected to have 2 dimensions');if(i.dims[0]!==h)throw new Error("Input 1 dimension 0 should have same length as dimension 2 of input 0");if(a.dims[0]!==i.dims[1])throw new Error('Input "bias" dimension 0 should have same length as dimension 1 of input "weights"');let f=a.dims[0]/3,g=f,y=g;if(t.qkvHiddenSizes.length>0){if(t.qkvHiddenSizes.length!==3)throw new Error("qkv_hidden_sizes attribute should have 3 elements");for(let T of t.qkvHiddenSizes)if(T%t.numHeads!==0)throw new Error("qkv_hidden_sizes should be divisible by num_heads");f=t.qkvHiddenSizes[0],g=t.qkvHiddenSizes[1],y=t.qkvHiddenSizes[2]}let _=p;if(f!==g)throw new Error("qkv_hidden_sizes first element should be same as the second");if(a.dims[0]!==f+g+y)throw new Error('Input "bias" dimension 0 should have same length as sum of Q/K/V hidden sizes');let w=0;if(s){if(g!==y)throw new Error('Input "past" expect k_hidden_size == v_hidden_size');if(s.dims.length!==5)throw new Error('Input "past" must have 5 dimensions');if(s.dims[0]!==2)throw new Error('Input "past" first dimension must be 2');if(s.dims[1]!==l)throw new Error('Input "past" second dimension must be batch_size');if(s.dims[2]!==t.numHeads)throw new Error('Input "past" third dimension must be num_heads');if(s.dims[4]!==g/t.numHeads)throw new Error('Input "past" fifth dimension must be k_hidden_size / num_heads');t.pastPresentShareBuffer||(w=s.dims[3])}let k=_+w,x=-1,b=0;if(n)throw new Error("Mask not supported");if(s)throw new Error("past is not supported");if(u){if(u.dims.length!==4)throw new Error('Input "attention_bias" must have 4 dimensions');if(u.dims[0]!==l||u.dims[1]!==t.numHeads||u.dims[2]!==p||u.dims[3]!==k)throw new Error('Expect "attention_bias" shape (batch_size, num_heads, sequence_length, total_sequence_length)')}return{batchSize:l,sequenceLength:p,pastSequenceLength:w,kvSequenceLength:_,totalSequenceLength:k,maxSequenceLength:x,inputHiddenSize:h,hiddenSize:f,vHiddenSize:y,headSize:Math.floor(f/t.numHeads),vHeadSize:Math.floor(y/t.numHeads),numHeads:t.numHeads,isUnidirectional:!1,pastPresentShareBuffer:!1,maskFilterValue:t.maskFilterValue,maskType:b,scale:t.scale,broadcastResPosBias:!1,passPastInKv:!1,qkvFormat:1}},Rr=(e,t,r)=>t&&e?`
      let total_sequence_length_input = u32(${t.getByOffset("0")});
      let present_sequence_length = max(total_sequence_length_input, uniforms.past_sequence_length);
      let is_subsequent_prompt: bool = sequence_length > 1 && sequence_length != total_sequence_length_input;
      let is_first_prompt: bool = is_subsequent_prompt == false && sequence_length == total_sequence_length_input;
      total_sequence_length = u32(${e?.getByOffset("batchIdx")}) + 1;
      var past_sequence_length: u32 = 0;
      if (is_first_prompt == false) {
        past_sequence_length = total_sequence_length - sequence_length;
      }
       `:`
    ${r?"let past_sequence_length = uniforms.past_sequence_length":""};
    let present_sequence_length = total_sequence_length;
    `,su=(e,t,r,i,a,n,s,u)=>{let l=Se(s?1:n),p=64,h=n/l;h<p&&(p=32);let f=Math.ceil(n/l/p),g=[{type:12,data:t},{type:12,data:r},{type:12,data:i},{type:12,data:a},{type:12,data:h},{type:12,data:f}],y=ze(e.dataType,l),_=Re(1,l),w=["type"];s&&w.push("type"),u&&w.push("type");let k=x=>{let b=Q("x",e.dataType,e.dims,l),T=[b],S=s?D("seq_lens",s.dataType,s.dims):void 0;S&&T.push(S);let I=u?D("total_sequence_length_input",u.dataType,u.dims):void 0;I&&T.push(I);let A=Re(e.dataType),z=[{name:"batch_size",type:"u32"},{name:"num_heads",type:"u32"},{name:"past_sequence_length",type:"u32"},{name:"sequence_length",type:"u32"},{name:"total_sequence_length",type:"u32"},{name:"elements_per_thread",type:"u32"}];return`
  var<workgroup> thread_max: array<f32, ${p}>;
  var<workgroup> thread_sum: array<f32, ${p}>;
  ${x.registerUniforms(z).declareVariables(...T)}
  ${x.mainStart([p,1,1])}
    let batchIdx = workgroup_id.z / uniforms.num_heads;
    let headIdx = workgroup_id.z % uniforms.num_heads;
    let sequence_length = uniforms.sequence_length;
    var total_sequence_length = uniforms.total_sequence_length;
    ${Rr(S,I,!1)}
    let local_offset = local_idx * uniforms.elements_per_thread;
    let offset = (global_idx / ${p}) * uniforms.total_sequence_length + local_offset;
    let seq_causal_length = ${s?"u32(past_sequence_length + workgroup_id.y + 1)":"total_sequence_length"};
    var thread_max_vector = ${_}(-3.4028234663852886e+38f);
    for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
      thread_max_vector = max(${_}(x[offset + i]), thread_max_vector);
    }
    thread_max[local_idx] = ${(()=>{switch(l){case 1:return"thread_max_vector";case 2:return"max(thread_max_vector.x, thread_max_vector.y)";case 4:return"max(max(thread_max_vector.x, thread_max_vector.y), max(thread_max_vector.z, thread_max_vector.w))";default:throw new Error(`Unsupported components: ${l}`)}})()};
    workgroupBarrier();

    var max_value =  f32(-3.4028234663852886e+38f);
    for (var i = 0u; i < ${p}; i++) {
      max_value = max(thread_max[i], max_value);
    }

    var sum_vector = ${_}(0);
    for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
      sum_vector += exp(${_}(x[offset + i]) - max_value);
    }
    thread_sum[local_idx] = ${(()=>{switch(l){case 1:return"sum_vector";case 2:return"sum_vector.x + sum_vector.y";case 4:return"sum_vector.x + sum_vector.y + sum_vector.z + sum_vector.w";default:throw new Error(`Unsupported components: ${l}`)}})()};
    workgroupBarrier();

    var sum: f32 = 0;
    for (var i = 0u; i < ${p}; i++) {
      sum += thread_sum[i];
    }

    if (sum == 0) {
      for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
        x[offset + i] = ${b.type.value}(${A}(1.0) / ${A}(seq_causal_length));
      }
    } else {
      for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
        var f32input = ${_}(x[offset + i]);
        x[offset + i] = ${b.type.value}(exp(f32input - max_value) / sum);
      }
    }
      ${s?`
        for (var total_seq_id: u32 = seq_causal_length; total_seq_id + local_offset < uniforms.total_sequence_length; total_seq_id++) {
          x[offset + total_seq_id] = ${b.type.value}(${A}(0));
        }`:""};
  }`};return{name:"AttentionProbsSoftmax",shaderCache:{hint:`${p};${y};${l}`,inputDependencies:w},getShaderSource:k,getRunData:()=>({outputs:[],dispatchGroup:{x:1,y:a,z:t*r},programUniforms:g})}},ou=(e,t,r,i,a,n,s,u,l)=>{let p=s+n.kvSequenceLength,h=[n.batchSize,n.numHeads,n.sequenceLength,p],f=e>1&&i,g=n.kvNumHeads?n.kvNumHeads:n.numHeads,y=f?[n.batchSize,g,p,n.headSize]:void 0,_=n.nReps?n.nReps:1,w=n.scale===0?1/Math.sqrt(n.headSize):n.scale,k=Se(n.headSize),x=n.headSize/k,b=12,T={x:Math.ceil(p/b),y:Math.ceil(n.sequenceLength/b),z:n.batchSize*n.numHeads},S=[{type:12,data:n.sequenceLength},{type:12,data:x},{type:12,data:p},{type:12,data:n.numHeads},{type:12,data:n.headSize},{type:1,data:w},{type:12,data:s},{type:12,data:n.kvSequenceLength},{type:12,data:_}],I=f&&i&&M.size(i.dims)>0,A=["type","type"];I&&A.push("type"),a&&A.push("type"),u&&A.push("type"),l&&A.push("type");let z=[{dims:h,dataType:t.dataType,gpuDataType:0}];f&&z.push({dims:y,dataType:t.dataType,gpuDataType:0});let v=N=>{let U=D("q",t.dataType,t.dims,k),Z=D("key",r.dataType,r.dims,k),G=[U,Z];if(I){let re=D("past_key",i.dataType,i.dims,k);G.push(re)}a&&G.push(D("attention_bias",a.dataType,a.dims));let K=u?D("seq_lens",u.dataType,u.dims):void 0;K&&G.push(K);let R=l?D("total_sequence_length_input",l.dataType,l.dims):void 0;R&&G.push(R);let P=Q("output",t.dataType,h),j=[P];f&&j.push(Q("present_key",t.dataType,y,k));let te=Re(1,k),ee=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"alpha",type:"f32"},{name:"past_sequence_length",type:"u32"},{name:"kv_sequence_length",type:"u32"},{name:"n_reps",type:"u32"}];return`
  const TILE_SIZE = ${b}u;

  var<workgroup> tileQ: array<${U.type.storage}, ${b*b}>;
  var<workgroup> tileK: array<${U.type.storage}, ${b*b}>;
  ${N.registerUniforms(ee).declareVariables(...G,...j)}
  ${N.mainStart([b,b,1])}
    // x holds the N and y holds the M
    let headIdx = workgroup_id.z % uniforms.num_heads;
    let kvHeadIdx = ${_===1?"headIdx":"headIdx / uniforms.n_reps"};
    let kv_num_heads = ${_===1?"uniforms.num_heads":"uniforms.num_heads / uniforms.n_reps"};
    let batchIdx = workgroup_id.z / uniforms.num_heads;
    let m = workgroup_id.y * TILE_SIZE;
    let n = workgroup_id.x * TILE_SIZE;
    let sequence_length = uniforms.M;
    var total_sequence_length = uniforms.N;
    ${Rr(K,R,!0)}
    let absKvHeadIdx = batchIdx * kv_num_heads + kvHeadIdx;
    let qOffset = workgroup_id.z * uniforms.M * uniforms.K + m * uniforms.K;
    ${I&&f?"let pastKeyOffset = absKvHeadIdx * uniforms.past_sequence_length * uniforms.K;":""};
    let kOffset = absKvHeadIdx * uniforms.kv_sequence_length * uniforms.K;
    ${f?"let presentKeyOffset = absKvHeadIdx * uniforms.N * uniforms.K;":""}
    var value = ${te}(0);
    for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (global_id.y < uniforms.M && w + local_id.x < uniforms.K) {
        tileQ[TILE_SIZE * local_id.y + local_id.x] = q[qOffset + local_id.y * uniforms.K + w + local_id.x];
      }
      if (n + local_id.y < uniforms.N && w + local_id.x < uniforms.K) {
        var idx = TILE_SIZE * local_id.y + local_id.x;
      ${I&&f?`
              if (n + local_id.y < past_sequence_length) {
                tileK[idx] = past_key[pastKeyOffset + (n + local_id.y) * uniforms.K + w + local_id.x];
              } else if (n + local_id.y - past_sequence_length < uniforms.kv_sequence_length) {
                tileK[idx] = key[kOffset + (n + local_id.y - past_sequence_length) * uniforms.K + w + local_id.x];
              }`:`
          if (n + local_id.y < uniforms.kv_sequence_length) {
            tileK[idx] = key[kOffset + (n + local_id.y) * uniforms.K + w + local_id.x];
          }`}
      ${f?`if (n + local_id.y < present_sequence_length) {
        present_key[presentKeyOffset + (n + local_id.y) * uniforms.K + w + local_id.x] = tileK[idx];
      }`:""}
      }
      workgroupBarrier();

      for (var k: u32 = 0u; k < TILE_SIZE && w+k < uniforms.K; k++) {
          value += ${te}(tileQ[TILE_SIZE * local_id.y + k] * tileK[TILE_SIZE * local_id.x + k]);
      }

      workgroupBarrier();
    }

    if (global_id.y < uniforms.M && global_id.x < total_sequence_length) {
      let headOffset = workgroup_id.z * uniforms.M * uniforms.N;
      let outputIdx = headOffset + global_id.y * uniforms.N + global_id.x;
      var sum: f32 = ${(()=>{switch(k){case 1:return"value";case 2:return"value.x + value.y";case 4:return"value.x + value.y + value.z + value.w";default:throw new Error(`Unsupported components: ${k}`)}})()};
        output[outputIdx] = ${P.type.value} (sum * uniforms.alpha) + ${a?"attention_bias[outputIdx]":"0.0"};
    }
  }`};return{name:"AttentionProbs",shaderCache:{hint:`${k};${a!==void 0};${i!==void 0};${e}`,inputDependencies:A},getRunData:()=>({outputs:z,dispatchGroup:T,programUniforms:S}),getShaderSource:v}},uu=(e,t,r,i,a,n,s=void 0,u=void 0)=>{let l=n+a.kvSequenceLength,p=a.nReps?a.nReps:1,h=a.vHiddenSize*p,f=e>1&&i,g=a.kvNumHeads?a.kvNumHeads:a.numHeads,y=f?[a.batchSize,g,l,a.headSize]:void 0,_=[a.batchSize,a.sequenceLength,h],w=12,k={x:Math.ceil(a.vHeadSize/w),y:Math.ceil(a.sequenceLength/w),z:a.batchSize*a.numHeads},x=[{type:12,data:a.sequenceLength},{type:12,data:l},{type:12,data:a.vHeadSize},{type:12,data:a.numHeads},{type:12,data:a.headSize},{type:12,data:h},{type:12,data:n},{type:12,data:a.kvSequenceLength},{type:12,data:p}],b=f&&i&&M.size(i.dims)>0,T=["type","type"];b&&T.push("type"),s&&T.push("type"),u&&T.push("type");let S=[{dims:_,dataType:t.dataType,gpuDataType:0}];f&&S.push({dims:y,dataType:t.dataType,gpuDataType:0});let I=A=>{let z=D("probs",t.dataType,t.dims),v=D("v",r.dataType,r.dims),N=[z,v];b&&N.push(D("past_value",i.dataType,i.dims));let U=s?D("seq_lens",s.dataType,s.dims):void 0;s&&N.push(U);let Z=u?D("total_sequence_length_input",u.dataType,u.dims):void 0;u&&N.push(Z);let G=[Q("output",t.dataType,_)];f&&G.push(Q("present_value",t.dataType,y));let K=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"v_hidden_size",type:"u32"},{name:"past_sequence_length",type:"u32"},{name:"kv_sequence_length",type:"u32"},{name:"n_reps",type:"u32"}];return`
  const TILE_SIZE = ${w}u;
  var<workgroup> tileQ: array<${z.type.value}, ${w*w}>;
  var<workgroup> tileV: array<${z.type.value}, ${w*w}>;
  ${A.registerUniforms(K).declareVariables(...N,...G)}
  ${A.mainStart([w,w,1])}
   let headIdx = workgroup_id.z % uniforms.num_heads;
   let batchIdx = workgroup_id.z / uniforms.num_heads;
   let kvHeadIdx = ${p===1?"headIdx":"headIdx / uniforms.n_reps"};
   let kv_num_heads = ${p===1?"uniforms.num_heads":"uniforms.num_heads / uniforms.n_reps"};
   let m = global_id.y;
   let n = global_id.x;
   let sequence_length = uniforms.M;
   var total_sequence_length = uniforms.K;
   ${Rr(U,Z,!0)}
   let offsetA = workgroup_id.z * uniforms.M * uniforms.K + m * uniforms.K;
   let absKvHeadIdx = batchIdx * kv_num_heads + kvHeadIdx; // kvHeadIdx is relative to the batch
   ${b&&f?"let pastValueOffset = absKvHeadIdx * uniforms.N * uniforms.past_sequence_length + n;":""};
   let vOffset = absKvHeadIdx * uniforms.N * uniforms.kv_sequence_length + n;
   ${f?"let presentValueOffset = absKvHeadIdx * uniforms.N * uniforms.K + n;":""}
   var value = ${z.type.storage}(0);
   for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (m < uniforms.M && w + local_id.x < uniforms.K) {
        tileQ[TILE_SIZE * local_id.y + local_id.x] = probs[offsetA + w + local_id.x];
      }
      if (n < uniforms.N && w + local_id.y < uniforms.K) {
        var idx = TILE_SIZE * local_id.y + local_id.x;
        ${b&&f?`
        if (w + local_id.y < past_sequence_length) {
          tileV[idx] = past_value[pastValueOffset + (w + local_id.y) * uniforms.N];
        } else if (w + local_id.y - past_sequence_length < uniforms.kv_sequence_length) {
          tileV[idx] = v[vOffset + (w + local_id.y - past_sequence_length) * uniforms.N];
        }
      `:`
            if (w + local_id.y < uniforms.kv_sequence_length) {
              tileV[idx] = v[vOffset + (w + local_id.y) * uniforms.N];
            }`}
        ${f?`
            if (w + local_id.y < present_sequence_length) {
          present_value[presentValueOffset + (w + local_id.y) * uniforms.N] = tileV[idx];
        }`:""}
      }
     workgroupBarrier();
     for (var k: u32 = 0u; k < TILE_SIZE && w+k < total_sequence_length; k++) {
       value += tileQ[TILE_SIZE * local_id.y + k] * tileV[TILE_SIZE * k + local_id.x];
     }
     workgroupBarrier();
   }

   // we need to transpose output from BNSH_v to BSND_v
   if (m < uniforms.M && n < uniforms.N) {
     let outputIdx = batchIdx * uniforms.M * uniforms.v_hidden_size + m * uniforms.v_hidden_size
       + headIdx * uniforms.N + n;
     output[outputIdx] = value;
   }
  }`};return{name:"AttentionScore",shaderCache:{hint:`${i!==void 0};${e}`,inputDependencies:T},getRunData:()=>({outputs:S,dispatchGroup:k,programUniforms:x}),getShaderSource:I}},fr=(e,t,r,i,a,n,s,u,l,p,h=void 0,f=void 0)=>{let g=Math.min(e.outputCount,1+(s?1:0)+(u?1:0)),y=g>1?s:void 0,_=g>1?u:void 0,w=g>1?p.pastSequenceLength:0,k=w+p.kvSequenceLength,x=l&&M.size(l.dims)>0?l:void 0,b=[t,r];y&&M.size(y.dims)>0&&b.push(y),x&&b.push(x),h&&b.push(h),f&&b.push(f);let T=e.compute(ou(g,t,r,y,x,p,w,h,f),{inputs:b,outputs:g>1?[-1,1]:[-1]})[0];e.compute(su(T,p.batchSize,p.numHeads,w,p.sequenceLength,k,h,f),{inputs:h&&f?[T,h,f]:[T],outputs:[]});let S=[T,i];_&&M.size(_.dims)>0&&S.push(_),h&&S.push(h),f&&S.push(f),e.compute(uu(g,T,i,_,p,w,h,f),{inputs:S,outputs:g>1?[0,2]:[0]})},lu=(e,t)=>{let r=[t.batchSize,t.numHeads,t.sequenceLength,t.headSize],i=t.sequenceLength,a=t.inputHiddenSize,n=t.headSize,s=12,u={x:Math.ceil(t.headSize/s),y:Math.ceil(t.sequenceLength/s),z:t.batchSize*t.numHeads},l=[e.inputs[0],e.inputs[1],e.inputs[2]],p=[{type:12,data:i},{type:12,data:a},{type:12,data:n},{type:12,data:t.numHeads},{type:12,data:t.headSize},{type:12,data:t.hiddenSize},{type:12,data:t.hiddenSize+t.hiddenSize+t.vHiddenSize}],h=f=>{let g=Q("output_q",l[0].dataType,r),y=Q("output_k",l[0].dataType,r),_=Q("output_v",l[0].dataType,r),w=D("input",l[0].dataType,l[0].dims),k=D("weight",l[1].dataType,l[1].dims),x=D("bias",l[2].dataType,l[2].dims),b=w.type.storage,T=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"hidden_size",type:"u32"},{name:"ldb",type:"u32"}];return`
  const TILE_SIZE = ${s}u;
  var<workgroup> tileInput: array<${b}, ${s*s}>;
  var<workgroup> tileWeightQ: array<${b}, ${s*s}>;
  var<workgroup> tileWeightK: array<${b}, ${s*s}>;
  var<workgroup> tileWeightV: array<${b}, ${s*s}>;
  ${f.registerUniforms(T).declareVariables(w,k,x,g,y,_)}
  ${f.mainStart([s,s,1])}
    let batchIndex = workgroup_id.z / uniforms.num_heads;
    let headNumber = workgroup_id.z % uniforms.num_heads;
    let m = global_id.y;
    let n = global_id.x;

    let inputOffset = batchIndex * (uniforms.M * uniforms.K) + m * uniforms.K;
    let biasOffsetQ = headNumber * uniforms.head_size;
    let biasOffsetK = uniforms.hidden_size + biasOffsetQ;
    let biasOffsetV = uniforms.hidden_size + biasOffsetK;

    var valueQ = ${b}(0);
    var valueK = ${b}(0);
    var valueV = ${b}(0);
    for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (m < uniforms.M && w + local_id.x < uniforms.K) {
        tileInput[TILE_SIZE * local_id.y + local_id.x] = input[inputOffset + w + local_id.x];
      }
      if (n < uniforms.N && w + local_id.y < uniforms.K) {
        let offset = n + (w + local_id.y) * uniforms.ldb;
        tileWeightQ[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetQ + offset];
        tileWeightK[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetK + offset];
        tileWeightV[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetV + offset];
      }
      workgroupBarrier();
      for (var k: u32 = 0u; k<TILE_SIZE && w+k < uniforms.K; k++) {
        let inputTileOffset = TILE_SIZE * local_id.y + k;
        let weightTileOffset = TILE_SIZE * k + local_id.x;
        valueQ += tileInput[inputTileOffset] * tileWeightQ[weightTileOffset];
        valueK += tileInput[inputTileOffset] * tileWeightK[weightTileOffset];
        valueV += tileInput[inputTileOffset] * tileWeightV[weightTileOffset];
      }

      workgroupBarrier();
    }

    let headOffset = (m * uniforms.N + n) % uniforms.head_size;
    valueQ += bias[headOffset + biasOffsetQ];
    valueK += bias[headOffset + biasOffsetK];
    valueV += bias[headOffset + biasOffsetV];

    let offset = workgroup_id.z * uniforms.M * uniforms.N;
    if (m < uniforms.M && n < uniforms.N) {
      let outputIdx = offset + m * uniforms.N + n;
      output_q[outputIdx] = valueQ;
      output_k[outputIdx] = valueK;
      output_v[outputIdx] = valueV;
    }
  }`};return e.compute({name:"AttentionPrepare",shaderCache:{inputDependencies:["type","type","type"]},getRunData:()=>({outputs:[{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0},{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0},{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0}],dispatchGroup:u,programUniforms:p}),getShaderSource:h},{inputs:l,outputs:[-1,-1,-1]})},Hp=(e,t)=>{let r=nu(e.inputs,t),[i,a,n]=lu(e,r);return fr(e,i,a,n,e.inputs[4],void 0,void 0,void 0,e.inputs[5],r)}}),du,pu,cu,Fp,iy=q(()=>{Le(),ie(),ne(),ke(),se(),du=(e,t)=>{if(!e||e.length!==5)throw new Error("BatchNormalization requires 5 inputs");let r=(i,a,n)=>{let s=a.length;if(s!==i.length)throw new Error(`${n}: num dimensions != ${s}`);a.forEach((u,l)=>{if(u!==i[l])throw new Error(`${n}: dim[${l}] do not match`)})};if(e[0].dims.length>1){let i=t.format==="NHWC"?t.spatial?e[0].dims.slice(-1):e[0].dims.slice(-1).concat(e[0].dims.slice(1,e[0].dims.length-1)):e[0].dims.slice(1,t.spatial?2:void 0);r(e[1].dims,i,"Invalid input scale"),r(e[2].dims,i,"Invalid input B"),r(e[3].dims,i,"Invalid input mean"),r(e[4].dims,i,"Invalid input var")}else r(e[1].dims,[1],"Invalid input scale"),r(e[2].dims,[1],"Invalid input B"),r(e[3].dims,[1],"Invalid input mean"),r(e[4].dims,[1],"Invalid input var")},pu=(e,t)=>{let{epsilon:r,spatial:i,format:a}=t,n=e[0].dims,s=i?Se(n[n.length-1]):1,u=a==="NHWC"&&n.length>1?s:1,l=M.size(n)/s,p=i,h=p?n.length:n,f=D("x",e[0].dataType,e[0].dims,s),g=D("scale",e[1].dataType,e[1].dims,u),y=D("bias",e[2].dataType,e[2].dims,u),_=D("inputMean",e[3].dataType,e[3].dims,u),w=D("inputVar",e[4].dataType,e[4].dims,u),k=Q("y",e[0].dataType,h,s),x=()=>{let T="";if(i)T=`let cOffset = ${n.length===1?"0u":a==="NHWC"?`outputIndices[${n.length-1}] / ${s}`:"outputIndices[1]"};`;else if(a==="NCHW")T=`
            ${k.indicesSet("outputIndices","0","0")}
            let cOffset = ${k.indicesToOffset("outputIndices")};`;else{T=`var cIndices = ${g.type.indices}(0);
                       cIndices[0] = outputIndices[${n.length-1}];`;for(let S=1;S<g.rank;S++)T+=`cIndices[${S}] = outputIndices[${S}];`;T+=`let cOffset = ${g.indicesToOffset("cIndices")};`}return T},b=T=>`
  const epsilon = ${r};
  ${T.registerUniform("outputSize","u32").declareVariables(f,g,y,_,w,k)}
  ${T.mainStart()}
  ${T.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
    var outputIndices = ${k.offsetToIndices(`global_idx * ${s}`)};
    ${x()}
    let scale = ${g.getByOffset("cOffset")};
    let bias = ${y.getByOffset("cOffset")};
    let inputMean = ${_.getByOffset("cOffset")};
    let inputVar = ${w.getByOffset("cOffset")};
    let x = ${f.getByOffset("global_idx")};
    let value = (x - inputMean) * inverseSqrt(inputVar + epsilon) * scale + bias;
    ${k.setByOffset("global_idx","value")}
  }`;return{name:"BatchNormalization",shaderCache:{hint:`${t.epsilon}_${t.format}_${i}_${s}`,inputDependencies:p?["rank","type","type","type","type"]:void 0},getShaderSource:b,getRunData:()=>({outputs:[{dims:e[0].dims,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:p?[{type:12,data:l},...J(n)]:[{type:12,data:l}]})}},cu=e=>fe(e),Fp=(e,t)=>{let{inputs:r,outputCount:i}=e,a=cu({...t,outputCount:i});if(_e.webgpu.validateInputContent&&du(r,a),t.trainingMode)throw new Error("BatchNormalization trainingMode is not supported yet.");e.compute(pu(r,a))}}),hu,fu,jp,ay=q(()=>{ne(),se(),hu=e=>{if(e[0].dims.length!==3)throw new Error("input should have 3 dimensions");if(![320,640,1280].includes(e[0].dims[2]))throw new Error("number of channels should be 320, 640 or 1280");if(e[1].dims.length!==1)throw new Error("bias is expected to have 1 dimensions");if(e[0].dims[2]!==e[1].dims[0])throw new Error("last dimension of input and bias are not the same")},fu=e=>{let t=e[0].dims,r=e[0].dims[2],i=M.size(t)/4,a=e[0].dataType,n=D("input",a,t,4),s=D("bias",a,[r],4),u=D("residual",a,t,4),l=Q("output",a,t,4);return{name:"BiasAdd",getRunData:()=>({outputs:[{dims:t,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(i/64)}}),getShaderSource:p=>`
  const channels = ${r}u / 4;
  ${p.declareVariables(n,s,u,l)}

  ${p.mainStart()}
    ${p.guardAgainstOutOfBoundsWorkgroupSizes(i)}
    let value = ${n.getByOffset("global_idx")}
      + ${s.getByOffset("global_idx % channels")} + ${u.getByOffset("global_idx")};
    ${l.setByOffset("global_idx","value")}
  }`}},jp=e=>{hu(e.inputs),e.compute(fu(e.inputs))}}),mu,he,Kp,Zp,Xp,Qp,Yp,Jp,ec,tc,rc,gu,ic,ac,nc,sc,lr,oc,Lr,uc,lc,dc,pc,cc,hc,fc,mc,gc,yc,_c,bc,wc,$c,vc,xc,Hi,Sc,Ea,Ia,kc,Tc,Ec,yu,_u,Ic,Qa=q(()=>{ie(),ne(),ke(),se(),mu=(e,t,r,i,a,n,s)=>{let u=Math.ceil(t/4),l="";typeof a=="string"?l=`${a}(a)`:l=a("a");let p=D("inputData",r,[u],4),h=Q("outputData",i,[u],4),f=[{name:"vec_size",type:"u32"}];return s&&f.push(...s),`
      ${e.registerUniforms(f).declareVariables(p,h)}

  ${n??""}

  ${e.mainStart()}
    ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}

    let a = ${p.getByOffset("global_idx")};
    ${h.setByOffset("global_idx",l)}
  }`},he=(e,t,r,i,a,n=e.dataType,s,u)=>{let l=[{type:12,data:Math.ceil(M.size(e.dims)/4)}];return s&&l.push(...s),{name:t,shaderCache:{hint:a,inputDependencies:["type"]},getShaderSource:p=>mu(p,M.size(e.dims),e.dataType,n,r,i,u),getRunData:p=>({outputs:[{dims:e.dims,dataType:n}],dispatchGroup:{x:Math.ceil(M.size(p[0].dims)/64/4)},programUniforms:l})}},Kp=e=>{e.compute(he(e.inputs[0],"Abs","abs"))},Zp=e=>{e.compute(he(e.inputs[0],"Acos","acos"))},Xp=e=>{e.compute(he(e.inputs[0],"Acosh","acosh"))},Qp=e=>{e.compute(he(e.inputs[0],"Asin","asin"))},Yp=e=>{e.compute(he(e.inputs[0],"Asinh","asinh"))},Jp=e=>{e.compute(he(e.inputs[0],"Atan","atan"))},ec=e=>{e.compute(he(e.inputs[0],"Atanh","atanh"))},tc=e=>fe(e),rc=(e,t)=>{let r;switch(t.to){case 10:r="vec4<f16>";break;case 1:r="vec4<f32>";break;case 12:r="vec4<u32>";break;case 6:r="vec4<i32>";break;case 9:r="vec4<bool>";break;default:throw new RangeError(`not supported type (specified in attribute 'to' from 'Cast' operator): ${t.to}`)}e.compute(he(e.inputs[0],"Cast",r,void 0,t.cacheKey,t.to))},gu=e=>{let t,r,i=e.length>=2&&e[1].data!==0,a=e.length>=3&&e[2].data!==0;switch(e[0].dataType){case 1:t=i?e[1].getFloat32Array()[0]:-34028234663852886e22,r=a?e[2].getFloat32Array()[0]:34028234663852886e22;break;case 10:t=i?e[1].getUint16Array()[0]:64511,r=a?e[2].getUint16Array()[0]:31743;break;default:throw new Error("Unsupport data type")}return fe({min:t,max:r})},ic=(e,t)=>{let r=t||gu(e.inputs),i=Re(e.inputs[0].dataType);e.compute(he(e.inputs[0],"Clip",a=>`clamp(${a}, vec4<${i}>(uniforms.min), vec4<${i}>(uniforms.max))`,void 0,r.cacheKey,void 0,[{type:e.inputs[0].dataType,data:r.min},{type:e.inputs[0].dataType,data:r.max}],[{name:"min",type:i},{name:"max",type:i}]),{inputs:[0]})},ac=e=>{e.compute(he(e.inputs[0],"Ceil","ceil"))},nc=e=>{e.compute(he(e.inputs[0],"Cos","cos"))},sc=e=>{e.compute(he(e.inputs[0],"Cosh","cosh"))},lr=e=>fe(e),oc=(e,t)=>{let r=Re(e.inputs[0].dataType);e.compute(he(e.inputs[0],"Elu",i=>`elu_vf32(${i})`,`
  const elu_alpha_ = ${r}(${t.alpha});

  fn elu_f32(a: ${r}) -> ${r} {
  return select((exp(a) - 1.0) * elu_alpha_, a, a >= 0.0);
  }

  fn elu_vf32(v: vec4<${r}>) -> vec4<${r}> {
  return vec4(elu_f32(v.x), elu_f32(v.y), elu_f32(v.z), elu_f32(v.w));
  }`,t.cacheKey))},Lr=(e="f32")=>`
const r0: ${e} = 0.3275911;
const r1: ${e} = 0.254829592;
const r2: ${e} = -0.284496736;
const r3: ${e} = 1.421413741;
const r4: ${e} = -1.453152027;
const r5: ${e} = 1.061405429;

fn erf_vf32(v: vec4<${e}>) -> vec4<${e}> {
  let absv = abs(v);
  let x = 1.0 / (1.0 + r0 * absv);
  return sign(v) * (1.0 - ((((r5 * x + r4) * x + r3) * x + r2) * x + r1) * x * exp(-absv * absv));
}`,uc=e=>{let t=Re(e.inputs[0].dataType);e.compute(he(e.inputs[0],"Erf",r=>`erf_vf32(${r})`,Lr(t)))},lc=e=>{e.compute(he(e.inputs[0],"Exp","exp"))},dc=e=>{e.compute(he(e.inputs[0],"Floor","floor"))},pc=e=>{let t=Re(e.inputs[0].dataType);e.compute(he(e.inputs[0],"Gelu",r=>`0.5 * ${r} * (1.0 + erf_vf32(${r} * 0.7071067811865475))`,Lr(t)))},cc=(e,t)=>{let r=Re(e.inputs[0].dataType);e.compute(he(e.inputs[0],"LeakyRelu",i=>`select(leaky_relu_alpha_ * ${i}, ${i}, ${i} >= vec4<${r}>(0.0))`,`const leaky_relu_alpha_ = ${r}(${t.alpha});`,t.cacheKey))},hc=e=>{e.compute(he(e.inputs[0],"Not",t=>`!${t}`))},fc=e=>{e.compute(he(e.inputs[0],"Neg",t=>`-${t}`))},mc=e=>{e.compute(he(e.inputs[0],"Reciprocal",t=>`1.0/${t}`))},gc=e=>{let t=Re(e.inputs[0].dataType);e.compute(he(e.inputs[0],"Relu",r=>`select(vec4<${t}>(0.0), ${r}, ${r} > vec4<${t}>(0.0))`))},yc=e=>{e.compute(he(e.inputs[0],"Sigmoid",t=>`(1.0 / (1.0 + exp(-${t})))`))},_c=e=>fe(e),bc=(e,t)=>{let r=Re(e.inputs[0].dataType);e.compute(he(e.inputs[0],"HardSigmoid",i=>`max(vec4<${r}>(0.0), min(vec4<${r}>(1.0), ${t.alpha} * ${i} + vec4<${r}>(${t.beta})))`,void 0,t.cacheKey))},wc=e=>{e.compute(he(e.inputs[0],"Sin","sin"))},$c=e=>{e.compute(he(e.inputs[0],"Sinh","sinh"))},vc=e=>{e.compute(he(e.inputs[0],"Sqrt","sqrt"))},xc=e=>{e.compute(he(e.inputs[0],"Tan","tan"))},Hi=e=>`sign(${e}) * (1 - exp(-2 * abs(${e}))) / (1 + exp(-2 * abs(${e})))`,Sc=e=>{e.compute(he(e.inputs[0],"Tanh",Hi))},Ea=(e="f32")=>`
const fast_gelu_a: ${e} = 0.5;
const fast_gelu_b: ${e} = 0.7978845608028654;
const fast_gelu_c: ${e} = 0.035677408136300125;

fn tanh_v(v: vec4<${e}>) -> vec4<${e}> {
  return ${Hi("v")};
}
`,Ia=e=>`(fast_gelu_a + fast_gelu_a * tanh_v(${e} * (fast_gelu_c * ${e} * ${e} + fast_gelu_b))) * ${e}`,kc=e=>{let t=Re(e.inputs[0].dataType);e.compute(he(e.inputs[0],"FastGelu",Ia,Ea(t),void 0,e.inputs[0].dataType))},Tc=(e,t)=>{let r=Re(e.inputs[0].dataType);return e.compute(he(e.inputs[0],"ThresholdedRelu",i=>`select(vec4<${r}>(0.0), ${i}, ${i} > thresholded_relu_alpha_)`,`const thresholded_relu_alpha_ = vec4<${r}>(${t.alpha});`,t.cacheKey)),0},Ec=e=>{e.compute(he(e.inputs[0],"Log","log"))},yu=(e,t)=>`
const alpha = vec4<${e}>(${t});
const one = ${e}(1.0);
const zero = ${e}(0.0);

fn quick_gelu_impl(x: vec4<${e}>) -> vec4<${e}> {
  let v = x *alpha;
  var x1 : vec4<${e}>;
  for (var i = 0; i < 4; i = i + 1) {
    if (v[i] >= zero) {
      x1[i] = one / (one + exp(-v[i]));
    } else {
      x1[i] = one - one / (one + exp(v[i]));
    }
  }
  return x * x1;
}
`,_u=e=>`quick_gelu_impl(${e})`,Ic=(e,t)=>{let r=Re(e.inputs[0].dataType);e.compute(he(e.inputs[0],"QuickGelu",_u,yu(r,t.alpha),t.cacheKey,e.inputs[0].dataType))}}),bu,wu,zc,ny=q(()=>{ne(),se(),Qa(),bu=e=>{if(e[0].dims.length!==3)throw new Error("input should have 3 dimensions");if(![2560,5120,10240].includes(e[0].dims[2]))throw new Error("hidden state should be 2560, 5120 or 10240");if(e[1].dims.length!==1)throw new Error("bias is expected to have 1 dimensions");if(e[0].dims[2]!==e[1].dims[0])throw new Error("last dimension of input and bias are not the same")},wu=e=>{let t=e[0].dims.slice();t[2]=t[2]/2;let r=D("input",e[0].dataType,e[0].dims,4),i=D("bias",e[0].dataType,[e[0].dims[2]],4),a=Q("output",e[0].dataType,t,4),n=M.size(t)/4,s=ze(e[0].dataType);return{name:"BiasSplitGelu",getRunData:()=>({outputs:[{dims:t,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(n/64)}}),getShaderSource:u=>`
  const M_SQRT2 = sqrt(2.0);
  const halfChannels = ${e[0].dims[2]/4/2}u;

  ${u.declareVariables(r,i,a)}

  ${Lr(s)}

  ${u.mainStart()}
    ${u.guardAgainstOutOfBoundsWorkgroupSizes(n)}
    let biasIdx = global_idx % halfChannels;
    let batchIndex = global_idx / halfChannels;
    let inputOffset = biasIdx + batchIndex * halfChannels * 2;
    let valueLeft = input[inputOffset] + bias[biasIdx];
    let valueRight = input[inputOffset + halfChannels] + bias[biasIdx + halfChannels];
    let geluRight = valueRight * 0.5 * (erf_vf32(valueRight / M_SQRT2) + 1);

    ${a.setByOffset("global_idx","valueLeft * geluRight")}
  }`}},zc=e=>{bu(e.inputs),e.compute(wu(e.inputs))}}),$u,vu,Ke,Cc,Ac,Oc,Mc,Rc,Bc,Dc,Nc,Pc,Uc,sy=q(()=>{ie(),ne(),se(),$u=(e,t,r,i,a,n,s,u,l,p,h,f)=>{let g,y;typeof u=="string"?g=y=(b,T)=>`${u}((${b}),(${T}))`:typeof u=="function"?g=y=u:(g=u.scalar,y=u.vector);let _=Q("outputData",h,i.length,4),w=D("aData",l,t.length,4),k=D("bData",p,r.length,4),x;if(a)if(n){let b=M.size(t)===1,T=M.size(r)===1,S=t.length>0&&t[t.length-1]%4===0,I=r.length>0&&r[r.length-1]%4===0;b||T?x=_.setByOffset("global_idx",y(b?`${w.type.value}(${w.getByOffset("0")}.x)`:w.getByOffset("global_idx"),T?`${k.type.value}(${k.getByOffset("0")}.x)`:k.getByOffset("global_idx"))):x=`
            let outputIndices = ${_.offsetToIndices("global_idx * 4u")};
            let offsetA = ${w.broadcastedIndicesToOffset("outputIndices",_)};
            let offsetB = ${k.broadcastedIndicesToOffset("outputIndices",_)};
            ${_.setByOffset("global_idx",y(s||S?w.getByOffset("offsetA / 4u"):`${w.type.value}(${w.getByOffset("offsetA / 4u")}[offsetA % 4u])`,s||I?k.getByOffset("offsetB / 4u"):`${k.type.value}(${k.getByOffset("offsetB / 4u")}[offsetB % 4u])`))}
          `}else x=_.setByOffset("global_idx",y(w.getByOffset("global_idx"),k.getByOffset("global_idx")));else{if(!n)throw new Error("no necessary to use scalar implementation for element-wise binary op implementation.");let b=(T,S,I="")=>{let A=`aData[indexA${S}][componentA${S}]`,z=`bData[indexB${S}][componentB${S}]`;return`
            let outputIndices${S} = ${_.offsetToIndices(`global_idx * 4u + ${S}u`)};
            let offsetA${S} = ${w.broadcastedIndicesToOffset(`outputIndices${S}`,_)};
            let offsetB${S} = ${k.broadcastedIndicesToOffset(`outputIndices${S}`,_)};
            let indexA${S} = offsetA${S} / 4u;
            let indexB${S} = offsetB${S} / 4u;
            let componentA${S} = offsetA${S} % 4u;
            let componentB${S} = offsetB${S} % 4u;
            ${T}[${S}] = ${I}(${g(A,z)});
          `};h===9?x=`
            var data = vec4<u32>(0);
            ${b("data",0,"u32")}
            ${b("data",1,"u32")}
            ${b("data",2,"u32")}
            ${b("data",3,"u32")}
            outputData[global_idx] = dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(data));`:x=`
            ${b("outputData[global_idx]",0)}
            ${b("outputData[global_idx]",1)}
            ${b("outputData[global_idx]",2)}
            ${b("outputData[global_idx]",3)}
          `}return`
        ${e.registerUniform("vec_size","u32").declareVariables(w,k,_)}

        ${f??""}

        ${e.mainStart()}
        ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
        ${x}
      }`},vu=(e,t,r,i,a,n,s=r.dataType)=>{let u=r.dims.map(Number),l=i.dims.map(Number),p=!M.areEqual(u,l),h=u,f=M.size(u),g=!1,y=!1,_=[p];if(p){let w=Vt.calcShape(u,l,!1);if(!w)throw new Error("Can't perform binary op on the given tensors");h=w.slice(),f=M.size(h);let k=M.size(u)===1,x=M.size(l)===1,b=u.length>0&&u[u.length-1]%4===0,T=l.length>0&&l[l.length-1]%4===0;_.push(k),_.push(x),_.push(b),_.push(T);let S=1;for(let I=1;I<h.length;I++){let A=u[u.length-I],z=l[l.length-I];if(A===z)S*=A;else break}S%4===0?(y=!0,g=!0):(k||x||b||T)&&(g=!0)}else g=!0;return _.push(g),{name:e,shaderCache:{hint:t+_.map(w=>w.toString()).join("_"),inputDependencies:["rank","rank"]},getShaderSource:w=>$u(w,u,l,h,g,p,y,a,r.dataType,i.dataType,s,n),getRunData:()=>({outputs:[{dims:h,dataType:s}],dispatchGroup:{x:Math.ceil(f/64/4)},programUniforms:[{type:12,data:Math.ceil(M.size(h)/4)},...J(u,l,h)]})}},Ke=(e,t,r,i,a,n)=>{e.compute(vu(t,a??"",e.inputs[0],e.inputs[1],r,i,n))},Cc=e=>{Ke(e,"Add",(t,r)=>`${t}+${r}`)},Ac=e=>{Ke(e,"Div",(t,r)=>`${t}/${r}`)},Oc=e=>{Ke(e,"Equal",{scalar:(t,r)=>`u32(${t}==${r})`,vector:(t,r)=>`vec4<u32>(${t}==${r})`},void 0,void 0,9)},Mc=e=>{Ke(e,"Mul",(t,r)=>`${t}*${r}`)},Rc=e=>{let t=D("input",e.inputs[0].dataType,e.inputs[0].dims).type.value;Ke(e,"Pow",{scalar:(r,i)=>`pow_custom(${r},${i})`,vector:(r,i)=>`pow_vector_custom(${r},${i})`},`
    fn pow_custom(a : ${t}, b : ${t}) -> ${t} {
      if (b == ${t}(0.0)) {
        return ${t}(1.0);
      } else if (a < ${t}(0.0) && f32(b) != floor(f32(b))) {
        return ${t}(pow(f32(a), f32(b))); // NaN
      }
      return select(sign(a), ${t}(1.0), round(f32(abs(b) % ${t}(2.0))) != 1.0) * ${t}(${t==="i32"?"round":""}(pow(f32(abs(a)), f32(b))));
    }
    fn pow_vector_custom(a : vec4<${t}>, b : vec4<${t}>) -> vec4<${t}> {
      // TODO: implement vectorized pow
      return vec4<${t}>(pow_custom(a.x, b.x), pow_custom(a.y, b.y), pow_custom(a.z, b.z), pow_custom(a.w, b.w));
    }
      `)},Bc=e=>{Ke(e,"Sub",(t,r)=>`${t}-${r}`)},Dc=e=>{Ke(e,"Greater",{scalar:(t,r)=>`u32(${t}>${r})`,vector:(t,r)=>`vec4<u32>(${t}>${r})`},void 0,void 0,9)},Nc=e=>{Ke(e,"Less",{scalar:(t,r)=>`u32(${t}<${r})`,vector:(t,r)=>`vec4<u32>(${t}<${r})`},void 0,void 0,9)},Pc=e=>{Ke(e,"GreaterOrEqual",{scalar:(t,r)=>`u32(${t}>=${r})`,vector:(t,r)=>`vec4<u32>(${t}>=${r})`},void 0,void 0,9)},Uc=e=>{Ke(e,"LessOrEqual",{scalar:(t,r)=>`u32(${t}<=${r})`,vector:(t,r)=>`vec4<u32>(${t}<=${r})`},void 0,void 0,9)}}),xu,Su,ku,Tu,Wc,qc,oy=q(()=>{ie(),ne(),ke(),se(),xu=(e,t)=>{if(!e||e.length<1)throw new Error("too few inputs");let r=0,i=e[r],a=i.dataType,n=i.dims.length;e.forEach((s,u)=>{if(u!==r){if(s.dataType!==a)throw new Error("input tensors should be one type");if(s.dims.length!==n)throw new Error("input tensors should have the same shape");s.dims.forEach((l,p)=>{if(p!==t&&l!==i.dims[p])throw new Error("non concat dimensions must match")})}})},Su=(e,t)=>`
  fn calculateInputIndex(index: u32) -> u32 {
    let sizeInConcatAxis = array<u32, ${e}u>(${t});
    for (var i: u32 = 0u; i < ${e}; i += 1u ) {
      if (index < sizeInConcatAxis[i]) {
        return i;
      }
    }
    return ${e}u;
  }`,ku=(e,t)=>{let r=e.length,i=[];for(let a=0;a<r;++a){let n=t.setByOffset("global_idx",e[a].getByIndices("indices"));r===1?i.push(n):a===0?i.push(`if (inputIndex == ${a}u) { ${n} }`):a===r-1?i.push(`else { ${n} }`):i.push(`else if (inputIndex == ${a}) { ${n} }`)}return i.join(`
`)},Tu=(e,t,r,i)=>{let a=M.size(r),n=new Array(e.length),s=new Array(e.length),u=0,l=[],p=[],h=[{type:12,data:a}];for(let w=0;w<e.length;++w)u+=e[w].dims[t],n[w]=u,p.push(e[w].dims.length),s[w]=D(`input${w}`,i,p[w]),l.push("rank"),h.push({type:12,data:n[w]});for(let w=0;w<e.length;++w)h.push(...J(e[w].dims));h.push(...J(r));let f=Q("output",i,r.length),g=f.indicesGet("indices",t),y=Array.from(Array(n.length).keys()).map(w=>`uniforms.sizeInConcatAxis${w}`).join(","),_=w=>`

  ${(()=>{w.registerUniform("outputSize","u32");for(let k=0;k<e.length;k++)w.registerUniform(`sizeInConcatAxis${k}`,"u32");return w.declareVariables(...s,f)})()}

  ${Su(n.length,y)}

  ${w.mainStart()}
    ${w.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

    var indices = ${f.offsetToIndices("global_idx")};

    let inputIndex = calculateInputIndex(${g});
    if (inputIndex != 0u) {
      let sizeInConcatAxis = array<u32, ${n.length}u>(${y});
      ${g} -= sizeInConcatAxis[inputIndex - 1u];
    }

    ${ku(s,f)}
  }`;return{name:"Concat",shaderCache:{hint:`${t}`,inputDependencies:l},getRunData:()=>({outputs:[{dims:r,dataType:i}],dispatchGroup:{x:Math.ceil(a/64)},programUniforms:h}),getShaderSource:_}},Wc=(e,t)=>{let r=e.inputs,i=r[0].dims,a=M.normalizeAxis(t.axis,i.length);xu(r,a);let n=i.slice();n[a]=r.reduce((u,l)=>u+(l.dims.length>a?l.dims[a]:0),0);let s=r.filter(u=>M.size(u.dims)>0);e.compute(Tu(s,a,n,r[0].dataType),{inputs:s})},qc=e=>fe({axis:e.axis})}),Rt,Bt,Dt,Ya,Pt=q(()=>{ie(),ne(),Rt=(e,t,r="f32")=>{switch(e.activation){case"Relu":return`value = max(value, ${t}(0.0));`;case"Sigmoid":return`value = (${t}(1.0) / (${t}(1.0) + exp(-value)));`;case"Clip":return`value = clamp(value, ${t}(${r}(uniforms.clip_min)), ${t}(${r}(uniforms.clip_max)));`;case"HardSigmoid":return`value = max(${t}(0.0), min(${t}(1.0), ${r}(uniforms.alpha) * value + ${r}(uniforms.beta)));`;case"LeakyRelu":return`value = select(${r}(uniforms.alpha) * value, value, value >= ${t}(0.0));`;case"Tanh":return`let e2x = exp(-2.0 * abs(value));
              value = sign(value) * (1.0 - e2x) / (1.0 + e2x);
        `;case"":return"";default:throw new Error(`Unsupported activation ${e.activation}`)}},Bt=(e,t)=>{e.activation==="Clip"?t.push({type:1,data:e.clipMax},{type:1,data:e.clipMin}):e.activation==="HardSigmoid"?t.push({type:1,data:e.alpha},{type:1,data:e.beta}):e.activation==="LeakyRelu"&&t.push({type:1,data:e.alpha})},Dt=(e,t)=>{e.activation==="Clip"?t.push({name:"clip_max",type:"f32"},{name:"clip_min",type:"f32"}):e.activation==="HardSigmoid"?t.push({name:"alpha",type:"f32"},{name:"beta",type:"f32"}):e.activation==="LeakyRelu"&&t.push({name:"alpha",type:"f32"})},Ya=e=>{let t=e?.activation||"";if(t==="HardSigmoid"){let[r,i]=e?.activation_params||[.2,.5];return{activation:t,alpha:r,beta:i}}else if(t==="Clip"){let[r,i]=e?.activation_params||[hp,fp];return{activation:t,clipMax:i,clipMin:r}}else if(t==="LeakyRelu"){let[r]=e?.activation_params||[.01];return{activation:t,alpha:r}}return{activation:t}}}),Ae,Lc,Ja=q(()=>{Ae=(e,t)=>{switch(e){case 1:return t;case 2:return`vec2<${t}>`;case 3:return`vec3<${t}>`;case 4:return`vec4<${t}>`;default:throw new Error(`${e}-component is not supported.`)}},Lc=e=>`
      ${e?"value = value + getBiasByOutputCoords(coords);":""}
      `}),Gc,uy=q(()=>{Gc=e=>`
fn getIndexFromCoords4D(coords : vec4<i32>, shape : vec4<i32>) -> i32 {
  return dot(coords, vec4<i32>(
      shape.y * shape.z * shape.w, shape.z * shape.w, shape.w, 1));
}
fn getOutputIndexFromCoords(coords : vec4<i32>) -> i32 {
  return dot(coords, vec4<i32>(
    i32(${e}.x), i32(${e}.y), i32(${e}.z), 1));
}
`}),cr,en,tn=q(()=>{ie(),ne(),se(),Pt(),cr=(e,t,r,i,a)=>{let n=i-r;return`
      ${Array.from({length:r}).map((s,u)=>`
      if (${Y(t.shape,u,t.rank)} != 1) {
        ${t.indicesSet(e,u,Y(a,u+n,i))}
      } else {
        ${t.indicesSet(e,u,0)}
      }`).join("")}
`},en=(e,t,r,i,a=!1,n)=>{let s=e[0].dims,u=e[1].dims,l=s[s.length-2],p=u[u.length-1],h=s[s.length-1],f=Se(p),g=Se(h),y=Se(l),_=M.size(r)/f/y,w=e.length>2,k=i?i.slice(0,-2):r.slice(0,-2),x=[M.size(k),l,p],b=[{type:12,data:_},{type:12,data:l},{type:12,data:p},{type:12,data:h}];Bt(t,b),b.push(...J(k,s,u)),w&&b.push(...J(e[2].dims)),b.push(...J(x));let T=S=>{let I=Ka("batch_dims",e[0].dataType,k.length),A=D("a",e[0].dataType,s.length,g),z=D("b",e[1].dataType,u.length,f),v=Q("output",e[0].dataType,x.length,f),N=ze(v.type.tensor),U=Rt(t,v.type.value,N),Z=[A,z],G="";if(w){let P=a?f:1;Z.push(D("bias",e[2].dataType,e[2].dims.length,P)),G=`${a?`value += bias[col / ${P}];`:`value += ${v.type.value}(bias[row + i]);`}`}let K=[{name:"output_size",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"}];Dt(t,K);let R=()=>{let P=`var a_data: ${A.type.value};`;for(let j=0;j<g;j++)P+=`
              let b_data${j} = b[(b_offset + (k + ${j}) * uniforms.N + col) / ${f}];`;for(let j=0;j<y;j++){P+=`a_data = a[(a_offset + (row + ${j}) * uniforms.K + k) / ${g}];`;for(let te=0;te<g;te++)P+=`
            values[${j}] = fma(${z.type.value}(a_data${g===1?"":`[${te}]`}), b_data${te}, values[${j}]);
`}return P};return`
  ${S.registerUniforms(K).registerInternalVariables(I).declareVariables(...Z,v)}
  ${S.mainStart()}
    ${S.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let col = (global_idx % (uniforms.N / ${f})) * ${f};
    var index1 = global_idx / (uniforms.N / ${f});
    let stride1 = uniforms.M / ${y};
    let row = (index1 % stride1) * ${y};
    let batch = index1 / stride1;

    ${r.length===2?"":`let batch_indices = ${I.offsetToIndices("batch")};`}

    var a_indices: ${A.type.indices};
    ${cr("a_indices",A,A.rank-2,I.rank,"batch_indices")}
    ${A.indicesSet("a_indices",A.rank-2,0)}
    ${A.indicesSet("a_indices",A.rank-1,0)}
    let a_offset = ${A.indicesToOffset("a_indices")};

    var b_indices: ${z.type.indices};
    ${cr("b_indices",z,z.rank-2,I.rank,"batch_indices")}
    ${z.indicesSet("b_indices",z.rank-2,0)}
    ${z.indicesSet("b_indices",z.rank-1,0)}
    let b_offset = ${z.indicesToOffset("b_indices")};
    var values: array<${v.type.value}, ${y}>;
    for (var k: u32 = 0u; k < uniforms.K; k = k + ${g}) {
      ${R()}
    }
    for (var i = 0u; i < ${y}u; i++) {
      var value = values[i];
      ${G}
      ${U}
      let cur_indices = ${v.type.indices}(batch, row + i, col);
      let offset = ${v.indicesToOffset("cur_indices")};
      ${v.setByOffset(`offset / ${f}`,"value")};
    }
  }
  `};return{name:"MatMulNaive",shaderCache:{hint:`${t.activation};${f};${g};${y};${a}`,inputDependencies:w?["rank","rank","rank"]:["rank","rank"]},getRunData:()=>({outputs:[{dims:n?n(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(_/64)},programUniforms:b}),getShaderSource:T}}}),Eu,Iu,za,Fi,zu,Ca,Cu,Zr,rn=q(()=>{ie(),ne(),se(),Pt(),tn(),Ja(),Eu=(e,t)=>e?`
        mm_Asub[inputRow][inputCol] = mm_readA(batch,
          kStart + inputRow,
          globalRowStart / innerElementSize + inputCol${t?", batchIndices":""});
        `:`
        mm_Asub[inputRow][inputCol] = mm_readA(batch,
          globalRow + innerRow,
          kStart / innerElementSize + inputCol${t?", batchIndices":""});
        `,Iu=(e,t)=>e?`
        let ACached0 = mm_Asub[k * innerElementSize][localRow];
        let ACached1 = mm_Asub[k * innerElementSize + 1][localRow];
        let ACached2 = mm_Asub[k * innerElementSize + 2][localRow];
        ${t===3?"":"let ACached3 = mm_Asub[k * innerElementSize + 3][localRow];"}
        for (var i = 0; i < rowPerThread; i = i + 1) {
          acc[i] = BCached0 * ACached0[i] + acc[i];
          acc[i] = BCached1 * ACached1[i] + acc[i];
          acc[i] = BCached2 * ACached2[i] + acc[i];
          ${t===3?"":"acc[i] = BCached3 * ACached3[i] + acc[i];"}
        }`:`
        for (var i = 0; i < rowPerThread; i = i + 1) {
          let ACached = mm_Asub[tileRow + i][k];
          acc[i] = BCached0 * ACached.x + acc[i];
          acc[i] = BCached1 * ACached.y + acc[i];
          acc[i] = BCached2 * ACached.z + acc[i];
          ${t===3?"":"acc[i] = BCached3 * ACached.w + acc[i];"}
        }`,za=(e,t,r="f32",i,a=!1,n=32,s=!1,u=32)=>{let l=t[1]*e[1],p=t[0]*e[0],h=a?l:n,f=a?n:l,g=h/t[0],y=n/t[1];if(!((a&&g===4&&e[1]===4||!a&&(g===3||g===4))&&h%t[0]===0&&n%t[1]===0&&e[0]===4))throw new Error(`If transposeA ${a} is true, innerElementSize ${g} and workPerThread[1] ${e[1]} must be 4.
      Otherwise, innerElementSize ${g} must be 3 or 4.
  tileAWidth ${h} must be divisible by workgroupSize[0]${t[0]}. tileInner ${n} must be divisible by workgroupSize[1] ${t[1]}. colPerThread ${e[0]} must be 4.`);return`
var<workgroup> mm_Asub: array<array<vec${g}<${r}>, ${h/g}>, ${f}>;
var<workgroup> mm_Bsub: array<array<vec4<${r}>, ${p/e[0]}>, ${n}>;

const rowPerThread = ${e[1]};
const colPerThread = ${e[0]};
const innerElementSize = ${g};
const tileInner = ${n};

@compute @workgroup_size(${t[0]}, ${t[1]}, ${t[2]})
fn main(@builtin(local_invocation_id) localId : vec3<u32>,
        @builtin(global_invocation_id) globalId : vec3<u32>,
        @builtin(workgroup_id) workgroupId : vec3<u32>) {
  let localRow = i32(localId.y);
  let tileRow = localRow * rowPerThread;
  let tileCol = i32(localId.x);

  let globalRow =i32(globalId.y) * rowPerThread;
  let globalCol = i32(globalId.x);
  let batch = ${s?"0":"i32(globalId.z)"};
  ${i?`let batchIndices = ${i.offsetToIndices("u32(batch)")};`:""}
  let globalRowStart = i32(workgroupId.y) * ${l};

  let num_tiles = ${s?`${Math.ceil(u/n)}`:"(uniforms.dim_inner - 1) / tileInner + 1"};
  var kStart = ${s?`i32(globalId.z) * ${u}`:"0"};

  var acc: array<vec4<${r}>, rowPerThread>;

  // Loop over shared dimension.
  let tileRowB = localRow * ${y};
  for (var t = 0; t < num_tiles; t = t + 1) {
      // Load one tile of A into local memory.
      for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
          let inputRow = tileRow + innerRow;
          let inputCol = tileCol;
          ${Eu(a,i)}
      }

      // Load one tile of B into local memory.
      for (var innerRow = 0; innerRow < ${y}; innerRow = innerRow + 1) {
          let inputRow = tileRowB + innerRow;
          let inputCol = tileCol;
          mm_Bsub[inputRow][inputCol] = mm_readB(batch, kStart + inputRow, globalCol${i?", batchIndices":""});
      }
      kStart = kStart + tileInner;
      workgroupBarrier();

      // Compute acc values for a single thread.
      for (var k = 0; k < tileInner / innerElementSize; k = k + 1) {
          let BCached0 = mm_Bsub[k * innerElementSize][tileCol];
          let BCached1 = mm_Bsub[k * innerElementSize + 1][tileCol];
          let BCached2 = mm_Bsub[k * innerElementSize + 2][tileCol];
          ${g===3?"":"let BCached3 = mm_Bsub[k * innerElementSize + 3][tileCol];"}

          ${Iu(a,g)}
      }

      workgroupBarrier();
  }

  for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      mm_write(batch, globalRow + innerRow, globalCol, acc[innerRow]);
  }
}`},Fi=(e,t)=>e?`
            mm_Asub[inputRow][inputCol] = mm_readA(batch,
              kStart + inputRow,
              globalRowStart + inputCol${t?", batchIndices":""});
            `:`
            mm_Asub[inputRow][inputCol] = mm_readA(batch,
              globalRowStart + inputRow,
              kStart + inputCol${t?", batchIndices":""});
            `,zu=e=>e?"let ACached = mm_Asub[k][tileRow + innerRow];":"let ACached = mm_Asub[tileRow + innerRow][k];",Ca=(e,t,r="f32",i,a=!1,n=32,s=!1,u=32,l=!1)=>{let p=e[1]*t[1],h=e[0]*t[0],f=a?p:n,g=a?n:p;if(!(g%t[1]===0&&f%t[0]===0&&n%t[1]===0))throw new Error(`tileAHight ${g} must be divisible by workgroupSize[1]${t[1]}, tileAWidth ${f} must be divisible by workgroupSize[0]${t[0]}, tileInner ${n} must be divisible by workgroupSize[1]${t[1]}`);let y=g/t[1],_=f/t[0],w=n/t[1],k=l?`
    let localRow = i32(localId.y);
    let localCol = i32(localId.x);
    let globalRowStart = i32(workgroupId.y) * ${p};
    let globalColStart = i32(workgroupId.x) * ${h};

    // Loop over shared dimension.
    for (var t = 0; t < num_tiles; t = t + 1) {
      // Load one tile of A into local memory.
      for (var inputRow = localRow; inputRow < ${g}; inputRow = inputRow + ${t[1]}) {
        for (var inputCol = localCol; inputCol < ${f}; inputCol = inputCol + ${t[0]}) {
          ${Fi(a,i)}
        }
      }
      // Load one tile of B into local memory.
      for (var inputRow = localRow; inputRow < ${n}; inputRow = inputRow + ${t[1]}) {
            for (var inputCol = localCol; inputCol < ${h}; inputCol = inputCol + ${t[0]}) {
          mm_Bsub[inputRow][inputCol] = mm_readB(batch,
            kStart + inputRow,
            globalColStart + inputCol${i?", batchIndices":""});
        }
      }
      kStart = kStart + tileInner;
      workgroupBarrier();

      // Compute acc values for a single thread.
      var BCached : array<${r}, colPerThread>;
      for (var k = 0; k < tileInner; k = k + 1) {
        for (var inner = 0; inner < colPerThread; inner = inner + 1) {
          BCached[inner] = mm_Bsub[k][localCol + inner * ${t[0]}];
        }
        for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
          let ACached = ${a?`mm_Asub[k][localRow + innerRow * ${t[1]}];`:`mm_Asub[localRow + innerRow * ${t[1]}][k];`}
          for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
            acc[innerRow][innerCol] = acc[innerRow][innerCol] +
                ACached * BCached[innerCol];
          }
        }
      }
      workgroupBarrier();
    }
    for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      let gRow = globalRowStart + localRow + innerRow * ${t[1]};
      for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
        let gCol = globalColStart + localCol + innerCol * ${t[0]};
        mm_write(batch, gRow, gCol, acc[innerRow][innerCol]);
      }
    }
    `:`
let tileRow = i32(localId.y) * rowPerThread;
let tileCol = i32(localId.x) * colPerThread;

let globalRow = i32(globalId.y) * rowPerThread;
let globalCol = i32(globalId.x) * colPerThread;
let globalRowStart = i32(workgroupId.y) * ${p};

let tileRowA = i32(localId.y) * ${y};
let tileColA = i32(localId.x) * ${_};
let tileRowB = i32(localId.y) * ${w};
// Loop over shared dimension.
for (var t = 0; t < num_tiles; t = t + 1) {
  // Load one tile of A into local memory.
  for (var innerRow = 0; innerRow < ${y}; innerRow = innerRow + 1) {
    for (var innerCol = 0; innerCol < ${_}; innerCol = innerCol + 1) {
      let inputRow = tileRowA + innerRow;
      let inputCol = tileColA + innerCol;
      ${Fi(a,i)}
    }
  }

  // Load one tile of B into local memory.
  for (var innerRow = 0; innerRow < ${w}; innerRow = innerRow + 1) {
    for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
      let inputRow = tileRowB + innerRow;
      let inputCol = tileCol + innerCol;
      mm_Bsub[inputRow][inputCol] = mm_readB(batch,
        kStart + inputRow,
        globalCol + innerCol${i?", batchIndices":""});
    }
  }
  kStart = kStart + tileInner;
  workgroupBarrier();

  // Compute acc values for a single thread.
  var BCached : array<${r}, colPerThread>;
  for (var k = 0; k < tileInner; k = k + 1) {
    for (var inner = 0; inner < colPerThread; inner = inner + 1) {
      BCached[inner] = mm_Bsub[k][tileCol + inner];
    }

    for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      ${zu(a)}
      for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
        acc[innerRow][innerCol] = acc[innerRow][innerCol] + ACached * BCached[innerCol];
      }
    }
  }

  workgroupBarrier();
}

for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
  for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
    mm_write(batch, globalRow + innerRow, globalCol + innerCol,
        acc[innerRow][innerCol]);
  }
}
`;return`
  var<workgroup> mm_Asub : array<array<${r}, ${f}>, ${g}>;
  var<workgroup> mm_Bsub : array<array<${r}, ${h}>, ${n}>;
  const rowPerThread = ${e[1]};
  const colPerThread = ${e[0]};
  const tileInner = ${n};

@compute @workgroup_size(${t[0]}, ${t[1]}, ${t[2]})
fn main(@builtin(local_invocation_id) localId : vec3<u32>,
        @builtin(global_invocation_id) globalId : vec3<u32>,
        @builtin(workgroup_id) workgroupId : vec3<u32>) {
    let batch = ${s?"0":"i32(globalId.z)"};
    ${i?`let batchIndices = ${i.offsetToIndices("u32(batch)")};`:""}
    let num_tiles = ${s?`${Math.ceil(u/n)}`:"(uniforms.dim_inner - 1) / tileInner + 1"};
    var kStart = ${s?`i32(globalId.z) * ${u}`:"0"};

    var acc : array<array<${r}, colPerThread>, rowPerThread>;
    ${k}
  }
`},Cu=(e,t,r,i,a=!1)=>{let[n,s,u,l]=i,p=ze(i[0].type.tensor);return`
    fn mm_readA(batch: i32, row: i32, colIn: i32, batchIndices: ${n.type.indices}) -> ${Ae(e,p)} {
      var value = ${Ae(e,p)}(0.0);
      let col = colIn * ${e};
      if(row < uniforms.dim_a_outer && col < uniforms.dim_inner)
      {
        var aIndices: ${s.type.indices};
        ${cr("aIndices",s,s.rank-2,n.rank,"batchIndices")}
        ${s.indicesSet("aIndices",s.rank-2,"u32(row)")}
        ${s.indicesSet("aIndices",s.rank-1,"u32(colIn)")}
        value = ${s.getByIndices("aIndices")};
      }
      return value;
    }

    fn mm_readB(batch: i32, row: i32, colIn: i32, batchIndices: ${n.type.indices}) -> ${Ae(e,p)} {
      var value = ${Ae(e,p)}(0.0);
      let col = colIn * ${e};
      if(row < uniforms.dim_inner && col < uniforms.dim_b_outer)
      {
        var bIndices: ${u.type.indices};
        ${cr("bIndices",u,u.rank-2,n.rank,"batchIndices")}
        ${u.indicesSet("bIndices",u.rank-2,"u32(row)")}
        ${u.indicesSet("bIndices",u.rank-1,"u32(colIn)")}
        value = ${u.getByIndices("bIndices")};
      }
      return value;
    }

    fn mm_write(batch: i32, row: i32, colIn: i32, valueIn: ${Ae(e,p)}) {
      let col = colIn * ${e};
      if (row < uniforms.dim_a_outer && col < uniforms.dim_b_outer) {
        var value = valueIn;
        let coords = vec3<i32>(batch, row, colIn);
        ${t?`value = value + ${a?"bias[colIn]":`${Ae(e,p)}(bias[row])`};`:""}
        ${r}
        ${l.setByIndices("vec3<u32>(coords)","value")}
      }
    }
    `},Zr=(e,t,r,i,a=!1,n)=>{let s=e[0].dims,u=e[1].dims,l=s.slice(0,-2),p=u.slice(0,-2),h=i?i.slice(0,-2):r.slice(0,-2),f=M.size(h),g=s[s.length-2],y=s[s.length-1],_=u[u.length-1],w=y%4===0&&_%4===0,k=g<=8?[4,1,1]:[4,4,1],x=[8,8,1],b=[Math.ceil(_/x[0]/k[0]),Math.ceil(g/x[1]/k[1]),Math.ceil(f/x[2]/k[2])],T=w?4:1,S=[...l,g,y/T],I=S.length,A=[...p,y,_/T],z=A.length,v=[f,g,_/T],N=[{type:6,data:g},{type:6,data:_},{type:6,data:y}];Bt(t,N),N.push(...J(h,S,A));let U=["rank","rank"],Z=e.length>2;Z&&(N.push(...J(e[2].dims)),U.push("rank")),N.push(...J(v));let G=K=>{let R=h.length,P=Ka("batchDims",e[0].dataType,R,1),j=ze(e[0].dataType),te=D("a",e[0].dataType,I,T),ee=D("b",e[1].dataType,z,T),re=Q("result",e[0].dataType,v.length,T),ae=[te,ee];if(Z){let Ee=a?T:1;ae.push(D("bias",e[2].dataType,e[2].dims.length,Ee))}let O=[{name:"dim_a_outer",type:"i32"},{name:"dim_b_outer",type:"i32"},{name:"dim_inner",type:"i32"}];Dt(t,O);let W=ze(re.type.tensor),H=Rt(t,re.type.value,W),V=Cu(T,Z,H,[P,te,ee,re],a);return`
  ${K.registerUniforms(O).registerInternalVariables(P).declareVariables(...ae,re)}
  ${V}
  ${w?za(k,x,j,P):Ca(k,x,j,P)}
                   `};return{name:"MatMul",shaderCache:{hint:`${k};${t.activation};${w};${a}`,inputDependencies:U},getRunData:()=>({outputs:[{dims:n?n(r):r,dataType:e[0].dataType}],dispatchGroup:{x:b[0],y:b[1],z:b[2]},programUniforms:N}),getShaderSource:G}}}),Au,Vc,ly=q(()=>{ie(),ut(),se(),Pt(),Ja(),uy(),rn(),Au=(e,t,r,i,a=!1,n,s=4,u=4,l=4,p="f32")=>{let h=N=>{switch(N){case 1:return"resData = x[xIndex];";case 3:return`resData = vec3<${p}>(x[xIndex], x[xIndex + 1], x[xIndex + 2]);`;case 4:return"resData = x[xIndex / 4];";default:throw new Error(`innerElementSize ${N} is not supported.`)}},f=N=>{switch(N){case 1:return"return w[row * i32(uniforms.w_shape[3]) + colIn];";case 4:return"return w[row * i32(uniforms.w_shape[3]) / 4 + colIn];";default:throw new Error(`innerElementSize ${N} is not supported.`)}},g=e?`
    let coord = vec4<i32>(batch, xRow, xCol, xCh);
    `:`
    let coord = vec4<i32>(batch, xCh, xRow, xCol);
    `,y=e?`
    let coords = vec4<i32>(
      batch,
      row / outWidth,
      row % outWidth,
      col);
    `:`
    let coords = vec4<i32>(
      batch,
      row,
      col / outWidth,
      col % outWidth);
    `,_=e?"i32(uniforms.x_shape[1])":"i32(uniforms.x_shape[2])",w=e?"i32(uniforms.x_shape[2])":"i32(uniforms.x_shape[3])",k=e?"row":"col",x=e?"col":"row",b=`
    let inChannels = i32(uniforms.w_shape[2]);
    let outWidth = ${e?"i32(uniforms.result_shape[2])":"i32(uniforms.result_shape[3])"};
    let outRow = ${k} / outWidth;
    let outCol = ${k} % outWidth;

    let WRow = ${x} / (i32(uniforms.w_shape[1]) * inChannels);
    let WCol = ${x} / inChannels % i32(uniforms.w_shape[1]);
    let xRow = outRow * uniforms.stride[0] + uniforms.dilation[0] * WRow - uniforms.pad[0];
    let xCol = outCol * uniforms.stride[1] + uniforms.dilation[1] * WCol - uniforms.pad[1];
    let xCh = ${x} % inChannels;
    var resData = ${Ae(s,p)}(0.0);
    // The bounds checking is always needed since we use it to pad zero for
    // the 'same' padding type.
    if (xRow >= 0 && xRow < ${_} && xCol >= 0 && xCol < ${w}) {
      ${g}
      let xIndex = getIndexFromCoords4D(coord, vec4<i32>(uniforms.x_shape));
      ${h(s)}
    }
    return resData;`,T=e?t&&i?`
    let col = colIn * ${s};
    ${b}`:`
    let col = colIn * ${s};
    if (row < uniforms.dim_a_outer && col < uniforms.dim_inner) {
      ${b}
    }
    return ${Ae(s,p)}(0.0);`:i&&r?`
    let col = colIn * ${s};
    ${b}`:`
    let col = colIn * ${s};
    if (row < uniforms.dim_inner && col < uniforms.dim_b_outer) {
      ${b}
    }
    return ${Ae(s,p)}(0.0);`,S=e?i&&r?f(u):`
    let col = colIn * ${u};
    if (row < uniforms.dim_inner && col < uniforms.dim_b_outer) {
      ${f(u)}
    }
    return ${Ae(u,p)}(0.0);`:`
    let col = colIn * ${u};
    if (row < uniforms.dim_inner && col < uniforms.dim_a_outer) {
      ${f(u)}
    }
    return ${Ae(u,p)}(0.0);`,I=Ae(l,p),A=Ae(e?s:u,p),z=Ae(e?u:s,p),v=Rt(n,I,p);return`
    fn mm_readA(batch: i32, row : i32, colIn : i32) -> ${A} {
      ${e?T:S}
    }

    fn mm_readB(batch: i32, row : i32, colIn : i32) -> ${z} {
      ${e?S:T}
    }

    fn mm_write(batch: i32, row : i32, colIn : i32, valueIn : ${I}) {
      let col = colIn * ${l};
      if (row < uniforms.dim_a_outer && col < uniforms.dim_b_outer)
      {
      var value = valueIn;
      let outWidth = ${e?"i32(uniforms.result_shape[2])":"i32(uniforms.result_shape[3])"};
      ${y}
      ${Lc(a)}
      ${v}
      setOutputAtCoords(coords[0], coords[1], coords[2], coords[3], value);
      }
    }`},Vc=(e,t,r,i,a,n,s,u,l)=>{let p=t.format==="NHWC",h=p?e[0].dims[3]:e[0].dims[1],f=r[0],g=p?r[2]:r[3],y=p?r[1]:r[2],_=p?r[3]:r[1],w=p&&(h%4===0||h%3===0)&&_%4===0,k=p?_:g*y,x=p?g*y:_,b=[8,8,1],T=i<=8?[4,1,1]:[4,4,1],S=[Math.ceil(k/b[0]/T[0]),Math.ceil(x/b[1]/T[1]),Math.ceil(f/b[2]/T[2])];pe("verbose",()=>`[conv2d_mm_webgpu] dispatch = ${S}`);let I=w?p&&h%4!==0?3:4:1,A=b[1]*T[1],z=b[0]*T[0],v=Math.max(b[0]*I,b[1]),N=i%A===0,U=a%z===0,Z=n%v===0,G=w?[I,4,4]:[1,1,1],K=[{type:6,data:i},{type:6,data:a},{type:6,data:n},{type:6,data:[t.pads[0],t.pads[1]]},{type:6,data:t.strides},{type:6,data:t.dilations}];Bt(t,K),K.push(...J(e[0].dims,e[1].dims));let R=["rank","rank"];s&&(K.push(...J(e[2].dims)),R.push("rank")),K.push(...J(r));let P=j=>{let te=[{name:"dim_a_outer",type:"i32"},{name:"dim_b_outer",type:"i32"},{name:"dim_inner",type:"i32"},{name:"pad",type:"i32",length:2},{name:"stride",type:"i32",length:2},{name:"dilation",type:"i32",length:2}];Dt(t,te);let ee=w?4:1,re=ze(e[0].dataType),ae=`
      fn setOutputAtIndex(flatIndex : i32, value : ${w?`vec4<${re}>`:re}) {
        result[flatIndex] = ${w?`vec4<${re}>`:re}(value);
      }
      fn setOutputAtCoords(d0 : i32, d1 : i32, d2 : i32, d3 : i32, value : ${w?`vec4<${re}>`:re}) {
        let flatIndex = getOutputIndexFromCoords(vec4<i32>(d0, d1, d2, d3));
        setOutputAtIndex(flatIndex ${w?"/ 4":""}, value);
      }`,O=D("x",e[0].dataType,e[0].dims.length,I===3?1:I),W=D("w",e[1].dataType,e[1].dims.length,ee),H=[O,W],V=Q("result",e[0].dataType,r.length,ee);if(s){let Ee=D("bias",e[2].dataType,e[2].dims.length,ee);H.push(Ee),ae+=`
        fn getBiasByOutputCoords(coords : vec4<i32>) -> ${w?`vec4<${re}>`:re} {
          return bias[coords.${p?"w":"y"}${w?"/ 4":""}];
        }`}return`
        ${Gc("uniforms.result_strides")}
        //struct Uniforms { xShape : vec4<i32>, wShape : vec4<i32>, outShape : vec4<i32>,
        //  outShapeStrides: vec3<i32>, filterDims : vec2<i32>, pad : vec2<i32>, stride : vec2<i32>,
        //  dilation : vec2<i32>, dimAOuter : i32, dimBOuter : i32, dimInner : i32 };
        ${j.registerUniforms(te).declareVariables(...H,V)}
        ${ae}
        ${Au(p,N,U,Z,s,t,G[0],G[1],G[2],re)}
        ${w?za(T,b,re,void 0,!p,v):Ca(T,b,re,void 0,!p,v,!1,void 0,u)}`};return{name:"Conv2DMatMul",shaderCache:{hint:`${t.cacheKey};${I};${w};${N};${U};${Z};${A};${z};${v}`,inputDependencies:R},getRunData:()=>({outputs:[{dims:l?l(r):r,dataType:e[0].dataType}],dispatchGroup:{x:S[0],y:S[1],z:S[2]},programUniforms:K}),getShaderSource:P}}}),Ou,ji,tr,Mu,Ki,Ru,Hc,Fc,dy=q(()=>{ie(),ut(),ne(),se(),Pt(),Ja(),Ou=e=>{let t=1;for(let r=0;r<e.length;r++)t*=e[r];return t},ji=e=>typeof e=="number"?[e,e,e]:e,tr=(e,t)=>t<=1?e:e+(e-1)*(t-1),Mu=(e,t,r,i=1)=>{let a=tr(t,i);return Math.floor((e[0]*(r-1)-r+a)/2)},Ki=(e,t,r,i,a)=>{a==null&&(a=Mu(e,t[0],i[0]));let n=[0,0,0,r];for(let s=0;s<3;s++)e[s]+2*a>=t[s]&&(n[s]=Math.trunc((e[s]-t[s]+2*a)/i[s]+1));return n},Ru=(e,t,r,i,a,n,s,u,l,p)=>{let h,f,g,y;if(e==="VALID"&&(e=0),typeof e=="number"){h={top:e,bottom:e,left:e,right:e,front:e,back:e};let _=Ki([t,r,i,1],[u,l,p],1,[a,n,s],e);f=_[0],g=_[1],y=_[2]}else if(Array.isArray(e)){if(!e.every((w,k,x)=>w===x[0]))throw Error(`Unsupported padding parameter: ${e}`);h={top:e[0],bottom:e[1],left:e[2],right:e[3],front:e[4],back:e[5]};let _=Ki([t,r,i,1],[u,l,p],1,[a,n,s],e[0]);f=_[0],g=_[1],y=_[2]}else if(e==="SAME_UPPER"){f=Math.ceil(t/a),g=Math.ceil(r/n),y=Math.ceil(i/s);let _=(f-1)*a+u-t,w=(g-1)*n+l-r,k=(y-1)*s+p-i,x=Math.floor(_/2),b=_-x,T=Math.floor(w/2),S=w-T,I=Math.floor(k/2),A=k-I;h={top:T,bottom:S,left:I,right:A,front:x,back:b}}else throw Error(`Unknown padding parameter: ${e}`);return{padInfo:h,outDepth:f,outHeight:g,outWidth:y}},Hc=(e,t,r,i,a,n=!1,s="channelsLast")=>{let u,l,p,h,f;if(s==="channelsLast")[u,l,p,h,f]=e;else if(s==="channelsFirst")[u,f,l,p,h]=e;else throw new Error(`Unknown dataFormat ${s}`);let[g,,y,_,w]=t,[k,x,b]=ji(r),[T,S,I]=ji(i),A=tr(y,T),z=tr(_,S),v=tr(w,I),{padInfo:N,outDepth:U,outHeight:Z,outWidth:G}=Ru(a,l,p,h,k,x,b,A,z,v),K=n?g*f:g,R=[0,0,0,0,0];return s==="channelsFirst"?R=[u,K,U,Z,G]:s==="channelsLast"&&(R=[u,U,Z,G,K]),{batchSize:u,dataFormat:s,inDepth:l,inHeight:p,inWidth:h,inChannels:f,outDepth:U,outHeight:Z,outWidth:G,outChannels:K,padInfo:N,strideDepth:k,strideHeight:x,strideWidth:b,filterDepth:y,filterHeight:_,filterWidth:w,effectiveFilterDepth:A,effectiveFilterHeight:z,effectiveFilterWidth:v,dilationDepth:T,dilationHeight:S,dilationWidth:I,inShape:e,outShape:R,filterShape:t}},Fc=(e,t,r,i,a,n)=>{let s=n==="channelsLast";s?e[0].dims[3]:e[0].dims[1];let u=[64,1,1],l={x:r.map((k,x)=>x)},p=[Math.ceil(Ou(l.x.map(k=>r[k]))/u[0]),1,1];pe("verbose",()=>`[conv3d_naive_webgpu] dispatch = ${p}`);let h=1,f=M.size(r),g=[{type:12,data:f},{type:12,data:i},{type:12,data:a},{type:12,data:t.strides},{type:12,data:t.dilations}];Bt(t,g),g.push(...J(e[0].dims,e[1].dims));let y=["rank","rank"],_=e.length===3;_&&(g.push(...J(e[2].dims)),y.push("rank")),g.push(...J(r));let w=k=>{let x=[{name:"output_size",type:"u32"},{name:"filter_dims",type:"u32",length:i.length},{name:"pads",type:"u32",length:a.length},{name:"strides",type:"u32",length:t.strides.length},{name:"dilations",type:"u32",length:t.dilations.length}];Dt(t,x);let b=1,T=ze(e[0].dataType),S=D("x",e[0].dataType,e[0].dims.length,h),I=D("W",e[1].dataType,e[1].dims.length,b),A=[S,I],z=Q("result",e[0].dataType,r.length,b),v="";if(_){let Z=D("bias",e[2].dataType,e[2].dims.length,b);A.push(Z),v+=`
        fn getBiasByOutputCoords(coords : array<u32, 5>) -> ${T} {
          return bias[${s?Y("coords",4,5):Y("coords",1,5)}];
        }`}let N=Ae(h,T),U=Rt(t,N,T);return`
            ${v}
            fn getX(d0 : u32, d1 : u32, d2 : u32, d3 : u32, d4 : u32) -> f32 {
              let aIndices = array<u32, 5>(d0, d1, d2, d3, d4);
              return ${S.getByIndices("aIndices")};
            }
            fn getW(d0 : u32, d1 : u32, d2 : u32, d3 : u32, d4 : u32) -> f32 {
              let aIndices = array<u32, 5>(d0, d1, d2, d3, d4);
              return ${I.getByIndices("aIndices")};
            }
          ${k.registerUniforms(x).declareVariables(...A,z)}
          ${k.mainStart()}
          ${k.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
              let coords = ${z.offsetToIndices("global_idx")};
              let batch = ${Y("coords",0,S.rank)};
              let d2 = ${s?Y("coords",S.rank-1,S.rank):Y("coords",1,S.rank)};
              let xFRCCorner = vec3<u32>(${s?Y("coords",1,S.rank):Y("coords",2,S.rank)},
              ${s?Y("coords",2,S.rank):Y("coords",3,S.rank)},
              ${s?Y("coords",3,S.rank):Y("coords",4,S.rank)}) * uniforms.strides - uniforms.pads;
              let xFCorner = xFRCCorner.x;
              let xRCorner = xFRCCorner.y;
              let xCCorner = xFRCCorner.z;
              let xShapeY = ${s?Y("uniforms.x_shape",1,S.rank):Y("uniforms.x_shape",2,S.rank)};
              let xShapeZ = ${s?Y("uniforms.x_shape",2,S.rank):Y("uniforms.x_shape",3,S.rank)};
              let xShapeW = ${s?Y("uniforms.x_shape",3,S.rank):Y("uniforms.x_shape",4,S.rank)};
              let xShapeU = ${s?Y("uniforms.x_shape",4,S.rank):Y("uniforms.x_shape",1,S.rank)};
              let inputDepthNearestVec4 = (xShapeU / 4) * 4;
              let inputDepthVec4Remainder = xShapeU % 4;

              var value = 0.0;
              for (var wF = 0u; wF < uniforms.filter_dims[0]; wF++) {
                let xF = xFCorner + wF * uniforms.dilations[0];
                if (xF < 0 || xF >= xShapeY) {
                  continue;
                }

                for (var wR = 0u; wR < uniforms.filter_dims[1]; wR++) {
                  let xR = xRCorner + wR * uniforms.dilations[1];
                  if (xR < 0 || xR >= xShapeZ) {
                    continue;
                  }

                  for (var wC = 0u; wC < uniforms.filter_dims[2]; wC++) {
                    let xC = xCCorner + wC * uniforms.dilations[2];
                    if (xC < 0 || xC >= xShapeW) {
                      continue;
                    }

                    for (var d1 = 0u; d1 < inputDepthNearestVec4; d1 += 4) {
                      ${s?`let xValues = vec4<f32>(
                               getX(batch, xF, xR, xC, d1),
                               getX(batch, xF, xR, xC, d1 + 1),
                               getX(batch, xF, xR, xC, d1 + 2),
                               getX(batch, xF, xR, xC, d1 + 3));
                            `:`let xValues = vec4<f32>(
                               getX(batch, d1, xF, xR, xC),
                               getX(batch, d1 + 1, xF, xR, xC),
                               getX(batch, d1 + 2, xF, xR, xC),
                               getX(batch, d1 + 3, xF, xR, xC));
                            `}
                            let wValues = vec4<f32>(
                              getW(d2, d1, wF, wR, wC),
                              getW(d2, d1 + 1, wF, wR, wC),
                              getW(d2, d1 + 2, wF, wR, wC),
                              getW(d2, d1 + 3, wF, wR, wC));
                      value += dot(xValues, wValues);
                    }
                    if (inputDepthVec4Remainder == 1) {
                        ${s?`value += getX(batch, xF, xR, xC, inputDepthNearestVec4)
                          * getW(d2, inputDepthNearestVec4, wF, wR, wC);`:`value += getX(batch, inputDepthNearestVec4, xF, xR, xC)
                          * getW(d2, inputDepthNearestVec4, wF, wR, wC);`}
                    } else if (inputDepthVec4Remainder == 2) {
                      ${s?`let xValues = vec2<f32>(
                        getX(batch, xF, xR, xC, inputDepthNearestVec4),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 1));
                      `:`let xValues = vec2<f32>(
                        getX(batch, inputDepthNearestVec4, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 1, xF, xR, xC));
                    `}
                    let wValues = vec2<f32>(
                      getW(d2, inputDepthNearestVec4, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 1, wF, wR, wC));
                      value += dot(xValues, wValues);
                    } else if (inputDepthVec4Remainder == 3) {
                      ${s?`let xValues = vec3<f32>(
                        getX(batch, xF, xR, xC, inputDepthNearestVec4),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 1),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 2));
                      `:`let xValues = vec3<f32>(
                        getX(batch, inputDepthNearestVec4, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 1, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 2, xF, xR, xC));
                    `}
                    let wValues = vec3<f32>(
                      getW(d2, inputDepthNearestVec4, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 1, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 2, wF, wR, wC));
                      value += dot(xValues, wValues);
                    }
                  }
                }
              }
              ${_?"value = value + getBiasByOutputCoords(coords)":""};
              ${U}
              result[global_idx] = f32(value);
          }`};return{name:"Conv3DNaive",shaderCache:{hint:`${t.cacheKey};${s};${h};${_}`,inputDependencies:y},getRunData:()=>({outputs:[{dims:r,dataType:e[0].dataType}],dispatchGroup:{x:p[0],y:p[1],z:p[2]},programUniforms:g}),getShaderSource:w}}}),jc,Kc,py=q(()=>{ie(),ne(),se(),Pt(),jc=(e,t,r,i)=>{let a=e.length>2,n=a?"value += b[output_channel];":"",s=e[0].dims,u=e[1].dims,l=t.format==="NHWC",p=l?r[3]:r[1],h=p/t.group,f=l&&h>=4?Se(p):1,g=M.size(r)/f,y=[{type:12,data:g},{type:12,data:t.dilations},{type:12,data:[t.strides[0],t.strides[1]]},{type:12,data:[t.pads[0],t.pads[1]]},{type:12,data:h}];Bt(t,y),y.push(...J(s,[u[0],u[1],u[2],u[3]/f]));let _=a?["rank","rank","rank"]:["rank","rank"];y.push(...J([r[0],r[1],r[2],r[3]/f]));let w=k=>{let x=Q("output",e[0].dataType,r.length,f),b=ze(x.type.tensor),T=Rt(t,x.type.value,b),S=D("x",e[0].dataType,s.length),I=D("w",e[1].dataType,u.length,f),A=[S,I];a&&A.push(D("b",e[2].dataType,e[2].dims,f));let z=[{name:"output_size",type:"u32"},{name:"dilations",type:"u32",length:t.dilations.length},{name:"strides",type:"u32",length:2},{name:"pads",type:"u32",length:2},{name:"output_channels_per_group",type:"u32"}];Dt(t,z);let v=l?`
      for (var wHeight: u32 = 0u; wHeight < uniforms.w_shape[0]; wHeight++) {
        let xHeight = xRCCorner.x + wHeight * uniforms.dilations[0];

        if (xHeight < 0u || xHeight >= uniforms.x_shape[1]) {
          continue;
        }

        for (var wWidth: u32 = 0u; wWidth < uniforms.w_shape[1]; wWidth++) {
          let xWidth = xRCCorner.y + wWidth * uniforms.dilations[1];
          if (xWidth < 0u || xWidth >= uniforms.x_shape[2]) {
            continue;
          }

          for (var wInChannel: u32 = 0u; wInChannel < uniforms.w_shape[2]; wInChannel++) {
            let input_channel = in_channel_offset + wInChannel;
            let xVal = ${S.get("batch","xHeight","xWidth","input_channel")};
            let wVal = ${I.get("wHeight","wWidth","wInChannel","output_channel")};
            value += xVal * wVal;
          }
        }
      }
      `:`
      for (var wInChannel: u32 = 0u; wInChannel < uniforms.w_shape[1]; wInChannel++) {
        let input_channel = in_channel_offset + wInChannel;
        for (var wHeight: u32 = 0u; wHeight < uniforms.w_shape[2]; wHeight++) {
          let xHeight = xRCCorner.x + wHeight * uniforms.dilations[0];

          if (xHeight < 0u || xHeight >= uniforms.x_shape[2]) {
            continue;
          }

          for (var wWidth: u32 = 0u; wWidth < uniforms.w_shape[3]; wWidth++) {
            let xWidth = xRCCorner.y + wWidth * uniforms.dilations[1];
            if (xWidth < 0u || xWidth >= uniforms.x_shape[3]) {
              continue;
            }

            let xVal = ${S.get("batch","input_channel","xHeight","xWidth")};
            let wVal = ${I.get("output_channel","wInChannel","wHeight","wWidth")};
            value += xVal * wVal;
          }
        }
      }
      `;return`
  ${k.registerUniforms(z).declareVariables(...A,x)}

  ${k.mainStart()}
    ${k.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let outputIndices = ${x.offsetToIndices("global_idx")};
    let batch: u32 = outputIndices[0];
    let output_channel: u32 = outputIndices[${l?3:1}];
    let xRCCorner: vec2<u32> = vec2<u32>(outputIndices[${l?1:2}], outputIndices[${l?2:3}]) * uniforms.strides - uniforms.pads;
    let group_id: u32 = output_channel * ${f} / uniforms.output_channels_per_group;
    var in_channel_offset = group_id * uniforms.w_shape[${l?2:1}];

    var value: ${x.type.value} = ${x.type.value}(0);
    ${v}
    ${n}
    ${T}
    ${x.setByOffset("global_idx","value")}
  }`};return{name:"GroupedConv",shaderCache:{hint:`${t.cacheKey}_${f}`,inputDependencies:_},getRunData:()=>({outputs:[{dims:i?i(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:y}),getShaderSource:w}},Kc=(e,t,r,i)=>{let a=e.length>2,n=Se(r[3]),s=Se(r[2]),u=M.size(r)/n/s,l=[e[0].dims[0],e[0].dims[1],e[0].dims[2],e[0].dims[3]/n],p=[e[1].dims[0],e[1].dims[1],e[1].dims[2],e[1].dims[3]/n],h=[r[0],r[1],r[2],r[3]/n],f=[{type:12,data:u},{type:6,data:[t.strides[0],t.strides[1]]},{type:6,data:[t.pads[0],t.pads[1]]}];Bt(t,f),f.push(...J(l,p,h));let g=(s-1)*t.strides[1]+p[1],y=_=>{let w=Q("output",e[0].dataType,h.length,n),k=ze(w.type.tensor),x=Rt(t,w.type.value,k),b=D("x",e[0].dataType,l.length,n),T=D("w",e[1].dataType,p.length,n),S=[b,T];a&&S.push(D("b",e[2].dataType,e[2].dims,n));let I=a?"value += b[output_channel];":"",A=[{name:"output_size",type:"u32"},{name:"strides",type:"i32",length:2},{name:"pads",type:"i32",length:2}];return Dt(t,A),`
  ${_.registerUniforms(A).declareVariables(...S,w)}
  ${_.mainStart()}
    ${_.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let width0 = uniforms.output_shape[3];
    let output_channel = global_idx % width0;
    var index1 = global_idx / width0;
    let width1 = uniforms.output_shape[2] / ${s}u;
    let col = (index1 % width1) * ${s}u;
    index1 = index1 / width1;
    let row = index1 % uniforms.output_shape[1];
    let batch = index1 / uniforms.output_shape[1];

    let x_corner = vec2<i32>(i32(row), i32(col)) * uniforms.strides - uniforms.pads;

    var x_vals: array<${b.type.value}, ${g}>;
    var values: array<${w.type.value}, ${s}>;
    let input_channel = output_channel;
    // Use constant instead of uniform can give better performance for w's height/width.
    for (var w_height: u32 = 0u; w_height < ${p[0]}; w_height++) {
      let x_height = x_corner.x + i32(w_height);
      if (x_height >= 0 && u32(x_height) < uniforms.x_shape[1]) {
        for (var i = 0; i < ${g}; i++) {
          let x_width = x_corner.y + i;
          if (x_width >= 0 && u32(x_width) < uniforms.x_shape[2]) {
            x_vals[i] = ${b.get("batch","u32(x_height)","u32(x_width)","input_channel")};
          } else {
            x_vals[i] = ${b.type.value}(0);
          }
        }
        for (var w_width: u32 = 0u; w_width < ${p[1]}; w_width++) {
          let w_val = ${T.get("w_height","w_width","0","output_channel")};
          for (var i = 0u; i < ${s}u; i++) {
            values[i] = fma(x_vals[i * u32(uniforms.strides[1]) + w_width], w_val, values[i]);
          }
        }
      }
    }

    for (var i = 0u; i < ${s}u; i++) {
      var value = values[i];
      ${I}
      ${x}
      ${w.set("batch","row","col + i","output_channel","value")};
    }
  }`};return{name:"GroupedConv-Vectorize",shaderCache:{hint:`${t.cacheKey};${n};${s};${g};${p[0]};${p[1]}`,inputDependencies:a?["rank","rank","type"]:["rank","rank"]},getRunData:()=>({outputs:[{dims:i?i(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(u/64)},programUniforms:f}),getShaderSource:y}}}),Bu,Br,Du,Dr,Aa,Zi,Nu,Pu,Oa,cy=q(()=>{ne(),ly(),dy(),rn(),py(),Pt(),tn(),bt(),Bu=(e,t,r,i,a,n)=>{let s=e[0],u=e.slice(n?1:2,n?3:4),l=u.length,p=t[0],h=t.slice(2).map((g,y)=>g+(g-1)*(r[y]-1)),f=u.map((g,y)=>g+i[y]+i[y+l]).map((g,y)=>Math.floor((g-h[y]+a[y])/a[y]));return f.splice(0,0,s),f.splice(n?3:1,0,p),f},Br=[2,3,1,0],Du=(e,t)=>{if(!e||e.length!==2&&e.length!==3)throw new Error("Conv requires 2 or 3 inputs");if(e[0].dims.length>5)throw new Error("greater than 5D is not supported");if(e[0].dims.length!==e[1].dims.length)throw new Error("filter does not have same dimension as input");let r=e[0].dims[t.format==="NHWC"?e[0].dims.length-1:1],i=e[1].dims[1]*t.group;if(r!==i)throw new Error("FILTER_IN_CHANNEL should be equal to DATA_CHANNEL");if(e.length===3&&(e[2].dims.length!==1||e[1].dims[0]!==e[2].dims[0]))throw new Error("invalid bias");let a=e[0].dims.length-2;if(t.dilations.length!==a)throw new Error(`dilations should be ${a}D`);if(t.strides.length!==a)throw new Error(`strides should be ${a}D`);if(t.pads.length!==a*2)throw new Error(`pads should be ${a*2}D`);if(t.kernelShape.length!==0&&t.kernelShape.length!==e[1].dims.length-2)throw new Error("invalid kernel shape")},Dr=(e,t)=>{let r=e.kernelShape.slice();r.length<t[1].dims.length-2&&r.push(...Array(t[1].dims.length-2-r.length).fill(0));for(let n=2;n<t[1].dims.length;++n)r[n-2]===0&&(r[n-2]=t[1].dims[n]);let i=e.pads.slice();jr.adjustPadsBasedOnAutoPad(t[0].dims,e.strides,e.dilations,r,i,e.format==="NHWC",e.autoPad);let a=Object.assign({},e);return Object.assign(a,{kernelShape:r,pads:i}),a},Aa=e=>{let t=Ya(e),r=e.format,i=["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][e.auto_pad],a=e.dilations,n=e.group,s=e.kernel_shape,u=e.pads,l=e.strides,p=e.w_is_const();return{autoPad:i,format:r,dilations:a,group:n,kernelShape:s,pads:u,strides:l,wIsConst:p,...t,cacheKey:`${e.format};${t.activation};`}},Zi=(e,t,r,i)=>{let a=r.format==="NHWC",n=Bu(t[0].dims,t[1].dims,r.dilations,r.pads,r.strides,a);if(r.group!==1){let A=[t[0]];if(a){let z=e.kernelCustomData.wT??e.compute(Ue(t[1],Br),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=z),A.push(z)}else A.push(t[1]);t.length===3&&A.push(t[2]),!e.adapterInfo.isArchitecture("ampere")&&a&&t[1].dims[0]===r.group&&t[1].dims[1]===1&&r.dilations[0]===1&&r.dilations[1]===1?e.compute(Kc(A,r,n,i),{inputs:A}):e.compute(jc(A,r,n,i),{inputs:A});return}let s=t.length===3,u=t[0].dims[a?1:2],l=t[0].dims[a?2:3],p=t[0].dims[a?3:1],h=t[1].dims[2],f=t[1].dims[3],g=n[a?1:2],y=n[a?2:3],_=n[a?3:1],w=a&&h===u&&f===l&&r.pads[0]===0&&r.pads[1]===0;if(w||h===1&&f===1&&r.dilations[0]===1&&r.dilations[1]===1&&r.strides[0]===1&&r.strides[1]===1&&r.pads[0]===0&&r.pads[1]===0){let A=n[0],z,v,N,U=[];if(a){let K=e.kernelCustomData.wT??e.compute(Ue(t[1],Br),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];if(r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=K),w){let R=u*l*p;z=t[0].reshape([1,A,R]),v=K.reshape([1,R,_]),N=[1,A,_]}else z=t[0].reshape([A,u*l,p]),v=K.reshape([1,p,_]),N=[A,g*y,_];U.push(z),U.push(v)}else z=t[0].reshape([A,p,u*l]),v=t[1].reshape([1,_,p]),N=[A,_,g*y],U.push(v),U.push(z);s&&U.push(t[2]);let Z=N[2],G=U[0].dims[U[0].dims.length-1];Z<8&&G<8?e.compute(en(U,r,n,N,a,i),{inputs:U}):e.compute(Zr(U,r,n,N,a,i),{inputs:U});return}let k=!0,x=e.kernelCustomData.wT??e.compute(Ue(t[1],Br),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=x);let b=[t[0],x];s&&b.push(t[2]);let T=a?g*y:_,S=a?_:g*y,I=h*f*p;e.compute(Vc(b,r,n,T,S,I,s,k,i),{inputs:b})},Nu=(e,t)=>{let r=t.format==="NHWC",i=[e.inputs[0].reshape(r?[e.inputs[0].dims[0],1,e.inputs[0].dims[1],e.inputs[0].dims[2]]:[e.inputs[0].dims[0],e.inputs[0].dims[1],1,e.inputs[0].dims[2]]),e.inputs[1].reshape([e.inputs[1].dims[0],e.inputs[1].dims[1],1,e.inputs[1].dims[2]])];e.inputs.length===3&&i.push(e.inputs[2]);let a=[0,t.pads[0],0,t.pads[1]],n=[1].concat(t.strides),s=[1].concat(t.dilations),u=[1].concat(t.kernelShape),l=Dr({...t,pads:a,strides:n,dilations:s,kernelShape:u},i);Zi(e,i,l,p=>r?[p[0],p[2],p[3]]:[p[0],p[1],p[3]])},Pu=(e,t,r)=>{let i=r.format==="NHWC"?"channelsLast":"channelsFirst",a=Dr(r,t),n=r.autoPad==="NOTSET"?r.pads:r.autoPad,s=Hc(t[0].dims,t[1].dims,r.strides,r.dilations,n,!1,i);e.compute(Fc(t,a,s.outShape,[s.filterDepth,s.filterHeight,s.filterWidth],[s.padInfo.front,s.padInfo.top,s.padInfo.left],i))},Oa=(e,t)=>{if(Du(e.inputs,t),e.inputs[0].dims.length===3)Nu(e,t);else if(e.inputs[0].dims.length===5)Pu(e,e.inputs,t);else{let r=Dr(t,e.inputs);Zi(e,e.inputs,r)}}}),Zc,hy=q(()=>{ie(),ut(),ne(),se(),Zc=(e,t,r)=>{let i=e.length>2,a=t.outputShape,n=t.format==="NHWC",s=t.group,u=e[1].dims,l=u[2]/s,p=u[3],h=n?Se(l):1,f=n&&p===1&&l>=4,g=f?Math.floor(l/4)*4:Math.floor(l/h)*h,y=l-g,_=n?Se(p):1,w=n?p===1?h:_:1,k=M.size(a)/_,x=[Math.ceil(k/64),1,1];pe("verbose",()=>`[conv2d_backprop_webgpu] dispatch = ${x}`);let b=["rank","rank"],T=[t.strides[0],t.strides[1]],S=[t.kernelShape[n?1:2],t.kernelShape[n?2:3]],I=[t.dilations[0],t.dilations[1]],A=[S[0]+(t.dilations[0]<=1?0:(t.kernelShape[n?1:2]-1)*(t.dilations[0]-1)),S[1]+(t.dilations[1]<=1?0:(t.kernelShape[n?2:3]-1)*(t.dilations[1]-1))],z=[A[0]-1-Math.floor((t.pads[0]+t.pads[2])/2),A[1]-1-Math.floor((t.pads[1]+t.pads[3])/2)],v=[{type:12,data:k},{type:12,data:T},{type:12,data:S},{type:12,data:I},{type:12,data:A},{type:6,data:z},{type:12,data:g},{type:12,data:l},{type:12,data:p},...J(e[0].dims,e[1].dims)];i&&(v.push(...J(e[2].dims)),b.push("rank")),v.push(...J(a));let N=U=>{let Z=[{name:"output_size",type:"u32"},{name:"strides",type:"u32",length:T.length},{name:"filter_dims",type:"u32",length:S.length},{name:"dilations",type:"u32",length:S.length},{name:"effective_filter_dims",type:"u32",length:A.length},{name:"pads",type:"i32",length:z.length},{name:"input_channels_per_group_int",type:"u32"},{name:"input_channels_per_group",type:"u32"},{name:"output_channels_per_group",type:"u32"}],G=ze(e[0].dataType),K=n?1:2,R=n?2:3,P=n?3:1,j=D("W",e[1].dataType,e[1].dims.length,w),te=D("Dy",e[0].dataType,e[0].dims.length,h),ee=[te,j];i&&ee.push(D("bias",e[2].dataType,[a[P]].length,_));let re=Q("result",e[0].dataType,a.length,_),ae=()=>{let H="";if(f)h===4?H+=`
        let xValue = ${te.getByOffset("x_offset")};
        let wValue = ${j.getByOffset("w_offset")};
        dotProd = dotProd + dot(xValue, wValue);
        x_offset += 1u;
        w_offset += 1u;`:h===2?H+=`
          dotProd = dotProd + dot(vec4<${G}>(${te.getByOffset("x_offset")}, ${te.getByOffset("x_offset + 1u")}), vec4<${G}>(${j.getByOffset("w_offset")}, ${j.getByOffset("w_offset + 1u")}));
          x_offset += 2u;
          w_offset += 2u;`:h===1&&(H+=`
          dotProd = dotProd + dot(vec4<${G}>(${te.getByOffset("x_offset")}, ${te.getByOffset("x_offset + 1u")}, ${te.getByOffset("x_offset + 2u")}, ${te.getByOffset("x_offset + 3u")}), vec4<${G}>(${j.getByOffset("w_offset")}, ${j.getByOffset("w_offset + 1u")}, ${j.getByOffset("w_offset + 2u")}, ${j.getByOffset("w_offset + 3u")}));
          x_offset += 4u;
          w_offset += 4u;`);else if(H+=`
                  let xValue = ${n?te.getByOffset(`${te.indicesToOffset(`${te.type.indices}(batch, idyR, idyC, inputChannel)`)} / ${h}`):te.get("batch","inputChannel","idyR","idyC")};
        `,h===1)H+=`
          let w_offset = ${j.indicesToOffset(`${j.type.indices}(u32(wRPerm), u32(wCPerm), inputChannel, wOutChannel)`)};
          let wValue = ${j.getByOffset(`w_offset / ${w}`)};
          dotProd = dotProd + xValue * wValue;`;else for(let V=0;V<h;V++)H+=`
            let wValue${V} = ${j.getByOffset(`${j.indicesToOffset(`${j.type.indices}(u32(wRPerm), u32(wCPerm), inputChannel + ${V}, wOutChannel)`)} / ${w}`)};
            dotProd = dotProd + xValue[${V}] * wValue${V};`;return H},O=()=>{if(y===0)return"";if(!f)throw new Error(`packInputAs4 ${f} is not true.`);let H="";if(h===1){H+="dotProd = dotProd";for(let V=0;V<y;V++)H+=`
            + ${te.getByOffset(`x_offset + ${V}`)} * ${j.getByOffset(`w_offset + ${V}`)}`;H+=";"}else if(h===2){if(y!==2)throw new Error(`Invalid inputChannelsRemainder ${y}.`);H+=`
          let xValue = ${te.getByOffset("x_offset")};
          let wValue = ${j.getByOffset("w_offset")};
          dotProd = dotProd + dot(xValue, wValue);`}return H},W=`
            let outputIndices = ${re.offsetToIndices(`global_idx * ${_}`)};
            let batch = ${re.indicesGet("outputIndices",0)};
            let d1 = ${re.indicesGet("outputIndices",P)};
            let r = ${re.indicesGet("outputIndices",K)};
            let c = ${re.indicesGet("outputIndices",R)};
            let dyCorner = vec2<i32>(i32(r), i32(c)) - uniforms.pads;
            let dyRCorner = dyCorner.x;
            let dyCCorner = dyCorner.y;
            let groupId = d1 / uniforms.output_channels_per_group;
            let wOutChannel = d1 - groupId * uniforms.output_channels_per_group;
            // Convolve dy(?, ?, d2) with w(:, :, d1, d2) to compute dx(xR, xC, d1).
            // ? = to be determined. : = across all values in that axis.
            var dotProd = ${re.type.value}(0.0);
            var wR: u32 = 0;
            if (uniforms.dilations.x == 1) {
              // Minimum wR >= 0 that satisfies (dyRCorner + wR) % (uniforms.strides.x) == 0
              wR = u32(((dyRCorner + i32(uniforms.strides.x) - 1) / i32(uniforms.strides.x)) * i32(uniforms.strides.x) - dyRCorner);
            }
            for (; wR < uniforms.effective_filter_dims.x; wR = wR + 1) {
              if (wR % uniforms.dilations.x != 0) {
                continue;
              }
              let dyR = (${G}(dyRCorner) + ${G}(wR)) / ${G}(uniforms.strides[0]);
              let wRPerm = uniforms.filter_dims.x - 1 - wR / uniforms.dilations.x;
              if (dyR < 0.0 || dyR >= ${G}(uniforms.Dy_shape[${K}]) || fract(dyR) > 0.0 ||
                  wRPerm < 0) {
                continue;
              }
              let idyR: u32 = u32(dyR);
              var wC: u32 = 0;
              if (uniforms.dilations.y == 1) {
                // Minimum wC >= 0 that satisfies (dyCCorner + wC) % (uniforms.strides.y) == 0
                wC = u32(((dyCCorner + i32(uniforms.strides.y) - 1) / i32(uniforms.strides.y)) * i32(uniforms.strides.y) - dyCCorner);
              }
              for (; wC < uniforms.effective_filter_dims.y; wC = wC + 1) {
                if (wC % uniforms.dilations.y != 0) {
                  continue;
                }
                let dyC = (${G}(dyCCorner) + ${G}(wC)) / ${G}(uniforms.strides.y);
                let wCPerm = uniforms.filter_dims.y - 1 - wC / uniforms.dilations.y;
                if (dyC < 0.0 || dyC >= ${G}(uniforms.Dy_shape[${R}]) ||
                    fract(dyC) > 0.0 || wCPerm < 0) {
                  continue;
                }
                let idyC: u32 = u32(dyC);
                var inputChannel = groupId * uniforms.input_channels_per_group;
                ${f?`
                var x_offset = ${te.indicesToOffset(`${te.type.indices}(batch, idyR, idyC, inputChannel)`)} / ${h};
                var w_offset = ${j.indicesToOffset(`${j.type.indices}(wRPerm, wCPerm, inputChannel, wOutChannel)`)} / ${w};
                  `:""}
                for (var d2: u32 = 0; d2 < uniforms.input_channels_per_group_int; d2 = d2 + ${f?4:h}) {
                  ${ae()}
                  inputChannel = inputChannel + ${f?4:h};
                }
                ${O()}
                wC = wC + uniforms.strides.y - 1;
              }
              wR = wR + uniforms.strides[0] - 1;
            }
            let value = dotProd${i?` + bias[d1 / ${_}]`:""};
            ${re.setByOffset("global_idx","value")};
          `;return`
    ${U.registerUniforms(Z).declareVariables(...ee,re)}
      ${U.mainStart()}
      ${U.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")};
    ${W}}`};return{name:"ConvTranspose2D",shaderCache:{hint:`${t.cacheKey};${h}${w}${_}${f}${y}`,inputDependencies:b},getRunData:()=>({dispatchGroup:{x:x[0],y:x[1],z:x[2]},outputs:[{dims:r?r(a):a,dataType:e[0].dataType}],programUniforms:v}),getShaderSource:N}}}),Uu,Wu,qu,Xi,Xc,Lu,Qi,Gu,Qc,fy=q(()=>{hy(),Pt(),bt(),Uu=(e,t,r,i,a,n)=>(e-1)*t+r+(i-1)*a+1-n,Wu=(e,t,r,i,a)=>{let n=Math.floor(e/2);t==="SAME_UPPER"?(r[i]=n,r[a]=e-n):t==="SAME_LOWER"&&(r[i]=e-n,r[a]=n)},qu=(e,t,r,i,a,n,s,u,l,p)=>{let h=e.length-2,f=p.length===0;l.length<h&&l.push(...Array(h-l.length).fill(0));let g=e[0],y=t[u?3:1]*a;for(let _=0,w=e.length-h-(u?1:0);_<h;++_,++w){let k=e[w],x=f?k*s[_]:p[_],b=Uu(k,s[_],n[_],t[w],r[_],x);Wu(b,i,n,_,_+h),f&&p.push(s[_]*(k-1)+l[_]+(t[w]-1)*r[_]+1-n[_]-n[_+h])}p.splice(0,0,g),p.splice(u?3:1,0,y)},Xi=(e,t)=>{let r=e.kernelShape.slice();if(e.kernelShape.length===0||e.kernelShape.reduce((f,g)=>f*g,1)===0){r.length=0;for(let f=2;f<t[1].dims.length;++f)r.push(t[1].dims[f])}let i=e.format==="NHWC";r.splice(0,0,t[1].dims[0]),r.splice(i?3:1,0,t[1].dims[1]);let a=e.pads.slice(),n=e.outputShape.slice(),s=e.outputPadding.slice(),u=t[0].dims,l=e.dilations.slice();if(l.reduce((f,g)=>f+g,0)===0){let f=t[0].dims.length-2;l=new Array(f).fill(1)}let p=e.strides.slice();if(p.reduce((f,g)=>f+g,0)===0){let f=t[0].dims.length-2;p=new Array(f).fill(1)}qu(u,r,l,e.autoPad,e.group,a,p,i,s,n);let h=Object.assign({},e);return Object.assign(h,{kernelShape:r,pads:a,outputPadding:s,outputShape:n,dilations:l,strides:p}),h},Xc=e=>{let t=Ya(e),r=e.format,i=["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][typeof e.autoPad>"u"?0:e.autoPad],a=e.dilations,n=e.group??1,s=e.kernelShape,u=e.pads,l=e.strides,p=e.wIsConst(),h=e.outputPadding,f=e.outputShape;return{autoPad:i,format:r,dilations:a,group:n,kernelShape:s,outputPadding:h,outputShape:f,pads:u,strides:l,wIsConst:p,...t,cacheKey:`${e.format};${t.activation};`}},Lu=(e,t)=>{if(!e||e.length!==2&&e.length!==3)throw new Error("Conv requires 2 or 3 inputs");if(e[0].dims.length!==4&&e[0].dims.length!==3)throw new Error("currently only support 2-dimensional conv");if(e[0].dims.length!==e[1].dims.length)throw new Error("filter does not have same dimension as input");let r=e[0].dims[t.format==="NHWC"?e[0].dims.length-1:1],i=e[1].dims[0];if(r!==i)throw new Error("FILTER_IN_CHANNEL should be equal to DATA_CHANNEL");let a=e[1].dims[1]*t.group;if(e.length===3&&(e[2].dims.length!==1||e[2].dims[0]!==a))throw new Error("invalid bias");let n=e[0].dims.length-2;if(t.dilations.reduce((s,u)=>s+u,0)>0&&t.dilations.length!==n)throw new Error(`dilations should be ${n}D`);if(t.strides.reduce((s,u)=>s+u,0)>0&&t.strides.length!==n)throw new Error(`strides should be ${n}D`);if(t.pads.reduce((s,u)=>s+u,0)>0&&t.pads.length!==n*2)throw new Error(`pads should be ${n*2}D`);if(t.outputPadding.length!==n&&t.outputPadding.length!==0)throw new Error(`output_padding should be ${n}D`);if(t.kernelShape.reduce((s,u)=>s+u,0)>0&&t.kernelShape.length!==0&&t.kernelShape.length!==e[1].dims.length-2)throw new Error("invalid kernel shape");if(t.outputShape.length!==0&&t.outputShape.length!==e[0].dims.length-2)throw new Error("invalid output shape")},Qi=(e,t,r,i)=>{let a=e.kernelCustomData.wT??e.compute(Ue(t[1],[2,3,0,1]),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=a);let n=[t[0],a];t.length===3&&n.push(t[2]),e.compute(Zc(n,r,i),{inputs:n})},Gu=(e,t)=>{let r=t.format==="NHWC",i=[e.inputs[0].reshape(r?[e.inputs[0].dims[0],1,e.inputs[0].dims[1],e.inputs[0].dims[2]]:[e.inputs[0].dims[0],e.inputs[0].dims[1],1,e.inputs[0].dims[2]]),e.inputs[1].reshape([e.inputs[1].dims[0],e.inputs[1].dims[1],1,e.inputs[1].dims[2]])];e.inputs.length===3&&i.push(e.inputs[2]);let a=t.kernelShape;(a.length===0||a[0]===0)&&(a=[e.inputs[1].dims[2]]);let n=t.dilations;(n.length===0||n[0]===0)&&(n=[1]);let s=t.strides;(s.length===0||s[0]===0)&&(s=[1]);let u=t.pads;u.length===0&&(u=[0,0]),u=[0,u[0],0,u[1]],s=[1].concat(s),n=[1].concat(n),a=[1].concat(a);let l=t.outputPadding;l=[0].concat(l);let p=Xi({...t,pads:u,strides:s,dilations:n,kernelShape:a,outputPadding:l},i);Qi(e,i,p,h=>r?[h[0],h[2],h[3]]:[h[0],h[1],h[3]])},Qc=(e,t)=>{if(Lu(e.inputs,t),e.inputs[0].dims.length===3)Gu(e,t);else{let r=Xi(t,e.inputs);Qi(e,e.inputs,r)}}}),Vu,Yc,Jc,my=q(()=>{ie(),ne(),ke(),se(),Vu=(e,t,r,i)=>{let a=M.size(t),n=t.length,s=D("input",e,n),u=Q("output",e,n),l=r.dataType===6?r.getInt32Array()[0]:Number(r.getBigInt64Array()[0]),p=M.normalizeAxis(l,n),h=f=>{let g=` i32(${s.indicesGet("inputIndices","uniforms.axis")}) `,y=Y("uniforms.input_shape","uniforms.axis",n),_=i.reverse?g+(i.exclusive?" + 1":""):"0",w=i.reverse?y:g+(i.exclusive?"":" + 1");return`
                ${f.registerUniform("outputSize","u32").registerUniform("axis","u32").declareVariables(s,u)}
                ${f.mainStart()}
                  ${f.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
                  var inputIndices = ${u.offsetToIndices("global_idx")};
                  var sum = ${u.type.value}(0);
                  let first : i32 = ${_};
                  let last : i32 = ${w};
                  for (var i : i32 = first; i < last; i++) {
                    ${s.indicesSet("inputIndices","uniforms.axis","u32(i)")};
                    sum = sum + ${s.getByIndices("inputIndices")};
                  }
                  ${u.setByOffset("global_idx","sum")};
                }`};return{name:"CumSum",shaderCache:{hint:i.cacheKey,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:t,dataType:e}],dispatchGroup:{x:Math.ceil(a/64)},programUniforms:[{type:12,data:a},{type:12,data:p},...J(t,t)]}),getShaderSource:h}},Yc=(e,t)=>{let r=e.inputs[0].dims,i=e.inputs[0].dataType,a=e.inputs[1];e.compute(Vu(i,r,a,t),{inputs:[0]})},Jc=e=>{let t=e.exclusive===1,r=e.reverse===1;return fe({exclusive:t,reverse:r})}}),Hu,Fu,ju,eh,th,gy=q(()=>{ie(),ne(),ke(),se(),Hu=e=>{if(!e||e.length!==1)throw new Error("DepthToSpace requires 1 input.");if(e[0].dims.length!==4)throw new Error("DepthToSpace requires 4D input.")},Fu=(e,t,r,i)=>{let a=[];a.push(`fn perm(i: ${i.type.indices}) -> ${r.type.indices} {
    var a: ${r.type.indices};`);for(let n=0;n<t;++n)a.push(r.indicesSet("a",e[n],`i[${n}]`));return a.push("return a;}"),a.join(`
`)},ju=(e,t)=>{let r,i,a,n,s,u,l=t.format==="NHWC",p=t.blocksize,h=t.mode==="DCR";l?([r,i,a,n]=e.dims,s=h?[r,i,a,p,p,n/p**2]:[r,i,a,n/p**2,p,p],u=h?[0,1,3,2,4,5]:[0,1,4,2,5,3]):([r,i,a,n]=[e.dims[0],e.dims[2],e.dims[3],e.dims[1]],s=h?[r,p,p,n/p**2,i,a]:[r,n/p**2,p,p,i,a],u=h?[0,3,4,1,5,2]:[0,1,4,2,5,3]);let f=e.reshape(s),g=f.dims.length,y=e.dataType,_=D("a",y,g),w=Q("output",y,g),k=x=>`
  ${x.registerUniform("output_size","u32").declareVariables(_,w)}

  ${Fu(u,g,_,w)}

  ${x.mainStart()}
    ${x.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let indices = ${w.offsetToIndices("global_idx")};
    let aIndices = perm(indices);

    ${w.setByOffset("global_idx",_.getByIndices("aIndices"))}
  }`;return{name:"DepthToSpace",shaderCache:{hint:`${e.dims};${t.blocksize};${t.mode}`,inputDependencies:["rank"]},getRunData:x=>{let b=l?[r,i*p,a*p,n/p**2]:[r,n/p**2,i*p,a*p],T=M.size(b),S=f.dims,I=M.sortBasedOnPerm(S,u);return{outputs:[{dims:b,dataType:x[0].dataType}],dispatchGroup:{x:Math.ceil(T/64)},programUniforms:[{type:12,data:T},...J(S,I)]}},getShaderSource:k}},eh=(e,t)=>{Hu(e.inputs),e.compute(ju(e.inputs[0],t))},th=e=>fe({blocksize:e.blocksize,mode:e.mode,format:e.format})}),Nr,rr,Yi,Ku,Zu,Xu,Qu,Ji,Yu,rh,ih,yy=q(()=>{ie(),ne(),ke(),se(),Nr="[a-zA-Z]|\\.\\.\\.",rr="("+Nr+")+",Yi="^"+rr+"$",Ku="("+rr+",)*"+rr,Zu="^"+Ku+"$",Xu=class{constructor(e=-1){this.symbolToIndices=new Map,this.inputIndex=e}addSymbol(e,t){let r=this.symbolToIndices.get(e);r===void 0?r=[t]:r.push(t),this.symbolToIndices.set(e,r)}},Qu=class{constructor(e,t){this.equation=t,this.hasEllipsis=!1,this.symbolToInfo=new Map,this.lhs=new Array,this.outputDims=[];let[r,i]=t.includes("->")?t.split("->",2):[t,""];if(!r.match(RegExp(Zu)))throw new Error("Invalid LHS term");if(r.split(",").forEach((a,n)=>{let s=e[n].dims.slice();if(!a.match(RegExp(Yi)))throw new Error("Invalid LHS term");let u=this.processTerm(a,!0,s,n);this.lhs.push(u)}),i==="")i+=[...this.symbolToInfo.entries()].filter(([a,n])=>n.count===1||a==="...").map(([a])=>a).join("");else if(!i.match(RegExp(rr)))throw new Error("Invalid RHS");i.match(RegExp(Nr,"g"))?.forEach(a=>{if(a==="...")this.outputDims=this.outputDims.concat(this.ellipsisDims);else{let n=this.symbolToInfo.get(a);if(n===void 0)throw new Error("Invalid RHS symbol");this.outputDims.push(n.dimValue)}}),this.rhs=this.processTerm(i,!1,this.outputDims)}addSymbol(e,t,r){let i=this.symbolToInfo.get(e);if(i!==void 0){if(i.dimValue!==t&&i.count!==1)throw new Error("Dimension mismatch");i.count++,i.inputIndices.push(r)}else i={count:1,dimValue:t,inputIndices:[r]};this.symbolToInfo.set(e,i)}processTerm(e,t,r,i=-1){let a=r.length,n=!1,s=[],u=0;if(!e.match(RegExp(Yi))&&!t&&e!=="")throw new Error("Invalid LHS term");let l=e.match(RegExp(Nr,"g")),p=new Xu(i);return l?.forEach((h,f)=>{if(h==="..."){if(n)throw new Error("Only one ellipsis is allowed per input term");n=!0;let g=a-l.length+1;if(g<0)throw new Error("Ellipsis out of bounds");if(s=r.slice(u,u+g),this.hasEllipsis){if(this.ellipsisDims.length!==s.length||this.ellipsisDims.toString()!==s.toString())throw new Error("Ellipsis dimensions mismatch")}else if(t)this.hasEllipsis=!0,this.ellipsisDims=s;else throw new Error("Ellipsis must be specified in the LHS");for(let y=0;y<s.length;y++){let _=String.fromCharCode(48+y);p.addSymbol(_,f+y),this.addSymbol(_,r[u++],i)}}else p.addSymbol(h,f+(this.hasEllipsis?this.ellipsisDims.length-1:0)),this.addSymbol(h,r[u++],i)}),p}},Ji=e=>e+"_max",Yu=(e,t,r,i)=>{let a=e.map(p=>p.length).map((p,h)=>D(`input${h}`,t,p)),n=M.size(i),s=Q("output",t,i.length),u=[...r.symbolToInfo.keys()].filter(p=>!r.rhs.symbolToIndices.has(p)),l=p=>{let h=[],f="var prod = 1.0;",g="var sum = 0.0;",y="sum += prod;",_=[],w=[],k=[],x=[],b=r.symbolToInfo.size===r.rhs.symbolToIndices.size;r.symbolToInfo.forEach((S,I)=>{if(r.rhs.symbolToIndices.has(I)){let A=r.rhs.symbolToIndices.get(I)?.[0];A!==void 0&&r.lhs.forEach((z,v)=>{if(S.inputIndices.includes(v)){let N=z.symbolToIndices.get(I);if(N===void 0)throw new Error("Invalid symbol error");N.forEach(U=>{h.push(`${a[v].indicesSet(`input${v}Indices`,U,s.indicesGet("outputIndices",A))}`)})}})}else r.lhs.forEach((A,z)=>{if(S.inputIndices.includes(z)){let v=A.symbolToIndices.get(I);if(v===void 0)throw new Error("Invalid symbol error");v.forEach(N=>{_.push(`${a[z].indicesSet(`input${z}Indices`,N,`${I}`)}`)}),x.push(`prod *= ${a[z].getByIndices(`input${z}Indices`)};`)}}),w.push(`for(var ${I}: u32 = 0; ${I} < uniforms.${Ji(I)}; ${I}++) {`),k.push("}")});let T=b?[...h,`let sum = ${a.map((S,I)=>S.getByIndices(`input${I}Indices`)).join(" * ")};`]:[...h,g,...w,..._,f,...x,y,...k];return`
            ${p.registerUniforms(u.map(S=>({name:`${Ji(S)}`,type:"u32"}))).registerUniform("outputSize","u32").declareVariables(...a,s)}

            ${p.mainStart()}
            ${p.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
            var outputIndices = ${s.offsetToIndices("global_idx")};
            ${a.map((S,I)=>`var input${I}Indices: ${a[I].type.indices};`).join(`
`)}
            ${T.join(`
`)};
            ${s.setByOffset("global_idx","sum")};
          }`};return{name:"Einsum",shaderCache:{hint:r.equation,inputDependencies:e.map(()=>"rank")},getRunData:()=>{let p=u.filter(f=>r.symbolToInfo.has(f)).map(f=>({type:12,data:r.symbolToInfo.get(f)?.dimValue||0}));p.push({type:12,data:n});let h=e.map((f,g)=>[...J(f)]).reduce((f,g)=>f.concat(g),p);return h.push(...J(i)),{outputs:[{dims:i,dataType:t}],dispatchGroup:{x:Math.ceil(n/64)},programUniforms:h}},getShaderSource:l}},rh=(e,t)=>{let r=new Qu(e.inputs,t.equation),i=r.outputDims,a=e.inputs.map((n,s)=>n.dims);e.compute(Yu(a,e.inputs[0].dataType,r,i))},ih=e=>{let t=e.equation.replace(/\s+/g,"");return fe({equation:t})}}),Ju,ea,el,tl,ah,_y=q(()=>{ie(),ne(),se(),Ju=e=>{if(!e||e.length!==2)throw new Error("Expand requires 2 input.");let t=e[0].dims,r=Array.from(e[1].getBigInt64Array(),Number),i=r.length<t.length?0:r.length-t.length,a=t.length<r.length?0:t.length-r.length;for(;i<r.length&&a<t.length;++i,++a)if(r[i]!==t[a]&&r[i]!==1&&t[a]!==1)throw new Error("Expand requires shape to be broadcastable to input")},ea=(e,t)=>{let r=e.length-t.length,i=[];for(let a=0;a<r;++a)i.push(e[a]);for(let a=0;a<t.length;++a)i.push(t[a]===1?e[a+r]:t[a]);return i},el=(e,t)=>e.length>t.length?ea(e,t):ea(t,e),tl=e=>{let t=e[0].dims,r=Array.from(e[1].getBigInt64Array(),Number),i=el(t,r),a=e[0].dataType,n=a===9||M.size(t)===1,s=a===9||t.length>0&&t[t.length-1]%4===0?4:1,u=n||i.length>0&&i[i.length-1]%4===0?4:1,l=Math.ceil(M.size(i)/u),p=f=>{let g=D("input",a,t.length,s),y=Q("output",a,i.length,u),_;if(a===9){let w=(k,x,b="")=>`
          let outputIndices${x} = ${y.offsetToIndices(`outputOffset + ${x}u`)};
          let offset${x} = ${g.broadcastedIndicesToOffset(`outputIndices${x}`,y)};
          let index${x} = offset${x} / 4u;
          let component${x} = offset${x} % 4u;
          ${k}[${x}] = ${b}(${g.getByOffset(`index${x}`)}[component${x}]);
        `;_=`
        let outputOffset = global_idx * ${u};
        var data = vec4<u32>(0);
        ${w("data",0,"u32")}
        ${w("data",1,"u32")}
        ${w("data",2,"u32")}
        ${w("data",3,"u32")}
        ${y.setByOffset("global_idx","data")}
      }`}else _=`
        let outputIndices = ${y.offsetToIndices(`global_idx * ${u}`)};
        let inputOffset = ${g.broadcastedIndicesToOffset("outputIndices",y)};
        let data = ${y.type.value}(${g.getByOffset(`inputOffset / ${s}`)});
        ${y.setByOffset("global_idx","data")}
      }`;return`
    ${f.registerUniform("vec_size","u32").declareVariables(g,y)}
    ${f.mainStart()}
    ${f.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
    ${_}`},h=[{type:12,data:l},...J(t,i)];return{name:"Expand",shaderCache:{hint:`${i.length};${s}${u}`,inputDependencies:["rank"]},getShaderSource:p,getRunData:()=>({outputs:[{dims:i,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:h})}},ah=e=>{Ju(e.inputs),e.compute(tl(e.inputs),{inputs:[0]})}}),rl,nh,by=q(()=>{ie(),ne(),se(),Qa(),rl=e=>{let t=e[0].dataType,r=M.size(e[0].dims),i=M.size(e[1].dims),a=i%4===0,n=s=>{let u=D("x",t,[1],4),l=D("bias",t,[1],4),p=Q("y",t,[1],4),h=[{name:"output_vec_size",type:"u32"},{name:"bias_size",type:"u32"}],f=y=>`
      let bias${y}_offset: u32 = (global_idx * 4 + ${y}) % uniforms.bias_size;
      let bias${y} = ${l.getByOffset(`bias${y}_offset / 4`)}[bias${y}_offset % 4];`,g=a?`
      let bias = ${l.getByOffset("global_idx % (uniforms.bias_size / 4)")};`:`${f(0)}${f(1)}${f(2)}${f(3)}
      let bias = ${u.type.value}(bias0, bias1, bias2, bias3);`;return`${s.registerUniforms(h).declareVariables(u,l,p)}

    ${Ea(Re(t))}

    ${s.mainStart(Ht)}
      ${s.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_vec_size")}

      let x = ${u.getByOffset("global_idx")};
      ${g}
      let x_in = x + bias;
      ${p.setByOffset("global_idx",Ia("x_in"))}
    }`};return{name:"FastGeluWithBias",shaderCache:{hint:`${a}`,inputDependencies:["type","type"]},getShaderSource:n,getRunData:s=>({outputs:[{dims:s[0].dims,dataType:s[0].dataType}],programUniforms:[{type:12,data:Math.ceil(r/4)},{type:12,data:i}],dispatchGroup:{x:Math.ceil(r/Ht/4)}})}},nh=e=>{e.inputs.length<2||M.size(e.inputs[1].dims)===0?kc(e):e.compute(rl(e.inputs))}}),il,al,sh,oh,wy=q(()=>{ie(),ne(),ke(),se(),il=e=>{if(!e||e.length!==2)throw new Error("Gather requires 2 inputs.")},al=(e,t)=>{let r=e[0].dims,i=e[1].dims,a=r.length,n=M.normalizeAxis(t.axis,a),s=r.slice(0);s.splice(n,1,...i);let u=r[n],l=e[0].dataType===9?4:1,p=Math.ceil(M.size(s)/l),h=[{type:12,data:p},{type:6,data:u},{type:12,data:n},...J(e[0].dims,e[1].dims,s)],f=g=>{let y=D("data",e[0].dataType,e[0].dims.length,l),_=D("inputIndices",e[1].dataType,e[1].dims.length),w=Q("output",e[0].dataType,s.length,l),k=b=>{let T=i.length,S=`var indicesIndices${b}  = ${_.type.indices}(0);`;for(let I=0;I<T;I++)S+=`${T>1?`indicesIndices${b}[${I}]`:`indicesIndices${b}`} = ${s.length>1?`outputIndices${b}[uniforms.axis + ${I}]`:`outputIndices${b}`};`;S+=`
          var idx${b} = ${_.getByIndices(`indicesIndices${b}`)};
          if (idx${b} < 0) {
            idx${b} = idx${b} + uniforms.axisDimLimit;
          }
          var dataIndices${b} : ${y.type.indices};
        `;for(let I=0,A=0;I<a;I++)I===n?(S+=`${a>1?`dataIndices${b}[${I}]`:`dataIndices${b}`} = u32(idx${b});`,A+=T):(S+=`${a>1?`dataIndices${b}[${I}]`:`dataIndices${b}`} = ${s.length>1?`outputIndices${b}[${A}]`:`outputIndices${b}`};`,A++);return S},x;if(e[0].dataType===9){let b=(T,S,I="")=>`
          let outputIndices${S} = ${w.offsetToIndices(`outputOffset + ${S}u`)};
          ${k(S)};
          let offset${S} = ${y.indicesToOffset(`dataIndices${S}`)};
          let index${S} = offset${S} / 4u;
          let component${S} = offset${S} % 4u;
          ${T}[${S}] = ${I}(${y.getByOffset(`index${S}`)}[component${S}]);
        `;x=`
        let outputOffset = global_idx * ${l};
        var value = vec4<u32>(0);
        ${b("value",0,"u32")}
        ${b("value",1,"u32")}
        ${b("value",2,"u32")}
        ${b("value",3,"u32")}
        ${w.setByOffset("global_idx","value")}
      `}else x=`
      let outputIndices = ${w.offsetToIndices("global_idx")};
      ${k("")};
      let value = ${y.getByIndices("dataIndices")};
      ${w.setByOffset("global_idx","value")};
      `;return`
      ${g.registerUniform("outputSize","u32").registerUniform("axisDimLimit","i32").registerUniform("axis","u32").declareVariables(y,_,w)}
      ${g.mainStart()}
        ${g.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
        ${x}
      }`};return{name:"Gather",shaderCache:{hint:t.cacheKey,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:s,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(p/64)},programUniforms:h}),getShaderSource:f}},sh=e=>fe({axis:e.axis}),oh=(e,t)=>{let r=e.inputs;il(r),e.compute(al(e.inputs,t))}}),nl,uh,lh,$y=q(()=>{ie(),ne(),se(),nl=(e,t,r,i,a,n,s,u,l)=>{let p=[{type:12,data:n},{type:12,data:i},{type:12,data:a},{type:12,data:r},{type:12,data:s},{type:12,data:u},{type:12,data:l}],h=[n];p.push(...J(t.dims,h));let f=g=>{let y=D("indices_data",t.dataType,t.dims.length),_=Q("input_slice_offsets_data",12,1,1),w=[y,_],k=[{name:"output_size",type:"u32"},{name:"batch_dims",type:"u32"},{name:"input_dims",type:"u32",length:a.length},{name:"sizes_from_slice_dims_data",type:"u32",length:r.length},{name:"num_slices_per_batch",type:"u32"},{name:"input_batch_stride",type:"u32"},{name:"num_slice_dims",type:"u32"}];return`
  ${g.registerUniforms(k).declareVariables(...w)}
  ${g.mainStart()}
    ${g.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let batch_idx = global_idx / uniforms.num_slices_per_batch;
    let base_offset = batch_idx * uniforms.input_batch_stride;

    let slice_indices_base_offset = global_idx * uniforms.num_slice_dims;
    var relative_slice_offset = 0;
    for (var dim_idx = 0u; dim_idx < uniforms.num_slice_dims; dim_idx ++) {
      var index = i32(indices_data[dim_idx + slice_indices_base_offset].x);
      let input_dim_idx = uniforms.batch_dims + dim_idx;
      if (index < 0) {
        ${a.length===1?"index += i32(uniforms.input_dims);":"index += i32(uniforms.input_dims[input_dim_idx]);"}
      }
      ${r.length===1?"relative_slice_offset += index * i32(uniforms.sizes_from_slice_dims_data);":"relative_slice_offset += index * i32(uniforms.sizes_from_slice_dims_data[dim_idx]);"}
    }

    input_slice_offsets_data[global_idx] =  base_offset + u32(relative_slice_offset);
  }`};return e.compute({name:"computeSliceOffsets",shaderCache:{hint:`${a.length}_${r.length}`,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:h,dataType:e.inputs[1].dataType}],dispatchGroup:{x:Math.ceil(n/64)},programUniforms:p}),getShaderSource:f},{inputs:[t],outputs:[-1]})[0]},uh=(e,t)=>{let r=e.inputs,i=r[0].dims,a=r[0].dataType,n=r[1].dims,s=n[n.length-1],u=M.sizeToDimension(n,n.length-1),l=M.sizeFromDimension(i,t.batchDims+s),p=M.sizeToDimension(i,t.batchDims),h=M.sizeFromDimension(i,t.batchDims),f=u/p,g=new Array(s),y=l;for(let S=0;S<s;++S)g[s-1-S]=y,y*=i[t.batchDims+s-1-S];let _=nl(e,r[1],g,t.batchDims,i,u,f,h,s),w=t.batchDims+s;if(w>i.length)throw new Error("last dimension of indices must not be larger than rank of input tensor");let k=n.slice(0,-1).concat(i.slice(w)),x=M.size(k),b=[{type:12,data:x},{type:12,data:l},...J(r[0].dims,_.dims,k)],T=S=>{let I=D("data",r[0].dataType,r[0].dims.length),A=D("slice_offsets",12,_.dims.length),z=Q("output",r[0].dataType,k.length);return`
          ${S.registerUniform("output_size","u32").registerUniform("slice_size","u32").declareVariables(I,A,z)}
            ${S.mainStart()}
            ${S.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          let slice_offset = slice_offsets[global_idx / uniforms.slice_size];
          output[global_idx] = data[u32(slice_offset) + global_idx % uniforms.slice_size];
        }`};e.compute({name:"GatherND",shaderCache:{hint:t.cacheKey,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:k,dataType:a}],dispatchGroup:{x:Math.ceil(x/64)},programUniforms:b}),getShaderSource:T},{inputs:[r[0],_]})},lh=e=>({batchDims:e.batch_dims,cacheKey:""})}),sl,ol,dh,ph,vy=q(()=>{ie(),ne(),ke(),se(),sl=(e,t)=>{if(e.length<3||e.length>4)throw new Error("GatherBlockQuantized requires 3 or 4 inputs.");let r=M.normalizeAxis(t.quantizeAxis,e[0].dims.length),i=t.blockSize,a=e[0],n=e[2],s=e.length===4?e[3]:void 0;if(n.dims.length!==a.dims.length||!a.dims.map((u,l)=>l===r?Math.ceil(u/i)===n.dims[l]:u===n.dims[l]).reduce((u,l)=>u&&l,!0))throw new Error("Scales must have the same rank as the input tensor and the dims should match except on gatherAxis.");if(s){if(s.dataType!==a.dataType)throw new Error("Zero point must have the same data type as the input tensor.");if(s.dims.length!==n.dims.length||!s.dims.map((u,l)=>u===n.dims[l]).reduce((u,l)=>u&&l,!0))throw new Error("Zero point must have the same rank as the input tensor and the dims should match except on quantizeAxis.")}},ol=(e,t)=>{let r=e[0].dims,i=e[1].dims,a=r.length,n=M.normalizeAxis(t.gatherAxis,a),s=M.normalizeAxis(t.quantizeAxis,a),u=r.slice(0);u.splice(n,1,...i);let l=M.size(u),p=e[2].dataType,h=e[0].dataType===22,f=[{type:12,data:l},{type:12,data:s},{type:12,data:n},{type:12,data:t.blockSize},...J(...e.map((y,_)=>y.dims),u)],g=y=>{let _=D("data",e[0].dataType,e[0].dims.length),w=D("inputIndices",e[1].dataType,e[1].dims.length),k=D("scales",e[2].dataType,e[2].dims.length),x=e.length>3?D("zeroPoint",e[3].dataType,e[3].dims.length):void 0,b=Q("output",p,u.length),T=[_,w,k];x&&T.push(x);let S=[{name:"output_size",type:"u32"},{name:"quantize_axis",type:"u32"},{name:"gather_axis",type:"u32"},{name:"block_size",type:"u32"}];return`
        ${y.registerUniforms(S).declareVariables(...T,b)}
        ${y.mainStart()}
        let output_indices = ${b.offsetToIndices("global_idx")};
        var indices_indices = ${w.type.indices}(0);
        ${i.length>1?`
          for (var i: u32 = 0; i < ${i.length}; i++) {
            let index = ${b.indicesGet("output_indices","uniforms.gather_axis + i")};
            ${w.indicesSet("indices_indices","i","index")};
          }`:`indices_indices = ${b.indicesGet("output_indices","uniforms.gather_axis")};`};
        var data_indices = ${_.type.indices}(0);
        for (var i: u32 = 0; i < uniforms.gather_axis; i++) {
          let index = ${b.indicesGet("output_indices","i")};
          ${_.indicesSet("data_indices","i","index")};
        }
        var index_from_indices = ${w.getByIndices("indices_indices")};
        if (index_from_indices < 0) {
          index_from_indices += ${r[n]};
        }
        ${_.indicesSet("data_indices","uniforms.gather_axis","u32(index_from_indices)")};
        for (var i = uniforms.gather_axis + 1; i < ${u.length}; i++) {
          let index = ${b.indicesGet("output_indices",`i + ${i.length} - 1`)};
          ${_.indicesSet("data_indices","i","index")};
        }
        let data_offset = ${_.indicesToOffset("data_indices")};
        let data_index = data_offset % 8;
        // Convert 4-bit packed data to 8-bit packed data.
        let packed_4bit_quantized_data = ${_.getByOffset("data_offset / 8")};
        let packed_8bit_quantized_data = (packed_4bit_quantized_data >> (4 * (data_index % 2))) & 0x0f0f0f0f;
        let quantized_data_vec = ${h?"unpack4xI8":"unpack4xU8"}(u32(packed_8bit_quantized_data));
        let quantized_data = quantized_data_vec[data_index / 2];
        var scale_indices = data_indices;
        let quantize_axis_index = ${k.indicesGet("data_indices","uniforms.quantize_axis")} / uniforms.block_size;
        ${k.indicesSet("scale_indices","uniforms.quantize_axis","quantize_axis_index")};
        var scale = ${k.getByIndices("scale_indices")};
        ${x?`
              let zero_point_indices = scale_indices;
              let zero_point_offset = ${x.indicesToOffset("zero_point_indices")};
              let zero_point_index = zero_point_offset % 8;
              let packed_4bit_zero_points = ${x.getByOffset("zero_point_offset / 8")};
              let packed_8bit_zero_points = (packed_4bit_zero_points >> (4 * (zero_point_index % 2))) & 0x0f0f0f0f;
              let zero_point_vec = ${h?"unpack4xI8":"unpack4xU8"}(u32(packed_8bit_zero_points));
              let zero_point = zero_point_vec[zero_point_index / 2];`:"var zero_point = 0"};
        let dequantized_data = ${Re(p)}(quantized_data - zero_point) * scale;
        ${b.setByOffset("global_idx","dequantized_data")};
    }`};return{name:"GatherBlockQuantized",shaderCache:{hint:`${t.cacheKey};${e.filter((y,_)=>_!==1).map(y=>y.dims.join("_")).join(";")}`,inputDependencies:Array.from({length:e.length},(y,_)=>"rank")},getRunData:()=>({outputs:[{dims:u,dataType:p}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:f}),getShaderSource:g}},dh=(e,t)=>{let r=e.inputs;sl(r,t),e.compute(ol(e.inputs,t))},ph=e=>fe({blockSize:e.blockSize,gatherAxis:e.gatherAxis,quantizeAxis:e.quantizeAxis})}),ul,ll,ch,hh,xy=q(()=>{ie(),ne(),ke(),se(),ul=e=>{if(!e||e.length!==2)throw new Error("GatherElements requires 2 inputs.");if(e[0].dims.length<1)throw new Error("GatherElements requires that the data input be rank >= 1.");if(e[0].dims.length!==e[1].dims.length)throw new Error(`GatherElements requires that the data input and
                     indices input tensors be of same rank.`)},ll=(e,t)=>{let r=e[0].dims,i=e[0].dataType,a=r.length,n=e[1].dims,s=e[1].dataType,u=M.normalizeAxis(t.axis,a),l=r[u],p=n.slice(0),h=M.size(p),f=D("input",i,a),g=D("indicesInput",s,n.length),y=Q("output",i,p.length),_=[{type:12,data:h},{type:6,data:l},{type:12,data:u}];return _.push(...J(r,n,p)),{name:"GatherElements",shaderCache:{inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:p,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(h/64)},programUniforms:_}),getShaderSource:w=>`
      ${w.registerUniform("outputSize","u32").registerUniform("axisDimLimit","i32").registerUniform("axis","u32").declareVariables(f,g,y)}
      ${w.mainStart()}
      ${w.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

      let outputIndices = ${y.offsetToIndices("global_idx")};

      var idx = ${g.getByOffset("global_idx")};
      if (idx < 0) {
        idx = idx + uniforms.axisDimLimit;
      }
      var inputIndices = ${f.type.indices}(outputIndices);
      ${f.indicesSet("inputIndices","uniforms.axis","u32(idx)")};
      let value = ${f.getByIndices("inputIndices")};

      ${y.setByOffset("global_idx","value")};
  }`}},ch=e=>fe({axis:e.axis}),hh=(e,t)=>{let r=e.inputs;ul(r),e.compute(ll(e.inputs,t))}}),dl,pl,fh,mh,Sy=q(()=>{ie(),ne(),se(),dl=e=>{if(!e)throw new Error("Input is missing");if(e.length<2||e.length>3)throw new Error("Invaid input number.");if(e.length===3&&e[2].dims.length>2)throw new Error("Invalid input shape of C");if(e[0].dataType!==e[1].dataType||e.length===3&&e[0].dataType!==e[2].dataType)throw new Error("Input types are mismatched")},pl=(e,t)=>{let r=e[0].dims.slice(),i=e[1].dims.slice(),[a,n,s]=cp.getShapeOfGemmResult(r,t.transA,i,t.transB,e.length===3?e[2].dims:void 0),u=[a,n];if(!u)throw new Error("Can't use gemm on the given tensors");let l=16,p=Math.ceil(n/l),h=Math.ceil(a/l),f=!0,g=M.size(u),y=[{type:12,data:f?p:g},{type:12,data:a},{type:12,data:n},{type:12,data:s},{type:1,data:t.alpha},{type:1,data:t.beta}],_=["type","type"];e.length===3&&(y.push(...J(e[2].dims)),_.push("rank")),y.push(...J(u));let w=x=>{let b="";t.transA&&t.transB?b="value += a[k * uniforms.M + m] * b[n * uniforms.K + k];":t.transA&&!t.transB?b="value += a[k * uniforms.M + m] * b[k * uniforms.N + n];":!t.transA&&t.transB?b="value += a[m * uniforms.K + k] * b[n * uniforms.K + k];":!t.transA&&!t.transB&&(b="value += a[m * uniforms.K + k] * b[k * uniforms.N + n];");let T=t.alpha===1?"":"value *= uniforms.alpha;",S=D("a",e[0].dataType,e[0].dims),I=D("b",e[1].dataType,e[1].dims),A=S.type.value,z=null,v=[S,I];e.length===3&&(z=D("c",e[2].dataType,e[2].dims.length),v.push(z));let N=Q("output",e[0].dataType,u.length);v.push(N);let U=[{name:"output_size",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"},{name:"alpha",type:"f32"},{name:"beta",type:"f32"}];return`
  ${x.registerUniforms(U).declareVariables(...v)}

  ${x.mainStart()}
    ${x.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let m = global_idx / uniforms.N;
    let n = global_idx % uniforms.N;

    var value = ${A}(0);
    for (var k: u32 = 0u; k < uniforms.K; k++) {
      ${b}
    }

    ${T}
    ${z!=null?`let cOffset = ${z.broadcastedIndicesToOffset("vec2(m, n)",N)}; value += ${A}(uniforms.beta) * ${z.getByOffset("cOffset")};`:""}
    output[global_idx] = value;
  }`},k=x=>{let b=D("a",e[0].dataType,e[0].dims),T=D("b",e[1].dataType,e[1].dims),S=null,I=[b,T];e.length===3&&(S=D("c",e[2].dataType,e[2].dims.length),I.push(S));let A=Q("output",e[0].dataType,u.length);I.push(A);let z=[{name:"num_tile_n",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"},{name:"alpha",type:"f32"},{name:"beta",type:"f32"}],v="",N="";t.transA&&t.transB?(N=`
      var col = tile_row_start + local_id.x;
      var row = k_start + local_id.y;
      if (col < uniforms.M && row < uniforms.K) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.M + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${b.type.value}(0);
      }

      col = k_start + local_id.x;
      row = tile_col_start + local_id.y;
      if (col < uniforms.K && row < uniforms.N) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.K + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${T.type.value}(0);
      }
      `,v="value += tile_a[k][local_id.y] * tile_b[local_id.x][k];"):t.transA&&!t.transB?(N=`
      var col = tile_row_start + local_id.x;
      var row = k_start + local_id.y;
      if (col < uniforms.M && row < uniforms.K) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.M + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${b.type.value}(0);
      }

      col = tile_col_start + local_id.x;
      row = k_start + local_id.y;
      if (col < uniforms.N && row < uniforms.K) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.N + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${T.type.value}(0);
      }
      `,v="value += tile_a[k][local_id.y] * tile_b[k][local_id.x];"):!t.transA&&t.transB?(N=`
      var col = k_start + local_id.x;
      var row = tile_row_start + local_id.y;
      if (col < uniforms.K && row < uniforms.M) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.K + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${b.type.value}(0);
      }

      col = k_start + local_id.x;
      row = tile_col_start + local_id.y;
      if (col < uniforms.K && row < uniforms.N) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.K + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${T.type.value}(0);
      }
      `,v="value += tile_a[local_id.y][k] * tile_b[local_id.x][k];"):!t.transA&&!t.transB&&(N=`
      var col = k_start + local_id.x;
      var row = tile_row_start + local_id.y;
      if (col < uniforms.K && row < uniforms.M) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.K + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${b.type.value}(0);
      }

      col = tile_col_start + local_id.x;
      row = k_start + local_id.y;
      if (col < uniforms.N && row < uniforms.K) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.N + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${T.type.value}(0);
      }
      `,v="value += tile_a[local_id.y][k] * tile_b[k][local_id.x];");let U=t.alpha===1?"":"value *= uniforms.alpha;";return`
  ${x.registerUniforms(z).declareVariables(...I)}
  var<workgroup> tile_a: array<array<${b.type.storage}, ${l}>, ${l}>;
  var<workgroup> tile_b: array<array<${T.type.storage}, ${l}>, ${l}>;
  ${x.mainStart([l,l,1])}
    let tile_col_start = (workgroup_index % uniforms.num_tile_n) * ${l};
    let tile_row_start = (workgroup_index / uniforms.num_tile_n) * ${l};
    let num_tiles = (uniforms.K - 1) / ${l} + 1;
    var k_start = 0u;
    var value = ${A.type.value}(0);
    for (var t: u32 = 0u; t < num_tiles; t++) {
      ${N}
      k_start = k_start + ${l};
      workgroupBarrier();

      for (var k: u32 = 0u; k < ${l}; k++) {
        ${v}
      }
      workgroupBarrier();
    }

    ${U}
    let m = tile_row_start + local_id.y;
    let n = tile_col_start + local_id.x;
    ${S!=null?`let cOffset = ${S.broadcastedIndicesToOffset("vec2(m, n)",A)}; value += ${A.type.value}(uniforms.beta) * ${S.getByOffset("cOffset")};`:""}
    if (m < uniforms.M && n < uniforms.N) {
      output[m * uniforms.N + n] = value;
    }
  }`};return f?{name:"GemmShared",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:_},getRunData:()=>({outputs:[{dims:u,dataType:e[0].dataType}],dispatchGroup:{x:p*h},programUniforms:y}),getShaderSource:k}:{name:"Gemm",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:_},getRunData:()=>({outputs:[{dims:u,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:y}),getShaderSource:w}},fh=e=>{let t=e.transA,r=e.transB,i=e.alpha,a=e.beta;return{transA:t,transB:r,alpha:i,beta:a,cacheKey:`${e.transA};${e.transB};${e.alpha===1}`}},mh=(e,t)=>{dl(e.inputs),e.compute(pl(e.inputs,t))}}),tt,st,St,kt,cl,hl,fl,ml,gl,yl,_l,bl,gh,yh,ky=q(()=>{ie(),ne(),ke(),se(),[tt,st,St,kt]=[0,1,2,3],cl=e=>{if(e[0].dims.length!==4)throw new Error("only 4-D tensor is supported.");if(e[0].dims.length!==e[1].dims.length)throw new Error("input dimensions must be equal to grid dimensions");if(e[0].dims.length-2!==e[1].dims[e[1].dims.length-1])throw new Error(`last dimension of grid must be equal to ${e[0].dims.length-2}`);if(e[0].dims[0]!==e[1].dims[0])throw new Error("grid batch size must match input batch size")},hl=`
  fn gs_get_cubic_coeffs(x: f32) -> vec4<f32> {
    let cubic_alpha = -0.75f;
    let x_abs = abs(x);
    var coeffs: vec4<f32>;
    coeffs[0] = (((cubic_alpha * (x_abs + 1) - 5 * cubic_alpha) * (x_abs + 1) + 8 * cubic_alpha) * (x_abs + 1) - 4 * cubic_alpha);
    coeffs[1] = (((cubic_alpha + 2) * x_abs - (cubic_alpha + 3)) * x_abs * x_abs + 1);
    coeffs[2] = (((cubic_alpha + 2) * (1 - x_abs) - (cubic_alpha + 3)) * (1 - x_abs) * (1 - x_abs) + 1);
    coeffs[3] = (((cubic_alpha * (2 - x_abs) - 5 * cubic_alpha) * (2 - x_abs) + 8 * cubic_alpha) * (2 - x_abs) - 4 * cubic_alpha);
    return coeffs;
  }
`,fl=e=>`
  fn gs_bicubic_interpolate(p: mat4x4<${e}>, x: f32, y: f32) -> ${e} {
    var v: vec4<f32>;
    var coeffs = gs_get_cubic_coeffs(x);
    for (var i = 0; i < 4; i++) {
      v[i] = coeffs[0] * p[i][0] + coeffs[1] * p[i][1] + coeffs[2] * p[i][2] + coeffs[3] * p[i][3];
    }
    coeffs = gs_get_cubic_coeffs(y);
    let pixel = ${e}(coeffs[0] * v[0] + coeffs[1] * v[1] + coeffs[2] * v[2] + coeffs[3] * v[3]);
    return pixel;
  }
`,ml=e=>`
  fn gs_denormalize(n: f32, length: i32) -> f32 {
    ${e.alignCorners===0?`
    // alignCorners: false => [-1, 1] to [-0.5, length - 0.5]
    return ((n + 1.0) * f32(length) - 1.0) / 2.0;
    `:`
    // alignCorners: true => [-1, 1] to [0, length - 1]
    return (n + 1.0) / 2.0 * (f32(length - 1));
    `}
  }
`,gl=e=>`
  ${e.paddingMode==="reflection"?`
      fn gs_reflect(x: i32, x_min: f32, x_max: f32) -> u32 {
        var dx = 0.0;
        var fx = f32(x);
        let range = x_max - x_min;
        if (fx < x_min) {
          dx = x_min - fx;
          let n = u32(dx / range);
          let r = dx - f32(n) * range;
          if (n % 2 == 0) {
            fx = x_min + r;
          } else {
            fx = x_max - r;
          }
        } else if (fx > x_max) {
          dx = fx - x_max;
          let n = u32(dx / range);
          let r = dx - f32(n) * range;
          if (n % 2 == 0) {
            fx = x_max - r;
          } else {
            fx = x_min + r;
          }
        }
        return u32(fx);
      }`:""}
`,yl=(e,t,r)=>`
  fn pixel_at_grid(r: i32, c: i32, H: i32, W: i32, batch: u32, channel: u32, border: vec4<f32>) -> ${t} {
     var pixel = ${t}(0);
     var indices = vec4<u32>(0);
     indices[${tt}] = batch;
     indices[${st}] = channel;`+(()=>{switch(r.paddingMode){case"zeros":return`
          if (r >= 0 && r < H && c >=0 && c < W) {
            indices[${St}] = u32(r);
            indices[${kt}] = u32(c);
          } else {
            return ${t}(0);
          }
        `;case"border":return`
          indices[${St}] = u32(clamp(r, 0, H - 1));
          indices[${kt}] = u32(clamp(c, 0, W - 1));
        `;case"reflection":return`
          indices[${St}] = gs_reflect(r, border[1], border[3]);
          indices[${kt}] = gs_reflect(c, border[0], border[2]);
        `;default:throw new Error(`padding mode ${r.paddingMode} is not supported`)}})()+`
    return ${e.getByIndices("indices")};
  }
`,_l=(e,t,r)=>(()=>{switch(r.mode){case"nearest":return`
          let result = pixel_at_grid(i32(round(y)), i32(round(x)), H_in, W_in, indices[${tt}], indices[${st}], border);
        `;case"bilinear":return`
          let x1 = i32(floor(x));
          let y1 = i32(floor(y));
          let x2 = x1 + 1;
          let y2 = y1 + 1;

          let p11 = pixel_at_grid(y1, x1, H_in, W_in, indices[${tt}], indices[${st}], border);
          let p12 = pixel_at_grid(y1, x2, H_in, W_in, indices[${tt}], indices[${st}], border);
          let p21 = pixel_at_grid(y2, x1, H_in, W_in, indices[${tt}], indices[${st}], border);
          let p22 = pixel_at_grid(y2, x2, H_in, W_in, indices[${tt}], indices[${st}], border);

          let dx2 = ${t}(f32(x2) - x);
          let dx1 = ${t}(x - f32(x1));
          let dy2 = ${t}(f32(y2) - y);
          let dy1 = ${t}(y - f32(y1));
          let result = dy2 * (dx2 * p11 + dx1 * p12) + dy1 * (dx2 * p21 + dx1 * p22);
        `;case"bicubic":return`
          let x0 = i32(floor(x)) - 1;
          let y0 = i32(floor(y)) - 1;
          var p: mat4x4<${t}>;
          for (var h = 0; h < 4; h++) {
            for (var w = 0; w < 4; w++) {
              p[h][w] = pixel_at_grid(h + y0, w + x0, H_in, W_in, indices[${tt}], indices[${st}], border);
            }
          }

          let dx = x - f32(x0 + 1);
          let dy = y - f32(y0 + 1);
          let result = gs_bicubic_interpolate(p, dx, dy);
        `;default:throw new Error(`mode ${r.mode} is not supported`)}})()+`${e.setByOffset("global_idx","result")}`,bl=(e,t)=>{let r=D("x",e[0].dataType,e[0].dims.length),i=[e[1].dims[0],e[1].dims[1],e[1].dims[2]],a=D("grid",e[1].dataType,i.length,2),n=[e[0].dims[0],e[0].dims[1],e[1].dims[1],e[1].dims[2]];t.format==="NHWC"&&(n=[e[0].dims[0],e[1].dims[1],e[1].dims[2],e[0].dims[3]],[tt,st,St,kt]=[0,3,1,2]);let s=Q("output",e[0].dataType,n.length),u=r.type.value,l=M.size(n),p=[{type:12,data:l},...J(e[0].dims,i,n)],h=f=>`
  ${f.registerUniform("output_size","u32").declareVariables(r,a,s)}
  ${hl}
  ${fl(u)}
  ${ml(t)}
  ${gl(t)}
  ${yl(r,u,t)}

  ${f.mainStart()}
    ${f.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let H_in = i32(uniforms.x_shape[${St}]);
      let W_in = i32(uniforms.x_shape[${kt}]);

      ${t.alignCorners===0?`
      let x_min = -0.5;
      let x_max = f32(W_in) - 0.5;
      let y_min = -0.5;
      let y_max = f32(H_in) - 0.5;
      `:`
      let x_min = 0.0;
      let x_max = f32(W_in) - 1.0;
      let y_min = 0.0;
      let y_max = f32(H_in) - 1.0;
      `};
      let border = vec4<f32>(x_min, y_min, x_max, y_max);

      let indices = ${s.offsetToIndices("global_idx")};
      var grid_indices = vec3<u32>(indices[${tt}], indices[${St}], indices[${kt}]);
      let nxy = ${a.getByIndices("grid_indices")};
      var x = gs_denormalize(f32(nxy[0]), W_in);
      var y = gs_denormalize(f32(nxy[1]), H_in);

      ${_l(s,u,t)}
  }`;return{name:"GridSample",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:["type","type"]},getRunData:f=>{let g=M.size(n);return{outputs:[{dims:n,dataType:f[0].dataType}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:p}},getShaderSource:h}},gh=(e,t)=>{cl(e.inputs),e.compute(bl(e.inputs,t))},yh=e=>fe({alignCorners:e.align_corners,mode:e.mode,paddingMode:e.padding_mode,format:e.format})}),De,wl,_h,ta,$l,dr,bh,wh=q(()=>{ie(),ne(),ke(),ja(),Xa(),se(),bt(),De=(e,t)=>e.length>t&&e[t].dims.length>0?e[t]:void 0,wl=(e,t)=>{let r=e[0],i=De(e,1),a=De(e,2),n=De(e,3),s=De(e,4),u=De(e,5),l=De(e,6),p=De(e,7);if(r.dims.length!==3&&r.dims.length!==5)throw new Error("Input query is expected to have 3 or 5 dimensions");let h=r.dims[0],f=r.dims[1],g=r.dims.length===3?r.dims[2]:t.numHeads*r.dims[4],y=f,_=0,w=0,k=Math.floor(g/t.numHeads);if(l&&p&&M.size(l.dims)&&M.size(p.dims)){if(l.dims.length!==4)throw new Error('Input "past_key" is expected to have 4 dimensions');if(l.dims[0]!==h||l.dims[1]!==t.numHeads||l.dims[3]!==k)throw new Error('Input "past_key" shape (batch_size, num_heads, past_sequence_length, head_size)');if(p.dims[0]!==h||p.dims[1]!==t.numHeads||p.dims[3]!==k)throw new Error('Input "past_value" shape (batch_size, num_heads, past_sequence_length, head_size)');if(l.dims[2]!==p.dims[2])throw new Error('Input "past_key" and "past_value" shall have same dim 2 (past_sequence_length)');if(p.dims.length!==4)throw new Error('Input "past_value" is expected to have 4 dimensions');_=l.dims[2],w=l.dims[2]}else if(l&&M.size(l.dims)||p&&M.size(p.dims))throw new Error('Input "past_key" and "past_value" shall be both present or both absent');let x;if(i&&M.size(i.dims)>0){if(r.dims.length!==3)throw new Error('Input "query" is expected to have 3 dimensions when key is given');if(i.dims.length<3||i.dims.length>5)throw new Error('Input "key" is expected to have 3, 4, or 5 dimensions');if(r.dims[0]!==i.dims[0])throw new Error('Input "query" and "key" shall have same dim 0 (batch size)');if(i.dims.length===3){if(i.dims[2]!==r.dims[2])throw new Error('Input "query" and "key" shall have same dim 2 (hidden_size)');x=2,y=i.dims[1]}else if(i.dims.length===5){if(i.dims[2]!==t.numHeads||i.dims[3]!==2||i.dims[4]!==k)throw new Error('Expect "key" shape (batch_size, kv_sequence_length, num_heads, 2, head_size) for packed kv');if(a)throw new Error('Expect "value" be none when "key" has packed kv format.');x=5,y=i.dims[1]}else{if(i.dims[1]!==t.numHeads||i.dims[3]!==k)throw new Error('Expect "key" shape (batch_size, num_heads, kv_sequence_length, head_size) for past_key');x=0,y=i.dims[2]}}else{if(r.dims.length!==5)throw new Error('Input "query" is expected to have 5 dimensions when key is empty');if(r.dims[2]!==t.numHeads||r.dims[3]!==3)throw new Error('Expect "query" shape (batch_size, kv_sequence_length, num_heads, 3, head_size) for packed kv');x=3}if(n&&M.size(n.dims)>0){if(n.dims.length!==1)throw new Error('Input "bias" is expected to have 1 dimension');if(i&&i.dims.length===5&&i.dims[3]===2)throw new Error("bias is not allowed for packed kv.")}let b=_+y,T=0;if(s&&M.size(s.dims)>0){T=8;let z=s.dims;throw z.length===1?z[0]===h?T=1:z[0]===3*h+2&&(T=3):z.length===2&&z[0]===h&&z[1]===b&&(T=5),T===8?new Error('Input "key_padding_mask" shape shall be (batch_size) or (batch_size, total_sequence_length)'):new Error("Mask not supported")}let S=!1,I=g;if(a&&M.size(a.dims)>0){if(a.dims.length!==3&&a.dims.length!==4)throw new Error('Input "value" is expected to have 3 or 4 dimensions');if(r.dims[0]!==a.dims[0])throw new Error('Input "query" and "value" shall have same dim 0 (batch_size)');if(a.dims.length===3){if(y!==a.dims[1])throw new Error('Input "key" and "value" shall have the same dim 1 (kv_sequence_length)');I=a.dims[2]}else{if(y!==a.dims[2])throw new Error('Input "key" and "value" shall have the same dim 2 (kv_sequence_length)');I=a.dims[1]*a.dims[3],S=!0}}let A=!1;if(s&&M.size(s.dims)>0)throw new Error("Key padding mask is not supported");if(u&&M.size(u.dims)>0){if(u.dims.length!==4)throw new Error('Input "attention_bias" is expected to have 4 dimensions');if(u.dims[0]!==h||u.dims[1]!==t.numHeads||u.dims[2]!==f||u.dims[3]!==b)throw new Error('Expect "attention_bias" shape (batch_size, num_heads, sequence_length, total_sequence_length)')}return{batchSize:h,sequenceLength:f,pastSequenceLength:_,kvSequenceLength:y,totalSequenceLength:b,maxSequenceLength:w,inputHiddenSize:0,hiddenSize:g,vHiddenSize:I,headSize:k,vHeadSize:Math.floor(I/t.numHeads),numHeads:t.numHeads,isUnidirectional:!1,pastPresentShareBuffer:!1,maskFilterValue:t.maskFilterValue,maskType:T,scale:t.scale,broadcastResPosBias:A,passPastInKv:S,qkvFormat:x}},_h=e=>fe({...e}),ta=fe({perm:[0,2,1,3]}),$l=(e,t,r,i,a,n,s)=>{let u=[i,a,n],l=M.size(u),p=[{type:12,data:l},{type:12,data:s},{type:12,data:n}],h=f=>{let g=Q("qkv_with_bias",t.dataType,u),y=D("qkv",t.dataType,u),_=D("bias",r.dataType,u),w=[{name:"output_size",type:"u32"},{name:"bias_offset",type:"u32"},{name:"hidden_size",type:"u32"}];return`
  ${f.registerUniforms(w).declareVariables(y,_,g)}
  ${f.mainStart()}
    ${f.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let bias_offset_idx = (global_idx % uniforms.hidden_size) + uniforms.bias_offset;

    qkv_with_bias[global_idx] = qkv[global_idx] + bias[bias_offset_idx];
  }`};return e.compute({name:"MultiHeadAttentionAddBias",shaderCache:{inputDependencies:["type","type"]},getRunData:()=>({outputs:[{dims:u,dataType:t.dataType,gpuDataType:0}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:p}),getShaderSource:h},{inputs:[t,r],outputs:[-1]})[0]},dr=(e,t,r,i,a,n,s,u)=>{let l=n;if(s&&M.size(s.dims)>0){if(i===1)throw new Error("AddBiasReshape is not implemented. Please export your model with packed QKV or KV");return l=$l(e,n,s,t,i,r*a,u),l=l.reshape([t,i,r,a]),r===1||i===1?l:e.compute(Ue(l,ta.perm),{inputs:[l],outputs:[-1]})[0]}else return n.dims.length===3&&(l=n.reshape([t,i,r,a])),r===1||i===1?l:e.compute(Ue(l,ta.perm),{inputs:[l],outputs:[-1]})[0]},bh=(e,t)=>{let r=wl(e.inputs,t),i=e.inputs[0],a=De(e.inputs,1),n=De(e.inputs,2),s=De(e.inputs,3),u=De(e.inputs,4),l=De(e.inputs,5),p=De(e.inputs,6),h=De(e.inputs,7);if(i.dims.length===5)throw new Error("Packed QKV is not implemented");if(a?.dims.length===5)throw new Error("Packed KV is not implemented");let f=a&&n&&a.dims.length===4&&n.dims.length===4,g=dr(e,r.batchSize,r.numHeads,r.sequenceLength,r.headSize,i,s,0);if(f)return fr(e,g,a,n,u,void 0,p,h,l,r);if(!a||!n)throw new Error("key and value must be provided");let y=dr(e,r.batchSize,r.numHeads,r.kvSequenceLength,r.headSize,a,s,r.hiddenSize),_=dr(e,r.batchSize,r.numHeads,r.kvSequenceLength,r.vHeadSize,n,s,2*r.hiddenSize);fr(e,g,y,_,u,void 0,p,h,l,r)}}),vl,xl,Sl,kl,Ma,$h,vh,xh=q(()=>{ie(),ne(),ke(),se(),vl=e=>{if(!e||e.length<1)throw new Error("too few inputs")},xl=(e,t)=>{let r=[],i=t.numOutputs;return e[1].dims[0]>0&&(e[1].getBigInt64Array().forEach(a=>r.push(Number(a))),i=r.length),fe({numOutputs:i,axis:t.axis,splitSizes:r})},Sl=e=>`
fn calculateOutputIndex(index: u32) -> u32 {
    for (var i: u32 = 0u; i < ${e}u; i += 1u ) {
    if (index < ${Y("uniforms.size_in_split_axis","i",e)}) {
        return i;
    }
    }
    return ${e}u;
}`,kl=e=>{let t=e.length,r=[];for(let i=0;i<t;++i){let a=e[i].setByIndices("indices","input[global_idx]");t===1?r.push(a):i===0?r.push(`if (output_number == ${i}u) { ${a} }`):i===t-1?r.push(`else { ${a} }`):r.push(`else if (output_number == ${i}) { ${a} }`)}return`
      fn writeBufferData(output_number: u32, indices: ${e[0].type.indices}, global_idx: u32) {
        ${r.join(`
`)}
      }`},Ma=(e,t)=>{let r=e[0].dims,i=M.size(r),a=e[0].dataType,n=M.normalizeAxis(t.axis,r.length),s=new Array(t.numOutputs),u=D("input",a,r.length),l=new Array(t.numOutputs),p=[],h=[],f=0,g=[{type:12,data:i}];for(let _=0;_<t.numOutputs;_++){f+=t.splitSizes[_],l[_]=f;let w=r.slice();w[n]=t.splitSizes[_],h.push(w),s[_]=Q(`output${_}`,a,w.length),p.push({dims:h[_],dataType:e[0].dataType})}g.push({type:12,data:l},...J(r,...h));let y=_=>`
  ${_.registerUniform("input_size","u32").registerUniform("size_in_split_axis","u32",l.length).declareVariables(u,...s)}
  ${Sl(l.length)}
  ${kl(s)}

  ${_.mainStart()}
    ${_.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.input_size")}

    var indices = ${u.offsetToIndices("global_idx")};
    var index = ${u.indicesGet("indices",n)};
    let output_number = calculateOutputIndex(index);
    if (output_number != 0) {
      index -= ${Y("uniforms.size_in_split_axis","output_number - 1u",l.length)};
      ${u.indicesSet("indices",n,"index")};
    }
    writeBufferData(output_number, indices, global_idx);
  }`;return{name:"Split",shaderCache:{hint:t.cacheKey,inputDependencies:["rank"]},getShaderSource:y,getRunData:()=>({outputs:p,dispatchGroup:{x:Math.ceil(i/64)},programUniforms:g})}},$h=(e,t)=>{vl(e.inputs);let r=e.inputs.length===1?t:xl(e.inputs,t);e.compute(Ma(e.inputs,r),{inputs:[0]})},vh=e=>{let t=e.axis,r=e.splitSizes,i=e.numOutputs<0?r.length:e.numOutputs;if(i!==r.length)throw new Error("numOutputs and splitSizes length must be equal");return fe({axis:t,numOutputs:i,splitSizes:r})}}),Tl,Xr,Sh,kh=q(()=>{ie(),ne(),ke(),se(),Tl=(e,t)=>{let[r,i,a,n]=e,{numHeads:s,rotaryEmbeddingDim:u}=t;if(r.dims.length!==3&&r.dims.length!==4)throw new Error(`Input 'x' is expected to have 3 or 4 dimensions, got ${r.dims.length}`);if(!M.areEqual(i.dims,[])&&!M.areEqual(i.dims,[1])&&i.dims.length!==2)throw new Error(`Input 'position_ids' is expected to have 0, 1, or 2 dimensions, got ${i.dims.length}`);if(a.dims.length!==2)throw new Error(`Input 'cos_cache' is expected to have 2 dimensions, got ${a.dims.length}`);if(n.dims.length!==2)throw new Error(`Input 'sin_cache' is expected to have 2 dimensions, got ${n.dims.length}`);if(!M.areEqual(a.dims,n.dims))throw new Error("Inputs 'cos_cache' and 'sin_cache' are expected to have the same shape");if(u>0&&s===0)throw new Error("num_heads must be provided if rotary_embedding_dim is specified");let l=r.dims[0],p=r.dims[r.dims.length-2],h=a.dims[0],f=M.sizeFromDimension(r.dims,1)/p,g=u===0?a.dims[1]*2:f/s;if(u>g)throw new Error("rotary_embedding_dim must be less than or equal to head_size");if(i.dims.length===2){if(l!==i.dims[0])throw new Error(`Input 'position_ids' dimension 0 should be of size batch_size, got ${i.dims[0]}`);if(p!==i.dims[1])throw new Error(`Input 'position_ids' dimension 1 should be of size sequence_length, got ${i.dims[1]}`)}if(p>h)throw new Error("Updating cos_cache and sin_cache in RotaryEmbedding is not currently supported");if(g/2!==a.dims[1]&&u/2!==a.dims[1])throw new Error(`Input 'cos_cache' dimension 1 should be same as head_size / 2 or rotary_embedding_dim / 2, got ${a.dims[1]}`)},Xr=(e,t)=>{let{interleaved:r,numHeads:i,rotaryEmbeddingDim:a,scale:n}=t,s=e[0].dims[0],u=M.sizeFromDimension(e[0].dims,1),l=e[0].dims[e[0].dims.length-2],p=u/l,h=e[2].dims[1],f=a===0?h*2:p/i,g=new Array(s,l,p/f,f-h),y=M.computeStrides(g),_=[{type:1,data:n},{type:12,data:g},{type:12,data:y},...e[0].dims.length===3?new Array({type:12,data:[u,p,f,1]}):[],...e[0].dims.length===4?new Array({type:12,data:[u,f,l*f,1]}):[],...J(e[0].dims,e[1].dims,e[2].dims,e[3].dims,e[0].dims)],w=k=>{let x=D("input",e[0].dataType,e[0].dims.length),b=D("position_ids",e[1].dataType,e[1].dims.length),T=D("cos_cache",e[2].dataType,e[2].dims.length),S=D("sin_cache",e[3].dataType,e[3].dims.length),I=Q("output",e[0].dataType,e[0].dims.length);return k.registerUniforms([{name:"scale",type:"f32"},{name:"global_shape",type:"u32",length:g.length},{name:"global_strides",type:"u32",length:y.length},{name:"input_output_strides",type:"u32",length:y.length}]),`
        ${k.declareVariables(x,b,T,S,I)}

        ${k.mainStart(Ht)}
          let half_rotary_emb_dim = uniforms.${T.name}_shape[1];
          let bsnh = global_idx / uniforms.global_strides % uniforms.global_shape;
          let size = uniforms.global_shape[0] * uniforms.global_strides[0];
          ${k.guardAgainstOutOfBoundsWorkgroupSizes("size")}

          if (bsnh[3] < half_rotary_emb_dim) {
            let position_ids_idx =
                ${b.broadcastedIndicesToOffset("bsnh.xy",Q("",b.type.tensor,2))};
            let position_id =
                u32(${b.getByOffset("position_ids_idx")}) + select(0, bsnh[1], position_ids_idx == 0);
            let i = dot(bsnh, uniforms.input_output_strides) + select(0, bsnh[3], ${r});
            let j = i + select(half_rotary_emb_dim, 1, ${r});
            let re = ${x.getByOffset("i")} * ${T.get("position_id","bsnh[3]")} -
                ${x.getByOffset("j")} * ${S.get("position_id","bsnh[3]")};
            ${I.setByOffset("i","re")}
            let im = ${x.getByOffset("i")} * ${S.get("position_id","bsnh[3]")} +
                ${x.getByOffset("j")} * ${T.get("position_id","bsnh[3]")};
            ${I.setByOffset("j","im")}
          } else {
            let k = dot(bsnh, uniforms.input_output_strides) + half_rotary_emb_dim;
            ${I.setByOffset("k",x.getByOffset("k"))}
          }
        }`};return{name:"RotaryEmbedding",shaderCache:{hint:fe({interleaved:r}).cacheKey,inputDependencies:["rank","rank","rank","rank"]},getShaderSource:w,getRunData:()=>({outputs:[{dims:e[0].dims,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(M.size(g)/Ht)},programUniforms:_})}},Sh=(e,t)=>{Tl(e.inputs,t),e.compute(Xr(e.inputs,t))}}),El,Il,ra,zl,Th,Ty=q(()=>{ke(),ie(),Xa(),wh(),xh(),bt(),kh(),se(),El=(e,t)=>{if(t.doRotary&&e.length<=7)throw new Error("cos_cache and sin_cache inputs are required if do_rotary is specified");let r=e[0],i=e[1],a=e[2],n=e[3],s=e[4];if(t.doRotary!==0&&e.length<=7)throw new Error("cos_cast and sin_cache are expected if do_rotary attribute is non-zero");if(t.localWindowSize!==-1)throw new Error("Local attention is not supported");if(t.softcap!==0)throw new Error("Softcap is not supported");if(t.rotaryInterleaved!==0)throw new Error("Rotary interleaved is not supported");if(t.smoothSoftmax)throw new Error("Smooth softmax is not supported");if(r.dims.length!==3&&r.dims.length!==5)throw new Error("Input query is expected to have 3 or 5 dimensions");let u=!1,l=r.dims[0],p=r.dims[1],h=r.dims.length===3?u?r.dims[2]/3:r.dims[2]:t.numHeads*r.dims[4],f=p,g=0,y=!i||i.dims.length===0,_=Math.floor(y?h/(t.numHeads+2*t.kvNumHeads):h/t.numHeads);y&&(h=_*t.numHeads);let w=n&&n.dims.length!==0,k=s&&s.dims.length!==0;if(w&&n.dims.length===4&&n.dims[0]===l&&n.dims[1]!==t.kvNumHeads&&n.dims[2]===t.kvNumHeads&&n.dims[3]===_)throw new Error("BSNH pastKey/pastValue is not supported");if(w&&k){if(n.dims.length!==4)throw new Error('Input "past_key" is expected to have 4 dimensions');if(s.dims.length!==4)throw new Error('Input "past_value" is expected to have 4 dimensions');g=n.dims[2]}else if(w||k)throw new Error('Input "past_key" and "past_value" shall be both present or both absent');let x=1;if(i&&i.dims.length>0){if(r.dims.length!==3)throw new Error('Input "query" is expected to have 3 dimensions when key is given');if(i.dims.length<3||i.dims.length>5)throw new Error('Input "key" is expected to have 3, 4, or 5 dimensions');if(r.dims[0]!==i.dims[0])throw new Error('Input "query" and "key" shall have same dim 0 (batch size)');if(i.dims.length===3){if(r.dims[2]%i.dims[2]!==0)throw new Error('Dimension 2 of "query" should be a multiple of "key"');f=i.dims[1]}else if(i.dims.length===5){if(i.dims[2]!==t.numHeads||i.dims[3]!==2||i.dims[4]!==_)throw new Error('Expect "key" shape (batch_size, kv_sequence_length, num_heads, 2, head_size) for packed kv');if(a)throw new Error('Expect "value" be none when "key" has packed kv format.');f=i.dims[1]}else{if(i.dims[1]!==t.numHeads||i.dims[3]!==_)throw new Error('Expect "key" shape (batch_size, num_heads, kv_sequence_length, head_size) for past_key');f=i.dims[2]}}else{if(r.dims.length!==3&&r.dims.length!==5)throw new Error('Input "query" is expected to have 3 or 5 dimensions when key is empty');if(r.dims.length===5&&(r.dims[2]!==t.numHeads||r.dims[3]!==3))throw new Error('Expect "query" shape (batch_size, kv_sequence_length, num_heads, 3, head_size) for packed kv');x=3}let b=0,T=!1,S=t.kvNumHeads?_*t.kvNumHeads:h;if(a&&a.dims.length>0){if(a.dims.length!==3&&a.dims.length!==4)throw new Error('Input "value" is expected to have 3 or 4 dimensions');if(r.dims[0]!==a.dims[0])throw new Error('Input "query" and "value" shall have same dim 0 (batch_size)');if(a.dims.length===3){if(f!==a.dims[1])throw new Error('Input "key" and "value" shall have the same dim 1 (kv_sequence_length)');S=a.dims[2]}else{if(f!==a.dims[2])throw new Error('Input "past_key" and "past_value" shall have the same dim 2 (kv_sequence_length)');S=a.dims[1]*a.dims[3],T=!0}}let I=e.length>4?e[5]:void 0;if(I){if(I.dims.length===0)throw new Error("seqlens_k must be at least 1D, got scalar.");let A=I.dims.reduce((z,v)=>z*v,1);if(A!==l)throw new Error(`seqlens_k must have batch_size (${l}) elements, got ${A}.`);for(let z=0;z<I.dims.length;z++)if(I.dims[z]!==1&&I.dims[z]!==l)throw new Error(`seqlens_k has unexpected shape. Each dimension must be 1 or batch_size (${l}), got dims[${z}] = ${I.dims[z]}.`)}return{batchSize:l,sequenceLength:p,pastSequenceLength:g,kvSequenceLength:f,totalSequenceLength:-1,maxSequenceLength:-1,inputHiddenSize:0,hiddenSize:h,vHiddenSize:S,headSize:_,vHeadSize:Math.floor(S/t.kvNumHeads),numHeads:t.numHeads,kvNumHeads:t.kvNumHeads,nReps:t.numHeads/t.kvNumHeads,pastPresentShareBuffer:!1,maskType:b,scale:t.scale,broadcastResPosBias:!1,passPastInKv:T,qkvFormat:x}},Il=fe({perm:[0,2,1,3]}),ra=(e,t,r)=>{let i=t,a=r.kvNumHeads;return t.dims.length===3&&r.kvSequenceLength!==0&&(i=t.reshape([r.batchSize,r.kvSequenceLength,a,r.headSize]),i=e.compute(Ue(i,Il.perm),{inputs:[i],outputs:[-1]})[0]),i},zl=(e,t,r,i)=>{let a=7,n=["type","type"],s=[e*t],u=e*t,l=[{type:12,data:u},{type:12,data:t},{type:12,data:e}],p=h=>{let f=D("seq_lens",r.dataType,r.dims),g=D("total_seq_lens",i.dataType,i.dims),y=Q("pos_ids",a,s),_=[{name:"output_size",type:"u32"},{name:"sequence_length",type:"u32"},{name:"batch_size",type:"u32"}];return`
  ${h.registerUniforms(_).declareVariables(f,g,y)}
  ${h.mainStart()}
    ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let total_sequence_length = u32(${g.getByOffset("0")});
    let is_subsequent_prompt = uniforms.sequence_length > 1 && uniforms.sequence_length != total_sequence_length;
    let is_first_prompt = !is_subsequent_prompt && uniforms.sequence_length == total_sequence_length;
    let batch_idx = global_idx / uniforms.sequence_length;
    let sequence_idx = i32(global_idx % uniforms.sequence_length);
    var pos_id: i32 = 0;
    let seqlen = ${f.getByOffset("batch_idx")};
    let total_seqlen = seqlen + 1;
    if (is_first_prompt) {
      if (sequence_idx < total_seqlen) {
        pos_id = sequence_idx;
      } else {
        pos_id = 1;
      }
      ${y.setByOffset("global_idx","pos_id")}
    } else if (is_subsequent_prompt) {
      let past_seqlen = total_seqlen - i32(uniforms.sequence_length);
      if (past_seqlen + sequence_idx < total_seqlen) {
        pos_id = past_seqlen + sequence_idx;
      } else {
        pos_id = 1;
      }
      ${y.setByOffset("global_idx","pos_id")}
    } else if (global_idx < uniforms.batch_size) {
      ${y.setByOffset("global_idx","seqlen")}
    };
  }
  `};return{name:"GeneratePositionIds",shaderCache:{hint:`${e};${t}`,inputDependencies:n},getRunData:()=>({outputs:[{dims:s,dataType:a}],dispatchGroup:{x:Math.ceil(u/64)},programUniforms:l}),getShaderSource:p}},Th=(e,t)=>{let r=El(e.inputs,t);if(e.inputs[0].dims.length===5)throw new Error("Packed QKV is not implemented");if(e.inputs[1]?.dims.length===5)throw new Error("Packed KV is not implemented");let i=e.inputs[0],a=e.inputs[1]&&e.inputs[1].dims.length>0?e.inputs[1]:void 0,n=e.inputs[2]&&e.inputs[2].dims.length>0?e.inputs[2]:void 0,s=e.inputs[3]&&e.inputs[3].dims.length!==0?e.inputs[3]:void 0,u=e.inputs[4]&&e.inputs[4].dims.length!==0?e.inputs[4]:void 0,l=e.inputs.length>4?e.inputs[5]:void 0,p=e.inputs.length>5?e.inputs[6]:void 0,h=r.kvNumHeads?r.kvNumHeads:r.numHeads,f=fe({axis:2,numOutputs:3,splitSizes:[r.numHeads*r.headSize,h*r.headSize,h*r.headSize]}),[g,y,_]=!a&&!n?e.compute(Ma([i],f),{inputs:[i],outputs:[-1,-1,-1]}):[i,a,n],w,k;if(t.doRotary){let S=e.compute(zl(r.batchSize,r.sequenceLength,l,p),{inputs:[l,p],outputs:[-1]})[0],I=e.inputs[7],A=e.inputs[8],z=fe({interleaved:t.rotaryInterleaved!==0,numHeads:r.numHeads,rotaryEmbeddingDim:0,scale:t.scale}),v=[g,S,I,A],N=[-1];w=e.compute(Xr(v,z),{inputs:v,outputs:N})[0],v.splice(0,1,y);let U=fe({interleaved:t.rotaryInterleaved!==0,numHeads:r.kvNumHeads,rotaryEmbeddingDim:0,scale:t.scale});k=e.compute(Xr(v,U),{inputs:v,outputs:N})[0]}let x=dr(e,r.batchSize,r.numHeads,r.sequenceLength,r.headSize,t.doRotary?w:g,void 0,0),b=ra(e,t.doRotary?k:y,r),T=ra(e,_,r);fr(e,x,b,T,void 0,void 0,s,u,void 0,r,l,p)}}),ia,Cl,Al,Eh,Ey=q(()=>{ie(),ne(),bt(),se(),ia=(e,t,r,i,a,n,s,u)=>{let l=Se(n),p=l===1?"f32":`vec${l}f`,h=l===1?"vec2f":`mat2x${l}f`,f=a*s,g=64;f===1&&(g=256);let y=[a,s,n/l],_=[a,s,2],w=["rank","type","type"],k=[];k.push(...J(y,_));let x=b=>{let T=D("x",t.dataType,3,l),S=D("scale",r.dataType,r.dims),I=D("bias",i.dataType,i.dims),A=Q("output",1,3,2),z=[T,S,I,A];return`
  var<workgroup> workgroup_shared : array<${h}, ${g}>;
  const workgroup_size = ${g}u;
  ${b.declareVariables(...z)}
  ${b.mainStart(g)}
    let batch = workgroup_index / uniforms.x_shape[1];
    let channel = workgroup_index % uniforms.x_shape[1];
    let hight = uniforms.x_shape[2];
    // initialize workgroup memory
    var sum = ${p}(0);
    var squared_sum = ${p}(0);
    for (var h = local_idx; h < hight; h += workgroup_size) {
      let value = ${p}(${T.get("batch","channel","h")});
      sum += value;
      squared_sum += value * value;
    }
    workgroup_shared[local_idx] = ${h}(sum, squared_sum);
    workgroupBarrier();

    for (var currSize = workgroup_size >> 1;  currSize > 0; currSize = currSize >> 1) {
      if (local_idx < currSize) {
        workgroup_shared[local_idx] = workgroup_shared[local_idx] + workgroup_shared[local_idx + currSize];
      }
      workgroupBarrier();
    }
    if (local_idx == 0) {
      let sum_final = ${_t("workgroup_shared[0][0]",l)} / f32(hight * ${l});
      let squared_sum_final = ${_t("workgroup_shared[0][1]",l)} / f32(hight * ${l});

      let inv_std_dev = inverseSqrt(squared_sum_final - sum_final * sum_final + f32(${u}));
      let channel_scale = inv_std_dev * f32(scale[channel]);
      let channel_shift = f32(bias[channel]) - sum_final * channel_scale;
      output[workgroup_index] = vec2f(channel_scale, channel_shift);
    }
  }`};return e.compute({name:"InstanceNormComputeChannelScaleShift",shaderCache:{hint:`${l};${u};${g}`,inputDependencies:w},getRunData:()=>({outputs:[{dims:_,dataType:1}],dispatchGroup:{x:f},programUniforms:k}),getShaderSource:x},{inputs:[t,r,i],outputs:[-1]})[0]},Cl=(e,t,r)=>{let i=t[0].dims,a=i,n=2,s=i[0],u=i[1],l=M.sizeFromDimension(i,n),p=Se(l),h=M.size(a)/p,f=ia(e,t[0],t[1],t[2],s,l,u,r.epsilon),g=[s,u,l/p],y=[s,u],_=["type","none"],w=k=>{let x=D("x",t[0].dataType,g.length,p),b=D("scale_shift",1,y.length,2),T=Q("output",t[0].dataType,g.length,p),S=[x,b,T];return`
  ${k.registerUniform("output_size","u32").declareVariables(...S)}
  ${k.mainStart()}
  ${k.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let outputIndices = ${T.offsetToIndices("global_idx")};
      let batch = outputIndices[0];
      let channel = outputIndices[1];
      let scale_shift = ${b.getByIndices("vec2<u32>(batch, channel)")};
      let value = ${x.getByOffset("global_idx")} * ${T.type.value}(scale_shift.x) + ${T.type.value}(scale_shift.y);
      ${T.setByOffset("global_idx","value")};
  }`};e.compute({name:"InstanceNormalization",shaderCache:{hint:`${p}`,inputDependencies:_},getRunData:()=>({outputs:[{dims:a,dataType:t[0].dataType}],dispatchGroup:{x:Math.ceil(h/64)},programUniforms:[{type:12,data:h},...J(g,y,g)]}),getShaderSource:w},{inputs:[t[0],f]})},Al=(e,t,r)=>{let i=t[0].dims,a=i,n=i[0],s=i[i.length-1],u=M.sizeFromDimension(i,1)/s,l=Se(s),p=M.size(a)/l,h=[{type:12,data:u},{type:12,data:Math.floor(s/l)}],f=["type","type"],g=!1,y=[0,i.length-1];for(let x=0;x<i.length-2;x++)g=g||i[x+1]!==1,y.push(x+1);g=g&&i[i.length-1]!==1;let _=g?e.compute(Ue(e.inputs[0],y),{inputs:[e.inputs[0]],outputs:[-1]})[0]:e.inputs[0].reshape(Array.from({length:i.length},(x,b)=>i[y[b]])),w=ia(e,_,t[1],t[2],n,u,s,r.epsilon),k=x=>{let b=ze(t[0].dataType),T=l===1?"vec2f":`mat${l}x2f`,S=z=>{let v=z===0?"x":"y",N=l===1?"f32":`vec${l}f`;switch(l){case 1:return`${b}(${N}(scale.${v}))`;case 2:return`vec2<${b}>(${N}(scale[0].${v}, scale[1].${v}))`;case 4:return`vec4<${b}>(${N}(scale[0].${v}, scale[1].${v}, scale[2].${v}, scale[3].${v}))`;default:throw new Error(`Not supported compoents ${l}`)}},I=D("input",t[0].dataType,t[0].dims,l),A=Q("output",t[0].dataType,a,l);return`
  @group(0) @binding(0) var<storage, read> input : array<${I.type.storage}>;
  @group(0) @binding(1) var<storage, read> scale_input : array<${T}>;
  @group(0) @binding(2) var<storage, read_write> output : array<${A.type.storage}>;
  struct Uniforms {H: u32, C : u32};
  @group(0) @binding(3) var<uniform> uniforms: Uniforms;

  ${x.mainStart()}
    let current_image_number = global_idx / (uniforms.C * uniforms.H);
    let current_channel_number = global_idx % uniforms.C;

    let scale_offset = current_image_number * uniforms.C + current_channel_number;
    let scale = scale_input[scale_offset];
    output[global_idx] = fma(input[global_idx], ${S(0)}, ${S(1)});
  }`};e.compute({name:"InstanceNormalizationNHWC",shaderCache:{hint:`${l}`,inputDependencies:f},getRunData:()=>({outputs:[{dims:a,dataType:t[0].dataType}],dispatchGroup:{x:Math.ceil(p/64)},programUniforms:h}),getShaderSource:k},{inputs:[t[0],w]})},Eh=(e,t)=>{t.format==="NHWC"?Al(e,e.inputs,t):Cl(e,e.inputs,t)}}),Ol,Ml,Ih,Iy=q(()=>{ie(),ne(),se(),Ol=e=>{if(!e||e.length<2)throw new Error("layerNorm requires at least 2 inputs.")},Ml=(e,t,r)=>{let i=t.simplified,a=e[0].dims,n=e[1],s=!i&&e[2],u=a,l=M.normalizeAxis(t.axis,a.length),p=M.sizeToDimension(a,l),h=M.sizeFromDimension(a,l),f=M.size(n.dims),g=s?M.size(s.dims):0;if(f!==h||s&&g!==h)throw new Error(`Size of X.shape()[axis:] == ${h}.
       Size of scale and bias (if provided) must match this.
       Got scale size of ${f} and bias size of ${g}`);let y=[];for(let I=0;I<a.length;++I)I<l?y.push(a[I]):y.push(1);let _=Se(h),w=["type","type"],k=[{type:12,data:p},{type:1,data:h},{type:12,data:Math.floor(h/_)},{type:1,data:t.epsilon}];s&&w.push("type");let x=r>1,b=r>2,T=I=>{let A=ze(e[0].dataType),z=[D("x",e[0].dataType,e[0].dims,_),D("scale",n.dataType,n.dims,_)];s&&z.push(D("bias",s.dataType,s.dims,_)),z.push(Q("output",e[0].dataType,u,_)),x&&z.push(Q("mean_data_output",1,y)),b&&z.push(Q("inv_std_output",1,y));let v=[{name:"norm_count",type:"u32"},{name:"norm_size",type:"f32"},{name:"norm_size_vectorized",type:"u32"},{name:"epsilon",type:"f32"}];return`
  ${I.registerUniforms(v).declareVariables(...z)}
  ${I.mainStart()}
    ${I.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.norm_count")}
    let offset = global_idx * uniforms.norm_size_vectorized;
    var mean_vector = ${Sa("f32",_)};
    var mean_square_vector = ${Sa("f32",_)};

    for (var h: u32 = 0u; h < uniforms.norm_size_vectorized; h++) {
      let value = ${Gt(A,_,"x[h + offset]")};
      mean_vector += value;
      mean_square_vector += value * value;
    }
    let mean = ${_t("mean_vector",_)} / uniforms.norm_size;
    let inv_std_dev = inverseSqrt(${_t("mean_square_vector",_)} / uniforms.norm_size ${i?"":"- mean * mean"} + uniforms.epsilon);

    for (var j: u32 = 0; j < uniforms.norm_size_vectorized; j++) {
      let f32input = ${Gt(A,_,"x[j + offset]")};
      let f32scale = ${Gt(A,_,"scale[j]")};
      output[j + offset] = ${z[0].type.value}((f32input ${i?"":"- mean"}) * inv_std_dev * f32scale
        ${s?`+ ${Gt(A,_,"bias[j]")}`:""}
      );
    }

    ${x?"mean_data_output[global_idx] = mean":""};
    ${b?"inv_std_output[global_idx] = inv_std_dev":""};
  }`},S=[{dims:u,dataType:e[0].dataType}];return x&&S.push({dims:y,dataType:1}),b&&S.push({dims:y,dataType:1}),{name:"LayerNormalization",shaderCache:{hint:`${_};${r};${i}`,inputDependencies:w},getRunData:()=>({outputs:S,dispatchGroup:{x:Math.ceil(p/64)},programUniforms:k}),getShaderSource:T}},Ih=(e,t)=>{Ol(e.inputs),e.compute(Ml(e.inputs,t,e.outputCount))}}),Rl,zh,zy=q(()=>{ne(),tn(),rn(),Rl=e=>{if(!e||e.length!==2)throw new Error("MatMul requires 2 inputs.");if(e[0].dims[e[0].dims.length-1]!==e[1].dims[e[1].dims.length-2])throw new Error("shared dimension does not match.")},zh=e=>{Rl(e.inputs);let t=Vt.calcShape(e.inputs[0].dims,e.inputs[1].dims,!0);if(!t)throw new Error("Can't use matmul on the given tensors");let r=t[t.length-1],i=e.inputs[0].dims[e.inputs[0].dims.length-1];if(r<8&&i<8)e.compute(en(e.inputs,{activation:""},t));else{let a=t[t.length-2],n=M.size(e.inputs[0].dims.slice(0,-2)),s=M.size(e.inputs[1].dims.slice(0,-2));if(n!==1&&a===1&&s===1){let u=e.inputs[0].reshape([1,n,i]),l=e.inputs[1].reshape([1,i,r]),p=[1,n,r],h=[u,l];e.compute(Zr(h,{activation:""},t,p),{inputs:h})}else e.compute(Zr(e.inputs,{activation:""},t))}}}),Bl,Dl,Nl,Ch,Ah,Cy=q(()=>{ie(),ne(),ke(),se(),Bl=(e,t)=>{if(e.length<3||e.length>4)throw new Error("MatMulNBits requires 3 or 4 inputs");let r=e[0],i=r.dims.length;if(r.dims[i-1]!==t.k)throw new Error("The last dim of input shape does not match the k value");let a=Math.floor((t.k+t.blockSize-1)/t.blockSize),n=t.blockSize/8*t.bits,s=e[1];if(!M.areEqual(s.dims,[t.n,a,n]))throw new Error("The second inputs must be 3D tensor with shape N X nBlocksPerCol X blobSize");let u=e[2].dims;if(M.size(u)!==t.n*a)throw new Error("scales input size error.");if(e.length===4){let l=e[3].dims,p=t.n*(t.bits===8?a:Math.floor((a*t.bits+7)/8));if(M.size(l)!==p)throw new Error("zeroPoints input size error.")}},Dl=(e,t)=>{let r=e[0].dims,i=r.length,a=r[i-2],n=t.k,s=t.n,u=r.slice(0,i-2),l=M.size(u),p=e[1].dims[2]/4,h=e[0].dataType,f=Se(t.k),g=Se(p),y=Se(s),_=u.concat([a,s]),w=a>1&&s/y%2===0?2:1,k=M.size(_)/y/w,x=64,b=[],T=[l,a,n/f],S=M.convertShape(e[1].dims).slice();S.splice(-1,1,p/g),b.push(...J(T)),b.push(...J(S)),b.push(...J(e[2].dims)),e.length===4&&b.push(...J(M.convertShape(e[3].dims)));let I=[l,a,s/y];b.push(...J(I));let A=z=>{let v=T.length,N=D("a",e[0].dataType,v,f),U=D("b",12,S.length,g),Z=D("scales",e[2].dataType,e[2].dims.length),G=[N,U,Z],K=e.length===4?D("zero_points",12,e[3].dims.length):void 0;K&&G.push(K);let R=I.length,P=Q("output",e[0].dataType,R,y),j=ze(e[0].dataType),te=(()=>{switch(f){case 1:return`array<${j}, 8>`;case 2:return`mat4x2<${j}>`;case 4:return`mat2x4<${j}>`;default:throw new Error(`${f}-component is not supported.`)}})(),ee=Math.floor(32/t.bits),re=Math.floor(ee/8),ae=()=>{let H="";for(let V=0;V<re;V++){let Ee=V*t.bits*4,Oe=Ee+t.bits;H+=`
          // reuse a data (pass ${V})
            var input_offset${V>0?V:""} = ${V===0?N.indicesToOffset(`${N.type.indices}(batch, row, word_offset)`):"input_offset"};
            var a_data${V>0?V:""}: ${te};
            for (var j${V>0?V:""}: u32 = 0; j${V>0?V:""} < ${8/f}; j${V>0?V:""}++) {
              a_data${V>0?V:""}[j${V>0?V:""}] = ${N.getByOffset(`input_offset${V>0?V:""}`)};
              input_offset${V>0?V:""}++;
            }
          `;for(let ve=0;ve<y*w;ve++)H+=`
            b_value = ${g===1?`b${ve}_data`:`b${ve}_data[i]`};
            ${t.bits===2?`{
              let half_word = b_value >> ${V*16}u;
              let byte_lo = half_word & 0xFFu;
              let byte_hi = (half_word >> 8u) & 0xFFu;
              let spread_word = (byte_lo & 0xFu) | ((byte_lo >> 4u) << 8u) | ((byte_hi & 0xFu) << 16u) | ((byte_hi >> 4u) << 24u);
              b_value_lower = unpack4xU8(spread_word & b_mask);
              b_value_upper = unpack4xU8((spread_word >> 2u) & b_mask);
            }`:`b_value_lower = unpack4xU8((b_value >> ${Ee}u) & b_mask);
            b_value_upper = unpack4xU8((b_value >> ${Oe}u) & b_mask);`}
            b_quantized_values = ${te}(${Array.from({length:4},(Me,ge)=>`${j}(b_value_lower[${ge}]), ${j}(b_value_upper[${ge}])`).join(", ")});
            b_dequantized_values = ${f===1?`${te}(${Array.from({length:8},(Me,ge)=>`(b_quantized_values[${ge}] - ${K?`zero_point${ve}`:"zero_point"}) * scale${ve}`).join(", ")});`:`(b_quantized_values - ${te}(${Array(8).fill(`${K?`zero_point${ve}`:"zero_point"}`).join(",")})) * scale${ve};`};
            workgroup_shared[local_id.x * ${w} + ${Math.floor(ve/y)}]${y>1?`[${ve%y}]`:""} += ${Array.from({length:8/f},(Me,ge)=>`${f===1?`a_data${V>0?V:""}[${ge}] * b_dequantized_values[${ge}]`:`dot(a_data${V>0?V:""}[${ge}], b_dequantized_values[${ge}])`}`).join(" + ")};
          `}return H},O=()=>{let H=`
            var col_index = col * ${y};
            ${K?`
            let zero_point_values_per_byte: u32 = ${Math.floor(8/t.bits)}u;
            let zero_point_bytes_per_col = (nBlocksPerCol + zero_point_values_per_byte - 1u) / zero_point_values_per_byte;
            var zero_point_byte_count: u32;
            var zero_point_word_index: u32;
            var zero_point_byte_offset: u32;
            let zero_point_sub_offset: u32 = block % zero_point_values_per_byte;
            var zero_point_bits_offset: u32;
            var zero_point_word: u32;`:`
            // The default zero point is ${Math.pow(2,t.bits-1)} for unsigned ${t.bits}-bit quantization.
            let zero_point = ${j}(${Math.pow(2,t.bits-1).toFixed(1)});`}
            `;for(let V=0;V<y*w;V++)H+=`
            let scale${V} = ${Z.getByOffset("col_index * nBlocksPerCol + block")};
            ${K?`
            zero_point_byte_count = col_index * zero_point_bytes_per_col + (block / zero_point_values_per_byte);
            zero_point_word_index = zero_point_byte_count >> 0x2u;
            zero_point_byte_offset = zero_point_byte_count & 0x3u;
            zero_point_bits_offset = (zero_point_byte_offset << 3) + (zero_point_sub_offset * ${t.bits}u);
            zero_point_word = ${K.getByOffset("zero_point_word_index")} >> zero_point_bits_offset;
            let zero_point${V} = ${j}((zero_point_word) & ${t.bits===2?"0x3u":"0xFu"});`:""}
            col_index += 1;`;return H},W=()=>{let H=`col_index = col * ${y};`;for(let V=0;V<y*w;V++)H+=`
            let b${V}_data = ${U.getByIndices(`${U.type.indices}(col_index, block, word)`)};
            col_index += 1;`;return H+=`
            var b_value: u32;
            let b_mask: u32 = ${t.bits===2?"0x03030303u":"0x0F0F0F0Fu"};
            var b_value_lower: vec4<u32>;
            var b_value_upper: vec4<u32>;
            var b_quantized_values: ${te};
            var b_dequantized_values: ${te};`,H};return`
        var<workgroup> workgroup_shared: array<${P.type.value}, ${w*x}>;
        ${z.declareVariables(...G,P)}
        ${z.mainStart([x,1,1])}
          let output_indices = ${P.offsetToIndices(`(global_idx / ${x}) * ${w}`)};
          let col = output_indices[2];
          let row = output_indices[1];
          let batch = output_indices[0];
          let nBlocksPerCol = uniforms.b_shape[1];

          for (var block = local_id.x; block < nBlocksPerCol; block += ${x}) {
            //process one block
            var word_offset: u32 = block * ${t.blockSize/f};
            ${O()}
            for (var word: u32 = 0; word < ${p}; word += ${g}) {
              ${W()}
              for (var i: u32 = 0; i < ${g}; i++) {
                ${ae()}
                word_offset += ${ee/f};
              }
            }
          }
          workgroupBarrier();

          if (local_id.x < ${w}) {
            var output_value: ${P.type.value} = ${P.type.value}(0);
            var workgroup_shared_offset: u32 = local_id.x;
            for (var b: u32 = 0u; b < ${x}u; b++) {
              output_value += workgroup_shared[workgroup_shared_offset];
              workgroup_shared_offset += ${w};
            }
            ${P.setByIndices(`${P.type.indices}(batch, row, col + local_id.x)`,"output_value")};
          }
        }`};return{name:"MatMulNBits",shaderCache:{hint:`${t.blockSize};${t.bits};${f};${g};${y};${w};${x}`,inputDependencies:Array(e.length).fill("rank")},getRunData:()=>({outputs:[{dims:_,dataType:h}],dispatchGroup:{x:k},programUniforms:b}),getShaderSource:A}},Nl=(e,t)=>{let r=e[0].dims,i=r.length,a=r[i-2],n=t.k,s=t.n,u=r.slice(0,i-2),l=M.size(u),p=e[1].dims[2]/4,h=e[0].dataType,f=Se(t.k),g=Se(p),y=u.concat([a,s]),_=128,w=s%8===0?8:s%4===0?4:1,k=_/w,x=Math.floor(32/t.bits),b=k*g*x,T=b/f,S=b/t.blockSize,I=M.size(y)/w,A=[],z=[l,a,n/f],v=M.convertShape(e[1].dims).slice();v.splice(-1,1,p/g),A.push(...J(z)),A.push(...J(v)),A.push(...J(e[2].dims)),e.length===4&&A.push(...J(M.convertShape(e[3].dims)));let N=[l,a,s];A.push(...J(N));let U=Z=>{let G=z.length,K=D("a",e[0].dataType,G,f),R=D("b",12,v.length,g),P=D("scales",e[2].dataType,e[2].dims.length),j=[K,R,P],te=e.length===4?D("zero_points",12,e[3].dims.length):void 0;te&&j.push(te);let ee=N.length,re=Q("output",e[0].dataType,ee),ae=ze(e[0].dataType),O=()=>{switch(f){case 1:return`
          let a_data0 = vec4<${ae}>(sub_a[word_offset], sub_a[word_offset + 1], sub_a[word_offset + 2], sub_a[word_offset + 3]);
          let a_data1 = vec4<${ae}>(sub_a[word_offset + 4], sub_a[word_offset + 5], sub_a[word_offset + 6], sub_a[word_offset + 7]);`;case 2:return`
          let a_data0 = vec4<${ae}>(sub_a[word_offset], sub_a[word_offset + 1]);
          let a_data1 = vec4<${ae}>(sub_a[word_offset + 2], sub_a[word_offset + 3]);`;case 4:return`
          let a_data0 = sub_a[word_offset];
          let a_data1 = sub_a[word_offset + 1];`;default:throw new Error(`${f}-component is not supported.`)}};return`
        var<workgroup> sub_a: array<${K.type.value}, ${T}>;
        var<workgroup> inter_results: array<array<${re.type.value}, ${k}>, ${w}>;
        ${Z.declareVariables(...j,re)}
        ${Z.mainStart([k,w,1])}
          let output_indices = ${re.offsetToIndices(`workgroup_index * ${w}`)};
          let col = output_indices[2];
          let row = output_indices[1];
          let batch = output_indices[0];
          let n_blocks_per_col = uniforms.b_shape[1];
          let num_tiles =  (n_blocks_per_col - 1) / ${S} + 1;

          // Loop over shared dimension.
          for (var tile: u32 = 0; tile < num_tiles; tile += 1) {
            let a_col_start = tile * ${T};
            // load one tile A data into shared memory.
            for (var a_offset = local_idx; a_offset < ${T}; a_offset += ${_})
            {
              let a_col = a_col_start + a_offset;
              if (a_col < uniforms.a_shape[2])
              {
                sub_a[a_offset] = ${K.getByIndices(`${K.type.indices}(batch, row, a_col)`)};
              } else {
                sub_a[a_offset] = ${K.type.value}(0);
              }
            }
            workgroupBarrier();

            // each thread process one block
            let b_row = col + local_id.y;
            let block = tile * ${S} + local_id.x;
            ${te?`
            let zero_point_values_per_byte: u32 = ${Math.floor(8/t.bits)}u;
            let zero_point_bytes_per_col = (n_blocks_per_col + zero_point_values_per_byte - 1u) / zero_point_values_per_byte;
            let zero_point_byte_count = b_row * zero_point_bytes_per_col + (block / zero_point_values_per_byte);
            let zero_point_word_index = zero_point_byte_count >> 0x2u;
            let zero_point_byte_offset = zero_point_byte_count & 0x3u;
            let zero_point_sub_offset: u32 = block % zero_point_values_per_byte;
            let zero_point_bits_offset = (zero_point_byte_offset << 3) + (zero_point_sub_offset * ${t.bits}u);
            let zero_point_word = ${te.getByOffset("zero_point_word_index")} >> zero_point_bits_offset;
            let zero_point = ${ae}((zero_point_word) & ${t.bits===2?"0x3u":"0xFu"});`:`
            // The default zero point is ${Math.pow(2,t.bits-1)} for unsigned ${t.bits}-bit quantization.
            let zero_point = ${ae}(${Math.pow(2,t.bits-1).toFixed(1)});`}
            let scale = ${P.getByOffset("b_row * n_blocks_per_col + block")};
            let b_data = ${R.getByIndices(`${R.type.indices}(b_row, block, 0)`)};
            var word_offset = local_id.x * ${t.blockSize/f};
            for (var i: u32 = 0; i < ${g}; i++) {
              let b_value = ${g===1?"b_data":"b_data[i]"};
              ${(()=>{let W=Math.floor(x/8),H="";for(let V=0;V<W;V++){let Ee=V*t.bits*4,Oe=Ee+t.bits;H+=`
              ${O()}
              {${t.bits===2?`
                let half_word = b_value >> ${V*16}u;
                let byte_lo = half_word & 0xFFu;
                let byte_hi = (half_word >> 8u) & 0xFFu;
                let spread_word = (byte_lo & 0xFu) | ((byte_lo >> 4u) << 8u) | ((byte_hi & 0xFu) << 16u) | ((byte_hi >> 4u) << 24u);
                let b_value_lower = unpack4xU8(spread_word & 0x03030303u);
                let b_value_upper = unpack4xU8((spread_word >> 2u) & 0x03030303u);`:`
                let b_value_lower = unpack4xU8((b_value >> ${Ee}u) & 0x0F0F0F0Fu);
                let b_value_upper = unpack4xU8((b_value >> ${Oe}u) & 0x0F0F0F0Fu);`}
                let b_quantized_values = mat2x4<${ae}>(${Array.from({length:4},(ve,Me)=>`${ae}(b_value_lower[${Me}]), ${ae}(b_value_upper[${Me}])`).join(", ")});
                let b_dequantized_values = (b_quantized_values - mat2x4<${ae}>(${Array(8).fill("zero_point").join(",")})) * scale;
                inter_results[local_id.y][local_id.x] += ${Array.from({length:2},(ve,Me)=>`${`dot(a_data${Me}, b_dequantized_values[${Me}])`}`).join(" + ")};
              }
              word_offset += ${8/f};`}return H})()}
            }
            workgroupBarrier();
          }

          if (local_idx < ${w}) {
            var output_value: ${re.type.value} = ${re.type.value}(0);
            for (var b = 0u; b < ${k}; b++) {
              output_value += inter_results[local_idx][b];
            }
            if (col + local_idx < uniforms.output_shape[2])
            {
              ${re.setByIndices(`${re.type.indices}(batch, row, col + local_idx)`,"output_value")}
            }
          }
        }`};return{name:"BlockwiseMatMulNBits32",shaderCache:{hint:`${t.blockSize};${f};${g};${k};${w}`,inputDependencies:Array(e.length).fill("rank")},getRunData:()=>({outputs:[{dims:y,dataType:h}],dispatchGroup:{x:I},programUniforms:A}),getShaderSource:U}},Ch=(e,t)=>{Bl(e.inputs,t),t.blockSize===32&&e.adapterInfo.isVendor("intel")&&e.adapterInfo.isArchitecture("gen-12lp")?e.compute(Nl(e.inputs,t)):e.compute(Dl(e.inputs,t))},Ah=e=>fe(e)}),Pl,Ul,Wl,ql,Ll,Gl,Vl,Hl,Oh,Ay=q(()=>{ie(),ne(),se(),Pl=e=>{if(!e||e.length<1)throw new Error("Too few inputs");if(e[0].dataType!==1&&e[0].dataType!==10)throw new Error("Input type must be float or float16.");if(e.length>=2){let t=e[0].dims.length*2===e[1].dims[0];if(e.length===4&&(t=e[3].dims[0]*2===e[1].dims[0]),!t)throw new Error("The pads should be a 1D tensor of shape [2 * input_rank] or [2 * num_axes].")}},Ul=(e,t,r)=>{let i="";for(let a=t-1;a>=0;--a)i+=`
            k = i32(${e.indicesGet("indices",a)}) - ${Y("uniforms.pads",a,r)};
            if (k < 0) {
              break;
            }
            if (k >= i32(${Y("uniforms.x_shape",a,t)})) {
              break;
            }
            offset += k * i32(${Y("uniforms.x_strides",a,t)});
        `;return`
          value = ${e.type.value}(uniforms.constant_value);
          for (var i = 0; i < 1; i++) {
            var offset = 0;
            var k = 0;
            ${i}
            value = x[offset];
          }
      `},Wl=(e,t,r)=>{let i="";for(let a=t-1;a>=0;--a)i+=`
                k = i32(${e.indicesGet("indices",a)}) - ${Y("uniforms.pads",a,r)};
                if (k < 0) {
                  k = -k;
                }
                {
                  let _2n_1 = 2 * (i32(${Y("uniforms.x_shape",a,t)}) - 1);
                  k = k % _2n_1;
                  if(k >= i32(${Y("uniforms.x_shape",a,t)})) {
                    k = _2n_1 - k;
                  }
                }
                offset += k * i32(${Y("uniforms.x_strides",a,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${i}
              value = x[offset];
          `},ql=(e,t,r)=>{let i="";for(let a=t-1;a>=0;--a)i+=`
                k = i32(${e.indicesGet("indices",a)}) - ${Y("uniforms.pads",a,r)};
                if (k < 0) {
                  k = 0;
                }
                if (k >= i32(${Y("uniforms.x_shape",a,t)})) {
                  k = i32(${Y("uniforms.x_shape",a,t)}) - 1;
                }
                offset += k * i32(${Y("uniforms.x_strides",a,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${i}
              value = x[offset];
          `},Ll=(e,t,r)=>{let i="";for(let a=t-1;a>=0;--a)i+=`
                k = i32(${e.indicesGet("indices",a)}) - ${Y("uniforms.pads",a,r)};
                if (k < 0)  {
                  k += i32(${Y("uniforms.x_shape",a,t)}]);
                }
                if (k >= i32(${Y("uniforms.x_shape",a,t)})) {
                  k -= i32(${Y("uniforms.x_shape",a,t)});
                }
                offset += k * i32(${Y("uniforms.x_strides",a,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${i}
              value = x[offset];
          `},Gl=(e,t,r)=>{switch(r.mode){case 0:return Ul(e,t,r.pads.length);case 1:return Wl(e,t,r.pads.length);case 2:return ql(e,t,r.pads.length);case 3:return Ll(e,t,r.pads.length);default:throw new Error("Invalid mode")}},Vl=(e,t)=>{let r=M.padShape(e[0].dims.slice(),t.pads),i=e[0].dims,a=M.size(r),n=[{type:12,data:a},{type:6,data:t.pads}],s=e.length>=3&&e[2].data;t.mode===0&&n.push({type:s?e[2].dataType:1,data:t.value}),n.push(...J(e[0].dims,r));let u=["rank"],l=p=>{let h=Q("output",e[0].dataType,r.length),f=D("x",e[0].dataType,i.length),g=f.type.value,y=Gl(h,i.length,t),_=[{name:"output_size",type:"u32"},{name:"pads",type:"i32",length:t.pads.length}];return t.mode===0&&_.push({name:"constant_value",type:s?g:"f32"}),`
            ${p.registerUniforms(_).declareVariables(f,h)}
            ${p.mainStart()}
            ${p.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

            let indices = ${h.offsetToIndices("global_idx")};

            var value = ${g}(0);
            ${y}
            output[global_idx] = value;
        }`};return{name:"Pad",shaderCache:{hint:`${t.mode}${s}`,inputDependencies:u},getRunData:()=>({outputs:[{dims:r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(M.size(r)/64)},programUniforms:n}),getShaderSource:l}},Hl=(e,t)=>{if(e.length>1){let r=e[1].getBigInt64Array(),i=e.length>=3&&e[2].data?e[2].dataType===10?e[2].getUint16Array()[0]:e[2].getFloat32Array()[0]:0,a=e[0].dims.length,n=new Int32Array(2*a).fill(0);if(e.length>=4){let u=e[3].getBigInt64Array();for(let l=0;l<u.length;l++)n[Number(u[l])]=Number(r[l]),n[Number(u[l])+a]=Number(r[l+u.length])}else r.forEach((u,l)=>n[Number(l)]=Number(u));let s=[];return n.forEach(u=>s.push(u)),{mode:t.mode,value:i,pads:s}}else return t},Oh=(e,t)=>{Pl(e.inputs);let r=Hl(e.inputs,t);e.compute(Vl(e.inputs,r),{inputs:[0]})}}),ir,aa,na,sa,oa,Fl,jl,ua,la,Mh,Rh,da,Bh,Dh,pa,Nh,Ph,Uh,Wh,Oy=q(()=>{Le(),ie(),ne(),se(),ir=e=>{if(_e.webgpu.validateInputContent&&(!e||e.length!==1))throw new Error("Pool ops requires 1 input.")},aa=(e,t,r)=>{let i=t.format==="NHWC",a=e.dims.slice();i&&a.splice(1,0,a.pop());let n=Object.hasOwnProperty.call(t,"dilations"),s=t.kernelShape.slice(),u=t.strides.slice(),l=n?t.dilations.slice():[],p=t.pads.slice();jr.adjustPoolAttributes(r,a,s,u,l,p);let h=jr.computePoolOutputShape(r,a,u,l,s,p,t.autoPad),f=Object.assign({},t);n?Object.assign(f,{kernelShape:s,strides:u,pads:p,dilations:l,cacheKey:t.cacheKey}):Object.assign(f,{kernelShape:s,strides:u,pads:p,cacheKey:t.cacheKey});let g=h.slice();return g.push(g.splice(1,1)[0]),[f,i?g:h]},na=(e,t)=>{let r=t.format==="NHWC",i=M.size(e),a=M.size(t.kernelShape),n=[{type:12,data:i},{type:12,data:a}],s=[{name:"outputSize",type:"u32"},{name:"kernelSize",type:"u32"}];if(t.kernelShape.length<=2){let u=t.kernelShape[t.kernelShape.length-1],l=t.strides[t.strides.length-1],p=t.pads[t.pads.length/2-1],h=t.pads[t.pads.length-1],f=!!(p+h);n.push({type:12,data:u},{type:12,data:l},{type:12,data:p},{type:12,data:h}),s.push({name:"kw",type:"u32"},{name:"sw",type:"u32"},{name:"pwStart",type:"u32"},{name:"pwEnd",type:"u32"});let g=!1;if(t.kernelShape.length===2){let y=t.kernelShape[t.kernelShape.length-2],_=t.strides[t.strides.length-2],w=t.pads[t.pads.length/2-2],k=t.pads[t.pads.length-2];g=!!(w+k),n.push({type:12,data:y},{type:12,data:_},{type:12,data:w},{type:12,data:k}),s.push({name:"kh",type:"u32"},{name:"sh",type:"u32"},{name:"phStart",type:"u32"},{name:"phEnd",type:"u32"})}return[n,s,!0,f,g]}else{if(r)throw new Error("Pooling with kernelShape.length > 2 is not supported for NHWC format.");let u=M.computeStrides(t.kernelShape);n.push({type:12,data:u},{type:12,data:t.pads},{type:12,data:t.strides}),s.push({name:"kernelStrides",type:"u32",length:u.length},{name:"pads",type:"u32",length:t.pads.length},{name:"strides",type:"u32",length:t.strides.length});let l=t.pads.reduce((p,h)=>p+h);return[n,s,!!l,!1,!1]}},sa=(e,t,r,i,a,n,s,u,l,p,h,f)=>{let g=a.format==="NHWC",y=t.type.value,_=Q("output",t.type.tensor,i);if(a.kernelShape.length<=2){let w="",k="",x="",b=r-(g?2:1);if(h?w=`
                for (var i: u32 = 0u; i < uniforms.kw; i++) {
                  xIndices[${b}] = indices[${b}] * uniforms.sw - uniforms.pwStart + i;
                  if (xIndices[${b}] < 0 || xIndices[${b}]
                      >= uniforms.x_shape[${b}]) {
                    pad++;
                    continue;
                  }
                  let x_val = x[${t.indicesToOffset("xIndices")}];
                  ${n}
                }`:w=`
                for (var i: u32 = 0u; i < uniforms.kw; i++) {
                  xIndices[${b}] = indices[${b}] * uniforms.sw - uniforms.pwStart + i;
                  let x_val = x[${t.indicesToOffset("xIndices")}];
                  ${n}
                }`,a.kernelShape.length===2){let T=r-(g?3:2);f?k=`
                for (var j: u32 = 0u; j < uniforms.kh; j++) {
                  xIndices[${T}] = indices[${T}] * uniforms.sh - uniforms.phStart + j;
                  if (xIndices[${T}] < 0 || xIndices[${T}] >= uniforms.x_shape[${T}]) {
                    pad += i32(uniforms.kw);
                    continue;
                  }
              `:k=`
                for (var j: u32 = 0u; j < uniforms.kh; j++) {
                  xIndices[${T}] = indices[${T}] * uniforms.sh - uniforms.phStart + j;
                `,x=`
              }
            `}return`
            ${e.registerUniforms(l).declareVariables(t,_)}

            ${e.mainStart()}
              ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

              let indices = ${_.offsetToIndices("global_idx")};
              var xIndices = ${_.offsetToIndices("global_idx")};

              var value = ${y}(${u});
              var pad = 0;
              ${k}
              ${w}
              ${x}
              ${s}

              output[global_idx] = value;
            }`}else{if(g)throw new Error("Pooling with kernelShape.length > 2 is not supported for NHWC format.");let w=a.kernelShape.length,k=a.pads.length,x="";return p?x=`
                if (xIndices[j] >= uniforms.x_shape[j]) {
                  pad++;
                  isPad = true;
                  break;
                }
              }
              if (!isPad) {
                let x_val = x[${t.indicesToOffset("xIndices")}];
                ${n}
              }`:x=`
              }
              let x_val = x[${t.indicesToOffset("xIndices")}];
              ${n}
            `,`
            ${e.registerUniforms(l).declareVariables(t,_)}

            ${e.mainStart()}
              ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
              let indices = ${_.offsetToIndices("global_idx")};
              var xIndices = ${_.offsetToIndices("global_idx")};

              var offsets: array<u32, ${w}>;

              var value = ${y}(${u});
              var pad = 0;
              var isPad = false;

              for (var i: u32 = 0u; i < uniforms.kernelSize; i++) {
                var offset = i;
                for (var j = 0u; j < ${w-1}u; j++) {
                  offsets[j] = offset / ${Y("uniforms.kernelStrides","j",w)};
                  offset -= offsets[j] * ${Y("uniforms.kernelStrides","j",w)};
                }
                offsets[${w-1}] = offset;

                isPad = false;
                for (var j = ${r-w}u; j < ${r}u; j++) {
                  xIndices[j] = indices[j] * ${Y("uniforms.strides",`j - ${r-w}u`,w)}
                    + offsets[j - ${r-w}u] - ${Y("uniforms.pads","j - 2u",k)};
                  ${x}
              }
              ${s}

              output[global_idx] = value;
            }`}},oa=e=>`${e.format};${e.ceilMode};${e.autoPad};${e.kernelShape.length}`,Fl=e=>`${oa(e)};${e.countIncludePad}`,jl=e=>`${oa(e)};${e.storageOrder};${e.dilations}`,ua=e=>({format:e.format,autoPad:["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][e.auto_pad],ceilMode:e.ceil_mode,kernelShape:e.kernel_shape,strides:e.strides,pads:e.pads}),la=(e,t,r,i)=>{let[a,n]=aa(t,i,r),s=D("x",t.dataType,t.dims.length),u=s.type.value,l="value += x_val;",p="";a.countIncludePad?p+=`value /= ${u}(uniforms.kernelSize);`:p+=`value /= ${u}(i32(uniforms.kernelSize) - pad);`;let[h,f,g,y,_]=na(n,a);h.push(...J(t.dims,n));let w=["rank"];return{name:e,shaderCache:{hint:`${i.cacheKey};${g};${y};${_}`,inputDependencies:w},getRunData:()=>({outputs:[{dims:n,dataType:t.dataType}],dispatchGroup:{x:Math.ceil(M.size(n)/64)},programUniforms:h}),getShaderSource:k=>sa(k,s,t.dims.length,n.length,a,l,p,0,f,g,y,_)}},Mh=e=>{let t=e.count_include_pad!==0,r=ua(e);if(r.ceilMode!==0)throw new Error("using ceil() in shape computation is not yet supported for AveragePool");let i={countIncludePad:t,...r,cacheKey:""};return{...i,cacheKey:Fl(i)}},Rh=(e,t)=>{ir(e.inputs),e.compute(la("AveragePool",e.inputs[0],!1,t))},da={autoPad:"",ceilMode:0,countIncludePad:!1,kernelShape:[],strides:[],pads:[],storageOrder:0,dilations:[]},Bh=e=>{let t=e.format;return{format:t,...da,cacheKey:t}},Dh=(e,t)=>{ir(e.inputs),e.compute(la("GlobalAveragePool",e.inputs[0],!0,t))},pa=(e,t,r,i)=>{let[a,n]=aa(t,i,r),s=`
      value = max(x_val, value);
    `,u="",l=D("x",t.dataType,t.dims.length),p=["rank"],[h,f,g,y,_]=na(n,a);return h.push(...J(t.dims,n)),{name:e,shaderCache:{hint:`${i.cacheKey};${g};${y};${_}`,inputDependencies:p},getRunData:()=>({outputs:[{dims:n,dataType:t.dataType}],dispatchGroup:{x:Math.ceil(M.size(n)/64)},programUniforms:h}),getShaderSource:w=>sa(w,l,t.dims.length,n.length,a,s,u,t.dataType===10?-65504:-1e5,f,g,y,_)}},Nh=(e,t)=>{ir(e.inputs),e.compute(pa("MaxPool",e.inputs[0],!1,t))},Ph=e=>{let t=e.storage_order,r=e.dilations,i=ua(e);if(t!==0)throw new Error("column major storage order is not yet supported for MaxPool");if(i.ceilMode!==0)throw new Error("using ceil() in shape computation is not yet supported for MaxPool");let a={storageOrder:t,dilations:r,...i,cacheKey:""};return{...a,cacheKey:jl(a)}},Uh=e=>{let t=e.format;return{format:t,...da,cacheKey:t}},Wh=(e,t)=>{ir(e.inputs),e.compute(pa("GlobalMaxPool",e.inputs[0],!0,t))}}),Kl,Zl,qh,Lh,My=q(()=>{ie(),ne(),ke(),se(),Kl=(e,t)=>{if(e.length<2||e.length>3)throw new Error("DequantizeLinear requires 2 or 3 inputs.");if(e.length===3&&e[1].dims===e[2].dims)throw new Error("x-scale and x-zero-point must have the same shape.");if(e.length===3&&e[0].dataType!==e[2].dataType)throw new Error("x and x-zero-point must have the same data type.");if(e[1].dims.length!==0&&e[1].dims.length!==1&&e[1].dims.length!==e[0].dims.length)throw new Error("scale input must be a scalar, a 1D tensor, or have the same rank as the input tensor.");if(e.length>2){if(e[0].dataType!==e[2].dataType)throw new Error("x and x-zero-point must have the same data type.");if(e[1].dims.length!==e[2].dims.length)throw new Error("scale and zero-point inputs must have the same rank.");if(!e[1].dims.map((r,i)=>r===e[2].dims[i]).reduce((r,i)=>r&&i,!0))throw new Error("scale and zero-point inputs must have the same shape.")}if(t.blockSize>0){if(e[1].dims.length===0||e[1].dims.length===1&&e[1].dims[0]===1)throw new Error("blockSize must be set only for block quantization.");if(!e[1].dims.map((a,n)=>n===t.axis||a===e[0].dims[n]).reduce((a,n)=>a&&n,!0))throw new Error("For block qunatization, scale input shape to match the input shape except for the axis");if(e[1].dims.length!==e[0].dims.length)throw new Error("For block qunatization the scale input rank must be the same as the x rank.");let r=e[0].dims[t.axis],i=e[1].dims[t.axis];if(t.blockSize<Math.ceil(r/i)||t.blockSize>Math.ceil(r/(i-1)-1))throw new Error("blockSize must be with in the range [ceil(dI / Si), ceil(dI / (Si - 1) - 1)].")}},Zl=(e,t)=>{let r=M.normalizeAxis(t.axis,e[0].dims.length),i=e[0].dataType,a=i===3,n=e[0].dims,s=e[1].dataType,u=M.size(n),l=i===3||i===2,p=l?[Math.ceil(M.size(e[0].dims)/4)]:e[0].dims,h=e[1].dims,f=e.length>2?e[2]:void 0,g=f?l?[Math.ceil(M.size(f.dims)/4)]:f.dims:void 0,y=h.length===0||h.length===1&&h[0]===1,_=y===!1&&h.length===1,w=Se(u),k=y&&(!l||w===4),x=k?w:1,b=k&&!l?w:1,T=D("input",l?12:i,p.length,b),S=D("scale",s,h.length),I=f?D("zero_point",l?12:i,g.length):void 0,A=Q("output",s,n.length,x),z=[T,S];I&&z.push(I);let v=[p,h];f&&v.push(g);let N=[{type:12,data:u/x},{type:12,data:r},{type:12,data:t.blockSize},...J(...v,n)],U=Z=>{let G=[{name:"output_size",type:"u32"},{name:"axis",type:"u32"},{name:"block_size",type:"u32"}];return`
      ${Z.registerUniforms(G).declareVariables(...z,A)}
      ${Z.mainStart()}
          ${Z.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          let output_indices = ${A.offsetToIndices("global_idx")};

          // Set input x
          ${l?`
            let input = ${T.getByOffset("global_idx / 4")};
            let x_vec = ${a?"unpack4xI8(input)":"unpack4xU8(input)"};
            let x_value = ${x===1?"x_vec[global_idx % 4]":"x_vec"};`:`let x_value = ${T.getByOffset("global_idx")};`};

          // Set scale input
          ${y?`let scale_value= ${S.getByOffset("0")}`:_?`
            let scale_index = ${A.indicesGet("output_indices","uniforms.axis")};
            let scale_value= ${S.getByOffset("scale_index")};`:`
            var scale_indices: ${S.type.indices} = output_indices;
            let index = ${S.indicesGet("scale_indices","uniforms.axis")} / uniforms.block_size;
            ${S.indicesSet("scale_indices","uniforms.axis","index")};
            let scale_value= ${S.getByIndices("scale_indices")};`};

          // Set zero-point input
          ${I?y?l?`
                let zero_point_input = ${I.getByOffset("0")};
                let zero_point_vec =  ${a?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value= zero_point_vec[0]`:`let zero_point_value = ${I.getByOffset("0")}`:_?l?`
                let zero_point_index = ${A.indicesGet("output_indices","uniforms.axis")};
                let zero_point_input = ${I.getByOffset("zero_point_index / 4")};
                let zero_point_vec =  ${a?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value = zero_point_vec[zero_point_index % 4]`:`
                let zero_point_index = ${A.indicesGet("output_indices","uniforms.axis")};
                let zero_point_value = ${I.getByOffset("zero_point_index")};`:l?`
                let zero_point_offset = ${S.indicesToOffset("scale_indices")};
                let zero_point_input = ${I.getByOffset("zero_point_offset / 4")};
                let zero_point_vec = ${a?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value = zero_point_vec[zero_point_offset % 4];`:`let zero_point_value = ${I.getByIndices("scale_indices")};`:`let zero_point_value = ${l?a?"i32":"u32":T.type.value}(0);`};
      // Compute and write output
      ${A.setByOffset("global_idx",`${A.type.value}(x_value - zero_point_value) * scale_value`)};
      }`};return{name:"DequantizeLinear",shaderCache:{hint:t.cacheKey,inputDependencies:I?["rank","rank","rank"]:["rank","rank"]},getShaderSource:U,getRunData:()=>({outputs:[{dims:n,dataType:s}],dispatchGroup:{x:Math.ceil(u/x/64),y:1,z:1},programUniforms:N})}},qh=(e,t)=>{Kl(e.inputs,t),e.compute(Zl(e.inputs,t))},Lh=e=>fe({axis:e.axis,blockSize:e.blockSize})}),Xl,Ql,Gh,Ry=q(()=>{Le(),ie(),se(),Xl=(e,t,r)=>{let i=e===t,a=e<t&&r<0,n=e>t&&r>0;if(i||a||n)throw new Error("Range these inputs' contents are invalid.")},Ql=(e,t,r,i)=>{let a=Math.abs(Math.ceil((t-e)/r)),n=[a],s=a,u=[{type:12,data:s},{type:i,data:e},{type:i,data:r},...J(n)],l=p=>{let h=Q("output",i,n.length),f=h.type.value,g=[{name:"outputSize",type:"u32"},{name:"start",type:f},{name:"delta",type:f}];return`
        ${p.registerUniforms(g).declareVariables(h)}
        ${p.mainStart()}
        ${p.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
        output[global_idx] = uniforms.start + ${f}(global_idx) * uniforms.delta;
      }`};return{name:"Range",shaderCache:{hint:`${i}`},getShaderSource:l,getRunData:()=>({outputs:[{dims:n,dataType:i}],dispatchGroup:{x:Math.ceil(s/64)},programUniforms:u})}},Gh=e=>{let t=0,r=0,i=0;e.inputs[0].dataType===6?(t=e.inputs[0].getInt32Array()[0],r=e.inputs[1].getInt32Array()[0],i=e.inputs[2].getInt32Array()[0]):e.inputs[0].dataType===1&&(t=e.inputs[0].getFloat32Array()[0],r=e.inputs[1].getFloat32Array()[0],i=e.inputs[2].getFloat32Array()[0]),_e.webgpu.validateInputContent&&Xl(t,r,i),e.compute(Ql(t,r,i,e.inputs[0].dataType),{inputs:[]})}}),Yl,Jl,Vh,Hh,By=q(()=>{ie(),ne(),ke(),se(),Yl=(e,t,r,i)=>{if(e!=="none"&&i!=="i32"&&i!=="u32"&&i!=="f32")throw new Error(`Input ${i} is not supported with reduction ${e}.`);let a=`{
                var oldValue = 0;
                loop {
                  let newValueF32 =`,n=`;
                  let newValue = bitcast<i32>(newValueF32);
                  let res = atomicCompareExchangeWeak(&${t}, oldValue, newValue);
                  if res.exchanged {
                    break;
                  }
                  oldValue = res.old_value;
                }
              }`;switch(e){case"none":return`${t}=${r};`;case"add":return i==="i32"||i==="u32"?`atomicAdd(&${t}, bitcast<${i}>(${r}));`:`
              ${a}bitcast<${i}>(oldValue) + (${r})${n}`;case"max":return i==="i32"||i==="u32"?`atomicMax(&${t}, bitcast<${i}>(${r}));`:`
                ${a}max(bitcast<f32>(oldValue), (${r}))${n}`;case"min":return i==="i32"||i==="u32"?`atomicMin(&${t}, bitcast<${i}>(${r}));`:`${a}min(bitcast<${i}>(oldValue), (${r}))${n}`;case"mul":return`${a}(bitcast<${i}>(oldValue) * (${r}))${n}`;default:throw new Error(`Reduction ${e} is not supported.`)}},Jl=(e,t)=>{let r=e[0].dims,i=e[1].dims,a=r,n=1,s=Math.ceil(M.sizeToDimension(i,i.length-1)/n),u=i[i.length-1],l=M.sizeFromDimension(r,u),p=[{type:12,data:s},{type:12,data:u},{type:12,data:l},...J(e[1].dims,e[2].dims,a)],h=f=>{let g=D("indices",e[1].dataType,e[1].dims.length),y=D("updates",e[2].dataType,e[2].dims.length,n),_=t.reduction!=="none"&&t.reduction!==""?bp("output",e[0].dataType,a.length):Q("output",e[0].dataType,a.length,n);return`
      ${f.registerUniform("output_size","u32").registerUniform("last_index_dimension","u32").registerUniform("num_updates_elements","u32").declareVariables(g,y,_)}
      ${f.mainStart()}
        ${f.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
  var data_offset = 0u;
  let indices_start = uniforms.last_index_dimension * global_idx;
  let indices_end = indices_start + uniforms.last_index_dimension;
  for (var i = indices_start; i < indices_end; i++) {
    var index = i32(indices[i].x);
    ${e[0].dims.length===1?`
    let element_count_dim = uniforms.output_strides;
    let dim_value = uniforms.output_shape;`:`
    let element_count_dim = uniforms.output_strides[i - indices_start];
    let dim_value = uniforms.output_shape[i - indices_start];`}
    if (index >= 0) {
      if (index >= i32(dim_value)) {
        index = i32(dim_value - 1);
      }
    } else {
      if (index < -i32(dim_value)) {
        index = 0;
      } else {
        index += i32(dim_value);
      }
    }
    data_offset += u32((u32(index) * element_count_dim));
  }

  for (var i = 0u; i < uniforms.num_updates_elements; i++) {
    let value = updates[uniforms.num_updates_elements * global_idx + i];
    ${Yl(t.reduction,"output[data_offset + i]","value",_.type.value)}
  }

      }`};return{name:"ScatterND",shaderCache:{hint:`${t.cacheKey}_${t.reduction}`,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:a,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(s/64)},programUniforms:p}),getShaderSource:h}},Vh=e=>fe({reduction:e.reduction}),Hh=(e,t)=>{e.compute(Jl(e.inputs,t),{inputs:[e.inputs[1],e.inputs[2]],outputs:[]})}}),ed,td,rd,ca,id,ad,nd,sd,od,ud,ld,dd,ha,pd,cd,hd,fd,md,Fh,jh,Dy=q(()=>{ie(),ne(),ke(),se(),ed=(e,t)=>{if(e.every(r=>r>0||(()=>{throw new Error("Resize requires scales input values to be positive")})),e.length>0){if(t.mode==="linear"){if(!(e.length===2||e.length===3||e.length===4&&e[0]===1&&e[1]===1||e.length===4&&e[0]===1&&e[3]===1||e.length===5&&e[0]===1&&e[1]===1))throw new Error(`For linear mode, Resize requires scales to be 2D, 3D, 4D with either two outermost or one innermost and
            one outermost scale values equal to 1, or 5D with two outermost scale values equal to 1`)}else if(t.mode==="cubic"&&!(e.length===2||e.length===4&&e[0]===1&&e[1]===1||e.length===4&&e[0]===1&&e[3]===1))throw new Error("Resize requires scales input size to be 2 or 4 for cubic mode")}},td=(e,t,r)=>{t.every(a=>a>=0&&a<r||(()=>{throw new Error("Resize requires axes input values to be positive and less than rank")}));let i=new Array(r).fill(1);return t.forEach((a,n)=>i[a]=e[n]),i},rd=(e,t,r,i,a,n)=>{let[s,u,l]=r>10?[1,2,3]:[-1,e.length>1?1:-1,-1],p=e[0].dims.length;if(s>0&&e.length>s&&e[s].dims.length>0)e[s].getFloat32Array().forEach(h=>n.push(h));else if(t.coordinateTransformMode==="tf_crop_and_resize")throw new Error("Resize requires RoI input to be specified when coordinateTransformMode is tfCropAndResize");if(u>0&&e.length>u&&e[u].dims.length===1&&e[u].dims[0]>0){if(e[u].getFloat32Array().forEach(h=>i.push(h)),i.length!==0&&i.length!==p&&r>=18&&i.length!==t.axes.length)throw new Error("Resize requires scales input size to be same as input rank or axes size for opset 18 and up");ed(i,t),t.axes.length>0&&td(i,t.axes,p).forEach((h,f)=>i[f]=h)}if(l>0&&e.length>l&&e[l].dims.length===1&&e[l].dims[0]>0&&(e[l].getBigInt64Array().forEach(h=>a.push(Number(h))),a.length!==0&&a.length!==p&&r>=18&&a.length!==t.axes.length))throw new Error("Resize requires sizes input size to be same as input rank or axes size for opset 18 and up");if(t.axes.length>0){if(i.length!==0&&i.length!==t.axes.length)throw new Error('Resize requires "scales" input size to be of axes rank when axes attributes is specified');if(a.length!==0&&a.length!==t.axes.length)throw new Error('Resize requires "sizes" input size to be of rank axes rank when axes attributes is specified')}if(typeof i<"u"&&typeof a<"u"&&i.length>0&&a.length>p)throw new Error("Resize requires only of scales or sizes to be specified")},ca=(e,t,r,i)=>`
  // The whole part and the fractional part are calculated separately due to inaccuracy of floating
  // point division. As an example, f32(21) / f32(7) may evaluate to 2.99... instead of 3, causing an
  // offset-by-one error later in floor().
  let big = (${e}) * (${t});
  let whole = ${i}(big / (${r}));
  let fract = ${i}(big % (${r})) / ${i}(${r});
  return whole + fract;
`,id=(e,t)=>`fn getOriginalCoordinateFromResizedCoordinate(xResized: u32, xScale: f32, lengthResized: u32,
     lengthOriginal: u32, roiStart: f32, roiEnd: f32) -> ${t} { `+(()=>{switch(e){case"asymmetric":return`
          if (xScale < 1.0 || floor(xScale) != xScale) {
            return ${t}(xResized) / ${t}(xScale);
          } else {
            ${ca("xResized","lengthOriginal","lengthResized",t)}
          }
        `;case"pytorch_half_pixel":return`if (lengthResized > 1) {
                    return (${t}(xResized) + 0.5) / ${t}(xScale) - 0.5;
                  } else {
                    return 0.0;
                  }`;case"tf_half_pixel_for_nn":return`return (${t}(xResized) + 0.5) / ${t}(xScale);`;case"align_corners":return`if (lengthResized == 1) {
                    return 0.0;
                  } else {
                    ${ca("xResized","lengthOriginal - 1","lengthResized - 1",t)}
                  }`;case"tf_crop_and_resize":return`if (lengthResized > 1) {
                    return ${t}(roiStart) * ${t}(lengthOriginal - 1) +
                        (${t}(xResized) * ${t}(roiEnd - roiStart) * ${t}(lengthOriginal - 1)) /
                        ${t}(lengthResized - 1);
                  } else {
                    return 0.5 * ${t}(roiStart + roiEnd) * ${t}(lengthOriginal - 1);
                  }`;case"half_pixel_symmetric":return`const outputWidth = ${t}xScale * ${t}(lengthResized);
                  const adjustment = ${t}(lengthResized) / outputWidth;
                  const center = ${t}(lengthOriginal) / 2;
                  const offset = center * (1 - adjustment);
                  return offset + ((${t}(xResized) + 0.5) / ${t}(xScale)) - 0.5;`;case"half_pixel":return`return ((${t}(xResized) + 0.5) / ${t}(xScale)) - 0.5;`;default:throw new Error(`Coordinate transform mode ${e} is not supported`)}})()+"}",ad=(e,t,r)=>`fn getNearestPixelFromOriginal(xOriginal: ${r}, isDownSample: bool) -> ${r} {`+(()=>{switch(e){case"round_prefer_ceil":return"if (fract(xOriginal) == 0.5) {             return ceil(xOriginal);           } else {             return round(xOriginal);           }";case"floor":return"return floor(xOriginal);";case"ceil":return"return ceil(xOriginal);";case"round_prefer_floor":return"if (fract(xOriginal) == 0.5) {                     return floor(xOriginal);                   } else {                     return round(xOriginal);                   }";default:if(t<11)return"if (isDownSample)                     {                       return ceil(xOriginal);                     } else {                       return xOriginal;                     }";throw new Error(`Nearest mode ${e} is not supported`)}})()+"}",nd=(e,t,r)=>{let i=new Array(r).fill(0).concat(new Array(r).fill(1)),a=e.length===0?i:e.slice();return t.length>0?(t.forEach((n,s)=>{i[n]=a[s],i[s+r]=a[t.length+s]}),i):a},sd=(e,t,r,i)=>{let a=[];if(r.length>0)if(i.length>0){if(e.forEach(n=>a.push(n)),Math.max(...i)>e.length)throw new Error("axes is out of bound");i.forEach((n,s)=>a[n]=r[s])}else r.forEach(n=>a.push(n));else{if(t.length===0)throw new Error("Resize requires either scales or sizes.");a=e.map((n,s)=>Math.round(n*t[s]))}return a},od=(e,t,r)=>{let i=(()=>{switch(r.keepAspectRatioPolicy){case"not_larger":return r.axes.length>0?Math.min(...r.axes.map(n=>t[n]),Number.MAX_VALUE):Math.min(...t,Number.MAX_VALUE);case"not_smaller":return r.axes.length>0?Math.max(...r.axes.map(n=>t[n]),Number.MIN_VALUE):Math.max(...t,Number.MIN_VALUE);default:throw new Error(`Keep aspect ratio policy ${r.keepAspectRatioPolicy} is not supported`)}})();t.fill(1,0,t.length);let a=e.slice();return r.axes.length>0?(r.axes.forEach(n=>t[n]=i),r.axes.forEach(n=>a[n]=Math.round(e[n]*t[n]))):(t.fill(i,0,t.length),a.forEach((n,s)=>a[s]=Math.round(n*t[s]))),a},ud=(e,t,r,i,a)=>`
    fn calculateOriginalIndicesFromOutputIndices(output_indices: ${e.type.indices}) -> array<${e.type.value}, ${r.length}> {
      var original_indices: array<${e.type.value}, ${r.length}>;
      for (var i:u32 = 0; i < ${r.length}; i++) {
        var output_index = ${e.indicesGet("output_indices","i")};
        var scale = ${Y("uniforms.scales","i",i)};
        var roi_low = ${Y("uniforms.roi","i",a)};
        var roi_hi = ${Y("uniforms.roi",`i + ${t.length}`,a)};
        if (scale == 1.0) {
          original_indices[i] = ${e.type.value}(output_index);
        } else {
          var input_shape_i = ${Y("uniforms.input_shape","i",t.length)};
          var output_shape_i = ${Y("uniforms.output_shape","i",r.length)};
          original_indices[i] = getOriginalCoordinateFromResizedCoordinate(output_index, scale, output_shape_i,
                                                                           input_shape_i, roi_low, roi_hi);
        }
      }
      return original_indices;
    }`,ld=(e,t,r,i,a,n,s)=>`
    fn calculateInputIndicesFromOutputIndices(output_indices: ${t.type.indices}) -> ${e.type.indices} {
      var input_indices: ${e.type.indices};
      for (var i:u32 = 0; i < ${i.length}; i++) {
        var output_index = ${t.indicesGet("output_indices","i")};
        var input_index: u32;
        var scale = ${Y("uniforms.scales","i",a)};
        if (scale == 1.0) {
          input_index = output_index;
        } else {
          var roi_low = ${Y("uniforms.roi","i",n)};
          var roi_hi = ${Y("uniforms.roi",`i + ${r.length}`,n)};
          var input_shape_i = ${Y("uniforms.input_shape","i",r.length)};
          var output_shape_i = ${Y("uniforms.output_shape","i",i.length)};
          var original_idx = getOriginalCoordinateFromResizedCoordinate(output_index, scale, output_shape_i,
                                                                        input_shape_i, roi_low, roi_hi);
          if (!${s} || (original_idx >= 0 && original_idx < ${t.type.value}(input_shape_i))) {
            if (original_idx < 0) {
              input_index = 0;
            } else if (original_idx > ${t.type.value}(input_shape_i - 1)) {
              input_index = input_shape_i - 1;
            } else {
              input_index = u32(getNearestPixelFromOriginal(original_idx, scale < 1));
            }
          } else {
            input_index = u32(original_idx);
          }
        }
        ${e.indicesSet("input_indices","i","input_index")}
      }
      return input_indices;
    }`,dd=(e,t)=>`
    fn checkInputIndices(input_indices: ${e.type.indices}) -> bool {
      for (var i:u32 = 0; i < ${t.length}; i++) {
        var input_index = ${e.indicesGet("input_indices","i")};
        if (input_index < 0 || input_index >= ${Y("uniforms.input_shape","i",t.length)}) {
          return false;
        }
      }
      return true;
    }`,ha=(e,t,r,i)=>e.rank>i?`
    ${e.indicesSet("input_indices",t,"channel")};
    ${e.indicesSet("input_indices",r,"batch")};
`:"",pd=(e,t,r,i,a)=>{let[n,s,u,l]=r.length===2?[-1,0,1,-1]:[0,2,3,1],p=e.type.value;return`
    fn getInputValue(batch: u32, channel: u32, row: u32, col: u32) -> ${p} {
      var input_indices: ${e.type.indices};
      ${e.indicesSet("input_indices",s,`max(0, min(row, ${r[s]} - 1))`)};
      ${e.indicesSet("input_indices",u,`max(0, min(col, ${r[u]} - 1))`)};
      ${ha(e,l,n,2)}
      return ${e.getByIndices("input_indices")};
    }

    fn bilinearInterpolation(output_indices: ${t.type.indices}) -> ${p} {
      var originalIndices = calculateOriginalIndicesFromOutputIndices(output_indices);
      var row:${p} = originalIndices[${s}];
      var col:${p} = originalIndices[${u}];
      ${i?`if (row < 0 || row > (${r[s]} - 1) || col < 0 || col > (${r[u]} - 1)) {
        return ${a};
      }`:""};
      row = max(0, min(row, ${r[s]} - 1));
      col = max(0, min(col, ${r[u]} - 1));
      var row1: u32 = u32(row);
      var col1: u32 = u32(col);
      var row2: u32 = u32(row + 1);
      var col2: u32 = u32(col + 1);
      var channel: u32 = ${r.length>2?`u32(originalIndices[${l}])`:"0"};
      var batch: u32 =  ${r.length>2?`u32(originalIndices[${n}])`:"0"};
      var x11: ${p} = getInputValue(batch, channel, row1, col1);
      var x12: ${p} = getInputValue(batch, channel, row1, col2);
      var x21: ${p} = getInputValue(batch, channel, row2, col1);
      var x22: ${p} = getInputValue(batch, channel, row2, col2);
      var dx1: ${p} = abs(row - ${p}(row1));
      var dx2: ${p} = abs(${p}(row2) - row);
      var dy1: ${p} = abs(col - ${p}(col1));
      var dy2: ${p} = abs(${p}(col2) - col);
      if (row1 == row2) {
        dx1 = 0.5;
        dx2 = 0.5;
      }
      if (col1 == col2) {
        dy1 = 0.5;
        dy2 = 0.5;
      }
      return (x11 * dx2 * dy2 + x12 * dx2 * dy1 + x21 * dx1 * dy2 + x22 * dx1 * dy1);
    }`},cd=(e,t,r,i,a,n,s,u,l,p)=>{let h=r.length===2,[f,g]=h?[0,1]:[2,3],y=e.type.value,_=w=>{let k=w===f?"row":"col";return`
      fn ${k}CubicInterpolation(input_indices: ${e.type.indices}, output_indices: ${t.type.indices}) -> ${y} {
        var output_index = ${t.indicesGet("output_indices",w)};
        var originalIdx: ${y} = getOriginalCoordinateFromResizedCoordinate(output_index, ${a[w]},
        ${i[w]}, ${r[w]}, ${n[w]}, ${n[w]} + ${r.length});
        var fractOriginalIdx: ${y} = originalIdx - floor(originalIdx);
        var coefs = getCubicInterpolationCoefs(fractOriginalIdx);

        if (${u} && (originalIdx < 0 || originalIdx > (${r[w]} - 1))) {
          return ${l};
        }
        var data: array<${y}, 4> = array<${y}, 4>(0.0, 0.0, 0.0, 0.0);
        for (var i: i32 = -1; i < 3; i++) {
          var ${k}: ${y} = originalIdx + ${y}(i);
          if (${k} < 0 || ${k} >= ${r[w]}) {
            ${p?`coefs[i + 1] = 0.0;
                        continue;`:u?`return ${l};`:`${k} = max(0, min(${k}, ${r[w]} - 1));`};
          }
        var input_indices_copy: ${e.type.indices} = input_indices;
          ${e.indicesSet("input_indices_copy",w,`u32(${k})`)};
          data[i + 1] = ${w===f?e.getByIndices("input_indices_copy"):"rowCubicInterpolation(input_indices_copy, output_indices)"};
        }
        return cubicInterpolation1D(data, coefs);
      }`};return`
    ${_(f)};
    ${_(g)};
  fn getCubicInterpolationCoefs(s: ${y}) -> array<${y}, 4> {
    var absS = abs(s);
    var coeffs: array<${y}, 4> = array<${y}, 4>(0.0, 0.0, 0.0, 0.0);
    var oneMinusAbsS: ${y} = 1.0 - absS;
    var twoMinusAbsS: ${y} = 2.0 - absS;
    var onePlusAbsS: ${y} = 1.0 + absS;
    coeffs[0] = ((${s} * onePlusAbsS - 5 * ${s}) * onePlusAbsS + 8 * ${s}) * onePlusAbsS - 4 * ${s};
    coeffs[1] = ((${s} + 2) * absS - (${s} + 3)) * absS * absS + 1;
    coeffs[2] = ((${s} + 2) * oneMinusAbsS - (${s} + 3)) * oneMinusAbsS * oneMinusAbsS + 1;
    coeffs[3] = ((${s} * twoMinusAbsS - 5 * ${s}) * twoMinusAbsS + 8 * ${s}) * twoMinusAbsS - 4 * ${s};
    return coeffs;
  }

  fn cubicInterpolation1D(x: array<${y}, 4>, coefs: array<${y}, 4>) -> ${y} {
    var coefsSum: ${y} = coefs[0] + coefs[1] + coefs[2] + coefs[3];
    return (x[0] * coefs[0] + x[1] * coefs[1]+ x[2] * coefs[2]+ x[3] * coefs[3]) / coefsSum;
  }

  fn bicubicInterpolation(output_indices: ${t.type.indices}) -> ${y} {
    var input_indices: ${e.type.indices} = output_indices;
    return colCubicInterpolation(input_indices, output_indices);
  }
    `},hd=(e,t,r,i,a)=>{let[n,s,u,l,p]=r.length===3?[-1,0,1,2,-1]:[0,2,3,4,1],h=e.type.value;return`
    fn getInputValue(batch: u32, channel: u32, depth:u32, height: u32, width: u32) -> ${h} {
      var input_indices: ${e.type.indices};
      ${e.indicesSet("input_indices",s,`max(0, min(depth, ${r[s]} - 1))`)};
      ${e.indicesSet("input_indices",u,`max(0, min(height, ${r[u]} - 1))`)};
      ${e.indicesSet("input_indices",l,`max(0, min(width, ${r[l]} - 1))`)};
      ${ha(e,p,n,3)}
      return ${e.getByIndices("input_indices")};
    }

    fn trilinearInterpolation(output_indices: ${t.type.indices}) -> ${h} {
      var originalIndices = calculateOriginalIndicesFromOutputIndices(output_indices);
      var depth:${h} = originalIndices[${s}];
      var height:${h} = originalIndices[${u}];
      var width:${h} = originalIndices[${l}];
      ${i?`if (depth < 0 || depth > (${r[s]} - 1) || height < 0 || height > (${r[u]} - 1) || width < 0 || (width > ${r[l]} - 1)) {
      return ${a};
        }`:""};

    depth = max(0, min(depth, ${r[s]} - 1));
      height = max(0, min(height, ${r[u]} - 1));
      width = max(0, min(width, ${r[l]} - 1));
      var depth1: u32 = u32(depth);
      var height1: u32 = u32(height);
      var width1: u32 = u32(width);
      var depth2: u32 = u32(depth + 1);
      var height2: u32 = u32(height + 1);
      var width2: u32 = u32(width + 1);
      var channel: u32 = ${r.length>3?`u32(originalIndices[${p}])`:"0"};
      var batch: u32 =  ${r.length>3?`u32(originalIndices[${n}])`:"0"};

      var x111: ${h} = getInputValue(batch, channel, depth1, height1, width1);
      var x112: ${h} = getInputValue(batch, channel, depth1, height1, width2);
      var x121: ${h} = getInputValue(batch, channel, depth1, height2, width1);
      var x122: ${h} = getInputValue(batch, channel, depth1, height2, width2);
      var x211: ${h} = getInputValue(batch, channel, depth2, height1, width1);
      var x212: ${h} = getInputValue(batch, channel, depth2, height1, width2);
      var x221: ${h} = getInputValue(batch, channel, depth2, height2, width1);
      var x222: ${h} = getInputValue(batch, channel, depth2, height2, width2);
      var dx1: ${h} = abs(depth - ${h}(depth1));
      var dx2: ${h} = abs(${h}(depth2) - depth);
      var dy1: ${h} = abs(height - ${h}(height1));
      var dy2: ${h} = abs(${h}(height2) - height);
      var dz1: ${h} = abs(width - ${h}(width1));
      var dz2: ${h} = abs(${h}(width2) - width);
      if (depth1 == depth2) {
        dx1 = 0.5;
        dx2 = 0.5;
      }
      if (height1 == height2) {
        dy1 = 0.5;
        dy2 = 0.5;
      }
      if (width1 == width2) {
        dz1 = 0.5;
        dz2 = 0.5;
      }
      return (x111 * dx2 * dy2 * dz2 + x112 * dx2 * dy2 * dz1 + x121 * dx2 * dy1 *dz2 + x122 * dx2 * dy1 * dz1 +
              x211 * dx1 * dy2 * dz2 + x212 * dx1 * dy2 * dz1 + x221 * dx1 * dy1 *dz2 + x222 * dx1 * dy1 * dz1);
    }`},fd=(e,t,r,i,a,n)=>{let s=e.dims,u=nd(n,t.axes,s.length),l=sd(s,i,a,t.axes),p=i.slice();i.length===0&&(p=s.map((b,T)=>b===0?1:l[T]/b),t.keepAspectRatioPolicy!=="stretch"&&(l=od(s,p,t)));let h=Q("output",e.dataType,l.length),f=D("input",e.dataType,s.length),g=M.size(l),y=s.length===l.length&&s.every((b,T)=>b===l[T]),_=t.coordinateTransformMode==="tf_crop_and_resize",w=t.extrapolationValue,k=f.type.value,x=b=>`
      ${y?"":`
      ${id(t.coordinateTransformMode,k)};
      ${(()=>{switch(t.mode){case"nearest":return`
              ${dd(f,s)};
              ${ad(t.nearestMode,r,k)};
              ${ld(f,h,s,l,p.length,u.length,_)};
              `;case"linear":return`
              ${ud(h,s,l,p.length,u.length)};
              ${(()=>{if(s.length===2||s.length===4)return`${pd(f,h,s,_,w)}`;if(s.length===3||s.length===5)return`${hd(f,h,s,_,w)}`;throw Error("Linear mode only supports input dims 2, 3, 4 and 5 are supported in linear mode.")})()};
            `;case"cubic":return`
            ${(()=>{if(s.length===2||s.length===4)return`${cd(f,h,s,l,p,u,t.cubicCoeffA,_,t.extrapolationValue,t.excludeOutside)}`;throw Error("Cubic mode only supports input dims 2 and 4 are supported in linear mode.")})()};
            `;default:throw Error("Invalid resize mode")}})()};
      `}
      ${b.registerUniform("output_size","u32").registerUniform("scales","f32",p.length).registerUniform("roi","f32",u.length).declareVariables(f,h)}
      ${b.mainStart()}
        ${b.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
        ${y?"output[global_idx] = input[global_idx];":`
        let output_indices = ${h.offsetToIndices("global_idx")};
        var input_indices: ${f.type.indices};
        ${(()=>{switch(t.mode){case"nearest":return`input_indices = calculateInputIndicesFromOutputIndices(output_indices);
                if (checkInputIndices(input_indices)) {
                  output[global_idx] = ${f.getByIndices("input_indices")};
                } else {
                  output[global_idx] = ${t.extrapolationValue};
                }`;case"linear":return`output[global_idx] = ${s.length===2||s.length===4?"bilinearInterpolation":"trilinearInterpolation"}(output_indices);`;case"cubic":return"output[global_idx] = bicubicInterpolation(output_indices);";default:throw Error(`Unsupported resize mode: ${t.mode}`)}})()};
`}
      }`;return{name:"Resize",shaderCache:{hint:`${t.cacheKey}|${r}|${p.length>0?t.mode==="cubic"?p:p.length:""}|${a.length>0?a:""}|${u.length>0?u:""}|${y}|${t.mode==="nearest"?s.length:s}`,inputDependencies:["rank"]},getShaderSource:x,getRunData:()=>({outputs:[{dims:l,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:[{type:12,data:g},{type:1,data:p},{type:1,data:u},...J(s,l)]})}},md=e=>{let t=e.customDataBuffer;return new Uint32Array(t,t.byteOffset,1)[0]},Fh=(e,t)=>{let r=[],i=[],a=[],n=md(e);if(t.antialias!==0)throw Error("Only default value (0) for Antialias attribute is supported");rd(e.inputs,t,n,r,i,a),e.compute(fd(e.inputs[0],t,n,r,i,a),{inputs:[0]})},jh=e=>{let t=e.antialias,r=e.axes,i=e.coordinateTransformMode,a=e.cubicCoeffA,n=e.excludeOutside!==0,s=e.extrapolationValue,u=e.keepAspectRatioPolicy,l=e.mode,p=e.nearestMode===""?"simple":e.nearestMode;return fe({antialias:t,axes:r,coordinateTransformMode:i,cubicCoeffA:a,excludeOutside:n,extrapolationValue:s,keepAspectRatioPolicy:u,mode:l,nearestMode:p})}}),gd,yd,Kh,Ny=q(()=>{ie(),ne(),se(),gd=e=>{if(!e||e.length<3)throw new Error("layerNorm requires at least 3 inputs.");let t=e[0],r=e[1],i=e[2];if(t.dataType!==r.dataType||t.dataType!==i.dataType)throw new Error("All inputs must have the same data type");if(t.dims.length!==3&&t.dims.length!==2)throw new Error("Input must be 2D or 3D");if(r.dims.length!==3&&r.dims.length!==2)throw new Error("Skip must be 2D or 3D");let a=t.dims[t.dims.length-1],n=t.dims[t.dims.length-2];if(r.dims[r.dims.length-1]!==a)throw new Error("Skip must have the same hidden size as input");if(r.dims[r.dims.length-2]!==n)throw new Error("Skip must have the same sequence length as input");if(i.dims.length!==1)throw new Error("Gamma must be 1D");if(i.dims[i.dims.length-1]!==a)throw new Error("Gamma must have the same hidden size as input");if(e.length>3){let s=e[3];if(s.dims.length!==1)throw new Error("Beta must be 1D");if(s.dims[s.dims.length-1]!==a)throw new Error("Beta must have the same hidden size as input")}if(e.length>4){let s=e[4];if(s.dims.length!==1)throw new Error("Bias must be 1D");if(s.dims[s.dims.length-1]!==a)throw new Error("Bias must have the same hidden size as input")}},yd=(e,t,r,i)=>{let a=t.simplified,n=e[0].dims,s=M.size(n),u=n,l=s,p=n.slice(-1)[0],h=i?n.slice(0,-1).concat(1):[],f=!a&&e.length>3,g=e.length>4,y=i&&r>1,_=i&&r>2,w=r>3,k=64,x=Se(p),b=[{type:12,data:l},{type:12,data:x},{type:12,data:p},{type:1,data:t.epsilon}],T=I=>{let A=[{name:"output_size",type:"u32"},{name:"components",type:"u32"},{name:"hidden_size",type:"u32"},{name:"epsilon",type:"f32"}],z=[D("x",e[0].dataType,e[0].dims,x),D("skip",e[1].dataType,e[1].dims,x),D("gamma",e[2].dataType,e[2].dims,x)];f&&z.push(D("beta",e[3].dataType,e[3].dims,x)),g&&z.push(D("bias",e[4].dataType,e[4].dims,x)),z.push(Q("output",e[0].dataType,u,x)),y&&z.push(Q("mean_output",1,h)),_&&z.push(Q("inv_std_output",1,h)),w&&z.push(Q("input_skip_bias_sum",e[0].dataType,u,x));let v=ze(e[0].dataType),N=ze(1,x);return`

      ${I.registerUniforms(A).declareVariables(...z)}
      var<workgroup> sum_shared : array<${N}, ${k}>;
      var<workgroup> sum_squared_shared : array<${N}, ${k}>;

      ${I.mainStart([k,1,1])}
        let ix = local_id.x;
        let iy = global_id.x / ${k};

        let hidden_size_vectorized: u32 = uniforms.hidden_size / uniforms.components;
        var stride = hidden_size_vectorized / ${k};
        let offset = ix * stride + iy * hidden_size_vectorized;
        let offset1d = stride * ix;
        if (ix == ${k-1}) {
          stride = hidden_size_vectorized - stride * ix;
        }
        for (var i: u32 = 0; i < stride; i++) {
          let skip_value = skip[offset + i];
          let bias_value = ${g?"bias[offset1d + i]":v+"(0.0)"};
          let input_value = x[offset + i];
          let value = input_value + skip_value + bias_value;
          ${w?"input_skip_bias_sum[offset + i] = value;":""}
          output[offset + i] = value;
          let f32_value = ${Gt(v,x,"value")};
          sum_shared[ix] += f32_value;
          sum_squared_shared[ix] += f32_value * f32_value;
        }
        workgroupBarrier();

        var reduce_size : u32 = ${k};
        for (var curr_size = reduce_size >> 1;  curr_size > 0; curr_size = reduce_size >> 1) {
          reduce_size = curr_size + (reduce_size & 1);
          if (ix < curr_size) {
            sum_shared[ix] += sum_shared[ix + reduce_size];
            sum_squared_shared[ix] += sum_squared_shared[ix + reduce_size];
          }
          workgroupBarrier();
        }

        let sum = sum_shared[0];
        let square_sum = sum_squared_shared[0];
        let mean = ${_t("sum",x)} / f32(uniforms.hidden_size);
        let inv_std_dev = inverseSqrt(${_t("square_sum",x)} / f32(uniforms.hidden_size) ${a?"":"- mean * mean"} + uniforms.epsilon);
        ${y?"mean_output[global_idx] = mean;":""}
        ${_?"inv_std_output[global_idx] = inv_std_dev;":""}

        for (var i: u32 = 0; i < stride; i++) {
          output[offset + i] = (output[offset + i] ${a?"":`- ${v}(mean)`}) *
            ${v}(inv_std_dev) * gamma[offset1d + i]
            ${f?"+ beta[offset1d + i]":""};
        }
      }`},S=[{dims:u,dataType:e[0].dataType}];return r>1&&S.push({dims:h,dataType:1}),r>2&&S.push({dims:h,dataType:1}),r>3&&S.push({dims:n,dataType:e[0].dataType}),{name:"SkipLayerNormalization",shaderCache:{hint:`${x};${y};${_};${w}`,inputDependencies:e.map((I,A)=>"type")},getShaderSource:T,getRunData:()=>({outputs:S,dispatchGroup:{x:Math.ceil(l/p)},programUniforms:b})}},Kh=(e,t)=>{gd(e.inputs);let r=[0];e.outputCount>1&&r.push(-3),e.outputCount>2&&r.push(-3),e.outputCount>3&&r.push(3),e.compute(yd(e.inputs,t,e.outputCount,!1),{outputs:r})}}),_d,ar,bd,fa,wd,$d,Zh,Xh,Py=q(()=>{ie(),ne(),ke(),se(),_d=(e,t)=>{if(!e||e.length<1)throw new Error("too few inputs");if(t.axes.length!==0){if(t.axes.length!==t.starts.length||t.axes.length!==t.ends.length)throw new Error("axes, starts and ends must have the same length")}else if(t.starts.length!==t.ends.length)throw new Error("starts and ends must have the same length");e.slice(1).forEach((r,i)=>{if(e[i+1].dataType!==6&&e[i+1].dataType!==7)throw new Error(`Input ${i} must be an array of int32 or int64`)})},ar=(e,t)=>{let r=[];if(e.length>t)if(e[t].dataType===7)e[t].getBigInt64Array().forEach(i=>r.push(Number(i)));else if(e[t].dataType===6)e[t].getInt32Array().forEach(i=>r.push(Number(i)));else throw new Error(`Input ${t} must be an array of int32 or int64`);return r},bd=(e,t)=>{if(e.length>1){let r=ar(e,1),i=ar(e,2),a=ar(e,3);return a.length===0&&(a=[...Array(e[0].dims.length).keys()]),fe({starts:r,ends:i,axes:a})}else return t},fa=(e,t,r,i,a)=>{let n=e;return e<0&&(n+=r[i[t]]),a[t]<0?Math.max(0,Math.min(n,r[i[t]]-1)):Math.max(0,Math.min(n,r[i[t]]))},wd=(e,t,r)=>`fn calculateInputIndices(output_indices: ${t.type.indices}) -> ${e.type.indices} {
          var input_indices: ${e.type.indices};
          var carry = 0u;
          for (var i = ${r.length-1}; i >= 0; i--) {
            let input_shape_i = ${Y("uniforms.input_shape","i",r.length)};
            let steps_i = ${Y("uniforms.steps","i",r.length)};
            let signs_i = ${Y("uniforms.signs","i",r.length)};
            let starts_i = ${Y("uniforms.starts","i",r.length)};
            var output_index = ${t.indicesGet("output_indices","i")};
            var input_index = output_index * steps_i + starts_i + carry;
            carry = input_index / input_shape_i;
            input_index = input_index % input_shape_i;
            if (signs_i < 0) {
              input_index = input_shape_i - input_index - 1u + starts_i;
            }
            ${e.indicesSet("input_indices","i","input_index")};
          }
          return input_indices;
      }`,$d=(e,t)=>{let r=e[0].dims,i=M.size(r),a=t.axes.length>0?M.normalizeAxes(t.axes,r.length):[...Array(r.length).keys()],n=ar(e,4);n.forEach(x=>x!==0||(()=>{throw new Error("step cannot be 0")})),n.length===0&&(n=Array(a.length).fill(1));let s=t.starts.map((x,b)=>fa(x,b,r,a,n)),u=t.ends.map((x,b)=>fa(x,b,r,a,n));if(a.length!==s.length||a.length!==u.length)throw new Error("start, ends and axes should have the same number of elements");if(a.length!==r.length)for(let x=0;x<r.length;++x)a.includes(x)||(s.splice(x,0,0),u.splice(x,0,r[x]),n.splice(x,0,1));let l=n.map(x=>Math.sign(x));n.forEach((x,b,T)=>{if(x<0){let S=(u[b]-s[b])/x,I=s[b],A=I+S*n[b];s[b]=A,u[b]=I,T[b]=-x}});let p=r.slice(0);a.forEach((x,b)=>{p[x]=Math.ceil((u[x]-s[x])/n[x])});let h={dims:p,dataType:e[0].dataType},f=Q("output",e[0].dataType,p.length),g=D("input",e[0].dataType,e[0].dims.length),y=M.size(p),_=[{name:"outputSize",type:"u32"},{name:"starts",type:"u32",length:s.length},{name:"signs",type:"i32",length:l.length},{name:"steps",type:"u32",length:n.length}],w=[{type:12,data:y},{type:12,data:s},{type:6,data:l},{type:12,data:n},...J(e[0].dims,p)],k=x=>`
      ${x.registerUniforms(_).declareVariables(g,f)}
        ${wd(g,f,r)}
        ${x.mainStart()}
          ${x.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
          let output_indices = ${f.offsetToIndices("global_idx")};
          let input_indices = calculateInputIndices(output_indices);
          ${f.setByOffset("global_idx",g.getByIndices("input_indices"))}
      }`;return{name:"Slice",shaderCache:{hint:`${l.length}_${s.length}_${n.length}`,inputDependencies:["rank"]},getShaderSource:k,getRunData:()=>({outputs:[h],dispatchGroup:{x:Math.ceil(i/64)},programUniforms:w})}},Zh=(e,t)=>{_d(e.inputs,t);let r=bd(e.inputs,t);e.compute($d(e.inputs,r),{inputs:[0]})},Xh=e=>{let t=e.starts,r=e.ends,i=e.axes;return fe({starts:t,ends:r,axes:i})}}),vd,xd,Qh,Yh,Uy=q(()=>{ie(),ne(),ke(),bt(),se(),vd=e=>{if(!e||e.length!==1)throw new Error("Softmax op requires 1 input.")},xd=(e,t)=>{let r=e.inputs[0],i=r.dims,a=M.size(i),n=i.length,s=M.normalizeAxis(t.axis,n),u=s<i.length-1,l,p=[];u?(p=Array.from({length:n},(z,v)=>v),p[s]=n-1,p[n-1]=s,l=e.compute(Ue(r,p),{inputs:[r],outputs:[-1]})[0]):l=r;let h=l.dims,f=h[n-1],g=a/f,y=Se(f),_=f/y,w=64;g===1&&(w=256);let k=(z,v)=>v===4?`max(max(${z}.x, ${z}.y), max(${z}.z, ${z}.w))`:v===2?`max(${z}.x, ${z}.y)`:v===3?`max(max(${z}.x, ${z}.y), ${z}.z)`:z,x=D("x",l.dataType,l.dims,y),b=Q("result",l.dataType,l.dims,y),T=x.type.value,S=ze(l.dataType)==="f32"?`var threadMax = ${T}(-3.4028234663852886e+38f);`:`var threadMax = ${T}(-65504.0h);`,I=z=>`
      var<workgroup> rowMaxShared : ${T};
      var<workgroup> rowSumShared : ${T};
      var<workgroup> threadShared : array<${T}, ${w}>;

      fn getValue(row: i32, col: i32, row_stride: i32) -> ${T} {
        let index = row * row_stride + col;
        return x[index];
      }

      fn setValue(row: i32, col: i32, row_stride: i32, value: ${T}) {
        let index = row * row_stride + col;
        result[index] = value;
      }
      ${z.registerUniform("packedCols","i32").declareVariables(x,b)}
      ${z.mainStart(w)}
        let gindex = i32(global_idx);
        let lindex = i32(local_idx);
        const wg = ${w};
        let row = gindex / wg;
        let cols = uniforms.packedCols;
        let row_stride : i32 = uniforms.packedCols;

        // find the rows max
        ${S}
        for (var col = lindex; col < cols; col += wg) {
          let value = getValue(row, col, row_stride);
          threadMax = max(threadMax, value);
        }
        if (lindex < cols) {
          threadShared[lindex] = threadMax;
        }
        workgroupBarrier();

        var reduceSize = min(cols, wg);
        for (var currSize = reduceSize >> 1;  currSize > 0; currSize = reduceSize >> 1) {
          reduceSize = currSize + (reduceSize & 1);
          if (lindex < currSize) {
            threadShared[lindex] = max(threadShared[lindex], threadShared[lindex + reduceSize]);
          }
          workgroupBarrier();
        }
        if (lindex == 0) {
          rowMaxShared = ${T}(${k("threadShared[0]",y)});
        }
        workgroupBarrier();

        // find the rows sum
        var threadSum = ${T}(0.0);
        for (var col = lindex; col < cols; col += wg) {
          let subExp = exp(getValue(row, col, row_stride) - rowMaxShared);
          threadSum += subExp;
        }
        threadShared[lindex] = threadSum;
        workgroupBarrier();

        for (var currSize = wg >> 1;  currSize > 0; currSize = currSize >> 1) {
          if (lindex < currSize) {
            threadShared[lindex] = threadShared[lindex] + threadShared[lindex + currSize];
          }
          workgroupBarrier();
        }
        if (lindex == 0) {
          rowSumShared = ${T}(${_t("threadShared[0]",y)});
        }
        workgroupBarrier();

        // calculate final value for each element in the row
        for (var col = lindex; col < cols; col += wg) {
          var value = exp(getValue(row, col, row_stride) - rowMaxShared) / rowSumShared;
          // max operation protects against NaN since all values should be >=0
          value = max(value, ${T}(0.0));
          setValue(row, col, row_stride, value);
        }
      }`,A=e.compute({name:"Softmax",shaderCache:{hint:`${y};${w}`,inputDependencies:["type"]},getRunData:()=>({outputs:[{dims:h,dataType:l.dataType}],dispatchGroup:{x:g},programUniforms:[{type:6,data:_}]}),getShaderSource:I},{inputs:[l],outputs:[u?-1:0]})[0];u&&e.compute(Ue(A,p),{inputs:[A]})},Qh=(e,t)=>{vd(e.inputs),xd(e,t)},Yh=e=>fe({axis:e.axis})}),ma,Sd,kd,Td,Jh,Wy=q(()=>{ie(),ne(),se(),ma=e=>Array.from(e.getBigInt64Array(),Number),Sd=e=>{if(!e||e.length!==2)throw new Error("Tile requires 2 inputs.");if(e[0].dataType!==1&&e[0].dataType!==10&&e[0].dataType!==6&&e[0].dataType!==12)throw new Error("Tile only support float, float16, int32, and uint32 data types");if(e[1].dataType!==7)throw new Error("Tile `repeats` input should be of int64 data type");if(e[1].dims.length!==1)throw new Error("Tile `repeats` input should be 1-D");if(ma(e[1]).length!==e[0].dims.length)throw new Error("Tile `repeats` input should have same number of elements as rank of input data tensor")},kd=(e,t)=>{let r=[];for(let i=0;i<e.length;++i)r.push(e[i]*t[i]);return r},Td=(e,t)=>{let r=e[0].dims,i=t??ma(e[1]),a=kd(r,i),n=M.size(a),s=e[0].dataType,u=D("input",s,r.length),l=Q("output",s,a.length),p=h=>`
      const inputShape = ${u.indices(...r)};
      ${h.registerUniform("output_size","u32").declareVariables(u,l)}
      ${h.mainStart()}
      ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let output_indices = ${l.offsetToIndices("global_idx")};
      var input_indices: ${u.type.indices};
      for (var i = 0; i < ${r.length}; i++) {
        let input_dim_i = ${u.indicesGet("uniforms.input_shape","i")};
        let input_dim_value = ${l.indicesGet("output_indices","i")}  % input_dim_i;

        ${u.indicesSet("input_indices","i","input_dim_value")}
      }
      ${l.setByOffset("global_idx",u.getByIndices("input_indices"))}
    }`;return{name:"Tile",shaderCache:{hint:`${i}`,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:a,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(n/64)},programUniforms:[{type:12,data:n},...J(e[0].dims,a)]}),getShaderSource:p}},Jh=e=>{Sd(e.inputs),e.compute(Td(e.inputs),{inputs:[0]})}}),Ed,Id,ef,qy=q(()=>{ie(),ne(),se(),Ed=(e,t,r,i,a)=>{let n=Q("output_data",a,r.length,4),s=D("a_data",t[1].dataType,t[1].dims.length,4),u=D("b_data",t[2].dataType,t[2].dims.length,4),l=D("c_data",t[0].dataType,t[0].dims.length,4),p,h=(f,g,y)=>`select(${g}, ${f}, ${y})`;if(!i)p=n.setByOffset("global_idx",h(s.getByOffset("global_idx"),u.getByOffset("global_idx"),l.getByOffset("global_idx")));else{let f=(g,y,_="")=>{let w=`a_data[index_a${y}][component_a${y}]`,k=`b_data[index_b${y}][component_b${y}]`,x=`bool(c_data[index_c${y}] & (0xffu << (component_c${y} * 8)))`;return`
            let output_indices${y} = ${n.offsetToIndices(`global_idx * 4u + ${y}u`)};
            let offset_a${y} = ${s.broadcastedIndicesToOffset(`output_indices${y}`,n)};
            let offset_b${y} = ${u.broadcastedIndicesToOffset(`output_indices${y}`,n)};
            let offset_c${y} = ${l.broadcastedIndicesToOffset(`output_indices${y}`,n)};
            let index_a${y} = offset_a${y} / 4u;
            let index_b${y} = offset_b${y} / 4u;
            let index_c${y} = offset_c${y} / 4u;
            let component_a${y} = offset_a${y} % 4u;
            let component_b${y} = offset_b${y} % 4u;
            let component_c${y} = offset_c${y} % 4u;
            ${g}[${y}] = ${_}(${h(w,k,x)});
          `};a===9?p=`
            var data = vec4<u32>(0);
            ${f("data",0,"u32")}
            ${f("data",1,"u32")}
            ${f("data",2,"u32")}
            ${f("data",3,"u32")}
            output_data[global_idx] = dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(data));`:p=`
            ${f("output_data[global_idx]",0)}
            ${f("output_data[global_idx]",1)}
            ${f("output_data[global_idx]",2)}
            ${f("output_data[global_idx]",3)}
          `}return`
        ${e.registerUniform("vec_size","u32").declareVariables(l,s,u,n)}
        ${e.mainStart()}
        ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
        ${p}
      }`},Id=e=>{let t=e[1].dims,r=e[2].dims,i=e[0].dims,a=e[1].dataType,n=!(M.areEqual(t,r)&&M.areEqual(r,i)),s=t,u=M.size(t);if(n){let p=Vt.calcShape(Vt.calcShape(t,r,!1),i,!1);if(!p)throw new Error("Can't perform where op on the given tensors");s=p,u=M.size(s)}let l=Math.ceil(u/4);return{name:"Where",shaderCache:{inputDependencies:["rank","rank","rank"]},getShaderSource:p=>Ed(p,e,s,n,a),getRunData:()=>({outputs:[{dims:s,dataType:a}],dispatchGroup:{x:Math.ceil(u/64/4)},programUniforms:[{type:12,data:l},...J(i,t,r,s)]})}},ef=e=>{e.compute(Id(e.inputs))}}),tf,Ly=q(()=>{ry(),Xa(),iy(),ay(),ny(),sy(),oy(),cy(),fy(),my(),gy(),yy(),_y(),by(),wy(),$y(),vy(),xy(),Sy(),ky(),Ty(),Ey(),Iy(),zy(),Cy(),wh(),Ay(),Oy(),My(),Ry(),By(),Za(),Dy(),kh(),Ny(),Py(),Uy(),xh(),Wy(),bt(),Qa(),qy(),tf=new Map([["Abs",[Kp]],["Acos",[Zp]],["Acosh",[Xp]],["Add",[Cc]],["ArgMax",[Vp,Ta]],["ArgMin",[Gp,Ta]],["Asin",[Qp]],["Asinh",[Yp]],["Atan",[Jp]],["Atanh",[ec]],["Attention",[Hp]],["AveragePool",[Rh,Mh]],["BatchNormalization",[Fp]],["BiasAdd",[jp]],["BiasSplitGelu",[zc]],["Cast",[rc,tc]],["Ceil",[ac]],["Clip",[ic]],["Concat",[Wc,qc]],["Conv",[Oa,Aa]],["ConvTranspose",[Qc,Xc]],["Cos",[nc]],["Cosh",[sc]],["CumSum",[Yc,Jc]],["DepthToSpace",[eh,th]],["DequantizeLinear",[qh,Lh]],["Div",[Ac]],["Einsum",[rh,ih]],["Elu",[oc,lr]],["Equal",[Oc]],["Erf",[uc]],["Exp",[lc]],["Expand",[ah]],["FastGelu",[nh]],["Floor",[dc]],["FusedConv",[Oa,Aa]],["Gather",[oh,sh]],["GatherElements",[hh,ch]],["GatherBlockQuantized",[dh,ph]],["GatherND",[uh,lh]],["Gelu",[pc]],["Gemm",[mh,fh]],["GlobalAveragePool",[Dh,Bh]],["GlobalMaxPool",[Wh,Uh]],["Greater",[Dc]],["GreaterOrEqual",[Pc]],["GridSample",[gh,yh]],["GroupQueryAttention",[Th]],["HardSigmoid",[bc,_c]],["InstanceNormalization",[Eh]],["LayerNormalization",[Ih]],["LeakyRelu",[cc,lr]],["Less",[Nc]],["LessOrEqual",[Uc]],["Log",[Ec]],["MatMul",[zh]],["MatMulNBits",[Ch,Ah]],["MaxPool",[Nh,Ph]],["Mul",[Mc]],["MultiHeadAttention",[bh,_h]],["Neg",[fc]],["Not",[hc]],["Pad",[Oh]],["Pow",[Rc]],["QuickGelu",[Ic,lr]],["Range",[Gh]],["Reciprocal",[mc]],["ReduceMin",[Pp]],["ReduceMean",[Mp]],["ReduceMax",[Np]],["ReduceSum",[Wp]],["ReduceProd",[Up]],["ReduceL1",[Rp]],["ReduceL2",[Bp]],["ReduceLogSum",[Lp]],["ReduceLogSumExp",[Dp]],["ReduceSumSquare",[qp]],["Relu",[gc]],["Resize",[Fh,jh]],["RotaryEmbedding",[Sh]],["ScatterND",[Hh,Vh]],["Sigmoid",[yc]],["Sin",[wc]],["Sinh",[$c]],["Slice",[Zh,Xh]],["SkipLayerNormalization",[Kh]],["Split",[$h,vh]],["Sqrt",[vc]],["Softmax",[Qh,Yh]],["Sub",[Bc]],["Tan",[xc]],["Tanh",[Sc]],["ThresholdedRelu",[Tc,lr]],["Tile",[Jh]],["Transpose",[$p,vp]],["Where",[ef]]])}),rf,Gy=q(()=>{Le(),ut(),se(),rf=class{constructor(e){this.backend=e,this.repo=new Map,this.attributesBound=!1}getArtifact(e){return this.repo.get(e)}setArtifact(e,t){this.repo.set(e,t)}run(e,t,r,i,a){it(e.programInfo.name);let n=this.backend.device,s=this.backend.getComputePassEncoder();this.backend.writeTimestamp(this.backend.pendingDispatchNumber*2);let u=[];for(let p of t)u.push({binding:u.length,resource:{buffer:p.buffer}});for(let p of r)u.push({binding:u.length,resource:{buffer:p.buffer}});a&&u.push({binding:u.length,resource:a});let l=n.createBindGroup({layout:e.computePipeline.getBindGroupLayout(0),entries:u,label:e.programInfo.name});if(this.backend.sessionStatus==="capturing"){let p={kernelId:this.backend.currentKernelId,computePipeline:e.computePipeline,bindGroup:l,dispatchGroup:i};this.backend.capturedCommandList.get(this.backend.currentSessionId).push(p)}s.setPipeline(e.computePipeline),s.setBindGroup(0,l),s.dispatchWorkgroups(...i),this.backend.writeTimestamp(this.backend.pendingDispatchNumber*2+1),this.backend.pendingDispatchNumber++,(this.backend.pendingDispatchNumber>=this.backend.maxDispatchNumber||this.backend.queryType==="at-passes")&&this.backend.endComputePass(),this.backend.pendingDispatchNumber>=this.backend.maxDispatchNumber&&this.backend.flush(),Xe(e.programInfo.name)}dispose(){}build(e,t){it(e.name);let r=this.backend.device,i=[];[{feature:"shader-f16",extension:"f16"},{feature:"subgroups",extension:"subgroups"}].forEach(p=>{r.features.has(p.feature)&&i.push(`enable ${p.extension};`)});let a=wp(t,this.backend.device.limits),n=e.getShaderSource(a),s=`${i.join(`
`)}
${a.additionalImplementations}
${n}`,u=r.createShaderModule({code:s,label:e.name});pe("verbose",()=>`[WebGPU] ${e.name} shader code: ${s}`);let l=r.createComputePipeline({compute:{module:u,entryPoint:"main"},layout:"auto",label:e.name});return Xe(e.name),{programInfo:e,computePipeline:l,uniformVariablesInfo:a.variablesInfo}}normalizeDispatchGroupSize(e){let t=typeof e=="number"?e:e.x,r=typeof e=="number"?1:e.y||1,i=typeof e=="number"?1:e.z||1,a=this.backend.device.limits.maxComputeWorkgroupsPerDimension;if(t<=a&&r<=a&&i<=a)return[t,r,i];let n=t*r*i,s=Math.ceil(Math.sqrt(n));if(s>a){if(s=Math.ceil(Math.cbrt(n)),s>a)throw new Error("Total dispatch size exceeds WebGPU maximum.");return[s,s,s]}else return[s,s,1]}}}),af={};Ft(af,{WebGpuBackend:()=>nf});var zd,Cd,Ad,nf,Vy=q(()=>{Le(),ie(),ut(),mp(),ey(),Ly(),Gy(),zd=(e,t)=>{if(t.length!==e.length)throw new Error(`inputDependencies length ${t.length} is not equal to inputTensors length ${e.length}.`);let r=[];for(let i=0;i<e.length;++i){let a=e[i].dataType;switch(t[i]){case"none":{r.push("");break}case"type":{r.push(`${a}`);break}case"rank":{let n=e[i].dims.length;r.push(`${a};${n}`);break}case"dims":{let n=e[i].dims.join(",");r.push(`${a};${n}`);break}default:throw new Error(`unsupported input dependency: ${t[i]}`)}}return r.join("|")},Cd=(e,t,r)=>{let i=e.name;return e.shaderCache?.hint&&(i+="["+e.shaderCache.hint+"]"),i+=":"+r+`:${zd(t,e.shaderCache?.inputDependencies??new Array(t.length).fill("dims"))}`,i},Ad=class{constructor(e){e&&(this.architecture=e.architecture,this.vendor=e.vendor)}isArchitecture(e){return this.architecture===e}isVendor(e){return this.vendor===e}},nf=class{constructor(){this.currentSessionId=null,this.currentKernelId=null,this.commandEncoder=null,this.computePassEncoder=null,this.maxDispatchNumber=16,this.pendingDispatchNumber=0,this.pendingKernels=[],this.pendingQueries=new Map,this.sessionStatus="default",this.capturedCommandList=new Map,this.capturedPendingKernels=new Map,this.sessionExternalDataMapping=new Map}get currentKernelCustomData(){if(this.currentKernelId===null)throw new Error("currentKernelCustomData(): currentKernelId is null. (should not happen)");let e=this.kernelCustomData.get(this.currentKernelId);return e||(e={},this.kernelCustomData.set(this.currentKernelId,e)),e}async initialize(e,t){this.env=e;let r=[],i={requiredLimits:{maxComputeWorkgroupStorageSize:t.limits.maxComputeWorkgroupStorageSize,maxComputeWorkgroupsPerDimension:t.limits.maxComputeWorkgroupsPerDimension,maxStorageBufferBindingSize:t.limits.maxStorageBufferBindingSize,maxBufferSize:t.limits.maxBufferSize,maxComputeInvocationsPerWorkgroup:t.limits.maxComputeInvocationsPerWorkgroup,maxComputeWorkgroupSizeX:t.limits.maxComputeWorkgroupSizeX,maxComputeWorkgroupSizeY:t.limits.maxComputeWorkgroupSizeY,maxComputeWorkgroupSizeZ:t.limits.maxComputeWorkgroupSizeZ},requiredFeatures:r},a=n=>t.features.has(n)&&r.push(n)&&!0;a("chromium-experimental-timestamp-query-inside-passes")||a("timestamp-query"),a("shader-f16"),a("subgroups"),this.device=await t.requestDevice(i),this.adapterInfo=new Ad(t.info||await t.requestAdapterInfo()),this.gpuDataManager=_p(this),this.programManager=new rf(this),this.kernels=new Map,this.kernelPersistentData=new Map,this.kernelCustomData=new Map,Ha(e.logLevel,!!e.debug),this.device.onuncapturederror=n=>{n.error instanceof GPUValidationError&&console.error(`An uncaught WebGPU validation error was raised: ${n.error.message}`)},Object.defineProperty(this.env.webgpu,"device",{value:this.device,writable:!1,enumerable:!0,configurable:!0}),Object.defineProperty(this.env.webgpu,"adapter",{value:t,writable:!1,enumerable:!0,configurable:!1}),this.setQueryType()}dispose(){typeof this.querySet<"u"&&this.querySet.destroy(),this.gpuDataManager.dispose(),this.device&&this.env?.webgpu&&this.device.lost.then(()=>{delete this.env.webgpu.device})}getCommandEncoder(){return this.commandEncoder||(this.commandEncoder=this.device.createCommandEncoder()),this.commandEncoder}getComputePassEncoder(){if(!this.computePassEncoder){let e=this.getCommandEncoder(),t={};this.queryType==="at-passes"&&(t.timestampWrites={querySet:this.querySet,beginningOfPassWriteIndex:this.pendingDispatchNumber*2,endOfPassWriteIndex:this.pendingDispatchNumber*2+1}),this.computePassEncoder=e.beginComputePass(t)}return this.computePassEncoder}endComputePass(){this.computePassEncoder&&(this.computePassEncoder.end(),this.computePassEncoder=null)}flush(){if(!this.commandEncoder)return;it(),this.endComputePass();let e;this.queryType!=="none"&&(this.commandEncoder.resolveQuerySet(this.querySet,0,this.pendingDispatchNumber*2,this.queryResolveBuffer,0),e=this.device.createBuffer({size:this.pendingDispatchNumber*2*8,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),this.pendingQueries.set(e,this.pendingKernels),this.pendingKernels=[],this.commandEncoder.copyBufferToBuffer(this.queryResolveBuffer,0,e,0,this.pendingDispatchNumber*2*8)),this.device.queue.submit([this.commandEncoder.finish()]),this.gpuDataManager.refreshPendingBuffers(),this.commandEncoder=null,this.pendingDispatchNumber=0,this.queryType!=="none"&&e.mapAsync(GPUMapMode.READ).then(()=>{let t=new BigUint64Array(e.getMappedRange()),r=this.pendingQueries.get(e);for(let i=0;i<t.length/2;i++){let a=r[i],n=a.kernelId,s=this.kernels.get(n),u=s.kernelType,l=s.kernelName,p=a.programName,h=a.inputTensorViews,f=a.outputTensorViews,g=t[i*2],y=t[i*2+1];typeof this.queryTimeBase>"u"&&(this.queryTimeBase=g);let _=Number(g-this.queryTimeBase),w=Number(y-this.queryTimeBase);if(!Number.isSafeInteger(_)||!Number.isSafeInteger(w))throw new RangeError("incorrect timestamp range");if(this.env.webgpu.profiling?.ondata)this.env.webgpu.profiling.ondata({version:1,inputsMetadata:h.map(k=>({dims:k.dims,dataType:ot(k.dataType)})),outputsMetadata:f.map(k=>({dims:k.dims,dataType:ot(k.dataType)})),kernelId:n,kernelType:u,kernelName:l,programName:p,startTime:_,endTime:w});else{let k="";h.forEach((b,T)=>{k+=`input[${T}]: [${b.dims}] | ${ot(b.dataType)}, `});let x="";f.forEach((b,T)=>{x+=`output[${T}]: [${b.dims}] | ${ot(b.dataType)}, `}),console.log(`[profiling] kernel "${n}|${u}|${l}|${p}" ${k}${x}start time: ${_} ns, execution time: ${w-_} ns`)}Gr("GPU",`${p}::${g}::${y}`)}e.unmap(),this.pendingQueries.delete(e)}),Xe()}run(e,t,r,i,a,n){it(e.name);let s=[];for(let b=0;b<t.length;++b){let T=t[b].data;if(T===0)continue;let S=this.gpuDataManager.get(T);if(!S)throw new Error(`no GPU data for input: ${T}`);s.push(S)}let{outputs:u,dispatchGroup:l,programUniforms:p}=e.getRunData(t),h=r.length===0?u.map((b,T)=>T):r;if(h.length!==u.length)throw new Error(`Output size ${h.length} must be equal to ${u.length}.`);let f=[],g=[];for(let b=0;b<u.length;++b){if(!Number.isInteger(h[b])||h[b]<-3||h[b]>=n)throw new Error(`Invalid output index: ${h[b]}`);if(h[b]===-3)continue;let T=h[b]===-1,S=h[b]===-2,I=T||S?a(u[b].dataType,u[b].dims):i(h[b],u[b].dataType,u[b].dims);if(f.push(I),I.data===0)continue;let A=this.gpuDataManager.get(I.data);if(!A)throw new Error(`no GPU data for output: ${I.data}`);if(T&&this.temporaryData.push(A),S){let z=this.kernelPersistentData.get(this.currentKernelId);z||(z=[],this.kernelPersistentData.set(this.currentKernelId,z)),z.push(A)}g.push(A)}if(s.length!==t.length||g.length!==f.length){if(g.length===0)return Xe(e.name),f;throw new Error(`Program ${e.name} has zero-sized tensor(s) in inputs or outputs. This is not supported now.`)}let y;if(p){let b=0,T=[];p.forEach(z=>{let v=typeof z.data=="number"?[z.data]:z.data;if(v.length===0)return;let N=z.type===10?2:4,U,Z;z.type===10?(Z=v.length>4?16:v.length>2?8:v.length*N,U=v.length>4?16:N*v.length):(Z=v.length<=2?v.length*N:16,U=16),b=Math.ceil(b/Z)*Z,T.push(b);let G=z.type===10?8:4;b+=v.length>4?Math.ceil(v.length/G)*U:v.length*N});let S=16;b=Math.ceil(b/S)*S;let I=new ArrayBuffer(b);p.forEach((z,v)=>{let N=T[v],U=typeof z.data=="number"?[z.data]:z.data;if(z.type===6)new Int32Array(I,N,U.length).set(U);else if(z.type===12)new Uint32Array(I,N,U.length).set(U);else if(z.type===10)new Uint16Array(I,N,U.length).set(U);else if(z.type===1)new Float32Array(I,N,U.length).set(U);else throw new Error(`Unsupported uniform type: ${ot(z.type)}`)});let A=this.gpuDataManager.create(b,GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM);this.device.queue.writeBuffer(A.buffer,0,I,0,b),this.gpuDataManager.release(A.id),y={offset:0,size:b,buffer:A.buffer}}let _=this.programManager.normalizeDispatchGroupSize(l),w=_[1]===1&&_[2]===1,k=Cd(e,t,w),x=this.programManager.getArtifact(k);if(x||(x=this.programManager.build(e,_),this.programManager.setArtifact(k,x),pe("info",()=>`[artifact] key: ${k}, programName: ${e.name}`)),p&&x.uniformVariablesInfo){if(p.length!==x.uniformVariablesInfo.length)throw new Error(`Uniform variables count mismatch: expect ${x.uniformVariablesInfo.length}, got ${p.length} in program "${x.programInfo.name}".`);for(let b=0;b<p.length;b++){let T=p[b],S=T.type,I=typeof T.data=="number"?1:T.data.length,[A,z]=x.uniformVariablesInfo[b];if(S!==A||I!==z)throw new Error(`Uniform variable ${b} mismatch: expect type ${A} with size ${z}, got type ${S} with size ${I} in program "${x.programInfo.name}".`)}}if(pe("info",()=>`[ProgramManager] run "${e.name}" (key=${k}) with ${_[0]}x${_[1]}x${_[2]}`),this.queryType!=="none"||this.sessionStatus==="capturing"){let b={kernelId:this.currentKernelId,programName:x.programInfo.name,inputTensorViews:t,outputTensorViews:f};this.pendingKernels.push(b),this.sessionStatus==="capturing"&&this.capturedPendingKernels.get(this.currentSessionId).push(b)}return this.programManager.run(x,s,g,_,y),Xe(e.name),f}upload(e,t){this.gpuDataManager.upload(e,t)}memcpy(e,t){this.gpuDataManager.memcpy(e,t)}async download(e,t){await this.gpuDataManager.download(e,t)}alloc(e){return this.gpuDataManager.create(e).id}free(e){return this.gpuDataManager.release(e)}createKernel(e,t,r,i){let a=tf.get(e);if(!a)throw new Error(`kernel not implemented: ${e}`);let n={kernelType:e,kernelName:i,kernelEntry:a[0],attributes:[a[1],r]};this.kernels.set(t,n)}releaseKernel(e){let t=this.kernelPersistentData.get(e);if(t){for(let r of t)this.gpuDataManager.release(r.id);this.kernelPersistentData.delete(e)}this.kernelCustomData.delete(e),this.kernels.delete(e)}computeKernel(e,t,r){let i=this.kernels.get(e);if(!i)throw new Error(`kernel not created: ${e}`);let a=i.kernelType,n=i.kernelName,s=i.kernelEntry,u=i.attributes;if(this.currentKernelId!==null)throw new Error(`kernel "[${a}] ${n}" is not allowed to be called recursively`);this.currentKernelId=e,u[0]&&(u[1]=u[0](u[1]),u[0]=void 0),pe("info",()=>`[WebGPU] Start to run kernel "[${a}] ${n}"...`);let l=this.env.debug;this.temporaryData=[];try{return l&&this.device.pushErrorScope("validation"),s(t,u[1]),0}catch(p){return r.push(Promise.resolve(`[WebGPU] Kernel "[${a}] ${n}" failed. ${p}`)),1}finally{l&&r.push(this.device.popErrorScope().then(p=>p?`GPU validation error for kernel "[${a}] ${n}": ${p.message}`:null));for(let p of this.temporaryData)this.gpuDataManager.release(p.id);this.temporaryData=[],this.currentKernelId=null}}registerBuffer(e,t,r,i){let a=this.sessionExternalDataMapping.get(e);a||(a=new Map,this.sessionExternalDataMapping.set(e,a));let n=a.get(t),s=this.gpuDataManager.registerExternalBuffer(r,i,n);return a.set(t,[s,r]),s}unregisterBuffers(e){let t=this.sessionExternalDataMapping.get(e);t&&(t.forEach(r=>this.gpuDataManager.unregisterExternalBuffer(r[0])),this.sessionExternalDataMapping.delete(e))}getBuffer(e){let t=this.gpuDataManager.get(e);if(!t)throw new Error(`no GPU data for buffer: ${e}`);return t.buffer}createDownloader(e,t,r){return async()=>{let i=await xa(this,e,t);return Fa(i.buffer,r)}}writeTimestamp(e){this.queryType==="inside-passes"&&this.computePassEncoder.writeTimestamp(this.querySet,e)}setQueryType(){this.queryType="none",(this.env.webgpu.profiling?.mode==="default"||(typeof this.env.trace>"u"?this.env.wasm.trace:this.env.trace))&&(this.device.features.has("chromium-experimental-timestamp-query-inside-passes")?this.queryType="inside-passes":this.device.features.has("timestamp-query")&&(this.queryType="at-passes"),this.queryType!=="none"&&typeof this.querySet>"u"&&(this.querySet=this.device.createQuerySet({type:"timestamp",count:this.maxDispatchNumber*2}),this.queryResolveBuffer=this.device.createBuffer({size:this.maxDispatchNumber*2*8,usage:GPUBufferUsage.COPY_SRC|GPUBufferUsage.QUERY_RESOLVE})))}captureBegin(){pe("info","captureBegin"),this.capturedCommandList.get(this.currentSessionId)||this.capturedCommandList.set(this.currentSessionId,[]),this.capturedPendingKernels.get(this.currentSessionId)||this.capturedPendingKernels.set(this.currentSessionId,[]),this.flush(),this.sessionStatus="capturing"}captureEnd(){pe("info","captureEnd"),this.flush(),this.sessionStatus="default"}replay(){pe("info","replay"),this.sessionStatus="replaying";let e=this.capturedCommandList.get(this.currentSessionId),t=this.capturedPendingKernels.get(this.currentSessionId),r=e.length;this.pendingKernels=[];for(let i=0;i<r;i++){let a=this.getComputePassEncoder(),n=e[i];this.writeTimestamp(this.pendingDispatchNumber*2),a.setPipeline(n.computePipeline),a.setBindGroup(0,n.bindGroup),a.dispatchWorkgroups(...n.dispatchGroup),this.writeTimestamp(this.pendingDispatchNumber*2+1),this.pendingDispatchNumber++,this.queryType!=="none"&&this.pendingKernels.push(t[i]),(this.pendingDispatchNumber>=this.maxDispatchNumber||this.queryType==="at-passes")&&this.endComputePass(),this.pendingDispatchNumber>=this.maxDispatchNumber&&this.flush()}this.flush(),this.sessionStatus="default"}onCreateSession(){this.gpuDataManager.onCreateSession()}onReleaseSession(e){this.unregisterBuffers(e),this.capturedCommandList.has(e)&&this.capturedCommandList.delete(e),this.capturedPendingKernels.has(e)&&this.capturedPendingKernels.delete(e),this.gpuDataManager.onReleaseSession(e)}onRunStart(e){this.currentSessionId=e,this.setQueryType()}}}),sf={};Ft(sf,{init:()=>of});var Pr,Od,of,Hy=q(()=>{ie(),ut(),ne(),Jg(),Pr=class uf{constructor(t,r,i,a){this.module=t,this.dataType=r,this.data=i,this.dims=a}getFloat32Array(){if(this.dataType!==1)throw new Error("Invalid data type");let t=M.size(this.dims);return t===0?new Float32Array:new Float32Array(this.module.HEAP8.buffer,this.data,t)}getBigInt64Array(){if(this.dataType!==7)throw new Error("Invalid data type");let t=M.size(this.dims);return t===0?new BigInt64Array:new BigInt64Array(this.module.HEAP8.buffer,this.data,t)}getInt32Array(){if(this.dataType!==6)throw new Error("Invalid data type");let t=M.size(this.dims);return t===0?new Int32Array:new Int32Array(this.module.HEAP8.buffer,this.data,t)}getUint16Array(){if(this.dataType!==10&&this.dataType!==4)throw new Error("Invalid data type");let t=M.size(this.dims);return t===0?new Uint16Array:new Uint16Array(this.module.HEAP8.buffer,this.data,t)}reshape(t){if(M.size(t)!==M.size(this.dims))throw new Error("Invalid new shape");return new uf(this.module,this.dataType,this.data,t)}},Od=class{constructor(e,t,r){this.module=e,this.backend=t,this.customDataOffset=0,this.customDataSize=0,this.adapterInfo=t.adapterInfo;let i=e.PTR_SIZE,a=r/e.PTR_SIZE,n=i===4?"i32":"i64";this.opKernelContext=Number(e.getValue(i*a++,n));let s=Number(e.getValue(i*a++,n));this.outputCount=Number(e.getValue(i*a++,n)),this.customDataOffset=Number(e.getValue(i*a++,"*")),this.customDataSize=Number(e.getValue(i*a++,n));let u=[];for(let l=0;l<s;l++){let p=Number(e.getValue(i*a++,n)),h=Number(e.getValue(i*a++,"*")),f=Number(e.getValue(i*a++,n)),g=[];for(let y=0;y<f;y++)g.push(Number(e.getValue(i*a++,n)));u.push(new Pr(e,p,h,g))}this.inputs=u}get kernelCustomData(){return this.backend.currentKernelCustomData}get customDataBuffer(){return this.module.HEAPU8.subarray(this.customDataOffset,this.customDataOffset+this.customDataSize)}compute(e,t){let r=t?.inputs?.map(s=>typeof s=="number"?this.inputs[s]:s)??this.inputs,i=t?.outputs??[],a=(s,u,l)=>new Pr(this.module,u,this.output(s,l),l),n=(s,u)=>{let l=Ct(s,u);if(!l)throw new Error(`Unsupported data type: ${s}`);let p=l>0?this.backend.gpuDataManager.create(l).id:0;return new Pr(this.module,s,p,u)};return this.backend.run(e,r,i,a,n,this.outputCount)}output(e,t){let r=this.module.stackSave();try{let i=this.module.PTR_SIZE,a=i===4?"i32":"i64",n=this.module.stackAlloc((1+t.length)*i);this.module.setValue(n,t.length,a);for(let s=0;s<t.length;s++)this.module.setValue(n+i*(s+1),t[s],a);return this.module._JsepOutput(this.opKernelContext,e,n)}catch(i){throw new Error(`Failed to generate kernel's output[${e}] with dims [${t}]. If you are running with pre-allocated output, please make sure the output type/dims are correct. Error: ${i}`)}finally{this.module.stackRestore(r)}}},of=async(e,t,r,i)=>{let a=t.jsepInit;if(!a)throw new Error("Failed to initialize JSEP. The WebAssembly module is not built with JSEP support.");if(e==="webgpu"){let n=(Vy(),hr(af)).WebGpuBackend,s=new n;await s.initialize(r,i),a("webgpu",[s,u=>s.alloc(Number(u)),u=>s.free(u),(u,l,p,h=!1)=>{if(h)pe("verbose",()=>`[WebGPU] jsepCopyGpuToGpu: src=${Number(u)}, dst=${Number(l)}, size=${Number(p)}`),s.memcpy(Number(u),Number(l));else{pe("verbose",()=>`[WebGPU] jsepCopyCpuToGpu: dataOffset=${Number(u)}, gpuDataId=${Number(l)}, size=${Number(p)}`);let f=t.HEAPU8.subarray(Number(u>>>0),Number(u>>>0)+Number(p));s.upload(Number(l),f)}},async(u,l,p)=>{pe("verbose",()=>`[WebGPU] jsepCopyGpuToCpu: gpuDataId=${u}, dataOffset=${l}, size=${p}`),await s.download(Number(u),()=>t.HEAPU8.subarray(Number(l)>>>0,Number(l+p)>>>0))},(u,l,p)=>s.createKernel(u,Number(l),p,t.UTF8ToString(t._JsepGetNodeName(Number(l)))),u=>s.releaseKernel(u),(u,l,p,h)=>{pe("verbose",()=>`[WebGPU] jsepRun: sessionHandle=${p}, kernel=${u}, contextDataOffset=${l}`);let f=new Od(t,s,Number(l));return s.computeKernel(Number(u),f,h)},()=>s.captureBegin(),()=>s.captureEnd(),()=>s.replay()])}else{let n=new yp(r);a("webnn",[n,()=>n.reserveTensorId(),s=>n.releaseTensorId(s),async(s,u,l,p,h)=>n.ensureTensor(s,u,l,p,h),(s,u)=>{n.uploadTensor(s,u)},async(s,u)=>n.downloadTensor(s,u),(s,u)=>n.registerMLContext(s,u),!!r.trace])}}}),Md,an,nn,mt,Rd,ga,Qr,sn,on,ya,un,ln,dn,lf=q(()=>{Le(),Xg(),Qg(),ie(),Nt(),qa(),pp(),Md=(e,t)=>{be()._OrtInit(e,t)!==0&&me("Can't initialize onnxruntime.")},an=async e=>{Md(e.wasm.numThreads,Fr(e.logLevel))},nn=async(e,t)=>{be().asyncInit?.();let r=e.webgpu.adapter;if(t==="webgpu"){if(typeof navigator>"u"||!navigator.gpu)throw new Error("WebGPU is not supported in current environment");if(r){if(typeof r.limits!="object"||typeof r.features!="object"||typeof r.requestDevice!="function")throw new Error("Invalid GPU adapter set in `env.webgpu.adapter`. It must be a GPUAdapter object.")}else{let i=e.webgpu.powerPreference;if(i!==void 0&&i!=="low-power"&&i!=="high-performance")throw new Error(`Invalid powerPreference setting: "${i}"`);let a=e.webgpu.forceFallbackAdapter;if(a!==void 0&&typeof a!="boolean")throw new Error(`Invalid forceFallbackAdapter setting: "${a}"`);if(r=await navigator.gpu.requestAdapter({powerPreference:i,forceFallbackAdapter:a}),!r)throw new Error('Failed to get GPU adapter. You may need to enable flag "--enable-unsafe-webgpu" if you are using Chrome.')}}if(t==="webnn"&&(typeof navigator>"u"||!navigator.ml))throw new Error("WebNN is not supported in current environment");{let i=(Hy(),hr(sf)).init;t==="webgpu"&&await i("webgpu",be(),e,r),t==="webnn"&&await i("webnn",be(),e)}},mt=new Map,Rd=e=>{let t=be(),r=t.stackSave();try{let i=t.PTR_SIZE,a=t.stackAlloc(2*i);t._OrtGetInputOutputCount(e,a,a+i)!==0&&me("Can't get session input/output count.");let n=i===4?"i32":"i64";return[Number(t.getValue(a,n)),Number(t.getValue(a+i,n))]}finally{t.stackRestore(r)}},ga=(e,t)=>{let r=be(),i=r.stackSave(),a=0;try{let n=r.PTR_SIZE,s=r.stackAlloc(2*n);r._OrtGetInputOutputMetadata(e,t,s,s+n)!==0&&me("Can't get session input/output metadata.");let u=Number(r.getValue(s,"*"));a=Number(r.getValue(s+n,"*"));let l=r.HEAP32[a/4];if(l===0)return[u,0];let p=r.HEAPU32[a/4+1],h=[];for(let f=0;f<p;f++){let g=Number(r.getValue(a+8+f*n,"*"));h.push(g!==0?r.UTF8ToString(g):Number(r.getValue(a+8+(f+p)*n,"*")))}return[u,l,h]}finally{r.stackRestore(i),a!==0&&r._OrtFree(a)}},Qr=e=>{let t=be(),r=t._malloc(e.byteLength);if(r===0)throw new Error(`Can't create a session. failed to allocate a buffer of size ${e.byteLength}.`);return t.HEAPU8.set(e,r),[r,e.byteLength]},sn=async(e,t)=>{let r,i,a=be();Array.isArray(e)?[r,i]=e:e.buffer===a.HEAPU8.buffer?[r,i]=[e.byteOffset,e.byteLength]:[r,i]=Qr(e);let n=0,s=0,u=0,l=[],p=[],h=[];try{if([s,l]=await dp(t),t?.externalData&&a.mountExternalData){let S=[];for(let I of t.externalData){let A=typeof I=="string"?I:I.path;S.push(Va(typeof I=="string"?I:I.data).then(z=>{a.mountExternalData(A,z)}))}await Promise.all(S)}for(let S of t?.executionProviders??[])if((typeof S=="string"?S:S.name)==="webnn"){if(a.shouldTransferToMLTensor=!1,typeof S!="string"){let I=S,A=I?.context,z=I?.gpuDevice,v=I?.deviceType,N=I?.powerPreference;A?a.currentContext=A:z?a.currentContext=await a.webnnCreateMLContext(z):a.currentContext=await a.webnnCreateMLContext({deviceType:v,powerPreference:N})}else a.currentContext=await a.webnnCreateMLContext();break}n=await a._OrtCreateSession(r,i,s),a.webgpuOnCreateSession?.(n),n===0&&me("Can't create a session."),a.jsepOnCreateSession?.(),a.currentContext&&(a.webnnRegisterMLContext(n,a.currentContext),a.currentContext=void 0,a.shouldTransferToMLTensor=!0);let[f,g]=Rd(n),y=!!t?.enableGraphCapture,_=[],w=[],k=[],x=[],b=[];for(let S=0;S<f;S++){let[I,A,z]=ga(n,S);I===0&&me("Can't get an input name."),p.push(I);let v=a.UTF8ToString(I);_.push(v),k.push(A===0?{name:v,isTensor:!1}:{name:v,isTensor:!0,type:ot(A),shape:z})}for(let S=0;S<g;S++){let[I,A,z]=ga(n,S+f);I===0&&me("Can't get an output name."),h.push(I);let v=a.UTF8ToString(I);w.push(v),x.push(A===0?{name:v,isTensor:!1}:{name:v,isTensor:!0,type:ot(A),shape:z});{if(y&&t?.preferredOutputLocation===void 0){b.push("gpu-buffer");continue}let N=typeof t?.preferredOutputLocation=="string"?t.preferredOutputLocation:t?.preferredOutputLocation?.[v]??"cpu",U=a.webnnIsGraphOutput;if(N==="cpu"&&U&&U(n,v)){b.push("ml-tensor-cpu-output");continue}if(N!=="cpu"&&N!=="cpu-pinned"&&N!=="gpu-buffer"&&N!=="ml-tensor")throw new Error(`Not supported preferred output location: ${N}.`);if(y&&N!=="gpu-buffer")throw new Error(`Not supported preferred output location: ${N}. Only 'gpu-buffer' location is supported when enableGraphCapture is true.`);b.push(N)}}let T=null;return b.some(S=>S==="gpu-buffer"||S==="ml-tensor"||S==="ml-tensor-cpu-output")&&(u=a._OrtCreateBinding(n),u===0&&me("Can't create IO binding."),T={handle:u,outputPreferredLocations:b,outputPreferredLocationsEncoded:b.map(S=>S==="ml-tensor-cpu-output"?"ml-tensor":S).map(S=>$a(S))}),mt.set(n,[n,p,h,T,y,!1]),[n,_,w,k,x]}catch(f){throw p.forEach(g=>a._OrtFree(g)),h.forEach(g=>a._OrtFree(g)),u!==0&&a._OrtReleaseBinding(u)!==0&&me("Can't release IO binding."),n!==0&&a._OrtReleaseSession(n)!==0&&me("Can't release session."),f}finally{a._free(r),s!==0&&a._OrtReleaseSessionOptions(s)!==0&&me("Can't release session options."),l.forEach(f=>a._free(f)),a.unmountExternalData?.()}},on=e=>{let t=be(),r=mt.get(e);if(!r)throw new Error(`cannot release session. invalid session id: ${e}`);let[i,a,n,s,u]=r;s&&(u&&t._OrtClearBoundOutputs(s.handle)!==0&&me("Can't clear bound outputs."),t._OrtReleaseBinding(s.handle)!==0&&me("Can't release IO binding.")),t.jsepOnReleaseSession?.(e),t.webnnOnReleaseSession?.(e),t.webgpuOnReleaseSession?.(e),a.forEach(l=>t._OrtFree(l)),n.forEach(l=>t._OrtFree(l)),t._OrtReleaseSession(i)!==0&&me("Can't release session."),mt.delete(e)},ya=async(e,t,r,i,a,n,s=!1)=>{if(!e){t.push(0);return}let u=be(),l=u.PTR_SIZE,p=e[0],h=e[1],f=e[3],g=f,y,_;if(p==="string"&&(f==="gpu-buffer"||f==="ml-tensor"))throw new Error("String tensor is not supported on GPU.");if(s&&f!=="gpu-buffer")throw new Error(`External buffer must be provided for input/output index ${n} when enableGraphCapture is true.`);if(f==="gpu-buffer"){let x=e[2].gpuBuffer;_=Ct(zt(p),h);{let b=u.jsepRegisterBuffer;if(!b)throw new Error('Tensor location "gpu-buffer" is not supported without using WebGPU.');y=b(i,n,x,_)}}else if(f==="ml-tensor"){let x=e[2].mlTensor;_=Ct(zt(p),h);let b=u.webnnRegisterMLTensor;if(!b)throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');y=b(i,x,zt(p),h)}else{let x=e[2];if(Array.isArray(x)){_=l*x.length,y=u._malloc(_),r.push(y);for(let b=0;b<x.length;b++){if(typeof x[b]!="string")throw new TypeError(`tensor data at index ${b} is not a string`);u.setValue(y+b*l,Ze(x[b],r),"*")}}else{let b=u.webnnIsGraphInput,T=u.webnnIsGraphOutput;if(p!=="string"&&b&&T){let S=u.UTF8ToString(a);if(b(i,S)||T(i,S)){let I=zt(p);_=Ct(I,h),g="ml-tensor";let A=u.webnnCreateTemporaryTensor,z=u.webnnUploadTensor;if(!A||!z)throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');let v=await A(i,I,h);z(v,new Uint8Array(x.buffer,x.byteOffset,x.byteLength)),y=v}else _=x.byteLength,y=u._malloc(_),r.push(y),u.HEAPU8.set(new Uint8Array(x.buffer,x.byteOffset,_),y)}else _=x.byteLength,y=u._malloc(_),r.push(y),u.HEAPU8.set(new Uint8Array(x.buffer,x.byteOffset,_),y)}}let w=u.stackSave(),k=u.stackAlloc(4*h.length);try{h.forEach((b,T)=>u.setValue(k+T*l,b,l===4?"i32":"i64"));let x=u._OrtCreateTensor(zt(p),y,_,k,h.length,$a(g));x===0&&me(`Can't create tensor for input/output. session=${i}, index=${n}.`),t.push(x)}finally{u.stackRestore(w)}},un=async(e,t,r,i,a,n)=>{let s=be(),u=s.PTR_SIZE,l=mt.get(e);if(!l)throw new Error(`cannot run inference. invalid session id: ${e}`);let p=l[0],h=l[1],f=l[2],g=l[3],y=l[4],_=l[5],w=t.length,k=i.length,x=0,b=[],T=[],S=[],I=[],A=[],z=s.stackSave(),v=s.stackAlloc(w*u),N=s.stackAlloc(w*u),U=s.stackAlloc(k*u),Z=s.stackAlloc(k*u);try{[x,b]=lp(n),Ot("wasm prepareInputOutputTensor");for(let P=0;P<w;P++)await ya(r[P],T,I,e,h[t[P]],t[P],y);for(let P=0;P<k;P++)await ya(a[P],S,I,e,f[i[P]],w+i[P],y);Mt("wasm prepareInputOutputTensor");for(let P=0;P<w;P++)s.setValue(v+P*u,T[P],"*"),s.setValue(N+P*u,h[t[P]],"*");for(let P=0;P<k;P++)s.setValue(U+P*u,S[P],"*"),s.setValue(Z+P*u,f[i[P]],"*");if(g&&!_){let{handle:P,outputPreferredLocations:j,outputPreferredLocationsEncoded:te}=g;if(h.length!==w)throw new Error(`input count from feeds (${w}) is expected to be always equal to model's input count (${h.length}).`);Ot("wasm bindInputsOutputs");for(let ee=0;ee<w;ee++){let re=t[ee];await s._OrtBindInput(P,h[re],T[ee])!==0&&me(`Can't bind input[${ee}] for session=${e}.`)}for(let ee=0;ee<k;ee++){let re=i[ee];a[ee]?.[3]?(A.push(S[ee]),s._OrtBindOutput(P,f[re],S[ee],0)!==0&&me(`Can't bind pre-allocated output[${ee}] for session=${e}.`)):s._OrtBindOutput(P,f[re],0,te[re])!==0&&me(`Can't bind output[${ee}] to ${j[ee]} for session=${e}.`)}Mt("wasm bindInputsOutputs"),mt.set(e,[p,h,f,g,y,!0])}s.jsepOnRunStart?.(p),s.webnnOnRunStart?.(p);let G;g?G=await s._OrtRunWithBinding(p,g.handle,k,U,x):G=await s._OrtRun(p,N,v,w,Z,k,U,x),G!==0&&me("failed to call OrtRun().");let K=[],R=[];Ot("wasm ProcessOutputTensor");for(let P=0;P<k;P++){let j=Number(s.getValue(U+P*u,"*"));if(j===S[P]||A.includes(S[P])){K.push(a[P]),j!==S[P]&&s._OrtReleaseTensor(j)!==0&&me("Can't release tensor.");continue}let te=s.stackSave(),ee=s.stackAlloc(4*u),re=!1,ae,O=0;try{s._OrtGetTensorData(j,ee,ee+u,ee+2*u,ee+3*u)!==0&&me(`Can't access output tensor data on index ${P}.`);let W=u===4?"i32":"i64",H=Number(s.getValue(ee,W));O=s.getValue(ee+u,"*");let V=s.getValue(ee+u*2,"*"),Ee=Number(s.getValue(ee+u*3,W)),Oe=[];for(let ge=0;ge<Ee;ge++)Oe.push(Number(s.getValue(V+ge*u,W)));s._OrtFree(V)!==0&&me("Can't free memory for tensor dims.");let ve=Oe.reduce((ge,$e)=>ge*$e,1);ae=ot(H);let Me=g?.outputPreferredLocations[i[P]];if(ae==="string"){if(Me==="gpu-buffer"||Me==="ml-tensor")throw new Error("String tensor is not supported on GPU.");let ge=[];for(let $e=0;$e<ve;$e++){let Be=s.getValue(O+$e*u,"*"),mr=s.getValue(O+($e+1)*u,"*"),Qe=$e===ve-1?void 0:mr-Be;ge.push(s.UTF8ToString(Be,Qe))}K.push([ae,Oe,ge,"cpu"])}else if(Me==="gpu-buffer"&&ve>0){let ge=s.jsepGetBuffer;if(!ge)throw new Error('preferredLocation "gpu-buffer" is not supported without using WebGPU.');let $e=ge(O),Be=Ct(H,ve);if(Be===void 0||!La(ae))throw new Error(`Unsupported data type: ${ae}`);re=!0,K.push([ae,Oe,{gpuBuffer:$e,download:s.jsepCreateDownloader($e,Be,ae),dispose:()=>{s._OrtReleaseTensor(j)!==0&&me("Can't release tensor.")}},"gpu-buffer"])}else if(Me==="ml-tensor"&&ve>0){let ge=s.webnnEnsureTensor,$e=s.webnnIsGraphInputOutputTypeSupported;if(!ge||!$e)throw new Error('preferredLocation "ml-tensor" is not supported without using WebNN.');if(Ct(H,ve)===void 0||!Ga(ae))throw new Error(`Unsupported data type: ${ae}`);if(!$e(e,ae,!1))throw new Error(`preferredLocation "ml-tensor" for ${ae} output is not supported by current WebNN Context.`);let Be=await ge(e,O,H,Oe,!1);re=!0,K.push([ae,Oe,{mlTensor:Be,download:s.webnnCreateMLTensorDownloader(O,ae),dispose:()=>{s.webnnReleaseTensorId(O),s._OrtReleaseTensor(j)}},"ml-tensor"])}else if(Me==="ml-tensor-cpu-output"&&ve>0){let ge=s.webnnCreateMLTensorDownloader(O,ae)(),$e=K.length;re=!0,R.push((async()=>{let Be=[$e,await ge];return s.webnnReleaseTensorId(O),s._OrtReleaseTensor(j),Be})()),K.push([ae,Oe,[],"cpu"])}else{let ge=Jr(ae),$e=new ge(ve);new Uint8Array($e.buffer,$e.byteOffset,$e.byteLength).set(s.HEAPU8.subarray(O,O+$e.byteLength)),K.push([ae,Oe,$e,"cpu"])}}finally{s.stackRestore(te),ae==="string"&&O&&s._free(O),re||s._OrtReleaseTensor(j)}}g&&!y&&(s._OrtClearBoundOutputs(g.handle)!==0&&me("Can't clear bound outputs."),mt.set(e,[p,h,f,g,y,!1]));for(let[P,j]of await Promise.all(R))K[P][2]=j;return Mt("wasm ProcessOutputTensor"),K}finally{s.webnnOnRunEnd?.(p),s.stackRestore(z),T.forEach(G=>s._OrtReleaseTensor(G)),S.forEach(G=>s._OrtReleaseTensor(G)),I.forEach(G=>s._free(G)),x!==0&&s._OrtReleaseRunOptions(x),b.forEach(G=>s._free(G))}},ln=e=>{let t=be(),r=mt.get(e);if(!r)throw new Error("invalid session id");let i=r[0],a=t._OrtEndProfiling(i);a===0&&me("Can't get an profile file name."),t._OrtFree(a)},dn=e=>{let t=[];for(let r of e){let i=r[2];!Array.isArray(i)&&"buffer"in i&&t.push(i.buffer)}return t}}),gt,qe,qt,nr,sr,Ur,_a,Wr,Tt,Et,Bd,df,pf,cf,hf,ff,mf,gf,yf=q(()=>{Le(),lf(),Nt(),Ua(),gt=()=>!!_e.wasm.proxy&&typeof document<"u",qt=!1,nr=!1,sr=!1,Wr=new Map,Tt=(e,t)=>{let r=Wr.get(e);r?r.push(t):Wr.set(e,[t])},Et=()=>{if(qt||!nr||sr||!qe)throw new Error("worker not ready")},Bd=e=>{switch(e.data.type){case"init-wasm":qt=!1,e.data.err?(sr=!0,_a[1](e.data.err)):(nr=!0,_a[0]()),Ur&&(URL.revokeObjectURL(Ur),Ur=void 0);break;case"init-ep":case"copy-from":case"create":case"release":case"run":case"end-profiling":{let t=Wr.get(e.data.type);e.data.err?t.shift()[1](e.data.err):t.shift()[0](e.data.out);break}}},df=async()=>{if(!nr){if(qt)throw new Error("multiple calls to 'initWasm()' detected.");if(sr)throw new Error("previous call to 'initWasm()' failed.");if(qt=!0,gt())return new Promise((e,t)=>{qe?.terminate(),op().then(([r,i])=>{try{qe=i,qe.onerror=n=>t(n),qe.onmessage=Bd,_a=[e,t];let a={type:"init-wasm",in:_e};!a.in.wasm.wasmPaths&&(r||wa)&&(a.in.wasm.wasmPaths={wasm:new URL("/assets/ort-wasm-simd-threaded.jsep-CyqnNavA.wasm",import.meta.url).href}),qe.postMessage(a),Ur=r}catch(a){t(a)}},t)});try{await Wa(_e.wasm),await an(_e),nr=!0}catch(e){throw sr=!0,e}finally{qt=!1}}},pf=async e=>{if(gt())return Et(),new Promise((t,r)=>{Tt("init-ep",[t,r]);let i={type:"init-ep",in:{epName:e,env:_e}};qe.postMessage(i)});await nn(_e,e)},cf=async e=>gt()?(Et(),new Promise((t,r)=>{Tt("copy-from",[t,r]);let i={type:"copy-from",in:{buffer:e}};qe.postMessage(i,[e.buffer])})):Qr(e),hf=async(e,t)=>{if(gt()){if(t?.preferredOutputLocation)throw new Error('session option "preferredOutputLocation" is not supported for proxy.');return Et(),new Promise((r,i)=>{Tt("create",[r,i]);let a={type:"create",in:{model:e,options:{...t}}},n=[];e instanceof Uint8Array&&n.push(e.buffer),qe.postMessage(a,n)})}else return sn(e,t)},ff=async e=>{if(gt())return Et(),new Promise((t,r)=>{Tt("release",[t,r]);let i={type:"release",in:e};qe.postMessage(i)});on(e)},mf=async(e,t,r,i,a,n)=>{if(gt()){if(r.some(s=>s[3]!=="cpu"))throw new Error("input tensor on GPU is not supported for proxy.");if(a.some(s=>s))throw new Error("pre-allocated output tensor is not supported for proxy.");return Et(),new Promise((s,u)=>{Tt("run",[s,u]);let l=r,p={type:"run",in:{sessionId:e,inputIndices:t,inputs:l,outputIndices:i,options:n}};qe.postMessage(p,dn(l))})}else return un(e,t,r,i,a,n)},gf=async e=>{if(gt())return Et(),new Promise((t,r)=>{Tt("end-profiling",[t,r]);let i={type:"end-profiling",in:e};qe.postMessage(i)});ln(e)}}),ba,Dd,_f,Fy=q(()=>{Le(),yf(),ie(),Pa(),pp(),ba=(e,t)=>{switch(e.location){case"cpu":return[e.type,e.dims,e.data,"cpu"];case"gpu-buffer":return[e.type,e.dims,{gpuBuffer:e.gpuBuffer},"gpu-buffer"];case"ml-tensor":return[e.type,e.dims,{mlTensor:e.mlTensor},"ml-tensor"];default:throw new Error(`invalid data location: ${e.location} for ${t()}`)}},Dd=e=>{switch(e[3]){case"cpu":return new Ie(e[0],e[2],e[1]);case"gpu-buffer":{let t=e[0];if(!La(t))throw new Error(`not supported data type: ${t} for deserializing GPU tensor`);let{gpuBuffer:r,download:i,dispose:a}=e[2];return Ie.fromGpuBuffer(r,{dataType:t,dims:e[1],download:i,dispose:a})}case"ml-tensor":{let t=e[0];if(!Ga(t))throw new Error(`not supported data type: ${t} for deserializing MLTensor tensor`);let{mlTensor:r,download:i,dispose:a}=e[2];return Ie.fromMLTensor(r,{dataType:t,dims:e[1],download:i,dispose:a})}default:throw new Error(`invalid data location: ${e[3]}`)}},_f=class{async fetchModelAndCopyToWasmMemory(e){return cf(await Va(e))}async loadModel(e,t){it();let r;typeof e=="string"?r=await this.fetchModelAndCopyToWasmMemory(e):r=e,[this.sessionId,this.inputNames,this.outputNames,this.inputMetadata,this.outputMetadata]=await hf(r,t),Xe()}async dispose(){return ff(this.sessionId)}async run(e,t,r){it();let i=[],a=[];Object.entries(e).forEach(f=>{let g=f[0],y=f[1],_=this.inputNames.indexOf(g);if(_===-1)throw new Error(`invalid input '${g}'`);i.push(y),a.push(_)});let n=[],s=[];Object.entries(t).forEach(f=>{let g=f[0],y=f[1],_=this.outputNames.indexOf(g);if(_===-1)throw new Error(`invalid output '${g}'`);n.push(y),s.push(_)});let u=i.map((f,g)=>ba(f,()=>`input "${this.inputNames[a[g]]}"`)),l=n.map((f,g)=>f?ba(f,()=>`output "${this.outputNames[s[g]]}"`):null),p=await mf(this.sessionId,a,u,s,l,r),h={};for(let f=0;f<p.length;f++)h[this.outputNames[s[f]]]=n[f]??Dd(p[f]);return Xe(),h}startProfiling(){}endProfiling(){gf(this.sessionId)}}}),bf={};Ft(bf,{OnnxruntimeWebAssemblyBackend:()=>Ba,initializeFlags:()=>Ra,wasmBackend:()=>wf});var Ra,Ba,wf,jy=q(()=>{Le(),yf(),Fy(),Ra=()=>{(typeof _e.wasm.initTimeout!="number"||_e.wasm.initTimeout<0)&&(_e.wasm.initTimeout=0);let e=_e.wasm.simd;if(typeof e!="boolean"&&e!==void 0&&e!=="fixed"&&e!=="relaxed"&&(console.warn(`Property "env.wasm.simd" is set to unknown value "${e}". Reset it to \`false\` and ignore SIMD feature checking.`),_e.wasm.simd=!1),typeof _e.wasm.proxy!="boolean"&&(_e.wasm.proxy=!1),typeof _e.wasm.trace!="boolean"&&(_e.wasm.trace=!1),typeof _e.wasm.numThreads!="number"||!Number.isInteger(_e.wasm.numThreads)||_e.wasm.numThreads<=0)if(typeof self<"u"&&!self.crossOriginIsolated)_e.wasm.numThreads=1;else{let t=typeof navigator>"u"?Og("node:os").cpus().length:navigator.hardwareConcurrency;_e.wasm.numThreads=Math.min(4,Math.ceil((t||1)/2))}},Ba=class{async init(e){Ra(),await df(),await pf(e)}async createInferenceSessionHandler(e,t){let r=new _f;return await r.loadModel(e,t),r}},wf=new Ba});Le();Le();Le();var Ky="1.26.0";{let e=(jy(),hr(bf)).wasmBackend;Lt("webgpu",e,5),Lt("webnn",e,5),Lt("cpu",e,10),Lt("wasm",e,10)}Object.defineProperty(_e.versions,"web",{value:Ky,enumerable:!0});const Zy=["https://cdn.jsdelivr.net/npm/onnxruntime-web@1.26.0/dist/","https://unpkg.com/onnxruntime-web@1.26.0/dist/"];_e.wasm.wasmPaths=Zy[0];try{_e.wasm.numThreads=4}catch{X("[SAM Worker] Multi-threading not available")}try{_e.wasm.simd=!0}catch{X("[SAM Worker] SIMD not available, falling back to scalar operations")}let yt=null,rt=null,At=null,pr=null;const Yr=1024,Nd=["wasm"];function X(...e){self.postMessage({type:"LOG",data:{args:e}})}async function Xy(e,t){const r=performance.now();X("[SAM Worker] Initializing models..."),X("[SAM Worker] Loading encoder:",e);try{const a=await fetch(e,{method:"HEAD"});X("[SAM Worker] Encoder HEAD:",a.status,a.headers.get("content-type"))}catch(a){X("[SAM Worker] Encoder HEAD failed:",a)}yt=await Vr.create(e,{executionProviders:Nd,graphOptimizationLevel:"all",enableCpuMemArena:!0,enableMemPattern:!1}),X("[SAM Worker] Encoder loaded in",Math.round(performance.now()-r),"ms");const i=performance.now();X("[SAM Worker] Loading decoder:",t),rt=await Vr.create(t,{executionProviders:Nd,graphOptimizationLevel:"all",enableCpuMemArena:!0,enableMemPattern:!1}),X("[SAM Worker] Decoder loaded in",Math.round(performance.now()-i),"ms"),X("[SAM Worker] All models ready. Total init:",Math.round(performance.now()-r),"ms")}function Qy(e,t,r,i){const{padX:a,padY:n,scaledW:s,scaledH:u}=i,l=Yr,p=new Float32Array(3*l*l),h=e.data,f=123.675,g=116.28,y=103.53,_=58.395,w=57.12,k=57.375;for(let x=0;x<u;x++)for(let b=0;b<s;b++){const T=Math.round(b/s*t),S=Math.round(x/u*r),I=Math.min(t-1,Math.max(0,T)),z=(Math.min(r-1,Math.max(0,S))*t+I)*4,v=h[z],N=h[z+1],U=h[z+2],Z=n+x,G=a+b,K=Z*l+G;p[0*l*l+K]=(v-f)/_,p[1*l*l+K]=(N-g)/w,p[2*l*l+K]=(U-y)/k}return p}async function Yy(e){if(!yt)throw new Error("[SAM Worker] Encoder session not initialized. Send INIT_MODELS first.");const t=Yr,r=new Ie("float32",e,[1,3,t,t]),i={},a=yt.inputNames;if(a.length===0)throw new Error("[SAM Worker] Encoder session has no input names.");i[a[0]]=r;const n=performance.now(),s=await yt.run(i);X("[SAM Worker] Encoder run completed in",Math.round(performance.now()-n),"ms");const u=yt.outputNames;if(u.length===0)throw new Error("[SAM Worker] Encoder session has no output names.");const l=s[u[0]];let p;return l.type==="float32"?p=l.data:l.type==="float64"?p=new Float32Array(l.data):p=new Float32Array(l.data),p}async function Jy(e){const{prompts:t,box:r,originalWidth:i,originalHeight:a}=e;if(X("[SAM Worker] generateMask called. decoderSession=",!!rt,"currentEmbedding=",!!At,"prompts=",t.length,"box=",r?`[${r.x1},${r.y1},${r.x2},${r.y2}]`:"none"),!rt)throw new Error("[SAM Worker] Decoder session not initialized. Send INIT_MODELS first.");if(!At)throw new Error("[SAM Worker] No embedding loaded. Send COMPUTE_EMBEDDING or LOAD_EMBEDDING first.");try{const O=rt.inputNames;if(!O||O.length===0)throw new Error("Decoder session has no input names - session may be corrupted");X("[SAM Worker] Decoder session validated. Input count:",O.length)}catch(O){const W=O instanceof Error?O.message:String(O);throw new Error(`[SAM Worker] Decoder session validation failed: ${W}`)}const n=t.length,s=n>0?n:r?1:0,u=new Float32Array(s*2),l=new Float32Array(s);if(n>0)for(let O=0;O<n;O++){const W=t[O];u[O*2]=W.x,u[O*2+1]=W.y,l[O]=W.type==="positive"?1:0}else if(r){const O=(r.x1+r.x2)/2,W=(r.y1+r.y2)/2;u[0]=O,u[1]=W,l[0]=2}const p=new Ie("float32",u,[1,s,2]),h=new Ie("float32",l,[1,s]),f=new Float32Array(1*256*256).fill(0),g=new Ie("float32",f,[1,1,256,256]),y=new Float32Array([0]),_=new Ie("float32",y,[1]);let w=null;if(r){const O=new Float32Array([r.x1,r.y1,r.x2,r.y2]);w=new Ie("float32",O,[1,4]),X("[SAM Worker] Box tensor created:",O)}const k=new Float32Array([a,i]),x=new Ie("float32",k,[2]),b=rt.inputNames;X("[SAM Worker DEBUG] Decoder input names:",b),X("[SAM Worker] Decoder input names:",b),X("[SAM Worker] Current embedding dims:",At?.dims),X("[SAM Worker] Point coords tensor dims:",p.dims),X("[SAM Worker] Point labels tensor dims:",h.dims);const T={};for(const O of b){const W=O.toLowerCase();W.includes("image")||W.includes("embedding")?(X("[SAM Worker] Matching",O,"→ image_embeddings"),T[O]=At):W.includes("point_coords")||W.includes("pointcoords")?(X("[SAM Worker] Matching",O,"→ point_coords [1,",n,",2]"),T[O]=p):W.includes("point_labels")||W.includes("pointlabels")?(X("[SAM Worker] Matching",O,"→ point_labels [1,",n,"]"),T[O]=h):W.includes("has_mask_input")||W.includes("hasmaskinput")?(X("[SAM Worker] Matching",O,"→ has_mask_input"),T[O]=_):W.includes("mask_input")||W.includes("maskinput")?(X("[SAM Worker] Matching",O,"→ mask_input [1,1,256,256]"),T[O]=g):(W.includes("box")||W.includes("bbox"))&&w?(X("[SAM Worker] Matching",O,"→ box [1,4]"),T[O]=w):(W.includes("orig_im_size")||W.includes("origimsize"))&&(X("[SAM Worker] Matching",O,"→ orig_im_size [",a,",",i,"]"),T[O]=x)}if(Object.keys(T).length===0)throw new Error(`[SAM Worker] Could not match decoder input names. Available: [${b.join(", ")}]`);for(const[O,W]of Object.entries(T)){if(!W)throw new Error(`[SAM Worker] Feed tensor "${O}" is null or undefined`);X("[SAM Worker] Feed",O,"dims:",W.dims,"type:",W.type)}X("[SAM Worker] Decoder feeds prepared. Matched:",Object.keys(T).length,"/",b.length),X("[SAM Worker] Running decoder session.run()...","with feeds:",Object.keys(T).length,"inputs");const S=performance.now();let I;try{const O=rt.run(T),W=new Promise((H,V)=>setTimeout(()=>V(new Error("[SAM Worker] Decoder.run() exceeded 15s timeout")),15e3));I=await Promise.race([O,W])}catch(O){const W=O instanceof Error?O.message:String(O);throw X("[SAM Worker] Decoder run failed:",W),new Error(`[SAM Worker] Decoder inference failed: ${W}`)}X("[SAM Worker] decoder session.run() completed in",Math.round(performance.now()-S),"ms");const A=rt.outputNames;X("[SAM Worker] Decoder output names:",A);let z=A[0];for(const O of A)if(O.toLowerCase()==="masks"){z=O;break}const v=I[z];if(!v)throw new Error(`[SAM Worker] Mask output "${z}" not found in decoder results. Available: [${A.join(", ")}]`);for(const O of A){const W=I[O];if(!W){X("[SAM Worker] Output",O,"is null/undefined in results!");continue}const H=W.data;X("[SAM Worker] Output",O,"dims:",W.dims,"type:",W.type,"len:",H?.length,"first5:",H?.subarray?Array.from(H.subarray(0,Math.min(5,H.length))):"N/A")}const N=v.data;X("[SAM Worker] outputTensor type:",typeof N,"constructor:",N?.constructor?.name,"length:",N?.length),X("[SAM Worker] outputTensor dims:",v.dims,"type:",v.type);let U;if(v.type==="float32")U=N;else if(v.type==="float64"){const O=N;X("[SAM Worker] Converting Float64 output to Float32"),U=new Float32Array(O)}else X("[SAM Worker] Attempting direct cast to Float32Array from type:",v.type),U=new Float32Array(N);if(!U||U.length===0)throw new Error(`[SAM Worker] Output tensor data is empty or null. Length: ${U?.length??"null"}`);U&&U.length>0?(X("[SAM Worker] First 5 values:",Array.from(U.subarray(0,Math.min(5,U.length)))),X("[SAM Worker] Is NaN check:",U.subarray(0,5).map(O=>isNaN(O)))):X("[SAM Worker] outputData is empty or null");const Z=v.dims;X("[SAM Worker] Mask output shape:",Z);let G,K,R;if(Z.length===4&&Z[2]>0&&Z[3]>0){const O=Z[2],W=Z[3];X("[SAM Worker] Mask output shape:",Z,"- extracting first channel as",W,"x",O);const H=U.subarray(0,O*W);G=new Float32Array(H),K=W,R=O}else X("[SAM Worker] Unexpected output shape:",Z,". Using raw data."),G=new Float32Array(U),K=Yr,R=Yr;let P,j=256,te=256;const ee=I.low_res_masks;if(ee&&ee.dims&&ee.dims.length===4){const O=ee.dims[2],W=ee.dims[3],H=ee.data;H&&H.length>=O*W?(P=new Float32Array(H.subarray(0,O*W)),j=W,te=O,X("[SAM Worker] Extracted low_res_masks:",W,"x",O,"len:",P.length)):(P=new Float32Array(256*256),j=256,te=256,X("[SAM Worker] low_res_masks unavailable, using empty fallback"))}else P=new Float32Array(256*256),X("[SAM Worker] low_res_masks not found in results, using empty fallback");let re=1/0,ae=-1/0;for(let O=0;O<Math.min(G.length,100);O++)G[O]<re&&(re=G[O]),G[O]>ae&&(ae=G[O]);return X("[SAM Worker] Mask stats (first 100): min=",re,"max=",ae),{data:G,width:K,height:R,lowResData:P,lowResWidth:j,lowResHeight:te}}self.onmessage=async e=>{const{type:t,data:r}=e.data;X("[SAM Worker] onmessage:",t,"decoderReady:",!!rt);try{switch(X("[SAM Worker] === BEFORE SWITCH ===  type="+t),t){case"INIT_MODELS":{const i=r.encoderPath,a=r.decoderPath;if(!i||!a){self.postMessage({type:"ERROR",data:{message:"INIT_MODELS: encoderPath and decoderPath are required."}});return}await Xy(i,a),self.postMessage({type:"MODELS_READY"});break}case"COMPUTE_EMBEDDING":{if(!yt){self.postMessage({type:"ERROR",data:{message:"COMPUTE_EMBEDDING: Encoder not initialized. Send INIT_MODELS first."}});return}const i=r.imageData,a=r.originalWidth,n=r.originalHeight,s=r.outputDims;if(!i||!a||!n||!s){self.postMessage({type:"ERROR",data:{message:"COMPUTE_EMBEDDING: imageData, originalWidth, originalHeight, and outputDims are required."}});return}pr={w:a,h:n};const u=performance.now();X("[SAM Worker] Preprocessing image...");const l=Qy(i,a,n,s);X("[SAM Worker] Preprocessing done in",Math.round(performance.now()-u),"ms"),X("[SAM Worker] Running encoder...");const p=performance.now(),h=await Yy(l);X("[SAM Worker] Encoder done in",Math.round(performance.now()-p),"ms","— embedding size:",h.length,"elements");const f=new Float32Array(h);At=new Ie("float32",f,[1,256,64,64]);const g=h.buffer.slice(0);X("[SAM Worker] Embedding stored in worker (separate buffer). Copy size:",f.byteLength,"bytes. Transfer buffer:",g.byteLength,"bytes"),self.postMessage({type:"EMBEDDING_COMPUTED",data:{embedding:g,dims:[1,256,64,64]}},{transfer:[g]});break}case"LOAD_EMBEDDING":{const i=r.embedding,a=r.dims;if(!i){self.postMessage({type:"ERROR",data:{message:"LOAD_EMBEDDING: embedding ArrayBuffer is required."}});return}try{if(i.byteLength===0)throw new Error("LOAD_EMBEDDING: Embedding buffer is empty");const n=new Float32Array(i);X("[SAM Worker] LOAD_EMBEDDING received. Buffer size:",i.byteLength,"bytes. Float32 elements:",n.length);const s=new Float32Array(n.length);s.set(n),At=new Ie("float32",s,a||[1,256,64,64]),X("[SAM Worker] Embedding tensor created with dims:",a),r.originalWidth&&r.originalHeight&&(pr={w:r.originalWidth,h:r.originalHeight}),X("[SAM Worker] Embedding loaded successfully, dims:",a,"copy size:",s.byteLength,"bytes"),self.postMessage({type:"EMBEDDING_LOADED"})}catch(n){const s=n instanceof Error?n.message:String(n);X("[SAM Worker] Failed to create Tensor from embedding:",s),self.postMessage({type:"ERROR",data:{message:`LOAD_EMBEDDING: Failed to create ONNX Tensor: ${s}`}})}break}case"GENERATE_MASK":{X("[SAM Worker] GENERATE_MASK case reached!");try{const i=r.prompts||[],a=r.box,n=r.originalWidth||pr?.w||1024,s=r.originalHeight||pr?.h||1024;if(X("[SAM Worker] GENERATE_MASK params: prompts.length=",i.length,"box=",!!a,"origW=",n,"origH=",s),(!i||i.length===0)&&!a){self.postMessage({type:"ERROR",data:{message:"GENERATE_MASK: At least one prompt or a bounding box is required."}});return}X("[SAM Worker] Calling generateMask() ...");const u=performance.now(),{data:l,width:p,height:h,lowResData:f,lowResWidth:g,lowResHeight:y}=await Jy({prompts:i||[],box:a||null,originalWidth:n,originalHeight:s});X("[SAM Worker] Mask generated in",Math.round(performance.now()-u),"ms","- size:",p,"x",h,"- lowRes:",g,"x",y);const _=l.buffer.slice(0),w=f.buffer.slice(0);self.postMessage({type:"MASK_GENERATED",data:{mask:_,width:p,height:h,lowResMask:w,lowResWidth:g,lowResHeight:y,originalWidth:n,originalHeight:s}},{transfer:[_,w]})}catch(i){const a=i instanceof Error?i.message:String(i);X("[SAM Worker] GENERATE_MASK case ERROR:",a),self.postMessage({type:"ERROR",data:{message:`GENERATE_MASK error: ${a}`}})}break}default:self.postMessage({type:"ERROR",data:{message:`Unknown message type: ${t}`}})}}catch(i){const a=i instanceof Error?i.message:String(i),n=i instanceof Error?i.stack:"";X("[SAM Worker] EXCEPTION caught:",a,n),self.postMessage({type:"ERROR",data:{message:a}})}};self.onerror=e=>(X("[SAM Worker] GLOBAL ERROR:",e.message,e.filename,e.lineno),self.postMessage({type:"ERROR",data:{message:`Global error: ${e.message}`}}),!0);self.onrejectionhandled=e=>{X("[SAM Worker] Unhandled rejection:",e.reason)};self.onunhandledrejection=e=>{X("[SAM Worker] Unhandled rejection (will terminate):",e.reason);const t=e.reason instanceof Error?e.reason.message:String(e.reason);self.postMessage({type:"ERROR",data:{message:`Unhandled rejection: ${t}`}})};X("[SAM Worker] Global error handlers installed");self.addEventListener("beforeunload",()=>{yt&&(yt=null),rt&&(rt=null),At=null,pr=null});
