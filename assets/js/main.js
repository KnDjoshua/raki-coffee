lucide.createIcons({ attrs: { strokeWidth: 1.5 } });

const mobileToggle = document.getElementById('mobile-toggle');
const mobileMenu = document.getElementById('mobile-menu');
mobileToggle.addEventListener('click', () => {
    const willOpen = mobileMenu.classList.contains('hidden');
    mobileMenu.classList.toggle('hidden');
    mobileToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
});
document.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', () => {
    mobileMenu.classList.add('hidden');
    mobileToggle.setAttribute('aria-expanded', 'false');
}));

// Mobile nav accordion (Story/Coffee sub-items)
document.querySelectorAll('.mobile-accordion-trigger').forEach(function(trigger) {
    trigger.addEventListener('click', function() {
        var panel = trigger.nextElementSibling;
        if (!panel) return;
        var open = panel.classList.toggle('open');
        panel.classList.toggle('hidden', !open);
        trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
});

// Desktop nav dropdown (Story/Coffee): tap-to-toggle on touch, hover/focus handled by CSS
(function() {
    var isTouch = matchMedia('(hover: none) and (pointer: coarse)').matches;
    var dropdowns = Array.prototype.slice.call(document.querySelectorAll('.nav-dropdown'));
    if (!dropdowns.length) return;
    dropdowns.forEach(function(dd) {
        var trigger = dd.querySelector('.nav-dropdown-trigger');
        if (!trigger) return;
        if (isTouch) {
            trigger.addEventListener('click', function(e) {
                if (dd.classList.contains('open')) return; // second tap navigates normally
                e.preventDefault();
                dropdowns.forEach(function(other) { if (other !== dd) { other.classList.remove('open'); other.querySelector('.nav-dropdown-trigger').setAttribute('aria-expanded', 'false'); } });
                dd.classList.add('open');
                trigger.setAttribute('aria-expanded', 'true');
            });
        } else {
            dd.addEventListener('mouseenter', function() { trigger.setAttribute('aria-expanded', 'true'); });
            dd.addEventListener('mouseleave', function() { trigger.setAttribute('aria-expanded', 'false'); });
        }
    });
    document.addEventListener('click', function(e) {
        if (!isTouch) return;
        dropdowns.forEach(function(dd) {
            if (!dd.contains(e.target)) { dd.classList.remove('open'); var t = dd.querySelector('.nav-dropdown-trigger'); if (t) t.setAttribute('aria-expanded', 'false'); }
        });
    });
})();

// Fused promo-banner + nav header height: offset the page's first section and scroll-padding
(function() {
    var header = document.getElementById('site-header-sticky');
    var marker = document.getElementById('main-content');
    var firstSection = marker ? marker.nextElementSibling : null;
    if (!header) return;
    function updateHeaderHeight() {
        var h = header.offsetHeight;
        document.documentElement.style.setProperty('--header-h', h + 'px');
        if (firstSection) firstSection.style.paddingTop = h + 'px';
    }
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    if (window.ResizeObserver) new ResizeObserver(updateHeaderHeight).observe(header);
})();

// Compact navbar on scroll
(function() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    let ticking = false;
    function updateNav() {
        navbar.classList.toggle('nav-scrolled', window.scrollY > 40);
        ticking = false;
    }
    window.addEventListener('scroll', () => {
        if (!ticking) { requestAnimationFrame(updateNav); ticking = true; }
    }, { passive: true });
    updateNav();
})();

function trackEvent(name, meta) {
    var csrfMeta = document.querySelector('meta[name="csrf-token"]');
    fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfMeta ? csrfMeta.content : '' },
        credentials: 'include',
        keepalive: true,
        body: JSON.stringify({ event: name, visitorId: window.RAKI_VISITOR_ID, meta: meta || {} })
    }).catch(function() {});
}

function showToast(msg) {
    const t = document.getElementById('toast');
    document.getElementById('toast-msg').textContent = msg;
    t.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
    t.classList.add('translate-y-0', 'opacity-100');
    setTimeout(() => {
        t.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
        t.classList.remove('translate-y-0', 'opacity-100');
    }, 2500);
}

(function() {
    var group = document.getElementById('sub-plan-group');
    if (!group) return;
    var options = Array.prototype.slice.call(group.querySelectorAll('.sub-plan'));

    function selectPlan(el, focusEl) {
        var plan = el.dataset.planSlug;
        options.forEach(function(p) {
            var checked = p === el;
            p.classList.toggle('border-sand', checked);
            p.classList.toggle('bg-bark-600', checked);
            p.classList.toggle('border-bark-500', !checked);
            p.setAttribute('aria-checked', checked ? 'true' : 'false');
            p.setAttribute('tabindex', checked ? '0' : '-1');
            if (checked && focusEl) p.focus();
        });
        var select = document.getElementById('plan-select');
        if (select) select.value = plan;
        showToast(plan.charAt(0).toUpperCase() + plan.slice(1) + ' selected');
    }

    options.forEach(function(el) {
        el.addEventListener('click', function() { selectPlan(el, false); });
    });

    group.addEventListener('keydown', function(e) {
        var current = options.findIndex(function(o) { return o.getAttribute('aria-checked') === 'true'; });
        var next = current;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (current + 1) % options.length;
        else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (current - 1 + options.length) % options.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = options.length - 1;
        else return;
        e.preventDefault();
        selectPlan(options[next], true);
    });
})();

function handleSub(e) {
    e.preventDefault();
    const form = document.getElementById('subscription-form');
    const errorEl = document.getElementById('sub-error');
    const submitBtn = document.getElementById('sub-submit-btn');
    const submitLabel = document.getElementById('sub-submit-label');
    errorEl.classList.add('hidden');
    errorEl.textContent = '';

    const data = {};
    new FormData(form).forEach((val, key) => { data[key] = val; });

    submitBtn.disabled = true;
    submitLabel.textContent = 'Submitting...';

    const csrfMeta = document.querySelector('meta[name="csrf-token"]');
    fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfMeta ? csrfMeta.content : '' },
        credentials: 'include',
        body: JSON.stringify(data)
    })
    .then(r => r.json().then(body => ({ ok: r.ok, body })))
    .then(function(result) {
        if (!result.ok) throw new Error(result.body.error || 'Something went wrong. Please try again.');
        form.classList.add('hidden');
        document.getElementById('sub-success').classList.remove('hidden');
        lucide.createIcons({ attrs: { strokeWidth: 1.5 } });
        showToast('Welcome to RAKI ☕');
        trackEvent('subscribe_success', { plan: data.plan || '' });
    })
    .catch(function(err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove('hidden');
    })
    .finally(function() {
        submitBtn.disabled = false;
        submitLabel.textContent = 'Subscribe Now';
    });
}

document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
        e.preventDefault();
        const t = document.querySelector(this.getAttribute('href'));
        if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

function animateCountUp(el) {
    var raw = el.textContent.trim();
    var match = raw.match(/^(\d+)(.*)$/);
    if (!match) return;
    var target = parseInt(match[1], 10);
    var suffix = match[2];
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        el.textContent = target + suffix;
        return;
    }
    var duration = 1600;
    var start = null;
    function tick(ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 4);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target + suffix;
    }
    requestAnimationFrame(tick);
}

const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (entry.target.classList.contains('count-up')) {
            animateCountUp(entry.target);
            obs.unobserve(entry.target);
            return;
        }
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
    });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('section').forEach(s => {
    s.style.opacity = '0';
    s.style.transform = 'translateY(24px)';
    s.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    obs.observe(s);
});
document.querySelectorAll('.count-up').forEach(el => obs.observe(el));
var _firstSectionMarker = document.getElementById('main-content');
var _firstSectionEl = _firstSectionMarker ? _firstSectionMarker.nextElementSibling : null;
if (_firstSectionEl) {
    _firstSectionEl.style.opacity = '1';
    _firstSectionEl.style.transform = 'translateY(0)';
}

// Hero typewriter effect
(function() {
    var el = document.getElementById('hero-typewriter');
    if (!el) return;
    var phrases = [];
    try { phrases = JSON.parse(el.dataset.phrases || '[]'); } catch (e) {}
    phrases = phrases.filter(Boolean);
    if (!phrases.length) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        el.textContent = phrases[0];
        return;
    }
    var idx = 0, charIdx = 0, deleting = false;
    function tick() {
        var phrase = phrases[idx];
        if (!deleting) {
            charIdx++;
            el.textContent = phrase.slice(0, charIdx);
            if (charIdx === phrase.length) {
                if (phrases.length === 1) return;
                deleting = true;
                setTimeout(tick, 2200);
                return;
            }
            setTimeout(tick, 55);
        } else {
            charIdx--;
            el.textContent = phrase.slice(0, charIdx);
            if (charIdx === 0) {
                deleting = false;
                idx = (idx + 1) % phrases.length;
                setTimeout(tick, 300);
                return;
            }
            setTimeout(tick, 30);
        }
    }
    tick();
})();

// Rising steam-wisp ambient background (used behind dark hero-style sections)
function initAmbientWisps(canvas) {
    if (!canvas) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.innerWidth < 480) return;
    var ctx = canvas.getContext('2d');
    var wisps = [];
    var raf = null;
    var running = true;

    function spawnWisp(fromBottom) {
        return {
            x: Math.random() * canvas.width,
            y: fromBottom ? canvas.height + Math.random() * 40 : Math.random() * canvas.height,
            vy: -(0.15 + Math.random() * 0.2),
            r: 1.5 + Math.random() * 2.5,
            baseOpacity: 0.35 + Math.random() * 0.45,
            swayPhase: Math.random() * Math.PI * 2,
            swaySpeed: 0.008 + Math.random() * 0.012,
            swayAmp: 0.15 + Math.random() * 0.25
        };
    }

    function resize() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        var count = Math.min(70, Math.max(30, Math.floor((canvas.width * canvas.height) / 12000)));
        wisps = [];
        for (var i = 0; i < count; i++) {
            wisps.push(spawnWisp(false));
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgb(245, 240, 232)';
        wisps.forEach(function(p) {
            p.swayPhase += p.swaySpeed;
            p.x += Math.sin(p.swayPhase) * p.swayAmp;
            p.y += p.vy;
            if (p.y < -10) {
                var fresh = spawnWisp(true);
                p.x = fresh.x; p.y = fresh.y; p.vy = fresh.vy; p.r = fresh.r;
                p.baseOpacity = fresh.baseOpacity; p.swayAmp = fresh.swayAmp; p.swaySpeed = fresh.swaySpeed;
            }
            var fade = 0.35 + 0.65 * Math.max(0, Math.min(1, p.y / canvas.height));
            ctx.globalAlpha = p.baseOpacity * fade;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        if (running) raf = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', function() {
        running = document.visibilityState !== 'hidden';
        if (running && !raf) raf = requestAnimationFrame(draw);
    });
    raf = requestAnimationFrame(draw);
}
document.querySelectorAll('.ambient-canvas').forEach(initAmbientWisps);

// Custom Harvest milestone-style timeline: staggered reveal, separate from the generic section fade
(function() {
    var steps = Array.prototype.slice.call(document.querySelectorAll('.timeline-step'));
    if (!steps.length) return;
    var reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;
    steps.forEach(function(s) {
        s.style.opacity = '0';
        s.style.transform = 'translateX(-16px)';
    });
    var timelineObs = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (!entry.isIntersecting) return;
            var index = steps.indexOf(entry.target);
            setTimeout(function() {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
            }, Math.max(0, index) * 120);
            timelineObs.unobserve(entry.target);
        });
    }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });
    steps.forEach(function(s) { timelineObs.observe(s); });
})();

var _focusTrapEl = null;
var _focusTrapReturnEl = null;
function trapFocus(container) {
    if (!container) return;
    _focusTrapEl = container;
    _focusTrapReturnEl = document.activeElement;
    var focusable = container.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length) focusable[0].focus();
}
function releaseFocus() {
    if (_focusTrapReturnEl && typeof _focusTrapReturnEl.focus === 'function') {
        _focusTrapReturnEl.focus();
    }
    _focusTrapEl = null;
    _focusTrapReturnEl = null;
}
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        var detailModal = document.getElementById('detail-modal');
        var trailModal = document.getElementById('trail-booking-modal');
        if (detailModal && detailModal.classList.contains('active')) closeDetailModal();
        if (trailModal && trailModal.classList.contains('active')) closeTrailBookingModal();
    }
    if (e.key !== 'Tab' || !_focusTrapEl) return;
    var focusable = Array.prototype.slice.call(_focusTrapEl.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'));
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
    }
});

function openDetailModal(data) {
    var modal = document.getElementById('detail-modal');
    document.getElementById('detail-modal-img').src = data.image || '';
    document.getElementById('detail-modal-img').alt = data.title || '';
    document.getElementById('detail-modal-title').textContent = data.title || '';
    document.getElementById('detail-modal-desc').querySelector('p').textContent = data.description || '';

    var badge = document.getElementById('detail-modal-badge');
    if (data.badge) {
        badge.textContent = data.badge;
        badge.style.display = '';
    } else {
        badge.style.display = 'none';
    }

    var detailsEl = document.getElementById('detail-modal-details');
    if (data.details) {
        detailsEl.textContent = data.details;
        detailsEl.style.display = '';
    } else {
        detailsEl.style.display = 'none';
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    lucide.createIcons({ attrs: { strokeWidth: 1.5 } });
    trapFocus(modal.querySelector('.detail-modal'));
}

function closeDetailModal() {
    document.getElementById('detail-modal').classList.remove('active');
    document.body.style.overflow = '';
    releaseFocus();
}

var _trailBookingSubmitLabel = 'Request Booking';
function openTrailBookingModal(trailName, isEvent) {
    var modal = document.getElementById('trail-booking-modal');
    document.getElementById('trail-booking-trail-name').textContent = trailName || 'Meraki Trail';
    document.getElementById('trail-booking-trail-input').value = trailName || '';
    _trailBookingSubmitLabel = isEvent ? 'Reserve My Spot' : 'Request Booking';
    document.getElementById('trail-booking-badge').textContent = isEvent ? 'Event Interest' : 'Book a Trail';
    document.getElementById('trail-booking-submit-label').textContent = _trailBookingSubmitLabel;
    document.getElementById('trail-booking-form').classList.remove('hidden');
    document.getElementById('trail-booking-success').classList.add('hidden');
    document.getElementById('trail-booking-error').classList.add('hidden');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    lucide.createIcons({ attrs: { strokeWidth: 1.5 } });
    trapFocus(modal.querySelector('.detail-modal'));
}

function closeTrailBookingModal() {
    document.getElementById('trail-booking-modal').classList.remove('active');
    document.body.style.overflow = '';
    releaseFocus();
}

function handleTrailBooking(e) {
    e.preventDefault();
    var form = document.getElementById('trail-booking-form');
    var errorEl = document.getElementById('trail-booking-error');
    var submitBtn = document.getElementById('trail-booking-submit-btn');
    var submitLabel = document.getElementById('trail-booking-submit-label');
    errorEl.classList.add('hidden');
    errorEl.textContent = '';

    var data = {};
    new FormData(form).forEach(function(val, key) { data[key] = val; });

    submitBtn.disabled = true;
    submitLabel.textContent = 'Submitting...';

    var csrfMeta = document.querySelector('meta[name="csrf-token"]');
    fetch('/api/trail-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfMeta ? csrfMeta.content : '' },
        credentials: 'include',
        body: JSON.stringify(data)
    })
    .then(function(r) { return r.json().then(function(body) { return { ok: r.ok, body: body }; }); })
    .then(function(result) {
        if (!result.ok) throw new Error(result.body.error || 'Something went wrong. Please try again.');
        form.classList.add('hidden');
        document.getElementById('trail-booking-success').classList.remove('hidden');
        lucide.createIcons({ attrs: { strokeWidth: 1.5 } });
        trackEvent('trail_booking_success', { trail: data.trail_name || '' });
    })
    .catch(function(err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove('hidden');
    })
    .finally(function() {
        submitBtn.disabled = false;
        submitLabel.textContent = _trailBookingSubmitLabel;
    });
}

function loadVideoEmbed(el) {
    var src = el.dataset.videoSrc;
    if (!src) return;
    var separator = src.indexOf('?') === -1 ? '?' : '&';
    el.innerHTML = '<iframe src="' + src + separator + 'autoplay=1" title="Video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    el.classList.remove('video-embed-facade');
    el.removeAttribute('onclick');
    el.removeAttribute('role');
    el.removeAttribute('tabindex');
}

document.querySelectorAll('.video-embed-facade').forEach(function(el) {
    el.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            loadVideoEmbed(el);
        }
    });
});

function initTabs(root) {
    var list = root.querySelector('.tab-list');
    var tabs = Array.prototype.slice.call(root.querySelectorAll('.tab-btn'));
    var panels = Array.prototype.slice.call(root.querySelectorAll('.tab-panel'));
    if (!tabs.length) return;

    function select(index, focusTab) {
        tabs.forEach(function(btn) {
            var active = btn.dataset.tabIndex == index;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-selected', active ? 'true' : 'false');
            btn.setAttribute('tabindex', active ? '0' : '-1');
            if (active && focusTab) btn.focus();
        });
        panels.forEach(function(panel) {
            panel.classList.toggle('active', panel.dataset.tabPanel == index);
        });
    }

    tabs.forEach(function(btn) {
        btn.addEventListener('click', function() { select(btn.dataset.tabIndex, false); });
    });

    if (list) {
        list.addEventListener('keydown', function(e) {
            var current = tabs.findIndex(function(t) { return t.classList.contains('active'); });
            var next = current;
            if (e.key === 'ArrowRight') next = (current + 1) % tabs.length;
            else if (e.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
            else if (e.key === 'Home') next = 0;
            else if (e.key === 'End') next = tabs.length - 1;
            else return;
            e.preventDefault();
            select(next, true);
        });
    }
}

document.querySelectorAll('[data-tabs]').forEach(function(root) { initTabs(root); });

(function() {
    var filterBar = document.getElementById('gallery-filter');
    if (!filterBar) return;
    var buttons = Array.prototype.slice.call(filterBar.querySelectorAll('.gallery-filter-btn'));
    var tiles = Array.prototype.slice.call(document.querySelectorAll('.gallery-tile'));

    buttons.forEach(function(btn) {
        btn.addEventListener('click', function() {
            buttons.forEach(function(b) { b.classList.toggle('active', b === btn); });
            var filter = btn.dataset.filter;
            tiles.forEach(function(tile) {
                var match = filter === 'all' || tile.dataset.category === filter;
                tile.classList.toggle('gallery-hidden', !match);
            });
        });
    });
})();

document.addEventListener('keydown', function(e) {
    if (e.key !== 'Escape') return;
    var detailModal = document.getElementById('detail-modal');
    if (detailModal && detailModal.classList.contains('active')) closeDetailModal();
    var trailModal = document.getElementById('trail-booking-modal');
    if (trailModal && trailModal.classList.contains('active')) closeTrailBookingModal();
});

(function() {
    if (!window.RAKI_VISITOR_ID) return;
    var lastBeat = Date.now();
    var csrfMeta = document.querySelector('meta[name="csrf-token"]');
    var csrfToken = csrfMeta ? csrfMeta.content : '';
    var finalSent = false;

    function sendHeartbeat(isFinal) {
        if (isFinal) {
            if (finalSent) return;
            finalSent = true;
        }
        var now = Date.now();
        var duration = Math.round((now - lastBeat) / 1000);
        lastBeat = now;
        if (duration < 1) return;
        var payload = JSON.stringify({ visitorId: window.RAKI_VISITOR_ID, duration: duration, _csrf: csrfToken });
        if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/analytics/heartbeat', new Blob([payload], { type: 'application/json' }));
        } else {
            fetch('/api/analytics/heartbeat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true });
        }
    }

    setInterval(function() { sendHeartbeat(false); }, 30000);
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden') sendHeartbeat(true);
    });
    window.addEventListener('pagehide', function() { sendHeartbeat(true); });
})();
