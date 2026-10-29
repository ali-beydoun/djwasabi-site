// Accessible navigation and shared page behaviour.
document.addEventListener('DOMContentLoaded', function() {
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const servicesButton = document.querySelector('.nav-services');
    const dropdown = servicesButton?.closest('.dropdown');
    const mobileLayout = window.matchMedia('(max-width: 768px)');

    function setServices(open) {
        dropdown?.classList.toggle('open', open);
        servicesButton?.setAttribute('aria-expanded', String(open));
    }
    function setMenu(open) {
        if (!navMenu || !mobileToggle) return;
        navMenu.classList.toggle('active', open);
        mobileToggle.classList.toggle('active', open);
        mobileToggle.setAttribute('aria-expanded', String(open));
        mobileToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
        navMenu.inert = mobileLayout.matches && !open;
        if (!open) setServices(false);
    }
    mobileToggle?.addEventListener('click', () => setMenu(!navMenu.classList.contains('active')));
    servicesButton?.addEventListener('click', () => setServices(servicesButton.getAttribute('aria-expanded') !== 'true'));
    navMenu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('click', event => {
        if (!event.target.closest('.navbar')) setMenu(false);
        else if (dropdown && !dropdown.contains(event.target)) setServices(false);
    });
    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;
        if (servicesButton?.getAttribute('aria-expanded') === 'true') {
            setServices(false);
            servicesButton.focus();
        } else if (mobileToggle?.getAttribute('aria-expanded') === 'true') {
            setMenu(false);
            mobileToggle.focus();
        }
    });
    dropdown?.addEventListener('focusout', event => {
        if (!dropdown.contains(event.relatedTarget)) setServices(false);
    });
    mobileLayout.addEventListener('change', () => setMenu(false));
    setMenu(false);
    document.querySelectorAll('[data-current-year]').forEach(element => {
        element.textContent = new Date().getFullYear();
    });

    // Smooth scrolling for same-page anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                e.preventDefault();
                targetSection.scrollIntoView({
                    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Handle images gracefully - add placeholder if image fails to load
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', function() {
            if (this.dataset.placeholder) return;
            this.dataset.placeholder = 'true';
            this.removeAttribute('srcset');
            this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZGRkIi8+CiAgICA8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgUGxhY2Vob2xkZXI8L3RleHQ+Cjwvc3ZnPg==';
            this.alt = 'Image placeholder';
        });
    });

    // ===========================================
    // MULTI-STEP QUOTE FORM
    // ===========================================
    const quoteForm = document.getElementById('quoteForm');
    if (quoteForm) {
        // Validate each visible step ourselves so hidden fields never trap focus.
        quoteForm.noValidate = true;
        const steps = quoteForm.querySelectorAll('.form-step');
        const progressSteps = quoteForm.querySelectorAll('.progress-step');
        const progressContainer = quoteForm.querySelector('.form-progress');
        const btnSubmit = quoteForm.querySelector('.btn-submit');
        const successState = quoteForm.querySelector('.form-success');

        const totalSteps = 3;
        let currentStep = 1;
        let formStarted = false;
        const trackQuote = (event, details = {}) => {
            if (typeof gtag === 'function') {
                gtag('event', event, {
                    form_id: 'quoteForm',
                    page_path: window.location.pathname,
                    event_type: quoteForm.elements.eventType.value || 'unspecified',
                    ...details
                });
            }
        };
        quoteForm.addEventListener('input', () => {
            if (!formStarted) {
                formStarted = true;
                trackQuote('quote_form_start');
            }
        });


        // ===========================================
        // URL PARAMETER HANDLING (Context-Aware)
        // ===========================================
        const urlParams = new URLSearchParams(window.location.search);
        const eventParam = urlParams.get('event');

        // Pre-fill event type from URL
        if (eventParam) {
            const eventSelect = document.getElementById('eventType');
            if (eventSelect) {
                eventSelect.value = eventParam;
            }
            // Store for hidden field
            const eventContext = document.getElementById('eventContext');
            if (eventContext) {
                eventContext.value = eventParam;
            }
        }

        // Capture source/referrer
        const sourceField = document.getElementById('formSource');
        if (sourceField) {
            sourceField.value = document.referrer || 'direct';
        }

        // Set date input minimum to today
        const eventDateInput = document.getElementById('eventDate');
        if (eventDateInput) {
            const now = new Date();
            const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            eventDateInput.min = today;
        }

        // ===========================================
        // STEP NAVIGATION
        // ===========================================
        function goToStep(step) {
            // Validate current step before proceeding
            if (step > currentStep && !validateStep(currentStep)) {
                return;
            }

            // Update step visibility
            steps.forEach(s => s.classList.remove('active'));
            const targetStep = quoteForm.querySelector(`.form-step[data-step="${step}"]`);
            if (targetStep) {
                targetStep.classList.add('active');
            }

            // Update progress indicator
            progressSteps.forEach((ps, index) => {
                ps.classList.remove('active', 'completed');
                if (index + 1 < step) ps.classList.add('completed');
                if (index + 1 === step) ps.classList.add('active');
                if (index + 1 === step) ps.setAttribute('aria-current', 'step');
                else ps.removeAttribute('aria-current');
            });

            // Update progress line
            if (progressContainer) {
                progressContainer.classList.remove('step-2', 'step-3');
                if (step >= 2) progressContainer.classList.add('step-2');
                if (step >= 3) progressContainer.classList.add('step-3');
            }

            currentStep = step;
            trackQuote('quote_form_step', { step_number: step });

            // Announce the new step without opening a mobile keyboard or date picker.
            const intro = targetStep?.querySelector('.step-intro');
            if (intro) {
                intro.tabIndex = -1;
                intro.focus({ preventScroll: true });
                targetStep.scrollIntoView({ behavior: 'auto', block: 'start' });
            }
        }

        // Next buttons (multiple now for 3 steps)
        quoteForm.querySelectorAll('.btn-next').forEach(btn => {
            btn.addEventListener('click', () => {
                if (currentStep < totalSteps) {
                    goToStep(currentStep + 1);
                }
            });
        });

        // Back buttons (multiple now for 3 steps)
        quoteForm.querySelectorAll('.btn-back').forEach(btn => {
            btn.addEventListener('click', () => {
                if (currentStep > 1) {
                    goToStep(currentStep - 1);
                }
            });
        });

        // ===========================================
        // VALIDATION
        // ===========================================
        function fieldError(field) {
            if (field.required && !field.value.trim()) {
                return {
                    name: 'Please enter your name.',
                    email: 'Please enter your email address.',
                    phone: 'Please enter your phone number.',
                    eventType: 'Please choose an event type.'
                }[field.name] || 'Please complete this field.';
            }
            if (field.validity.typeMismatch) return 'Enter an email address, such as you@example.com.';
            if (field.validity.rangeUnderflow && field.type === 'date') return 'Choose today or a future date, or leave this blank.';
            if (!field.validity.valid) return 'Please check this value.';
            return '';
        }

        function showFieldError(field, message) {
            const group = field.closest('.form-group');
            if (!group) return;
            const errorId = `${field.id}-error`;
            let error = group.querySelector('.field-error');
            if (message && !error) {
                error = document.createElement('p');
                error.className = 'field-error';
                error.id = errorId;
                group.append(error);
            }
            if (error) { error.textContent = message; error.hidden = !message; }
            group.classList.toggle('error', Boolean(message));
            if (message) field.setAttribute('aria-invalid', 'true');
            else field.removeAttribute('aria-invalid');
            const descriptions = (field.getAttribute('aria-describedby') || '').split(' ').filter(id => id && id !== errorId);
            if (message) descriptions.push(errorId);
            if (descriptions.length) field.setAttribute('aria-describedby', descriptions.join(' '));
            else field.removeAttribute('aria-describedby');
        }

        function validateStep(step, focus = true) {
            const stepEl = quoteForm.querySelector(`.form-step[data-step="${step}"]`);
            if (!stepEl) return true;
            let firstInvalidField;
            stepEl.querySelectorAll('input, select, textarea').forEach(field => {
                if (!field.willValidate) return;
                const message = fieldError(field);
                showFieldError(field, message);
                if (message && !firstInvalidField) firstInvalidField = field;
            });
            if (firstInvalidField && focus) firstInvalidField.focus();
            return !firstInvalidField;
        }

        quoteForm.querySelectorAll('input, select, textarea').forEach(field => {
            const hint = field.closest('.form-group')?.querySelector('.field-hint');
            if (field.id && hint?.textContent.trim()) {
                hint.id ||= `${field.id}-hint`;
                field.setAttribute('aria-describedby', hint.id);
            }
            // Show errors after an attempted step, then update them as corrected.
            for (const event of ['input', 'change']) {
                field.addEventListener(event, () => {
                    if (field.hasAttribute('aria-invalid')) showFieldError(field, fieldError(field));
                });
            }
        });

        // ===========================================
        // FORM SUBMISSION WITH BACKUP DELIVERY
        // ===========================================
        const deliveryHelp = quoteForm.querySelector('.form-delivery-help');
        let submitting = false;
        let enquiryReference;

        const sendEnquiry = async (url, data) => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            try {
                const response = await fetch(url, {
                    method: 'POST', body: data,
                    headers: { Accept: 'application/json' }, signal: controller.signal
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                if (!response.headers.get('content-type')?.includes('application/json')) {
                    throw new Error('Unexpected response from the enquiry service');
                }
                const result = await response.json();
                if (result.success !== true && result.success !== 'true') {
                    throw new Error('Enquiry service did not confirm delivery');
                }
            } finally {
                clearTimeout(timeoutId);
            }
        };

        // Prepare a draft in the visitor's chosen app. They still review and send it.
        const updateDeliveryLinks = () => {
            if (!deliveryHelp) return;
            const data = new FormData(quoteForm);
            const fields = [
                ['name', 'Name'], ['email', 'Email'], ['phone', 'Phone'],
                ['eventType', 'Event'], ['eventDate', 'Date'], ['venue', 'Venue / suburb'],
                ['startTime', 'Start'], ['endTime', 'Finish'], ['guestCount', 'Guests'],
                ['message', 'Details']
            ];
            const lines = fields.flatMap(([key, label]) => {
                const value = String(data.get(key) || '').trim();
                return value ? [`${label}: ${value}`] : [];
            });
            const message = `Hi Wassim, I'd like a quote for my event. The website couldn't confirm delivery.\n\n${lines.join('\n')}`;
            deliveryHelp.querySelector('[data-enquiry-email]').href =
                `mailto:djwasabi1@outlook.com?subject=${encodeURIComponent('DJ Wasabi quote enquiry')}&body=${encodeURIComponent(message)}`;
            deliveryHelp.querySelector('[data-enquiry-whatsapp]').href =
                `https://wa.me/61414441773?text=${encodeURIComponent(message)}`;
        };
        quoteForm.addEventListener('input', () => {
            if (deliveryHelp && !deliveryHelp.hidden) updateDeliveryLinks();
        });
        quoteForm.addEventListener('change', () => {
            if (deliveryHelp && !deliveryHelp.hidden) updateDeliveryLinks();
        });

        quoteForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            if (submitting) return;
            for (let step = 1; step <= totalSteps; step++) {
                if (!validateStep(step, false)) {
                    goToStep(step);
                    quoteForm.querySelector(`.form-step[data-step="${step}"] [aria-invalid="true"]`)?.focus();
                    return;
                }
            }
            submitting = true;
            if (deliveryHelp) deliveryHelp.hidden = true;

            const submitButtons = this.querySelectorAll('button[type="submit"]');
            submitButtons.forEach(button => button.disabled = true);
            this.setAttribute('aria-busy', 'true');
            const submitBtn = this.querySelector('.btn-submit');
            if (submitBtn) {
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;
            }

            // Helper to reset button state
            const resetButton = () => {
                submitButtons.forEach(button => button.disabled = false);
                this.removeAttribute('aria-busy');
                if (submitBtn) {
                    submitBtn.classList.remove('loading');
                    submitBtn.disabled = false;
                }
            };

            // Helper to show success
            const showSuccess = () => {
                const nameField = document.getElementById('name');
                const userName = nameField ? nameField.value.split(' ')[0] : '';
                const userNameSpan = successState ? successState.querySelector('.user-name') : null;
                if (userNameSpan) userNameSpan.textContent = userName;

                // Track form submission in Google Analytics
                if (typeof gtag === 'function') {
                    const eventType = document.getElementById('eventType')?.value || 'unknown';
                    gtag('event', 'generate_lead', {
                        event_category: 'Quote Form',
                        event_label: eventType,
                        event_type: eventType,
                        form_id: 'quoteForm',
                        page_path: window.location.pathname,
                        value: 1
                    });
                }

                steps.forEach(s => s.style.display = 'none');
                if (progressContainer) progressContainer.style.display = 'none';
                const formNote = quoteForm.querySelector('.form-note');
                if (formNote) formNote.style.display = 'none';
                if (successState) {
                    successState.style.display = 'block';
                    successState.tabIndex = -1;
                    successState.focus({ preventScroll: true });
                    successState.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
                }
            };

            try {
                const formData = new FormData(this);
                // A stable reference identifies the same enquiry if a timed-out
                // provider eventually delivers it after the backup succeeds.
                enquiryReference ||= crypto.randomUUID();
                formData.set('enquiryReference', enquiryReference);
                try {
                    await sendEnquiry(this.action, formData);
                } catch (primaryError) {
                    const backupKey = this.dataset.backupKey;
                    if (!backupKey || !navigator.onLine) throw primaryError;
                    const backupData = new FormData();
                    for (const [key, value] of formData) {
                        if (!key.startsWith('_')) backupData.append(key, value);
                    }
                    backupData.set('access_key', backupKey);
                    backupData.set('subject', formData.get('_subject') || 'New Quote Request - DJ Wasabi');
                    backupData.set('from_name', 'DJ Wasabi website');
                    await sendEnquiry('https://api.web3forms.com/submit', backupData);
                }
                showSuccess();
            } catch (error) {
                trackQuote('quote_form_error', { reason: navigator.onLine ? 'unconfirmed' : 'offline' });
                console.error('Form submission error:', error);

                if (deliveryHelp) {
                    updateDeliveryLinks();
                    deliveryHelp.hidden = false;
                    deliveryHelp.querySelector('[data-delivery-message]').textContent = !navigator.onLine
                        ? "You appear to be offline. Your details are still here. Reconnect and try again, or use email or WhatsApp once you're online."
                        : "Your enquiry hasn't been confirmed. Your details are still here. Try again, or send them directly to Wassim.";
                    deliveryHelp.focus();
                    deliveryHelp.scrollIntoView({ behavior: 'auto', block: 'center' });
                }
            } finally {
                submitting = false;
                resetButton();
            }
        });

        // ===========================================
        // KEYBOARD NAVIGATION (Accessibility)
        // ===========================================
        quoteForm.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && ['INPUT', 'SELECT'].includes(e.target.tagName)) {
                e.preventDefault();
                if (currentStep < totalSteps) {
                    goToStep(currentStep + 1);
                } else if (btnSubmit) {
                    btnSubmit.click();
                }
            }
        });

        // ===========================================
        // SUBURB AUTOCOMPLETE
        // ===========================================
        const venueInput = document.getElementById('venue');
        const suggestionsList = document.getElementById('suburbSuggestions');

        if (venueInput && suggestionsList) {
            // Sydney & Greater Sydney suburbs (grouped by region)
            const sydneySuburbs = [
                // Sydney CBD & Inner City
                { name: 'Sydney CBD', region: 'City' },
                { name: 'Darling Harbour', region: 'City' },
                { name: 'The Rocks', region: 'City' },
                { name: 'Circular Quay', region: 'City' },
                { name: 'Pyrmont', region: 'Inner West' },
                { name: 'Ultimo', region: 'City' },
                { name: 'Surry Hills', region: 'Inner City' },
                { name: 'Darlinghurst', region: 'Inner City' },
                { name: 'Potts Point', region: 'Inner City' },
                { name: 'Woolloomooloo', region: 'Inner City' },
                { name: 'Redfern', region: 'Inner City' },
                { name: 'Chippendale', region: 'Inner City' },
                { name: 'Newtown', region: 'Inner West' },
                { name: 'Glebe', region: 'Inner West' },
                { name: 'Paddington', region: 'Eastern Suburbs' },

                // Eastern Suburbs
                { name: 'Bondi', region: 'Eastern Suburbs' },
                { name: 'Bondi Beach', region: 'Eastern Suburbs' },
                { name: 'Bondi Junction', region: 'Eastern Suburbs' },
                { name: 'Bronte', region: 'Eastern Suburbs' },
                { name: 'Coogee', region: 'Eastern Suburbs' },
                { name: 'Randwick', region: 'Eastern Suburbs' },
                { name: 'Maroubra', region: 'Eastern Suburbs' },
                { name: 'Double Bay', region: 'Eastern Suburbs' },
                { name: 'Rose Bay', region: 'Eastern Suburbs' },
                { name: 'Vaucluse', region: 'Eastern Suburbs' },
                { name: 'Watsons Bay', region: 'Eastern Suburbs' },
                { name: 'Centennial Park', region: 'Eastern Suburbs' },
                { name: 'Moore Park', region: 'Eastern Suburbs' },
                { name: 'Kensington', region: 'Eastern Suburbs' },
                { name: 'Kingsford', region: 'Eastern Suburbs' },

                // Inner West
                { name: 'Marrickville', region: 'Inner West' },
                { name: 'Enmore', region: 'Inner West' },
                { name: 'Stanmore', region: 'Inner West' },
                { name: 'Petersham', region: 'Inner West' },
                { name: 'Leichhardt', region: 'Inner West' },
                { name: 'Annandale', region: 'Inner West' },
                { name: 'Balmain', region: 'Inner West' },
                { name: 'Rozelle', region: 'Inner West' },
                { name: 'Drummoyne', region: 'Inner West' },
                { name: 'Five Dock', region: 'Inner West' },
                { name: 'Burwood', region: 'Inner West' },
                { name: 'Strathfield', region: 'Inner West' },
                { name: 'Ashfield', region: 'Inner West' },
                { name: 'Summer Hill', region: 'Inner West' },
                { name: 'Dulwich Hill', region: 'Inner West' },
                { name: 'Canterbury', region: 'Inner West' },
                { name: 'Campsie', region: 'Inner West' },
                { name: 'Lakemba', region: 'Inner West' },
                { name: 'Bankstown', region: 'South West' },

                // North Shore
                { name: 'North Sydney', region: 'Lower North Shore' },
                { name: 'Kirribilli', region: 'Lower North Shore' },
                { name: 'Lavender Bay', region: 'Lower North Shore' },
                { name: 'Milsons Point', region: 'Lower North Shore' },
                { name: 'McMahons Point', region: 'Lower North Shore' },
                { name: 'Neutral Bay', region: 'Lower North Shore' },
                { name: 'Cremorne', region: 'Lower North Shore' },
                { name: 'Mosman', region: 'Lower North Shore' },
                { name: 'Crows Nest', region: 'Lower North Shore' },
                { name: 'St Leonards', region: 'Lower North Shore' },
                { name: 'Artarmon', region: 'Lower North Shore' },
                { name: 'Lane Cove', region: 'Lower North Shore' },
                { name: 'Willoughby', region: 'Lower North Shore' },
                { name: 'Chatswood', region: 'Lower North Shore' },
                { name: 'Lindfield', region: 'Upper North Shore' },
                { name: 'Roseville', region: 'Upper North Shore' },
                { name: 'Killara', region: 'Upper North Shore' },
                { name: 'Gordon', region: 'Upper North Shore' },
                { name: 'Pymble', region: 'Upper North Shore' },
                { name: 'Turramurra', region: 'Upper North Shore' },
                { name: 'Wahroonga', region: 'Upper North Shore' },
                { name: 'Hornsby', region: 'Upper North Shore' },

                // Northern Beaches
                { name: 'Manly', region: 'Northern Beaches' },
                { name: 'Dee Why', region: 'Northern Beaches' },
                { name: 'Brookvale', region: 'Northern Beaches' },
                { name: 'Freshwater', region: 'Northern Beaches' },
                { name: 'Curl Curl', region: 'Northern Beaches' },
                { name: 'Narrabeen', region: 'Northern Beaches' },
                { name: 'Mona Vale', region: 'Northern Beaches' },
                { name: 'Newport', region: 'Northern Beaches' },
                { name: 'Avalon', region: 'Northern Beaches' },
                { name: 'Palm Beach', region: 'Northern Beaches' },
                { name: 'Warriewood', region: 'Northern Beaches' },
                { name: 'Collaroy', region: 'Northern Beaches' },

                // Western Sydney
                { name: 'Parramatta', region: 'Western Sydney' },
                { name: 'Ryde', region: 'Western Sydney' },
                { name: 'Eastwood', region: 'Western Sydney' },
                { name: 'Epping', region: 'Western Sydney' },
                { name: 'Macquarie Park', region: 'Western Sydney' },
                { name: 'Homebush', region: 'Western Sydney' },
                { name: 'Sydney Olympic Park', region: 'Western Sydney' },
                { name: 'Auburn', region: 'Western Sydney' },
                { name: 'Granville', region: 'Western Sydney' },
                { name: 'Merrylands', region: 'Western Sydney' },
                { name: 'Guildford', region: 'Western Sydney' },
                { name: 'Lidcombe', region: 'Western Sydney' },
                { name: 'Blacktown', region: 'Western Sydney' },
                { name: 'Seven Hills', region: 'Western Sydney' },
                { name: 'Castle Hill', region: 'Hills District' },
                { name: 'Baulkham Hills', region: 'Hills District' },
                { name: 'Bella Vista', region: 'Hills District' },
                { name: 'Kellyville', region: 'Hills District' },
                { name: 'Rouse Hill', region: 'Hills District' },
                { name: 'Norwest', region: 'Hills District' },
                { name: 'Penrith', region: 'Western Sydney' },
                { name: 'Mt Druitt', region: 'Western Sydney' },
                { name: 'Richmond', region: 'Western Sydney' },
                { name: 'Windsor', region: 'Western Sydney' },

                // South Sydney
                { name: 'Mascot', region: 'South Sydney' },
                { name: 'Botany', region: 'South Sydney' },
                { name: 'Rockdale', region: 'St George' },
                { name: 'Brighton-Le-Sands', region: 'St George' },
                { name: 'Kogarah', region: 'St George' },
                { name: 'Hurstville', region: 'St George' },
                { name: 'Penshurst', region: 'St George' },
                { name: 'Mortdale', region: 'St George' },
                { name: 'Oatley', region: 'St George' },
                { name: 'Sans Souci', region: 'St George' },
                { name: 'Cronulla', region: 'Sutherland Shire' },
                { name: 'Miranda', region: 'Sutherland Shire' },
                { name: 'Caringbah', region: 'Sutherland Shire' },
                { name: 'Sutherland', region: 'Sutherland Shire' },
                { name: 'Engadine', region: 'Sutherland Shire' },
                { name: 'Menai', region: 'Sutherland Shire' },
                { name: 'Kirrawee', region: 'Sutherland Shire' },
                { name: 'Gymea', region: 'Sutherland Shire' },

                // South West Sydney
                { name: 'Liverpool', region: 'South West' },
                { name: 'Cabramatta', region: 'South West' },
                { name: 'Fairfield', region: 'South West' },
                { name: 'Wetherill Park', region: 'South West' },
                { name: 'Campbelltown', region: 'South West' },
                { name: 'Camden', region: 'South West' },
                { name: 'Narellan', region: 'South West' },
                { name: 'Oran Park', region: 'South West' },
                { name: 'Leppington', region: 'South West' },

                // Greater Sydney / Surrounding Areas
                { name: 'Wollongong', region: 'Illawarra' },
                { name: 'Shellharbour', region: 'Illawarra' },
                { name: 'Kiama', region: 'Illawarra' },
                { name: 'Thirroul', region: 'Illawarra' },
                { name: 'Gosford', region: 'Central Coast' },
                { name: 'Terrigal', region: 'Central Coast' },
                { name: 'The Entrance', region: 'Central Coast' },
                { name: 'Wyong', region: 'Central Coast' },
                { name: 'Erina', region: 'Central Coast' },
                { name: 'Katoomba', region: 'Blue Mountains' },
                { name: 'Leura', region: 'Blue Mountains' },
                { name: 'Springwood', region: 'Blue Mountains' },
                { name: 'Bowral', region: 'Southern Highlands' },
                { name: 'Mittagong', region: 'Southern Highlands' },
                { name: 'Moss Vale', region: 'Southern Highlands' },

                // Popular Venue Areas
                { name: 'Darling Square', region: 'City' },
                { name: 'Barangaroo', region: 'City' },
                { name: 'Walsh Bay', region: 'City' },
                { name: 'Cockle Bay', region: 'City' },
                { name: 'Doltone House', region: 'Various' },
                { name: 'Luna Park', region: 'Lower North Shore' },
                { name: 'Taronga Zoo', region: 'Lower North Shore' },
                { name: 'Royal Botanic Gardens', region: 'City' }
            ];

            let highlightedIndex = -1;

            function filterSuburbs(query) {
                if (!query || query.length < 2) return [];
                const lowerQuery = query.toLowerCase();
                return sydneySuburbs
                    .filter(s => s.name.toLowerCase().includes(lowerQuery))
                    .slice(0, 6); // Limit to 6 suggestions
            }

            function renderSuggestions(matches) {
                if (matches.length === 0) {
                    suggestionsList.classList.remove('active');
                    suggestionsList.innerHTML = '';
                    highlightedIndex = -1;
                    return;
                }

                suggestionsList.innerHTML = matches.map((match, index) =>
                    `<li data-index="${index}" data-value="${match.name}">${match.name}<span class="suburb-region">${match.region}</span></li>`
                ).join('');
                suggestionsList.classList.add('active');
                highlightedIndex = -1;
            }

            function selectSuggestion(value) {
                venueInput.value = value;
                suggestionsList.classList.remove('active');
                suggestionsList.innerHTML = '';
                highlightedIndex = -1;
            }

            function updateHighlight() {
                const items = suggestionsList.querySelectorAll('li');
                items.forEach((item, index) => {
                    item.classList.toggle('highlighted', index === highlightedIndex);
                });
            }

            // Input event - filter and show suggestions
            venueInput.addEventListener('input', function() {
                const matches = filterSuburbs(this.value);
                renderSuggestions(matches);
            });

            // Keyboard navigation
            venueInput.addEventListener('keydown', function(e) {
                const items = suggestionsList.querySelectorAll('li');
                if (!items.length) return;

                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    highlightedIndex = Math.min(highlightedIndex + 1, items.length - 1);
                    updateHighlight();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    highlightedIndex = Math.max(highlightedIndex - 1, 0);
                    updateHighlight();
                } else if (e.key === 'Enter' && highlightedIndex >= 0) {
                    e.preventDefault();
                    e.stopPropagation();
                    selectSuggestion(items[highlightedIndex].dataset.value);
                } else if (e.key === 'Escape') {
                    suggestionsList.classList.remove('active');
                    highlightedIndex = -1;
                }
            });

            // Click on suggestion
            suggestionsList.addEventListener('click', function(e) {
                const li = e.target.closest('li');
                if (li) {
                    selectSuggestion(li.dataset.value);
                }
            });

            // Close suggestions when clicking outside
            document.addEventListener('click', function(e) {
                if (!e.target.closest('.venue-group')) {
                    suggestionsList.classList.remove('active');
                    highlightedIndex = -1;
                }
            });

            // Close suggestions on blur (with delay for click to register)
            venueInput.addEventListener('blur', function() {
                setTimeout(() => {
                    suggestionsList.classList.remove('active');
                    highlightedIndex = -1;
                }, 150);
            });
        }
    }

    // Add scroll effect to navbar
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            navbar.classList.remove('scroll-up');
            return;
        }
        
        if (currentScroll > lastScroll && !navbar.classList.contains('scroll-down')) {
            navbar.classList.remove('scroll-up');
            navbar.classList.add('scroll-down');
        } else if (currentScroll < lastScroll && navbar.classList.contains('scroll-down')) {
            navbar.classList.remove('scroll-down');
            navbar.classList.add('scroll-up');
        }
        
        lastScroll = currentScroll;
    });
});

// Lazy loading for images (optional enhancement)
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });

    // Scroll-triggered animations for various elements
    const scrollAnimObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('scroll-animate');
                // Remove class after animation to allow re-trigger
                setTimeout(() => {
                    entry.target.classList.remove('scroll-animate');
                }, 1500);
            }
        });
    }, {
        threshold: 0.5,
        rootMargin: '0px'
    });

    // Apply to trust items and expertise items only
    document.querySelectorAll('.trust-item, .expertise-item').forEach(item => {
        scrollAnimObserver.observe(item);
    });

    // ===========================================
    // GOOGLE ANALYTICS - CLICK TRACKING
    // ===========================================
    if (typeof gtag === 'function') {
        // Track intent without sending names, contact details or draft messages.
        document.querySelectorAll('a[href]').forEach(link => {
            const url = new URL(link.href);
            const method = url.protocol === 'tel:' ? 'phone' :
                url.protocol === 'mailto:' ? 'email' :
                ['wa.me', 'api.whatsapp.com', 'web.whatsapp.com'].includes(url.hostname) ? 'whatsapp' : null;
            const quoteLink = url.origin === window.location.origin &&
                (url.pathname === '/contact.html' || url.hash === '#contact');
            if (!method && !quoteLink) return;
            link.addEventListener('click', () => {
                gtag('event', method ? 'contact_click' : 'quote_cta_click', {
                    contact_method: method || 'form',
                    page_path: window.location.pathname,
                    event_type: url.searchParams.get('event') || 'unspecified'
                });
            });
        });

        // Track social media clicks
        document.querySelectorAll('a[href*="facebook.com"], a[href*="instagram.com"], a[href*="soundcloud.com"]').forEach(link => {
            link.addEventListener('click', () => {
                const platform = link.href.includes('facebook') ? 'Facebook' :
                                 link.href.includes('instagram') ? 'Instagram' : 'SoundCloud';
                gtag('event', 'click', {
                    event_category: 'Social',
                    event_label: platform
                });
            });
        });
    }
}
