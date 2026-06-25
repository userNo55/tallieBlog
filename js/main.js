// Данные для кнопок
const SOURCES = [
    { id: 'playlist', title: 'Playlist' },
    { id: 'cinema', title: 'Cinema' },
    { id: 'tvshows', title: 'TV-shows' },
    { id: 'places', title: 'Places' }
];
const FAVORITES = [
    { id: 'food', title: 'Food' },
    { id: 'flower', title: 'Flower' },
    { id: 'perfume', title: 'Perfume' },
    { id: 'time', title: 'Time' }
];

const mainStage = document.getElementById('main-stage');
const contentStage = document.getElementById('content-stage');
const stageBody = document.getElementById('stage-body');
const backBtn = document.getElementById('back-btn');

document.addEventListener('DOMContentLoaded', () => {
    renderHeroBlocks();
    loadLists();
});

// Отрисовка кнопок на главной (исправлены ID)
function renderHeroBlocks() {
    const sourcesGrid = document.getElementById('hero-sources-grid');
    if(sourcesGrid) {
        sourcesGrid.innerHTML = SOURCES.map(item => 
            `<button class="box-btn" onclick="openSourcePost('source', '${item.id}')">${item.title}</button>`
        ).join('');
    }

    const favGrid = document.getElementById('hero-favorites-grid');
    if(favGrid) {
        favGrid.innerHTML = FAVORITES.map(item => 
            `<button class="box-btn" onclick="openSourcePost('favorite', '${item.id}')">${item.title}</button>`
        ).join('');
    }
}

// Навигация
document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', () => navigateTo(el.dataset.nav));
});

async function navigateTo(section) {
    if (section === 'main') { closeStage(); return; }
    
    mainStage.classList.remove('active-section');
    contentStage.style.opacity = '0';
    contentStage.classList.add('open');
    setTimeout(() => { contentStage.style.opacity = '1'; }, 50);

    const res = await fetch(`pages/${section}.html`);
    let html = await res.text();
    
    // Вставляем данные в шаблоны
    if (section === 'collection') html = html.replace('{{list}}', renderStoriesList());
    if (section === 'lab') html = html.replace('{{list}}', renderEssaysList());

    stageBody.innerHTML = html;
    backBtn.style.display = 'flex';
    backBtn.innerHTML = '← Close';
    backBtn.onclick = closeStage;

    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    const activeLink = document.querySelector(`.nav-links li[data-nav="${section}"]`);
    if (activeLink) activeLink.classList.add('active');
}

function closeStage() {
    contentStage.style.opacity = '0';
    setTimeout(() => {
        contentStage.classList.remove('open');
        mainStage.classList.add('active-section');
        document.querySelector('.nav-links li.active')?.classList.remove('active');
    }, 400);
}

// Загрузка данных
async function loadLists() {
    const storyFiles = ['born-fire.html', 'cynical.html'];
    window._cachedStories = storyFiles;
    const essayFiles = ['social.html', 'writing.html'];
    window._cachedEssays = essayFiles;
}

function renderStoriesList() {
    return window._cachedStories.map(file => {
        const id = file.replace('.html', '');
        return `<div class="list-link" onclick="loadStory('${file}')">${id.replace('-', ' ')}</div>`;
    }).join('');
}

function renderEssaysList() {
    return window._cachedEssays.map(file => {
        const id = file.replace('.html', '');
        return `<div class="list-link" onclick="loadEssay('${file}')">${id.replace('-', ' ')}</div>`;
    }).join('');
}

// Загрузка детальных страниц
async function loadStory(file) {
    contentStage.style.opacity = '0';
    setTimeout(async () => {
        const res = await fetch(`stories/${file}`);
        stageBody.innerHTML = await res.text();
        backBtn.innerHTML = '← Back to Collection';
        backBtn.onclick = () => navigateTo('collection');
        contentStage.style.opacity = '1';
    }, 300);
}

async function loadEssay(file) {
    contentStage.style.opacity = '0';
    setTimeout(async () => {
        const res = await fetch(`essays/${file}`);
        stageBody.innerHTML = await res.text();
        backBtn.innerHTML = '← Back to Lab';
        backBtn.onclick = () => navigateTo('lab');
        contentStage.style.opacity = '1';
    }, 300);
}

// Открытие постов из кнопок главной
function openSourcePost(type, id) {
    let title = '';
    if (type === 'source') title = SOURCES.find(s => s.id === id).title;
    else title = FAVORITES.find(s => s.id === id).title;
    
    contentStage.style.opacity = '0';
    contentStage.classList.add('open');
    setTimeout(() => {
        stageBody.innerHTML = `<div style="max-width:700px; margin:0 auto;"><h1 class="world-title" style="font-size:2.5rem;">${title}</h1><div class="story-text">My personal reflection on <b>${title}</b>.</div></div>`;
        backBtn.style.display = 'flex';
        backBtn.innerHTML = '← Back to Home';
        backBtn.onclick = closeStage;
        contentStage.style.opacity = '1';
    }, 300);
}