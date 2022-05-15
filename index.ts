type TRet = any;
type TObject = Record<string, TRet>;
export type NextFunction = (err?: Error) => TRet;
export interface Context {
  render: (elem: TRet) => TRet;
  params: TObject;
  lazy(file: string, name?: string): void;
  html: TRet;
  unmount(fn: () => void): this;
  go(url: string, type?: string): void;
  url: string;
  path: string;
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
};

const w = typeof window !== "undefined"
  ? window
  : {} as Window & { [k: string]: any };

export class VanRouter<Ctx extends Context = Context> {
  routes: TObject[] = [];
  private render: (elem: TRet) => TRet;
  private base: string = "";
  private wares: Handler[] = [];
  private current!: string;
  private unmount!: (() => void) | undefined;
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
  }

  add(path: string, ...fns: Array<Handler<Ctx>>) {
    path = this.base + path;
    const str = path
      .replace(/\/$/, "")
      .replace(/:(\w+)(\?)?(\.)?/g, "$2(?<$1>[^/]+)$2$3")
      .replace(/(\/?)\*/g, (_, p) => `(${p}.*)?`)
      .replace(/\.(?=[\w(])/, "\\.");
    const regex = new RegExp(`^${str}/*$`);
    this.routes.push({ path, fns, regex });
    return this;
  }

  match(path: string) {
    let fns: any,
      params = {},
      j = 0,
      el: TObject,
      arr = this.routes,
      len = arr.length;
    while (j < len) {
      el = arr[j];
      if (el.regex.test(path)) {
        if (el.isParam) params = el.regex.exec(path).groups || {};
        fns = el.fns;
        break;
      }
      j++;
    }
    return { fns, params };
  }

  use(...fns: Array<Handler<Ctx>>) {
    this.wares = this.wares.concat(fns as TRet);
    return this;
  }

  handle() {
    if (this.unmount !== void 0) {
      this.unmount();
      this.unmount = void 0;
    }
    let { pathname: path, search, hash: h } = w.location, i = 0;
    if (h) {
      if (path[path.length - 1] === "/") path = path.slice(0, -1);
      path = (path === "/" ? "/" : path + "/") + h.substring(2);
      this.current = h + search;
    } else this.current = path + search;
    let { fns, params } = this.match(path);
    const ctx = {} as Ctx;
    ctx.url = this.current;
    ctx.path = path;
    ctx.params = params;
    ctx.go = (url, type) => this.goPath(url, type);
    ctx.unmount = (fn) => {
      this.unmount = fn;
      return ctx;
    };
    const _render = (elem: TRet) => {
      this.render(elem);
      this.listenLink();
    };
    ctx.html = this.html;
    const next: NextFunction = (err) => {
      const ret = err ? this._onError(err, ctx) : fns[i++](ctx, next);
      if (ret !== void 0) {
        return _render(ret);
      }
    };
    ctx.lazy = (file, _name) => {
      file = this.cFile(file);
      const name = _name ||
        file.substring(file.lastIndexOf("/") + 1).replace(".js", "");
      if (this.controller[file]) return w[name](ctx, next);
      this.controller[file] = true;
      const script = w.document.createElement("script");
      script.src = file + this.vNow;
      script.type = "text/javascript";
      w.document.head.appendChild(script);
      script.onload = () => w[name](ctx, next);
    };
    if (!fns) fns = [() => ""];
    fns = this.wares.concat(fns);
    next();
  }

  listenLink() {
    let links = w.document.querySelectorAll("[u-link]"),
      i = 0,
      len = links.length;
    while (i < len) {
      const link: TRet = links[i];
      link.handle = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        const loc: string = link.getAttribute("href") ||
          link.getAttribute("u-link");
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
    (w as TRet).history[type]({}, "", path);
    w.__uHandler();
  }
}
