document.addEventListener("DOMContentLoaded", () => {
    // 1. ЛОГИКА ДЛЯ ГЛАВНОЙ СТРАНИЦЫ (Отправка данных в каталог)
    const mainFilterForm = document.getElementById("mainFilterForm");
    if (mainFilterForm) {
        mainFilterForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const location = document.getElementById("locationSelect")?.value || "";
            const priceMax = document.getElementById("priceMax")?.value || "";
            const queryParams = new URLSearchParams({ district: location, priceMax: priceMax });
            window.location.href = `catalog.html?${queryParams.toString()}`;
        });
    }

    // 2. ЛОГИКА ДЛЯ СТРАНИЦЫ КАТАЛОГА (Интеграция с SQL Server)
    if (window.location.pathname.includes("catalog.html")) {
        const gridContainer = document.getElementById("catalogGrid");
        const filterForm = document.getElementById("advancedFilter");
        let cards = []; // Сюда сохранятся созданные карточки

        // Функция загрузки данных из бэкенда
        async function loadFlatsFromDB() {
            try {
                // Запрос к Node.js серверу (маршрут /api/flats маленькими буквами)
                const response = await fetch('http://localhost:3000/api/flats');
                const flats = await response.json();
                
                if (!gridContainer) return;
                gridContainer.innerHTML = ''; // Очищаем статические карточки

                // Перебираем 50 объектов из SQL и строим HTML
                flats.forEach(flat => {
                    const cardElement = document.createElement('div');
                    cardElement.className = 'flat-card';
                    
                    // Прописываем data-атрибуты из колонок вашей БД
                    cardElement.setAttribute('data-district', flat.district || '');
                    cardElement.setAttribute('data-price', flat.price || 0);
                    cardElement.setAttribute('data-area', flat.area || 0);
                    cardElement.setAttribute('data-heating', String(flat.heating));
                    cardElement.setAttribute('data-air', String(flat.air));
                    cardElement.setAttribute('data-parking', String(flat.parking));
                    cardElement.setAttribute('data-concierge', String(flat.concierge));

                    // Наполнение шаблона карточки данными
                    cardElement.innerHTML = `
                        <div class="flat-card__image">
                            <img src="${flat.image_url || 'images/placeholder.jpg'}" alt="Квартира" style="width:100%; height:100%; object-fit:cover;">
                        </div>
                        <div class="flat-card__body">
                            <div class="flat-price">${Number(flat.price).toLocaleString('ru-RU')} ₽</div>
                            <div class="flat-address">📍 ${flat.district || ''}, ${flat.address || ''}</div>
                            <div class="flat-tags" style="margin-top: 10px; display: flex; gap: 10px; flex-wrap: wrap;">
                                <span style="background:#f0f2f5; padding: 4px 8px; border-radius:4px; font-size:0.85rem;">📐 ${flat.area || 0} м²</span>
                                ${flat.heating ? '<span style="background:#fff4e6; color:#d97706; padding: 4px 8px; border-radius:4px; font-size:0.85rem;">🔥 Отопление</span>' : ''}
                                ${flat.air ? '<span style="background:#e0f2fe; color:#0369a1; padding: 4px 8px; border-radius:4px; font-size:0.85rem;">❄️ Конд.</span>' : ''}
                                ${flat.parking ? '<span style="background:#f0fdf4; color:#16a34a; padding: 4px 8px; border-radius:4px; font-size:0.85rem;">🚗 Паркинг</span>' : ''}
                            </div>
                        </div>
                    `;
                    
                    gridContainer.appendChild(cardElement);
                    cards.push(cardElement);
                });

                // Первичный запуск фильтрации (проверяет параметры из URL, если пришли с главной)
                applyFilters();

            } catch (error) {
                console.error('Ошибка связи с бэкендом:', error);
                if (gridContainer) {
                    gridContainer.innerHTML = '<p style="color:red; padding:20px;">Ошибка: проверьте, запущен ли сервер Node.js!</p>';
                }
            }
        }

        // Запуск загрузки
        loadFlatsFromDB();

        // Главная функция умной фильтрации
        function applyFilters() {
            const district = document.getElementById("districtSelect")?.value || "";
            const sortBy = document.getElementById("sortSelect")?.value || "price_asc";
            const priceMin = parseFloat(document.getElementById("priceMin")?.value) || 0;
            const priceMax = parseFloat(document.getElementById("priceMaxInput")?.value) || Infinity;
            const areaMin = parseFloat(document.getElementById("areaMin")?.value) || 0;
            const areaMax = parseFloat(document.getElementById("areaMax")?.value) || Infinity;
            
            const reqHeating = document.getElementById("checkHeating")?.checked || false;
            const reqAir = document.getElementById("checkAir")?.checked || false;
            const reqParking = document.getElementById("checkParking")?.checked || false;
            const reqConcierge = document.getElementById("checkConcierge")?.checked || false;

            cards.forEach(card => {
                const cDistrict = card.getAttribute("data-district");
                const cPrice = parseFloat(card.getAttribute("data-price"));
                const cArea = parseFloat(card.getAttribute("data-area"));
                const cHeating = card.getAttribute("data-heating") === "true";
                const cAir = card.getAttribute("data-air") === "true";
                const cParking = card.getAttribute("data-parking") === "true";
                const cConcierge = card.getAttribute("data-concierge") === "true";

                const matchDistrict = !district || cDistrict === district;
                const matchPrice = cPrice >= priceMin && cPrice <= priceMax;
                const matchArea = cArea >= areaMin && cArea <= areaMax;
                const matchHeating = !reqHeating || cHeating === true;
                const matchAir = !reqAir || cAir === true;
                const matchParking = !reqParking || cParking === true;
                const matchConcierge = !reqConcierge || cConcierge === true;

                if (matchDistrict && matchPrice && matchArea && matchHeating && matchAir && matchParking && matchConcierge) {
                    card.style.display = "block";
                } else {
                    card.style.display = "none";
                }
            });

            // Сортировка
            const visibleCards = cards.filter(c => c.style.display !== "none");
            visibleCards.sort((a, b) => {
                const priceA = parseFloat(a.getAttribute("data-price"));
                const priceB = parseFloat(b.getAttribute("data-price"));
                const areaA = parseFloat(a.getAttribute("data-area"));
                const areaB = parseFloat(b.getAttribute("data-area"));

                if (sortBy === "price_asc") return priceA - priceB;
                if (sortBy === "price_desc") return priceB - priceA;
                if (sortBy === "area_desc") return areaB - areaA;
                if (sortBy === "area_asc") return areaA - areaB;
                return 0;
            });

            visibleCards.forEach(card => gridContainer.appendChild(card));
        }

        // Слушатели изменений для живого фильтра
        filterForm?.addEventListener("change", applyFilters);
        filterForm?.addEventListener("input", applyFilters);
    }
});
