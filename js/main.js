// ---- Источники магии и фавориты ----
const SOURCES = [
    { id: 'playlist', title: 'Playlist' }, { id: 'cinema', title: 'Cinema' },
    { id: 'tvshows', title: 'TV-shows' }, { id: 'places', title: 'Places' }
];
const FAVORITES = [
    { id: 'food', title: 'Food' }, { id: 'flower', title: 'Flower' },
    { id: 'perfume', title: 'Perfume' }, { id: 'time', title: 'Time' }
];

// ---- UI ----
const mainStage = document.getElementById('main-stage');
const contentStage = document.getElementById('content-stage');
const stageBody = document.getElementById('stage-body');
const backBtn = document.getElementById('back-btn');
const closeBtn = document.getElementById('close-btn');

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
    // Список файлов историй.
    const storyFiles = ['born-fire.html', 'cynical.html']; 
    
    let storiesHtml = '';
    for (let i = 0; i < storyFiles.length; i++) {
        const file = storyFiles[i];
        const id = file.replace('.html', '');

        const res = await fetch(`stories/${file}`);
        const text = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const title = doc.querySelector('h1')?.textContent || id;

        const num = String(i + 1).padStart(2, '0');

        storiesHtml += `
            <div class="tv-card" onclick="loadStory('${file}')">
                <div class="tv-screen" style="background-image: url('images/${id}.jpg');">
                    <span class="tv-num">${num}</span>
                </div>
                <div class="tv-info">
                    <h3>${title}</h3>
                </div>
            </div>
        `;
    }
    window._cachedStoriesHTML = storiesHtml;

    // Эссе
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

// ---- ИСПРАВЛЕННАЯ ЗАГРУЗКА СТРАНИЦЫ ИСТОРИИ (ТАБЫ) ----
async function loadStory(file) {
    contentStage.style.opacity = '0';
    setTimeout(async () => {
        // Загружаем HTML
        const res = await fetch(`stories/${file}`);
        let html = await res.text();

        // 1. Ищем заголовок
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const h1 = tempDiv.querySelector('h1');
        const titleText = h1 ? h1.textContent : 'Untitled';
        const metaText = tempDiv.querySelector('.world-meta')?.innerHTML || '';

        // 2. Создаем структуру с ТАБАМИ (вкладками)
        let newHtml = `
            <div class="world-detail">
                <h1 class="world-title">${titleText}</h1>
                <div class="world-meta">${metaText}</div>
                
                <!-- Меню вкладок -->
                <div class="tabs-nav" style="display:flex; gap:20px; margin: 30px 0; border-bottom: 1px solid #222; padding-bottom: 10px;">
        `;

        // Ищем блоки Place, Star, Link внутри загруженного HTML
        const placeBlock = tempDiv.querySelector('.tag-box:has(h4:contains("Place"))') || tempDiv.querySelector('.place-block');
        const starBlock = tempDiv.querySelector('.tag-box:has(h4:contains("Star"))') || tempDiv.querySelector('.star-block');
        const linkBlock = tempDiv.querySelector('.tag-box:has(h4:contains("Link"))') || tempDiv.querySelector('.link-block');
        const storyText = tempDiv.querySelector('.story-text');

        // Наполняем меню вкладок (только если блок есть в файле)
        if(placeBlock) newHtml += `<div class="tab-btn" data-target="place" style="cursor:pointer; color:#888; text-transform:uppercase; font-size:12px; letter-spacing:1px;">Place</div>`;
        if(starBlock) newHtml += `<div class="tab-btn" data-target="star" style="cursor:pointer; color:#888; text-transform:uppercase; font-size:12px; letter-spacing:1px;">Star</div>`;
        if(linkBlock) newHtml += `<div class="tab-btn" data-target="link" style="cursor:pointer; color:#888; text-transform:uppercase; font-size:12px; letter-spacing:1px;">Link</div>`;
        
        newHtml += `</div> <!-- end tabs-nav -->`;

        // 3. Контейнеры для контента вкладок (изначально скрыты, кроме первой, если есть)
        let isFirst = true;
        if(placeBlock) {
            newHtml += `<div class="tab-content" id="tab-place" style="${isFirst ? 'display:block;' : 'display:none;'} margin-bottom: 20px;">${placeBlock.innerHTML}</div>`;
            isFirst = false;
        }
        if(starBlock) {
            newHtml += `<div class="tab-content" id="tab-star" style="${isFirst ? 'display:block;' : 'display:none;'} margin-bottom: 20px;">${starBlock.innerHTML}</div>`;
            isFirst = false;
        }
        if(linkBlock) {
            newHtml += `<div class="tab-content" id="tab-link" style="${isFirst ? 'display:block;' : 'display:none;'} margin-bottom: 20px;">${linkBlock.innerHTML}</div>`;
            isFirst = false;
        }

        // 4. Текст истории (Story) всегда виден внизу
        newHtml += `
                <div class="story-text" style="margin-top: 40px; border-top: 1px solid #222; padding-top: 30px;">
                    ${storyText ? storyText.innerHTML : ''}
                </div>
            </div>
        `;

        // Вставляем готовый HTML
        stageBody.innerHTML = newHtml;

        // 5. Добавляем логику кликов по вкладкам (Tab switching)
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                // Сбрасываем стили всех кнопок и скрываем весь контент
                document.querySelectorAll('.tab-btn').forEach(b => b.style.color = '#888');
                document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
                
                // Активируем текущую кнопку и показываем контент
                this.style.color = 'var(--gold)';
                const targetId = this.dataset.target;
                document.getElementById(`tab-${targetId}`).style.display = 'block';
            });
        });

        backBtn.innerHTML = '← Back to Collection';
        backBtn.onclick = () => navigateTo('collection');
        contentStage.style.opacity = '1';
    }, 300);
}

// ---- ОСТАЛЬНОЕ БЕЗ ИЗМЕНЕНИЙ ----
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