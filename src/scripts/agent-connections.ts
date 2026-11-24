export function setupAgentConnections() {
  const create = document.getElementById('create-agent-token') as HTMLButtonElement;
  if (!create) return;
  const status = document.getElementById('agent-token-status')!;
  const output = document.getElementById('agent-token') as HTMLInputElement;
  const fallback = document.getElementById('agent-copy-fallback')!;
  const copyText = document.getElementById('agent-copy-text') as HTMLTextAreaElement;
  let copyTrigger: HTMLButtonElement | null = null;
  const hideCopy = () => { fallback.hidden=true;copyText.value=''; };
  const endpoint = new URL('/api/mcp', location.origin).href;
  document.getElementById('agent-endpoint')!.textContent = endpoint;
  const report = (message:string, error=false) => { status.textContent=message;status.hidden=false;status.toggleAttribute('data-error',error); };
  const copy = async (text:string, success:string, label:string, triggerId:string, privateText=false) => {
    copyTrigger=document.getElementById(triggerId) as HTMLButtonElement;
    try { await navigator.clipboard.writeText(text);hideCopy();report(success); }
    catch {
      document.getElementById('agent-copy-label')!.textContent=label;
      copyText.value=text;fallback.hidden=false;copyText.focus();copyText.select();
      report(`Copy was blocked. The text below is selected; use your device’s Copy command.${privateText ? ' Keep tokens private.' : ''}`,true);
    }
  };
  document.getElementById('hide-agent-copy')!.addEventListener('click',()=>{hideCopy();copyTrigger?.focus();});
  document.getElementById('copy-agent-story')!.addEventListener('click',()=>copy(document.getElementById('agent-story-task')!.textContent!.trim(),'Story task copied. Paste it into your agent with a public repository URL or current checkout.','Project story task','copy-agent-story'));
  create.addEventListener('click',async()=>{
    create.disabled=true;report('Creating your connection…');
    try {
      const response=await fetch('/api/agent-token',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
      if(response.redirected)throw new Error('Your session ended. Reload Sidework and sign in again.');
      const value=await response.json();if(!response.ok)throw new Error(value.error || 'Could not create a token. Try again.');
      hideCopy();output.value=value.token;document.getElementById('agent-token-result')!.hidden=false;
      document.getElementById('agent-token-expiry')!.textContent=`Expires ${new Date(value.expiresAt).toLocaleString()}.`;
      report('Token ready. Copy it into your agent connection.');create.textContent='Create another token';
    }catch(error){report(error instanceof Error ? error.message : 'Could not connect. Try again.',true);}finally{create.disabled=false;}
  });
  document.getElementById('copy-agent-token')!.addEventListener('click',()=>copy(output.value,'Token copied. Paste it into your agent connection.','Agent token — keep private','copy-agent-token',true));
  document.getElementById('copy-agent-config')!.addEventListener('click',()=>copy(JSON.stringify({mcpServers:{sidework:{type:'http',url:endpoint,headers:{Authorization:`Bearer ${output.value}`}}}},null,2),'MCP config copied. It contains your private token.','MCP configuration — contains your private token','copy-agent-config',true));
  document.getElementById('copy-plugin-install')!.addEventListener('click',()=>copy('/plugin marketplace add mager/sidework\n/plugin install sidework@sidework','Install commands copied. Run them in Claude Code.','Claude Code install commands','copy-plugin-install'));
}
