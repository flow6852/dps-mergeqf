# dps-mergeqf

## Required

### denops 

https://github.com/vim-denops/denops.vim

## Exapmle

```
function! Ddu_qf() abort
    let qftitle = 'ddu-qf'
    call mergeqf#setlist(qftitle, ['Diagnostics','VimTeX errors (LaTeX logfile)'])
    " https://github.com/Shougo/ddu.vim
    " https://github.com/Shougo/ddu-kind-file
    " https://github.com/Shougo/ddu-ui-ff
    call ddu#start({'ui': 'ff', 'sources': [{'name': 'qf'}], 'sourceParams': {'qf': {'title': qftitle}}})
endfunction

" https://github.com/flow6852/ddu-source-qf
nmap <silent> ;q <Cmd> call Ddu_qf()<CR>
```
