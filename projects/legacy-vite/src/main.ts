let currentFile = null;
let currentJSON = null;
let currentSVG = null;

const fileInput = document.getElementById('file');
const urlInput = document.getElementById('url');
const loadUrlBtn = document.getElementById('loadUrl');
const drop = document.getElementById('drop');
const convertBtn = document.getElementById('convert');
const downloadBtn = document.getElementById('download');
const copyBtn = document.getElementById('copy');
const preview = document.getElementById('preview');
const dbg = document.getElementById('dbg');
const meta = document.getElementById('meta');

function setMeta(j) {
  try {
    const frames = (j?.op ?? 0) - (j?.ip ?? 0);
    const fps = j?.fr ?? '?';
    const size = `${j?.w ?? '?'}×${j?.h ?? '?'}`;
    meta.textContent = `Frames: ${frames} @ ${fps}fps • ${size}`;
  } catch { meta.textContent = ''; }
}

fileInput.addEventListener('change', async (e) => {
  const f = fileInput.files?.[0];
  if (!f) return;
  currentFile = f;
  currentJSON = null;
  dbg.textContent = '';
  const txt = await f.text();
  try {
    const j = JSON.parse(txt);
    currentJSON = j;
    setMeta(j);
    dbg.textContent = JSON.stringify(j, null, 2).slice(0, 6000);
  } catch (err) {
    alert('Invalid JSON: ' + err?.message);
  }
});

loadUrlBtn.addEventListener('click', async () => {
  const url = urlInput.value.trim();
  if (!url) return alert('Введите URL');
  try {
    const fd = new FormData();
    fd.set('url', url);
    const resp = await fetch('http://localhost:5174/api/convert', { method: 'POST', body: fd });
    if (!resp.ok) throw new Error(await resp.text());
    const svg = await resp.text();
    currentSVG = svg;
    preview.data = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    downloadBtn.disabled = false;
    copyBtn.disabled = false;
    dbg.textContent = 'Получено SVG с сервера (по URL).\n' + svg.slice(0, 2000);
    meta.textContent = 'Источник: ' + url;
  } catch (e) {
    alert('Ошибка: ' + e?.message);
  }
});

drop.addEventListener('dragover', (e) => {
  e.preventDefault();
  drop.classList.add('over');
});
drop.addEventListener('dragleave', () => drop.classList.remove('over'));
drop.addEventListener('drop', async (e) => {
  e.preventDefault();
  drop.classList.remove('over');
  const f = e.dataTransfer?.files?.[0];
  if (!f) return;
  currentFile = f;
  currentJSON = null;
  const txt = await f.text();
  try {
    const j = JSON.parse(txt);
    currentJSON = j;
    setMeta(j);
    dbg.textContent = JSON.stringify(j, null, 2).slice(0, 6000);
  } catch (err) {
    alert('Invalid JSON: ' + err?.message);
  }
});

convertBtn.addEventListener('click', async () => {
  try {
    const fd = new FormData();
    if (currentFile) {
      fd.set('file', currentFile);
    } else if (currentJSON) {
      fd.set('json', JSON.stringify(currentJSON));
    } else {
      return alert('Сначала выберите файл или вставьте URL');
    }
    const resp = await fetch('http://localhost:5174/api/convert', { method: 'POST', body: fd });
    if (!resp.ok) throw new Error(await resp.text());
    const svg = await resp.text();
    currentSVG = svg;
    preview.data = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    downloadBtn.disabled = false;
    copyBtn.disabled = false;
    dbg.textContent = 'SVG получен с сервера.\n' + svg.slice(0, 2000);
  } catch (e) {
    alert('Ошибка конвертации: ' + e?.message);
  }
});

downloadBtn.addEventListener('click', () => {
  if (!currentSVG) return;
  const a = document.createElement('a');
  a.href = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(currentSVG);
  a.download = 'converted.svg';
  a.click();
});

copyBtn.addEventListener('click', async () => {
  if (!currentSVG) return;
  try {
    await navigator.clipboard.writeText(currentSVG);
    copyBtn.textContent = 'Скопировано ✓';
    setTimeout(() => copyBtn.textContent = 'Скопировать SVG', 1500);
  } catch {
    alert('Не удалось скопировать в буфер');
  }
});
