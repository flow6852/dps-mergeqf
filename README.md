# dps-mergeqf

## Required

### denops 

https://github.com/vim-denops/denops.vim

## Exapmle

```
" https://github.com/Shougo/ddu.vim
" https://github.com/Shougo/ddu-kind-file
" https://github.com/Shougo/ddu-ui-ff
" https://github.com/flow6852/ddu-source-qf

function! Ddu_qf() abort
    let qftitle = 'ddu-qf'
    call mergeqf#setlist(qftitle, ['Diagnostics','VimTeX errors (LaTeX logfile)'])
    call ddu#start({'ui': 'ff', 'sources': [{'name': 'qf'}], 'sourceParams': {'qf': {'title': qftitle}}})
endfunction

augroup mergeqf 
    autocmd!
    autocmd BufWritePost * lua vim.diagnostic.setqflist({open=false})
augroup END

nmap <silent> ;q <Cmd> call Ddu_qf()<CR>
```

# Demo

## quickfixs

* https://github.com/lervag/vimtex
* built-in lsp

https://user-images.githubusercontent.com/42508708/216801105-f83bc38b-348e-4881-88c4-83fb33bda6b5.mp4

