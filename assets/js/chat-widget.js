(function() {
    if (!document.body || document.getElementById('raki-chat-widget')) return;

    var links = {
        shop: './Shop%20%26%20Subscribe%20%E2%80%94%20RAKI%20Coffee%20Co..html#buy',
        subscribe: './Shop%20%26%20Subscribe%20%E2%80%94%20RAKI%20Coffee%20Co..html#subscribe',
        trail: './Meraki%20Trail%20%E2%80%94%20Book%20an%20Experience%20%E2%80%94%20RAKI%20Coffee%20Co..html#meraki',
        visit: './Visit%20Us%20%E2%80%94%20RAKI%20Coffee%20Co..html#visit',
        harvest: './index.html#custom-harvest',
        cycle: './index.html#coffee-cycle',
        impact: './About%20Us%20%E2%80%94%20RAKI%20Coffee%20Co..html#community',
        phone: 'tel:+256702217176',
        email: 'mailto:ubirucent@gmail.com',
        whatsapp: 'https://wa.me/256702217176',
        wholesale: 'mailto:ubirucent@gmail.com?subject=Wholesale%20Enquiry'
    };
    var commonSuggestions = ['Coffee & prices', 'Subscription plans', 'Meraki Trail', 'Visit & contact'];
    var widget = document.createElement('div');
    widget.id = 'raki-chat-widget';
    widget.className = 'raki-chat-widget';
    widget.innerHTML = `
        <button class="raki-chat-toggle" type="button" aria-controls="raki-chat-panel" aria-expanded="false" aria-label="Open RAKI chat">
            <span class="raki-chat-toggle-label">Ask RAKI</span>
            <span class="raki-chat-toggle-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"></path><path d="M8 11h.01M12 11h.01M16 11h.01"></path></svg>
            </span>
        </button>
        <section class="raki-chat-panel" id="raki-chat-panel" aria-labelledby="raki-chat-title" hidden>
            <header class="raki-chat-header">
                <span class="raki-chat-avatar" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v2M14 2v2M6 2v2"></path><path d="M4 8h14v9a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8Z"></path><path d="M18 10h1a3 3 0 0 1 0 6h-1"></path></svg>
                </span>
                <div class="raki-chat-heading">
                    <h2 id="raki-chat-title">RAKI Coffee Guide</h2>
                    <p><span class="raki-chat-status-dot"></span> Quick answers from our site</p>
                </div>
                <button class="raki-chat-close" type="button" aria-label="Close chat">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m18 6-12 12M6 6l12 12"></path></svg>
                </button>
            </header>
            <div class="raki-chat-messages" role="log" aria-live="polite" aria-relevant="additions text" aria-label="Chat conversation"></div>
            <div class="raki-chat-typing" role="status" hidden><span></span><span></span><span></span><span class="raki-chat-typing-text">Finding the right info…</span></div>
            <div class="raki-chat-suggestions" aria-label="Common questions"></div>
            <form class="raki-chat-form">
                <label class="raki-chat-sr-only" for="raki-chat-input">Ask a question</label>
                <input id="raki-chat-input" name="question" type="text" maxlength="240" autocomplete="off" placeholder="Ask about coffee, visits…" required>
                <button class="raki-chat-send" type="submit" aria-label="Send message">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg>
                </button>
            </form>
            <p class="raki-chat-note">Answers use RAKI site information. Messages aren’t sent or stored.</p>
        </section>`;
    document.body.appendChild(widget);

    var toggle = widget.querySelector('.raki-chat-toggle');
    var panel = widget.querySelector('.raki-chat-panel');
    var closeButton = widget.querySelector('.raki-chat-close');
    var messages = widget.querySelector('.raki-chat-messages');
    var suggestions = widget.querySelector('.raki-chat-suggestions');
    var typing = widget.querySelector('.raki-chat-typing');
    var form = widget.querySelector('.raki-chat-form');
    var input = widget.querySelector('#raki-chat-input');
    var sendButton = widget.querySelector('.raki-chat-send');
    var isReplying = false;

    function normalize(value) {
        return value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    }

    function hasAny(value, terms) {
        return terms.some(function(term) { return value.indexOf(term) !== -1; });
    }

    function makeAnswer(text, actions) {
        return { text: text, actions: actions || [] };
    }

    function answerQuestion(question) {
        var q = normalize(question);
        if (/^(hi|hello|hey|good morning|good afternoon|good evening)( there)?$/.test(q)) {
            return makeAnswer('Hello! I can help with RAKI coffee, subscriptions, custom harvests, the Meraki Trail, and visiting us. What would you like to know?');
        }
        if (hasAny(q, ['who are you', 'what are you', 'your name', 'are you a bot'])) {
            return makeAnswer('I’m the RAKI Coffee Guide, an automated helper for common questions about coffee, subscriptions, farm visits, and contacting RAKI. I use information from this website; for anything more specific, I’ll connect you with the team.', [{ label: 'Contact RAKI', href: links.whatsapp }]);
        }
        if (hasAny(q, ['thank you', 'thanks', 'cheers'])) {
            return makeAnswer('You’re welcome! If you need anything else, I’m here to help.', [{ label: 'Contact RAKI', href: links.visit }]);
        }
        if (hasAny(q, ['wholesale', 'bulk order', 'cafe supply', 'café supply'])) {
            return makeAnswer('For wholesale enquiries, tell the RAKI team what coffee and quantity you’re looking for. They’ll follow up with you directly.', [{ label: 'Email wholesale team', href: links.wholesale }]);
        }
        if (hasAny(q, ['cancel', 'unsubscribe', 'pause subscription'])) {
            return makeAnswer('Subscriptions aren’t charged automatically. The team arranges each renewal with you directly, so contact them to change or stop future orders.', [{ label: 'Contact RAKI', href: links.whatsapp }, { label: 'Subscription details', href: links.subscribe }]);
        }
        if (hasAny(q, ['subscription', 'subscribe', 'monthly plan', 'starter plan', 'family plan', 'connoisseur'])) {
            return makeAnswer('Current monthly plans: Starter — 250g for $25; Family — 500g for $45; Connoisseur — 1kg for $75. Family and Connoisseur include free shipping. After you enquire, the team contacts you within 24 hours to confirm; submitting a form does not charge you.', [{ label: 'See subscription plans', href: links.subscribe }]);
        }
        if (hasAny(q, ['meraki micro lot', 'micro lot', 'microlot'])) {
            return makeAnswer('Meraki Micro-Lot is a light roast with floral, berry, and wine notes. The listed 250g bag is $35 USD.', [{ label: 'Shop coffee', href: links.shop }]);
        }
        if (hasAny(q, ['sezibwa river roast', 'river roast'])) {
            return makeAnswer('Sezibwa River Roast is a dark roast with a bold body and stone-fruit notes. The listed 500g bag is $28 USD.', [{ label: 'Shop coffee', href: links.shop }]);
        }
        if (hasAny(q, ['raki signature', 'signature coffee', 'signature blend'])) {
            return makeAnswer('RAKI Signature is a medium roast with dark-chocolate, citrus, and honey notes. The listed 250g bag is $18 USD.', [{ label: 'Shop coffee', href: links.shop }]);
        }
        if (hasAny(q, ['payment', 'pay', 'mobile money', 'delivery', 'deliver', 'shipping', 'ship', 'cash on delivery', 'bank transfer'])) {
            return makeAnswer('There’s no automatic charge when you submit an order or subscription request. The team contacts you within 24 hours to confirm it and arrange payment by MTN/Airtel Mobile Money, bank transfer, or cash on delivery. Delivery is arranged based on your location; Family and Connoisseur subscription plans list free shipping.', [{ label: 'Shop and subscribe', href: links.shop }, { label: 'Ask RAKI on WhatsApp', href: links.whatsapp }]);
        }
        if (hasAny(q, ['meraki', 'trail', 'hike', 'tour', 'agro tourism', 'experience', 'coffee discovery', 'expedition']) && hasAny(q, ['price', 'cost', 'how much'])) {
            return makeAnswer('The Meraki Trail page describes half-day, 3-day, and 4-day experiences, but doesn’t list prices. Send a booking request and the RAKI team will confirm the details with you before any payment.', [{ label: 'Explore the Meraki Trail', href: links.trail }]);
        }
        if (hasAny(q, ['meraki', 'trail', 'hike', 'tour', 'agro tourism', 'experience', 'book a visit', 'coffee discovery'])) {
            return makeAnswer('The Meraki Trail has a half-day Coffee Discovery, a 3-day Coffee Agro Tourism trip, and a 4-day Meraki Expedition. A booking is only a request—not a payment—and the team confirms details with you.', [{ label: 'Explore and request a booking', href: links.trail }]);
        }
        if (hasAny(q, ['custom harvest', 'custom order', 'request a harvest', 'harvest for me'])) {
            return makeAnswer('With a Custom Harvest, you share your preferred region, roast profile, and quantity. RAKI matches your request with outgrower farms, then picks and processes the batch separately so it stays traceable. Harvests are seasonal, so it’s best to enquire early.', [{ label: 'Start a Custom Harvest request', href: links.harvest }]);
        }
        if (hasAny(q, ['volunteer', 'volunteering', 'planting day', 'help on the farm'])) {
            return makeAnswer('Volunteer activities described on the site include caring for seedlings at the Mukono nursery, rainy-season planting days, farm-care visits, harvest picking, and learning about coffee processing. Opportunities depend on the season, so contact RAKI to arrange a visit.', [{ label: 'Explore the coffee cycle', href: links.cycle }, { label: 'Contact RAKI', href: links.whatsapp }]);
        }
        if (hasAny(q, ['where are', 'location', 'address', 'opening hour', 'opening time', 'what time', 'when do you open', 'are you open', 'open today', 'hours', 'visit us', 'contact', 'phone', 'call you', 'email'])) {
            return makeAnswer('RAKI Coffee Co. is near Sezibwa Falls on Sezibwa Road, Mukono, Uganda. Listed hours are Monday–Saturday, 7am–6pm. You can also call +256 702 217 176 or email ubirucent@gmail.com.', [{ label: 'Visit information', href: links.visit }, { label: 'Call RAKI', href: links.phone }, { label: 'Email RAKI', href: links.email }]);
        }
        if (hasAny(q, ['impact', 'farmer', 'farmers', 'community', 'women', 'youth', 'fair trade', 'who grows', 'what is raki', 'about raki'])) {
            return makeAnswer('RAKI works with more than 500 outgrower farmers and focuses on traceability, fair direct pricing, sustainable farming, women’s empowerment, and youth development. Each purchase supports the farming communities behind the coffee.', [{ label: 'Learn about community impact', href: links.impact }]);
        }
        if (hasAny(q, ['price', 'prices', 'cost', 'how much', 'coffee bags', 'what coffee', 'coffee do you sell'])) {
            return makeAnswer('Current listed coffee bags: RAKI Signature — 250g, $18; Sezibwa River Roast — 500g, $28; Meraki Micro-Lot — 250g, $35. Prices are listed in USD. You can enquire about any bag on the Shop page.', [{ label: 'See coffee bags', href: links.shop }]);
        }
        if (hasAny(q, ['buy', 'order', 'purchase', 'shop'])) {
            return makeAnswer('You can choose a one-time coffee bag or submit a subscription request. The RAKI team confirms orders personally; a form submission does not charge you automatically.', [{ label: 'Shop coffee', href: links.shop }, { label: 'Subscription plans', href: links.subscribe }]);
        }
        if (hasAny(q, ['seed to cup', 'coffee process', 'how coffee is made', 'roasting', 'brew', 'coffee'])) {
            return makeAnswer('RAKI’s coffee journey runs from nursery and planting through growing, hand-picking, processing, roasting, and brewing. The Coffee Cycle section shows each stage and volunteer opportunities.', [{ label: 'Explore Seed to Cup', href: links.cycle }, { label: 'Shop coffee', href: links.shop }]);
        }
        return makeAnswer('I don’t have a confirmed answer for that yet. Try asking about coffee and prices, subscriptions, delivery, the Meraki Trail, Custom Harvest, or visiting RAKI. For anything more specific, the team can help directly.', [{ label: 'Ask RAKI on WhatsApp', href: links.whatsapp }, { label: 'Email RAKI', href: links.email }]);
    }

    function addMessage(text, sender, actions) {
        var message = document.createElement('article');
        message.className = 'raki-chat-message raki-chat-message--' + sender;
        var bubble = document.createElement('p');
        bubble.className = 'raki-chat-bubble';
        bubble.textContent = text;
        message.appendChild(bubble);
        if (actions && actions.length) {
            var actionList = document.createElement('div');
            actionList.className = 'raki-chat-actions';
            actions.forEach(function(action) {
                var link = document.createElement('a');
                link.className = 'raki-chat-action';
                link.href = action.href;
                link.textContent = action.label;
                if (action.href.indexOf('https://') === 0) {
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                }
                actionList.appendChild(link);
            });
            message.appendChild(actionList);
        }
        messages.appendChild(message);
        messages.scrollTop = messages.scrollHeight;
    }

    function renderSuggestions(items) {
        suggestions.replaceChildren();
        items.forEach(function(question) {
            var button = document.createElement('button');
            button.type = 'button';
            button.className = 'raki-chat-suggestion';
            button.textContent = question;
            button.setAttribute('data-question', question);
            suggestions.appendChild(button);
        });
        suggestions.hidden = items.length === 0;
    }

    function setOpen(open, restoreFocus) {
        panel.hidden = !open;
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.setAttribute('aria-label', open ? 'Close RAKI chat' : 'Open RAKI chat');
        widget.classList.toggle('is-open', open);
        if (open && window.matchMedia('(min-width: 700px)').matches) input.focus();
        if (!open && restoreFocus) toggle.focus();
    }

    function ask(question) {
        var value = question.trim();
        if (!value || isReplying) return;
        addMessage(value, 'user');
        input.value = '';
        suggestions.hidden = true;
        isReplying = true;
        input.disabled = true;
        sendButton.disabled = true;
        typing.hidden = false;
        messages.scrollTop = messages.scrollHeight;
        window.setTimeout(function() {
            var answer = answerQuestion(value);
            typing.hidden = true;
            addMessage(answer.text, 'bot', answer.actions);
            renderSuggestions(commonSuggestions);
            isReplying = false;
            input.disabled = false;
            sendButton.disabled = false;
            messages.scrollTop = messages.scrollHeight;
        }, 320);
    }

    addMessage('Hi! I’m the RAKI Coffee Guide. Ask me about our coffee, subscriptions, farm visits, or how to get in touch.', 'bot');
    renderSuggestions(commonSuggestions);

    toggle.addEventListener('click', function() { setOpen(panel.hidden, false); });
    closeButton.addEventListener('click', function() { setOpen(false, true); });
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        ask(input.value);
    });
    suggestions.addEventListener('click', function(event) {
        var button = event.target.closest('[data-question]');
        if (button) ask(button.getAttribute('data-question'));
    });
    document.addEventListener('pointerdown', function(event) {
        if (!panel.hidden && !widget.contains(event.target)) setOpen(false, false);
    });
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && !panel.hidden) setOpen(false, true);
    });
})();
