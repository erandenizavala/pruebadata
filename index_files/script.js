document.addEventListener('DOMContentLoaded', () => {
    // 1. STATE AND ELEMENT SETUP
    let activeView = 'ventas';
    let chartInstances = {};
    let ventasPicker, tiendasPicker;

    const elements = {
        themeToggleBtn: document.getElementById('theme-toggle'),
        themeToggleDarkIcon: document.getElementById('theme-toggle-dark-icon'),
        themeToggleLightIcon: document.getElementById('theme-toggle-light-icon'),
        headerTitleContainer: document.getElementById('header-title-container'),
        navLinks: { ventas: document.getElementById('nav-ventas'), tiendas: document.getElementById('nav-tiendas') },
        views: { ventas: document.getElementById('view-ventas'), tiendas: document.getElementById('view-tiendas') },
        ventas: {
            presetSelect: document.getElementById('ventas-date-preset-select'),
            dateRange: document.getElementById('ventas-date-range'),
        },
        tiendas: {
            presetSelect: document.getElementById('tiendas-date-preset-select'),
            dateRange: document.getElementById('tiendas-date-range'),
            typeFilter: document.getElementById('tiendas-type-filter'),
            regionFilter: document.getElementById('tiendas-region-filter'),
            kpi: {
                total: document.getElementById('kpi-total-stores'),
                open: document.getElementById('kpi-open-stores'),
                hibernated: document.getElementById('kpi-hibernated-stores'),
                sales: document.getElementById('kpi-sales'),
                vsQuota: document.getElementById('kpi-sales-vs-quota'),
                avgTicket: document.getElementById('kpi-avg-ticket'),
                accounts: document.getElementById('kpi-accounts'),
                orders: document.getElementById('kpi-orders'),
            },
            charts: {
                performance: document.getElementById('store-performance-chart'),
                byType: document.getElementById('sales-by-type-chart'),
                weekly: document.getElementById('weekly-sales-chart'),
            },
            tableBody: document.getElementById('stores-table-body'),
        }
    };

    const viewHeaders = {
        ventas: `<div><h1 class="text-2xl font-pirenaica font-bold text-gray-800 dark:text-white">Tablero de Control de Ventas</h1><p class="text-gray-500 dark:text-gray-400 mt-1 text-sm">Análisis de rendimiento en tiempo real.</p></div>`,
        tiendas: `<div><h1 class="text-2xl font-pirenaica font-bold text-gray-800 dark:text-white">Análisis de Tiendas</h1><p class="text-gray-500 dark:text-gray-400 mt-1 text-sm">Rendimiento detallado por tienda y región.</p></div>`
    };

    // 2. DATA MOCKING
    const states = ["Ciudad de México", "Monterrey", "Guadalajara"];
    const storeTypes = ["Comida Rápida", "Cafeterías", "Comida Casual", "Restaurante Familiar"];
    const storeNames = ["Centro", "Aeropuerto", "Polanco", "Valle Oriente", "Andares", "Chapultepec", "Santa Fe", "Condesa"];
    let masterStoreData = []; let storeId = 100;
    states.forEach(state => { for(let i = 0; i < 8; i++) { const type = storeTypes[Math.floor(Math.random() * storeTypes.length)]; const baseSales = 50000 + Math.random() * 150000; const baseOrders = 500 + Math.random() * 1500; const accounts = baseOrders * (0.8 + Math.random() * 0.4); const budget = baseSales * (0.9 + Math.random() * 0.2); const d = new Date(); d.setDate(d.getDate() - Math.floor(Math.random() * 365)); masterStoreData.push({ id: storeId++, name: `RM ${state.substring(0,3)} ${storeNames[i]}`, state: state, type: type, status: Math.random() > 0.1 ? 'Abierta' : 'Hibernada', sales: baseSales, budget: budget, quota: budget * (1 + (Math.random() - 0.2) * 0.1), orders: Math.round(baseOrders), accounts: Math.round(accounts), openingDate: d, weeklySales: [ baseSales * (0.20 + Math.random() * 0.1), baseSales * (0.22 + Math.random() * 0.1), baseSales * (0.25 + Math.random() * 0.1), baseSales * (0.28 + Math.random() * 0.1), ] }); } });

    // 3. HELPER & RENDER FUNCTIONS
    const destroyAllCharts = () => {
        Object.values(chartInstances).forEach(chart => chart?.destroy());
        chartInstances = {};
    };

    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            elements.themeToggleLightIcon.classList.remove('hidden');
            elements.themeToggleDarkIcon.classList.add('hidden');
            localStorage.setItem('color-theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            elements.themeToggleDarkIcon.classList.remove('hidden');
            elements.themeToggleLightIcon.classList.add('hidden');
            localStorage.setItem('color-theme', 'light');
        }
    };

    const renderVentasView = () => {
        destroyAllCharts();
        const isDarkMode = document.documentElement.classList.contains('dark');
        const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#e5e7eb';
        const textColor = isDarkMode ? '#d1d5db' : '#6b7280';
        Chart.defaults.color = textColor;
        Chart.defaults.font.family = "'Calibri', 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif";

        chartInstances.salesTrendChart = new Chart(document.getElementById('salesTrendChart').getContext('2d'), { type: 'line', data: { labels: Array.from({ length: 31 }, (_, i) => `2022-01-${String(i + 1).padStart(2, '0')}`), datasets: [{ label: 'Venta Real', data: Array.from({ length: 31 }, () => Math.random() * 20000 + 30000), borderColor: '#00a599', backgroundColor: 'rgba(0, 165, 153, 0.1)', fill: true, tension: 0.4, borderWidth: 2 }, { label: 'Presupuesto', data: Array.from({ length: 31 }, () => Math.random() * 15000 + 32000), borderColor: '#ff5800', borderDash: [5, 5], tension: 0.4, borderWidth: 2 }, { label: 'Venta 2019', data: Array.from({ length: 31 }, () => Math.random() * 10000 + 25000), borderColor: '#9ca3af', tension: 0.4, borderWidth: 2 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { x: { type: 'time', time: { unit: 'day' }, grid: { display: false }, ticks: { color: textColor } }, y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor } } }, plugins: { legend: { position: 'top', align: 'end', labels: { color: textColor } } } } });
        const brandTrendLabels = []; for (let i = 29; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); brandTrendLabels.push(d.toISOString().split('T')[0]); }
        const generateSalesData = (base, trend) => { let data = []; let currentValue = base; for (let i = 0; i < 30; i++) { let variation = (Math.random() - 0.5) * (base * 0.1); currentValue += trend * (base * 0.02) + variation; data.push(Math.max(0, currentValue)); } return data; };
        chartInstances.brandTrendChart = new Chart(document.getElementById('brandTrendChart').getContext('2d'), { type: 'line', data: { labels: brandTrendLabels, datasets: [{ label: 'Marca A', data: generateSalesData(5000, 1), borderColor: '#00a599', backgroundColor: 'rgba(0, 165, 153, 0.1)', fill: true, tension: 0.4, borderWidth: 2 }, { label: 'Marca B', data: generateSalesData(4500, 0), borderColor: '#9ca3af', backgroundColor: 'rgba(156, 163, 175, 0.1)', fill: true, tension: 0.4, borderWidth: 2 }, { label: 'Marca C', data: generateSalesData(5500, -1), borderColor: '#ff5800', backgroundColor: 'rgba(255, 88, 0, 0.1)', fill: true, tension: 0.4, borderWidth: 2 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { x: { type: 'time', time: { unit: 'day', tooltipFormat: 'MMM d, yyyy' }, grid: { display: false }, ticks: { color: textColor } }, y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor, callback: (value) => '$' + value / 1000 + 'k' } } }, plugins: { legend: { position: 'top', align: 'end', labels: { color: textColor } }, tooltip: { callbacks: { label: (context) => `${context.dataset.label}: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y)}` } } }, interaction: { intersect: false, mode: 'index' } } });
        chartInstances.salesByBrandChart = new Chart(document.getElementById('salesByBrandChart').getContext('2d'), { type: 'bar', data: { labels: ['Marca A (Rápida)', 'Marca B (Café)', 'Marca C (Casual)', 'Otras Marcas'], datasets: [{ label: 'Venta Real', data: [550000, 320000, 280000, 100000], backgroundColor: ['#00a599', '#ff5800', '#9ca3af', '#6b7280'], borderRadius: 4 }] }, options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, scales: { x: { grid: { color: gridColor }, ticks: { color: textColor } }, y: { grid: { display: false }, ticks: { color: textColor } } }, plugins: { legend: { display: false } } } });
        chartInstances.salesByChannelChart = new Chart(document.getElementById('salesByChannelChart').getContext('2d'), { type: 'doughnut', data: { labels: ['En Tienda', 'Delivery Propio', 'Uber Eats', 'Rappi', 'Didi Food'], datasets: [{ data: [60, 15, 12, 8, 5], backgroundColor: ['#00a599', '#ff5800', '#9ca3af', '#6b7280', '#4b5563'], borderColor: isDarkMode ? '#1f2937' : '#ffffff', borderWidth: 2 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { position: 'bottom', labels: { color: textColor, boxWidth: 12, padding: 20 } } } } });
    };

    const renderTiendasView = () => {
        destroyAllCharts();
        const isDarkMode = document.documentElement.classList.contains('dark');
        const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#e5e7eb';
        const textColor = isDarkMode ? '#d1d5db' : '#6b7280';
        Chart.defaults.color = textColor;

        const currentRegion = elements.tiendas.regionFilter.value;
        const currentType = elements.tiendas.typeFilter.value;
        const startDate = tiendasPicker.getStartDate()?.dateInstance || null;
        const endDate = tiendasPicker.getEndDate()?.dateInstance || null;

        const filteredData = masterStoreData.filter(d => {
            const storeDate = d.openingDate;
            let inDateRange = true;
            if (startDate && endDate) {
                inDateRange = storeDate >= startDate && storeDate <= endDate;
            }
            const inRegion = currentRegion === 'Todos' || d.state === currentRegion;
            const inType = currentType === 'Todos' || d.type === currentType;
            return inDateRange && inRegion && inType;
        });
        const activeStoresData = filteredData.filter(d => d.status === 'Abierta');

        const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
        const formatNumber = (value) => new Intl.NumberFormat('en-US').format(value);
        elements.tiendas.kpi.total.textContent = formatNumber(filteredData.length);
        elements.tiendas.kpi.open.textContent = formatNumber(activeStoresData.length);
        elements.tiendas.kpi.hibernated.textContent = formatNumber(filteredData.length - activeStoresData.length);
        const totalSales = activeStoresData.reduce((sum, d) => sum + d.sales, 0);
        const totalQuota = activeStoresData.reduce((sum, d) => sum + d.quota, 0);
        const totalOrders = activeStoresData.reduce((sum, d) => sum + d.orders, 0);
        const totalAccounts = activeStoresData.reduce((sum, d) => sum + d.accounts, 0);
        const avgTicket = totalOrders > 0 ? totalSales / totalOrders : 0;
        elements.tiendas.kpi.sales.textContent = formatCurrency(totalSales);
        elements.tiendas.kpi.vsQuota.textContent = `${totalQuota > 0 ? ((totalSales / totalQuota) * 100).toFixed(1) : 0}%`;
        elements.tiendas.kpi.avgTicket.textContent = formatCurrency(avgTicket);
        elements.tiendas.kpi.orders.textContent = formatNumber(totalOrders);
        elements.tiendas.kpi.accounts.textContent = formatNumber(totalAccounts);

        const topStores = activeStoresData.sort((a, b) => b.sales - a.sales).slice(0, 5);
        chartInstances.storePerformance = new Chart(elements.tiendas.charts.performance, { type: 'bar', data: { labels: topStores.map(d => d.name), datasets: [ { label: 'Venta Real', data: topStores.map(d => d.sales), backgroundColor: '#00a599', borderRadius: 4 }, { label: 'Presupuesto', data: topStores.map(d => d.budget), backgroundColor: '#a7f3d0', borderRadius: 4 } ] }, options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, scales: { y: { grid: { display: false } }, x: { grid: { color: gridColor } } } } });
        const salesByType = {};
        activeStoresData.forEach(d => { if (!salesByType[d.type]) salesByType[d.type] = 0; salesByType[d.type] += d.sales; });
        chartInstances.salesByType = new Chart(elements.tiendas.charts.byType, { type: 'doughnut', data: { labels: Object.keys(salesByType), datasets: [{ data: Object.values(salesByType), backgroundColor: ['#00a599', '#ff5800', '#9ca3af', '#6b7280'], borderColor: isDarkMode ? '#1f2937' : '#ffffff', borderWidth: 2 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { position: 'bottom', labels: { padding: 15 } } } } });
        const weeklyTotals = [0, 0, 0, 0];
        activeStoresData.forEach(store => { store.weeklySales.forEach((sale, i) => weeklyTotals[i] += sale); });
        chartInstances.weeklySales = new Chart(elements.tiendas.charts.weekly, { type: 'bar', data: { labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'], datasets: [{ label: 'Venta Semanal', data: weeklyTotals, backgroundColor: '#ff5800', borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: gridColor } }, x: { grid: { display: false } } } } });

        elements.tiendas.tableBody.innerHTML = '';
        const sortedStores = activeStoresData.sort((a, b) => (b.sales / b.orders) - (a.sales / a.orders));
        sortedStores.forEach(d => { const ticket = d.orders > 0 ? d.sales / d.orders : 0; const row = `<tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"><td class="p-3 font-semibold text-gray-900 dark:text-white">${d.name}</td><td class="p-3">${d.state}</td><td class="p-3 font-bold">${formatCurrency(ticket)}</td></tr>`; elements.tiendas.tableBody.innerHTML += row; });
    };

    const showView = (viewName) => {
        activeView = viewName;
        Object.values(elements.views).forEach(view => view.classList.add('hidden'));
        elements.views[viewName].classList.remove('hidden');
        Object.values(elements.navLinks).forEach(link => link.classList.remove('text-saba-teal', 'bg-gray-100', 'dark:bg-gray-700'));
        elements.navLinks[viewName].classList.add('text-saba-teal', 'bg-gray-100', 'dark:bg-gray-700');
        elements.headerTitleContainer.innerHTML = viewHeaders[viewName];

        if (viewName === 'ventas') renderVentasView();
        else renderTiendasView();
    };

    // 4. INITIALIZATION
    const init = () => {
        applyTheme(localStorage.getItem('color-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
        elements.themeToggleBtn.addEventListener('click', () => {
            const isDark = document.documentElement.classList.contains('dark');
            applyTheme(isDark ? 'light' : 'dark');
            if (activeView === 'ventas') renderVentasView();
            else renderTiendasView();
        });

        elements.navLinks.ventas.addEventListener('click', (e) => { e.preventDefault(); showView('ventas'); });
        elements.navLinks.tiendas.addEventListener('click', (e) => { e.preventDefault(); showView('tiendas'); });

        ventasPicker = new Litepicker({ element: document.getElementById('ventas-date-range'), singleMode: false, format: 'DD/MM/YYYY', separator: ' - ', allowRepick: true });
        elements.ventas.presetSelect.addEventListener('change', (event) => {
            const value = event.target.value; const endDate = new Date(); let startDate = new Date();
            switch (value) {
                case 'today': startDate = new Date(); break;
                case 'yesterday': startDate.setDate(endDate.getDate() - 1); endDate.setDate(endDate.getDate() - 1); break;
                case 'last_7_days': startDate.setDate(endDate.getDate() - 6); break;
                case 'last_30_days': startDate.setDate(endDate.getDate() - 29); break;
                case 'last_90_days': startDate.setDate(endDate.getDate() - 89); break;
                case 'month_to_date': startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1); break;
                case 'year_to_date': startDate = new Date(endDate.getFullYear(), 0, 1); break;
            }
            ventasPicker.setDateRange(startDate, endDate);
            event.target.selectedIndex = 0;
        });

        tiendasPicker = new Litepicker({ element: document.getElementById('tiendas-date-range'), singleMode: false, format: 'DD/MM/YYYY', separator: ' - ', allowRepick: true });
        tiendasPicker.on('selected', renderTiendasView);
        elements.tiendas.typeFilter.innerHTML = '<option value="Todos">Todos los Tipos</option>' + storeTypes.map(t => `<option value="${t}">${t}</option>`).join('');
        elements.tiendas.regionFilter.innerHTML = '<option value="Todos">Todas las Regiones</option>' + states.map(s => `<option value="${s}">${s}</option>`).join('');
        [elements.tiendas.typeFilter, elements.tiendas.regionFilter].forEach(el => el.addEventListener('change', renderTiendasView));
        elements.tiendas.presetSelect.addEventListener('change', (event) => {
            const value = event.target.value; const endDate = new Date(); let startDate = new Date();
            switch (value) {
                case 'today': startDate = new Date(); break;
                case 'yesterday': startDate.setDate(endDate.getDate() - 1); endDate.setDate(endDate.getDate() - 1); break;
                case 'last_7_days': startDate.setDate(endDate.getDate() - 6); break;
                case 'last_30_days': startDate.setDate(endDate.getDate() - 29); break;
                case 'last_90_days': startDate.setDate(endDate.getDate() - 89); break;
                case 'month_to_date': startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1); break;
                case 'year_to_date': startDate = new Date(endDate.getFullYear(), 0, 1); break;
            }
            tiendasPicker.setDateRange(startDate, endDate);
            event.target.selectedIndex = 0;
        });

        showView('ventas');
    };

    init();
});