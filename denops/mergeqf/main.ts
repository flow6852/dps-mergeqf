import { Denops } from "https://deno.land/x/denops_std@v4.0.0/mod.ts";
import { setqflist, getqflist } from "https://deno.land/x/denops_std@v4.0.0/function/mod.ts";
import { ensureString, ensureArray } from "https://deno.land/x/unknownutil@v2.1.0/mod.ts";

export async function main(denops: Denops): Promise<void> {
    const mergeqfs = async (titles: unknown) => {
        let ret = new Array(0);
        if (titles.length){
            // initialize
            const clastid = await getqflist(denops, {"id": 0});
    
            for (let title of titles){
                for (let id:number = clastid.id; 0 < id; id--){
                    const nowqflist = await getqflist(denops, {"id": id, "items": 0, "title": 0});
                    if (title === nowqflist.title) {
                        for (let item of nowqflist.items) {
                            ret.push(item);
                        }
                        break;
                    }
                }
            }
        }
        return ret;
    };

    denops.dispatcher = {
        async crestelist(titles:unknown) : Promise<unknown> {
            const mergedqf = await mergeqfs(titles);
            return await Promise.resolve(mergedqf);
        },

        async setlist(title: unknown, titles: unknown): Promise<unknown>{
            const clast = await getqflist(denops, {"id": 0, "title": 0});
            if (clast.title != title) {
                const mergedqf = await mergeqfs(titles);
                await setqflist(denops, mergedqf, ' ');
                await setqflist(denops, [], 'a', {'title': 'ddu-qf'});
            }
        },
    };
};
