document.addEventListener('DOMContentLoaded', function () {
  const tagButtons = document.getElementById('tag-buttons');
  const results = document.getElementById('tag-results');
  let recipes = [];

  const indexUrl = '{{ "/recipes.json" | relative_url }}';
  const baseUrl = '{{ "/recipe-tags/" | relative_url }}';

  fetch(indexUrl)
    .then(r => {
      if (!r.ok) throw new Error('Fetch failed');
      return r.json();
    })
    .then(data => {
      recipes = data;
      renderTags();

      // Read tag from query string: /recipe-tags/?tag=dishes
      const params = new URLSearchParams(window.location.search);
      const tagFromUrl = params.get('tag');
      if(tagFromUrl) filterByTag(tagFromUrl);
    })
    .catch(err => {
      console.error('Failed to load recipes.json', err);
    });

  function renderTags() {
    const tagSet = new Set();

    recipes.forEach(r => {
      (r.tags || []).forEach(tag => tagSet.add(tag));
    });

    [...tagSet].sort().forEach(tag => {
      const btn = document.createElement('button');
      btn.className = 'tag';
      btn.textContent = tag;
      btn.type = 'button';
      btn.onclick = () => {
        // Update query string in URL without reload
        const newUrl = baseUrl + '?tag=' + encodeURIComponent(tag);
        history.pushState({}, '', newUrl);
        filterByTag(tag);
      };
      tagButtons.appendChild(btn);
    });
  }

  function filterByTag(tag) {
    results.innerHTML = '';

    recipes
      .filter(r => (r.tags || []).includes(tag))
      .forEach(r => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="${r.url}">${r.title}</a>`;
        results.appendChild(li);
      });

    highlightActiveTag(tag);
  }

  function highlightActiveTag(activeTag) {
    const buttons = tagButtons.querySelectorAll('.tag');
    buttons.forEach(btn => {
      btn.classList.toggle('active', btn.textContent === activeTag);
    });
  }
});
