// All articles are available in the HTML. Filtering is an optional enhancement.
(() => {
    const filters = document.querySelector('.blog-filters');
    if (!filters) return;
    const buttons = [...filters.querySelectorAll('button[data-topic]')];
    const articles = [...document.querySelectorAll('#blog-articles > li')];
    const status = document.querySelector('.blog-status');

    function applyTopic(topic, announce = false) {
        const selected = buttons.find(button => button.dataset.topic === topic) || buttons[0];
        topic = selected.dataset.topic;
        buttons.forEach(button => button.setAttribute('aria-pressed', String(button === selected)));
        articles.forEach(article => {
            article.hidden = topic !== 'all' && article.dataset.category !== topic;
        });
        if (announce) {
            const count = articles.filter(article => !article.hidden).length;
            status.textContent = `${count} ${count === 1 ? 'article' : 'articles'}${topic === 'all' ? '' : ` about ${selected.textContent.toLowerCase()}`}.`;
        }
    }

    function readTopic() {
        applyTopic(new URL(location.href).searchParams.get('topic'));
    }

    filters.addEventListener('click', event => {
        const button = event.target.closest('button[data-topic]');
        if (!button) return;
        const url = new URL(location.href);
        if (button.dataset.topic === 'all') url.searchParams.delete('topic');
        else url.searchParams.set('topic', button.dataset.topic);
        history.replaceState(history.state, '', url);
        applyTopic(button.dataset.topic, true);
    });
    readTopic();
    filters.hidden = false;
    window.addEventListener('popstate', readTopic);
    window.addEventListener('pageshow', readTopic);
})();
