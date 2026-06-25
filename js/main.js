// ---- Источники магии и фавориты (Статика) ----
const SOURCES = [
    { id: 'playlist', title: 'Playlist' }, { id: 'cinema', title: 'Cinema' },
    { id: 'tvshows', title: 'TV-shows' }, { id: 'places', title: 'Places' }
];
const FAVORITES = [
    { id: 'food', title: 'Food' }, { id: 'flower', title: 'Flower' },
    { id: 'perfume', title: 'Perfume' }, { id: 'time', title: 'Time' }
];

// ---- UI ДВИЖОК ----
const mainStage = document.getElementById('main-stage');
const contentStage = document.getElementById('content-stage');
const stageBody = document.getElementById('stage-body');
const backBtn = document.getElementById('back-btn');
const closeBtn = document.getElementById('close-btn');

// Отрисовка кнопок на главной
document.addEventListener('DOMContentLoaded', () => {
    renderGrid('sources-grid', SOURCES, 'source');
    renderGrid('favorites-grid', FAVORITES, 'favorite');
    loadLists();
});

function renderGrid(containerId, items, type) {
    const grid = document.getElementById(containerId);
    grid.innerHTML = items.map(item => 
        `<button class="source-btn" onclick="openSourcePost('${type}', '${item.id}')">${item.title}</button>`
    ).join('');
}

// ---- НАВИГАЦИЯ ----
document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', () => navigateTo(el.dataset.nav));
});

async function navigateTo(section) {
    if(section === 'main') { closeStage(); return; }
    
    mainStage.classList.remove('active-section');
    contentStage.style.opacity = '0';
    contentStage.classList.add('open');
    setTimeout(() => { contentStage.style.opacity = '1'; }, 50);

    const res = await fetch(`pages/${section}.html`);
    let html = await res.text();

    if(section === 'collection') html = html.replace('{{stories}}', window._cachedStoriesHTML || '');
    if(section === 'lab') html = html.replace('{{essays}}', window._cachedEssaysHTML || '');

    stageBody.innerHTML = html;
    
    backBtn.style.display = 'flex';
    closeBtn.style.display = 'none';
    backBtn.innerHTML = '← Close';
    backBtn.onclick = closeStage;
    
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    document.querySelector(`.nav-links li[data-nav="${section}"]`)?.classList.add('active');
}

function closeStage() {
    contentStage.style.opacity = '0';
    setTimeout(() => {
        contentStage.classList.remove('open');
        mainStage.classList.add('active-section');
        document.querySelector('.nav-links li.active')?.classList.remove('active');
    }, 400);
}

// ---- ЗАГРУЗКА СПИСКОВ ----
async function loadLists() {
    // Список историй (Ты просто добавляешь сюда имя файла без .html)
    const storyIds = ['born-fire', 'cynical']; 
    
    let storiesHtml = '';
    for (let i = 0; i < storyIds.length; i++) {
        const id = storyIds[i];
        // Парсим только заголовок и код из файла (чтобы знать, что писать на ТВ)
        const res = await fetch(`stories/${id}.html`);
        const text = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        
        const title = doc.querySelector('.tv-title')?.textContent || id;
        const code = doc.querySelector('.tv-code')?.textContent || '// NO_CODE';
        
        // Картинка берется тупо по имени файла: images/born-fire.jpg
        storiesHtml += `
            <div class="tv-card" onclick="loadStory('${id}')">
                <div class="tv-screen" style="background-image: url('images/${id}.jpg');">
                    <span class="tv-num">${String(i + 1).padStart(2, '0')}</span>
                </div>
                <div class="tv-info">
                    <h3>${title}</h3>
                    <div class="code">${code}</div>
                </div>
            </div>
        `;
    }
    window._cachedStoriesHTML = storiesHtml;

    // Список эссе
    const essayIds = ['social', 'writing'];
    let essaysHtml = '';
    for (const id of essayIds) {
        const res = await fetch(`essays/${id}.html`);
        const text = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const title = doc.querySelector('.tv-title')?.textContent || id;
        
        essaysHtml += `
            <div class="lab-card" style="background-image: url('images/${id}.jpg');" onclick="loadEssay('${id}')">
                <h3>${title}</h3>
            </div>
        `;
    }
    window._cachedEssaysHTML = essaysHtml;
}

// ---- ЗАГРУЗКА ПО КЛИКУ ----
async function loadStory(id) {
    contentStage.style.opacity = '0';
    setTimeout(async () => {
        const res = await fetch(`stories/${id}.html`);
        stageBody.innerHTML = await res.text();
        backBtn.innerHTML = '← Back to Collection';
        backBtn.onclick = () => navigateTo('collection');
        contentStage.style.opacity = '1';
    }, 300);
}

async function loadEssay(id) {
    contentStage.style.opacity = '0';
    setTimeout(async () => {
        const res = await fetch(`essays/${id}.html`);
        stageBody.innerHTML = await res.text();
        backBtn.innerHTML = '← Back to Lab';
        backBtn.onclick = () => navigateTo('lab');
        contentStage.style.opacity = '1';
    }, 300);
}

function openSourcePost(type, id) {
    let title = '';
    if(type === 'source') title = SOURCES.find(s => s.id === id).title;
    else title = FAVORITES.find(s => s.id === id).title;

    contentStage.style.opacity = '0';
    contentStage.classList.add('open');
    setTimeout(() => {
        stageBody.innerHTML = `
            <div style="max-width:700px; margin:0 auto;">
                <h1 class="world-title" style="font-size:2.5rem;">${title}</h1>
                <div class="story-text">My personal reflection on <b>${title}</b>.</div>
            </div>
        `;
        backBtn.style.display = 'flex';
        backBtn.innerHTML = '← Back to Home';
        backBtn.onclick = closeStage;
        contentStage.style.opacity = '1';
    }, 300);
}