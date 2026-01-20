document.addEventListener('DOMContentLoaded', function () {
  const input = document.getElementById('ingredient-search-input');
  const results = document.getElementById('ingredient-search-results');
  let recipes = [];

  const indexUrl = '{{ "/recipes.json" | relative_url }}';

  fetch(indexUrl)
    .then(r => r.ok ? r.json() : Promise.reject('Network error'))
    .then(data => { recipes = data; })
    .catch(err => {
      console.error('Failed to load recipes.json:', err);
      if (results) results.innerHTML = '<p class="muted">Could not load recipe index.</p>';
    });

  // Normalize a string for search: lowercase + replace &nbsp;
  function normalize(s) {
    return (s || '').toLowerCase().replace(/&nbsp;/g, ' ');
  }

  // Search matching
  function matches(recipe, query) {
    if (!recipe.ingredients) return false;
    const ingText = (recipe.ingredients || []).map(normalize).join(' ');
    return ingText.includes(query);
  }

  // Escape HTML for safe display
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, m => ({
      '&':'&amp;',
      '<':'&lt;',
      '>':'&gt;',
      '"':'&quot;',
      "'":'&#39;'
    }[m]));
  }

  // Decode &nbsp; for display only
  function decodeHtmlEntities(str) {
    return str.replace(/&nbsp;/g, ' ')
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'");
  }

  function highlight(text, query) {
    const decoded = decodeHtmlEntities(text);
    const escaped = escapeHtml(decoded);
    if (!query) return escaped;

    const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const phraseRegex = new RegExp(`(${safeQuery})`, 'gi');
    return escaped.replace(phraseRegex, '<mark>$1</mark>');
  }

  function render(list, query) {
    if (!results) return;
    results.innerHTML = '';

    if (!query) {
      results.innerHTML = '<p class="muted">Enter an ingredient to search recipes.</p>';
      return;
    }

    if (list.length === 0) {
      results.innerHTML = '<p>No recipes found matching that ingredient.</p>';
      return;
    }

    const ul = document.createElement('ul');
    ul.className = 'ingredient-search-list';

    list.forEach(r => {
      const li = document.createElement('li');
      li.className = 'ingredient-search-item';

      const title = `<a href="${r.url}">${escapeHtml(r.title)}</a>`;
      const snippet = `<div class="ingredients-snippet">
        ${highlight((r.ingredients || []).join(', '), query)}
      </div>`;

      li.innerHTML = title + snippet;
      ul.appendChild(li);
    });

    results.appendChild(ul);
  }

  if (input) {
    input.addEventListener('input', function (e) {
      const query = normalize(e.target.value).trim();
      const matched = query
        ? recipes.filter(r => matches(r, query))
        : [];
      render(matched, query);
    });
  }
});
