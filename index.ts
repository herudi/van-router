// deno-lint-ignore no-explicit-any
type TRet = any;
type TObject = Record<string, TRet>;
type RequestLike = Record<string, TRet>;
type ResponseLike = Record<string, TRet>;
export type NextFunction = (err?: Error) => TRet;
export interface Context {
  lazy(file: string, name?: string): void;
  html: TRet;
  useAfter(fn: () => TRet): TRet;
  useData(fn: () => TRet): TRet;
  setHead(str: string): TRet;
  route: {
    url: string;
    pathname: string;
    path: string | RegExp;
    params: TObject;
    go(url: string, type?: string): void;
  };
  isHydrate: boolean;
  isServer: boolean;
  request: RequestLike;
  response: ResponseLike;
  getHandler(url: string, method?: string): Promise<TRet>;
  [k: string]: TRet;
}

type ResolveContext = {
  request?: RequestLike;
  response?: ResponseLike;
  [k: string]: TRet;
};

export type Handler<
  Ctx extends Context = Context,
> = (
  ctx: Ctx,
  next: NextFunction,
) => TRet;

type MethodHandler<
  Ctx extends Context = Context,
  T = TObject,
> = (path: string | RegExp, ...fns: Array<Handler<Ctx>>) => T;

type TOptions = {
  render?: (elem: TRet) => TRet;
  base?: string;
  hash?: boolean;
};
// deno-lint-ignore ban-ts-comment
// @ts-ignore
export const IS_CLIENT = typeof window !== "undefined" &&
  // deno-lint-ignore ban-ts-comment
  // @ts-ignore
  window.document !== void 0;

const w = IS_CLIENT ? window : {} as Window & { [k: string]: TRet };
const _ren: TRet = (r: TRet) => r;
const err_hash = "use hash (#) in href. (requires config hash)";

class Router<Ctx extends Context = Context> {
  _route: TObject = {};
  private _ctx: TRet;
  private _head = "";
  private _data: TRet = () => ({});
  private render = _ren;
  private base = "";
  private origin = "";
  private hash = false;
  private isHydrate = false;
  private wares: Handler[] = [];
  private current!: string;
  private cleanup!: (() => TRet) | undefined;
  private vNow = "?v=" + Date.now();
  private cFile = (file: string) =>
    file.indexOf("?") !== -1 ? file.split("?")[0] : file;
  private controller: TObject = {};
  private _onError = (_err: Error, _ctx: Ctx) => "Error: " + _err.message;
  add: MethodHandler<Ctx, this>;
  constructor(opts: TOptions = {}) {
    if (opts.render !== void 0) this.render = opts.render;
    if (opts.base !== void 0) this.base = opts.base;
    if (this.base === "/") this.base = "";
    if (opts.hash !== void 0) this.hash = opts.hash;
    this.add = this.on.bind(this, "GET");
  }

  on(
    method: string,
    path: string | RegExp,
    ...fns: Array<Handler<Ctx>>
  ): this;
  on(method: string, path: string | RegExp) {
    const fns = [].slice.call(arguments, 2);
    this._route[method] = this._route[method] || [];
    if (path instanceof RegExp) {
      const regex = this.base === ""
        ? path
        : new RegExp(new RegExp(this.base).source + path.source);
      this._route[method].push({ fns, regex, path });
      return this;
    }
    path = this.base + path;
    const str = path
      .replace(/\/$/, "")
      .replace(/:(\w+)(\?)?(\.)?/g, "$2(?<$1>[^/]+)$2$3")
      .replace(/(\/?)\*/g, (_, p) => `(${p}.*)?`)
      .replace(/\.(?=[\w(])/, "\\.");
    const regex = new RegExp(`^${str}/*$`);
    this._route[method].push({ fns, regex, path });
    return this;
  }

  match(url: string, method = "GET") {
    let fns: TRet,
      params = {},
      path,
      j = 0,
      el: TObject;
    let arr = this._route[method] || [];
    if (this._route["ANY"]) arr = this._route["ANY"].concat(arr);
    const len = arr.length;
    while (j < len) {
      el = arr[j];
      if (el.regex && el.regex.test(url)) {
        try {
          url = decodeURI(url);
        } catch (_e) { /* noop */ }
        params = el.regex.exec(url).groups || {};
        fns = el.fns;
        path = el.path;
        break;
      }
      j++;
    }
    return { fns, params, path };
  }

  use(...fns: Array<Handler<Ctx>>): this;
  use() {
    this.wares = this.wares.concat([].slice.call(arguments));
    return this;
  }

  handle(ctx = {} as Ctx) {
    // deno-lint-ignore no-this-alias
    const s = this;
    if (s.cleanup !== void 0) {
      s.cleanup();
      s.cleanup = void 0;
    }
    const isServer = ctx.request !== void 0;
    let loc;
    if (isServer) {
      const url = ctx.__url || ctx.request.url;
      loc = new URL((url[0] === "/" ? "http://a.b" : "") + url);
      s.origin = loc.origin;
    }
    let { pathname: pn, search, hash: h } = loc || w.location,
      i = 0,
      mount: TRet;
    if (h) {
      if (pn[pn.length - 1] === "/") {
        pn = pn.slice(0, -1);
      }
      pn = (pn === "/" ? "/" : pn + "/") + h.substring(2);
      s.current = h + search;
    } else s.current = pn + search;
    if (s.current !== "/") {
      if (s.hash && s.current[0] !== "#") {
        console.error(err_hash);
        return;
      }
      if (!s.hash && s.current[0] === "#") {
        console.error("don't " + err_hash);
        return;
      }
    }
    const method = ctx.__method || (ctx.request || {}).method || "GET";
    let { fns, params, path } = s.match(pn, method);
    ctx.route = {
      url: s.current,
      pathname: pn,
      params,
      path,
    } as TRet;
    ctx.route.go = (url, type) => {
      if (isServer) return;
      s.goPath(url, type);
    };
    ctx.isHydrate = s.isHydrate || isServer;
    ctx.useAfter = (fn) => {
      mount = fn;
    };
    ctx.getHandler = (str, method) => {
      if (!isServer) return;
      s._ctx.__url = str[0] === "/" ? s.origin + str : str;
      s._ctx.__method = method;
      return s.handle(s._ctx);
    };
    ctx.setHead = (str) => {
      if (!isServer) {
        if (s._head) {
          w.document.head.innerHTML = w.document.head.innerHTML.replace(
            s._head,
            "",
          );
        }
        w.document.head.innerHTML += str;
      }
      s._head = str;
    };
    ctx.useData = (fn) => {
      if (isServer) {
        return s._data = fn();
      } else {
        const nm = "__VAN_DATA__";
        const data = w[nm];
        if (data) {
          delete w[nm];
          return data;
        }
        return fn();
      }
    };
    ctx.isServer = isServer;
    ctx.html = s.html;
    const render = (elem: TRet) => {
      const ret = isServer
        ? (ctx.render ? ctx.render(elem) : _ren(elem))
        : s.render(elem);
      s.listenLink(isServer);
      if (mount && !isServer) {
        const cleanup = mount();
        if (typeof cleanup === "function") {
          s.cleanup = cleanup;
        }
      }
      return ret;
    };
    const next: NextFunction = (err) => {
      let ret: TRet;
      try {
        ret = err ? s._onError(err, ctx) : fns[i++](ctx, next);
      } catch (e) {
        return next(e);
      }
      if (ret) {
        if (typeof ret.then === "function") {
          return ret.then((r: TRet) => {
            if (r) return render(r);
          }).catch(next);
        }
        return render(ret);
      }
    };
    ctx.lazy = (file) => {
      file = s.cFile(file);
      const name = file.substring(file.lastIndexOf("/") + 1).replace(".js", "");
      if (s.controller[file]) {
        const ret = w[name](ctx, next);
        if (ret) render(ret);
        return;
      }
      s.controller[file] = true;
      const script = w.document.createElement("script");
      script.src = file + s.vNow;
      script.type = "text/javascript";
      w.document.head.appendChild(script);
      script.onload = () => {
        const ret = w[name](ctx, next);
        if (ret) render(ret);
      };
    };
    if (!fns) fns = [() => "404 not found"];
    if (!ctx.__url) {
      fns = s.wares.concat(fns);
    }
    s.isHydrate = true;
    return next();
  }

  resolve(ctx: ResolveContext = {}) {
    if (!w.__uHandler) w.__uHandler = (r: TRet) => this.handle(r);
    const isServer = ctx.request !== void 0;
    this._ctx = ctx;
    const out = w.__uHandler(ctx);
    this.listenLink(isServer);
    if (!isServer) {
      w.addEventListener("popstate", () => {
        if (this.current !== w.location.hash) w.__uHandler(ctx);
      });
    }
    return {
      out: (): Promise<TRet> => out,
      head: (): string => this._head,
      data: (): Promise<TRet> => this._data,
    };
  }

  html(ret: TRet) {
    const subs = [].slice.call(arguments, 1);
    return ret.reduce(function (a: string, b: string, c: number) {
      let val = subs[c - 1] as TRet;
      if (val === null || val === undefined) val = "";
      return a + String(val) + b;
    });
  }

  onError(fn: (err: Error, ctx: Ctx) => TRet) {
    this._onError = fn;
    return this;
  }

  private listenLink(isServer: boolean) {
    if (isServer) return;
    w.document.querySelectorAll("[van-link]").forEach((link: TObject) => {
      link.handle = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        const loc: string = link.getAttribute("href") ||
          link.getAttribute("van-link");
        if (this.current !== loc) {
          w.history.pushState({}, "", loc);
          w.__uHandler(this._ctx);
        }
      };
      link.addEventListener("click", link.handle);
    });
  }

  private goPath(path: string, type = "pushState") {
    (w as TRet).history[type]({}, "", (this.hash ? "#" : "") + path);
    w.__uHandler(this._ctx);
  }
}

export const createRouter = <Ctx extends Context = Context>(opts?: TOptions) =>
  new Router<Ctx>(opts);
