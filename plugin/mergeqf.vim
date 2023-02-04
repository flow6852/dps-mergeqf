function! mergeqf#createlist(titles) abort
    return denops#request('mergeqf', 'createlist', [a:titles])
endfunction

function! mergeqf#setlist(title, titles) abort
    return denops#request('mergeqf', 'setlist', [a:title, a:titles])
endfunction
