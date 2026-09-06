(function() {
    'use strict';

    const monthNames = ['正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','冬月','腊月'];
    const dayNames = ['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十','十一','十二','十三','十四','十五','十六','十七','十八','十九','二十','廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];
    const PALACE_NAMES = ['命宫','父母','福德','田宅','官禄','交友','迁移','疾厄','财帛','子女','夫妻','兄弟'];
    const GONG_NAMES_SUFFIX = ['命','父','福','田','官','友','迁','疾','财','子','夫','兄'];

    let currentCalendar = 'solar';
    let diskMode = 'yuan';

    let highlightMode = 'auto';
    let manualHighlightZhi = null;

    function switchCalendar(type) {
        currentCalendar = type;
        const solarGroup = document.getElementById('solarGroup');
        const lunarGroup = document.getElementById('lunarGroup');
        const btnSolar = document.getElementById('btnSolar');
        const btnLunar = document.getElementById('btnLunar');
        if (type === 'solar') {
            solarGroup.classList.remove('hidden');
            lunarGroup.classList.add('hidden');
            btnSolar.classList.add('active');
            btnLunar.classList.remove('active');
        } else {
            solarGroup.classList.add('hidden');
            lunarGroup.classList.remove('hidden');
            btnLunar.classList.add('active');
            btnSolar.classList.remove('active');
        }
    }

    function initLunarDays() {
        const select = document.getElementById('lunarDay');
        select.innerHTML = '';
        for (let i = 1; i <= 30; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = dayNames[i-1];
            select.appendChild(opt);
        }
    }

    function getBirthDateInfo() {
        let birthYear, birthMonth, birthDay, lunarMonthInput, lunarDayInput, isLeapInput;
        let lunarDisplay = '', solarDisplay = '', valid = false;
        try {
            if (currentCalendar === 'solar') {
                const yearVal = parseInt(document.getElementById('solarYear').value, 10);
                const monthVal = parseInt(document.getElementById('solarMonth').value, 10);
                const dayVal = parseInt(document.getElementById('solarDay').value, 10);
                if (isNaN(yearVal) || isNaN(monthVal) || isNaN(dayVal)) throw new Error('请完整填写公历年月日');
                if (yearVal < 1900 || yearVal > 2100) throw new Error('年份须在1900-2100之间');
                if (monthVal < 1 || monthVal > 12) throw new Error('月份须在1-12之间');
                if (dayVal < 1 || dayVal > 31) throw new Error('日期须在1-31之间');
                const testDate = new Date(yearVal, monthVal-1, dayVal);
                if (testDate.getFullYear() !== yearVal || testDate.getMonth() !== monthVal-1 || testDate.getDate() !== dayVal) {
                    throw new Error('输入的日期不存在，请检查');
                }
                birthYear = yearVal; birthMonth = monthVal; birthDay = dayVal;
                const lunar = ZiWeiCore.solarToLunar(birthYear, birthMonth, birthDay);
                if (!lunar) throw new Error('农历转换失败');
                lunarDisplay = `${lunar.year}年${lunar.isLeap ? '闰' : ''}${monthNames[lunar.month - 1]}${dayNames[lunar.day - 1]}`;
                solarDisplay = `${birthYear}-${String(birthMonth).padStart(2,'0')}-${String(birthDay).padStart(2,'0')}`;
                lunarMonthInput = lunar.month; lunarDayInput = lunar.day; isLeapInput = lunar.isLeap;
                document.getElementById('lunarYear').value = lunar.year;
                document.getElementById('lunarMonth').value = lunar.month;
                document.getElementById('lunarLeap').value = lunar.isLeap ? 1 : 0;
                document.getElementById('lunarDay').value = lunar.day;
                const solarBack = ZiWeiCore.lunarToSolar(lunar.year, lunar.month, lunar.day, lunar.isLeap);
                if (solarBack) {
                    const yb = solarBack.getUTCFullYear();
                    const mb = solarBack.getUTCMonth() + 1;
                    const db = solarBack.getUTCDate();
                    if (yb === birthYear && mb === birthMonth && db === birthDay) valid = true;
                }
            } else {
                const lunarYear = parseInt(document.getElementById('lunarYear').value, 10);
                const lunarMonth = parseInt(document.getElementById('lunarMonth').value, 10);
                const lunarDay = parseInt(document.getElementById('lunarDay').value, 10);
                const leapFlag = parseInt(document.getElementById('lunarLeap').value, 10) === 1;
                lunarMonthInput = lunarMonth; lunarDayInput = lunarDay; isLeapInput = leapFlag;
                const solarDate = ZiWeiCore.lunarToSolar(lunarYear, lunarMonth, lunarDay, leapFlag);
                if (!solarDate) throw new Error('未找到对应的公历日期，请确认农历日期正确');
                birthYear = solarDate.getUTCFullYear();
                birthMonth = solarDate.getUTCMonth() + 1;
                birthDay = solarDate.getUTCDate();
                lunarDisplay = `${lunarYear}年${leapFlag ? '闰' : ''}${monthNames[lunarMonth - 1]}${dayNames[lunarDay - 1]}`;
                solarDisplay = `${birthYear}-${String(birthMonth).padStart(2,'0')}-${String(birthDay).padStart(2,'0')}`;
                document.getElementById('solarYear').value = birthYear;
                document.getElementById('solarMonth').value = birthMonth;
                document.getElementById('solarDay').value = birthDay;
                const lunarBack = ZiWeiCore.solarToLunar(birthYear, birthMonth, birthDay);
                if (lunarBack && lunarBack.year === lunarYear && lunarBack.month === lunarMonth &&
                    lunarBack.day === lunarDay && lunarBack.isLeap === leapFlag) valid = true;
            }
            return { birthYear, birthMonth, birthDay, lunarMonthInput, lunarDayInput, isLeapInput, lunarDisplay, solarDisplay, valid };
        } catch (e) {
            throw e;
        }
    }

    function getDateDisplay(year, month, day) {
        const lunar = ZiWeiCore.solarToLunar(year, month, day);
        if (!lunar) return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')} (农历转换失败)`;
        const lunarStr = `${lunar.year}年${lunar.isLeap ? '闰' : ''}${monthNames[lunar.month - 1]}${dayNames[lunar.day - 1]}`;
        return `公历 ${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}  ↔  农历 ${lunarStr}`;
    }

    function buildDaXianOptions(wuXingNum) {
        const select = document.getElementById('daXianStep');
        if (!select) return;
        const currentVal = select.value;
        select.innerHTML = '';

        const tongCount = wuXingNum - 1;
        for (let i = 1; i <= tongCount; i++) {
            const opt = document.createElement('option');
            opt.value = -i;
            opt.textContent = `童${i}岁`;
            select.appendChild(opt);
        }

        for (let i = 1; i <= 12; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = `第${i}步`;
            select.appendChild(opt);
        }

        let found = false;
        for (let opt of select.options) {
            if (opt.value === currentVal) {
                opt.selected = true;
                found = true;
                break;
            }
        }
        if (!found && select.options.length > 0) {
            select.selectedIndex = 0;
        }
    }

    function updateFlowInputs(mode, solarYear, solarMonth, solarDay, hourIdx) {
        const yearEl = document.getElementById('calcYear');
        const monthEl = document.getElementById('calcMonth');
        const dayEl = document.getElementById('calcDay');
        const hourEl = document.getElementById('calcHour');

        yearEl.value = '';
        monthEl.value = '';
        dayEl.value = '';
        hourEl.value = '';

        if (mode === 'liuNian') {
            const lunar = ZiWeiCore.solarToLunar(solarYear, solarMonth, solarDay);
            if (lunar) yearEl.value = lunar.year;
            else yearEl.value = solarYear;
        } else if (mode === 'liuYue') {
            const lunar = ZiWeiCore.solarToLunar(solarYear, solarMonth, solarDay);
            if (lunar) {
                const effectiveMonth = ZiWeiCore.getEffectiveMonth(lunar.month, lunar.day, lunar.isLeap);
                yearEl.value = lunar.year;
                monthEl.value = effectiveMonth;
            } else {
                yearEl.value = solarYear;
                monthEl.value = solarMonth;
            }
        } else if (mode === 'liuRi') {
            yearEl.value = solarYear;
            monthEl.value = solarMonth;
            dayEl.value = solarDay;
        } else if (mode === 'liuShi') {
            yearEl.value = solarYear;
            monthEl.value = solarMonth;
            dayEl.value = solarDay;
            hourEl.value = hourIdx;
        }
    }

    function getFlowSolarFromInputs() {
        const mode = diskMode;
        const year = parseInt(document.getElementById('calcYear').value, 10);
        const month = parseInt(document.getElementById('calcMonth').value, 10);
        const day = parseInt(document.getElementById('calcDay').value, 10);
        const hour = parseInt(document.getElementById('calcHour').value, 10);

        if (mode === 'liuNian') {
            if (isNaN(year)) return null;
            const solarDate = ZiWeiCore.lunarToSolar(year, 1, 1, false);
            if (solarDate) {
                return { year: solarDate.getUTCFullYear(), month: solarDate.getUTCMonth()+1, day: solarDate.getUTCDate(), hour: (isNaN(hour) ? 0 : hour) };
            }
            return null;
        } else if (mode === 'liuYue') {
            if (isNaN(year) || isNaN(month)) return null;
            const solarDate = ZiWeiCore.lunarToSolar(year, month, 1, false);
            if (solarDate) {
                return { year: solarDate.getUTCFullYear(), month: solarDate.getUTCMonth()+1, day: solarDate.getUTCDate(), hour: (isNaN(hour) ? 0 : hour) };
            }
            return null;
        } else if (mode === 'liuRi' || mode === 'liuShi') {
            if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
            return { year, month, day, hour: (isNaN(hour) ? 0 : hour) };
        }
        return null;
    }

    function setCurrentTime() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const hour = now.getHours();
        let hourIndex = Math.floor((hour + 1) / 2) % 12;
        if (hourIndex < 0) hourIndex = 0;
        updateFlowInputs(diskMode, year, month, day, hourIndex);
    }

    function calcDaXianStepByLunarYear(lunarYear) {
        const birthYear = parseInt(document.getElementById('solarYear').value, 10);
        const birthMonth = parseInt(document.getElementById('solarMonth').value, 10);
        const birthDay = parseInt(document.getElementById('solarDay').value, 10);
        if (isNaN(birthYear) || isNaN(birthMonth) || isNaN(birthDay)) return 1;

        const birthLunar = ZiWeiCore.solarToLunar(birthYear, birthMonth, birthDay);
        if (!birthLunar) return 1;
        const birthLunarYear = birthLunar.year;

        const age = lunarYear - birthLunarYear + 1;
        if (age <= 0) return 1;

        const hourIdx = parseInt(document.getElementById('birthHour').value, 10);
        const mingShen = ZiWeiCore.getMingShen(birthLunar.month, birthLunar.day, birthLunar.isLeap, hourIdx);
        const mingZhi = mingShen.ming;
        const yearGan = ZiWeiCore.getFourPillars(birthYear, birthMonth, birthDay, hourIdx).year[0];
        const palaceGanMap = ZiWeiCore.getPalaceGanZhi(yearGan);
        const mingGan = palaceGanMap[mingZhi];
        const wuXing = ZiWeiCore.getWuXing(mingGan, mingZhi);
        const wuXingNum = wuXing.num;
        if (wuXingNum <= 0) return 1;

        if (age < wuXingNum) {
            return -age;
        } else {
            let step = Math.floor((age - wuXingNum) / 10) + 1;
            if (step < 1) step = 1;
            if (step > 12) step = 12;
            return step;
        }
    }

    function getDiskParams() {
        const mode = diskMode;
        const liuNianType = document.getElementById('liuNianType').value;

        let solar = getFlowSolarFromInputs();
        if (!solar) {
            const now = new Date();
            const hourIdx = Math.floor((now.getHours() + 1) / 2) % 12;
            solar = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate(), hour: hourIdx };
            updateFlowInputs(mode, solar.year, solar.month, solar.day, solar.hour);
        }
        const { year: calcYear, month: calcMonth, day: calcDay, hour: calcHour } = solar;

        const birthYear = parseInt(document.getElementById('solarYear').value, 10);
        const birthMonth = parseInt(document.getElementById('solarMonth').value, 10);
        const birthDay = parseInt(document.getElementById('solarDay').value, 10);
        if (!isNaN(birthYear) && !isNaN(birthMonth) && !isNaN(birthDay)) {
            const birthLunar = ZiWeiCore.solarToLunar(birthYear, birthMonth, birthDay);
            const flowLunar = ZiWeiCore.solarToLunar(calcYear, calcMonth, calcDay);
            if (birthLunar && flowLunar) {
                const hourIdx = parseInt(document.getElementById('birthHour').value, 10);
                const birthEffectiveMonth = ZiWeiCore.getEffectiveMonth(birthLunar.month, birthLunar.day, birthLunar.isLeap);
                if (mode === 'liuNian') {
                    if (flowLunar.year < birthLunar.year) {
                        throw new Error('流年农历年早于出生农历年，请调整年份');
                    }
                } else if (mode === 'liuYue') {
                    const flowEffectiveMonth = parseInt(document.getElementById('calcMonth').value, 10);
                    if (flowLunar.year < birthLunar.year ||
                        (flowLunar.year === birthLunar.year && flowEffectiveMonth < birthEffectiveMonth)) {
                        throw new Error('流月农历年月早于出生农历年月，请调整年份或月份');
                    }
                } else if (mode === 'liuRi') {
                    if (flowLunar.year < birthLunar.year ||
                        (flowLunar.year === birthLunar.year && flowLunar.month < birthLunar.month) ||
                        (flowLunar.year === birthLunar.year && flowLunar.month === birthLunar.month && flowLunar.day < birthLunar.day)) {
                        throw new Error('流日农历日期早于出生农历日期，请调整日期');
                    }
                } else if (mode === 'liuShi') {
                    const flowHour = parseInt(document.getElementById('calcHour').value, 10);
                    if (flowLunar.year < birthLunar.year ||
                        (flowLunar.year === birthLunar.year && flowLunar.month < birthLunar.month) ||
                        (flowLunar.year === birthLunar.year && flowLunar.month === birthLunar.month && flowLunar.day < birthLunar.day) ||
                        (flowLunar.year === birthLunar.year && flowLunar.month === birthLunar.month && flowLunar.day === birthLunar.day && flowHour < hourIdx)) {
                        throw new Error('流时农历日期时辰早于出生农历日期时辰，请调整时间');
                    }
                }
            } else {
                if (calcYear < birthYear) {
                    throw new Error('流盘时间不能早于出生时间，请调整日期');
                }
            }
        }

        let lunarYearForDaXian;
        if (mode === 'liuNian' || mode === 'liuYue') {
            lunarYearForDaXian = parseInt(document.getElementById('calcYear').value, 10);
            if (isNaN(lunarYearForDaXian)) {
                const lunar = ZiWeiCore.solarToLunar(calcYear, calcMonth, calcDay);
                lunarYearForDaXian = lunar ? lunar.year : calcYear;
            }
        } else {
            const lunar = ZiWeiCore.solarToLunar(calcYear, calcMonth, calcDay);
            lunarYearForDaXian = lunar ? lunar.year : calcYear;
        }

        if (mode === 'liuNian' || mode === 'liuYue' || mode === 'liuRi' || mode === 'liuShi') {
            const step = calcDaXianStepByLunarYear(lunarYearForDaXian);
            const options = document.getElementById('daXianStep').options;
            let found = false;
            for (let opt of options) {
                if (parseInt(opt.value) === step) {
                    opt.selected = true;
                    found = true;
                    break;
                }
            }
            if (!found && options.length > 0) {
                options[0].selected = true;
            }
        }

        const daXianStep = parseInt(document.getElementById('daXianStep').value, 10) || 1;
        return { mode, daXianStep, liuNianType, calcYear, calcMonth, calcDay, calcHour };
    }

    function calcDaXianStepForYear(year) {
        const lunar = ZiWeiCore.solarToLunar(year, 1, 1);
        if (lunar) return calcDaXianStepByLunarYear(lunar.year);
        return calcDaXianStepByLunarYear(year);
    }

    function getCurrentDaXianStep() {
        const now = new Date();
        const lunar = ZiWeiCore.solarToLunar(now.getFullYear(), now.getMonth()+1, now.getDate());
        if (lunar) return calcDaXianStepByLunarYear(lunar.year);
        return calcDaXianStepByLunarYear(now.getFullYear());
    }

    function updateNavLabels() {
        const prevBtn = document.getElementById('btnPrev');
        const nextBtn = document.getElementById('btnNext');
        switch (diskMode) {
            case 'daXian': prevBtn.textContent = '上一步'; nextBtn.textContent = '下一步'; break;
            case 'liuNian': prevBtn.textContent = '上一年'; nextBtn.textContent = '下一年'; break;
            case 'liuYue': prevBtn.textContent = '上一月'; nextBtn.textContent = '下一月'; break;
            case 'liuRi': prevBtn.textContent = '上一日'; nextBtn.textContent = '下一日'; break;
            case 'liuShi': prevBtn.textContent = '上一时'; nextBtn.textContent = '下一时'; break;
            default: prevBtn.textContent = '上一个'; nextBtn.textContent = '下一个';
        }
    }

    function resetHighlightMode() {
        highlightMode = 'auto';
        manualHighlightZhi = null;
    }

    function palaceClickHandler(e) {
        const cell = e.currentTarget;
        if (cell.id === 'centerDisplay') return;
        const zhi = cell.getAttribute('data-dizhi');
        if (!zhi) return;

        highlightMode = 'manual';
        manualHighlightZhi = zhi;
        ZiWeiRender.applyHighlight(zhi);
    }

    function updateDiskControls() {
        const radios = document.querySelectorAll('input[name="diskMode"]');
        let mode = 'yuan';
        radios.forEach(r => { if (r.checked) mode = r.value; });
        diskMode = mode;
        const isYuan = (mode === 'yuan');
        const isDaXian = (mode === 'daXian');
        const isLiuNian = (mode === 'liuNian');
        const isLiuYue = (mode === 'liuYue');
        const isLiuRi = (mode === 'liuRi');
        const isLiuShi = (mode === 'liuShi');
        const isLiuPan = !isYuan;

        if (!isLiuNian) {
            document.getElementById('liuNianType').value = 'liuNian';
        }

        document.getElementById('liuNianTypeGroup').style.display = isLiuNian ? 'inline-flex' : 'none';
        document.getElementById('daXianStepGroup').style.display = isDaXian ? 'inline-flex' : 'none';
        document.getElementById('liuNianType').disabled = !isLiuNian;
        document.getElementById('daXianStep').disabled = !isDaXian;

        document.getElementById('calcYear').disabled = isYuan || isDaXian;
        document.getElementById('calcMonth').disabled = isYuan || isDaXian || isLiuNian;
        document.getElementById('calcDay').disabled = isYuan || isDaXian || isLiuNian || isLiuYue;
        document.getElementById('calcHour').disabled = isYuan || isDaXian || isLiuNian || isLiuYue || isLiuRi;

        document.getElementById('btnFlow').disabled = !isLiuPan;
        document.getElementById('btnPrev').disabled = !isLiuPan;
        document.getElementById('btnNext').disabled = !isLiuPan;
        updateNavLabels();

        resetHighlightMode();

        if (isLiuPan) {
            setCurrentTime();
            const step = getCurrentDaXianStep();
            const options = document.getElementById('daXianStep').options;
            let found = false;
            for (let opt of options) {
                if (parseInt(opt.value) === step) {
                    opt.selected = true;
                    found = true;
                    break;
                }
            }
            if (!found && options.length > 0) {
                options[0].selected = true;
            }
            doFlowPan();
        } else if (isDaXian) {
            doFlowPan();
        } else {
            onCalculate();
        }
    }

    function onNav(direction) {
        const mode = diskMode;
        if (mode === 'yuan') return;

        if (mode === 'daXian') {
            const select = document.getElementById('daXianStep');
            const options = select.options;
            const currentIdx = select.selectedIndex;
            let newIdx = currentIdx + (direction === 'next' ? 1 : -1);
            if (newIdx < 0) newIdx = 0;
            if (newIdx >= options.length) newIdx = options.length - 1;
            select.selectedIndex = newIdx;
            doFlowPan();
            return;
        }

        let solar = getFlowSolarFromInputs();
        if (!solar) {
            const now = new Date();
            const hourIdx = Math.floor((now.getHours() + 1) / 2) % 12;
            solar = { year: now.getFullYear(), month: now.getMonth()+1, day: now.getDate(), hour: hourIdx };
            updateFlowInputs(mode, solar.year, solar.month, solar.day, solar.hour);
        }

        let { year, month, day, hour } = solar;
        const step = direction === 'next' ? 1 : -1;
        let yearChanged = false;
        let newLunarYear = null;

        switch (mode) {
            case 'liuNian': {
                let lunarYear = parseInt(document.getElementById('calcYear').value, 10);
                if (isNaN(lunarYear)) lunarYear = year;
                lunarYear += step;
                newLunarYear = lunarYear;
                const solarDate = ZiWeiCore.lunarToSolar(lunarYear, 1, 1, false);
                if (solarDate) {
                    year = solarDate.getUTCFullYear();
                    month = solarDate.getUTCMonth() + 1;
                    day = solarDate.getUTCDate();
                } else {
                    year = lunarYear; month = 1; day = 1;
                }
                yearChanged = true;
                break;
            }
            case 'liuYue': {
                let lunarYear = parseInt(document.getElementById('calcYear').value, 10);
                let effectiveMonth = parseInt(document.getElementById('calcMonth').value, 10);
                if (isNaN(lunarYear)) lunarYear = year;
                if (isNaN(effectiveMonth)) effectiveMonth = month;
                effectiveMonth += step;
                if (effectiveMonth > 12) { effectiveMonth = 1; lunarYear++; yearChanged = true; }
                if (effectiveMonth < 1) { effectiveMonth = 12; lunarYear--; yearChanged = true; }
                newLunarYear = lunarYear;
                const solarDate = ZiWeiCore.lunarToSolar(lunarYear, effectiveMonth, 1, false);
                if (solarDate) {
                    year = solarDate.getUTCFullYear();
                    month = solarDate.getUTCMonth() + 1;
                    day = solarDate.getUTCDate();
                } else {
                    let tempDate = new Date(year, month-1 + step, 1);
                    year = tempDate.getFullYear();
                    month = tempDate.getMonth() + 1;
                    day = 1;
                }
                break;
            }
            case 'liuRi': {
                let newDate = new Date(year, month-1, day + step);
                const maxDay = new Date(newDate.getFullYear(), newDate.getMonth()+1, 0).getDate();
                if (newDate.getDate() > maxDay) newDate.setDate(maxDay);
                if (newDate.getDate() < 1) newDate.setDate(1);
                year = newDate.getFullYear();
                month = newDate.getMonth() + 1;
                day = newDate.getDate();
                const lunar = ZiWeiCore.solarToLunar(year, month, day);
                newLunarYear = lunar ? lunar.year : year;
                break;
            }
            case 'liuShi': {
                let newHour = (hour + step + 12) % 12;
                let newDate = new Date(year, month-1, day);
                if ((hour === 11 && step === 1) || (hour === 0 && step === -1)) {
                    newDate.setDate(newDate.getDate() + step);
                    const maxDay = new Date(newDate.getFullYear(), newDate.getMonth()+1, 0).getDate();
                    if (newDate.getDate() > maxDay) newDate.setDate(maxDay);
                    if (newDate.getDate() < 1) newDate.setDate(1);
                }
                year = newDate.getFullYear();
                month = newDate.getMonth() + 1;
                day = newDate.getDate();
                hour = newHour;
                const lunar = ZiWeiCore.solarToLunar(year, month, day);
                newLunarYear = lunar ? lunar.year : year;
                break;
            }
            default: return;
        }

        updateFlowInputs(mode, year, month, day, hour);
        if (yearChanged || newLunarYear !== null) {
            let lunarYearForDaXian = newLunarYear;
            if (lunarYearForDaXian === null) {
                const lunar = ZiWeiCore.solarToLunar(year, month, day);
                lunarYearForDaXian = lunar ? lunar.year : year;
            }
            const newStep = calcDaXianStepByLunarYear(lunarYearForDaXian);
            const options = document.getElementById('daXianStep').options;
            for (let opt of options) {
                if (parseInt(opt.value) === newStep) {
                    opt.selected = true;
                    break;
                }
            }
        }
        doFlowPan();
    }

    function doFlowPan() {
        onCalculate();
    }

    function onCalculate() {
        if (typeof ZiWeiCore === 'undefined') {
            document.getElementById('errorMsg').textContent = '⚠️ 核心库未加载，请确保 ziwei-core.js 已正确引入。';
            document.getElementById('errorMsg').style.display = 'block';
            return;
        }

        const errorDiv = document.getElementById('errorMsg');
        const flowInfoDiv = document.getElementById('flowInfo');

        errorDiv.style.display = 'none';

        const mode = diskMode;
        let params;
        try {
            params = getDiskParams();
        } catch (err) {
            errorDiv.textContent = '⚠️ ' + err.message;
            errorDiv.style.display = 'block';
            flowInfoDiv.innerHTML = '';
            document.querySelectorAll('#centerDisplay .gan, #centerDisplay .zhi, #centerDisplay .wu-xing, #centerDisplay .yin-yang, #mingZhu, #shenZhu, #centerDateInfo, #liuPillars').forEach(el => el.textContent = '');
            document.querySelectorAll('.tian-gan-label').forEach(el => el.textContent = '');
            document.querySelectorAll('.palace-name').forEach(el => el.textContent = '');
            document.querySelectorAll('.star-top-left').forEach(el => el.innerHTML = '');
            document.querySelectorAll('.da-xian').forEach(el => el.textContent = '');
            document.querySelectorAll('.cs-col, .sui-col, .jiang-col, .bo-col').forEach(el => el.innerHTML = '');
            return;
        }

        const { daXianStep, liuNianType, calcYear, calcMonth, calcDay, calcHour } = params;

        let birthYear, birthMonth, birthDay, lunarMonthInput, lunarDayInput, isLeapInput;
        let lunarDisplay, solarDisplay, valid;

        let liuGanZhi = { nian: null, yue: null, ri: null, shi: null };
        let liuNianZhi = null;
        let effectiveMonth = null;
        let lunarDay = null;

        try {
            const dateInfo = getBirthDateInfo();
            birthYear = dateInfo.birthYear;
            birthMonth = dateInfo.birthMonth;
            birthDay = dateInfo.birthDay;
            lunarMonthInput = dateInfo.lunarMonthInput;
            lunarDayInput = dateInfo.lunarDayInput;
            isLeapInput = dateInfo.isLeapInput;
            lunarDisplay = dateInfo.lunarDisplay;
            solarDisplay = dateInfo.solarDisplay;
            valid = dateInfo.valid;

            const effectiveMonthOriginal = ZiWeiCore.getEffectiveMonth(lunarMonthInput, lunarDayInput, isLeapInput);

            const hourIdx = parseInt(document.getElementById('birthHour').value, 10);
            const gender = document.getElementById('gender').value;
            const diskType = document.getElementById('diskType').value;

            const birthParams = {
                lunarYear: parseInt(document.getElementById('lunarYear').value, 10),
                lunarMonth: lunarMonthInput,
                lunarDay: lunarDayInput,
                isLeap: isLeapInput,
                hourIndex: hourIdx,
                gender: gender,
                diskType: diskType,
                solarYear: birthYear,
                solarMonth: birthMonth,
                solarDay: birthDay
            };
            const original = ZiWeiCore.getOriginalDisk(birthParams);

            const { 
                mingZhi, shenZhi, ganZhiMap, starData: baseStarData, 
                fourTransform, daXianMap, changShengMap, 
                mingZhu, shenZhu, wuXingName, wuXingNum, 
                yinYangDesc, pillars, yearGan, yearZhi, isYang 
            } = original;

            let starData = { ...baseStarData };

            if (window._wuXingNum !== wuXingNum) {
                window._wuXingNum = wuXingNum;
                buildDaXianOptions(wuXingNum);
            }

            const palaceMap = {};
            const actualMingIndex = ZiWeiCore.diZhi.indexOf(mingZhi);
            for (let i = 0; i < 12; i++) {
                const idx = (actualMingIndex + i) % 12;
                const zhi = ZiWeiCore.diZhi[idx];
                palaceMap[zhi] = {
                    name: PALACE_NAMES[i],
                    isMing: i === 0,
                    isShen: zhi === shenZhi,
                    orderIndex: i
                };
            }

            const cells = document.querySelectorAll('.palace-cell');
            cells.forEach(cell => {
                const dizhi = cell.getAttribute('data-dizhi');
                const ganLabel = cell.querySelector('.ganzhi-col .tian-gan-label');
                if (ganLabel && ganZhiMap[dizhi]) ganLabel.textContent = ganZhiMap[dizhi];
            });
            cells.forEach(cell => {
                const dizhi = cell.getAttribute('data-dizhi');
                const nameDiv = cell.querySelector('.palace-name');
                if (!nameDiv) return;
                const info = palaceMap[dizhi];
                if (info) {
                    let displayName = info.name;
                    if (info.isShen) displayName += ' <span class="shen-mark">(身)</span>';
                    nameDiv.innerHTML = displayName;
                    nameDiv.className = 'palace-name';
                    if (info.isMing) nameDiv.classList.add('ming');
                } else {
                    nameDiv.textContent = '';
                }
            });

            let displayYear, displayMonth, displayDay;
            if (mode === 'yuan') {
                displayYear = birthYear;
                displayMonth = birthMonth;
                displayDay = birthDay;
            } else {
                let y = calcYear, m = calcMonth, d = calcDay;
                if (isNaN(y) || y < 1900 || y > 2100 || isNaN(m) || m < 1 || m > 12 || isNaN(d) || d < 1 || d > 31) {
                    const now = new Date();
                    y = now.getFullYear();
                    m = now.getMonth() + 1;
                    d = now.getDate();
                }
                displayYear = y;
                displayMonth = m;
                displayDay = d;
            }
            document.getElementById('centerDateInfo').textContent = getDateDisplay(displayYear, displayMonth, displayDay);

            if (pillars) {
                document.getElementById('cYearGan').textContent = pillars.year[0];
                document.getElementById('cYearZhi').textContent = pillars.year[1];
                document.getElementById('cMonthGan').textContent = pillars.month[0];
                document.getElementById('cMonthZhi').textContent = pillars.month[1];
                document.getElementById('cDayGan').textContent = pillars.day[0];
                document.getElementById('cDayZhi').textContent = pillars.day[1];
                document.getElementById('cHourGan').textContent = pillars.hour[0];
                document.getElementById('cHourZhi').textContent = pillars.hour[1];
            }

            document.getElementById('centerWuXing').textContent = wuXingName;
            document.getElementById('centerYinYang').textContent = yinYangDesc;
            document.getElementById('mingZhu').textContent = mingZhu || '';
            document.getElementById('shenZhu').textContent = shenZhu || '';

            const isShun = (gender === 'male' && isYang) || (gender === 'female' && !isYang);
            const startIdx2 = ZiWeiCore.diZhi.indexOf(mingZhi);
            const daXianStepVal = parseInt(document.getElementById('daXianStep').value, 10);
            let daXianMing = null;
            let daXianGan = null;

            if (daXianStepVal < 0) {
                const age = Math.abs(daXianStepVal);
                const offsetMap = [0, 8, 7, 10, 2];
                const idx = (age - 1) % offsetMap.length;
                const offset = offsetMap[idx];
                const mingIdx = ZiWeiCore.diZhi.indexOf(mingZhi);
                const targetIdx = (mingIdx + offset) % 12;
                daXianMing = ZiWeiCore.diZhi[targetIdx];
                daXianGan = ganZhiMap[daXianMing];
            } else {
                const step = daXianStepVal;
                let daXianMingIdx;
                if (isShun) {
                    daXianMingIdx = (startIdx2 + (step - 1)) % 12;
                } else {
                    daXianMingIdx = (startIdx2 - (step - 1) + 12) % 12;
                }
                daXianMing = ZiWeiCore.diZhi[daXianMingIdx];
                daXianGan = ganZhiMap[daXianMing];
            }

            const birthLunarYear = parseInt(document.getElementById('lunarYear').value);
            let flowLunarYear = null;
            let flowEffectiveMonth = null;

            if (mode === 'daXian') {
                if (daXianStepVal < 0) {
                    const age = -daXianStepVal;
                    flowLunarYear = birthLunarYear + age - 1;
                } else {
                    const startAge = wuXingNum + 10 * (daXianStepVal - 1);
                    flowLunarYear = birthLunarYear + startAge - 1;
                }
            } else if (mode === 'liuNian') {
                flowLunarYear = parseInt(document.getElementById('calcYear').value, 10);
                if (isNaN(flowLunarYear)) {
                    const lunar = ZiWeiCore.solarToLunar(calcYear, calcMonth, calcDay);
                    flowLunarYear = lunar ? lunar.year : calcYear;
                }
            } else if (mode === 'liuYue') {
                flowLunarYear = parseInt(document.getElementById('calcYear').value, 10);
                flowEffectiveMonth = parseInt(document.getElementById('calcMonth').value, 10);
                if (isNaN(flowLunarYear)) {
                    const lunar = ZiWeiCore.solarToLunar(calcYear, calcMonth, calcDay);
                    flowLunarYear = lunar ? lunar.year : calcYear;
                }
                if (isNaN(flowEffectiveMonth)) flowEffectiveMonth = calcMonth;
            } else {
                const lunar = ZiWeiCore.solarToLunar(calcYear, calcMonth, calcDay);
                flowLunarYear = lunar ? lunar.year : calcYear;
            }

            let flowHtml = '';
            if (mode === 'daXian') {
                const step = daXianStepVal;
                if (step < 0) {
                    const age = -step;
                    const ganZhi = ZiWeiCore.getYearGanZhiByLunarYear(flowLunarYear);
                    flowHtml = `<span class="flow-label">童</span><span class="flow-number">${age}</span><span class="flow-label">岁：</span>` +
                               `<span class="flow-label">农历</span><span class="flow-number">${flowLunarYear}</span><span class="flow-label">年 </span><span class="flow-ganzhi">${ganZhi}</span>`;
                } else {
                    const startAge = wuXingNum + 10 * (step - 1);
                    const endAge = startAge + 9;
                    const startYear = birthLunarYear + startAge - 1;
                    const endYear = birthLunarYear + endAge - 1;
                    const startGanZhi = ZiWeiCore.getYearGanZhiByLunarYear(startYear);
                    const endGanZhi = ZiWeiCore.getYearGanZhiByLunarYear(endYear);
                    flowHtml = `<span class="flow-label">第</span><span class="flow-number">${step}</span><span class="flow-label">步大限：</span>` +
                               `<span class="flow-label">农历</span><span class="flow-number">${startYear}</span><span class="flow-label">年 </span><span class="flow-ganzhi">${startGanZhi}</span>` +
                               `<span class="flow-label"> ~ </span>` +
                               `<span class="flow-label">农历</span><span class="flow-number">${endYear}</span><span class="flow-label">年 </span><span class="flow-ganzhi">${endGanZhi}</span>`;
                }
            } else if (mode === 'liuNian') {
                const virtualAge = flowLunarYear - birthLunarYear + 1;
                const ganZhi = liuGanZhi.nian || ZiWeiCore.getYearGanZhiByLunarYear(flowLunarYear);
                const yearRange = ZiWeiCore.getLunarYearRange(flowLunarYear);
                if (yearRange) {
                    const startDate = yearRange.startDate;
                    const endDate = yearRange.endDate;
                    const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                    flowHtml = `<span class="flow-number">${virtualAge}</span><span class="flow-label">虚岁 </span>` +
                               `<span class="flow-label">农历</span><span class="flow-number">${flowLunarYear}</span><span class="flow-label">年 </span><span class="flow-ganzhi">${ganZhi}</span>` +
                               `<span class="flow-label">：</span>` +
                               `<span class="flow-number">${fmt(startDate)}</span><span class="flow-label"> ~ </span><span class="flow-number">${fmt(endDate)}</span>`;
                } else {
                    flowHtml = `<span class="flow-number">${virtualAge}</span><span class="flow-label">虚岁 农历</span><span class="flow-number">${flowLunarYear}</span><span class="flow-label">年 </span><span class="flow-ganzhi">${ganZhi}</span>`;
                }
            } else if (mode === 'liuYue') {
                const effMonth = flowEffectiveMonth !== null ? flowEffectiveMonth : calcMonth;
                const range = ZiWeiCore.getEffectiveMonthRange(flowLunarYear, effMonth);
                if (range) {
                    const startDate = range.startDate;
                    const endDate = range.endDate;
                    const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                    const monthName = monthNames[effMonth-1] || effMonth + '月';
                    flowHtml = `<span class="flow-label">农历</span><span class="flow-number">${flowLunarYear}</span><span class="flow-label">年</span>` +
                               `<span class="flow-label">${monthName}</span>` +
                               `<span class="flow-label">：</span>` +
                               `<span class="flow-number">${fmt(startDate)}</span><span class="flow-label"> ~ </span><span class="flow-number">${fmt(endDate)}</span>`;
                } else {
                    flowHtml = `<span class="flow-label">农历</span><span class="flow-number">${flowLunarYear}</span><span class="flow-label">年</span><span class="flow-number">${effMonth}</span><span class="flow-label">月</span>`;
                }
            }
            flowInfoDiv.innerHTML = flowHtml;

            cells.forEach(cell => {
                const zhi = cell.getAttribute('data-dizhi');
                const daXianDiv = cell.querySelector('.da-xian');
                if (daXianDiv) {
                    daXianDiv.textContent = daXianMap[zhi] || '';
                }
            });

            cells.forEach(cell => {
                const zhi = cell.getAttribute('data-dizhi');
                const csCol = cell.querySelector('.cs-col');
                if (csCol) {
                    const text = changShengMap[zhi] || '';
                    csCol.innerHTML = '';
                    if (text.length > 0) {
                        for (let i = 0; i < text.length; i++) {
                            const span = document.createElement('span');
                            span.className = 'shen-char';
                            span.textContent = text[i];
                            csCol.appendChild(span);
                        }
                        if (text.length === 1) {
                            const empty = document.createElement('span');
                            empty.className = 'shen-char';
                            empty.textContent = '\u00A0';
                            empty.style.opacity = '0';
                            csCol.appendChild(empty);
                        }
                    } else {
                        for (let i = 0; i < 2; i++) {
                            const empty = document.createElement('span');
                            empty.className = 'shen-char';
                            empty.textContent = '\u00A0';
                            empty.style.opacity = '0';
                            csCol.appendChild(empty);
                        }
                    }
                }
            });

            if (mode !== 'yuan') {
                liuGanZhi.nian = null;
                liuGanZhi.yue = null;
                liuGanZhi.ri = null;
                liuGanZhi.shi = null;
                liuNianZhi = null;
                effectiveMonth = null;
                lunarDay = null;

                let y = calcYear, m = calcMonth, d = calcDay, h = calcHour;
                try {
                    const testDate = new Date(y, m-1, d);
                    if (testDate.getFullYear() !== y || testDate.getMonth() !== m-1 || testDate.getDate() !== d) {
                        const lastDay = new Date(y, m, 0).getDate();
                        d = Math.min(d, lastDay);
                    }
                } catch(e) {
                    const now = new Date();
                    y = now.getFullYear();
                    m = now.getMonth() + 1;
                    d = now.getDate();
                    h = Math.floor((now.getHours() + 1) / 2) % 12;
                }

                const lunarFlow = ZiWeiCore.solarToLunar(y, m, d);
                if (lunarFlow) {
                    const liuNianGan = ZiWeiCore.tianGan[(lunarFlow.year - 4) % 10];
                    liuNianZhi = ZiWeiCore.diZhi[(lunarFlow.year - 4) % 12];
                    liuGanZhi.nian = liuNianGan + liuNianZhi;

                    effectiveMonth = ZiWeiCore.getEffectiveMonth(lunarFlow.month, lunarFlow.day, lunarFlow.isLeap);
                    lunarDay = lunarFlow.day;

                    const wuHuMap = {
                        '甲': '丙', '乙': '戊', '丙': '庚', '丁': '壬', '戊': '甲',
                        '己': '丙', '庚': '戊', '辛': '庚', '壬': '壬', '癸': '甲'
                    };
                    const firstMonthGan = wuHuMap[liuNianGan];
                    if (firstMonthGan) {
                        const ganList = ZiWeiCore.tianGan;
                        let firstIdx = ganList.indexOf(firstMonthGan);
                        const zhiList = ['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'];
                        const monthIndex = effectiveMonth - 1;
                        const targetIdx = (firstIdx + monthIndex) % 10;
                        const yueGan = ganList[targetIdx];
                        const yueZhi = zhiList[monthIndex];
                        liuGanZhi.yue = yueGan + yueZhi;
                    }

                    const baseDate = new Date(Date.UTC(1900, 0, 1));
                    const targetDate = new Date(Date.UTC(y, m-1, d));
                    const daysDiff = Math.floor((targetDate - baseDate) / 86400000);
                    const dayGanIndex = (daysDiff + 0) % 10;
                    const dayZhiIndex = (daysDiff + 10) % 12;
                    liuGanZhi.ri = ZiWeiCore.tianGan[dayGanIndex] + ZiWeiCore.diZhi[dayZhiIndex];

                    const riGan = ZiWeiCore.tianGan[dayGanIndex];
                    const wuShuMap = {
                        '甲': '甲', '乙': '丙', '丙': '戊', '丁': '庚', '戊': '壬',
                        '己': '甲', '庚': '丙', '辛': '戊', '壬': '庚', '癸': '壬'
                    };
                    const firstHourGan = wuShuMap[riGan];
                    if (firstHourGan) {
                        const ganList = ZiWeiCore.tianGan;
                        let firstIdx = ganList.indexOf(firstHourGan);
                        const targetIdx = (firstIdx + h) % 10;
                        const shiGan = ganList[targetIdx];
                        const shiZhi = ZiWeiCore.diZhi[h % 12];
                        liuGanZhi.shi = shiGan + shiZhi;
                    }
                } else {
                    const fallback = ZiWeiCore.getFourPillars(y, m, d, h);
                    if (fallback) {
                        liuGanZhi.nian = fallback.year;
                        liuGanZhi.yue = fallback.month;
                        liuGanZhi.ri = fallback.day;
                        liuGanZhi.shi = fallback.hour;
                        effectiveMonth = m;
                        lunarDay = d;
                        liuNianZhi = fallback.year[1];
                    }
                }
            }

            const levelOrder = ['daXian', 'liuNian', 'liuYue', 'liuRi', 'liuShi'];
            let levelsToShow = [];
            if (mode === 'yuan') levelsToShow = [];
            else if (mode === 'daXian') levelsToShow = ['daXian'];
            else if (mode === 'liuNian') levelsToShow = ['daXian', 'liuNian'];
            else if (mode === 'liuYue') levelsToShow = ['liuNian', 'liuYue'];
            else if (mode === 'liuRi') levelsToShow = ['liuYue', 'liuRi'];
            else if (mode === 'liuShi') levelsToShow = ['liuRi', 'liuShi'];

            levelsToShow.forEach(level => {
                let gan, zhi;
                if (level === 'daXian') {
                    gan = daXianGan;
                    zhi = daXianMing;
                } else if (level === 'liuNian') {
                    if (liuGanZhi.nian) {
                        gan = liuGanZhi.nian[0];
                        zhi = liuGanZhi.nian[1];
                    } else return;
                } else if (level === 'liuYue') {
                    if (liuGanZhi.yue) {
                        gan = liuGanZhi.yue[0];
                        zhi = liuGanZhi.yue[1];
                    } else return;
                } else if (level === 'liuRi') {
                    if (liuGanZhi.ri) {
                        gan = liuGanZhi.ri[0];
                        zhi = liuGanZhi.ri[1];
                    } else return;
                } else if (level === 'liuShi') {
                    if (liuGanZhi.shi) {
                        gan = liuGanZhi.shi[0];
                        zhi = liuGanZhi.shi[1];
                    } else return;
                } else return;
                const liuStars = ZiWeiCore.getLiuStarsByLevel(level, gan, zhi);
                Object.keys(liuStars).forEach(name => {
                    if (liuStars[name]) starData[name] = liuStars[name];
                });
            });

            const douJun = ZiWeiCore.getDouJun(effectiveMonthOriginal, pillars ? pillars.hour[1] : ZiWeiCore.diZhi[hourIdx]);

            let liuPanLabels = {};
            let xiaoXianMing = null;
            if (mode === 'liuNian' && liuNianType === 'xiaoXian') {
                const birthLunarYear = parseInt(document.getElementById('lunarYear').value, 10);
                const liuNianLunarYear = calcYear;
                const age = liuNianLunarYear - birthLunarYear + 1;
                const startZhiMap = {
                    '寅':'辰', '午':'辰', '戌':'辰',
                    '亥':'丑', '卯':'丑', '未':'丑',
                    '申':'戌', '子':'戌', '辰':'戌',
                    '巳':'未', '酉':'未', '丑':'未'
                };
                const startZhi = startZhiMap[yearZhi];
                if (startZhi) {
                    const startIdx = ZiWeiCore.diZhi.indexOf(startZhi);
                    const step = (age - 1) % 12;
                    const direction = (gender === 'male') ? 1 : -1;
                    const targetIdx = (startIdx + step * direction + 12) % 12;
                    xiaoXianMing = ZiWeiCore.diZhi[targetIdx];
                }
            }

            const labelParams = {
                baseMingZhi: mingZhi,
                gender: gender,
                isYang: isYang,
                daXianStep: daXianStepVal,
                liuNianZhi: liuNianZhi || ZiWeiCore.diZhi[(calcYear - 4) % 12],
                liuYue: effectiveMonth || calcMonth,
                liuRi: lunarDay || calcDay,
                liuShi: calcHour,
                douJun: douJun,
                birthYearZhi: yearZhi,
                xiaoXianMing: xiaoXianMing
            };

            if (mode === 'yuan') {
                liuPanLabels = {};
            } else {
                liuPanLabels = ZiWeiCore.getLiuPanLabels(mode, labelParams) || {};
                if (daXianStepVal < 0 && (mode === 'daXian' || mode === 'liuNian')) {
                    const mingIdx = ZiWeiCore.diZhi.indexOf(daXianMing);
                    for (let i = 0; i < 12; i++) {
                        const idx = (mingIdx + i) % 12;
                        const zhi = ZiWeiCore.diZhi[idx];
                        const label = '限' + GONG_NAMES_SUFFIX[i];
                        if (!liuPanLabels[zhi]) liuPanLabels[zhi] = [];
                        const otherLabels = liuPanLabels[zhi].filter(l => !l.startsWith('限'));
                        liuPanLabels[zhi] = [label, ...otherLabels];
                    }
                }
            }
            starData.__liuPanLabels = liuPanLabels;

            cells.forEach(cell => {
                cell.classList.remove('ming-bg', 'special-bg');
            });

            let targetZhi = null;
            if (highlightMode === 'manual' && manualHighlightZhi) {
                targetZhi = manualHighlightZhi;
            } else {
                if (mode === 'yuan') {
                    targetZhi = mingZhi;
                } else {
                    const labelsMap = starData.__liuPanLabels;
                    if (labelsMap) {
                        let prefix = '';
                        if (mode === 'daXian') prefix = '限';
                        else if (mode === 'liuNian') prefix = '年';
                        else if (mode === 'liuYue') prefix = '月';
                        else if (mode === 'liuRi') prefix = '日';
                        else if (mode === 'liuShi') prefix = '时';
                        if (prefix) {
                            const targetLabel = prefix + '命';
                            for (let zhi in labelsMap) {
                                if (labelsMap[zhi].includes(targetLabel)) {
                                    targetZhi = zhi;
                                    break;
                                }
                            }
                        }
                    }
                }
                if (!targetZhi) targetZhi = mingZhi;
                highlightMode = 'auto';
            }

            ZiWeiRender.applyHighlight(targetZhi);

            const allLevels = [];
            if (mode === 'yuan') {
            } else if (mode === 'daXian') {
                allLevels.push('daXian');
            } else if (mode === 'liuNian') {
                allLevels.push('daXian', 'liuNian');
            } else if (mode === 'liuYue') {
                allLevels.push('daXian', 'liuNian', 'liuYue');
            } else if (mode === 'liuRi') {
                allLevels.push('daXian', 'liuNian', 'liuYue', 'liuRi');
            } else if (mode === 'liuShi') {
                allLevels.push('daXian', 'liuNian', 'liuYue', 'liuRi', 'liuShi');
            }

            const liuPillarsHtml = [];
            const levelNameMap = {
                'daXian': '限', 'liuNian': '年', 'liuYue': '月', 'liuRi': '日', 'liuShi': '时'
            };
            allLevels.forEach(level => {
                let gan, zhi;
                if (level === 'daXian') {
                    gan = daXianGan;
                    zhi = daXianMing;
                } else if (level === 'liuNian') {
                    if (liuGanZhi.nian) {
                        gan = liuGanZhi.nian[0];
                        zhi = liuGanZhi.nian[1];
                    } else return;
                } else if (level === 'liuYue') {
                    if (liuGanZhi.yue) {
                        gan = liuGanZhi.yue[0];
                        zhi = liuGanZhi.yue[1];
                    } else return;
                } else if (level === 'liuRi') {
                    if (liuGanZhi.ri) {
                        gan = liuGanZhi.ri[0];
                        zhi = liuGanZhi.ri[1];
                    } else return;
                } else if (level === 'liuShi') {
                    if (liuGanZhi.shi) {
                        gan = liuGanZhi.shi[0];
                        zhi = liuGanZhi.shi[1];
                    } else return;
                } else return;
                const name = levelNameMap[level] || '';
                liuPillarsHtml.push(`
                    <div class="liu-pillar-item">
                        <span class="liu-label">${name}</span>
                        <span class="liu-gan">${gan}</span><span class="liu-zhi">${zhi}</span>
                    </div>
                `);
            });
            document.getElementById('liuPillars').innerHTML = liuPillarsHtml.join('');

            let suiMap = null, jiangMap = null, boMap = null;
            if (mode === 'yuan' || mode === 'daXian') {
                suiMap = ZiWeiCore.getSuiQianStars(yearZhi);
                jiangMap = ZiWeiCore.getJiangQianStars(yearZhi);
                const lucunZhi = ZiWeiCore.getYearStars(yearGan)['禄存'];
                if (lucunZhi) boMap = ZiWeiCore.getBoShiStars(lucunZhi, isYang, gender);
            } else if (mode === 'liuNian' || mode === 'liuYue' || mode === 'liuRi' || mode === 'liuShi') {
                const liuNianGan = liuGanZhi.nian ? liuGanZhi.nian[0] : null;
                if (liuNianGan && liuNianZhi) {
                    suiMap = ZiWeiCore.getSuiQianStars(liuNianZhi);
                    jiangMap = ZiWeiCore.getJiangQianStars(liuNianZhi);
                    const lucunZhi = ZiWeiCore.getYearStars(liuNianGan)['禄存'];
                    if (lucunZhi) {
                        const yangGan = ['甲','丙','戊','庚','壬'];
                        const liuIsYang = yangGan.includes(liuNianGan);
                        boMap = ZiWeiCore.getBoShiStars(lucunZhi, liuIsYang, gender);
                    }
                }
            }

            cells.forEach(cell => {
                const zhi = cell.getAttribute('data-dizhi');

                const suiCol = cell.querySelector('.sui-col');
                if (suiCol && suiMap) {
                    suiCol.innerHTML = '';
                    let starName = null;
                    for (let key in suiMap) {
                        if (suiMap[key] === zhi) { starName = key; break; }
                    }
                    if (starName) {
                        for (let i = 0; i < starName.length; i++) {
                            const span = document.createElement('span');
                            span.className = 'shen-char';
                            span.textContent = starName[i];
                            suiCol.appendChild(span);
                        }
                        if (starName.length === 1) {
                            const empty = document.createElement('span');
                            empty.className = 'shen-char';
                            empty.textContent = '\u00A0';
                            empty.style.opacity = '0';
                            suiCol.appendChild(empty);
                        }
                    }
                }

                const jiangCol = cell.querySelector('.jiang-col');
                if (jiangCol && jiangMap) {
                    jiangCol.innerHTML = '';
                    let starName = null;
                    for (let key in jiangMap) {
                        if (jiangMap[key] === zhi) { starName = key; break; }
                    }
                    if (starName) {
                        for (let i = 0; i < starName.length; i++) {
                            const span = document.createElement('span');
                            span.className = 'shen-char';
                            span.textContent = starName[i];
                            jiangCol.appendChild(span);
                        }
                        if (starName.length === 1) {
                            const empty = document.createElement('span');
                            empty.className = 'shen-char';
                            empty.textContent = '\u00A0';
                            empty.style.opacity = '0';
                            jiangCol.appendChild(empty);
                        }
                    }
                }

                const boCol = cell.querySelector('.bo-col');
                if (boCol && boMap) {
                    boCol.innerHTML = '';
                    let starName = null;
                    for (let key in boMap) {
                        if (boMap[key] === zhi) { starName = key; break; }
                    }
                    if (starName) {
                        for (let i = 0; i < starName.length; i++) {
                            const span = document.createElement('span');
                            span.className = 'shen-char';
                            span.textContent = starName[i];
                            boCol.appendChild(span);
                        }
                        if (starName.length === 1) {
                            const empty = document.createElement('span');
                            empty.className = 'shen-char';
                            empty.textContent = '\u00A0';
                            empty.style.opacity = '0';
                            boCol.appendChild(empty);
                        }
                    }
                }
            });

            let baseTransformMap = {};
            let highTransformMap = {};
            let lowTransformMap = {};
            let highPrefix = null;
            let lowPrefix = null;

            const baseTransform = ZiWeiCore.getFourTransform(yearGan);
            if (baseTransform) {
                for (let [mark, star] of Object.entries(baseTransform)) {
                    if (!baseTransformMap[star]) baseTransformMap[star] = [];
                    baseTransformMap[star].push(mark);
                }
            }

            function addTransformToMap(map, gan) {
                if (!gan) return;
                const trans = ZiWeiCore.getFourTransform(gan);
                if (trans) {
                    for (let [mark, star] of Object.entries(trans)) {
                        if (!map[star]) map[star] = [];
                        map[star].push(mark);
                    }
                }
            }

            if (mode === 'daXian') {
                highPrefix = '限';
                addTransformToMap(highTransformMap, daXianGan);
            } else if (mode === 'liuNian') {
                highPrefix = '限';
                lowPrefix = '年';
                addTransformToMap(highTransformMap, daXianGan);
                const liuNianGan = liuGanZhi.nian ? liuGanZhi.nian[0] : null;
                addTransformToMap(lowTransformMap, liuNianGan);
            } else if (mode === 'liuYue') {
                highPrefix = '年';
                lowPrefix = '月';
                const liuNianGan = liuGanZhi.nian ? liuGanZhi.nian[0] : null;
                addTransformToMap(highTransformMap, liuNianGan);
                const liuYueGan = liuGanZhi.yue ? liuGanZhi.yue[0] : null;
                addTransformToMap(lowTransformMap, liuYueGan);
            } else if (mode === 'liuRi') {
                highPrefix = '月';
                lowPrefix = '日';
                const liuYueGan = liuGanZhi.yue ? liuGanZhi.yue[0] : null;
                addTransformToMap(highTransformMap, liuYueGan);
                const liuRiGan = liuGanZhi.ri ? liuGanZhi.ri[0] : null;
                addTransformToMap(lowTransformMap, liuRiGan);
            } else if (mode === 'liuShi') {
                highPrefix = '日';
                lowPrefix = '时';
                const liuRiGan = liuGanZhi.ri ? liuGanZhi.ri[0] : null;
                addTransformToMap(highTransformMap, liuRiGan);
                const liuShiGan = liuGanZhi.shi ? liuGanZhi.shi[0] : null;
                addTransformToMap(lowTransformMap, liuShiGan);
            }

            ZiWeiRender.renderStarsToPalace(starData, fourTransform, baseTransformMap, highTransformMap, lowTransformMap, highPrefix, lowPrefix);

            ZiWeiRender.bindPalaceClick(palaceClickHandler);

            errorDiv.style.display = 'none';

        } catch (err) {
            errorDiv.textContent = '⚠️ ' + err.message;
            errorDiv.style.display = 'block';
            flowInfoDiv.innerHTML = '';
            document.querySelectorAll('#centerDisplay .gan, #centerDisplay .zhi, #centerDisplay .wu-xing, #centerDisplay .yin-yang, #mingZhu, #shenZhu, #centerDateInfo, #liuPillars').forEach(el => el.textContent = '');
            document.querySelectorAll('.tian-gan-label').forEach(el => el.textContent = '');
            document.querySelectorAll('.palace-name').forEach(el => el.textContent = '');
            document.querySelectorAll('.star-top-left').forEach(el => el.innerHTML = '');
            document.querySelectorAll('.da-xian').forEach(el => el.textContent = '');
            document.querySelectorAll('.cs-col, .sui-col, .jiang-col, .bo-col').forEach(el => el.innerHTML = '');
        }
    }

    function initControls() {
        document.getElementById('btnYuanPan').addEventListener('click', function() {
            document.querySelector('input[name="diskMode"][value="yuan"]').checked = true;
            updateDiskControls();
            onCalculate();
        });
        const radios = document.querySelectorAll('input[name="diskMode"]');
        radios.forEach(r => {
            r.addEventListener('change', function() { updateDiskControls(); });
        });
        document.getElementById('btnFlow').addEventListener('click', doFlowPan);
        document.getElementById('btnPrev').addEventListener('click', function() { onNav('prev'); });
        document.getElementById('btnNext').addEventListener('click', function() { onNav('next'); });
    }

    window.switchCalendar = switchCalendar;

    window.addEventListener('load', function() {
        YuanPan.setupBranding();

        initLunarDays();

        const now = new Date();
        const y = now.getFullYear();
        const m = now.getMonth() + 1;
        const d = now.getDate();
        const h = now.getHours();
        let hIdx = Math.floor((h + 1) / 2) % 12;
        if (hIdx < 0) hIdx = 0;
        document.getElementById('solarYear').value = y;
        document.getElementById('solarMonth').value = m;
        document.getElementById('solarDay').value = d;
        document.getElementById('birthHour').value = hIdx;
        const lunar = ZiWeiCore.solarToLunar(y, m, d);
        if (lunar) {
            document.getElementById('lunarYear').value = lunar.year;
            document.getElementById('lunarMonth').value = lunar.month;
            document.getElementById('lunarLeap').value = lunar.isLeap ? 1 : 0;
            document.getElementById('lunarDay').value = lunar.day;
        }

        LiuPan.generatePalaces();
        initControls();
        buildDaXianOptions(6);
        setCurrentTime();
        updateDiskControls();
        onCalculate();
    });

    window.addEventListener('resize', function() {
        if (typeof onCalculate === 'function') onCalculate();
    });

})();