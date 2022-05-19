// deno-lint-ignore no-explicit-any
type TRet = any;
type TObject = Record<string, TRet>;
export type NextFunction = (err?: Error) => TRet;
export interface Context {
  params: TObject;
  lazy(file: string, name?: string): void;
  html: TRet;
  useAfter(fn: () => TRet): TRet;
  go(url: string, type?: string): void;
  url: string;
  pathname: string;
  [k: string]: TRet;
}

export type Handler<
  Ctx extends Context = Context,
> = (
  ctx: Ctx,
  next: NextFunction,
) => TRet;

type TOptions = {
  render: (elem: TRet) => TRet;
  base?: string;
  hash?: boolean;
};

function concatRegexp(prefix: string, path: RegExp) {
  if (prefix === "") return path;
  const regex = new RegExp(prefix);
  return new RegExp(regex.source + path.source);
}

const w = typeof window !== "undefined"
  ? window
  : {} as Window & { [k: string]: TRet };

export class VanRouter<Ctx extends Context = Context> {
  routes: TObject[] = [];
  private render: (elem: TRet) => TRet;
  private base = "";
  private hash = false;
  private wares: Handler[] = [];
  private current!: string;
  private cleanup!: (() => TRet) | undefined;
  private vNow = "?v=" + Date.now();
  private cFile = (file: string) =>
    file.indexOf("?") !== -1 ? file.split("?")[0] : file;
  private controller: TObject = {};
  private _onError = (_err: Error, _ctx: Ctx) => {
    return "";
  };
  constructor(opts: TOptions) {
    this.render = opts.render;
    if (opts.base !== void 0) this.base = opts.base;
    if (this.base === "/") this.base = "";
    if (opts.hash !== void 0) this.hash = opts.hash;
  }

  add(path: string | RegExp | undefined, ...fns: Array<Handler<Ctx>>): this;
  add(path: string | RegExp | undefined) {
    const fns = [].slice.call(arguments, 1);
    if (path === void 0) path = this.base + w.location.pathname;
    if (path instanceof RegExp) {
      const regex = concatRegexp(this.base, path);
      this.routes.push({ fns, regex });
      return this;
    }
    path = this.base + path;
    const str = path
      .replace(/\/$/, "")
      .replace(/:(\w+)(\?)?(\.)?/g, "$2(?<$1>[^/]+)$2$3")
      .replace(/(\/?)\*/g, (_, p) => `(${p}.*)?`)
      .replace(/\.(?=[\w(])/, "\\.");
    const regex = new RegExp(`^${str}/*$`);
    this.routes.push({ fns, regex });
    return this;
  }

  match(path: string) {
    let fns: TRet,
      params = {},
      j = 0,
      el: TObject;
    const arr = this.routes, len = arr.length;
    while (j < len) {
      el = arr[j];
      if (el.regex.test(path)) {
        params = el.regex.exec(path).groups || {};
        fns = el.fns;
        break;
      }
      j++;
    }
    return { fns, params };
  }

  use(...fns: Array<Handler<Ctx>>): this;
  use() {
    this.wares = this.wares.concat([].slice.call(arguments));
    return this;
  }

  handle() {
    // deno-lint-ignore no-this-alias
    const s = this;
    if (s.cleanup !== void 0) {
      s.cleanup();
      s.cleanup = void 0;
    }
    let { pathname, search, hash: h } = w.location, i = 0, mount: TRet;
    if (h) {
      if (pathname[pathname.length - 1] === "/") {
        pathname = pathname.slice(0, -1);
      }
      pathname = (pathname === "/" ? "/" : pathname + "/") + h.substring(2);
      s.current = h + search;
    } else s.current = pathname + search;
    if (s.current !== "/") {
      if (s.hash && s.current[0] !== "#") {
        console.error(
          "use hash (#) in href. (requires config hash)",
        );
        return;
      }
      if (!s.hash && s.current[0] === "#") {
        console.error(
          "don't use hash (#) in href. (requires config hash)",
        );
        return;
      }
    }
    let { fns, params } = s.match(pathname);
    const ctx = {} as Ctx;
    ctx.url = s.current;
    ctx.pathname = pathname;
    ctx.params = params;
    ctx.go = (url, type) => {
      s.goPath(url, type);
    };
    ctx.useAfter = (fn) => {
      mount = fn;
    };
    ctx.html = s.html;
    const render = (elem: TRet) => {
      s.render(elem);
      s.listenLink();
      if (mount) {
        const cleanup = mount();
        if (typeof cleanup === "function") {
          s.cleanup = cleanup;
        }
      }
    };
    const next: NextFunction = (err) => {
      let ret: TRet;
      try {
        ret = err ? s._onError(err, ctx) : fns[i++](ctx, next);
      } catch (e) {
        next(e);
      }
      if (ret !== void 0) {
        render(ret);
      }
    };
    ctx.lazy = (file, _name) => {
      file = s.cFile(file);
      const name = _name ||
        file.substring(file.lastIndexOf("/") + 1).replace(".js", "");
      if (s.controller[file]) {
        const ret = w[name](ctx, next);
        if (ret !== void 0) {
          render(ret);
        }
        return;
      }
      s.controller[file] = true;
      const script = w.document.createElement("script");
      script.src = file + s.vNow;
      script.type = "text/javascript";
      w.document.head.appendChild(script);
      script.onload = () => {
        const ret = w[name](ctx, next);
        if (ret !== void 0) {
          render(ret);
        }
      };
    };
    if (!fns) fns = [() => ""];
    fns = s.wares.concat(fns);
    next();
  }

  listenLink() {
    const links = w.document.querySelectorAll("[van-link]"), len = links.length;
    let i = 0;
    while (i < len) {
      const link: TRet = links[i];
      link.handle = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        const loc: string = link.getAttribute("href") ||
          link.getAttribute("van-link");
        if (this.current !== loc) {
          w.history.pushState({}, "", loc);
          w.__uHandler();
        }
      };
      link.addEventListener("click", link.handle);
      i++;
    }
  }

  resolve() {
    if (!w.__uHandler) w.__uHandler = () => this.handle();
    w.__uHandler();
    this.listenLink();
    w.addEventListener("popstate", () => {
      if (this.current !== w.location.hash) w.__uHandler();
    });
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

  goPath(path: string, type = "pushState") {
    (w as TRet).history[type]({}, "", (this.hash ? "#" : "") + path);
    w.__uHandler();
  }
}
