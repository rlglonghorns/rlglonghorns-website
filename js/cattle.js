// =============================================
// RLG Longhorns - Dynamic Cattle Page Loader
// =============================================

async function loadCattleData(folder) {
  // Fetch the list of markdown files from GitHub raw content
  const baseUrl = 'https://raw.githubusercontent.com/rlglonghorns/rlglonghorns-website/main/_data/';
  
  try {
    // Fetch index of files via GitHub API
    const response = await fetch(`https://api.github.com/repos/rlglonghorns/rlglonghorns-website/contents/_data/${folder}`);
    if (!response.ok) return [];
    const files = await response.json();
    
    const animals = [];
    for (const file of files) {
      if (!file.name.endsWith('.md')) continue;
      const raw = await fetch(file.download_url);
      const text = await raw.text();
      const data = parseFrontMatter(text);
      animals.push(data);
    }
    return animals;
  } catch (e) {
    console.error('Error loading cattle data:', e);
    return [];
  }
}

function parseFrontMatter(text) {
  const lines = text.replace(/^---\n/, '').split('\n');
  const data = {};
  for (const line of lines) {
    if (line === '---') break;
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
    data[key] = value;
  }
  return data;
}

function getStatusClass(status) {
  if (!status) return '';
  const s = status.toLowerCase();
  if (s.includes('available')) return 'status-available';
  if (s.includes('herd sire') || s.includes('not for sale')) return 'status-not-for-sale';
  if (s.includes('sold')) return 'status-sold';
  return '';
}

function renderCattleCard(animal) {
  const statusClass = getStatusClass(animal.status);
  const photo = animal.photo || 'images/ranch/hero.jpg';
  return `
    <div class="cattle-card">
      <img src="${photo}" alt="${animal.title || ''}" class="cattle-card-img" onerror="this.src='images/ranch/hero.jpg'" />
      <div class="cattle-card-body">
        <h2 class="cattle-name">${animal.title || ''}</h2>
        ${animal.sire ? `<div class="cattle-detail"><span class="cattle-detail-label">Sire</span><span>${animal.sire}</span></div>` : ''}
        ${animal.dam ? `<div class="cattle-detail"><span class="cattle-detail-label">Dam</span><span>${animal.dam}</span></div>` : ''}
        ${animal.dob ? `<div class="cattle-detail"><span class="cattle-detail-label">DOB</span><span>${animal.dob}</span></div>` : ''}
        ${animal.tlbaa ? `<div class="cattle-detail"><span class="cattle-detail-label">TLBAA #</span><span>${animal.tlbaa}</span></div>` : ''}
        ${animal.price ? `<div class="cattle-detail"><span class="cattle-detail-label">Price</span><span>${animal.price}</span></div>` : ''}
        ${animal.status ? `<span class="cattle-status ${statusClass}">${animal.status}</span>` : ''}
      </div>
    </div>`;
}

function renderHerdSireCard(animal) {
  const photo = animal.photo || 'images/ranch/hero.jpg';
  return `
    <div class="herd-sire-card">
      <img src="${photo}" alt="${animal.title || ''}" onerror="this.src='images/ranch/hero.jpg'" />
      <div class="herd-sire-body">
        <h2 class="cattle-name">${animal.title || ''}</h2>
        ${animal.sire ? `<div class="cattle-detail"><span class="cattle-detail-label">Sire</span><span>${animal.sire}</span></div>` : ''}
        ${animal.dam ? `<div class="cattle-detail"><span class="cattle-detail-label">Dam</span><span>${animal.dam}</span></div>` : ''}
        ${animal.dob ? `<div class="cattle-detail"><span class="cattle-detail-label">DOB</span><span>${animal.dob}</span></div>` : ''}
        ${animal.tlbaa ? `<div class="cattle-detail"><span class="cattle-detail-label">TLBAA #</span><span>${animal.tlbaa}</span></div>` : ''}
        <span class="cattle-status status-herd-sire">Herd Sire · Not For Sale</span>
      </div>
    </div>`;
}

function renderSoldCard(animal) {
  const photo = animal.photo || 'images/ranch/hero.jpg';
  return `
    <div class="sold-card">
      <img src="${photo}" alt="${animal.title || 'Sold Longhorn'}" onerror="this.src='images/ranch/hero.jpg'" />
      <span class="sold-badge">Sold</span>
    </div>`;
}

async function initCattlePage(folder, containerId, mode) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = '<p style="color:var(--text-light);font-style:italic;padding:2rem 0;">Loading...</p>';
  
  const animals = await loadCattleData(folder);
  
  if (animals.length === 0) {
    container.innerHTML = '<div class="empty-state"><h3>No Animals Currently Listed</h3><p>Check back soon or contact Robert for availability.</p></div>';
    return;
  }
  
  if (mode === 'herd-sire') {
    container.innerHTML = renderHerdSireCard(animals[0]);
  } else if (mode === 'sold') {
    container.innerHTML = animals.map(renderSoldCard).join('');
  } else {
    container.innerHTML = animals.map(renderCattleCard).join('');
  }
}
