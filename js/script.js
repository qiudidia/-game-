/* ==================== 初始化与安全获取元素 ====================
 * 确保元素存在后再进行操作，避免报错。
 */
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const prevBtn = document.getElementById('prev-secret');
const nextBtn = document.getElementById('next-secret');
const secretCards = document.querySelectorAll('.secret-card');
const indicators = document.querySelectorAll('.secret-indicator');
const header = document.querySelector('.site-header');

// 检查必要元素是否存在，避免后续代码报错
if (!menuToggle || !mobileMenu) {
    console.warn('警告: 移动端菜单元素缺失，部分功能将不可用。');
}

/**
 * ==================== 移动端菜单切换 ====================
 */
if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', !isExpanded);
    });
}

/**
 * ==================== 秘密卡片轮播 ====================
 * 优化点: 精简更新逻辑，使用更清晰的变量命名。
 */
let currentIndex = 0;
let autoSlideInterval = null; // 用于控制自动轮播的定时器

// 更新卡片显示状态
function updateSecretCards() {
    if (!secretCards.length || !indicators.length) return;

    secretCards.forEach((card, index) => {
        // 移除所有状态类
        card.classList.remove('active', 'prev', 'next');

        // 添加当前对应的类
        if (index === currentIndex) {
            card.classList.add('active');
        } else if (index < currentIndex) {
            card.classList.add('prev');
        } else {
            card.classList.add('next');
        }
    });

    // 更新指示器状态
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentIndex);
    });
}

// 上一张
if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        if (secretCards.length) {
            currentIndex = (currentIndex - 1 + secretCards.length) % secretCards.length;
            updateSecretCards();
            resetAutoSlide(); // 手动切换后重置自动轮播定时器
        }
    });
}

// 下一张
if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        if (secretCards.length) {
            currentIndex = (currentIndex + 1) % secretCards.length;
            updateSecretCards();
            resetAutoSlide(); // 手动切换后重置自动轮播定时器
        }
    });
}

// 指示器点击
indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
        if (secretCards.length) {
            currentIndex = index;
            updateSecretCards();
            resetAutoSlide(); // 手动切换后重置自动轮播定时器
        }
    });
});

/**
 * ==================== 自动轮播管理 ====================
 * 优化点: 增加清除定时器的逻辑，避免内存泄漏或多定时器冲突。
 */
function startAutoSlide() {
    if (autoSlideInterval) clearInterval(autoSlideInterval); // 确保只有一个定时器
    autoSlideInterval = setInterval(() => {
        if (secretCards.length) {
            currentIndex = (currentIndex + 1) % secretCards.length;
            updateSecretCards();
        }
    }, 5000);
}

function resetAutoSlide() {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }
}

// 初始化轮播并启动自动播放
if (secretCards.length && indicators.length) {
    updateSecretCards();
    startAutoSlide();
}

/**
 * ==================== 平滑滚动 ====================
 * 优化点: 增加了对目标元素的判断，以及滚动完成后关闭菜单的逻辑。
 */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        // 排除空链接或纯 "#"
        if (!targetId || targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            // 关闭移动菜单（如果打开）
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
            }

            // 平滑滚动
            window.scrollTo({
                top: targetElement.offsetTop - 80, // 减去头部高度
                behavior: 'smooth'
            });
        }
    });
});

/**
 * ==================== 滚动时导航栏效果 ====================
 * 优化点: 使用 requestAnimationFrame 进行节流，提升性能。
 */
let isScrolling = false;
if (header) {
    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 50) {
                    header.style.backdropFilter = 'blur(15px)';
                    header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
                } else {
                    header.style.backdropFilter = 'blur(10px)';
                    header.style.boxShadow = 'none';
                }
                isScrolling = false;
            });
            isScrolling = true;
        }
    });
}

/**
 * ==================== 页面卸载时清理定时器 ====================
 * 优化点: 防止在单页应用或刷新时定时器依然运行。
 */
window.addEventListener('beforeunload', () => {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        autoSlideInterval = null;
    }
});