async () => {
 const checks=[]; const ok=(name,value)=>{if(!value)throw new Error(name);checks.push(name)};
 const $=s=>document.querySelector(s), visible=()=>[...document.querySelectorAll('.event')].filter(e=>!e.hidden).map(e=>e.id);
 const set=(id,value)=>{$('#'+id).value=value;$('#'+id).dispatchEvent(new Event('input',{bubbles:true}));};
 $('#filters').reset();ok('46 events',visible().length===46);
 for (const grade of ['A','B']) {set('priority',grade);ok('medFEL in '+grade,visible().includes('medfel'));}
 $('#filters').reset();set('country','DE');set('sector','logistics');ok('combined filters',visible().length===4);
 set('search','fruit');ok('keyword combination',visible().length===2);
 $('#filters').reset();set('search','proteinees');ok('accent-insensitive search',visible().includes('proteinees'));
 set('search','zzzz-not-found');ok('empty state',!$('#empty').hidden && $('#event-list').hidden);
 $('#empty-reset').click();ok('reset',visible().length===46);
 $('[data-view="new"]').click();ok('24 additions',visible().length===24);
 $('#filters').reset();$('#fruit-logistica .save-event').click();$('[data-view="saved"]').click();
 ok('saved filter',visible().length===1 && visible()[0]==='fruit-logistica');
 ok('saved persistence',JSON.parse(localStorage.getItem('rex-opportunities-saved')).includes('fruit-logistica'));
 $('#fruit-logistica .save-event').click();ok('remove saved',visible().length===0 && !$('#empty').hidden);
 location.hash='frames';await new Promise(r=>setTimeout(r,350));ok('filtered deep link',!$('#frames').hidden && $('#frames').open && visible().length===46);
 $('#sort').value='deadline';$('#sort').dispatchEvent(new Event('change',{bubbles:true}));ok('deadline ordering',$('#event-list .event').id==='fosdem');
 $('#frames summary').click();await new Promise(r=>setTimeout(r,240));ok('collapse',!$('#frames').open);
 $('#frames summary').click();await new Promise(r=>setTimeout(r,240));ok('expand',$('#frames').open);
 $('#expand').click();ok('expand visible',[...document.querySelectorAll('.event')].every(e=>e.open));
 $('#expand').click();ok('collapse visible',[...document.querySelectorAll('.event')].every(e=>!e.open));
 $('[data-window="7"]').click();ok('7-day reminders',document.querySelectorAll('.deadline-list li:not([hidden])').length===4);
 $('[data-window="30"]').click();ok('30-day reminders',document.querySelectorAll('.deadline-list li:not([hidden])').length===7);
 const txt=await (await fetch('../prompt.txt')).text();ok('prompt download equality',$('#prompt-text').textContent===txt);
 ok('Europe scope',!txt.includes('约 300 公里')&&txt.includes('德国'));
 const descriptor=Object.getOwnPropertyDescriptor(navigator,'clipboard');
 try {
  Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw Error('denied')}},configurable:true});
  $('#copy-prompt').click();await new Promise(r=>setTimeout(r,20));
  ok('copy fallback',getSelection().toString().trimEnd()===txt.trimEnd());
 } finally {
  if(descriptor)Object.defineProperty(navigator,'clipboard',descriptor);else delete navigator.clipboard;
 }
 getSelection().removeAllRanges();$('#prompt-text').closest('details').open=false;
 set('country','NL');window.dispatchEvent(new Event('beforeprint'));ok('print all',visible().length===46);
 window.dispatchEvent(new Event('afterprint'));ok('restore after print',visible().length===1&&visible()[0]==='webwinkel');
 $('#filters').reset();history.replaceState(null,'',location.pathname);scrollTo({top:0,behavior:'instant'});
 ok('no mobile overflow',document.documentElement.scrollWidth<=innerWidth);
 return {passed:checks.length,checks,width:innerWidth};
}
