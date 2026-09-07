(function() {
    'use strict';

    function getMarkColor(type) {
        switch(type) {
            case '禄': return '#006400';
            case '权': return '#4a3a8a';
            case '科': return '#2196F3';
            case '忌': return '#b22222';
            default: return 'gray';
        }
    }

    function applyHighlight(targetZhi) {
        var cells = document.querySelectorAll('.palace-cell');
        cells.forEach(function(c) {
            c.classList.remove('ming-bg', 'special-bg');
        });
        if (!targetZhi) return;

        var allZhi = ZiWeiCore.diZhi;
        var idx = allZhi.indexOf(targetZhi);
        if (idx === -1) return;

        var caiIdx = (idx + 4) % 12;
        var qianIdx = (idx + 6) % 12;
        var guanIdx = (idx + 8) % 12;
        var caiZhi = allZhi[caiIdx];
        var qianZhi = allZhi[qianIdx];
        var guanZhi = allZhi[guanIdx];

        cells.forEach(function(c) {
            var zhi = c.getAttribute('data-dizhi');
            if (zhi === targetZhi) {
                c.classList.add('ming-bg');
            } else if (zhi === caiZhi || zhi === qianZhi || zhi === guanZhi) {
                c.classList.add('special-bg');
            }
        });
    }

    function bindPalaceClick(handler) {
        var cells = document.querySelectorAll('.palace-cell');
        cells.forEach(function(cell) {
            cell.removeEventListener('click', handler);
            cell.addEventListener('click', handler);
        });
    }

    function renderStarsToPalace(starData, fourTransform, baseTransformMap, highTransformMap, lowTransformMap, highPrefix, lowPrefix) {
        var cells = document.querySelectorAll('.palace-cell');
        var isMobile = window.innerWidth <= 750;
        var fixedSize = isMobile ? 12 : 14;
        var defaultGap = 3;
        var miscMinSize = isMobile ? 8 : 9;
        var miscMaxSize = fixedSize;

        var flowColorMap = {
            '限': '#00CED1',
            '年': '#FF8C00',
            '月': '#8B6B3D',
            '日': '#E91E63',
            '时': '#607D8B'
        };

        function getFlowColor(starName) {
            var prefixes = ['限','年','月','日','时'];
            for (var pi = 0; pi < prefixes.length; pi++) {
                if (starName.startsWith(prefixes[pi])) return flowColorMap[prefixes[pi]] || '#008080';
            }
            return '#008080';
        }

        var flowTransformMap = {};

        function addFlowTransform(prefix, starName, marks) {
            if (!starName || !marks) return;
            var flowStarName = '';
            if (starName === '文昌') flowStarName = prefix + '昌';
            else if (starName === '文曲') flowStarName = prefix + '曲';
            else return;
            if (!flowTransformMap[flowStarName]) flowTransformMap[flowStarName] = [];
            flowTransformMap[flowStarName].push.apply(flowTransformMap[flowStarName], marks);
        }

        if (highTransformMap && highPrefix) {
            for (var key in highTransformMap) {
                if (highTransformMap.hasOwnProperty(key)) {
                    if (key === '文昌' || key === '文曲') {
                        addFlowTransform(highPrefix, key, highTransformMap[key]);
                    }
                }
            }
        }
        if (lowTransformMap && lowPrefix) {
            for (var key2 in lowTransformMap) {
                if (lowTransformMap.hasOwnProperty(key2)) {
                    if (key2 === '文昌' || key2 === '文曲') {
                        addFlowTransform(lowPrefix, key2, lowTransformMap[key2]);
                    }
                }
            }
        }

        var highTransformForStars = highTransformMap ? JSON.parse(JSON.stringify(highTransformMap)) : null;
        var lowTransformForStars = lowTransformMap ? JSON.parse(JSON.stringify(lowTransformMap)) : null;
        if (highTransformForStars) {
            delete highTransformForStars['文昌'];
            delete highTransformForStars['文曲'];
        }
        if (lowTransformForStars) {
            delete lowTransformForStars['文昌'];
            delete lowTransformForStars['文曲'];
        }

        function buildYuanJuElements(starNames, zhi, gap, miscSize) {
            var fragment = document.createDocumentFragment();
            starNames.forEach(function(item) {
                var isMisc = (item.category === 'misc');
                var fontSize = isMisc ? miscSize : fixedSize;
                var starDiv = document.createElement('div');
                starDiv.className = 'star-item';
                starDiv.style.display = 'flex';
                starDiv.style.flexDirection = 'column';
                starDiv.style.alignItems = 'center';

                var nameSpan = document.createElement('span');
                nameSpan.className = 'star-name';
                nameSpan.textContent = item.name;
                nameSpan.style.color = ZiWeiCore.getStarColor(item.name);
                nameSpan.style.fontSize = fontSize + 'px';
                starDiv.appendChild(nameSpan);

                var miao = ZiWeiCore.getMiaoXian(item.name, zhi);
                if (miao) {
                    var miaoSpan = document.createElement('span');
                    miaoSpan.className = 'star-miao';
                    miaoSpan.textContent = miao;
                    miaoSpan.style.fontSize = (fontSize * 0.75) + 'px';
                    starDiv.appendChild(miaoSpan);
                }

                function createRowContainer() {
                    var container = document.createElement('div');
                    container.className = 'transform-row';
                    container.style.display = 'flex';
                    container.style.flexDirection = 'column';
                    container.style.alignItems = 'center';
                    container.style.minHeight = '1.2em';
                    container.style.justifyContent = 'center';
                    container.style.flexShrink = '0';
                    // 添加不可见占位符，确保空行也占位
                    var placeholder = document.createElement('span');
                    placeholder.textContent = '\u00A0';
                    placeholder.style.opacity = '0';
                    placeholder.style.fontSize = '0';
                    placeholder.style.height = '0';
                    container.appendChild(placeholder);
                    return container;
                }

                var baseRow = createRowContainer();
                var baseMarks = baseTransformMap ? baseTransformMap[item.name] : null;
                if (baseMarks) {
                    baseMarks.forEach(function(mark) {
                        var tSpan = document.createElement('span');
                        tSpan.className = 'star-transform';
                        tSpan.textContent = mark;
                        tSpan.style.fontSize = fontSize + 'px';
                        tSpan.style.backgroundColor = getMarkColor(mark);
                        tSpan.style.display = 'inline-block';
                        tSpan.style.padding = '0 2px';
                        tSpan.style.borderRadius = '2px';
                        tSpan.style.color = '#fff';
                        tSpan.style.fontWeight = 'bold';
                        baseRow.appendChild(tSpan);
                    });
                }
                starDiv.appendChild(baseRow);

                var highRow = createRowContainer();
                var highMarks = highTransformForStars ? highTransformForStars[item.name] : null;
                if (highMarks && highPrefix) {
                    var color = flowColorMap[highPrefix] || '#008080';
                    highMarks.forEach(function(mark) {
                        var tSpan = document.createElement('span');
                        tSpan.className = 'star-transform';
                        tSpan.textContent = mark;
                        tSpan.style.fontSize = fontSize + 'px';
                        tSpan.style.backgroundColor = color;
                        tSpan.style.color = '#fff';
                        tSpan.style.display = 'inline-block';
                        tSpan.style.padding = '0 2px';
                        tSpan.style.borderRadius = '2px';
                        tSpan.style.fontWeight = 'bold';
                        highRow.appendChild(tSpan);
                    });
                }
                starDiv.appendChild(highRow);

                var lowRow = createRowContainer();
                var lowMarks = lowTransformForStars ? lowTransformForStars[item.name] : null;
                if (lowMarks && lowPrefix) {
                    var color2 = flowColorMap[lowPrefix] || '#008080';
                    lowMarks.forEach(function(mark) {
                        var tSpan = document.createElement('span');
                        tSpan.className = 'star-transform';
                        tSpan.textContent = mark;
                        tSpan.style.fontSize = fontSize + 'px';
                        tSpan.style.backgroundColor = color2;
                        tSpan.style.color = '#fff';
                        tSpan.style.display = 'inline-block';
                        tSpan.style.padding = '0 2px';
                        tSpan.style.borderRadius = '2px';
                        tSpan.style.fontWeight = 'bold';
                        lowRow.appendChild(tSpan);
                    });
                }
                starDiv.appendChild(lowRow);

                fragment.appendChild(starDiv);
            });
            return fragment;
        }

        function buildFlowRowsFromPrefixes(flowList, prefix, fixedSize) {
            if (!prefix) {
                var emptyRow = document.createElement('div');
                emptyRow.className = 'flow-row';
                emptyRow.style.display = 'flex';
                emptyRow.style.flexDirection = 'row';
                emptyRow.style.alignItems = 'center';
                emptyRow.style.justifyContent = 'flex-end';
                emptyRow.style.minHeight = '1.2em';
                emptyRow.style.gap = '1px';
                return emptyRow;
            }

            var rowDiv = document.createElement('div');
            rowDiv.className = 'flow-row';
            rowDiv.style.display = 'flex';
            rowDiv.style.flexDirection = 'row';
            rowDiv.style.alignItems = 'center';
            rowDiv.style.justifyContent = 'flex-end';
            rowDiv.style.minHeight = '1.2em';
            rowDiv.style.gap = '1px';

            if (flowList && flowList.length > 0) {
                flowList.forEach(function(name) {
                    if (name.startsWith(prefix)) {
                        var starDiv = document.createElement('div');
                        starDiv.className = 'flow-star';
                        starDiv.style.display = 'inline-flex';
                        starDiv.style.alignItems = 'center';
                        var nameSpan = document.createElement('span');
                        nameSpan.className = 'star-name';
                        nameSpan.textContent = name;
                        nameSpan.style.color = getFlowColor(name);
                        nameSpan.style.fontSize = fixedSize + 'px';
                        starDiv.appendChild(nameSpan);

                        var transformMarks = flowTransformMap[name];
                        if (transformMarks && transformMarks.length > 0) {
                            var color = flowColorMap[prefix] || '#008080';
                            transformMarks.forEach(function(mark) {
                                var tSpan = document.createElement('span');
                                tSpan.textContent = mark;
                                tSpan.style.fontSize = (fixedSize * 0.8) + 'px';
                                tSpan.style.backgroundColor = color;
                                tSpan.style.color = '#fff';
                                tSpan.style.fontWeight = 'bold';
                                tSpan.style.display = 'inline-block';
                                tSpan.style.padding = '0 2px';
                                tSpan.style.borderRadius = '2px';
                                tSpan.style.marginLeft = '1px';
                                starDiv.appendChild(tSpan);
                            });
                        }
                        rowDiv.appendChild(starDiv);
                    }
                });
            }
            return rowDiv;
        }

        var measureContainer = document.createElement('div');
        measureContainer.style.cssText =
            'position: absolute; visibility: hidden; display: flex; flex-direction: row; flex-wrap: nowrap;' +
            'align-items: flex-start; font-weight: 700; line-height: 1.2; pointer-events: none;' +
            'width: auto; background: transparent; padding: 0; margin: 0; top: -9999px; left: -9999px;';
        document.body.appendChild(measureContainer);

        function getContainerWidth(container) { return container.scrollWidth; }

        function isOverflowing(container) { return container.scrollWidth > container.clientWidth + 1; }

        cells.forEach(function(cell) {
            var zhi = cell.getAttribute('data-dizhi');
            var yuanJuContainer = cell.querySelector('.star-top-left');
            var flowContainer = cell.querySelector('.flow-container');
            var liuPanLabel = cell.querySelector('.liu-pan-label');
            if (!yuanJuContainer || !flowContainer || !liuPanLabel) return;

            var grouped = ZiWeiCore.getStarsByPalace(zhi, starData);
            var yuanJuList = [];
            ['main','auspicious','malefic','misc'].forEach(function(cat) {
                grouped[cat].forEach(function(name) {
                    yuanJuList.push({ name: name, category: cat });
                });
            });
            var flowList = grouped.flow;

            yuanJuContainer.innerHTML = '';
            flowContainer.innerHTML = '';
            liuPanLabel.innerHTML = '';

            var highRow = buildFlowRowsFromPrefixes(flowList, highPrefix || '', fixedSize);
            var lowRow = buildFlowRowsFromPrefixes(flowList, lowPrefix || '', fixedSize);
            flowContainer.appendChild(highRow);
            flowContainer.appendChild(lowRow);

            if (starData.__liuPanLabels && starData.__liuPanLabels[zhi]) {
                var labels = starData.__liuPanLabels[zhi];
                labels.forEach(function(label) {
                    var prefix = label.charAt(0);
                    var gong = label.substring(1);
                    var col = document.createElement('div');
                    col.className = 'liu-level-col';
                    var bgColor = flowColorMap[prefix] || '#008080';
                    col.style.backgroundColor = bgColor;
                    col.style.padding = '1px 2px';
                    col.style.borderRadius = '3px';
                    col.style.color = '#fff';
                    col.style.fontWeight = 'bold';
                    col.style.fontSize = '13px';
                    col.style.textAlign = 'center';
                    col.style.lineHeight = '1.2';
                    var prefixSpan = document.createElement('span');
                    prefixSpan.textContent = prefix;
                    var gongSpan = document.createElement('span');
                    gongSpan.textContent = gong;
                    col.appendChild(prefixSpan);
                    col.appendChild(gongSpan);
                    liuPanLabel.appendChild(col);
                });
            }

            if (yuanJuList.length === 0) return;

            var fixedGroup = yuanJuList.filter(function(item) { return item.category !== 'misc'; });
            var miscGroup = yuanJuList.filter(function(item) { return item.category === 'misc'; });

            if (miscGroup.length === 0) {
                var fragment = buildYuanJuElements(yuanJuList, zhi, defaultGap, fixedSize);
                yuanJuContainer.appendChild(fragment);
                yuanJuContainer.style.gap = defaultGap + 'px';
                return;
            }

            var tempFragment = buildYuanJuElements(yuanJuList, zhi, defaultGap, fixedSize);
            yuanJuContainer.appendChild(tempFragment);
            yuanJuContainer.style.gap = defaultGap + 'px';
            if (!isOverflowing(yuanJuContainer)) return;

            measureContainer.innerHTML = '';
            measureContainer.style.gap = defaultGap + 'px';
            var fixedFragment = buildYuanJuElements(fixedGroup, zhi, defaultGap, fixedSize);
            measureContainer.appendChild(fixedFragment);
            var fixedWidth = getContainerWidth(measureContainer);
            var containerClientWidth = yuanJuContainer.clientWidth;
            var availableWidth = containerClientWidth - fixedWidth - defaultGap;
            if (availableWidth <= 0) availableWidth = containerClientWidth * 0.3;

            var bestMiscSize = miscMaxSize;
            var bestGap = defaultGap;
            var found = false;
            for (var gap = defaultGap; gap >= 1 && !found; gap--) {
                for (var size = miscMaxSize; size >= miscMinSize && !found; size--) {
                    measureContainer.innerHTML = '';
                    measureContainer.style.gap = gap + 'px';
                    var miscFragment = buildYuanJuElements(miscGroup, zhi, gap, size);
                    measureContainer.appendChild(miscFragment);
                    if (getContainerWidth(measureContainer) <= availableWidth) {
                        bestMiscSize = size;
                        bestGap = gap;
                        found = true;
                        for (var trySize = size + 1; trySize <= miscMaxSize; trySize++) {
                            measureContainer.innerHTML = '';
                            measureContainer.style.gap = gap + 'px';
                            var tryFragment = buildYuanJuElements(miscGroup, zhi, gap, trySize);
                            measureContainer.appendChild(tryFragment);
                            if (getContainerWidth(measureContainer) <= availableWidth) bestMiscSize = trySize;
                            else break;
                        }
                        for (var tryGap = gap + 1; tryGap <= defaultGap; tryGap++) {
                            measureContainer.innerHTML = '';
                            measureContainer.style.gap = tryGap + 'px';
                            var tryFragment2 = buildYuanJuElements(miscGroup, zhi, tryGap, bestMiscSize);
                            measureContainer.appendChild(tryFragment2);
                            if (getContainerWidth(measureContainer) <= availableWidth) bestGap = tryGap;
                            else break;
                        }
                    }
                }
            }
            if (!found) { bestGap = 1; bestMiscSize = miscMinSize; }

            yuanJuContainer.innerHTML = '';
            yuanJuContainer.style.gap = bestGap + 'px';
            var finalFragment = buildYuanJuElements(yuanJuList, zhi, bestGap, bestMiscSize);
            yuanJuContainer.appendChild(finalFragment);
        });

        document.body.removeChild(measureContainer);
    }

    function adjustTransformFontSizeIfOverlap() {
        var cells = document.querySelectorAll('.palace-cell');
        cells.forEach(function(cell) {
            var starContainer = cell.querySelector('.star-top-left');
            var leftInfo = cell.querySelector('.left-info');
            if (!starContainer || !leftInfo) return;
            var starRect = starContainer.getBoundingClientRect();
            var leftRect = leftInfo.getBoundingClientRect();
            var isOverlap = starRect.bottom > leftRect.top;
            var starItems = starContainer.querySelectorAll('.star-item');

            if (isOverlap) {
                var transformSpans = starContainer.querySelectorAll('.star-transform');
                transformSpans.forEach(function(span) {
                    var currentSize = parseFloat(span.style.fontSize);
                    if (!isNaN(currentSize) && currentSize > 0) {
                        span.style.fontSize = (currentSize * 0.8) + 'px';
                    }
                });

                starItems.forEach(function(item) {
                    item.style.gap = '0px';
                    var rows = item.querySelectorAll('.transform-row');
                    rows.forEach(function(row) {
                        row.style.minHeight = '1em';
                        row.style.justifyContent = 'center';
                    });
                });
            } else {
                starItems.forEach(function(item) {
                    item.style.gap = '';
                    var rows = item.querySelectorAll('.transform-row');
                    rows.forEach(function(row) {
                        row.style.minHeight = '';
                        row.style.justifyContent = '';
                    });
                });
            }
        });
    }

    function adjustShenCharSize(mode) {
        var grid = document.getElementById('palaceGrid');
        if (!grid) return;
        var gridWidth = grid.offsetWidth;
        var shenChars = document.querySelectorAll('.left-info .shen-char');

        if (gridWidth >= 900) {
            shenChars.forEach(function(el) {
                el.style.fontSize = '';
            });
            return;
        }

        var flowModes = ['liuNian', 'liuYue', 'liuRi', 'liuShi'];
        var isFlow = flowModes.indexOf(mode) !== -1;

        var hasOverlap = false;
        var cells = document.querySelectorAll('.palace-cell');
        cells.forEach(function(cell) {
            var leftInfo = cell.querySelector('.left-info');
            var palaceName = cell.querySelector('.palace-name');
            var daXian = cell.querySelector('.da-xian');
            if (!leftInfo || !palaceName) return;
            var leftRect = leftInfo.getBoundingClientRect();
            var nameRect = palaceName.getBoundingClientRect();
            if (leftRect.right > nameRect.left) {
                hasOverlap = true;
                return;
            }
            if (daXian) {
                var daXianRect = daXian.getBoundingClientRect();
                if (leftRect.right > daXianRect.left) {
                    hasOverlap = true;
                    return;
                }
            }
        });

        var shouldShrink = isFlow || hasOverlap;

        if (shouldShrink) {
            shenChars.forEach(function(el) {
                el.style.fontSize = '';
                var currentSize = parseFloat(window.getComputedStyle(el).fontSize);
                if (!isNaN(currentSize) && currentSize > 0) {
                    el.style.fontSize = (currentSize * 0.8) + 'px';
                }
            });
        } else {
            shenChars.forEach(function(el) {
                el.style.fontSize = '';
            });
        }
    }

    window.ZiWeiRender = {
        renderStarsToPalace: renderStarsToPalace,
        applyHighlight: applyHighlight,
        bindPalaceClick: bindPalaceClick,
        getMarkColor: getMarkColor,
        adjustTransformFontSizeIfOverlap: adjustTransformFontSizeIfOverlap,
        adjustShenCharSize: adjustShenCharSize
    };

})();