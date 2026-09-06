// ================================================================
// 紫微斗数核心计算库 (ziwei-core.js)
// 包含：农历转换、四柱、安星、四化、长生十二神、天地人盘、流耀等
// ================================================================

(function(global) {
    'use strict';

    // ---------- 农历数据 ----------
    // 农历1900-2100的润大小信息表
	// 0表示小月【29】,1表示大月【30】,将16进制转为2进制查看
	const lunarInfo = [
	0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,//1900-1909
	0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,//1910-1919
	0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,//1920-1929
	0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,//1930-1939
	0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,//1940-1949
	0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0,//1950-1959
	0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,//1960-1969
	0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6,//1970-1979
	0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,//1980-1989
	0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x05ac0,0x0ab60,0x096d5,0x092e0,//1990-1999
	0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,//2000-2009
	0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,//2010-2019
	0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,//2020-2029
	0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,//2030-2039
	0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0,//2040-2049
	0x14b63,0x09370,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50,0x06b20,0x1a6c4,0x0aae0,//2050-2059
	0x0a2e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4,//2060-2069
	0x052d0,0x0a9b8,0x0a950,0x0b4a0,0x0b6a6,0x0ad50,0x055a0,0x0aba4,0x0a5b0,0x052b0,//2070-2079
	0x0b273,0x06930,0x07337,0x06aa0,0x0ad50,0x14b55,0x04b60,0x0a570,0x054e4,0x0d160,//2080-2089
	0x0e968,0x0d520,0x0daa0,0x16aa6,0x056d0,0x04ae0,0x0a9d4,0x0a2d0,0x0d150,0x0f252,//2090-2099
	0x0d520]//2100


    const tianGan = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
    const diZhi = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

    const WU_HU_DUN = {
        '甲': '丙', '己': '丙',
        '乙': '戊', '庚': '戊',
        '丙': '庚', '辛': '庚',
        '丁': '壬', '壬': '壬',
        '戊': '甲', '癸': '甲'
    };

    const NAYIN_MAP = {
        '甲子':'金','乙丑':'金','丙寅':'火','丁卯':'火','戊辰':'木','己巳':'木',
        '庚午':'土','辛未':'土','壬申':'金','癸酉':'金','甲戌':'火','乙亥':'火',
        '丙子':'水','丁丑':'水','戊寅':'土','己卯':'土','庚辰':'金','辛巳':'金',
        '壬午':'木','癸未':'木','甲申':'水','乙酉':'水','丙戌':'土','丁亥':'土',
        '戊子':'火','己丑':'火','庚寅':'木','辛卯':'木','壬辰':'水','癸巳':'水',
        '甲午':'金','乙未':'金','丙申':'火','丁酉':'火','戊戌':'木','己亥':'木',
        '庚子':'土','辛丑':'土','壬寅':'金','癸卯':'金','甲辰':'火','乙巳':'火',
        '丙午':'水','丁未':'水','戊申':'土','己酉':'土','庚戌':'金','辛亥':'金',
        '壬子':'木','癸丑':'木','甲寅':'水','乙卯':'水','丙辰':'土','丁巳':'土',
        '戊午':'火','己未':'火','庚申':'木','辛酉':'木','壬戌':'水','癸亥':'水'
    };

    const ZIWEI_MAP = {
        5: { 0: '寅', 1: '午', 2: '亥', 3: '辰', 4: '丑' },
        2: { 0: '寅', 1: '丑' },
        3: { 0: '寅', 1: '辰', 2: '丑' },
        4: { 0: '寅', 1: '亥', 2: '辰', 3: '丑' },
        6: { 0: '寅', 1: '酉', 2: '午', 3: '亥', 4: '辰', 5: '丑' }
    };

    const TIANFU_MAP = {
        '卯': '丑', '丑': '卯',
        '辰': '子', '子': '辰',
        '巳': '亥', '亥': '巳',
        '午': '戌', '戌': '午',
        '未': '酉', '酉': '未'
    };

    // ---------- 年干星曜映射表 ----------
    const YEAR_STAR_MAP = {
        '禄存': { '甲':'寅', '乙':'卯', '丙':'巳', '丁':'午', '戊':'巳', '己':'午', '庚':'申', '辛':'酉', '壬':'亥', '癸':'子' },
        '擎羊': { '甲':'卯', '乙':'辰', '丙':'午', '丁':'未', '戊':'午', '己':'未', '庚':'酉', '辛':'戌', '壬':'子', '癸':'丑' },
        '陀罗': { '甲':'丑', '乙':'寅', '丙':'辰', '丁':'巳', '戊':'辰', '己':'巳', '庚':'未', '辛':'申', '壬':'戌', '癸':'亥' },
        '天魁': { '甲':'丑', '乙':'子', '丙':'亥', '丁':'亥', '戊':'丑', '己':'子', '庚':'丑', '辛':'午', '壬':'卯', '癸':'卯' },
        '天钺': { '甲':'未', '乙':'申', '丙':'酉', '丁':'酉', '戊':'未', '己':'申', '庚':'未', '辛':'寅', '壬':'巳', '癸':'巳' },
        '天官': { '甲':'未', '乙':'辰', '丙':'巳', '丁':'寅', '戊':'卯', '己':'酉', '庚':'亥', '辛':'酉', '壬':'戌', '癸':'午' },
        '天福': { '甲':'酉', '乙':'申', '丙':'子', '丁':'亥', '戊':'卯', '己':'寅', '庚':'午', '辛':'巳', '壬':'午', '癸':'巳' },
        '天厨': { '甲':'巳', '乙':'午', '丙':'子', '丁':'巳', '戊':'子', '己':'申', '庚':'寅', '辛':'午', '壬':'酉', '癸':'亥' }
    };

    // ---------- 月令星曜映射表 ----------
    const MONTH_STAR_MAP = {
        '左辅': { '正月':'辰', '二月':'巳', '三月':'午', '四月':'未', '五月':'申', '六月':'酉', '七月':'戌', '八月':'亥', '九月':'子', '十月':'丑', '冬月':'寅', '腊月':'卯' },
        '右弼': { '正月':'戌', '二月':'酉', '三月':'申', '四月':'未', '五月':'午', '六月':'巳', '七月':'辰', '八月':'卯', '九月':'寅', '十月':'丑', '冬月':'子', '腊月':'亥' },
        '天刑': { '正月':'酉', '二月':'戌', '三月':'亥', '四月':'子', '五月':'丑', '六月':'寅', '七月':'卯', '八月':'辰', '九月':'巳', '十月':'午', '冬月':'未', '腊月':'申' },
        '天姚': { '正月':'丑', '二月':'寅', '三月':'卯', '四月':'辰', '五月':'巳', '六月':'午', '七月':'未', '八月':'申', '九月':'酉', '十月':'戌', '冬月':'亥', '腊月':'子' },
        '月解': { '正月':'申', '二月':'申', '三月':'戌', '四月':'戌', '五月':'子', '六月':'子', '七月':'寅', '八月':'寅', '九月':'辰', '十月':'辰', '冬月':'午', '腊月':'午' },
        '天巫': { '正月':'巳', '二月':'申', '三月':'寅', '四月':'亥', '五月':'巳', '六月':'申', '七月':'寅', '八月':'亥', '九月':'巳', '十月':'申', '冬月':'寅', '腊月':'亥' },
        '天月': { '正月':'戌', '二月':'巳', '三月':'辰', '四月':'寅', '五月':'未', '六月':'卯', '七月':'亥', '八月':'未', '九月':'寅', '十月':'午', '冬月':'戌', '腊月':'寅' },
        '阴煞': { '正月':'寅', '二月':'子', '三月':'戌', '四月':'申', '五月':'午', '六月':'辰', '七月':'寅', '八月':'子', '九月':'戌', '十月':'申', '冬月':'午', '腊月':'辰' }
    };

    // ---------- 年支星曜映射表 ----------
    const BRANCH_STAR_MAP = {
        '天马': { '子':'寅', '丑':'亥', '寅':'申', '卯':'巳', '辰':'寅', '巳':'亥', '午':'申', '未':'巳', '申':'寅', '酉':'亥', '戌':'申', '亥':'巳' },
        '天空': { '子':'丑', '丑':'寅', '寅':'卯', '卯':'辰', '辰':'巳', '巳':'午', '午':'未', '未':'申', '申':'酉', '酉':'戌', '戌':'亥', '亥':'子' },
        '天哭': { '子':'午', '丑':'巳', '寅':'辰', '卯':'卯', '辰':'寅', '巳':'丑', '午':'子', '未':'亥', '申':'戌', '酉':'酉', '戌':'申', '亥':'未' },
        '天虚': { '子':'午', '丑':'未', '寅':'申', '卯':'酉', '辰':'戌', '巳':'亥', '午':'子', '未':'丑', '申':'寅', '酉':'卯', '戌':'辰', '亥':'巳' },
        '龙池': { '子':'辰', '丑':'巳', '寅':'午', '卯':'未', '辰':'申', '巳':'酉', '午':'戌', '未':'亥', '申':'子', '酉':'丑', '戌':'寅', '亥':'卯' },
        '凤阁': { '子':'戌', '丑':'酉', '寅':'申', '卯':'未', '辰':'午', '巳':'巳', '午':'辰', '未':'卯', '申':'寅', '酉':'丑', '戌':'子', '亥':'亥' },
        '红鸾': { '子':'卯', '丑':'寅', '寅':'丑', '卯':'子', '辰':'亥', '巳':'戌', '午':'酉', '未':'申', '申':'未', '酉':'午', '戌':'巳', '亥':'辰' },
        '天喜': { '子':'酉', '丑':'申', '寅':'未', '卯':'午', '辰':'巳', '巳':'辰', '午':'卯', '未':'寅', '申':'丑', '酉':'子', '戌':'亥', '亥':'戌' },
        '孤辰': { '子':'寅', '丑':'寅', '寅':'巳', '卯':'巳', '辰':'巳', '巳':'申', '午':'申', '未':'申', '申':'亥', '酉':'亥', '戌':'亥', '亥':'寅' },
        '寡宿': { '子':'戌', '丑':'戌', '寅':'丑', '卯':'丑', '辰':'丑', '巳':'辰', '午':'辰', '未':'辰', '申':'未', '酉':'未', '戌':'未', '亥':'戌' },
        '蜚廉': { '子':'申', '丑':'酉', '寅':'戌', '卯':'巳', '辰':'午', '巳':'未', '午':'寅', '未':'卯', '申':'辰', '酉':'亥', '戌':'子', '亥':'丑' },
        '破碎': { '子':'巳', '丑':'丑', '寅':'酉', '卯':'巳', '辰':'丑', '巳':'酉', '午':'巳', '未':'丑', '申':'酉', '酉':'巳', '戌':'丑', '亥':'酉' },
        '华盖': { '子':'辰', '丑':'丑', '寅':'戌', '卯':'未', '辰':'辰', '巳':'丑', '午':'戌', '未':'未', '申':'辰', '酉':'丑', '戌':'戌', '亥':'未' },
        '咸池': { '子':'酉', '丑':'午', '寅':'卯', '卯':'子', '辰':'酉', '巳':'午', '午':'卯', '未':'子', '申':'酉', '酉':'午', '戌':'卯', '亥':'子' },
        '大耗': { '子':'未', '丑':'午', '寅':'酉', '卯':'申', '辰':'亥', '巳':'戌', '午':'丑', '未':'子', '申':'卯', '酉':'寅', '戌':'巳', '亥':'辰' },
        '劫煞': { '子':'巳', '丑':'寅', '寅':'亥', '卯':'申', '辰':'巳', '巳':'寅', '午':'亥', '未':'申', '申':'巳', '酉':'寅', '戌':'亥', '亥':'申' },
        '年解': { '子':'戌', '丑':'酉', '寅':'申', '卯':'未', '辰':'午', '巳':'巳', '午':'辰', '未':'卯', '申':'寅', '酉':'丑', '戌':'子', '亥':'亥' },
        '天德': { '子':'酉', '丑':'戌', '寅':'亥', '卯':'子', '辰':'丑', '巳':'寅', '午':'卯', '未':'辰', '申':'巳', '酉':'午', '戌':'未', '亥':'申' },
        '月德': { '子':'巳', '丑':'午', '寅':'未', '卯':'申', '辰':'酉', '巳':'戌', '午':'亥', '未':'子', '申':'丑', '酉':'寅', '戌':'卯', '亥':'辰' }
    };

    // ---------- 时辰星曜映射表 ----------
    const HOUR_STAR_MAP = {
        '文昌': { 0:'戌', 1:'酉', 2:'申', 3:'未', 4:'午', 5:'巳', 6:'辰', 7:'卯', 8:'寅', 9:'丑', 10:'子', 11:'亥' },
        '文曲': { 0:'辰', 1:'巳', 2:'午', 3:'未', 4:'申', 5:'酉', 6:'戌', 7:'亥', 8:'子', 9:'丑', 10:'寅', 11:'卯' },
        '地劫': { 0:'亥', 1:'子', 2:'丑', 3:'寅', 4:'卯', 5:'辰', 6:'巳', 7:'午', 8:'未', 9:'申', 10:'酉', 11:'戌' },
        '地空': { 0:'亥', 1:'戌', 2:'酉', 3:'申', 4:'未', 5:'午', 6:'巳', 7:'辰', 8:'卯', 9:'寅', 10:'丑', 11:'子' },
        '台辅': { 0:'午', 1:'未', 2:'申', 3:'酉', 4:'戌', 5:'亥', 6:'子', 7:'丑', 8:'寅', 9:'卯', 10:'辰', 11:'巳' },
        '封诰': { 0:'寅', 1:'卯', 2:'辰', 3:'巳', 4:'午', 5:'未', 6:'申', 7:'酉', 8:'戌', 9:'亥', 10:'子', 11:'丑' }
    };

    const MARS_START = {
        '寅午戌': 1,
        '申子辰': 2,
        '巳酉丑': 3,
        '亥卯未': 9
    };
    const LING_START = {
        '寅午戌': 3,
        '申子辰': 10,
        '巳酉丑': 10,
        '亥卯未': 10
    };

    const TRANSFORM_MAP = {
        '甲': { 禄: '廉贞', 权: '破军', 科: '武曲', 忌: '太阳' },
        '乙': { 禄: '天机', 权: '天梁', 科: '紫微', 忌: '太阴' },
        '丙': { 禄: '天同', 权: '天机', 科: '文昌', 忌: '廉贞' },
        '丁': { 禄: '太阴', 权: '天同', 科: '天机', 忌: '巨门' },
        '戊': { 禄: '贪狼', 权: '太阴', 科: '太阳', 忌: '天机' },
        '己': { 禄: '武曲', 权: '贪狼', 科: '天梁', 忌: '文曲' },
        '庚': { 禄: '太阳', 权: '武曲', 科: '天府', 忌: '天同' },
        '辛': { 禄: '巨门', 权: '太阳', 科: '文曲', 忌: '文昌' },
        '壬': { 禄: '天梁', 权: '紫微', 科: '天府', 忌: '武曲' },
        '癸': { 禄: '破军', 权: '巨门', 科: '太阴', 忌: '贪狼' }
    };

    // ---------- 命主身主映射表 ----------
    const MING_ZHU_MAP = {
        '子': '贪狼', '丑': '巨门', '寅': '禄存', '卯': '文曲',
        '辰': '廉贞', '巳': '武曲', '午': '破军', '未': '武曲',
        '申': '廉贞', '酉': '文曲', '戌': '禄存', '亥': '巨门'
    };
    const SHEN_ZHU_MAP = {
        '子': '火星', '丑': '天相', '寅': '天梁', '卯': '天同',
        '辰': '文昌', '巳': '天机', '午': '火星', '未': '天相',
        '申': '天梁', '酉': '天同', '戌': '文昌', '亥': '天机'
    };

    // ---------- 庙陷映射表 ----------
    const STAR_MIAO_MAP = {
        '紫微': { '子':'平', '丑':'庙', '寅':'庙', '卯':'旺', '辰':'陷', '巳':'旺', '午':'庙', '未':'庙', '申':'旺', '酉':'平', '戌':'闲', '亥':'旺' },
        '天机': { '子':'庙', '丑':'陷', '寅':'旺', '卯':'旺', '辰':'庙', '巳':'平', '午':'庙', '未':'陷', '申':'平', '酉':'旺', '戌':'庙', '亥':'平' },
        '太阳': { '子':'陷', '丑':'陷', '寅':'旺', '卯':'庙', '辰':'旺', '巳':'旺', '午':'庙', '未':'平', '申':'闲', '酉':'闲', '戌':'陷', '亥':'陷' },
        '武曲': { '子':'旺', '丑':'庙', '寅':'闲', '卯':'陷', '辰':'庙', '巳':'平', '午':'旺', '未':'庙', '申':'平', '酉':'旺', '戌':'庙', '亥':'平' },
        '天同': { '子':'旺', '丑':'陷', '寅':'闲', '卯':'庙', '辰':'平', '巳':'庙', '午':'陷', '未':'陷', '申':'旺', '酉':'平', '戌':'平', '亥':'庙' },
        '廉贞': { '子':'平', '丑':'旺', '寅':'庙', '卯':'闲', '辰':'旺', '巳':'闲', '午':'平', '未':'庙', '申':'庙', '酉':'平', '戌':'旺', '亥':'陷' },
        '天府': { '子':'庙', '丑':'庙', '寅':'庙', '卯':'平', '辰':'庙', '巳':'平', '午':'旺', '未':'庙', '申':'平', '酉':'陷', '戌':'庙', '亥':'旺' },
        '太阴': { '子':'庙', '丑':'庙', '寅':'闲', '卯':'陷', '辰':'闲', '巳':'陷', '午':'陷', '未':'平', '申':'平', '酉':'旺', '戌':'旺', '亥':'庙' },
        '贪狼': { '子':'旺', '丑':'庙', '寅':'平', '卯':'地', '辰':'庙', '巳':'陷', '午':'旺', '未':'庙', '申':'平', '酉':'平', '戌':'庙', '亥':'陷' },
        '巨门': { '子':'旺', '丑':'旺', '寅':'庙', '卯':'庙', '辰':'平', '巳':'平', '午':'旺', '未':'陷', '申':'庙', '酉':'庙', '戌':'旺', '亥':'旺' },
        '天相': { '子':'庙', '丑':'庙', '寅':'庙', '卯':'陷', '辰':'旺', '巳':'平', '午':'旺', '未':'闲', '申':'庙', '酉':'陷', '戌':'闲', '亥':'平' },
        '天梁': { '子':'庙', '丑':'旺', '寅':'庙', '卯':'庙', '辰':'旺', '巳':'陷', '午':'庙', '未':'旺', '申':'陷', '酉':'地', '戌':'旺', '亥':'陷' },
        '七杀': { '子':'旺', '丑':'庙', '寅':'庙', '卯':'陷', '辰':'旺', '巳':'平', '午':'旺', '未':'旺', '申':'庙', '酉':'闲', '戌':'庙', '亥':'平' },
        '破军': { '子':'庙', '丑':'旺', '寅':'陷', '卯':'旺', '辰':'旺', '巳':'闲', '午':'庙', '未':'庙', '申':'陷', '酉':'陷', '戌':'旺', '亥':'平' },
        '天魁': { '子':'旺', '丑':'旺', '寅':'', '卯':'庙', '辰':'', '巳':'', '午':'庙', '未':'', '申':'', '酉':'', '戌':'', '亥':'旺' },
        '天钺': { '子':'', '丑':'', '寅':'旺', '卯':'', '辰':'', '巳':'旺', '午':'', '未':'旺', '申':'庙', '酉':'庙', '戌':'', '亥':'' },
        '左辅': { '子':'旺', '丑':'庙', '寅':'庙', '卯':'陷', '辰':'庙', '巳':'平', '午':'旺', '未':'庙', '申':'平', '酉':'陷', '戌':'庙', '亥':'闲' },
        '右弼': { '子':'庙', '丑':'庙', '寅':'旺', '卯':'陷', '辰':'庙', '巳':'平', '午':'旺', '未':'庙', '申':'闲', '酉':'陷', '戌':'庙', '亥':'平' },
        '文昌': { '子':'旺', '丑':'庙', '寅':'陷', '卯':'平', '辰':'旺', '巳':'庙', '午':'陷', '未':'平', '申':'旺', '酉':'庙', '戌':'陷', '亥':'旺' },
        '文曲': { '子':'庙', '丑':'庙', '寅':'平', '卯':'旺', '辰':'庙', '巳':'庙', '午':'陷', '未':'旺', '申':'平', '酉':'庙', '戌':'陷', '亥':'旺' },
        '禄存': { '子':'旺', '丑':'', '寅':'庙', '卯':'旺', '辰':'', '巳':'庙', '午':'旺', '未':'', '申':'庙', '酉':'旺', '戌':'', '亥':'庙' },
        '天马': { '子':'', '丑':'', '寅':'旺', '卯':'', '辰':'', '巳':'平', '午':'', '未':'', '申':'旺', '酉':'', '戌':'', '亥':'平' },
        '擎羊': { '子':'陷', '丑':'庙', '寅':'', '卯':'陷', '辰':'庙', '巳':'', '午':'平', '未':'庙', '申':'', '酉':'陷', '戌':'庙', '亥':'' },
        '陀罗': { '子':'', '丑':'庙', '寅':'陷', '卯':'', '辰':'庙', '巳':'陷', '午':'', '未':'庙', '申':'陷', '酉':'', '戌':'庙', '亥':'陷' },
        '火星': { '子':'平', '丑':'旺', '寅':'庙', '卯':'平', '辰':'闲', '巳':'旺', '午':'庙', '未':'闲', '申':'陷', '酉':'陷', '戌':'庙', '亥':'平' },
        '铃星': { '子':'陷', '丑':'陷', '寅':'庙', '卯':'庙', '辰':'旺', '巳':'旺', '午':'庙', '未':'旺', '申':'旺', '酉':'陷', '戌':'庙', '亥':'庙' },
        '地空': { '子':'平', '丑':'陷', '寅':'陷', '卯':'平', '辰':'陷', '巳':'庙', '午':'庙', '未':'平', '申':'庙', '酉':'庙', '戌':'陷', '亥':'陷' },
        '地劫': { '子':'陷', '丑':'陷', '寅':'平', '卯':'平', '辰':'陷', '巳':'闲', '午':'庙', '未':'平', '申':'庙', '酉':'平', '戌':'平', '亥':'旺' }
    };

    // ---------- 长生十二神 ----------
    const CHANG_SHENG_DATA = {
        '水二局_阳男阴女': ['申','酉','戌','亥','子','丑','寅','卯','辰','巳','午','未'],
        '水二局_阴男阳女': ['申','未','午','巳','辰','卯','寅','丑','子','亥','戌','酉'],
        '木三局_阳男阴女': ['亥','子','丑','寅','卯','辰','巳','午','未','申','酉','戌'],
        '木三局_阴男阳女': ['亥','戌','酉','申','未','午','巳','辰','卯','寅','丑','子'],
        '金四局_阳男阴女': ['巳','午','未','申','酉','戌','亥','子','丑','寅','卯','辰'],
        '金四局_阴男阳女': ['巳','辰','卯','寅','丑','子','亥','戌','酉','申','未','午'],
        '土五局_阳男阴女': ['申','酉','戌','亥','子','丑','寅','卯','辰','巳','午','未'],
        '土五局_阴男阳女': ['申','未','午','巳','辰','卯','寅','丑','子','亥','戌','酉'],
        '火六局_阳男阴女': ['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'],
        '火六局_阴男阳女': ['寅','丑','子','亥','戌','酉','申','未','午','巳','辰','卯']
    };
    const CHANG_SHENG_NAMES = ['长生','沐浴','冠带','临官','帝旺','衰','病','死','墓','绝','胎','养'];

    // ---------- 流耀数据 ----------
    const LIU_STAR_MAP_BY_GAN = {
        '流昌': { '甲':'巳', '乙':'午', '丙':'申', '丁':'酉', '戊':'申', '己':'酉', '庚':'亥', '辛':'子', '壬':'寅', '癸':'卯' },
        '流曲': { '甲':'酉', '乙':'申', '丙':'午', '丁':'巳', '戊':'午', '己':'巳', '庚':'卯', '辛':'寅', '壬':'子', '癸':'亥' },
        '流魁': { '甲':'丑', '乙':'子', '丙':'亥', '丁':'亥', '戊':'丑', '己':'子', '庚':'丑', '辛':'午', '壬':'卯', '癸':'卯' },
        '流钺': { '甲':'未', '乙':'申', '丙':'酉', '丁':'酉', '戊':'未', '己':'申', '庚':'未', '辛':'寅', '壬':'巳', '癸':'巳' },
        '流禄': { '甲':'寅', '乙':'卯', '丙':'巳', '丁':'午', '戊':'巳', '己':'午', '庚':'申', '辛':'酉', '壬':'亥', '癸':'子' },
        '流羊': { '甲':'卯', '乙':'辰', '丙':'午', '丁':'未', '戊':'午', '己':'未', '庚':'酉', '辛':'戌', '壬':'子', '癸':'丑' },
        '流陀': { '甲':'丑', '乙':'寅', '丙':'辰', '丁':'巳', '戊':'辰', '己':'巳', '庚':'未', '辛':'申', '壬':'戌', '癸':'亥' }
    };
    const LIU_MA_MAP_BY_ZHI = {
        '子':'寅', '丑':'亥', '寅':'申', '卯':'巳',
        '辰':'寅', '巳':'亥', '午':'申', '未':'巳',
        '申':'寅', '酉':'亥', '戌':'申', '亥':'巳'
    };

    // ---------- 十二宫后缀（逆时针顺序） ----------
    const GONG_NAMES_SUFFIX = ['命','父','福','田','官','友','迁','疾','财','子','夫','兄'];

    // ---------- 农历工具 ----------
    function getLunarYearDays(year) {
        let sum = 348;
        for (let i = 0x8000; i > 0x8; i >>= 1) sum += (lunarInfo[year-1900] & i) ? 1 : 0;
        return sum + getLeapDays(year);
    }
    function getLeapDays(year) {
        if (getLeapMonth(year)) return (lunarInfo[year-1900] & 0x10000) ? 30 : 29;
        return 0;
    }
    function getLeapMonth(year) {
        return lunarInfo[year-1900] & 0xf;
    }
    function getLunarMonthDays(year, month) {
        return (lunarInfo[year-1900] & (0x10000 >> month)) ? 30 : 29;
    }

    function solarToLunar(year, month, day) {
        const baseDate = Date.UTC(1900, 0, 31);
        const targetDate = Date.UTC(year, month-1, day);
        let offset = Math.floor((targetDate - baseDate) / 86400000);
        if (offset < 0) return null;

        let lunarYear = 1900;
        let temp = 0;
        while (lunarYear < 2101 && offset > 0) {
            temp = getLunarYearDays(lunarYear);
            if (offset < temp) break;
            offset -= temp;
            lunarYear++;
        }

        const leapMonth = getLeapMonth(lunarYear);
        let isLeap = false;
        let i = 1;
        for (i=1; i<13 && offset>0; i++) {
            if (leapMonth>0 && i===leapMonth+1 && !isLeap) {
                --i; isLeap = true; temp = getLeapDays(lunarYear);
            } else {
                temp = getLunarMonthDays(lunarYear, i);
            }
            if (isLeap && i===leapMonth+1) isLeap = false;
            offset -= temp;
        }
        if (offset===0 && leapMonth>0 && i===leapMonth+1) {
            if (isLeap) isLeap = false;
            else { isLeap = true; --i; }
        }
        if (offset < 0) { offset += temp; --i; }
        return { year: lunarYear, month: i, day: offset+1, isLeap };
    }

    function lunarToSolar(lunarYear, lunarMonth, lunarDay, isLeap) {
        const start = new Date(Date.UTC(lunarYear, 0, 1));
        for (let d = 0; d < 420; d++) {
            const testDate = new Date(start.getTime() + d * 86400000);
            const year = testDate.getUTCFullYear();
            const month = testDate.getUTCMonth() + 1;
            const day = testDate.getUTCDate();
            const lunar = solarToLunar(year, month, day);
            if (!lunar) continue;
            if (lunar.year === lunarYear && lunar.month === lunarMonth && lunar.day === lunarDay && lunar.isLeap === isLeap) {
                return testDate;
            }
        }
        return null;
    }

    // ---------- 农历辅助函数（新增） ----------
    function getLunarYearRange(lunarYear) {
        const startDate = lunarToSolar(lunarYear, 1, 1, false);
        if (!startDate) return null;
        const totalDays = getLunarYearDays(lunarYear);
        const endDate = new Date(startDate.getTime() + (totalDays - 1) * 86400000);
        return { startDate, endDate };
    }

    /**
     * 获取有效月的公历起止日期（严格遵循分令规则）
     * @param {number} lunarYear - 农历年
     * @param {number} effectiveMonth - 有效月（1～12）
     * @returns {Object|null} { startDate: Date, endDate: Date }
     */
    function getEffectiveMonthRange(lunarYear, effectiveMonth) {
        const leapMonth = getLeapMonth(lunarYear);
        let startDate, endDate;

        // 无闰月，或有效月与闰月无关（既不是闰月本身，也不是闰月后一个月）
        if (leapMonth === 0 || (effectiveMonth !== leapMonth && effectiveMonth !== leapMonth + 1)) {
            startDate = lunarToSolar(lunarYear, effectiveMonth, 1, false);
            if (!startDate) return null;
            const days = getLunarMonthDays(lunarYear, effectiveMonth);
            endDate = new Date(startDate.getTime() + (days - 1) * 86400000);
            return { startDate, endDate };
        }

        // 有效月恰好是闰月序（闰月的前半月归属此月）
        if (effectiveMonth === leapMonth) {
            startDate = lunarToSolar(lunarYear, effectiveMonth, 1, false);
            if (!startDate) return null;
            const normalDays = getLunarMonthDays(lunarYear, effectiveMonth);
            const totalDays = normalDays + 15;          // 加闰月前15天
            endDate = new Date(startDate.getTime() + (totalDays - 1) * 86400000);
            return { startDate, endDate };
        }

        // 有效月是闰月后一个月（闰月的后半部分归属此月）
        if (effectiveMonth === leapMonth + 1) {
            // 闰月十六 = 闰月初一 + 15天
            const leapStart = lunarToSolar(lunarYear, leapMonth, 1, true);
            if (!leapStart) {
                // 如果闰月转换失败，回退到该月全月（极少发生）
                startDate = lunarToSolar(lunarYear, effectiveMonth, 1, false);
                if (!startDate) return null;
                const days = getLunarMonthDays(lunarYear, effectiveMonth);
                endDate = new Date(startDate.getTime() + (days - 1) * 86400000);
                return { startDate, endDate };
            }
            const afterLeapStart = new Date(leapStart.getTime() + 15 * 86400000);
            // 该月全月最后一天
            const normalStart = lunarToSolar(lunarYear, effectiveMonth, 1, false);
            if (!normalStart) return null;
            const normalDays = getLunarMonthDays(lunarYear, effectiveMonth);
            const normalEnd = new Date(normalStart.getTime() + (normalDays - 1) * 86400000);
            startDate = afterLeapStart;
            endDate = normalEnd;
            return { startDate, endDate };
        }

        return null;
    }

    function getYearGanZhiByLunarYear(lunarYear) {
        const gan = tianGan[(lunarYear - 4) % 10];
        const zhi = diZhi[(lunarYear - 4) % 12];
        return gan + zhi;
    }

    // ---------- 四柱计算 ----------
    function toJulian(date) {
        const y = date.getUTCFullYear();
        const m = date.getUTCMonth() + 1;
        const d = date.getUTCDate() + date.getUTCHours()/24 + date.getUTCMinutes()/1440 + date.getUTCSeconds()/86400;
        let a = Math.floor((14-m)/12);
        let y_ = y + 4800 - a;
        let m_ = m + 12*a - 3;
        let jd = d + Math.floor((153*m_+2)/5) + 365*y_ + Math.floor(y_/4) - Math.floor(y_/100) + Math.floor(y_/400) - 32045;
        return jd - 0.5;
    }
    function fromJulian(jd) {
        const a = Math.floor(jd + 0.5);
        const b = a + 1537;
        const c = Math.floor((b - 122.1) / 365.25);
        const d = Math.floor(365.25 * c);
        const e = Math.floor((b - d) / 30.6001);
        const day = b - d - Math.floor(30.6001 * e) + ((jd + 0.5) % 1);
        let month = e - 1;
        if (month > 12) month -= 12;
        let year = c - 4715;
        if (month > 2) year--;
        const frac = day % 1;
        const hours = Math.floor(frac * 24);
        const minutes = Math.floor((frac * 24 - hours) * 60);
        const seconds = Math.floor((((frac * 24 - hours) * 60) - minutes) * 60);
        return new Date(Date.UTC(year, month-1, Math.floor(day), hours, minutes, seconds));
    }
    function getSolarLongitude(jd) {
        const T = (jd - 2451545.0) / 36525.0;
        let L = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
        L = L % 360;
        let M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
        M = M % 360;
        const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * Math.PI/180)
                + (0.019993 - 0.000101 * T) * Math.sin(2 * M * Math.PI/180)
                + 0.000289 * Math.sin(3 * M * Math.PI/180);
        let sunLon = L + C;
        return sunLon % 360;
    }
    const TERM_TARGETS = [315,345,15,45,75,105,135,165,195,225,255,285];
    const TERM_ZHI = [2,3,4,5,6,7,8,9,10,11,0,1];
    const termCache = {};
    function getYearTerms(year) {
        if (!termCache[year]) {
            const terms = [];
            for (let i=0; i<12; i++) {
                const targetLon = TERM_TARGETS[i];
                let start = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
                let jdStart = toJulian(start);
                let jd1 = jdStart;
                let jd2 = jdStart + 370;
                let lon1 = getSolarLongitude(jd1);
                let lon2 = getSolarLongitude(jd2);
                for (let j=0; j<60; j++) {
                    const jdMid = (jd1 + jd2) / 2;
                    const lonMid = getSolarLongitude(jdMid);
                    let diff1 = (lonMid - lon1 + 360) % 360;
                    let diffTarget = (targetLon - lon1 + 360) % 360;
                    if (diff1 < diffTarget) {
                        jd1 = jdMid;
                        lon1 = lonMid;
                    } else {
                        jd2 = jdMid;
                        lon2 = lonMid;
                    }
                }
                const jdResult = (jd1 + jd2) / 2;
                terms.push(fromJulian(jdResult));
            }
            termCache[year] = terms;
        }
        return termCache[year];
    }

    function getYearGanZhi(year, month, day) {
        const terms = getYearTerms(year);
        const inputDate = new Date(Date.UTC(year, month-1, day));
        let y = year;
        if (inputDate < terms[0]) y = year - 1;
        const ganIndex = (y - 4) % 10;
        const zhiIndex = (y - 4) % 12;
        return tianGan[ganIndex] + diZhi[zhiIndex];
    }
    function getMonthZhi(year, month, day) {
        const terms = getYearTerms(year);
        const inputDate = new Date(Date.UTC(year, month-1, day));
        if (inputDate < terms[0]) return 1;
        for (let i=0; i<terms.length-1; i++) {
            if (inputDate >= terms[i] && inputDate < terms[i+1]) return TERM_ZHI[i];
        }
        if (inputDate >= terms[terms.length-1]) return 1;
        return 0;
    }
    function getMonthGanZhi(year, month, day) {
        const yearGan = getYearGanZhi(year, month, day).charAt(0);
        const yearGanIndex = tianGan.indexOf(yearGan);
        let firstMonthGanIndex;
        switch (yearGanIndex) {
            case 0: case 5: firstMonthGanIndex = 2; break;
            case 1: case 6: firstMonthGanIndex = 4; break;
            case 2: case 7: firstMonthGanIndex = 6; break;
            case 3: case 8: firstMonthGanIndex = 8; break;
            case 4: case 9: firstMonthGanIndex = 0; break;
            default: firstMonthGanIndex = 0;
        }
        const zhiIndex = getMonthZhi(year, month, day);
        const ganOffset = (zhiIndex - 2 + 12) % 12;
        const ganIndex = (firstMonthGanIndex + ganOffset) % 10;
        return tianGan[ganIndex] + diZhi[zhiIndex];
    }
    function getDayGanZhi(year, month, day) {
        const base = Date.UTC(1900, 0, 1);
        const target = Date.UTC(year, month-1, day);
        const daysDiff = Math.floor((target - base) / 86400000);
        const dayGanIndex = (daysDiff + 0) % 10;
        const dayZhiIndex = (daysDiff + 10) % 12;
        return tianGan[dayGanIndex] + diZhi[dayZhiIndex];
    }
    function getHourGanZhi(dayGan, hourIndex) {
        let firstHourGanIndex;
        switch (dayGan) {
            case '甲': case '己': firstHourGanIndex = 0; break;
            case '乙': case '庚': firstHourGanIndex = 2; break;
            case '丙': case '辛': firstHourGanIndex = 4; break;
            case '丁': case '壬': firstHourGanIndex = 6; break;
            case '戊': case '癸': firstHourGanIndex = 8; break;
            default: return '';
        }
        const ganIndex = (firstHourGanIndex + hourIndex) % 10;
        const zhiIndex = hourIndex % 12;
        return tianGan[ganIndex] + diZhi[zhiIndex];
    }

    function getFourPillars(year, month, day, hourIndex) {
        const yearGanZhi = getYearGanZhi(year, month, day);
        const monthGanZhi = getMonthGanZhi(year, month, day);
        const dayGanZhi = getDayGanZhi(year, month, day);
        const dayGan = dayGanZhi.charAt(0);
        const hourGanZhi = getHourGanZhi(dayGan, hourIndex);
        return {
            year: yearGanZhi,
            month: monthGanZhi,
            day: dayGanZhi,
            hour: hourGanZhi
        };
    }

    // ---------- 五行局 ----------
    function getWuXing(gan, zhi) {
        const key = gan + zhi;
        const element = NAYIN_MAP[key];
        if (!element) return { name: '未知', num: 0 };
        const map = {
            '金': { name: '金四局', num: 4 },
            '木': { name: '木三局', num: 3 },
            '水': { name: '水二局', num: 2 },
            '火': { name: '火六局', num: 6 },
            '土': { name: '土五局', num: 5 }
        };
        return map[element] || { name: element + '局', num: 0 };
    }

    // ---------- 紫微星 ----------
    function getZiWei(lunarDay, wuXingNum) {
        const shang = Math.floor(lunarDay / wuXingNum);
        const yu = lunarDay % wuXingNum;
        if (yu === 0) {
            const startIdx = diZhi.indexOf('寅');
            const steps = Math.max(shang - 1, 0);
            const targetIdx = (startIdx + steps) % 12;
            return diZhi[targetIdx];
        } else {
            const map = ZIWEI_MAP[wuXingNum];
            if (!map) return null;
            const startZhi = map[yu];
            if (!startZhi) return null;
            const startIdx = diZhi.indexOf(startZhi);
            const targetIdx = (startIdx + shang) % 12;
            return diZhi[targetIdx];
        }
    }

    // ---------- 天府星 ----------
    function getTianfu(ziweiZhi) {
        if (!ziweiZhi) return null;
        if (ziweiZhi === '寅' || ziweiZhi === '申') {
            return ziweiZhi;
        }
        return TIANFU_MAP[ziweiZhi] || null;
    }

    // ---------- 闰月分令 ----------
    function getEffectiveMonth(lunarMonth, lunarDay, isLeap) {
        let effectiveMonth = lunarMonth;
        if (isLeap && lunarDay >= 16) {
            effectiveMonth = lunarMonth + 1;
            if (effectiveMonth > 12) effectiveMonth = 1;
        }
        return effectiveMonth;
    }

    // ---------- 命身宫 ----------
    function getMingShen(lunarMonth, lunarDay, isLeap, hourIndex) {
        const effectiveMonth = getEffectiveMonth(lunarMonth, lunarDay, isLeap);
        const yinIndex = 2;
        const startIndex = (yinIndex + (effectiveMonth - 1)) % 12;
        const mingIndex = (startIndex - hourIndex + 12) % 12;
        const shenIndex = (startIndex + hourIndex) % 12;
        return {
            ming: diZhi[mingIndex],
            shen: diZhi[shenIndex]
        };
    }

    // ---------- 五虎遁定宫干 ----------
    function getPalaceGanZhi(yearGan) {
        const yinGan = WU_HU_DUN[yearGan];
        if (!yinGan) return {};
        const ganList = tianGan;
        const startIdx = ganList.indexOf(yinGan);
        const dizhiOrder = ['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'];
        const result = {};
        for (let i = 0; i < 12; i++) {
            const gan = ganList[(startIdx + i) % 10];
            const zhi = dizhiOrder[i];
            result[zhi] = gan;
        }
        return result;
    }

    // ---------- 北斗五星 ----------
    function getBeiDouStars(ziweiZhi) {
        if (!ziweiZhi) return null;
        const idx = diZhi.indexOf(ziweiZhi);
        if (idx === -1) return null;
        const tianJiIdx = (idx - 1 + 12) % 12;
        const taiYangIdx = (idx - 3 + 12) % 12;
        const wuQuIdx = (idx - 4 + 12) % 12;
        const tianTongIdx = (idx - 5 + 12) % 12;
        const lianZhenIdx = (idx - 8 + 12) % 12;
        return {
            tianJi: diZhi[tianJiIdx],
            taiYang: diZhi[taiYangIdx],
            wuQu: diZhi[wuQuIdx],
            tianTong: diZhi[tianTongIdx],
            lianZhen: diZhi[lianZhenIdx]
        };
    }

    // ---------- 南斗七星 ----------
    function getNanDouStars(tianfuZhi) {
        if (!tianfuZhi) return null;
        const idx = diZhi.indexOf(tianfuZhi);
        if (idx === -1) return null;
        const taiYinIdx = (idx + 1) % 12;
        const tanLangIdx = (idx + 2) % 12;
        const juMenIdx = (idx + 3) % 12;
        const tianXiangIdx = (idx + 4) % 12;
        const tianLiangIdx = (idx + 5) % 12;
        const qiShaIdx = (idx + 6) % 12;
        const poJunIdx = (idx + 10) % 12;
        return {
            taiYin: diZhi[taiYinIdx],
            tanLang: diZhi[tanLangIdx],
            juMen: diZhi[juMenIdx],
            tianXiang: diZhi[tianXiangIdx],
            tianLiang: diZhi[tianLiangIdx],
            qiSha: diZhi[qiShaIdx],
            poJun: diZhi[poJunIdx]
        };
    }

    // ---------- 年干星曜 ----------
    function getYearStars(yearGan) {
        const result = {};
        Object.keys(YEAR_STAR_MAP).forEach(starName => {
            const map = YEAR_STAR_MAP[starName];
            if (map[yearGan]) {
                result[starName] = map[yearGan];
            }
        });
        return result;
    }

    // ---------- 月令星曜 ----------
    function getMonthStars(lunarMonth, lunarDay, isLeap) {
        const effectiveMonth = getEffectiveMonth(lunarMonth, lunarDay, isLeap);
        const monthNames = ['正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','冬月','腊月'];
        const monthKey = monthNames[effectiveMonth - 1];
        const result = {};
        Object.keys(MONTH_STAR_MAP).forEach(starName => {
            const map = MONTH_STAR_MAP[starName];
            if (map[monthKey]) {
                result[starName] = map[monthKey];
            }
        });
        return result;
    }

    // ---------- 年支星曜 ----------
    function getYearBranchStars(branch, mingZhi, shenZhi) {
        const result = {};
        Object.keys(BRANCH_STAR_MAP).forEach(starName => {
            const map = BRANCH_STAR_MAP[starName];
            if (map[branch]) {
                result[starName] = map[branch];
            }
        });
        const branchIndex = diZhi.indexOf(branch);
        const mingIdx = diZhi.indexOf(mingZhi);
        const geniusIdx = (mingIdx + branchIndex) % 12;
        result['天才'] = diZhi[geniusIdx];
        const shenIdx = diZhi.indexOf(shenZhi);
        const targetIdx = (shenIdx + branchIndex) % 12;
        result['天寿'] = diZhi[targetIdx];
        return result;
    }

    // ---------- 时辰星曜 ----------
    function getHourStars(hourIndex, yearBranch) {
        const result = {};
        Object.keys(HOUR_STAR_MAP).forEach(name => {
            const map = HOUR_STAR_MAP[name];
            if (map[hourIndex]) {
                result[name] = map[hourIndex];
            }
        });
        let group = '';
        if (['寅','午','戌'].includes(yearBranch)) group = '寅午戌';
        else if (['申','子','辰'].includes(yearBranch)) group = '申子辰';
        else if (['巳','酉','丑'].includes(yearBranch)) group = '巳酉丑';
        else if (['亥','卯','未'].includes(yearBranch)) group = '亥卯未';
        if (group) {
            const marsStart = MARS_START[group];
            const lingStart = LING_START[group];
            result['火星'] = diZhi[(marsStart + hourIndex) % 12];
            result['铃星'] = diZhi[(lingStart + hourIndex) % 12];
        }
        return result;
    }

    // ---------- 四颗杂耀 ----------
    function getExtraMiscStars(lunarDay, zuoFuZhi, youBiZhi, wenChangZhi, wenQuZhi) {
        const result = {};
        if (!zuoFuZhi || !youBiZhi || !wenChangZhi || !wenQuZhi) return result;

        let idx = diZhi.indexOf(zuoFuZhi);
        idx = (idx + (lunarDay - 1)) % 12;
        result['三台'] = diZhi[idx];

        idx = diZhi.indexOf(youBiZhi);
        idx = (idx - (lunarDay - 1) + 120) % 12;
        result['八座'] = diZhi[idx];

        idx = diZhi.indexOf(wenChangZhi);
        idx = (idx + (lunarDay - 1)) % 12;
        idx = (idx - 1 + 12) % 12;
        result['恩光'] = diZhi[idx];

        idx = diZhi.indexOf(wenQuZhi);
        idx = (idx + (lunarDay - 1)) % 12;
        idx = (idx - 1 + 12) % 12;
        result['天贵'] = diZhi[idx];

        return result;
    }

    // ---------- 四化 ----------
    function getFourTransform(yearGan) {
        return TRANSFORM_MAP[yearGan] || null;
    }

    // ---------- 旬空、截空 ----------
    function getXunKong(yearGan, yearZhi) {
        const ganIdx = tianGan.indexOf(yearGan);
        const zhiIdx = diZhi.indexOf(yearZhi);
        if (ganIdx === -1 || zhiIdx === -1) return null;
        const diff = (zhiIdx - ganIdx + 12) % 12;
        let pair = '';
        if (diff === 0) pair = '戌亥';
        else if (diff === 10) pair = '申酉';
        else if (diff === 8) pair = '午未';
        else if (diff === 6) pair = '辰巳';
        else if (diff === 4) pair = '寅卯';
        else if (diff === 2) pair = '子丑';
        else return null;
        const yangGan = ['甲','丙','戊','庚','壬'];
        const isYang = yangGan.includes(yearGan);
        const yangZhi = ['子','寅','辰','午','申','戌'];
        const yinZhi = ['丑','卯','巳','未','酉','亥'];
        const zhi1 = pair[0];
        const zhi2 = pair[1];
        if (isYang) {
            return yangZhi.includes(zhi1) ? zhi1 : zhi2;
        } else {
            return yinZhi.includes(zhi1) ? zhi1 : zhi2;
        }
    }

    function getJieKong(yearGan) {
        const map = {
            '戊': '子丑', '癸': '子丑',
            '丁': '寅卯', '壬': '寅卯',
            '丙': '辰巳', '辛': '辰巳',
            '乙': '午未', '庚': '午未',
            '甲': '申酉', '己': '申酉'
        };
        const pair = map[yearGan];
        if (!pair) return null;
        const yangGan = ['甲','丙','戊','庚','壬'];
        const isYang = yangGan.includes(yearGan);
        const yangZhi = ['子','寅','辰','午','申','戌'];
        const yinZhi = ['丑','卯','巳','未','酉','亥'];
        const zhi1 = pair[0];
        const zhi2 = pair[1];
        if (isYang) {
            return yangZhi.includes(zhi1) ? zhi1 : zhi2;
        } else {
            return yinZhi.includes(zhi1) ? zhi1 : zhi2;
        }
    }

    // ---------- 命主身主 ----------
    function getMingZhu(yearZhi) {
        return MING_ZHU_MAP[yearZhi] || null;
    }
    function getShenZhu(yearZhi) {
        return SHEN_ZHU_MAP[yearZhi] || null;
    }

    // ---------- 大限计算 ----------
    function getDaXianMap(wuXingNum, gender, isYang, mingZhi) {
        const result = {};
        const startIdx = diZhi.indexOf(mingZhi);
        if (startIdx === -1 || wuXingNum <= 0) return result;

        const isShun = (gender === 'male' && isYang) || (gender === 'female' && !isYang);

        for (let step = 0; step < 12; step++) {
            let idx;
            if (isShun) {
                idx = (startIdx + step) % 12;
            } else {
                idx = (startIdx - step + 12) % 12;
            }
            const zhi = diZhi[idx];
            const startAge = wuXingNum + 10 * step;
            const endAge = startAge + 9;
            result[zhi] = `${startAge}~${endAge}`;
        }
        return result;
    }

    // ---------- 庙陷查询 ----------
    function getMiaoXian(starName, zhi) {
        const map = STAR_MIAO_MAP[starName];
        if (!map) return '';
        return map[zhi] || '';
    }

    // ---------- 长生十二神 ----------
    function getChangShengMap(wuXingNum, gender, isYang) {
        const numToName = {2:'水二局',3:'木三局',4:'金四局',5:'土五局',6:'火六局'};
        const wuXingName = numToName[wuXingNum];
        if (!wuXingName) return {};
        const isShun = (gender === 'male' && isYang) || (gender === 'female' && !isYang);
        const dir = isShun ? '阳男阴女' : '阴男阳女';
        const key = wuXingName + '_' + dir;
        const zhiList = CHANG_SHENG_DATA[key];
        if (!zhiList) return {};
        const result = {};
        for (let i=0; i<12; i++) {
            result[zhiList[i]] = CHANG_SHENG_NAMES[i];
        }
        return result;
    }

    // ---------- 天伤、天使（根据阴阳性别互换） ----------
    function getTianShang(mingZhi) {
        const idx = diZhi.indexOf(mingZhi);
        if (idx === -1) return null;
        return diZhi[(idx + 5) % 12];
    }
    function getTianShi(mingZhi) {
        const idx = diZhi.indexOf(mingZhi);
        if (idx === -1) return null;
        return diZhi[(idx + 7) % 12];
    }
    function getLongDe(yearZhi) {
        const startZhi = '未';
        const startIdx = diZhi.indexOf(startZhi);
        const yearIdx = diZhi.indexOf(yearZhi);
        if (startIdx === -1 || yearIdx === -1) return null;
        return diZhi[(startIdx + yearIdx) % 12];
    }

    // ---------- 天地人盘调整 ----------
    function getAdjustedPalaceInfo(mingZhi, shenZhi, diskType) {
        let adjustedMing = mingZhi;
        if (diskType === 'di') {
            adjustedMing = shenZhi;
        } else if (diskType === 'ren') {
            const idx = diZhi.indexOf(mingZhi);
            if (idx !== -1) {
                adjustedMing = diZhi[(idx + 2) % 12];
            }
        }
        return { ming: adjustedMing, shen: shenZhi };
    }

    // ---------- 流耀安星 ----------
    function getLiuStars(gan, zhi) {
        const result = {};
        Object.keys(LIU_STAR_MAP_BY_GAN).forEach(name => {
            const map = LIU_STAR_MAP_BY_GAN[name];
            result[name] = map[gan] || null;
        });
        result['流马'] = LIU_MA_MAP_BY_ZHI[zhi] || null;
        return result;
    }

    function getLiuStarsByLevel(level, gan, zhi) {
        const prefixMap = {
            'daXian': '限',
            'liuNian': '年',
            'liuYue': '月',
            'liuRi': '日',
            'liuShi': '时'
        };
        const prefix = prefixMap[level] || '';
        const baseStars = getLiuStars(gan, zhi);
        const result = {};
        Object.keys(baseStars).forEach(key => {
            if (baseStars[key]) {
                const newName = prefix + key.substring(1);
                result[newName] = baseStars[key];
            }
        });
        return result;
    }

    // ---------- 斗君查表 ----------
    function getDouJun(month, hourZhi) {
        const table = [
            ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'],
            ['亥','子','丑','寅','卯','辰','巳','午','未','申','酉','戌'],
            ['戌','亥','子','丑','寅','卯','辰','巳','午','未','申','酉'],
            ['酉','戌','亥','子','丑','寅','卯','辰','巳','午','未','申'],
            ['申','酉','戌','亥','子','丑','寅','卯','辰','巳','午','未'],
            ['未','申','酉','戌','亥','子','丑','寅','卯','辰','巳','午'],
            ['午','未','申','酉','戌','亥','子','丑','寅','卯','辰','巳'],
            ['巳','午','未','申','酉','戌','亥','子','丑','寅','卯','辰'],
            ['辰','巳','午','未','申','酉','戌','亥','子','丑','寅','卯'],
            ['卯','辰','巳','午','未','申','酉','戌','亥','子','丑','寅'],
            ['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'],
            ['丑','寅','卯','辰','巳','午','未','申','酉','戌','亥','子']
        ];
        const monthIdx = month - 1;
        const zhiIdx = diZhi.indexOf(hourZhi);
        if (monthIdx < 0 || monthIdx > 11 || zhiIdx < 0 || zhiIdx > 11) return '子';
        return table[monthIdx][zhiIdx];
    }

    // ---------- 流盘标签生成（支持小限） ----------
    function getLiuPanLabels(diskMode, params) {
        const result = {};
        const { baseMingZhi, gender, isYang, daXianStep, liuNianZhi, liuYue, liuRi, liuShi, douJun, birthYearZhi, xiaoXianMing } = params;

        let levels = [];
        if (diskMode === 'daXian') levels = ['限'];
        else if (diskMode === 'liuNian') levels = ['限','年'];
        else if (diskMode === 'liuYue') levels = ['年','月'];
        else if (diskMode === 'liuRi') levels = ['月','日'];
        else if (diskMode === 'liuShi') levels = ['日','时'];
        else return result;

        let douJunZhi = douJun;
        if (!douJunZhi) douJunZhi = '子';

        if (liuNianZhi) {
            const liuNianIdx = diZhi.indexOf(liuNianZhi);
            if (liuNianIdx !== -1) {
                const douJunIdx = diZhi.indexOf(douJunZhi);
                const liuNianDouJunIdx = (douJunIdx + liuNianIdx) % 12;
                douJunZhi = diZhi[liuNianDouJunIdx];
            }
        }

        const startIdx = diZhi.indexOf(baseMingZhi);
        const isShun = (gender === 'male' && isYang) || (gender === 'female' && !isYang);
        let stepOffset = (daXianStep || 1) - 1;
        let daXianMingIdx;
        if (isShun) {
            daXianMingIdx = (startIdx + stepOffset) % 12;
        } else {
            daXianMingIdx = (startIdx - stepOffset + 12) % 12;
        }
        const daXianMing = diZhi[daXianMingIdx];

        let nianMing;
        if (xiaoXianMing) {
            nianMing = xiaoXianMing;
        } else {
            const nianMingIdx = diZhi.indexOf(liuNianZhi || '子');
            nianMing = diZhi[nianMingIdx];
        }

        const douJunIdx = diZhi.indexOf(douJunZhi);
        const yueMingIdx = (douJunIdx + (liuYue || 1) - 1) % 12;
        const yueMing = diZhi[yueMingIdx];

        const riMingIdx = (yueMingIdx + (liuRi || 1) - 1) % 12;
        const riMing = diZhi[riMingIdx];

        const shiMingIdx = (riMingIdx + (liuShi || 0)) % 12;
        const shiMing = diZhi[shiMingIdx];

        const levelMingMap = {
            '限': daXianMing,
            '年': nianMing,
            '月': yueMing,
            '日': riMing,
            '时': shiMing
        };
        const levelPrefixMap = {
            '限': '限',
            '年': '年',
            '月': '月',
            '日': '日',
            '时': '时'
        };

        levels.forEach(level => {
            const mingZhiLevel = levelMingMap[level];
            if (!mingZhiLevel) return;
            const mingIdx = diZhi.indexOf(mingZhiLevel);
            for (let i = 0; i < 12; i++) {
                const idx = (mingIdx + i) % 12;
                const zhi = diZhi[idx];
                const label = levelPrefixMap[level] + GONG_NAMES_SUFFIX[i];
                if (!result[zhi]) result[zhi] = [];
                result[zhi].push(label);
            }
        });

        return result;
    }

    // ---------- 星曜分类与颜色 ----------
    const STAR_CATEGORY = {
        '紫微': 'main', '天府': 'main', '天机': 'main', '太阳': 'main',
        '武曲': 'main', '天同': 'main', '廉贞': 'main', '太阴': 'main',
        '贪狼': 'main', '巨门': 'main', '天相': 'main', '天梁': 'main',
        '七杀': 'main', '破军': 'main',
        '左辅': 'auspicious', '右弼': 'auspicious', '文昌': 'auspicious',
        '文曲': 'auspicious', '天魁': 'auspicious', '天钺': 'auspicious',
        '禄存': 'auspicious', '天马': 'auspicious',
        '火星': 'malefic', '铃星': 'malefic', '擎羊': 'malefic',
        '陀罗': 'malefic', '地劫': 'malefic', '地空': 'malefic',
        '天刑': 'misc', '天姚': 'misc', '月解': 'misc',
        '天巫': 'misc', '天月': 'misc', '阴煞': 'misc',
        '天官': 'misc', '天福': 'misc', '天厨': 'misc',
        '天空': 'misc', '天哭': 'misc', '天虚': 'misc',
        '龙池': 'misc', '凤阁': 'misc', '红鸾': 'misc',
        '天喜': 'misc', '孤辰': 'misc', '寡宿': 'misc',
        '蜚廉': 'misc', '破碎': 'misc', '华盖': 'misc',
        '咸池': 'misc', '大耗': 'misc', '劫煞': 'misc',
        '年解': 'misc', '天德': 'misc', '月德': 'misc',
        '天才': 'misc', '天寿': 'misc',
        '台辅': 'misc', '封诰': 'misc',
        '三台': 'misc', '八座': 'misc', '恩光': 'misc', '天贵': 'misc',
        '旬空': 'misc', '截空': 'misc',
        '天伤': 'misc', '天使': 'misc', '龙德': 'misc'
    };

    function getStarCategory(starName) {
        if (STAR_CATEGORY.hasOwnProperty(starName)) {
            return STAR_CATEGORY[starName];
        }
        const flowPrefixes = ['限', '年', '月', '日', '时'];
        for (let p of flowPrefixes) {
            if (starName.startsWith(p)) {
                return 'flow';
            }
        }
        return 'misc';
    }

    function getStarColor(starName) {
        const category = getStarCategory(starName);
        switch (category) {
            case 'main':       return '#4a3a8a';
            case 'auspicious': return '#b8860b';
            case 'malefic':    return '#b22222';
            case 'flow':       return '#008080';
            default:           return '#000000';
        }
    }

    function getStarsByPalace(zhi, starData) {
        const result = { main: [], auspicious: [], malefic: [], misc: [], flow: [] };
        Object.keys(starData).forEach(name => {
            if (starData[name] === zhi) {
                const cat = getStarCategory(name);
                if (cat === 'main') result.main.push(name);
                else if (cat === 'auspicious') result.auspicious.push(name);
                else if (cat === 'malefic') result.malefic.push(name);
                else if (cat === 'flow') result.flow.push(name);
                else result.misc.push(name);
            }
        });
        return result;
    }

    // ---------- 岁前十二神 ----------
    function getSuiQianStars(yearZhi) {
        const map = {
            '子': { '岁建': '子', '晦气': '丑', '丧门': '寅', '贯索': '卯', '官符': '辰', '小耗': '巳', '岁破': '午', '龙德': '未', '白虎': '申', '天德': '酉', '吊客': '戌', '病符': '亥' },
            '丑': { '岁建': '丑', '晦气': '寅', '丧门': '卯', '贯索': '辰', '官符': '巳', '小耗': '午', '岁破': '未', '龙德': '申', '白虎': '酉', '天德': '戌', '吊客': '亥', '病符': '子' },
            '寅': { '岁建': '寅', '晦气': '卯', '丧门': '辰', '贯索': '巳', '官符': '午', '小耗': '未', '岁破': '申', '龙德': '酉', '白虎': '戌', '天德': '亥', '吊客': '子', '病符': '丑' },
            '卯': { '岁建': '卯', '晦气': '辰', '丧门': '巳', '贯索': '午', '官符': '未', '小耗': '申', '岁破': '酉', '龙德': '戌', '白虎': '亥', '天德': '子', '吊客': '丑', '病符': '寅' },
            '辰': { '岁建': '辰', '晦气': '巳', '丧门': '午', '贯索': '未', '官符': '申', '小耗': '酉', '岁破': '戌', '龙德': '亥', '白虎': '子', '天德': '丑', '吊客': '寅', '病符': '卯' },
            '巳': { '岁建': '巳', '晦气': '午', '丧门': '未', '贯索': '申', '官符': '酉', '小耗': '戌', '岁破': '亥', '龙德': '子', '白虎': '丑', '天德': '寅', '吊客': '卯', '病符': '辰' },
            '午': { '岁建': '午', '晦气': '未', '丧门': '申', '贯索': '酉', '官符': '戌', '小耗': '亥', '岁破': '子', '龙德': '丑', '白虎': '寅', '天德': '卯', '吊客': '辰', '病符': '巳' },
            '未': { '岁建': '未', '晦气': '申', '丧门': '酉', '贯索': '戌', '官符': '亥', '小耗': '子', '岁破': '丑', '龙德': '寅', '白虎': '卯', '天德': '辰', '吊客': '巳', '病符': '午' },
            '申': { '岁建': '申', '晦气': '酉', '丧门': '戌', '贯索': '亥', '官符': '子', '小耗': '丑', '岁破': '寅', '龙德': '卯', '白虎': '辰', '天德': '巳', '吊客': '午', '病符': '未' },
            '酉': { '岁建': '酉', '晦气': '戌', '丧门': '亥', '贯索': '子', '官符': '丑', '小耗': '寅', '岁破': '卯', '龙德': '辰', '白虎': '巳', '天德': '午', '吊客': '未', '病符': '申' },
            '戌': { '岁建': '戌', '晦气': '亥', '丧门': '子', '贯索': '丑', '官符': '寅', '小耗': '卯', '岁破': '辰', '龙德': '巳', '白虎': '午', '天德': '未', '吊客': '申', '病符': '酉' },
            '亥': { '岁建': '亥', '晦气': '子', '丧门': '丑', '贯索': '寅', '官符': '卯', '小耗': '辰', '岁破': '巳', '龙德': '午', '白虎': '未', '天德': '申', '吊客': '酉', '病符': '戌' }
        };
        return map[yearZhi] || null;
    }

    // ---------- 将前十二神 ----------
    function getJiangQianStars(yearZhi) {
        const groupMap = {
            '寅': '寅午戌', '午': '寅午戌', '戌': '寅午戌',
            '申': '申子辰', '子': '申子辰', '辰': '申子辰',
            '巳': '巳酉丑', '酉': '巳酉丑', '丑': '巳酉丑',
            '亥': '亥卯未', '卯': '亥卯未', '未': '亥卯未'
        };
        const group = groupMap[yearZhi];
        const table = {
            '寅午戌': { '将星': '午', '攀鞍': '未', '岁驿': '申', '息神': '酉', '华盖': '戌', '劫煞': '亥', '灾煞': '子', '天煞': '丑', '指背': '寅', '咸池': '卯', '月煞': '辰', '亡神': '巳' },
            '申子辰': { '将星': '子', '攀鞍': '丑', '岁驿': '寅', '息神': '卯', '华盖': '辰', '劫煞': '巳', '灾煞': '午', '天煞': '未', '指背': '申', '咸池': '酉', '月煞': '戌', '亡神': '亥' },
            '巳酉丑': { '将星': '酉', '攀鞍': '戌', '岁驿': '亥', '息神': '子', '华盖': '丑', '劫煞': '寅', '灾煞': '卯', '天煞': '辰', '指背': '巳', '咸池': '午', '月煞': '未', '亡神': '申' },
            '亥卯未': { '将星': '卯', '攀鞍': '辰', '岁驿': '巳', '息神': '午', '华盖': '未', '劫煞': '申', '灾煞': '酉', '天煞': '戌', '指背': '亥', '咸池': '子', '月煞': '丑', '亡神': '寅' }
        };
        return table[group] || null;
    }

    // ---------- 博士十二神 ----------
    function getBoShiStars(lucunZhi, isYang, gender) {
        const starNames = ['博士', '力士', '青龙', '小耗', '将军', '奏书', '飞廉', '喜神', '病符', '大耗', '伏兵', '官符'];
        const startIdx = diZhi.indexOf(lucunZhi);
        if (startIdx === -1) return null;
        const isShun = (gender === 'male' && isYang) || (gender === 'female' && !isYang);
        const result = {};
        for (let i = 0; i < 12; i++) {
            const idx = isShun ? (startIdx + i) % 12 : (startIdx - i + 12) % 12;
            result[starNames[i]] = diZhi[idx];
        }
        return result;
    }

    // ---------- ★ 获取原局盘完整数据 ----------
    function getOriginalDisk(birthParams) {
        const { 
            lunarYear, lunarMonth, lunarDay, isLeap, hourIndex, 
            gender, diskType, solarYear, solarMonth, solarDay 
        } = birthParams;

        // 1. 年干年支
        const yearGan = tianGan[(lunarYear - 4) % 10];
        const yearZhi = diZhi[(lunarYear - 4) % 12];
        const isYang = ['甲','丙','戊','庚','壬'].includes(yearGan);

        // 2. 天盘命身宫（内部使用 getEffectiveMonth）
        const mingShen = getMingShen(lunarMonth, lunarDay, isLeap, hourIndex);
        const tianMingZhi = mingShen.ming;
        const tianShenZhi = mingShen.shen;

        // 3. 天地人盘调整
        const adjusted = getAdjustedPalaceInfo(tianMingZhi, tianShenZhi, diskType);
        const actualMingZhi = adjusted.ming;
        const actualShenZhi = adjusted.shen;

        // 4. 宫干与五行局
        const ganZhiMap = getPalaceGanZhi(yearGan);
        const mingGan = ganZhiMap[actualMingZhi];
        const wuXing = getWuXing(mingGan, actualMingZhi);
        const wuXingNum = wuXing.num;
        const wuXingName = wuXing.name;

        // 5. 原局安星
        let starData = {};

        const ziweiZhi = getZiWei(lunarDay, wuXingNum);
        if (ziweiZhi) starData['紫微'] = ziweiZhi;
        const tianfuZhi = getTianfu(ziweiZhi);
        if (tianfuZhi) starData['天府'] = tianfuZhi;
        const beiDou = getBeiDouStars(ziweiZhi);
        if (beiDou) {
            if (beiDou.tianJi) starData['天机'] = beiDou.tianJi;
            if (beiDou.taiYang) starData['太阳'] = beiDou.taiYang;
            if (beiDou.wuQu) starData['武曲'] = beiDou.wuQu;
            if (beiDou.tianTong) starData['天同'] = beiDou.tianTong;
            if (beiDou.lianZhen) starData['廉贞'] = beiDou.lianZhen;
        }
        const nanDou = getNanDouStars(tianfuZhi);
        if (nanDou) {
            if (nanDou.taiYin) starData['太阴'] = nanDou.taiYin;
            if (nanDou.tanLang) starData['贪狼'] = nanDou.tanLang;
            if (nanDou.juMen) starData['巨门'] = nanDou.juMen;
            if (nanDou.tianXiang) starData['天相'] = nanDou.tianXiang;
            if (nanDou.tianLiang) starData['天梁'] = nanDou.tianLiang;
            if (nanDou.qiSha) starData['七杀'] = nanDou.qiSha;
            if (nanDou.poJun) starData['破军'] = nanDou.poJun;
        }
        const yearStars = getYearStars(yearGan);
        Object.keys(yearStars).forEach(name => { if (yearStars[name]) starData[name] = yearStars[name]; });
        const monthStars = getMonthStars(lunarMonth, lunarDay, isLeap);
        Object.keys(monthStars).forEach(name => { if (monthStars[name]) starData[name] = monthStars[name]; });
        const branchStars = getYearBranchStars(yearZhi, actualMingZhi, actualShenZhi);
        Object.keys(branchStars).forEach(name => { if (branchStars[name]) starData[name] = branchStars[name]; });
        const hourStars = getHourStars(hourIndex, yearZhi);
        Object.keys(hourStars).forEach(name => { if (hourStars[name]) starData[name] = hourStars[name]; });
        const zuoFuZhi = starData['左辅'] || null;
        const youBiZhi = starData['右弼'] || null;
        const wenChangZhi = starData['文昌'] || null;
        const wenQuZhi = starData['文曲'] || null;
        if (zuoFuZhi && youBiZhi && wenChangZhi && wenQuZhi) {
            const extra = getExtraMiscStars(lunarDay, zuoFuZhi, youBiZhi, wenChangZhi, wenQuZhi);
            Object.keys(extra).forEach(name => { if (extra[name]) starData[name] = extra[name]; });
        }
        const xunKong = getXunKong(yearGan, yearZhi);
        if (xunKong) starData['旬空'] = xunKong;
        const jieKong = getJieKong(yearGan);
        if (jieKong) starData['截空'] = jieKong;
        let tianShang, tianShi;
        if ((gender === 'male' && isYang) || (gender === 'female' && !isYang)) {
            tianShang = getTianShang(actualMingZhi);
            tianShi = getTianShi(actualMingZhi);
        } else {
            tianShang = getTianShi(actualMingZhi);
            tianShi = getTianShang(actualMingZhi);
        }
        if (tianShang) starData['天伤'] = tianShang;
        if (tianShi) starData['天使'] = tianShi;
        const longDe = getLongDe(yearZhi);
        if (longDe) starData['龙德'] = longDe;

        const fourTransform = getFourTransform(yearGan);
        const daXianMap = getDaXianMap(wuXingNum, gender, isYang, actualMingZhi);
        const changShengMap = getChangShengMap(wuXingNum, gender, isYang);
        const mingZhu = getMingZhu(yearZhi);
        const shenZhu = getShenZhu(yearZhi);

        let pillars = null;
        if (solarYear && solarMonth && solarDay) {
            const hourZhi = diZhi[hourIndex];
            const dayGanZhi = getDayGanZhi(solarYear, solarMonth, solarDay);
            const dayGan = dayGanZhi.charAt(0);
            const hourGanZhi = getHourGanZhi(dayGan, hourIndex);
            pillars = {
                year: getYearGanZhi(solarYear, solarMonth, solarDay),
                month: getMonthGanZhi(solarYear, solarMonth, solarDay),
                day: dayGanZhi,
                hour: hourGanZhi
            };
        }

        const yinYangDesc = (gender === 'male' ? (isYang ? '阳男' : '阴男') : (isYang ? '阳女' : '阴女'));

        return {
            mingZhi: actualMingZhi,
            shenZhi: actualShenZhi,
            ganZhiMap: ganZhiMap,
            starData: starData,
            fourTransform: fourTransform,
            daXianMap: daXianMap,
            changShengMap: changShengMap,
            mingZhu: mingZhu,
            shenZhu: shenZhu,
            wuXingName: wuXingName,
            wuXingNum: wuXingNum,
            yinYangDesc: yinYangDesc,
            pillars: pillars,
            yearGan: yearGan,
            yearZhi: yearZhi,
            isYang: isYang,
            birthMonth: lunarMonth,
            birthDay: lunarDay,
            hourZhi: diZhi[hourIndex]
        };
    }

    // ---------- 暴露全局接口 ----------
    global.ZiWeiCore = {
        solarToLunar: solarToLunar,
        lunarToSolar: lunarToSolar,
        getFourPillars: getFourPillars,
        getWuXing: getWuXing,
        getZiWei: getZiWei,
        getTianfu: getTianfu,
        getMingShen: getMingShen,
        getPalaceGanZhi: getPalaceGanZhi,
        getBeiDouStars: getBeiDouStars,
        getNanDouStars: getNanDouStars,
        getYearStars: getYearStars,
        getMonthStars: getMonthStars,
        getYearBranchStars: getYearBranchStars,
        getHourStars: getHourStars,
        getExtraMiscStars: getExtraMiscStars,
        getFourTransform: getFourTransform,
        getStarCategory: getStarCategory,
        getStarColor: getStarColor,
        getStarsByPalace: getStarsByPalace,
        getXunKong: getXunKong,
        getJieKong: getJieKong,
        getMingZhu: getMingZhu,
        getShenZhu: getShenZhu,
        getDaXianMap: getDaXianMap,
        getMiaoXian: getMiaoXian,
        getChangShengMap: getChangShengMap,
        getTianShang: getTianShang,
        getTianShi: getTianShi,
        getLongDe: getLongDe,
        getAdjustedPalaceInfo: getAdjustedPalaceInfo,
        getLiuStars: getLiuStars,
        getLiuStarsByLevel: getLiuStarsByLevel,
        getDouJun: getDouJun,
        getLiuPanLabels: getLiuPanLabels,
        getOriginalDisk: getOriginalDisk,
        getEffectiveMonth: getEffectiveMonth,
        getSuiQianStars: getSuiQianStars,
        getJiangQianStars: getJiangQianStars,
        getBoShiStars: getBoShiStars,
        // 新增辅助函数
        getLunarYearDays: getLunarYearDays,
        getLeapMonth: getLeapMonth,
        getLeapDays: getLeapDays,
        getLunarMonthDays: getLunarMonthDays,
        getLunarYearRange: getLunarYearRange,
        getEffectiveMonthRange: getEffectiveMonthRange,
        getYearGanZhiByLunarYear: getYearGanZhiByLunarYear,
        tianGan: tianGan,
        diZhi: diZhi
    };

})(window);