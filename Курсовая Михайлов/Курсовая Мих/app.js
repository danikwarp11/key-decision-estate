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

    // 2. ЛОГИКА ДЛЯ СТРАНИЦЫ КАТАЛОГА (Умный фильтр и сортировка)
    if (window.location.pathname.includes("catalog.html")) {
        const filterForm = document.getElementById("advancedFilter");
        const gridContainer = document.getElementById("catalogGrid");
        
        // Предотвращаем падение скрипта, если на странице каталога нет нужной формы или контейнера
        if (!filterForm || !gridContainer) return;

        const cards = Array.from(gridContainer.querySelectorAll(".flat-card"));

        // Подхватываем параметры из адресной строки при переходе с главной
        const urlParams = new URLSearchParams(window.location.search);
        const urlDistrict = urlParams.get("district");
        const urlPriceMax = urlParams.get("priceMax");

        if (urlDistrict && document.getElementById("districtSelect")) {
            document.getElementById("districtSelect").value = urlDistrict;
        }
        if (urlPriceMax && document.getElementById("priceMaxInput")) {
            document.getElementById("priceMaxInput").value = urlPriceMax;
        }

        // Главная функция фильтрации и сортировки
        function applyFilters() {
            // Получаем текущие значения всех фильтров
            const district = document.getElementById("districtSelect")?.value || "";
            const sortBy = document.getElementById("sortSelect")?.value || "price_asc";
            
            const priceMin = parseFloat(document.getElementById("priceMin")?.value) || 0;
            const priceMax = parseFloat(document.getElementById("priceMaxInput")?.value) || Infinity;
            
            const areaMin = parseFloat(document.getElementById("areaMin")?.value) || 0;
            const areaMax = parseFloat(document.getElementById("areaMax")?.value) || Infinity;
            
            // Считываем ВСЕ чекбоксы (включая паркинг и консьержа)
            const reqHeating = document.getElementById("checkHeating")?.checked || false;
            const reqAir = document.getElementById("checkAir")?.checked || false;
            const reqParking = document.getElementById("checkParking")?.checked || false;
            const reqConcierge = document.getElementById("checkConcierge")?.checked || false;

            // Проходимся по каждой карточке и проверяем условия
            cards.forEach(card => {
                const cDistrict = card.getAttribute("data-district");
                const cPrice = parseFloat(card.getAttribute("data-price"));
                const cArea = parseFloat(card.getAttribute("data-area"));
                const cHeating = card.getAttribute("data-heating") === "true";
                const cAir = card.getAttribute("data-air") === "true";
                const cParking = card.getAttribute("data-parking") === "true";
                const cConcierge = card.getAttribute("data-concierge") === "true";

                // Проверяем совпадение по всем критериям
                const matchDistrict = !district || cDistrict === district;
                const matchPrice = cPrice >= priceMin && cPrice <= priceMax;
                const matchArea = cArea >= areaMin && cArea <= areaMax;
                const matchHeating = !reqHeating || cHeating === true;
                const matchAir = !reqAir || cAir === true;
                const matchParking = !reqParking || cParking === true;
                const matchConcierge = !reqConcierge || cConcierge === true;

                if (matchDistrict && matchPrice && matchArea && matchHeating && matchAir && matchParking && matchConcierge) {
                    card.style.display = "block"; // Показываем
                } else {
                    card.style.display = "none"; // Прячем
                }
            });

            // Сортировка видимых карточек
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

            // Перерисовываем отсортированные карточки в контейнере
            visibleCards.forEach(card => gridContainer.appendChild(card));
        }

        // Запускаем фильтрацию сразу при загрузке страницы
        applyFilters();

        // Живой фильтр: реагирует на любые изменения в форме (без нажатия кнопки)
        filterForm.addEventListener("change", applyFilters);
        filterForm.addEventListener("input", applyFilters);

        // Навешиваем событие на отправку формы (на всякий случай)
        filterForm.addEventListener("submit", (e) => {
            e.preventDefault();
            applyFilters();
        });

        // Навешиваем событие на кнопку "Сбросить"
        document.querySelector(".btn-clear")?.addEventListener("click", () => {
            filterForm.reset();
            applyFilters();
        });
    }
});
