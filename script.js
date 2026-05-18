// ============================================================
// MCP / FastMCP 入門課程 — 互動腳本
// ============================================================

(function () {
    'use strict';

    // ---------- Mermaid 初始化 ----------
    if (window.mermaid) {
        window.mermaid.initialize({
            startOnLoad: true,
            theme: 'neutral',
            themeVariables: {
                fontFamily: '"Iowan Old Style", "Palatino Linotype", "Source Serif Pro", Georgia, serif',
                fontSize: '14px',
                primaryColor: '#f4f1ea',
                primaryTextColor: '#1a1a1a',
                primaryBorderColor: '#b8410e',
                lineColor: '#5a5a5a',
                secondaryColor: '#faf8f2',
                tertiaryColor: '#fdfdfb',
            },
            flowchart: {
                curve: 'basis',
                padding: 20,
            },
            sequence: {
                actorMargin: 50,
                width: 140,
            },
        });
    }

    // ---------- 目錄滾動高亮 (Scroll Spy) ----------
    function setupScrollSpy() {
        const tocLinks = document.querySelectorAll('.toc a');
        if (tocLinks.length === 0) return;

        const headings = Array.from(tocLinks)
            .map(link => {
                const id = link.getAttribute('href').slice(1);
                const el = document.getElementById(id);
                return el ? { id, el, link } : null;
            })
            .filter(Boolean);

        if (headings.length === 0) return;

        function onScroll() {
            const scrollY = window.scrollY + 100;
            let current = headings[0];

            for (const h of headings) {
                if (h.el.offsetTop <= scrollY) {
                    current = h;
                } else {
                    break;
                }
            }

            tocLinks.forEach(l => l.classList.remove('active'));
            current.link.classList.add('active');
        }

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    onScroll();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        onScroll();
    }

    // ---------- 啟動 ----------
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupScrollSpy);
    } else {
        setupScrollSpy();
    }
})();
