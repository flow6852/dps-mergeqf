import { Denops } from "https://deno.land/x/denops_std@v4.0.0/mod.ts";
import {
  bufname,
  getcwd,
  getqflist,
  setqflist,
} from "https://deno.land/x/denops_std@v4.0.0/function/mod.ts";
import {
  basename,
  isAbsolute,
} from "https://deno.land/std@0.177.0/path/mod.ts";

export type Args = {
  sources: Array<SourceFilter>;
  title: string;
  forceUpdate: boolean;
};

type SourceFilter = {
  what: What;
  format: string;
  isSubst: boolean;
  dup: boolean;
  loc: boolean;
};

type QuickFix = {
  id: number;
  items: QuickFixItem[];
  nr: number;
  qfbufnr: number;
  size: number;
  title: string;
};

type QuickFixItem = {
  bufnr: number;
  col: number;
  lnum: number;
  text: string;
  type: string;
};

type What = {
  id?: number;
  nr?: number;
  qfbufnr?: number;
  size?: number;
  title?: string;
};

export async function main(denops: Denops): Promise<void> {
  const mergeqfs = async (args: Args) => {
    let ret = new Array(0);
    if (args.sources.length) {
      // initialize
      const clastid = (await getqflist(denops, { "id": 0 }) as QuickFix).id;

      for (let src of args.sources) {
        for (let id: number = clastid; 0 < id; id--) {
          // default {what}
          // if use {all: 0}, `getqflist` get items
          const what: What = {
            id: id,
            nr: 0,
            qfbufnr: 0,
            title: "",
            size: 0,
          };

          const nowqflist = await getqflist(denops, what) as QuickFix;

          if (isContain(nowqflist, src)) {
            const qflist = await getqflist(denops, {
              id: id,
              all: 0,
            }) as QuickFix;
            for (let items of qflist.items) {
              const path = isAbsolute(await bufname(denops, items.bufnr))
                ? await bufname(denops, items.bufnr)
                : await getcwd(denops) + "/" +
                  await bufname(denops, items.bufnr);
              // format text
              const regexp = new RegExp(/(\s|\t|\n|\v)+/g);
              const text: string = src.format.replaceAll(regexp, " ")
                .replaceAll(
                  "%i",
                  String(qflist.id),
                ).replaceAll(
                  "%n",
                  String(items.bufnr),
                ).replaceAll(
                  "%c",
                  String(items.col),
                ).replaceAll(
                  "%l",
                  String(items.lnum),
                ).replaceAll(
                  "%T",
                  qflist.title,
                ).replaceAll(
                  "%y",
                  items.type,
                ).replaceAll(
                  "%b",
                  basename(await bufname(denops, items.bufnr)),
                ).replaceAll(
                  "%p",
                  await bufname(denops, items.bufnr),
                ).replaceAll(
                  "%P",
                  path,
                ).replaceAll(
                  "%t",
                  items.text,
                );
              items.text = text;
              ret.push(items);
            }
            if (!src.dup) {
              break;
            }
          }
        }
      }
    }
    return ret;
  };

  denops.dispatcher = {
    async crestelist(args: unknown): Promise<unknown> {
      const mergedqf = await mergeqfs(args as Args);
      return await Promise.resolve(mergedqf);
    },

    async setlist(args: unknown): Promise<void> {
      const clast = await getqflist(denops, {
        "id": 0,
        "title": 0,
      }) as QuickFix;
      if ((args as Args).forceUpdate || clast.title != (args as Args).title) {
        const mergedqf = await mergeqfs(args as Args);
        await setqflist(denops, mergedqf, " ");
        await setqflist(denops, [], "a", { "title": (args as Args).title });
      }
    },
  };
}

function isContain(qf: QuickFix, src: SourceFilter) {
  let ret = true;
  for (const key of Object.keys(src.what)) {
    switch (key) {
      case "qfbufnr":
        ret = ret && (qf.qfbufnr == src.what.qfbufnr);
        break;
      case "nr":
        ret = ret && (qf.nr == src.what.nr);
        break;
      case "size":
        ret = ret && (qf.size == src.what.size);
        break;
      case "id":
        ret = ret && (qf.id == src.what.id);
        break;
      case "title":
        ret = ret &&
          (src.isSubst
            ? (!qf.title.indexOf(src.what.title as string))
            : (qf.title == src.what.title));
        break;
    }
  }
  return ret;
}
