function! mergeqf#createlist(arg) abort
    return denops#request('mergeqf', 'createlist', [a:arg])
endfunction

function! mergeqf#setlist(arg) abort
    return denops#request('mergeqf', 'setlist', [a:arg])
endfunction
