import { Denops } from "https://deno.land/x/denops_std@v4.0.0/mod.ts";
import {
  getqflist,
  setqflist,
} from "https://deno.land/x/denops_std@v4.0.0/function/mod.ts";

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
  bufnr: number;
  col: number;
  lnum: number;
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
  bufnr?: number;
  col?: number;
  id?: number;
  lnum?: number;
  title?: string;
  all?: number;
};

export async function main(denops: Denops): Promise<void> {
  const mergeqfs = async (args: Args) => {
    let ret = new Array(0);
    if (args.sources.length) {
      // initialize
      const clastid = (await getqflist(denops, { "id": 0 }) as QuickFix).id;

      for (let src of args.sources) {
        for (let id: number = clastid; 0 < id; id--) {
          const nowqflist = await getqflist(denops, {
            "id": id,
            "all": 0,
          }) as QuickFix;
          if (isContain(nowqflist, src)) {
            for (let items of nowqflist.items) {
              // format text
              const regexp = new RegExp(/(\s|\t|\n|\v)+/g);
              const text: string = src.format.replaceAll(regexp, " ")
                .replaceAll(
                  "%i",
                  String(nowqflist.id),
                ).replaceAll(
                  "%b",
                  String(items.bufnr),
                ).replaceAll(
                  "%c",
                  String(items.col),
                ).replaceAll(
                  "%l",
                  String(items.lnum),
                ).replaceAll(
                  "%T",
                  nowqflist.title,
                ).replaceAll(
                  "%y",
                  items.type,
                ).replaceAll(
                  "%t",
                  items.text,
                );
              items.text = text;
              ret.push(items);
            }
            break;
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

function isContain (qf: QuickFix, src: SourceFilter) {
  let ret = true;
  for (const key of Object.keys(src.what)) {
    switch (key) {
      case "bufnr":
        ret = ret && (qf.bufnr == src.what.bufnr);
        break;
      case "col":
        ret = ret && (qf.col == src.what.col);
        break;
      case "id":
        ret = ret && (qf.id == src.what.id);
        break;
      case "lnum":
        ret = ret && (qf.lnum == src.what.lnum);
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
