import { Denops } from "https://deno.land/x/denops_std@v4.0.0/mod.ts";
import { setqflist, getqflist } from "https://deno.land/x/denops_std@v4.0.0/function/mod.ts";

export type Args = {
    title: string;
    titles: Array<string>;
    withTitle: boolean;
    sep: string;
    forceUpdate: boolean;
};


export async function main(denops: Denops): Promise<void> {
    const mergeqfs = async (args: Args) => {
        let ret = new Array(0);
        if (args.titles.length){
            // initialize
            const clastid = await getqflist(denops, {"id": 0});
    
            for (let title of args.titles){
                for (let id:number = clastid.id; 0 < id; id--){
                    const nowqflist = await getqflist(denops, {"id": id, "items": 0, "title": 0});
                    if (!nowqflist.title.indexOf(title)) {
                        for (let items of nowqflist.items) {
                            if (args.withTitle) {
                                items.text = title + args.sep + items.text
                            }
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
        async crestelist(args: unknown) : Promise<unknown> {
            const mergedqf = await mergeqfs(args);
            return await Promise.resolve(mergedqf);
        },

        async setlist(args: unknown): Promise<void>{
            const clast = await getqflist(denops, {"id": 0, "title": 0});
            if ((args as Args).forceUpdate || clast.title != (args as Args).title) {
                const mergedqf = await mergeqfs(args as Args);
                await setqflist(denops, mergedqf, ' ');
                await setqflist(denops, [], 'a', {'title': (args as Args).title});
            }
        },
    };
};
