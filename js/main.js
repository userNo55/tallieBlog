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

function renderHeroBlocks() {
    const sourcesGrid = document.getElementById('sources-grid');
    if(sourcesGrid) {
        sourcesGrid.innerHTML = SOURCES.map(item => 
            `<button class="box-btn" onclick="openSourcePost('source', '${item.id}')">${item.title}</button>`
        ).join('');
    }

    const favGrid = document.getElementById('favorites-grid');
    if(favGrid) {
        favGrid.innerHTML = FAVORITES.map(item => 
            `<button class="box-btn" onclick="openSourcePost('favorite', '${item.id}')">${item.title}</button>`
        ).join('');
    }
}

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
    if (section === 'collection') html = html.replace('{{stories}}', window._cachedStoriesHTML || '');
    if (section === 'lab') html = html.replace('{{essays}}', window._cachedEssaysHTML || '');

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

async function loadLists() {
    const storyFiles = ['born-fire.html', 'cynical.html'];
    let storiesHtml = '';
    for (let i = 0; i < storyFiles.length; i++) {
        const file = storyFiles[i];
        const id = file.replace('.html', '');
        const res = await fetch(`stories/${file}`);
        const text = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const titleElement = doc.querySelector('.tv-title');
        const titleHTML = titleElement ? titleElement.innerHTML : (doc.querySelector('h1')?.innerHTML || id);
        const num = String(i + 1).padStart(2, '0');

        storiesHtml += `
            <div class="tv-card" onclick="loadStory('${file}')">
                <div class="tv-screen" style="background-image: url('images/${id}.jpg');">
                    <span class="tv-num">${num}</span>
                    <div class="tv-title-overlay">${titleHTML}</div>
                </div>
            </div>
        `;
    }
    window._cachedStoriesHTML = storiesHtml;

    const essayFiles = ['social.html', 'writing.html'];
    let essaysHtml = '';
    for (const file of essayFiles) {
        const id = file.replace('.html', '');
        const res = await fetch(`essays/${file}`);
        const text = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const title = doc.querySelector('h1')?.textContent || id;

        essaysHtml += `
            <div class="lab-card" style="background-image: url('images/${id}.jpg');" onclick="loadEssay('${file}')">
                <h3>${title}</h3>
            </div>
        `;
    }
    window._cachedEssaysHTML = essaysHtml;
}

async function loadStory(file) {
    contentStage.style.opacity = '0';
    setTimeout(async () => {
        const res = await fetch(`stories/${file}`);
        let html = await res.text();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const titleText = tempDiv.querySelector('h1.world-title')?.innerHTML || 'Untitled';
        const metaText = tempDiv.querySelector('.world-meta')?.innerHTML || '';
        const storyText = tempDiv.querySelector('.story-text')?.innerHTML || '';
        const placeBlock = tempDiv.querySelector('.place-block');
        const starBlock = tempDiv.querySelector('.star-block');
        const linkBlock = tempDiv.querySelector('.link-block');

        let newHtml = `<div class="world-detail"><h1 class="world-title">${titleText}</h1><div class="world-meta">${metaText}</div><div class="tabs-nav" id="tabs-container">`;
        if (placeBlock) newHtml += `<div class="tab-btn" data-tab="place">Place</div>`;
        if (starBlock) newHtml += `<div class="tab-btn" data-tab="star">Star</div>`;
        if (linkBlock) newHtml += `<div class="tab-btn" data-tab="link">Link</div>`;
        newHtml += `</div>`;
        if (placeBlock) newHtml += `<div class="tab-content" id="tab-place">${placeBlock.innerHTML}</div>`;
        if (starBlock) newHtml += `<div class="tab-content" id="tab-star">${starBlock.innerHTML}</div>`;
        if (linkBlock) newHtml += `<div class="tab-content" id="tab-link">${linkBlock.innerHTML}</div>`;
        newHtml += `<div class="story-text">${storyText}</div></div>`;
        stageBody.innerHTML = newHtml;

        const tabsContainer = document.getElementById('tabs-container');
        if (tabsContainer) {
            const tabs = tabsContainer.querySelectorAll('.tab-btn');
            const contents = document.querySelectorAll('.tab-content');
            if (tabs.length > 0 && contents.length > 0) {
                tabs[0].classList.add('active');
                contents[0].classList.add('active');
            }
            tabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    tabs.forEach(t => t.classList.remove('active'));
                    contents.forEach(c => c.classList.remove('active'));
                    this.classList.add('active');
                    const targetId = `tab-${this.dataset.tab}`;
                    const targetContent = document.getElementById(targetId);
                    if (targetContent) targetContent.classList.add('active');
                });
            });
        }
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